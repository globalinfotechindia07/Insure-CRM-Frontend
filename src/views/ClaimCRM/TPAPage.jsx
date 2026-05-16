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

      setData(res.data.data || []);

    } catch (error) {

      console.log(error);

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

        await updateTPA(editId, formData);

      } else {

        await createTPA(formData);

      }

      setOpen(false);

      setEditId(null);

      setFormData({
        tpaName: "",
        contactNo: "",
        email: "",
        address: "",
      });

      fetchData();

    } catch (error) {

      console.log(error);

    }
  };

  // DELETE
  const handleDelete = async (id) => {

    try {

      await deleteTPA(id);

      fetchData();

    } catch (error) {

      console.log(error);

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

        <Button
          variant="contained"
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

    </div>
  );
};

export default TPAPage;