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
  IconButton
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close, ContactSupportOutlined } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';

import swal from 'sweetalert';

// import { axiosInstance } from '../../../api/api.js';
import { get, post, put, remove } from '../../../api/api.js';
import { useSelector } from 'react-redux';
import { Shrink } from 'lucide-react';

const FinancialYear = () => {
  const [form, setForm] = useState(initialState());
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);

  function initialState() {
    return {
      fromDate: '',
      toDate: ''
    };
  }

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fetch all Financial Year from backend
  const fetchFinancialYears = async () => {
    try {
      const response = await get('financialYear');
      console.log('financialYear data:', response?.data);
      if (response && response.status !== "false" && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  useEffect(() => {
    if (form.fromDate) {
      const startDate = new Date(form.fromDate);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const date = startDate.getDate();
      if (month != 3 && date != 1) {
        alert('Please enter valid Date');
      } else {
        const newToDate = `${year + 1}-03-31`;
        setForm((prev) => ({ ...prev, toDate: newToDate }));
      }
    }
    // if (form.toDate) console.log(form.toDate);
  }, [form.fromDate, form.toDate]);

  const validate = () => {
    const newErrors = {};
    if (!form.fromDate) newErrors.fromDate = 'From Date Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async () => {
  //   console.log('Submit ', editIndex);
  //   if (!validate()) return;
  //   try {
  //     if (editIndex !== null) {
  //       // Update existing
  //       const id = data[editIndex]._id;
  //       await put(`financialYear/${id}`, form);
  //       fetchFinancialYears();
  //       toast.success('Record Edited Sucessfully');
  //     } else {
  //       console.log('save ', form);
  //       // Create new
  //       await post('financialYear', form);
  //       fetchFinancialYears();
  //       toast.success('Record Saved Sucessfully');
  //     }
  //     setOpen(false);
  //     setForm(initialState());
  //     setEditIndex(null);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };


// added pop up #M
const handleSubmit = async () => {
  if (!validate()) return;

  const isEdit = editIndex !== null;

  swal({
    title: isEdit ? "Update Record?" : "Add Record?",
    text: isEdit
      ? "Do you want to update this record?"
      : "Do you want to add this record?",
    icon: "warning",
    buttons: ["Cancel", isEdit ? "Update" : "Add"],
  }).then(async (willProceed) => {
    if (willProceed) {
      try {
        if (isEdit) {
          const id = data[editIndex]._id;
          await put(`financialYear/${id}`, form);

          swal("Success!", "Record updated successfully.", "success");
        } else {
          await post("financialYear", form);

          swal("Success!", "Record added successfully.", "success");
        }

        fetchFinancialYears();
        setOpen(false);
        setForm(initialState());
        setEditIndex(null);
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });
};








  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleEdit = (index) => {
    const selectedRecord = data[index];

    setForm({
      ...selectedRecord,
      fromDate: formatDateForInput(selectedRecord.fromDate),
      toDate: formatDateForInput(selectedRecord.toDate)
    });
    setEditIndex(index);
    setOpen(true);
  };

  // const handleDelete = async (index) => {
  //   try {
  //     const id = data[index]._id;
  //     await remove(`financialYear/${id}`);
  //     fetchFinancialYears();
  //     toast.success('Record Deleted Sucessfully');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };



// added pop up for delete option
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
        await remove(`financialYear/${id}`);
        fetchFinancialYears();
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
    const headers = ["From Date", "To Date"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const fromD = item.fromDate ? new Date(item.fromDate).toISOString().split('T')[0] : '';
      const toD = item.toDate ? new Date(item.toDate).toISOString().split('T')[0] : '';
      csvContent += `"${fromD}","${toD}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "financial_years.csv");
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
      if (!header.includes("from date")) {
        toast.error("Invalid CSV format. Header must contain 'From Date'");
        return;
      }

      const importedYears = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ''));
        const fromDateStr = row[0];
        if (fromDateStr) {
          importedYears.push(fromDateStr);
        }
      }

      const existingSet = new Set(data.map(item => item.fromDate ? new Date(item.fromDate).toISOString().split('T')[0] : ''));
      const uniqueNewYears = [...new Set(importedYears)].filter(fy => !existingSet.has(fy));

      if (uniqueNewYears.length === 0) {
        toast.info("No new unique financial years found to import.");
        return;
      }

      let successCount = 0;
      for (const fy of uniqueNewYears) {
        try {
          const startDate = new Date(fy);
          const year = startDate.getFullYear();
          const newToDate = `${year + 1}-03-31`;
          const res = await post("financialYear", { fromDate: fy, toDate: newToDate });
          if (res && (res.status === true || res.status === 'true' || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import financial year: ${fy}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique financial years found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique financial years successfully!`);
      }
      fetchFinancialYears();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Financial Year
        </Typography>
      </Breadcrumb>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Financial Year</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add New Year
          </Button>
          <Button variant="contained" color="secondary" onClick={exportCSV}>
            Export
          </Button>
          <Button variant="contained" component="label" sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
            Import
            <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
          </Button>
        </div>
      </Grid>
        {/* {(positionPermission.Add === true || isAdmin) && (
                    <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                      Add position
                    </Button>
                  )} */}
      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Add Financial Year
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
          <TextField
            type="date"
            label="From Date"
            name="fromDate"
            value={form.fromDate}
            onChange={handleChange}
            error={!!errors.fromDate}
            helperText={errors.fromDate}
            fullWidth
            InputLabelProps={{ shrink: true }}
            margin="dense"
          />
          <TextField
            type="date"
            label="To Date"
            name="toDate"
            value={form.toDate}
            onChange={handleChange}
            error={!!errors.toDate}
            helperText={errors.toDate}
            fullWidth
            inputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error" sx={{ minWidth: '40px', padding: '2px' }}>
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}>
            <IconButton color="inherit">{editIndex !== null ? <EditIcon /> : <SaveIcon />}</IconButton>
          </Button>
        </DialogActions>
      </Dialog>
      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && Array.isArray(data) && data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(item.fromDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{new Date(item.toDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleEdit(index)}
                      sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                    >
                      <IconButton color="inherit">
                        <Edit />
                      </IconButton>
                    </Button>
                    <Button color="error" onClick={() => handleDelete(index)} sx={{ padding: '1px', minWidth: '24px', height: '24px' }}>
                      <IconButton color="inherit">
                        <Delete />
                      </IconButton>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default FinancialYear;
