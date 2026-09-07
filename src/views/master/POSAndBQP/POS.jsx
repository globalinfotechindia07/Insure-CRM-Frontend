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
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { toast } from 'react-toastify';
import { get, post, put, remove } from 'api/api';

const POS = () => {
  const [posList, setPosList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
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
          toast.success('POS updated successfully');
        }
      } else {
        const response = await post('pos', formData);
        if (response.success || response) {
          toast.success('POS created successfully');
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
    if (window.confirm('Are you sure you want to delete this POS?')) {
      try {
        const response = await remove(`pos/${id}`);
        if (response.success || response) {
          toast.success('POS deleted successfully');
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

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">POS Management</Typography>
        <Box>
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
    </Box>
  );
};

export default POS;
