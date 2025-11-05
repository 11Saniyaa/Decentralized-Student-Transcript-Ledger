import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { drawerWidth } from './Sidebar';
import { clearUser, clearRole, getUser, getVerificationRequests } from '../utils/storage';

export default function TopNavbar({ themeMode, onThemeToggle, role }) {
  const navigate = useNavigate();
  const user = getUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const verificationRequests = getVerificationRequests();
  const pendingCount = verificationRequests.filter(r => r.status === 'Pending').length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearUser();
    clearRole();
    handleMenuClose();
    navigate('/login');
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Student Transcript Ledger
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Theme Toggle */}
          <Tooltip title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton onClick={onThemeToggle} color="inherit">
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          {role === 'institution' && (
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={pendingCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', cursor: 'pointer' }}
              onClick={handleMenuOpen}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen} size="small">
              <MenuIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => {
              navigate(role === 'student' ? '/student/profile' : '/institution/profile');
              handleMenuClose();
            }}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

