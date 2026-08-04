import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Box,
  TableContainer,
  Chip,
  CircularProgress,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Link } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Swal from 'sweetalert2';
import { get, post, remove } from '../../api/api';

const DLT_TEMPLATES = [
  {
    id: "1707171229475133470",
    name: "Vehicle Policy Standard",
    text: "Dear Sir / Madam\nYour Vehicle Policy No {var1} for vehicle No {var2} is due for Renewal on {var3}\nKindly renew the policy before expiry for continuous coverage\nPlease don't hesitate to contact us\n7507553335, 7757825335\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Vehicle No", "Renewal Date"]
  },
  {
    id: "1707171229478113200",
    name: "Vehicle Policy Follow-up",
    text: "Dear Sir / Madam\nYour Vehicle Policy No {var1} for vehicle No {var2} is due for Renewal on {var3} which has not yet been renewed as per our records.\nPlease renew it immediately\nContact us\n7507553335, 7757825335\nIf policy renewed, please ignore the message.\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Vehicle No", "Renewal Date"]
  },
  {
    id: "1707171229481145664",
    name: "General Policy Standard",
    text: "Dear Sir / Madam\nYour {var1} Policy No {var2} is due for Renewal on {var3}\nKindly renew the policy before expiry for continuous coverage\nPlease don't hesitate to contact us\n7507553335, 7757825335\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Department/Type (e.g. Mediclaim)", "Policy No", "Renewal Date"]
  },
  {
    id: "1707171229847086671",
    name: "General Policy Follow-up (No policy number)",
    text: "Dear Sir / Madam\nYour {var1} is due for Renewal on {var2} which has not yet been renewed as per our records. Please renew it immediately\nContact us\n7507553335, 7757825335 \nIf policy renewed, please ignore the message.\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy Detail Description", "Renewal Date"]
  },
  {
    id: "1707171705453558611",
    name: "General Policy Follow-up (With policy number)",
    text: "Dear Sir / Madam\nYour {var1} Policy No {var2} is due for Renewal on {var3} which has not yet been renewed as per our records. Please renew it immediately\nContact us\n7507553335, 7757825335 \nIf policy renewed, please ignore the message.\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Department/Type", "Policy No", "Renewal Date"]
  },
  {
    id: "1707171154526920734",
    name: "Private Car Policy Standard",
    text: "Dear Sir / Madam\nYour Private Car Policy No {var1} for vehicle No {var2} is due for Renewal on {var3}\nKindly renew the policy before expiry for continuous coverage\nPlease don't hesitate to contact us\n7507553335, 7757825335\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Vehicle No", "Renewal Date"]
  },
  {
    id: "1707171154531182881",
    name: "Mediclaim Policy Standard",
    text: "Dear Sir / Madam\nYour Mediclaim Policy No {var1} is due for Renewal on {var2}\nKindly renew the policy before expiry for continuous coverage\nPlease don't hesitate to contact us\n7507553335, 7757825335\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Renewal Date"]
  },
  {
    id: "1707171154535303724",
    name: "Private Car Policy Follow-up",
    text: "Reminder\nDear Sir / Madam\nYour Private Car Policy No {var1} for vehicle No {var2} is due for Renewal on {var3} which has not yet been renewed as per our records.\nPlease renew it immediately\nContact us\n7507553335, 7757825335\nIf policy renewed, please ignore the message.\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Vehicle No", "Renewal Date"]
  },
  {
    id: "1707171154539354305",
    name: "Mediclaim Policy Follow-up",
    text: "Reminder\nDear Sir / Madam\nYour Mediclaim Policy No {var1} due for Renewal on {var2} which has not yet been renewed as per our records.\nPlease renew it immediately\nContact us\n7507553335, 7757825335\nIf policy renewed, please ignore the message.\nRegards\nNitin Jeswani\nJP Insurance Brokers",
    placeholderNames: ["Policy No", "Renewal Date"]
  }
];

