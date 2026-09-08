import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseIcon from '@mui/icons-material/Close';
import { get } from 'api/api';

const DueAlertModal = () => {
  const [open, setOpen] = useState(false);
  const [dueItems, setDueItems] = useState([]);

  useEffect(() => {
    const checkDueDates = async () => {
      // Show only once per login session
      const alreadyShown = sessionStorage.getItem('posBqpAlertShown');
      if (alreadyShown) return;

      try {
        const [posRes, bqpRes] = await Promise.all([
          get('pos'),
          get('bqp')
        ]);

        const posList = posRes.data || [];
        const bqpList = bqpRes.data || [];

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const filterDue = (items, type) => {
          return items
            .filter((item) => {
              if (!item.nextTrainingDueDate) return false;
              const dueDate = new Date(item.nextTrainingDueDate);
              return dueDate <= thirtyDaysFromNow;
            })
            .map((item) => ({
              ...item,
              type,
              name: item.posName || item.bqpName || 'N/A'
            }));
        };

        const duePos = filterDue(posList, 'POS');
        const dueBqp = filterDue(bqpList, 'BQP');
        
        const allDue = [...duePos, ...dueBqp].sort((a, b) => new Date(a.nextTrainingDueDate) - new Date(b.nextTrainingDueDate));

        if (allDue.length > 0) {
          setDueItems(allDue);
          setOpen(true);
          sessionStorage.setItem('posBqpAlertShown', 'true');
        }
      } catch (error) {
        console.error('Error fetching POS/BQP for alerts:', error);
      }
    };

    checkDueDates();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateOverdue = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    d.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return d < now;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: '#fff3e0', 
          color: '#e65100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ffe0b2',
          p: 2.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 32, color: '#f57c00' }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#e65100', m: 0 }}>
            Training Due Date Alerts
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#e65100' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, backgroundColor: '#fafafa' }}>
        <Typography variant="subtitle1" sx={{ mb: 3, color: '#555', fontWeight: 500 }}>
          The following POS and BQP entries have training due dates approaching within 30 days or are already past due.
        </Typography>
        
        {dueItems.length > 0 ? (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Code Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dueItems.map((item, index) => {
                  const overdue = isDateOverdue(item.nextTrainingDueDate);
                  return (
                    <TableRow 
                      key={item._id}
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                        '&:hover': { backgroundColor: '#f0f7ff' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ 
                          display: 'inline-block', 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: 1, 
                          backgroundColor: item.type === 'POS' ? '#e3f2fd' : '#f3e5f5',
                          color: item.type === 'POS' ? '#1565c0' : '#7b1fa2',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          {item.type}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell>{item.codeNumber || 'N/A'}</TableCell>
                      <TableCell>{item.contactNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: overdue ? '#d32f2f' : '#f57c00', 
                        fontWeight: 'bold' 
                      }}>
                        {formatDate(item.nextTrainingDueDate)}
                        {overdue && (
                          <Box component="span" sx={{ 
                            ml: 1, 
                            px: 1, 
                            py: 0.25, 
                            backgroundColor: '#ffebee', 
                            borderRadius: 1, 
                            fontSize: '0.7rem' 
                          }}>
                            OVERDUE
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">No items are due.</Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, backgroundColor: '#fff', borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          sx={{ 
            backgroundColor: '#f57c00', 
            color: 'white',
            fontWeight: 'bold',
            px: 4,
            py: 1,
            borderRadius: 2,
            '&:hover': { backgroundColor: '#ef6c00' }
          }}
          disableElevation
        >
          Acknowledge & Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DueAlertModal;
