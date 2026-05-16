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

  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_BASE = 'http://localhost:5050/api/email';

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch(`${API_BASE}/config`);
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
    if (!emailConfig.smtpHost || !emailConfig.smtpPort || !emailConfig.smtpUser || !emailConfig.smtpPass || !emailConfig.mailFrom) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'warning' });
      return;
    }

    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnackbar({ open: true, message: '✅ Configuration saved successfully!', severity: 'success' });
        if (onSave) onSave(data.data);
        setEmailConfig(prev => ({ ...prev, smtpPass: '' }));
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSnackbar({ open: true, message: '❌ ' + error.message, severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailConfig.smtpUser || !emailConfig.smtpPass) {
      setSnackbar({ open: true, message: '⚠️ Please enter SMTP Email and Password first', severity: 'warning' });
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(`${API_BASE}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailConfig.smtpUser, config: emailConfig })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnackbar({ open: true, message: '✅ Test email sent! Check your inbox.', severity: 'success' });
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setSnackbar({ open: true, message: '❌ ' + error.message, severity: 'error' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      <Typography variant="h5" sx={{ mb: 2 }}>📧 Email Integration Configuration</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Host" name="smtpHost" value={emailConfig.smtpHost} onChange={handleChange} helperText="e.g., smtp.gmail.com" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Port" name="smtpPort" value={emailConfig.smtpPort} onChange={handleChange} helperText="e.g., 465 for SSL, 587 for TLS" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Username/Email" name="smtpUser" value={emailConfig.smtpUser} onChange={handleChange} placeholder="your-email@gmail.com" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Password" type="password" name="smtpPass" value={emailConfig.smtpPass} onChange={handleChange} placeholder="App Password for Gmail" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="From Email Address" name="mailFrom" value={emailConfig.mailFrom} onChange={handleChange} helperText="Email address that will appear in 'From' field" />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>🔐 Note:</strong> For Gmail, enable 2-Factor Authentication and use App Password (16 digits).
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleTestEmail} disabled={testLoading || saveLoading || !emailConfig.smtpUser || !emailConfig.smtpPass}>
                  {testLoading ? 'Sending...' : '📧 Send Test Email'}
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={saveLoading || testLoading}>
                  {saveLoading ? 'Saving...' : '💾 Save Configuration'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={5050} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EmailIntegration;