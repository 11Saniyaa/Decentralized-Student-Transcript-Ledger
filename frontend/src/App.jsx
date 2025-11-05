import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import Sidebar, { drawerWidth } from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import { getTheme, getRole } from './utils/storage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [themeMode, setThemeMode] = useState(getTheme());
  const [role, setRole] = useState(getRole());

  useEffect(() => {
    // Don't redirect on landing or login pages
    if (location.pathname === '/' || location.pathname === '/login') {
      return;
    }
    
    // Redirect to login if not authenticated and not on login page
    if (!role && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [role, location, navigate]);

  const handleThemeToggle = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    const { setTheme } = require('./utils/storage');
    setTheme(newTheme);
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  // Don't show layout on landing or login pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
      </ThemeProvider>
    );
  }

  // Show layout for authenticated pages
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar role={role} />
        <TopNavbar themeMode={themeMode} onThemeToggle={handleThemeToggle} role={role} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
