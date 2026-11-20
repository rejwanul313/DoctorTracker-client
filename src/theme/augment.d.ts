import type {} from '@mui/material/themeCssVarsAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import '@mui/material/styles';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface TypeBackground {
    neutral: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
  interface TypographyVariants {
    display: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    display?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}
