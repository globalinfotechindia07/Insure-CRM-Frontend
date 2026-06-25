import React, {
  useEffect,
  useState
} from "react";

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
  IconButton,
  Switch
} from "@mui/material";

import {
  Add,
  Delete,
  Close
} from "@mui/icons-material";

import {
  createSurveyor,
  getSurveyors,
  deleteSurveyor
} from "../../services/surveyor.service";

import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SurveyorPage = () => {

  const [open, setOpen] = useState(false);

  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    surveyorName: "",
    licenseNo: "",
    expiryDate: "",
    categories: "",
    contactNo: "",
    email: "",
    address: "",
    status: true
  });

  // FETCH
  const fetchData = async () => {

    try {

      const res = await getSurveyors();

      setData(res.data?.data || res.data || []);

    } catch (error) {

      console.log(error);
      setData([]);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // SUBMIT
  const handleSubmit = async () => {

    try {

      await createSurveyor({
        ...formData,
        categories:
          formData.categories
            ? formData.categories.split(",").map((item) => item.trim())
            : []
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Surveyor created successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setOpen(false);

      setFormData({
        surveyorName: "",
        licenseNo: "",
        expiryDate: "",
        categories: "",
        contactNo: "",
        email: "",
        address: "",
        status: true
      });

      fetchData();

    } catch (error) {

      console.log(error);
      
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error creating surveyor",
      });
    }
  };

  // DELETE
  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {

        await deleteSurveyor(id);

        fetchData();
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Surveyor deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

      } catch (error) {

        console.log(error);
        
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error deleting surveyor",
        });
      }
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Surveyor Name", "License No", "Expiry Date", "Categories", "Contact No", "Email", "Address", "Status"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const expDate = item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '';
      const cats = item.categories ? item.categories.join(';') : '';
      csvContent += `"${(item.surveyorName || '').replace(/"/g, '""')}","${(item.licenseNo || '').replace(/"/g, '""')}","${expDate}","${cats.replace(/"/g, '""')}","${(item.contactNo || '').replace(/"/g, '""')}","${(item.email || '').replace(/"/g, '""')}","${(item.address || '').replace(/"/g, '""')}","${item.status ? 'Active' : 'Inactive'}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "surveyors.csv");
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
      if (!header.includes("surveyor name")) {
        toast.error("Invalid CSV format. Header must contain 'Surveyor Name'");
        return;
      }

      const importedSurveyors = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const surveyorName = row[0];
        const licenseNo = row[1] || '';
        const expiryDate = row[2] || '';
        const categories = row[3] ? row[3].split(';').map(c => c.trim()) : [];
        const contactNo = row[4] || '';
        const email = row[5] || '';
        const address = row[6] || '';
        const status = row[7] ? row[7].toLowerCase() === 'active' : true;
        if (surveyorName) {
          importedSurveyors.push({
            surveyorName,
            licenseNo,
            expiryDate,
            categories,
            contactNo,
            email,
            address,
            status
          });
        }
      }

      const existingNames = new Set(data.map(item => (item.surveyorName || '').toLowerCase().trim()));
      const existingLicenses = new Set(data.filter(item => item.licenseNo).map(item => (item.licenseNo || '').toLowerCase().trim()));
      
      const uniqueNewSurveyors = importedSurveyors.filter(s => 
        !existingNames.has(s.surveyorName.toLowerCase().trim()) &&
        (!s.licenseNo || !existingLicenses.has(s.licenseNo.toLowerCase().trim()))
      );

      if (uniqueNewSurveyors.length === 0) {
        toast.info("No new unique surveyors found to import.");
        return;
      }

      let successCount = 0;
      for (const s of uniqueNewSurveyors) {
        try {
          const res = await createSurveyor(s);
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import surveyor: ${s.surveyorName}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique surveyors found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique surveyors successfully!`);
      }
      fetchData();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>

      {/* HEADER */}

      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >

        <Typography variant="h5">
          Surveyor Master
        </Typography>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            className="global_btn"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Surveyor
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

      {/* DIALOG */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          Add Surveyor

          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 10,
              top: 10
            }}
          >
            <Close />
          </IconButton>

        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="dense"
            label="Surveyor Name"
            name="surveyorName"
            value={formData.surveyorName}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="License No"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="Expiry Date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true
            }}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Categories of License"
            name="categories"
            placeholder="Motor, Health, Fire"
            value={formData.categories}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Contact No"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email ID"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
          />

          <Grid
            container
            alignItems="center"
            sx={{ mt: 1 }}
          >

            <Typography>
              Active
            </Typography>

            <Switch
              checked={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.checked
                })
              }
            />

          </Grid>

        </DialogContent>

        <DialogActions>

          <Button
            color="error"
            variant="outlined"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            Save
          </Button>

        </DialogActions>

      </Dialog>

      {/* TABLE */}

      <Card>

        <CardContent>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>SN</TableCell>

                <TableCell>Name</TableCell>

                <TableCell>License No</TableCell>

                <TableCell>Expiry</TableCell>

                <TableCell>Categories</TableCell>

                <TableCell>Contact</TableCell>

                <TableCell>Email</TableCell>

                <TableCell>Status</TableCell>

                <TableCell>Action</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {data.length > 0 ? (

                data.map((item, index) => (

                  <TableRow key={item._id}>

                    <TableCell>
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      {item.surveyorName}
                    </TableCell>

                    <TableCell>
                      {item.licenseNo}
                    </TableCell>

                    <TableCell>
                      {item.expiryDate
                        ? new Date(
                            item.expiryDate
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {item.categories?.join(", ")}
                    </TableCell>

                    <TableCell>
                      {item.contactNo}
                    </TableCell>

                    <TableCell>
                      {item.email}
                    </TableCell>

                    <TableCell>
                      {item.status
                        ? "Active"
                        : "Inactive"}
                    </TableCell>

                    <TableCell>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(item._id)
                        }
                      >
                        <Delete />
                      </IconButton>

                    </TableCell>

                  </TableRow>

                ))

              ) : (

                <TableRow>

                  <TableCell
                    colSpan={9}
                    align="center"
                  >
                    No Surveyors Found
                  </TableCell>

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

export default SurveyorPage;