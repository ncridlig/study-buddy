'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={1}
      sx={{
        px: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Brand / Logo */}
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          Study Buddy
        </Typography>

        {/* Nav buttons + theme toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" href="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" href="/login">
            Login
          </Button>
          <Button color="inherit" href="/signup">
            Sign Up
          </Button>
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
