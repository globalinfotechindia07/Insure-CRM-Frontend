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
  Tab,
  Tabs,
  Box,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  ChangeCircle,
  Close,
} from "@mui/icons-material";

import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  createClaim,
  getClaims,
  deleteClaim,
  updateClaim,
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

import {
  getActiveDepartments,
} from "../../services/departmentApi";

const ClaimPage = () => {

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentClaimId, setCurrentClaimId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [tpas, setTPAs] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    claimNo: "",
    department: "",
    status: "Pending",
    remarks: "",
    policyId: "",
    policyNo: "",
    insuredName: "",
    contactNo: "",
    email: "",
    contactPerson: "",
    vehicleNumber: "",
    locationOfProperty: "",
    renewalOrNewPolicy: "",
    typeOfPolicy: "",
    wording: "",
    briefDescriptionOfProperty: "",
    sumInsured: "",
    periodOfInsurance: "",
    insurerName: "",
    netPremium: "",
    totalAmount: "",
    paymentMode: "",
    dateOfLossOrAdmission: "",
    dateOfDischarge: "",
    estimatedLossAmount: "",
    causeOfLoss: "",
    machineryDetails: "",
    preliminarySurveyorId: "",
    finalSurveyorId: "",
    tpaId: "",
    investigatorId: "",
    invoiceNo: "",
    billOfLadingNo: "",
    lrNo: "",
    insuranceCertificateNo: "",
    journeyFrom: "",
    journeyTo: "",
    surveyorReferenceNumber: "",
    settlementType: "",
    claimApprovedAmount: "",
    dateOfApprovalOfClaim: "",
    dateOfSettlement: "",
    postHospitalizationDischargeDate: "",
    postHospitalizationAmountClaimed: "",
    postHospitalizationNoOfDays: "",
  });

  // ================= FETCH CLAIMS =================
  const fetchClaims = async () => {
    try {
      const res = await getClaims();
      console.log("Claims fetched:", res.data);
      setData(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH POLICIES =================
  const fetchPolicies = async () => {
    try {
      const res = await getPolicies();
      setPolicies(res.data || []);
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

  // ================= FETCH DEPARTMENTS =================
  const fetchDepartments = async () => {
    try {
      const res = await getActiveDepartments();
      console.log("Departments fetched:", res);
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setDepartments(res.data.data);
      } else if (Array.isArray(res)) {
        setDepartments(res);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.log("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
    fetchSurveyors();
    fetchTPAs();
    fetchInvestigators();
    fetchDepartments();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE POLICY CHANGE =================
  const handlePolicyChange = (e) => {
    const selectedPolicy = policies.find(
      (item) => item._id === e.target.value
    );

    if (!selectedPolicy) return;

    let customerName = selectedPolicy.cutomerName || "";
    if (!customerName && selectedPolicy.retailCustomer) {
      customerName = selectedPolicy.retailCustomer.name;
    }
    if (!customerName && selectedPolicy.customerGroup) {
      customerName = selectedPolicy.customerGroup.groupName || selectedPolicy.customerGroup.name;
    }

    setFormData({
      ...formData,
      policyId: selectedPolicy._id,
      policyNo: selectedPolicy.policyNumber || "",
      insuredName: customerName,
      contactNo: selectedPolicy.mobile || "",
      email: selectedPolicy.email || "",
      contactPerson: selectedPolicy.cutomerName || customerName,
      vehicleNumber: selectedPolicy.vehicleNumber || "",
      department: selectedPolicy.insDepartment ? (selectedPolicy.insDepartment.insDepartment || selectedPolicy.insDepartment) : "",
      locationOfProperty: selectedPolicy.siteLocation || "",
      renewalOrNewPolicy: selectedPolicy.renewable || "",
      typeOfPolicy: selectedPolicy.policyType || "",
      wording: selectedPolicy.marineClause || "",
      briefDescriptionOfProperty: selectedPolicy.propertyDescription || "",
      sumInsured: selectedPolicy.sumInsured || 0,
      periodOfInsurance: selectedPolicy.policyDuration || "",
      insurerName: selectedPolicy.insurerName || "",
      netPremium: selectedPolicy.netPremium || 0,
      totalAmount: selectedPolicy.totalAmount || 0,
      paymentMode: selectedPolicy.paymentMode || "",
    });
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    if (activeTab < 6) {
      setActiveTab((prev) => prev + 1);
      return;
    }
    try {
      const submitData = {
        claimNo: formData.claimNo,
        department: formData.department,
        status: formData.status,
        remarks: formData.remarks,
        policyId: formData.policyId,
        policyNo: formData.policyNo,
        insuredName: formData.insuredName,
        contactNo: formData.contactNo,
        email: formData.email,
        contactPerson: formData.contactPerson,
        vehicleNumber: formData.vehicleNumber,
        locationOfProperty: formData.locationOfProperty,
        renewalOrNewPolicy: formData.renewalOrNewPolicy,
        typeOfPolicy: formData.typeOfPolicy,
        wording: formData.wording,
        briefDescriptionOfProperty: formData.briefDescriptionOfProperty,
        sumInsured: formData.sumInsured,
        periodOfInsurance: formData.periodOfInsurance,
        insurerName: formData.insurerName,
        netPremium: formData.netPremium,
        totalAmount: formData.totalAmount,
        paymentMode: formData.paymentMode,
        dateOfLossOrAdmission: formData.dateOfLossOrAdmission,
        dateOfDischarge: formData.dateOfDischarge,
        estimatedLossAmount: formData.estimatedLossAmount,
        causeOfLoss: formData.causeOfLoss,
        machineryDetails: formData.machineryDetails,
        preliminarySurveyorId: formData.preliminarySurveyorId,
        finalSurveyorId: formData.finalSurveyorId,
        tpaId: formData.tpaId,
        investigatorId: formData.investigatorId,
        invoiceNo: formData.invoiceNo,
        billOfLadingNo: formData.billOfLadingNo,
        lrNo: formData.lrNo,
        insuranceCertificateNo: formData.insuranceCertificateNo,
        journeyFrom: formData.journeyFrom,
        journeyTo: formData.journeyTo,
        surveyorReferenceNumber: formData.surveyorReferenceNumber,
        settlementType: formData.settlementType,
        claimApprovedAmount: formData.claimApprovedAmount,
        dateOfApprovalOfClaim: formData.dateOfApprovalOfClaim,
        dateOfSettlement: formData.dateOfSettlement,
        postHospitalization: {
          dischargeDate: formData.postHospitalizationDischargeDate,
          amountClaimed: formData.postHospitalizationAmountClaimed,
          noOfDays: formData.postHospitalizationNoOfDays,
        },
      };

      console.log("Submitting data:", submitData);

      if (isEdit) {
        await updateClaim(currentClaimId, submitData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Claim has been updated successfully.',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });
      } else {
        await createClaim(submitData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Claim has been created successfully.',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });
      }
      
      setOpen(false);
      resetForm();
      fetchClaims();
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || error.message || 'Something went wrong',
        confirmButtonColor: '#d33',
      });
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (item) => {
    Swal.fire({
      title: 'Edit Claim',
      text: `Are you sure you want to edit claim ${item.claimNo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, edit it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        let customerName = item.policyId?.cutomerName || "";
        if (!customerName && item.policyId?.retailCustomer) {
          customerName = item.policyId.retailCustomer.name;
        }
        if (!customerName && item.policyId?.customerGroup) {
          customerName = item.policyId.customerGroup.groupName || item.policyId.customerGroup.name;
        }

        setFormData({
          claimNo: item.claimNo || "",
          department: item.department || item.policyId?.insDepartment?.name || item.policyId?.insDepartment || "",
          status: item.status || "Pending",
          remarks: item.remarks || "",
          policyId: item.policyId?._id || item.policyId || "",
          policyNo: item.policyId?.policyNumber || item.policyNo || "",
          insuredName: customerName || item.insuredName || "",
          contactNo: item.policyId?.mobile || item.contactNo || "",
          email: item.policyId?.email || item.email || "",
          contactPerson: item.contactPerson || item.policyId?.cutomerName || customerName || "",
          vehicleNumber: item.vehicleNumber || item.policyId?.vehicleNumber || "",
          locationOfProperty: item.locationOfProperty || item.policyId?.siteLocation || "",
          renewalOrNewPolicy: item.renewalOrNewPolicy || item.policyId?.renewable || "",
          typeOfPolicy: item.typeOfPolicy || item.policyId?.policyType || "",
          wording: item.wording || item.policyId?.marineClause || "",
          briefDescriptionOfProperty: item.briefDescriptionOfProperty || item.policyId?.propertyDescription || "",
          sumInsured: item.sumInsured || item.policyId?.sumInsured || 0,
          periodOfInsurance: item.periodOfInsurance || item.policyId?.policyDuration || "",
          insurerName: item.insurerName || item.policyId?.insurerName || "",
          netPremium: item.netPremium || item.policyId?.netPremium || 0,
          totalAmount: item.totalAmount || item.policyId?.totalAmount || 0,
          paymentMode: item.paymentMode || item.policyId?.paymentMode || "",
          dateOfLossOrAdmission: item.dateOfLossOrAdmission?.split("T")[0] || "",
          dateOfDischarge: item.dateOfDischarge?.split("T")[0] || "",
          estimatedLossAmount: item.estimatedLossAmount || "",
          causeOfLoss: item.causeOfLoss || "",
          machineryDetails: item.machineryDetails || "",
          preliminarySurveyorId: item.preliminarySurveyorId?._id || item.preliminarySurveyorId || "",
          finalSurveyorId: item.finalSurveyorId?._id || item.finalSurveyorId || "",
          tpaId: item.tpaId?._id || item.tpaId || "",
          investigatorId: item.investigatorId?._id || item.investigatorId || "",
          invoiceNo: item.invoiceNo || "",
          billOfLadingNo: item.billOfLadingNo || "",
          lrNo: item.lrNo || "",
          insuranceCertificateNo: item.insuranceCertificateNo || "",
          journeyFrom: item.journeyFrom || "",
          journeyTo: item.journeyTo || "",
          surveyorReferenceNumber: item.surveyorReferenceNumber || "",
          settlementType: item.settlementType || "",
          claimApprovedAmount: item.claimApprovedAmount || "",
          dateOfApprovalOfClaim: item.dateOfApprovalOfClaim?.split("T")[0] || "",
          dateOfSettlement: item.dateOfSettlement?.split("T")[0] || "",
          postHospitalizationDischargeDate: item.postHospitalization?.dischargeDate?.split("T")[0] || "",
          postHospitalizationAmountClaimed: item.postHospitalization?.amountClaimed || "",
          postHospitalizationNoOfDays: item.postHospitalization?.noOfDays || "",
        });
        setCurrentClaimId(item._id);
        setIsEdit(true);
        setOpen(true);
        setActiveTab(0);
      }
    });
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteClaim(id);
        fetchClaims();
        Swal.fire(
          'Deleted!',
          'Claim has been deleted successfully.',
          'success'
        );
      } catch (error) {
        console.log(error);
        Swal.fire(
          'Error!',
          'Failed to delete claim. Please try again.',
          'error'
        );
      }
    }
  };

  // ================= HANDLE STATUS CHANGE =================
  const handleStatusChange = (item) => {
    Swal.fire({
      title: 'Change Claim Status',
      input: 'select',
      inputOptions: {
        'Pending': 'Pending',
        'Approved': 'Approved',
        'Rejected': 'Rejected',
        'Under Process': 'Under Process'
      },
      inputValue: item.status || 'Pending',
      inputPlaceholder: 'Select status',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Change',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await updateClaim(item._id, { status: result.value });
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: `Claim status changed to ${result.value}.`,
            timer: 2000,
            showConfirmButton: false
          });
          fetchClaims();
        } catch (error) {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to update claim status.',
            confirmButtonColor: '#d33'
          });
        }
      }
    });
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      claimNo: "",
      department: "",
      status: "Pending",
      remarks: "",
      policyId: "",
      policyNo: "",
      insuredName: "",
      contactNo: "",
      email: "",
      contactPerson: "",
      vehicleNumber: "",
      locationOfProperty: "",
      renewalOrNewPolicy: "",
      typeOfPolicy: "",
      wording: "",
      briefDescriptionOfProperty: "",
      sumInsured: "",
      periodOfInsurance: "",
      insurerName: "",
      netPremium: "",
      totalAmount: "",
      paymentMode: "",
      dateOfLossOrAdmission: "",
      dateOfDischarge: "",
      estimatedLossAmount: "",
      causeOfLoss: "",
      machineryDetails: "",
      preliminarySurveyorId: "",
      finalSurveyorId: "",
      tpaId: "",
      investigatorId: "",
      invoiceNo: "",
      billOfLadingNo: "",
      lrNo: "",
      insuranceCertificateNo: "",
      journeyFrom: "",
      journeyTo: "",
      surveyorReferenceNumber: "",
      settlementType: "",
      claimApprovedAmount: "",
      dateOfApprovalOfClaim: "",
      dateOfSettlement: "",
      postHospitalizationDischargeDate: "",
      postHospitalizationAmountClaimed: "",
      postHospitalizationNoOfDays: "",
    });
    setIsEdit(false);
    setCurrentClaimId(null);
    setActiveTab(0);
  };

  // ================= CLEAR TAB DATA =================
  const handleClearTab = () => {
    let fieldsToClear = [];
    switch (activeTab) {
      case 0:
        fieldsToClear = ["claimNo", "department", "status", "remarks"];
        break;
      case 1:
        fieldsToClear = [
          "policyId", "policyNo", "insuredName", "contactNo", "email",
          "vehicleNumber", "locationOfProperty", "renewalOrNewPolicy",
          "typeOfPolicy", "wording", "sumInsured", "periodOfInsurance",
          "insurerName", "netPremium", "totalAmount", "paymentMode",
          "briefDescriptionOfProperty"
        ];
        break;
      case 2:
        fieldsToClear = [
          "dateOfLossOrAdmission", "dateOfDischarge",
          "estimatedLossAmount", "causeOfLoss", "machineryDetails"
        ];
        break;
      case 3:
        fieldsToClear = [
          "preliminarySurveyorId", "finalSurveyorId", "tpaId", "investigatorId"
        ];
        break;
      case 4:
        fieldsToClear = [
          "invoiceNo", "billOfLadingNo", "lrNo",
          "insuranceCertificateNo", "journeyFrom", "journeyTo",
          "surveyorReferenceNumber"
        ];
        break;
      case 5:
        fieldsToClear = [
          "settlementType", "claimApprovedAmount",
          "dateOfApprovalOfClaim", "dateOfSettlement"
        ];
        break;
      case 6:
        fieldsToClear = [
          "postHospitalizationDischargeDate",
          "postHospitalizationAmountClaimed",
          "postHospitalizationNoOfDays"
        ];
        break;
      default:
        break;
    }

    setFormData((prev) => {
      const updated = { ...prev };
      fieldsToClear.forEach((field) => {
        if (field === "status") {
          updated[field] = "Pending";
        } else {
          updated[field] = "";
        }
      });
      return updated;
    });
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Claim No", "Policy No", "Insured Name", "Department", "Preliminary Surveyor", "Status"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const surveyor = item.preliminarySurveyorId?.surveyorName || '';
      csvContent += `"${(item.claimNo || '').replace(/"/g, '""')}","${(item.policyNo || '').replace(/"/g, '""')}","${(item.insuredName || '').replace(/"/g, '""')}","${(item.department || '').replace(/"/g, '""')}","${surveyor.replace(/"/g, '""')}","${(item.status || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "claims.csv");
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
      if (!header.includes("claim no") || !header.includes("policy no")) {
        toast.error("Invalid CSV format. Header must contain 'Claim No' and 'Policy No'");
        return;
      }

      const policyMap = {};
      policies.forEach(p => {
        if (p.policyNumber) policyMap[p.policyNumber.toLowerCase().trim()] = p;
      });
      const surveyorMap = {};
      surveyors.forEach(s => {
        if (s.surveyorName) surveyorMap[s.surveyorName.toLowerCase().trim()] = s._id;
      });

      const importedClaims = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const claimNo = row[0];
        const policyNo = row[1];
        const insuredName = row[2] || '';
        const department = row[3] || '';
        const surveyorName = row[4] || '';
        const status = row[5] || 'Pending';

        if (claimNo && policyNo) {
          importedClaims.push({
            claimNo,
            policyNo,
            insuredName,
            department,
            surveyorName,
            status
          });
        }
      }

      const existingClaims = new Set(data.map(item => (item.claimNo || '').toLowerCase().trim()));
      const uniqueNewClaims = importedClaims.filter(c => !existingClaims.has(c.claimNo.toLowerCase().trim()));

      if (uniqueNewClaims.length === 0) {
        toast.info("No new unique claims found to import.");
        return;
      }

      let successCount = 0;
      for (const item of uniqueNewClaims) {
        const matchedPolicy = policyMap[item.policyNo.toLowerCase().trim()];
        const surveyorId = surveyorMap[item.surveyorName.toLowerCase().trim()] || "";

        let payload = {
          claimNo: item.claimNo,
          status: item.status,
          policyNo: item.policyNo,
          insuredName: item.insuredName,
          department: item.department,
          preliminarySurveyorId: surveyorId,
          policyId: matchedPolicy ? matchedPolicy._id : "",
          contactNo: matchedPolicy ? matchedPolicy.mobile : "",
          email: matchedPolicy ? matchedPolicy.email : "",
          insurerName: matchedPolicy ? matchedPolicy.insurerName : "",
          sumInsured: matchedPolicy ? matchedPolicy.sumInsured : 0,
        };

        try {
          const res = await createClaim(payload);
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import claim: ${item.claimNo}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique claims found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique claims successfully!`);
      }
      fetchClaims();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      {/* HEADER */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Claim Management</Typography>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpen(true); }}>
            Add Claim
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

      {/* ADD/EDIT DIALOG */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isEdit ? "Edit Claim" : "Add New Claim"}</span>
          <IconButton onClick={() => { setOpen(false); resetForm(); }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Basic Details" />
            <Tab label="Policy Details" />
            <Tab label="Loss Details" />
            <Tab label="Surveyor/TPA" />
            <Tab label="Transport Details" />
            <Tab label="Settlement" />
            <Tab label="Post Hospitalization" />
          </Tabs>

          {/* Tab 1: Basic Details */}
          <Box hidden={activeTab !== 0}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Claim No" name="claimNo" value={formData.claimNo} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments found</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Status" name="status" value={formData.status} onChange={handleChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Under Process">Under Process</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>

          {/* Tab 2: Policy Details */}
          <Box hidden={activeTab !== 1}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Policy Management" name="policyId" value={formData.policyId} onChange={handlePolicyChange}>
                  <MenuItem value="">Select Policy Management</MenuItem>
                  {policies.map((item) => {
                    let customerName = item.cutomerName || "";
                    if (!customerName && item.retailCustomer) {
                      customerName = item.retailCustomer.name;
                    }
                    if (!customerName && item.customerGroup) {
                      customerName = item.customerGroup.groupName || item.customerGroup.name;
                    }
                    return (
                      <MenuItem key={item._id} value={item._id}>{item.policyNumber} - {customerName}</MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Policy No" name="policyNo" value={formData.policyNo} disabled={!!formData.policyNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Insured Name" name="insuredName" value={formData.insuredName} disabled={!!formData.insuredName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact No" name="contactNo" value={formData.contactNo} disabled={!!formData.contactNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" name="email" value={formData.email} disabled={!!formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} disabled={!!formData.vehicleNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Location of Property" name="locationOfProperty" value={formData.locationOfProperty} disabled={!!formData.locationOfProperty} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Renewal/New Policy" name="renewalOrNewPolicy" value={formData.renewalOrNewPolicy} disabled={!!formData.renewalOrNewPolicy} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Type of Policy" name="typeOfPolicy" value={formData.typeOfPolicy} disabled={!!formData.typeOfPolicy} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Wording" name="wording" value={formData.wording} disabled={!!formData.wording} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Sum Insured" name="sumInsured" value={formData.sumInsured} disabled={!!formData.sumInsured} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Period of Insurance" name="periodOfInsurance" value={formData.periodOfInsurance} disabled={!!formData.periodOfInsurance} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Insurer Name" name="insurerName" value={formData.insurerName} disabled={!!formData.insurerName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Total Premium" name="netPremium" value={formData.netPremium} disabled={!!formData.netPremium} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Total Amount" name="totalAmount" value={formData.totalAmount} disabled={!!formData.totalAmount} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Payment Mode" name="paymentMode" value={formData.paymentMode} disabled={!!formData.paymentMode} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Brief Description of Property" name="briefDescriptionOfProperty" value={formData.briefDescriptionOfProperty} disabled={!!formData.briefDescriptionOfProperty} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>

          {/* Tab 3: Loss Details */}
          <Box hidden={activeTab !== 2}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Date of Loss / Admission" name="dateOfLossOrAdmission" InputLabelProps={{ shrink: true }} value={formData.dateOfLossOrAdmission} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Date of Discharge" name="dateOfDischarge" InputLabelProps={{ shrink: true }} value={formData.dateOfDischarge} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Estimated Loss Amount" name="estimatedLossAmount" value={formData.estimatedLossAmount} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Cause of Loss" name="causeOfLoss" value={formData.causeOfLoss} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Details of Insured Property" name="machineryDetails" value={formData.machineryDetails} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>

          {/* Tab 4: Surveyor/TPA/Investigator */}
          <Box hidden={activeTab !== 3}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Preliminary Surveyor" name="preliminarySurveyorId" value={formData.preliminarySurveyorId} onChange={handleChange}>
                  <MenuItem value="">Select Preliminary Surveyor</MenuItem>
                  {surveyors.map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.surveyorName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Final Surveyor" name="finalSurveyorId" value={formData.finalSurveyorId} onChange={handleChange}>
                  <MenuItem value="">Select Final Surveyor</MenuItem>
                  {surveyors.map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.surveyorName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="TPA" name="tpaId" value={formData.tpaId} onChange={handleChange}>
                  <MenuItem value="">Select TPA</MenuItem>
                  {tpas.map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.tpaName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Investigator" name="investigatorId" value={formData.investigatorId} onChange={handleChange}>
                  <MenuItem value="">Select Investigator</MenuItem>
                  {investigators.map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.investigatorName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Tab 5: Transport Details */}
          <Box hidden={activeTab !== 4}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Invoice No." name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Bill of Lading No." name="billOfLadingNo" value={formData.billOfLadingNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="LR No." name="lrNo" value={formData.lrNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Insurance Certificate No." name="insuranceCertificateNo" value={formData.insuranceCertificateNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Journey From" name="journeyFrom" value={formData.journeyFrom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Journey To" name="journeyTo" value={formData.journeyTo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Surveyor Reference Number" name="surveyorReferenceNumber" value={formData.surveyorReferenceNumber} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>

          {/* Tab 6: Settlement */}
          <Box hidden={activeTab !== 5}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Type of Settlement" name="settlementType" value={formData.settlementType} onChange={handleChange}>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Non-Standard">Non-Standard</MenuItem>
                  <MenuItem value="Repudiate">Repudiate</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Claim Approved Amount" name="claimApprovedAmount" value={formData.claimApprovedAmount} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Date of Approval" name="dateOfApprovalOfClaim" InputLabelProps={{ shrink: true }} value={formData.dateOfApprovalOfClaim} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Date of Settlement" name="dateOfSettlement" InputLabelProps={{ shrink: true }} value={formData.dateOfSettlement} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>

          {/* Tab 7: Post Hospitalization */}
          <Box hidden={activeTab !== 6}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Discharge Date" name="postHospitalizationDischargeDate" InputLabelProps={{ shrink: true }} value={formData.postHospitalizationDischargeDate} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Amount Claimed" name="postHospitalizationAmountClaimed" value={formData.postHospitalizationAmountClaimed} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Number of Days" name="postHospitalizationNoOfDays" value={formData.postHospitalizationNoOfDays} onChange={handleChange} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="warning" variant="outlined" onClick={handleClearTab} sx={{ mr: "auto" }}>Clear</Button>
          <Button color="error" variant="outlined" onClick={() => { setActiveTab(0); }}>Back</Button>
          <Button variant="contained" onClick={handleSubmit}>{isEdit ? "Update" : "Save"}</Button>
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
                <TableCell>Department</TableCell>
                <TableCell>Preliminary Surveyor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.claimNo}</TableCell>
                    <TableCell>{item.policyNo}</TableCell>
                    <TableCell>{item.insuredName}</TableCell>
                    <TableCell>{item.department || "-"}</TableCell>
                    <TableCell>{item.preliminarySurveyorId?.surveyorName || "-"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={
                          item.status === "Approved" ? "success" : 
                          item.status === "Rejected" ? "error" : 
                          "warning"
                        } 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(item)} title="Edit Claim"><Edit /></IconButton>
                      <IconButton color="success" onClick={() => handleStatusChange(item)} title="Change Status"><ChangeCircle /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item._id)} title="Delete Claim"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">No Claims Found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default ClaimPage;