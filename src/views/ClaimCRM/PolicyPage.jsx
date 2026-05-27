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
  Box,
  CircularProgress,
} from "@mui/material";

import {
  Add,
  Delete,
} from "@mui/icons-material";

import {
  createPolicy,
  getPolicies,
  deletePolicy,
} from "../../services/policy.service";

import {
  getActiveDepartments,
} from "../../services/departmentApi";

import { getCompanies } from "../../services/companyService"; // Import company service

import Swal from "sweetalert2";

const PolicyPage = () => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]); // New state for companies
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    policyNo: "",
    corporateType: "",
    department: "",
    insuredName: "",
    contactNo: "",
    email: "",
    contactPerson: "",
    location: "",
    renewalType: "",
    policyType: "",
    wording: "",
    additionalWordings: "",
    lenders: "",
    propertyDescription: "",
    sumInsured: "",
    insurerName: "",
    insuranceCompany: "",
    vehicleNumber: "",
    premium: "",
    gst: "",
    totalAmount: "",
    modeOfPayment: "",
    startDate: "",
    endDate: "",
  });

  // ================= FETCH POLICIES =================
  const fetchData = async () => {
    try {
      const res = await getPolicies();
      setData(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH DEPARTMENTS =================
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getActiveDepartments();
      console.log("Departments API Response:", res);
      
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      } else if (Array.isArray(res)) {
        setDepartments(res);
      } else if (res.data && Array.isArray(res.data)) {
        setDepartments(res.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.log("Error fetching departments:", error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH COMPANIES =================
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await getCompanies();
      console.log("Companies API Response:", res);
      
      if (res.success && Array.isArray(res.data)) {
        setCompanies(res.data);
      } else if (Array.isArray(res)) {
        setCompanies(res);
      } else if (res.data && Array.isArray(res.data)) {
        setCompanies(res.data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.log("Error fetching companies:", error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
    fetchCompanies(); // Fetch companies on component mount
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    // Validation
    if (!formData.policyNo) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Policy number is required!",
      });
      return;
    }

    try {
      await createPolicy(formData);
      setOpen(false);
      fetchData();
      setFormData({
        policyNo: "",
        corporateType: "",
        department: "",
        insuredName: "",
        contactNo: "",
        email: "",
        contactPerson: "",
        location: "",
        renewalType: "",
        policyType: "",
        wording: "",
        additionalWordings: "",
        lenders: "",
        propertyDescription: "",
        sumInsured: "",
        insurerName: "",
        insuranceCompany: "",
        vehicleNumber: "",
        premium: "",
        gst: "",
        totalAmount: "",
        modeOfPayment: "",
        startDate: "",
        endDate: "",
      });
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Policy created successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Error creating policy",
      });
    }
  };

  // ================= DELETE =================
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
      try {
        await deletePolicy(id);
        fetchData();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Policy deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error deleting policy",
        });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          Policy Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Policy
        </Button>
      </Grid>

      {/* DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add New Policy
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Policy No"
                name="policyNo"
                value={formData.policyNo}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Corporate / Retail"
                name="corporateType"
                value={formData.corporateType}
                onChange={handleChange}
              >
                <MenuItem value="CORPORATE">CORPORATE</MenuItem>
                <MenuItem value="RETAIL">RETAIL</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="">-- Select Department --</MenuItem>
                {departments.length === 0 && !loading ? (
                  <MenuItem disabled>No departments found. Please create departments first.</MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Insurance Company *"
                name="insuranceCompany"
                value={formData.insuranceCompany}
                onChange={handleChange}
                disabled={loadingCompanies}
                required
              >
                <MenuItem value="">-- Select Insurance Company --</MenuItem>
                {loadingCompanies ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : companies.length === 0 ? (
                  <MenuItem disabled>No companies found. Please create companies first.</MenuItem>
                ) : (
                  companies.map((company) => (
                    <MenuItem key={company._id} value={company.name}>
                      {company.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name of Insured"
                name="insuredName"
                value={formData.insuredName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact No"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email ID"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location of Property"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Renewal / New Policy"
                name="renewalType"
                value={formData.renewalType}
                onChange={handleChange}
              >
                <MenuItem value="NEW">New Policy</MenuItem>
                <MenuItem value="RENEWAL">Renewal</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Type of Policy"
                name="policyType"
                value={formData.policyType}
                onChange={handleChange}
              >
                <MenuItem value="FIRE">Fire</MenuItem>
                <MenuItem value="MARINE">Marine</MenuItem>
                <MenuItem value="MOTOR">Motor</MenuItem>
                <MenuItem value="HEALTH">Health</MenuItem>
                <MenuItem value="TRAVEL">Travel</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wording"
                name="wording"
                value={formData.wording}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Wordings"
                name="additionalWordings"
                value={formData.additionalWordings}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Financial Institutions & Lenders"
                name="lenders"
                value={formData.lenders}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Brief Description of Property"
                name="propertyDescription"
                value={formData.propertyDescription}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Sum Insured"
                name="sumInsured"
                value={formData.sumInsured}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name of Insurer"
                name="insurerName"
                value={formData.insurerName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Net Premium"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="GST (%)"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Total Amount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Mode of Payment"
                name="modeOfPayment"
                value={formData.modeOfPayment}
                onChange={handleChange}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CHEQUE">Cheque</MenuItem>
                <MenuItem value="NEFT">NEFT</MenuItem>
                <MenuItem value="RTGS">RTGS</MenuItem>
                <MenuItem value="IMPS">IMPS</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            onClick={() => setOpen(false)}
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
                <TableCell>Policy No</TableCell>
                <TableCell>Insured Name</TableCell>
                <TableCell>Insurance Company</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Policy Type</TableCell>
                <TableCell>Vehicle No</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.policyNo}</TableCell>
                    <TableCell>{item.insuredName}</TableCell>
                    <TableCell>{item.insuranceCompany || "-"}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.policyType}</TableCell>
                    <TableCell>{item.vehicleNumber || "-"}</TableCell>
                    <TableCell>₹{item.totalAmount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status ? "Active" : "Inactive"}
                        color={item.status ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No Policy Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PolicyPage;