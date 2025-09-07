import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { LoadingScene } from '@/game/scenes/LoadingScene';
import { WeaponGenPanel } from '@/components/game/WeaponGenPanel';
import { GameHUD } from '@/components/game/GameHUD';
import { PhysicsIndicator } from '@/components/game/PhysicsIndicator';
import { NotificationSystem } from '@/components/game/NotificationSystem';
import { GameStats } from '@/components/game/GameStats';
import { Leaderboard } from '@/components/game/Leaderboard';
import { useGameStore, useMatchState, usePlayerState, useUIControls } from '@/store/gameStore';
import { useWebSocket } from '@/services/workingWebsocket';
import { MessageType, InputState } from '@/types/game';

interface GameContainerProps {
  playerId: string;
  playerName: string;
  onDisconnect: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  playerId,
  playerName,
  onDisconnect
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const inputStateRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    mouseX: 0,
    mouseY: 0,
    timestamp: 0
  });

  const [isGameReady, setIsGameReady] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const { sendMessage } = useWebSocket();
  const { match, isInMatch } = useMatchState();
  const { player, isAlive, health, weapons } = usePlayerState();
  const { ui, setUI, notifications } = useUIControls();
  const { updateInputState } = useGameStore();

  // Initialize Phaser game
  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 600,
      parent: gameContainerRef.current,
      backgroundColor: '#0f0f23',
      physics: {
        default: 'matter',
        matter: {
          gravity: { y: 0.8 },
          debug: false,
          enableSleeping: false
        }
      },
      scene: [LoadingScene, GameScene],
      input: {
        mouse: true,
        keyboard: true
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1200,
        height: 600
      },
      render: {
        antialias: true,
        pixelArt: false
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Game ready callback
    gameRef.current.events.once('ready', () => {
      console.log('🎮 Phaser game initialized');
      setIsGameReady(true);
    });

    return () => {
      if (gameRef.current) {
        console.log('🎮 Destroying Phaser game');
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (showPauseMenu) return;

    const newInput = { ...inputStateRef.current };
    let inputChanged = false;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (!newInput.up) {
          newInput.up = true;
          inputChanged = true;
        }
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (!newInput.down) {
          newInput.down = true;
          inputChanged = true;
        }
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (!newInput.left) {
          newInput.left = true;
          inputChanged = true;
        }
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (!newInput.right) {
          newInput.right = true;
          inputChanged = true;
        }
        break;
      case 'Space':
        if (!newInput.fire) {
          newInput.fire = true;
          inputChanged = true;
        }
        event.preventDefault();
        break;
      case 'Escape':
        setShowPauseMenu(prev => !prev);
        break;
      case 'Tab':
        setUI({ showStats: !ui.showStats });
        event.preventDefault();
        break;
      case 'KeyL':
        setUI({ showLeaderboard: !ui.showLeaderboard });
        break;
    }

    if (inputChanged) {
      inputStateRef.current = newInput;
      updateInputState(newInput);
      
      // Send input to server
      if (match?.id) {
        sendMessage({
          type: MessageType.PLAYER_INPUT,
          data: {
            match_id: match.id,
            input: newInput
          },
          timestamp: Date.now()
        });
      }
    }
  }, [showPauseMenu, updateInputState, sendMessage, match?.id, ui.showStats, ui.showLeaderboard, setUI]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (showPauseMenu) return;

    const newInput = { ...inputStateRef.current };
    let inputChanged = false;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (newInput.up) {
          newInput.up = false;
          inputChanged = true;
        }
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (newInput.down) {
          newInput.down = false;
          inputChanged = true;
        }
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (newInput.left) {
          newInput.left = false;
          inputChanged = true;
        }
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (newInput.right) {
          newInput.right = false;
          inputChanged = true;
        }
        break;
      case 'Space':
        if (newInput.fire) {
          newInput.fire = false;
          inputChanged = true;
        }
        break;
    }

    if (inputChanged) {
      inputStateRef.current = newInput;
      updateInputState(newInput);
      
      // Send input to server
      if (match?.id) {
        sendMessage({
          type: MessageType.PLAYER_INPUT,
          data: {
            match_id: match.id,
            input: newInput
          },
          timestamp: Date.now()
        });
      }
    }
  }, [showPauseMenu, updateInputState, sendMessage, match?.id]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (showPauseMenu || !gameContainerRef.current) return;

    const rect = gameContainerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newInput = {
      ...inputStateRef.current,
      mouseX,
      mouseY
    };

    inputStateRef.current = newInput;
    updateInputState(newInput);
  }, [showPauseMenu, updateInputState]);

  // Handle mouse click
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (showPauseMenu) return;

    if (event.button === 0) { // Left click
      const newInput = {
        ...inputStateRef.current,
        fire: true
      };

      inputStateRef.current = newInput;
      updateInputState(newInput);
      
      // Send input to server
      if (match?.id) {
        sendMessage({
          type: MessageType.PLAYER_INPUT,
          data: {
            match_id: match.id,
            input: newInput
          },
          timestamp: Date.now()
        });
      }
    }
  }, [showPauseMenu, updateInputState, sendMessage, match?.id]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (showPauseMenu) return;

    if (event.button === 0) { // Left click
      const newInput = {
        ...inputStateRef.current,
        fire: false
      };

      inputStateRef.current = newInput;
      updateInputState(newInput);
      
      // Send input to server
      if (match?.id) {
        sendMessage({
          type: MessageType.PLAYER_INPUT,
          data: {
            match_id: match.id,
            input: newInput
          },
          timestamp: Date.now()
        });
      }
    }
  }, [showPauseMenu, updateInputState, sendMessage, match?.id]);

  // Set up input listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp]);

  // Handle weapon generation
  const handleWeaponGenerate = useCallback((prompt: string) => {
    if (!match?.id) return;

    sendMessage({
      type: MessageType.WEAPON_GENERATE,
      data: {
        prompt: prompt.trim(),
        match_id: match.id,
        player_id: playerId
      },
      timestamp: Date.now()
    });
  }, [sendMessage, match?.id, playerId]);

  // Handle master prompt
  const handleMasterPrompt = useCallback((prompt: string) => {
    if (!match?.id) return;

    sendMessage({
      type: MessageType.MASTER_PROMPT,
      data: {
        prompt: prompt.trim(),
        match_id: match.id
      },
      timestamp: Date.now()
    });
  }, [sendMessage, match?.id]);

  // Handle weapon use
  const handleWeaponUse = useCallback((weaponId: string) => {
    if (!match?.id) return;

    const mousePos = inputStateRef.current;
    sendMessage({
      type: MessageType.WEAPON_USE,
      data: {
        match_id: match.id,
        weapon_id: weaponId,
        target_position: {
          x: mousePos.mouseX,
          y: mousePos.mouseY
        }
      },
      timestamp: Date.now()
    });
  }, [sendMessage, match?.id]);

  const handlePause = useCallback(() => {
    setShowPauseMenu(true);
  }, []);

  const handleResume = useCallback(() => {
    setShowPauseMenu(false);
  }, []);

  const handleQuit = useCallback(() => {
    onDisconnect();
  }, [onDisconnect]);

  if (!isGameReady) {
    return (
      <div className="game-loading">
        <div className="loading-message">Initializing Game Engine...</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Phaser Game Canvas */}
      <div 
        ref={gameContainerRef} 
        className="phaser-container"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Game UI Overlay */}
      <div className="game-ui">
        {/* HUD */}
        <GameHUD
          player={player}
          isAlive={isAlive}
          health={health}
          weapons={weapons}
          currentMatch={match}
          onPause={handlePause}
          onWeaponSelect={(weaponId) => {
            const weapon = weapons.find(w => w.id === weaponId);
            setUI({ currentWeapon: weapon });
          }}
        />

        {/* Weapon Generation Panel */}
        {isAlive && (
          <WeaponGenPanel
            isVisible={ui.showWeaponGen}
            cooldown={ui.weaponCooldown}
            onGenerate={handleWeaponGenerate}
            onToggle={() => setUI({ showWeaponGen: !ui.showWeaponGen })}
          />
        )}

        {/* Physics Modification Indicator */}
        {match?.physics.active_modifications.some(mod => 
          Date.now() < (mod.start_time + mod.duration) * 1000
        ) && (
          <PhysicsIndicator modifications={match.physics.active_modifications} />
        )}

        {/* Stats Panel */}
        {ui.showStats && (
          <GameStats
            onClose={() => setUI({ showStats: false })}
          />
        )}

        {/* Leaderboard */}
        {ui.showLeaderboard && match && (
          <Leaderboard
            players={match.players}
            onClose={() => setUI({ showLeaderboard: false })}
          />
        )}

        {/* Notification System */}
        <NotificationSystem notifications={notifications} />

        {/* Pause Menu */}
        {showPauseMenu && (
          <div className="pause-menu-overlay">
            <div className="pause-menu">
              <h2>Game Paused</h2>
              <div className="pause-menu-actions">
                <button className="btn btn-primary" onClick={handleResume}>
                  Resume Game
                </button>
                <button className="btn btn-outline" onClick={() => setUI({ showStats: !ui.showStats })}>
                  Toggle Stats
                </button>
                <button className="btn btn-outline" onClick={() => setUI({ showLeaderboard: !ui.showLeaderboard })}>
                  Leaderboard
                </button>
                <button className="btn btn-secondary" onClick={handleQuit}>
                  Quit Game
                </button>
              </div>
              <div className="pause-menu-help">
                <h3>Controls</h3>
                <div className="control-list">
                  <div className="control-item">
                    <span className="control-key">WASD</span>
                    <span className="control-desc">Move</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Mouse</span>
                    <span className="control-desc">Aim & Fire</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">TAB</span>
                    <span className="control-desc">Stats</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">L</span>
                    <span className="control-desc">Leaderboard</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">ESC</span>
                    <span className="control-desc">Pause</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }
        
        .phaser-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .game-ui {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
        }
        
        .game-ui > * {
          pointer-events: auto;
        }
        
        .game-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--primary-bg);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .loading-message {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          color: var(--primary-color);
          text-shadow: var(--shadow-glow);
        }
        
        .pause-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(10px);
        }
        
        .pause-menu {
          background: rgba(15, 15, 35, 0.95);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-xxl);
          max-width: 500px;
          width: 90%;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-glow);
        }
        
        .pause-menu h2 {
          color: var(--primary-color);
          margin-bottom: var(--spacing-xl);
          font-size: 2rem;
        }
        
        .pause-menu-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .pause-menu-help h3 {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
          font-size: 1.2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-lg);
        }
        
        .control-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
          text-align: left;
        }
        
        .control-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius);
        }
        
        .control-key {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--primary-color);
          background: rgba(0, 255, 255, 0.1);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .control-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .pause-menu {
            padding: var(--spacing-xl);
            width: 95%;
          }
          
          .control-list {
            grid-template-columns: 1fr;
          }
          
          .pause-menu h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};