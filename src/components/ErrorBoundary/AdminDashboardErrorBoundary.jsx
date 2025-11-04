import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import './AdminDashboardErrorBoundary.css';

class AdminDashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('AdminDashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Log to external service in production
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, this would send to an error tracking service
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.error('Error logged:', errorData);
    
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
    // errorTrackingService.captureException(error, { extra: errorData });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReportBug = () => {
    // Open bug report with error details
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    const bugReportUrl = `mailto:support@example.com?subject=Admin Dashboard Error&body=${encodeURIComponent(
      `Error ID: ${errorDetails.errorId}\n` +
      `Message: ${errorDetails.message}\n` +
      `Time: ${errorDetails.timestamp}\n` +
      `Retry Count: ${errorDetails.retryCount}\n\n` +
      `Please describe what you were doing when this error occurred:`
    )}`;

    window.open(bugReportUrl);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId, retryCount } = this.state;
      const isRetryable = retryCount < 3;

      return (
        <Box className="admin-dashboard-error-boundary">
          <Card className="admin-dashboard-error-boundary__card">
            <CardContent className="admin-dashboard-error-boundary__content">
              <Box className="admin-dashboard-error-boundary__header">
                <ErrorIcon className="admin-dashboard-error-boundary__icon" />
                <Typography variant="h5" component="h1" className="admin-dashboard-error-boundary__title">
                  Admin Dashboard Error
                </Typography>
              </Box>

              <Alert severity="error" className="admin-dashboard-error-boundary__alert">
                <AlertTitle>Something went wrong</AlertTitle>
                The admin dashboard encountered an unexpected error. This has been logged and our team will investigate.
              </Alert>

              <Box className="admin-dashboard-error-boundary__details">
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    label={`Error ID: ${errorId}`} 
                    size="small" 
                    variant="outlined" 
                    color="error"
                  />
                  <Chip 
                    label={`Retry: ${retryCount}/3`} 
                    size="small" 
                    variant="outlined"
                    color={isRetryable ? 'warning' : 'error'}
                  />
                </Stack>

                {process.env.NODE_ENV === 'development' && error && (
                  <Box className="admin-dashboard-error-boundary__debug">
                    <Typography variant="subtitle2" gutterBottom>
                      Debug Information:
                    </Typography>
                    <Typography variant="body2" component="pre" className="admin-dashboard-error-boundary__error-text">
                      {error.message}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={2} className="admin-dashboard-error-boundary__actions">
                {isRetryable && (
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    className="admin-dashboard-error-boundary__retry-btn"
                  >
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  className="admin-dashboard-error-boundary__home-btn"
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="text"
                  startIcon={<BugReportIcon />}
                  onClick={this.handleReportBug}
                  className="admin-dashboard-error-boundary__report-btn"
                >
                  Report Issue
                </Button>
              </Stack>

              <Box className="admin-dashboard-error-boundary__help">
                <Typography variant="body2" color="text.secondary">
                  If this problem persists, please contact support with the Error ID above.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AdminDashboardErrorBoundary;
