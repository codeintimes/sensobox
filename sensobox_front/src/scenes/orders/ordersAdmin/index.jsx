import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { mockDataOrders } from "../../../data/mockData";
import Header from "../../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from "react";
import { Box, IconButton, useTheme, InputBase, Menu, MenuItem, Typography, useMediaQuery, Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import TableHeaderCreate from '../../../components/TableHeaderCreate';
import { useNavigate } from "react-router-dom";
import Form from '../../usersGroup/editClient';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import BuildIcon from '@mui/icons-material/Build';
import { API_ORDERS } from "../../../config/config";
import Popover from '@mui/material/Popover';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const OrdersAdmin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  // const [selectedOrder, //setSelectedOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const isTablet = useMediaQuery('(max-width:1500px)');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);

  const loadOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;

      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }
      const jwt = localStorage.getItem("jwtToken");
      const url = `${API_ORDERS.ORDERS}/company/?companyName=${encodeURIComponent(companyName)}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      // No need to check for response.ok in axios, directly use response.data
      const data = response.data;
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar los datos: ", error.message);
    }
  };

  const handleCreate = () => {
    navigate("/createOrder");
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDialog = (id) => {
    setOrderIdToDelete(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOrderIdToDelete(null);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await axios.delete(`${API_ORDERS.ORDERS}/${orderIdToDelete}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });
      handleCloseDialog();
      await loadOrders();
      navigate("/ordersAdmin");
    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
    }
  };

  const filteredData = orders.filter(
    (order) =>
      order.orderNumber.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchText.toLowerCase())
  );

  console.log("filteredData", filteredData)
  const handlequantityProcessed = (id) => {

    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    navigate(`/editQuantityProcessed/${id}`, { state: { order: orderToEdit } });
  };

  const handleDownloadPdf = async (id) => {

    try {
      const jwt = localStorage.getItem("jwtToken");
      const url = `${API_ORDERS.ORDERS}/${id}/download-pdf`;
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
      minWidth: 70,
      renderCell: isTablet
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "status",
      headerName: t("orders.columns.status"),
      type: "string",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        let icon, color;
        switch (params.value) {
          case 1:
            icon = <HourglassEmptyOutlinedIcon sx={{ color: 'white' }} />;
            color = colors?.redAccent?.[400] || '#f00';
            break;
          case 2:
            icon = <BuildOutlinedIcon sx={{ color: 'white' }} />;
            color = colors?.blueAccent?.[400] || '#00f';
            break;
          case 3:
            icon = <CheckCircleOutlineOutlinedIcon sx={{ color: 'white' }} />;
            color = colors?.greenAccent?.[400] || '#0f0';
            break;
          case 4:
            icon = <LocalShippingOutlinedIcon sx={{ color: 'white' }} />;
            color = colors?.orangeAccent?.[400] || '#ffa500';
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
              {t(`orders.status.${getStatusKey(params.value)}`)}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "clientName",
      headerName: t("orders.columns.clientName"),
      flex: 1, minWidth: 150,
      renderCell: isTablet
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
      flex: 1.5, minWidth: 150,
      renderCell: isTablet
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
      minWidth: 80,
      renderCell: isTablet
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
      minWidth: 70,
      renderCell: isTablet
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "quantityProcessed",
      headerName: t("orders.columns.quantityProcessed"),
      type: "number",
      flex: 1,
      minWidth: 90,
      renderCell: isTablet
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
      minWidth: 80,
      renderCell: isTablet
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
      renderCell: isTablet
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
      renderCell: isTablet
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
      renderCell: isTablet
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
      renderCell: isTablet
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
      minWidth: 50,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value} m²
        </Typography>
      ),
      valueFormatter: ({ value }) => `${value} m²`,
    },
    {
      field: "materialWeight",
      headerName: t("orders.columns.materialWeight"),
      type: "number",
      flex: 1,
      minWidth: 60,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value} Kg
        </Typography>
      ),
      // valueFormatter: ({ value }) => `${value} Kg`,
    },
    {
      field: "processingDate",
      headerName: t("orders.columns.processingDate"),
      type: "dateTime",
      flex: 1.4, minWidth: 150,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value}
        </Typography>
      ),
      valueGetter: (params) => params.row.processingDate ? new Date(params.row.processingDate).toLocaleString() : "",
      valueFormatter: ({ value }) => value,
    },
    {
      field: "processingTime",
      headerName: t("orders.columns.processingTime"),
      type: "number",
      flex: 1.5, minWidth: 100,
      renderCell: isTablet
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "initialQuantity",
      headerName: t("orders.columns.initialQuantity"),
      type: "number",
      flex: 1,
      minWidth: 100,
      renderCell: isTablet
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
    },
    {
      field: "finalQuantity",
      headerName: t("orders.columns.finalQuantity"),
      type: "number",
      flex: 1,
      minWidth: 100,
      renderCell: isTablet
        ? (params) => (
          <Typography onClick={(event) => handleCellClick(params, event)}>
            {params.value}
          </Typography>
        )
        : undefined // No custom renderCell function when not on mobile
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
      field: "processingDateInitial",
      headerName: t("orders.columns.processingDateInitial"),
      type: "dateTime",
      flex: 1.4,
      minWidth: 150,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value}
        </Typography>
      ),
      valueGetter: (params) => params.row.processingDateInitial ? new Date(params.row.processingDateInitial).toLocaleString() : "",
      valueFormatter: ({ value }) => value,
    },
    {
      field: "processingDateFinal",
      headerName: t("orders.columns.processingDateFinal"),
      type: "dateTime",
      flex: 1.4,
      minWidth: 150,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value}
        </Typography>
      ),
      valueGetter: (params) => params.row.processingDateFinal ? new Date(params.row.processingDateFinal).toLocaleString() : "",
      valueFormatter: ({ value }) => value,
    },
    {
      field: "createdAt",
      headerName: t("orders.columns.createdAt"),
      type: "dateTime",
      flex: 1.4, minWidth: 150,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value}
        </Typography>
      ),
      valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : "N/A",
    },
    {
      field: "updatedAt",
      headerName: t("orders.columns.updatedAt"),
      type: "dateTime",
      flex: 1.4, minWidth: 150,
      renderCell: (params) => (
        <Typography onClick={(event) => handleCellClick(params, event)}>
          {params.value}
        </Typography>
      ),
      valueGetter: (params) => new Date(params.row.updatedAt).toLocaleString(),
    },

    {
      field: "",
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
            <MenuItem onClick={() => handlequantityProcessed(currentId)}>
              {t("orders.columns.quantityProcessed")}
            </MenuItem>
            <MenuItem onClick={() => handleEditMaterial(currentId)}>
              {t("orders.columns.material")}
            </MenuItem>
            <MenuItem onClick={() => handleEditOrder(currentId)}>
              {t("orders.columns.editSelector")}
            </MenuItem>
            <MenuItem onClick={() => handleOpenDialog(currentId)}>
              {t("orders.columns.delete")}
            </MenuItem>
          </Menu>
        </>
      )
    }
  ];

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


  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditOrder = (id) => {
    console.log("11111111111", id)
    const orderToEdit = orders.find((order) => order._id === id);
    console.log("11111111111", id, orderToEdit)
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();
    //setSelectedOrder(orderToEdit);
    console.log("11111111111", id, orderToEdit)
    navigate(`/editOrder/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditOpiInitial = (id) => {

    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();
    //setSelectedOrder(orderToEdit);

    navigate(`/editOpiInitial/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditOpiFinal = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();
    //setSelectedOrder(orderToEdit);

    navigate(`/editOpiFinal/${id}`, { state: { order: orderToEdit } });
  };

  const handleEditMaterial = (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (!orderToEdit) {
      console.error("Orden no encontrada");
      return;
    }
    handleClose();
    //setSelectedOrder(orderToEdit);

    navigate(`/editMaterial/${id}`, { state: { order: orderToEdit } });
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
      navigate("/ordersAdmin")
    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
    }
  };

  const actionElements = (
    <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
      <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius={theme.shape.borderRadius} p="2px" sx={{ width: isTablet ? '80%' : 'auto' }}>
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
      <Popover
        open={popover.open}
        onClose={handleClosePopover}
        anchorReference="anchorPosition"
        anchorPosition={popover.anchorPosition}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>{popover.content}</Typography>
      </Popover>
      <Box
        m="10px 0 0 0"
        height={isTablet ? "90vh" : "75vh"}
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
          width: isTablet ? 'auto' : 'auto',
          maxWidth: isTablet ? '100%' : 'none',
        }}
      >
