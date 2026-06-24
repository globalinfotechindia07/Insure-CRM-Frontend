import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import insureLogo from '../../../assets/images/insure logo_bg.jpeg';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, IconButton, Typography } from '@mui/material';

// project import
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { drawerWidth } from 'config.js';
import { financialYearContext } from 'context/financialYearContext';

// assets
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import CurrentDate from './CureentDateSection';
import { get } from 'api/api';
import { useDispatch, useSelector } from 'react-redux';

import { Dialog, DialogContent, Button, Fade } from '@mui/material';
import { Close as CloseIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';

// ==============================|| HEADER ||============================== //

const Header = ({ drawerToggle }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { hospitalData } = useSelector((state) => state.hospitalData);
  const loginData = JSON.parse(localStorage.getItem('loginData')) || {};
  const { user } = useSelector((state) => state.auth || {});

  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  const end = localStorage.getItem('end');

  const [openPopup, setOpenPopup] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [selectedFY, setSelectedFY] = useState('');

  useEffect(() => {
    if (end) {
      const endDate = new Date(end);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays);

      if (diffDays <= 0) {
        localStorage.setItem('expired', 'true');
        setOpenPopup(true);
      } else {
        localStorage.setItem('expired', 'false');
        if (diffDays <= 30) {
          setOpenPopup(true);
        }
      }
    }
  }, [end]);

  const handleClose = () => setOpenPopup(false);
  const handleSubscribe = () => {};

  // ✅ Fetch branch settings to get branch name
  const fetchBranchSettings = async () => {
    try {
      setLoading(true);
      
      // Get refId from Redux or localStorage
      let refId = user?.refId || localStorage.getItem('refId');
      
      if (!refId) {
        console.log('No refId found');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching branch settings for refId:', refId);
      
      // Fetch all branch settings
      const response = await get('branchSettings/');
      console.log('Branch settings response:', response);
      
      if (response.status === 'true' && response.data) {
        // Find branch with matching refId
        const branch = response.data.find(c => c.refId === refId);
        
        if (branch) {
          // ✅ Set branch name
          setBranchName(branch.branchName || branch.companyName || '');
        } else if (response.data.length > 0) {
          // If no match by refId, take first branch
          const firstBranch = response.data[0];
          setBranchName(firstBranch.branchName || firstBranch.companyName || '');
        }
      }
    } catch (error) {
      console.error('Error fetching branch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch financial year data
  const fetchFYData = async () => {
    try {
      const res = await get('financialYear');
      if (res.data) {
        setFinancialYearData(res.data);
        const now = new Date();
        const currentFinancialYear = res.data.find(
          (year) => new Date(year.fromDate) <= now && new Date(year.toDate) >= now
        );
        const savedFY = localStorage.getItem('selectedFY');
        if (savedFY && res.data.find(y => y._id === savedFY)) {
          setSelectedFY(savedFY);
        } else if (currentFinancialYear) {
          setSelectedFY(currentFinancialYear._id);
        }
      }
    } catch (error) {
      console.error('Error fetching FY data:', error);
    }
  };

  useEffect(() => {
    fetchBranchSettings();
    fetchFYData();
  }, [user?.refId]);

  // Listen for branch settings updates
  useEffect(() => {
    const handleBranchUpdate = () => {
      console.log('Branch settings updated, refetching...');
      fetchBranchSettings();
    };
    
    window.addEventListener('branchSettingsUpdated', handleBranchUpdate);
    window.addEventListener('companySettingsUpdated', handleBranchUpdate);
    
    return () => {
      window.removeEventListener('branchSettingsUpdated', handleBranchUpdate);
      window.removeEventListener('companySettingsUpdated', handleBranchUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedFY) {
      localStorage.setItem('selectedFY', selectedFY);
      window.dispatchEvent(new Event('storage'));
    }
  }, [selectedFY]);

  const handleFYChange = (e) => {
    const value = e.target.value;
    setSelectedFY(value);
    localStorage.setItem('selectedFY', value);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <financialYearContext.Provider value={selectedFY}>
        <Box width={drawerWidth} sx={{ zIndex: 1201 }}>
          <Grid sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <Grid item>
              <IconButton edge="start" sx={{ mr: theme.spacing(1.25) }} aria-label="open drawer" onClick={drawerToggle} size="large">
                <MenuTwoToneIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>
            </Grid>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 2 }}>
              {/* Only Insure Logo */}
              <Box
                sx={{
                  width: '140px',
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <img src={insureLogo} alt="Insure Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
            </Box>
          </Grid>
        </Box>

        {/* Subscription Expiry Popup */}
        <Dialog
          open={openPopup}
          onClose={handleClose}
          TransitionComponent={Fade}
          sx={{
            '& .MuiBackdrop-root': {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            },
            '& .MuiDialog-paper': {
              background: 'linear-gradient(180deg, #ffffff, #f9f9f9)',
              borderRadius: '20px',
              maxWidth: 420,
              width: '90%',
              textAlign: 'center',
              p: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: '#888',
                '&:hover': { color: '#000' }
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box
              sx={{
                bgcolor: daysLeft <= 0 ? '#ffebee' : '#e3f2fd',
                color: daysLeft <= 0 ? '#d32f2f' : '#1976d2',
                width: 70,
                height: 70,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {daysLeft <= 0 ? 'Subscription Expired' : 'Subscription Reminder'}
            </Typography>

            <Typography variant="body1" sx={{ color: '#444' }}>
              {daysLeft <= 0 ? (
                <>
                  Your subscription has <strong style={{ color: '#d32f2f' }}>expired</strong>.
                </>
              ) : (
                <>
                  Your subscription will expire in <strong style={{ color: '#d32f2f' }}>{daysLeft}</strong> day
                  {daysLeft !== 1 ? 's' : ''}.
                </>
              )}
            </Typography>

            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              {daysLeft <= 0 ? 'Please renew now to regain access.' : 'Renew now to continue enjoying uninterrupted access.'}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubscribe}
              sx={{
                background: daysLeft <= 0 ? 'linear-gradient(45deg, #d32f2f, #ef5350)' : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                color: '#fff',
                borderRadius: '30px',
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  background: daysLeft <= 0 ? 'linear-gradient(45deg, #c62828, #e53935)' : 'linear-gradient(45deg, #1565c0, #2196f3)'
                }
              }}
            >
              {daysLeft <= 0 ? 'Renew Subscription' : 'Renew Now'}
            </Button>
          </DialogContent>
        </Dialog>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box
          sx={{
            display: { md: 'flex', xs: 'none' },
            alignItems: 'center',
            gap: 1
          }}
        >
          {/* ✅ Dynamic Company Name from API */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '12px', sm: '14px' },
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: '1px',
              lineHeight: '1.5',
              textTransform: 'uppercase'
            }}
          >
            {branchName || loginData?.names || 'J P Insurance'}
          </Typography>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <CurrentDate />
        </Box>

        <NotificationSection />
        <ProfileSection />
      </financialYearContext.Provider>
    </>
  );
};

Header.propTypes = {
  drawerToggle: PropTypes.func
};

export default Header;