import { useState, type KeyboardEvent } from 'react';
import { Box, Card, CardContent, TextField, Button, Stack, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { searchNatural } from '../api';
import type { SearchResult } from '../types';

const EXAMPLES = [
  "Montreal to Morocco late July, 2 weeks",
  "Cheapest YYZ to Marrakech, mid-July, 10-15 days, nonstop preferred",
  "YUL to CMN or RAK, depart July 19, back before Aug 10",
];

interface Props {
  onResult: (r: SearchResult) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string) => void;
}

export function NaturalSearch({ onResult, onLoading, onError }: Props) {
  const [message, setMessage] = useState('');

  async function submit() {
    if (!message.trim()) return;
    onLoading(true);
    onError('');
    try {
      onResult(await searchNatural(message.trim()));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      onLoading(false);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <Stack spacing={1.5}>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TextField
            fullWidth multiline rows={3} autoFocus
            placeholder="e.g. I want to fly from Montreal to Morocco in late July for about 2 weeks..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKey}
            variant="outlined"
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
              startIcon={<AutoAwesomeIcon />}
              sx={{ borderRadius: 2 }}
            >
              Find flights
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Example prompts */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {EXAMPLES.map(ex => (
          <Chip
            key={ex} label={ex} onClick={() => setMessage(ex)} clickable
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
