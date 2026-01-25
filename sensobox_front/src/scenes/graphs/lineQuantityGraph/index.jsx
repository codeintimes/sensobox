import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { useTranslation } from 'react-i18next'; // Importa la función useTranslation
import axios from 'axios';
import { Popover, Typography } from '@mui/material';

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
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [allClientsLoaded, setAllClientsLoaded] = useState(false); // Nuevo estado
    const [popover, setPopover] = useState({
        open: false,
        anchorPosition: { top: 0, left: 0 },
        content: ''
    });

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

    const handleClosePopover = () => {
        setPopover(prev => ({
            ...prev,
            open: false
        }));
    };

    const getData = async (clientName = selectedClient) => {
        try {
            const startDate = calculateStartDate();
            const jwt = localStorage.getItem("jwtToken");
            const userData = JSON.parse(localStorage.getItem('userData'));
            console.log(userData)
            const url = `${API_ORDERS.ORDERS}/fromDate/${startDate}`;
            let response;

            const queryParams = new URLSearchParams({
                companyName: userData.companyName,
                ...(userData.role === 'client' ? { clientName: userData.clientName } : clientName ? { clientName: clientName } : {})
            });
            const queryUrl = `${url}?${queryParams.toString()}`;
            response = await axios.get(queryUrl, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });

            const dataResponse = response.data;
            console.log("dataResponse", dataResponse)
            setData(dataResponse.map(item => ({
                time: new Date(item.createdAt).getTime() / 1000,
                finalQuantity: parseFloat(item.finalQuantity),
                quantityRate: parseFloat(item.quantityRate),
                initialQuantity: parseFloat(item.initialQuantity),
            })).sort((a, b) => a.time - b.time));

            if (!allClientsLoaded) { // Solo cargar clientes una vez
                const uniqueClients = [...new Set(dataResponse.map(item => item.clientName))];
                setClients(uniqueClients);
                setAllClientsLoaded(true); // Indicar que todos los clientes han sido cargados
            }
        } catch (error) {
            console.error('Failed to get data:', error);
        }
    };

    useEffect(() => {
        getData();
    }, [selectedPeriod, selectedClient]);
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
    
            let lineSeries1, lineSeries2, lineSeries3;
            let hasActiveSeries = false;
    
            if (showInitialQuantity) {
                lineSeries1 = chart.addLineSeries({
                    color: colors.greenAccent[500],
                    title: isMobile ? '' : t('quantityGraph.initialQuantity'),
                    priceFormat: {
                        type: 'custom',
                        minMove: 1,
                        formatter: (value) => Math.round(value).toString()
                    }
                });
                lineSeries1.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));
                hasActiveSeries = true;
            }
    
            if (showFinalQuantity) {
                lineSeries2 = chart.addLineSeries({
                    color: colors.blueAccent[500],
                    title: isMobile ? '' : t('quantityGraph.finalQuantity'),
                    priceFormat: {
                        type: 'custom',
                        minMove: 1,
                        formatter: (value) => Math.round(value).toString()
                    }
                });
                lineSeries2.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
                hasActiveSeries = true;
            }            
    
            if (showQuantityRate) {
                lineSeries3 = chart.addLineSeries({
                    color: 'red',
                    title: isMobile ? '' : t('quantityGraph.quantityRate'),
                    priceFormat: {
                        type: 'custom',
                        minMove: 0.01,
                        formatter: (value) => value.toFixed(2)
                    }
                });
                lineSeries3.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
                hasActiveSeries = true;
            }
            
    
            chart.subscribeClick(param => {
                if (param.time) {
                    const timestamp = param.time;
                    const pointData = data.find(item => item.time === timestamp);
    
                    if (pointData) {
                        const initialQuantity = Math.round(pointData.initialQuantity);
                        const finalQuantity = Math.round(pointData.finalQuantity);
                        const quantityRate = pointData.quantityRate.toFixed(2);
                        const offset = isMobile ? { top: 140, left: -60 } : { top: 110, left: 110 };
    
                        setPopover({
                            open: true,
                            anchorPosition: { top: param.point.y + offset.top, left: param.point.x + offset.left },
                            content: `${t('quantityGraph.initialQuantity')}: ${initialQuantity}\n${t('quantityGraph.finalQuantity')}: ${finalQuantity}\n${t('quantityGraph.quantityRate')}: ${quantityRate}`
                        });
                    }
                }
            });
    
            if (hasActiveSeries) {
                const fromDate = new Date(calculateStartDate()).getTime() / 1000;
                const toDate = new Date().getTime() / 1000;
                chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });
            }
    
            return () => {
                chart.remove();
            };
        }
    }, [data, selectedPeriod, showFinalQuantity, showQuantityRate, showInitialQuantity, theme.palette.mode]);
    
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

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value === 'Vista General' ? '' : e.target.value); // Actualiza el cliente seleccionado, permite "Vista General"
        getData(e.target.value === 'Vista General' ? '' : e.target.value); // Llama a getData con el cliente seleccionado, permite "Vista General"
    };

    const actionElements = (
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
            <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
                <FormControl fullWidth>
                    <InputLabel id="period-select-label">{t('quantityGraph.periodLabel')}</InputLabel>
                    <Select
                        labelId="period-select-label"
                        id="period-select"
                        value={selectedPeriod}
                        label="Period"
                        onChange={handlePeriodChange}
                        sx={{
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
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
            <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
                <FormControl fullWidth>
                    <InputLabel id="client-select-label">{t('quantityGraph.generalView')}</InputLabel>
                    <Select
                        labelId="client-select-label"
                        id="client-select"
                        value={selectedClient}
                        label="Client"
                        onChange={handleClientChange}
                        sx={{
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                        }}
                    >
                        <MenuItem value="Vista General">{t('quantityGraph.generalView')}</MenuItem>
                        {clients.map(client => (
                            <MenuItem key={client} value={client}>
                                {client}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
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
            <Header title={t('quantityGraph.graphTitle')} subtitle={isMobile ? '' : t('quantityGraph.graphSubtitle')} actionElement={actionElements} />
            <Box height="75vh">
                <div style={{ width: '100%', height: '90%' }}>
                    <div>
                        <CheckboxControl
                            checked={showInitialQuantity}
                            onChange={handleShowInitialQuantityChange}
                            label={t('quantityGraph.initialQuantity')}
                        />
                        <CheckboxControl
                            checked={showFinalQuantity}
                            onChange={handleShowFinalQuantityChange}
                            label={t('quantityGraph.finalQuantity')}
                        />
                        <CheckboxControl
                            checked={showQuantityRate}
                            onChange={handleShowQuantityRateChange}
                            label={t('quantityGraph.quantityRate')}
                        />
                    </div>
                    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </Box>
            <Popover
                open={popover.open}
                onClose={handleClosePopover}
                anchorReference="anchorPosition"
                anchorPosition={popover.anchorPosition}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Typography sx={{ p: 2, whiteSpace: 'pre-line' }}>{popover.content}</Typography>
            </Popover>
        </Box>
    );
};

export default QuantityGraph;
