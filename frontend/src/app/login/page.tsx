'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    // TODO: send to API
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 12 }}>
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
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Log In
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don not have an account?{' '}
          <MuiLink component={Link} href="/signup">
            Sign Up
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}
