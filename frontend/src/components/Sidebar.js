import React, { useState, useCallback, useEffect } from 'react';
import { 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Box,
  IconButton,
  styled,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    border: 'none',
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
    top: '64px',
    height: 'calc(100% - 64px)',
    overflowX: 'hidden',
    zIndex: theme.zIndex.drawer,
    boxShadow: 'none',
    borderRight: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    '& > *': {
      margin: 0
    }
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  minHeight: 50,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  justifyContent: 'flex-end'
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  padding: 8,
  borderRadius: 4,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main
    }
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
    transition: theme.transitions.create(['color', 'transform'], {
      duration: 200
    })
  }
}));

const MenuItem = React.memo(({ item, expanded, onNavigate }) => {
  const theme = useTheme();
  const listItem = (
    <ListItem 
      button 
      onClick={() => onNavigate(item.path)}
      sx={{
        minHeight: 48,
        px: expanded ? 2.5 : 1.5,
        justifyContent: expanded ? 'initial' : 'center',
        backgroundColor: item.active ? theme.palette.action.selected : 'transparent',
        '&:hover': {
          backgroundColor: item.active 
            ? theme.palette.action.selected 
            : theme.palette.action.hover
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          color: item.active ? theme.palette.primary.main : 'inherit',
          minWidth: expanded ? 48 : 0,
          mr: expanded ? 3 : 'auto',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {expanded && (
        <ListItemText 
          primary={item.text} 
          sx={{ 
            '& .MuiTypography-root': {
              color: item.active ? theme.palette.primary.main : 'inherit',
              fontWeight: item.active ? 600 : 400
            }
          }}
        />
      )}
    </ListItem>
  );

  return expanded ? listItem : (
    <Tooltip title={item.text} placement="right">
      {listItem}
    </Tooltip>
  );
});

const Sidebar = ({ open, onClose, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  // Initialize expanded state from localStorage
  const [expanded, setExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState === null ? true : savedState === 'true';
  });

  // Update localStorage when expanded state changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', expanded);
  }, [expanded]);

  const handleToggle = useCallback(() => {
    if (!isMobile) {
      setExpanded(prev => !prev);
    }
  }, [isMobile]);

  const handleNavigate = useCallback((path) => {
    onNavigate(path);
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose, onNavigate]);

  const drawerWidth = expanded ? 240 : 50;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/user-dashboard',
      active: location.pathname === '/user-dashboard'
    },
    {
      text: 'User Details',
      icon: <PersonIcon />,
      path: '/admin-dashboard',
      active: location.pathname === '/admin-dashboard'
    }
  ];

  return (
    <StyledDrawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 200,
          }),
        }
      }}
    >
      <DrawerHeader>
        {!isMobile && (
          <ToggleButton
            onClick={handleToggle}
            size="small"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft /> : <ChevronRight />}
          </ToggleButton>
        )}
      </DrawerHeader>
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <MenuItem 
            key={item.text}
            item={item}
            expanded={expanded}
            onNavigate={handleNavigate}
          />
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
