import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { mockDataOrders } from "../../../data/mockData";
import Header from "../../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from "react";
import { Box, IconButton, useTheme, InputBase, useMediaQuery, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import TableHeaderCreate from '../../../components/TableHeaderCreate';
import { useNavigate } from "react-router-dom";
import Form from '../../usersGroup/editClient';
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';

const OrdersClient = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isMobile = useMediaQuery('(max-width:1500px)');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      const clientName = userData.clientName;

      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }

      const jwt = localStorage.getItem("jwtToken");
      const url = `${API_ORDERS.ORDERS}/company?companyName=${encodeURIComponent(companyName)}&clientName=${encodeURIComponent(clientName)}`;
      console.log("URL construida:", url);
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });


      const data = response.data;
      console.log("Datos recibidos:", data);
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar los datos: ", error.message);
    }
  };

  const getStatusKey = (status) => {
    switch (status) {
      case 1:
        return "pending";
      case 2:
        return "processing";
      case 3:
        return "processed";
      case 4:
        return "shipping";
      default:
        return "unknown";
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredData = orders
    .filter((order) => order.orderNumber.toString().includes(searchText));

  const [popover, setPopover] = useState({
    open: false,
    anchorPosition: { top: 0, left: 0 },
    content: ''
  });

  const handleCellClick = (params, event) => {
    const { clientX, clientY } = event;
    setPopover({
      open: true,
      anchorPosition: { top: clientY, left: clientX },
      content: params.value
    });
  };

  const handleClosePopover = () => {
    setPopover(prev => ({
      ...prev,
      open: false
    }));
  };

  const columns = [
    {
      field: "orderNumber", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.orderNumber"), flex: 1, align: "center", headerAlign: "center"
    },
    {
      field: "workName", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.workName"), flex: 1.3
    },
    {
      field: "workType", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.workType"), flex: 1
    },
    {
      field: "productionQuantity", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.productionQuantity"), type: "number", flex: 1
    },
    {
      field: "quantityProcessed", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
      headerName: t("orders.columns.quantityProcessed"),
      type: "number",
      flex: 1,
    },
    {
      field: "colors", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.colors"), flex: 1
    },
    {
      field: "processes", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.processes"), flex: 1
    },
    {
      field: "specialFinishes", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.specialFinishes"), flex: 1
    },
    {
      field: "palletsNumber", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.palletsNumber"), type: "number", flex: 1
    },
    {
      field: "materialArea",
      headerName: t("orders.columns.materialArea"),
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value} m²
          </Typography>
        )
        : undefined, type: "number",
      flex: 1,
      // valueFormatter: ({ value }) => `${value} m²`,
    },
    {
      field: "materialWeight",
      headerName: t("orders.columns.materialWeight"),
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value} Kg
          </Typography>
        )
        : undefined, type: "number",
      flex: 1,
      // valueFormatter: ({ value }) => `${value} Kg`,
    },

    {
      field: "processingDate", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.processingDate"), type: "dateTime", flex: 1.4, align: "center", headerAlign: "center",
      valueGetter: (params) => params.row.processingDate ? new Date(params.row.processingDate).toLocaleString() : "",
      valueFormatter: ({ value }) => value,
    },
    {
      field: "processingTime", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.processingTime"), type: "number", flex: 1.5
    },
    {
      field: "status", minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined, headerName: t("orders.columns.status"), type: "string", flex: 1, align: "center", headerAlign: "center",
      valueGetter: (params) => t(`orders.status.${getStatusKey(params.row.status)}`),
      renderCell: (cellValues) => <span>{cellValues.value}</span>
    }
  ];

  const handleCreate = () => {

    navigate("/createOrder");
  };

  const handleEditOpiInitial = (id) => {

    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    setSelectedOrder(orderToEdit);

    navigate(`/editOpiInitial/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditOpiFinal = (id) => {

    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    setSelectedOrder(orderToEdit);

    navigate(`/editOpiFinal/${id}`, { state: { order: orderToEdit } });
  };




  const handleDelete = async (id) => {
    try {
      const jwt = localStorage.getItem("jwtToken")

      const response = await axios.delete(`URL_DEL_BACKEND/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });




    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
    }
  };

  const translationObject = {
    toolbarDensity: t('DataGrid.toolbarDensity'),
    toolbarDensityLabel: t('DataGrid.toolbarDensityLabel'),
    toolbarDensityCompact: t('DataGrid.toolbarDensityCompact'),
    toolbarDensityStandard: t('DataGrid.toolbarDensityStandard'),
    toolbarDensityComfortable: t('DataGrid.toolbarDensityComfortable'),
    toolbarColumns: t('DataGrid.toolbarColumns'),
    toolbarColumnsLabel: t('DataGrid.toolbarColumnsLabel'),
    toolbarFilters: t('DataGrid.toolbarFilters'),
    toolbarFiltersLabel: t('DataGrid.toolbarFiltersLabel'),
    toolbarFiltersTooltipShow: t('DataGrid.toolbarFiltersTooltipShow'),
    toolbarFiltersTooltipHide: t('DataGrid.toolbarFiltersTooltipHide'),
    toolbarExport: t('DataGrid.toolbarExport'),
    toolbarExportLabel: t('DataGrid.toolbarExportLabel'),
    toolbarExportCSV: t('DataGrid.toolbarExportCSV'),
    toolbarExportPrint: t('DataGrid.toolbarExportPrint'),
    toolbarExportExcel: t('DataGrid.toolbarExportExcel'),
    columnMenuLabel: t('DataGrid.columnMenuLabel'),
    columnMenuShowColumns: t('DataGrid.columnMenuShowColumns'),
    columnMenuFilter: t('DataGrid.columnMenuFilter'),
    columnMenuHideColumn: t('DataGrid.columnMenuHideColumn'),
    columnMenuUnsort: t('DataGrid.columnMenuUnsort'),
    columnMenuSortAsc: t('DataGrid.columnMenuSortAsc'),
    columnMenuSortDesc: t('DataGrid.columnMenuSortDesc'),
    noRowsLabel: t('DataGrid.noRowsLabel'),
    footerRowSelected: t('DataGrid.footerRowSelected'),
    footerRowSelected_plural: t('DataGrid.footerRowSelected_plural'),
    footerTotalRows: t('DataGrid.footerTotalRows'),
    footerTotalVisibleRows: t('DataGrid.footerTotalVisibleRows'),
    rowsPerPage: t('DataGrid.rowsPerPage')
  };

  const actionElements = (
    <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
      <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px" sx={{ width: isMobile ? '80%' : 'auto' }}>
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
      <Box m="10px 0 0 0" height={isMobile ? "90vh" : "75vh"} sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .name-column--cell": { color: colors.greenAccent[300] },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
        "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
        width: isMobile ? 'auto' : 'auto', // Utiliza toda la anchura disponible en móviles
        maxWidth: isMobile ? '100%' : 'none', // Asegura que en móviles la tabla no sea más ancha que la pantalla
      }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          sx={{
            '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
              fontSize: isMobile ? '0.450rem' : '0.875rem', // Reduce font size for toolbar buttons in mobile
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
          // localeText={{
          //   toolbarDensity: t('DataGrid.toolbarDensity'),
          //   toolbarDensityLabel: t('DataGrid.toolbarDensityLabel'),
          //   toolbarDensityCompact: t('DataGrid.toolbarDensityCompact'),
          //   toolbarDensityStandard: t('DataGrid.toolbarDensityStandard'),
          //   toolbarDensityComfortable: t('DataGrid.toolbarDensityComfortable'),
          //   toolbarColumns: t('DataGrid.toolbarColumns'),
          //   toolbarColumnsLabel: t('DataGrid.toolbarColumnsLabel'),
          //   toolbarFilters: t('DataGrid.toolbarFilters'),
          //   toolbarFiltersLabel: t('DataGrid.toolbarFiltersLabel'),
          //   toolbarFiltersTooltipShow: t('DataGrid.toolbarFiltersTooltipShow'),
          //   toolbarFiltersTooltipHide: t('DataGrid.toolbarFiltersTooltipHide'),
          //   toolbarExport: t('DataGrid.toolbarExport'),
          //   toolbarExportLabel: t('DataGrid.toolbarExportLabel'),
          //   toolbarExportCSV: t('DataGrid.toolbarExportCSV'),
          //   toolbarExportPrint: t('DataGrid.toolbarExportPrint'),
          //   toolbarExportExcel: t('DataGrid.toolbarExportExcel'),
          //   columnMenuLabel: t('DataGrid.columnMenuLabel'),
          //   columnMenuShowColumns: t('DataGrid.columnMenuShowColumns'),
          //   columnMenuFilter: t('DataGrid.columnMenuFilter'),
          //   columnMenuHideColumn: t('DataGrid.columnMenuHideColumn'),
          //   columnMenuUnsort: t('DataGrid.columnMenuUnsort'),
          //   columnMenuSortAsc: t('DataGrid.columnMenuSortAsc'),
          //   columnMenuSortDesc: t('DataGrid.columnMenuSortDesc'),
          //   noRowsLabel: t('DataGrid.noRowsLabel'),
          //   footerRowSelected: t('DataGrid.footerRowSelected'),
          //   footerRowSelected_plural: t('DataGrid.footerRowSelected_plural'),
          //   footerTotalRows: t('DataGrid.footerTotalRows'),
          //   footerTotalVisibleRows: t('DataGrid.footerTotalVisibleRows'),
          //   rowsPerPage: t('DataGrid.rowsPerPage'),
          //   columnsPanelTextFieldLabel: t('DataGrid.columnsPanelTextFieldLabel'),
          //   columnsPanelTextFieldPlaceholder: t('DataGrid.columnsPanelTextFieldPlaceholder'),
          //   columnsPanelDragIconLabel: t('DataGrid.columnsPanelDragIconLabel'),
          //   columnsPanelShowAllButton: t('DataGrid.columnsPanelShowAllButton'),
          //   columnsPanelHideAllButton: t('DataGrid.columnsPanelHideAllButton'),
          //   filterPanelAddFilter: t('DataGrid.filterPanelAddFilter'),
          //   filterPanelDeleteIconLabel: t('DataGrid.filterPanelDeleteIconLabel'),
          //   filterPanelOperators: t('DataGrid.filterPanelOperators'),
          //   filterPanelColumns: t('DataGrid.filterPanelColumns'),
          //   filterPanelInputLabel: t('DataGrid.filterPanelInputLabel'),
          //   filterPanelInputPlaceholder: t('DataGrid.filterPanelInputPlaceholder'),
          //   filterOperatorContains: t('DataGrid.filterOperatorContains'),
          //   filterOperatorEquals: t('DataGrid.filterOperatorEquals'),
          //   filterOperatorStartsWith: t('DataGrid.filterOperatorStartsWith'),
          //   filterOperatorEndsWith: t('DataGrid.filterOperatorEndsWith'),
          //   filterOperatorIs: t('DataGrid.filterOperatorIs'),
          //   filterOperatorNot: t('DataGrid.filterOperatorNot'),
          //   filterOperatorAfter: t('DataGrid.filterOperatorAfter'),
          //   filterOperatorOnOrAfter: t('DataGrid.filterOperatorOnOrAfter'),
          //   filterOperatorBefore: t('DataGrid.filterOperatorBefore'),
          //   filterOperatorOnOrBefore: t('DataGrid.filterOperatorOnOrBefore'),
          //   filterOperatorIsEmpty: t('DataGrid.filterOperatorIsEmpty'),
          //   filterOperatorIsNotEmpty: t('DataGrid.filterOperatorIsNotEmpty'),
          //   filterOperatorIsAnyOf: t('DataGrid.filterOperatorIsAnyOf')
          // }}
        />
      </Box>
    </Box>

  );
};

export default OrdersClient;
