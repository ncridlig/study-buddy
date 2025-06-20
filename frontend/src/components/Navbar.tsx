'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ThemeToggle from './ThemeToggle';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Detects route changes

  // ✅ Re-check login status on every route change
  useEffect(() => {
    const token = Cookies.get('access_token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setIsLoggedIn(false);
    handleMenuClose();
    router.push('/login');
  };

  const renderAuthButtons = () =>
    isLoggedIn ? (
      <>
        <IconButton onClick={handleMenuClick} color="inherit">
          <Avatar sx={{ width: 32, height: 32 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              router.push('/dashboard');
              handleMenuClose();
            }}
          >
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleLogout}>Log Out</MenuItem>
        </Menu>
      </>
    ) : (
      <>
        <Button color="inherit" href="/login">
          Login
        </Button>
        <Button color="inherit" href="/signup">
          Sign Up
        </Button>
      </>
    );

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

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderAuthButtons()}
              <ThemeToggle />
            </Box>
          ) : (
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

      {/* Drawer for mobile view */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {isLoggedIn ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      router.push('/dashboard');
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleLogout();
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemText primary="Log Out" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/signup"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
