import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message: string;
  progress?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  progress = 0, 
  canCancel = false, 
  onCancel 
}) => {
  const [dots, setDots] = useState('');
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(100, progress));
    const increment = (targetProgress - animatedProgress) / 20;
    
    if (Math.abs(targetProgress - animatedProgress) > 0.1) {
      const timeout = setTimeout(() => {
        setAnimatedProgress(prev => prev + increment);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [progress, animatedProgress]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Logo */}
        <div className="loading-logo glow-primary">
          PIXEL-FORGE
        </div>
        
        {/* Subtitle */}
        <div className="loading-subtitle">
          Revolutionary AI Combat Arena
        </div>
        
        {/* Message with animated dots */}
        <div className="loading-message">
          {message}{dots}
        </div>
        
        {/* Progress bar */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
          <div className="loading-progress-text">
            {Math.round(animatedProgress)}%
          </div>
        </div>
        
        {/* Cancel button */}
        {canCancel && onCancel && (
          <button 
            className="btn btn-outline loading-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        
        {/* Loading animation */}
        <div className="loading-animation">
          <div className="loading-orb loading-orb-1" />
          <div className="loading-orb loading-orb-2" />
          <div className="loading-orb loading-orb-3" />
        </div>
      </div>
      
      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 50%, #000000 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
        }
        
        .loading-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
          animation: backgroundPulse 4s ease-in-out infinite alternate;
        }
        
        .loading-content {
          text-align: center;
          z-index: 1;
          position: relative;
          max-width: 500px;
          padding: var(--spacing-xxl);
        }
        
        .loading-logo {
          font-family: var(--font-mono);
          font-size: 4rem;
          font-weight: 900;
          color: var(--primary-color);
          margin-bottom: var(--spacing-lg);
          text-shadow: 
            0 0 20px var(--primary-color),
            0 0 40px var(--primary-color),
            0 0 60px var(--primary-color);
          animation: logoGlow 3s ease-in-out infinite alternate;
        }
        
        .loading-subtitle {
          font-family: var(--font-mono);
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xxl);
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0.8;
        }
        
        .loading-message {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xl);
          min-height: 2rem;
          font-weight: 600;
        }
        
        .loading-progress-container {
          margin-bottom: var(--spacing-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .loading-progress-bar {
          width: 100%;
          max-width: 400px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(0, 255, 255, 0.3);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        .loading-progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--primary-color),
            var(--secondary-color),
            var(--primary-color)
          );
          background-size: 200% 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
          animation: progressShimmer 2s linear infinite;
          box-shadow: 
            0 0 10px var(--primary-color),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        .loading-progress-text {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        
        .loading-cancel {
          margin-top: var(--spacing-lg);
          min-width: 120px;
        }
        
        .loading-animation {
          position: relative;
          height: 60px;
          margin-top: var(--spacing-xxl);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .loading-orb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary-color);
          box-shadow: 0 0 20px var(--primary-color);
          animation: orbPulse 1.5s ease-in-out infinite;
        }
        
        .loading-orb-2 {
          background: var(--secondary-color);
          box-shadow: 0 0 20px var(--secondary-color);
          animation-delay: 0.5s;
        }
        
        .loading-orb-3 {
          background: var(--success-color);
          box-shadow: 0 0 20px var(--success-color);
          animation-delay: 1s;
        }
        
        @keyframes backgroundPulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
        
        @keyframes logoGlow {
          0% { 
            text-shadow: 
              0 0 20px var(--primary-color),
              0 0 40px var(--primary-color),
              0 0 60px var(--primary-color);
          }
          100% { 
            text-shadow: 
              0 0 30px var(--primary-color),
              0 0 60px var(--primary-color),
              0 0 90px var(--primary-color);
          }
        }
        
        @keyframes progressShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes orbPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .loading-logo {
            font-size: 3rem;
          }
          
          .loading-message {
            font-size: 1.2rem;
          }
          
          .loading-content {
            padding: var(--spacing-xl);
          }
          
          .loading-progress-bar {
            max-width: 300px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .loading-logo,
          .loading-progress-fill,
          .loading-orb {
            animation: none;
          }
          
          .loading-screen::before {
            animation: none;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};