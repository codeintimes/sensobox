import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import React, { useState } from "react";
import { Box, IconButton, useTheme, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

import TableHeaderCreate from '../../components/TableHeaderCreate';
import { useNavigate } from "react-router-dom";
import Form from '../usersGroup/editClient';

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredData = mockDataContacts
    .filter((member) => member.name.toLowerCase().includes(searchText.toLowerCase()))

  const columns = [
    {
      field: "id",
      headerName: t("orders.columns.id"),
      flex: 0.5
    },
    {
      field: "registrarId",
      headerName: t("orders.columns.registrarId"),
      flex: 1
    },
    {
      field: "name",
      headerName: t("orders.columns.name"),
      flex: 1,
      cellClassName: "name-column--cell"
    },
    {
      field: "age",
      headerName: t("orders.columns.age"),
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 0.6
    },
    {
      field: "phone",
      headerName: t("orders.columns.phoneNumber"),
      flex: 1
    },
    {
      field: "email",
      headerName: t("orders.columns.email"),
      flex: 1
    },
    {
      field: "address",
      headerName: t("orders.columns.address"),
      flex: 1.5
    },
    {
      field: "city",
      headerName: t("orders.columns.city"),
      flex: 0.6
    },
    {
      field: "zipCode",
      headerName: t("orders.columns.zipCode"),
      flex: 0.5
    },
    {
      field: "edit",
      headerName: t("orders.columns.edit"),
      sortable: false,
      filterable: false,
      flex: 0.2,
      renderCell: (cellValues) => (
        <IconButton
          color="inherit"
          onClick={() => handleEdit(cellValues.id)}
          sx={{ color: theme.palette.common.white }}
        >
          <EditIcon />
        </IconButton>
      )
    },
    {
      field: "delete",
      headerName: t("orders.columns.delete"),
      sortable: false,
      filterable: false,
      flex: 0.3,
      renderCell: (cellValues) => (
        <IconButton
          color="error"
          onClick={() => handleDelete(cellValues.id)}
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];


  const handleCreate = () => {

    navigate("/createclient");
  };

  const handleEdit = (id) => {

    const clientToEdit = mockDataContacts.find((client) => client.id === id);

    navigate(`/editclient/${id}`, { state: { client: clientToEdit } });
  };
  

  const handleDelete = async (id) => {
    try {
      const jwt = localStorage.getItem("jwtToken")

      const response = await fetch(`URL_DEL_BACKEND/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`

        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el elemento');
      }


    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
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
    </Box>
  );

  return (
    <Box m="20px">
      <Header title={t("orders.title")} subtitle={t("orders.subtitle")} actionElement={actionElements} />
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
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          // localeText={t('mui.DataGrid', { returnObjects: true })}
          components={{
            Toolbar: () => <TableHeaderCreate handleCreate={handleCreate} />,
          }}
        />
      </Box>
    </Box>
    
  );
};

export default Contacts;
