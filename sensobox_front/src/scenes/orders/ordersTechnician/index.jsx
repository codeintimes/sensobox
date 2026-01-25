import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { mockDataOrders } from "../../../data/mockData";
import Header from "../../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from "react";
import { Box, IconButton, useTheme, InputBase, Menu, MenuItem, useMediaQuery, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import TableHeaderCreate from '../../../components/TableHeaderCreate';
import { useNavigate } from "react-router-dom";
import Form from '../../usersGroup/editClient';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { API_ORDERS } from "../../../config/config";
import Popover from '@mui/material/Popover';
import axios from 'axios';

const OrdersTechnician = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const isMobile = useMediaQuery('(max-width:1500px)');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      console.log("6666", userData)
      const name = userData.name;
      if (!name || !companyName) {
        console.error("No se encontró el nombre del técnico o el nombre de la compañía en el almacenamiento.");
        return;
      }
      console.log("userData", userData)
      const jwt = localStorage.getItem("jwtToken");
      const url = `${API_ORDERS.ORDERS}/technician/?technician=${name}&companyName=${companyName}`;
      console.log("3333", url)
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      const data = response.data;
      console.log("3333data", data)
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar los datos: ", error.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const handleDownloadPdf = async (id) => {
    const url = `${API_ORDERS.ORDERS}/${id}/download-pdf`;
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      handleClose();
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `order_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const filteredData = orders.filter(
    (order) =>
      order.orderNumber.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreate = () => {
    navigate("/createOrder");
  };

  const handleEditOrder = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();

    navigate(`/editOrder/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditOpiInitial = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }

    handleClose();

    navigate(`/editOpiInitial/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditOpiFinal = (id) => {

    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();

    navigate(`/editOpiFinal/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditMaterial = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();

    navigate(`/editMaterial/${id}`, { state: { order: orderToEdit } });
  };

  const handlequantityProcessed = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    navigate(`/editQuantityProcessed/${id}`, { state: { order: orderToEdit } });
  };

  const handleDelete = async (id) => {
    try {
      const jwt = localStorage.getItem("jwtToken")

      const response = await axios.delete(`${API_ORDERS.ORDERS}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });
      handleClose();

      await loadOrders();
      navigate("/ordersTechnician")
    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
    }
  };

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
      field: "orderNumber",
      headerName: t("orders.columns.orderNumber"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "clientName",
      headerName: t("orders.columns.clientName"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "workName",
      headerName: t("orders.columns.workName"),
      flex: 1.5,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "workType",
      headerName: t("orders.columns.workType"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "productionQuantity",
      headerName: t("orders.columns.productionQuantity"),
      type: "number",
      flex: 1,
      minWidth: 80,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "colors",
      headerName: t("orders.columns.colors"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "processes",
      headerName: t("orders.columns.processes"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "specialFinishes",
      headerName: t("orders.columns.specialFinishes"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "technician",
      headerName: t("orders.columns.technician"),
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "palletsNumber",
      headerName: t("orders.columns.palletsNumber"),
      type: "number",
      flex: 1,
      minWidth: 50,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "materialArea",
      headerName: t("orders.columns.materialArea"),
      type: "number",
      flex: 1,
      minWidth: 80,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value} m²
          </Typography>
        )
        : undefined,
      valueFormatter: ({ value }) => `${value} m²`,
    },
    {
      field: "materialWeight",
      headerName: t("orders.columns.materialWeight"),
      type: "number",
      flex: 1,
      minWidth: 80,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value} Kg
          </Typography>
        )
        : undefined,
      // valueFormatter: ({ value }) => `${value} Kg`,
    },
    {
      field: "processingDate",
      headerName: t("orders.columns.processingDate"),
      type: "dateTime",
      flex: 1.4,
      minWidth: 140,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
      valueGetter: (params) => params.row.processingDate ? new Date(params.row.processingDate).toLocaleString() : "",
      valueFormatter: ({ value }) => value,
    },
    {
      field: "processingTime",
      headerName: t("orders.columns.processingTime"),
      type: "number",
      flex: 1.5,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
    },
    {
      field: "initialQuantity",
      headerName: t("orders.columns.initialQuantity"),
      type: "number",
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
    },
    {
      field: "finalQuantity",
      headerName: t("orders.columns.finalQuantity"),
      type: "number",
      flex: 1,
      minWidth: 100,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
    },
    {
      field: "errorPercentage",
      headerName: t("orders.columns.errorPercentage"),
      type: "number",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        const initialQuantity = params.row.initialQuantity || 1; // Avoid division by zero
        const finalQuantity = params.row.finalQuantity || 0;
        const errorPercentage = ((initialQuantity - finalQuantity) / initialQuantity) * 100;
        return (
          <Typography>
            {errorPercentage.toFixed(2)}%
          </Typography>
        );
      }
    },
    {
      field: "quantityProcessed",
      headerName: t("orders.columns.quantityProcessed"),
      type: "number",
      flex: 1,
      minWidth: 120,
      renderCell: isMobile
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined,
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
    },
    {
      field: "actions",  // Even if it doesn't correspond to data, this needs to be unique and defined.
      headerName: "Actions",  // Set a header name for clarity    
      flex: 0.05,
      sortable: false,
      filterable: false,
      width: 20,
      disableColumnMenu: true,
      renderCell: (cellValues) => (
        <>
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={(event) => handleClick(event, cellValues.id)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl) && currentId === cellValues.id}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleEditOpiInitial(currentId)}>
              {t("orders.columns.opiInitialEdit")}
            </MenuItem>
            <MenuItem onClick={() => handleEditOpiFinal(currentId)}>
              {t("orders.columns.opiFinalEdit")}
            </MenuItem>
            <MenuItem onClick={() => handleEditMaterial(currentId)}>
              {t("orders.columns.editMaterial")}
            </MenuItem>
            <MenuItem onClick={() => handlequantityProcessed(currentId)}>
              {t("orders.columns.quantityProcessed")}
            </MenuItem>
            <MenuItem onClick={() => handleEditOrder(currentId)}>
              {t("orders.columns.editSelector")}
            </MenuItem>
            {/* <MenuItem onClick={() => handleDelete(currentId)}>
              {t("orders.columns.delete")}
            </MenuItem> */}
            {/* <MenuItem onClick={() => handleDownloadPdf(currentId)}>
              {t("orders.columns.download")}
            </MenuItem> */}
          </Menu>
        </>
      )
    }
  ];



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

  return (
    <Box m="20px">
      <Header title={t("orders.title")} subtitle={t("orders.subtitle")} actionElement={actionElements} />
      <Box
        m="10px 0 0 0"
        height={isMobile ? "90vh" : "75vh"} // Más alto en móviles para aprovechar mejor el espacio de la pantalla

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
          width: isMobile ? 'auto' : 'auto', // Utiliza toda la anchura disponible en móviles
          maxWidth: isMobile ? '100%' : 'none', // Asegura que en móviles la tabla no sea más ancha que la pantalla
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
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
          components={{
            Toolbar: () => <TableHeaderCreate handleCreate={handleCreate} />,
          }}
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
    </Box>

  );
};

export default OrdersTechnician;
