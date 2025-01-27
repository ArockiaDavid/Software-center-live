import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts';
import AdminHeader from '../components/AdminHeader';
import Sidebar from '../components/Sidebar';

const COLORS = {
  totalUsers: {
    admin: '#FF6B6B',
    users: '#4ECDC4'
  },
  activeUsers: {
    active: '#82ca9d',
    inactive: '#8884d8'
  }
};

const UsageChart = ({ value, total, title, type, data }) => {
  const theme = useTheme();
  const chartData = data.map(item => ({
    ...item,
    fill: type === 'totalUsers' 
      ? (item.name === 'Admin' ? COLORS.totalUsers.admin : COLORS.totalUsers.users)
      : (item.name === 'Active' ? COLORS.activeUsers.active : COLORS.activeUsers.inactive),
    fullMark: total
  }));

  const percentage = Math.round((value / total) * 100);

  return (
    <Box sx={{ 
      height: 400, 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom
        sx={{ 
          fontWeight: 500,
          color: theme => theme.palette.text.primary,
          mb: 2
        }}
      >
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
        <ResponsiveContainer>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="100%" 
            barSize={20} 
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              label={{ 
                position: 'insideStart',
                fill: '#fff',
                fontWeight: 500
              }}
              background
              dataKey="value"
              cornerRadius={8}
              animate={true}
            />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: '10px'
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              color: type === 'totalUsers' ? COLORS.totalUsers.users : COLORS.activeUsers.active,
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              mt: 0.5,
              fontSize: '1rem'
            }}
          >
            {type === 'totalUsers' ? 'Total Users' : 'Active Users'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const UserDashboardPage = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchSystemInfo();
  }, [navigate]);

  const fetchSystemInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3007/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const totalUsers = data.filter(user => user.role === 'user').length;
        const activeUsers = data.filter(user => user.lastLogin).length;
        
        setSystemInfo({
          totalUsers,
          activeUsers
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexGrow: 1,
          height: '100%'
        }}>
          <CircularProgress />
        </Box>
      );
    }

    const userTypeData = [
      { name: 'Admin', value: 1 },
      { name: 'Regular Users', value: systemInfo?.totalUsers || 0 }
    ];

    const activeUserData = [
      { name: 'Active', value: systemInfo?.activeUsers || 0 },
      { name: 'Inactive', value: (systemInfo?.totalUsers || 0) - (systemInfo?.activeUsers || 0) }
    ];

    return (
      <Box sx={{ width: '100%', pl: 3, pr: 3, pt: 2 }}>
        <Typography variant="h4" gutterBottom align="left">
          User Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 4, 
                height: '100%',
                boxShadow: theme => theme.shadows[2],
                borderRadius: 2,
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="h6" gutterBottom align="left" sx={{ mb: 4 }}>
                User Statistics
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <UsageChart 
                    value={systemInfo?.totalUsers || 0}
                    total={(systemInfo?.totalUsers || 0) + 1}
                    title="User Distribution"
                    type="totalUsers"
                    data={userTypeData}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <UsageChart 
                    value={systemInfo?.activeUsers || 0}
                    total={systemInfo?.totalUsers || 1}
                    title="User Activity"
                    type="activeUsers"
                    data={activeUserData}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminHeader position="fixed">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      </AdminHeader>

      <Sidebar 
        open={drawerOpen}
        onClose={handleDrawerToggle}
        onNavigate={handleNavigate}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'auto',
          bgcolor: theme => theme.palette.grey[100]
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default UserDashboardPage;
