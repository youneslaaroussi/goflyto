import { useState } from 'react';
import { Box, Container, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import { SearchForm } from '../components/search/SearchForm';
import { NaturalSearch } from '../components/search/NaturalSearch';
import { ErrorScreen } from '../components/errors/ErrorScreen';
import { useSearch } from '../context/SearchContext';

export function SearchScreen() {
  const { appError, setAppError } = useSearch();
  const [mode, setMode] = useState<'structured' | 'natural'>('structured');

  if (appError) return (
    <ErrorScreen
      error={appError}
      onRetry={() => setAppError(null)}
      onBack={() => setAppError(null)}
    />
  );

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #0558b8 0%, #0770e3 50%, #1a8fef 100%)',
        pb: 6,
      }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 5, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <ToggleButtonGroup
                value={mode} exclusive
                onChange={(_, v) => v && setMode(v)}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: '3px' }}
              >
                <ToggleButton value="structured" disableRipple sx={{ px: 2.5, py: 0.7, fontSize: 13 }}>
                  Search
                </ToggleButton>
                <ToggleButton value="natural" disableRipple sx={{ px: 2.5, py: 0.7, fontSize: 13 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.6 }} /> Ask AI
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 40 }, color: '#fff', mb: 1.5 }}>
              {mode === 'natural'
                ? 'Just tell us where you want to go'
                : 'The cheapest way to get there'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, mb: 4, maxWidth: 480 }}>
              {mode === 'natural'
                ? "Describe your trip in plain English — we'll find the optimal route, dates and strategy."
                : "We sweep every date combo and open-jaw route so you don't have to."}
            </Typography>

            {mode === 'natural' ? <NaturalSearch /> : <SearchForm />}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PublicIcon sx={{ fontSize: 52, color: 'primary.light', mb: 1.5 }} />
          <Typography fontWeight={600} fontSize={16} color="text.primary" mb={0.5}>
            Ready to find your flight
          </Typography>
          <Typography fontSize={14}>
            Enter your trip details above. Results will appear in the Results screen.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
