import React from 'react';
import PropTypes from 'prop-types';

// mini mode progress bar
const CircleProcessBar = ({ progress = 0, r = 40 } = {}) => {
  const progressFix = progress.toFixed(2);
  const perimeter = Math.PI * 2 * r;
  const strokeDasharray = `${~~(perimeter * progressFix)} ${~~(perimeter * (1 - progressFix))}`;
  return (
    <svg className="audio-circle-process-bar">
      <circle
        cx={r}
        cy={r}
        r={r - 1}
        fill="none"
        className="stroke"
        strokeDasharray={strokeDasharray}
      />
      <circle cx={r} cy={r} r={r - 1} fill="none" className="bg" strokeDasharray="0 1000" />
    </svg>
  );
};

CircleProcessBar.propTypes = {
  progress: PropTypes.number,
  r: PropTypes.number,
};

export default CircleProcessBar;
