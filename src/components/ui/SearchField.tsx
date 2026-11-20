'use client';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { memo, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Icon } from './Icon';

type SearchFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onSearch: (value: string) => void;
  delay?: number;
};

/**
 * Keeps its own input state and only reports the value after the user pauses typing,
 * so each keystroke re-renders just this input — not the table or the page.
 */
export const SearchField = memo(function SearchField({
  value,
  onSearch,
  delay = 300,
  placeholder = 'Search…',
  ...props
}: SearchFieldProps) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, delay);
  const lastReported = useRef(value);

  // External changes (e.g. "Clear filters", back button) flow into the input.
  useEffect(() => {
    if (value !== lastReported.current) {
      lastReported.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed !== lastReported.current) {
      lastReported.current = trimmed;
      onSearch(trimmed);
    }
  }, [debounced, onSearch]);

  return (
    <TextField
      type="search"
      fullWidth
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      {...props}
      slotProps={{
        htmlInput: { 'aria-label': props.label ? undefined : placeholder, maxLength: 100 },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Icon name="search" sx={{ color: 'text.disabled', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: text ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Clear search" onClick={() => setText('')}>
                <Icon name="close" sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        '& input[type=search]::-webkit-search-cancel-button': { display: 'none' },
        ...props.sx,
      }}
    />
  );
});
