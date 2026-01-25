import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { useTheme } from "@mui/material";
import { tokens } from "../src/theme";
import { API_ORDERS } from "../src/config/config";
import axios from 'axios';

const ProcessingGraph = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const chartContainerRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('1y');
    const [showTrendLineFinal, setShowTrendLineFinal] = useState(true);
    const [showTrendLineInitial, setShowTrendLineInitial] = useState(true);
    const [showTrendLineRate, setShowTrendLineRate] = useState(true);

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

    useEffect(() => {
        const getData = async () => {
            try {
                const jwt = localStorage.getItem("jwtToken");
                const userData = JSON.parse(localStorage.getItem('userData')) || {};
                const companyName = userData.companyName;
                console.log("1111111111111111113e",companyName, userData)
                const startDate = calculateStartDate();
                const url = `${API_ORDERS.ORDERS}/processing-stats/${startDate}/${companyName}`; // Agregar companyName a la URL
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const json = await response.json();
                setData(json.map(item => ({
                    time: new Date(item.createdAt).getTime() / 1000,
                    processingTime: parseFloat(item.processingTime),
                    processingTimeReal: parseFloat(item.processingTimeReal),
                    processingTimeRate: parseFloat(item.processingTimeRate),
                })).sort((a, b) => a.time - b.time));
            } catch (error) {
                console.error('Failed to get data:', error);
            }
        };
    
        getData();
    }, [selectedPeriod]);
    

    useEffect(() => {
        if (chartContainerRef.current && data.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,
                layout: {
                    backgroundColor: colors.background,
                    textColor: colors.text,
                },
                grid: {
                    vertLines: {
                        color: colors.gridLine,
                    },
                    horzLines: {
                        color: colors.gridLine,
                    },
                },
            });

            let trendLineSeriesRate, trendLineSeriesFinal, trendLineSeriesInitial;
            let hasActiveSeries = false;

            if (data.length > 0) {
                if (showTrendLineInitial) {
                    const trendColorInitial = 'orange';
                    trendLineSeriesInitial = chart.addLineSeries({
                        color: trendColorInitial,
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Initial Processing Time',
                    });
                    const trendDataInitial = calculateTrendData(data, selectedPeriod, 'processingTimeReal');
                    trendLineSeriesInitial.setData(trendDataInitial);
                    hasActiveSeries = true;
                }

                if (showTrendLineFinal) {
                    const trendColorFinal = 'yellow';
                    trendLineSeriesFinal = chart.addLineSeries({
                        color: trendColorFinal,
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Final Processing Time',
                    });
                    const trendDataFinal = calculateTrendData(data, selectedPeriod, 'processingTime');
                    trendLineSeriesFinal.setData(trendDataFinal);
                    hasActiveSeries = true;
                }

                if (showTrendLineRate) {
                    trendLineSeriesRate = chart.addLineSeries({
                        color: 'purple',
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Processing Time Rate',
                    });
                    const trendDataRate = calculateTrendData(data, selectedPeriod, 'processingTimeRate');
                    trendLineSeriesRate.setData(trendDataRate);
                    hasActiveSeries = true;
                }
            }

            if (hasActiveSeries) {
                const fromDate = new Date(calculateStartDate()).getTime() / 1000;
                const toDate = new Date().getTime() / 1000;
                chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });
            }

            return () => chart.remove();
        }
    }, [data, selectedPeriod, showTrendLineFinal, showTrendLineInitial, showTrendLineRate]);

    const calculateTrendData = (data, selectedPeriod, propertyName) => {
        const trendData = [];
        let weeks = 0;
    
        switch (selectedPeriod) {
            case '1d':
                weeks = 1;
                break;
            case '2d':
                weeks = 1;
                break;
            case '1w':
                weeks = 1;
                break;
            case '1m':
                weeks = 4;
                break;
            case '3m':
                weeks = 12;
                break;
            case '6m':
                weeks = 26;
                break;
            case '1y':
                weeks = 52;
                break;
            case '2y':
                weeks = 104;
                break;
            default:
                weeks = 52;
                break;
        }
    
        if (weeks > 0) {
            for (let i = 0; i < data.length; i += weeks) {
                const startIndex = i;
                const endIndex = Math.min(i + weeks - 1, data.length - 1);
                const averageValue = data.slice(startIndex, endIndex + 1).reduce((acc, curr) => acc + curr[propertyName], 0) / (endIndex - startIndex + 1);
                trendData.push({ time: data[startIndex].time, value: averageValue });
            }
        }
        return trendData;
    };
    

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
    };

    const handleShowTrendLineFinalChange = (e) => {
        setShowTrendLineFinal(e.target.checked);
    };

    const handleShowTrendLineInitialChange = (e) => {
        setShowTrendLineInitial(e.target.checked);
    };

    const handleShowTrendLineRateChange = (e) => {
        setShowTrendLineRate(e.target.checked);
    };

    return (
        <div style={{ width: '100%', height: '90%' }}>
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
            <div>
                <label>
                    <input type="checkbox" checked={showTrendLineFinal} onChange={handleShowTrendLineFinalChange} />
                    Tendencia Tiempo de Procesamiento Final
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineInitial} onChange={handleShowTrendLineInitialChange} />
                    Tendencia Tiempo de Procesamiento Inicial
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineRate} onChange={handleShowTrendLineRateChange} />
                    Tendencia Tasa de Tiempo de Procesamiento
                </label>
            </div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default ProcessingGraph;
