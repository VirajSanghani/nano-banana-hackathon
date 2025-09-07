import React, { useState, useEffect } from 'react';
import { GameError } from '@/types/game';

interface MainMenuProps {
  defaultPlayerName: string;
  onStartGame: (playerName: string) => void;
  error?: GameError | null;
  onRetry?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ 
  defaultPlayerName, 
  onStartGame, 
  error, 
  onRetry 
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Update player name when default changes
  useEffect(() => {
    setPlayerName(defaultPlayerName);
  }, [defaultPlayerName]);

  const handleStartGame = async () => {
    if (!playerName.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onStartGame(playerName.trim());
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleStartGame();
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-background" />
      
      <div className="menu-container">
        {/* Header */}
        <div className="menu-header">
          <h1 className="menu-title glow-primary">
            PIXEL-FORGE
          </h1>
          <h2 className="menu-subtitle">
            Revolutionary AI Combat Arena
          </h2>
          <p className="menu-description">
            Create weapons with natural language • Dynamic physics modifications • Real-time PvP combat
          </p>
        </div>

        {/* Main content */}
        <div className="menu-content">
          {error ? (
            // Error state
            <div className="menu-error">
              <div className="error-icon">⚠️</div>
              <h3>Connection Failed</h3>
              <p>{error.message}</p>
              {onRetry && (
                <button 
                  className="btn btn-primary"
                  onClick={onRetry}
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            // Normal state
            <>
              {/* Player name input */}
              <div className="player-setup">
                <label htmlFor="player-name" className="input-label">
                  Enter Your Battle Name
                </label>
                <input
                  id="player-name"
                  type="text"
                  className="input player-name-input"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                  maxLength={20}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="input-hint">
                  Max 20 characters • This will be your display name in battle
                </div>
              </div>

              {/* Action buttons */}
              <div className="menu-actions">
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleStartGame}
                  disabled={!playerName.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner" />
                      Connecting...
                    </>
                  ) : (
                    'Enter Battle Arena'
                  )}
                </button>
                
                <div className="menu-secondary-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowInstructions(true)}
                  >
                    How to Play
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowCredits(true)}
                  >
                    About
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Feature highlights */}
        <div className="menu-features">
          <div className="feature-item">
            <div className="feature-icon">⚔️</div>
            <div className="feature-text">
              <div className="feature-title">AI Weapon Generation</div>
              <div className="feature-desc">Create unique weapons with natural language prompts</div>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🌀</div>
            <div className="feature-text">
              <div className="feature-title">Dynamic Physics</div>
              <div className="feature-desc">Master prompts change gravity, friction, and time</div>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <div className="feature-title">Real-time Combat</div>
              <div className="feature-desc">Fast-paced multiplayer battles with 60 FPS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>How to Play Pixel-Forge PvP</h3>
              <button className="modal-close" onClick={() => setShowInstructions(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="instruction-section">
                <h4>🎮 Controls</h4>
                <ul>
                  <li><strong>WASD</strong> - Move your character</li>
                  <li><strong>Mouse</strong> - Aim your weapons</li>
                  <li><strong>Left Click</strong> - Fire current weapon</li>
                  <li><strong>Number Keys</strong> - Switch between weapons</li>
                </ul>
              </div>
              
              <div className="instruction-section">
                <h4>⚔️ Weapon Generation</h4>
                <ul>
                  <li>Type a description in the weapon prompt box</li>
                  <li>Example: "fire sword", "ice cannon", "lightning bow"</li>
                  <li>AI generates unique weapons with stats and abilities</li>
                  <li>12-second cooldown between generations</li>
                </ul>
              </div>
              
              <div className="instruction-section">
                <h4>🌀 Master Prompts</h4>
                <ul>
                  <li>Special prompts that change game physics</li>
                  <li>Examples: "low gravity", "bouncy world", "slow motion"</li>
                  <li>Affects all players in the match</li>
                  <li>Auto-generated every 30-45 seconds</li>
                </ul>
              </div>
              
              <div className="instruction-section">
                <h4>🏆 Victory Conditions</h4>
                <ul>
                  <li>Last player standing wins</li>
                  <li>Matches last up to 90 seconds</li>
                  <li>Most damage if time runs out</li>
                  <li>Most kills in case of tie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCredits && (
        <div className="modal-overlay" onClick={() => setShowCredits(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>About Pixel-Forge PvP</h3>
              <button className="modal-close" onClick={() => setShowCredits(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="credits-section">
                <h4>🚀 Revolutionary Gaming</h4>
                <p>
                  Pixel-Forge PvP introduces a new gaming genre where AI-generated weapons 
                  and dynamic physics create unique gameplay experiences every match.
                </p>
              </div>
              
              <div className="credits-section">
                <h4>🔧 Technology Stack</h4>
                <ul>
                  <li><strong>Frontend:</strong> React + Phaser.js + TypeScript</li>
                  <li><strong>Backend:</strong> Python + FastAPI + WebSockets</li>
                  <li><strong>AI:</strong> Google Gemini 2.5 Flash Image</li>
                  <li><strong>Real-time:</strong> Authoritative server architecture</li>
                </ul>
              </div>
              
              <div className="credits-section">
                <h4>🎯 Hackathon Project</h4>
                <p>
                  Created for the Nano Banana Hackathon (September 2025) featuring 
                  Google's Gemini 2.5 Flash Image model for revolutionary gaming experiences.
                </p>
              </div>
              
              <div className="credits-section">
                <h4>⚡ Performance</h4>
                <ul>
                  <li>Sub-3-second weapon generation</li>
                  <li>60 FPS real-time multiplayer</li>
                  <li>Client-side prediction & rollback</li>
                  <li>Optimized for competitive play</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .main-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-y: auto;
          padding: var(--spacing-lg);
        }
        
        .menu-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 0, 255, 0.15) 0%, transparent 50%);
          animation: backgroundFlow 8s ease-in-out infinite alternate;
        }
        
        .menu-container {
          position: relative;
          z-index: 1;
          max-width: 600px;
          width: 100%;
          background: rgba(15, 15, 35, 0.9);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-xxl);
          backdrop-filter: blur(20px);
          box-shadow: 
            var(--shadow-glow),
            var(--shadow-card);
        }
        
        .menu-header {
          text-align: center;
          margin-bottom: var(--spacing-xxl);
        }
        
        .menu-title {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: var(--spacing-sm);
          text-shadow: 
            0 0 20px var(--primary-color),
            0 0 40px var(--primary-color);
        }
        
        .menu-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .menu-description {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .menu-content {
          margin-bottom: var(--spacing-xxl);
        }
        
        .player-setup {
          margin-bottom: var(--spacing-xl);
        }
        
        .input-label {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          text-align: center;
        }
        
        .player-name-input {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .input-hint {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
        }
        
        .menu-actions {
          text-align: center;
        }
        
        .btn-large {
          font-size: 1.3rem;
          padding: var(--spacing-lg) var(--spacing-xxl);
          margin-bottom: var(--spacing-lg);
          min-width: 250px;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: var(--spacing-sm);
        }
        
        .menu-secondary-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .menu-error {
          text-align: center;
          padding: var(--spacing-xl);
          background: rgba(255, 68, 68, 0.1);
          border: 2px solid var(--error-color);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xl);
        }
        
        .error-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }
        
        .menu-error h3 {
          color: var(--error-color);
          margin-bottom: var(--spacing-md);
        }
        
        .menu-error p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }
        
        .menu-features {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          padding-top: var(--spacing-xl);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        
        .feature-title {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .feature-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        /* Modal styles */
        .modal-overlay {
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
          padding: var(--spacing-lg);
          backdrop-filter: blur(5px);
        }
        
        .modal {
          background: rgba(15, 15, 35, 0.95);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-glow);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modal-header h3 {
          color: var(--primary-color);
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-sm);
          line-height: 1;
          transition: color var(--transition-fast);
        }
        
        .modal-close:hover {
          color: var(--text-primary);
        }
        
        .modal-content {
          padding: var(--spacing-lg);
        }
        
        .instruction-section,
        .credits-section {
          margin-bottom: var(--spacing-lg);
        }
        
        .instruction-section h4,
        .credits-section h4 {
          color: var(--secondary-color);
          margin-bottom: var(--spacing-sm);
          font-size: 1.1rem;
        }
        
        .instruction-section ul,
        .credits-section ul {
          margin-left: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }
        
        .instruction-section li,
        .credits-section li {
          margin-bottom: var(--spacing-xs);
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        .credits-section p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--spacing-md);
        }
        
        @keyframes backgroundFlow {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(5deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .menu-container {
            padding: var(--spacing-xl);
            margin: var(--spacing-md);
          }
          
          .menu-title {
            font-size: 2.5rem;
          }
          
          .feature-item {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-sm);
          }
          
          .menu-secondary-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .btn-large {
            min-width: auto;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .menu-background {
            animation: none;
          }
          
          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};