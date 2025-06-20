'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const getPasswordStrength = (pw: string): number => {
    let strength = 0;
    if (pw.length >= 8) strength += 1;
    if (/[A-Z]/.test(pw)) strength += 1;
    if (/\d/.test(pw)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);

    const errors: { [key: string]: string } = {};

    if (!validateEmail(email)) errors.email = 'Invalid email format';
    if (!validatePassword(password))
      errors.password = 'Must be 8+ chars, include uppercase and number';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/account/api/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstname: firstName,
          lastname: lastName,
          password,
          confirm_password: confirmPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 12 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign Up
      </Typography>

      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Account created! Redirecting...
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="First Name"
          fullWidth
          required
          margin="normal"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last Name"
          fullWidth
          required
          margin="normal"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            setFieldErrors((prev) => ({
              ...prev,
              email: validateEmail(val) ? '' : 'Invalid email format',
            }));
          }}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => {
            const val = e.target.value;
            setPassword(val);
            setFieldErrors((prev) => ({
              ...prev,
              password: validatePassword(val)
                ? ''
                : 'Must be 8+ chars, include uppercase and number',
              confirmPassword:
                confirmPassword && confirmPassword !== val
                  ? 'Passwords do not match'
                  : '',
            }));
          }}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {password && (
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(getPasswordStrength(password) / 4) * 100}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: '#ddd',
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    getPasswordStrength(password) < 2
                      ? 'error.main'
                      : getPasswordStrength(password) < 4
                      ? 'warning.main'
                      : 'success.main',
                },
              }}
            />
          </Box>
        )}

        <TextField
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          margin="normal"
          value={confirmPassword}
          onChange={(e) => {
            const val = e.target.value;
            setConfirmPassword(val);
            setFieldErrors((prev) => ({
              ...prev,
              confirmPassword:
                val !== password ? 'Passwords do not match' : '',
            }));
          }}
          error={!!fieldErrors.confirmPassword}
          helperText={fieldErrors.confirmPassword}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !!fieldErrors.email ||
            !!fieldErrors.password ||
            !!fieldErrors.confirmPassword
          }
        >
          Sign Up
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <MuiLink component={Link} href="/login">
            Log In
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}
