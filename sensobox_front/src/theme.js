// Tema de demo «Sensobox» (overlay fuera del repo): modo claro, tipografía Inter, paleta índigo + semánticos.
// Mantiene la misma API (tokens, themeSettings, useMode, ColorModeContext) que el theme.js original.
import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { esES as gridEsES } from "@mui/x-data-grid";
import { esES as coreEsES } from "@mui/material/locale";

const PALETTE = {
  textContrast: { main: "#111827" },
  orangeSoft: { light: "#FFEDD5", main: "#FB923C", dark: "#EA580C" },
  yellowSoft: { light: "#FEF9C3", main: "#FDE047", dark: "#CA8A04" },
  redSoft: { light: "#FEE2E2", main: "#F87171", dark: "#DC2626" },
  purpleSoft: { light: "#EDE9FE", main: "#A78BFA", dark: "#7C3AED" },
  // texto: 100 = el más oscuro
  grey: { 100: "#111827", 200: "#374151", 300: "#6B7280", 400: "#9CA3AF", 500: "#D1D5DB", 600: "#E5E7EB", 700: "#F3F4F6", 800: "#F9FAFB", 900: "#FFFFFF" },
  // superficies: 400 = tarjeta, 500 = fondo de página / separadores
  primary: { 100: "#111827", 200: "#1F2937", 300: "#374151", 400: "#FFFFFF", 500: "#F3F4F8", 600: "#E9EBF2", 700: "#D9DCE6", 800: "#C3C7D4", 900: "#A9AEBF" },
  // éxito / acento positivo (esmeralda)
  greenAccent: { 100: "#ECFDF5", 200: "#D1FAE5", 300: "#059669", 400: "#10B981", 500: "#059669", 600: "#059669", 700: "#D1FAE5", 800: "#A7F3D0", 900: "#ECFDF5" },
  // alerta / negativo (coral)
  redAccent: { 100: "#FEF2F2", 200: "#FEE2E2", 300: "#F87171", 400: "#EF4444", 500: "#DC2626", 600: "#DC2626", 700: "#FECACA", 800: "#FEE2E2", 900: "#FEF2F2" },
  // marca (índigo)
  blueAccent: { 100: "#EEF2FF", 200: "#E0E7FF", 300: "#A5B4FC", 400: "#6366F1", 500: "#4F46E5", 600: "#4338CA", 700: "#EEF2FF", 800: "#E0E7FF", 900: "#EEF2FF" },
  orangeAccent: { 400: "#F59E0B", 500: "#D97706" },
};

export const tokens = () => PALETTE;

const FONT = ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"].join(",");

export const themeSettings = () => {
  const c = PALETTE;
  return {
    palette: {
      mode: "light",
      primary: { main: c.blueAccent[500], dark: c.blueAccent[600], contrastText: "#fff" },
      secondary: { main: c.blueAccent[500] },
      success: { main: "#059669" },
      error: { main: "#DC2626" },
      neutral: { dark: c.grey[200], main: c.grey[300], light: c.grey[700] },
      background: { default: c.primary[500], paper: "#FFFFFF" },
      text: { primary: c.grey[100], secondary: c.grey[300] },
      divider: c.grey[600],
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT,
      fontSize: 13,
      h1: { fontFamily: FONT, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontFamily: FONT, fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontFamily: FONT, fontSize: 18, fontWeight: 600 },
      h5: { fontFamily: FONT, fontSize: 14.5, fontWeight: 500 },
      h6: { fontFamily: FONT, fontSize: 13, fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 10, boxShadow: "none" } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10, backgroundColor: "#fff" } } },
      MuiFilledInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiAccordion: { styleOverrides: { root: { borderRadius: 12, boxShadow: "0 1px 2px rgba(16,24,40,.06)", border: "1px solid #E5E7EB", "&:before": { display: "none" }, marginBottom: 12 } } },
    },
  };
};

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("light");
  const colorMode = useMemo(() => ({ toggleColorMode: () => setMode((p) => p) }), []);
  const theme = useMemo(() => createTheme(themeSettings(mode), gridEsES, coreEsES), [mode]);
  return [theme, colorMode];
};
