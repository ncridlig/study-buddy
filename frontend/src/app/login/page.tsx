'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Import the reusable alert component
import FeedbackAlert from '@/components/FeedbackAlert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for managing the alert component
  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Try to get a specific error message from the API response
        const message = errorData.detail || 'Invalid email or password.';
        throw new Error(message);
      }

      const data = await res.json();

      // Save tokens in cookies
      Cookies.set('access_token', data.access, { expires: 1 }); // 1 day
      Cookies.set('refresh_token', data.refresh, { expires: 7 }); // 7 days

      // Show success message
      setAlertState({ open: true, message: 'Login successful! Redirecting...', severity: 'success' });

      // Redirect after a short delay to allow the user to see the message
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 1500);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setAlertState({ open: true, message: err.message, severity: 'error' });
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertState({ ...alertState, open: false });
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 12 }}>
      <FeedbackAlert
        open={alertState.open}
        message={alertState.message}
        severity={alertState.severity}
        onClose={handleCloseAlert}
      />
      <Typography variant="h4" align="center" gutterBottom>
        Log In
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 3, height: 40 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have an account?{' '}
          <MuiLink component={Link} href="/signup">
            Sign Up
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}
