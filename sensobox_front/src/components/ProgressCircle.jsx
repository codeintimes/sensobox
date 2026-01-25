import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const ProgressCircle = ({ progress, color , size = "40" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
console.log("color",color)
// const color = color
  // const color = progress < 0 ? colors.redAccent[500] : colors.greenAccent[500];
  const angle = Math.abs(progress) * 360;


  return (
    <Box
      sx={{
        background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg),
            ${color}`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default ProgressCircle;
