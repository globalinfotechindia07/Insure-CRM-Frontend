import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import value from 'assets/scss/_themes-vars.module.scss';

import { get, post, put, remove } from '../../../api/api.js';

const LicenceValidity = () => {
  const [form, setForm] = useState(initialState());
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  function initialState() {
    return {
      licenseName: '',
      brokerName: '',
      licenseNumber: '',
      startDate: '',
      endDate: '',
      description: ''
    };
  }

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setForm(initialState());
    setEditIndex(null);
    setErrors({});
    setOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.licenseName || form.licenseName.trim() === '') {
      newErrors.licenseName = 'License Name is required';
    }
    if (!form.brokerName || form.brokerName.trim() === '') {
      newErrors.brokerName = 'Broker Name is required';
    }
    if (!form.licenseNumber || form.licenseNumber.trim() === '') {
      newErrors.licenseNumber = 'License Number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch License validity from backend
  const fetchLicenseValidity = async () => {
    setLoading(true);
    try {
      const response = await get('licenseValidity');
      console.log('licenseValidity data:', response.data);
      setData(response.data || []);  // ✅ CHANGE 1: || [] ADD KIYA
    } catch (error) {
      console.error(error);
      setData([]);  // ✅ CHANGE 2: setData([]) ADD KIYA
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseValidity();
  }, []);

  const handleSubmit = async () => {
    console.log('Submit ', editIndex);
    if (!validate()) return;
    
    try {
      if (editIndex !== null) {
        // Update existing
        const id = data[editIndex]._id;
        await put(`licenseValidity/${id}`, form);
        toast.success('Record Edited Successfully');
      } else {
        console.log('Submit', form);
        await post('licenseValidity', form);
        toast.success('Record Saved Successfully');
      }
      setOpen(false);
      setForm(initialState());
      setEditIndex(null);
      fetchLicenseValidity();
    } catch (error) {
      console.error(error);
      toast.error('Operation Failed');
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index) => {
    try {
      const id = data[index]._id;
      await remove(`licenseValidity/${id}`);
      fetchLicenseValidity();
      toast.success('Record Deleted Successfully');
    } catch (error) {
      console.error(error);
      toast.error('Record Deletion Failed');
    }
  };

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          License Validity
        </Typography>
      </Breadcrumb>
      
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">License Validity</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add License
        </Button>
      </Grid>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editIndex !== null ? 'Edit License Validity' : 'Add License Validity'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          {[
            { label: 'Name of License', name: 'licenseName', required: true },
            { label: 'Broker Name', name: 'brokerName', required: true },
            { label: 'License Number', name: 'licenseNumber', required: true }
          ].map((field) => (
            <Grid item xs={12} sm={3} py={1} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                fullWidth
                required={field.required}
                margin="dense"
              />
            </Grid>
          ))}
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error" sx={{ minWidth: '40px', padding: '2px' }}>
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}>
            <IconButton color="inherit">{editIndex !== null ? <EditIcon /> : <SaveIcon />}</IconButton>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>License Name</TableCell>
                <TableCell>Broker Name</TableCell>
                <TableCell>License Number</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>⏳ Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.licenseName}</TableCell>
                    <TableCell>{item.brokerName}</TableCell>
                    <TableCell>{item.licenseNumber}</TableCell>
                    <TableCell>{item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(index)}
                        sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                      >
                        <IconButton color="inherit" size="small">
                          <Edit />
                        </IconButton>
                      </Button>
                      <Button 
                        color="error" 
                        onClick={() => handleDelete(index)} 
                        sx={{ padding: '1px', minWidth: '24px', height: '24px' }}
                      >
                        <IconButton color="inherit" size="small">
                          <Delete />
                        </IconButton>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                       No License records found. Click "Add License" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default LicenceValidity;