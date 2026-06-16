import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { formatDate } from '../../utils';

interface Props {
  Icon: SvgIconComponent;
  label: string;
  route: string;
  departure: string;
  stops: number;
}

export function FlightLeg({ Icon, label, route, departure, stops }: Props) {
  const parts = route.split(' → ');
  const origin = parts[0]?.split('-')[0];
  const dest = parts[parts.length - 1]?.split('-')[1];

  return (
    <Box sx={{ flex: 1, minWidth: 160 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Icon sx={{ fontSize: 13, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.disabled" fontWeight={700}
          textTransform="uppercase" letterSpacing="0.07em">
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography fontSize={22} fontWeight={700} letterSpacing="-0.5px">{origin}</Typography>

        <Box sx={{ flex: 1, textAlign: 'center', px: 0.5 }}>
          <Box sx={{ position: 'relative', height: 2, bgcolor: 'divider' }}>
            {[0, 1].map(i => (
              <Box key={i} sx={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [i === 0 ? 'left' : 'right']: 0,
                width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.disabled',
              }} />
            ))}
          </Box>
          <Typography fontSize={10} color="text.secondary" mt={0.4} fontWeight={500}>
            {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </Typography>
        </Box>

        <Typography fontSize={22} fontWeight={700} letterSpacing="-0.5px">{dest}</Typography>
      </Box>

      {departure && (
        <Typography fontSize={12} color="text.secondary" mt={0.3}>{formatDate(departure)}</Typography>
      )}
    </Box>
  );
}
