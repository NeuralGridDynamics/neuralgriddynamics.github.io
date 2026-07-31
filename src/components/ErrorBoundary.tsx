import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Neural Grid Dynamics App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear local storage', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-gray-900 border border-rose-900/50 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-rose-950/50 border border-rose-800/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">Neural Grid Dynamics Exception</h1>
              <p className="text-xs text-gray-400">
                An unexpected application error occurred while loading application state.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-28">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-rose-950 hover:text-rose-300 text-gray-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Cache & Storage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as unknown as { props: Props }).props.children;
  }
}
