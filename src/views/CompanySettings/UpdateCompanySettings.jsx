import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  IconButton,
  CardContent,
  Divider,
  Box
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { FaTrash } from 'react-icons/fa';
import REACT_APP_API_URL, { get, put } from 'api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowBack } from '@mui/icons-material';

const UpdateCompanySettings = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  let pincodeTimeout = useRef();

  // 🔴 DEBUG: Check if id is coming from URL
  console.log('🔴 URL Params - Full params object:', useParams());
  console.log('🔴 Extracted ID from URL:', id);

  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    officialMailId: '',
    officialPhoneNo: '',
    altPhoneNo: '',
    website: '',
    gstNo: '',
    officeAddress: '',
    pincode: '',
    country: '',
    state: '',
    city: '',
    companyLogo: null
  });

  const [errors, setErrors] = useState({});

  // Check if id exists when component mounts
  useEffect(() => {
    console.log('🟢 Component mounted. ID from URL:', id);
    if (!id) {
      console.log('🔴 No ID found in URL!');
      toast.error('Company ID not found in URL');
      navigate('/company-settings');
    }
  }, [id, navigate]);

  // Fetch existing company data
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        console.log('🔴 Skipping fetch - No ID available');
        return;
      }

      console.log('🟡 Fetching company with ID:', id);
      setLoading(true);
      try {
        const res = await get(`company-settings/${id}`);
        console.log('🟢 Fetch response:', res);

        if (res.status === true && res.data) {
          const d = res.data;
          setForm({
            clientName: d.clientName || '',
            officialMailId: d.officialMailId || '',
            officialPhoneNo: d.officialPhoneNo || '',
            altPhoneNo: d.altPhoneNo || '',
            website: d.website || '',
            gstNo: d.gstNo || '',
            officeAddress: d.officeAddress || '',
            pincode: d.pincode || '',
            country: d.country || '',
            state: d.state || '',
            city: d.city || '',
            companyLogo: d.logo || null
          });
          setLogoPreview(d.logo || '');
        } else {
          toast.error('Failed to fetch data.');
        }
      } catch (err) {
        console.error('🔴 Error fetching company:', err);
        toast.error('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  // Fetch pincode information
  const fetchPincodeDetails = async (value) => {
    try {
      const resp = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const [data] = await resp.json();

      if (data.Status === 'Success' && data.PostOffice.length > 0) {
        const { District, State, Country } = data.PostOffice[0];
        setForm(prev => ({
          ...prev,
          city: District,
          state: State,
          country: Country
        }));
      } else {
        toast.error('Invalid pincode');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching pincode info');
    }
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setLogoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      if (name === 'pincode' && value.length === 6) {
        clearTimeout(pincodeTimeout.current);
        pincodeTimeout.current = setTimeout(() => {
          fetchPincodeDetails(value);
        }, 500);
      }
    }
  };

  const validateForm = () => {
    const err = {};
    
    if (!form.clientName?.trim()) err.clientName = 'Company name is required';
    if (!form.officialMailId?.trim()) err.officialMailId = 'Email is required';
    if (form.officialMailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.officialMailId)) 
      err.officialMailId = 'Valid email required';
    
    if (!form.officialPhoneNo?.trim()) err.officialPhoneNo = 'Phone number is required';
    if (form.officialPhoneNo && !/^\d{10}$/.test(form.officialPhoneNo)) 
      err.officialPhoneNo = '10-digit mobile required';
    
    if (form.altPhoneNo && !/^\d{10}$/.test(form.altPhoneNo)) 
      err.altPhoneNo = '10-digit alt mobile';
    
    if (!form.website?.trim()) err.website = 'Website required';
    if (!form.officeAddress?.trim()) err.officeAddress = 'Address required';
    if (!form.pincode?.trim()) err.pincode = 'Pincode required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) err.pincode = '6-digit pincode required';
    if (!form.city?.trim()) err.city = 'City required';
    if (!form.state?.trim()) err.state = 'State required';
    if (!form.country?.trim()) err.country = 'Country required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return "";
    const normalized = logoPath.replace(/\\/g, "/");
    return `${REACT_APP_API_URL}/${normalized}`;
  };

  const handleSubmit = async () => {
    console.log('🟡 handleSubmit called. Current ID:', id);
    
    if (!id) {
      console.log('🔴 CRITICAL: No ID available for update!');
      toast.error('Company ID is missing! Cannot update.');
      navigate('/company-settings');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'companyLogo' && value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      if (form.companyLogo instanceof File) {
        formData.append('logo', form.companyLogo);
      }

      console.log('🟡 Updating company with ID:', id);
      console.log('🟡 API Endpoint:', `company-settings/${id}`);
      
      const res = await put(`company-settings/${id}`, formData);
      console.log('🟢 Update response:', res);

      if (res.status === true) {
        toast.success('Company updated successfully!');
        setTimeout(() => navigate('/company-settings'), 1500);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (error) {
      console.error('🔴 Error updating company:', error);
      toast.error(error.response?.data?.message || 'Error updating company');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = () => {
    setForm((prev) => ({ ...prev, companyLogo: null }));
    setLogoPreview('');
  };

  // Show loading or error state
  if (loading && !form.clientName) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading company data...</Typography>
      </Box>
    );
  }

  if (!id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
        <Typography variant="h5" color="error" gutterBottom>Invalid Company ID</Typography>
        <Button variant="contained" onClick={() => navigate('/company-settings')}>
          Go Back to Company Settings
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Breadcrumb title="Company Settings">
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
            <Typography variant="h5">Update Company Settings</Typography>
            <Typography variant="body2" color="textSecondary">Company ID: {id}</Typography>
            <Button variant="contained" onClick={() => navigate('/company-settings')}>
              <ArrowBack /> Back
            </Button>
          </Grid>
          <Card>
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Company Name *"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    error={!!errors.clientName}
                    helperText={errors.clientName}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Email *"
                    name="officialMailId"
                    type="email"
                    value={form.officialMailId}
                    onChange={handleChange}
                    error={!!errors.officialMailId}
                    helperText={errors.officialMailId}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mobile No. *"
                    name="officialPhoneNo"
                    value={form.officialPhoneNo}
                    onChange={handleChange}
                    error={!!errors.officialPhoneNo}
                    helperText={errors.officialPhoneNo}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Alternate Mobile No."
                    name="altPhoneNo"
                    value={form.altPhoneNo}
                    onChange={handleChange}
                    error={!!errors.altPhoneNo}
                    helperText={errors.altPhoneNo}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Website Link *"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    error={!!errors.website}
                    helperText={errors.website}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="GST No."
                    name="gstNo"
                    value={form.gstNo}
                    onChange={handleChange}
                    error={!!errors.gstNo}
                    helperText={errors.gstNo}
                    inputProps={{ maxLength: 15 }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Address *"
                    name="officeAddress"
                    value={form.officeAddress}
                    onChange={handleChange}
                    error={!!errors.officeAddress}
                    helperText={errors.officeAddress}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pincode *"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    error={!!errors.pincode}
                    helperText={errors.pincode}
                    inputProps={{ maxLength: 6 }}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Country *"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    error={!!errors.country}
                    helperText={errors.country}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State *"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    error={!!errors.state}
                    helperText={errors.state}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City *"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  {!logoPreview && !form.companyLogo && (
                    <Button variant="contained" component="label" fullWidth>
                      Upload Logo
                      <input type="file" name="companyLogo" hidden accept="image/*" onChange={handleChange} />
                    </Button>
                  )}

                  {(logoPreview || form.companyLogo) && (
                    <Box position="relative" display="inline-block" mt={2}>
                      <img
                        src={logoPreview || getLogoUrl(form.companyLogo)}
                        alt="Company Logo"
                        style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleDeleteLogo}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          left: -8,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          boxShadow: 1,
                          '&:hover': {
                            backgroundColor: '#f8d7da',
                            color: 'red'
                          }
                        }}
                      >
                        <FaTrash size={12} />
                      </IconButton>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Company'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default UpdateCompanySettings;