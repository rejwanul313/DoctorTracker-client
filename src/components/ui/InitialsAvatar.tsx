import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import { memo } from 'react';
import { initials } from '@/lib/format';

const TONES = ['primary', 'info', 'warning', 'secondary', 'error'] as const;

/** Stable color per name, so the same person always gets the same avatar tint. */
function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length]!;
}

interface Props extends AvatarProps {
  name: string;
  size?: number;
}

export const InitialsAvatar = memo(function InitialsAvatar({
  name,
  size = 40,
  sx,
  ...props
}: Props) {
  const tone = toneFor(name);
  return (
    <Avatar
      alt=""
      {...props}
      sx={[
        (theme) => ({
          width: size,
          height: size,
          fontSize: size >= 64 ? 22 : 14,
          color: theme.vars.palette[tone].dark,
          bgcolor: theme.alpha(theme.vars.palette[tone].main, 0.16),
          ...theme.applyStyles('dark', { color: theme.vars.palette[tone].light }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials(name)}
    </Avatar>
  );
});
