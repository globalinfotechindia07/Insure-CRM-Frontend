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
  IconButton,
  Box
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { validateFormFields } from '../../../utils/formValidation';
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

const LeadReference = () => {
  const [form, setForm] = useState({
    LeadReference: ''
  });

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [isAdmin, setAdmin] = useState(false);
  const [leadReferencePermission, setLeadReferencePermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  const validate = () => {
    const rules = { LeadReference: 'Lead Reference' };
    const { isValid } = validateFormFields(form, rules, setErrors, {
      showToast: true,
      toastPrefix: 'Cannot save Lead Reference.'
    });
    return isValid;
  };

  // use axiosInstance to fetch data from the server with useEffect
  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['lead-reference']) {
      setLeadReferencePermission(systemRights.actionPermissions['lead-reference']);
    }
    fetchLeadReferences();
  }, [systemRights]);

  // Fetch all lead references from backend
  const fetchLeadReferences = async () => {
    try {
      const response = await get('leadReference');
      console.log('reference data=--:', response.data);
      setData(response.data || []);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => {
    setForm({ LeadReference: '' });
    setErrors({});
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editIndex !== null) {
        // Update existing
        const id = data[editIndex]._id;
        await put(`leadReference/${id}`, form);
      } else {
        // Create new
        await post('leadReference', form);
      }
      setOpen(false);
      setEditIndex(null);
      setForm({ LeadReference: '' });
      fetchLeadReferences();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (index) => {
    setForm({ LeadReference: data[index].LeadReference });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index) => {
    try {
      const id = data[index]._id;
      await remove(`leadReference/${id}`);
      fetchLeadReferences();
    } catch (error) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Lead Reference"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.LeadReference || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lead_references.csv");
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
      if (!header.includes("lead reference")) {
        toast.error("Invalid CSV format. Header must contain 'Lead Reference'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const val = lines[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        if (val) {
          imported.push(val);
        }
      }

      const existingSet = new Set(data.map(item => (item.LeadReference || '').toLowerCase().trim()));
      const uniqueNew = [...new Set(imported)].filter(v => !existingSet.has(v.toLowerCase().trim()));

      if (uniqueNew.length === 0) {
        toast.info("No new unique lead references found to import.");
        return;
      }

      let successCount = 0;
      for (const val of uniqueNew) {
        try {
          const res = await post("leadReference", { LeadReference: val });
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import lead reference: ${val}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique lead references found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique lead references successfully!`);
      }
      fetchLeadReferences();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Lead Reference
        </Typography>
      </Breadcrumb>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Lead Reference</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(leadReferencePermission.Add === true || isAdmin) && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Lead Reference
            </Button>
          )}
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
          {editIndex !== null ? 'Edit Lead Reference' : 'Add Lead Reference'}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Lead Reference"
                name="LeadReference"
                value={form.LeadReference}
                onChange={handleChange}
                error={!!errors.LeadReference}
                helperText={errors.LeadReference}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            color="error"
            sx={{
              minWidth: '40px',
              padding: '2px'
            }}
          >
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{
              minWidth: '40px',
              padding: '2px'
            }}
          >
            <IconButton color="inherit">{editIndex !== null ? <EditIcon /> : <SaveIcon />}</IconButton>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table */}
      {data?.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SN</TableCell>
                    <TableCell>Lead Reference</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.LeadReference}</TableCell>
                      <TableCell>
                        {(leadReferencePermission.Edit === true || isAdmin) && (
                          <Button
                            size="small"
                            onClick={() => handleEdit(index)}
                            sx={{
                              padding: '1px',
                              minWidth: '24px',
                              height: '24px',
                              mr: '5px'
                            }}
                          >
                            <IconButton color="inherit">
                              <Edit />
                            </IconButton>
                          </Button>
                        )}
                        {(leadReferencePermission.Delete === true || isAdmin) && (
                          <Button
                            color="error"
                            onClick={() => handleDelete(index)}
                            sx={{
                              padding: '1px',
                              minWidth: '24px',
                              height: '24px'
                            }}
                          >
                            <IconButton color="inherit">
                              <Delete />
                            </IconButton>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}
      <ToastContainer />
    </div>
  );
};

export default LeadReference;
