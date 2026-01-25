import React, { useState, useContext, useEffect } from "react";
import { Box, IconButton, InputBase, useTheme, Modal, Typography, Button, Menu, MenuItem, useMediaQuery } from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from '@mui/icons-material/Engineering';
import BadgeIcon from '@mui/icons-material/Badge';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import InfoIcon from '@mui/icons-material/Info';
import { API_ORDERS } from "../../config/config";
import axios from 'axios';

const Topbar = ({ setIsAuthenticated }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { i18n } = useTranslation();
  const { role } = JSON.parse(localStorage.getItem('userData')) || {};
  const navigate = useNavigate();
  const [ecoUsers, setEcoUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (languageCode) => {
    if (languageCode) {
      i18n.changeLanguage(languageCode);
    }
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.clear();
    navigate("/login");
  };


  const loadEcoUsers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }
      const jwt = localStorage.getItem("jwtToken");

      const url = new URL(`${API_ORDERS.ORDERS}/eco-emissions`);
      url.searchParams.append('companyName', companyName);
      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      const data = response.data;

      if (data.length > 0) {
        const [firstUser] = response.data.filter(item => item.clientName === userData.clientName);
        console.log("firstUser", firstUser)
        setEcoUsers(firstUser);
      } else {
        console.error("No data found for the specified company.");
        setEcoUsers(null);
      }
    } catch (error) {
      console.error("Error loading the data:", error);
    }
  };

  useEffect(() => {
    if (role === 'client') { // Solo carga ecoUsers si el usuario es cliente
      loadEcoUsers();
    }
  }, []);

  const toggleModal = () => {
    if (role === 'client') { // Solo carga ecoUsers si el usuario es cliente
      loadEcoUsers();
    }
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    // Esta lógica asegura que el sidebar se colapse en móviles al cargar y cambiar tamaño de ventana
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const sidebarStyle = {
    // position: 'sticky',
    top: 0,
    // left: 0,
    position: isMobile ? 'fixed' : 'relative', // Posicionamiento fijo en móviles
    zIndex: isMobile ? 1200 : 1, // Asegúrate de que el zIndex sea mayor que el del contenido
    height: isMobile ? '70px' : 'auto', // Ancho dinámico basado en el estado colapsado y si es móvil
    // height: '100vh', // Altura completa para cubrir toda la vista vertical
    transition: 'all 0.3s', // Transición suave al cambiar el tamaño
    top: 0,
    // overflowX: 'hidden', 
    // overflowY: isCollapsed ? 'auto' : 'hidden', 
    // overflow: isCollapsed ? 'hidden' : 'auto',  // Asegurarse de ocultar overflow cuando está colapsado
  };

  // Define el estilo para que el Topbar sea fijo en la parte superior
  // const topbarStyle = {
  //   position: 'fixed', // Posición fija en la parte superior de la pantalla
  //   top: 0,            // Alineado al borde superior del viewport
  //   left: 0,           // Alineado al borde izquierdo del viewport
  //   width: '100%',     // Asegura que el Topbar se extienda a lo ancho de toda la pantalla
  //   zIndex: 1200,      // Valor de z-index suficientemente alto para estar sobre otros elementos
  //   backgroundColor: theme.palette.background.default, // Color de fondo del tema
  //   boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Sombra ligera para destacar el Topbar
  //   padding: theme.spacing(1), // Espaciado uniforme dentro del Topbar
  //   boxSizing: 'border-box', // Asegura que el padding no afecte el ancho total
  // };

  const topbarStyle = {
    ...(isMobile && {
      position: 'fixed', // Aplica posición fija solo en móviles
    }),
    top: 0,            // Align to the top of the viewport
    left: 0,           // Align to the left of the viewport
    right: 0,          // Align to the right of the viewport to stretch across the screen
    width: '100%',     // Ensure the Topbar extends across the full width of the viewport
    zIndex: 1200,      // High z-index to stay on top of other elements
    backgroundColor: theme.palette.background.default, // Background color from theme
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Optional shadow for better visibility
    // padding: theme.spacing(1), // Padding inside the Topbar
    boxSizing: 'border-box', // Ensures padding is included in height/width
  };

  return (
    <Box
      style={topbarStyle}
      display="flex"
      justifyContent="space-between"
      p={2}
    // sx={{
    //   ...(isMobile && {
    //     position: 'sticky',  // This makes the element stick at the top of the screen
    //     top: 0,
    //     left: 0,
    //     right: 0,              // Aligns the sticky element to the top of the viewport
    //     zIndex: 1100,        // Ensures it stays above other content; adjust as needed
    //     backgroundColor: theme.palette.background.paper,  // Ensures the background is consistent
    //     width: '100%',       // Ensures the box stretches across the full viewport width
    //     boxShadow: '2px 2px 4px rgba(0,0,0,0.1)', // Optional: Adds shadow for better visibility
    //     boxSizing: 'border-box',
    //     transition: 'all 0.3s ease-in-out',  // Ensures the box stretches across the full viewport width

    //   })
    // }}
    >
      {/* SEARCH BAR */}
      <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
        {/* <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" /> */}
        {/* <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
        {/* {role === 'admin' && (
          <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <SettingsOutlinedIcon />
            </IconButton>
          </Link>)} */}

        {role === 'admin' && (
          <Link to="/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <PersonIcon />  {/* Icon for clients */}
            </IconButton>
          </Link>
        )}

        {role === 'admin' && (
          <Link to="/technicians" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <BuildIcon />  {/* Icon for employees */}
            </IconButton>
          </Link>
        )}

        {role === 'admin' && (
          <Link to="/admins" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <AdminPanelSettingsIcon />  {/* Icon for employees */}
            </IconButton>
          </Link>
        )}

        {role === 'admin' && (
          <Link to="/clientsEco" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <EnergySavingsLeafIcon />  {/* Icon for clients */}
            </IconButton>
          </Link>
        )}

        {role === 'client' && ecoUsers && ecoUsers.eco === true && (
          <IconButton onClick={toggleModal}>
            <EnergySavingsLeafIcon />  {/* Icon for clients */}
          </IconButton>
        )}

        {/* <IconButton>
          <PersonOutlinedIcon />
          <SettingsOutlinedIcon />
        </IconButton> */}


        <IconButton onClick={handleClick}>
          <LanguageOutlinedIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
          <MenuItem onClick={() => handleClose('es')}>{t("languages.spanish")}</MenuItem>
          <MenuItem onClick={() => handleClose('en')}>{t("languages.english")}</MenuItem>
          <MenuItem onClick={() => handleClose('fr')}>{t("languages.français")}</MenuItem>
        </Menu>

        {role === 'admint' && (
          <Link to="/faqAdmin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <InfoIcon />  {/* Icon for clients */}
            </IconButton>
          </Link>
        )}

        {role === 'techniciant' && (
          <Link to="/faqTechnician" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <InfoIcon />  {/* Icon for clients */}
            </IconButton>
          </Link>
        )}

        {role === 'clientt' && (
          <Link to="/faqClient" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <InfoIcon />  {/* Icon for clients */}
            </IconButton>
          </Link>
        )}

        <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconButton onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Link>

      </Box>
      <Modal
        open={isModalOpen}
        onClose={toggleModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 1000 }}>
          {ecoUsers ? (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {ecoUsers.companyName}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                ¡Gracias {ecoUsers.clientName} por tu compromiso con el planeta!
                <br /><br />
                Estamos orgullosos de anunciar que gracias a nuestra colaboración y a las medidas ECO-friendly aplicadas en los sistemas de producción, <br />
                hemos logrado reducir nuestras emisiones de CO2 en: <strong>{ecoUsers.totalEmissions} {t("users.savedEotalEmissions")}</strong>
                <br />
                Esto no solo contribuye a un medio ambiente más limpio, sino que también refuerza nuestro compromiso conjunto con la sostenibilidad.
                <br /><br />
                <strong>Beneficios que ya estás disfrutando:</strong>
                <br />
                <ul>
                  <li><strong>Responsabilidad Ambiental:</strong> Tu empresa ya está demostrando a tus clientes y stakeholders un fuerte compromiso con prácticas sostenibles.</li>
                  <li><strong>Reducción de Costos:</strong> Al optimizar el uso de recursos y minimizar desperdicios, también has contribuido a reducir costos operativos.</li>
                  <li><strong>Mejora de la Reputación:</strong> Ser una empresa eco-friendly ha mejorado la imagen corporativa y puede ser un factor decisivo para clientes y socios comerciales.</li>
                  <li><strong>Cumplimiento Normativo:</strong> Estás asegurando que tu empresa cumple con las regulaciones ambientales cada vez más estrictas.</li>
                </ul>
              </Typography>
              <img src='https://www.ui1.es/sites/default/files/blog/images/ecologia_y_ecologismo_de_la_mano_retocada.jpg' alt="Eco Image" style={{ width: '100%', marginTop: 10 }} />
              <Typography sx={{ mt: 2 }}>
                Contáctanos para explorar nuevas funcionalidades y ver más beneficios de ser una empresa comprometida con el medio ambiente.
                <br /><br />
                ¡{t("users.savedEcoMessage")}
              </Typography>

            </>
          ) : (
            <Typography>
              {t("users.loadingOrNoUser")}
            </Typography>

          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Topbar;
