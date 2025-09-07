import React from 'react';
import { useGameStore } from '@/store/gameStore';

interface GameStatsProps {
  onClose: () => void;
}

export const GameStats: React.FC<GameStatsProps> = ({ onClose }) => {
  const { gameStats, connectionStatus, currentMatch } = useGameStore();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'var(--success-color)';
      case 'connecting': return 'var(--warning-color)';
      case 'reconnecting': return 'var(--warning-color)';
      case 'disconnected': return 'var(--error-color)';
      case 'error': return 'var(--error-color)';
      default: return 'var(--text-secondary)';
    }
  };

  const getPingColor = (ping: number) => {
    if (ping < 50) return 'var(--success-color)';
    if (ping < 100) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'var(--success-color)';
    if (fps >= 30) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  return (
    <div className="stats-overlay">
      <div className="stats-panel">
        <div className="stats-header">
          <h3>Game Statistics</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            title="Close Stats"
          >
            ×
          </button>
        </div>

        <div className="stats-content">
          {/* Network Stats */}
          <div className="stats-section">
            <h4 className="section-title">Network</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span 
                  className="stat-value"
                  style={{ color: getConnectionStatusColor(connectionStatus) }}
                >
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ping</span>
                <span 
                  className="stat-value"
                  style={{ color: getPingColor(gameStats.ping) }}
                >
                  {gameStats.ping}ms
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Packets Sent</span>
                <span className="stat-value">{gameStats.packetsSent}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Packets Received</span>
                <span className="stat-value">{gameStats.packetsReceived}</span>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="stats-section">
            <h4 className="section-title">Performance</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">FPS</span>
                <span 
                  className="stat-value"
                  style={{ color: getFPSColor(gameStats.fps) }}
                >
                  {Math.round(gameStats.fps)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Interpolation Delay</span>
                <span className="stat-value">{gameStats.interpolationDelay}ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Memory Usage</span>
                <span className="stat-value">
                  {(performance as any).memory 
                    ? formatBytes((performance as any).memory.usedJSHeapSize)
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Connection Time</span>
                <span className="stat-value">
                  {Math.round(performance.now() / 1000)}s
                </span>
              </div>
            </div>
          </div>

          {/* Match Stats */}
          {currentMatch && (
            <div className="stats-section">
              <h4 className="section-title">Match</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Match ID</span>
                  <span className="stat-value mono">{currentMatch.id.slice(-8)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className="stat-value">{currentMatch.status.toUpperCase()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Players</span>
                  <span className="stat-value">
                    {currentMatch.players.filter(p => p.is_alive).length} / {currentMatch.players.length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">
                    {Math.round((currentMatch.start_time ? Date.now()/1000 - currentMatch.start_time : 0))}s
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Projectiles</span>
                  <span className="stat-value">{currentMatch.projectiles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Physics Mods</span>
                  <span className="stat-value">
                    {currentMatch.physics.active_modifications.filter(mod => 
                      Date.now() < (mod.start_time + mod.duration) * 1000
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Physics Stats */}
          {currentMatch?.physics && (
            <div className="stats-section">
              <h4 className="section-title">Physics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Gravity</span>
                  <span className="stat-value">{Math.round(currentMatch.physics.gravity)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Friction</span>
                  <span className="stat-value">{currentMatch.physics.friction.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Restitution</span>
                  <span className="stat-value">{currentMatch.physics.restitution.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Time Scale</span>
                  <span className="stat-value">{currentMatch.physics.time_scale.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="stats-footer">
          <div className="footer-note">
            Press <kbd>TAB</kbd> to toggle stats • Updates every 100ms
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-overlay {
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
        
        .stats-panel {
          background: rgba(15, 15, 35, 0.95);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-glow);
          font-family: var(--font-mono);
        }
        
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stats-header h3 {
          color: var(--primary-color);
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
        
        .stats-content {
          padding: var(--spacing-lg);
        }
        
        .stats-section {
          margin-bottom: var(--spacing-xl);
        }
        
        .stats-section:last-child {
          margin-bottom: 0;
        }
        
        .section-title {
          color: var(--secondary-color);
          font-size: 1rem;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-xs);
          border-bottom: 1px solid rgba(255, 0, 255, 0.2);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--spacing-sm);
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .stat-label {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        
        .stat-value {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.9rem;
        }
        
        .stat-value.mono {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
        }
        
        .stats-footer {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
        
        .footer-note {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .footer-note kbd {
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          color: var(--primary-color);
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-panel {
            margin: var(--spacing-sm);
            max-height: 90vh;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-header,
          .stats-content,
          .stats-footer {
            padding: var(--spacing-md);
          }
          
          .section-title {
            font-size: 0.9rem;
          }
          
          .stat-item {
            padding: var(--spacing-xs) var(--spacing-sm);
          }
        }
        
        /* Scrollbar styling */
        .stats-panel::-webkit-scrollbar {
          width: 8px;
        }
        
        .stats-panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        .stats-panel::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 4px;
        }
        
        .stats-panel::-webkit-scrollbar-thumb:hover {
          background: var(--secondary-color);
        }
      `}</style>
    </div>
  );
};