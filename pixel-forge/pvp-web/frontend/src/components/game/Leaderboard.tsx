import React from 'react';
import { PlayerState } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface LeaderboardProps {
  players: PlayerState[];
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, onClose }) => {
  const { playerId } = useGameStore();

  // Sort players by score (kills, then health, then lowest deaths)
  const sortedPlayers = [...players].sort((a, b) => {
    // First by kills (descending)
    if (b.kills !== a.kills) {
      return b.kills - a.kills;
    }
    
    // Then by health (descending)
    if (b.health !== a.health) {
      return b.health - a.health;
    }
    
    // Then by deaths (ascending)
    if (a.deaths !== b.deaths) {
      return a.deaths - b.deaths;
    }
    
    // Finally by name (alphabetical)
    return a.name.localeCompare(b.name);
  });

  const getPlayerRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getPlayerStatusIcon = (player: PlayerState) => {
    if (!player.is_alive) return '💀';
    if (player.health > 75) return '💚';
    if (player.health > 50) return '💛';
    if (player.health > 25) return '🧡';
    return '❤️';
  };

  const calculateKDR = (kills: number, deaths: number) => {
    if (deaths === 0) return kills === 0 ? '0.00' : '∞';
    return (kills / deaths).toFixed(2);
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-panel">
        <div className="leaderboard-header">
          <h3>Leaderboard</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            title="Close Leaderboard"
          >
            ×
          </button>
        </div>

        <div className="leaderboard-content">
          {sortedPlayers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-text">No players in match</div>
            </div>
          ) : (
            <div className="players-list">
              {sortedPlayers.map((player, index) => {
                const rank = index + 1;
                const isCurrentPlayer = player.id === playerId;
                const isWinner = rank === 1 && players.filter(p => p.is_alive).length <= 1;
                
                return (
                  <div 
                    key={player.id}
                    className={`player-row ${isCurrentPlayer ? 'current-player' : ''} ${isWinner ? 'winner' : ''}`}
                  >
                    <div className="player-rank">
                      <span className="rank-display">
                        {getPlayerRankEmoji(rank)}
                      </span>
                    </div>
                    
                    <div className="player-info">
                      <div className="player-name-section">
                        <span className="player-status">
                          {getPlayerStatusIcon(player)}
                        </span>
                        <span className="player-name">
                          {player.name}
                          {isCurrentPlayer && <span className="you-indicator"> (YOU)</span>}
                        </span>
                      </div>
                      
                      <div className="player-health">
                        <div className="health-bar-small">
                          <div 
                            className="health-fill-small"
                            style={{ width: `${player.health}%` }}
                          />
                        </div>
                        <span className="health-text">{player.health}</span>
                      </div>
                    </div>
                    
                    <div className="player-stats">
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">K</span>
                          <span className="stat-value kills">{player.kills}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">D</span>
                          <span className="stat-value deaths">{player.deaths}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">KDR</span>
                          <span className="stat-value kdr">{calculateKDR(player.kills, player.deaths)}</span>
                        </div>
                      </div>
                      
                      <div className="weapon-count">
                        <span className="weapon-icon">⚔️</span>
                        <span className="weapon-count-text">{player.weapons.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <div className="footer-stats">
            <div className="total-players">
              <span className="label">Players:</span>
              <span className="value">{players.length}</span>
            </div>
            <div className="alive-players">
              <span className="label">Alive:</span>
              <span className="value">{players.filter(p => p.is_alive).length}</span>
            </div>
            <div className="total-kills">
              <span className="label">Total Kills:</span>
              <span className="value">{players.reduce((sum, p) => sum + p.kills, 0)}</span>
            </div>
          </div>
          
          <div className="footer-note">
            Press <kbd>L</kbd> to toggle leaderboard
          </div>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9000;
          backdrop-filter: blur(5px);
          padding: var(--spacing-md);
        }
        
        .leaderboard-panel {
          background: rgba(15, 15, 35, 0.95);
          border: 2px solid var(--secondary-color);
          border-radius: var(--border-radius);
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-glow-pink);
          font-family: var(--font-mono);
        }
        
        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid rgba(255, 0, 255, 0.2);
        }
        
        .leaderboard-header h3 {
          color: var(--secondary-color);
          margin: 0;
          font-size: 1.2rem;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--border-radius);
          transition: all var(--transition-fast);
        }
        
        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .leaderboard-content {
          padding: var(--spacing-lg);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--spacing-xxl);
          color: var(--text-muted);
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }
        
        .empty-text {
          font-size: 1.1rem;
        }
        
        .players-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .player-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          transition: all var(--transition-fast);
        }
        
        .player-row:hover {
          background: rgba(0, 0, 0, 0.5);
        }
        
        .current-player {
          border-color: var(--primary-color) !important;
          background: rgba(0, 255, 255, 0.05) !important;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }
        
        .winner {
          border-color: var(--success-color) !important;
          background: rgba(0, 255, 136, 0.05) !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
        }
        
        .player-rank {
          flex-shrink: 0;
          width: 40px;
          text-align: center;
        }
        
        .rank-display {
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .player-info {
          flex: 1;
          min-width: 0;
        }
        
        .player-name-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
        }
        
        .player-status {
          font-size: 1rem;
        }
        
        .player-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .you-indicator {
          color: var(--primary-color);
          font-size: 0.75rem;
          font-weight: 700;
        }
        
        .player-health {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .health-bar-small {
          flex: 1;
          height: 4px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .health-fill-small {
          height: 100%;
          background: linear-gradient(90deg, var(--error-color), var(--warning-color), var(--success-color));
          transition: width var(--transition-fast);
        }
        
        .health-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          min-width: 30px;
          text-align: right;
        }
        
        .player-stats {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          flex-shrink: 0;
        }
        
        .stat-group {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 30px;
        }
        
        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1;
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 0.9rem;
          line-height: 1.2;
        }
        
        .kills {
          color: var(--success-color);
        }
        
        .deaths {
          color: var(--error-color);
        }
        
        .kdr {
          color: var(--text-primary);
        }
        
        .weapon-count {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: rgba(255, 255, 255, 0.05);
          padding: var(--spacing-xs);
          border-radius: var(--border-radius);
        }
        
        .weapon-icon {
          font-size: 0.8rem;
        }
        
        .weapon-count-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .leaderboard-footer {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid rgba(255, 0, 255, 0.2);
        }
        
        .footer-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);
        }
        
        .footer-stats > div {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .footer-stats .label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .footer-stats .value {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.85rem;
        }
        
        .footer-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .footer-note kbd {
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          color: var(--secondary-color);
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .leaderboard-panel {
            margin: var(--spacing-sm);
            max-height: 90vh;
          }
          
          .leaderboard-header,
          .leaderboard-content,
          .leaderboard-footer {
            padding: var(--spacing-md);
          }
          
          .player-row {
            flex-wrap: wrap;
            gap: var(--spacing-sm);
          }
          
          .player-stats {
            gap: var(--spacing-sm);
          }
          
          .stat-group {
            gap: var(--spacing-xs);
          }
          
          .footer-stats {
            flex-wrap: wrap;
            gap: var(--spacing-sm);
          }
        }
        
        /* Scrollbar styling */
        .leaderboard-panel::-webkit-scrollbar {
          width: 8px;
        }
        
        .leaderboard-panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        .leaderboard-panel::-webkit-scrollbar-thumb {
          background: var(--secondary-color);
          border-radius: 4px;
        }
        
        .leaderboard-panel::-webkit-scrollbar-thumb:hover {
          background: var(--primary-color);
        }
      `}</style>
    </div>
  );
};