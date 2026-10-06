// Barra superior de demo (overlay fuera del repo): limpia, sin selector de idioma ni modo oscuro.
import React from "react";
import { Box, Button, IconButton, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { SensoboxLogo } from "./Sidebar";

const Topbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:800px)");
  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const logout = () => { setIsAuthenticated(false); localStorage.clear(); navigate("/login"); };

  if (isMobile) {
    return (
      <Box className="sb-topbar" sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "space-between", pl: "58px", pr: "8px", background: "rgba(255,255,255,.96)", borderBottom: "1px solid #E5E7EB", backdropFilter: "blur(8px)" }}>
        <SensoboxLogo size={26} />
        <IconButton aria-label="Salir" onClick={logout} sx={{ color: "#6B7280" }}><LogoutRoundedIcon /></IconButton>
      </Box>
    );
  }
  return (
    <Box className="sb-topbar" sx={{ position: "sticky", top: 0, zIndex: 1100, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", px: "28px", background: "rgba(243,244,248,.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #E5E7EB" }}>
      <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>
        <Box component="span" sx={{ color: "#111827", fontWeight: 600 }}>{user.role === "client" ? user.clientName : user.companyName}</Box>
        {user.role === "client" ? " · portal de cliente" : " · control de producción"}
      </Typography>
      <Box display="flex" alignItems="center" gap="6px">
        <Tooltip title="Avisos"><IconButton sx={{ color: "#6B7280" }}><NotificationsNoneRoundedIcon /></IconButton></Tooltip>
        <Button onClick={logout} startIcon={<LogoutRoundedIcon />} sx={{ color: "#374151", fontWeight: 600, borderRadius: "10px", px: "12px" }}>Salir</Button>
      </Box>
    </Box>
  );
};

export default Topbar;
