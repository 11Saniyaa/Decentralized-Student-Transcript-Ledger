import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { getUser, getRole } from '../utils/storage';

export default function Profile() {
  const user = getUser();
  const role = getRole();

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No user data found. Please login again.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View your account information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: 48,
                }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                {user.name}
              </Typography>
              <Chip
                label={role === 'student' ? 'Student' : 'Institution'}
                color="primary"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Account Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {role === 'student' ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Student ID
                      </Typography>
                      <Typography variant="body1">{user.studentId || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Institution
                      </Typography>
                      <Typography variant="body1">{user.institution || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body1">{user.department || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Degree
                      </Typography>
                      <Typography variant="body1">{user.degree || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Institution Type
                      </Typography>
                      <Typography variant="body1">{user.type || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">{user.address || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

