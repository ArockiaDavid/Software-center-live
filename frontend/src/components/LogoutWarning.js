import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import config from '../config';

const LogoutWarning = ({ open, onStayLoggedIn, onLogout, remainingTime }) => {
  // Convert remaining time from milliseconds to minutes
  const minutesRemaining = Math.ceil(remainingTime / 60000);

  return (
    <Dialog 
      open={open}
      onClose={onStayLoggedIn}
      PaperProps={{
        sx: {
          minWidth: 320,
          maxWidth: 400,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        color: config.theme.primaryColor 
      }}>
        <WarningIcon sx={{ mr: 1 }} />
        Session Timeout Warning
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Your session in {config.appName} will expire in {minutesRemaining} {minutesRemaining === 1 ? 'minute' : 'minutes'}.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          For security reasons, you will be automatically logged out due to inactivity. Please save any unsaved work.
        </Typography>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            For assistance, contact {config.supportEmail}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onLogout}
          sx={{ color: config.theme.secondaryColor }}
        >
          Logout Now
        </Button>
        <Button 
          onClick={onStayLoggedIn}
          variant="contained"
          sx={{ backgroundColor: config.theme.primaryColor }}
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutWarning;
