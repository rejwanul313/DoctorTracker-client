'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { doctorsApi } from '@/features/doctors/api';
import { patientsApi } from '@/features/patients/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { queryKeys } from '@/lib/queryKeys';
import { ConditionLabel } from '../ui/Label';
import { Icon } from '../ui/Icon';
import { InitialsAvatar } from '../ui/InitialsAvatar';

interface Result {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  kind: 'Doctor' | 'Patient';
  extra?: React.ReactNode;
}

function useGlobalSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.search(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const [doctors, patients] = await Promise.all([
        doctorsApi.list({ search: q, page: 1, limit: 5 }, signal),
        patientsApi.list({ search: q, page: 1, limit: 5 }, signal),
      ]);
      const results: Result[] = [
        ...doctors.data.map((d) => ({
          id: d._id,
          href: `/doctors/${d._id}`,
          title: d.name,
          subtitle: `${d.specialization} · ${d.hospital}`,
          kind: 'Doctor' as const,
        })),
        ...patients.data.map((p) => ({
          id: p._id,
          href: p.doctor
            ? `/doctors/${p.doctor._id}`
            : `/patients?search=${encodeURIComponent(p.name)}`,
          title: p.name,
          subtitle: p.doctor ? p.doctor.name : 'Unassigned',
          kind: 'Patient' as const,
          extra: <ConditionLabel condition={p.condition} />,
        })),
      ];
      return results;
    },
  });
}

/** ⌘K / Ctrl+K quick search across doctors and patients. */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const q = useDebouncedValue(text.trim(), 250);
  const { data = [], isFetching } = useGlobalSearch(q);
  const results = useMemo(() => (q.length >= 2 ? data : []), [q, data]);

  const go = (r?: Result) => {
    if (!r) return;
    onClose();
    setText('');
    router.push(r.href);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { alignSelf: 'flex-start', mt: { xs: 2, sm: 12 }, overflow: 'hidden' } },
      }}
      aria-label="Search doctors and patients"
    >
      <InputBase
        autoFocus
        fullWidth
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
        }}
        placeholder="Search doctors and patients…"
        inputProps={{
          'aria-label': 'Search doctors and patients',
          role: 'combobox',
          'aria-expanded': results.length > 0,
          'aria-controls': 'search-results',
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter') {
            go(results[active]);
          }
        }}
        startAdornment={
          <InputAdornment position="start">
            <Icon name="search" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        }
        endAdornment={
          isFetching ? (
            <CircularProgress size={18} />
          ) : (
            <Box component="kbd" sx={kbdSx}>
              Esc
            </Box>
          )
        }
        sx={{
          px: 3,
          height: 64,
          fontSize: 16,
          borderBottom: (t) => `1px dashed ${t.vars.palette.divider}`,
        }}
      />
      <Box id="search-results" role="listbox" sx={{ maxHeight: 400, overflowY: 'auto', p: 1 }}>
        {q.length < 2 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}>
            Type at least 2 characters — names, emails or phone numbers.
          </Typography>
        ) : results.length === 0 && !isFetching ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}>
            No matches for “{q}”.
          </Typography>
        ) : (
          results.map((r, i) => (
            <ButtonBase
              key={`${r.kind}-${r.id}`}
              role="option"
              aria-selected={i === active}
              onClick={() => go(r)}
              onMouseEnter={() => setActive(i)}
              sx={{
                width: 1,
                justifyContent: 'flex-start',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                textAlign: 'left',
                bgcolor: i === active ? 'action.hover' : 'transparent',
              }}
            >
              <InitialsAvatar name={r.title} size={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {r.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                  noWrap
                  component="div"
                >
                  {r.kind} · {r.subtitle}
                </Typography>
              </Box>
              {r.extra}
            </ButtonBase>
          ))
        )}
      </Box>
    </Dialog>
  );
}

const kbdSx = {
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 600,
  px: 0.75,
  py: 0.25,
  borderRadius: 0.75,
  color: 'text.secondary',
  bgcolor: 'background.neutral',
};

export function SearchShortcutHint() {
  return (
    <Box component="kbd" sx={kbdSx}>
      ⌘K
    </Box>
  );
}
