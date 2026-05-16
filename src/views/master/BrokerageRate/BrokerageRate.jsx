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
import SaveIcon from '@mui/icons-material/Save';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import value from 'assets/scss/_themes-vars.module.scss';
import swal from 'sweetalert';

import { get, post, put, remove } from '../../../api/api.js';

const BrokerageRate = () => {
  const [form, setForm] = useState({ brokerageRate: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const MAX_LENGTH = 5;

  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  const handleOpen = () => {
    setForm({ brokerageRate: '' });
    setEditIndex(null);
    setErrors({});
    setOpen(true);
  };

  // Fetch all Brokerage Rates from backend
  const fetchBrokerageRate = async () => {
    setLoading(true);
    try {
      const response = await get('brokerageRate');
      console.log('BrokerageRate data:', response.data);
      setData(response.data || []);  // ✅ CHANGE 1: || [] ADD KIYA
    } catch (error) {
      console.error(error);
      setData([]);  // ✅ CHANGE 2: setData([]) ADD KIYA
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerageRate();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // float allow (12.5)
    if (!/^\d*\.?\d*$/.test(value)) return;

    // max length
    if (value.length > MAX_LENGTH) return;

    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.brokerageRate) {
      newErrors.brokerageRate = 'Brokerage Rate is required';
    } else if (form.brokerageRate.length > MAX_LENGTH) {
      newErrors.brokerageRate = `Max ${MAX_LENGTH} characters allowed`;
    } else if (isNaN(form.brokerageRate)) {
      newErrors.brokerageRate = 'Only numeric value allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      if (editIndex !== null) {
        const id = data[editIndex]._id;

        swal({
          title: "Update Brokerage Rate?",
          text: "Do you want to update this record?",
          icon: "warning",
          buttons: ["Cancel", "Update"],
        }).then(async (willUpdate) => {
          if (willUpdate) {
            try {
              await put(`brokerageRate/${id}`, { brokerageRate: form.brokerageRate });
              fetchBrokerageRate();
              setOpen(false);
              setForm({ brokerageRate: '' });
              setEditIndex(null);
              swal("Updated!", "Record updated successfully.", "success");
            } catch (error) {
              console.error(error);
              swal("Error!", "Something went wrong.", "error");
            }
          }
        });
        return;
      } else {
        await post('brokerageRate', { brokerageRate: form.brokerageRate });
        fetchBrokerageRate();
        toast.success('Record Saved Successfully');
      }
      setOpen(false);
      setForm({ brokerageRate: '' });
      setEditIndex(null);
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

  const handleDelete = (index) => {
    const id = data[index]._id;

    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this record!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await remove(`brokerageRate/${id}`);
          fetchBrokerageRate();
          swal("Deleted!", "Record deleted successfully.", "success");
        } catch (error) {
          console.error(error);
          swal("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Brokerage Rate
        </Typography>
      </Breadcrumb>
      
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Brokerage Rate</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Rate
        </Button>
      </Grid>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>Brokerage Rate</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography>⏳ Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.brokerageRate}</TableCell>
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
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No Brokerage Rates found. Click "Add Rate" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editIndex !== null ? 'Edit Brokerage Rate' : 'Add Brokerage Rate'}
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
          <TextField
            label="Brokerage Rate"
            name="brokerageRate"
            value={form.brokerageRate}
            onChange={handleChange}
            error={!!errors.brokerageRate}
            helperText={errors.brokerageRate}
            fullWidth
            margin="dense"
            inputProps={{ maxLength: MAX_LENGTH }}
            autoFocus
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
      <ToastContainer />
    </div>
  );
};

export default BrokerageRate;