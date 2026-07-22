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
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import swal from 'sweetalert';

// import { axiosInstance } from '../../../api/api.js';

import { get, post, put, remove } from '../../../api/api.js';
import { useSelector } from 'react-redux';

const TaskStatus = () => {
  const [form, setForm] = useState({
    TaskStatus: '',
    shortForm: '',
    colorCode: ''
  });

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [taskStatusPermission, setTaskStatusPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  const validate = () => {
    const newErrors = {};
    if (!form.TaskStatus) newErrors.TaskStatus = 'Task Status is required';
    if (!form.shortForm) newErrors.shortForm = 'Short Form is required';
    if (!form.colorCode) newErrors.colorCode = 'Color Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch all task statuses from backend
  const fetchTaskStatuses = async () => {
    try {
      const response = await get('taskStatus');
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
    if (systemRights?.actionPermissions?.['Task Status']) {
      setTaskStatusPermission(systemRights.actionPermissions['Task Status']);
    }
    fetchTaskStatuses();
  }, [systemRights]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => {
    setForm({
      TaskStatus: '',
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
            await put(`taskStatus/${id}`, form);
            setOpen(false);
            setEditIndex(null);
            setForm({ TaskStatus: '', shortForm: '', colorCode: '' });
            fetchTaskStatuses();
            swal("Updated!", "Record updated successfully.", "success");
          } catch (error) {
            console.error(error);
            swal("Error!", "Something went wrong.", "error");
          }
        }
      });
    } else {
      try {
        await post('taskStatus', form);
        setOpen(false);
        setForm({ TaskStatus: '', shortForm: '', colorCode: '' });
        fetchTaskStatuses();
        toast.success("Record inserted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
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
          await remove(`taskStatus/${id}`);
          fetchTaskStatuses();
          swal("Deleted!", "Record has been deleted successfully.", "success");
        } catch (error) {
          console.error(error);
          swal("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Task Status", "Short Form", "Color Code"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.TaskStatus || "").replace(/"/g, '""')}","${(item.shortForm || "").replace(/"/g, '""')}","${(item.colorCode || "").replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "task_statuses.csv");
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
      if (!header.includes("task status") || !header.includes("short form")) {
        toast.error("Invalid CSV format. Header must contain 'Task Status' and 'Short Form'");
        return;
      }

      const importedStatuses = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const statusVal = row[0];
        const shortVal = row[1];
        const colorVal = row[2] || '#000000';
        if (statusVal && shortVal) {
          importedStatuses.push({ TaskStatus: statusVal, shortForm: shortVal, colorCode: colorVal });
        }
      }

      const existingSet = new Set(data.map(item => item.TaskStatus.toLowerCase().trim()));
      const uniqueNewStatuses = importedStatuses.filter(item => !existingSet.has(item.TaskStatus.toLowerCase().trim()));

      if (uniqueNewStatuses.length === 0) {
        toast.info("No new unique task statuses found to import.");
        return;
      }

      let successCount = 0;
      for (const item of uniqueNewStatuses) {
        try {
          const res = await post("taskStatus", item);
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import task status: ${item.TaskStatus}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique task statuses found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique task statuses successfully!`);
      }
      fetchTaskStatuses();
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
          Task Status
        </Typography>
      </Breadcrumb>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Task Status</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(taskStatusPermission.Add === true || isAdmin) && (
            <Button variant="contained" className="global_btn" startIcon={<Add />} onClick={handleOpen}>
              Add Task Status
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
          {editIndex !== null ? 'Edit Task Status' : 'Add Task Status'}
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
                label="Task Status"
                name="TaskStatus"
                value={form.TaskStatus}
                onChange={handleChange}
                error={!!errors.TaskStatus}
                helperText={errors.TaskStatus}
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
                type="color" // 🔥 color picker
                value={form.colorCode || '#000000'} // fallback hex if empty
                onChange={handleChange}
                error={!!errors.colorCode}
                helperText={errors.colorCode}
                fullWidth
                InputLabelProps={{ shrink: true }} // keeps label visible above picker
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
                    <TableCell>Task Status</TableCell>
                    <TableCell>Short Form</TableCell>
                    <TableCell>Color Code</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.TaskStatus}</TableCell>
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
                        {(taskStatusPermission.Edit === true || isAdmin) && (
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
                        {(taskStatusPermission.Delete === true || isAdmin) && (
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

export default TaskStatus;
