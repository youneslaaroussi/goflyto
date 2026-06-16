import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface Props {
  filter: 'all' | 'nonstop';
  sortBy: 'price' | 'stops';
  onFilterChange: (v: 'all' | 'nonstop') => void;
  onSortChange: (v: 'price' | 'stops') => void;
}

const tbSx = {
  px: 2,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  borderRadius: '8px !important',
  border: '1.5px solid',
  borderColor: 'divider',
  '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', borderColor: 'primary.main' },
  '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
};

export function ResultsFilters({ filter, sortBy, onFilterChange, onSortChange }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
      <ToggleButtonGroup
        value={filter} exclusive size="small"
        onChange={(_, v) => v && onFilterChange(v)}
      >
        <ToggleButton value="all" sx={tbSx}>All stops</ToggleButton>
        <ToggleButton value="nonstop" sx={tbSx}>Nonstop only</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography fontSize={13} color="text.secondary">Sort:</Typography>
        <ToggleButtonGroup
          value={sortBy} exclusive size="small"
          onChange={(_, v) => v && onSortChange(v)}
        >
          <ToggleButton value="price" sx={tbSx}>Price</ToggleButton>
          <ToggleButton value="stops" sx={tbSx}>Stops</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
