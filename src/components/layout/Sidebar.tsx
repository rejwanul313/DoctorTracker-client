'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useMe } from '@/features/auth/hooks';
import { useStatsOverview } from '@/features/dashboard/hooks';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import { Icon } from '../ui/Icon';
import { Label } from '../ui/Label';
import { Logo } from './Logo';
import { NAV_SECTIONS } from './navConfig';

function DoctorsBadge() {
  const { data } = useStatsOverview();
  if (!data) return null;
  return (
    <Label variant="filled" sx={{ ml: 'auto' }}>
      {data.totals.doctors}
    </Label>
  );
}

function UserCard() {
  const { data: user } = useMe();
  return (
    <Box sx={{ mt: 'auto', pt: 2, px: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {user ? (
        <>
          <InitialsAvatar name={user.name} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
            >
              {user.role === 'admin' ? 'Administrator' : 'Staff · read-only'}
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" />
            <Skeleton width="50%" />
          </Box>
        </>
      )}
    </Box>
  );
}

/** Sidebar contents — rendered permanently on lg+ and inside a drawer below lg. */
export const NavContent = memo(function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      aria-label="Main"
      sx={{ height: 1, display: 'flex', flexDirection: 'column', gap: 0.5, p: '16px 16px 24px' }}
    >
      <Box sx={{ px: 1.5, pt: 1, pb: 3 }}>
        <Logo />
      </Box>
      {NAV_SECTIONS.map((section) => (
        <Box
          key={section.subheader}
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.5 }}
        >
          <Typography
            component="li"
            variant="overline"
            sx={{ color: 'text.disabled', px: 1.5, pt: 2, pb: 1 }}
          >
            {section.subheader}
          </Typography>
          {section.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Box
                  component={NextLink}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minHeight: 44,
                    py: 0.5,
                    pl: 1.5,
                    pr: 1,
                    borderRadius: 1,
                    typography: 'body2',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: theme.vars.palette.text.secondary,
                    transition: theme.transitions.create(['background-color', 'color'], {
                      duration: 150,
                    }),
                    '&:hover': { bgcolor: theme.vars.palette.action.hover },
                    ...(active && {
                      fontWeight: 600,
                      color: theme.vars.palette.primary.dark,
                      bgcolor: theme.alpha(theme.vars.palette.primary.main, 0.08),
                      '&:hover': { bgcolor: theme.alpha(theme.vars.palette.primary.main, 0.16) },
                      ...theme.applyStyles('dark', { color: theme.vars.palette.primary.light }),
                    }),
                  })}
                >
                  <Icon name={item.icon} strokeWidth={1.8} sx={{ fontSize: 24 }} />
                  {item.title}
                  {item.badge === 'doctors' && <DoctorsBadge />}
                </Box>
              </li>
            );
          })}
        </Box>
      ))}
      <UserCard />
    </Box>
  );
});
