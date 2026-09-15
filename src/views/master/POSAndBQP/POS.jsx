import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Backdrop,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';
import REACT_APP_API_URL, { get, post, put, remove, retrieveToken } from 'api/api';

const POS = () => {
  const [posList, setPosList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [patternOpen, setPatternOpen] = useState(false);
  const [patternData, setPatternData] = useState({ prefix: 'POS-', nextSequence: 1, paddingSize: 3 });
  
  const initialFormData = {
    posName: '',
    address: '',
    contactNumber: '',
    emailId: '',
    codeNumber: '',
    aadharNumber: '',
    panNumber: '',
    lastTrainingAttended: '',
    nextTrainingDueDate: '',
    reminderAlerts: false,
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchPOS = async () => {
    try {
      const response = await get('pos');
      if (response.success || response.data) {
        setPosList(response.data || response);
      }
    } catch (error) {
      toast.error('Failed to fetch POS data');
    }
  };

  const fetchPattern = async () => {
    try {
      const response = await get('pos-pattern');
      if (response.success || response.data) {
        setPatternData(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pattern', error);
    }
  };

  useEffect(() => {
    fetchPOS();
    fetchPattern();
  }, []);

  const handlePatternOpen = () => setPatternOpen(true);
  const handlePatternClose = () => setPatternOpen(false);

  const handlePatternChange = (e) => {
    const { name, value } = e.target;
    setPatternData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatternSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await post('pos-pattern', patternData);
      if (response.success || response) {
        toast.success('Pattern defined successfully');
      }
      handlePatternClose();
    } catch (error) {
      toast.error('Failed to define pattern');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const response = await put(`pos/${editId}`, formData);
        if (response.success || response) {
          Swal.fire({ title: 'Success!', text: 'POS updated successfully', icon: 'success', timer: 2000, showConfirmButton: false });
        }
      } else {
        const response = await post('pos', formData);
        if (response.success || response) {
          Swal.fire({ title: 'Success!', text: 'POS created successfully', icon: 'success', timer: 2000, showConfirmButton: false });
        }
      }
      fetchPOS();
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (pos) => {
    setFormData({
      posName: pos.posName || '',
      address: pos.address || '',
      contactNumber: pos.contactNumber || '',
      emailId: pos.emailId || '',
      codeNumber: pos.codeNumber || '',
      aadharNumber: pos.aadharNumber || '',
      panNumber: pos.panNumber || '',
      lastTrainingAttended: pos.lastTrainingAttended ? pos.lastTrainingAttended.split('T')[0] : '',
      nextTrainingDueDate: pos.nextTrainingDueDate ? pos.nextTrainingDueDate.split('T')[0] : '',
      reminderAlerts: pos.reminderAlerts || false,
    });
    setEditId(pos._id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await remove(`pos/${id}`);
        if (response.success || response) {
          Swal.fire('Deleted!', 'POS has been deleted.', 'success');
          fetchPOS();
        }
      } catch (error) {
        toast.error('Failed to delete POS');
      }
    }
  };

  const handleToggleAlert = async (pos) => {
    try {
      const response = await put(`pos/${pos._id}`, { ...pos, reminderAlerts: !pos.reminderAlerts });
      if (response.success || response) {
        toast.success(`Alerts ${!pos.reminderAlerts ? 'enabled' : 'disabled'} successfully`);
        fetchPOS();
      }
    } catch (error) {
      toast.error('Failed to toggle alert status');
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = retrieveToken();
      const url = `${REACT_APP_API_URL}pos/export-csv`;

      const response = await axios.get(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        responseType: 'blob'
      });

      const filename = `pos.xlsx`;
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 300);

      toast.success('POS exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting POS data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const token = retrieveToken();
      const response = await axios.post(`${REACT_APP_API_URL}pos/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.data.success || response.data) {
        toast.success(response.data.message || 'POS data imported successfully');
        fetchPOS();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error importing POS data');
    } finally {
      setIsImporting(false);
      e.target.value = null; // Reset input
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">POS Management</Typography>
        <Box>
          <Button variant="contained" color="secondary" onClick={handleExportCSV} disabled={isExporting} sx={{ mr: 2 }}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button variant="contained" color="success" component="label" disabled={isImporting} sx={{ mr: 2 }}>
            {isImporting ? 'Importing...' : 'Import'}
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" hidden onChange={handleImportCSV} />
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<SettingsIcon />} onClick={handlePatternOpen} sx={{ mr: 2 }}>
            Define Pattern
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
            Add POS
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>POS Name</strong></TableCell>
              <TableCell><strong>Code Number</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Next Training</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posList.length > 0 ? posList.map((pos) => (
              <TableRow key={pos._id}>
                <TableCell>{pos.posName}</TableCell>
                <TableCell>{pos.codeNumber}</TableCell>
                <TableCell>{pos.contactNumber}</TableCell>
                <TableCell>{pos.emailId}</TableCell>
                <TableCell>{pos.nextTrainingDueDate ? new Date(pos.nextTrainingDueDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title={pos.reminderAlerts ? "Disable Alerts" : "Enable Alerts"}>
                    <IconButton color={pos.reminderAlerts ? "success" : "default"} onClick={() => handleToggleAlert(pos)}>
                      {pos.reminderAlerts ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => handleEdit(pos)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(pos._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No POS records found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit POS' : 'Add New POS'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField fullWidth label="Name of POS" name="posName" value={formData.posName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="email" label="E-Mail ID" name="emailId" value={formData.emailId} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Code Number" name="codeNumber" value={formData.codeNumber || 'Auto-generated'} onChange={handleChange} disabled />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Last Training Attended" name="lastTrainingAttended" value={formData.lastTrainingAttended} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Next Training Due Date" name="nextTrainingDueDate" value={formData.nextTrainingDueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={formData.reminderAlerts} onChange={handleChange} name="reminderAlerts" color="primary" />}
                  label="Enable Automated Expiry Alerts (Reminder)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">{editId ? 'Update' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={patternOpen} onClose={handlePatternClose} maxWidth="sm" fullWidth>
        <DialogTitle>Define POS Code Pattern</DialogTitle>
        <form onSubmit={handlePatternSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Prefix" name="prefix" value={patternData.prefix} onChange={handlePatternChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Starting Number" name="nextSequence" value={patternData.nextSequence} onChange={handlePatternChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Padding Size" name="paddingSize" value={patternData.paddingSize} onChange={handlePatternChange} required helperText="e.g. 3 for POS-001" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePatternClose} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save Pattern</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => Math.max(theme.zIndex.drawer + 1, 1400),
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
        open={isImporting || isExporting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 3, color: '#ffffff', fontWeight: 'bold', letterSpacing: 1 }}>
            {isExporting ? 'Exporting Data... Please wait.' : 'Importing Data... Please wait.'}
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default POS;
