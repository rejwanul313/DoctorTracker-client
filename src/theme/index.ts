'use client';

import { createTheme, type Components, type Theme } from '@mui/material/styles';
import { fonts, greyAlpha, palette } from './tokens';

const shadows = {
  card: `0 0 2px 0 ${greyAlpha(0.2)}, 0 12px 24px -4px ${greyAlpha(0.12)}`,
  cardDark: '0 0 2px 0 rgba(0, 0, 0, 0.2), 0 12px 24px -4px rgba(0, 0, 0, 0.12)',
  dropdown: `0 0 2px 0 ${greyAlpha(0.24)}, -20px 20px 40px -4px ${greyAlpha(0.24)}`,
  dropdownDark: '0 0 2px 0 rgba(0, 0, 0, 0.24), -20px 20px 40px -4px rgba(0, 0, 0, 0.24)',
  dialog: '-40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
  primary: '0 8px 16px 0 rgba(0, 167, 111, 0.24)',
};

const SOFT_COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
      'a:focus-visible, button:focus-visible': {
        outline: `2px solid ${palette.primary.main}`,
        outlineOffset: 2,
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 700, textTransform: 'none', lineHeight: 1.715 },
      sizeSmall: { height: 30, fontSize: 13, padding: '4px 8px' },
      sizeMedium: { height: 36, padding: '6px 12px' },
      sizeLarge: { height: 48, fontSize: 15, padding: '8px 16px' },
      outlined: ({ theme }) => ({
        borderColor: greyAlpha(0.32),
        '&:hover': {
          borderColor: 'currentColor',
          backgroundColor: theme.vars.palette.action.hover,
        },
      }),
    },
    variants: [
      {
        props: { variant: 'contained', color: 'primary' },
        style: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.vars.palette.primary.dark,
            boxShadow: shadows.primary,
          },
        }),
      },
      // "Inherit" contained = the dark page-action button from the design (Add doctor, Sign in).
      {
        props: { variant: 'contained', color: 'inherit' },
        style: ({ theme }) => ({
          color: theme.vars.palette.common.white,
          backgroundColor: palette.grey[800],
          '&:hover': { backgroundColor: palette.grey[700] },
          ...theme.applyStyles('dark', {
            color: palette.grey[800],
            backgroundColor: theme.vars.palette.common.white,
            '&:hover': { backgroundColor: palette.grey[400] },
          }),
        }),
      },
      {
        props: { variant: 'outlined', color: 'inherit' },
        style: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
      },
      ...SOFT_COLORS.map((color) => ({
        props: { variant: 'soft' as const, color },
        style: ({ theme }: { theme: Theme }) => ({
          color: theme.vars.palette[color].dark,
          backgroundColor: theme.alpha(theme.vars.palette[color].main, 0.16),
          '&:hover': { backgroundColor: theme.alpha(theme.vars.palette[color].main, 0.32) },
          ...theme.applyStyles('dark', { color: theme.vars.palette[color].light }),
        }),
      })),
    ],
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.vars.palette.text.secondary,
        '&:hover': { backgroundColor: theme.vars.palette.action.hover },
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        boxShadow: shadows.card,
        backgroundImage: 'none',
        position: 'relative',
        ...theme.applyStyles('dark', { boxShadow: shadows.cardDark }),
      }),
    },
  },
  MuiCardHeader: {
    defaultProps: {
      slotProps: {
        title: { variant: 'h6' },
        subheader: { variant: 'body2', sx: { mt: 0.5, color: 'text.secondary' } },
      },
    },
    styleOverrides: { root: { padding: '24px 24px 0' } },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 10,
        boxShadow: shadows.dropdown,
        ...theme.applyStyles('dark', { boxShadow: shadows.dropdownDark }),
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: { borderRadius: 6, margin: '0 4px', fontSize: 14, minHeight: 36 },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 16, boxShadow: shadows.dialog },
    },
  },
  MuiDialogTitle: {
    styleOverrides: { root: { padding: 24, fontSize: '1.1875rem', fontWeight: 700 } },
  },
  MuiDialogContent: { styleOverrides: { root: { padding: '0 24px' } } },
  MuiDialogActions: { styleOverrides: { root: { padding: 24, gap: 4 } } },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        variants: [
          { props: { invisible: false }, style: { backgroundColor: 'rgba(28, 37, 46, 0.48)' } },
        ],
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: greyAlpha(0.2) },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars.palette.text.primary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars.palette.text.primary,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars.palette.error.main,
        },
      }),
    },
  },
  // MUI X pickers render their own input — match the outlined TextField look.
  MuiPickersOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        '& .MuiPickersOutlinedInput-notchedOutline': { borderColor: greyAlpha(0.2) },
        '&:hover .MuiPickersOutlinedInput-notchedOutline': {
          borderColor: theme.vars.palette.text.primary,
        },
        '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
          borderColor: theme.vars.palette.text.primary,
          borderWidth: 2,
        },
      }),
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.vars.palette.text.secondary,
        '&.Mui-focused': { color: theme.vars.palette.text.primary },
        '&.MuiInputLabel-shrink': { fontWeight: 600 },
        '&.Mui-error': { color: theme.vars.palette.error.dark },
      }),
    },
  },
  MuiFormHelperText: { styleOverrides: { root: { marginTop: 8 } } },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px dashed ${greyAlpha(0.2)}`,
        padding: 16,
        color: theme.vars.palette.text.secondary,
        fontSize: 14,
      }),
      head: ({ theme }) => ({
        fontWeight: 600,
        whiteSpace: 'nowrap',
        borderBottom: 'none',
        color: theme.vars.palette.text.secondary,
        backgroundColor: theme.vars.palette.background.neutral,
      }),
      paddingCheckbox: { paddingLeft: 8 },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.MuiTableRow-hover:hover': { backgroundColor: theme.vars.palette.action.hover },
        '&.Mui-selected': { backgroundColor: theme.alpha(theme.vars.palette.primary.main, 0.08) },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 48 },
      indicator: ({ theme }) => ({ backgroundColor: theme.vars.palette.text.primary, height: 2 }),
      list: { gap: 40 },
    },
  },
  MuiTab: {
    defaultProps: { disableRipple: true, iconPosition: 'end' },
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        minWidth: 0,
        minHeight: 48,
        padding: 0,
        fontWeight: 500,
        fontSize: 14,
        color: theme.vars.palette.text.secondary,
        '&:hover': { color: theme.vars.palette.text.primary },
        '&.Mui-selected': { color: theme.vars.palette.text.primary, fontWeight: 600 },
      }),
      icon: { marginLeft: 8 },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: theme.vars.palette.text.primary },
      }),
    },
  },
  MuiAvatar: {
    styleOverrides: { root: { fontWeight: 600, fontSize: 14 } },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: { backgroundColor: palette.grey[800], borderRadius: 6, fontSize: 12 },
    },
  },
  MuiLinearProgress: {
    styleOverrides: { root: { borderRadius: 4, height: 8 }, bar: { borderRadius: 4 } },
  },
  MuiSkeleton: {
    defaultProps: { animation: 'wave' },
    styleOverrides: { rounded: { borderRadius: 8 } },
  },
  MuiAlert: {
    styleOverrides: { root: { borderRadius: 8 } },
  },
};

const sharedPalette = {
  primary: { ...palette.primary, contrastText: '#ffffff' },
  secondary: { ...palette.secondary, contrastText: '#ffffff' },
  info: { ...palette.info, contrastText: '#ffffff' },
  success: { ...palette.success, contrastText: '#ffffff' },
  warning: { ...palette.warning, contrastText: palette.grey[800] },
  error: { ...palette.error, contrastText: '#ffffff' },
  grey: palette.grey,
  divider: greyAlpha(0.2),
  action: {
    hover: greyAlpha(0.08),
    selected: greyAlpha(0.16),
    focus: greyAlpha(0.24),
    disabled: greyAlpha(0.8),
    disabledBackground: greyAlpha(0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class', cssVarPrefix: 'dt' },
  colorSchemes: {
    light: {
      palette: {
        ...sharedPalette,
        text: {
          primary: palette.grey[800],
          secondary: palette.grey[600],
          disabled: palette.grey[500],
        },
        background: { default: '#ffffff', paper: '#ffffff', neutral: palette.grey[200] },
      },
    },
    dark: {
      palette: {
        ...sharedPalette,
        text: { primary: '#ffffff', secondary: palette.grey[500], disabled: palette.grey[600] },
        background: { default: palette.grey[900], paper: palette.grey[800], neutral: '#28323d' },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: fonts.sans,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: fonts.display,
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.25,
      '@media (min-width:600px)': { fontSize: '3.25rem' },
      '@media (min-width:1200px)': { fontSize: '4rem' },
    },
    h2: {
      fontFamily: fonts.display,
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.33,
      '@media (min-width:600px)': { fontSize: '2.5rem' },
      '@media (min-width:1200px)': { fontSize: '3rem' },
    },
    h3: {
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.5,
      '@media (min-width:900px)': { fontSize: '1.875rem' },
      '@media (min-width:1200px)': { fontSize: '2rem' },
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      '@media (min-width:900px)': { fontSize: '1.5rem' },
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      '@media (min-width:600px)': { fontSize: '1.1875rem' },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.0625rem',
      lineHeight: 1.55,
      '@media (min-width:600px)': { fontSize: '1.125rem' },
    },
    subtitle1: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: {
      fontSize: '0.6875rem',
      lineHeight: 1.64,
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    button: { fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.71, textTransform: 'none' },
    display: {
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      '@media (min-width:900px)': { fontSize: '2rem' },
    } as React.CSSProperties,
  },
  components,
});

export { shadows as customShadows };
