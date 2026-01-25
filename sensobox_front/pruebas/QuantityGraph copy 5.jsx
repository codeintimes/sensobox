import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const QuantityGraph = () => {
    const chartContainerRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('1y');
    const [showFinalQuantity, setShowFinalQuantity] = useState(true);
    const [showQuantityRate, setShowQuantityRate] = useState(true);
    const [showInitialQuantity, setShowInitialQuantity] = useState(true);
    const [showTrendLineFinal, setShowTrendLineFinal] = useState(true);
    const [showTrendLineInitial, setShowTrendLineInitial] = useState(true);

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
                height: chartContainerRef.current.clientHeight,
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

            // const lineSeries1 = chart.addLineSeries({ color: showFinalQuantity ? 'blue' : 'transparent', title: 'Final Quantity' });
            // const lineSeries2 = chart.addLineSeries({ color: showQuantityRate ? 'red' : 'transparent', title: 'Quantity Rate' });
            // const lineSeries3 = chart.addLineSeries({ color: showInitialQuantity ? 'green' : 'transparent', title: 'Initial Quantity' });

            // lineSeries1.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
            // lineSeries2.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
            // lineSeries3.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));


            // Dentro del useEffect donde configuras las series de líneas
            if (showFinalQuantity) {
                const lineSeries1 = chart.addLineSeries({ color: 'blue', title: 'Final Quantity' });
                lineSeries1.setData(data.map(item => ({ time: item.time, value: item.finalQuantity })));
                if (!showTrendLineFinal) {
                    lineSeries1.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'blue' }]);
                }
            }

            if (showQuantityRate) {
                const lineSeries2 = chart.addLineSeries({ color: 'red', title: 'Quantity Rate' });
                lineSeries2.setData(data.map(item => ({ time: item.time, value: item.quantityRate })));
                if (!showTrendLineFinal) {
                    lineSeries2.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'red' }]);
                }
            }

            if (showInitialQuantity) {
                const lineSeries3 = chart.addLineSeries({ color: 'green', title: 'Initial Quantity' });
                lineSeries3.setData(data.map(item => ({ time: item.time, value: item.initialQuantity })));
                if (!showTrendLineFinal) {
                    lineSeries3.setMarkers([{ time: data[data.length - 1].time, position: 'last', shape: 'circle', color: 'green' }]);
                }
            }


            // Trend Lines
            if (showTrendLineFinal) {
                const trendColorFinal = 'yellow';
                const trendDataFinal = calculateTrendData(data, selectedPeriod, 'finalQuantity');
                const trendLineSeriesFinal = chart.addLineSeries({
                    color: trendColorFinal,
                    lineWidth: 2,
                    priceLineVisible: true,
                    title: 'Trend Final Quantity',
                });
                trendLineSeriesFinal.setData(trendDataFinal);
            }

            if (showTrendLineInitial) {
                const trendColorInitial = 'orange';
                const trendDataInitial = calculateTrendData(data, selectedPeriod, 'initialQuantity');
                const trendLineSeriesInitial = chart.addLineSeries({
                    color: trendColorInitial,
                    lineWidth: 2,
                    priceLineVisible: true,
                    title: 'Trend Initial Quantity',
                });
                console.log("trendDataInitial", trendDataInitial)
                trendLineSeriesInitial.setData(trendDataInitial);
            }
            // Zoom to selected period
            const fromDate = new Date(calculateStartDate()).getTime() / 1000;
            const toDate = new Date().getTime() / 1000;
            chart.timeScale().setVisibleRange({ from: fromDate, to: toDate });

            return () => chart.remove();
        }
    }, [data, selectedPeriod, showFinalQuantity, showQuantityRate, showInitialQuantity, showTrendLineFinal, showTrendLineInitial]);

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

    // const calculateTrendData = (data, selectedPeriod, propertyName) => {
    //     const trendData = [];
    //     let pointsToAverage = 1;

    //     switch (selectedPeriod) {
    //         case '1d':
    //             pointsToAverage = 1;
    //             break;
    //         case '2d':
    //             pointsToAverage = 2;
    //             break;
    //         case '1w':
    //             pointsToAverage = 7;
    //             break;
    //         case '1m':
    //             pointsToAverage = 30;
    //             break;
    //         case '3m':
    //             pointsToAverage = 90;
    //             break;
    //         case '6m':
    //             pointsToAverage = 180;
    //             break;
    //         case '1y':
    //             pointsToAverage = 365;
    //             break;
    //         case '2y':
    //             pointsToAverage = 730;
    //             break;
    //         default:
    //             pointsToAverage = 365;
    //     }

    //     for (let i = 0; i < data.length; i++) {
    //         let sum = 0;
    //         for (let j = 0; j < pointsToAverage && i + j < data.length; j++) {
    //             sum += data[i + j][propertyName];
    //         }
    //         const averageValue = sum / Math.min(pointsToAverage, data.length - i);
    //         trendData.push({ time: data[i].time, value: averageValue });
    //     }

    //     return trendData;
    // };


    return (
        <div style={{ width: '100%', height: '95%' }}>
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
                    <input type="checkbox" checked={showFinalQuantity} onChange={handleShowFinalQuantityChange} />
                    Final Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showQuantityRate} onChange={handleShowQuantityRateChange} />
                    Quantity Rate
                </label>
                <label>
                    <input type="checkbox" checked={showInitialQuantity} onChange={handleShowInitialQuantityChange} />
                    Initial Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineFinal} onChange={handleShowTrendLineFinalChange} />
                    Tendencia Final Quantity
                </label>
                <label>
                    <input type="checkbox" checked={showTrendLineInitial} onChange={handleShowTrendLineInitialChange} />
                    Tendencia Initial Quantity
                </label>
            </div>
            <div ref={chartContainerRef} style={{ width: '100%',  height: '100%'}} />
        </div>
    );
};

export default QuantityGraph;
