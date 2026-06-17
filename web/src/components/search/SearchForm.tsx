import { useState, type FormEvent } from 'react';
import {
  Box, Button, Card, CardContent, Divider,
  FormControlLabel, Switch, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AirportSelect } from './AirportSelect';
import { searchStructured } from '../../api';
import { useSearch } from '../../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { runWithSteps } from '../../searchSteps';

export function SearchForm() {
  const ctx = useSearch();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('YUL');
  const [destinations, setDestinations] = useState<string[]>(['CMN']);
  const [depFrom, setDepFrom] = useState('2026-07-19');
  const [depTo, setDepTo] = useState('2026-07-26');
  const [minDays, setMinDays] = useState('10');
  const [maxDays, setMaxDays] = useState('21');
  const [passengers, setPassengers] = useState('1');
  const [nonstop, setNonstop] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!destinations.length) return;
    navigate('/searching');
    await runWithSteps(ctx, () => searchStructured({
      origin,
      destination: destinations[0],
      destination_airports: destinations,
      earliest_departure: depFrom,
      latest_departure: depTo,
      latest_return: depTo,
      trip_length_min_days: parseInt(minDays),
      trip_length_max_days: parseInt(maxDays),
      passengers: parseInt(passengers),
      nonstop_preferred: nonstop,
    }));
    navigate(ctx.appError ? '/' : '/results');
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <AirportSelect label="From" value={origin} onChange={setOrigin} />
            </Box>
            <Box sx={{ flex: 2 }}>
              <AirportSelect
                label="To (select one or more)"
                value={destinations}
                onChange={setDestinations}
                multiple
              />
            </Box>
          </Box>

          {destinations.length > 1 && (
            <Typography color="text.secondary" sx={{ fontSize: 12, mb: 2, mt: -1.5 }}>
              We'll search all selected airports and open-jaw combinations.
            </Typography>
          )}

          <Divider sx={{ mb: 2.5 }} />

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
            <TextField label="Depart from" type="date" size="small"
              value={depFrom} onChange={e => setDepFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: '1 1 140px' }} />
            <TextField label="Depart by" type="date" size="small"
              value={depTo} onChange={e => setDepTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: '1 1 140px' }} />
            <TextField label="Min days" type="number" size="small"
              value={minDays} onChange={e => setMinDays(e.target.value)}
              slotProps={{ htmlInput: { min: 3, max: 60 } }} sx={{ flex: '0 1 90px' }} />
            <TextField label="Max days" type="number" size="small"
              value={maxDays} onChange={e => setMaxDays(e.target.value)}
              slotProps={{ htmlInput: { min: 3, max: 60 } }} sx={{ flex: '0 1 90px' }} />
            <TextField label="Passengers" type="number" size="small"
              value={passengers} onChange={e => setPassengers(e.target.value)}
              slotProps={{ htmlInput: { min: 1, max: 9 } }} sx={{ flex: '0 1 100px' }} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={nonstop} onChange={e => setNonstop(e.target.checked)} color="primary" />}
              label={<Typography sx={{ fontSize: 14, fontWeight: 500 }}>Nonstop only</Typography>}
            />
            <Button
              type="submit" variant="contained" size="large"
              startIcon={<SearchIcon />} sx={{ px: 4 }}
              disabled={!destinations.length}
            >
              Search flights
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
