import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Blue
      },
      secondary: {
        main: '#7c4dff', // Purple
      },
      background: {
        default: mode === 'light' ? '#f9f9f9' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1a1a1a' : '#f5f5f5',
        secondary: mode === 'light' ? '#4f4f4f' : '#cccccc',
      },
    },
    typography: {
      fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });
