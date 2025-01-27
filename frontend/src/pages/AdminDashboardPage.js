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
  useMediaQuery,
  Avatar,
  Chip,
  TablePagination,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ArrowForward as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import Sidebar from '../components/Sidebar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
}));

const TableHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'grid',
  gridTemplateColumns: '2fr 2fr 1fr 1fr',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '2fr 1fr 1fr',
  }
}));

const TableRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'grid',
  gridTemplateColumns: '2fr 2fr 1fr 1fr',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '2fr 1fr 1fr',
  }
}));

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
});

const StatusChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: '16px',
  fontWeight: 500,
  ...(status === 'active' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
  ...(status === 'inactive' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  }),
}));

const ViewButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.primary.light,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
  },
  transition: 'all 0.2s'
}));

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3007/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredUsers = data.filter(user => user.role === 'user');
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUserClick = (userId) => {
    navigate(`/user-details/${userId}`);
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

    return (
      <Box sx={{ width: '100%', pl: 3, pr: 3, pt: 2 }}>
        <Typography variant="h4" gutterBottom align="left" sx={{ mb: 4 }}>
          User Management
        </Typography>

        <StyledPaper>
          <TableHeader>
            <Typography variant="subtitle1" fontWeight={600}>User</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Email</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Status</Typography>
            {!isMobile && (
              <Typography variant="subtitle1" fontWeight={600} align="center">Actions</Typography>
            )}
          </TableHeader>

          {users
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user) => (
              <TableRow key={user._id}>
                <UserInfo>
                  <Avatar 
                    src={user.avatar || '/default-avatar.svg'} 
                    alt={user.name}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      backgroundColor: theme => theme.palette.primary.light
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Box>
                </UserInfo>
                <Typography variant="body2">{user.email}</Typography>
                <StatusChip
                  size="small"
                  label={user.lastLogin ? 'Active' : 'Inactive'}
                  status={user.lastLogin ? 'active' : 'inactive'}
                  icon={user.lastLogin ? <ActiveIcon fontSize="small" /> : <InactiveIcon fontSize="small" />}
                />
                {!isMobile && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ViewButton
                      size="small"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <ViewIcon fontSize="small" />
                    </ViewButton>
                  </Box>
                )}
              </TableRow>
            ))}

          <Box sx={{ p: 2 }}>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        </StyledPaper>
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

export default AdminDashboardPage;
