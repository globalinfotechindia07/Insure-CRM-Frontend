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

const Incoterms = () => {
  const [form, setForm] = useState({ incoterms: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setForm({ incoterms: '' });
    setEditIndex(null);
    setErrors({});
    setOpen(true);
  };

  // Fetch all Incoterms from backend
  const fetchIncoterms = async () => {
    setLoading(true);
    try {
      const response = await get('incoterms');
      console.log('incoterms data:', response);
      setData(response.data || []);  // ✅ CHANGE 1: || [] ADD KIYA
    } catch (error) {
      console.error(error);
      setData([]);  // ✅ CHANGE 2: setData([]) ADD KIYA
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncoterms();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.incoterms || form.incoterms.trim() === '') {
      newErrors.incoterms = 'Incoterms Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Submit ', form);
    if (!validate()) return;
    
    try {
      if (editIndex !== null) {
        // Update existing
        const id = data[editIndex]._id;
        await put(`incoterms/${id}`, { incoterms: form.incoterms });
        toast.success('Record Edited Successfully');
      } else {
        // Create new
        await post('incoterms', { incoterms: form.incoterms });
        toast.success('Record Saved Successfully');
      }
      setOpen(false);
      setForm({ incoterms: '' });
      setEditIndex(null);
      fetchIncoterms();
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
      await remove(`incoterms/${id}`);
      fetchIncoterms();
      toast.success('Record Deleted Successfully');
    } catch (error) {
      console.error(error);
      toast.error('Delete Failed');
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Incoterms"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.incoterms || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "incoterms.csv");
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
      if (!header.includes("incoterms")) {
        toast.error("Invalid CSV format. Header must contain 'Incoterms'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const val = lines[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        if (val) {
          imported.push(val);
        }
      }

      const existingSet = new Set(data.map(item => (item.incoterms || '').toLowerCase().trim()));
      const uniqueNew = [...new Set(imported)].filter(v => !existingSet.has(v.toLowerCase().trim()));

      if (uniqueNew.length === 0) {
        toast.info("No new unique incoterms found to import.");
        return;
      }

      let successCount = 0;
      for (const val of uniqueNew) {
        try {
          const res = await post("incoterms", { incoterms: val });
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import incoterms: ${val}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique incoterms found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique incoterms successfully!`);
      }
      fetchIncoterms();
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
          Incoterms
        </Typography>
      </Breadcrumb>
      
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Incoterms</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add Incoterms
          </Button>
          <Button variant="contained" color="secondary" onClick={exportCSV}>
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
          {editIndex !== null ? 'Edit Incoterms' : 'Add Incoterms'}
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
            label="Incoterms"
            name="incoterms"
            value={form.incoterms}
            onChange={handleChange}
            error={!!errors.incoterms}
            helperText={errors.incoterms}
            fullWidth
            margin="dense"
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

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>Incoterms Name</TableCell>
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
                    <TableCell>{item.incoterms}</TableCell>
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
                       No Incoterms found. Click "Add Incoterms" to create one.
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

export default Incoterms;