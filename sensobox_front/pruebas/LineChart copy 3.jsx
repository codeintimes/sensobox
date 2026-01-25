import React, { useState } from 'react';
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../src/theme";
import { mockLineData as data } from "../src/data/mockData";

const periodos = [
  { label: 'Un Día', value: '1d' },
  { label: 'Una Semana', value: '1w' },
  { label: 'Un Mes', value: '1m' },
  { label: '3 Meses', value: '3m' },
  { label: '6 Meses', value: '6m' },
  { label: 'Un Año', value: '1y' },
  { label: '5 Años', value: '5y' },
];

const LineChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [timeRange, setTimeRange] = useState('1y'); // Estado inicial para el rango de tiempo

  // Calcula min y max basado en timeRange
  const calculateTimeRange = (range) => {
    const now = new Date();
    switch(range) {
      case '1d':
        return { min: new Date(now.setDate(now.getDate() - 1)), max: new Date() };
      case '1w':
        return { min: new Date(now.setDate(now.getDate() - 7)), max: new Date() };
      case '1m':
        return { min: new Date(now.setMonth(now.getMonth() - 1)), max: new Date() };
      case '1y':
      default:
        return { min: new Date(now.setFullYear(now.getFullYear() - 1)), max: new Date() };
    }
  };

  const { min, max } = calculateTimeRange(timeRange);
  
  return (
    <ResponsiveLine
      data={data}
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
      colors={{ scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{
        type: "time",
        format: "%Y-%m-%d",
        precision: "day",
        min: "2023-01-01",
        max: "2023-12-31",
      }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        format: "%b %d",
        tickValues: "every 1 month",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "2023",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: "value",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={true}
      enableGridY={true}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
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
        },
      ]}
    />
  );
};

export default LineChart;

