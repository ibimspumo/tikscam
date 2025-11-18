/**
 * TikTok Live Stream API Route
 *
 * Connects to TikTok Live using tiktok-live-connector
 * Streams events to client via Server-Sent Events (SSE)
 *
 * Simple Connection Strategy:
 * - Default: Connect WITHOUT API key (free direct connection)
 * - Optional: Connect WITH API key (if user provides one)
 * - ONE attempt per connection request
 * - If error → return error to user, let them retry
 */

import { WebcastPushConnection } from 'tiktok-live-connector';
import { NextRequest } from 'next/server';

// Store active connections
const activeConnections = new Map<string, WebcastPushConnection>();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username) {
    return new Response('Username required', { status: 400 });
  }

  // Check if user provided their own API key
  const userApiKey = request.nextUrl.searchParams.get('apiKey') || '';
  const useApiKey = !!userApiKey;

  // Setup Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Track if stream is still open
      let streamClosed = false;

      const sendEvent = (event: string, data: unknown) => {
        if (streamClosed) return;

        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (err) {
          if (err instanceof Error && err.message?.includes('Controller is already closed')) {
            streamClosed = true;
          }
        }
      };

      // Keep-Alive: Send heartbeat every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // Helper to extract and format error message
      const extractErrorMessage = (err: unknown): string => {
        let rawError = '';

        // Extract raw error message
        if (typeof err === 'string') {
          rawError = err;
        } else if (err && typeof err === 'object') {
          const customErr = err as { info?: string; exception?: string | Error; message?: string };
          if (customErr.exception) {
            if (typeof customErr.exception === 'string') {
              rawError = customErr.exception;
            } else if (customErr.exception instanceof Error) {
              rawError = customErr.exception.message;
            }
          } else {
            rawError = customErr.info || customErr.message || 'Unknown error';
          }
        } else if (err instanceof Error) {
          rawError = err.message;
        } else {
          rawError = 'Unknown error';
        }

        // Parse and return user-friendly messages
        // EulerStream sign server errors (HTTP 500/503)
        if (rawError.includes('Sign Error') && rawError.includes('status 500')) {
          return 'EulerStream service is temporarily unavailable. Please try again later or use API key mode.';
        }
        if (rawError.includes('Sign Error') && rawError.includes('status 503')) {
          return 'EulerStream service is under maintenance. Please try again later.';
        }

        // Rate limiting errors
        if (rawError.includes('rate limit') || rawError.includes('Rate limit')) {
          return 'TikTok rate limit reached. Please wait a few minutes or use API key mode.';
        }

        // User not found / stream offline
        if (rawError.includes('user_not_found') || rawError.includes('User not found')) {
          return 'User not found. Please check the username and ensure the stream is LIVE.';
        }
        if (rawError.includes('LIVE_ROOM_NOT_FOUND') || rawError.includes('not live')) {
          return 'Stream is not live. The user must be streaming to connect.';
        }

        // WebSocket connection errors (usually means blocked/rate limited)
        if (rawError.includes('Websocket connection failed') || rawError.includes('Unexpected server response: 200')) {
          return 'Connection blocked by TikTok (rate limit or anti-bot protection). Please try API key mode or wait 5-10 minutes.';
        }

        // SIGI_STATE extraction errors (blocked by TikTok)
        if (rawError.includes('SIGI_STATE') || rawError.includes('blocked by TikTok')) {
          return 'Connection blocked by TikTok. Try using API key mode or wait a few minutes.';
        }

        // Permission errors (no API key when required)
        if (rawError.includes('lack of permission') && rawError.includes('Euler Stream')) {
          return 'API key required for this connection. Please switch to API key mode.';
        }

        // Network/timeout errors
        if (rawError.includes('timeout') || rawError.includes('ETIMEDOUT')) {
          return 'Connection timeout. Please check your internet connection and try again.';
        }
        if (rawError.includes('ENOTFOUND') || rawError.includes('DNS')) {
          return 'Network error. Please check your internet connection.';
        }

        // Generic fallback - return first 200 chars of error
        if (rawError.length > 200) {
          return rawError.substring(0, 200) + '...';
        }

        // If error is empty or just whitespace, return default message
        if (!rawError || rawError.trim() === '') {
          return 'Unable to connect to stream. Please verify the username and try again.';
        }

        return rawError;
      };

      // Create TikTok connection
      let tiktokConnection: WebcastPushConnection | null = null;

      try {
        // Send initial status
        sendEvent('connectionStatus', {
          status: useApiKey ? 'Connecting with API key...' : 'Connecting (free mode)...',
          mode: useApiKey ? 'api-key' : 'free',
        });

        // Configure connection
        const connectionOptions: any = {
          processInitialData: false,
          enableExtendedGiftInfo: true,
          requestOptions: {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          },
        };

        // Add API key if provided
        if (useApiKey) {
          connectionOptions.requestOptions.headers['x-eulerstream-api-key'] = userApiKey;
        }

        // Create connection instance
        tiktokConnection = new WebcastPushConnection(username, connectionOptions);

        // Store active connection
        activeConnections.set(username, tiktokConnection);

        // Setup event handlers
        tiktokConnection.on('connected', (roomData: any) => {
          sendEvent('connected', {
            roomInfo: {
              id: roomData.id,
              title: roomData.title,
              owner: roomData.owner,
              viewerCount: roomData.viewerCount,
              likeCount: roomData.likeCount,
            },
          });
        });

        tiktokConnection.on('disconnected', () => {
          sendEvent('disconnected', { reason: 'Connection closed' });
          streamClosed = true;
          clearInterval(keepAliveInterval);
          activeConnections.delete(username);
        });

        tiktokConnection.on('streamEnd', () => {
          sendEvent('streamEnd', { message: 'Stream has ended' });
          streamClosed = true;
          clearInterval(keepAliveInterval);
          activeConnections.delete(username);
        });

        // Chat events
        tiktokConnection.on('chat', (data: any) => {
          sendEvent('chat', {
            user: data.uniqueId,
            message: data.comment,
            timestamp: Date.now(),
            avatar: data.profilePictureUrl,
          });
        });

        // Gift events
        tiktokConnection.on('gift', (data: any) => {
          sendEvent('gift', {
            user: data.uniqueId,
            gift: data.giftName,
            count: data.repeatCount || 1,
            timestamp: Date.now(),
            avatar: data.profilePictureUrl,
            diamondCount: data.diamondCount || 0,
            giftIcon: data.giftPictureUrl,
            giftImage: data.giftPictureUrl,
          });
        });

        // Like events
        tiktokConnection.on('like', (data: any) => {
          sendEvent('like', {
            user: data.uniqueId,
            count: data.likeCount || 1,
            totalLikes: data.totalLikeCount || 0,
            timestamp: Date.now(),
          });
        });

        // Member (join) events
        tiktokConnection.on('member', (data: any) => {
          sendEvent('member', {
            user: data.uniqueId,
            timestamp: Date.now(),
            avatar: data.profilePictureUrl,
          });
        });

        // Social (follow/share) events
        tiktokConnection.on('social', (data: any) => {
          sendEvent('social', {
            user: data.uniqueId,
            type: data.displayType,
            timestamp: Date.now(),
            avatar: data.profilePictureUrl,
          });
        });

        // Room user update
        tiktokConnection.on('roomUser', (data: any) => {
          sendEvent('roomUser', {
            viewerCount: data.viewerCount || 0,
          });
        });

        // Available gifts catalog
        tiktokConnection.on('websocketConnected', async () => {
          try {
            const availableGifts = tiktokConnection!.availableGifts;
            sendEvent('availableGifts', { gifts: availableGifts });
          } catch (err) {
            // Ignore gift catalog errors
          }
        });

        // Error handling
        tiktokConnection.on('error', (err: any) => {
          const errorMessage = extractErrorMessage(err);
          console.error('[TikTok Live] Stream error:', errorMessage);

          // Send error but don't close stream (might be recoverable)
          sendEvent('streamError', {
            error: errorMessage,
            fatal: false,
          });
        });

        // Connect to stream
        await tiktokConnection.connect();

      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        console.error('[TikTok Live] Connection failed:', errorMessage);

        // Send connection error
        sendEvent('connectionError', {
          error: errorMessage,
          mode: useApiKey ? 'api-key' : 'free',
        });

        // Cleanup
        streamClosed = true;
        clearInterval(keepAliveInterval);
        if (tiktokConnection) {
          try {
            tiktokConnection.disconnect();
          } catch {}
          activeConnections.delete(username);
        }

        // Close the stream
        try {
          controller.close();
        } catch {}
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('[TikTok Live] Client disconnected');
        streamClosed = true;
        clearInterval(keepAliveInterval);

        if (tiktokConnection) {
          try {
            tiktokConnection.disconnect();
          } catch (err) {
            console.error('[TikTok Live] Error disconnecting:', err);
          }
          activeConnections.delete(username);
        }

        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
