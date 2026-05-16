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
  createClaim,
  getClaims,
  deleteClaim,
} from "../../services/claim.service";

import {
  getPolicies,
} from "../../services/policy.service";

import {
  getSurveyors,
} from "../../services/surveyor.service";

import {
  getTPAs,
} from "../../services/tpa.service";



import {
  getInvestigators,
} from "../../services/investigator.service";

const ClaimPage = () => {

  const [open, setOpen] = useState(false);

  const [data, setData] = useState([]);

  const [policies, setPolicies] = useState([]);

  const [surveyors, setSurveyors] = useState([]);

  const [tpas, setTPAs] = useState([]);

  const [investigators, setInvestigators] = useState([]);

  const [formData, setFormData] = useState({

    department: "",
    policyType: "",

    claimNo: "",

    policyId: "",
    policyNo: "",

    insuredName: "",
    contactNo: "",
    email: "",
    contactPerson: "",
    departmentName: "",
    propertyLocation: "",
    renewalType: "",
    typeOfPolicy: "",
    wording: "",
    additionalWordings: "",
    financialInstitutions: "",
    propertyDescription: "",
    sumInsured: "",
    insurancePeriod: "",
    insurerName: "",
    vehicleNumber: "",
    netPremium: "",
    gst: "",
    totalAmount: "",
    paymentMode: "",

    dateOfLoss: "",
    dischargeDate: "",
    estimatedLossAmount: "",
    causeOfLoss: "",

    surveyorId: "",
    finalSurveyorId: "",

    tpaId: "",

    investigatorId: "",

    invoiceNo: "",
    billOfLadingNo: "",
    lrNo: "",
    insuranceCertificateNo: "",

    journeyFrom: "",
    journeyTo: "",

    surveyReferenceNo: "",

    settlementType: "",

    approvalDate: "",
    settlementDate: "",

    approvedAmount: "",

    machineryDetails: "",

    postHospitalizationDischargeDate: "",
    amountClaimed: "",
    noOfDays: "",

    remarks: "",

    status: "Pending",

  });

  // ================= FETCH CLAIMS =================

  const fetchClaims = async () => {

    try {

      const res = await getClaims();

      setData(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  // ================= FETCH POLICIES =================

  const fetchPolicies = async () => {

    try {

      const res = await getPolicies();

      setPolicies(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  // ================= FETCH SURVEYORS =================

  const fetchSurveyors = async () => {

    try {

      const res = await getSurveyors();

      setSurveyors(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  // ================= FETCH TPA =================

  const fetchTPAs = async () => {

    try {

      const res = await getTPAs();

      setTPAs(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  // ================= FETCH INVESTIGATORS =================

  const fetchInvestigators = async () => {

    try {

      const res = await getInvestigators();

      setInvestigators(res.data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {

    fetchClaims();

    fetchPolicies();

    fetchSurveyors();

    fetchTPAs();

    fetchInvestigators();

  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE POLICY =================

  const handlePolicyChange = (e) => {

    const selectedPolicy = policies.find(
      (item) => item._id === e.target.value
    );

    if (!selectedPolicy) return;

    setFormData({

      ...formData,

      policyId: selectedPolicy._id,

      policyNo: selectedPolicy.policyNo || "",

      insuredName: selectedPolicy.insuredName || "",

      contactNo: selectedPolicy.contactNo || "",

      email: selectedPolicy.email || "",

      contactPerson:
        selectedPolicy.contactPerson || "",

      departmentName:
        selectedPolicy.department || "",

      propertyLocation:
        selectedPolicy.propertyLocation || "",

      renewalType:
        selectedPolicy.renewalType || "",

      typeOfPolicy:
        selectedPolicy.typeOfPolicy || "",

      wording:
        selectedPolicy.wording || "",

      additionalWordings:
        selectedPolicy.additionalWordings || "",

      financialInstitutions:
        selectedPolicy.financialInstitutions || "",

      propertyDescription:
        selectedPolicy.propertyDescription || "",

      sumInsured:
        selectedPolicy.sumInsured || "",

      insurancePeriod:
        selectedPolicy.insurancePeriod || "",

      insurerName:
        selectedPolicy.insurerName || "",

      vehicleNumber:
        selectedPolicy.vehicleNumber || "",

      netPremium:
        selectedPolicy.netPremium || "",

      gst:
        selectedPolicy.gst || "",

      totalAmount:
        selectedPolicy.totalAmount || "",

      paymentMode:
        selectedPolicy.paymentMode || "",

    });
  };

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async () => {

    try {

      await createClaim(formData);

      setOpen(false);

      fetchClaims();

    } catch (error) {

      console.log(error);

    }
  };

  // ================= DELETE CLAIM =================

  const handleDelete = async (id) => {

    try {

      await deleteClaim(id);

      fetchClaims();

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
          Claim Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Claim
        </Button>

      </Grid>

      {/* DIALOG */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
      >

        <DialogTitle>
          Add Claim
        </DialogTitle>

        <DialogContent>

          {/* CLAIM NO */}

          <TextField
            fullWidth
            margin="dense"
            label="Claim No"
            name="claimNo"
            value={formData.claimNo}
            onChange={handleChange}
          />

          {/* DEPARTMENT */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          >

            <MenuItem value="CORPORATE">
              CORPORATE
            </MenuItem>

            <MenuItem value="RETAIL">
              RETAIL
            </MenuItem>

          </TextField>

          {/* POLICY DROPDOWN */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Select Policy"
            value={formData.policyId}
            onChange={handlePolicyChange}
          >

            {policies.map((item) => (

              <MenuItem
                key={item._id}
                value={item._id}
              >
                {item.policyNo} - {item.insuredName}
              </MenuItem>

            ))}

          </TextField>

          {/* POLICY DETAILS */}

          <TextField
            fullWidth
            margin="dense"
            label="Policy No"
            value={formData.policyNo}
            disabled
          />

          <TextField
            fullWidth
            margin="dense"
            label="Insured Name"
            value={formData.insuredName}
            disabled
          />

          <TextField
            fullWidth
            margin="dense"
            label="Contact No"
            value={formData.contactNo}
            disabled
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email"
            value={formData.email}
            disabled
          />

          <TextField
            fullWidth
            margin="dense"
            label="Vehicle Number"
            value={formData.vehicleNumber}
            disabled
          />

          {/* CLAIM DETAILS */}

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="Date Of Loss"
            name="dateOfLoss"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.dateOfLoss}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="Date Of Discharge"
            name="dischargeDate"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.dischargeDate}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Estimated Loss Amount"
            name="estimatedLossAmount"
            value={formData.estimatedLossAmount}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Cause Of Loss"
            name="causeOfLoss"
            value={formData.causeOfLoss}
            onChange={handleChange}
          />

          {/* PRELIMINARY SURVEYOR */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Preliminary Surveyor"
            name="surveyorId"
            value={formData.surveyorId}
            onChange={handleChange}
          >

            {surveyors.map((item) => (

              <MenuItem
                key={item._id}
                value={item._id}
              >
                {item.surveyorName}
              </MenuItem>

            ))}

          </TextField>

          {/* FINAL SURVEYOR */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Final Surveyor"
            name="finalSurveyorId"
            value={formData.finalSurveyorId}
            onChange={handleChange}
          >

            {surveyors.map((item) => (

              <MenuItem
                key={item._id}
                value={item._id}
              >
                {item.surveyorName}
              </MenuItem>

            ))}

          </TextField>

          {/* TPA */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="TPA"
            name="tpaId"
            value={formData.tpaId}
            onChange={handleChange}
          >

            {tpas.map((item) => (

              <MenuItem
                key={item._id}
                value={item._id}
              >
                {item.tpaName}
              </MenuItem>

            ))}

          </TextField>

          {/* INVESTIGATOR */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Investigator"
            name="investigatorId"
            value={formData.investigatorId}
            onChange={handleChange}
          >

            {investigators.map((item) => (

              <MenuItem
                key={item._id}
                value={item._id}
              >
                {item.investigatorName}
              </MenuItem>

            ))}

          </TextField>

          {/* STATUS */}

          <TextField
            select
            fullWidth
            margin="dense"
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >

            <MenuItem value="Pending">
              Pending
            </MenuItem>

            <MenuItem value="Approved">
              Approved
            </MenuItem>

            <MenuItem value="Rejected">
              Rejected
            </MenuItem>

            <MenuItem value="Under Process">
              Under Process
            </MenuItem>

          </TextField>

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
                <TableCell>Claim No</TableCell>
                <TableCell>Policy No</TableCell>
                <TableCell>Insured Name</TableCell>
                <TableCell>Surveyor</TableCell>
                <TableCell>TPA</TableCell>
                <TableCell>Investigator</TableCell>
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
                      {item.claimNo}
                    </TableCell>

                    <TableCell>
                      {item.policyNo}
                    </TableCell>

                    <TableCell>
                      {item.insuredName}
                    </TableCell>

                    <TableCell>
                      {item.surveyorId?.surveyorName}
                    </TableCell>

                    <TableCell>
                      {item.tpaId?.tpaName}
                    </TableCell>

                    <TableCell>
                      {item.investigatorId?.investigatorName}
                    </TableCell>

                    <TableCell>

                      <Chip
                        label={item.status}
                        color={
                          item.status === "Approved"
                            ? "success"
                            : item.status === "Rejected"
                            ? "error"
                            : "warning"
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
                    No Claims Found
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

export default ClaimPage;