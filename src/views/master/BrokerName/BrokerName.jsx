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
import { Add, Edit, Delete, Close } from '@mui/icons-material';
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

const BrokerName = () => {
  const [form, setForm] = useState({ brokerName: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setOpen(true);
  };

  // Fetch all Insurance departments from backend
  const fetchBrokerNames = async () => {
    try {
      const response = await get('brokerName');
      console.log('brokerName data:', response);
      if (response && response.status !== "false" && Array.isArray(response.data)) setData(response.data);
      else setData([]);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchBrokerNames();
  }, []);

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Broker Name"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.brokerName || "").replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "broker_names.csv");
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
      if (!header.includes("broker name")) {
        toast.error("Invalid CSV format. Header must contain 'Broker Name'");
        return;
      }

      const importedNames = [];
      for (let i = 1; i < lines.length; i++) {
        let val = lines[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        if (val) {
          importedNames.push(val);
        }
      }

      const existingSet = new Set(data.map(item => item.brokerName.toLowerCase().trim()));
      const uniqueNewNames = [...new Set(importedNames)].filter(name => !existingSet.has(name.toLowerCase().trim()));

      if (uniqueNewNames.length === 0) {
        toast.info("No new unique broker names found to import.");
        return;
      }

      let successCount = 0;
      for (const name of uniqueNewNames) {
        try {
          const res = await post("brokerName", { brokerName: name });
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import broker name: ${name}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique broker names found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique broker names successfully!`);
      }
      fetchBrokerNames();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const newErrors = {};
    if (!form.brokerName) newErrors.brokerName = 'Broker Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Submit ', form);

    if (!validate()) return;
    try {
      // if (editIndex !== null) {
      //   // Update existing
      //   const id = data[editIndex]._id;
      //   await put(`brokerName/${id}`, form);
      //   fetchBrokerNames();
      //   toast.success('Record Edited Sucessfully');
      // } 

      // Added pop up #M
      if (editIndex !== null) {
  const id = data[editIndex]._id;

  swal({
    title: "Update Broker?",
    text: `Do you want to update "${form.brokerName}"?`,
    icon: "warning",
    buttons: ["Cancel", "Update"],
  }).then(async (willUpdate) => {
    if (willUpdate) {
      try {
        await put(`brokerName/${id}`, form);
        fetchBrokerNames();

        setOpen(false);
        setForm({ brokerName: '' });
        setEditIndex(null);

        swal("Updated!", "Record updated successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });

  return; // 🔥 IMPORTANT
}

      else {
        // Create new
        await post('brokerName', form);
        fetchBrokerNames();
        toast.success('Record Saved Sucessfully');
      }
      setOpen(false);
      setForm({ brokerName: '' });
      setEditIndex(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditIndex(index);
    setOpen(true);
  };

  // const handleDelete = async (index) => {
  //   try {
  //     const id = data[index]._id;
  //     await remove(`brokerName/${id}`);
  //     fetchBrokerNames();
  //     toast.success('Record deleted Successfully');
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Record deleted Failed');
  //   }
  // };



  // added pop up #M
  const handleDelete = async (index) => {
  const id = data[index]._id;

  swal({
    title: "Are you sure?",
    text: `Delete "${data[index].brokerName}"?`,
    icon: "warning",
    buttons: ["Cancel", "Delete"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        await remove(`brokerName/${id}`);
        fetchBrokerNames();

        swal("Deleted!", "Record deleted successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });
};

  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Broker Name
        </Typography>
      </Breadcrumb>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Broker Name</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add Broker Name
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
      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Add Broker Name
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
            label="Broker Name"
            name="brokerName"
            value={form.brokerName}
            onChange={handleChange}
            error={!!errors.brokerName}
            helperText={errors.brokerName}
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
                <TableCell>Broker Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {data ? (
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.brokerName}</TableCell>
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
            ) : (
              <>NO Data Found</>
            )}
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default BrokerName;
