import { useState } from 'react';
import {
  Box, Container, Typography, ToggleButton, ToggleButtonGroup,
  Alert, Skeleton, Stack,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SearchBar } from './components/SearchBar';
import { NaturalSearch } from './components/NaturalSearch';
import { Results } from './components/Results';
import type { SearchResult } from './types';

export default function App() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'structured' | 'natural'>('structured');

  const handleResult = (r: SearchResult) => { setResult(r); setError(null); };
  const handleError = (e: string) => { setError(e); setResult(null); };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0558b8 0%, #0770e3 50%, #1a8fef 100%)',
        pb: 6,
      }}>
        <Container maxWidth="lg">
          {/* Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlightTakeoffIcon sx={{ color: '#fff', fontSize: 26 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: '-0.3px' }}>
                GoFlyTo
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: '3px', border: 'none' }}
            >
              <ToggleButton value="structured" disableRipple>Search</ToggleButton>
              <ToggleButton value="natural" disableRipple>
                <AutoAwesomeIcon sx={{ fontSize: 15, mr: 0.6 }} /> Ask AI
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Headline */}
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 42 }, color: '#fff', mb: 1.5 }}>
              {mode === 'natural'
                ? 'Just tell us where you want to go'
                : 'The cheapest way to get there'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 520 }}>
              {mode === 'natural'
                ? "Describe your trip in plain English — we'll find the optimal route, dates and strategy."
                : "We sweep every date combo and open-jaw route so you don't have to."}
            </Typography>
          </Box>

          {/* Search widget */}
          {mode === 'natural'
            ? <NaturalSearch onResult={handleResult} onLoading={setLoading} onError={handleError} />
            : <SearchBar onResult={handleResult} onLoading={setLoading} onError={handleError} />}
        </Container>
      </Box>

      {/* Results area */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading && <LoadingSkeleton />}
        {!loading && result && <Results result={result} />}
        {!loading && !result && !error && <EmptyState />}
      </Container>

      <Box component="footer" sx={{ textAlign: 'center', py: 3, color: 'text.secondary', fontSize: 12, borderTop: '1px solid', borderColor: 'divider' }}>
        Powered by Duffel · Prices in USD · {new Date().getFullYear()}
      </Box>
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={104} animation="wave" sx={{ borderRadius: 3 }} />
      ))}
    </Stack>
  );
}

function EmptyState() {
  return (
    <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
      <Typography sx={{ fontSize: 56, mb: 2 }}>🌍</Typography>
      <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>Ready to find your flight</Typography>
      <Typography variant="body2">Enter your trip details and we'll sweep all date combos for the best deal.</Typography>
    </Box>
  );
}
