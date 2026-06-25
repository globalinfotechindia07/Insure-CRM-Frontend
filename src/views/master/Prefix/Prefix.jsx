import React, { useState, useEffect } from 'react';
import {
    Grid, TextField, Button, Typography, Card, CardContent, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { Link } from 'react-router-dom';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'assets/scss/_themes-vars.module.scss';
import value from 'assets/scss/_themes-vars.module.scss'; 
import { get, post, put } from 'api/api'; // <-- import your API helpers
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Prefix = () => {
    const [form, setForm] = useState({ prefix: '' });
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);
    const [isAdmin,setAdmin]=useState(false);
    const [prefixPermission,setPrefixPermission]=useState({
        View: false,
        Add: false,
        Edit: false,
        Delete: false
    });
    const systemRights = useSelector((state)=>state.systemRights.systemRights);
        

    // Fetch Prefix list from backend
    useEffect(() => {
        const loginRole=localStorage.getItem('loginRole');
        if (loginRole === 'admin') {
        setAdmin(true);
        }
        if (systemRights?.actionPermissions?.["prefix"]) {
        setPrefixPermission(systemRights.actionPermissions["prefix"]);
        }
        fetchData();
    }, [systemRights]);

    const fetchData = async () => {
        const res = await get('prefix');

        console.log("Prefix data:", res.allPrefix)

        if (res && res.allPrefix) setData(res.allPrefix || []);
        else setData([]);
    };

    const validate = () => {
        const newErrors = {};
        if (!form.prefix) newErrors.prefix = 'Prefix is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpen = () => {
        setForm({ prefix: '' });
        setErrors({});
        setEditIndex(null);
        setEditId(null);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {
        if (validate()) {
            if (editIndex !== null && editId) {
                // Edit
                const res = await put(`prefix/${editId}`, { prefix: form.prefix });
                if (res && res.prefix) {
                    fetchData();
                    setOpen(false);
                }
            } else {
                // Add
                const res = await post('prefix', { prefix: form.prefix });
                if (res && res.prefix) {
                    fetchData();
                    setOpen(false);
                }
            }
        }
    };

    const handleEdit = (index) => {
        setForm({ prefix: data[index].prefix });
        setEditIndex(index);
        setEditId(data[index]._id);
        setOpen(true);
    };

    const handleDelete = async (index) => {
        const id = data[index]._id;
        await put(`prefix/delete/${id}`, {}); // Soft delete
        fetchData();
    };

    const exportCSV = () => {
        if (!data || data.length === 0) return;
        const headers = ["Prefix"];
        let csvContent = headers.join(",") + "\n";
        data.forEach(item => {
            csvContent += `"${(item.prefix || '').replace(/"/g, '""')}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "prefixes.csv");
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
            if (!header.includes("prefix")) {
                toast.error("Invalid CSV format. Header must contain 'Prefix'");
                return;
            }

            const imported = [];
            for (let i = 1; i < lines.length; i++) {
                const val = lines[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                if (val) {
                    imported.push(val);
                }
            }

            const existingSet = new Set(data.map(item => (item.prefix || '').toLowerCase().trim()));
            const uniqueNew = [...new Set(imported)].filter(v => !existingSet.has(v.toLowerCase().trim()));

            if (uniqueNew.length === 0) {
                toast.info("No new unique prefixes found to import.");
                return;
            }

            let successCount = 0;
            for (const val of uniqueNew) {
                try {
                    const res = await post("prefix", { prefix: val });
                    if (res && res.prefix) {
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to import prefix: ${val}`, err);
                }
            }

            if (successCount === 0) {
                toast.info("No new unique prefixes found to import.");
            } else {
                toast.success(`Imported ${successCount} new unique prefixes successfully!`);
            }
            fetchData();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div>
            <Breadcrumb>
                <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
                    Home
                </Typography>
                <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
                    prefix
                </Typography>
            </Breadcrumb>

            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Prefix</Typography>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {(prefixPermission.Add===true || isAdmin) && <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                        Add Prefix
                    </Button>}
                    <Button variant="contained" color="secondary" onClick={exportCSV}>
                        Export
                    </Button>
                    <Button variant="contained" component="label" sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
                        Import
                        <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
                    </Button>
                </div>
            </Grid>

            {/* Modal Form */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    {editIndex !== null ? 'Edit Prefix' : 'Add Prefix'}
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <TextField
                        label="Prefix"
                        name="prefix"
                        value={form.prefix}
                        onChange={handleChange}
                        error={!!errors.prefix}
                        helperText={errors.prefix}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        color="error"
                        sx={{ minWidth: '40px', padding: '2px' }}
                    >
                        <IconButton color="inherit">
                            <CancelIcon />
                        </IconButton>
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ minWidth: '40px', padding: '2px', backgroundColor: value.primaryLight }}
                    >
                        <IconButton color="inherit">
                            {editIndex !== null ? <EditIcon /> : <SaveIcon />}
                        </IconButton>
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Table */}
            {data.length > 0 && (
                <Card>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>SN</TableCell>
                                    <TableCell>Prefix</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.prefix}</TableCell>
                                        <TableCell>
                                            {(prefixPermission.Edit===true || isAdmin) && <Button
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEdit(index)}
                                                sx={{ padding: '1px', minWidth: '24px', height: '24px', mr: '5px' }}
                                            >
                                                <IconButton color='inherit'><Edit /></IconButton>
                                            </Button>}
                                            {(prefixPermission.Delete===true || isAdmin) && <Button
                                                color="error"
                                                onClick={() => handleDelete(index)}
                                                sx={{ padding: '1px', minWidth: '24px', height: '24px' }}
                                            >
                                                <IconButton color='inherit'><Delete /></IconButton>
                                            </Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
            <ToastContainer />
        </div>
    );
}

export default Prefix;