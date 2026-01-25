import React from 'react';
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox2 = ({ title, subtitle, icon, progress, increase, condition, condition2 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getColor = (condition,condition2) => {
    return condition<=condition2 ? colors.greenAccent[600] : colors.redAccent[600];
  };
  const iconWithColor = React.cloneElement(icon, {
    sx: { color: getColor(condition, condition2), fontSize: "26px" }
  });

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {iconWithColor}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[100] }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={progress} color={getColor(condition, condition2)} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: getColor(condition, condition2) }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: getColor(condition, condition2) }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox2;






























