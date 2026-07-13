import React, { useState } from 'react';
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
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close, Save, Cancel } from '@mui/icons-material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import Breadcrumb from 'component/Breadcrumb';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import swal from 'sweetalert';

import { get, post, put, remove } from '../../../api/api';
import { useSelector } from 'react-redux';

const Priority = () => {
  const [form, setForm] = useState({ Priority: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin,setAdmin]=useState(false);
  const [priorityPermission,setPriorityPermission]=useState({
        View: false,
        Add: false,
        Edit: false,
        Delete: false
      });
  const systemRights = useSelector((state)=>state.systemRights.systemRights);

  const validate = () => {
    const newErrors = {};
    if (!form.Priority.trim()) {
      newErrors.Priority = 'Priority is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => {
    setForm({ Priority: '' });
    setErrors({});
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ Priority: '' });
    setErrors({});
    setEditIndex(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const isEdit = editIndex !== null;

    if (isEdit) {
      swal({
        title: "Update Record?",
        text: "Do you want to update this record?",
        icon: "warning",
        buttons: ["Cancel", "Update"],
      }).then(async (willUpdate) => {
        if (willUpdate) {
          try {
            const id = data[editIndex]._id;
            await put(`priority/update/${id}`, { priorityName: form.Priority.trim() });
            handleClose();
            fetchPriorities();
            swal("Updated!", "Record updated successfully.", "success");
          } catch (error) {
            console.error('Failed to submit form:', error);
            swal("Error!", "Something went wrong.", "error");
          }
        }
      });
    } else {
      try {
        await post('priority', { priorityName: form.Priority.trim() });
        handleClose();
        fetchPriorities();
        toast.success("Record inserted successfully");
      } catch (error) {
        console.error('Failed to submit form:', error);
        toast.error("Something went wrong");
      }
    }
  };

  const handleEdit = (index) => {
    setForm({ Priority: data[index].Priority });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index) => {
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
          await remove(`priority/${id}`);
          fetchPriorities();
          swal("Deleted!", "Record has been deleted successfully.", "success");
        } catch (error) {
          console.error('Failed to delete priority:', error);
          swal("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const fetchPriorities = async () => {
    try {
      const response = await get('priority');
      if (response && response.data) {
        setData(response.data.map(item => ({
          Priority: item.priorityName,
          _id: item._id
        })));
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Failed to fetch priorities:', error);
      setData([]);
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Priority"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.Priority || "").replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "priorities.csv");
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
      if (!header.includes("priority")) {
        toast.error("Invalid CSV format. Header must contain 'Priority'");
        return;
      }

      const importedPriorities = [];
      for (let i = 1; i < lines.length; i++) {
        let val = lines[i];
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        val = val.replace(/""/g, '"').trim();
        if (val) {
          importedPriorities.push(val);
        }
      }

      const existingSet = new Set(data.map(item => item.Priority.toLowerCase().trim()));
      const uniqueNewPriorities = [...new Set(importedPriorities)].filter(p => !existingSet.has(p.toLowerCase().trim()));

      if (uniqueNewPriorities.length === 0) {
        toast.info("No new unique priorities found to import.");
        return;
      }

      let successCount = 0;
      for (const p of uniqueNewPriorities) {
        try {
          const res = await post("priority", { priorityName: p });
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import priority: ${p}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique priorities found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique priorities successfully!`);
      }
      fetchPriorities();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  React.useEffect(() => {
    const loginRole=localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.Priority) {
      setPriorityPermission(systemRights.actionPermissions.Priority);
    }
    fetchPriorities();
  }, [systemRights]);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        title="Priority"
      >
        <Typography component={Link} to="/" variant="subtitle2" color="inherit">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary">
          Priority
        </Typography>
      </Breadcrumb>

      {/* Page Header */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Task Priorities</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(priorityPermission.Add===true || isAdmin) && (
            <Button variant="contained" className="global_btn" startIcon={<Add />} onClick={handleOpen}>
              Add Priority
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

      {/* Modal Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex !== null ? 'Edit Priority' : 'Add Priority'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Priority"
            name="Priority"
            value={form.Priority}
            onChange={handleChange}
            error={!!errors.Priority}
            helperText={errors.Priority}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            color="error"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={editIndex !== null ? <Edit /> : <Save />}
          >
            {editIndex !== null ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Table */}
      <Card>
        <CardContent>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SN</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow key={row._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.Priority}</TableCell>
                      <TableCell align="center">
                        {(priorityPermission.Edit===true || isAdmin) &&<IconButton color="primary" onClick={() => handleEdit(index)}>
                          <Edit />
                        </IconButton>}
                        {(priorityPermission.Delete===true || isAdmin) &&<IconButton color="error" onClick={() => handleDelete(index)}>
                          <Delete />
                        </IconButton>}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No priorities available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default Priority;
