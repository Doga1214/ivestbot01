import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { RefreshIcon } from './Icons';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              bgcolor: '#111522',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 3
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f87171', mb: 1.5 }}>
              {this.props.fallbackTitle || 'Component Render Alert'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              An unexpected error occurred while loading this view. Click below to refresh and reload your data.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              startIcon={<RefreshIcon />}
              sx={{ fontWeight: 700, px: 3 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
