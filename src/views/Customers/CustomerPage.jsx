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

import { Add, Delete, Close } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  createCustomer,
  getCustomers,
  deleteCustomer
} from "../../services/customerApi";

const CustomerPage = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
    state: ""
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

  // Submit Form
  const handleSubmit = async () => {
    if (!formData.customerName || !formData.mobile || !formData.email) {
      toast.error("Name, Mobile & Email required");
      return;
    }

    try {
      await createCustomer(formData);
      toast.success("Customer Added ✅");

      setOpen(false);

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
        state: ""
      });

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

  return (
    <div>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Customer Management</Typography>

        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Customer
        </Button>
      </Grid>

      {/* Add Customer Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          Add Customer
          <IconButton
            onClick={() => setOpen(false)}
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
            <TextField label="GST" name="gst" value={formData.gst} onChange={handleChange} fullWidth margin="dense" />
          )}

          <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth margin="dense" />

          <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth margin="dense" />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error" variant="contained">
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