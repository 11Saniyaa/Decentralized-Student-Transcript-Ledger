import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const studentMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/student/dashboard' },
  { text: 'Transaction Log', icon: <HistoryIcon />, path: '/student/transactions' },
  { text: 'Profile', icon: <PersonIcon />, path: '/student/profile' },
];

const institutionMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/institution/dashboard' },
  { text: 'Transaction Log', icon: <HistoryIcon />, path: '/institution/transactions' },
  { text: 'Profile', icon: <PersonIcon />, path: '/institution/profile' },
];

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = role === 'student' ? studentMenuItems : institutionMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div" fontWeight={600}>
          STL
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export { drawerWidth };

