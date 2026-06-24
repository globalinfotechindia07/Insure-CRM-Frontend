import React, { useEffect, useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import {
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  TrendingUp,
  CheckCircle,
  Pending,
  Refresh,
  BarChart as BarChartIcon,
  Delete
} from "@mui/icons-material";
import {
  getClaims,
  deleteClaim,
} from "../../../services/claim.service";
import {
  getPolicies,
} from "../../../services/policy.service";
import {
  getSurveyors,
} from "../../../services/surveyor.service";
import {
  getTPAs,
} from "../../../services/tpa.service";
import {
  getInvestigators,
} from "../../../services/investigator.service";
import { get } from "../../../api/api.js";

const ClaimPage = () => {
  const [data, setData] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [tpas, setTPAs] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Financial Year States
  const [financialYearData, setFinancialYearData] = useState([]);
  const [selectedFY, setSelectedFY] = useState('');
  
  // Staff and Client for Birthdays
  const [staff, setStaff] = useState([]);
  const [client, setClient] = useState([]);
  
  // Analytics States
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTPA, setSelectedTPA] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // ================= FETCH FINANCIAL YEAR =================
  const fetchFYData = async () => {
    try {
      const res = await get('financialYear');
      if (res.data) {
        setFinancialYearData(res.data);
      }
    } catch (error) {
      console.error('Error fetching FY:', error);
    }
  };

  // ================= FETCH STAFF =================
  const fetchStaff = async () => {
    try {
      const response = await get('/administrative');
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // ================= FETCH CLIENT =================
  const fetchClient = async () => {
    try {
      const role = localStorage.getItem('loginRole');
      let url = role === 'super-admin' ? 'clientRegistration' : 'admin-clientRegistration';
      const response = await get(url);
      setClient(response.data || []);
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  // ================= FETCH CLAIMS =================
  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClaims();
      console.log("Claims response:", res.data);
      const claimsData = res.data?.data?.data || res.data?.data || res.data || [];
      setData(Array.isArray(claimsData) ? claimsData : []);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setError("Failed to load claims data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await getPolicies();
      const policiesData = res.data?.data?.data || res.data?.data || res.data || [];
      setPolicies(Array.isArray(policiesData) ? policiesData : []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const fetchSurveyors = async () => {
    try {
      const res = await getSurveyors();
      const surveyorsData = res.data?.data?.data || res.data?.data || res.data || [];
      setSurveyors(Array.isArray(surveyorsData) ? surveyorsData : []);
    } catch (error) {
      console.error("Error fetching surveyors:", error);
    }
  };

  const fetchTPAs = async () => {
    try {
      const res = await getTPAs();
      const tpasData = res.data?.data?.data || res.data?.data || res.data || [];
      setTPAs(Array.isArray(tpasData) ? tpasData : []);
    } catch (error) {
      console.error("Error fetching TPAs:", error);
    }
  };

  const fetchInvestigators = async () => {
    try {
      const res = await getInvestigators();
      const investigatorsData = res.data?.data?.data || res.data?.data || res.data || [];
      setInvestigators(Array.isArray(investigatorsData) ? investigatorsData : []);
    } catch (error) {
      console.error("Error fetching investigators:", error);
    }
  };

  useEffect(() => {
    fetchFYData();
    fetchStaff();
    fetchClient();
    fetchClaims();
    fetchPolicies();
    fetchSurveyors();
    fetchTPAs();
    fetchInvestigators();
  }, []);

  // ================= SET DEFAULT FINANCIAL YEAR =================
  useEffect(() => {
    if (financialYearData.length === 0) return;
    const now = new Date();
    const currentFinancialYear = financialYearData.find((year) => 
      new Date(year.fromDate) <= now && new Date(year.toDate) >= now
    );
    if (currentFinancialYear?._id && selectedFY === '') {
      setSelectedFY(currentFinancialYear._id);
    }
  }, [financialYearData]);

  // ================= BIRTHDAY FUNCTIONS =================
  const isBirthdayToday = (dob) => {
    if (!dob) return false;
    const today = new Date();
    const birthDate = new Date(dob);
    return today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
  };

  const isAnniversaryToday = (doj) => {
    if (!doj) return false;
    const today = new Date();
    const joiningDate = new Date(doj);
    return today.getDate() === joiningDate.getDate() && today.getMonth() === joiningDate.getMonth();
  };

  const todaysStaffBirthdays = staff.filter((item) => isBirthdayToday(item?.basicDetails?.dateOfBirth));
  const todaysStaffAnniversaries = staff.filter((item) => isAnniversaryToday(item?.basicDetails?.dateOfJoining));
  const todaysClientBirthdays = client.filter((item) => isBirthdayToday(item?.basicDetails?.dateOfBirth));
  const todaysClientAnniversaries = client.filter((item) => isAnniversaryToday(item?.basicDetails?.dateOfAnniversary));

  const filteredFY = Array.from(
    new Map(
      financialYearData
        .filter((year) => new Date(year.fromDate) <= new Date())
        .map((item) => [`${item.fromDate}-${item.toDate}`, item])
    ).values()
  ).sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));

  const handleFilter = (e) => {
    setSelectedFY(e.target.value);
  };

  // ================= ANALYTICS FUNCTIONS =================
  
  const uniqueDepartments = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(claim => claim.department).filter(Boolean))];
  }, [data]);

  const getFilteredClaims = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let filtered = [...data];
    
    if (selectedTPA !== 'all') {
      filtered = filtered.filter(claim => {
        const claimTpaId = claim.tpaId?._id || claim.tpaId;
        return claimTpaId === selectedTPA;
      });
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(claim => claim.department === selectedDepartment);
    }
    
    filtered = filtered.filter(claim => {
      const dateVal = claim.dateOfLossOrAdmission || claim.createdAt;
      if (!dateVal) return false;
      const claimDate = new Date(dateVal);
      
      if (selectedPeriod === 'monthly') {
        const [year, month] = selectedMonth.split('-');
        return claimDate.getFullYear() === parseInt(year) && 
               claimDate.getMonth() === parseInt(month) - 1;
      } else if (selectedPeriod === 'yearly') {
        return claimDate.getFullYear() === parseInt(selectedYear);
      }
      return true;
    });
    
    return filtered;
  }, [data, selectedTPA, selectedDepartment, selectedPeriod, selectedMonth, selectedYear]);

  const getMaxValue = (data, key) => {
    if (!data.length) return 10;
    return Math.max(...data.map(item => item[key]), 10);
  };

  const reportedData = useMemo(() => {
    if (!getFilteredClaims.length) return [];
    const departmentMap = new Map();
    getFilteredClaims.forEach(claim => {
      const dept = claim.department || 'Other';
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
    });
    return Array.from(departmentMap.entries()).map(([department, reported]) => ({ department, reported }));
  }, [getFilteredClaims]);

  const settledData = useMemo(() => {
    if (!getFilteredClaims.length) return [];
    const departmentMap = new Map();
    getFilteredClaims.forEach(claim => {
      if (claim.status === 'Approved') {
        const dept = claim.department || 'Other';
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
      }
    });
    return Array.from(departmentMap.entries()).map(([department, settled]) => ({ department, settled }));
  }, [getFilteredClaims]);

  const outstandingData = useMemo(() => {
    if (!getFilteredClaims.length) return [];
    const departmentMap = new Map();
    getFilteredClaims.forEach(claim => {
      if (claim.status !== 'Approved' && claim.status !== 'Rejected') {
        const dept = claim.department || 'Other';
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
      }
    });
    return Array.from(departmentMap.entries()).map(([department, outstanding]) => ({ department, outstanding }));
  }, [getFilteredClaims]);

  const tpaWiseData = useMemo(() => {
    if (!getFilteredClaims.length) return [];
    const tpaMap = new Map();
    getFilteredClaims.forEach(claim => {
      const tpaName = claim.tpaId?.tpaName || 'No TPA';
      tpaMap.set(tpaName, (tpaMap.get(tpaName) || 0) + 1);
    });
    return Array.from(tpaMap.entries()).map(([name, value]) => ({ name, value }));
  }, [getFilteredClaims]);

  const trendData = useMemo(() => {
    if (!getFilteredClaims.length) return [];
    const monthMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    getFilteredClaims.forEach(claim => {
      const dateVal = claim.dateOfLossOrAdmission || claim.createdAt;
      if (!dateVal) return;
      const date = new Date(dateVal);
      const monthName = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthMap.has(monthName)) {
        monthMap.set(monthName, { month: monthName, reported: 0, settled: 0, outstanding: 0 });
      }
      
      const entry = monthMap.get(monthName);
      entry.reported += 1;
      if (claim.status === 'Approved') entry.settled += 1;
      else if (claim.status !== 'Approved' && claim.status !== 'Rejected') entry.outstanding += 1;
    });
    
    return Array.from(monthMap.values());
  }, [getFilteredClaims]);

  const summary = useMemo(() => {
    const totalReported = getFilteredClaims.length;
    const totalSettled = getFilteredClaims.filter(c => c.status === 'Approved').length;
    const totalOutstanding = getFilteredClaims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;
    const settlementRate = totalReported > 0 ? ((totalSettled / totalReported) * 100).toFixed(1) : 0;
    return { totalReported, totalSettled, totalOutstanding, settlementRate };
  }, [getFilteredClaims]);

  // Policy Data for Summary Cards
  const [policy, setPolicy] = useState([]);
  const [premium, setPremium] = useState(0);

  // Memoized Policy Trend Data
  const policyTrendData = useMemo(() => {
    if (!policy || policy.length === 0) return [];
    const monthMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    policy.forEach(p => {
      const dateVal = p.startDate || p.createdAt;
      if (!dateVal) return;
      const date = new Date(dateVal);
      const monthName = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthMap.has(monthName)) {
        monthMap.set(monthName, { month: monthName, count: 0, premium: 0 });
      }
      
      const entry = monthMap.get(monthName);
      entry.count += 1;
      entry.premium += Number(p.totalAmount) || 0;
    });
    
    return Array.from(monthMap.values()).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      const aIdx = months.indexOf(aMonth);
      const bIdx = months.indexOf(bMonth);
      const aDate = new Date(parseInt(aYear), aIdx, 1);
      const bDate = new Date(parseInt(bYear), bIdx, 1);
      return aDate - bDate;
    });
  }, [policy]);

  const fetchPolicyDetail = async () => {
    if (!selectedFY) return;
    try {
      const res = await get(`policyDetail?financialYear=${selectedFY}`);
      if (res.status) {
        setPolicy(res.data);
        const totalPremiumSum = res.data.reduce((sum, p) => {
          return Number(sum) + (Number(p.totalAmount) || 0);
        }, 0);
        setPremium(parseFloat(totalPremiumSum.toFixed(2)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedFY) {
      fetchPolicyDetail();
    }
  }, [selectedFY]);

  // Recharts Bar Chart Component
  const SimpleBarChart = ({ data, dataKey, fill, height = 300 }) => {
    return (
      <Box sx={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="department" stroke="#888" fontSize={11} tickLine={false} />
            <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
            <RechartsTooltip cursor={{ fill: '#f5f5f5' }} />
            <Bar dataKey={dataKey} fill={fill} radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // Recharts Line Chart Component
  const SimpleLineChart = ({ data, height = 300 }) => {
    return (
      <Box sx={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} />
            <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
            <RechartsTooltip />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="reported" name="Reported" stroke="#1976d2" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="settled" name="Settled" stroke="#4caf50" strokeWidth={3} />
            <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke="#ff9800" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // Recharts Pie Chart Component
  const SimplePieChart = ({ data }) => {
    const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#ffeb3b', '#607d8b'];
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4, minHeight: 300 }}>
        <Box sx={{ width: 250, height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: COLORS[idx % COLORS.length], borderRadius: '50%' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.name}: <span style={{ fontWeight: 700 }}>{item.value}</span>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Recharts Policy Trend Dual-Axis Line Chart Component
  const PolicyTrendChart = ({ data, height = 350 }) => {
    return (
      <Box sx={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#1976d2" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Policy Count', angle: -90, position: 'insideLeft', offset: -5, style: { fill: '#1976d2', fontWeight: 600 } }} />
            <YAxis yAxisId="right" orientation="right" stroke="#4caf50" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Total Premium (₹)', angle: 90, position: 'insideRight', offset: -5, style: { fill: '#4caf50', fontWeight: 600 } }} />
            <RechartsTooltip formatter={(value, name) => {
              if (name === "Total Premium") {
                return [`₹${value.toLocaleString('en-IN')}`, name];
              }
              return [value, name];
            }} />
            <Legend verticalAlign="top" height={36} />
            <Line yAxisId="left" type="monotone" dataKey="count" name="Policy Count" stroke="#1976d2" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey="premium" name="Total Premium" stroke="#4caf50" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const resetFilters = () => {
    setSelectedTPA('all');
    setSelectedDepartment('all');
    setSelectedPeriod('all');
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedYear(new Date().getFullYear());
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this claim?")) {
      try {
        await deleteClaim(id);
        fetchClaims();
        alert("Claim deleted successfully!");
      } catch (error) {
        console.error("Error deleting claim:", error);
        alert("Failed to delete claim");
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Claim Analytics Dashboard</Typography>
      </Grid>

      {/* Financial Year Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter</InputLabel>
            <Select value="byFinancialYear" label="Filter">
              <MenuItem value="byFinancialYear">By Financial Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Financial Year"
            value={selectedFY}
            onChange={handleFilter}
          >
            {financialYearData.length > 0 &&
              filteredFY.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  {new Date(type.fromDate).getFullYear()} - {new Date(type.toDate).getFullYear()}
                </MenuItem>
              ))}
          </TextField>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Total Policies</Typography>
                  <Typography variant="h3" fontWeight="bold">{policy.length}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Total Premium</Typography>
                  <Typography variant="h3" fontWeight="bold">₹{premium.toLocaleString('en-IN')}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Claims Reported</Typography>
                  <Typography variant="h3" fontWeight="bold">{summary.totalReported}</Typography>
                </Box>
                <Pending sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Settlement Rate</Typography>
                  <Typography variant="h3" fontWeight="bold">{summary.settlementRate}%</Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Birthdays & Anniversaries Section */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
             Staff Celebrations 
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ width: '48%', minWidth: '300px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center', color: '#1976d2' }}>
                 Today's Staff Birthdays
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SN</TableCell>
                    <TableCell>Staff Name</TableCell>
                    <TableCell>DOB</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaysStaffBirthdays.length > 0 ? (
                    todaysStaffBirthdays.map((item, index) => (
                      <TableRow key={item._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.basicDetails?.firstName || 'N/A'}</TableCell>
                        <TableCell>
                          {item.basicDetails?.dateOfBirth
                            ? new Date(item.basicDetails.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No Staff Birthday Today</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ width: '48%', minWidth: '300px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center', color: '#ff9800' }}>
                 Today's Staff Anniversaries
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SN</TableCell>
                    <TableCell>Staff Name</TableCell>
                    <TableCell>DOJ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaysStaffAnniversaries.length > 0 ? (
                    todaysStaffAnniversaries.map((item, index) => (
                      <TableRow key={item._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.basicDetails?.firstName || 'N/A'}</TableCell>
                        <TableCell>
                          {item.basicDetails?.dateOfJoining
                            ? new Date(item.basicDetails.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No Staff Anniversary Today</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Client Birthdays & Anniversaries Section */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
             Client Celebrations 
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ width: '48%', minWidth: '300px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center', color: '#4caf50' }}>
                 Today's Client Birthdays
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SN</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>DOB</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaysClientBirthdays.length > 0 ? (
                    todaysClientBirthdays.map((item, index) => (
                      <TableRow key={item._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.basicDetails?.firstName || 'N/A'}</TableCell>
                        <TableCell>
                          {item.basicDetails?.dateOfBirth
                            ? new Date(item.basicDetails.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No Client Birthday Today</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ width: '48%', minWidth: '300px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center', color: '#9c27b0' }}>
               Today's Client Anniversaries
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SN</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>DOA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaysClientAnniversaries.length > 0 ? (
                    todaysClientAnniversaries.map((item, index) => (
                      <TableRow key={item._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.basicDetails?.firstName || 'N/A'}</TableCell>
                        <TableCell>
                          {item.basicDetails?.dateOfAnniversary
                            ? new Date(item.basicDetails.dateOfAnniversary).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No Client Anniversary Today</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Analytics Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Claim Analytics Dashboard</Typography>
            <Button startIcon={<Refresh />} onClick={resetFilters} size="small">Reset Filters</Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {selectedPeriod === 'monthly' && (
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            )}
            {selectedPeriod === 'yearly' && (
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>TPA Wise</InputLabel>
                <Select value={selectedTPA} onChange={(e) => setSelectedTPA(e.target.value)}>
                  <MenuItem value="all">All TPAs</MenuItem>
                  {tpas.map(tpa => <MenuItem key={tpa._id} value={tpa._id}>{tpa.tpaName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <MenuItem value="all">All Departments</MenuItem>
                  {uniqueDepartments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Charts */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable">
          <Tab label="1. Claims Reported" />
          <Tab label="2. Claims Settled" />
          <Tab label="3. Claims Outstanding" />
          <Tab label="4. Monthly Trend" />
          <Tab label="5. TPA Distribution" />
          <Tab label="6. Policy Trend" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
      ) : (
        <>
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom> Claims Reported - Department Wise</Typography>
                {reportedData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No data available</Typography></Box>
                ) : (
                  <SimpleBarChart data={reportedData} dataKey="reported" fill="#8884d8" />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom> Claims Settled - Department Wise</Typography>
                {settledData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No settled claims data</Typography></Box>
                ) : (
                  <SimpleBarChart data={settledData} dataKey="settled" fill="#82ca9d" />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom> Claims Outstanding - Department Wise</Typography>
                {outstandingData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No outstanding claims data</Typography></Box>
                ) : (
                  <SimpleBarChart data={outstandingData} dataKey="outstanding" fill="#ffc658" />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Monthly Claim Trend Analysis</Typography>
                {trendData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No trend data available</Typography></Box>
                ) : (
                  <SimpleLineChart data={trendData} />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom> TPA Wise Claim Distribution</Typography>
                {tpaWiseData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No TPA data available</Typography></Box>
                ) : (
                  <SimplePieChart data={tpaWiseData} />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 5 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Monthly Policy Distribution & Premium Trend</Typography>
                {policyTrendData.length === 0 ? (
                  <Box p={5} textAlign="center"><Typography color="textSecondary">No policy data available for the selected financial year</Typography></Box>
                ) : (
                  <PolicyTrendChart data={policyTrendData} />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Claims Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>All Claims List</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SN</TableCell>
                  <TableCell>Claim No</TableCell>
                  <TableCell>Policy No</TableCell>
                  <TableCell>Insured Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Surveyor</TableCell>
                  <TableCell>TPA</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? data.map((item, idx) => (
                  <TableRow key={item._id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.claimNo}</TableCell>
                    <TableCell>{item.policyNo}</TableCell>
                    <TableCell>{item.insuredName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.surveyorId?.surveyorName}</TableCell>
                    <TableCell>{item.tpaId?.tpaName}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={item.status === "Approved" ? "success" : item.status === "Rejected" ? "error" : "warning"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button 
                        color="error" 
                        onClick={() => handleDelete(item._id)} 
                        size="small"
                        variant="outlined"
                        startIcon={<Delete />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={9} align="center">No Claims Found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimPage;