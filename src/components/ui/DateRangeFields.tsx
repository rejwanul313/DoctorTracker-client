'use client';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { memo } from 'react';

dayjs.extend(utc);

interface DateRangeFieldsProps {
  fromLabel: string;
  toLabel: string;
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
}

const fieldSx = { width: { xs: '100%', sm: 180 } };

const toIso = (d: Dayjs | null) => (d && d.isValid() ? d.format('YYYY-MM-DD') : undefined);
const fromIso = (s?: string) => (s ? dayjs(s) : null);

/** Two date pickers writing `YYYY-MM-DD`; "to" can't be before "from". */
export const DateRangeFields = memo(function DateRangeFields({
  fromLabel,
  toLabel,
  from,
  to,
  onChange,
}: DateRangeFieldsProps) {
  const fromValue = fromIso(from);
  const toValue = fromIso(to);
  return (
    <>
      <DatePicker
        label={fromLabel}
        value={fromValue}
        format="DD MMM YYYY"
        maxDate={toValue ?? undefined}
        onChange={(d) => {
          const iso = toIso(d);
          if (iso !== undefined || d === null) onChange({ from: iso, to });
        }}
        slotProps={{ field: { clearable: true }, textField: { sx: fieldSx } }}
      />
      <DatePicker
        label={toLabel}
        value={toValue}
        format="DD MMM YYYY"
        minDate={fromValue ?? undefined}
        onChange={(d) => {
          const iso = toIso(d);
          if (iso !== undefined || d === null) onChange({ from, to: iso });
        }}
        slotProps={{ field: { clearable: true }, textField: { sx: fieldSx } }}
      />
    </>
  );
});
