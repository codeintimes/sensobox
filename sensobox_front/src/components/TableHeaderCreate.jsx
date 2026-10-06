// Barra de herramientas de tabla de demo (overlay fuera del repo): «Nueva…» como botón claro.
import React from 'react';
import { Box, Button } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { GridToolbar } from '@mui/x-data-grid';
import { useLocation } from 'react-router-dom';

const LABEL = { '/ordersAdmin': 'Nueva orden', '/clients': 'Nuevo cliente', '/technicians': 'Nuevo técnico', '/admins': 'Nuevo usuario' };
const TableHeaderCreate = ({ handleCreate }) => {
  const { pathname } = useLocation();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: '12px' }}>
      <GridToolbar />
      <Button className="sb-new" variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate} sx={{ borderRadius: '10px', height: 36, px: '14px' }}>
        {LABEL[pathname] || 'Nuevo'}
      </Button>
    </Box>
  );
};
export default TableHeaderCreate;
