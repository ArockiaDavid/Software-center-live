import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminHeader from '../components/AdminHeader';

const UserDetailsPage = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchUserDetails();
  }, [navigate, userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const [installedSoftware, setInstalledSoftware] = useState([]);
  const [softwareLoading, setSoftwareLoading] = useState(true);

  const fetchInstalledSoftware = async () => {
    setSoftwareLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching installed software for ID:', userId);
      const response = await fetch(`http://localhost:3007/api/user-software/user/${userId}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch installed software');
      }

      const data = await response.json();
      console.log('Received installed software data:', data);
      setInstalledSoftware(data);
    } catch (error) {
      console.error('Error fetching installed software:', error);
    } finally {
      setSoftwareLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching user details for ID:', userId);
      const response = await fetch(`http://localhost:3007/api/users/${userId}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      console.log('Received user data:', data);
      setUserDetails(data);
      setError(null);

      // Fetch installed software separately
      await fetchInstalledSoftware();
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSystemInfo = () => {
    if (!userDetails?.systemConfig) {
      return <Typography>No system information available</Typography>;
    }

    const config = userDetails.systemConfig;
    return (
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 'bold' }}>Operating System</TableCell>
              <TableCell>{`${config.osName} ${config.osVersion}`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>CPU</TableCell>
              <TableCell>{`${config.cpuModel} (${config.cpuCores} cores)`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Memory</TableCell>
              <TableCell>{`${config.totalMemory} GB Total`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Storage</TableCell>
              <TableCell>{`${config.totalDiskSpace} GB Total (${config.freeDiskSpace} GB free)`}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderInstalledSoftware = () => {
    if (softwareLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (!installedSoftware || installedSoftware.length === 0) {
      return <Typography>No software installed</Typography>;
    }

    try {
      return (
        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Software Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Installation Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Update</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {installedSoftware.map((software, index) => (
                <TableRow key={software._id || index}>
                  <TableCell>{software.name || 'Unknown Software'}</TableCell>
                  <TableCell>{software.version || 'N/A'}</TableCell>
                  <TableCell>{software.status || 'N/A'}</TableCell>
                  <TableCell>{formatDate(software.installDate)}</TableCell>
                  <TableCell>{formatDate(software.lastUpdateCheck)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } catch (error) {
      console.error('Error rendering installed software:', error);
      return <Typography color="error">Error displaying installed software</Typography>;
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin-dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          {error ? (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          ) : (
            <>
              <Typography variant="h4" gutterBottom>
                User Details: {userDetails?.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {userDetails?.email}
              </Typography>
            </>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              {renderSystemInfo()}
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Installed Software
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={async () => {
                    try {
                      await fetchInstalledSoftware();
                    } catch (error) {
                      console.error('Error refreshing software list:', error);
                    }
                  }}
                >
                  Refresh Software List
                </Button>
              </Box>
              {renderInstalledSoftware()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default UserDetailsPage;
