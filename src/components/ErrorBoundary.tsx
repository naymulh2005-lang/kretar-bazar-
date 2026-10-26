import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught by Application ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-800">
              কিছু একটি অপ্রত্যাশিত সমস্যা হয়েছে
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              দয়া করে পেজটি আবার রিলোড করুন। আপনার কোনো সংরক্ষিত ডেটা বা শপিং কার্ট মুছে যায়নি।
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পেজ রিলোড করুন (Reload Page)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
