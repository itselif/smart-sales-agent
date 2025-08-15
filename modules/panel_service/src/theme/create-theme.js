import { createTheme as createMuiTheme } from "@mui/material/styles";

import { mixins } from "./core/mixins";
import { shadows } from "./core/shadows";
import { palette } from "./core/palette";
import { components } from "./components";
import { themeConfig } from "./theme-config";
import { typography } from "./core/typography";
import { customShadows } from "./core/custom-shadows";

export const baseTheme = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light,
    },
    dark: {
      palette: palette.dark,
      shadows: shadows.dark,
      customShadows: customShadows.dark,
    },
  },
  mixins,
  components,
  typography,
  shape: { borderRadius: 8 },
  direction: themeConfig.direction,
  cssVariables: themeConfig.cssVariables,
  defaultColorScheme: themeConfig.defaultMode,
};

export function createTheme({
  themeOverrides = {},
  localeComponents = {},
} = {}) {
  const updatedCore = baseTheme;

  const updatedComponents = {};

  const theme = createMuiTheme(
    updatedCore,
    updatedComponents,
    localeComponents,
    themeOverrides,
  );

  return theme;
}
