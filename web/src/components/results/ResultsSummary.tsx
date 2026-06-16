import { Box, Chip, Typography } from '@mui/material';
import type { SearchResult } from '../../types';

interface Props { result: SearchResult; }

export function ResultsSummary({ result }: Props) {
  const { offers, constraints } = result;
  const cheapest = offers[0]?.price_usd ?? 0;
  const nonstopOffers = offers.filter(o => o.stops_out === 0 && o.stops_return === 0);
  const cheapestNonstop = nonstopOffers[0]?.price_usd;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{offers.length} flights found</Typography>
        {constraints.origin && constraints.destination && (
          <Chip
            label={`${constraints.origin} → ${constraints.destination}`}
            size="small" variant="outlined"
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {cheapestNonstop && cheapestNonstop > cheapest && (
          <Chip
            label={`Nonstop from $${cheapestNonstop.toFixed(0)}`}
            size="small" color="secondary" variant="outlined"
          />
        )}
        <Typography color="text.secondary" sx={{ fontWeight: 500, fontSize: 14 }}>
          From{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 18 }}>
            ${cheapest.toFixed(0)}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
