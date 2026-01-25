import React from 'react';
import ReactDOM from 'react-dom';

const CustomTooltip = ({ datum, position, color }) => {
  const tooltipStyle = {
    position: 'fixed', // Use fixed positioning for accuracy
    top: position.y,
    left: position.x,
    background: color,
    padding: '12px 16px',
    border: '1px solid grey',
    color: 'black',
    zIndex: 1000,
    pointerEvents: 'none', // Make sure the tooltip does not interfere with mouse events
    transform: 'translate(-50%, -100%)', // Adjust position to be above the cursor
  };

  return ReactDOM.createPortal(
    <div style={tooltipStyle}>
      <strong>{datum.label}</strong>: {datum.value}
    </div>,
    document.body // Render the tooltip in the body to ensure it appears on top
  );
};

export default CustomTooltip;
