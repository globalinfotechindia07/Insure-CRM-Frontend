import React, { useEffect, useState } from 'react';
import { get, put } from '../../../../api/api.js';
import { Typography, List, ListItem, Box, Card } from '@mui/material';
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import adminMenuItems from 'admin-menu-items';
import staffMenuItems from 'staff-menu-items.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { selectPatient } from 'store/patientSlice';
import { toast, ToastContainer } from 'react-toastify';
import NavItem from './NavItem';
import { useNavigate } from 'react-router';
import { fetchSystemRights } from 'reduxSlices/systemRightSlice.js';

const STATIC_BASE_URL = "http://localhost:5050";
// const STATIC_BASE_URL = "https://grampanchayattigaon/api/"


const MenuList = () => {
  const loginRole = localStorage.getItem('loginRole');
  const [patients, setPatients] = useState([]);
  const [logo, setLogo] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const systemRights = useSelector((state) => state.systemRights.systemRights);
  const isLoading = useSelector((state) => state.systemRights.isLoading);

  // ✅ FETCH LOGO
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await get('branchSettings');
        const data = res?.data?.[0];

        if (data?.branchLogo || data?.companyLogo) {
          setLogo(`${STATIC_BASE_URL}${data.branchLogo || data.companyLogo}`);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
      }
    };

    fetchLogo();
  }, []);

  // ✅ FETCH PATIENTS
  const getDailyConfirmedAppointmentConsultantWise = async () => {
    try {
      const { refId: consultantId } = JSON.parse(localStorage.getItem('loginData'));
      const response = await get(
        `opd-patient/getDailyConfirmedAppoitmentsConsultantWise/${consultantId}`
      );
      setPatients(response?.data || []);
    } catch (err) {
      console.error(err);
      setPatients([]);
    }
  };

  // ✅ UPDATE PATIENT STATUS
  const handlePatientIn = async (id) => {
    const status = 'Patient In';
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const patientInTime = `${formattedHours}:${minutes} ${ampm}`;

    try {
      const { data } = await get(`opd-patient/patient/${id}`);

      if (data && data?.status?.toLowerCase()?.trim() === 'waiting') {
        const res = await put(`opd-patient/update-patient-status/${id}`, {
          status,
          patientInTime
        });

        if (res?.success) {
          toast.success('Patient status updated successfully');
          dispatch(selectPatient(res?.data || {}));
        } else {
          toast.error(res?.message || 'Failed');
        }
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    const userId = loginData?._id;

    if (userId) {
      dispatch(fetchSystemRights(userId));
    }

    getDailyConfirmedAppointmentConsultantWise();
  }, []);

  // ✅ FILTER MENU
  const filterMenuItems = (menuItems, authorizedIds, actionPermissions) => {
    return menuItems
      .map((item) => {
        if (item.type === 'group' || item.type === 'collapse') {
          const children = filterMenuItems(
            item.children || [],
            authorizedIds,
            actionPermissions
          );

          if (authorizedIds[item.id] || children.length > 0) {
            return { ...item, children };
          }
          return null;
        }

        if (item.type === 'item' && authorizedIds[item.id]) {
          if (!actionPermissions || actionPermissions[item.id]?.View) {
            return item;
          }
        }

        return null;
      })
      .filter(Boolean);
  };

  let filteredMenuItems = [];

  if (loginRole === 'admin') {
    filteredMenuItems = adminMenuItems.items;
  } else if (loginRole === 'super-admin') {
    filteredMenuItems = menuItem.items;
  } else if (systemRights?.authorizedIds) {
    filteredMenuItems = filterMenuItems(
      staffMenuItems.items,
      systemRights.authorizedIds,
      systemRights?.actionPermissions
    );
  }

  // ✅ CONSULTANT DASHBOARD
  const consultantDashboard = [
    {
      items: [
        {
          id: 'navigation',
          type: 'group',
          title: 'Navigation',
          children: [
            {
              id: 'dashboard',
              title: 'Dashboard',
              type: 'item',
              url: '/patient-dashboard'
            }
          ]
        }
      ]
    }
  ];

  const handleSelectPatient = (id) => {
    navigate('/dashboard');
    handlePatientIn(id);
  };

  // ✅ NAV ITEMS
  const navItems =
    loginRole === 'Consultant' ? (
      <>
        {consultantDashboard.map((item, ind) => (
          <NavItem key={ind} item={item.items[0].children[0]} level={1} />
        ))}

        {patients
          ?.filter((p) => {
            const billing = p?.billingStatus?.toLowerCase()?.trim();
            const payee = p?.payeeCategory?.toLowerCase()?.trim();
            return billing === 'paid' || payee === 'insurance';
          })
          .map((patient) => (
            <ListItem
              key={patient?._id}
              disableGutters
              onClick={() => handleSelectPatient(patient?._id)}
            >
              <Card sx={{ width: '100%', p: 1, mb: 1 }}>
                <Box>
                  <Typography variant="h6">
                    {patient?.patientFirstName} {patient?.patientLastName}
                  </Typography>
                  <Typography variant="body2">
                    Age: {patient?.age}, Gender: {patient?.gender}
                  </Typography>
                </Box>
              </Card>
            </ListItem>
          ))}
      </>
    ) : (
      filteredMenuItems.map((item) => {
        if (item.type === 'group') {
          return <NavGroup key={item.id} item={item} />;
        }
        return (
          <Typography key={item.id} color="error">
            Menu Error
          </Typography>
        );
      })
    );

  if (isLoading) {
    return (
      <Typography align="center" color="primary">
        Loading menu...
      </Typography>
    );
  }

  return loginRole === 'Consultant' ? (
    <List>{navItems}</List>
  ) : (
    <>
      {/* ✅ LOGO */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '6px',
          overflow: 'hidden',
          mb: 2
        }}
      >
        {logo && (
          <img
            src={logo}
            alt="Branch Logo"
            style={{ maxWidth: '100%', maxHeight: '80px' }}
          />
        )}
      </Box>

      {navItems}
      <ToastContainer />
    </>
  );
};

export default MenuList;