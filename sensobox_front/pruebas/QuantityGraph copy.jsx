import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const QuantityGraph = () => {
    const chartContainerRef = useRef(null);
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState('1y'); // Estado inicial para el rango de tiempo

    const calculateStartDate = () => {
        const now = new Date();
        switch (dateRange) {
            case '1d': return new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
            case '2d': return new Date(now.setDate(now.getDate() - 2)).toISOString().split('T')[0];
            case '1w': return new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
            case '1m': return new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
            case '3m': return new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
            case '6m': return new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];
            case '1y': return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
            case '2y': return new Date(now.setFullYear(now.getFullYear() - 2)).toISOString().split('T')[0];
            default: return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const startDate = calculateStartDate();
                const base_url = 'http://localhost:4000'; // Asegúrate de cambiar esto según tu configuración de entorno.
                const url = `${base_url}/orders/fromDate/${startDate}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const json = await response.json();
                setData(json.map(item => ({
                    time: new Date(item.createdAt).getTime() / 1000, // convertir a timestamp de Unix en segundos
                    finalQuantity: parseFloat(item.finalQuantity),
                    quantityRate: parseFloat(item.quantityRate),
                    initialQuantity: parseFloat(item.initialQuantity),
                })).sort((a, b) => a.time - b.time)); // asegurarse de que los datos estén ordenados por tiempo
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, [dateRange]); // Volver a buscar cuando cambia el rango de fecha

    useEffect(() => {
        if (chartContainerRef.current && data.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: 400,
                layout: {
                    backgroundColor: '#ffffff',
                    textColor: '#333',
                },
                grid: {
                    vertLines: {
                        color: '#eee',
                    },
                    horzLines: {
                        color: '#eee',
                    },
                },
            });

            const xAxis = chart.timeScale();
            xAxis.applyOptions({
                timeVisible: true,
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    const date = new Date(time * 1000);
                    return date.toISOString().split('T')[0];
                },
            });

            const lineSeries1 = chart.addLineSeries({ color: 'blue', title: 'Final Quantity' });
            const lineSeries2 = chart.addLineSeries({ color: 'red', title: 'Quantity Rate' });
            const lineSeries3 = chart.addLineSeries({ color: 'green', title: 'Initial Quantity' });

            lineSeries1.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
            lineSeries2.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
            lineSeries3.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));

            return () => chart.remove();
        }
    }, [data]);

    return (
        <div>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option value="1d">Último día</option>
                <option value="2d">Últimos 2 días</option>
                <option value="1w">Última semana</option>
                <option value="1m">Último mes</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último año</option>
                <option value="2y">Últimos 2 años</option>
            </select>
            <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
        </div>
    );
};

export default QuantityGraph;