<DataGrid
  rows={filteredData}
  columns={columns}
  getRowId={(row) => row._id}
  components={{ Toolbar: () => <TableHeaderCreate handleCreate={handleCreate} /> }}
  pageSizeOptions={[25]}
  pageSize={25}
  rowsPerPageOptions={[5, 10, 20]}
  pagination
  sx={{ '& .MuiDataGrid-toolbarContainer .MuiButton-text': { fontSize: isMobile ? '0.450rem' : '0.875rem' } }}
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
  //   // toolbarDensity: t('DataGrid.toolbarDensity'), // Cambia "Density"
  //   // toolbarDensityLabel: t('DataGrid.toolbarDensityLabel'), // Cambia "Density"
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
  //   // rowsPerPage: t('DataGrid.rowsPerPage'), // Añadir traducción de "Rows per page"
  //   // columnsPanelTextFieldLabel: t('DataGrid.columnsPanelTextFieldLabel'), // Añadir traducción de "Column Title"
  //   // columnsPanelTextFieldPlaceholder: t('DataGrid.columnsPanelTextFieldPlaceholder'),
  //   // columnsPanelDragIconLabel: t('DataGrid.columnsPanelDragIconLabel'),
  //   // columnsPanelShowAllButton: t('DataGrid.columnsPanelShowAllButton'),
  //   // columnsPanelHideAllButton: t('DataGrid.columnsPanelHideAllButton'),
  //   // filterPanelAddFilter: t('DataGrid.filterPanelAddFilter'),
  //   // filterPanelDeleteIconLabel: t('DataGrid.filterPanelDeleteIconLabel'),
  //   // filterPanelOperators: t('DataGrid.filterPanelOperators'), // Añadir traducción de "Operator"
  //   // filterPanelColumns: t('DataGrid.filterPanelColumns'), // Añadir traducción de "Columns"
  //   // filterPanelInputLabel: t('DataGrid.filterPanelInputLabel'),
  //   // filterPanelInputPlaceholder: t('DataGrid.filterPanelInputPlaceholder'),
  //   // filterOperatorContains: t('DataGrid.filterOperatorContains'),
  //   // filterOperatorEquals: t('DataGrid.filterOperatorEquals'),
  //   // filterOperatorStartsWith: t('DataGrid.filterOperatorStartsWith'),
  //   // filterOperatorEndsWith: t('DataGrid.filterOperatorEndsWith'),
  //   // filterOperatorIs: t('DataGrid.filterOperatorIs'),
  //   // filterOperatorNot: t('DataGrid.filterOperatorNot'),
  //   // filterOperatorAfter: t('DataGrid.filterOperatorAfter'),
  //   // filterOperatorOnOrAfter: t('DataGrid.filterOperatorOnOrAfter'),
  //   // filterOperatorBefore: t('DataGrid.filterOperatorBefore'),
  //   // filterOperatorOnOrBefore: t('DataGrid.filterOperatorOnOrBefore'),
  //   // filterOperatorIsEmpty: t('DataGrid.filterOperatorIsEmpty'),
  //   // filterOperatorIsNotEmpty: t('DataGrid.filterOperatorIsNotEmpty'),
  //   // filterOperatorIsAnyOf: t('DataGrid.filterOperatorIsAnyOf')
  // }}
/>

      </Box>
      {isMobile && <Box height={50} />} {/* Añade esta línea */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t("orders.dialog.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("orders.dialog.confirmDeleteText")}</DialogContentText>
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
            {t("orders.dialog.cancel")}
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
            {t("orders.dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersAdmin;
