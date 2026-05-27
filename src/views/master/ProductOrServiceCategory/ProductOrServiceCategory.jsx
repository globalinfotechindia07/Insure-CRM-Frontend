import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
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
  Paper,
  Box,
  InputAdornment,
  TablePagination,
  CircularProgress
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close, Search, Clear } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gridSpacing } from 'config.js';
import { get, post, put, remove } from '../../../api/api.js';
import { getActiveDepartments } from '../../../services/departmentApi';
import { useSelector } from 'react-redux';
import swal from 'sweetalert';

const initialState = {
  department: '',
  productName: ''
};

const ProductOrServiceCategory = () => {
  const [form, setForm] = useState(initialState);
  const [departmentData, setDepartmentData] = useState([]);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productCategoryPermission, setProductCategoryPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });

  // Pagination & Search states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const systemRights = useSelector((state) => state.systemRights.systemRights);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};
    if (!form.productName || form.productName.trim() === '') {
      newErrors.productName = 'Product Name is required';
    }
    if (!form.department) {
      newErrors.department = 'Department is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= FETCH PRODUCT CATEGORIES =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await get('productOrServiceCategory');
      console.log('Product Categories API Response:', response);
      
      let categories = [];
      if (response.status === true || response.status === 'true') {
        categories = response.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        categories = response.data;
      } else if (Array.isArray(response)) {
        categories = response;
      } else {
        categories = [];
      }
      
      setData(categories);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setData([]);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH DEPARTMENTS =================
  const fetchDepartments = async () => {
    try {
      const res = await getActiveDepartments();
      console.log('Department API Response:', res);
      
      let departments = [];
      if (res.success && Array.isArray(res.data)) {
        departments = res.data;
      } else if (Array.isArray(res)) {
        departments = res;
      } else if (res.data && Array.isArray(res.data)) {
        departments = res.data;
      } else {
        departments = [];
      }
      
      setDepartmentData(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartmentData([]);
    }
  };

  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['product-or-service-category']) {
      setProductCategoryPermission(systemRights.actionPermissions['product-or-service-category']);
    }
    
    fetchData();
    fetchDepartments();
  }, [systemRights]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleOpen = () => {
    setForm(initialState);
    setErrors({});
    setEditIndex(null);
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    const submitData = {
      productName: form.productName.trim(),
      department: form.department
    };

    if (editIndex !== null) {
      // EDIT CASE
      const id = editId;
      
      swal({
        title: "Update Record?",
        text: "Do you want to update this record?",
        icon: "warning",
        buttons: ["Cancel", "Update"],
      }).then(async (willUpdate) => {
        if (willUpdate) {
          try {
            const response = await put(`productOrServiceCategory/${id}`, {
              productName: form.productName.trim(),
              department: form.department
            });
            
            console.log('Update Response:', response);
            
            if (response.status === true || response.status === 'true') {
              await fetchData();
              handleClose();
              swal("Updated!", "Record updated successfully.", "success");
            } else {
              throw new Error(response.message || "Update failed");
            }
          } catch (error) {
            console.error(error);
            swal("Error!", error.message || "Something went wrong.", "error");
          }
        }
      });
    } else {
      // ADD CASE
      try {
        const response = await post('productOrServiceCategory', submitData);
        console.log('Create Response:', response);
        
        if (response.status === true || response.status === 'true') {
          await fetchData();
          toast.success('Record inserted successfully');
          setOpen(false);
          setForm(initialState);
        } else {
          throw new Error(response.message || "Create failed");
        }
      } catch (error) {
        console.error('Submit error:', error);
        toast.error(error.message || 'Error creating record');
      }
    }
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this record!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await remove(`productOrServiceCategory/${id}`);
          console.log('Delete Response:', response);
          
          if (response.status === true || response.status === 'true') {
            await fetchData();
            swal("Deleted!", "Record deleted successfully.", "success");
          } else {
            throw new Error(response.message || "Delete failed");
          }
        } catch (error) {
          console.error(error);
          swal("Error!", error.message || "Something went wrong.", "error");
        }
      }
    });
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (row) => {
    setForm({ 
      productName: row.productName, 
      department: row?.department?._id || row?.department || ''
    });
    setEditIndex(data.findIndex(item => item._id === row._id));
    setEditId(row._id);
    setOpen(true);
  };

  // ================= SEARCH HANDLERS =================
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ================= FILTER DATA =================
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowerSearch = searchTerm.toLowerCase().trim();
    return data.filter((entry) => {
      const productName = entry?.productName?.toLowerCase() || '';
      const department = entry?.department?.name?.toLowerCase() || 
                         entry?.department?.toLowerCase() || '';
      return productName.includes(lowerSearch) || department.includes(lowerSearch);
    });
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const getDepartmentName = (item) => {
    if (item?.department?.name) return item.department.name;
    if (item?.department && typeof item.department === 'string') return item.department;
    return 'N/A';
  };

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Product/Service Category
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Product/Service Category</Typography>
            {(productCategoryPermission.Add === true || isAdmin) && (
              <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                Add Product
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Search Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by product name or department..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>

      {/* Table with Pagination */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Paper sx={{ overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>SN</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell sx={{ width: 200 }}>Department</TableCell>
                  <TableCell sx={{ width: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} />
                      <Typography sx={{ mt: 1 }}>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <TableRow key={row._id || index} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row?.productName}</TableCell>
                      <TableCell>{getDepartmentName(row)}</TableCell>
                      <TableCell>
                        {(productCategoryPermission.Edit === true || isAdmin) && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(row)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        {(productCategoryPermission.Delete === true || isAdmin) && (
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(row._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm ? 'No matching data found' : 'No data available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredData.length > rowsPerPage && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredData.length || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Rows per page:"
                />
              </Box>
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editIndex !== null ? 'Edit Product' : 'Add Product'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            select
            label="Department Name *"
            name="department"
            value={form.department}
            onChange={handleChange}
            error={!!errors.department}
            helperText={errors.department}
            fullWidth
            margin="dense"
            required
          >
            <MenuItem value="">-- Select Department --</MenuItem>
            {departmentData.length > 0 ? (
              departmentData.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No departments found. Please create a department first.</MenuItem>
            )}
          </TextField>
          
          <TextField
            label="Product Name *"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            error={!!errors.productName}
            helperText={errors.productName}
            fullWidth
            margin="dense"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default ProductOrServiceCategory;