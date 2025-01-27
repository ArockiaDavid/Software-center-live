import React, { useState, useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input
} from '@mui/material';
import { 
  Logout as LogoutIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ children, position = "static" }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const handleAvatarClick = () => {
    setOpenUploadDialog(true);
    handleClose();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const updatedUser = await response.json();
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.location.reload();
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
    setOpenUploadDialog(false);
  };

  return (
    <AppBar 
      position={position} 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 2,
        width: '100%',
        boxShadow: 3
      }}
    >
      <Toolbar>
        {children}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Software Center Admin
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleMenu}
            size="small"
            sx={{ padding: 0 }}
          >
            <Avatar
              alt={user.name}
              src={user.avatar || '/default-avatar.svg'}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'transparent',
                '& .MuiAvatar-img': {
                  objectFit: 'cover'
                }
              }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                {user.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleAvatarClick}>
              <ListItemIcon>
                <PhotoCameraIcon fontSize="small" />
              </ListItemIcon>
              Change Avatar
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>

        <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogContent>
            <Input
              type="file"
              inputRef={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current.click()}
              startIcon={<PhotoCameraIcon />}
            >
              Choose File
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
