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
, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';
import REACT_APP_API_URL, { get, post, put, remove, retrieveToken } from 'api/api';

const BQP = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [bqpList, setBqpList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [patternOpen, setPatternOpen] = useState(false);
  const [patternData, setPatternData] = useState({ prefix: 'BQP-', nextSequence: 1, paddingSize: 3 });
  
  const initialFormData = {
    bqpName: '',
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

  const fetchBQP = async () => {
    try {
      const response = await get('bqp');
      if (response.success || response.data) {
        setBqpList(response.data || response);
      }
    } catch (error) {
      toast.error('Failed to fetch BQP data');
    }
  };

  const fetchPattern = async () => {
    try {
      const response = await get('bqp-pattern');
      if (response.success || response.data) {
        setPatternData(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pattern', error);
    }
  };

  useEffect(() => {
    fetchBQP();
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
      const response = await post('bqp-pattern', patternData);
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
        const response = await put(`bqp/${editId}`, formData);
        if (response.success || response) {
          Swal.fire({ title: 'Success!', text: 'BQP updated successfully', icon: 'success', timer: 2000, showConfirmButton: false });
        }
      } else {
        const response = await post('bqp', formData);
        if (response.success || response) {
          Swal.fire({ title: 'Success!', text: 'BQP created successfully', icon: 'success', timer: 2000, showConfirmButton: false });
        }
      }
      fetchBQP();
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (bqp) => {
    setFormData({
      bqpName: bqp.bqpName || '',
      address: bqp.address || '',
      contactNumber: bqp.contactNumber || '',
      emailId: bqp.emailId || '',
      codeNumber: bqp.codeNumber || '',
      aadharNumber: bqp.aadharNumber || '',
      panNumber: bqp.panNumber || '',
      lastTrainingAttended: bqp.lastTrainingAttended ? bqp.lastTrainingAttended.split('T')[0] : '',
      nextTrainingDueDate: bqp.nextTrainingDueDate ? bqp.nextTrainingDueDate.split('T')[0] : '',
      reminderAlerts: bqp.reminderAlerts || false,
    });
    setEditId(bqp._id);
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
        const response = await remove(`bqp/${id}`);
        if (response.success || response) {
          Swal.fire('Deleted!', 'BQP has been deleted.', 'success');
          fetchBQP();
        }
      } catch (error) {
        toast.error('Failed to delete BQP');
      }
    }
  };

  const handleToggleAlert = async (bqp) => {
    try {
      const response = await put(`bqp/${bqp._id}`, { ...bqp, reminderAlerts: !bqp.reminderAlerts });
      if (response.success || response) {
        toast.success(`Alerts ${!bqp.reminderAlerts ? 'enabled' : 'disabled'} successfully`);
        fetchBQP();
      }
    } catch (error) {
      toast.error('Failed to toggle alert status');
    }
  };


  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = retrieveToken();
      const url = `${REACT_APP_API_URL}bqp/export-csv`;

      const response = await axios.get(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        responseType: 'blob'
      });

      const filename = `bqp.xlsx`;
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 300);

      toast.success('BQP exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting BQP data');
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
      const response = await axios.post(`${REACT_APP_API_URL}bqp/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.data.success || response.data) {
        toast.success(response.data.message || 'BQP data imported successfully');
        fetchBQP();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error importing BQP data');
    } finally {
      setIsImporting(false);
      e.target.value = null; // Reset input
    }
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">BQP Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant="contained"
            color="success"
            component="label"
            startIcon={isImporting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
            <input type="file" hidden accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleImportCSV} />
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<SettingsIcon />} onClick={handlePatternOpen}>
            Define Pattern
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
            Add BQP
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>BQP Name</strong></TableCell>
              <TableCell><strong>Code Number</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Next Training</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bqpList.length > 0 ? bqpList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bqp) => (
              <TableRow key={bqp._id}>
                <TableCell>{bqp.bqpName}</TableCell>
                <TableCell>{bqp.codeNumber}</TableCell>
                <TableCell>{bqp.contactNumber}</TableCell>
                <TableCell>{bqp.emailId}</TableCell>
                <TableCell>{bqp.nextTrainingDueDate ? new Date(bqp.nextTrainingDueDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title={bqp.reminderAlerts ? "Disable Alerts" : "Enable Alerts"}>
                    <IconButton color={bqp.reminderAlerts ? "success" : "default"} onClick={() => handleToggleAlert(bqp)}>
                      {bqp.reminderAlerts ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => handleEdit(bqp)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(bqp._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No BQP records found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={bqpList.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page:"
            />

      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit BQP' : 'Add New BQP'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField fullWidth label="Name of BQP" name="bqpName" value={formData.bqpName} onChange={handleChange} required />
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
        <DialogTitle>Define BQP Code Pattern</DialogTitle>
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
                <TextField fullWidth type="number" label="Padding Size" name="paddingSize" value={patternData.paddingSize} onChange={handlePatternChange} required helperText="e.g. 3 for BQP-001" />
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
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

export default BQP;
