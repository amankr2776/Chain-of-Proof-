import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white shadow-app rounded-2xl border border-red-500/30 text-[#2A1B24] space-y-4 font-mono">
          <div className="flex items-center gap-3 text-red-600 border-b border-red-200 pb-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-black uppercase tracking-tight">
              {this.props.fallbackTitle || 'RUNTIME VIEW ERROR ENCOUNTERED'}
            </h2>
          </div>

          <p className="text-xs font-sans text-[#2A1B24]/80 leading-relaxed">
            An unexpected view rendering anomaly occurred. The system isolated the exception to prevent workspace disruption.
          </p>

          {this.state.error && (
            <div className="p-3 bg-[#181016] text-red-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-red-900/50">
              {this.state.error.toString()}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#2A1B24] text-[#EAEBEE] hover:bg-[#F59E0B] hover:text-[#2A1B24] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-app flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RECOVER VIEW STATE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
