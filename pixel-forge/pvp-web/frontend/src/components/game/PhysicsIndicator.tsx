import React, { useState, useEffect } from 'react';
import { PhysicsModification } from '@/types/game';

interface PhysicsIndicatorProps {
  modifications: PhysicsModification[];
}

export const PhysicsIndicator: React.FC<PhysicsIndicatorProps> = ({ modifications }) => {
  const [currentMod, setCurrentMod] = useState<PhysicsModification | null>(null);
  const [visible, setVisible] = useState(false);

  // Find the most recent active modification
  useEffect(() => {
    const activeMods = modifications.filter(mod => 
      Date.now() < (mod.start_time + mod.duration) * 1000
    );

    if (activeMods.length > 0) {
      // Show the newest modification
      const newestMod = activeMods.reduce((newest, current) => 
        current.start_time > newest.start_time ? current : newest
      );
      
      if (newestMod !== currentMod) {
        setCurrentMod(newestMod);
        setVisible(true);
        
        // Hide after 3 seconds
        const timeout = setTimeout(() => {
          setVisible(false);
        }, 3000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [modifications, currentMod]);

  if (!currentMod || !visible) {
    return null;
  }

  const getModificationEmoji = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes('gravity')) {
      if (lower.includes('low') || lower.includes('zero')) return '🌙';
      if (lower.includes('high')) return '⬇️';
      if (lower.includes('reverse')) return '⬆️';
      return '🌍';
    }
    if (lower.includes('bouncy') || lower.includes('bounce')) return '🏀';
    if (lower.includes('ice') || lower.includes('slippery')) return '🧊';
    if (lower.includes('slow') || lower.includes('time')) return '🐌';
    if (lower.includes('speed') || lower.includes('fast')) return '⚡';
    if (lower.includes('sticky') || lower.includes('mud')) return '🕸️';
    if (lower.includes('weapon')) return '⚔️';
    return '🌀';
  };

  const getModificationColor = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes('gravity')) return 'var(--primary-color)';
    if (lower.includes('bouncy')) return 'var(--success-color)';
    if (lower.includes('ice')) return '#87CEEB';
    if (lower.includes('slow')) return 'var(--warning-color)';
    if (lower.includes('speed')) return 'var(--secondary-color)';
    if (lower.includes('sticky')) return '#8B4513';
    if (lower.includes('weapon')) return 'var(--error-color)';
    return 'var(--primary-color)';
  };

  const remainingTime = Math.max(0, 
    (currentMod.start_time + currentMod.duration) - Date.now() / 1000
  );

  return (
    <div className="physics-indicator">
      <div className="indicator-content">
        <div className="indicator-emoji">
          {getModificationEmoji(currentMod.description)}
        </div>
        <div className="indicator-text">
          <div className="indicator-title">PHYSICS MODIFIED</div>
          <div className="indicator-description">{currentMod.description}</div>
          <div className="indicator-timer">
            {Math.ceil(remainingTime)}s remaining
          </div>
        </div>
      </div>
      
      <div className="indicator-effects">
        {/* Particle effects could go here */}
        <div className="effect-particle effect-1" />
        <div className="effect-particle effect-2" />
        <div className="effect-particle effect-3" />
      </div>

      <style jsx>{`
        .physics-indicator {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5000;
          pointer-events: none;
          animation: slideDown var(--transition-slow) ease-out;
        }
        
        .indicator-content {
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid ${getModificationColor(currentMod.description)};
          border-radius: var(--border-radius);
          padding: var(--spacing-lg) var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 30px ${getModificationColor(currentMod.description)},
            var(--shadow-card);
          position: relative;
          overflow: hidden;
        }
        
        .indicator-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .indicator-emoji {
          font-size: 3rem;
          flex-shrink: 0;
          animation: bounce 1s ease-in-out infinite alternate;
        }
        
        .indicator-text {
          text-align: center;
          color: var(--text-primary);
        }
        
        .indicator-title {
          font-family: var(--font-mono);
          font-weight: 900;
          font-size: 1.2rem;
          color: ${getModificationColor(currentMod.description)};
          text-shadow: 0 0 10px ${getModificationColor(currentMod.description)};
          margin-bottom: var(--spacing-xs);
          letter-spacing: 2px;
        }
        
        .indicator-description {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          text-transform: uppercase;
        }
        
        .indicator-timer {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        
        .indicator-effects {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .effect-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${getModificationColor(currentMod.description)};
          border-radius: 50%;
          box-shadow: 0 0 10px ${getModificationColor(currentMod.description)};
        }
        
        .effect-1 {
          top: 20%;
          left: 10%;
          animation: float 3s ease-in-out infinite;
        }
        
        .effect-2 {
          top: 30%;
          right: 15%;
          animation: float 3s ease-in-out infinite reverse;
          animation-delay: 1s;
        }
        
        .effect-3 {
          bottom: 25%;
          left: 20%;
          animation: float 3s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes bounce {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-5px) scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .physics-indicator {
            top: 15%;
            left: var(--spacing-sm);
            right: var(--spacing-sm);
            transform: none;
          }
          
          .indicator-content {
            padding: var(--spacing-md);
            gap: var(--spacing-md);
            flex-direction: column;
            text-align: center;
          }
          
          .indicator-emoji {
            font-size: 2.5rem;
          }
          
          .indicator-title {
            font-size: 1rem;
          }
          
          .indicator-description {
            font-size: 1.2rem;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .indicator-content {
            background: #000000;
            border-width: 4px;
          }
          
          .effect-particle {
            display: none;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .physics-indicator {
            animation: none;
          }
          
          .indicator-content::before,
          .indicator-emoji,
          .effect-particle {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};