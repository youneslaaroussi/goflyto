import { Box, Container, Typography } from '@mui/material';
import { NaturalSearch } from '../components/search/NaturalSearch';
import { useSearch } from '../context/SearchContext';
import { Alert } from '@mui/material';

export function AiScreen() {
  const { error, loading } = useSearch();

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #5b21b6 100%)',
        pb: 6,
      }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 5, pb: 1 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 40 }, color: '#fff', mb: 1.5 }}>
              ✨ Ask AI
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, mb: 4, maxWidth: 480 }}>
              Describe your trip in plain English. Gemini extracts your constraints
              and we sweep every route and date combo to find the best deal.
            </Typography>
            <NaturalSearch />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <Alert severity="info" icon={false}>Analyzing your request and searching flights…</Alert>}
      </Container>
    </Box>
  );
}
