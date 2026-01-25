// import React, { useEffect, useState } from 'react';
// import { ResponsiveLine } from "@nivo/line";
// import { useTheme } from "@mui/material";
// import { tokens } from "../theme";
// import config from "../../config";
// import {API_ORDERS} from "../config/config";

// const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const [data, setData] = useState([]);

//   const generateMonthStartDates = () => {
//     const now = new Date();
//     const monthStartDates = [];
//     for (let i = 11; i >= 0; i--) {
//       const monthStartDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       monthStartDates.push(monthStartDate);
//     }
//     return monthStartDates;
//   };

//   const monthStartDates = generateMonthStartDates();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${API_ORDERS.ORDERS}/weekly-stats`);
//         const jsonData = await response.json();
//         const formattedData = [{
//           id: 'Orders',
//           data: jsonData.map(item => {
//             return {
//               x: new Date(item.createdAt),
//               y: item.ordersNumber
//             };
//           })
//         }];
//         setData(formattedData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
  
//     fetchData();
//   }, []);

//   return (
//     <ResponsiveLine
//       data={data}
//       theme={{
//         axis: {
//           domain: {
//             line: {
//               stroke: colors.grey[100],
//             },
//           },
//           legend: {
//             text: {
//               fill: colors.grey[100],
//             },
//           },
//           ticks: {
//             line: {
//               stroke: colors.grey[100],
//               strokeWidth: 1,
//             },
//             text: {
//               fill: colors.grey[100],
//             },
//           },
//         },
//         legends: {
//           text: {
//             fill: colors.grey[100],
//           },
//         },
//         tooltip: {
//           container: {
//             color: colors.primary[500],
//           },
//         },
//       }}
//       colors={[colors.greenAccent[500]]}
//       margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
//       xScale={{ 
//         type: "time",
//         format: "%Y-%m-%d",
//         precision: "day",
//       }}
//       yScale={{
//         type: "linear",
//         min: "auto",
//         max: "auto",
//         stacked: true,
//         reverse: false,
//       }}
//       curve="catmullRom"
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         orient: "bottom",
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         format: "%b",
//         tickValues: monthStartDates,
//         legend: "Month of the Year",
//         legendOffset: 36,
//         legendPosition: "middle",
//       }}
//       axisLeft={{
//         orient: "left",
//         tickValues: 5,
//         tickSize: 3,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "Orders",
//         legendOffset: -40,
//         legendPosition: "middle",
//       }}
//       enableGridX={false}
//       enableGridY={true}
//       pointSize={8}
//       pointColor={{ theme: "background" }}
//       pointBorderWidth={2}
//       pointBorderColor={{ from: "serieColor" }}
//       pointLabelYOffset={-12}
//       useMesh={true}
//       legends={[
//         {
//           anchor: "bottom-right",
//           direction: "column",
//           justify: false,
//           translateX: 100,
//           translateY: 0,
//           itemsSpacing: 0,
//           itemDirection: "left-to-right",
//           itemWidth: 80,
//           itemHeight: 20,
//           itemOpacity: 0.75,
//           symbolSize: 12,
//           symbolShape: "circle",
//           symbolBorderColor: "rgba(0, 0, 0, .5)",
//           effects: [
//             {
//               on: "hover",
//               style: {
//                 itemBackground: "rgba(0, 0, 0, .03)",
//                 itemOpacity: 1,
//               },
//             },
//           ],
//         },
//       ]}
//     />
//   );
// };

// export default LineChart;
