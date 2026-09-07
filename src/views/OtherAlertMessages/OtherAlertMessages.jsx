import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { get } from 'api/api';
import { toast } from 'react-toastify';

const OtherAlertMessages = () => {
  const [tabValue, setTabValue] = useState(0);
  const [posList, setPosList] = useState([]);
  const [bqpList, setBqpList] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchPOS = async () => {
    try {
      const response = await get('pos');
      if (response.success || response.data) {
        const data = response.data.data || response.data || [];
        setPosList(data.filter((item) => item.reminderAlerts === true));
      }
    } catch (error) {
      toast.error('Failed to fetch POS data');
    }
  };

  const fetchBQP = async () => {
    try {
      const response = await get('bqp');
      if (response.success || response.data) {
        const data = response.data.data || response.data || [];
        setBqpList(data.filter((item) => item.reminderAlerts === true));
      }
    } catch (error) {
      toast.error('Failed to fetch BQP data');
    }
  };

  useEffect(() => {
    fetchPOS();
    fetchBQP();
  }, []);

  const sendWhatsAppAlert = (name, contactNumber, nextTrainingDate) => {
    if (!contactNumber) {
      toast.error('Contact number is missing for this record.');
      return;
    }

    // Clean phone number (remove spaces, etc.)
    const cleanNumber = contactNumber.replace(/\D/g, '');
    
    // Construct default message
    const formattedDate = nextTrainingDate ? new Date(nextTrainingDate).toLocaleDateString() : 'an upcoming date';
    const message = `Hello ${name || ''},\n\nThis is a friendly reminder from Insure CRM that your next training is due on ${formattedDate}. Please ensure you complete it on time.\n\nThank you!`;
    
    // Open WhatsApp Web/App url
    const whatsappUrl = `https://wa.me/91${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isDateApproaching = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff >= 0; // Approaching within 30 days
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Other Alert Messages</Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="POS Alert Messages" />
          <Tab label="BQP Alert Messages" />
        </Tabs>
      </Paper>

      {/* POS Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>POS Name</strong></TableCell>
                <TableCell><strong>Code Number</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Next Training</strong></TableCell>
                <TableCell><strong>Alert Status</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posList.length > 0 ? posList.map((pos) => {
                const approaching = isDateApproaching(pos.nextTrainingDueDate);
                return (
                <TableRow key={pos._id} sx={{ backgroundColor: approaching ? '#fff4e5' : 'inherit' }}>
                  <TableCell>{pos.posName}</TableCell>
                  <TableCell>{pos.codeNumber}</TableCell>
                  <TableCell>{pos.contactNumber || '-'}</TableCell>
                  <TableCell>{pos.nextTrainingDueDate ? new Date(pos.nextTrainingDueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {pos.reminderAlerts ? (
                      <Chip label="Enabled" color="success" size="small" />
                    ) : (
                      <Chip label="Disabled" color="default" size="small" />
                    )}
                    {approaching && <Chip label="Due Soon" color="warning" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      startIcon={<WhatsAppIcon />}
                      onClick={() => sendWhatsAppAlert(pos.posName, pos.contactNumber, pos.nextTrainingDueDate)}
                      disabled={!pos.contactNumber}
                    >
                      Send Alert
                    </Button>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No POS records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* BQP Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>BQP Name</strong></TableCell>
                <TableCell><strong>Code Number</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Next Training</strong></TableCell>
                <TableCell><strong>Alert Status</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bqpList.length > 0 ? bqpList.map((bqp) => {
                const approaching = isDateApproaching(bqp.nextTrainingDueDate);
                return (
                <TableRow key={bqp._id} sx={{ backgroundColor: approaching ? '#fff4e5' : 'inherit' }}>
                  <TableCell>{bqp.bqpName}</TableCell>
                  <TableCell>{bqp.codeNumber}</TableCell>
                  <TableCell>{bqp.contactNumber || '-'}</TableCell>
                  <TableCell>{bqp.nextTrainingDueDate ? new Date(bqp.nextTrainingDueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {bqp.reminderAlerts ? (
                      <Chip label="Enabled" color="success" size="small" />
                    ) : (
                      <Chip label="Disabled" color="default" size="small" />
                    )}
                    {approaching && <Chip label="Due Soon" color="warning" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      startIcon={<WhatsAppIcon />}
                      onClick={() => sendWhatsAppAlert(bqp.bqpName, bqp.contactNumber, bqp.nextTrainingDueDate)}
                      disabled={!bqp.contactNumber}
                    >
                      Send Alert
                    </Button>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No BQP records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Box>
  );
};

export default OtherAlertMessages;
