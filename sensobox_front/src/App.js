import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/graphs/dashboard";
// import Team from "./scenes/team";
import OrdersTechnician from "./scenes/orders/ordersTechnician";
import OrdersClient from "./scenes/orders/ordersClient";
import OrdersAdmin from "./scenes/orders/ordersAdmin";
// import Contacts from "./scenes/contacts";
// import Bar from "../pruebas/bar";
// import EditTechnician from "./components/editTechnician";
import EditClient from "./scenes/usersGroup/editClient";
import EditClientEco from "./scenes/usersGroup/editClientEco";
import EditOrder from "./scenes/orders/editOrder";
// import EditProductionOrder from "./scenes/editProductionOrder";
import CreateAdmin from "./scenes/usersGroup/createAdmin";
import CreateTechnician from "./scenes/usersGroup/createTechnician";
import CreateClient from "./scenes/usersGroup/createClient";
// import CreateEmployee from "./scenes/createEmployee";
import CreateOrder from "./scenes/orders/createOrder";
// import CreateProductionOrder from "../pruebas/createProductionOrder";

import LineQuantityGraph from "./scenes/graphs/lineQuantityGraph";
import LineProcessingGraph from "./scenes/graphs/lineProcessingGraph";
import LineOrdersGraph from "./scenes/graphs/lineOrdersGraph";

import Pie from "./scenes/graphs/pie";
// import FAQ from "./scenes/faq";
import FAQAdmin from "./scenes/faqs/faqAdmin";
import FAQTechnician from "./scenes/faqs/faqTechnician";
import FAQClient from "./scenes/faqs/faqClient";
// import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/graphs/calendar/calendar";
import Login from "./scenes/usersGroup/login";
import './i18n';

import EditOpiInitial from "./scenes/orders/editOpiInitial";
import EditOpiFinal from "./scenes/orders/editOpiFinal";
import QuantityGraph from "./scenes/graphs/lineQuantityGraph";
import EditMaterial from "./scenes/orders/editMaterial";
// import Users from "./scenes/users";
import Clients from "./scenes/usersGroup/clients";
import Technicians from "./scenes/usersGroup/technicians";
import Admins from "./scenes/usersGroup/admins";
import ClientsEco from "./scenes/usersGroup/clientsEco";
// import Employees from "./scenes/usersGroup/technicians";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EditQuantityProcessed from "./scenes/orders/editQuantityProcessed";
import ClientsEcoClient from "./scenes/usersGroup/clientsEcoClient";
import { useMediaQuery } from "@mui/material";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado

  const mainContentStyle = {
    marginTop: isAuthenticated && isMobile ? '64px' : '0', // Ajusta el margen solo si está autenticado
  };

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {isAuthenticated && <Sidebar isSidebar={isSidebar} />}
            {/* <Sidebar isSidebar={isSidebar} /> */}

            <main className={"content" + (isAuthenticated ? "" : " full-width")} style={mainContentStyle}>
              {isAuthenticated && <Topbar setIsAuthenticated={setIsAuthenticated} setIsSidebar={setIsSidebar} />}
              {/* <Topbar setIsSidebar={setIsSidebar} /> */}
              <Routes>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                {isAuthenticated ? (

                  <>
                    <Route path="/" element={<Dashboard />} />
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} roles={'admin'} />}>
                      <Route path="/ordersAdmin" element={<OrdersAdmin />} />
                      <Route path="/lineQuantityGraph" element={<LineQuantityGraph />} />
                      <Route path="/lineProcessingGraph" element={<LineProcessingGraph />} />

                      {/* <Route path="/createEmployee" element={<CreateEmployee />} /> */}
                      <Route path="/editClient/:id" element={<EditClient />} />
                      <Route path="/createTechnician" element={<CreateTechnician />} />
                      <Route path="/createAdmin" element={<CreateAdmin />} />
                      <Route path="/createClient" element={<CreateClient />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/technicians" element={<Technicians />} />
                      <Route path="/admins" element={<Admins />} />
                      <Route path="/clientsEco" element={<ClientsEco />} /> {/* Ruta para clientes eco */}
                      <Route path="/editClientEco/:id" element={<EditClientEco />} /> {/* Ruta para editar datos eco del cliente */}
                      {/* <Route path="/editTechnician/:id" element={<EditTechnician />} /> */}
                      <Route path="/quantityGraph" element={<QuantityGraph />} />
                      <Route path="/faqAdmin" element={<FAQAdmin />} />
                    </Route>
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} roles={'technician'} />}>
                      <Route path="/ordersTechnician" element={<OrdersTechnician />} />
                      <Route path="/faqTechnician" element={<FAQTechnician />} />
                    </Route>
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} roles={'client'} />}>
                      <Route path="/ordersClient" element={<OrdersClient />} />
                      <Route path="/clientsEcoClient" element={<ClientsEcoClient />} /> {/* Ruta para clientes eco */}
                      <Route path="/faqClient" element={<FAQClient />} />
                    </Route>
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} roles={['client', 'admin']} />}>
                      <Route path="/lineOrdersGraph" element={<LineOrdersGraph />} />
                      <Route path="/calendar" element={<Calendar />} />
                    </Route>
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} roles={['technician', 'admin']} />}>
                      <Route path="/editMaterial/:id" element={<EditMaterial />} />
                      <Route path="/editQuantityProcessed/:id" element={<EditQuantityProcessed />} />
                      <Route path="/editOpiInitial/:id" element={<EditOpiInitial />} />
                      <Route path="/editOpiFinal/:id" element={<EditOpiFinal />} />
                      <Route path="/createOrder" element={<CreateOrder />} />
                      <Route path="/editOrder/:id" element={<EditOrder />} />
                      <Route path="/pie" element={<Pie />} />
                    </Route>
                  </>
                ) : (
                  <Route path="*" element={<Navigate to="/login" />} />
                )}
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;
