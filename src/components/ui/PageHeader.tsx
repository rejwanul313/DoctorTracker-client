import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}

const Dot = () => (
  <Box
    component="span"
    aria-hidden
    sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
  />
);

export function PageHeader({ title, crumbs, actions }: PageHeaderProps) {
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: 2 }}>
      <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
        <Typography variant="h4" component="h1" sx={{ overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        {crumbs && (
          <Box
            component="nav"
            aria-label="Breadcrumb"
            sx={{
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              typography: 'body2',
            }}
          >
            {crumbs.map((crumb, i) => (
              <Box key={crumb.label} sx={{ display: 'contents' }}>
                {i > 0 && <Dot />}
                {crumb.href ? (
                  <MuiLink
                    component={NextLink}
                    href={crumb.href}
                    color="text.primary"
                    underline="hover"
                  >
                    {crumb.label}
                  </MuiLink>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    aria-current="page"
                    sx={{ color: 'text.disabled' }}
                  >
                    {crumb.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.5}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
