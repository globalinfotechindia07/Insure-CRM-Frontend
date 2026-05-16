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
            .split(",")
            .map((item) => item.trim())
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

    }
  };

  // DELETE
  const handleDelete = async (id) => {

    try {

      await deleteSurveyor(id);

      fetchData();

    } catch (error) {

      console.log(error);

    }
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

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Surveyor
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

    </div>
  );
};

export default SurveyorPage;