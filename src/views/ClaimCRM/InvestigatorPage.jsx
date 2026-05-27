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
  PowerSettingsNew 
} from "@mui/icons-material";

import Swal from "sweetalert2";

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
      setData(res.data.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch investigators", "error");
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
        investigator: res.data.data,
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

  return (
    <div>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Investigator Master</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Add Investigator
        </Button>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Investigator" : "Add Investigator"}</DialogTitle>
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
                {new Date(viewDialog.investigator.createdAt).toLocaleDateString()}
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
    </div>
  );
};

export default InvestigatorPage;