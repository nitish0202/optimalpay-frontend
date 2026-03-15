import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Component } from 'react';
import { AuthGuard } from './components/auth/AuthGuard';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Recommend } from './pages/Recommend';
import { Results } from './pages/Results';
import type { ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace' }}>
          <h2 style={{ color: '#dc2626' }}>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#374151', fontSize: 13 }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: 16, padding: '8px 16px' }}>
            Go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Protected({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/wallet" element={<Protected><Wallet /></Protected>} />
          <Route path="/recommend" element={<Protected><Recommend /></Protected>} />
          <Route path="/results" element={<Protected><Results /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
