import React from 'react';
import { Box, IconButton, useTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { GridToolbar } from '@mui/x-data-grid';

const TableHeaderCreate = ({ handleCreate }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <GridToolbar />
      <IconButton
        onClick={handleCreate}
        sx={{ color: theme.palette.success.main }}
      >
        <AddIcon sx={{ fontSize: 30 }} />
      </IconButton>
    </Box>
  );
};

export default TableHeaderCreate;
