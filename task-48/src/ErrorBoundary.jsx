import { Component } from "react";
import { reportError } from "./errorReporting.js";

/**
 * A reusable class-based error boundary (error boundaries must be class
 * components in React — there's no hook equivalent as of React 18/19).
 * Supports:
 *  - a customizable fallback renderer (receives the error + a reset fn)
 *  - reporting to an error-tracking service on catch
 *  - a `resetKeys` prop: changing any value in this array (e.g. a route id)
 *    automatically resets the boundary, so navigating away from a broken
 *    view doesn't leave it permanently stuck in an error state
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    reportError(error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.name || "unnamed",
    });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.error &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys[i])
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      return (
        <div className="error-fallback">
          <div className="error-fallback-icon">⚠️</div>
          <div className="error-fallback-title">This section couldn't load</div>
          <div className="error-fallback-msg">{this.state.error.message}</div>
          <button className="btn secondary" onClick={this.reset}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** HOC form, for wrapping components without changing call-site JSX structure. */
export function withErrorBoundary(WrappedComponent, boundaryProps = {}) {
  function Wrapped(props) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }
  Wrapped.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return Wrapped;
}
