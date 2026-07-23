import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', py: 4 }}>
      <Paper
        elevation={6}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main' }} />
          </Box>
        </Box>

        <Typography variant="h1" sx={{ fontSize: { xs: '3.5rem', md: '5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: -1, mb: 1 }}>
          404
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
          Oops! The page you are looking for doesn't exist, might have been moved, or is temporarily unavailable.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
