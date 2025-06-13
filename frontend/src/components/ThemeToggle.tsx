'use client';

import { IconButton, useTheme, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useColorMode } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const theme = useTheme();
  const colorMode = useColorMode();

  return (
    <Tooltip title={`Switch to ${theme.palette.mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={colorMode.toggleColorMode}
        color="inherit"
        aria-label="Toggle light/dark mode"
      >
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}
