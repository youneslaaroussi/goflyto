import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

export const AIRPORTS = [
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
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function AirportSelect({ label, value, onChange }: Props) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={e => onChange(e.target.value)}>
        {AIRPORTS.map(a => (
          <MenuItem key={a.code} value={a.code}>
            <Typography component="span" fontWeight={600} sx={{ mr: 1 }}>{a.code}</Typography>
            <Typography component="span" color="text.secondary" fontSize={13}>{a.city}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
