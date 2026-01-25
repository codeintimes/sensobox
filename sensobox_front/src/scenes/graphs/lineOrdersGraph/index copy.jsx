import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { useTranslation } from 'react-i18next'; // Importa la función useTranslation
import axios from 'axios';

const OrdersGraph = () => {
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
    const isMobile = useMediaQuery('(max-width:1500px)'); // Ajustar a tu punto de interrupción deseado
    const { t } = useTranslation(); // Inicializa la función useTranslation

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
            const jwt = localStorage.getItem("jwtToken");
            const userData = JSON.parse(localStorage.getItem('userData'));
            console.log(userData)
            const url = `${API_ORDERS.ORDERS}/fromDate/${startDate}`;
            let response;
    
            if (userData.role === 'client') {
                const queryParams = new URLSearchParams({
                    companyName: userData.companyName,
                    clientName: userData.clientName
                });
                console.log(url)
                const queryUrl = `${url}?${queryParams.toString()}`;
                console.log(queryUrl)
                response = await axios.get(queryUrl, {
                    headers: {
                      'Authorization': `Bearer ${jwt}`
                    }
                  });
                  
            } else {
                const queryParams = new URLSearchParams({
                    companyName: userData.companyName
                });
                const queryUrl = `${url}?${queryParams.toString()}`;
                response = await axios.get(queryUrl, {
                    headers: {
                      'Authorization': `Bearer ${jwt}`
                    }
                  });
                  
            }
 
            const data = response.data;
            console.log("data", data)
    
            const allDates = getAllDatesInPeriod(selectedPeriod);
            const orderCounts = {};
            allDates.forEach(date => {
                orderCounts[date] = 0;
            });
    
            data.forEach(item => {
                const date = new Date(item.createdAt).toISOString().split('T')[0];
                orderCounts[date] += 1;
            });
    
            const dataWithZeroValues = Object.keys(orderCounts).map(date => ({
                time: new Date(date).getTime() / 1000,
                orderCount: orderCounts[date]
            }));
    
            // Sort data by time
            dataWithZeroValues.sort((a, b) => a.time - b.time);
    
            console.log("dataWithZeroValues", dataWithZeroValues)
            setData(dataWithZeroValues);
        } catch (error) {
            console.error('Failed to get data:', error);
        }
    };

    const getAllDatesInPeriod = (selectedPeriod) => {
        const now = new Date();
        switch (selectedPeriod) {
            case '1d':
                return [new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]];
            case '2d':
                return [
                    new Date(now.setDate(now.getDate() - 2)).toISOString().split('T')[0],
                    new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]
                ];
            case '1w':
                const dates1w = [];
                for (let i = 0; i < 7; i++) {
                    dates1w.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates1w.reverse();
            case '1m':
                const dates1m = [];
                for (let i = 0; i < 30; i++) {
                    dates1m.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates1m.reverse();
            case '3m':
                const dates3m = [];
                for (let i = 0; i < 90; i++) {
                    dates3m.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates3m.reverse();
            case '6m':
                const dates6m = [];
                for (let i = 0; i < 180; i++) {
                    dates6m.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates6m.reverse();
            case '1y':
                const dates1y = [];
                for (let i = 0; i < 365; i++) {
                    dates1y.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates1y.reverse();
            case '2y':
                const dates2y = [];
                for (let i = 0; i < 730; i++) {
                    dates2y.push(new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
                }
                return dates2y.reverse();
            default:
                return [];
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
                    background: {
                        color: colors.primary[400],

                    },
                    textColor: colors.textContrast.main,
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


            let lineSeries1, lineSeries2, lineSeries3, trendLineSeriesRate, trendLineSeriesFinal, trendLineSeriesInitial = [];
            let hasActiveSeries = false;

            if (data.length > 0) {
                const seriesOptions = {
                    priceFormat: {
                      type: 'price',
                      precision: 0,  // This sets the precision to 0, removing decimals
                      minMove: 1,
                    },
                    // priceLineVisible: true,
                    // priceLineWidth: 2,
                    // priceLineColor: 'black',
                  };
                if (showInitialQuantity) {
                    lineSeries1 = chart.addLineSeries({ ...seriesOptions, color: colors.greenAccent[500], title: '' });
                    lineSeries1.setData(data.map(item => ({ time: item.time, value: item.orderCount })));
                    hasActiveSeries = true;
                    if (!showTrendLineFinal) {
                        lineSeries1.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
                    }
                }

                // if (showTrendLineInitial) {
                //     const trendColorInitial = colors.orangeSoft.main;
                //     const trendDataInitial = calculateTrendData(data, selectedPeriod, 'initialQuantity');
                //     trendLineSeriesInitial = chart.addLineSeries({
                //         color: trendColorInitial,
                //         lineWidth: 2,
                //         priceLineVisible: true,
                //         title: 'Trend Initial Quantity',
                //     });
                //     hasActiveSeries = true;

                //     trendLineSeriesInitial.setData(trendDataInitial);
                // }


                if (hasActiveSeries) {
                    const fromDate = new Date(calculateStartDate()).getTime() / 1000;
                    const toDate = new Date().getTime() / 1000;
                    chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });
                }


                return () => chart.remove();
            };
        }
    }, [data, selectedPeriod, showFinalQuantity, showQuantityRate, showInitialQuantity, showTrendLineFinal, showTrendLineInitial, showTrendLineQuantityRate, theme.palette.mode]);

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
    };

    const handleShowInitialQuantityChange = (e) => {
        setShowInitialQuantity(e.target.checked);
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
        <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
            <FormControl fullWidth >
                <InputLabel id="demo-simple-select-label">{t('ordersGraph.period')}</InputLabel>

                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedPeriod}
                    label={t('ordersGraph.period')}
                    onChange={handlePeriodChange}
                    sx={{
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    }}
                >
                    <MenuItem value="1d">{t('ordersGraph.lastDay')}</MenuItem>
                    <MenuItem value="1w">{t('ordersGraph.lastWeek')}</MenuItem>
                    <MenuItem value="1m">{t('ordersGraph.lastMonth')}</MenuItem>
                    <MenuItem value="3m">{t('ordersGraph.last3Months')}</MenuItem>
                    <MenuItem value="6m">{t('ordersGraph.last6Months')}</MenuItem>
                    <MenuItem value="1y">{t('ordersGraph.lastYear')}</MenuItem>
                    <MenuItem value="2y">{t('ordersGraph.last2Years')}</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );


    const CheckboxControl = ({ checked, onChange, label }) => (
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked}
                    onChange={onChange}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                        color: colors.greenAccent[500],
                        '&.Mui-checked': {
                            color: colors.greenAccent[600],
                        }
                    }}
                />
            }
            label={label}
            sx={{
                color: colors.text,
                '& .MuiFormControlLabel-label': {
                    fontSize: isMobile ? '0.55rem' : '1rem',  // Smaller font size for mobile
                },
            }}
        />
    );

    const nivoFormattedData = [{
        id: "Orders",
        data: data.map(item => ({
            x: new Date(item.time * 1000).toISOString().split('T')[0],
            y: item.orderCount
        }))
    }];


    return (
        <Box m="20px">
            <Header title={t('ordersGraph.graphTitle')}  subtitle={isMobile ? '' : t('ordersGraph.graphSubtitle')} actionElement={actionElements} style={{ fontSize: isMobile ? '1em' : '1.5em' }}/>
            <Box height="75vh">
                <div style={{ width: '100%', height: '95%' }}>
                    {/* <div>
                        <CheckboxControl
                            checked={showInitialQuantity}
                            onChange={handleShowInitialQuantityChange}
                            label={t('ordersGraph.ordersQuantity')}
                        />
                        {/* <CheckboxControl
                            checked={showTrendLineInitial}
                            onChange={handleShowTrendLineInitialChange}
                            label={t('ordersGraph.trendLineInitial')}
                        />
                    </div> */}
                    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </Box>
        </Box>
    );
};

export default OrdersGraph;
