import { useRef, useCallback, useEffect, useState } from 'react';
import { GameMessage, MessageType, MatchState, WeaponGenerationResponse, PhysicsModification } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface WebSocketHook {
  connect: (playerId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (message: GameMessage) => void;
  isConnected: boolean;
  lastError: Error | null;
}

const WS_URL = import.meta.env.DEV 
  ? 'ws://localhost:6000/ws'
  : `ws://${window.location.host}/ws`;
  
console.log('WebSocket URL configured as:', WS_URL);

const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000;

// WebSocket hook v2 - fixed connection
export const useWebSocket = (): WebSocketHook => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const playerIdRef = useRef<string | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const { 
    setConnectionStatus, 
    setCurrentMatch, 
    updatePlayer,
    updateGameStats,
    addNotification,
    applyPhysicsModification,
    addWeapon,
    setError,
    resetGameState
  } = useGameStore();

  // Clear reconnection timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Clear heartbeat interval
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Send heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const pingMessage: GameMessage = {
          type: MessageType.PLAYER_CONNECT,
          data: { ping: true, timestamp: Date.now() },
          timestamp: Date.now(),
          player_id: playerIdRef.current || undefined
        };
        wsRef.current.send(JSON.stringify(pingMessage));
      }
    }, HEARTBEAT_INTERVAL);
  }, [clearHeartbeat]);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: GameMessage = JSON.parse(event.data);
      const now = Date.now();
      const latency = now - message.timestamp;
      
      // Update ping
      updateGameStats({ ping: latency });
      
      switch (message.type) {
        case MessageType.PLAYER_CONNECT:
          console.log('✅ Connected to server');
          addNotification({
            id: `connect_${now}`,
            type: 'success',
            message: 'Connected to Pixel-Forge PvP!',
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.MATCH_FOUND:
          console.log('🎯 Match found:', message.data);
          addNotification({
            id: `match_found_${now}`,
            type: 'success',
            message: `Match found! Players: ${message.data.players?.length || 0}`,
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.MATCH_START:
          console.log('🚀 Match starting:', message.data);
          addNotification({
            id: `match_start_${now}`,
            type: 'info',
            message: 'Match is starting! Prepare for battle!',
            duration: 4000,
            timestamp: now
          });
          break;

        case MessageType.GAME_STATE_UPDATE:
          // Update match state
          const matchState: MatchState = message.data as MatchState;
          setCurrentMatch(matchState);
          break;

        case MessageType.WEAPON_GENERATED:
          const weaponResponse: WeaponGenerationResponse = message.data as WeaponGenerationResponse;
          if (weaponResponse.success && weaponResponse.weapon) {
            console.log('⚔️ Weapon generated:', weaponResponse.weapon);
            
            // Add weapon if it's for current player
            if (weaponResponse.weapon.player_id === playerIdRef.current) {
              addWeapon(weaponResponse.weapon);
            }
            
            addNotification({
              id: `weapon_gen_${now}`,
              type: 'success',
              message: `New weapon: ${weaponResponse.weapon.name}!`,
              duration: 3000,
              timestamp: now
            });
          } else {
            console.log('❌ Weapon generation failed:', weaponResponse.error);
            addNotification({
              id: `weapon_fail_${now}`,
              type: 'error',
              message: weaponResponse.error || 'Weapon generation failed',
              duration: 4000,
              timestamp: now
            });
          }
          break;

        case MessageType.PHYSICS_CHANGED:
          const modification: PhysicsModification = message.data.modification;
          console.log('🌀 Physics changed:', modification);
          applyPhysicsModification(modification);
          
          const autoGenerated = message.data.auto_generated;
          addNotification({
            id: `physics_${now}`,
            type: 'warning',
            message: `${autoGenerated ? '[AUTO] ' : ''}${modification.description}`,
            duration: 4000,
            timestamp: now
          });
          break;

        case MessageType.PLAYER_HIT:
          console.log('💥 Player hit:', message.data);
          addNotification({
            id: `hit_${now}`,
            type: 'warning',
            message: `${message.data.target_name || 'Player'} hit for ${message.data.damage} damage!`,
            duration: 2000,
            timestamp: now
          });
          break;

        case MessageType.PLAYER_DEATH:
          console.log('💀 Player death:', message.data);
          addNotification({
            id: `death_${now}`,
            type: 'error',
            message: `${message.data.player_name || 'Player'} was eliminated!`,
            duration: 3000,
            timestamp: now
          });
          break;

        case MessageType.MATCH_END:
          console.log('🏁 Match ended:', message.data);
          const winner = message.data.winner;
          addNotification({
            id: `match_end_${now}`,
            type: 'info',
            message: winner ? `${winner.name} wins!` : 'Match ended in a draw!',
            duration: 5000,
            timestamp: now
          });
          break;

        case MessageType.PLAYER_DISCONNECT:
          console.log('❌ Player disconnected:', message.data);
          if (message.data.error) {
            setError({
              code: 'PLAYER_DISCONNECT',
              message: message.data.error,
              timestamp: now
            });
          }
          break;

        default:
          console.log('📨 Unknown message type:', message.type, message.data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
      setLastError(error as Error);
    }
  }, [
    updateGameStats,
    addNotification, 
    setCurrentMatch, 
    addWeapon, 
    applyPhysicsModification,
    setError
  ]);

  // Handle WebSocket connection open
  const handleOpen = useCallback(() => {
    console.log('🔌 WebSocket connected');
    setIsConnected(true);
    setConnectionStatus('connected');
    setLastError(null);
    reconnectAttemptsRef.current = 0;
    clearReconnectTimeout();
    startHeartbeat();
  }, [setConnectionStatus, clearReconnectTimeout, startHeartbeat]);

  // Handle WebSocket connection close
  const handleClose = useCallback((event: CloseEvent) => {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
    setIsConnected(false);
    clearHeartbeat();
    
    if (event.code !== 1000) { // Not a normal closure
      setConnectionStatus('disconnected');
      
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        console.log(`🔄 Attempting to reconnect... (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        setConnectionStatus('reconnecting');
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect(playerIdRef.current!);
        }, RECONNECT_INTERVAL);
      } else {
        console.log('❌ Max reconnection attempts reached');
        setConnectionStatus('error');
        setError({
          code: 'CONNECTION_ERROR',
          message: 'Unable to connect to game server. Please refresh and try again.',
          details: { retryable: true },
          timestamp: Date.now()
        });
      }
    }
  }, [setConnectionStatus, clearHeartbeat, setError]);

  // Handle WebSocket errors
  const handleError = useCallback((event: Event) => {
    console.error('🔌 WebSocket error:', event);
    const error = new Error('WebSocket connection error');
    setLastError(error);
    setConnectionStatus('error');
  }, [setConnectionStatus]);

  // Connect to WebSocket
  const connect = useCallback(async (playerId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    playerIdRef.current = playerId;
    setConnectionStatus('connecting');
    clearReconnectTimeout();

    try {
      const wsUrl = `${WS_URL}/${playerId}`;
      console.log('🔌 Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      // Set up handlers
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;
      wsRef.current.onmessage = handleMessage;
      
      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      });
      
    } catch (error) {
      console.error('Failed to connect:', error);
      setLastError(error as Error);
      setConnectionStatus('error');
      throw error;
    }
  }, [
    setConnectionStatus, 
    clearReconnectTimeout, 
    handleOpen, 
    handleClose, 
    handleError, 
    handleMessage
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting WebSocket...');
    
    clearReconnectTimeout();
    clearHeartbeat();
    setConnectionStatus('disconnected');
    setIsConnected(false);
    resetGameState();
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Client disconnect');
      }
      wsRef.current = null;
    }
    
    playerIdRef.current = null;
  }, [
    clearReconnectTimeout, 
    clearHeartbeat, 
    setConnectionStatus, 
    resetGameState
  ]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: GameMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        // Ensure timestamp and player_id are set
        const messageWithMeta: GameMessage = {
          ...message,
          timestamp: message.timestamp || Date.now(),
          player_id: message.player_id || playerIdRef.current || undefined
        };
        
        wsRef.current.send(JSON.stringify(messageWithMeta));
        
        // Update stats
        updateGameStats({ 
          packetsSent: useGameStore.getState().gameStats.packetsSent + 1 
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        setLastError(error as Error);
      }
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      addNotification({
        id: `send_fail_${Date.now()}`,
        type: 'error',
        message: 'Cannot send message: Not connected to server',
        duration: 3000,
        timestamp: Date.now()
      });
    }
  }, [updateGameStats, addNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    lastError
  };
};