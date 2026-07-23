import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 React Global ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 64, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              An unexpected application error occurred. Don't worry, your data is safe.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: 150,
                  overflowY: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" color="error" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={this.handleReload}>
                Refresh Page
              </Button>
              <Button variant="outlined" color="secondary" onClick={this.handleGoHome}>
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
