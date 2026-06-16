import { useState, type FormEvent } from 'react';
import {
  Box, Button, Card, CardContent, Divider,
  FormControlLabel, IconButton, Switch, TextField, Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import { AirportSelect } from './AirportSelect';
import { searchStructured } from '../../api';
import { useSearch } from '../../context/SearchContext';
import { useNavigate } from 'react-router-dom';

export function SearchForm() {
  const { setResult, setLoading, setError } = useSearch();
  const navigate = useNavigate();

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
    setLoading(true);
    setError(null);
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
      setResult(result);
      navigate('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Origin / Destination */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
            <AirportSelect label="From" value={origin} onChange={setOrigin} />
            <IconButton
              onClick={() => { setOrigin(destination); setDestination(origin); }}
              sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 2, p: 1, flexShrink: 0 }}
            >
              <SwapHorizIcon />
            </IconButton>
            <AirportSelect label="To" value={destination} onChange={setDestination} />
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Date range + trip length */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
            <TextField label="Depart from" type="date" size="small"
              value={depFrom} onChange={e => setDepFrom(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 140px' }} />
            <TextField label="Return by" type="date" size="small"
              value={depTo} onChange={e => setDepTo(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 140px' }} />
            <TextField label="Min days" type="number" size="small"
              value={minDays} onChange={e => setMinDays(e.target.value)}
              inputProps={{ min: 3, max: 60 }} sx={{ flex: '0 1 90px' }} />
            <TextField label="Max days" type="number" size="small"
              value={maxDays} onChange={e => setMaxDays(e.target.value)}
              inputProps={{ min: 3, max: 60 }} sx={{ flex: '0 1 90px' }} />
            <TextField label="Passengers" type="number" size="small"
              value={passengers} onChange={e => setPassengers(e.target.value)}
              inputProps={{ min: 1, max: 9 }} sx={{ flex: '0 1 100px' }} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={nonstop} onChange={e => setNonstop(e.target.checked)} color="primary" />}
              label={<Typography fontSize={14} fontWeight={500}>Nonstop only</Typography>}
            />
            <Button type="submit" variant="contained" size="large" startIcon={<SearchIcon />} sx={{ px: 4 }}>
              Search flights
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
