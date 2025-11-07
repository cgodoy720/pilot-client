import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import BasePromptsTab from './components/BasePromptsTab';
import PersonasTab from './components/PersonasTab';
import ProgramContextsTab from './components/ProgramContextsTab';
import ModesTab from './components/ModesTab';
import ContentGenerationPromptsTab from './components/ContentGenerationPromptsTab';
import StatusTab from './components/StatusTab';
import './AdminPrompts.css';

const AdminPrompts = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const reloadPrompts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/reload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Prompts reloaded successfully');
      } else {
        throw new Error('Failed to reload prompts');
      }
    } catch (error) {
      console.error('Error reloading prompts:', error);
      showNotification('Failed to reload prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-prompts">
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        className="admin-prompts__tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Base Prompts" />
        <Tab label="Personas" />
        <Tab label="Program Contexts" />
        <Tab label="Modes" />
        <Tab label="Content Generation" />
        <Tab label="Current AI Prompt" />
      </Tabs>

      <div className="admin-prompts__tab-content">
        {currentTab === 0 && (
          <BasePromptsTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
        {currentTab === 1 && (
          <PersonasTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
        {currentTab === 2 && (
          <ProgramContextsTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
        {currentTab === 3 && (
          <ModesTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
        {currentTab === 4 && (
          <ContentGenerationPromptsTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
        {currentTab === 5 && (
          <StatusTab 
            showNotification={showNotification}
            reloadPrompts={reloadPrompts}
          />
        )}
      </div>

      {/* Global loading overlay */}
      {loading && (
        <Box className="admin-prompts__loading-overlay">
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Reloading prompts...
          </Typography>
        </Box>
      )}

      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminPrompts;
