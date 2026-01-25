import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { tokens } from '../theme';
import { useTheme } from '@mui/material';
// import CustomTooltip from '../../pruebas/CustomTooltip'; // Import the custom tooltip component

const splitLabelAtNearestSpace = (label) => {
  const mid = Math.floor(label.length / 2);
  const beforeMid = label.lastIndexOf(' ', mid);
  const afterMid = label.indexOf(' ', mid + 1);
  const splitIndex = beforeMid !== -1 ? beforeMid : afterMid;

  if (splitIndex !== -1) {
    const firstLine = label.slice(0, splitIndex);
    const secondLine = label.slice(splitIndex + 1);
    return [firstLine, secondLine];
  }

  return [label]; // If no space is found, return the whole label as a single line
};

const PieChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // const customColors = [
  //   "rgb(232, 193, 160)",
  //   "rgb(244, 117, 96)", 
  //   "rgb(241, 225, 91)", 
  //   "rgb(232, 168, 56)", 
  //   "rgb(97, 205, 187)", 
  //   "rgb(186, 255, 201)",
  //   "rgb(151, 227, 213)", 
  // ];

  const customColors = [
    "rgb(76, 206, 172)",  // Verde
    "rgb(102, 184, 155)", // Verde intermedio
    "rgb(128, 162, 138)", // Verde intermedio
    "rgb(153, 140, 121)", // Verde rojizo
    "rgb(179, 117, 104)", // Rojo intermedio
    "rgb(202, 85, 82)",   // Rojo intermedio
    "rgb(175, 63, 59)"    // Rojo
  ];

  // const customColors = [
  //   "rgb(175, 63, 59)",    // Rojo
  //   "rgb(202, 85, 82)",    // Rojo intermedio
  //   "rgb(179, 117, 104)",  // Rojo intermedio
  //   "rgb(153, 140, 121)",  // Verde rojizo
  //   "rgb(128, 162, 138)",  // Verde intermedio
  //   "rgb(102, 184, 155)",  // Verde intermedio
  //   "rgb(76, 206, 172)"    // Verde
  // ];

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <ResponsivePie
        data={data}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100],
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
                fontSize: 10,
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[100],
              },
            },
          },
          labels: {
            text: {
              fontSize: 10, // Tamaño del texto de las etiquetas de los arcos
              fill: colors.grey[100],
            },
          },
          legends: {
            text: {
              fontSize: 12, // Tamaño del texto de las leyendas
              fill: colors.grey[100],
            },
          },
          tooltip: {
            container: {
              background: colors.grey[200],
              color: colors.grey[800],
              fontSize: 12, // Tamaño del texto del tooltip
              zIndex: 10000, // Asegurar que el tooltip se muestre por encima de todo lo demás
            },
          },
        }}
        margin={{ top: 20, right: 10, bottom: 10, left: 10 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={colors.grey[100]}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLinkLabelsTextOffset={4} // Ajustar el offset del texto de los enlaces
        arcLinkLabelsDiagonalLength={16} // Ajustar la longitud diagonal de los enlaces
        arcLinkLabelsStraightLength={24} // Ajustar la longitud recta de los enlaces
        arcLinkLabel={(d) => {
          const lines = splitLabelAtNearestSpace(d.label);
          const offset = -10; // Desplazamiento hacia arriba en píxeles
          return (
            <tspan>
              {lines.map((line, index) => (
                <tspan key={index} x="0" dy={index === 0 ? `${offset}` : '1.2em'}>
                  {line}
                </tspan>
              ))}
            </tspan>
          );
        }}
        enableArcLinkLabels={false}
        colors={customColors} // Apply custom colors
        enableArcLabels={true}
        arcLabelsRadiusOffset={0.5}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 3]],
        }}
        tooltip={({ datum }) => (
          <div
            style={{
              color: colors.grey[800],
              background: datum.color,
              padding: '12px 16px',
              border: '1px solid ' + colors.grey[400],
              lineHeight: '2',
              zIndex: 9000, // Asegurar que el tooltip se muestre por encima de todo lo demás
            }}
          >
            <strong>{datum.label}</strong>: {datum.value}
          </div>
        )}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
      />
    </div>
  );
};

export default PieChart;
