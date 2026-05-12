// src/views/CompanySettings/EmailIntegration.jsx
import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, TextField, 
  Button, Box, Alert, Snackbar, CircularProgress 
} from '@mui/material';

const EmailIntegration = ({ onSave }) => {
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '465',
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    mailFrom: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load existing config on mount
  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch('/api/email/config');
      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        const config = data.data;
        setEmailConfig({
          smtpHost: config.smtpHost || 'smtp.gmail.com',
          smtpPort: config.smtpPort || '465',
          smtpSecure: config.smtpSecure !== undefined ? config.smtpSecure : true,
          smtpUser: config.smtpUser || '',
          smtpPass: '',
          mailFrom: config.mailFrom || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEmailConfig({
      ...emailConfig,
      [e.target.name]: value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnackbar({ 
          open: true, 
          message: 'Email configuration saved successfully!', 
          severity: 'success' 
        });
        if (onSave) onSave(data.data);
        setEmailConfig(prev => ({ ...prev, smtpPass: '' }));
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error saving configuration', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailConfig.smtpUser || !emailConfig.smtpPass) {
      setSnackbar({ 
        open: true, 
        message: 'Please enter SMTP Username and Password first', 
        severity: 'warning' 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: emailConfig.smtpUser, 
          config: emailConfig 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnackbar({ 
          open: true, 
          message: 'Test email sent successfully! Check your inbox.', 
          severity: 'success' 
        });
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error sending test email', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Email Integration Configuration
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                name="smtpHost"
                value={emailConfig.smtpHost}
                onChange={handleChange}
                helperText="e.g., smtp.gmail.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                name="smtpPort"
                value={emailConfig.smtpPort}
                onChange={handleChange}
                helperText="e.g., 465 for SSL, 587 for TLS"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username/Email"
                name="smtpUser"
                value={emailConfig.smtpUser}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                name="smtpPass"
                value={emailConfig.smtpPass}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email Address"
                name="mailFrom"
                value={emailConfig.mailFrom}
                onChange={handleChange}
                helperText="Email address that will appear in 'From' field"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Note:</strong> For Gmail, enable 2-Factor Authentication and use App Password.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleTestEmail}
                  disabled={loading || !emailConfig.smtpUser || !emailConfig.smtpPass}
                >
                  {loading ? 'Sending...' : 'Send Test Email'}
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EmailIntegration;