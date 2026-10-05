import { createTheme } from '@mui/material/styles';

export function buildTheme(mode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#60a5fa' : '#1d4ed8' },
      secondary: { main: '#f59e0b' },
      success: { main: '#16a34a' },
      warning: { main: '#f59e0b' },
      error: { main: '#dc2626' },
      background: dark
        ? { default: '#0b1220', paper: '#131c2e' }
        : { default: '#f1f5f9', paper: '#ffffff' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: "'Inter','Segoe UI',Roboto,sans-serif",
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: dark ? 'none' : '0 1px 3px rgba(15,23,42,.08), 0 4px 14px rgba(15,23,42,.05)',
            border: dark ? '1px solid rgba(148,163,184,.14)' : '1px solid rgba(148,163,184,.18)',
          },
        },
      },
      MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8 }, bar: { borderRadius: 8, transition: 'transform 1s cubic-bezier(.2,.7,.2,1)' } } },
      MuiDialog: { defaultProps: { PaperProps: { sx: { borderRadius: 3 } } } },
    },
  });
}
