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

const BranchSettings = () => {
  const navigate = useNavigate();
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [branchSettingPermission, setBranchSettingPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });

  const systemRights = useSelector((state) => state.systemRights?.systemRights || {});
  const { user } = useSelector((state) => state.auth || {});

  // Handle Edit
  const handleEditClick = (branchId) => {
    navigate(`/branch-settings/${branchId}`);
  };

  // Handle Add New
  const handleAddClick = () => {
    navigate('/branch-settings/new');
  };

  // Handle Delete
  const handleDeleteClick = async (branchId, branchName) => {
    if (window.confirm(`Are you sure you want to delete "${branchName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        // const response = await fetch(`http://localhost:5050/api/branchSettings/${branchId}`, {
        const response = await fetch(`https://api.jpinsurancebrokers.co.in/api/branchSettings/${branchId}`, {

          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.status === 'true') {
          toast.success('Branch deleted successfully!');
          fetchBranchSettings();
        } else {
          toast.error(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Error deleting branch');
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

  // Fetch branch settings
  const fetchBranchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔗 Fetching branch settings...');

      // const response = await fetch('http://localhost:5050/api/branchSettings/', {

        const response = await fetch('https://api.jpinsurancebrokers.co.in/api/branchSettings/', {


        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.status === 'true' && data.data) {
        setBranchList(data.data);
        console.log('✅ Branch list set:', data.data);
      } else {
        console.error('❌ Unexpected response format:', data);
        toast.error('Failed to fetch branch data');
      }
    } catch (error) {
      console.error('❌ Error in fetchBranchSettings:', error);
      toast.error('Error fetching branch data');
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

    // Set permissions (using 'branch-settings' permission key if exists, fallback to 'company-settings')
    const permissions = systemRights?.actionPermissions?.['branch-settings'] || systemRights?.actionPermissions?.['company-settings'];
    if (permissions) {
      setBranchSettingPermission(permissions);
    }

    // Fetch branch settings
    fetchBranchSettings();
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
            {(branchSettingPermission.Add === true || isAdmin) && (
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
                      <TableCell><strong>Branch Name</strong></TableCell>
                      <TableCell><strong>Contact Info</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>Registration</strong></TableCell>
                      <TableCell><strong>GST No</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branchList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography>No branch data found. Click "Add Branch" to create one.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      branchList.map((branch) => (
                        <TableRow key={branch._id}>
                          {/* Branch Name */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {branch.branchName || branch.companyName || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Contact Info */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2">
                                <strong>Email:</strong> {branch.email || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Mobile:</strong> {branch.mobileNumber || 'N/A'}
                              </Typography>
                              {branch.alternateMobileNumber && (
                                <Typography variant="caption" color="text.secondary">
                                  Alt: {branch.alternateMobileNumber}
                                </Typography>
                              )}
                              {branch.websiteLink && (
                                <Typography variant="caption">
                                  <Language fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                  <a
                                    href={branch.websiteLink.startsWith('http') ? branch.websiteLink : `https://${branch.websiteLink}`}
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
                                {branch.city || 'N/A'}, {branch.state || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                {branch.country || 'N/A'} {branch.pincode ? `- ${branch.pincode}` : ''}
                              </Typography>
                              {branch.address && (
                                <Typography variant="caption" color="text.secondary">
                                  📍 {branch.address}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Registration Info */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary">
                                <Business fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                Created: {formatDate(branch.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Updated: {formatDate(branch.updatedAt)}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* GST No */}
                          <TableCell>
                            <Typography variant="body2">
                              {branch.gstNo || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {(branchSettingPermission.Edit === true || isAdmin) && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    if (localStorage.getItem('expired') === 'true') {
                                      toast.error('Subscription has ended. Please subscribe to continue working.');
                                      return;
                                    }
                                    handleEditClick(branch._id);
                                  }}
                                  title="Edit Branch"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}

                              {(branchSettingPermission.Delete === true || isAdmin) && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (localStorage.getItem('expired') === 'true') {
                                      toast.error('Subscription has ended. Please subscribe to continue working.');
                                      return;
                                    }
                                    handleDeleteClick(branch._id, branch.branchName || branch.companyName);
                                  }}
                                  title="Delete Branch"
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

export default BranchSettings;
