import { useState, type FormEvent } from 'react';
import {
  Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem,
  Select, TextField, Switch, FormControlLabel, IconButton, Divider, Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import { searchStructured } from '../api';
import type { SearchResult } from '../types';

const AIRPORTS = [
  { code: 'YUL', city: 'Montreal' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'YVR', city: 'Vancouver' },
  { code: 'YYC', city: 'Calgary' },
  { code: 'CMN', city: 'Casablanca' },
  { code: 'RAK', city: 'Marrakech' },
  { code: 'TNG', city: 'Tangier' },
  { code: 'FEZ', city: 'Fez' },
  { code: 'LHR', city: 'London' },
  { code: 'CDG', city: 'Paris' },
  { code: 'MAD', city: 'Madrid' },
  { code: 'JFK', city: 'New York' },
];

interface Props {
  onResult: (r: SearchResult) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string) => void;
}

export function SearchBar({ onResult, onLoading, onError }: Props) {
  const [origin, setOrigin] = useState('YUL');
  const [destination, setDestination] = useState('CMN');
  const [depFrom, setDepFrom] = useState('2026-07-19');
  const [depTo, setDepTo] = useState('2026-07-26');
  const [minDays, setMinDays] = useState('10');
  const [maxDays, setMaxDays] = useState('21');
  const [passengers, setPassengers] = useState('1');
  const [nonstop, setNonstop] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onLoading(true);
    onError('');
    try {
      const result = await searchStructured({
        origin, destination,
        earliest_departure: depFrom,
        latest_return: depTo,
        trip_length_min_days: parseInt(minDays),
        trip_length_max_days: parseInt(maxDays),
        passengers: parseInt(passengers),
        nonstop_preferred: nonstop,
      });
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      onLoading(false);
    }
  }

  return (
    <Card elevation={6} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Row 1: Origin / Destination */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>From</InputLabel>
              <Select value={origin} label="From" onChange={e => setOrigin(e.target.value)}>
                {AIRPORTS.map(a => (
                  <MenuItem key={a.code} value={a.code}>
                    <Typography component="span" fontWeight={600} sx={{ mr: 1 }}>{a.code}</Typography>
                    <Typography component="span" color="text.secondary" fontSize={13}>{a.city}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              onClick={() => { setOrigin(destination); setDestination(origin); }}
              sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 2, p: 1, flexShrink: 0 }}
            >
              <SwapHorizIcon />
            </IconButton>

            <FormControl fullWidth size="small">
              <InputLabel>To</InputLabel>
              <Select value={destination} label="To" onChange={e => setDestination(e.target.value)}>
                {AIRPORTS.map(a => (
                  <MenuItem key={a.code} value={a.code}>
                    <Typography component="span" fontWeight={600} sx={{ mr: 1 }}>{a.code}</Typography>
                    <Typography component="span" color="text.secondary" fontSize={13}>{a.city}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Row 2: Dates + trip length + pax */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="Depart from" type="date" size="small"
              value={depFrom} onChange={e => setDepFrom(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 140px' }}
            />
            <TextField
              label="Return by" type="date" size="small"
              value={depTo} onChange={e => setDepTo(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 140px' }}
            />
            <TextField
              label="Min days" type="number" size="small"
              value={minDays} onChange={e => setMinDays(e.target.value)}
              inputProps={{ min: 3, max: 60 }} sx={{ flex: '0 1 90px' }}
            />
            <TextField
              label="Max days" type="number" size="small"
              value={maxDays} onChange={e => setMaxDays(e.target.value)}
              inputProps={{ min: 3, max: 60 }} sx={{ flex: '0 1 90px' }}
            />
            <TextField
              label="Passengers" type="number" size="small"
              value={passengers} onChange={e => setPassengers(e.target.value)}
              inputProps={{ min: 1, max: 9 }} sx={{ flex: '0 1 100px' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Row 3: Options + submit */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={nonstop} onChange={e => setNonstop(e.target.checked)} color="primary" />}
              label={<Typography fontSize={14} fontWeight={500}>Nonstop only</Typography>}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              sx={{ px: 4, borderRadius: 2.5 }}
            >
              Search flights
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
