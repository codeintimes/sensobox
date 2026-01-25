import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, FormControl, InputLabel, Select, MenuItem, useTheme } from "@mui/material";
import { tokens } from "../src/theme";
import Header from "../src/components/Header";
import { API_ORDERS } from "../src/config/config";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const QuantityGraph = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const chartContainerRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('1y');
    const [showFinalQuantity, setShowFinalQuantity] = useState(true);
    const [showQuantityRate, setShowQuantityRate] = useState(true);
    const [showInitialQuantity, setShowInitialQuantity] = useState(true);
    const [showTrendLineFinal, setShowTrendLineFinal] = useState(true);
    const [showTrendLineInitial, setShowTrendLineInitial] = useState(true);
    const [showTrendLineQuantityRate, setShowTrendLineQuantityRate] = useState(true);
    const { t } = useTranslation();

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

    const getData = async () => {
        try {
            const startDate = calculateStartDate();
            
            const url = `${API_ORDERS.ORDERS}/fromDate/${startDate}`;
            const jwt = localStorage.getItem("jwtToken");
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
                finalQuantity: parseFloat(item.finalQuantity),
                quantityRate: parseFloat(item.quantityRate),
                initialQuantity: parseFloat(item.initialQuantity),
            })).sort((a, b) => a.time - b.time));
        } catch (error) {
            console.error('Failed to get data:', error);
        }
    };

    useEffect(() => {
        getData();
    }, [selectedPeriod]);

    useEffect(() => {
        if (chartContainerRef.current && data.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,





                layout: {
                    backgroundColor: '#000000',
                    textColor: '#FFF',
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











            let lineSeries1, lineSeries2, lineSeries3, trendLineSeriesRate, trendLineSeriesFinal, trendLineSeriesInitial = [];
            let hasActiveSeries = false;

            if (data.length > 0) {

                if (showInitialQuantity) {
                    lineSeries1 = chart.addLineSeries({ color: 'green', title: 'Initial Quantity' });
                    lineSeries1.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));
                    hasActiveSeries = true;
                    if (!showTrendLineFinal) {
                        lineSeries1.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
                    }
                }

                if (showFinalQuantity) {
                    lineSeries2 = chart.addLineSeries({ color: 'blue', title: 'Final Quantity' });
                    lineSeries2.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
                    if (!showTrendLineFinal) {
                        lineSeries2.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'blue' }]);
                    }
                    hasActiveSeries = true;
                }

                if (showQuantityRate) {
                    lineSeries3 = chart.addLineSeries({ color: 'red', title: 'Quantity Rate' });
                    lineSeries3.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
                    if (!showTrendLineFinal) {
                        lineSeries3.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'red' }]);
                    }
                    hasActiveSeries = true;
                }

                if (showTrendLineInitial) {
                    const trendColorInitial = 'orange';
                    const trendDataInitial = calculateTrendData(data, selectedPeriod, 'initialQuantity');
                    trendLineSeriesInitial = chart.addLineSeries({
                        color: trendColorInitial,
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Initial Quantity',
                    });
                    hasActiveSeries = true;

                    trendLineSeriesInitial.setData(trendDataInitial);
                }

                if (showTrendLineFinal) {
                    const trendColorFinal = 'yellow';
                    const trendDataFinal = calculateTrendData(data, selectedPeriod, 'finalQuantity');
                    trendLineSeriesFinal = chart.addLineSeries({
                        color: trendColorFinal,
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Final Quantity',
                    });
                    hasActiveSeries = true;
                    trendLineSeriesFinal.setData(trendDataFinal);
                }

                if (showTrendLineQuantityRate) {
                    trendLineSeriesRate = chart.addLineSeries({
                        color: 'purple',
                        lineWidth: 2,
                        priceLineVisible: true,
                        title: 'Trend Quantity Rate',
                    });
                    const trendDataRate = calculateTrendData(data, selectedPeriod, 'quantityRate');
                    trendLineSeriesRate.setData(trendDataRate);
                    hasActiveSeries = true;
                }

                if (hasActiveSeries) {
                    const fromDate = new Date(calculateStartDate()).getTime() / 1000;
                    const toDate = new Date().getTime() / 1000;
                    chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });
                }


                return () => chart.remove();
            };
        }
    }, [data, selectedPeriod, showFinalQuantity, showQuantityRate, showInitialQuantity, showTrendLineFinal, showTrendLineInitial, showTrendLineQuantityRate]);

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
    };

    const handleShowFinalQuantityChange = (e) => {
        setShowFinalQuantity(e.target.checked);
    };

    const handleShowQuantityRateChange = (e) => {
        setShowQuantityRate(e.target.checked);
    };

    const handleShowInitialQuantityChange = (e) => {
        setShowInitialQuantity(e.target.checked);
    };

    const handleShowTrendLineFinalChange = (e) => {
        setShowTrendLineFinal(e.target.checked);
    };

    const handleShowTrendLineInitialChange = (e) => {
        setShowTrendLineInitial(e.target.checked);
    };

    const calculateTrendData = (data, selectedPeriod, propertyName) => {
        const trendData = [];
        const weeks = selectedPeriod === '1y' ? 52 : selectedPeriod === '2y' ? 104 : 0;
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


    const actionElements = (
        <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Periodo</InputLabel>
    
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedPeriod}
                label="Period"
                onChange={handlePeriodChange}
                sx={{
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                }}
            >
                <MenuItem value="1d">Last Day</MenuItem>
                <MenuItem value="1w">Last Week</MenuItem>
                <MenuItem value="1m">Last Month</MenuItem>
                <MenuItem value="3m">Last 3 Months</MenuItem>
                <MenuItem value="6m">Last 6 Months</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
                <MenuItem value="2y">Last 2 Years</MenuItem>
            </Select>
        </FormControl>
    </Box>
      );



    return (
        <Box m="20px">
        <Header title="Gráfico de cantidades" subtitle="Gráfico tiempo de cantidades" actionElement={actionElements}/>
        <Box height="75vh">
        <div style={{ width: '100%', height: '90%' }}>

            <div>
                <label>
                    <input type="checkbox" checked={showFinalQuantity} onChange={handleShowFinalQuantityChange} />
                    Final Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineFinal} onChange={handleShowTrendLineFinalChange} />
                    Tendencia Final Quantity
                </label>

                <label>
                    <input type="checkbox" checked={showInitialQuantity} onChange={handleShowInitialQuantityChange} />
                    Initial Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineInitial} onChange={handleShowTrendLineInitialChange} />
                    Tendencia Initial Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showQuantityRate} onChange={handleShowQuantityRateChange} />
                    Quantity Rate
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineQuantityRate} onChange={(e) => setShowTrendLineQuantityRate(e.target.checked)} />
                    Tendencia Quantity Rate
                </label>
            </div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
        </Box>
    </Box>
    );
};

export default QuantityGraph;
