import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { API_ORDERS } from "../config/config";
import axios from 'axios';

const LineChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [timeRange, setTimeRange] = useState('1y');
  const [data, setData] = useState([]);
  const startDate = '2023-01-01';

  useEffect(() => {
    const getData = async () => {
      try {
        const url = `${API_ORDERS.ORDERS}/fromDate/${startDate}`;
        const jwt = localStorage.getItem("jwtToken");
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });
        const dataResponse = response.data;
        const formattedData = dataResponse.map(item => ({
          x: new Date(item.createdAt).toISOString().split('T')[0],
          y: item.finalQuantity,
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error getting data:', error);
      }
    };

    getData();
  }, [startDate]);

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
      data={[{id: 'line', data: data}]}
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
