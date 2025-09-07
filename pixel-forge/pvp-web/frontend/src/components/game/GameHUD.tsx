import React from 'react';
import { PlayerState, Weapon, MatchState } from '@/types/game';

interface GameHUDProps {
  player: PlayerState | null;
  isAlive: boolean;
  health: number;
  weapons: Weapon[];
  currentMatch: MatchState | null;
  onPause: () => void;
  onWeaponSelect: (weaponId: string) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  isAlive,
  health,
  weapons,
  currentMatch,
  onPause,
  onWeaponSelect
}) => {
  const getHealthBarColor = (health: number) => {
    if (health > 75) return 'health-100';
    if (health > 50) return 'health-75';
    if (health > 25) return 'health-50';
    return 'health-25';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMatchDuration = () => {
    if (!currentMatch?.start_time) return 0;
    const now = Date.now() / 1000;
    return Math.max(0, 90 - (now - currentMatch.start_time)); // 90 second matches
  };

  return (
    <div className="game-hud">
      {/* Top Left - Player Info */}
      <div className="hud-section hud-top-left">
        <div className="player-info card">
          <div className="player-name">
            {player?.name || 'Unknown Player'}
            {!isAlive && <span className="death-indicator"> (ELIMINATED)</span>}
          </div>
          
          <div className="health-container">
            <div className="health-label">Health</div>
            <div className="health-bar">
              <div 
                className={`health-fill ${getHealthBarColor(health)}`}
                style={{ width: `${health}%` }}
              />
            </div>
            <div className="health-text">{health}/100</div>
          </div>
          
          {player && (
            <div className="player-stats">
              <div className="stat-item">
                <span className="stat-label">K:</span>
                <span className="stat-value">{player.kills}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">D:</span>
                <span className="stat-value">{player.deaths}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Center - Match Info */}
      <div className="hud-section hud-top-center">
        {currentMatch && (
          <div className="match-info card">
            <div className="match-timer">
              <div className="timer-label">Time Remaining</div>
              <div className="timer-value">
                {formatTime(getMatchDuration())}
              </div>
            </div>
            
            <div className="match-players">
              <div className="players-label">Players Alive</div>
              <div className="players-value">
                {currentMatch.players.filter(p => p.is_alive).length} / {currentMatch.players.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Right - Game Controls */}
      <div className="hud-section hud-top-right">
        <div className="game-controls card">
          <button 
            className="control-btn"
            onClick={onPause}
            title="Pause Game (ESC)"
          >
            ⏸️
          </button>
          
          <div className="control-hints">
            <div className="hint-item">
              <span className="hint-key">TAB</span>
              <span className="hint-desc">Stats</span>
            </div>
            <div className="hint-item">
              <span className="hint-key">L</span>
              <span className="hint-desc">Leaderboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Weapons */}
      {isAlive && weapons.length > 0 && (
        <div className="hud-section hud-bottom-left">
          <div className="weapons-panel card">
            <div className="weapons-title">Weapons ({weapons.length}/5)</div>
            <div className="weapons-list">
              {weapons.map((weapon, index) => (
                <div 
                  key={weapon.id}
                  className={`weapon-item ${index === 0 ? 'weapon-active' : ''}`}
                  onClick={() => onWeaponSelect(weapon.id)}
                  title={`${weapon.name} - ${weapon.properties.damage} DMG, ${weapon.properties.ammo} ammo`}
                >
                  <div className="weapon-number">{index + 1}</div>
                  <div className="weapon-info">
                    <div className="weapon-name">{weapon.name}</div>
                    <div className="weapon-stats">
                      <span className="weapon-stat">
                        ⚔️ {weapon.properties.damage}
                      </span>
                      <span className="weapon-stat">
                        🎯 {weapon.properties.ammo}
                      </span>
                    </div>
                  </div>
                  <div className="weapon-category">
                    {weapon.category.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right - Physics Info */}
      {currentMatch?.physics.active_modifications && currentMatch.physics.active_modifications.length > 0 && (
        <div className="hud-section hud-bottom-right">
          <div className="physics-panel card">
            <div className="physics-title">Active Modifications</div>
            <div className="physics-list">
              {currentMatch.physics.active_modifications
                .filter(mod => Date.now() < (mod.start_time + mod.duration) * 1000)
                .slice(0, 3) // Show max 3
                .map(mod => {
                  const remaining = Math.max(0, (mod.start_time + mod.duration) - Date.now() / 1000);
                  return (
                    <div key={mod.id} className="physics-item">
                      <div className="physics-name">{mod.description}</div>
                      <div className="physics-timer">{Math.ceil(remaining)}s</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .game-hud {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 100;
        }
        
        .hud-section {
          position: absolute;
          pointer-events: auto;
        }
        
        .hud-top-left {
          top: var(--spacing-md);
          left: var(--spacing-md);
        }
        
        .hud-top-center {
          top: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
        }
        
        .hud-top-right {
          top: var(--spacing-md);
          right: var(--spacing-md);
        }
        
        .hud-bottom-left {
          bottom: var(--spacing-md);
          left: var(--spacing-md);
        }
        
        .hud-bottom-right {
          bottom: var(--spacing-md);
          right: var(--spacing-md);
        }
        
        .card {
          background: rgba(15, 15, 35, 0.9);
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          backdrop-filter: blur(10px);
          font-family: var(--font-mono);
          font-size: 0.9rem;
        }
        
        /* Player Info */
        .player-info {
          min-width: 200px;
        }
        
        .player-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .death-indicator {
          color: var(--error-color);
          font-size: 0.8rem;
        }
        
        .health-container {
          margin-bottom: var(--spacing-sm);
        }
        
        .health-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .health-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: var(--spacing-xs);
          border: 1px solid var(--border-color);
        }
        
        .health-fill {
          height: 100%;
          transition: width var(--transition-fast);
          border-radius: 3px;
        }
        
        .health-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: right;
        }
        
        .player-stats {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .stat-label {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
        
        .stat-value {
          color: var(--text-primary);
          font-weight: 700;
        }
        
        /* Match Info */
        .match-info {
          text-align: center;
          min-width: 200px;
        }
        
        .timer-label,
        .players-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .timer-value {
          font-size: 1.2rem;
          color: var(--primary-color);
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
        }
        
        .players-value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 600;
        }
        
        /* Game Controls */
        .game-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .control-btn {
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid var(--border-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 1.2rem;
        }
        
        .control-btn:hover {
          border-color: var(--primary-color);
          background: rgba(0, 255, 255, 0.1);
        }
        
        .control-hints {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .hint-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .hint-key {
          background: rgba(0, 0, 0, 0.7);
          color: var(--primary-color);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }
        
        .hint-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        /* Weapons Panel */
        .weapons-panel {
          min-width: 300px;
          max-width: 400px;
        }
        
        .weapons-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          font-size: 0.9rem;
        }
        
        .weapons-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .weapon-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .weapon-item:hover {
          border-color: var(--primary-color);
          background: rgba(0, 255, 255, 0.05);
        }
        
        .weapon-active {
          border-color: var(--primary-color) !important;
          background: rgba(0, 255, 255, 0.1) !important;
          box-shadow: var(--shadow-glow);
        }
        
        .weapon-number {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        
        .weapon-info {
          flex: 1;
          min-width: 0;
        }
        
        .weapon-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.85rem;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .weapon-stats {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .weapon-stat {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }
        
        .weapon-category {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: right;
          flex-shrink: 0;
        }
        
        /* Physics Panel */
        .physics-panel {
          min-width: 200px;
        }
        
        .physics-title {
          font-weight: 700;
          color: var(--secondary-color);
          margin-bottom: var(--spacing-sm);
          font-size: 0.9rem;
        }
        
        .physics-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .physics-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs);
          background: rgba(255, 0, 255, 0.05);
          border: 1px solid rgba(255, 0, 255, 0.2);
          border-radius: var(--border-radius);
        }
        
        .physics-name {
          font-size: 0.8rem;
          color: var(--text-primary);
          font-weight: 600;
        }
        
        .physics-timer {
          font-size: 0.7rem;
          color: var(--secondary-color);
          font-weight: 700;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .hud-top-left,
          .hud-top-right,
          .hud-bottom-left,
          .hud-bottom-right {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
            bottom: auto;
            margin: var(--spacing-sm);
          }
          
          .hud-top-center {
            position: relative;
            transform: none;
            left: auto;
            top: auto;
            margin: var(--spacing-sm);
          }
          
          .weapons-panel {
            min-width: auto;
            max-width: none;
          }
          
          .weapon-item {
            padding: var(--spacing-xs);
          }
          
          .card {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
};