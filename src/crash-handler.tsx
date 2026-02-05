import { Component, type ComponentChildren, type ErrorInfo } from 'preact';

interface CrashState {
  error?: unknown;
  errorInfo?: ErrorInfo;
}

export class CrashHandler extends Component<
  { children: ComponentChildren },
  CrashState
> {
  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render(props: { children: ComponentChildren }, state: CrashState) {
    if (state.error) {
      return (
        <div style={{ color: 'red' }}>
          <h1>Something went wrong</h1>
          <pre>{String(state.error)}</pre>
        </div>
      );
    }

    return props.children;
  }
}
