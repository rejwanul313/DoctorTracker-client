'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { layout } from '@/theme/tokens';
import { Icon } from '../ui/Icon';
import { AccountMenu } from './AccountMenu';
import { LogoMark } from './Logo';
import { SearchPalette, SearchShortcutHint } from './SearchPalette';
import { NavContent } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

/**
 * Sidebar + header shell. Sidebar is permanent from `lg` (1200px); below that it is a drawer
 * opened from the hamburger. Header holds search (⌘K), theme toggle and the account menu.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: layout.navWidth,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: (t) => `1px dashed ${t.vars.palette.divider}`,
        }}
      >
        <NavContent />
      </Box>

      <Drawer
        open={navOpen}
        onClose={closeNav}
        sx={{ display: { lg: 'none' } }}
        slotProps={{ paper: { sx: { width: 280, bgcolor: 'background.default' } } }}
      >
        <NavContent onNavigate={closeNav} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={(t) => ({
            position: 'sticky',
            top: 0,
            zIndex: t.zIndex.appBar,
            height: { xs: layout.headerHeight, lg: layout.headerHeightDesktop },
            px: { xs: 1, sm: 2, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backdropFilter: 'blur(6px)',
            backgroundColor: t.alpha(t.vars.palette.background.default, 0.8),
          })}
        >
          <IconButton
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
            sx={{ display: { lg: 'none' } }}
          >
            <Icon name="menu" />
          </IconButton>
          <Box sx={{ display: { lg: 'none' }, mr: 1 }}>
            <LogoMark size={32} />
          </Box>
          <ButtonBase
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Ctrl+K)"
            sx={{
              borderRadius: 1.5,
              p: 1,
              gap: 1,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Icon name="search" sx={{ fontSize: 20 }} />
            <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <SearchShortcutHint />
            </Box>
          </ButtonBase>
          <Box sx={{ flex: 1 }} />
          <ThemeToggle />
          <AccountMenu />
        </Box>

        <Box
          component="main"
          id="main"
          sx={{
            flex: 1,
            width: 1,
            maxWidth: layout.contentMaxWidth + 80,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 5 },
            pt: 1,
            pb: 8,
          }}
        >
          {children}
        </Box>
      </Box>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
