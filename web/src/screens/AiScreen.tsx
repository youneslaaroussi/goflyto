import { Box, Container, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { NaturalSearch } from '../components/search/NaturalSearch';
import { ErrorScreen } from '../components/errors/ErrorScreen';
import { useSearch } from '../context/SearchContext';

export function AiScreen() {
  const { appError, setAppError } = useSearch();

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
        background: 'linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #5b21b6 100%)',
        pb: 6,
      }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 5, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <AutoAwesomeIcon sx={{ color: '#c084fc', fontSize: 32 }} />
              <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 40 }, color: '#fff' }}>
                Ask AI
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, mb: 4, maxWidth: 480 }}>
              Describe your trip in plain English. Gemini extracts your constraints
              and we sweep every route and date combo to find the best deal.
            </Typography>
            <NaturalSearch />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
