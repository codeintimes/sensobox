import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { API_ORDERS } from "../../config/config";
import { useTranslation } from 'react-i18next'; // Importa la función useTranslation
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
    const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado
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
                const queryUrl = `${url}?${queryParams.toString()}`;
                response = await axios.get(queryUrl, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });

            } else {
                // Si el rol no es "client", simplemente envía la solicitud GET sin agregar parámetros de consulta
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
            const dataResponse = response.data;
            setData(dataResponse.map(item => ({
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
                    priceLineVisible: true,
                    priceLineWidth: 2,
                    // priceLineColor: 'black',
                  };
                if (showInitialQuantity) {
                    lineSeries1 = chart.addLineSeries({ ...seriesOptions, color: colors.greenAccent[500], title: isMobile ? '' : t('quantityGraph.initialQuantity')});
                    lineSeries1.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));
                    if (!showTrendLineFinal) {
                        lineSeries1.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
                    }
                    hasActiveSeries = true;
                    hasActiveSeries = true;
                }

                if (showFinalQuantity) {
                    lineSeries2 = chart.addLineSeries({ ...seriesOptions, color: colors.blueAccent[500], title: isMobile ? '' : t('quantityGraph.finalQuantity') });
                    lineSeries2.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
                    if (!showTrendLineFinal) {
                        lineSeries2.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'blue' }]);
                    }
                    hasActiveSeries = true;
                }

                if (showQuantityRate) {
                    lineSeries3 = chart.addLineSeries({ ...seriesOptions, color: 'red', title: isMobile ? '' : t('quantityGraph.quantityRate') });
                    lineSeries3.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
                    if (!showTrendLineFinal) {
                        lineSeries3.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'red' }]);
                    }
                    hasActiveSeries = true;
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

                // if (showTrendLineFinal) {
                //     const trendColorFinal = colors.yellowSoft.main;
                //     const trendDataFinal = calculateTrendData(data, selectedPeriod, 'finalQuantity');
                //     trendLineSeriesFinal = chart.addLineSeries({
                //         color: trendColorFinal,
                //         lineWidth: 2,
                //         priceLineVisible: true,
                //         title: 'Trend Final Quantity',
                //     });
                //     hasActiveSeries = true;
                //     trendLineSeriesFinal.setData(trendDataFinal);
                // }

                // if (showTrendLineQuantityRate) {
                //     trendLineSeriesRate = chart.addLineSeries({
                //         color: 'purple',
                //         lineWidth: 2,
                //         priceLineVisible: true,
                //         title: 'Trend Quantity Rate',
                //     });
                //     const trendDataRate = calculateTrendData(data, selectedPeriod, 'quantityRate');
                //     trendLineSeriesRate.setData(trendDataRate);
                //     hasActiveSeries = true;
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
        <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
            <FormControl fullWidth >
                <InputLabel id="demo-simple-select-label">{t('quantityGraph.periodLabel')}</InputLabel>

                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedPeriod}
                    label="Period"
                    onChange={handlePeriodChange}
                    sx={{
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        // fontSize: isMobile ? '0.2rem' : '1rem'
                    }}
                >
                    <MenuItem value="1d">{t('quantityGraph.lastDay')}</MenuItem>
                    <MenuItem value="1w">{t('quantityGraph.lastWeek')}</MenuItem>
                    <MenuItem value="1m">{t('quantityGraph.lastMonth')}</MenuItem>
                    <MenuItem value="3m">{t('quantityGraph.last3Months')}</MenuItem>
                    <MenuItem value="6m">{t('quantityGraph.last6Months')}</MenuItem>
                    <MenuItem value="1y">{t('quantityGraph.lastYear')}</MenuItem>
                    <MenuItem value="2y">{t('quantityGraph.last2Years')}</MenuItem>
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

    // const CheckboxControl = ({ checked, onChange, label }) => (
    //     <FormControlLabel
    //         control={<Checkbox checked={checked} onChange={onChange} />}
    //         label={label}
    //         sx={{
    //             color: colors.text,
    //             '& .MuiFormControlLabel-label': {
    //                 fontSize: isMobile ? '0.8rem' : '1rem',  // Smaller font size for mobile
    //             },
    //         }}
    //     />
    // );

    return (
        <Box m="20px">
            <Header title={t('quantityGraph.graphTitle')}  subtitle={isMobile ? '' : t('quantityGraph.graphSubtitle')} actionElement={actionElements} />
            <Box height="75vh">
                <div style={{ width: '100%', height: '90%' }}>

                    <div>
                        <CheckboxControl
                            checked={showInitialQuantity}
                            onChange={handleShowInitialQuantityChange}
                            label={t('quantityGraph.initialQuantity')}
                        />
                        {/* <CheckboxControl
                            checked={showTrendLineInitial}
                            onChange={handleShowTrendLineInitialChange}
                            label={t('quantityGraph.trendLineInitial')}
                        /> */}
                        <CheckboxControl
                            checked={showFinalQuantity}
                            onChange={handleShowFinalQuantityChange}
                            label={t('quantityGraph.finalQuantity')}
                        />
                        {/* <CheckboxControl
                            checked={showTrendLineFinal}
                            onChange={handleShowTrendLineFinalChange}
                            label={t('quantityGraph.trendLineFinal')}
                        /> */}
                        <CheckboxControl
                            checked={showQuantityRate}
                            onChange={handleShowQuantityRateChange}
                            label={t('quantityGraph.quantityRate')}
                        />
                        {/* <CheckboxControl
                            checked={showTrendLineQuantityRate}
                            onChange={(e) => setShowTrendLineQuantityRate(e.target.checked)}
                            label={t('quantityGraph.trendLineQuantityRate')}
                        /> */}
                    </div>
                    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </Box>
        </Box>
    );
};

export default QuantityGraph;
