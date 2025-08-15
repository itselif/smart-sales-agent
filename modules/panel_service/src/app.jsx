import "src/global.css";

import { themeConfig, ThemeProvider } from "src/theme";

import { Snackbar } from "src/components/snackbar";
import { ProgressBar } from "src/components/progress-bar";
import { defaultSettings, SettingsProvider } from "src/components/settings";

import { AuthProvider } from "src/auth/context/jwt";

import { DataObjectProvider } from "./components/nav-section/data/context";
import { defaultDataObject } from "./components/nav-section/data/data-object-config";

export default function App({ children }) {
  return (
    <AuthProvider>
      <SettingsProvider defaultSettings={defaultSettings}>
        <ThemeProvider
          noSsr
          defaultMode={themeConfig.defaultMode}
          modeStorageKey={themeConfig.modeStorageKey}
        >
          <Snackbar />
          <ProgressBar />
          <DataObjectProvider defaultSettings={defaultDataObject}>
            {children}
          </DataObjectProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
