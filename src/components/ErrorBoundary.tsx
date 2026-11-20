import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('GlowBlocks crashed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash" role="alert">
          <h1>Something went wrong</h1>
          <p className="muted">GlowBlocks hit an unexpected error. Reloading usually fixes it.</p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
