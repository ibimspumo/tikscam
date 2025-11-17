import { useEffect, useState, useCallback } from 'react';

interface StreamEvent {
  type: string;
  data: any;
  timestamp: number;
}

interface UseEulerStreamReturn {
  events: StreamEvent[];
  isConnected: boolean;
  error: string | null;
  roomInfo: any;
  connect: (uniqueId: string) => void;
  disconnect: () => void;
}

export function useEulerStream(): UseEulerStreamReturn {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
      setEvents([]);
      setRoomInfo(null);
    }
  }, [ws]);

  const connect = useCallback((uniqueId: string) => {
    console.log('Attempting to connect to:', uniqueId);

    // Disconnect existing connection
    if (ws) {
      ws.close();
    }

    const apiKey = process.env.NEXT_PUBLIC_EULERSTREAM_API_KEY;
    if (!apiKey) {
      setError('API Key not found. Please check .env.local file.');
      return;
    }

    console.log('Using API Key:', apiKey.substring(0, 10) + '...');
    const wsUrl = `wss://ws.eulerstream.com?uniqueId=${uniqueId}&apiKey=${apiKey}`;
    console.log('Connecting to WebSocket:', wsUrl.replace(apiKey, 'HIDDEN'));

    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('WebSocket connected successfully!');
      setIsConnected(true);
      setError(null);
      setEvents([]);
      setRoomInfo(null);
    };

    newWs.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);

        // Extract and persist room info
        if (data.roomInfo) {
          console.log('Room info found:', JSON.stringify(data.roomInfo, null, 2));
          setRoomInfo((prev: any) => ({
            ...prev,
            ...data.roomInfo,
          }));
        }

        // Check messages array for room info too
        if (data.messages) {
          data.messages.forEach((msg: any) => {
            if (msg.data?.roomInfo) {
              console.log('Room info in message:', JSON.stringify(msg.data.roomInfo, null, 2));
              setRoomInfo((prev: any) => ({
                ...prev,
                ...msg.data.roomInfo,
              }));
            }
          });
        }

        const streamEvent: StreamEvent = {
          type: data.type || data.event || 'unknown',
          data: data,
          timestamp: Date.now(),
        };
        setEvents((prev) => [...prev.slice(-99), streamEvent]); // Keep last 100 events
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket Fehler aufgetreten');
    };

    newWs.onclose = (event) => {
      console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
      setIsConnected(false);

      // Handle specific close codes and errors
      if (event.reason && event.reason.includes('504')) {
        setError('❌ Stream is currently not live or not accessible. Please check:\n• Is the stream actually live?\n• Is the username spelled correctly?');
      } else if (event.reason && event.reason.includes('500')) {
        setError('❌ TikTok server not reachable. The stream might be offline or TikTok is temporarily blocking access.');
      } else if (event.code === 1008) {
        setError('❌ Stream not found or not live');
      } else if (event.code === 1003) {
        setError('❌ Invalid parameters');
      } else if (event.reason) {
        setError(`❌ ${event.reason}`);
      } else if (event.code !== 1000) {
        setError(`❌ Connection closed (Code: ${event.code})`);
      }
    };

    setWs(newWs);
  }, [ws]);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return { events, isConnected, error, roomInfo, connect, disconnect };
}
