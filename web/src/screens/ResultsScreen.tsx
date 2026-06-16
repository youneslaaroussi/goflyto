import { useState } from 'react';
import {
  Alert, Box, Button, Container, Skeleton, Stack, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { ResultsSummary } from '../components/results/ResultsSummary';
import { ResultsFilters } from '../components/results/ResultsFilters';
import { FlightCard } from '../components/results/FlightCard';
import { StrategyNotes } from '../components/results/StrategyNotes';

export function ResultsScreen() {
  const { result, loading, error } = useSearch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'nonstop'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'stops'>('price');

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Skeleton variant="rounded" height={40} sx={{ mb: 2, borderRadius: 2 }} />
      <Stack spacing={1.5}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={104} animation="wave" sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    </Container>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>Back to search</Button>
    </Container>
  );

  if (!result) return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 48, mb: 2 }}>✈️</Typography>
      <Typography fontWeight={600} fontSize={16} mb={1}>No results yet</Typography>
      <Typography fontSize={14} color="text.secondary" mb={3}>
        Run a search first to see flights here.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go to search</Button>
    </Container>
  );

  const filtered = result.offers.filter(o =>
    filter === 'all' || (o.stops_out === 0 && o.stops_return === 0)
  );
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price'
      ? a.price_usd - b.price_usd
      : (a.stops_out + a.stops_return) - (b.stops_out + b.stops_return)
  );
  const cheapest = sorted[0]?.price_usd ?? 0;

  return (
    <Box sx={{ flex: 1 }}>
      {/* Sticky subheader */}
      <Box sx={{
        position: 'sticky', top: 64, zIndex: 100,
        bgcolor: 'background.default',
        borderBottom: '1px solid', borderColor: 'divider',
        px: { xs: 2, md: 4 }, py: 1.5,
      }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            size="small" startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 1, color: 'text.secondary', textTransform: 'none' }}
          >
            New search
          </Button>
          <ResultsSummary result={result} />
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <StrategyNotes
          strategyNotes={result.strategy_notes}
          visaNotes={result.visa_notes}
        />

        <ResultsFilters
          filter={filter} sortBy={sortBy}
          onFilterChange={setFilter} onSortChange={setSortBy}
        />

        {sorted.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No flights match this filter.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {sorted.map((offer, i) => (
              <FlightCard key={offer.offer_id} offer={offer} rank={i} cheapest={cheapest} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
