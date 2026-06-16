import { useState } from 'react';
import {
  Box, Card, CardContent, CardActionArea, Chip, Collapse, Divider,
  Stack, ToggleButton, ToggleButtonGroup, Typography, Grid,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import BadgeIcon from '@mui/icons-material/Badge';
import type { FlightOffer, SearchResult } from '../types';
import { formatDate, formatTime } from '../utils';

interface Props { result: SearchResult; }

export function Results({ result }: Props) {
  const { offers, strategy_notes, visa_notes, constraints } = result;
  const [filter, setFilter] = useState<'all' | 'nonstop'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'stops'>('price');

  const filtered = offers.filter(o => filter === 'all' || (o.stops_out === 0 && o.stops_return === 0));
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price'
      ? a.price_usd - b.price_usd
      : (a.stops_out + a.stops_return) - (b.stops_out + b.stops_return)
  );

  const cheapest = sorted[0]?.price_usd ?? 0;
  const cheapestNonstop = offers.filter(o => o.stops_out === 0 && o.stops_return === 0)[0]?.price_usd;

  return (
    <Box>
      {/* Summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography fontWeight={700} fontSize={16}>{offers.length} flights found</Typography>
          {constraints.origin && constraints.destination && (
            <Chip label={`${constraints.origin} → ${constraints.destination}`} size="small" variant="outlined" />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {cheapestNonstop && cheapestNonstop > cheapest && (
            <Chip label={`Nonstop from $${cheapestNonstop.toFixed(0)}`} size="small" color="secondary" variant="outlined" />
          )}
          <Typography fontWeight={500} color="text.secondary" fontSize={14}>
            From <Box component="span" fontWeight={700} color="primary.main" fontSize={18}>${cheapest.toFixed(0)}</Box>
          </Typography>
        </Box>
      </Box>

      {/* Notes */}
      {(strategy_notes.length > 0 || visa_notes.length > 0) && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {strategy_notes.map((n, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
              <TipsAndUpdatesIcon sx={{ color: '#d97706', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
              <Typography fontSize={13} color="#92400e">{n}</Typography>
            </Box>
          ))}
          {visa_notes.map((n, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
              <BadgeIcon sx={{ color: '#0284c7', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
              <Typography fontSize={13} color="#0c4a6e">{n}</Typography>
            </Box>
          ))}
        </Stack>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          <ToggleButton value="all" sx={{ borderRadius: '8px !important', px: 2, textTransform: 'none', fontWeight: 500 }}>All stops</ToggleButton>
          <ToggleButton value="nonstop" sx={{ px: 2, textTransform: 'none', fontWeight: 500 }}>Nonstop only</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontSize={13} color="text.secondary">Sort:</Typography>
          <ToggleButtonGroup value={sortBy} exclusive onChange={(_, v) => v && setSortBy(v)} size="small">
            <ToggleButton value="price" sx={{ borderRadius: '8px !important', px: 2, textTransform: 'none', fontWeight: 500 }}>Price</ToggleButton>
            <ToggleButton value="stops" sx={{ px: 2, textTransform: 'none', fontWeight: 500 }}>Stops</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Cards */}
      <Stack spacing={1.2}>
        {sorted.length === 0
          ? <Typography color="text.secondary" textAlign="center" py={6}>No flights match this filter.</Typography>
          : sorted.map((offer, i) => (
            <FlightCard key={offer.offer_id} offer={offer} rank={i} cheapest={cheapest} />
          ))
        }
      </Stack>
    </Box>
  );
}

function FlightCard({ offer, rank, cheapest }: { offer: FlightOffer; rank: number; cheapest: number }) {
  const [open, setOpen] = useState(false);
  const isNonstop = offer.stops_out === 0 && offer.stops_return === 0;
  const isBest = rank === 0;
  const diff = offer.price_usd - cheapest;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1.5px solid',
        borderColor: isBest ? 'primary.main' : 'divider',
        borderRadius: 3,
        position: 'relative',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 16px rgba(7,112,227,0.12)', transform: 'translateY(-1px)' },
      }}
    >
      {isBest && (
        <Box sx={{
          position: 'absolute', top: 0, left: 20,
          bgcolor: 'primary.main', color: '#fff',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          px: 1.5, py: 0.4, borderRadius: '0 0 6px 6px', textTransform: 'uppercase',
        }}>
          Best price
        </Box>
      )}

      <CardActionArea onClick={() => setOpen(!open)} disableRipple sx={{ borderRadius: 3 }}>
        <CardContent sx={{ pt: isBest ? 3 : 2, pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Legs */}
            <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FlightLeg
                icon={<FlightTakeoffIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                label="Out"
                route={offer.outbound_route}
                departure={offer.outbound_departure}
                stops={offer.stops_out}
              />
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <FlightLeg
                icon={<FlightLandIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                label="Return"
                route={offer.return_route}
                departure={offer.return_departure}
                stops={offer.stops_return}
              />
            </Box>

            {/* Price */}
            <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
              <Typography fontSize={28} fontWeight={700} lineHeight={1} letterSpacing="-0.5px">
                ${offer.price_usd.toFixed(0)}
              </Typography>
              {diff > 0 && (
                <Typography fontSize={11} color="text.secondary">+${diff.toFixed(0)}</Typography>
              )}
              <Typography fontSize={12} color="text.secondary" mt={0.5} noWrap>
                {offer.airlines[0]}
              </Typography>
              {isNonstop && (
                <Chip label="Nonstop" size="small" color="secondary" sx={{ mt: 0.5, height: 20, fontSize: 11 }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>

      <Collapse in={open}>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Outbound</Typography>
              <Typography fontWeight={600} fontSize={14} mt={0.5}>{offer.outbound_route}</Typography>
              {offer.outbound_departure && (
                <Typography fontSize={12} color="text.secondary">{formatDate(offer.outbound_departure)} at {formatTime(offer.outbound_departure)}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Return</Typography>
              <Typography fontWeight={600} fontSize={14} mt={0.5}>{offer.return_route}</Typography>
              {offer.return_departure && (
                <Typography fontSize={12} color="text.secondary">{formatDate(offer.return_departure)} at {formatTime(offer.return_departure)}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Airlines</Typography>
              <Typography fontSize={14} fontWeight={500} mt={0.5}>{offer.airlines.join(', ')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Offer ID</Typography>
              <Typography fontSize={11} fontFamily="monospace" mt={0.5} sx={{ wordBreak: 'break-all', color: 'text.secondary' }}>{offer.offer_id}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}

function FlightLeg({ icon, label, route, departure, stops }: {
  icon: React.ReactNode; label: string; route: string; departure: string; stops: number;
}) {
  const parts = route.split(' → ');
  const origin = parts[0]?.split('-')[0];
  const dest = parts[parts.length - 1]?.split('-')[1];

  return (
    <Box sx={{ flex: 1, minWidth: 180 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {icon}
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography fontSize={22} fontWeight={700} letterSpacing="-0.5px">{origin}</Typography>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Box sx={{ height: 1.5, bgcolor: 'divider', position: 'relative', mx: 0.5 }}>
            <Box sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.disabled' }} />
            <Box sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.disabled' }} />
          </Box>
          <Typography fontSize={11} color="text.secondary" mt={0.3}>
            {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Typography fontSize={22} fontWeight={700} letterSpacing="-0.5px">{dest}</Typography>
      </Box>
      {departure && (
        <Typography fontSize={12} color="text.secondary" mt={0.3}>{formatDate(departure)}</Typography>
      )}
    </Box>
  );
}
