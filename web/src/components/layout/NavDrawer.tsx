import {
  Box, Divider, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Chip,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';

interface Props {
  width: number;
  mobileOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Search', icon: <SearchIcon />, path: '/' },
  { label: 'Results', icon: <ListAltIcon />, path: '/results', requiresResult: true },
  { label: 'Ask AI', icon: <AutoAwesomeIcon />, path: '/ai' },
];

function DrawerContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = useSearch();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FlightTakeoffIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize={16} letterSpacing="-0.3px" lineHeight={1}>GoFlyTo</Typography>
          <Typography fontSize={11} color="text.secondary">Flight Optimizer</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        <Typography variant="overline" sx={{ px: 1, color: 'text.disabled', fontSize: 10 }}>
          Navigation
        </Typography>
        {NAV_ITEMS.map(item => {
          const disabled = item.requiresResult && !result;
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                disabled={disabled}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'primary.light' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  '&:hover': { bgcolor: active ? 'primary.light' : 'action.hover' },
                  '& .MuiListItemIcon-root': { color: active ? 'primary.main' : 'text.secondary', minWidth: 38 },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                />
                {item.requiresResult && result && (
                  <Chip
                    label={result.offers.length}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: 11 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <TrendingDownIcon sx={{ color: 'primary.main', fontSize: 16 }} />
            <Typography fontSize={12} fontWeight={600} color="primary.main">Pro tip</Typography>
          </Box>
          <Typography fontSize={11} color="text.secondary" lineHeight={1.5}>
            Open-jaw routing (fly into one city, out of another) often saves 10–20%.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function NavDrawer({ width, mobileOpen, onClose }: Props) {
  const drawerSx = { width, flexShrink: 0, '& .MuiDrawer-paper': { width, boxSizing: 'border-box', border: 'none', borderRight: '1px solid', borderColor: 'divider' } };

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }}>
      {/* Mobile */}
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, ...drawerSx }}
      >
        <DrawerContent />
      </Drawer>

      {/* Desktop */}
      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, ...drawerSx }}
        open
      >
        <DrawerContent />
      </Drawer>
    </Box>
  );
}
