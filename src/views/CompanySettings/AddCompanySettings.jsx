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
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { Business, ContactPhone, Delete, Edit, Language, LocationOn, Add, Image as ImageIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

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

  const handleEditClick = (companyId) => {
    navigate(`/company-settings/${companyId}`);
  };

  const handleAddClick = () => {
    navigate('/company-settings/new');
  };

  const handleDeleteClick = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to delete "${companyName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5050/api/companySettings/${companyId}`, {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Fix: Get logo URL properly
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    console.log('Original logo path:', logoPath);
    
    // If already has full URL, return as is
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // If starts with /uploads, add base URL
    if (logoPath.startsWith('/uploads')) {
      const fullUrl = `http://localhost:5050${logoPath}`;
      console.log('Full logo URL:', fullUrl);
      return fullUrl;
    }
    
    // Fallback
    return `http://localhost:5050/uploads/company-logo/${logoPath}`;
  };

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/api/companySettings/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Company List:', data);
      
      if (data.status === 'true' && data.data) {
        // Log logo paths for debugging
        data.data.forEach(company => {
          if (company.companyLogo) {
            console.log(`Logo for ${company.companyName}:`, company.companyLogo);
          }
        });
        setCompanyList(data.data);
      } else {
        toast.error('Failed to fetch company data');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error fetching company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin' || user?.role === 'admin') {
      setAdmin(true);
    }
    
    if (systemRights?.actionPermissions?.['company-settings']) {
      setCompanySettingPermission(systemRights.actionPermissions['company-settings']);
    }
    
    fetchCompanySettings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading company data...</Typography>
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
          Company Settings
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Company Details</Typography>
            {(companySettingPermission.Add === true || isAdmin) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddClick}
              >
                Add Company
              </Button>
            )}
          </Grid>
          
          <Card>
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Logo</strong></TableCell>
                      <TableCell><strong>Company Name</strong></TableCell>
                      <TableCell><strong>Contact Info</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>GST No</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companyList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography>No company data found. Click "Add Company" to create one.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      companyList.map((company) => (
                        <TableRow key={company._id}>
                          {/* Logo */}
                          <TableCell>
                            {company.companyLogo ? (
                              <img 
                                src={getLogoUrl(company.companyLogo)} 
                                alt={company.companyName}
                                style={{
                                  width: 50,
                                  height: 50,
                                  objectFit: 'contain',
                                  borderRadius: 8,
                                  border: '1px solid #e0e0e0',
                                  padding: 4,
                                  backgroundColor: '#fff'
                                }}
                                onError={(e) => {
                                  console.error('Image failed to load:', getLogoUrl(company.companyLogo));
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {!company.companyLogo && (
                              <Avatar 
                                sx={{ width: 50, height: 50, bgcolor: '#e0e0e0', borderRadius: 2 }}
                                variant="rounded"
                              >
                                <ImageIcon sx={{ color: '#9e9e9e' }} />
                              </Avatar>
                            )}
                            {company.companyLogo && (
                              <Avatar 
                                sx={{ width: 50, height: 50, bgcolor: '#e0e0e0', borderRadius: 2, display: 'none' }}
                                variant="rounded"
                              >
                                <ImageIcon sx={{ color: '#9e9e9e' }} />
                              </Avatar>
                            )}
                          </TableCell>
                          
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
                                  <a href={company.websiteLink.startsWith('http') ? company.websiteLink : `https://${company.websiteLink}`} target="_blank" rel="noopener noreferrer">
                                    Website
                                  </a>
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          
                          {/* Location */}
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
                                  onClick={() => handleEditClick(company._id)}
                                  title="Edit Company"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                              {(companySettingPermission.Delete === true || isAdmin) && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(company._id, company.companyName)}
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
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default CompanySettings;