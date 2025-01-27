import React, { useState, useEffect, useCallback } from 'react';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import useAutoLogout from '../hooks/useAutoLogout';
import { Grid, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import Header from '../components/Header';
import { 
  Code as CodeIcon,
  Language as LanguageIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import AppCard from '../components/AppCard';
import LogoutWarning from '../components/LogoutWarning';
import './HomePage.css';

const categories = [
  { id: 'all', name: 'All Software', icon: <BuildIcon /> },
  { id: 'development', name: 'Development', icon: <CodeIcon /> },
  { id: 'internet', name: 'Internet', icon: <LanguageIcon /> }
];

const softwareList = [
  {
    id: 'sublime-text',
    name: 'Sublime Text',
    developer: 'Sublime HQ',
    description: 'A sophisticated text editor for code, markup and prose',
    icon: 'https://www.sublimetext.com/images/icon.png',
    rating: 4.8,
    category: 'Development'
  },
  {
    id: 'visual-studio-code',
    name: 'Visual Studio Code',
    developer: 'Microsoft',
    description: 'Free and powerful source code editor',
    icon: 'https://code.visualstudio.com/assets/images/code-stable.png',
    rating: 4.9,
    category: 'Development'
  },
  {
    id: 'node',
    name: 'Node.js',
    developer: 'OpenJS Foundation',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    icon: 'https://nodejs.org/static/images/logo.svg',
    rating: 4.8,
    category: 'Development'
  },
  {
    id: 'postman',
    name: 'Postman',
    developer: 'Postman Inc.',
    description: 'API platform for building and using APIs',
    icon: 'https://cdn.worldvectorlogo.com/logos/postman.svg',
    rating: 4.7,
    category: 'Development'
  },
  {
    id: 'docker',
    name: 'Docker',
    developer: 'Docker Inc.',
    description: 'Platform for developing, shipping, and running applications',
    icon: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
    rating: 4.8,
    category: 'Development'
  },
  {
    id: 'google-chrome',
    name: 'Google Chrome',
    developer: 'Google',
    description: 'Fast and secure web browser',
    icon: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
    rating: 4.5,
    category: 'Internet'
  }
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { searchTerm } = useSearch();

  // Enable auto-logout after inactivity
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const { showWarning, remainingTime, onStayLoggedIn } = useAutoLogout(handleLogout);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAppClick = (app) => {
    // Prevent navigation for now as it's causing unwanted refreshes
    // navigate(`/app/${app.id}`, { state: { app } });
  };

  const filteredSoftware = softwareList.filter(software => {
    const matchesCategory = selectedCategory === 'all' || 
                          software.category.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name.toLowerCase();
    
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         software.name.toLowerCase().includes(searchTermLower) ||
                         software.description.toLowerCase().includes(searchTermLower) ||
                         software.developer.toLowerCase().includes(searchTermLower);
    
    return matchesCategory && matchesSearch;
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Checking auth:', { hasToken: !!token, hasUser: !!user });
    
    if (!token || !user) {
      console.log('No auth data found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
      if (!userData.role || userData.role !== 'user') {
        console.log('Invalid user role, redirecting to login');
        navigate('/login');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Box>
      <Header />
      <LogoutWarning 
        open={showWarning}
        onStayLoggedIn={onStayLoggedIn}
        onLogout={handleLogout}
        remainingTime={remainingTime}
      />
      <Box sx={{ display: 'flex', p: 3, gap: 3 }}>
      {/* Categories Sidebar */}
      <Paper sx={{ width: 240, flexShrink: 0 }}>
        <List>
          {categories.map((category) => (
            <ListItem
              button
              key={category.id}
              selected={selectedCategory === category.id}
              onClick={() => handleCategorySelect(category.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {category.icon}
              </ListItemIcon>
              <ListItemText primary={category.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          {categories.find(c => c.id === selectedCategory)?.name}
        </Typography>
        <Grid container spacing={3}>
          {filteredSoftware.map((software) => (
            <Grid item xs={12} sm={6} md={4} key={software.id}>
              <AppCard 
                {...software} 
                onCardClick={() => handleAppClick(software)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
