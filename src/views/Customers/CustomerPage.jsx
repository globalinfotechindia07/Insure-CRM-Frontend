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
  MenuItem
} from "@mui/material";

import { Add, Delete, Close, Edit } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  createCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer
} from "../../services/customerApi";

const CustomerPage = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // 🔥 Delete Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientType: "",
    customerName: "",
    dob: "",
    email: "",
    mobile: "",
    pan: "",
    adhar: "",
    drivingLicence: "",
    gst: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    authorisedPersonName: "",
    authorisedPersonContact: "",
    authorisedPersonEmail: ""
  });

  // Fetch Customers
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({
      clientType: "",
      customerName: "",
      dob: "",
      email: "",
      mobile: "",
      pan: "",
      adhar: "",
      drivingLicence: "",
      gst: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      authorisedPersonName: "",
      authorisedPersonContact: "",
      authorisedPersonEmail: ""
    });
  };

  // Submit Form
  const handleSubmit = async () => {

    const payload = {
      clientType: formData.clientType,
      customerName: formData.customerName,
      dob: formData.dob || null,
      email: formData.email,
      mobile: formData.mobile,
      pan: formData.pan,
      adhar: formData.adhar,
      drivingLicence: formData.drivingLicence,
      gst: formData.gst,
      address: formData.address,
      pincode: formData.pincode,
      city: formData.city,
      state: formData.state,
      authorisedPersonName: formData.authorisedPersonName,
      authorisedPersonContact: formData.authorisedPersonContact,
      authorisedPersonEmail: formData.authorisedPersonEmail
    };

    try {
      if (editId) {
        await updateCustomer(editId, payload);
        toast.success("Customer Updated ✅");
      } else {
        await createCustomer(payload);
        toast.success("Customer Added ✅");
      }

      handleClose();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error ❌");
    }
  };

  // 🔥 Confirm Delete
  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteId);
      toast.success("Deleted ✅");
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error("Delete Failed ❌");
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = [
      "Client Type",
      "Customer Name",
      "DOB",
      "Email",
      "Mobile",
      "PAN",
      "Aadhar",
      "Driving Licence",
      "GST",
      "Address",
      "Pincode",
      "City",
      "State",
      "Authorised Person Name",
      "Authorised Person Contact",
      "Authorised Person Email"
    ];
    let csvContent = headers.join(",") + "\n";
    data.forEach((item) => {
      csvContent += `"${item.clientType || ''}","${item.customerName || ''}","${item.dob || ''}","${item.email || ''}","${item.mobile || ''}","${item.pan || ''}","${item.adhar || ''}","${item.drivingLicence || ''}","${item.gst || ''}","${(item.address || '').replace(/"/g, '""')}","${item.pincode || ''}","${item.city || ''}","${item.state || ''}","${item.authorisedPersonName || ''}","${item.authorisedPersonContact || ''}","${item.authorisedPersonEmail || ''}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
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
      const lines = text.split("\n").map((line) => line.trim()).filter((line) => line !== "");
      if (lines.length <= 1) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes("customer name") || !header.includes("mobile")) {
        toast.error("Invalid CSV format. Header must contain 'Customer Name' and 'Mobile'");
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const clientType = row[0] || 'retail';
        const customerName = row[1] || '';
        const dob = row[2] || '';
        const email = row[3] || '';
        const mobile = row[4] || '';
        const pan = row[5] || '';
        const adhar = row[6] || '';
        const drivingLicence = row[7] || '';
        const gst = row[8] || '';
        const address = row[9] || '';
        const pincode = row[10] || '';
        const city = row[11] || '';
        const state = row[12] || '';
        const authorisedPersonName = row[13] || '';
        const authorisedPersonContact = row[14] || '';
        const authorisedPersonEmail = row[15] || '';

        if (customerName && mobile) {
          imported.push({
            clientType,
            customerName,
            dob,
            email,
            mobile,
            pan,
            adhar,
            drivingLicence,
            gst,
            address,
            pincode,
            city,
            state,
            authorisedPersonName,
            authorisedPersonContact,
            authorisedPersonEmail
          });
        }
      }

      const existingMobiles = new Set(data.map((item) => String(item.mobile).trim()));
      const uniqueNew = imported.filter((item) => !existingMobiles.has(String(item.mobile).trim()));

      if (uniqueNew.length === 0) {
        toast.info("No new unique customers found to import.");
        return;
      }

      let successCount = 0;
      for (const item of uniqueNew) {
        try {
          const res = await createCustomer(item);
          if (res) {
            successCount++;
          }
        } catch (err) {
          console.error("Failed to import customer", err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique customers found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique customers successfully!`);
      }
      fetchData();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Customer Management</Typography>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Add Customer
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editId ? "Edit Customer" : "Add Customer"}
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ minWidth: 500 }}>
          <TextField select label="Client Type" name="clientType" value={formData.clientType} onChange={handleChange} fullWidth margin="dense">
            <MenuItem value="corporate">Corporate</MenuItem>
            <MenuItem value="retail">Retail</MenuItem>
          </TextField>

          <TextField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} fullWidth margin="dense" />

          <TextField
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />

          <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="PAN" name="pan" value={formData.pan} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="Aadhar" name="adhar" value={formData.adhar} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="Driving Licence" name="drivingLicence" value={formData.drivingLicence} onChange={handleChange} fullWidth margin="dense" />

          {formData.clientType === "corporate" && (
            <>
              <TextField label="GST" name="gst" value={formData.gst} onChange={handleChange} fullWidth margin="dense" />
              <TextField label="Authorized Person Name" name="authorisedPersonName" value={formData.authorisedPersonName} onChange={handleChange} fullWidth margin="dense" />
              <TextField label="Authorized Person Contact" name="authorisedPersonContact" value={formData.authorisedPersonContact} onChange={handleChange} fullWidth margin="dense" inputProps={{ maxLength: 10 }} />
              <TextField label="Authorized Person Email" name="authorisedPersonEmail" value={formData.authorisedPersonEmail} onChange={handleChange} fullWidth margin="dense" />
            </>
          )}

          <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth margin="dense" />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">
            Cancel
          </Button>

          <Button onClick={handleSubmit} variant="contained">
            Save
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
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>{item.clientType}</TableCell>
                    <TableCell>{item.mobile}</TableCell>
                    <TableCell>{item.city}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditId(item._id);
                          setFormData({
                            clientType: item.clientType || "",
                            customerName: item.customerName || "",
                            dob: item.dob ? item.dob.split("T")[0] : "",
                            email: item.email || "",
                            mobile: item.mobile || "",
                            pan: item.pan || "",
                            adhar: item.adhar || "",
                            drivingLicence: item.drivingLicence || "",
                            gst: item.gst || "",
                            address: item.address || "",
                            pincode: item.pincode || "",
                            city: item.city || "",
                            state: item.state || "",
                            authorisedPersonName: item.authorisedPersonName || "",
                            authorisedPersonContact: item.authorisedPersonContact || "",
                            authorisedPersonEmail: item.authorisedPersonEmail || ""
                          });
                          setOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setDeleteId(item._id);
                          setConfirmOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Customers Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 🔥 Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>

          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default CustomerPage;