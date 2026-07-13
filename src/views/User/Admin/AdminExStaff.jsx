import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link, useNavigate } from 'react-router-dom';
import { gridSpacing } from 'config.js';
import { get, put, remove } from 'api/api'; // Assuming you have a `remove` function for delete API
import REACT_APP_API_URL from 'api/api';
import Loader from 'component/Loader/Loader';
import EditBtn from 'component/buttons/EditBtn';
import DeleteBtn from 'component/buttons/DeleteBtn';

import ViewBtn from 'component/buttons/ViewBtn';
import { toast, ToastContainer } from 'react-toastify';
import SuspendUser from 'views/HR/User/SuspendUser';
import { useSelector } from 'react-redux';

const AdminExStaff = () => {
  const [administrativeData, setAdministrativeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isAdmin, setAdmin] = useState(false);
  const [exstaffPermission, setExStaffPermission] = useState({
    View: false,
    Add: false,
    Edit: false,
    Delete: false
  });
  const systemRights = useSelector((state) => state.systemRights.systemRights);

  const navigate = useNavigate();

  const fetchAdministrativeData = async () => {
    setLoading(true);
    try {
      const response = await get('administrative');
      const administrativeData = response.data || [];
      const updatedData = await Promise.all(
        administrativeData.map(async (user) => {
          try {
            const suspensionResponse = await get(`admin/fetch-user-suspension-status/${user._id}`);
            return {
              ...user,
              isSuspended: suspensionResponse?.isSuspended || false
            };
          } catch (error) {
            console.error(`Error fetching suspension status for user ${user._id}:`, error);
            return { ...user, isSuspended: false };
          }
        })
      );

      // Filter data based on suspension status
      const filteredData = updatedData.filter((user) => user.isSuspended);

      setAdministrativeData(updatedData);
      setFilteredData(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setIsDataFetched(true);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = administrativeData.filter(
      (item) =>
        item.isSuspended &&
        (item.basicDetails.firstName.toLowerCase().includes(query) ||
          item.basicDetails.lastName.toLowerCase().includes(query) ||
          item.basicDetails.email.toLowerCase().includes(query))
    );

    setFilteredData(filtered);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) {
      toast.error('No item selected for deletion');
      return;
    }

    try {
      const response = await put(`administrative/delete/${selectedItem._id}`);

      if (response?.success) {
        toast.success(response?.message || 'Item deleted successfully');
        fetchAdministrativeData();
      } else {
        toast.error(response?.message || 'Failed to delete the item');
        console.warn('Unexpected response:', response);
      }
    } catch (error) {
      toast.error('An error occurred while deleting the item, please try again later');
      console.error('Error during delete request:', error.message);
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const exportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;
    const headers = ["Employee Code", "First Name", "Last Name", "Email", "Contact Number", "Gender", "Adhar Number", "Department", "Position"];
    let csvContent = headers.join(",") + "\n";
    filteredData.forEach(item => {
      const empCode = item.basicDetails?.empCode || '';
      const fName = item.basicDetails?.firstName || '';
      const lName = item.basicDetails?.lastName || '';
      const email = item.basicDetails?.email || '';
      const contact = item.basicDetails?.contactNumber || '';
      const gender = item.basicDetails?.gender || '';
      const adhar = item.basicDetails?.adharNumber || '';
      const dept = item.employmentDetails?.department?.department || 'N/A';
      const pos = item.employmentDetails?.position?.position || 'N/A';
      csvContent += `"${empCode}","${fName}","${lName}","${email}","${contact}","${gender}","${adhar}","${dept}","${pos}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "suspended_staff.csv");
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
      if (!header.includes("contact number") || !header.includes("email")) {
        toast.error("Invalid CSV format. Header must contain 'Contact Number' and 'Email'");
        return;
      }

      const importedStaff = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const empCode = row[0] || '';
        const firstName = row[1] || '';
        const lastName = row[2] || '';
        const email = row[3] || '';
        const contactNumber = row[4] || '';
        const gender = row[5] || '';
        const adharNumber = row[6] || '';

        if (firstName && email && contactNumber) {
          importedStaff.push({
            empCode,
            firstName,
            lastName,
            email,
            contactNumber,
            gender: ["Male", "Female", "Other"].includes(gender) ? gender : "Male",
            adharNumber
          });
        }
      }

      const existingEmails = new Set(administrativeData.map(item => (item.basicDetails?.email || '').toLowerCase().trim()));
      const existingContacts = new Set(administrativeData.map(item => (item.basicDetails?.contactNumber || '').trim()));
      
      const uniqueNewStaff = importedStaff.filter(s => 
        !existingEmails.has(s.email.toLowerCase().trim()) && 
        !existingContacts.has(s.contactNumber.trim())
      );

      if (uniqueNewStaff.length === 0) {
        toast.info("No new unique staff found to import.");
        return;
      }

      let successCount = 0;
      for (const staff of uniqueNewStaff) {
        try {
          const res = await post("administrative/basicDetails", staff);
          if (res && (res.success === true || res.status === "true" || res.status === true || res.data)) {
            // Also suspend the imported staff to make them "Ex Staff" if needed or keep standard
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import staff: ${staff.email}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique staff found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique staff members successfully!`);
      }
      fetchAdministrativeData();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    const loginRole = localStorage.getItem('loginRole');
    if (loginRole === 'admin') {
      setAdmin(true);
    }
    if (systemRights?.actionPermissions?.['company-exstaff']) {
      setExStaffPermission(systemRights.actionPermissions['company-exstaff']);
    }
    fetchAdministrativeData();
  }, [systemRights]);

  return (
    <>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          User
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          EX Staff
        </Typography>
      </Breadcrumb>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <TextField
                      label="Search"
                      variant="outlined"
                      value={searchQuery}
                      onChange={handleSearch}
                      size="small"
                      style={{ width: '300px' }}
                    />
                  </Grid>
                  <Grid item>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="contained" color="secondary" onClick={exportCSV} disabled={localStorage.getItem('loginRole') !== 'admin'}>
                        Export
                      </Button>
                      <Button variant="contained" component="label" sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
                        Import
                        <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Loader />
              ) : (
                <>
                  {isDataFetched && filteredData.length === 0 ? (
                    <Typography variant="h6" align="center" color="textSecondary">
                      No Records Found
                    </Typography>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ verticalAlign: 'top' }}>
                            <TableCell>Sr.No</TableCell>
                            <TableCell>Profile Picture</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Contact No.</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Suspend User</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredData.map((item, index) => (
                            <TableRow key={item._id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Avatar
                                  alt={`${item.basicDetails.firstName} ${item.basicDetails.lastName}`}
                                  src={`${REACT_APP_API_URL}images/${item.basicDetails.profilePhoto}`}
                                  style={{ width: 50, height: 50 }}
                                />
                              </TableCell>
                              <TableCell>
                                {item.basicDetails.firstName} {item.basicDetails.lastName}
                              </TableCell>
                              <TableCell>{item.employmentDetails?.departmentOrSpeciality?.departmentName || 'NA'}</TableCell>
                              <TableCell>{item.employmentDetails?.designation?.designationName || 'NA'}</TableCell>
                              <TableCell>{item.basicDetails.contactNumber || 'NA'}</TableCell>
                              <TableCell>{item.basicDetails.gender || 'NA'}</TableCell>
                              <TableCell>
                                <SuspendUser userId={item._id} />
                              </TableCell>
                              {/* <TableCell>
                                {item.dateOfBirth ? new Date(item.basicDetails.dateOfBirth).toLocaleDateString('en-GB') : 'NA'}
                              </TableCell> */}
                              <TableCell>
                                {/* <EditBtn onClick={() => navigate(`/users/administrativeUpdatePage/${item._id}`)} /> */}
                                {/* <DeleteBtn onClick={() => handleDeleteClick(item)} /> */}
                                {/* <ViewBtn onClick={() => navigate(`/users/viewUserDetails/administrative/${item._id}`)} /> */}
                                {/* <Box display="flex" alignItems="center" gap={1}>
                                {(exstaffPermission.Edit===true || isAdmin) && <EditBtn />}
                                {(exstaffPermission.Delete===true || isAdmin) && <DeleteBtn onClick={() => handleDeleteClick(item)} />}
                                <ViewBtn />
                                </Box> */}

                                <Box display="flex" alignItems="center" gap={1}>
                                  {(exstaffPermission.Edit === true || isAdmin) && (
                                    <EditBtn onClick={() => navigate(`/users/administrativeUpdatePage/${item._id}`)} />
                                  )}
                                  {(exstaffPermission.Delete === true || isAdmin) && <DeleteBtn onClick={() => handleDeleteClick(item)} />}
                                  <ViewBtn onClick={() => navigate(`/users/viewUserDetails/administrative/${item._id}`)} />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this record? </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
            Cancel
          </Button>
          {(exstaffPermission.Delete === true || isAdmin) && (
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default AdminExStaff;
