import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss';
import swal from 'sweetalert';

// import { axiosInstance } from '../../../api/api.js';
import { get, post, put, remove } from '../../../api/api.js';
import { useSelector } from 'react-redux';

const BrokerageRate = () => {
  const [form, setForm] = useState({ brokerageRate: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdmin, setAdmin] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    setOpen(true);
  };

  // Fetch all Insurance departments from backend
  const fetchBrokerageRate = async () => {
    try {
      const response = await get('brokerageRate');
      // console.log('BrokerageRate data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBrokerageRate();
  }, []);


  // Added Validation for only numbers and max length #M


  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

const MAX_LENGTH = 5;

const handleChange = (e) => {
  const { name, value } = e.target;

  // float allow (12.5)
  if (!/^\d*\.?\d*$/.test(value)) return;

  // max length
  if (value.length > MAX_LENGTH) return;

  setForm({ ...form, [name]: value });
};





const validate = () => {
  const newErrors = {};

  if (!form.brokerageRate) {
    newErrors.brokerageRate = 'Brokerage Rate is required';
  } else if (form.brokerageRate.length > MAX_LENGTH) {
    newErrors.brokerageRate = `Max ${MAX_LENGTH} characters allowed`;
  } else if (isNaN(form.brokerageRate)) {
    newErrors.brokerageRate = 'Only numeric value allowed';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      // if (editIndex !== null) {
      //   // Update existing
      //   const id = data[editIndex]._id;
      //   await put(`brokerageRate/${id}`, form);
      //   fetchBrokerageRate();

      //   toast.success('Record Edited Sucessfully');
      // }
      if (editIndex !== null) {
  const id = data[editIndex]._id;

  swal({
    title: "Update Brokerage Rate?",
    text: "Do you want to update this record?",
    icon: "warning",
    buttons: ["Cancel", "Update"],
  }).then(async (willUpdate) => {
    if (willUpdate) {
      try {
        await put(`brokerageRate/${id}`, form);
        fetchBrokerageRate();

        setOpen(false);
        setForm({ brokerageRate: '' });
        setEditIndex(null);

        swal("Updated!", "Record updated successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });

  return; // 🔥 IMPORTANT
}
       else {
        // Create new
        await post('brokerageRate', form);
        fetchBrokerageRate();
        toast.success('Record Saved Sucessfully');
      }
      setOpen(false);
      setForm({ brokerageRate: '' });
      setEditIndex(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditIndex(index);
    setOpen(true);
  };

  // const handleDelete = async (index) => {
  //   try {
  //     const id = data[index]._id;
  //     await remove(`brokerageRate/${id}`);
  //     fetchBrokerageRate();
  //     toast.success('Record Deleted Sucessfully');
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Record Deletion Failed');
  //   }
  // };
  // added pop up #M
  const handleDelete = (index) => {
  const id = data[index]._id;

  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this record!",
    icon: "warning",
    buttons: ["Cancel", "Delete"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        await remove(`brokerageRate/${id}`);
        fetchBrokerageRate();

        swal("Deleted!", "Record deleted successfully.", "success");
      } catch (error) {
        console.error(error);
        swal("Error!", "Something went wrong.", "error");
      }
    }
  });
};


  return (
    <div>
      <Breadcrumb>
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Masters
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Brokerage Rate
        </Typography>
      </Breadcrumb>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Bokerage Rate</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Rate
        </Button>
        {/* {(positionPermission.Add === true || isAdmin) && (
                <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                  Add position
                </Button>  
              )} */}
      </Grid>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                <TableCell>Brokerage Rate</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {/* {data.length > 0 ? ( */}
            <>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.brokerageRate}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(index)}
                        sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                      >
                        <IconButton color="inherit">
                          <Edit />
                        </IconButton>
                      </Button>
                      <Button color="error" onClick={() => handleDelete(index)} sx={{ padding: '1px', minWidth: '24px', height: '24px' }}>
                        <IconButton color="inherit">
                          <Delete />
                        </IconButton>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
            {/* ) : ( */}
            {/* <>No Data Found</> */}
            {/* )} */}
          </Table>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Add Brokerage Rate
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Brokerage Rate"
            name="brokerageRate"
            value={form.brokerageRate}
            onChange={handleChange}
            error={!!errors.brokerageRate}
            helperText={errors.brokerageRate}
            fullWidth
            margin="dense"
            inputProps={{ maxLength: MAX_LENGTH }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error" sx={{ minWidth: '40px', padding: '2px' }}>
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}>
            <IconButton color="inherit">{editIndex !== null ? <EditIcon /> : <SaveIcon />}</IconButton>
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default BrokerageRate;
