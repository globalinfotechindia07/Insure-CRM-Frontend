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
  MenuItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Swal from 'sweetalert2';
import { get } from '../../api/api';

const RenewalReminder = () => {
  const [dateFrom, setDateFrom] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [dateTo, setDateTo] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
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

        return {
          _id: item._id,
          insuredName: customerName,
          department: item.insDepartment?.name || item.insDepartment?.insDepartment || item.insDepartment || "",
          policyNo: item.policyNumber || "",
          premium: item.netPremium || 0,
          totalAmount: item.totalAmount || 0,
          endDate: item.endDate,
          vehicleNumber: item.vehicleNumber || ""
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

  useEffect(() => {
    fetchPolicyDetail();
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
                    placeholder="Search by name, policy no..."
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
                    <MenuItem value="">All Policies</MenuItem>
                    <MenuItem value="byDateRange">By Date Range</MenuItem>
                    <MenuItem value="renew">Renew Within 60 Days</MenuItem>
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
                
                {filterValue === 'renew' && (
                  <Grid item xs={12} sm={6} md={2}>
                    <Button variant="contained" size="small" fullWidth onClick={handleRenewWithin30Days}>
                      Renew within 60 days
                    </Button>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6} md={filterValue === 'byDateRange' ? 1 : (filterValue === 'renew' ? 2 : 1)}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth
                    sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#fb8c00' } }} 
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
              {loading ? (
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
                        <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Policy No.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Net Premium</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Total Premium</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Days Left</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Action</TableCell>
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
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{entry?.insuredName || '-'}</TableCell>
                              <TableCell>{entry?.department || '-'}</TableCell>
                              <TableCell>{entry?.policyNo || '-'}</TableCell>
                              <TableCell align="right">{entry?.premium?.toLocaleString() || '-'}</TableCell>
                              <TableCell align="right">{entry?.totalAmount?.toLocaleString() || '-'}</TableCell>
                              <TableCell sx={{ color: isExpiringSoon ? '#d32f2f' : 'inherit', fontWeight: isExpiringSoon ? 'bold' : 'normal' }}>
                                {entry?.endDate ? new Date(entry.endDate).toLocaleDateString('en-GB') : '-'}
                              </TableCell>
                              <TableCell>
                                {daysLeft >= 0 ? (
                                  <Chip
                                    label={`${daysLeft} days`}
                                    color={daysLeft <= 7 ? 'error' : daysLeft <= 30 ? 'warning' : 'success'}
                                    size="small"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Chip label="Expired" color="error" size="small" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
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
                          <TableCell colSpan={9} align="center">
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
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default RenewalReminder;