import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useNavigate } from 'react-router-dom';

interface Props {
  onMenuClick: () => void;
  drawerWidth: number;
}

export function TopBar({ onMenuClick, drawerWidth }: Props) {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        >
          <FlightTakeoffIcon color="primary" />
          <Typography fontWeight={700} fontSize={18} letterSpacing="-0.3px">GoFlyTo</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
