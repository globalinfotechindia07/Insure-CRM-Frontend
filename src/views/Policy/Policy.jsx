import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { financialYearContext } from 'context/financialYearContext';
// import { CButton, CFormInput, CFormSelect } from '@coreui/react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  IconButton,
  CardContent,
  Divider,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  TablePagination,
  Paper,
  InputAdornment,
  Radio,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import value from 'assets/scss/_themes-vars.module.scss';
import REACT_APP_API_URL, { get, post, put, remove } from '../../api/api';
import axios from 'axios';
import { useSelector } from 'react-redux';

const initialState = {
  financialYear: ''
};

const Policy = () => {
  const FYHeader = useContext(financialYearContext);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialState);
  const [filter, setFilter] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [insCompanyData, setInsCompanyData] = useState({});
  const [insDepartmentData, setInsDepartmentData] = useState({});
  const [financialYearData, setFinancialYearData] = useState([]);
  const [financialYear, setFinancialYear] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [isExporting, setIsExporting] = useState('false');
  const [isUploading, setIsUploading] = useState('false');

  useEffect(() => {}, [filter]);

  useEffect(() => {
    const selectedFY = localStorage.getItem('selectedFY');
    setFinancialYear(selectedFY);
  }, []);

  console.log('Selected FY in Policy', financialYear);
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
      // console.log('Prefix List data', incotermsData);
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
      if (res.status) setCustomerList(res.data);
      else setCustomerList([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  }, [financialYear]);

  useEffect(() => {
    // Listen for ANY localStorage changes (even from other components/tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'selectedFY') {
        const newFY = e.newValue;
        if (newFY && newFY !== financialYear) {
          setFinancialYear(newFY);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check current value on mount
    const savedFY = localStorage.getItem('selectedFY');
    if (savedFY && savedFY !== financialYear) {
      setFinancialYear(savedFY);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty deps - runs once

  // Todo:
  useEffect(() => {
    fetchPolicyDetail();
  }, [financialYear]);

  const handleDelete = async (index) => {
    setLoading(true);
    try {
      const id = index;
      await remove(`policyDetail/${id}`);
      toast.success('Record Deleted Sucessfully');
      fetchPolicyDetail();
    } catch (error) {
      console.error(error);
      toast.error('Record Deletion Failed');
    } finally {
      setLoading(false);
    }
  };

  // Truncate text to max 2 lines (approx 100 chars)
  const truncateText = (text, maxLength = 25) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return customerList;

    const lowerSearch = searchTerm.toLowerCase().trim();
    return customerList.filter(
      (entry) =>
        entry?.cutomerName?.toLowerCase().includes(lowerSearch) ||
        entry?.insCompany?.insCompany?.toLowerCase().includes(lowerSearch) ||
        entry?.insDepartment?.insDepartment?.toLowerCase().includes(lowerSearch) ||
        entry?.policyNumber?.toLowerCase().includes(lowerSearch)
    );
  }, [customerList, searchTerm]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleFilter = (e) => {
    setFinancialYear(e.target.value);
  };

  const handleFileUpload = async (e) => {
    console.log('Upload Button Cliecked');
    setIsUploading(true);
    try {
      if (!file) {
        toast.error('No file selected');
        setIsUploading(false);
        return;
      }
      // console.log('File is presnt ', file);

      const formData = new FormData();
      // formData.append('file', file);

      // console.log('BAse URL', REACT_APP_API_URL);

      const response = await axios.post(`${REACT_APP_API_URL}policyDetail/import-csv/`, formData, {});
      if (response.status) {
        toast.success(`Inserted ${response.data.insertedCount} Records`);
      }
      console.log('PSOT response', response);
    } catch (error) {
      toast('Error uploading file');
    } finally {
      setIsUploading(false); // Stop uploading
    }
  };

  const handleFileChange = (event) => {
    // console.log('file changed ', event.target.files[0]);
    setFile(event.target.files[0]);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    console.log('FY ', financialYear);
    try {
      // Append fromYear and toYear as query parameters
      const response = await axios.get(`${REACT_APP_API_URL}policyDetail/export-csv?financialYear=${financialYear}`, {
        responseType: 'blob'
      });

      console.log('exporrt Response ', response);
      const filename = `policyData-${financialYear}.csv`;
      // const filename = `policyData-${fromYear}-${toYear}.csv`;
      const blob = new Blob([response.data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      toast.success('Policy exported successfully');

      setIsExporting(false);
    } catch (error) {
      console.log(error);
      toast.error('Error exporting Policy data');
      setIsExporting(false);
    }
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
            <Typography variant="h6">Loading Policies...</Typography>
          </Paper>
        </Box>
      )}

      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Policy
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing} sx={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Policy Management</Typography>
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                background: 'white',
                padding: '.4rem',
                borderRadius: '6px'
              }}
            >
              <input
                style={{ border: 'none', outline: 'none' }}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />

              <Button variant="contained" onClick={() => handleFileUpload()} disabled={isUploading === true}>
                {isUploading === true ? 'Please Wait...' : 'Upload'}
              </Button>

              <Button variant="contained" onClick={() => handleExportCSV()} disabled={isExporting === true}>
                {isExporting === true ? 'Exporting...' : 'Export'}
              </Button>
            </div>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                navigate('/policy/AddPolicy');
              }}
            >
              Add Policy
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id="filter">Filter</InputLabel>
            <Select labelId="filter" label="filter" name="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="byFinancialYear">By Financial Year</MenuItem>
              <MenuItem value="byMonth">By Month</MenuItem>
              <MenuItem value="byCompany">Insurance Company</MenuItem>
              <MenuItem value="byDepartment">Department</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {filter === 'byFinancialYear' ? (
          <>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                labelId="financialYear"
                label="FinancialYear"
                name="financialYear"
                type="financialYear"
                onChange={(e) => handleFilter(e)}
              >
                {financialYearData.length > 0 &&
                  financialYearData.map((type) => (
                    <MenuItem
                      key={type._id}
                      value={type._id}
                      style={{
                        textAlign: 'center'
                        // padding: '8px 8px'
                      }}
                    >
                      {new Date(type.fromDate).getFullYear()} - {new Date(type.toDate).getFullYear()}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </>
        ) : null}
        {filter === 'byMonth' ? (
          <>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth labelId="month" label="Month" name="month" type="month" />
            </Grid>
          </>
        ) : null}
        {filter === 'byStaff' ? (
          <>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="staff">Staff</InputLabel>
                <Select labelId="staff" label="staff" name="staff">
                  <MenuItem value="byStaff">Ajay</MenuItem>
                  <MenuItem value="byMonth">Vijay</MenuItem>
                  <MenuItem value="byCompany">Sanjay</MenuItem>
                  <MenuItem value="byDepartment">Ramdeen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        ) : null}
        {filter === 'byCompany' ? (
          <>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="company">Insurance Company</InputLabel>
                <Select labelId="company" label="company" name="company">
                  {insCompanyData.length > 0 &&
                    insCompanyData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.insCompany}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        ) : null}
        {filter === 'byDepartment' ? (
          <>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="department">Department</InputLabel>
                <Select labelId="department" label="department" name="department">
                  {insDepartmentData.length > 0 &&
                    insDepartmentData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.insDepartment}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        ) : null}

        {filter === 'byFinancialYear' ? null : (
          <>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth labelId="search" label="Search Here..." name="search" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" size="large" onClick={handleFilter}>
                Reset Filter
              </Button>
            </Grid>
          </>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Paper sx={{ overflow: 'hidden' }}>
            {/* Search Field */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, company, department, policy..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Table Container */}
            <Box sx={{ overflowX: 'auto' }}>
              <Grid container sx={{ minWidth: '1000px' }}>
                <Table sx={{ tableLayout: 'auto', minWidth: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ height: 'auto' }}>
                      <TableCell sx={{ width: 60, px: 1, py: 0.2 }}>SN</TableCell>
                      <TableCell sx={{ width: 600, px: 1, py: 0.2 }}>Customer Name</TableCell>
                      <TableCell sx={{ width: 300, px: 1, py: 0.2 }}>Insurance Company</TableCell>
                      <TableCell sx={{ width: 150, px: 1, py: 0.2 }}>Department</TableCell>
                      <TableCell sx={{ width: 150, px: 1, py: 0.2 }}>Policy No</TableCell>
                      <TableCell sx={{ width: 80, px: 1, py: 0.2 }}>Net Premium</TableCell>
                      <TableCell sx={{ width: 80, px: 1, py: 0.2 }}>Total GST</TableCell>
                      <TableCell sx={{ width: 80, px: 1, py: 0.2 }}>Total Amount</TableCell>
                      <TableCell sx={{ width: 80, px: 1, py: 0.2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedData.map((entry, index) => (
                      <TableRow
                        key={entry?._id || index}
                        hover
                        sx={{
                          height: 'auto',
                          '&:hover': { backgroundColor: 'action.hoverOpacity' }
                        }}
                      >
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5, wordBreak: 'break-word' }}>
                          {truncateText(entry?.cutomerName)}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5, wordBreak: 'break-word', maxHeight: 60 }}>
                          <Typography
                            variant="body2"
                            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {truncateText(entry?.insCompany?.insCompany)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{entry?.insDepartment?.insDepartment}</TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{entry?.policyNumber}</TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{Number(entry?.netPremium).toFixed(2)}</TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{Number(entry?.gstAmount).toFixed(2)}</TableCell>
                        <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>{Number(entry?.totalAmount).toFixed(2)}</TableCell>
                        <TableCell
                          sx={{
                            verticalAlign: 'bottom',
                            py: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            gap: 0.5
                          }}
                        >
                          <IconButton size="small" color="primary" component={Link} to={`/EditPolicy/${entry?._id}`}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(entry?._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1">No data found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Grid>
            </Box>

            {/* Pagination */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <TablePagination
                rowsPerPageOptions={[100]}
                component="div"
                count={filteredData.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Rows per page:"
              />
            </Box>
          </Paper>
        </CardContent>
      </Card>
      <ToastContainer />
    </>
  );
};

export default Policy;
