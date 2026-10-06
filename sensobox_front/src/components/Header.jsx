// Cabecera de página
import React from 'react';
import { Typography, Box } from "@mui/material";

const Header = ({ title, subtitle, actionElement }) => (
  <Box className="sb-header" display="flex" justifyContent="space-between" alignItems="center" mb="20px" gap="12px" flexWrap="wrap">
    <Box>
      <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: "-.02em", color: "#111827", m: "0 0 2px 0" }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 14, color: "#6B7280" }}>{subtitle}</Typography>}
    </Box>
    {actionElement}
  </Box>
);

export default Header;
