import React, { useState, useEffect, useRef } from 'react';

interface WeaponGenPanelProps {
  isVisible: boolean;
  cooldown: number;
  onGenerate: (prompt: string) => void;
  onToggle: () => void;
}

export const WeaponGenPanel: React.FC<WeaponGenPanelProps> = ({
  isVisible,
  cooldown,
  onGenerate,
  onToggle
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update cooldown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldown > 0) {
      setRemainingCooldown(Math.ceil((cooldown - Date.now()) / 1000));
      
      interval = setInterval(() => {
        const remaining = Math.ceil((cooldown - Date.now()) / 1000);
        setRemainingCooldown(Math.max(0, remaining));
        
        if (remaining <= 0) {
          setIsGenerating(false);
          clearInterval(interval);
        }
      }, 100);
    } else {
      setRemainingCooldown(0);
      setIsGenerating(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

  // Focus input when panel becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current && remainingCooldown === 0) {
      inputRef.current.focus();
    }
  }, [isVisible, remainingCooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || remainingCooldown > 0 || isGenerating) {
      return;
    }

    if (trimmedPrompt.length > 100) {
      return; // Too long
    }

    setIsGenerating(true);
    onGenerate(trimmedPrompt);
    setPrompt('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    'fire sword',
    'ice cannon',
    'lightning bow',
    'poison dagger',
    'wind staff',
    'crystal spear',
    'shadow bomb',
    'healing orb',
    'rocket launcher',
    'laser rifle'
  ];

  const getRandomExample = () => {
    return examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  };

  const insertExample = () => {
    const example = getRandomExample();
    setPrompt(example);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isVisible) {
    return (
      <div className="weapon-gen-toggle">
        <button 
          className="toggle-btn"
          onClick={onToggle}
          title="Open Weapon Generator"
        >
          ⚔️
        </button>
        
        <style jsx>{`
          .weapon-gen-toggle {
            position: absolute;
            bottom: var(--spacing-md);
            left: 50%;
            transform: translateX(-50%);
            z-index: 200;
          }
          
          .toggle-btn {
            background: rgba(15, 15, 35, 0.9);
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.5rem;
            color: var(--primary-color);
            transition: all var(--transition-fast);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-glow);
          }
          
          .toggle-btn:hover {
            transform: scale(1.1);
            background: rgba(0, 255, 255, 0.1);
          }
          
          @media (max-width: 768px) {
            .weapon-gen-toggle {
              bottom: var(--spacing-sm);
            }
            
            .toggle-btn {
              width: 50px;
              height: 50px;
              font-size: 1.2rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="weapon-gen-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="title-icon">⚔️</span>
          AI Weapon Generator
        </div>
        <button 
          className="close-btn"
          onClick={onToggle}
          title="Close Panel"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="gen-form">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your weapon... (e.g., fire sword, ice cannon)"
            className="weapon-input"
            maxLength={100}
            disabled={remainingCooldown > 0 || isGenerating}
          />
          
          <div className="input-actions">
            <button
              type="button"
              onClick={insertExample}
              className="example-btn"
              disabled={remainingCooldown > 0 || isGenerating}
              title="Insert random example"
            >
              🎲
            </button>
            
            <button
              type="submit"
              className={`generate-btn ${remainingCooldown > 0 || isGenerating ? 'disabled' : ''}`}
              disabled={remainingCooldown > 0 || isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner" />
                  Generating...
                </>
              ) : remainingCooldown > 0 ? (
                `Cooldown ${remainingCooldown}s`
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>

        <div className="char-counter">
          <span className={prompt.length > 80 ? 'warning' : ''}>
            {prompt.length}/100 characters
          </span>
        </div>
      </form>

      {remainingCooldown > 0 && (
        <div className="cooldown-bar-container">
          <div className="cooldown-label">Weapon Generation Cooldown</div>
          <div className="cooldown-bar">
            <div 
              className="cooldown-fill"
              style={{ 
                width: `${Math.max(0, (12 - remainingCooldown) / 12 * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      <div className="generation-tips">
        <div className="tips-title">💡 Generation Tips</div>
        <div className="tips-list">
          <div className="tip-item">
            • <strong>Be specific:</strong> "fire sword" vs "weapon"
          </div>
          <div className="tip-item">
            • <strong>Mix elements:</strong> "ice lightning bow"
          </div>
          <div className="tip-item">
            • <strong>Add effects:</strong> "explosive arrows", "healing staff"
          </div>
          <div className="tip-item">
            • <strong>Think creatively:</strong> "gravity hammer", "sound wave gun"
          </div>
        </div>
      </div>

      <div className="quick-examples">
        <div className="examples-title">Quick Examples</div>
        <div className="examples-grid">
          {examplePrompts.slice(0, 6).map((example, index) => (
            <button
              key={index}
              className="example-chip"
              onClick={() => setPrompt(example)}
              disabled={remainingCooldown > 0 || isGenerating}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .weapon-gen-panel {
          position: absolute;
          bottom: var(--spacing-md);
          left: var(--spacing-md);
          right: var(--spacing-md);
          background: rgba(15, 15, 35, 0.95);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-glow);
          max-width: 800px;
          margin: 0 auto;
          font-family: var(--font-primary);
          z-index: 200;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        
        .panel-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary-color);
        }
        
        .title-icon {
          font-size: 1.2rem;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--border-radius);
          transition: all var(--transition-fast);
        }
        
        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .gen-form {
          margin-bottom: var(--spacing-lg);
        }
        
        .input-container {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          align-items: stretch;
        }
        
        .weapon-input {
          flex: 1;
          font-size: 1rem;
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          background: rgba(0, 0, 0, 0.5);
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }
        
        .weapon-input:focus {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-glow);
        }
        
        .weapon-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .input-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .example-btn {
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          color: var(--text-primary);
          font-size: 1.2rem;
          width: 44px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .example-btn:hover:not(:disabled) {
          border-color: var(--secondary-color);
          background: rgba(255, 0, 255, 0.1);
        }
        
        .generate-btn {
          background: linear-gradient(45deg, var(--primary-color), #0088cc);
          border: none;
          border-radius: var(--border-radius);
          color: #000;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.9rem;
          padding: var(--spacing-sm) var(--spacing-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }
        
        .generate-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow), 0 4px 15px rgba(0, 255, 255, 0.4);
        }
        
        .generate-btn.disabled {
          background: rgba(128, 128, 128, 0.5);
          color: var(--text-muted);
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .char-counter {
          text-align: right;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .char-counter .warning {
          color: var(--warning-color);
        }
        
        .cooldown-bar-container {
          margin-bottom: var(--spacing-lg);
        }
        
        .cooldown-label {
          font-size: 0.9rem;
          color: var(--warning-color);
          margin-bottom: var(--spacing-sm);
          font-weight: 600;
        }
        
        .cooldown-bar {
          height: 6px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .cooldown-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--warning-color), var(--primary-color));
          transition: width var(--transition-fast);
          border-radius: 2px;
        }
        
        .generation-tips {
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tips-title {
          font-weight: 700;
          color: var(--success-color);
          margin-bottom: var(--spacing-sm);
          font-size: 0.9rem;
        }
        
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .tip-item {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        .quick-examples {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-md);
        }
        
        .examples-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          font-size: 0.9rem;
        }
        
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-sm);
        }
        
        .example-chip {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }
        
        .example-chip:hover:not(:disabled) {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: rgba(0, 255, 255, 0.05);
        }
        
        .example-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .weapon-gen-panel {
            left: var(--spacing-sm);
            right: var(--spacing-sm);
            bottom: var(--spacing-sm);
            padding: var(--spacing-md);
          }
          
          .input-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .input-actions {
            justify-content: stretch;
          }
          
          .generate-btn {
            flex: 1;
          }
          
          .examples-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: var(--spacing-xs);
          }
          
          .panel-title {
            font-size: 1rem;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }
          
          .generate-btn:hover:not(.disabled) {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};