import React, { useState, useEffect, useCallback } from 'react';
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
  InputLabel,
  Divider,
  Box,
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
import { AlignCenter } from 'lucide-react';

const RenewalReminder = () => {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [dateTo, setDateTo] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const handleFilterChange = (e) => setDateFrom(e.target.value);
  const handleFilterValue = (e) => setFilterValue(e.target.value);

  const fetchPolicyDetail = async () => {
    try {
      const res = await get('policyDetail');
      // console.log('policyDetail data:', res);
      if (res.status) setCustomerList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPolicyDetail();
  }, []);

  const calculateRemainingDays = (renewalDateString) => {
    if (!renewalDateString) return '0';
    const renewalDate = new Date(renewalDateString.split('T')[0]);
    const today = new Date();
    renewalDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0; // Show 0 if past due
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

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box>
                <Grid container spacing={1} sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  <Grid item sx={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Month"
                        views={['year', 'month']}
                        value={dateFrom}
                        onChange={(value) => handleDateFilterChange('dateFrom', value)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField label="search" name="search" fullWidth></TextField>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField select label="Filter By" name="filter" value={filterValue} onChange={handleFilterValue} fullWidth>
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="byDateRange">BY DATE RANGE</MenuItem>
                      <MenuItem value="renew">RENEW WITHIN 30 DAYS</MenuItem>
                    </TextField>
                  </Grid>
                  {filterValue === 'byDateRange' && (
                    <>
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="From Date"
                            value={dateFrom}
                            onChange={(value) => handleDateFilterChange('dateFrom', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="To Date"
                            value={dateTo}
                            onChange={(value) => handleDateFilterChange('dateFrom', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={1}>
                        <Button variant="contained" size="small">
                          Apply
                        </Button>
                      </Grid>
                    </>
                  )}
                  {filterValue === 'renew' && (
                    <>
                      <Grid item xs={2}>
                        <Button variant="contained" size="small">
                          Renew within 30 days
                        </Button>
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant="contained" size="large" sx={{ backgroundColor: 'orange' }}>
                          Reset
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: '#f5f5f5',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <TableCell sx={{ width: 30, px: 1.5, py: 0.8 }}>SN</TableCell>
                        <TableCell sx={{ width: 50, px: 1.5, py: 0.8 }}>CUSTOMER NAME</TableCell>
                        <TableCell sx={{ width: 100, px: 1.5, py: 0.8 }}>DEPARTMENT</TableCell>
                        {/* <TableCell sx={{ width: 100, px: 1.5, py: 0.8 }}>PRODUCT</TableCell> */}
                        <TableCell sx={{ width: 70, px: 1.5, py: 0.8 }}>POLICY NO</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>NET PREMIUM</TableCell>
                        <TableCell sx={{ width: 70, px: 1.5, py: 0.8 }}>TOTAL PREMIUM</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>RENEWAL DATE</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>Send Message</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    {customerList.length > 0 ? (
                      <>
                        <TableBody>
                          {customerList?.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{entry?.cutomerName}</TableCell>
                              <TableCell>{entry?.insDepartment?.insDepartment}</TableCell>
                              {/* <TableCell>{entry?.product}</TableCell> */}
                              <TableCell>{entry?.policyNumber}</TableCell>
                              <TableCell>{entry?.netPremium}</TableCell>
                              <TableCell>{entry?.totalAmount}</TableCell>
                              {/* <TableCell>{entry?.renewalDate?.split('T')[0]}</TableCell> */}
                              <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>
                                {entry?.renewalDate?.split('T')[0]}
                                <span>
                                  <Typography variant="h6" sx={{ alignItems: 'center' }}>
                                    ({calculateRemainingDays(entry?.renewalDate)} days)
                                  </Typography>
                                </span>
                              </TableCell>
                              <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>
                                <Grid>
                                  <Grid item sx={2}>
                                    <Button variant="contained" sx={{ mr: 1, backgroundColor: 'green' }}>
                                      {entry?.mobile}
                                      <span>
                                        <Typography variant="h6" sx={{ alignItems: 'center', color: 'white' }}>
                                          (1)
                                        </Typography>
                                      </span>
                                    </Button>
                                  </Grid>
                                </Grid>
                              </TableCell>
                              <TableCell>
                                <Grid item sx={2}>
                                  <Grid item sx={2}>
                                    <Button
                                      variant="contained"
                                      sx={{ backgroundColor: 'orange' }}
                                      onClick={() => navigate(`/renewPolicy/${entry?._id}`)}
                                    >
                                      Renew
                                    </Button>
                                  </Grid>
                                </Grid>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </>
                    ) : (
                      <>No Data Found</>
                    )}

                    {/* <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: 30, px: 1.5, py: 0.8 }}>1</TableCell>
                        <TableCell sx={{ width: 100, px: 1.5, py: 0.8 }}>HARISH KATARIYA</TableCell>
                        <TableCell sx={{ width: 100, px: 1.5, py: 0.8 }}>MOTOR</TableCell>
                        <TableCell sx={{ width: 70, px: 1.5, py: 0.8 }}>VEHICLE</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>8866952</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>2000000</TableCell>
                        <TableCell sx={{ width: 70, px: 1.5, py: 0.8 }}>200000</TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>
                          10/12/2026
                          <span>
                            <Typography variant="h6" sx={{ alignItems: 'center' }}>
                              (98 days)
                            </Typography>
                          </span>
                        </TableCell>
                        <TableCell sx={{ width: 120, px: 1.5, py: 0.8 }}>
                          <Grid>
                            <Grid item sx={2}>
                              <Button variant="contained" sx={{ mr: 1, backgroundColor: 'green' }}>
                                (1) Msg
                              </Button>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell>
                          <Grid item sx={2}>
                            <Grid item sx={2}>
                              <Button variant="contained" sx={{ backgroundColor: 'orange' }} onClick={() => navigate(`/renewPolicy/32`)}>
                                Renew
                              </Button>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    </TableBody> */}
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default RenewalReminder;
