import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Tabs, Tab, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import ParametricReport from '../ParametricReport/ParametricReport';
import AnalyticalReport from '../AnalyticalReport/AnalyticalReport';
import { ToastContainer } from 'react-toastify';

const LeadReport = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Breadcrumb title="Lead Report">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Lead Report
        </Typography>
      </Breadcrumb>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs 
                  value={value} 
                  onChange={handleChange} 
                  textColor="primary"
                  indicatorColor="primary"
                  centered
                  sx={{
                    mb: 1,
                    '& .MuiTab-root': {
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      textTransform: 'none',
                    }
                  }}
                >
                  <Tab label="Lead Tracking (Parametric)" />
                  <Tab label="Lead Analytics (Analytical)" />
                </Tabs>
                <Divider />
                <Box sx={{ mt: 2 }}>
                  {value === 0 && <ParametricReport />}
                  {value === 1 && <AnalyticalReport />}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default LeadReport;
