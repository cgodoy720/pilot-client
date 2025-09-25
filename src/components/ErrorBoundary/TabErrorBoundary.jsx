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
  Chip
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import './TabErrorBoundary.css';

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Tab Error Boundary (${this.props.tabName}) caught an error:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const { tabName = 'Tab' } = this.props;
      const isRetryable = retryCount < 2;

      return (
        <Box className="tab-error-boundary">
          <Card className="tab-error-boundary__card">
            <CardContent className="tab-error-boundary__content">
              <Box className="tab-error-boundary__header">
                <ErrorIcon className="tab-error-boundary__icon" />
                <Typography variant="h6" component="h3" className="tab-error-boundary__title">
                  {tabName} Error
                </Typography>
              </Box>

              <Alert severity="warning" className="tab-error-boundary__alert">
                <AlertTitle>This tab encountered an error</AlertTitle>
                The {tabName.toLowerCase()} tab failed to load. You can try refreshing it or continue using other tabs.
              </Alert>

              <Box className="tab-error-boundary__details">
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    label={`Retry: ${retryCount}/2`} 
                    size="small" 
                    variant="outlined"
                    color={isRetryable ? 'warning' : 'error'}
                    icon={<WarningIcon />}
                  />
                </Stack>

                {process.env.NODE_ENV === 'development' && error && (
                  <Box className="tab-error-boundary__debug">
                    <Typography variant="body2" component="pre" className="tab-error-boundary__error-text">
                      {error.message}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Stack direction="row" spacing={2} className="tab-error-boundary__actions">
                {isRetryable && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    className="tab-error-boundary__retry-btn"
                  >
                    Retry {tabName}
                  </Button>
                )}
              </Stack>

              <Box className="tab-error-boundary__help">
                <Typography variant="body2" color="text.secondary">
                  Other dashboard tabs should continue to work normally.
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

export default TabErrorBoundary;
