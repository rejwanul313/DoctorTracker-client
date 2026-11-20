import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { theme } from '@/theme';

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

/** `wrapper` (not inline JSX) so `rerender` keeps the same tree and doesn't remount. */
export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: Wrapper });
}
