import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { Box, IconButton, InputBase, useTheme, Typography, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TableHeaderCreate from '../../../components/TableHeaderCreate';
import { API_USERS } from "../../../config/config";
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';

const Employees = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery('(max-width:1500px)'); 
  const [filteredData, setFilteredData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  
  const handleOpenDialog = (id) => {
    setUserIdToDelete(id);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserIdToDelete(null);
  };
  
  const handleDeleteConfirmed = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      await axios.delete(`${API_USERS.USERS}/${userIdToDelete}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Error deleting the user:', error);
    }
  };
  
  const loadUsers = async () => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.get(`${API_USERS.USERS}/clientRole`, {
        params: {
          role: 'technician',
          companyName: companyName
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data;

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
    navigate("/createTechnician");
  };

  const handleEditUser = (id) => {

    const userToEdit = users.find((user) => user._id === id);
    if (!userToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    setSelectedUser(userToEdit);

    navigate(`/editClient/${id}`, { state: { user: userToEdit } });
  };
  useEffect(() => {
    loadUsers();
  }, []);

  // const filteredData = users.filter(user =>
  //   user.email.toLowerCase().includes(searchText.toLowerCase()) ||
  //   user.name.toLowerCase().includes(searchText.toLowerCase())
  // );

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [users, searchText]);

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
    // { field: "companyName", headerName: t("users.columns.companyName"), flex: 1.5 },
    { field: "clientName", headerName: t("users.columns.clientName"), flex: 1.5 },
    { field: "email", headerName: t("users.columns.email"), flex: 1.5 },
    {
      field: "createdAt", headerName: t("users.columns.createdAt"), flex: 1,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() : ""
    },
    {
      field: "updatedAt", headerName: t("users.columns.updatedAt"), flex: 1,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() : ""
    },

    {
      field: "edit", headerName: "", sortable: false, filterable: false, flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton onClick={() => handleEditUser(cellValues.id)}>
          <EditNoteIcon />
        </IconButton>
      )
    },
    {
      field: "delete", headerName: "", sortable: false, filterable: false, flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton color="error" onClick={() => handleOpenDialog(cellValues.id)}>
          <DeleteIcon />
        </IconButton>
      )
    }     
  ];

  const handleDelete = async (id) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.delete(`${API_USERS.USERS}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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
      {/* <IconButton color="primary" onClick={() => navigate("/createUser")}>
        <AddIcon />
      </IconButton> */}
    </Box>
  );
  const desktopView = (
    <Box m="20px">
      <Header title={t("users.titleEmployees")} subtitle={t("users.subtitleEmployees")} actionElement={actionElements} />
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
          width: 'auto',
          maxWidth: 'none',
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          // rowsPerPageOptions={[5, 10, 20]}
          rowsPerPageOptions={[]}//esto limita el rows per page
          pageSizeOptions={[25]}
          pagination
          components={{
            Toolbar: () => <TableHeaderCreate handleCreate={handleCreate} />,
          }}
          // localeText={t('DataGrid', { returnObjects: true })}
          sx={{
            '& .MuiDataGrid-toolbarContainer': {
              '& .MuiButton-text': {
                fontSize: isMobile ? '0.450rem' : '0.875rem', // Reduce font size for toolbar buttons in mobile
              },
            },
          }}
          componentsProps={{
            filterPanel: {
              sx: {
                '& .MuiDataGrid-filterForm': {
                  flexDirection: isMobile ? 'column' : 'row',
                  '& .MuiFormControl-root': {
                    minWidth: isMobile ? '100%' : 'auto', // Establece el ancho mínimo de los elementos del filtro
                    marginBottom: isMobile ? '8px' : '0', // Añade un margen inferior para los elementos en dispositivos móviles
                  },
                  width: isMobile ? '100%' : 'auto', // Ajusta el ancho del contenedor del filtro
                },
              },
            },
          }}
        />
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t("users.dialog.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("users.dialog.confirmDeleteText")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.greenAccent[400],
              '&:hover': {
                backgroundColor: colors.greenAccent[700]
              }
            }}
          >
            {t("users.dialog.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            sx={{
              color: colors.greenAccent[400],
              '&:hover': {
                backgroundColor: colors.greenAccent[700]
              }
            }}
            autoFocus
          >
            {t("users.dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );  

  const mobileView = (
    <Box m="20px">
      <Header
        title={t("users.titleEmployees")}
        subtitle={t("users.subtitleEmployees")}
        actionElement={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flex={1} display="flex" alignItems="center" justifyContent="center" mr={2}>
              <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px" sx={{ width: '100%', marginLeft: theme.spacing(3.2) }}>
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
            </Box>
            <IconButton
              style={{ color: colors.greenAccent[400] }}
              onClick={handleCreate}
            >
              <AddIcon />
            </IconButton>
          </Box>
        }
      />
      <Box m="10px 0 0 0">
        {filteredData.map(user => (
          <Box key={user.id} bgcolor={theme.palette.background.paper} borderRadius="8px" p="16px" mb="16px" boxShadow={theme.shadows[1]}>
            <Typography variant="body1" color={theme.palette.text.primary}>
              <strong>{t("users.columns.name")}:</strong> {user.name}
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              <strong>{t("users.columns.email")}:</strong> {user.email}
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              <strong>{t("users.columns.role")}:</strong> {t(`users.role.${user.role}`)}
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              <strong>{t("users.columns.companyName")}:</strong> {user.companyName}
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              <strong>{t("users.columns.createdAt")}:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              <strong>{t("users.columns.updatedAt")}:</strong> {new Date(user.updatedAt).toLocaleDateString()}
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <IconButton onClick={() => handleEditUser(user._id)}>
                <EditNoteIcon color={theme.palette.text.secondary} />
              </IconButton>
              <IconButton color="error" onClick={() => handleOpenDialog(user._id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t("users.dialog.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("users.dialog.confirmDeleteText")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.greenAccent[400],
              '&:hover': {
                backgroundColor: colors.greenAccent[700]
              }
            }}
          >
            {t("users.dialog.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            sx={{
              color: colors.greenAccent[400],
              '&:hover': {
                backgroundColor: colors.greenAccent[700]
              }
            }}
            autoFocus
          >
            {t("users.dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );  

  return isMobile ? mobileView : desktopView;
};

export default Employees;
