import { Box, CircularProgress, Container, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useSearch } from '../context/SearchContext';

export function SearchingScreen() {
  const { steps } = useSearch();
  const doneCount = steps.filter(s => s.done).length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;
  const currentStep = steps.find(s => !s.done);

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(160deg, #f0f6ff 0%, #fafafa 100%)',
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center' }}>
          {/* Animated plane icon */}
          <Box sx={{
            width: 80, height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3,
            boxShadow: '0 0 0 12px rgba(7,112,227,0.08)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { boxShadow: '0 0 0 12px rgba(7,112,227,0.08)' },
              '50%': { boxShadow: '0 0 0 20px rgba(7,112,227,0.04)' },
            },
          }}>
            <FlightTakeoffIcon color="primary" sx={{ fontSize: 36 }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Searching flights
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14, mb: 4 }}>
            {currentStep ? currentStep.label : 'Wrapping up…'}
          </Typography>

          {/* Progress bar */}
          <LinearProgress
            variant={steps.length > 0 ? 'determinate' : 'indeterminate'}
            value={progress}
            sx={{ borderRadius: 4, height: 6, mb: 3 }}
          />

          {/* Step list */}
          {steps.length > 0 && (
            <Box sx={{ textAlign: 'left', display: 'inline-block', minWidth: 260 }}>
              {steps.map((step, i) => {
                const isActive = !step.done && steps.slice(0, i).every(s => s.done);
                return (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    mb: 1.5, opacity: step.done || isActive ? 1 : 0.4,
                    transition: 'opacity 0.3s',
                  }}>
                    {step.done ? (
                      <CheckCircleIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />
                    ) : isActive ? (
                      <CircularProgress size={18} thickness={5} sx={{ flexShrink: 0 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />
                    )}
                    <Typography color={step.done ? 'text.secondary' : 'text.primary'}
                      sx={{ fontSize: 14, fontWeight: isActive ? 600 : 400, textDecoration: step.done ? 'line-through' : 'none' }}>
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {steps.length === 0 && (
            <Typography sx={{ fontSize: 13 }} color="text.disabled">Connecting to flight data…</Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
