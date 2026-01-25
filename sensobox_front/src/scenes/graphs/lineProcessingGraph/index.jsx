
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Popover, Typography } from "@mui/material";

const ProcessingGraph = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartContainerRef = useRef(null);
  const [data, setData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [showTrendLineFinal, setShowTrendLineFinal] = useState(true);
  const [showTrendLineInitial, setShowTrendLineInitial] = useState(true);
  const [showTrendLineRate, setShowTrendLineRate] = useState(true);
  const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [allClientsLoaded, setAllClientsLoaded] = useState(false); // Nuevo estado
  const [selectedClient, setSelectedClient] = useState('');

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

  const getData = async (clientName = selectedClient) => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      const startDate = calculateStartDate();
      const url = `${API_ORDERS.ORDERS}/processing-stats/${startDate}/${companyName}`;
      const queryParams = new URLSearchParams({
        ...(userData.role === 'client' ? { clientName: userData.clientName } : clientName ? { clientName: clientName } : {})
      });
      const queryUrl = `${url}?${queryParams.toString()}`;
      const response = await axios.get(queryUrl, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      const dataResponse = response.data;
      setData(dataResponse.map(item => ({
        time: new Date(item.createdAt).getTime() / 1000,
        processingTime: item.processingTime,
        processingTimeReal: item.processingTimeReal,
        processingTimeRate: parseFloat(item.processingTimeRate),
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

  const [popover, setPopover] = useState({
    open: false,
    anchorPosition: { top: 0, left: 0 },
    content: ''
  });

  const handleClosePopover = () => {
    setPopover({
      ...popover,
      open: false
    });
  };

  useEffect(() => {
    getData();
  }, [selectedPeriod, selectedClient]);


  const handleClientChange = (e) => {
    setSelectedClient(e.target.value === 'Vista General' ? '' : e.target.value); // Actualiza el cliente seleccionado, permite "Vista General"
    getData(e.target.value === 'Vista General' ? '' : e.target.value); // Llama a getData con el cliente seleccionado, permite "Vista General"
  };

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

      chart.subscribeClick((param) => {
        if (param.time) {
          const closestDataPoint = data.reduce((prev, curr) => {
            return Math.abs(curr.time - param.time) < Math.abs(prev.time - param.time) ? curr : prev;
          });

          const offset = isMobile ? { top: 140, left: -60 } : { top: 110, left: 110 };

          setPopover({
            open: true,
            anchorPosition: { top: param.point.y + offset.top, left: param.point.x + offset.left },
            content: {
              finalProcessingTime: `${t('processingGraph.finalProcessingTime')}: ${closestDataPoint.processingTimeReal.toFixed(0)}`,
              initialProcessingTime: `${t('processingGraph.initialProcessingTime')}: ${closestDataPoint.processingTime.toFixed(0)}`,
              processingTimeRate: `${t('processingGraph.processingTimeRate')}: ${closestDataPoint.processingTimeRate.toFixed(2)}`
            }
          });
        }
      });

      let trendLineSeriesRate, trendLineSeriesFinal, trendLineSeriesInitial;
      let hasActiveSeries = false;
      if (data.length > 0) {
        const seriesOptions = {
          priceFormat: {
            type: 'price',
            precision: 0,  // This sets the precision to 0, removing decimalsordersgrap
            minMove: 1,
          },
          priceLineVisible: true,
          priceLineWidth: 2,
          // priceLineColor: 'black',
        };
        if (showTrendLineInitial) {
          const trendColorInitial = 'orange';
          trendLineSeriesInitial = chart.addLineSeries({
            ...seriesOptions,
            color: trendColorInitial,
            lineWidth: 2,
            priceLineVisible: true,
            title: isMobile ? '' : t('processingGraph.initialProcessingTimeTitle'),
            priceFormat: {
              type: 'custom',
              minMove: 1,
              formatter: (value) => Math.round(value).toString()
            }
          });
          trendLineSeriesInitial.setData(data.map(item => ({ time: item.time, value: item.processingTime })));
          trendLineSeriesInitial.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
          hasActiveSeries = true;
        }

        if (showTrendLineFinal) {
          const trendColorFinal = 'yellow';
          trendLineSeriesFinal = chart.addLineSeries({
            ...seriesOptions,
            color: trendColorFinal,
            lineWidth: 2,
            priceLineVisible: true,
            title: isMobile ? '' : t('processingGraph.finalProcessingTimeTitle'),
            priceFormat: {
              type: 'custom',
              minMove: 1,
              formatter: (value) => Math.round(value).toString()
            }
          });
          trendLineSeriesFinal.setData(data.map(item => ({ time: item.time, value: item.processingTimeReal })));
          trendLineSeriesFinal.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
          hasActiveSeries = true;
        }

        if (showTrendLineRate) {
          trendLineSeriesRate = chart.addLineSeries({
            ...seriesOptions,
            color: 'purple',
            lineWidth: 2,
            priceLineVisible: true,
            title: isMobile ? '' : t('processingGraph.processingTimeRateTitle'),
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: (value) => value.toFixed(2)
            }
          });
          trendLineSeriesRate.setData(data.map(item => ({ time: item.time, value: item.processingTimeRate })));
          trendLineSeriesRate.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
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
  }, [data, selectedPeriod, showTrendLineFinal, showTrendLineInitial, showTrendLineRate, theme.palette.mode]);

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

  const actionElements = (
    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
      <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
        <FormControl fullWidth>
          <InputLabel id="period-select-label">{t('processingGraph.period')}</InputLabel>
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
            <MenuItem value="1d">{t('processingGraph.lastDay')}</MenuItem>
            <MenuItem value="1w">{t('processingGraph.lastWeek')}</MenuItem>
            <MenuItem value="1m">{t('processingGraph.lastMonth')}</MenuItem>
            <MenuItem value="3m">{t('processingGraph.last3Months')}</MenuItem>
            <MenuItem value="6m">{t('processingGraph.last6Months')}</MenuItem>
            <MenuItem value="1y">{t('processingGraph.lastYear')}</MenuItem>
            <MenuItem value="2y">{t('processingGraph.last2Years')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
        <FormControl fullWidth>
          <InputLabel id="client-select-label">{t('processingGraph.generalView')}</InputLabel>
          <Select
            labelId="client-select-label"
            id="client-select"
            value={selectedClient}
            label={t('processingGraph.client')}
            onChange={handleClientChange}
            sx={{
              backgroundColor: 'background.paper',
              color: 'text.primary',
            }}
          >
            <MenuItem value="Vista General">{t('processingGraph.generalView')}</MenuItem>
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

  return (
    <Box m="20px">
      <Header title={t('processingGraph.graphTitle')} subtitle={isMobile ? '' : t('processingGraph.graphSubtitle')} actionElement={actionElements} />
      <Box height="75vh">
        <div style={{ width: '100%', height: '90%' }}>
          <div>
            <CheckboxControl
              checked={showTrendLineFinal}
              onChange={handleShowTrendLineFinalChange}
              label={t('processingGraph.finalProcessingTime')}
            />
            <CheckboxControl
              checked={showTrendLineInitial}
              onChange={handleShowTrendLineInitialChange}
              label={t('processingGraph.initialProcessingTime')}
            />
            <CheckboxControl
              checked={showTrendLineRate}
              onChange={handleShowTrendLineRateChange}
              label={t('processingGraph.processingTimeRate')}
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
        <Box sx={{ p: 2 }}>
          <Typography>{popover.content.initialProcessingTime}</Typography>
          <Typography>{popover.content.finalProcessingTime}</Typography>
          <Typography>{popover.content.processingTimeRate}</Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default ProcessingGraph;
