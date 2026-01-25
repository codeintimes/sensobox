import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, InputBase, useTheme, Typography, useMediaQuery, Divider } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';

const ClientsEco = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [ecoUsers, setEcoUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery('(max-width:1500px)');

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

      let data = response.data;
      data = data.map(user => ({
        ...user,
        ecoStatus: getEcoStatus(user.eco), // Transform eco to readable status
      }));
      // const remappedData = data.map(user => ({
      //   ...user,
      //   id: user._id
      // }));
      setEcoUsers(data);
    } catch (error) {
      console.error("Error loading the data:", error);
    }
  };

  useEffect(() => {
    loadEcoUsers();
  }, []);


  const getEcoStatus = (eco) => {
    return eco ? t("ecoForm.activated") : t("ecoForm.deactivated");
  };

  const handleEditUser = (id) => {
    console.log("2",id)
    const userToEdit = ecoUsers.find((user) => user._id === id);
    if (!userToEdit) {
      console.error("Orden no encontrada");
      return;
    }


    console.log("2453",userToEdit)

    navigate(`/editClientEco/${id}`, { state: { user: userToEdit } });
  };

  const filteredData = ecoUsers.filter((order) =>
    order.clientName.toLowerCase().includes(searchText.toLowerCase())
  );
  // console.log("order", filteredData)
  const columns = [
    { field: "clientName", headerName: t("users.columns.companyName"), flex: 1.5 },
    { field: "totalQuantity", headerName: t("users.columns.totalQuantity"), flex: 1, },
    { field: "ecoStatus", headerName: t("users.columns.ecoStatus"), flex: 1 },
    { field: "ecoEmissions", headerName: t("users.columns.ecoEmissions"), flex: 1 },
    { field: "totalEmissions", headerName: t("users.columns.totalEmissions"), flex: 1 },
    {
      field: "edit", headerName: "", sortable: false, filterable: false, flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton onClick={() => handleEditUser(cellValues.id)}>
          <EditIcon />
        </IconButton>
      )
    },
  ];

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
      {/* <IconButton color="primary" onClick={() => navigate("/createUser")}>
        <AddIcon />
      </IconButton> */}
    </Box>
  );

  const desktopView = (
    <Box m="20px">
      <Header title={t("users.titleClientsEco")} subtitle={t("users.subtitleClientsECO")} actionElement={actionElements} />
      <Box
        m="10px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          width:  'auto', // Utiliza toda la anchura disponible en móviles
          maxWidth:  'none', // Asegura que en móviles la tabla no sea más ancha que la pantalla
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id}
          components={{
            Toolbar: () => (
              <GridToolbar
                components={{ Toolbar: GridToolbar }}
              />
            )
          }}
        />
      </Box>
    </Box>
  );


  const mobileView = (
    <Box m="20px">
      <Header
        title={t("users.titleClientsEco")}
        subtitle={t("users.subtitleClientsECO")}
        actionElement={
          <Box display="flex" alignItems="center" justifyContent="space-between" >
            <Box flex={1} display="flex" alignItems="center" justifyContent="center" mr={2} >
              <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px" sx={{ width: '100%', marginLeft: theme.spacing(3.2) }}>
                <InputBase
                  sx={{ ml: 1, flex: 1, color: 'white', fontSize: '0.75rem' }} // Reducir el tamaño de la fuente
                  placeholder={t("orders.searchPlaceholder")}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: '10px', color: 'white' }}>
                  <SearchIcon />
                </IconButton>
              </Box>
            </Box>
            {/* <IconButton
              style={{ color: colors.greenAccent[400] }} // Ajustar el margen izquierdo
              onClick={handleCreate}
            >
              <AddIcon />
            </IconButton> */}
          </Box>
        }
      />
      <Box m="10px 0 0 0">
        {filteredData.map((user) => (
          <Box
            key={user._id}
            bgcolor={theme.palette.background.paper}
            borderRadius="8px"
            p="16px"
            mb="16px"
            boxShadow={theme.shadows[1]}
          >
            <Box display="flex" flexDirection="column">
              {/* <Typography variant="body1" color={theme.palette.text.primary}>
                <strong>{t("users.columns.name")}:</strong> {user.name}
              </Typography> */}
              {/* <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.role")}:</strong>{" "}
                {t(`users.role.${user.role}`)}
              </Typography> */}
              <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.companyName")}:</strong>{" "}
                {user.clientName}
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.totalQuantity")}:</strong> {user.totalQuantity}
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.eco")}:</strong>{" "}
                {user.ecoStatus}
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.ecoEmissions")}:</strong>{" "}
                {user.ecoEmissions}
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary}>
                <strong>{t("users.columns.totalEmissions")}:</strong>{" "}
                {user.totalEmissions}
              </Typography>
            </Box>
            <Divider sx={{ my: 1, backgroundColor: theme.palette.divider }} />
            <Box display="flex" justifyContent="space-between">
              <IconButton onClick={() => handleEditUser(user._id)}>
                <EditIcon color={theme.palette.text.secondary} />
              </IconButton>
              {/* <IconButton color="error" onClick={() => handleDelete(user.id)}>
                <DeleteIcon />
              </IconButton> */}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );


  return isMobile ? mobileView : desktopView;
};

export default ClientsEco;
