import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Link } from 'react-router-dom';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { toast, ToastContainer } from 'react-toastify';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import value from 'assets/scss/_themes-vars.module.scss';
import { get, post, put, remove } from "../../../api/api.js"
import { useSelector } from 'react-redux';

// Nationalized Banks List
const NATIONALIZED_BANKS = [
  { code: 'SBI', name: 'State Bank of India (SBI)' },
  { code: 'PNB', name: 'Punjab National Bank (PNB)' },
  { code: 'BOB', name: 'Bank of Baroda (BOB)' },
  { code: 'CANARA', name: 'Canara Bank' },
  { code: 'IOB', name: 'Indian Overseas Bank (IOB)' },
  { code: 'UCO', name: 'UCO Bank' },
  { code: 'BOI', name: 'Bank of India (BOI)' },
  { code: 'CB', name: 'Central Bank of India' },
  { code: 'UBI', name: 'Union Bank of India (UBI)' },
  { code: 'IB', name: 'Indian Bank' }, 
  { code: 'PSB', name: 'Punjab & Sind Bank' },
  { code: 'BOM', name: 'Bank of Maharashtra' },
  { code: 'SIB', name: 'South Indian Bank' },
  { code: 'FEDERAL', name: 'Federal Bank' },
  { code: 'AXIS', name: 'Axis Bank' },
  { code: 'HDFC', name: 'HDFC Bank' },
  { code: 'ICICI', name: 'ICICI Bank' },
  { code: 'KOTAK', name: 'Kotak Mahindra Bank' },
  { code: 'YES', name: 'Yes Bank' },
  { code: 'IDFC', name: 'IDFC FIRST Bank' },
  { code: 'RBL', name: 'RBL Bank' },
  { code: 'INDUS', name: 'IndusInd Bank' },
  { code: 'OTHER', name: 'Other Bank (Enter Manually)' }
];

