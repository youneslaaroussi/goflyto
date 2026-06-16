import { useState } from 'react';
import {
  Box, Card, CardActionArea, CardContent, Chip, Collapse,
  Divider, Grid, Typography,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FlightLeg } from './FlightLeg';
import type { FlightOffer } from '../../types';
import { formatDate, formatTime } from '../../utils';

interface Props {
  offer: FlightOffer;
  rank: number;
  cheapest: number;
}

export function FlightCard({ offer, rank, cheapest }: Props) {
  const [open, setOpen] = useState(false);
  const isNonstop = offer.stops_out === 0 && offer.stops_return === 0;
  const isBest = rank === 0;
  const diff = offer.price_usd - cheapest;

  return (
    <Card elevation={0} sx={{
      border: '1.5px solid',
      borderColor: isBest ? 'primary.main' : 'divider',
      borderRadius: 3,
      position: 'relative',
      transition: 'box-shadow 0.15s, transform 0.15s, border-color 0.15s',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: '0 4px 16px rgba(7,112,227,0.12)',
        transform: 'translateY(-1px)',
      },
    }}>
      {isBest && (
        <Box sx={{
          position: 'absolute', top: 0, left: 20,
          bgcolor: 'primary.main', color: '#fff',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
          px: 1.5, py: 0.4, borderRadius: '0 0 6px 6px', textTransform: 'uppercase',
        }}>
          Best price
        </Box>
      )}

      <CardActionArea onClick={() => setOpen(o => !o)} disableRipple sx={{ borderRadius: 3 }}>
        <CardContent sx={{ pt: isBest ? 3 : 2, pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Legs */}
            <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FlightLeg
                Icon={FlightTakeoffIcon} label="Out"
                route={offer.outbound_route} departure={offer.outbound_departure}
                stops={offer.stops_out}
              />
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, mx: 1 }} />
              <FlightLeg
                Icon={FlightLandIcon} label="Return"
                route={offer.return_route} departure={offer.return_departure}
                stops={offer.stops_return}
              />
            </Box>

            {/* Price */}
            <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                ${offer.price_usd.toFixed(0)}
              </Typography>
              {diff > 0 && (
                <Typography color="text.disabled" sx={{ fontSize: 11 }}>+${diff.toFixed(0)}</Typography>
              )}
              <Typography color="text.secondary" noWrap sx={{ fontSize: 12, mt: 0.5 }}>
                {offer.airlines[0]}
              </Typography>
              {isNonstop && (
                <Chip label="Nonstop" size="small" color="secondary"
                  sx={{ mt: 0.5, height: 20, fontSize: 11 }} />
              )}
            </Box>

            {open ? <ExpandLessIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                  : <ExpandMoreIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />}
          </Box>
        </CardContent>
      </CardActionArea>

      <Collapse in={open}>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {[
              { label: 'Outbound', val: offer.outbound_route, sub: offer.outbound_departure ? `${formatDate(offer.outbound_departure)} at ${formatTime(offer.outbound_departure)}` : '' },
              { label: 'Return', val: offer.return_route, sub: offer.return_departure ? `${formatDate(offer.return_departure)} at ${formatTime(offer.return_departure)}` : '' },
              { label: 'Airlines', val: offer.airlines.join(', '), sub: '' },
              { label: 'Offer ID', val: offer.offer_id, mono: true, sub: '' },
            ].map(({ label, val, sub, mono }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={label}>
                <Typography variant="caption" color="text.disabled"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </Typography>
                <Typography sx={{
                  fontSize: 13, fontWeight: 500, mt: 0.5,
                  fontFamily: mono ? 'monospace' : undefined,
                  ...(mono ? { wordBreak: 'break-all', color: 'text.secondary' } : {}),
                }}>
                  {val}
                </Typography>
                {sub && <Typography color="text.secondary" sx={{ fontSize: 12 }}>{sub}</Typography>}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}
