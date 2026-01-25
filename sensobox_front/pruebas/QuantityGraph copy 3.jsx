import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const QuantityGraph = () => {
    const chartContainerRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('1y'); // Estado inicial para el período seleccionado

    const calculateStartDate = () => {
        const now = new Date();
        switch (selectedPeriod) {
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

    const fetchData = async () => {
        try {
            const startDate = calculateStartDate();
            const base_url = 'http://localhost:4000';
            const url = `${base_url}/orders/fromDate/${startDate}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const json = await response.json();
            setData(json.map(item => ({
                time: new Date(item.createdAt).getTime() / 1000,
                finalQuantity: parseFloat(item.finalQuantity),
                quantityRate: parseFloat(item.quantityRate),
                initialQuantity: parseFloat(item.initialQuantity),
            })).sort((a, b) => a.time - b.time));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedPeriod]);

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

            const lineSeries1 = chart.addLineSeries({ color: 'blue', title: 'Final Quantity' });
            const lineSeries2 = chart.addLineSeries({ color: 'red', title: 'Quantity Rate' });
            const lineSeries3 = chart.addLineSeries({ color: 'green', title: 'Initial Quantity' });

            lineSeries1.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
            lineSeries2.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
            lineSeries3.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));

            // Hacer zoom al período seleccionado
            const fromDate = new Date(calculateStartDate()).getTime() / 1000;
            const toDate = new Date().getTime() / 1000;
            chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });

            return () => chart.remove();
        }
    }, [data]);

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
    };

    return (
        <div>
            <select value={selectedPeriod} onChange={handlePeriodChange}>
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