const RenewalReminder = () => {
  const [dateFrom, setDateFrom] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [dateTo, setDateTo] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [remindersHistory, setRemindersHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // SMS Dialog states
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [smsMobile, setSmsMobile] = useState('');
  const [variables, setVariables] = useState([]);

  // Auto-fill helper function
  const prefillVariables = (policy, templateId) => {
    if (!policy) return [];
    const formattedDate = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-GB') : "";
    const dept = policy.department || "General";
    const policyNo = policy.policyNo || "";
    const vehicleNo = policy.vehicleNumber || policy.vehicleNo || "";

    switch (templateId) {
      case "1707171229475133470": // Vehicle Policy Standard
      case "1707171229478113200": // Vehicle Policy Follow-up
      case "1707171154526920734": // Private Car Policy Standard
      case "1707171154535303724": // Private Car Policy Follow-up
        return [policyNo, vehicleNo, formattedDate];

      case "1707171229481145664": // General Policy Standard
      case "1707171705453558611": // General Policy Follow-up with policy number
        return [dept, policyNo, formattedDate];

      case "1707171229847086671": // General Policy Follow-up (No policy number)
        return [`${dept} Policy No ${policyNo}`, formattedDate];

      case "1707171154531182881": // Mediclaim Standard
      case "1707171154539354305": // Mediclaim Follow-up
        return [policyNo, formattedDate];

      default:
        return [policyNo, formattedDate];
    }
  };

  const handleOpenSmsDialog = (policy) => {
    setSelectedPolicy(policy);
    setSmsMobile(policy.mobile || '');

    // Auto-detect template based on policy department or attributes
    let defaultTemplateId = "1707171229481145664"; // General Policy Standard
    const dept = (policy.department || "").toLowerCase();
    const hasVehicle = !!(policy.vehicleNumber || policy.vehicleNo);

    if (dept.includes("mediclaim") || dept.includes("health")) {
      defaultTemplateId = "1707171154531182881"; // Mediclaim Standard
    } else if (hasVehicle || dept.includes("motor") || dept.includes("car") || dept.includes("vehicle") || dept.includes("two wheeler")) {
      defaultTemplateId = "1707171229475133470"; // Vehicle Policy Standard
    }

    setSelectedTemplateId(defaultTemplateId);
    setVariables(prefillVariables(policy, defaultTemplateId));
    setSmsDialogOpen(true);
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    setVariables(prefillVariables(selectedPolicy, templateId));
  };

  const handleVariableChange = (index, value) => {
    const updated = [...variables];
    updated[index] = value;
    setVariables(updated);
  };

  const getMessagePreview = () => {
    const template = DLT_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template) return "";
    let text = template.text;
    variables.forEach((val, idx) => {
      text = text.replace(new RegExp(`\\{var${idx + 1}\\}`, 'g'), val || `[Variable ${idx + 1}]`);
    });
    return text;
  };

  const handleFilterValue = (e) => setFilterValue(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Fetch policies from API
  const fetchPolicyDetail = async () => {
    setLoading(true);
    try {
      const res = await get('policyDetail');
      console.log('Policy API Response:', res);

      let rawData = [];
      if (res?.data?.success && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res?.success && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      } else if (res?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      }

      const policies = rawData.map(item => {
        let customerName = item.cutomerName || "";
        if (!customerName && item.retailCustomer) {
          customerName = item.retailCustomer.name;
        }
        if (!customerName && item.customerGroup) {
          customerName = item.customerGroup.groupName || item.customerGroup.name;
        }

        const effectiveEndDate = item.endDate || item.renewalDate || item.odEndDate || item.tpEndDate || "";

        return {
          _id: item._id,
          insuredName: customerName,
          department: item.insDepartment?.name || item.insDepartment?.insDepartment || item.insDepartment || "",
          policyNo: item.policyNumber || "",
          premium: item.netPremium || 0,
          totalAmount: item.totalAmount || 0,
          endDate: effectiveEndDate,
          renewalDate: effectiveEndDate,
          vehicleNumber: item.vehicleNumber || "",
          mobile: item.mobile || "",
          messageCount: item.messageCount || 0
        };
      });

      console.log('Total policies:', policies.length);
      setCustomerList(policies);
      setFilteredData(policies);

      if (policies.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Policies Found",
          text: "Please add some policies first",
          timer: 3000,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch policies",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while the CSV is being imported',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resData = await post('policyDetail/import-csv/', formData);
      Swal.close();

      if (resData && resData.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Inserted ${resData.insertedCount} Records`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchPolicyDetail();
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Processed',
          text: `Upload processed: ${resData?.message || 'completed'}`,
        });
        fetchPolicyDetail();
      }
    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error uploading file',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const fetchRemindersHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await get('renewal-reminder');
      console.log('Reminders History API Response:', res);
      if (res?.success && Array.isArray(res.data)) {
        setRemindersHistory(res.data);
      } else if (Array.isArray(res)) {
        setRemindersHistory(res);
      } else {
        setRemindersHistory([]);
      }
    } catch (error) {
      console.error('Error fetching reminders history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendSmsConfirm = async () => {
    if (!smsMobile) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid mobile number'
      });
      return;
    }

    setSmsDialogOpen(false);
    setLoading(true);

    try {
      const res = await post(`policyDetail/send-reminder/${selectedPolicy._id}`, {
        templateId: selectedTemplateId,
        variables,
        mobile: smsMobile
      });

      if (res?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'SMS Sent Successfully!',
          text: res.message || 'Reminder message sent successfully.',
          html: `<strong>Final Sent Message:</strong><br/><p style="font-style: italic; background: #f0f0f0; padding: 10px; border-radius: 5px; text-align: left; white-space: pre-wrap;">${res.dummyMessage}</p>`
        });
        fetchPolicyDetail();
        fetchRemindersHistory();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'SMS Sending Failed',
          text: res?.message || 'Failed to send reminder message'
        });
      }
    } catch (error) {
      console.error('Error sending reminder message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error?.message || 'Failed to send message due to server error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete History?',
        text: 'Are you sure you want to delete this reminder log?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        setLoadingHistory(true);
        const res = await remove(`renewal-reminder/${id}`);
        if (res?.success || res) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Reminder log deleted successfully',
            timer: 1500,
            showConfirmButton: false
          });
          fetchRemindersHistory();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to delete reminder log'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting reminder log:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error?.message || 'Failed to delete log due to server error'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPolicyDetail();
    fetchRemindersHistory();
  }, []);

  // Calculate remaining days until end date
  const calculateRemainingDays = (endDateString) => {
    if (!endDateString) return 0;
    const endDate = new Date(endDateString);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter data based on search, date range, and renewal filter
  useEffect(() => {
    let filtered = [...customerList];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.insuredName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.policyNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by renewal within 60 days
    if (filterValue === 'renew') {
      filtered = filtered.filter(item => {
        const days = calculateRemainingDays(item.endDate);
        return days <= 60 && days >= 0;
      });
    }

    // Filter by date range
    if (filterValue === 'byDateRange' && dateFrom && dateTo) {
      filtered = filtered.filter(item => {
        if (!item.endDate) return false;
        const endDate = new Date(item.endDate);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return endDate >= fromDate && endDate <= toDate;
      });
    }

    setFilteredData(filtered);
  }, [searchTerm, filterValue, dateFrom, dateTo, customerList]);

  const handleDateFilterChange = (field, value) => {
    if (field === 'dateFrom') {
      setDateFrom(value);
    } else if (field === 'dateTo') {
      setDateTo(value);
    }
  };

  const handleReset = () => {
    setFilterValue('');
    setDateFrom(null);
    setDateTo(null);
    setSearchTerm('');
    setFilteredData(customerList);
    Swal.fire({
      icon: "success",
      title: "Reset!",
      text: "All filters have been reset",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleApplyDateRange = () => {
    if (!dateFrom || !dateTo) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please select both From Date and To Date",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Applied!",
      text: "Date range filter applied",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const [filteredHistory, setFilteredHistory] = useState([]);

  // Filter history data based on search and date range
  useEffect(() => {
    let filtered = [...remindersHistory];

    // Search filter for history
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.policyNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range for history
    if (filterValue === 'byDateRange' && dateFrom && dateTo) {
      filtered = filtered.filter(item => {
        if (!item.reminderDate) return false;
        const reminderDate = new Date(item.reminderDate);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return reminderDate >= fromDate && reminderDate <= toDate;
      });
    }

    setFilteredHistory(filtered);
  }, [searchTerm, filterValue, dateFrom, dateTo, remindersHistory]);

  const handleRenewWithin30Days = () => {
    setFilterValue('renew');
    Swal.fire({
      icon: "info",
      title: "Filter Applied",
      text: "Showing policies that expire within 60 days",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const exportToCSV = (data, fileName) => {
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No data to export',
        text: 'There is no data available to export in this tab.'
      });
      return;
    }

    let csvContent = "";

    if (activeTab === 0) {
      const headers = ["CUSTOMER NAME", "DEPARTMENT", "POLICY NO", "NET PREMIUM", "TOTAL PREMIUM", "RENEWAL DATE", "MOBILE", "MESSAGE COUNT"];
      csvContent += headers.join(",") + "\n";

      data.forEach(item => {
        const row = [
          `"${(item.insuredName || "").replace(/"/g, '""')}"`,
          `"${(item.department || "").replace(/"/g, '""')}"`,
          `"${(item.policyNo || "").replace(/"/g, '""')}"`,
          item.premium || 0,
          item.totalAmount || 0,
          `"${(item.endDate ? new Date(item.endDate).toLocaleDateString('en-GB') : "")}"`,
          `"${(item.mobile || "").replace(/"/g, '""')}"`,
          item.messageCount || 0
        ];
        csvContent += row.join(",") + "\n";
      });
    } else {
      const headers = ["S.No.", "Customer Name", "Policy No.", "Contact No.", "Email", "End Date", "Reminder Date (Sent)", "Status"];
      csvContent += headers.join(",") + "\n";

      data.forEach((item, index) => {
        const row = [
          index + 1,
          `"${(item.customerName || "").replace(/"/g, '""')}"`,
          `"${(item.policyNo || "").replace(/"/g, '""')}"`,
          `"${(item.contactNo || "").replace(/"/g, '""')}"`,
          `"${(item.email || "").replace(/"/g, '""')}"`,
          `"${(item.endDate ? new Date(item.endDate).toLocaleDateString('en-GB') : "")}"`,
          `"${(item.reminderDate ? new Date(item.reminderDate).toLocaleString('en-GB') : "")}"`,
          `"${(item.status || "Pending").replace(/"/g, '""')}"`
        ];
        csvContent += row.join(",") + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Breadcrumb title="Renewal Reminder">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit">
          Renewal Management
        </Typography>
        <Typography variant="subtitle2" color="primary">
          Renewal Reminder
        </Typography>
      </Breadcrumb>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="renewal reminder tabs">
          <Tab label="Policies & Renewals" />
          <Tab label={`Sent Reminders History (${remindersHistory.length})`} />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              const dataToExport = activeTab === 0 ? filteredData : filteredHistory;
              const filename = activeTab === 0 ? 'policies_renewals.csv' : 'sent_reminders_history.csv';
              exportToCSV(dataToExport, filename);
            }}
            sx={{ mb: 1 }}
            disabled={localStorage.getItem('loginRole') !== 'admin'}
          >
            Export
          </Button>
          {activeTab === 0 && (
            <Button
              variant="contained"
              component="label"
              size="small"
              disabled={isUploading}
              sx={{ mb: 1, backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
            >
              {isUploading ? 'Importing...' : 'Import'}
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                hidden
                onChange={handleImportCSV}
              />
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters Card */}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Search"
                    fullWidth
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={activeTab === 0 ? "Search by name, policy no..." : "Search by name, policy no, contact..."}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Filter By"
                    size="small"
                    value={filterValue}
                    onChange={handleFilterValue}
                    fullWidth
                  >
                    <MenuItem value="">{activeTab === 0 ? "All Policies" : "All History"}</MenuItem>
                    <MenuItem value="byDateRange">By Date Range</MenuItem>
                    {activeTab === 0 && <MenuItem value="renew">Renew Within 60 Days</MenuItem>}
                  </TextField>
                </Grid>

                {filterValue === 'byDateRange' && (
                  <>
                    <Grid item xs={12} sm={6} md={2}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="From Date"
                          value={dateFrom}
                          onChange={(value) => handleDateFilterChange('dateFrom', value)}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="To Date"
                          value={dateTo}
                          onChange={(value) => handleDateFilterChange('dateTo', value)}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                      <Button variant="contained" size="small" fullWidth onClick={handleApplyDateRange}>
                        Apply
                      </Button>
                    </Grid>
                  </>
                )}

                {filterValue === 'renew' && activeTab === 0 && (
                  <Grid item xs={12} sm={6} md={2}>
                    <Button variant="contained" size="small" fullWidth onClick={handleRenewWithin30Days}>
                      Renew within 60 days
                    </Button>
                  </Grid>
                )}

                <Grid item xs={12} sm={6} md={filterValue === 'byDateRange' ? 1 : (filterValue === 'renew' && activeTab === 0 ? 2 : 1)}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{
                      backgroundColor: 'primary.dark',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        color: '#ffffff'
                      }
                    }}
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Table Card */}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {activeTab === 0 ? (
                loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>CUSTOMER NAME</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>DEPARTMENT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>POLICY NO</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>NET PREMIUM</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>TOTAL PREMIUM</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>RENEWAL DATE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', align: 'center', textAlign: 'center' }}>Send Message</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', align: 'center', textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((entry, index) => {
                            const daysLeft = calculateRemainingDays(entry?.endDate);
                            const isExpiringSoon = daysLeft <= 7 && daysLeft >= 0;

                            return (
                              <TableRow
                                key={entry?._id || index}
                                sx={{
                                  backgroundColor: isExpiringSoon ? '#fff3e0' : 'inherit',
                                  '&:hover': { backgroundColor: '#f5f5f5' }
                                }}
                              >
                                <TableCell>{entry?.insuredName || '-'}</TableCell>
                                <TableCell>{entry?.department || '-'}</TableCell>
                                <TableCell>{entry?.policyNo || '-'}</TableCell>
                                <TableCell>{entry?.premium?.toLocaleString() || '-'}</TableCell>
                                <TableCell>{entry?.totalAmount?.toLocaleString() || '-'}</TableCell>
                                <TableCell>
                                  {entry?.endDate ? String(entry.endDate).split('T')[0] : (entry?.renewalDate ? String(entry.renewalDate).split('T')[0] : '-')}
                                  {' '}
                                  {daysLeft >= 0 ? `(${daysLeft} days)` : '(Expired)'}
                                </TableCell>
                                <TableCell align="center" style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
                                  <Button
                                    variant="contained"
                                    disabled={daysLeft > 30}
                                    sx={{
                                      backgroundColor: '#007920',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      padding: '6px 16px',
                                      borderRadius: '6px',
                                      textTransform: 'none',
                                      width: '140px',
                                      display: 'inline-flex',
                                      flexDirection: 'column',
                                      lineHeight: '1.2',
                                      '&:hover': {
                                        backgroundColor: '#007920'
                                      }
                                    }}
                                    onClick={() => handleOpenSmsDialog(entry)}
                                  >
                                    <span style={{ fontSize: '0.9rem' }}>{entry?.mobile || '-'}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>({entry?.messageCount || 0})</span>
                                  </Button>
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="contained"
                                    sx={{
                                      backgroundColor: 'primary.dark',
                                      color: '#ffffff',
                                      fontWeight: 'bold',
                                      borderRadius: '6px',
                                      textTransform: 'uppercase',
                                      boxShadow: 'none',
                                      '&:hover': {
                                        backgroundColor: 'primary.dark',
                                        color: '#ffffff',
                                        boxShadow: 'none'
                                      }
                                    }}
                                    component={Link}
                                    to={`/renewPolicy/${entry?._id}`}
                                  >
                                    Renew
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={11} align="center">
                              <Box py={5}>
                                <Typography variant="h6" color="textSecondary">
                                  No Policies Found
                                </Typography>
                                <Typography variant="body2" color="textSecondary" mt={1}>
                                  Please add some policies to see renewal reminders
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                loadingHistory ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: 50 }}>S.No.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Policy No.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Contact No.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Reminder Date (Sent)</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((historyEntry, index) => (
                            <TableRow
                              key={historyEntry?._id || index}
                              sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{historyEntry?.customerName || '-'}</TableCell>
                              <TableCell>{historyEntry?.policyNo || '-'}</TableCell>
                              <TableCell>{historyEntry?.contactNo || '-'}</TableCell>
                              <TableCell>{historyEntry?.email || '-'}</TableCell>
                              <TableCell>
                                {historyEntry?.endDate ? new Date(historyEntry.endDate).toLocaleDateString('en-GB') : '-'}
                              </TableCell>
                              <TableCell>
                                {historyEntry?.reminderDate ? new Date(historyEntry.reminderDate).toLocaleString('en-GB') : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={historyEntry?.status || 'Pending'}
                                  color={historyEntry?.status === 'active' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteHistory(historyEntry?._id)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Box py={5}>
                                <Typography variant="h6" color="textSecondary">
                                  No Reminder Logs Found
                                </Typography>
                                <Typography variant="body2" color="textSecondary" mt={1}>
                                  Send some reminders from the "Policies & Renewals" tab to see them listed here
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* CommNest DLT Template SMS Dialog */}
      <Dialog
        open={smsDialogOpen}
        onClose={() => setSmsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 'bold' }}>
          Send Renewal Reminder
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            {selectedPolicy && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>
                  Policy Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">Customer Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>{selectedPolicy.insuredName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">Department</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>{selectedPolicy.department || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">Policy Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>{selectedPolicy.policyNo || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">End Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {selectedPolicy.endDate ? new Date(selectedPolicy.endDate).toLocaleDateString('en-GB') : '-'}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Grid>
            )}

            {/* Mobile number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Recipient Mobile"
                fullWidth
                size="small"
                value={smsMobile}
                onChange={(e) => setSmsMobile(e.target.value)}
                placeholder="Mobile number with country code"
              />
            </Grid>

            {/* Template Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="template-select-label">Select SMS Template</InputLabel>
                <Select
                  labelId="template-select-label"
                  value={selectedTemplateId}
                  label="Select SMS Template"
                  onChange={handleTemplateChange}
                >
                  {DLT_TEMPLATES.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Variable Fields */}
            {selectedTemplateId && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: '600', mt: 1 }}>
                  Template Variables
                </Typography>
                <Grid container spacing={2}>
                  {DLT_TEMPLATES.find(t => t.id === selectedTemplateId)?.placeholderNames.map((name, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <TextField
                        label={name}
                        fullWidth
                        size="small"
                        value={variables[index] || ""}
                        onChange={(e) => handleVariableChange(index, e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {/* Message Preview */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  mt: 1
                }}
              >
                <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Live SMS Preview (DLT Header: JPINBR)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    color: '#333'
                  }}
                >
                  {getMessagePreview()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSmsDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSendSmsConfirm}
            color="success"
            variant="contained"
            disabled={!smsMobile}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RenewalReminder;