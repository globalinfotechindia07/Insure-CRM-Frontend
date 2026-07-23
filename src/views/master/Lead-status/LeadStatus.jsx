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

const LeadStatus = () => {
  const [form, setForm] = useState({
    LeadStatus: '',
    shortForm: '',
    colorCode: ''
  });

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [leadStatusPermission, setLeadStatusPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  const validate = () => {
    const rules = {
      LeadStatus: 'Lead Status',
      shortForm: 'Short Form',
      colorCode: 'Color Code'
    };
    const { isValid } = validateFormFields(form, rules, setErrors, {
      showToast: true,
      toastPrefix: 'Cannot save Lead Status.'
    });
    return isValid;
  };

  // Fetch all lead statuses from backend
  const fetchLeadStatuses = async () => {
    try {
      const response = await get('leadStatus');
      setData(response.data || []);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  // use axiosInstance to fetch data from the server with useEffect
  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['lead-stauts']) {
      setLeadStatusPermission(systemRights.actionPermissions['lead-stauts']);
    }
    fetchLeadStatuses();
  }, [systemRights]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => {
    setForm({
      LeadStatus: '',
      shortForm: '',
      colorCode: ''
    });
    setErrors({});
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // CRUD handlers using axiosInstance
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editIndex !== null) {
        // Update existing
        const id = data[editIndex]._id;
        await put(`leadStatus/${id}`, form);
      } else {
        // Create new
        await post('leadStatus', form);
      }
      setOpen(false);
      setEditIndex(null);
      setForm({ LeadStatus: '', shortForm: '', colorCode: '' });
      fetchLeadStatuses();
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
      await remove(`leadStatus/${id}`);
      fetchLeadStatuses();
    } catch (error) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Lead Status", "Short Form", "Color Code"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.LeadStatus || '').replace(/"/g, '""')}","${(item.shortForm || '').replace(/"/g, '""')}","${(item.colorCode || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lead_statuses.csv");
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
      if (!header.includes("lead status") || !header.includes("short form") || !header.includes("color code")) {
        toast.error("Invalid CSV format. Header must contain 'Lead Status', 'Short Form', and 'Color Code'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const lStatus = row[0] || '';
        const shortForm = row[1] || '';
        const colorCode = row[2] || '';
        if (lStatus && shortForm && colorCode) {
          imported.push({ LeadStatus: lStatus, shortForm, colorCode });
        }
      }

      const existingSet = new Set(data.map(item => (item.LeadStatus || '').toLowerCase().trim()));
      const uniqueNew = imported.filter(item => !existingSet.has(item.LeadStatus.toLowerCase().trim()));

      if (uniqueNew.length === 0) {
        toast.info("No new unique lead statuses found to import.");
        return;
      }

      let successCount = 0;
      for (const item of uniqueNew) {
        try {
          const res = await post("leadStatus", item);
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import lead status: ${item.LeadStatus}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique lead statuses found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique lead statuses successfully!`);
      }
      fetchLeadStatuses();
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
          Lead Status
        </Typography>
      </Breadcrumb>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Lead Status</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(leadStatusPermission.Add === true || isAdmin) && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Lead Status
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
          {editIndex !== null ? 'Edit Lead Status' : 'Add Lead Status'}
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
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Lead Status"
                name="LeadStatus"
                value={form.LeadStatus}
                onChange={handleChange}
                error={!!errors.LeadStatus}
                helperText={errors.LeadStatus}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Short Form"
                name="shortForm"
                value={form.shortForm}
                onChange={handleChange}
                error={!!errors.shortForm}
                helperText={errors.shortForm}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Color Code"
                name="colorCode"
                type="color"
                value={form.colorCode}
                onChange={handleChange}
                error={!!errors.colorCode}
                helperText={errors.colorCode || 'Pick a color'}
                fullWidth
                InputLabelProps={{ shrink: true }} // keeps label visible
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
            sx={{
              minWidth: '40px',
              padding: '2px',
              backgroundColor: value.primaryLight
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
                    <TableCell>Lead Status</TableCell>
                    <TableCell>Short Form</TableCell>
                    <TableCell>Color Code</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.LeadStatus}</TableCell>
                      <TableCell>{row.shortForm}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: 40,
                            height: 25,
                            backgroundColor: row.colorCode,
                            border: '2px solid #ccc ',
                            borderRadius: '4px'
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {(leadStatusPermission.Edit === true || isAdmin) && (
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
                        {(leadStatusPermission.Delete === true || isAdmin) && (
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

export default LeadStatus;
