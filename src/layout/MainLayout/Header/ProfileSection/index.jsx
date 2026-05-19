import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Fade,
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Modal,
  Box,
  Typography
} from '@mui/material';

// assets
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import LockOpenTwoTone from '@mui/icons-material/LockOpenTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import { logout } from '../../../../reduxSlices/authSlice';
import { useDispatch, useSelector } from 'react-redux'; // ✅ Add useSelector
import { useNavigate } from 'react-router';

const ProfileSection = () => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [open, setOpen] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const anchorRef = React.useRef(null);
  const [savedPattern, setSavedPattern] = useState(null);
  
  // ✅ REDUX SE DATA LO - YEH CHANGE KIYA HAI
  const userData = useSelector((state) => state.patient.userData); // patient slice se userData
  const isAuthenticated = useSelector((state) => state.patient.isAuthenticated);
  
  const dispatch = useDispatch(); 
  const navigate = useNavigate();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('companyId');
    localStorage.removeItem('img');
    dispatch(logout()); // ✅ Redux logout call karega, jo localStorage bhi clear karega
    document.cookie = `hmsToken=`;
    window.location.href = '/login';
  };

  const handleOpenLock = () => {
    const lockData = {
      savedPattern: savedPattern ? savedPattern.savedPattern : null,
      status: true
    };
    localStorage.setItem('lockData', JSON.stringify(lockData));
    window.location.reload();
  };

  // load pattern from localStorage only (userData ab Redux se aa raha hai)
  useEffect(() => {
    const lockData = localStorage.getItem('lockData');
    if (lockData) {
      const parsedData = JSON.parse(lockData);
      setSavedPattern(parsedData);
    }
    // ✅ REMOVE KARO - Ab localStorage se userData nahi le rahe
    // const loginData = localStorage.getItem('loginData');
    // if (loginData) {
    //   setUserData(JSON.parse(loginData));
    // }
  }, []);

  console.log('User data from Redux:', userData); // ✅ Ab Redux se log hoga
  
  return (
    <>
      {/* Profile Button */}
      <Button
        sx={{ minWidth: { sm: 50, xs: 35, color: '#000' } }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Profile"
        onClick={handleToggle}
        color="inherit"
      >
        <AccountCircleTwoToneIcon sx={{ fontSize: '1.5rem' }} />
      </Button>

      {/* Dropdown Menu */}
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: { offset: [0, 10] }
          },
          {
            name: 'preventOverflow',
            options: { altAxis: true }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 350,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px'
                  }}
                >
                  <ListItemButton onClick={() => navigate('/profile')}>
                    <ListItemIcon>
                      <PersonTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>

                  <ListItemButton>
                    <ListItemIcon>
                      <LockOpenTwoTone />
                    </ListItemIcon>
                    <ListItemText onClick={handleOpenLock} primary="Lock Screen" />
                  </ListItemButton>

                  <ListItemButton>
                    <ListItemIcon>
                      <MeetingRoomTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText onClick={handleLogout} primary="Logout" />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <Modal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '16px',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2,
              boxShadow: 3
            }}
          >
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 
             userData?.Name?.charAt(0).toUpperCase() || 'U'}
          </Box>

          <Typography id="profile-modal-title" variant="h6" fontWeight="bold" gutterBottom>
            {userData?.name || userData?.Name || 'User Profile'}
          </Typography>

          {userData ? (
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography sx={{ mb: 1 }}>
                <strong>Email:</strong> {userData.email || userData.Email || 'N/A'}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Role:</strong> {userData.role || 'N/A'}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Created At:</strong> {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          ) : (
            <Typography>No user data found</Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 4, borderRadius: '8px', px: 4 }}
              onClick={() => setOpenProfileModal(false)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 4, borderRadius: '8px', px: 4 }}
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileSection;