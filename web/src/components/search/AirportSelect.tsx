import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

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
            <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>{a.code}</Box>
            <Box component="span" sx={{ color: 'text.secondary', fontSize: 13 }}>{a.city}</Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
