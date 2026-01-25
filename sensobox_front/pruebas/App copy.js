import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "../src/scenes/global/Topbar";
import Sidebar from "../src/scenes/global/Sidebar";
import Dashboard from "../src/scenes/dashboard";
import Team from "../src/scenes/team";

import Contacts from "../src/scenes/contacts";
import Bar from "../src/scenes/bar";

import Pie from "../src/scenes/pie";
import FAQ from "../src/scenes/faq";
import Geography from "../src/scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../src/theme";
import Calendar from "../src/scenes/calendar/calendar";
import Login from "../src/scenes/login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {isAuthenticated && <Sidebar isSidebar={isSidebar} />}
          <main className={"content" + (isAuthenticated ? "" : " full-width")}>
            {isAuthenticated && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/geography" element={<Geography />} />
                  {/* Añade aquí el resto de tus rutas protegidas */}
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;