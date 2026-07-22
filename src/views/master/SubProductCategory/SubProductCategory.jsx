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
  Box,
  MenuItem
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';

import swal from 'sweetalert';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { axiosInstance } from '../../../api/api.js';
import { get, post, put, remove } from '../../../api/api.js';
import { useSelector } from 'react-redux';

const SubProductCategory = () => {
  const [form, setForm] = useState({ productName: '', subProductName: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [productCategory, setProductCategory] = useState([]);
  const [isAdmin, setAdmin] = useState(false);
  const [subProductCategoryPermission, setSubProductCategoryPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  const validate = () => {
    const newErrors = {};
    if (!form.productName) newErrors.productName = 'Product Name is required';
    if (!form.subProductName) newErrors.subProductName = 'Sub Product Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProductCategory = async () => {
    try {
      const response = await get('productOrServiceCategory');
      console.log('product category: ', response?.data);
      setProductCategory(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      setProductCategory([]);
    }
  };
  // use axiosInstance to fetch data from the server with useEffect
  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['sub-product-category']) {
      setSubProductCategoryPermission(systemRights.actionPermissions['sub-product-category']);
    }
    get('SubProductCategory')
      .then((response) => {
        console.log('get sub product category: ', response?.data || []);
        if (response && response.status !== "false" && Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setData([]);
      });

    fetchProductCategory();
  }, [systemRights]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => {
    setForm({ productName: '', subProductName: '' });
    setEditIndex(null);
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Add or update sub product category using axiosInstance
  const handleSubmit = async () => {
    if (validate()) {
      try {
        // if (editIndex !== null) {
        //   // Update
        //   const id = data[editIndex]._id;
        //   const response = await put(`SubProductCategory/${id}`, form);
        //   console.log('Post sub categories data:', response.data);
        //   const updated = [...data];
        //   updated[editIndex] = response.data;
        //   setData(updated);
        if (editIndex !== null) {
  const id = data[editIndex]._id;

  swal({
    title: "Update Record?",
    text: "Do you want to update this record?",
    icon: "warning",
    buttons: ["Cancel", "Update"],
  }).then(async (willUpdate) => {
    if (willUpdate) {
      try {
        const response = await put(`SubProductCategory/${id}`, form);

        const updated = [...data];
        updated[editIndex] = response.data;
        setData(updated);

        setOpen(false);

        swal("Updated!", "Record updated successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });

  return; // 🔥 IMPORTANT (add case run hone se rokega)
}
         else {
          // Add
          const response = await post('SubProductCategory', form);
          const newSubCategory = response.data;
          if (!newSubCategory) {
            console.error('Error: No data returned from POST response.');
            return;
          }
          console.log('Subcategory created:', response.data);
          setData([...(data || []), newSubCategory]);
        }
        setOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Delete sub product category using axiosInstance
  // const handleDelete = async (index) => {
  //   try {
  //     const id = data[index]._id;
  //     await remove(`SubProductCategory/${id}`);
  //     const updated = [...data];
  //     updated.splice(index, 1);
  //     setData(updated);
  //   } catch (error) {
  //     // console.error(error);
  //     console.error('Error deleting sub product category', error);
  //   }
  // };

  // added pop up #M
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
        await remove(`SubProductCategory/${id}`);

        const updated = [...data];
        updated.splice(index, 1);
        setData(updated);

        swal("Deleted!", "Record deleted successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });
};






  const handleEdit = (index) => {
    const item = data[index];
    setForm({
      productName: item.productName || '',
      subProductName: item.subProductName || ''
    });
    setEditIndex(index);
    setOpen(true);
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Product Name", "Sub Product Name"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const pName = item.productName || '';
      const spName = item.subProductName || '';
      csvContent += `"${pName.replace(/"/g, '""')}","${spName.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sub_products.csv");
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
      if (!header.includes("product name") || !header.includes("sub product name")) {
        toast.error("Invalid CSV format. Headers must contain 'Product Name' and 'Sub Product Name'");
        return;
      }

      const validProducts = new Set(productCategory.map(p => p.productName.toLowerCase().trim()));

      const importedItems = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const pName = row[0];
        const spName = row[1];
        if (pName && spName) {
          importedItems.push({ pName, spName });
        }
      }

      const existingSet = new Set((data || []).map(item => {
        const key = `${item.productName.toLowerCase().trim()}_${item.subProductName.toLowerCase().trim()}`;
        return key;
      }));

      const uniqueNewItems = importedItems.filter(item => {
        const key = `${item.pName.toLowerCase().trim()}_${item.spName.toLowerCase().trim()}`;
        return !existingSet.has(key);
      });

      if (uniqueNewItems.length === 0) {
        toast.info("No new unique sub products found to import.");
        return;
      }

      let successCount = 0;
      const missingProducts = new Set();
      for (const item of uniqueNewItems) {
        if (!validProducts.has(item.pName.toLowerCase().trim())) {
          missingProducts.add(item.pName);
          continue;
        }
        try {
          const res = await post("SubProductCategory", {
            productName: item.pName,
            subProductName: item.spName
          });
          if (res.data) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import subproduct: ${item.spName}`, err);
        }
      }

      if (missingProducts.size > 0) {
        toast.error(`Skipped entries with missing product category: ${Array.from(missingProducts).join(", ")}`);
      }

      if (successCount === 0) {
        toast.info("No new unique sub products found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique sub products successfully!`);
      }
      get('SubProductCategory')
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  console.log('porductCategory: ', productCategory);

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Sub product Categories
        </Typography>
      </Breadcrumb>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Sub Product Categories</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(subProductCategoryPermission.Add === true || isAdmin) && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Category
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
          {editIndex !== null ? 'Edit Category' : 'Add Category'}
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
          <TextField
            select
            label="Product Name"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            error={!!errors.productName}
            helperText={errors.productName}
            fullWidth
            margin="dense"
          >
            {productCategory?.map((item, index) => {
              return (
                <MenuItem key={index} value={item.productName}>
                  {item.productName}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            label="Sub Product Name"
            name="subProductName"
            value={form.subProductName}
            onChange={handleChange}
            error={!!errors.subProductName}
            helperText={errors.subProductName}
            fullWidth
            margin="dense"
          />
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
                    <TableCell>Product Name</TableCell>
                    <TableCell>Sub Product Name</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data && Array.isArray(data) && data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>{row.subProductName}</TableCell>
                      <TableCell>
                        {(subProductCategoryPermission.Edit === true || isAdmin) && (
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
                        {(subProductCategoryPermission.Delete === true || isAdmin) && (
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
    </div>
  );
};

export default SubProductCategory;
