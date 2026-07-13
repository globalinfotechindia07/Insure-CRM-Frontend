import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import NoDataPlaceholder from "../../../../component/NoDataPlaceholder";
import Loader from "component/Loader/Loader";
import { get, put, remove, post } from "api/api";
import Breadcrumb from 'component/Breadcrumb'
import DataTable from "component/DataTable";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import swal from "sweetalert";

const PaymentMode = () => {
  const [serverData, setServerData] = useState([]);
  const [showData, setShowData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ paymentMode: "" });
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(true);

  const getData = async () => {
    setLoader(true);
    try {
      const response = await get('payment-mode');
      let addsr = [];
      if (response && Array.isArray(response.paymentMode)) {
        response.paymentMode.forEach((val, index) => {
          addsr.push({ ...val, sr: index + 1 });
        });
      }
      setShowData(addsr);
      setServerData(addsr);
    } catch (error) {
      console.error(error);
      setShowData([]);
      setServerData([]);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filterData = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredData = serverData.filter((item) => {
      return item.paymentMode.toLowerCase().includes(searchValue);
    });
    let addsr = [];
    filteredData.forEach((val, index) => {
      addsr.push({ ...val, sr: index + 1 });
    });
    setShowData(addsr);
  };

  const handleOpen = () => {
    setForm({ paymentMode: "" });
    setErrors({});
    setEditIndex(null);
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (item) => {
    setForm({ paymentMode: item.paymentMode });
    setEditId(item._id);
    setEditIndex(serverData.findIndex(val => val._id === item._id));
    setOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.paymentMode || form.paymentMode.trim() === "") {
      newErrors.paymentMode = "Payment Mode is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

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
            const res = await put(`payment-mode/${editId}`, { paymentMode: form.paymentMode.trim() });
            if (res && res.paymentMode) {
              await getData();
              setOpen(false);
              swal("Updated!", "Record updated successfully.", "success");
            } else {
              throw new Error(res.msg || "Update failed");
            }
          } catch (error) {
            console.error(error);
            swal("Error!", error.message || "Something went wrong.", "error");
          }
        }
      });
    } else {
      try {
        const res = await post("payment-mode", { paymentMode: form.paymentMode.trim() });
        if (res && res.paymentMode) {
          await getData();
          setOpen(false);
          toast.success("Record inserted successfully");
        } else {
          throw new Error(res.msg || "Create failed");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error creating record");
      }
    }
  };

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
          const res = await remove(`payment-mode/${id}`);
          if (res && res.paymentMode) {
            await getData();
            swal("Deleted!", "Record deleted successfully.", "success");
          } else {
            throw new Error(res.msg || "Delete failed");
          }
        } catch (error) {
          console.error(error);
          swal("Error!", error.message || "Something went wrong.", "error");
        }
      }
    });
  };

  const exportCSV = () => {
    if (!serverData || serverData.length === 0) return;
    const headers = ["Payment Mode"];
    let csvContent = headers.join(",") + "\n";
    serverData.forEach(item => {
      csvContent += `"${(item.paymentMode || "").replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "payment_modes.csv");
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
      if (!header.includes("payment mode")) {
        toast.error("Invalid CSV format. Header must contain 'Payment Mode'");
        return;
      }

      const importedModes = [];
      for (let i = 1; i < lines.length; i++) {
        let val = lines[i];
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        val = val.replace(/""/g, '"').trim();
        if (val) {
          importedModes.push(val);
        }
      }

      const existingSet = new Set(serverData.map(item => item.paymentMode.toLowerCase().trim()));
      const uniqueNewModes = [...new Set(importedModes)].filter(mode => !existingSet.has(mode.toLowerCase().trim()));

      if (uniqueNewModes.length === 0) {
        toast.info("No new unique payment modes found to import.");
        return;
      }

      let successCount = 0;
      for (const mode of uniqueNewModes) {
        try {
          const res = await post("payment-mode", { paymentMode: mode });
          if (res && res.paymentMode) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import payment mode: ${mode}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique payment modes found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique payment modes successfully!`);
      }
      getData();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const columns = ["SN", "Payment Mode", "Action"];
  const finalData = showData && showData.map((item, ind) => {
    return {
      SN: ind + 1,
      "Payment Mode": item.paymentMode,
      Action: (
        <div>
          <IconButton size="small" onClick={() => handleEdit(item)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    };
  });

  return (
    <>
      <Breadcrumb title='Payment Mode'>
        <Typography component={Link} to='/' variant='subtitle2' color='inherit' className='link-breadcrumb'>
          Home
        </Typography>
        <Typography variant='subtitle2' color='primary' className='link-breadcrumb'>
          Payment Mode
        </Typography>
      </Breadcrumb>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Payment Mode</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" className="global_btn" onClick={handleOpen}>
            + Add
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
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: "1rem" }}>
            <input
              style={{ height: '40px', padding: '5px', borderRadius: '5px', border: '1px solid #126078' }}
              className="search_input"
              type="search"
              placeholder="Search..."
              onChange={filterData}
            />
          </div>

          {loader ? (
            <Loader />
          ) : (
            <>
              {showData && showData.length === 0 ? (
                <NoDataPlaceholder />
              ) : (
                <DataTable columns={columns} data={finalData} />
              )}
            </>
          )}

          {/* Modal Form Dialog */}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
              {editIndex !== null ? 'Edit Payment Mode' : 'Add Payment Mode'}
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
                label="Payment Mode *"
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                error={!!errors.paymentMode}
                helperText={errors.paymentMode}
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
              <Button onClick={handleSubmit} variant="contained">
                {editIndex !== null ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

        </CardContent>
      </Card>
      <ToastContainer />
    </>
  );
};

export default PaymentMode;
