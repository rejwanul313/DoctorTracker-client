'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import {
  doctorCreateSchema,
  SPECIALIZATIONS,
  type DoctorCreateInput,
  type DoctorDTO,
} from '@dt/shared';
import { Icon } from '@/components/ui/Icon';
import { errorMessage } from '@/lib/apiClient';
import { applyServerErrors } from '@/lib/formErrors';
import { useToast } from '@/lib/toast';
import { useCreateDoctor, useHospitals, useUpdateDoctor } from './hooks';

const FIELDS = ['name', 'specialization', 'hospital', 'phone', 'email'] as const;

interface Props {
  open: boolean;
  doctor?: Pick<DoctorDTO, '_id' | 'name' | 'specialization' | 'hospital' | 'phone' | 'email'>;
  onClose: () => void;
  onCreated?: (doctor: DoctorDTO) => void;
}

/** Create / edit doctor. Mount with a `key` per doctor so the form resets between uses. */
export function DoctorFormDialog({ open, doctor, onClose, onCreated }: Props) {
  const isEdit = Boolean(doctor);
  const toast = useToast();
  const create = useCreateDoctor();
  const update = useUpdateDoctor(doctor?._id ?? '');
  const hospitals = useHospitals();
  const pending = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorCreateInput>({
    resolver: zodResolver(doctorCreateSchema),
    defaultValues: doctor
      ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
        }
      : { name: '', hospital: '', phone: '', email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (doctor) {
        await update.mutateAsync(values);
        toast('Doctor updated');
      } else {
        const created = await create.mutateAsync(values);
        toast(`${created.name} added`);
        onCreated?.(created);
      }
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError, FIELDS))
        toast(errorMessage(err), { severity: 'error' });
    }
  });

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="doctor-dialog-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 2 }}>
        <DialogTitle id="doctor-dialog-title" sx={{ flex: 1, pb: 1 }}>
          {isEdit ? 'Edit doctor' : 'Add doctor'}
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            All fields are required.
          </Typography>
        </DialogTitle>
        <IconButton aria-label="Close" onClick={onClose} disabled={pending} sx={{ mt: 2 }}>
          <Icon name="close" sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <form noValidate onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: '24px 16px',
              pt: 2,
            }}
          >
            <TextField
              label="Full name"
              placeholder="Dr. Tahmina Begum"
              autoFocus
              {...register('name')}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              sx={{ gridColumn: '1 / -1' }}
            />
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Specialization"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.specialization)}
                  helperText={errors.specialization?.message}
                >
                  {SPECIALIZATIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="hospital"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={hospitals.data ?? []}
                  value={field.value}
                  onInputChange={(_e, v) => field.onChange(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hospital"
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      error={Boolean(errors.hospital)}
                      helperText={errors.hospital?.message}
                    />
                  )}
                />
              )}
            />
            <TextField
              label="Phone"
              type="tel"
              placeholder="+880 1716-302877"
              {...register('phone')}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="name@hospital.com"
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={pending} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Add doctor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
