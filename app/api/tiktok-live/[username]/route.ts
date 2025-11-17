/**
 * TikTok Live Stream API Route
 *
 * Connects to TikTok Live using tiktok-live-connector
 * Streams events to client via Server-Sent Events (SSE)
 *
 * Strategy:
 * 1. Try connecting without API key (free)
 * 2. If rate limited -> fallback to EulerStream API key
 */

import { WebcastPushConnection, SignConfig } from 'tiktok-live-connector';
import { NextRequest } from 'next/server';

// EulerStream API Key - used as fallback when rate limited
// Get your free API key at: https://www.eulerstream.com/pricing
const EULERSTREAM_API_KEY = process.env.EULERSTREAM_API_KEY || '';

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

  // Setup Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      console.warn(`[TikTok Live] Connecting to @${username}...`);

      // Create TikTok connection
      // processInitialData: false helps avoid protobuf parsing errors
      const tiktokConnection = new WebcastPushConnection(username, {
        processInitialData: false,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
      });

      // Store connection
      activeConnections.set(username, tiktokConnection);

      // Track if stream is still open
      let streamClosed = false;

      const sendEvent = (event: string, data: unknown) => {
        if (streamClosed) return; // Don't send if stream is closed

        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (err) {
          // Controller is closed - mark stream as closed to prevent further attempts
          if (err instanceof Error && err.message?.includes('Controller is already closed')) {
            streamClosed = true;
          }
        }
      };

      // 🔄 Keep-Alive: Send heartbeat every 30 seconds to prevent timeout
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          console.warn('[TikTok Live] Keep-alive failed, connection closed');
          clearInterval(keepAliveInterval);
        }
      }, 30000); // Every 30 seconds

      // Connection events
      tiktokConnection.on('connected', async (state) => {
        console.log(`[TikTok Live] Connected to @${username}`);

        // Extract stream title
        const streamTitle = state.roomInfo?.title ||
                           state.roomInfo?.data?.title ||
                           state.title ||
                           `@${username}'s Live`;

        // Fetch available gifts
        let availableGifts = [];
        try {
          availableGifts = await tiktokConnection.fetchAvailableGifts();
          console.log(`[TikTok Live] Fetched ${availableGifts.length} available gifts`);
        } catch (err) {
          console.warn('[TikTok Live] Failed to fetch available gifts:', err);
        }

        sendEvent('connected', {
          roomId: state.roomId,
          roomInfo: state.roomInfo,
          state: state,
          availableGifts: availableGifts,
          streamTitle: streamTitle,
        });
      });

      tiktokConnection.on('disconnected', () => {
        console.log(`[TikTok Live] Disconnected from @${username}`);
        sendEvent('disconnected', {});
        streamClosed = true; // Mark stream as closed
        activeConnections.delete(username);
        try {
          controller.close();
        } catch (err) {
          // Already closed
        }
      });

      tiktokConnection.on('error', (err) => {
        console.error(`[TikTok Live] Error:`, err);
        // Send error event but DON'T close the stream - let it recover
        // The error event will be treated as data, not a connection error
        try {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          const errorType = err instanceof Error ? err.name : 'Error';
          sendEvent('streamError', {
            message: errorMessage,
            type: errorType,
            recoverable: true
          });
        } catch (sendErr) {
          console.error('[TikTok Live] Failed to send error event:', sendErr);
        }
      });

      // Helper to register event handlers with error protection
      const registerEventHandlers = (connection: WebcastPushConnection) => {
        // Wrap each handler in try-catch to prevent stream closure
        connection.on('roomUser', (data) => {
          try {
            sendEvent('roomUser', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending roomUser:', err);
          }
        });

        connection.on('chat', (data) => {
          try {
            sendEvent('chat', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending chat:', err);
          }
        });

        connection.on('gift', (data) => {
          try {
            // Debug: Log all incoming gift events from TikTok
            console.log(`[API] 🎁 Gift received from TikTok:`, {
              user: data.uniqueId,
              giftName: data.giftName,
              giftId: data.giftId,
              repeatCount: data.repeatCount,
              repeatEnd: data.repeatEnd,
              diamondCount: data.diamondCount,
              giftType: data.giftType,
            });
            sendEvent('gift', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending gift:', err);
          }
        });

        connection.on('member', (data) => {
          try {
            sendEvent('member', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending member:', err);
          }
        });

        connection.on('like', (data) => {
          try {
            sendEvent('like', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending like:', err);
          }
        });

        connection.on('social', (data) => {
          try {
            sendEvent('social', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending social:', err);
          }
        });

        connection.on('streamEnd', (data) => {
          try {
            sendEvent('streamEnd', data);
          } catch (err) {
            console.error('[TikTok Live] Error sending streamEnd:', err);
          }
        });
      };

      // Register event handlers for initial connection
      registerEventHandlers(tiktokConnection);

      // Connect with smart fallback strategy (with retry for WebSocket errors)
      let connectionSuccess = false;
      let lastError: unknown = null;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries && !connectionSuccess; attempt++) {
        try {
          console.log(`[TikTok Live] 🔄 Attempting connection (attempt ${attempt}/${maxRetries})...`);
          await tiktokConnection.connect();
          connectionSuccess = true;
          console.log(`[TikTok Live] ✅ Connection successful on attempt ${attempt}`);
        } catch (err) {
          lastError = err;

          // Extract error message from tiktok-live-connector's custom error format
          let errorMessage = 'Unknown error';
          if (err && typeof err === 'object') {
            // Handle custom error format: { info: string, exception: string }
            const customErr = err as { info?: string; exception?: string; message?: string };
            errorMessage = customErr.exception || customErr.info || customErr.message || 'Unknown error';
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }

          // Check if it's a temporary WebSocket error (worth retrying)
          const isTemporaryError =
            errorMessage?.includes('Websocket connection failed') ||
            errorMessage?.includes('Unexpected server response');

          if (isTemporaryError && attempt < maxRetries) {
            console.warn(`[TikTok Live] ⚠️ Temporary error on attempt ${attempt}, retrying in 2s...`);
            console.warn(`[TikTok Live] Error details:`, errorMessage);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            continue;
          }

          // If not a temporary error or we've exhausted retries, log and break
          console.error(`[TikTok Live] ❌ Connection failed on attempt ${attempt}:`, errorMessage);
          break;
        }
      }

      // If connection failed after all retries, handle the error
      if (!connectionSuccess && lastError) {
        // Extract error message using same logic as retry loop
        let errorMessage = 'Unknown error';
        if (lastError && typeof lastError === 'object') {
          const customErr = lastError as { info?: string; exception?: string; message?: string; name?: string };
          errorMessage = customErr.exception || customErr.info || customErr.message || 'Unknown error';
        } else if (lastError instanceof Error) {
          errorMessage = lastError.message;
        }

        // Check if it's a rate limit error
        const isRateLimitError =
          (lastError as { name?: string }).name === 'SignatureRateLimitError' ||
          errorMessage?.includes('Rate Limited') ||
          errorMessage?.includes('rate limit') ||
          errorMessage?.includes('rate_limit');

        if (isRateLimitError) {
          console.log(`[TikTok Live] ⚠️ Rate limit detected! Activating EulerStream API key...`);

          // Inform client we're retrying with API key (optional, for better UX)
          sendEvent('retrying', {
            message: 'Rate limit reached - Switching to EulerStream API...',
            usingApiKey: true
          });

          // IMPORTANT: Disconnect and cleanup old connection first
          try {
            tiktokConnection.disconnect();
            activeConnections.delete(username);
          } catch (cleanupErr) {
            console.warn('[TikTok Live] Cleanup error:', cleanupErr);
          }

          // Activate EulerStream API key for fallback
          SignConfig.apiKey = EULERSTREAM_API_KEY;

          // Create new connection with API key
          const fallbackConnection = new WebcastPushConnection(username, {
            processInitialData: false,
            enableExtendedGiftInfo: true,
            enableWebsocketUpgrade: true,
            requestPollingIntervalMs: 1000,
          });

          // Replace the old connection
          activeConnections.set(username, fallbackConnection);

          // Re-attach all event handlers to new connection
          fallbackConnection.on('connected', async (state) => {
            console.log(`[TikTok Live] ✅ Connected to @${username} using EulerStream API`);

            const streamTitle = state.roomInfo?.title ||
                               state.roomInfo?.data?.title ||
                               state.title ||
                               `@${username}'s Live`;

            let availableGifts = [];
            try {
              availableGifts = await fallbackConnection.fetchAvailableGifts();
              console.log(`[TikTok Live] Fetched ${availableGifts.length} available gifts`);
            } catch (err) {
              console.warn('[TikTok Live] Failed to fetch available gifts:', err);
            }

            sendEvent('connected', {
              roomId: state.roomId,
              roomInfo: state.roomInfo,
              state: state,
              availableGifts: availableGifts,
              streamTitle: streamTitle,
              usingApiKey: true, // Flag to indicate we're using API key
            });
          });

          fallbackConnection.on('disconnected', () => {
            console.log(`[TikTok Live] Disconnected from @${username}`);
            sendEvent('disconnected', {});
            streamClosed = true; // Mark stream as closed
            activeConnections.delete(username);
            try {
              controller.close();
            } catch (err) {
              // Already closed
            }
          });

          fallbackConnection.on('error', (err) => {
            console.error(`[TikTok Live] Error:`, err);
            // Send error event but DON'T close the stream - let it recover
            try {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              const errorType = err instanceof Error ? err.name : 'Error';
              sendEvent('streamError', {
                message: errorMessage,
                type: errorType,
                recoverable: true
              });
            } catch (sendErr) {
              console.error('[TikTok Live] Failed to send error event:', sendErr);
            }
          });

          // Register event handlers for fallback connection
          registerEventHandlers(fallbackConnection);

          // Try to connect with API key
          try {
            console.log(`[TikTok Live] 🔄 Retry: Connecting with EulerStream API key...`);
            await fallbackConnection.connect();
          } catch (retryErr) {
            console.error(`[TikTok Live] ❌ Failed to connect even with API key:`, retryErr);

            // Extract error message using same logic
            let retryErrorMessage = 'Failed to connect to stream even with API key';
            let retryErrorType = 'Error';
            if (retryErr && typeof retryErr === 'object') {
              const customErr = retryErr as { info?: string; exception?: string; message?: string; name?: string };
              retryErrorMessage = customErr.exception || customErr.info || customErr.message || retryErrorMessage;
              retryErrorType = customErr.name || 'Error';
            } else if (retryErr instanceof Error) {
              retryErrorMessage = retryErr.message;
              retryErrorType = retryErr.name;
            }

            sendEvent('connectionError', {
              message: retryErrorMessage,
              type: retryErrorType,
            });
            streamClosed = true;
            try {
              controller.close();
            } catch (err) {
              // Already closed
            }
          }

          // Update cleanup handler for fallback connection
          request.signal.addEventListener('abort', () => {
            console.log(`[TikTok Live] Client disconnected from @${username}`);
            streamClosed = true; // Mark as closed before cleanup
            clearInterval(keepAliveInterval);
            fallbackConnection.disconnect();
            activeConnections.delete(username);
          });

        } else {
          // Not a rate limit error - send error to client
          // Use the errorMessage already extracted above
          const finalErrorType = (lastError as { name?: string }).name || 'Error';
          sendEvent('connectionError', {
            message: errorMessage,
            type: finalErrorType,
          });
          streamClosed = true;
          try {
            controller.close();
          } catch (err) {
            // Already closed
          }
        }
      }

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[TikTok Live] Client disconnected from @${username}`);
        streamClosed = true; // Mark as closed before cleanup
        clearInterval(keepAliveInterval);
        tiktokConnection.disconnect();
        activeConnections.delete(username);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
