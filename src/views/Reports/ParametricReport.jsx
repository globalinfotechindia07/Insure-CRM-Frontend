import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  IconButton,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  InputLabel,
  Divider,
  Box,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  TableContainer
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { get, post } from '../../api/api';
import { set } from 'lodash';

const ParametricReport = () => {
  const [filterDate, setFilterDate] = useState('byDate');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [dateMonth, setDateMonth] = useState(null);
  const [toggleState, setToggleState] = useState({});
  const [selectedColumns, setSelectedColumns] = useState(['cutomerName', 'insCompany', 'insDepartment', 'totalAmount']);
  const [exceptionColumns] = useState(['cutomerName', 'insCompany', 'insDepartment', 'totalAmount']);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    brokerageIncGst: 0,
    netPremium: 0,
    gstAmount: 0
  });
  const [totalPremiumGst, setTotalPremiumGst] = useState(0);
  const [totalBrokerageGst, setTotalBrokerageGst] = useState(0);
  const [totalNetPremium, setTotalNetPremium] = useState(0);
  const [totalTotalAmount, setTotalTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [financialYear, setFinancialYear] = useState('');
  const [insDepartmentData, setInsDepartmentData] = useState([]);
  const [insCompanyData, setInsCompanyData] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  const handleFilterDateChange = (e) => setFilterDate(e.target.value);

  const handleToggleChange = (e, fieldName) => {
    const checked = e.target.checked;
    setToggleState((prev) => ({ ...prev, [fieldName]: checked }));
    if (!checked) {
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const columnMasterList = [
    { key: 'cutomerName', label: 'Customer Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'policyNumber', label: 'Policy Number' },
    {
      key: 'insDepartment',
      label: 'Department',
      render: (row) => row.insDepartment?.insDepartment
    },
    {
      key: 'insCompany',
      label: 'Insurance Company',
      render: (row) => row.insCompany?.insCompany
    },
    { key: 'gstAmount', label: 'GST Amount' },
    { key: 'totalBrokerageGst', label: 'Brokerage GST' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'netPremium', label: 'Net Premium' },
    { key: 'totalBrokerageAmountincGst', label: 'Brokerage Amount (Incl. GST)' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'vehicleNumber', label: 'Vehicle Number' }
  ];

  const toggleItems = [
    'cutomerName',
    'email',
    'mobile',
    'totalBrokerageAmountincGst',
    'policyNumber',
    'Insurance Company',
    'Department',
    'gstAmount',
    'totalBrokerageGst',
    'startDate',
    'endDate',
    'netPremium',
    'totalAmount',
    'vehicleNumber'
  ];

  // const rows = customerList;
  const rows = filteredRows;

  useEffect(() => {}, [filterDate]);

  useEffect(() => {
    const selectedFY = localStorage.getItem('selectedFY');
    setFinancialYear(selectedFY);
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [insCompanyData, insDepartmentData, financialYearData] = await Promise.all([
        get('insCompany'),
        get('insDepartment'),
        get('financialYear')
      ]);
      setInsCompanyData(insCompanyData.data || []);
      setInsDepartmentData(insDepartmentData.data || []);
      setFinancialYearData(financialYearData.data || []);
      // console.log('Prefix List data', insDepartmentData);
    } catch (err) {
      console.error('Dropdown load error:', err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch all policy Detail

  const fetchPolicyDetail = useCallback(async () => {
    if (!financialYear) return; // Don't call if no FY

    setLoading(true);
    try {
      console.log('Fetching with FY:', financialYear);
      const res = await get(`policyDetail?financialYear=${financialYear}`);
      console.log('policyDetail data:', res);
      if (res.status) {
        setCustomerList(res.data);
      } else {
        setCustomerList([]);
        setSummary({
          totalAmount: 0,
          brokerageIncGst: 0,
          netPremium: 0,
          gstAmount: 0
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  }, [financialYear]);

  useEffect(() => {
    fetchPolicyDetail();
  }, [financialYear]);

  useEffect(() => {
    if (!filteredRows || filteredRows.length === 0) {
      setSummary({
        totalAmount: 0,
        brokerageIncGst: 0,
        netPremium: 0,
        gstAmount: 0
      });
      return;
    }

    const totals = filteredRows.reduce(
      (acc, curr) => {
        acc.totalAmount += Number(curr?.totalAmount || 0);
        acc.brokerageIncGst += Number(curr?.totalBrokerageAmountincGst || 0);
        acc.netPremium += Number(curr?.netPremium || 0);
        acc.gstAmount += Number(curr?.gstAmount || 0);
        return acc;
      },
      {
        totalAmount: 0,
        brokerageIncGst: 0,
        netPremium: 0,
        gstAmount: 0
      }
    );

    setSummary(totals);
  }, [filteredRows]);

  const handleFilterChange = (name, value) => {
    if (name === 'dateFrom') setDateFrom(value);
    if (name === 'dateTo') setDateTo(value);
    if (name === 'month') setDateFrom(value); // month picker
  };

  useEffect(() => {
    setFilteredRows(customerList);
  }, [customerList]);

  const handleFilter = () => {
    if (!customerList.length) return;

    let start = null;
    let end = null;

    // DATE / MONTH FILTER
    if (filterDate === 'byMonth' && dateFrom) {
      const range = getMonthRange(dateFrom);
      start = range.start;
      end = range.end;
    }

    if (filterDate === 'byDate' && dateFrom && dateTo) {
      start = normalizeDate(dateFrom);
      end = normalizeDate(dateTo);
    }

    const filtered = customerList.filter((row) => {
      // --- DATE CHECK ---
      if (start && end) {
        if (!row.startDate) return false;
        const rowDate = normalizeDate(row.startDate);
        if (rowDate < start || rowDate > end) return false;
      }

      // --- DEPARTMENT CHECK ---
      if (selectedDepartment) {
        if (row.insDepartment?._id !== selectedDepartment) return false;
      }

      // --- COMPANY CHECK ---
      if (selectedCompany) {
        if (row.insCompany?._id !== selectedCompany) return false;
      }

      // --- CUSTOMER SEARCH CHECK ---
      if (searchCustomer) {
        const customerName = row.cutomerName?.toLowerCase() || '';
        if (!customerName.includes(searchCustomer.toLowerCase())) return false;
      }

      return true;
    });

    setFilteredRows(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchCustomer]);

  const handleClear = () => {
    setDateFrom(null);
    setDateTo(null);
    setSelectedDepartment('');
    setSelectedCompany('');
    setSearchCustomer('');
    setFilteredRows(customerList);
  };

  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getMonthRange = (date) => {
    if (!date) return { start: null, end: null };

    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return { start, end };
  };

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper elevation={6} sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6">Loading Report...</Typography>
          </Paper>
        </Box>
      )}
      <Breadcrumb title="Paramentric Report">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit">
          Report
        </Typography>
        <Typography variant="subtitle2" color="primary">
          Parametric
        </Typography>
      </Breadcrumb>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box>
                <Grid container spacing={1} sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  <Grid item xs={2}>
                    <TextField select label="filter Date" name="Date" fullWidth value={filterDate} onChange={handleFilterDateChange}>
                      <MenuItem value="byMonth">BY MONTH</MenuItem>
                      <MenuItem value="byDate">BY DATE</MenuItem>
                    </TextField>
                  </Grid>
                  {filterDate === 'byMonth' ? (
                    <>
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Month"
                            views={['year', 'month']}
                            value={dateFrom}
                            onChange={(value) => handleFilterChange('month', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="From Date"
                            value={dateFrom}
                            onChange={(value) => handleFilterChange('dateFrom', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="To Date"
                            value={dateTo}
                            onChange={(value) => handleFilterChange('dateTo', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={2}>
                        <Button size="large" sx={{ py: 1 }} variant="contained" onClick={handleFilter}>
                          filter
                        </Button>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={2}>
                    <TextField label="Search..." name="search" fullWidth></TextField>
                  </Grid>
                  <Grid item xs={2}>
                    <Button sx={{ py: 2 }} variant="contained" onClick={handleFilter}>
                      Generate Report
                    </Button>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={2}>
                      <TextField
                        select
                        label="Department"
                        name="insDepartment"
                        fullWidth
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        {insDepartmentData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.insDepartment}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        select
                        label="Insurance Company"
                        name="insCompany"
                        fullWidth
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                      >
                        {insCompanyData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.insCompany}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={2}>
                      <TextField
                        label="Search Customer"
                        name="searchCustomer"
                        fullWidth
                        value={searchCustomer}
                        onChange={(e) => setSearchCustomer(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button size="large" sx={{ py: 1 }} variant="contained" onClick={handleClear}>
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      label="Select All"
                      control={
                        <Switch
                          checked={selectedColumns.length === columnMasterList.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns(columnMasterList.map((col) => col.key));
                            } else {
                              setSelectedColumns([...exceptionColumns]);
                            }
                          }}
                        />
                      }
                    />

                    {columnMasterList.map((col) => (
                      <FormControlLabel
                        key={col.key}
                        label={col.label} // 👈 pretty label
                        control={
                          <Switch
                            checked={selectedColumns.includes(col.key)}
                            onChange={() => {
                              if (selectedColumns.includes(col.key)) {
                                setSelectedColumns(selectedColumns.filter((c) => c !== col.key));
                              } else {
                                setSelectedColumns([...selectedColumns, col.key]);
                              }
                            }}
                          />
                        }
                      />
                    ))}
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          <Table>
            <TableHead>
              <TableRow>
                {columnMasterList
                  .filter((col) => selectedColumns.includes(col.key))
                  .map((col) => (
                    <TableCell key={col.key}>{col.label}</TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  {columnMasterList
                    .filter((col) => selectedColumns.includes(col.key))
                    .map((col) => (
                      <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                    ))}
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {['gstAmount', 'totalBrokerageAmountincGst', 'netPremium', 'totalAmount'].some((col) => selectedColumns.includes(col)) && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total</TableCell>
                )}

                {selectedColumns.includes('gstAmount') && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    GST Amount :
                    {summary.gstAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                )}
                {selectedColumns.includes('totalBrokerageAmountincGst') && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Brokerage Amount:
                    {summary.brokerageIncGst.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                )}
                {selectedColumns.includes('netPremium') && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Net Premium:
                    {summary.netPremium.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                )}
                {selectedColumns.includes('totalAmount') && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Amount:{' '}
                    {summary.totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </>
  );
};

export default ParametricReport;
