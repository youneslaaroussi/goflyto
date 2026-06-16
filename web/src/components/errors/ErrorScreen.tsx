import { Box, Button, Container, Typography } from '@mui/material';
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import type { SvgIconComponent } from '@mui/icons-material';
import type { AppError, AppErrorCode } from '../../errors';

interface Props {
  error: AppError;
  onRetry?: () => void;
  onBack?: () => void;
}

const CONFIG: Record<AppErrorCode, { Icon: SvgIconComponent; color: string; bgColor: string }> = {
  NO_FLIGHTS_FOUND: { Icon: AirplanemodeInactiveIcon, color: '#0770e3', bgColor: '#e8f0fb' },
  NETWORK_OFFLINE:  { Icon: WifiOffIcon,         color: '#b45309', bgColor: '#fef3c7' },
  SEARCH_TIMEOUT:   { Icon: TimerOffIcon,        color: '#7c3aed', bgColor: '#ede9fe' },
  AI_PARSE_FAILED:  { Icon: PsychologyAltIcon,   color: '#0770e3', bgColor: '#e8f0fb' },
  INVALID_ROUTE:    { Icon: SearchOffIcon,       color: '#b45309', bgColor: '#fef3c7' },
  SERVICE_UNAVAILABLE: { Icon: CloudOffIcon,     color: '#b91c1c', bgColor: '#fee2e2' },
  UNKNOWN:          { Icon: HelpOutlineIcon,     color: '#374151', bgColor: '#f3f4f6' },
};

export function ErrorScreen({ error, onRetry, onBack }: Props) {
  const { Icon, color, bgColor } = CONFIG[error.code] ?? CONFIG.UNKNOWN;

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      bgcolor: 'background.default',
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3,
          }}>
            <Icon sx={{ fontSize: 38, color }} />
          </Box>

          <Typography variant="h6" fontWeight={700} mb={1}>
            {error.message}
          </Typography>

          <Typography fontSize={14} color="text.secondary" mb={4} lineHeight={1.7}>
            {error.hint}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {error.retryable && onRetry && (
              <Button variant="contained" onClick={onRetry}>
                Try again
              </Button>
            )}
            {onBack && (
              <Button variant="outlined" onClick={onBack}>
                Edit search
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
