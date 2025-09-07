import { useRef, useCallback, useEffect, useState } from 'react';
import { GameMessage, MessageType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface WebSocketHook {
  connect: (playerId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (message: GameMessage) => void;
  isConnected: boolean;
  lastError: Error | null;
}

// Use direct connection to WebSocket server on port 6001
const WS_URL = window.location.protocol === 'https:' 
  ? 'wss://localhost:6001/ws'
  : 'ws://localhost:6001/ws';

export const useWebSocket = (): WebSocketHook => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const { 
    setConnectionStatus, 
    setCurrentMatch,
    addNotification,
    updateGameStats
  } = useGameStore();

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      console.log('Raw message received:', event.data);
      const message: GameMessage = JSON.parse(event.data);
      console.log('Parsed message:', message);
      
      // Update ping
      const now = Date.now();
      const latency = now - (message.timestamp || now);
      updateGameStats({ ping: latency });
      
      switch (message.type) {
        case MessageType.PLAYER_CONNECT:
          console.log('✅ Player connected');
          addNotification({
            id: `connect_${now}`,
            type: 'success',
            message: 'Connected to server!',
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.MATCH_FOUND:
          console.log('🎯 Match found');
          // Prepare for match
          updateGameStats({ matchId: message.data.match_id });
          addNotification({
            id: `match_${now}`,
            type: 'success',
            message: `Match found! ${message.data.players} players`,
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.MATCH_START:
          console.log('🚀 Match starting');
          // Set the match data to trigger game state
          setCurrentMatch({
            id: message.data.match_id || 'match123',
            players: [],
            state: 'active',
            arena: message.data.arena,
            mode: message.data.mode,
            timestamp: now
          });
          addNotification({
            id: `start_${now}`,
            type: 'info',
            message: 'Match starting!',
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.GAME_STATE_UPDATE:
          setCurrentMatch(message.data);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }, [addNotification, setCurrentMatch, updateGameStats]);

  // Connect to WebSocket
  const connect = useCallback(async (playerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Clean up existing connection
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        const fullUrl = `${WS_URL}/${playerId}`;
        console.log('🔌 Connecting to:', fullUrl);
        
        setConnectionStatus('connecting');
        setLastError(null);
        
        const ws = new WebSocket(fullUrl);
        wsRef.current = ws;
        
        // Connection opened
        ws.onopen = () => {
          console.log('✅ WebSocket opened');
          setIsConnected(true);
          setConnectionStatus('connected');
          resolve();
        };
        
        // Message received
        ws.onmessage = handleMessage;
        
        // Connection error
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          const err = new Error('WebSocket connection error');
          setLastError(err);
          setConnectionStatus('error');
          reject(err);
        };
        
        // Connection closed
        ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            const err = new Error('Connection timeout');
            setLastError(err);
            reject(err);
          }
        }, 5000);
        
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        const err = error as Error;
        setLastError(err);
        setConnectionStatus('error');
        reject(err);
      }
    });
  }, [setConnectionStatus, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(async () => {
    console.log('Disconnecting...');
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [setConnectionStatus]);

  // Send message
  const sendMessage = useCallback((message: GameMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('Cannot send - not connected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    lastError
  };
};