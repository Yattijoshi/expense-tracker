/**
 * ErrorBoundary.jsx
 * Class-based React error boundary — the only place a class component
 * is justified (React doesn't yet expose this as a hook).
 * Catches render-time errors from any child and shows a friendly fallback UI.
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="glass-card p-10 max-w-md w-full text-center animate-fade-in">
            <div className="text-6xl mb-5">💥</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-1">An unexpected error occurred in the UI.</p>
            {this.state.error?.message && (
              <p className="text-gray-600 text-xs font-mono bg-surface-800 rounded-lg p-3 mt-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              className="btn-primary mt-6 w-full"
              onClick={this.handleReset}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
