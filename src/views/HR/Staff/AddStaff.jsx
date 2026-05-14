import React, { useState } from 'react';
import { Grid, TextField, Button, MenuItem, Typography, Card, CardContent, Divider } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddStaff = () => {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    phoneNo: '',
    altphoneNo: '',
    email: '',
    altEmail: '',
    dob: '',
    aadharNo: '',
    panNo: '',
    address: '',
    emergencyContactPersonName: '',
    emergencyContactPersonNumber: '',
    emergencyContactPersonAddress: ''
  });
  const [errors, setErrors] = useState({});

  const dropdownOptions = {
    gender: ['Male', 'Female', 'Other']
  };

  const validate = () => {
    const newErrors = {};

    // Required fields check
    if (!form.firstName?.trim()) newErrors.firstName = 'First Name is required';
    if (!form.middleName?.trim()) newErrors.middleName = 'Middle Name is required';
    if (!form.lastName?.trim()) newErrors.lastName = 'Last Name is required';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.phoneNo?.trim()) newErrors.phoneNo = 'Phone Number is required';
    if (!form.email?.trim()) newErrors.email = 'Email is required';
    if (!form.address?.trim()) newErrors.address = 'Address is required';
    if (!form.emergencyContactPersonNumber?.trim()) {
      newErrors.emergencyContactPersonNumber = 'Emergency Contact Number is required';
    }

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (form.altEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.altEmail)) {
      newErrors.altEmail = 'Invalid alternate email format';
    }

    // Phone validation
    if (form.phoneNo && !/^\d{10}$/.test(form.phoneNo)) {
      newErrors.phoneNo = 'Enter valid 10-digit number';
    }
    if (form.altphoneNo && !/^\d{10}$/.test(form.altphoneNo)) {
      newErrors.altphoneNo = 'Enter valid 10-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log('Submitted Data:', form);
      toast.success('Staff Added successfully');
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };

  const renderTextField = (label, name, required = false, type = 'text') => (
    <TextField
      label={label}
      name={name}
      type={type}
      value={form[name] || ''}
      onChange={handleChange}
      fullWidth
      required={required}
      error={!!errors[name]}
      helperText={errors[name]}
      InputLabelProps={type === 'date' ? { shrink: true } : {}}
    />
  );

  const renderDropdown = (label, name, options, required = true) => (
    <TextField
      select
      label={label}
      name={name}
      value={form[name] || ''}
      onChange={handleChange}
      fullWidth
      required={required}
      error={!!errors[name]}
      helperText={errors[name]}
    >
      <MenuItem value="">Select {label}</MenuItem>
      {options.map((opt, i) => (
        <MenuItem key={i} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Card>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h6">Staff Form</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/hr/Staff">
              <ArrowBackIcon /> Back
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Row 1 - Personal Details */}
          <Grid item xs={12} md={4}>
            {renderTextField('First Name', 'firstName', true)}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderTextField('Middle Name', 'middleName', true)}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderTextField('Last Name', 'lastName', true)}
          </Grid>

          {/* Row 2 - Contact Details */}
          <Grid item xs={12} md={3}>
            {renderDropdown('Gender', 'gender', dropdownOptions.gender, true)}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Phone No', 'phoneNo', true, 'text')}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Alt Phone No', 'altphoneNo', false, 'text')}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Email', 'email', true)}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Alternate Email', 'altEmail', false)}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('DOB', 'dob', false, 'date')}
          </Grid>

          {/* Row 3 - ID Proofs */}
          <Grid item xs={12} md={3}>
            {renderTextField('Aadhar No', 'aadharNo', false)}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Pan No', 'panNo', false)}
          </Grid>

          {/* Row 4 - Address */}
          <Grid item xs={12} md={6}>
            {renderTextField('Address', 'address', true)}
          </Grid>

          {/* Row 5 - Emergency Contact */}
          <Grid item xs={12} md={4}>
            {renderTextField('Emergency Contact Person Name', 'emergencyContactPersonName', false)}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderTextField('Emergency Contact Person Number', 'emergencyContactPersonNumber', true, 'text')}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderTextField('Emergency Contact Address', 'emergencyContactPersonAddress', false)}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
        <ToastContainer />
      </CardContent>
    </Card>
  );
};

export default AddStaff;