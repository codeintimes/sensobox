import React, { useState, useEffect } from 'react';
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from "react-i18next";
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

const Item = ({ title, to, icon, selected, setSelected, setIsCollapsed, isMobile }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClick = () => {
    setSelected(title);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={handleClick}  // Use the new handler here
      icon={icon}
    >
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography>{title}</Typography>
      </Link>
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const user = JSON.parse(localStorage.getItem('userData')) || {};
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const isClient = user?.role === 'client';
  const { role, name, companyName, contactName, contactPhone, contactEmail } = JSON.parse(localStorage.getItem('userData'));
  const { t } = useTranslation();
  const companyNameUpperCase = companyName.toUpperCase();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado


  useEffect(() => {
    // Esta lógica asegura que el sidebar se colapse en móviles al cargar y cambiar tamaño de ventana
    setIsCollapsed(isMobile);
  }, [isMobile]);

  // const sidebarStyle = {
  //   width: isCollapsed && isMobile ? '80px' : 'auto', // Ajusta el ancho mínimo aquí para solo el icono
  //   transition: 'width 0.3s'
  // };

  const sidebarStyle = {
    // position: 'sticky',
    top: 0,
    left: 0,
    position: isMobile ? 'fixed' : 'relative', // Posicionamiento fijo en móviles
    zIndex: isMobile ? 1300 : 1, // Asegúrate de que el zIndex sea mayor que el del contenido
    height: isMobile && isCollapsed ? '70px' : '100vh', // Ancho dinámico basado en el estado colapsado y si es móvil
    // height: '100vh', // Altura completa para cubrir toda la vista vertical
    transition: 'all 0.3s', // Transición suave al cambiar el tamaño

  };

  const sidebarStyleIcon = {
    // position: isMobile ? 'fixed' : 'relative', // Posicionamiento fijo en móviles
    // zIndex: isMobile ? 1300 : 1, // Asegúrate de que el zIndex sea mayor que el del contenido

    height: isMobile && isCollapsed ? '10px' : 'auto', // Ancho dinámico basado en el estado colapsado y si es móvil
    // height: '100vh', // Altura completa para cubrir toda la vista vertical
    // transition: 'all 0.3s' // Transición suave al cambiar el tamaño

    // overflow: isCollapsed ? 'hidden' : 'auto',  // Asegurarse de ocultar overflow cuando está colapsado
  };

  return (
    <Box style={sidebarStyle}
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} >
        <Menu iconShape="square" style={sidebarStyleIcon}>
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: isMobile ? "5px 0px 0px 5px" : "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {(!isCollapsed) && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {isAdmin && t("roles.admin").toUpperCase()}
                  {isTechnician && t("roles.technician").toUpperCase()}
                  {isClient && t("roles.client").toUpperCase()}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {(!isCollapsed) && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src="https://img.freepik.com/vector-premium/diseno-plantilla-logotipo-caja-carton_316488-1516.jpg"
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 20px 0" }}  // Aumentado el margen inferior a 20px
                >
                  {name || ""}
                </Typography>
                <Typography
                  variant="h5"
                  color={colors.greenAccent[500]}
                  sx={{ m: "0 0 5px 0" }}  // Aumentado el margen inferior a 20px
                >
                  {companyNameUpperCase || ""}
                </Typography>
                {contactName && contactPhone && contactEmail && (
                  <Typography
                    variant="h5"
                    sx={{ m: "0 0 30px 0" }}  // Aumentado el margen inferior a 20px, ajusta según necesidades
                  >
                    <br />
                    {contactName} <br />
                    {contactPhone} <br />
                    {contactEmail}
                  </Typography>
                )}
              </Box>
            </Box>

          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {(!isCollapsed || !isMobile) && (
              <>
                {isAdmin && (
                  <>
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: "15px 0 5px 20px" }}
                    >
                      {t("roles.admin")}
                    </Typography>
                    <Item
                      title={t("sidebar.dashboard")}
                      to="/"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.orders")}
                      to="/ordersAdmin"
                      icon={<Inventory2Icon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.calendar")}
                      to="/calendar"
                      icon={<CalendarTodayOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.quantityGraph")}
                      to="/lineQuantityGraph"
                      icon={<TimelineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.ordersGraph")}
                      to="/lineOrdersGraph"
                      icon={<AssignmentTurnedInOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.processingTimeGraph")}
                      to="/lineProcessingGraph"
                      icon={<AccessTimeIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    

                  </>
                )}
                {isTechnician && (
                  <>
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: "15px 0 5px 20px" }}
                    >
                      {t("roles.technician")}
                    </Typography>

                    <Item
                      title={t("sidebar.orders")}
                      to="/ordersTechnician"
                      icon={<Inventory2Icon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                  </>

                )}
                {isClient && (
                  <>
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: "15px 0 5px 20px" }}
                    >
                      {t("roles.client")}
                    </Typography>

                    <Item
                      title={t("sidebar.orderMonitor")}
                      to="/ordersClient"
                      icon={<Inventory2Icon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.ordersGraph")}
                      to="/lineOrdersGraph"
                      icon={<AssignmentTurnedInOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                    <Item
                      title={t("sidebar.calendar")}
                      to="/calendar"
                      icon={<CalendarTodayOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      setIsCollapsed={setIsCollapsed}
                      isMobile={isMobile}
                    />
                  </>
                )}
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
