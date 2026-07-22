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
  Switch,
  Box
} from "@mui/material";

import {
  Add,
  Delete,
  Close,
  Edit
} from "@mui/icons-material";

import {
  createSurveyor,
  getSurveyors,
  deleteSurveyor,
  updateSurveyor
} from "../../services/surveyor.service";

import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SurveyorPage = () => {

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSurveyorId, setCurrentSurveyorId] = useState(null);

  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    companyName: "",
    licenseNo: "",
    expiryDate: "",
    categories: "",
    surveyors: [{ name: "", contactNo: "", email: "" }],
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
      const payload = {
        ...formData,
        categories:
          typeof formData.categories === "string"
            ? formData.categories.split(",").map((item) => item.trim())
            : formData.categories
      };

      if (isEdit) {
        await updateSurveyor(currentSurveyorId, payload);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Surveyor updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createSurveyor(payload);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Surveyor created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setOpen(false);
      setIsEdit(false);
      setCurrentSurveyorId(null);

      setFormData({
        companyName: "",
        licenseNo: "",
        expiryDate: "",
        categories: "",
        surveyors: [{ name: "", contactNo: "", email: "" }],
        address: "",
        status: true
      });

      fetchData();

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: isEdit ? "Error updating surveyor" : "Error creating surveyor",
      });
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentSurveyorId(item._id);
    const itemSurveyors = item.surveyors && item.surveyors.length > 0
      ? item.surveyors.map(s => ({ name: s.name || "", contactNo: s.contactNo || "", email: s.email || "" }))
      : [{ name: item.surveyorName || "", contactNo: item.contactNo || "", email: item.email || "" }];

    setFormData({
      companyName: item.companyName || "",
      licenseNo: item.licenseNo || "",
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      categories: Array.isArray(item.categories) ? item.categories.join(", ") : (item.categories || ""),
      surveyors: itemSurveyors,
      address: item.address || "",
      status: item.status !== undefined ? item.status : true
    });
    setOpen(true);
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
    const headers = [
      "Surveyor 1 Name", "Surveyor 1 Contact", "Surveyor 1 Email",
      "Surveyor 2 Name", "Surveyor 2 Contact", "Surveyor 2 Email",
      "Surveyor 3 Name", "Surveyor 3 Contact", "Surveyor 3 Email",
      "Company Name", "License No", "Expiry Date", "Categories", "Address", "Status"
    ];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      const expDate = item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '';
      const cats = item.categories ? item.categories.join(';') : '';
      csvContent += `"${(item.surveyorName || '').replace(/"/g, '""')}","${(item.contactNo || '').replace(/"/g, '""')}","${(item.email || '').replace(/"/g, '""')}",` +
                    `"${(item.surveyorName2 || '').replace(/"/g, '""')}","${(item.contactNo2 || '').replace(/"/g, '""')}","${(item.email2 || '').replace(/"/g, '""')}",` +
                    `"${(item.surveyorName3 || '').replace(/"/g, '""')}","${(item.contactNo3 || '').replace(/"/g, '""')}","${(item.email3 || '').replace(/"/g, '""')}",` +
                    `"${(item.companyName || '').replace(/"/g, '""')}","${(item.licenseNo || '').replace(/"/g, '""')}","${expDate}","${cats.replace(/"/g, '""')}","${(item.address || '').replace(/"/g, '""')}","${item.status ? 'Active' : 'Inactive'}"\n`;
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
      if (!header.includes("surveyor 1 name")) {
        toast.error("Invalid CSV format. Header must contain 'Surveyor 1 Name'");
        return;
      }

      const importedSurveyors = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const surveyorName = row[0];
        const contactNo = row[1] || '';
        const email = row[2] || '';
        const surveyorName2 = row[3] || '';
        const contactNo2 = row[4] || '';
        const email2 = row[5] || '';
        const surveyorName3 = row[6] || '';
        const contactNo3 = row[7] || '';
        const email3 = row[8] || '';
        const companyName = row[9] || '';
        const licenseNo = row[10] || '';
        const expiryDate = row[11] || '';
        const categories = row[12] ? row[12].split(';').map(c => c.trim()) : [];
        const address = row[13] || '';
        const status = row[14] ? row[14].toLowerCase() === 'active' : true;
        if (surveyorName) {
          importedSurveyors.push({
            surveyorName,
            contactNo,
            email,
            surveyorName2,
            contactNo2,
            email2,
            surveyorName3,
            contactNo3,
            email3,
            companyName,
            licenseNo,
            expiryDate,
            categories,
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
            onClick={() => {
              setIsEdit(false);
              setCurrentSurveyorId(null);
              setFormData({
                companyName: "",
                licenseNo: "",
                expiryDate: "",
                categories: "",
                surveyors: [{ name: "", contactNo: "", email: "" }],
                address: "",
                status: true
              });
              setOpen(true);
            }}
          >
            Add Surveyor
          </Button>
          <Button variant="contained" color="secondary" onClick={exportCSV} disabled={localStorage.getItem('loginRole') !== 'admin'}>
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

          {isEdit ? "Edit Surveyor" : "Add Surveyor"}

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
            label="Company Name"
            name="companyName"
            value={formData.companyName}
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

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Surveyors</Typography>
          {formData.surveyors.map((surveyor, idx) => (
            <Box key={idx} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2, position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Surveyor #{idx + 1}</Typography>
              {formData.surveyors.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const list = [...formData.surveyors];
                    list.splice(idx, 1);
                    setFormData({ ...formData, surveyors: list });
                  }}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <Delete />
                </IconButton>
              )}
              <TextField
                fullWidth
                margin="dense"
                label="Surveyor Name"
                value={surveyor.name || ''}
                onChange={(e) => {
                  const list = [...formData.surveyors];
                  list[idx].name = e.target.value;
                  setFormData({ ...formData, surveyors: list });
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Contact No"
                value={surveyor.contactNo || ''}
                onChange={(e) => {
                  const list = [...formData.surveyors];
                  list[idx].contactNo = e.target.value;
                  setFormData({ ...formData, surveyors: list });
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email ID"
                value={surveyor.email || ''}
                onChange={(e) => {
                  const list = [...formData.surveyors];
                  list[idx].email = e.target.value;
                  setFormData({ ...formData, surveyors: list });
                }}
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => {
              setFormData({
                ...formData,
                surveyors: [...formData.surveyors, { name: '', contactNo: '', email: '' }]
              });
            }}
            sx={{ mb: 2 }}
          >
            Add Surveyor
          </Button>

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

                <TableCell>Company Name</TableCell>

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
                      {item.companyName || "-"}
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
                        color="info"
                        onClick={() => handleEdit(item)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>

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