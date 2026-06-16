import { Box, Stack, Typography } from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import BadgeIcon from '@mui/icons-material/Badge';

interface Props {
  strategyNotes: string[];
  visaNotes: string[];
}

export function StrategyNotes({ strategyNotes, visaNotes }: Props) {
  if (strategyNotes.length === 0 && visaNotes.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mb: 2.5 }}>
      {strategyNotes.map((n, i) => (
        <Box key={i} sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1,
          p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a',
        }}>
          <TipsAndUpdatesIcon sx={{ color: '#d97706', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
          <Typography fontSize={13} color="#92400e">{n}</Typography>
        </Box>
      ))}
      {visaNotes.map((n, i) => (
        <Box key={i} sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1,
          p: 1.5, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd',
        }}>
          <BadgeIcon sx={{ color: '#0284c7', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
          <Typography fontSize={13} color="#0c4a6e">{n}</Typography>
        </Box>
      ))}
    </Stack>
  );
}
