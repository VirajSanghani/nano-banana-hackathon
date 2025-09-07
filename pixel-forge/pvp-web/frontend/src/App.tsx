import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from '@/components/GameContainer';
import { MainMenu } from '@/components/MainMenu';
import { LoadingScreen } from '@/components/LoadingScreen';
import { TestConnection } from '@/components/TestConnection';
import { useGameStore } from '@/store/gameStore';
import { useWebSocket } from '@/services/workingWebsocket';
import { GameError, MessageType } from '@/types/game';
import './App.css';

type AppState = 'loading' | 'menu' | 'connecting' | 'game' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [error, setError] = useState<GameError | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');

  const { 
    currentMatch, 
    connectionStatus,
    setConnectionStatus,
    addNotification 
  } = useGameStore();

  const {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    lastError
  } = useWebSocket();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Generate unique player ID
        const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setPlayerId(id);
        
        // Get player name from localStorage or generate default
        const savedName = localStorage.getItem('pixel-forge-player-name');
        const defaultName = savedName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(defaultName);
        
        // Simulate loading assets and initializing services
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setAppState('menu');
      } catch (err) {
        setError({
          code: 'INITIALIZATION_ERROR',
          message: 'Failed to initialize application',
          details: err,
          timestamp: Date.now()
        });
        setAppState('error');
      }
    };

    initializeApp();
  }, []);

  // Handle WebSocket connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
      if (appState === 'connecting') {
        setAppState('game');
      }
    } else if (connectionStatus === 'connected') {
      setConnectionStatus('disconnected');
      addNotification({
        id: `disconnect_${Date.now()}`,
        type: 'error',
        message: 'Connection lost. Attempting to reconnect...',
        duration: 5000,
        timestamp: Date.now()
      });
    }
  }, [isConnected, connectionStatus, appState, setConnectionStatus, addNotification]);

  // Handle WebSocket errors
  useEffect(() => {
    if (lastError) {
      setError({
        code: 'NETWORK_ERROR',
        message: lastError.message,
        details: {
          type: 'connection',
          retryable: true
        },
        timestamp: Date.now()
      });
    }
  }, [lastError]);

  // Handle game state changes
  useEffect(() => {
    if (currentMatch) {
      // Transition to game state when we have a match
      setAppState('game');
    } else if (appState === 'game' && !currentMatch) {
      // Match ended, return to menu
      setAppState('menu');
      addNotification({
        id: `match_end_${Date.now()}`,
        type: 'info',
        message: 'Match ended. Returning to menu.',
        duration: 3000,
        timestamp: Date.now()
      });
    }
  }, [currentMatch, appState, addNotification]);

  const handleStartGame = useCallback(async (name: string) => {
    try {
      setPlayerName(name);
      localStorage.setItem('pixel-forge-player-name', name);
      setAppState('connecting');
      
      // Connect to WebSocket
      await connect(playerId);
      
      // Request matchmaking
      sendMessage({
        type: MessageType.FIND_MATCH,
        data: {
          player_name: name,
          preferences: {}
        },
        timestamp: Date.now(),
        player_id: playerId
      });
      
      addNotification({
        id: `connecting_${Date.now()}`,
        type: 'info',
        message: 'Connecting to game server...',
        duration: 3000,
        timestamp: Date.now()
      });
      
    } catch (err) {
      setError({
        code: 'CONNECTION_ERROR',
        message: 'Failed to connect to game server',
        details: err,
        timestamp: Date.now()
      });
      setAppState('error');
    }
  }, [playerId, connect, sendMessage, addNotification]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setAppState('menu');
      addNotification({
        id: `manual_disconnect_${Date.now()}`,
        type: 'info',
        message: 'Disconnected from server',
        duration: 2000,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }, [disconnect, addNotification]);

  const handleRetry = useCallback(() => {
    setError(null);
    setAppState('menu');
  }, []);

  const handleReturnToMenu = useCallback(() => {
    handleDisconnect();
  }, [handleDisconnect]);

  // Render based on app state
  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return (
          <LoadingScreen 
            message="Loading Pixel-Forge PvP..."
            progress={100}
          />
        );

      case 'menu':
        return (
          <MainMenu
            defaultPlayerName={playerName}
            onStartGame={handleStartGame}
            error={error}
            onRetry={handleRetry}
          />
        );

      case 'connecting':
        return (
          <LoadingScreen 
            message="Connecting to battle arena..."
            progress={50}
            canCancel={true}
            onCancel={handleReturnToMenu}
          />
        );

      case 'game':
        return (
          <GameContainer
            playerId={playerId}
            playerName={playerName}
            onDisconnect={handleReturnToMenu}
          />
        );

      case 'error':
        return (
          <div className="error-screen">
            <div className="error-content">
              <h1 className="text-error font-mono">CONNECTION ERROR</h1>
              <p className="error-message">{error?.message || 'An unknown error occurred'}</p>
              {error?.details?.retryable && (
                <div className="error-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleRetry}
                  >
                    Try Again
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={handleReturnToMenu}
                  >
                    Return to Menu
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <LoadingScreen message="Initializing..." progress={0} />;
    }
  };

  return (
    <div className="app">
      <TestConnection />
      {renderContent()}
    </div>
  );
};

export default App;