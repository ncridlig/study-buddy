'use client';

import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        color="primary"
        elevation={1}
        sx={{
          px: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
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

          {/* Desktop View */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button key={item.href} color="inherit" href={item.href}>
                  {item.label}
                </Button>
              ))}
              <ThemeToggle />
            </Box>
          ) : (
            // Mobile View: Hamburger Menu
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ThemeToggle />
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
