'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CONDITIONS,
  email,
  GENDERS,
  isoDate,
  personName,
  phone,
  type PatientDTO,
} from '@dt/shared';
import { Icon } from '@/components/ui/Icon';
import { useAddDoctorPatient, useDoctorOptions } from '@/features/doctors/hooks';
import { errorMessage } from '@/lib/apiClient';
import { todayIso } from '@/lib/format';
import { applyServerErrors } from '@/lib/formErrors';
import { useToast } from '@/lib/toast';
import { useCreatePatient, useUpdatePatient } from './hooks';

dayjs.extend(utc);

/** Form-shaped version of the shared patient schema (select fields use '' for "none"). */
const formSchema = z.object({
  name: personName('Name'),
  email: z.union([email, z.literal('')]),
  phone,
  age: z
    .number({ error: 'Enter an age.' })
    .int('Age must be a whole number.')
    .min(0, 'Age must be 0 or more.')
    .max(120, 'Age must be 120 or less.'),
  gender: z.enum(GENDERS, { error: 'Choose a gender.' }),
  condition: z.enum(CONDITIONS, { error: 'Choose a condition.' }),
  doctor: z.string(),
  admittedAt: isoDate,
  notes: z.string().trim().max(1000, 'Notes must be at most 1000 characters.'),
});
type FormIn = z.input<typeof formSchema>;
type FormOut = z.output<typeof formSchema>;

const FIELDS = [
  'name',
  'email',
  'phone',
  'age',
  'gender',
  'condition',
  'doctor',
  'admittedAt',
  'notes',
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Edit mode when provided. */
  patient?: PatientDTO;
  /** "Add patient" from a doctor's page — doctor is fixed and the select is hidden. */
  fixedDoctor?: { _id: string; name: string };
}

export function PatientFormDialog({ open, onClose, patient, fixedDoctor }: Props) {
  const isEdit = Boolean(patient);
  const toast = useToast();
  const doctors = useDoctorOptions(open && !fixedDoctor);
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const addToDoctor = useAddDoctorPatient(fixedDoctor?._id ?? '');
  const pending = create.isPending || update.isPending || addToDoctor.isPending;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(formSchema),
    defaultValues: patient
      ? {
          name: patient.name,
          email: patient.email ?? '',
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
          condition: patient.condition,
          doctor: patient.doctor?._id ?? '',
          admittedAt: dayjs.utc(patient.admittedAt).format('YYYY-MM-DD'),
          notes: patient.notes ?? '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          condition: 'Stable',
          doctor: fixedDoctor?._id ?? '',
          admittedAt: todayIso(),
          notes: '',
        },
  });

  const onSubmit = handleSubmit(async ({ doctor, email: mail, notes, ...rest }) => {
    const body = { ...rest, email: mail || undefined, notes: notes || undefined };
    try {
      if (patient) {
        await update.mutateAsync({ id: patient._id, body: { ...body, doctor: doctor || null } });
        toast('Patient updated');
      } else if (fixedDoctor) {
        const created = await addToDoctor.mutateAsync(body);
        toast(`${created.name} added to ${fixedDoctor.name}'s list`);
      } else {
        const created = await create.mutateAsync({ ...body, doctor: doctor || null });
        toast(`${created.name} added`);
      }
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError, FIELDS))
        toast(errorMessage(err), { severity: 'error' });
    }
  });

  const title = isEdit ? 'Edit patient' : fixedDoctor ? 'Add patient' : 'New patient';

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="patient-dialog-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 2 }}>
        <DialogTitle id="patient-dialog-title" sx={{ flex: 1, pb: 1 }}>
          {title}
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {fixedDoctor ? `Assigned to ${fixedDoctor.name}. ` : ''}Email and notes are optional.
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
              autoFocus
              {...register('name')}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              label="Phone"
              type="tel"
              {...register('phone')}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              label="Age"
              type="number"
              {...register('age', { valueAsNumber: true })}
              error={Boolean(errors.age)}
              helperText={errors.age?.message}
              slotProps={{ htmlInput: { min: 0, max: 120, inputMode: 'numeric' } }}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Gender"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.gender)}
                  helperText={errors.gender?.message}
                >
                  {GENDERS.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Condition"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.condition)}
                  helperText={errors.condition?.message}
                >
                  {CONDITIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="admittedAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Admitted on"
                  format="DD MMM YYYY"
                  disableFuture
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) => field.onChange(d && d.isValid() ? d.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      onBlur: field.onBlur,
                      error: Boolean(errors.admittedAt),
                      helperText: errors.admittedAt ? 'Choose the admission date.' : undefined,
                    },
                  }}
                />
              )}
            />
            {!fixedDoctor && (
              <Controller
                name="doctor"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Doctor"
                    {...field}
                    error={Boolean(errors.doctor)}
                    helperText={errors.doctor?.message}
                    sx={{ gridColumn: '1 / -1' }}
                    slotProps={{
                      inputLabel: { shrink: true },
                      select: {
                        displayEmpty: true,
                        MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {/* Keep the current doctor selectable while options load. */}
                    {patient?.doctor && !doctors.data && (
                      <MenuItem value={patient.doctor._id}>{patient.doctor.name}</MenuItem>
                    )}
                    {(doctors.data ?? []).map((d) => (
                      <MenuItem key={d._id} value={d._id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            <TextField
              label="Notes"
              multiline
              minRows={2}
              {...register('notes')}
              error={Boolean(errors.notes)}
              helperText={errors.notes?.message}
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={pending} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Add patient'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
