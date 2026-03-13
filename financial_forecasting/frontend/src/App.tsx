import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Pipeline from './pages/Pipeline';
import Revenue from './pages/Revenue';
import Cleanup from './pages/Cleanup';
import NewOpportunity from './pages/NewOpportunity';
import PaymentSchedule from './pages/PaymentSchedule';
import Settings from './pages/Settings';
import SalesforceCallback from './pages/SalesforceCallback';
import WeeklyPriorities from './pages/WeeklyPriorities';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
  },
});

// Create React Query client with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,       // Don't refetch when component remounts if data is fresh
      staleTime: 5 * 60 * 1000,   // Data is "fresh" for 5 minutes (won't refetch)
      cacheTime: 30 * 60 * 1000,  // Keep unused data in memory for 30 min
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/callback" element={<SalesforceCallback />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Navigate to="/overview" replace />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Overview />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Pipeline />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Revenue />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cleanup"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Cleanup />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NewOpportunity />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-schedule/:opportunityId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PaymentSchedule />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weekly-priorities"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <WeeklyPriorities />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

