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
const EULERSTREAM_API_KEY = 'MTExZjA2MDIxYzJjNjQ2YzNjYTdkMzRhOWQ5OTdlMWE3NTAxNTc1NmU5YThkNGJiMGQwNjVi';

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
      console.log(`[TikTok Live] Connecting to @${username}...`);

      // Create TikTok connection
      const tiktokConnection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
      });

      // Store connection
      activeConnections.set(username, tiktokConnection);

      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 🔄 Keep-Alive: Send heartbeat every 30 seconds to prevent timeout
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (err) {
          console.log('[TikTok Live] Keep-alive failed, connection closed');
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
        activeConnections.delete(username);
        controller.close();
      });

      tiktokConnection.on('error', (err) => {
        console.error(`[TikTok Live] Error:`, err);
        sendEvent('error', { message: err.message });
      });

      // Helper to register event handlers
      const registerEventHandlers = (connection: WebcastPushConnection) => {
        connection.on('roomUser', (data) => sendEvent('roomUser', data));
        connection.on('chat', (data) => sendEvent('chat', data));
        connection.on('gift', (data) => {
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
        });
        connection.on('member', (data) => sendEvent('member', data));
        connection.on('like', (data) => sendEvent('like', data));
        connection.on('social', (data) => sendEvent('social', data));
        connection.on('streamEnd', (data) => sendEvent('streamEnd', data));
      };

      // Register event handlers for initial connection
      registerEventHandlers(tiktokConnection);

      // Connect with smart fallback strategy
      try {
        console.log(`[TikTok Live] 🔄 Attempting connection (without API key)...`);
        await tiktokConnection.connect();
      } catch (err: any) {
        console.error(`[TikTok Live] ❌ Initial connection failed:`, err.message);

        // Check if it's a rate limit error
        const isRateLimitError =
          err.name === 'SignatureRateLimitError' ||
          err.message?.includes('Rate Limited') ||
          err.message?.includes('rate limit') ||
          err.message?.includes('rate_limit');

        if (isRateLimitError) {
          console.log(`[TikTok Live] ⚠️ Rate limit detected! Activating EulerStream API key...`);

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
            processInitialData: true,
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
            activeConnections.delete(username);
            controller.close();
          });

          fallbackConnection.on('error', (err) => {
            console.error(`[TikTok Live] Error:`, err);
            sendEvent('error', { message: err.message });
          });

          // Register event handlers for fallback connection
          registerEventHandlers(fallbackConnection);

          // Try to connect with API key
          try {
            console.log(`[TikTok Live] 🔄 Retry: Connecting with EulerStream API key...`);
            await fallbackConnection.connect();
          } catch (retryErr: any) {
            console.error(`[TikTok Live] ❌ Failed to connect even with API key:`, retryErr);
            sendEvent('error', {
              message: retryErr.message || 'Failed to connect to stream even with API key',
              type: retryErr.name,
            });
            controller.close();
          }

          // Update cleanup handler for fallback connection
          request.signal.addEventListener('abort', () => {
            console.log(`[TikTok Live] Client disconnected from @${username}`);
            clearInterval(keepAliveInterval);
            fallbackConnection.disconnect();
            activeConnections.delete(username);
          });

        } else {
          // Not a rate limit error - send error to client
          let errorMessage = err.message || 'Failed to connect to stream';
          sendEvent('error', {
            message: errorMessage,
            type: err.name,
          });
          controller.close();
        }
      }

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[TikTok Live] Client disconnected from @${username}`);
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
