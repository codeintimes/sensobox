import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography, useTheme, CircularProgress } from "@mui/material";
import { tokens } from "../src/theme";
import { mockTransactions } from "../src/data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../src/components/Header";
import LineChart from "../src/components/LineChart";
import GeographyChart from "../src/components/GeographyChart";
import BarChart from "../src/components/BarChart";
import PieChart from "../src/components/PieChart";
import StatBox from "../src/components/StatBox";
import ProgressCircle from "../src/components/ProgressCircle";
import { useTranslation } from 'react-i18next';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { API_ORDERS } from "../src/config/config";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jwt = localStorage.getItem("jwtToken");
        const url = `${API_ORDERS.ORDERS}/statistics`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const rates = Object.keys(data.statsLastMonth).reduce((acc, key) => {
          const keyLastYear = key.replace('LastMonth', 'LastYear');
          if (data.statsLastYear.hasOwnProperty(keyLastYear)) {
            const monthlyValue = data.statsLastMonth[key];
            const monthlyAverage = data.statsLastYear[keyLastYear];
            const rate = (monthlyValue / monthlyAverage) - 1;
            const increase = ((rate) * 100).toFixed(2);
            acc[key] = {
              rate: rate.toFixed(2),
              increase: `${increase}%`
            };
          }
          
          return acc;
        }, {});

        data.rates = rates;




        setStats(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getColor = (increaseValue) => {

    return increaseValue.includes('-') ? colors.redAccent[600] : colors.greenAccent[600];
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={theme.palette.background.default}>
        <CircularProgress size={50} color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={theme.palette.neutral.dark}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

















  const downloadPDF = () => {
    const input = document.getElementById('dashboardBox');


    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save("dashboard.pdf");
      })
      .catch(err => {
        console.error('Error al generar PDF:', err);
      });
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t('dashboard.welcome_title')} subtitle={t('dashboard.welcome_subtitle')} />
        <Box></Box>
        <Button
          onClick={downloadPDF}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.blueAccent[500],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Download Reports
        </Button>
      </Box>
      {/* <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box> */}

      {/* GRID & CHARTS */}
      <Box
        id="dashboardBox"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        {/* Producción Total */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats.statsLastMonth.totalProductionQuantityLastMonth.toFixed(2).toLocaleString()}/${stats.statsLastYear.totalProductionQuantityLastYear.toFixed(2).toLocaleString()}`}
            subtitle={t('dashboard.monthly_quantities')}
            icon={<PointOfSaleIcon sx={{ color: getColor(stats.rates.totalProductionQuantityLastMonth.rate.toLocaleString()), fontSize: "26px" }} />}
            progress={`${stats.rates.totalProductionQuantityLastMonth.rate.toLocaleString()}`}
            increase={`${stats.rates.totalProductionQuantityLastMonth.increase.toLocaleString()}`}
          />
        </Box>
        {/* Conteo de Órdenes */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats.statsLastMonth.orderCountLastMonth.toFixed(2)}/${stats.statsLastYear.orderCountLastYear.toFixed(2)}`}
            subtitle={t('dashboard.monthly_orders')}
            icon={<EmailIcon sx={{ color: getColor(stats.rates.orderCountLastMonth.rate.toLocaleString()), fontSize: "26px" }} />}
            progress={`${stats.rates.orderCountLastMonth.rate.toLocaleString()}`}
            increase={`${stats.rates.orderCountLastMonth.increase.toLocaleString()}`}
          />
        </Box>
        {/* Diferencia de Tiempo de Procesamiento */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats.statsLastMonth.totalProcessingTimeDifferenceLastMonth.toFixed(2)}/${stats.statsLastYear.totalProcessingTimeDifferenceLastYear.toFixed(2)}`}
            subtitle={t('dashboard.processing_delay')}
            icon={<TrafficIcon sx={{ color: getColor(stats.rates.totalProcessingTimeDifferenceLastMonth.rate.toLocaleString()), fontSize: "26px" }} />}
            progress={`${stats.rates.totalProcessingTimeDifferenceLastMonth.rate.toLocaleString()}`}
            increase={`${stats.rates.totalProcessingTimeDifferenceLastMonth.increase.toLocaleString()}`}
          />
        </Box>
        {/* Diferencia en Cantidad Final */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats.statsLastMonth.totalFinalQuantityDifferenceLastMonth.toFixed(2)}/${stats.statsLastYear.totalFinalQuantityDifferenceLastYear.toFixed(2)}`}
            subtitle={t('dashboard.monthly_losses')}
            icon={<PersonAddIcon sx={{ color: getColor(stats.rates.totalFinalQuantityDifferenceLastMonth.rate.toLocaleString()), fontSize: "26px" }} />}
            progress={`${stats.rates.totalFinalQuantityDifferenceLastMonth.rate.toLocaleString()}`}
            increase={`${stats.rates.totalFinalQuantityDifferenceLastMonth.increase.toLocaleString()}`}
          />
        </Box>
        {/* Diferencia de Fecha de Procesamiento */}
        {/* <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats.statsLastMonth.totalProcessingDateDifferenceLastMonth.toFixed(2)}/${stats.statsLastYear.totalProcessingDateDifferenceLastYear.toFixed(2)}`}
            subtitle={t('dashboard.processing_date_difference')}
            icon={<PersonAddIcon sx={{ color: getColor(stats.rates.totalProcessingDateDifferenceLastMonth.rate.toLocaleString()), fontSize: "26px" }} />}
            progress={`${stats.rates.totalProcessingDateDifferenceLastMonth.rate.toLocaleString()}`}
            increase={`${stats.rates.totalProcessingDateDifferenceLastMonth.increase.toLocaleString()}`}
          />
        </Box> */}

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                {t('dashboard.orders')}
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {t('dashboard.graph_sub_title')}

              </Typography>
            </Box>
            {/* <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box> */}
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              {t('dashboard.pending_orders')}
            </Typography>
          </Box>
          {stats.allPending.map((transaction, i) => (
            <Box
              key={`${transaction.orderNumber}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {new Date(transaction.processingDate).toLocaleString()}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.technician}

                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.clientName}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >

                Nº {transaction.orderNumber}
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.redAccent[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              {t('dashboard.outdated_orders')}
            </Typography>
          </Box>
          {stats.futurePending.map((transaction, i) => (
            <Box
              key={`${transaction.orderNumber}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.redAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {new Date(transaction.processingDate).toLocaleString()}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.technician}

                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.clientName}</Box>
              <Box
                backgroundColor={colors.redAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >

                Nº {transaction.orderNumber}
              </Box>
            </Box>
          ))}
        </Box>
        {/* ROW 3 */}
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box> */}
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            {t('dashboard.quantities_by_technician')}
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart isDashboard={true} />
          </Box>
        </Box> */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            {t('dashboard.orders_by_client')}
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart isDashboard={true} data={stats.statsLastYear.totalOrdersByCompany} />
          </Box>
        </Box>
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
           {t('dashboard.orders_by_client')}
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart isDashboard={true} />
          </Box>
        </Box> */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            {t('dashboard.quantities_by_client')}
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart isDashboard={true} data={stats.statsLastYear.totalProductionByCompany} />
          </Box>
        </Box>
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default Dashboard;
