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
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  Close,
} from "@mui/icons-material";

import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/companyService";

import Swal from "sweetalert2";

const CompanyPage = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    status: "active",
  });

  // ================= FETCH COMPANIES =================
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getCompanies();
      setData(res.data || []);
    } catch (error) {
      console.log(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Company name is required!",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isEdit) {
        await updateCompany(formData._id, {
          name: formData.name,
          description: formData.description,
          status: formData.status,
        });
        
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Company updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createCompany({
          name: formData.name,
          description: formData.description || "",
        });
        
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Company created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.log(error);
      
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: isEdit ? "Error updating company" : "Error creating company",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (item) => {
    setFormData({
      _id: item._id,
      name: item.name,
      description: item.description || "",
      status: item.status || "active",
    });
    setIsEdit(true);
    setOpen(true);
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteCompany(id);
        fetchCompanies();
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Company deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.log(error);
        
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error deleting company",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      _id: "",
      name: "",
      description: "",
      status: "active",
    });
    setIsEdit(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <div>
      {/* HEADER */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          Company
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Company
        </Button>
      </Grid>

      {/* ADD/EDIT DIALOG - Endorsement Style */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {isEdit ? "Edit Company" : "Add Company"}
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
            label="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
            required
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="dense"
          />

          {isEdit && (
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              margin="dense"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleClose} 
            variant="contained" 
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TABLE */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography>⏳ Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status || "active"}
                        color={(item.status || "active") === "active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(item)}
                        sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                      >
                        <IconButton color="inherit" size="small">
                          <Edit />
                        </IconButton>
                      </Button>
                      <Button 
                        color="error" 
                        onClick={() => handleDelete(item._id)} 
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No Company found. Click "Add Company" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPage;