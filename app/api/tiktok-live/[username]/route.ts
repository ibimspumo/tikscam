/**
 * TikTok Live Stream API Route
 *
 * Connects to TikTok Live using tiktok-live-connector
 * Streams events to client via Server-Sent Events (SSE)
 *
 * Connection Strategy (5-Phase System):
 * 1. Phase 1: Try 5x WITHOUT API key (free direct connection)
 * 2. Phase 2: Try 5x WITH server API key (if available)
 * 3. Phase 3: Show user dialog to enter their API key
 * 4. Phase 4: Try 5x WITH user API key (after user input)
 * 5. Phase 5: Show final error, allow manual reconnect
 */

import { WebcastPushConnection } from 'tiktok-live-connector';
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

  // Check if user provided their own API key
  const userApiKey = request.nextUrl.searchParams.get('apiKey');
  const hasUserApiKey = !!userApiKey;

  // Setup Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
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

      // Helper to extract error message from tiktok-live-connector's custom error format
      const extractErrorMessage = (err: unknown): string => {
        if (typeof err === 'string') {
          return err;
        } else if (err && typeof err === 'object') {
          const customErr = err as { info?: string; exception?: string | Error; message?: string };
          if (customErr.exception) {
            if (typeof customErr.exception === 'string') {
              return customErr.exception;
            } else if (customErr.exception instanceof Error) {
              return customErr.exception.message;
            }
          }
          return customErr.info || customErr.message || 'Unknown error';
        } else if (err instanceof Error) {
          return err.message;
        }
        return 'Unknown error';
      };

      // Helper to check if error is rate limit
      const isRateLimitError = (errorMessage: string): boolean => {
        return errorMessage?.includes('Rate Limited') ||
               errorMessage?.includes('rate limit') ||
               errorMessage?.includes('rate_limit') ||
               errorMessage?.includes('SignatureRateLimitError');
      };

      // Helper to check if error is temporary (worth retrying)
      const isTemporaryError = (errorMessage: string): boolean => {
        return errorMessage?.includes('Websocket connection failed') ||
               errorMessage?.includes('Unexpected server response') ||
               errorMessage?.includes('Invalid URL') ||
               errorMessage?.includes('ECONNREFUSED') ||
               errorMessage?.includes('version_code=') || // TikTok library URL parsing error
               errorMessage?.includes('browser_platform='); // TikTok library URL parsing error
      };

      // Helper to register event handlers
      const registerEventHandlers = (connection: WebcastPushConnection, usingApiKey: boolean = false) => {
        connection.on('connected', async (state) => {
          console.log(`[TikTok Live] ✅ Connected to @${username}${usingApiKey ? ' (using API key)' : ''}`);

          const streamTitle = state.roomInfo?.title ||
                             state.roomInfo?.data?.title ||
                             state.title ||
                             `@${username}'s Live`;

          let availableGifts = [];
          try {
            availableGifts = await connection.fetchAvailableGifts();
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
            usingApiKey: usingApiKey,
          });
        });

        connection.on('disconnected', () => {
          console.log(`[TikTok Live] Disconnected from @${username}`);
          sendEvent('disconnected', {});
          streamClosed = true;
          activeConnections.delete(username);
          try {
            controller.close();
          } catch (err) {
            // Already closed
          }
        });

        connection.on('error', (err) => {
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

        // Data event handlers (wrapped in try-catch)
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
            console.log(`[API] 🎁 Gift received:`, {
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

      // Helper to try connection with retries
      const tryConnect = async (
        connection: WebcastPushConnection,
        phase: string,
        maxAttempts: number,
        phaseDescription: string
      ): Promise<{ success: boolean; errorMessage: string }> => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            console.log(`[TikTok Live] 🔄 ${phaseDescription} (${attempt}/${maxAttempts})...`);

            sendEvent('connectionStatus', {
              phase,
              attempt,
              maxAttempts,
              message: `${phaseDescription} (${attempt}/${maxAttempts})...`,
            });

            await connection.connect();
            console.log(`[TikTok Live] ✅ Connection successful on attempt ${attempt}`);
            return { success: true, errorMessage: '' };
          } catch (err) {
            const errorMessage = extractErrorMessage(err);
            console.error(`[TikTok Live] ❌ Attempt ${attempt}/${maxAttempts} failed:`, errorMessage);

            // Send error details to client
            sendEvent('connectionStatus', {
              phase,
              attempt,
              maxAttempts,
              error: errorMessage,
              message: `Attempt ${attempt}/${maxAttempts} failed: ${errorMessage.substring(0, 100)}...`,
            });

            // Check if it's a rate limit error - stop trying this phase
            if (isRateLimitError(errorMessage)) {
              console.warn(`[TikTok Live] ⚠️ Rate limit detected - stopping ${phase} phase`);
              return { success: false, errorMessage };
            }

            // If it's the last attempt, return failure
            if (attempt === maxAttempts) {
              return { success: false, errorMessage };
            }

            // If temporary error, wait before retry
            if (isTemporaryError(errorMessage)) {
              console.log(`[TikTok Live] ⏳ Waiting 2 seconds before retry...`);
              sendEvent('connectionStatus', {
                phase,
                attempt,
                maxAttempts,
                message: `Retrying in 2 seconds... (${attempt + 1}/${maxAttempts})`,
              });
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              // Non-temporary error - stop trying
              return { success: false, errorMessage };
            }
          }
        }

        return { success: false, errorMessage: 'Max attempts reached' };
      };

      // Main connection logic
      let finalConnection: WebcastPushConnection | null = null;
      let connectionSuccess = false;

      if (hasUserApiKey) {
        // ==========================================
        // PHASE 4: User provided their own API key
        // ==========================================
        console.log('[TikTok Live] 🔑 Phase 4: Using user-provided API key');

        sendEvent('connectionStatus', {
          phase: 'user-api',
          message: '🔑 Connecting with your API key...',
        });

        const userConnection = new WebcastPushConnection(username, {
          signApiKey: userApiKey,
          processInitialData: false,
          enableExtendedGiftInfo: true,
          enableWebsocketUpgrade: true,
          requestPollingIntervalMs: 1000,
        });

        activeConnections.set(username, userConnection);
        registerEventHandlers(userConnection, true);

        const result = await tryConnect(
          userConnection,
          'user-api',
          5,
          'Connecting with your API key'
        );

        if (result.success) {
          finalConnection = userConnection;
          connectionSuccess = true;
        } else {
          // User API key failed - this is final
          const errorMessage = result.errorMessage;

          if (isRateLimitError(errorMessage)) {
            sendEvent('connectionError', {
              phase: 'user-api',
              message: '❌ Your API key is rate limited.\n\nPlease try again later or check your EulerStream quota at:\nhttps://www.eulerstream.com/pricing',
              type: 'RateLimitError',
              permanent: true,
            });
          } else {
            sendEvent('connectionError', {
              phase: 'user-api',
              message: `❌ Connection failed with your API key\n\nError: ${errorMessage}\n\nPossible reasons:\n• Stream is offline\n• Username is incorrect\n• API key is invalid\n• Network problem`,
              type: 'ConnectionError',
              permanent: true,
            });
          }

          streamClosed = true;
          try {
            controller.close();
          } catch (err) {
            // Already closed
          }
        }
      } else {
        // ==========================================
        // PHASE 1: Try direct connection (no API key)
        // ==========================================
        console.log('[TikTok Live] 📡 Phase 1: Trying direct connection (no API key)');

        sendEvent('connectionStatus', {
          phase: 'direct',
          message: '📡 Connecting directly to TikTok...',
        });

        const directConnection = new WebcastPushConnection(username, {
          processInitialData: false,
          enableExtendedGiftInfo: true,
          enableWebsocketUpgrade: true,
          requestPollingIntervalMs: 1000,
        });

        activeConnections.set(username, directConnection);
        registerEventHandlers(directConnection, false);

        const phase1Result = await tryConnect(
          directConnection,
          'direct',
          5,
          'Trying direct connection'
        );

        if (phase1Result.success) {
          finalConnection = directConnection;
          connectionSuccess = true;
        } else {
          // Phase 1 failed - check if we should try Phase 2
          const errorMessage = phase1Result.errorMessage;

          // Cleanup Phase 1 connection
          try {
            directConnection.disconnect();
            activeConnections.delete(username);
          } catch (cleanupErr) {
            console.warn('[TikTok Live] Phase 1 cleanup error:', cleanupErr);
          }

          // Only proceed to Phase 2 if we have server API key
          if (EULERSTREAM_API_KEY) {
            // ==========================================
            // PHASE 2: Try server API key
            // ==========================================
            console.log('[TikTok Live] 🔑 Phase 2: Trying with server API key');

            sendEvent('connectionStatus', {
              phase: 'server-api',
              message: '🔑 Phase 1 failed. Trying with server API key...',
            });

            const serverApiConnection = new WebcastPushConnection(username, {
              signApiKey: EULERSTREAM_API_KEY,
              processInitialData: false,
              enableExtendedGiftInfo: true,
              enableWebsocketUpgrade: true,
              requestPollingIntervalMs: 1000,
            });

            activeConnections.set(username, serverApiConnection);
            registerEventHandlers(serverApiConnection, true);

            const phase2Result = await tryConnect(
              serverApiConnection,
              'server-api',
              5,
              'Connecting with server API key'
            );

            if (phase2Result.success) {
              finalConnection = serverApiConnection;
              connectionSuccess = true;
            } else {
              // Phase 2 also failed - cleanup
              try {
                serverApiConnection.disconnect();
                activeConnections.delete(username);
              } catch (cleanupErr) {
                console.warn('[TikTok Live] Phase 2 cleanup error:', cleanupErr);
              }

              // Only ask for API key if user hasn't already provided one
              if (!hasUserApiKey) {
                // ==========================================
                // PHASE 3: Ask user for their API key
                // ==========================================
                console.log('[TikTok Live] 💬 Phase 3: Requesting user API key');

                sendEvent('needsApiKey', {
                  phase: 'needs-user-api',
                  message: '🔑 Server API key failed after 5 attempts.\n\nPlease provide your own EulerStream API key to continue.\n\nGet a free API key at:\nhttps://www.eulerstream.com/pricing',
                  phase1Error: phase1Result.errorMessage,
                  phase2Error: phase2Result.errorMessage,
                });

                streamClosed = true;
                try {
                  controller.close();
                } catch (err) {
                  // Already closed
                }
              } else {
                // User already has API key - this shouldn't happen since we handle it in Phase 4 above
                console.log('[TikTok Live] ⚠️ Phase 2 failed but user has API key - this path should not be reached');
                streamClosed = true;
                try {
                  controller.close();
                } catch (err) {
                  // Already closed
                }
              }
            }
          } else {
            // No server API key available
            // Only show API key dialog if user hasn't already provided one
            if (!hasUserApiKey) {
              // PHASE 3: Ask for API key (only if not already provided)
              console.log('[TikTok Live] 💬 Phase 3: No server API key, requesting user API key');

              sendEvent('needsApiKey', {
                phase: 'needs-user-api',
                message: '🔑 Direct connection failed after 5 attempts.\n\nPlease provide an EulerStream API key to continue.\n\nGet a free API key at:\nhttps://www.eulerstream.com/pricing',
                phase1Error: errorMessage,
              });

              streamClosed = true;
              try {
                controller.close();
              } catch (err) {
                // Already closed
              }
            } else {
              // User already has API key - this shouldn't happen since we handle it in Phase 4 above
              console.log('[TikTok Live] ⚠️ Phase 1 failed but user has API key - this path should not be reached');
              streamClosed = true;
              try {
                controller.close();
              } catch (err) {
                // Already closed
              }
            }
          }
        }
      }

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[TikTok Live] Client disconnected from @${username}`);
        streamClosed = true;
        clearInterval(keepAliveInterval);
        if (finalConnection) {
          finalConnection.disconnect();
        }
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
