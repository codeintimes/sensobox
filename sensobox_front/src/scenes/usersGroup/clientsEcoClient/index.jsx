import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, IconButton, InputBase, Modal, Typography, Button, useTheme
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import {API_ORDERS} from "../../../config/config";
import axios from 'axios';

const ClientsEcoClient = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [ecoUsers, setEcoUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      const data = response.data;
      const remappedData = data.map(user => ({
        ...user,
        id: user._id
      }));
      setEcoUsers(remappedData);
    } catch (error) {
      console.error("Error loading the data:", error);
    }
  };

  useEffect(() => {
    loadEcoUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const actionElements = (
    <Box display="flex" alignItems="center" gap={2}>
      <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px">
        <InputBase
          sx={{ ml: 1, flex: 1, color: 'white', fontSize: '0.875rem' }}
          placeholder={t("orders.searchPlaceholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: '10px', color: 'white' }}>
          <SearchIcon />
        </IconButton>
      </Box>
      <IconButton color="primary" onClick={() => alert(t("common.notAvailable"))}>
        <AddIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box m="20px">
      <Header title={t("users.titleClients")} subtitle={t("users.subtitleClients")} actionElement={actionElements} />
      {ecoUsers.map(user => (
        <Box key={user.id} sx={{ mb: 1 }}>
          <Typography>{user.companyName}</Typography>
          <IconButton onClick={() => handleOpenModal(user)}>
            <EditIcon />
          </IconButton>
        </Box>
      ))}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 400 }}>
          {selectedUser && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {selectedUser.companyName}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {t("users.columns.ecoEmissions")}: {selectedUser.ecoEmissions}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                {t("users.columns.totalEmissions")}: {selectedUser.totalEmissions}
              </Typography>
              <img src='https://img.freepik.com/vector-premium/diseno-plantilla-logotipo-caja-carton_316488-1516.jpg' alt={t("users.ecoImageAlt")} style={{ width: '100%', marginTop: 20 }} />
              <Button onClick={handleCloseModal} startIcon={<CloseIcon />} sx={{ mt: 2 }}>
                {t("common.close")}
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ClientsEcoClient;
