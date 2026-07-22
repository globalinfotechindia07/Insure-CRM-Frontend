import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Tooltip
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import Breadcrumb from 'component/Breadcrumb';
import { useSelector } from 'react-redux';
import { post } from 'api/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const AttendanceList = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // format: YYYY-MM-DD
  });

  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setAdmin] = useState(false);
  const [attendancePermission, setAttendancePermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });

  // 📊 Report view states
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'report'
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // format: YYYY-MM
  });
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const systemRights = useSelector((state) => state.systemRights.systemRights);
  const navigate = useNavigate();

  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') setAdmin(true);
    if (systemRights?.actionPermissions?.['attendance-list']) {
      setAttendancePermission(systemRights.actionPermissions['attendance-list']);
    }
    handleDateChange({ target: { value: selectedDate } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemRights]);

  // handle selecting a specific date
  const handleDateChange = async (e) => {
    const dateValue = e.target.value;
    setSelectedDate(dateValue);
    setSelectedMonth('');
    setError('');
    if (!dateValue) {
      setFilteredRecords(attendanceRecords);
      return;
    }

    try {
      setLoading(true);
      const res = await post(`attendance/get`, { date: dateValue });
      const data = res?.data || [];
      setFilteredRecords(data);
    } catch (err) {
      console.error('Error fetching attendance for date:', err);
      setFilteredRecords([]);
      setError('No attendance found for selected date.');
    } finally {
      setLoading(false);
    }
  };

  // handle selecting a month (YYYY-MM)
  const handleMonthChange = async (e) => {
    const monthValue = e.target.value;
    setSelectedMonth(monthValue);
    setSelectedDate('');
    setError('');
    if (!monthValue) {
      setFilteredRecords(attendanceRecords);
      return;
    }

    try {
      setLoading(true);
      const res = await post(`attendance/get`, { month: monthValue });
      const data = res?.data || [];
      setFilteredRecords(data);
    } catch (err) {
      console.error('Error fetching attendance for month:', err);
      setFilteredRecords([]);
      setError('No attendance found for selected month.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    setSelectedMonth('');
    setError('');
    setFilteredRecords(attendanceRecords);
    handleDateChange({ target: { value: selectedDate } });
  };

  const handleEdit = (date) => {
    navigate(`/hr/attendance?date=${date}`);
  };

  const addAttendance = () => {
    navigate('/hr/attendance');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // 📊 Fetch Report Matrix Data
  const fetchReportData = async (monthVal) => {
    if (!monthVal) return;
    try {
      setReportLoading(true);
      setReportError('');
      const res = await post('attendance/report', { month: monthVal });
      if (res?.success && res?.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
        setReportError(res?.message || 'Failed to load report data');
      }
    } catch (err) {
      console.error('Error loading attendance report:', err);
      setReportData(null);
      setReportError('Error loading attendance report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleSwitchToReportMode = () => {
    setViewMode('report');
    fetchReportData(reportMonth);
  };

  const handleReportMonthChange = (e) => {
    const val = e.target.value;
    setReportMonth(val);
    if (val) {
      fetchReportData(val);
    }
  };

  // 📥 Export Monthly Attendance Excel Report using ExcelJS
  const handleDownloadExcel = async () => {
    if (!reportData) {
      toast.error('No report data available to export.');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      const yellowFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' }
      };

      const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Row 1: Blank spacing
      worksheet.addRow([]);

      // Row 2: Year | 2026 | Date | 1 | 2 | 3 ... 31
      const row2Values = ['', 'Year', reportData.year, 'Date'];
      for (let d = 1; d <= reportData.daysInMonth; d++) {
        row2Values.push(d);
      }
      const row2 = worksheet.addRow(row2Values);

      // Row 3: Month | July | Day | Wed | Thu | Fri ...
      const row3Values = ['', 'Month', reportData.month, 'Day'];
      const sundayColIndexes = [];
      reportData.days.forEach((day) => {
        row3Values.push(day.dayName);
        if (day.isSunday) {
          sundayColIndexes.push(4 + day.dayNumber); // 1-based Col index: E is 5 for Day 1
        }
      });
      const row3 = worksheet.addRow(row3Values);
      row3.height = 42; // Height for rotated vertical text

      // Row 4: Sr No. | Employee Code | Employee Name | Month | 1 | 2 ... 31
      const row4Values = ['Sr No.', 'Employee Code', 'Employee Name', 'Month'];
      for (let d = 1; d <= reportData.daysInMonth; d++) {
        row4Values.push(d);
      }
      const row4 = worksheet.addRow(row4Values);

      const maxCol = 4 + reportData.daysInMonth;

      // Style Header Rows (Row 2, 3, 4)
      for (let c = 1; c <= maxCol; c++) {
        // Row 2
        const c2 = row2.getCell(c);
        c2.font = { bold: true };
        c2.border = borderStyle;
        c2.alignment = { horizontal: 'center', vertical: 'middle' };

        // Row 3
        const c3 = row3.getCell(c);
        c3.font = { bold: true };
        c3.border = borderStyle;
        if (c >= 5) {
          c3.alignment = { textRotation: 90, horizontal: 'center', vertical: 'middle' };
        } else {
          c3.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (sundayColIndexes.includes(c)) {
          c3.fill = yellowFill;
        }

        // Row 4
        const c4 = row4.getCell(c);
        c4.font = { bold: true };
        c4.border = borderStyle;
        c4.alignment = { horizontal: 'center', vertical: 'middle' };
        if (sundayColIndexes.includes(c)) {
          c4.fill = yellowFill;
        }
      }

      // Data Rows (Row 5+)
      reportData.employees.forEach((emp, idx) => {
        const rowValues = [idx + 1, emp.empCode, emp.empName, reportData.month];
        for (let d = 1; d <= reportData.daysInMonth; d++) {
          const fullStatus = emp.attendance[d] || '';
          let shortStatus = '';
          if (fullStatus === 'PRESENT') shortStatus = 'P';
          else if (fullStatus === 'ABSENT') shortStatus = 'A';
          else if (fullStatus === 'HALF DAY') shortStatus = 'HD';
          rowValues.push(shortStatus);
        }

        const dataRow = worksheet.addRow(rowValues);
        for (let c = 1; c <= maxCol; c++) {
          const cell = dataRow.getCell(c);
          cell.border = borderStyle;
          cell.alignment = c === 3 ? { horizontal: 'left', vertical: 'middle' } : { horizontal: 'center', vertical: 'middle' };
          if (sundayColIndexes.includes(c)) {
            cell.fill = yellowFill;
          }
        }
      });

      // Column widths matching Excel screenshot
      worksheet.getColumn(1).width = 8;  // Sr No
      worksheet.getColumn(2).width = 16; // Employee Code
      worksheet.getColumn(3).width = 22; // Employee Name
      worksheet.getColumn(4).width = 10; // Month
      for (let d = 1; d <= reportData.daysInMonth; d++) {
        worksheet.getColumn(4 + d).width = 3.6; // Narrow date columns
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Attendance_Report_${reportData.month}_${reportData.year}.xlsx`);
      toast.success('Attendance Excel report downloaded successfully!');
    } catch (err) {
      console.error('Error generating Excel report:', err);
      toast.error('Failed to export Excel report.');
    }
  };

  // 📄 Export Monthly Attendance CSV Report
  const handleDownloadCSV = () => {
    if (!reportData) {
      toast.error('No report data available to export.');
      return;
    }

    try {
      const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const rows = [];

      // Row 1: Blank spacing
      rows.push([]);

      // Row 2: Year | 2026 | Date | 1 | 2 | 3 ... 31
      const row2 = ['', 'Year', reportData.year, 'Date'];
      for (let d = 1; d <= reportData.daysInMonth; d++) {
        row2.push(d);
      }
      rows.push(row2.map(escapeCsv).join(','));

      // Row 3: Month | July | Day | Wed | Thu | Fri ...
      const row3 = ['', 'Month', reportData.month, 'Day'];
      reportData.days.forEach((day) => {
        row3.push(day.dayName);
      });
      rows.push(row3.map(escapeCsv).join(','));

      // Row 4: Sr No. | Employee Code | Employee Name | Month | 1 | 2 ... 31
      const row4 = ['Sr No.', 'Employee Code', 'Employee Name', 'Month'];
      for (let d = 1; d <= reportData.daysInMonth; d++) {
        row4.push(d);
      }
      rows.push(row4.map(escapeCsv).join(','));

      // Data Rows (Row 5+)
      reportData.employees.forEach((emp, idx) => {
        const row = [idx + 1, emp.empCode, emp.empName, reportData.month];
        for (let d = 1; d <= reportData.daysInMonth; d++) {
          const fullStatus = emp.attendance[d] || '';
          let shortStatus = '';
          if (fullStatus === 'PRESENT') shortStatus = 'P';
          else if (fullStatus === 'ABSENT') shortStatus = 'A';
          else if (fullStatus === 'HALF DAY') shortStatus = 'HD';
          row.push(shortStatus);
        }
        rows.push(row.map(escapeCsv).join(','));
      });

      const csvContent = '\uFEFF' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `Attendance_Report_${reportData.month}_${reportData.year}.csv`);
      toast.success('Attendance CSV report downloaded successfully!');
    } catch (err) {
      console.error('Error generating CSV report:', err);
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <Box p={3}>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          HR
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Attendance
        </Typography>
      </Breadcrumb>

      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Typography variant="h5">
          {viewMode === 'report' ? 'Monthly Attendance Report' : 'Attendance List'}
        </Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {viewMode === 'list' ? (
            <>
              <TextField
                label="Select Date"
                type="date"
                size="small"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Select Month"
                type="month"
                size="small"
                value={selectedMonth}
                onChange={handleMonthChange}
                InputLabelProps={{ shrink: true }}
              />

              <Button variant="outlined" color="warning" onClick={handleClear} startIcon={<CancelIcon />}>
                Clear
              </Button>

              <Button variant="contained" color="success" onClick={handleSwitchToReportMode} startIcon={<AssessmentIcon />}>
                Report
              </Button>

              {(attendancePermission?.Add || isAdmin) && (
                <Button variant="contained" color="primary" onClick={addAttendance} startIcon={<AddIcon />}>
                  Add
                </Button>
              )}
            </>
          ) : (
            <>
              <TextField
                label="Select Month"
                type="month"
                size="small"
                value={reportMonth}
                onChange={handleReportMonthChange}
                InputLabelProps={{ shrink: true }}
              />

              <Button variant="contained" color="success" onClick={handleDownloadExcel} startIcon={<FileDownloadIcon />}>
                Export Excel
              </Button>

              <Button variant="outlined" color="primary" onClick={() => setViewMode('list')} startIcon={<FormatListBulletedIcon />}>
                Attendance List
              </Button>
            </>
          )}

          <Button variant="outlined" color="secondary" onClick={handleBack} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {viewMode === 'list' ? (
            loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box py={2}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SR.NO</TableCell>
                    {selectedDate ? (
                      <>
                        <TableCell>EMPLOYEE NAME</TableCell>
                        <TableCell>STATUS</TableCell>
                      </>
                    ) : selectedMonth ? (
                      <>
                        <TableCell>EMPLOYEE NAME</TableCell>
                        <TableCell>PRESENT DAYS</TableCell>
                        <TableCell>PRESENT %</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>DATE</TableCell>
                        <TableCell>ACTION</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedDate ? (
                    filteredRecords.length > 0 ? (
                      filteredRecords.map((rec, i) => (
                        <TableRow key={`${rec.staffId || rec.name}-${i}`}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            {rec.name ||
                              (rec.staffId &&
                                rec.staffId.basicDetails &&
                                `${rec.staffId.basicDetails.firstName} ${rec.staffId.basicDetails.lastName}`) ||
                              'Unknown'}
                          </TableCell>
                          <TableCell>
                            {rec.status ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontWeight: 400,
                                  color:
                                    rec.status === 'PRESENT'
                                      ? '#0f5132'
                                      : rec.status === 'ABSENT'
                                        ? '#842029'
                                        : rec.status === 'HALF DAY'
                                          ? '#664d03'
                                          : '#1a1a1a',
                                  backgroundColor:
                                    rec.status === 'PRESENT'
                                      ? '#d1e7dd'
                                      : rec.status === 'ABSENT'
                                        ? '#f8d7da'
                                        : rec.status === 'HALF DAY'
                                          ? '#fff3cd'
                                          : '#e0e0e0',
                                  textTransform: 'capitalize',
                                  textAlign: 'center',
                                  minWidth: 80
                                }}
                              >
                                {rec.status}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3}>No data found for selected date.</TableCell>
                      </TableRow>
                    )
                  ) : selectedMonth ? (
                    filteredRecords.length > 0 ? (
                      filteredRecords.map((rec, i) => (
                        <TableRow key={`${rec.name}-${i}`}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{rec.name}</TableCell>
                          <TableCell>{rec.presentDays}</TableCell>
                          <TableCell>{rec.presentPercentage}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>No data found for selected month.</TableCell>
                      </TableRow>
                    )
                  ) : attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record, index) => (
                      <TableRow key={record._id || record.date}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => handleEdit(record.date)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3}>No attendance data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )
          ) : (
            /* 📊 Attendance Matrix Report Display (Matching Excel Image) */
            reportLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : reportError ? (
              <Box py={2}>
                <Typography color="error">{reportError}</Typography>
              </Box>
            ) : reportData ? (
              <Box>
                {/* Legend */}
                <Box mb={2} display="flex" gap={3} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Status Legend:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0f5132', fontWeight: 600 }}>
                    P = Present
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#842029', fontWeight: 600 }}>
                    A = Absent
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#664d03', fontWeight: 600 }}>
                    HD = Half Day
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, backgroundColor: '#FFFF00', border: '1px solid #ccc' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Sunday / Off Day
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500, fontStyle: 'italic', ml: 'auto' }}>
                    💡 Tip: Click <strong>Export Excel</strong> to download the formatted report.
                  </Typography>
                </Box>

                <Paper sx={{ width: '100%', overflowX: 'auto', border: '1px solid #dcdcdc' }}>
                  <Table size="small" sx={{ minWidth: 1000, borderCollapse: 'collapse', '& td, & th': { border: '1px solid #ccc', padding: '4px 6px', fontSize: '0.75rem', textAlign: 'center' } }}>
                    <TableHead>
                      {/* Row 1: Year metadata */}
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell rowSpan={2} sx={{ fontWeight: 'bold', width: 50 }}>
                          Sr No.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Year</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{reportData.year}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Date</TableCell>
                        {reportData.days.map((day) => (
                          <TableCell key={`date-${day.dayNumber}`} sx={{ fontWeight: 'bold', width: 28, backgroundColor: day.isSunday ? '#FFFF00' : 'inherit' }}>
                            {day.dayNumber}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Row 2: Month & Day names */}
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{reportData.month}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                        {reportData.days.map((day) => (
                          <TableCell
                            key={`dayname-${day.dayNumber}`}
                            sx={{
                              fontWeight: 'bold',
                              backgroundColor: day.isSunday ? '#FFFF00' : 'inherit'
                            }}
                          >
                            {day.dayName}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Row 3: Main Headers */}
                      <TableRow sx={{ backgroundColor: '#e9ecef' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Sr No.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'left !important', minWidth: 120 }}>Employee Code</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'left !important', minWidth: 180 }}>Employee Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 90 }}>Month</TableCell>
                        {reportData.days.map((day) => (
                          <TableCell key={`head-day-${day.dayNumber}`} sx={{ fontWeight: 'bold', backgroundColor: day.isSunday ? '#FFFF00' : 'inherit' }}>
                            {day.dayNumber}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {reportData.employees && reportData.employees.length > 0 ? (
                        reportData.employees.map((emp) => (
                          <TableRow key={emp.staffId} hover>
                            <TableCell>{emp.srNo}</TableCell>
                            <TableCell sx={{ textAlign: 'left !important', fontWeight: 500 }}>{emp.empCode}</TableCell>
                            <TableCell sx={{ textAlign: 'left !important', fontWeight: 500 }}>{emp.empName}</TableCell>
                            <TableCell>{emp.month}</TableCell>
                            {reportData.days.map((day) => {
                              const fullStatus = emp.attendance[day.dayNumber] || '';
                              let shortStatus = '';
                              let textColor = 'inherit';
                              if (fullStatus === 'PRESENT') {
                                shortStatus = 'P';
                                textColor = '#0f5132';
                              } else if (fullStatus === 'ABSENT') {
                                shortStatus = 'A';
                                textColor = '#842029';
                              } else if (fullStatus === 'HALF DAY') {
                                shortStatus = 'HD';
                                textColor = '#664d03';
                              }

                              return (
                                <TableCell
                                  key={`cell-${emp.staffId}-${day.dayNumber}`}
                                  sx={{
                                    backgroundColor: day.isSunday ? '#FFFF00' : 'inherit',
                                    color: textColor,
                                    fontWeight: shortStatus ? 'bold' : 'normal'
                                  }}
                                >
                                  {shortStatus ? (
                                    <Tooltip title={`${fullStatus} on ${reportData.month} ${day.dayNumber}`}>
                                      <span>{shortStatus}</span>
                                    </Tooltip>
                                  ) : (
                                    ''
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4 + reportData.daysInMonth}>No staff records found for this month.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            ) : (
              <Box py={2}>
                <Typography>Select a month and click Report to view data.</Typography>
              </Box>
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceList;
