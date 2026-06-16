import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { NavDrawer } from './NavDrawer';

const DRAWER_WIDTH = 240;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar onMenuClick={() => setMobileOpen(o => !o)} drawerWidth={DRAWER_WIDTH} />
      <NavDrawer width={DRAWER_WIDTH} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Toolbar /> {/* spacer for fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}
