// Barra de herramientas de tabla: «Nueva…» como botón claro.
import React from 'react';
import { Box, Button } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { GridToolbar } from '@mui/x-data-grid';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LABEL = { '/ordersAdmin': 'table.newOrder', '/clients': 'table.newClient', '/technicians': 'table.newTechnician', '/admins': 'table.newUser' };
const TableHeaderCreate = ({ handleCreate }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', pr: '12px' }}>
      <GridToolbar />
      <Button className="sb-new" variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate} sx={{ borderRadius: '10px', height: 36, px: '14px', whiteSpace: 'nowrap' }}>
        {t(LABEL[pathname] || 'table.new')}
      </Button>
    </Box>
  );
};
export default TableHeaderCreate;
