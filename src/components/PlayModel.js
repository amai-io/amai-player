import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const PlayModel = ({ visible, value }) => (
  <div
    className={classNames('play-mode-title', {
      'play-mode-title-visible': visible,
    })}
  >
    {value}
  </div>
);

PlayModel.propTypes = {
  visible: PropTypes.bool,
  value: PropTypes.string,
};

export default PlayModel;
