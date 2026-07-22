import React, { useEffect, useState } from "react";

import {
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";

import { 
  Add, 
  Edit, 
  Delete, 
  Visibility,
  PowerSettingsNew,
  Close
} from "@mui/icons-material";

import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  createInvestigator,
  getInvestigators,
  updateInvestigator,
  deleteInvestigator,
  toggleInvestigatorStatus,
  getSingleInvestigator,
} from "../../services/investigator.service";

const InvestigatorPage = () => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [viewDialog, setViewDialog] = useState({
    open: false,
    investigator: null,
  });

  const [formData, setFormData] = useState({
    investigatorName: "",
    email: "",
    contactNo: "",
    address: "",
    status: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getInvestigators();
      setData(res.data?.data || res.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch investigators", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Handle Edit with SweetAlert Confirmation
  const handleEditClick = (investigator) => {
    Swal.fire({
      title: 'Edit Investigator',
      text: `Are you sure you want to edit "${investigator.investigatorName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff9800',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Edit',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMode(true);
        setSelectedId(investigator._id);
        setFormData({
          investigatorName: investigator.investigatorName || "",
          email: investigator.email || "",
          contactNo: investigator.contactNo || "",
          address: investigator.address || "",
          status: investigator.status !== undefined ? investigator.status : true,
        });
        setOpen(true);
      }
    });
  };

  // Handle Delete with SweetAlert Confirmation
  const handleDeleteClick = (id, name) => {
    Swal.fire({
      title: 'Delete Investigator',
      html: `Are you sure you want to delete <strong>"${name}"</strong>?<br/><span style="color: red;">This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await deleteInvestigator(id);
          Swal.fire({
            title: 'Deleted!',
            text: 'Investigator has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            timer: 2000
          });
          fetchData();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete investigator',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle Status Toggle with SweetAlert Confirmation
  const handleStatusClick = (id, currentStatus, name) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const actionText = currentStatus ? 'Deactivate' : 'Activate';
    const icon = currentStatus ? 'warning' : 'info';
    const confirmButtonColor = currentStatus ? '#d33' : '#4caf50';
    
    Swal.fire({
      title: `${actionText} Investigator`,
      text: `Are you sure you want to ${action} "${name}"?`,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await toggleInvestigatorStatus(id);
          Swal.fire({
            title: `${actionText}d!`,
            text: `Investigator has been ${action}d successfully.`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            timer: 2000
          });
          fetchData();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: `Failed to ${action} investigator`,
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleOpenDialog = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({
      investigatorName: "",
      email: "",
      contactNo: "",
      address: "",
      status: true,
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedId(null);
    setFormData({
      investigatorName: "",
      email: "",
      contactNo: "",
      address: "",
      status: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.investigatorName) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Investigator name is required!',
        icon: 'error',
        confirmButtonColor: '#d33',
        timer: 2000
      });
      return;
    }

    setLoading(true);
    try {
      if (editMode) {
        await updateInvestigator(selectedId, formData);
        Swal.fire({
          title: 'Updated!',
          text: 'Investigator has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });
      } else {
        await createInvestigator(formData);
        Swal.fire({
          title: 'Created!',
          text: 'Investigator has been created successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Operation failed',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvestigator = async (id) => {
    try {
      const res = await getSingleInvestigator(id);
      setViewDialog({
        open: true,
        investigator: res.data?.data || res.data,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch investigator details',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Investigator Name", "Email ID", "Contact No", "Address", "Status"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.investigatorName || '').replace(/"/g, '""')}","${(item.email || '').replace(/"/g, '""')}","${(item.contactNo || '').replace(/"/g, '""')}","${(item.address || '').replace(/"/g, '""')}","${item.status ? 'Active' : 'Inactive'}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "investigators.csv");
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
      if (!header.includes("investigator name")) {
        toast.error("Invalid CSV format. Header must contain 'Investigator Name'");
        return;
      }

      const importedInvestigators = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const investigatorName = row[0];
        const email = row[1] || '';
        const contactNo = row[2] || '';
        const address = row[3] || '';
        const status = row[4] ? row[4].toLowerCase() === 'active' : true;
        if (investigatorName) {
          importedInvestigators.push({
            investigatorName,
            email,
            contactNo,
            address,
            status
          });
        }
      }

      const existingNames = new Set(data.map(item => (item.investigatorName || '').toLowerCase().trim()));
      const uniqueNewInvestigators = importedInvestigators.filter(inv => !existingNames.has(inv.investigatorName.toLowerCase().trim()));

      if (uniqueNewInvestigators.length === 0) {
        toast.info("No new unique investigators found to import.");
        return;
      }

      let successCount = 0;
      for (const inv of uniqueNewInvestigators) {
        try {
          const res = await createInvestigator(inv);
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import investigator: ${inv.investigatorName}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique investigators found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique investigators successfully!`);
      }
      fetchData();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Investigator Master</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            className="global_btn"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Add Investigator
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Investigator" : "Add Investigator"}
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Investigator Name *"
            value={formData.investigatorName}
            onChange={(e) =>
              setFormData({
                ...formData,
                investigatorName: e.target.value,
              })
            }
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Contact No"
            value={formData.contactNo}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactNo: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Address"
            multiline
            rows={3}
            value={formData.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value,
              })
            }
          />
          {editMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked,
                    })
                  }
                />
              }
              label={formData.status ? "Active" : "Inactive"}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, investigator: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Investigator Details</DialogTitle>
        <DialogContent>
          {viewDialog.investigator && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {viewDialog.investigator.investigatorName}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Email:</strong> {viewDialog.investigator.email || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Contact No:</strong> {viewDialog.investigator.contactNo || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Address:</strong> {viewDialog.investigator.address || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Status:</strong>{" "}
                <Chip
                  label={viewDialog.investigator.status ? "Active" : "Inactive"}
                  color={viewDialog.investigator.status ? "success" : "error"}
                  size="small"
                />
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Created At:</strong>{" "}
                {viewDialog.investigator.createdAt ? new Date(viewDialog.investigator.createdAt).toLocaleDateString() : "N/A"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, investigator: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">No investigators found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.investigatorName}</TableCell>
                    <TableCell>{item.email || "-"}</TableCell>
                    <TableCell>{item.contactNo || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status ? "Active" : "Inactive"}
                        color={item.status ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewInvestigator(item._id)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleEditClick(item)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleStatusClick(item._id, item.status, item.investigatorName)}
                        title={item.status ? "Deactivate" : "Activate"}
                      >
                        <PowerSettingsNew fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(item._id, item.investigatorName)}
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <ToastContainer />
    </div>
  );
};

export default InvestigatorPage;