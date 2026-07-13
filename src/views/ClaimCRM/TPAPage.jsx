import React, { useEffect, useState } from "react";

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
} from "@mui/material";

import {
  Add,
  Delete,
  Close,
  Edit,
} from "@mui/icons-material";

import {
  createTPA,
  getTPAs,
  deleteTPA,
  updateTPA,
} from "../../services/tpa.service";

import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TPAPage = () => {

  const [open, setOpen] = useState(false);

  const [data, setData] = useState([]);

  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    tpaName: "",
    contactNo: "",
    email: "",
    address: "",
  });

  // FETCH DATA
  const fetchData = async () => {

    try {

      const res = await getTPAs();

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
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async () => {

    try {

      if (editId) {
        const result = await Swal.fire({
          title: "Update Record?",
          text: "Do you want to update this record?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
          await updateTPA(editId, formData);
          
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "TPA updated successfully!",
            timer: 2000,
            showConfirmButton: false,
          });
          setOpen(false);
          setEditId(null);
          setFormData({
            tpaName: "",
            contactNo: "",
            email: "",
            address: "",
          });
          fetchData();
        }
      } else {

        await createTPA(formData);
        
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "TPA created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        setOpen(false);
        setEditId(null);
        setFormData({
          tpaName: "",
          contactNo: "",
          email: "",
          address: "",
        });
        fetchData();
      }

    } catch (error) {

      console.log(error);
      
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: editId ? "Error updating TPA" : "Error creating TPA",
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

        await deleteTPA(id);

        fetchData();
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "TPA deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

      } catch (error) {

        console.log(error);
        
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error deleting TPA",
        });
      }
    }
  };

  // EDIT
  const handleEdit = (item) => {

    setEditId(item._id);

    setFormData({
      tpaName: item.tpaName || "",
      contactNo: item.contactNo || "",
      email: item.email || "",
      address: item.address || "",
    });

    setOpen(true);
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Name of TPA", "Contact No", "Email ID", "Address"];
    let csvContent = headers.join(",") + "\n";
    data.forEach(item => {
      csvContent += `"${(item.tpaName || '').replace(/"/g, '""')}","${(item.contactNo || '').replace(/"/g, '""')}","${(item.email || '').replace(/"/g, '""')}","${(item.address || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tpas.csv");
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
      if (!header.includes("tpa")) {
        toast.error("Invalid CSV format. Header must contain 'Name of TPA'");
        return;
      }

      const importedTPAs = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        const tpaName = row[0];
        const contactNo = row[1] || '';
        const email = row[2] || '';
        const address = row[3] || '';
        if (tpaName) {
          importedTPAs.push({
            tpaName,
            contactNo,
            email,
            address
          });
        }
      }

      const existingNames = new Set(data.map(item => (item.tpaName || '').toLowerCase().trim()));
      const uniqueNewTPAs = importedTPAs.filter(t => !existingNames.has(t.tpaName.toLowerCase().trim()));

      if (uniqueNewTPAs.length === 0) {
        toast.info("No new unique TPAs found to import.");
        return;
      }

      let successCount = 0;
      for (const t of uniqueNewTPAs) {
        try {
          const res = await createTPA(t);
          if (res && (res.status === true || res.status === "true" || res.data)) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to import TPA: ${t.tpaName}`, err);
        }
      }

      if (successCount === 0) {
        toast.info("No new unique TPAs found to import.");
      } else {
        toast.success(`Imported ${successCount} new unique TPAs successfully!`);
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
          TPA Master
        </Typography>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            className="global_btn"
            startIcon={<Add />}
            onClick={() => {
              setOpen(true);
              setEditId(null);

              setFormData({
                tpaName: "",
                contactNo: "",
                email: "",
                address: "",
              });
            }}
          >
            Add TPA
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

          {editId ? "Update TPA" : "Add TPA"}

          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
            }}
          >
            <Close />
          </IconButton>

        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="dense"
            label="Name of TPA"
            name="tpaName"
            value={formData.tpaName}
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
            {editId ? "Update" : "Save"}
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

                <TableCell>
                  Name of TPA
                </TableCell>

                <TableCell>
                  Contact No
                </TableCell>

                <TableCell>
                  Email ID
                </TableCell>

                <TableCell>
                  Address
                </TableCell>

                <TableCell>
                  Action
                </TableCell>

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
                      {item.tpaName}
                    </TableCell>

                    <TableCell>
                      {item.contactNo}
                    </TableCell>

                    <TableCell>
                      {item.email}
                    </TableCell>

                    <TableCell>
                      {item.address}
                    </TableCell>

                    <TableCell>

                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(item)}
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
                    colSpan={6}
                    align="center"
                  >
                    No TPA Found
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

export default TPAPage;