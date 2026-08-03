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
  Box,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { FaTrash, FaUpload } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowBack } from '@mui/icons-material';
import { useSelector } from 'react-redux';

 const STATIC_BASE_URL = "http://localhost:5050"; 
// const STATIC_BASE_URL = "https://insure-crm-backend-1-n420.onrender.com";

const UpdateBranchSettings = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  let pincodeTimeout = useRef();

  const { user } = useSelector((state) => state.auth || {});
  const refId = user?.refId || localStorage.getItem('refId');

  console.log('🔴 URL ID:', id);
  console.log('🟢 RefId:', refId);

  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [form, setForm] = useState({
    branchName: '',
    email: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    websiteLink: '',
    gstNo: '',
    address: '',
    pincode: '',
    country: '',
    state: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id || id === 'new') {
      setIsNewRecord(true);
    } else {
      setIsNewRecord(false);
    }
  }, [id]);

  // Fetch existing branch data
  useEffect(() => {
    const fetchBranch = async () => {
      if (!id || id === 'new') return;

      setFetchLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5050/api/branchSettings/${id}`, {
        // const response = await fetch(`https://insure-crm-backend-1-n420.onrender.com/api/branchSettings/${id}`, {

          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const res = await response.json();
        console.log('🟢 Fetch response:', res);

        if (res.status === 'true' && res.data) {
          const d = res.data;
          setForm({
            branchName: d.branchName || d.companyName || '',
            email: d.email || '',
            mobileNumber: d.mobileNumber || '',
            alternateMobileNumber: d.alternateMobileNumber || '',
            websiteLink: d.websiteLink || '',
            gstNo: d.gstNo || '',
            address: d.address || '',
            pincode: d.pincode || '',
            country: d.country || '',
            state: d.state || '',
            city: d.city || ''
          });
          setLogoPreview(d.branchLogo || d.companyLogo || '');
        } else {
          toast.error('Failed to fetch data.');
        }
      } catch (err) {
        console.error('🔴 Error fetching branch:', err);
        toast.error('Error fetching data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBranch();
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
        toast.success('Location auto-filled from pincode');
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
      const file = files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
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
    
    if (!form.branchName?.trim()) err.branchName = 'Branch name is required';
    if (!form.email?.trim()) err.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) 
      err.email = 'Valid email required';
    if (!form.mobileNumber?.trim()) err.mobileNumber = 'Phone number is required';
    if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber)) 
      err.mobileNumber = '10-digit mobile required';
    if (form.alternateMobileNumber && !/^\d{10}$/.test(form.alternateMobileNumber)) 
      err.alternateMobileNumber = '10-digit alt mobile required';
    if (!form.websiteLink?.trim()) err.websiteLink = 'Website required';
    if (!form.gstNo?.trim()) err.gstNo = 'GST number required';
    if (!form.address?.trim()) err.address = 'Address required';
    if (!form.pincode?.trim()) err.pincode = 'Pincode required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) err.pincode = '6-digit pincode required';
    if (!form.city?.trim()) err.city = 'City required';
    if (!form.state?.trim()) err.state = 'State required';
    if (!form.country?.trim()) err.country = 'Country required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleDeleteLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        branchName: form.branchName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        alternateMobileNumber: form.alternateMobileNumber || '',
        websiteLink: form.websiteLink,
        gstNo: form.gstNo,
        address: form.address,
        pincode: form.pincode,
        country: form.country,
        state: form.state,
        city: form.city
      };
      
      if (isNewRecord && refId) {
        payload.refId = refId;
      }
      
      console.log('🟡 Submitting payload:', payload);
      
      let url = 'http://localhost:5050/api/branchSettings/';
      // let url = "https://insure-crm-backend-1-n420.onrender.com/api/branchSettings/";

      let method = 'POST';
      
      if (!isNewRecord) {
        url = `http://localhost:5050/api/branchSettings/${id}`;
        // url = `https://insure-crm-backend-1-n420.onrender.com/api/branchSettings/${id}`;

        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('🟢 API Response:', data);
      
      if (data.status === 'true') {
        toast.success(isNewRecord ? 'Branch created successfully!' : 'Branch updated successfully!');
        
        // Upload logo separately if exists
        if (logoFile) {
          const logoFormData = new FormData();
          logoFormData.append('branchLogo', logoFile);
          // 
          const logoResponse = await fetch(`http://localhost:5050/api/branchSettings/${data.data._id}/logo`, {
          // const logoResponse = await fetch(`https://insure-crm-backend-1-n420.onrender.com/api/branchSettings/${data.data._id}/logo`, {

            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: logoFormData
          });
          
          const logoData = await logoResponse.json();
          if (logoData.status === 'true') {
            toast.success('Logo uploaded successfully!');
          } else {
            toast.warning('Branch saved but logo upload failed');
          }
        }

        // Trigger custom update events so header/sidebar refetches
        window.dispatchEvent(new Event('branchSettingsUpdated'));
        window.dispatchEvent(new Event('companySettingsUpdated'));
        
        setTimeout(() => navigate('/branch-settings'), 1500);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('🔴 Error:', error);
      toast.error(error.message || 'Error saving branch');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading branch data...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit">
          Home
        </Typography>
        <Typography component={Link} to="/branch-settings" variant="subtitle2" color="inherit">
          Branch Settings
        </Typography>
        <Typography variant="subtitle2" color="primary">
          {isNewRecord ? 'Create Branch' : 'Update Branch'}
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">
              {isNewRecord ? 'Create New Branch' : 'Update Branch Details'}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/branch-settings')}>
              <ArrowBack /> Back to List
            </Button>
          </Grid>
          
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Branch Name */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Branch Name *"
                    name="branchName"
                    value={form.branchName}
                    onChange={handleChange}
                    error={!!errors.branchName}
                    helperText={errors.branchName}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Email */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Mobile Number */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Mobile Number *"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Alternate Mobile Number */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Alternate Mobile Number"
                    name="alternateMobileNumber"
                    value={form.alternateMobileNumber}
                    onChange={handleChange}
                    error={!!errors.alternateMobileNumber}
                    helperText={errors.alternateMobileNumber}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                  />
                </Grid>
                
                {/* Website Link */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Website URL *"
                    name="websiteLink"
                    value={form.websiteLink}
                    onChange={handleChange}
                    error={!!errors.websiteLink}
                    helperText={errors.websiteLink}
                    placeholder="https://example.com"
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* GST Number */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="GST Number *"
                    name="gstNo"
                    value={form.gstNo}
                    onChange={handleChange}
                    error={!!errors.gstNo}
                    helperText={errors.gstNo}
                    inputProps={{ maxLength: 15 }}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    label="Office Address *"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    multiline
                    rows={2}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Pincode */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Pincode *"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    error={!!errors.pincode}
                    helperText={errors.pincode || "Auto-fetches city, state, country"}
                    inputProps={{ maxLength: 6 }}
                    fullWidth
                    required
                  />
                </Grid>
                
                {/* Country */}
                <Grid item xs={12} sm={6} md={3}>
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
                
                {/* State */}
                <Grid item xs={12} sm={6} md={3}>
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
                
                {/* City */}
                <Grid item xs={12} sm={6} md={3}>
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



                {/* Submit Button */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => navigate('/branch-settings')}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      size="large"
                    >
                      {loading ? <CircularProgress size={24} /> : (isNewRecord ? 'Create Branch' : 'Update Branch')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default UpdateBranchSettings;
