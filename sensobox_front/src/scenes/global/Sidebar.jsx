// Menú lateral de demo (overlay fuera del repo): marca Sensobox, tarjeta del usuario y navegación por perfil.
// En móvil (≤ 800 px) se convierte en un cajón que se abre desde el botón de menú de la barra superior.
import React, { useEffect, useState } from "react";
import { Box, Drawer, IconButton, Typography, useMediaQuery } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";

export const SensoboxLogo = ({ size = 32, text = true, color = "#111827" }) => (
  <Box display="flex" alignItems="center" gap="10px">
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#4F46E5" />
      <path d="M16 7.5 24 12v8l-8 4.5L8 20v-8z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.4 12.2 16 16.5l7.6-4.3M16 16.5v8" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinejoin="round" />
    </svg>
    {text && <Typography sx={{ fontWeight: 800, fontSize: size * 0.62, letterSpacing: "-.02em", color }}>Sensobox</Typography>}
  </Box>
);

const MENUS = {
  admin: [
    { section: "Producción" },
    { title: "Panel", to: "/", icon: <SpaceDashboardOutlinedIcon /> },
    { title: "Órdenes", to: "/ordersAdmin", icon: <Inventory2OutlinedIcon /> },
    { title: "Calendario", to: "/calendar", icon: <CalendarMonthOutlinedIcon /> },
    { section: "Análisis" },
    { title: "Cantidades y merma", to: "/lineQuantityGraph", icon: <StackedLineChartOutlinedIcon /> },
    { title: "Pedidos", to: "/lineOrdersGraph", icon: <BarChartOutlinedIcon /> },
    { title: "Tiempos de proceso", to: "/lineProcessingGraph", icon: <TimerOutlinedIcon /> },
    { section: "Equipo" },
    { title: "Clientes", to: "/clients", icon: <PeopleAltOutlinedIcon /> },
    { title: "Técnicos", to: "/technicians", icon: <EngineeringOutlinedIcon /> },
    { title: "Ayuda", to: "/faqAdmin", icon: <HelpOutlineOutlinedIcon /> },
  ],
  technician: [
    { section: "Taller" },
    { title: "Mis órdenes", to: "/ordersTechnician", icon: <Inventory2OutlinedIcon /> },
    { title: "Ayuda", to: "/faqTechnician", icon: <HelpOutlineOutlinedIcon /> },
  ],
  client: [
    { section: "Mis pedidos" },
    { title: "Seguimiento", to: "/ordersClient", icon: <Inventory2OutlinedIcon /> },
    { title: "Pedidos por periodo", to: "/lineOrdersGraph", icon: <BarChartOutlinedIcon /> },
    { title: "Calendario", to: "/calendar", icon: <CalendarMonthOutlinedIcon /> },
    { title: "Ayuda", to: "/faqClient", icon: <HelpOutlineOutlinedIcon /> },
  ],
};
const ROLE = { admin: "Administración", technician: "Técnico de taller", client: "Cliente" };
const initials = (n = "") => n.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();

function Content({ onNavigate }) {
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const items = MENUS[user.role] || [];
  return (
    <Box className="sb-sidebar" sx={{ width: 252, height: "100%", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #E5E7EB", px: "14px", py: "18px", boxSizing: "border-box" }}>
      <Box px="8px" mb="22px"><SensoboxLogo /></Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", p: "10px", borderRadius: "12px", background: "#F7F7FB", border: "1px solid #EEF0F4", mb: "18px" }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "50%", background: "#E0E7FF", color: "#4338CA", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initials(user.name)}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ROLE[user.role]} · {user.role === "client" ? user.clientName : user.companyName}</Typography>
        </Box>
      </Box>
      <Box component="nav" sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {items.map((it, i) =>
          it.section ? (
            <Typography key={i} sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#9CA3AF", px: "10px", mt: i ? "14px" : 0, mb: "4px" }}>{it.section}</Typography>
          ) : (
            <Link key={it.to} to={it.to} onClick={onNavigate} className={"sb-nav" + (pathname === it.to ? " active" : "")} style={{ textDecoration: "none" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "10px", py: "9px", borderRadius: "10px", fontSize: 14, fontWeight: pathname === it.to ? 600 : 500,
                color: pathname === it.to ? "#4338CA" : "#374151", background: pathname === it.to ? "#EEF2FF" : "transparent", "& svg": { fontSize: 20, color: pathname === it.to ? "#4F46E5" : "#9CA3AF" }, "&:hover": { background: "#F3F4F6" } }}>
                {it.icon}<span>{it.title}</span>
              </Box>
            </Link>
          )
        )}
      </Box>
      <Box mt="auto" px="10px" sx={{ fontSize: 11.5, color: "#9CA3AF" }}>{user.companyName}</Box>
    </Box>
  );
}

const Sidebar = () => {
  const isMobile = useMediaQuery("(max-width:800px)");
  const [open, setOpen] = useState(false);
  useEffect(() => { window.__sbOpenMenu = () => setOpen(true); return () => { delete window.__sbOpenMenu; }; }, []);
  if (isMobile) {
    return (
      <>
        <IconButton className="sb-menu-btn" aria-label="Abrir menú" onClick={() => setOpen(true)} sx={{ position: "fixed", top: 10, left: 10, zIndex: 1301, color: "#111827" }}>
          <MenuRoundedIcon />
        </IconButton>
        <Drawer open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { border: 0 } }}>
          <Content onNavigate={() => setOpen(false)} />
        </Drawer>
      </>
    );
  }
  return <Box sx={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}><Content /></Box>;
};

export default Sidebar;
