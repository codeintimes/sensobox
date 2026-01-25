import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../src/theme";
import Header from "../src/components/Header";
import { Box, IconButton, InputBase, useTheme, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TableHeaderCreate from '../src/components/TableHeaderCreate';
import {API_USERS} from "../src/config/config";
const Clients = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }
  
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${API_USERS.USERS}/clients?companyName=${companyName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();


      const remappedData = data.map(user => ({
        ...user,
        id: user._id
      }));
      setUsers(remappedData);
    } catch (error) {
      console.error("Error loading the data:", error);
    }
  };
  
  const handleCreate = () => {

    navigate("/createClient");
  };
  const handleEditUser = (id) => {

    const userToEdit = users.find((user) => user.id === id);
    if (!userToEdit) {
      console.error("Orden no encontrada");
      return;
    }



    navigate(`/editClient/${id}`, { state: { user: userToEdit } });
  };
  useEffect(() => {
    loadUsers();
  }, []);

  const filteredData = users.filter(user =>
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      field: "role",
      headerName: t("users.columns.role"),
      flex: 1,
      renderCell: (params) => {
        let icon, color;
        switch (params.value) {
          case 'admin':
            icon = <AdminPanelSettingsOutlinedIcon sx={{ color: 'white' }} />;
            color = colors.redAccent[400];
            break;
          case 'technician':
            icon = <BuildOutlinedIcon sx={{ color: 'white' }} />;
            color = colors.blueAccent[400];
            break;
          case 'client':
            icon = <PersonOutlineOutlinedIcon sx={{ color: 'white' }} />;
            color = colors.greenAccent[400];
            break;
          default:
            icon = null;
            color = 'transparent';
        }

        return (
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor={color}
            borderRadius="4px"
            p="5px"
          >
            {icon}
            <Typography color="white" sx={{ ml: 1 }}>
              {t(`users.role.${params.value}`)}
            </Typography>
          </Box>
        );
      }
    },
    { field: "name", headerName: t("users.columns.name"), flex: 1.5 },
    { field: "companyName", headerName: t("users.columns.companyName"), flex: 1.5 },

    { field: "email", headerName: t("users.columns.email"), flex: 1.5 },
    { field: "contactName", headerName: t("users.columns.contactName"), flex: 1.5 },
    { field: "contactPhone", headerName: t("users.columns.contactPhone"), flex: 1.5 },
    { field: "contactEmail", headerName: t("users.columns.contactEmail"), flex: 1.5 },
  
    {
      field: "createdAt", headerName: t("users.columns.createdAt"), flex: 0.7,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() : ""
    },
    {
      field: "updatedAt", headerName: t("users.columns.updatedAt"), flex: 0.7,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() : ""
    },

    {
      field: "edit", headerName: t("users.columns.edit"), sortable: false, filterable: false, flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton onClick={() => handleEditUser(cellValues.id)}>
          <EditIcon />
        </IconButton>
      )
    },
    {
      field: "delete", headerName: t("users.columns.delete"), sortable: false, filterable: false, flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton color="error" onClick={() => handleDelete(cellValues.id)}>
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  const handleDelete = async (id) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${API_USERS.USERS}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete the user');
      loadUsers();
    } catch (error) {
      console.error('Error deleting the user:', error);
    }
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
      <IconButton color="primary" onClick={() => navigate("/createUser")}>
        <AddIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box m="20px">
      <Header title={t("users.titleClients")} subtitle={t("users.subtitleClients")} actionElement={actionElements} />
      <Box
        m="10px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          }
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id} 



          components={{
            Toolbar: () => <TableHeaderCreate handleCreate={handleCreate} />,
          }}

        />
      </Box>
    </Box>
  );
};

export default Clients;
