import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

export const AIRPORTS = [
  { code: 'YUL', city: 'Montreal' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'YVR', city: 'Vancouver' },
  { code: 'YYC', city: 'Calgary' },
  { code: 'YEG', city: 'Edmonton' },
  { code: 'YOW', city: 'Ottawa' },
  { code: 'JFK', city: 'New York (JFK)' },
  { code: 'EWR', city: 'New York (EWR)' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'MIA', city: 'Miami' },
  { code: 'LHR', city: 'London (LHR)' },
  { code: 'LGW', city: 'London (LGW)' },
  { code: 'CDG', city: 'Paris' },
  { code: 'AMS', city: 'Amsterdam' },
  { code: 'MAD', city: 'Madrid' },
  { code: 'BCN', city: 'Barcelona' },
  { code: 'FCO', city: 'Rome' },
  { code: 'MXP', city: 'Milan' },
  { code: 'FRA', city: 'Frankfurt' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'IST', city: 'Istanbul' },
  { code: 'BKK', city: 'Bangkok' },
  { code: 'NRT', city: 'Tokyo' },
  { code: 'SYD', city: 'Sydney' },
  { code: 'CMN', city: 'Casablanca' },
  { code: 'RAK', city: 'Marrakech' },
  { code: 'TNG', city: 'Tangier' },
  { code: 'FEZ', city: 'Fez' },
  { code: 'AGA', city: 'Agadir' },
  { code: 'GRU', city: 'São Paulo' },
  { code: 'MEX', city: 'Mexico City' },
  { code: 'BOG', city: 'Bogotá' },
];

interface SingleProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiple?: false;
}

interface MultiProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  multiple: true;
}

type Props = SingleProps | MultiProps;

export function AirportSelect(props: Props) {
  if (props.multiple) {
    const { label, value, onChange } = props;
    return (
      <FormControl fullWidth size="small">
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          value={value}
          onChange={e => onChange(e.target.value as string[])}
          input={<OutlinedInput label={label} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map(code => (
                <Chip key={code} label={code} size="small" sx={{ height: 20, fontSize: 12 }} />
              ))}
            </Box>
          )}
        >
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

  const { label, value, onChange } = props;
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
