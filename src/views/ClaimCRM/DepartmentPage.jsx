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
} from "@mui/icons-material";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentApi";

const DepartmentPage = () => {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    status: "active",
  });

  // ================= FETCH DEPARTMENTS =================
  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setData(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
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
    try {
      if (isEdit) {
        await updateDepartment(formData._id, {
          name: formData.name,
          description: formData.description,
          status: formData.status,
        });
      } else {
        await createDepartment({
          name: formData.name,
          description: formData.description,
        });
      }
      setOpen(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (item) => {
    setFormData({
      _id: item._id,
      name: item.name,
      description: item.description || "",
      status: item.status,
    });
    setIsEdit(true);
    setOpen(true);
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
        fetchDepartments();
      } catch (error) {
        console.log(error);
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
          Department Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Department
        </Button>
      </Grid>

      {/* ADD/EDIT DIALOG */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEdit ? "Edit Department" : "Add Department"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />

          {isEdit && (
            <TextField
              select
              fullWidth
              margin="dense"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            Save
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
                <TableCell>Department Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === "active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(item)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Departments Found
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

export default DepartmentPage;