const BankDetails = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [loadingIFSC, setLoadingIFSC] = useState(false);
  const [bankDetailsPermission, setBankDetailsPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  // Fetch bank details on mount
  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.["bank-details"]) {
      setBankDetailsPermission(systemRights.actionPermissions["bank-details"]);
    }
    const fetchBankDetails = async () => {
      try {
        const response = await get('bankDetails');
        console.log("Bank Details: ", response.data)
        const bankData = response.data?.data || response.data || [];
        setData(bankData);
      } catch (error) {
        console.error('Error fetching bank details:', error);
        toast.error('Failed to fetch bank details');
      }
    };

    fetchBankDetails();
  }, [systemRights]);

  // IFSC Code validation and branch name fetch
  const handleIFSCBlur = async () => {
    const ifscCode = form.IFSCcode?.toUpperCase().trim();
    
    // IFSC format: First 4 letters (bank code), 5th char 0, last 6 alphanumeric
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    
    if (!ifscCode) {
      return;
    }
    
    if (!ifscRegex.test(ifscCode)) {
      if (ifscCode.length > 0) {
        setErrors(prev => ({ 
          ...prev, 
          IFSCcode: 'Invalid IFSC code format. Format: ABCD0123456' 
        }));
      }
      return;
    }
    
    // Clear IFSC error if valid format
    setErrors(prev => ({ ...prev, IFSCcode: '' }));

    // Extract bank code from IFSC (first 4 characters)
    const bankCodeFromIFSC = ifscCode.substring(0, 4);
    
    // Find bank by code
    const matchedBank = NATIONALIZED_BANKS.find(
      bank => bank.code === bankCodeFromIFSC || 
               bank.name.toUpperCase().includes(bankCodeFromIFSC)
    );

    if (matchedBank && matchedBank.code !== 'OTHER') {
      // Auto-select bank name from IFSC
      setForm(prev => ({ ...prev, bankName: matchedBank.name }));
    }

    setLoadingIFSC(true);
    
    try {
      // Use Razorpay IFSC API (Free, no API key required)
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      
      if (response.ok) {
        const bankData = await response.json();
        setForm(prev => ({ 
          ...prev, 
          branchName: bankData.BRANCH || bankData.branch || '',
          bankName: bankData.BANK || bankData.bank || prev.bankName
        }));
        toast.success(`Branch: ${bankData.BRANCH || bankData.branch || 'Found'}`);
      } else {
        toast.info('IFSC code format is correct. Please enter branch name manually.');
      }
    } catch (error) {
      console.error('IFSC lookup error:', error);
      // Don't show error to user
    } finally {
      setLoadingIFSC(false);
    }
  };

  // Handle bank selection from dropdown
  const handleBankChange = (event) => {
    const selectedBankName = event.target.value;
    setForm(prev => ({ ...prev, bankName: selectedBankName }));
    
    // Clear errors for bankName
    if (errors.bankName) {
      setErrors(prev => ({ ...prev, bankName: '' }));
    }
  };

  const addBankDetail = async (formData) => {
    try {
      const response = await post('bankDetails', formData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error adding bank detail:', error);
      toast.error('Failed to add bank detail');
      throw error;
    }
  };

  const updateBankDetail = async (id, formData) => {
    try {
      const response = await put(`bankDetails/${id}`, formData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating bank detail:', error);
      toast.error('Failed to update bank detail');
      throw error;
    }
  };

  const deleteBankDetail = async (id) => {
    try {
      await remove(`bankDetails/${id}`);
      toast.success('Bank detail deleted successfully!');
    } catch (error) {
      console.error('Error deleting bank detail:', error);
      toast.error('Failed to delete bank detail');
    }
  };

  function initialForm() {
    return {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      IFSCcode: '',
      PanNo: '',
      UpiId: '',
      QRCode: ''
    };
  }

  const validate = () => {
    const newErrors = {};
    if (!form.accountName) newErrors.accountName = 'Account Name is required';
    if (!form.accountNumber || !/^\d{9,18}$/.test(form.accountNumber))
      newErrors.accountNumber = 'Valid Account Number is required (9-18 digits)';
    if (!form.bankName) newErrors.bankName = 'Bank Name is required';
    if (!form.branchName) newErrors.branchName = 'Branch Name is required';
    if (!form.IFSCcode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.IFSCcode))
      newErrors.IFSCcode = 'Invalid IFSC code';
    if (!form.PanNo || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.PanNo))
      newErrors.PanNo = 'Invalid PAN number';
    if (!form.UpiId || !/^[\w.-]+@[\w.-]+$/.test(form.UpiId))
      newErrors.UpiId = 'Invalid UPI ID';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpen = () => {
    setForm(initialForm());
    setErrors({});
    setEditIndex(null);
    setOpen(true);
  };

  const handleEdit = (index) => {
    setForm({ ...data[index] });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index) => {
    const id = data[index]._id;
    await deleteBankDetail(id);
    setData(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (validate()) {
      const formDataToSubmit = { ...form };
      
      // Remove QRCode if it's empty or not a file
      if (formDataToSubmit.QRCode === '') {
        delete formDataToSubmit.QRCode;
      }
      
      if (editIndex !== null) {
        try {
          const id = data[editIndex]._id;
          const updatedBank = await updateBankDetail(id, formDataToSubmit);
          setData(prev => prev.map((item, idx) => idx === editIndex ? updatedBank : item));
          setOpen(false);
          toast.success('Bank details updated successfully!');
        } catch (error) {
          // Error handled in updateBankDetail
        }
      } else {
        try {
          const newBank = await addBankDetail(formDataToSubmit);
          setData(prev => [...prev, newBank]);
          setOpen(false);
          toast.success('Bank details added successfully!');
        } catch (error) {
          // Error handled in addBankDetail
        }
      }
    }
  };

  // Separate handler for file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, QRCode: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Bank Details
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Bank Details</Typography>
            {(bankDetailsPermission?.Add === true || isAdmin) && 
              <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                Add Bank
              </Button>
            }
          </Grid>

          {/* Bank Table */}
          {data.length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>SN</TableCell>
                        <TableCell>Account Name</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Bank</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>IFSC</TableCell>
                        <TableCell>UPI</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((entry, index) => (
                        <TableRow key={entry._id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{entry.accountName}</TableCell>
                          <TableCell>{entry.accountNumber}</TableCell>
                          <TableCell>{entry.bankName}</TableCell>
                          <TableCell>{entry.branchName}</TableCell>
                          <TableCell>{entry.IFSCcode}</TableCell>
                          <TableCell>{entry.UpiId}</TableCell>
                          <TableCell sx={{ display: 'flex', flexWrap: 'nowrap' }}>
                            {(bankDetailsPermission.Edit === true || isAdmin) && 
                              <Button size="small" onClick={() => handleEdit(index)} sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}>
                                <IconButton color='inherit'><Edit /></IconButton>
                              </Button>
                            }
                            {(bankDetailsPermission.Delete === true || isAdmin) && 
                              <Button color="error" onClick={() => handleDelete(index)} sx={{ padding: '1px', minWidth: '24px', height: '24px' }}>
                                <IconButton color='inherit'><Delete /></IconButton>
                              </Button>
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Modal Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editIndex !== null ? 'Edit Bank Detail' : 'Add Bank Detail'}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Account Holder Name */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Account Holder Name"
                name="accountName"
                value={form.accountName}
                onChange={handleChange}
                error={!!errors.accountName}
                helperText={errors.accountName}
                fullWidth
                required
              />
            </Grid>

            {/* Account Number */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Account Number"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                fullWidth
                required
              />
            </Grid>

            {/* Bank Name Dropdown */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required error={!!errors.bankName}>
                <InputLabel>Bank Name</InputLabel>
                <Select
                  name="bankName"
                  value={form.bankName}
                  onChange={handleBankChange}
                  label="Bank Name"
                >
                  {NATIONALIZED_BANKS.map((bank) => (
                    <MenuItem key={bank.code} value={bank.name}>
                      {bank.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.bankName && (
                  <Typography variant="caption" color="error">
                    {errors.bankName}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Branch Name */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Branch Name"
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                error={!!errors.branchName}
                helperText={errors.branchName}
                fullWidth
                required
                InputProps={{
                  endAdornment: loadingIFSC && <CircularProgress size={20} />
                }}
              />
            </Grid>

            {/* IFSC Code */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="IFSC Code"
                name="IFSCcode"
                value={form.IFSCcode}
                onChange={handleChange}
                onBlur={handleIFSCBlur}
                error={!!errors.IFSCcode}
                helperText={errors.IFSCcode || "Enter IFSC code to auto-fetch branch name"}
                fullWidth
                required
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* PAN Number */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="PAN Number"
                name="PanNo"
                value={form.PanNo}
                onChange={handleChange}
                error={!!errors.PanNo}
                helperText={errors.PanNo}
                fullWidth
                required
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* UPI ID */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="UPI ID"
                name="UpiId"
                value={form.UpiId}
                onChange={handleChange}
                error={!!errors.UpiId}
                helperText={errors.UpiId}
                fullWidth
                required
                placeholder="example@okhdfcbank"
              />
            </Grid>

            {/* QR Code */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="QR Code"
                name="QRCode"
                InputLabelProps={{ shrink: true }}
                onChange={handleFileChange}
                type="file"
                fullWidth
                inputProps={{ accept: 'image/*' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            color="error"
            sx={{ minWidth: '40px', padding: '2px' }}
          >
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}
          >
            <IconButton color="inherit">
              {editIndex !== null ? <EditIcon /> : <SaveIcon />}
            </IconButton>
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default BankDetails;