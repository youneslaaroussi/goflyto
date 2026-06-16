import { useState, type KeyboardEvent } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { searchNatural } from '../../api';
import { useSearch } from '../../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const EXAMPLES = [
  'Montreal to Morocco late July, 2 weeks',
  'Cheapest YYZ to Marrakech, mid-July, 10–15 days, nonstop',
  'YUL to CMN or RAK, depart July 19, back before Aug 10',
];

export function NaturalSearch() {
  const { setResult, setLoading, setError } = useSearch();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchNatural(message.trim());
      setResult(result);
      navigate('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <Stack spacing={1.5}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TextField
            fullWidth multiline rows={3} autoFocus
            placeholder="e.g. I want to fly from Montreal to Morocco in late July for about 2 weeks..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKey}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px 12px 0 0',
                fontSize: 16,
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider',
          }}>
            <Typography variant="caption" color="text.secondary">
              Enter to search · Shift+Enter for new line
            </Typography>
            <Button
              variant="contained" onClick={submit} disabled={!message.trim()}
              startIcon={<AutoAwesomeIcon />} sx={{ borderRadius: 2 }}
            >
              Find flights
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {EXAMPLES.map(ex => (
          <Chip key={ex} label={ex} onClick={() => setMessage(ex)} clickable
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 12,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
