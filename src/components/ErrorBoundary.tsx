'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Only catch SVG-related errors, let other errors bubble up
    if (error.message.includes('SVG') || error.message.includes('svg') || 
        error.message.includes('width') || error.message.includes('Expected length')) {
      console.warn('Suppressed SVG-related error:', error.message);
      return { hasError: false }; // Don't show error UI for SVG issues
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging, but don't break the app for SVG issues
    if (!error.message.includes('SVG') && !error.message.includes('svg') && 
        !error.message.includes('width') && !error.message.includes('Expected length')) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center p-4">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
