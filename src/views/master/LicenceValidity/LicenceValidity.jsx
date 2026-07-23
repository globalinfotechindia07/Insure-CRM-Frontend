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
import { validateFormFields } from '../../../utils/formValidation';
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
    const rules = {
      licenseName: 'License Name',
      brokerName: 'Broker Name',
      licenseNumber: 'License Number'
    };
    const { isValid } = validateFormFields(form, rules, setErrors, {
      showToast: true,
      toastPrefix: 'Cannot save License Validity.'
    });
    return isValid;
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

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["License Name", "Broker Name", "License Number", "Start Date", "End Date", "Description"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const startD = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
      const endD = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '';
      csvContent += `"${(item.licenseName || '').replace(/"/g, '""')}","${(item.brokerName || '').replace(/"/g, '""')}","${(item.licenseNumber || '').replace(/"/g, '""')}","${startD}","${endD}","${(item.description || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "license_validities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
      if (lines.length <= 1) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes("license name") || !header.includes("broker name") || !header.includes("license number")) {
        toast.error("Invalid CSV format. Header must contain 'License Name', 'Broker Name', and 'License Number'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const lName = row[0] || '';
        const bName = row[1] || '';
        const lNum = row[2] || '';
        const sDate = row[3] || '';
        const eDate = row[4] || '';
        const desc = row[5] || '';
        if (lName && bName && lNum) {
          imported.push({
            licenseName: lName,
            brokerName: bName,
            licenseNumber: lNum,
            startDate: sDate,
            endDate: eDate,
            description: desc
          });
        }
      }

      const existingSet = new Set(data.map(item => `${(item.licenseName || '').toLowerCase().trim()}_${(item.licenseNumber || '').toLowerCase().trim()}`));
      const uniqueNew = imported.filter(item => !existingSet.has(`${item.licenseName.toLowerCase().trim()}_${item.licenseNumber.toLowerCase().trim()}`));

      if (uniqueNew.length === 0) {
        toast.info("No new unique licenses found to import.");
        return;
      }

      let successCount = 0;
      for (const item of uniqueNew) {
        try {
          const res = await post("licenseValidity", item);
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import license: ${item.licenseName}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique licenses found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique licenses successfully!`);
      }
      fetchLicenseValidity();
    };
    reader.readAsText(file);
    e.target.value = '';
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add License
          </Button>
          <Button variant="contained" color="secondary" onClick={exportCSV} disabled={localStorage.getItem('loginRole') !== 'admin'}>
            Export
          </Button>
          <Button variant="contained" component="label" sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
            Import
            <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
          </Button>
        </div>
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