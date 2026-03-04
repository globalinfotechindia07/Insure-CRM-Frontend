import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  InputLabel,
  Select,
  Button,
  Typography,
  Card,
  IconButton,
  CardContent,
  FormControl,
  Divider,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import { get, post } from '../../api/api';

const AddCustomer = () => {
  const navigate = useNavigate();

  function initialState() {
    return {
      clientType: '',
      name: '',
      customerId: '',
      customerGroupName: '',
      subCustomerGroupName: '',
      prefix: '',
      dob: '',
      email: '',
      mobile: '',
      gstNo: '',
      panNo: '',
      logo: null,
      adharNo: '',
      dlNo: '',
      address: '',
      pincode: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      createdBy: localStorage.getItem('Id') || '',
      companyId: localStorage.getItem('companyId') || '',
      contactPerson: [
        {
          name: '',
          department: '',
          position: '',
          email: '',
          phone: ''
        }
      ]
    };
  }

  const [form, setForm] = useState(initialState());
  const [errors, setErrors] = useState({});
  const [departmentData, setDepartmentData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [prefixData, setPrefixData] = useState({});
  const [customerGroupData, setCustomerGroupData] = useState({});
  const [subCustomerGroupData, setSubCustomerGroupData] = useState({});

  // Fetch dropdown and lead details
  const fetchDropdownData = async () => {
    try {
      const [prefixData, customerGroupData, subCustomerGroupData] = await Promise.all([
        get('prefix'),
        get('customerGroup'),
        get('subCustomerGroup')
      ]);
      setPrefixData(prefixData.allPrefix || []);
      setCustomerGroupData(customerGroupData.data || []);
      setSubCustomerGroupData(subCustomerGroupData.data || []);
      console.log('Prefix List data', prefixData, customerGroupData, subCustomerGroupData);
    } catch (err) {
      console.error('Dropdown load error:', err);
    }
  };

  //fetches all positions from backend
  const fetchPositions = async () => {
    try {
      const response = await get('position');
      setPositionData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  //Fetchs all departments from backend
  const fetchDepartments = async () => {
    try {
      const response = await get('department');
      setDepartmentData(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchDropdownData();
    fetchDepartments();
    fetchPositions();
  }, []);

  useEffect(() => {
    const fetchSubCustomerByCustomer = async () => {
      const selectedId = form.customerGroupName;
      // const selectedName = customerGroupData.find((branch) => branch._id === selectedId);
      // console.log('bb ', selectedId);
      const res = await get(`subCustomerGroup/${selectedId}`);
      console.log('Sub Customers   ', res.data);
      if (res.data) setSubCustomerGroupData(res.data);
      else setSubCustomerGroupData([]);
    };

    fetchSubCustomerByCustomer();
  }, [form.customerGroupName]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name.includes('.')) {
      const [key, index, field] = name.split('.');
      const updatedContacts = [...form.contactPerson];
      updatedContacts[parseInt(index)][field] = value;
      setForm({ ...form, contactPerson: updatedContacts });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...form.contactPerson];
    updatedContacts[index][field] = value;
    setForm({ ...form, contactPerson: updatedContacts });
  };

  const addContact = () => {
    setForm((prevForm) => ({
      ...prevForm,
      contactPerson: [
        ...prevForm.contactPerson,
        {
          name: '',
          department: '',
          position: '',
          email: '',
          phone: ''
        }
      ]
    }));
  };
  const removeContact = (index) => {
    const updatedContacts = [...form.contactPerson];
    updatedContacts.splice(index, 1);
    setForm({ ...form, contactPerson: updatedContacts });

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      Object.keys(updatedErrors).forEach((key) => {
        if (key.startsWith(`contactPerson.${index}`)) {
          delete updatedErrors[key];
        }
      });
      return updatedErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Only required fields
    if (!form.name) newErrors.name = 'Customer Name is required';

    if (!form.mobile?.match(/^\d{10}$/)) newErrors.mobile = 'Enter valid 10-digit number';

    if (!form.adharNo?.match(/^\d{12}$/)) newErrors.adharNo = 'Enter valid 12-digit number';

    if (!form.email?.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = 'Invalid email';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Form Data Submitted:', form);
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }
    try {
      const role = localStorage.getItem('loginRole');
      if (role === 'admin') {
        const res = await post('customerRegistration', form);
        if (res.data) {
          toast.success('Customer Registration Successful');
          navigate('/customer');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit');
    }
  };

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary">
          Customer
        </Typography>
      </Breadcrumb>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Customer Registration</Typography>
            <Button variant="contained" onClick={() => navigate('/customer')}>
              <ArrowBack />
            </Button>
          </Grid>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel id="clientType">Client Type</InputLabel>
                    <Select
                      labelId="clientType"
                      label="clientType"
                      name="clientType"
                      value={form.clientType}
                      onChange={handleChange}
                      error={!!errors.clientType}
                      helperText={errors.clientType}
                    >
                      <MenuItem value="retail">Retail</MenuItem>
                      <MenuItem value="corporate">Corporate</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    labelId="customerId"
                    label="Customer ID"
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Corporate fields in SAME ROW */}
                {form.clientType === 'corporate' && (
                  <>
                    {/* <Grid container spacing={2} sx={{ ml: { xs: 0, sm: '16px' } }}> */}
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id="customerGroupName">Customer Group Name</InputLabel>
                        <Select
                          labelId="customerGroupName"
                          label="Customer Group Name"
                          name="customerGroupName"
                          value={form.customerGroupName}
                          onChange={handleChange}
                          error={!!errors.customerGroupName}
                          helperText={errors.customerGroupName}
                        >
                          {customerGroupData.length > 0 &&
                            customerGroupData.map((type) => (
                              <MenuItem key={type._id} value={type._id}>
                                {type.customerGroupName}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id="subCustomerGroupName">Sub Customer Group Name</InputLabel>
                        <Select
                          labelId="subCustomerGroupName"
                          label="Sub Customer Group Name"
                          name="subCustomerGroupName"
                          value={form.subCustomerGroupName}
                          onChange={handleChange}
                          error={!!errors.subCustomerGroupName}
                          helperText={errors.subCustomerGroupName}
                        >
                          {subCustomerGroupData.length > 0 &&
                            subCustomerGroupData.map((type) => (
                              <MenuItem key={type._id} value={type._id}>
                                {type.subCustomerGroup}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* </Grid> */}
                  </>
                )}
              </Grid>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="prefix">Title</InputLabel>
                    <Select labelId="prefix" label="prefix" name="prefix">
                      {prefixData.length > 0 &&
                        prefixData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.prefix}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    labelId="name"
                    label="Customer Name"
                    name="name"
                    required={true}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField type="date" fullWidth labelId="dob" label="Date of Birth" name="dob" InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[
                  { label: 'Email', name: 'email', required: false },
                  { label: 'Mobile Number', name: 'mobile', required: false },
                  { label: 'PAN Number', name: 'panNumber', required: false },
                  { label: 'ADHAR Number', name: 'adharNumber', required: false },
                  { label: 'DRIVING LICENCE Number', name: 'dlNumber', required: false },
                  { label: 'GST Number', name: 'gstNumber', required: false },
                  { label: 'ADDRESS', name: 'address', required: false },
                  { label: 'PIN CODE', name: 'pin', required: false },
                  { label: 'CITY', name: 'city', required: false },
                  { label: 'STATE', name: 'state', required: false }
                ].map((field) => (
                  <Grid item xs={12} sm={3} key={field.name}>
                    <TextField
                      label={field.label}
                      name={field.name}
                      fullWidth
                      required={field.required || false}
                      onChange={handleChange}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                      inputProps={field.name === 'mobile' ? { maxLength: 10 } : field.name === 'adharNumber' ? { maxLength: 12 } : {}}
                    ></TextField>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          <Divider sx={{ my: 2 }} />

          {form.clientType === 'corporate' ? (
            <>
              <Typography variant="h5" gutterBottom>
                Contact Person
              </Typography>
              <Card>
                <CardContent>
                  {form.contactPerson.map((person, index) => (
                    <Grid container spacing={2} key={index} mb={2}>
                      {['name', 'email', 'phone'].map((field) => (
                        <Grid item xs={12} sm={2} key={field}>
                          <TextField
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={person[field]}
                            onChange={(e) => handleContactChange(index, field, e.target.value)}
                            error={!!errors[`contactPerson.${index}.${field}`]}
                            helperText={errors[`contactPerson.${index}.${field}`]}
                            fullWidth
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select
                          label="Department"
                          value={person.department}
                          onChange={(e) => handleContactChange(index, 'department', e.target.value)}
                          //   error={!!errors[`contactPerson.${index}.department`]}
                          //   helperText={errors[`contactPerson.${index}.department`]}
                          fullWidth
                        >
                          {departmentData.map((option) => (
                            <MenuItem key={option} value={option.department}>
                              {option.department}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select
                          label="Position"
                          value={person.position}
                          onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                          //   error={!!errors[`contactPerson.${index}.position`]}
                          //   helperText={errors[`contactPerson.${index}.position`]}
                          fullWidth
                        >
                          {positionData.map((option) => (
                            <MenuItem key={option} value={option.position}>
                              {option.position}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={1} display="flex" alignItems="center">
                        <IconButton color="primary" onClick={addContact}>
                          <AddIcon fontSize="large" />
                        </IconButton>
                        <IconButton color="error" onClick={() => removeContact(index)} disabled={form.contactPerson.length === 1}>
                          <DeleteIcon fontSize="large" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <></>
          )}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" sx={{ mr: 2 }} onClick={handleSubmit}>
                Save
              </Button>
              <Button variant="contained" sx={{ backgroundColor: 'grey', mr: 2 }}>
                Close
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default AddCustomer;
