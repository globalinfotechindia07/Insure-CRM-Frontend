import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { Business, ContactPhone, Delete, Edit, Language, LocationOn, Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import EmailIntegration from './EmailIntegration.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompanySettings = () => {
  const navigate = useNavigate();
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [companySettingPermission, setCompanySettingPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });

  const systemRights = useSelector((state) => state.systemRights?.systemRights || {});
  const { user } = useSelector((state) => state.auth || {});

  // Handle Edit
  const handleEditClick = (companyId) => {
    navigate(`/company-settings/${companyId}`);
  };

  // Handle Add New
  const handleAddClick = () => {
    navigate('/company-settings/new');
  };

  // Handle Delete
  const handleDeleteClick = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to delete "${companyName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        // const response = await fetch(`http://localhost:5050/api/companySettings/${companyId}`, {
        const response = await fetch(`https://insure-crm-backend-1-n420.onrender.com/api/companySettings/${companyId}`, {

          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.status === 'true') {
          toast.success('Company deleted successfully!');
          fetchCompanySettings();
        } else {
          toast.error(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Error deleting company');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch company settings
  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔗 Fetching company settings...');

      //  const response = await fetch('http://localhost:5050/api/companySettings/', {
      const response = await fetch('https://insure-crm-backend-1-n420.onrender.com/api/companySettings/', {

        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.status === 'true' && data.data) {
        setCompanyList(data.data);
        console.log('✅ Company list set:', data.data);
      } else {
        console.error('❌ Unexpected response format:', data);
        toast.error('Failed to fetch company data');
      }
    } catch (error) {
      console.error('❌ Error in fetchCompanySettings:', error);
      toast.error('Error fetching company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check admin role
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin' || user?.role === 'admin') {
      setAdmin(true);
    }

    // Set permissions
    if (systemRights?.actionPermissions?.['company-settings']) {
      setCompanySettingPermission(systemRights.actionPermissions['company-settings']);
    }

    // Fetch company settings
    fetchCompanySettings();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading branch data...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Branch Settings
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Branch Details</Typography>
            {(companySettingPermission.Add === true || isAdmin) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddClick}
              >
                Add Branch
              </Button>
            )}
          </Grid>

          <Card>
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Company branch</strong></TableCell>
                      <TableCell><strong>Contact Info</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>Registration</strong></TableCell>
                      <TableCell><strong>GST No</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companyList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography>No branch data found. Click "Add Branch" to create one.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      companyList.map((company) => (
                        <TableRow key={company._id}>
                          {/* Company Name */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {company.companyName || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Contact Info */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2">
                                <strong>Email:</strong> {company.email || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Mobile:</strong> {company.mobileNumber || 'N/A'}
                              </Typography>
                              {company.alternateMobileNumber && (
                                <Typography variant="caption" color="text.secondary">
                                  Alt: {company.alternateMobileNumber}
                                </Typography>
                              )}
                              {company.websiteLink && (
                                <Typography variant="caption">
                                  <Language fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                  <a
                                    href={company.websiteLink.startsWith('http') ? company.websiteLink : `https://${company.websiteLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                  >
                                    Website
                                  </a>
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Location Info */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2">
                                {company.city || 'N/A'}, {company.state || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                {company.country || 'N/A'} {company.pincode ? `- ${company.pincode}` : ''}
                              </Typography>
                              {company.address && (
                                <Typography variant="caption" color="text.secondary">
                                  📍 {company.address}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Registration Info */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary">
                                <Business fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                Created: {formatDate(company.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Updated: {formatDate(company.updatedAt)}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* GST No */}
                          <TableCell>
                            <Typography variant="body2">
                              {company.gstNo || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {(companySettingPermission.Edit === true || isAdmin) && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    if (localStorage.getItem('expired') === 'true') {
                                      toast.error('Subscription has ended. Please subscribe to continue working.');
                                      return;
                                    }
                                    handleEditClick(company._id);
                                  }}
                                  title="Edit Branch"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}

                              {(companySettingPermission.Delete === true || isAdmin) && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (localStorage.getItem('expired') === 'true') {
                                      toast.error('Subscription has ended. Please subscribe to continue working.');
                                      return;
                                    }
                                    handleDeleteClick(company._id, company.companyName);
                                  }}
                                  title="Delete Company"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          <EmailIntegration
            onSave={(config) => {
              if (localStorage.getItem('expired') === 'true') {
                toast.error('Subscription has ended. Please subscribe to continue working.');
                return;
              }
              console.log('Saved email integration config:', config);
            }}
          />
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default CompanySettings; 