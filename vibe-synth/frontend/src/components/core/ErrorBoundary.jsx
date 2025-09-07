import React from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString()
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to store
    const { handleError, trackEvent } = useVibeStore.getState().actions
    
    handleError(error, 'react_error_boundary', {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.fallback ? 'custom' : 'default',
      props: this.props
    })
    
    trackEvent('error_boundary_triggered', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    })
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    })
    
    const { trackEvent } = useVibeStore.getState().actions
    trackEvent('error_boundary_retry', {
      errorId: this.state.errorId,
      timestamp: Date.now()
    })
  }

  handleReload = () => {
    const { trackEvent } = useVibeStore.getState().actions
    trackEvent('error_boundary_reload', {
      errorId: this.state.errorId,
      timestamp: Date.now()
    })
    
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default error UI
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          level={this.props.level || 'component'}
        />
      )
    }

    return this.props.children
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry, onReload, level = 'component' }) => {
  const isAppLevel = level === 'app'
  
  return (
    <div className={`flex items-center justify-center p-8 ${
      isAppLevel ? 'min-h-screen bg-vibe-dark' : 'min-h-96 bg-gray-800/50 rounded-lg'
    }`}>
      <motion.div 
        className="text-center space-y-6 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Icon */}
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto"
          animate={{ 
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <div className="text-4xl">😵</div>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            {isAppLevel ? 'Oops! Something went wrong' : 'Component Error'}
          </h2>
          
          <p className="text-lg text-gray-300">
            {isAppLevel 
              ? "We're sorry, but something unexpected happened. Don't worry - your data is safe!"
              : "This section encountered an error, but the rest of the app is working fine."
            }
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-left">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg"
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Try Again
          </motion.button>

          {isAppLevel && (
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:shadow-lg"
              onClick={onReload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔃 Reload App
            </motion.button>
          )}
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left mt-6">
            <summary className="cursor-pointer text-gray-400 hover:text-white">
              🔧 Developer Info
            </summary>
            <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">Error Stack:</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
              {errorInfo && (
                <>
                  <h4 className="text-red-400 font-semibold mt-4 mb-2">Component Stack:</h4>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-400 space-y-2">
          <p>If this problem persists:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Try refreshing your browser</li>
            <li>Clear your browser cache</li>
            <li>Check your internet connection</li>
            {isAppLevel && <li>Try using a different browser</li>}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary 
      level={options.level || 'component'}
      fallback={options.fallback}
    >
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Specialized error boundaries for different parts of the app
export const AppErrorBoundary = ({ children }) => (
  <ErrorBoundary level="app">
    {children}
  </ErrorBoundary>
)

export const OnboardingErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    level="component"
    fallback={(error, retry) => (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <div className="text-4xl">⚠️</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Onboarding Error</h3>
            <p className="text-gray-300">
              Something went wrong during setup. Let's try again!
            </p>
          </div>
          
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg"
            onClick={retry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Restart Onboarding
          </motion.button>
        </motion.div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
)

export const AudioErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    level="component"
    fallback={(error, retry) => (
      <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg text-center">
        <div className="text-3xl mb-4">🎤❌</div>
        <h4 className="text-lg font-semibold text-white mb-2">Audio System Error</h4>
        <p className="text-gray-300 mb-4">The audio processing system encountered an error.</p>
        <motion.button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          onClick={retry}
          whileHover={{ scale: 1.05 }}
        >
          🔄 Restart Audio
        </motion.button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary