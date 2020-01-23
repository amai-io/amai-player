import React from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';

const prefix = 'react-amai-music-player-mobile';

const PlayModeTip = ({ visible, title, text }) => (
  <div className={cls(`${prefix}-play-model-tip`, { show: visible })}>
    <span className="title">{title}</span>
    <span className="text">{text}</span>
  </div>
);

PlayModeTip.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  text: PropTypes.string,
};

export default PlayModeTip;
