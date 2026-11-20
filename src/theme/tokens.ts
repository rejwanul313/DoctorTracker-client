/**
 * Design tokens from the Doctor Tracker design system (canvas → project/ds/doctortracker/tokens.json).
 * The MUI theme is built from these; components should use theme paths, not these constants,
 * except where noted (charts need raw hex values).
 */

export const palette = {
  primary: {
    lighter: '#c8fad6',
    light: '#5be49b',
    main: '#00a76f',
    dark: '#007867',
    darker: '#004b50',
  },
  secondary: {
    lighter: '#efd6ff',
    light: '#c684ff',
    main: '#8e33ff',
    dark: '#5119b7',
    darker: '#27097a',
  },
  info: {
    lighter: '#cafdf5',
    light: '#61f3f3',
    main: '#00b8d9',
    dark: '#006c9c',
    darker: '#003768',
  },
  success: {
    lighter: '#d3fcd2',
    light: '#77ed8b',
    main: '#22c55e',
    dark: '#118d57',
    darker: '#065e49',
  },
  warning: {
    lighter: '#fff5cc',
    light: '#ffd666',
    main: '#ffab00',
    dark: '#b76e00',
    darker: '#7a4100',
  },
  error: {
    lighter: '#ffe9d5',
    light: '#ffac82',
    main: '#ff5630',
    dark: '#b71d18',
    darker: '#7a0916',
  },
  grey: {
    50: '#fcfdfd',
    100: '#f9fafb',
    200: '#f4f6f8',
    300: '#dfe3e8',
    400: '#c4cdd5',
    500: '#919eab',
    600: '#637381',
    700: '#454f5b',
    800: '#1c252e',
    900: '#141a21',
  },
} as const;

/** rgb channels of grey-500, used for dividers/hover tints in both schemes. */
export const GREY_CHANNEL = '145 158 171';
export const greyAlpha = (a: number) => `rgba(145, 158, 171, ${a})`;

export const fonts = {
  sans: 'var(--font-public-sans), "Public Sans", Helvetica, Arial, sans-serif',
  display: 'var(--font-barlow), Barlow, "Public Sans", sans-serif',
};

export const layout = {
  navWidth: 300,
  headerHeight: 64,
  headerHeightDesktop: 72,
  contentMaxWidth: 1200,
};

/** Two-series chart colors (validated: CVD ΔE 20.5, contrast ≥ 3:1 on white). */
export const seriesColors = {
  admitted: palette.primary.main,
  discharged: palette.info.dark,
};
