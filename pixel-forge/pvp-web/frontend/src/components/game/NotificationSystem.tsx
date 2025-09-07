import React, { useEffect } from 'react';
import { Notification } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface NotificationSystemProps {
  notifications: Notification[];
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  const { removeNotification } = useGameStore();

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timeRemaining = notification.duration - (Date.now() - notification.timestamp);
        if (timeRemaining > 0) {
          const timeout = setTimeout(() => {
            removeNotification(notification.id);
          }, timeRemaining);
          
          return () => clearTimeout(timeout);
        } else {
          // Already expired
          removeNotification(notification.id);
        }
      }
    });
  }, [notifications, removeNotification]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getNotificationClass = (type: Notification['type']) => {
    return `notification notification-${type}`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map((notification) => {
        const timeRemaining = notification.duration > 0 
          ? Math.max(0, notification.duration - (Date.now() - notification.timestamp))
          : 0;
        
        const progressPercent = notification.duration > 0 
          ? Math.max(0, (timeRemaining / notification.duration) * 100)
          : 0;

        return (
          <div
            key={notification.id}
            className={getNotificationClass(notification.type)}
          >
            <div className="notification-content">
              <span className="notification-icon">
                {getNotificationIcon(notification.type)}
              </span>
              <span className="notification-message">
                {notification.message}
              </span>
            </div>
            
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              title="Close notification"
            >
              ×
            </button>
            
            {notification.duration > 0 && (
              <div 
                className="notification-progress"
                style={{ width: `${progressPercent}%` }}
              />
            )}
          </div>
        );
      })}

      <style jsx>{`
        .notifications-container {
          position: fixed;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          max-width: 400px;
          pointer-events: none;
        }
        
        .notification {
          background: rgba(0, 0, 0, 0.9);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          color: var(--text-primary);
          font-family: var(--font-primary);
          box-shadow: var(--shadow-card);
          animation: slideInRight var(--transition-normal) ease-out;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          pointer-events: auto;
          min-width: 300px;
        }
        
        .notification-success {
          border: 2px solid var(--success-color);
          background: rgba(0, 255, 136, 0.05);
        }
        
        .notification-error {
          border: 2px solid var(--error-color);
          background: rgba(255, 68, 68, 0.05);
        }
        
        .notification-warning {
          border: 2px solid var(--warning-color);
          background: rgba(255, 170, 0, 0.05);
        }
        
        .notification-info {
          border: 2px solid var(--primary-color);
          background: rgba(0, 255, 255, 0.05);
        }
        
        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          margin-right: var(--spacing-lg);
        }
        
        .notification-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 1px;
        }
        
        .notification-message {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .notification-close {
          position: absolute;
          top: var(--spacing-xs);
          right: var(--spacing-xs);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.4rem;
          padding: var(--spacing-xs);
          line-height: 1;
          transition: color var(--transition-fast);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-close:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .notification-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--primary-color);
          transition: width linear 0.1s;
          opacity: 0.7;
        }
        
        .notification-success .notification-progress {
          background: var(--success-color);
        }
        
        .notification-error .notification-progress {
          background: var(--error-color);
        }
        
        .notification-warning .notification-progress {
          background: var(--warning-color);
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .notifications-container {
            top: var(--spacing-sm);
            right: var(--spacing-sm);
            left: var(--spacing-sm);
            max-width: none;
          }
          
          .notification {
            min-width: auto;
            margin-bottom: var(--spacing-xs);
          }
          
          .notification-content {
            margin-right: var(--spacing-xl);
          }
          
          .notification-message {
            font-size: 0.85rem;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .notification {
            background: #000000;
            border-width: 3px;
          }
          
          .notification-close {
            background: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .notification {
            animation: none;
          }
          
          .notification-progress {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};