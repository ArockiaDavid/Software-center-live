import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import config from '../config';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: config.theme.primaryColor,
        marginBottom: 2
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          {config.appName}
        </Typography>

        {user ? (
          <>
            {config.enableNotifications && (
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            )}
            
            <IconButton 
              color="inherit"
              onClick={() => navigate('/profile')}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%' 
                  }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
            
            <Button 
              color="inherit"
              onClick={onLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              color="inherit"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              color="inherit"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </>
        )}

        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            bottom: 2, 
            right: 8,
            opacity: 0.7 
          }}
        >
          {config.companyName}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
