import React, { useState } from "react";
import { Box, Typography, useTheme, IconButton, Button, InputBase } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Header from "../../components/Header";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Snackbar, Alert } from "@mui/material";

const Team = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchText, setSearchText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const accessPriority = {
    admin: 1,
    technician: 2,
    client: 3,
  };

  const filteredData = mockDataTeam
    .filter((member) => member.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => accessPriority[a.access] - accessPriority[b.access]);

  const handleDelete = () => {
    if (selectionModel.length === 0) {

      setSnackbarOpen(true);
    } else {

      const newData = mockDataTeam.filter(
        (member) => !selectionModel.includes(member.id)
      );

    }
  };


  const handleCreate = () => {

  };


  const columns = [

    { field: "id", headerName: t("team.columns.id") },
    { field: "name", headerName: t("team.columns.name"), flex: 1, cellClassName: "name-column--cell" },
    { field: "age", headerName: t("team.columns.age"), type: "number", headerAlign: "left", align: "left" },
    { field: "phone", headerName: t("team.columns.phoneNumber"), flex: 1 },
    { field: "email", headerName: t("team.columns.email"), flex: 1 },
    {
      field: "role",
      headerName: t("users.columns.role"),
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            bgcolor: params.value === "admin" ? colors.redAccent[400] : 
                     params.value === "technician" ? colors.blueAccent[400] : 
                     colors.greenAccent[400],
            color: 'white',
            borderRadius: '4px',
            p: '3px',
          }}
        >
          {params.value === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {params.value === "technician" && <BuildOutlinedIcon />}
          {params.value === "client" && <PersonOutlineOutlinedIcon />}
          <Typography sx={{ ml: 1 }}>
            {t(`users.role.${params.value}`)}
          </Typography>
        </Box>
      )
    }
    

  ];

  const actionElements = (
    <Box display="flex" alignItems="center" gap={2}>
      <IconButton
        onClick={handleCreate}
        sx={{
          color: theme.palette.success.main,
          border: `1px solid ${theme.palette.success.main}`,
          borderRadius: 1,
          width: theme.spacing(4),
          height: theme.spacing(4),
        }}
      >
        <AddIcon />
      </IconButton>

      {/* Botón Eliminar */}
      <IconButton
        onClick={handleDelete}
        sx={{
          color: theme.palette.error.main,
          border: `1px solid ${theme.palette.error.main}`,
          borderRadius: 1,
          width: theme.spacing(4),
          height: theme.spacing(4),
        }}
      >
        <DeleteIcon />
      </IconButton>
      <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px">
        <InputBase
          sx={{ ml: 1, flex: 1, color: 'white', fontSize: '0.875rem' }}
          placeholder={t("team.searchPlaceholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: '10px', color: 'white' }}>
          <SearchIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box m="20px">
      <Header title={t("team.title")} subtitle={t("team.subtitle")} actionElement={actionElements} />
      {/* Botón de eliminación */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={filteredData}
          columns={columns}
          onSelectionModelChange={(newSelection) => {
            setSelectionModel(newSelection);
          }}
          selectionModel={selectionModel}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: '100%' }}>
            Ningún elemento seleccionado
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );

};

export default Team;
