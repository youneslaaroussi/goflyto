import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#0770e3', dark: '#084eb2', light: '#e8f0fb' },
    secondary: { main: '#00a698' },
    background: { default: '#f3f6fb', paper: '#ffffff' },
    error: { main: '#d1182b' },
    text: { primary: '#111827', secondary: '#6b7280' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-1px' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, padding: '10px 24px', fontSize: 15,
          '&.MuiButton-containedPrimary': {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(7,112,227,0.35)' },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: '#fff' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px !important',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: 14,
          border: 'none',
          padding: '6px 18px',
          color: 'rgba(255,255,255,0.75)',
          '&.Mui-selected': {
            background: '#fff',
            color: '#0770e3',
            '&:hover': { background: '#f0f4ff' },
          },
          '&:hover': { background: 'rgba(255,255,255,0.12)' },
        },
      },
    },
  },
});
