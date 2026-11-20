'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CONDITIONS, loginSchema, type LoginInput } from '@dt/shared';
import { Logo } from '@/components/layout/Logo';
import { Icon } from '@/components/ui/Icon';
import { ConditionLabel } from '@/components/ui/Label';
import { ApiError, errorMessage } from '@/lib/apiClient';
import { useLogin } from './hooks';

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/login'))
    return '/dashboard';
  return next;
}

function BrandPanel() {
  return (
    <Box
      component="section"
      aria-hidden
      sx={{
        flex: '1 1 480px',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
        p: '64px 64px 40px',
        bgcolor: 'background.neutral',
      }}
    >
      <Logo prefetch={false} />
      <Box sx={{ maxWidth: 480 }}>
        <Typography variant="h2" component="p" sx={{ lineHeight: 1.17 }}>
          Every doctor. Every patient. One place.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 2 }}>
          Assign patients, follow their condition and see the numbers that matter.
        </Typography>
      </Box>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2, maxWidth: 520 }}>
        <Card sx={{ flex: '1 1 220px', p: 2.5 }}>
          <Typography variant="subtitle2">Patients this year</Typography>
          <svg width="100%" height="56" viewBox="0 0 200 48" preserveAspectRatio="none">
            <path
              d="M0 40 C30 38 40 30 70 28 C100 26 110 18 140 14 C165 11 180 8 200 4 L200 48 L0 48Z"
              fill="rgba(0,167,111,0.16)"
            />
            <path
              d="M0 40 C30 38 40 30 70 28 C100 26 110 18 140 14 C165 11 180 8 200 4"
              fill="none"
              stroke="#00a76f"
              strokeWidth="3"
            />
          </svg>
        </Card>
        <Card sx={{ flex: '1 1 200px', p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Condition
          </Typography>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
            {CONDITIONS.map((c) => (
              <ConditionLabel key={c} condition={c} />
            ))}
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

export function LoginView() {
  const params = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // The API may sleep when idle (free hosting tiers). Wake it while the user types, so sign-in
  // doesn't pay the cold start. Fire-and-forget: failures surface on submit as usual.
  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_EMAIL ?? '', password: DEMO_PASSWORD ?? '' },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      // Full navigation, not router.replace: the router may hold prefetched responses from before
      // sign-in (redirects to /login), and the proxy must see the new cookie.
      onSuccess: () => window.location.assign(safeNext(params.get('next'))),
    }),
  );

  const formError =
    login.error instanceof ApiError && login.error.status === 401
      ? login.error.message
      : login.error
        ? errorMessage(login.error)
        : null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
      <BrandPanel />
      <Box
        component="main"
        sx={{
          flex: '1 1 480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 8,
        }}
      >
        <Stack
          component="form"
          noValidate
          onSubmit={onSubmit}
          spacing={3}
          sx={{ width: 1, maxWidth: 420 }}
        >
          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <Logo prefetch={false} />
          </Box>
          <div>
            <Typography variant="h5" component="h1">
              Sign in to your account
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Only invited staff can sign in. Ask an admin for access.
            </Typography>
          </div>

          {DEMO_EMAIL && (
            <Alert severity="info" icon={<Icon name="info" />}>
              Demo access: <strong>{DEMO_EMAIL}</strong>
              {DEMO_PASSWORD && (
                <>
                  {' '}
                  · password <strong>{DEMO_PASSWORD}</strong>
                </>
              )}
            </Alert>
          )}

          {formError && (
            <Alert severity="error" role="alert">
              {formError}
            </Alert>
          )}

          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            autoFocus={!DEMO_EMAIL}
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} sx={{ fontSize: 20 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="inherit"
            size="large"
            fullWidth
            loading={login.isPending}
          >
            Sign in
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Sessions use a secure, http-only cookie and expire after 7 days.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
