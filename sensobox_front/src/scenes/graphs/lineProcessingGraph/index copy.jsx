
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { API_ORDERS } from "../../config/config";
import { useTranslation } from 'react-i18next';
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
  const isMobile = useMediaQuery('(max-width:800px)'); // Ajustar a tu punto de interrupción deseado
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
      const jwt = localStorage.getItem("jwtToken");
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      console.log("1111111111111111113e", companyName, userData)
      const startDate = calculateStartDate();
      const url = `${API_ORDERS.ORDERS}/processing-stats/${startDate}/${companyName}`; // Agregar companyName a la URL
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      const dataResponse = response.data;
      console.log("V", dataResponse)
      setData(dataResponse.map(item => ({
        time: new Date(item.createdAt).getTime() / 1000,
        processingTime: item.processingTime,
        processingTimeReal: item.processingTimeReal,
        processingTimeRate: parseFloat(item.processingTimeRate),
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
          });
          console.log("22w", data.map(item => ({ time: item.time, value: item.processingTime })))
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
    <Box sx={{ minWidth: isMobile ? 120 : 220 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{t('processingGraph.period')}</InputLabel>
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
      <Header title={t('processingGraph.graphTitle')}  subtitle={isMobile ? '' : t('processingGraph.graphSubtitle')} actionElement={actionElements} />
      <Box height="75vh">
        <div style={{ width: '100%', height: '90%' }}>
          <div>
            {/* <label>
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
            </label> */}
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
    </Box>
  );
};

export default ProcessingGraph;
