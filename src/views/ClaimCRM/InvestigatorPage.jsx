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
} from "@mui/material";

import { Add } from "@mui/icons-material";

import {
  createInvestigator,
  getInvestigators,
} from "../../services/investigator.service";

const InvestigatorPage = () => {

  const [open, setOpen] = useState(false);

  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    investigatorName: "",
    email: "",
    contactNo: "",
  });

  const fetchData = async () => {
    const res = await getInvestigators();
    setData(res.data.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    await createInvestigator(formData);
    setOpen(false);
    fetchData();
  };

  return (
    <div>

      <Grid container justifyContent="space-between" sx={{ mb: 2 }}>

        <Typography variant="h5">
          Investigator Master
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Investigator
        </Button>

      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>

        <DialogTitle>Add Investigator</DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="dense"
            label="Investigator Name"
            onChange={(e) =>
              setFormData({
                ...formData,
                investigatorName: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email"
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Contact"
            onChange={(e) =>
              setFormData({
                ...formData,
                contactNo: e.target.value,
              })
            }
          />

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpen(false)}>
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

      <Card>

        <CardContent>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>SN</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {data.map((item, index) => (

                <TableRow key={item._id}>

                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.investigatorName}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.contactNo}</TableCell>

                </TableRow>
              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
};

export default InvestigatorPage;    