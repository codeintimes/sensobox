import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography, useTheme, CircularProgress, useMediaQuery } from "@mui/material";
import { tokens } from "../../../theme";
import { mockTransactions } from "../../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import Header from "../../../components/Header";
import LineChart from "../../../components/LineChart";
// import GeographyChart from "../../../pruebas/GeographyChart";
// import BarChart from "../../../pruebas/BarChart";
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PieChart from "../../../components/PieChart";
import StatBox from "../../../components/StatBox";
import StatBox2 from "../../../components/StatBox2";
import ProgressCircle from "../../../components/ProgressCircle";
import { useTranslation } from 'react-i18next';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery('(max-width:1500px)'); // Este es el nuevo media query para 1200px

  useEffect(() => {
    const getStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const companyName = userData.companyName;

        if (!companyName) {
          console.error("No se encontró el nombre de la compañía.");
          return;
        }

        const jwt = localStorage.getItem("jwtToken");
        const url = `${API_ORDERS.ORDERS}/statistics/${companyName}`; // Agregar companyName a la URL

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!response.data) {
          throw new Error('Network response was not ok');
        }

        const data = response.data;
        console.log("data", data)

        const rates = Object.keys(data.statsLastMonth).reduce((acc, key) => {
          const keyLastYear = key.replace('LastMonth', 'LastYear');
          if (data.statsLastYear.hasOwnProperty(keyLastYear)) {
            const monthlyValue = data.statsLastMonth[key];
            const monthlyAverage = data.statsLastYear[keyLastYear];
            let rate = monthlyValue && monthlyAverage ? (monthlyValue / monthlyAverage) - 1 : 0;
            let increase = rate !== 0 ? ((rate) * 100).toFixed(2) : 0;
            acc[key] = {
              rate: rate.toFixed(2),
              increase: `${increase}%`
            };
          }

          return acc;
        }, {});

        console.log("rates", rates)
        data.rates = rates;
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    getStats();
  }, []);

  // const getColor = (increaseValue) => {

  //   return increaseValue.includes('-') ? colors.redAccent[600] : colors.greenAccent[600];
  // };

  // const getColorInverse = (condition, condition2) => {
  //   return condition < condition2 ? colors.greenAccent[600] : colors.redAccent[600];
  // };

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

  const increaseValueValid = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return value;
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t('dashboard.welcome_title')} subtitle={t('dashboard.welcome_subtitle')} />
        <Box></Box>
        {!isMobile && (
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
            {t('dashboard.download')}
          </Button>
        )}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        id="dashboardBox"
        display="grid"
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
        // gridTemplateColumns={isCompactLayout ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}

        gridAutoRows="131px"
        gap="20px"
        sx={{
          ...(isMobile && {
            m: 0, // Remover el margen en móviles
            width: '100%', // Asegurar que el Box ocupa todo el ancho
            maxWidth: '100%', // Prevenir cualquier overflow accidental
            overflow: 'hidden',
            '& > div': {
              m: 0, // Remover el margen en móviles
              width: '100%', // Asegurar que el Box ocupa todo el ancho
              maxWidth: '100%', // Prevenir cualquier overflow accidental
              overflowX: 'hidden', // Prevenir barras de desplazamiento innecesarias
              // marginBottom: '10px',//cambia espaciado entre elementos
              // '&:last-child': { marginBottom: '20px' }, 
            } // Prevenir barras de desplazamiento innecesarias
          })

        }}
      >
        {/* ROW 1 */}
        {/* Producción Total */}
        <Box gridColumn={isMobile ? "1 / -1" : "span 3"} backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats?.statsLastMonth?.totalProductionQuantityLastMonth.toFixed(0)}/${stats?.statsLastYear?.totalProductionQuantityLastYear?.toFixed(2)}`}
            subtitle={t('dashboard.monthly_quantities')}
            icon={<PointOfSaleIcon />}
            progress={`${stats?.rates?.totalProductionQuantityLastMonth?.rate?.toLocaleString()}`}
            increase={`${stats?.rates?.totalProductionQuantityLastMonth?.increase?.toLocaleString()}`}
          />
        </Box>
        {/* Conteo de Órdenes */}
        <Box gridColumn={isMobile ? "1 / -1" : "span 3"} backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`${stats?.statsLastMonth?.orderCountLastMonth.toFixed(0)}/${stats?.statsLastYear?.orderCountLastYear?.toFixed(2)}`}
            subtitle={t('dashboard.monthly_orders')}
            icon={<Inventory2Icon />}
            progress={`${stats?.rates?.orderCountLastMonth?.rate?.toLocaleString()}`}
            increase={`${stats?.rates?.orderCountLastMonth?.increase?.toLocaleString()}`}
          />
        </Box>
        {/* Diferencia de Tiempo de Procesamiento */}
        <Box gridColumn={isMobile ? "1 / -1" : "span 3"} backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox2
            title={`${stats?.statsLastMonth?.totalProcessingTimeDifferenceLastMonth?.toFixed(2)}/${stats?.statsLastYear?.totalProcessingTimeDifferenceLastYear?.toFixed(2)}`}
            subtitle={t('dashboard.processing_delay')}
            icon={<MoreTimeIcon />}
            progress={`${stats?.rates?.totalProcessingTimeDifferenceLastMonth?.rate?.toLocaleString()}`}
            increase={`${stats?.rates?.totalProcessingTimeDifferenceLastMonth?.increase?.toLocaleString()}`}
            condition={`${stats?.statsLastMonth?.totalProcessingTimeDifferenceLastMonth?.toFixed(2)}`}
            condition2={`${stats?.statsLastYear?.totalProcessingTimeDifferenceLastYear?.toFixed(2)}`}
          />
        </Box>
        {/* Diferencia en Cantidad Final */}
        <Box gridColumn={isMobile ? "1 / -1" : "span 3"} backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox2
            title={`${stats?.statsLastMonth?.totalFinalQuantityDifferenceLastMonth.toFixed(0)}/${stats?.statsLastYear?.totalFinalQuantityDifferenceLastYear?.toFixed(2)}`}
            subtitle={t('dashboard.monthly_losses')}
            icon={<BrokenImageIcon />}
            progress={`${stats?.rates?.totalFinalQuantityDifferenceLastMonth?.rate?.toLocaleString()}`}
            increase={`${stats?.rates?.totalFinalQuantityDifferenceLastMonth?.increase?.toLocaleString()}`}
            condition={`${stats?.statsLastMonth?.totalFinalQuantityDifferenceLastMonth?.toFixed(2)}`}
            condition2={`${stats?.statsLastYear?.totalFinalQuantityDifferenceLastYear?.toFixed(2)}`}
          />
        </Box>
        {/* ROW 2 */}
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 8"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow='hidden'
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
          </Box>
          <Box height={isMobile ? '240px' : '250px'} m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 4"}
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
          {stats.allPending.length > 0 ? (
            stats.allPending.map((transaction, i) => (
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
                  {t('dashboard.order_number_prefix')} {transaction.orderNumber}
                </Box>
              </Box>
            ))
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" p="15px" height="52%" sx={{ mt: 4 }}>
              <Typography color={colors.grey[100]} align="center" mt={1}>
                {t('dashboard.no_pending_orders')}
              </Typography>
            </Box>

          )}
        </Box>
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 4"}
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
          {stats.futurePending.length > 0 ? (
            stats.futurePending.map((transaction, i) => (
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
                  {t('dashboard.order_number_prefix')} {transaction.orderNumber}
                </Box>
              </Box>
            ))
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="52%" sx={{ mt: 4 }}>
              <Typography color={colors.grey[100]} align="center" mt={1}>
                {t('dashboard.no_outdated_orders')}
              </Typography>
            </Box>
          )}
        </Box>
        {/* ROW 3 */}
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 4"}
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
          <Box height={isMobile ? '190px' : '240px'} // Ajustar la altura del gráfico de pastel en la versión móvil
            mt={isMobile ? '10px' : '-20px'} display="flex" alignItems="center" justifyContent="center">
            {stats.statsLastYear.totalOrdersByCompany.length > 0 ? (
              <PieChart isDashboard={true} data={stats.statsLastYear.totalOrdersByCompany} />
            ) : (
              <Typography color={colors.grey[100]} variant="h6" align="center" sx={{ mt: 4 }}>
                {t('dashboard.no_orders_by_client')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 4"}
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
          <Box 
  height={isMobile ? '190px' : '240px'} // Ajustar la altura del gráfico de pastel en la versión móvil
  mt={isMobile ? '10px' : '-20px'} display="flex" alignItems="center" justifyContent="center">
  {stats.statsLastYear.totalOrdersByCompany.length > 0 ? (
    <PieChart isDashboard={true} data={stats.statsLastYear.totalOrdersByCompany} />
  ) : (
    <Typography color={colors.grey[100]} variant="h6" align="center" sx={{ mt: 4 }}>
      {t('dashboard.no_orders_by_client')}
    </Typography>
  )}
</Box>

        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
