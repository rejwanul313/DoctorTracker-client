'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useLogout, useMe } from '@/features/auth/hooks';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import { Icon } from '../ui/Icon';
import { Label } from '../ui/Label';

export function AccountMenu() {
  const { data: user } = useMe();
  const logout = useLogout();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ p: 0.5 }}
      >
        <InitialsAvatar name={user?.name ?? '?'} size={36} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 240, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
          {user && (
            <Label
              color={user.role === 'admin' ? 'primary' : 'default'}
              sx={{ mt: 1, textTransform: 'capitalize' }}
            >
              {user.role}
            </Label>
          )}
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          sx={{ color: 'error.main', my: 0.5 }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Icon name="logout" fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
