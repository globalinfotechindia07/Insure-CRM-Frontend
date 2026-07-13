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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';
import { get, post, put, remove } from 'api/api';
import { useSelector } from 'react-redux';
import swal from 'sweetalert';

const initialState = {
  cgst: '',
  sgst: '',
  igst: '',
  ugst: '',
  value: '',
  effectiveFrom: ''
};

const GstPercentage = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [gstPercentagePermission, setGstPercentagePermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['gst-percentage']) {
      setGstPercentagePermission(systemRights.actionPermissions['gst-percentage']);
    }
    fetchData();
  }, [systemRights]);

  const fetchData = async () => {
    const res = await get('gst-percentage');
    console.log('gst percentage data:', res.data);
    if (res && res.data) setData(res.data);
    else setData([]);
  };

  // ✅ VALIDATION UPDATED
  const validate = () => {
    const newErrors = {};

    if (!form.value) {
      newErrors.value = 'GST value is required.';
    } else if (!/^\d+$/.test(form.value)) {
      newErrors.value = 'Only numbers are allowed (no special characters).';
    } else if (form.value.length < 1 || form.value.length > 4) {
      newErrors.value = 'GST must be between 1 to 4 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ HANDLE CHANGE UPDATED
  const handleChange = (e) => {
    const { name, value: inputValue } = e.target;

    if (name === 'value') {
      if (!/^\d*$/.test(inputValue)) return; // allow only numbers
    }

    setForm({ ...form, [name]: inputValue });
  };

  const handleOpen = () => {
    setForm(initialState);
    setErrors({});
    setEditIndex(null);
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // const handleSubmit = async () => {
  //   console.log(form);
  //   if (validate()) {
  //     if (editIndex !== null && editId) {
  //       const res = await put(`gst-percentage/${editId}`, form);
  //       if (res && res.data) {
  //         fetchData();
  //         setOpen(false);
  //         toast.success('Record Edited Successfully');
  //       }
  //     } else {
  //       const res = await post('gst-percentage', form);
  //       if (res && res.data) {
  //         fetchData();
  //         setOpen(false);
  //         toast.success('Record Inserted Successfully');
  //       }
  //     }
  //   }
  // };



  // added pop up #M
  const handleSubmit = async () => {
  if (!validate()) return;

  const isEdit = editIndex !== null && editId;

  // ✅ ONLY EDIT CASE → swal
  if (isEdit) {
    swal({
      title: "Update GST?",
      text: "Do you want to update this GST record?",
      icon: "warning",
      buttons: ["Cancel", "Update"],
    }).then(async (willUpdate) => {
      if (willUpdate) {
        try {
          const res = await put(`gst-percentage/${editId}`, form);

          if (res && res.data) {
            fetchData();
            setOpen(false);
            swal("Updated!", "Record updated successfully.", "success");
          }
        } catch (error) {
          console.error(error);
          swal("Error!", "Something went wrong.", "error");
        }
      }
    });
  } else {
    // ✅ ADD CASE → NO swal (normal flow)
    try {
      const res = await post("gst-percentage", form);

      if (res && res.data) {
        fetchData();
        setOpen(false);
        toast.success("Record Inserted Successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }
};



  const handleEdit = (index) => {
    setForm(data[index]); // same as your flow (no change in behavior)
    setEditIndex(index);
    setEditId(data[index]._id);
    setOpen(true);
  };

  // const handleDelete = async (index) => {
  //   const id = data[index]._id;
  //   await remove(`gst-percentage/${id}`, {});
  //   fetchData();
  //   toast.success('Record Deleted Successfully');
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
        await remove(`gst-percentage/${id}`, {});
        fetchData();
        swal("Deleted!", "Record deleted successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });
};

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Value"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${item.value || 0}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "gst_percentages.csv");
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
      if (!header.includes("value")) {
        toast.error("Invalid CSV format. Header must contain 'Value'");
        return;
      }

      const importedValues = [];
      for (let i = 1; i < lines.length; i++) {
        let val = lines[i].trim().replace(/^"|"$/g, '');
        if (val && !isNaN(val)) {
          importedValues.push(val);
        }
      }

      const existingSet = new Set(data.map(item => String(item.value).trim()));
      const uniqueNewValues = [...new Set(importedValues)].filter(v => !existingSet.has(v));

      if (uniqueNewValues.length === 0) {
        toast.info("No new unique GST percentages found to import.");
        return;
      }

      let successCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      for (const val of uniqueNewValues) {
        try {
          const res = await post("gst-percentage", { 
            value: val,
            effectiveFrom: todayStr
          });
          if (res && res.data) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import GST: ${val}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique GST percentages found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique GST percentages successfully!`);
      }
      fetchData();
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
          Gst Percentage
        </Typography>
      </Breadcrumb>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Gst Percentage</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(gstPercentagePermission.Add === true || isAdmin) && (
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Gst Percentage
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editIndex !== null ? 'Edit Gst ' : 'Add Gst'}
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
            label="GST"
            name="value"
            value={form.value}
            onChange={handleChange}
            error={!!errors.value}
            helperText={errors.value}
            InputLabelProps={{ shrink: true }}
            inputProps={{ maxLength: 4 }} // ✅ ONLY ADDITION
            fullWidth
            margin="dense"
          />

          <TextField
            type="date"
            label="Effective From"
            name="effectiveFrom"
            value={form.effectiveFrom}
            onChange={handleChange}
            error={!!errors.effectiveFrom}
            helperText={errors.effectiveFrom}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error" sx={{ minWidth: '40px', padding: '2px' }}>
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}
          >
            <IconButton color="inherit">{editIndex !== null ? <EditIcon /> : <SaveIcon />}</IconButton>
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>GST% </TableCell>
                <TableCell>EFFECTIVE FROM </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && Array.isArray(data) && data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{new Date(row.effectiveFrom).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>
                    {(gstPercentagePermission.Edit === true || isAdmin) && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(index)}
                        sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                      >
                        <IconButton color="inherit">
                          <Edit />
                        </IconButton>
                      </Button>
                    )}
                    {(gstPercentagePermission.Delete === true || isAdmin) && (
                      <Button
                        color="error"
                        onClick={() => handleDelete(index)}
                        sx={{ padding: '1px', minWidth: '24px', height: '24px' }}
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
        </CardContent>
      </Card>

      <ToastContainer />
    </div>
  );
};

export default GstPercentage;