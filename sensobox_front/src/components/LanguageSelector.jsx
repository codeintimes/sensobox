// Selector de idioma: visible en la barra superior y en el inicio de sesión. La elección se guarda
// en localStorage (sensobox.lang) y se recuerda en las siguientes visitas.
import React, { useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem, Tooltip, ListItemText } from "@mui/material";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTranslation } from "react-i18next";
import { LANGUAGES, currentLang } from "../i18n";

const LanguageSelector = ({ compact = false, sx }) => {
  const { t, i18n } = useTranslation();
  const [anchor, setAnchor] = useState(null);
  const lang = currentLang();
  const open = (e) => setAnchor(e.currentTarget);
  const choose = (code) => { i18n.changeLanguage(code); setAnchor(null); };
  return (
    <>
      <Tooltip title={t("app.language")}>
        {compact ? (
          <IconButton className="sb-lang" aria-label={t("app.language")} onClick={open} sx={{ color: "#4B5563", gap: "2px", borderRadius: "10px", fontSize: 13, fontWeight: 700, ...sx }}>
            <TranslateRoundedIcon fontSize="small" /><Box component="span" sx={{ textTransform: "uppercase" }}>{lang}</Box>
          </IconButton>
        ) : (
          <Button className="sb-lang" onClick={open} startIcon={<TranslateRoundedIcon />} aria-label={t("app.language")}
            sx={{ color: "#374151", fontWeight: 600, borderRadius: "10px", px: "12px", ...sx }}>
            {LANGUAGES.find((l) => l.code === lang).label}
          </Button>
        )}
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        {LANGUAGES.map((l) => (
          <MenuItem key={l.code} lang={l.code} selected={l.code === lang} onClick={() => choose(l.code)} className={"sb-lang-" + l.code} sx={{ minWidth: 170 }}>
            <ListItemText>{l.label}</ListItemText>
            {l.code === lang && <CheckRoundedIcon fontSize="small" sx={{ color: "#4F46E5", ml: 1 }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
