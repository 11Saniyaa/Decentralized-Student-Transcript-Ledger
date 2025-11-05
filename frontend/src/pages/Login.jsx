import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { authAPI } from '../utils/api';
import { setUser, setRole } from '../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';
  
  const [role, setRoleState] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRoleState(initialRole);
  }, [initialRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Use identifier or generate a default one
    const finalIdentifier = identifier.trim() || (role === 'student' ? 'STU2024001' : 'Tech University');

    // Demo mode: Login always succeeds, no backend validation needed
    // Try backend first, but fallback to localStorage-only if backend fails
    try {
      // Add timeout to prevent hanging
      const loginPromise = authAPI.login({
        role,
        identifier: finalIdentifier,
        password: password || 'demo', // Any password accepted
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );

      const response = await Promise.race([loginPromise, timeoutPromise]);

      if (response.data.success) {
        // Store in localStorage
        setUser({
          role,
          identifier: finalIdentifier,
          name: role === 'student' ? `Student ${finalIdentifier}` : finalIdentifier,
        });
        setRole(role);

        // Navigate based on role
        if (role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/institution/dashboard');
        }
        setLoading(false);
        return;
      }
    } catch (error) {
      // Backend failed or timeout, but continue anyway - demo mode
      console.warn('Backend login failed, using localStorage-only mode:', error.message);
    }

    // Fallback: Login succeeds anyway using only localStorage
    // Store in localStorage
    setUser({
      role,
      identifier: finalIdentifier,
      name: role === 'student' ? `Student ${finalIdentifier}` : finalIdentifier,
    });
    setRole(role);

    // Navigate based on role
    if (role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/institution/dashboard');
    }
    
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setRoleState(newValue === 0 ? 'student' : 'institution');
    setIdentifier('');
    setPassword('');
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b57d0 0%, #1976d2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {role === 'student' ? (
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              ) : (
                <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              )}
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                {role === 'student' ? 'Student Login' : 'Institution Login'}
              </Typography>
            </Box>

            <Tabs
              value={role === 'student' ? 0 : 1}
              onChange={handleTabChange}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab label="Student" icon={<SchoolIcon />} iconPosition="start" />
              <Tab label="Institution" icon={<BusinessIcon />} iconPosition="start" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label={role === 'student' ? 'PRN or Wallet ID (Optional)' : 'Institution Name (Optional)'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === 'student' ? 'STU2024001 or 0x... (leave empty for demo)' : 'Tech University (leave empty for demo)'}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password (Optional)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any password (no validation) - Can leave empty"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Typography variant="body2" color="text.secondary" align="center">
                Demo Mode: Login works without backend. Leave fields empty for quick login.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
