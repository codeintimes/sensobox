import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const LineChart = ({ date }) => {
  const chartContainerRef = useRef();
  const [data, setData] = useState({ finalQuantity: [], quantityRate: [], initialQuantity: [] });


  const loadData = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await fetch(`/api/orders/stats?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setData({
          finalQuantity: data.map(item => ({ time: item.createdAt.split('T')[0], value: item.finalQuantity })),
          quantityRate: data.map(item => ({ time: item.createdAt.split('T')[0], value: item.quantityRate })),
          initialQuantity: data.map(item => ({ time: item.createdAt.split('T')[0], value: item.initialQuantity })),
        });
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const lineSeries1 = chart.addLineSeries({
        color: 'blue',
        title: 'Final Quantity',
      });

      const lineSeries2 = chart.addLineSeries({
        color: 'red',
        title: 'Quantity Rate',
      });

      const lineSeries3 = chart.addLineSeries({
        color: 'green',
        title: 'Initial Quantity',
      });

      lineSeries1.setData(data.finalQuantity);
      lineSeries2.setData(data.quantityRate);
      lineSeries3.setData(data.initialQuantity);

      return () => {
        chart.remove();
      };
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default LineChart;
