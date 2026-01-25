import React from 'react';
import { Box } from "@mui/material";
import Header from "../../src/components/Header";
import ProcessingGraph from "../../src/components/ProcessingGraph";

const Line = () => {
  return (
    <Box m="20px">
      <Header title="Quantity Graphs" subtitle="Gráfico tiempo de procesos" />
      <Box height="75vh">
        <ProcessingGraph />
      </Box>
    </Box>
  );
};

export default Line;
