import React, { useEffect, useState } from 'react';
import { ResponsiveLine } from "@nivo/line";
import { useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../theme";
import { API_ORDERS } from "../config/config";
import { useTranslation } from "react-i18next";
import axios from 'axios';  // Importa axios

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompactLayout = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado
  const [maxY, setMaxY] = useState(10); // Inicializa el maxY con un valor por defecto
  const { t, i18n } = useTranslation();

//   const generateMonthLabels = () => {
//     const now = new Date();
//     const monthLabels = [];
//     for (let i = 0; i < 12; i++) {
//       const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       monthLabels.push(month.toLocaleDateString(i18n.language, { month: 'short' }));
//     }
// console.log("r",monthLabels)
//     return monthLabels.reverse();
//   };

//   const monthLabels = generateMonthLabels();

useEffect(() => {
  const getData = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;

      const response = await axios.get(`${API_ORDERS.ORDERS}/weekly-stats/${companyName}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      const jsonData = response.data;
      console.log("22", jsonData);
      const ordersNumbers = jsonData.map(item => item.ordersNumber);
      const max = Math.max(...ordersNumbers);
      const maxOrders = max + max * 0.25;
      console.log("2222", jsonData);
      let previousMonth = '';
      const formattedData = [{
        id: t('dashboard.orders'),
        data: jsonData.map(item => {
          const monthYear = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const showLabel = monthYear !== previousMonth;
          previousMonth = monthYear;
          return {
            x: new Date(item.createdAt).toISOString().split('T')[0], // ISO format YYYY-MM-DD
            y: item.ordersNumber,
            monthLabel: showLabel ? monthYear : ''
          };
        })
      }];
      setData(formattedData);

      setMaxY(maxOrders);
    } catch (error) {
      console.error('Error getting data:', error);
    }
  };

  getData();
}, []);

  

  const legends = isMobile ? [] : [
    {
      anchor: "bottom-right",
      direction: "column",
      justify: false,
      translateX: 100,
      translateY: 0,
      itemsSpacing: 0,
      itemDirection: "left-to-right",
      itemWidth: 80,
      itemHeight: 20,
      itemOpacity: 0.75,
      symbolSize: 12,
      symbolShape: "circle",
      symbolBorderColor: "rgba(0, 0, 0, .5)",
      effects: [
        {
          on: "hover",
          style: {
            itemBackground: "rgba(0, 0, 0, .03)",
            itemOpacity: 1,
          },
        },
      ],
    }
  ];

  const margin = isMobile
  ? { top: 30, right: 20, bottom: 40, left: 40 } // Margen ajustado para dispositivos móviles
  : { top: 50, right: 110, bottom: 50, left: 60 }; // Margen por defecto

  const axisLeftConfig = isMobile ? {} : {
    orient: "left",
    tickValues: 5,
    tickSize: 3,
    tickPadding: 5,
    tickRotation: 0,
    legend: t('dashboard.orders'),
    legendOffset: -40,
    legendPosition: "middle",
  };

  const getMonthLabel = (value, i18n) => {
    const date = new Date(value);
    return date.toLocaleDateString(i18n.language, { month: 'short' });
  };

  const getFormattedDate = (value, i18n) => {
    const date = new Date(value);
    return date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <ResponsiveLine
      data={data}
      debugMesh={false}
      debugSlices={false}
      layers={['grid', 'markers', 'areas', 'lines', 'slices', 'points', 'axes', 'legends']}
      enablePoints={true}
      enablePointLabel={true}
      pointLabel="value"
      enableArea={true}
      areaOpacity={0.1}
      areaBlendMode="multiply"
      areaBaselineValue={0}
      lineWidth={2}
      isInteractive={true}
      enableSlices="x"
      tooltip={({ point }) => (
        <div>
          <strong>{getFormattedDate(point.data.x, i18n)}</strong>: {point.data.yFormatted}
        </div>
      )}
      sliceTooltip={({ slice }) => (
        <div>
          {slice.points.map(point => (
            <div key={point.id}>
              {getFormattedDate(point.data.x, i18n)}: {point.data.yFormatted}
            </div>
          ))}
        </div>
      )}bleCrosshair={true}
      crosshairType="cross"
      role="application"
      defs={[
        {
          id: 'gradientA',
          type: 'linearGradient',
          colors: [
            { offset: 0, color: 'rgba(255, 255, 255, 0.7)' },
            { offset: 100, color: colors.greenAccent[500] }
          ],
        }
      ]}
      fill={[
        { match: '*', id: 'gradientA' }
      ]}      
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={[colors.greenAccent[500]]}
      margin={margin}
      xScale={{
        type: "time",
        format: "%Y-%m-%d",  // Format the date from ISO string
        precision: "day",  // Day precision for xScale
      }}
      yScale={{
        type: "linear",
        min: 0,
        max: maxY,
        stacked: true,
        reverse: false,
      }}
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: value => getMonthLabel(value, i18n),
        tickValues: "every 1 month",  // Display a tick every month
        // legend: "Month of the Year",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={axisLeftConfig}
      enableGridX={false}
      enableGridY={true}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={legends}
    />
  );
};

export default LineChart;
