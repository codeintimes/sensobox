import React from 'react';
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, condition, condition2 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getColor = (increaseValue) => {
console.log("increaseValue",increaseValue)
    return increaseValue.includes('-') ? colors.redAccent[600] : colors.greenAccent[600];
  };
  const iconWithColor = React.cloneElement(icon, {
    sx: { color: getColor(increase), fontSize: "26px" }
  });

  const validIncrease = (increase) => {
    if (increase === null || increase === undefined || isNaN(increase)) {
      return '0';
    }
    return increase;
  };

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
          <ProgressCircle progress={progress} color={getColor(progress)}/>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
      <Typography variant="h5" sx={{ color: getColor(progress) }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: getColor(increase) }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
