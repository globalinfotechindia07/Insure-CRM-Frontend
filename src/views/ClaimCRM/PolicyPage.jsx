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
} from "@mui/icons-material";

import {
  createPolicy,
  getPolicies,
  deletePolicy,
} from "../../services/policy.service";

const PolicyPage = () => {

  const [open, setOpen] = useState(false);

  const [data, setData] = useState([]);

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

    vehicleNumber: "",

    premium: "",

    gst: "",

    totalAmount: "",

    modeOfPayment: "",

    startDate: "",

    endDate: "",

  });

  // ================= FETCH DATA =================

  const fetchData = async () => {

    try {

      const res = await getPolicies();

      setData(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {
    fetchData();
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

        vehicleNumber: "",

        premium: "",

        gst: "",

        totalAmount: "",

        modeOfPayment: "",

        startDate: "",

        endDate: "",

      });

    } catch (error) {

      console.log(error);

    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {

    try {

      await deletePolicy(id);

      fetchData();

    } catch (error) {

      console.log(error);

    }
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
          Add Policy
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

                <MenuItem value="CORPORATE">
                  CORPORATE
                </MenuItem>

                <MenuItem value="RETAIL">
                  RETAIL
                </MenuItem>

              </TextField>

            </Grid>

            <Grid item xs={12} md={6}>

              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />

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
                fullWidth
                label="Renewal / New Policy"
                name="renewalType"
                value={formData.renewalType}
                onChange={handleChange}
              />

            </Grid>

            <Grid item xs={12} md={6}>

              <TextField
                fullWidth
                label="Type of Policy"
                name="policyType"
                value={formData.policyType}
                onChange={handleChange}
              />

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
                label="Net Premium"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
              />

            </Grid>

            <Grid item xs={12} md={4}>

              <TextField
                fullWidth
                label="GST"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
              />

            </Grid>

            <Grid item xs={12} md={4}>

              <TextField
                fullWidth
                label="Total Amount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
              />

            </Grid>

            <Grid item xs={12} md={4}>

              <TextField
                fullWidth
                label="Mode of Payment"
                name="modeOfPayment"
                value={formData.modeOfPayment}
                onChange={handleChange}
              />

            </Grid>

            <Grid item xs={12} md={6}>

              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                InputLabelProps={{
                  shrink: true,
                }}
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
                InputLabelProps={{
                  shrink: true,
                }}
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

                  <TableRow key={item._id}>

                    <TableCell>
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      {item.policyNo}
                    </TableCell>

                    <TableCell>
                      {item.insuredName}
                    </TableCell>

                    <TableCell>
                      {item.department}
                    </TableCell>

                    <TableCell>
                      {item.policyType}
                    </TableCell>

                    <TableCell>
                      {item.vehicleNumber}
                    </TableCell>

                    <TableCell>
                      {item.totalAmount}
                    </TableCell>

                    <TableCell>

                      <Chip
                        label={
                          item.status
                            ? "Active"
                            : "Inactive"
                        }
                        color={
                          item.status
                            ? "success"
                            : "error"
                        }
                      />

                    </TableCell>

                    <TableCell>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(item._id)
                        }
                      >
                        <Delete />
                      </IconButton>

                    </TableCell>

                  </TableRow>

                ))

              ) : (

                <TableRow>

                  <TableCell
                    colSpan={9}
                    align="center"
                  >
                    No Policy Found
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

export default PolicyPage;