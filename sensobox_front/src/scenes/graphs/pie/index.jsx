import { Box } from "@mui/material";
import Header from "../../../components/Header";
import PieChart from "../../../components/PieChart";
import { useTranslation } from "react-i18next";

const Pie = () => {
  const { t } = useTranslation();
  return (
    <Box m="20px">
      <Header title={t("pie.title")} subtitle={t("pie.subtitle")} />
      <Box height="75vh">
        <PieChart />
      </Box>
    </Box>
  );
};

export default Pie;
