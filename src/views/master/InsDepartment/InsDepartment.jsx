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
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { axiosInstance } from '../../../api/api.js';
import { get, post, put, remove } from '../../../api/api.js';
import { useSelector } from 'react-redux';

const InsDepartment = () => {
  const [form, setForm] = useState({ insDepartment: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setOpen(true);
  };

  // Fetch all Insurance departments from backend
const fetchInsDepartments = async () => {
  try {
    const response = await get('insDepartment');
    console.log('InsDepartment data:', response.data);
    setData(response.data || []);  
  } catch (error) {
    console.error(error);
    setData([]);  
  }
};

  useEffect(() => {
    fetchInsDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const newErrors = {};
    if (!form.insDepartment) newErrors.insDepartment = 'Insrance Department Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Submit ', editIndex);
    if (!validate()) return;
    try {
      if (editIndex !== null) {
        // Update existing
        const id = data[editIndex]._id;
        await put(`insDepartment/${id}`, form);
      } else {
        // Create new
        await post('insDepartment', form);
      }
      setOpen(false);
      setForm({ insDepartment: '' });
      setEditIndex(null);
      fetchInsDepartments();
    } catch (error) {
      console.error(error);
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
      await remove(`insDepartment/${id}`);
      fetchInsDepartments();
    } catch (error) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Insurance Department"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.insDepartment || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "insurance_departments.csv");
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
      if (!header.includes("insurance department")) {
        toast.error("Invalid CSV format. Header must contain 'Insurance Department'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const val = lines[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        if (val) {
          imported.push(val);
        }
      }

      const existingSet = new Set(data.map(item => (item.insDepartment || '').toLowerCase().trim()));
      const uniqueNew = [...new Set(imported)].filter(v => !existingSet.has(v.toLowerCase().trim()));

      if (uniqueNew.length === 0) {
        toast.info("No new unique insurance departments found to import.");
        return;
      }

      let successCount = 0;
      for (const val of uniqueNew) {
        try {
          const res = await post("insDepartment", { insDepartment: val });
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import department: ${val}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique insurance departments found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique insurance departments successfully!`);
      }
      fetchInsDepartments();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Insurance Department
        </Typography>
      </Breadcrumb>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Insurance Department</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add Department
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
          Add Insurance Department
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
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
            label="Insurance Department Name"
            name="insDepartment"
            value={form.insDepartment}
            onChange={handleChange}
            error={!!errors.insDepartment}
            helperText={errors.insDepartment}
            fullWidth
            margin="dense"
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
                <TableCell>Insurnace Department Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {data && data.length > 0 ? (
    data.map((item, index) => (
      <TableRow key={item._id || index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{item.insDepartment}</TableCell>
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
           No Insurance Department found. Click "Add Department" to create one.
        </Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </>
  );
};

export default InsDepartment;
