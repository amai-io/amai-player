import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import CircleProcessBar from './CircleProcessBar';
import Load from './Load';

class AudioController extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      defaultPosition,
      showMiniProcessBar,
      currentTime,
      duration,
      miniProcessBarR,
      isShowMiniModeCover,
      loading,
      controllerTitle,
      toggle,
      closeText,
      openText,
    } = this.props;

    return (
      <div className={classNames('react-amai-music-player')} style={defaultPosition}>
        <div className={classNames('music-player')}>
          {showMiniProcessBar && (
            <CircleProcessBar progress={currentTime / duration} r={miniProcessBarR} />
          )}
          <div
            id={this.targetId}
            className={classNames('scale', 'music-player-controller', {
              'music-player-playing': this.state.playing,
            })}
            {...isShowMiniModeCover}
          >
            {loading ? (
              <Load />
            ) : (
              <>
                <span className="controller-title">{controllerTitle}</span>
                <div className="music-player-controller-setting">
                  {toggle ? closeText : openText}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

AudioController.propTypes = {
  defaultPosition: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    right: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  showMiniProcessBar: PropTypes.bool,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  miniProcessBarR: PropTypes.number,
  isShowMiniModeCover: PropTypes.bool,
  loading: PropTypes.bool,
  controllerTitle: PropTypes.string,
  toggle: PropTypes.bool,
  closeText: PropTypes.string,
  openText: PropTypes.string,
};

export default AudioController;
