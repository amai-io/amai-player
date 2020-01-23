import React, { PureComponent } from 'react';
import classNames from 'classnames';
import isMobile from 'is-mobile';
import PropTypes from 'prop-types';
import MdVolumeMute from 'react-icons/lib/md/volume-off';
import MdVolumeDown from 'react-icons/lib/md/volume-up';
import Slider from 'rc-slider/lib/Slider';
import FaMinusSquareO from 'react-icons/lib/fa/minus-square-o';
import Load from './Load';
import PlayModel from './PlayModel';
import formatTime from '../utils/formatTime';

const IS_MOBILE = isMobile();

class PlayerPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      name,
      cover,
      singer,
      playing,
      duration,
      currentTime,
      loading,
      themeSwitch,
      progressBar,
      openAudioListsPanel,
      audioPrevPlay,
      audioNextPlay,
      prevAudioIcon,
      nextAudioIcon,
      playIcon,
      pauseIcon,
      playMode,
      downloadIcon,
      reloadIcon,
      playListsIcon,
      onClose,
      pause,
      currentPlayModeName,
      extendsContent,
      onPlay,
      glassBg,
      LyricIcon,
      autoHiddenCover,
      playModelNameVisible,
      toggleMode,
      audioLists,
      sliderBaseOptions,
      soundValue,
      isMute,
      loadProgress,
      showProgressLoadBar,
      showPlay,
      onMute,
      onSound,
    } = this.props;

    const _currentTime = formatTime(currentTime);
    const _duration = formatTime(duration);

    return (
      <div
        className={classNames('music-player-panel', 'translate', {
          'glass-bg': glassBg,
        })}
      >
        <section className="panel-content">
          {(!autoHiddenCover || (autoHiddenCover && cover)) && (
            <div
              className={classNames('img-content', 'img-rotate', {
                'img-rotate-pause': pause || !playing || !cover,
              })}
              style={{ backgroundImage: `url(${cover})` }}
            />
          )}
          <div className="progress-bar-content">
            <span className="audio-title">
              {name}
              {singer && ` - ${singer}`}
            </span>
            <section className="audio-main">
              <span className="current-time">{loading ? '--' : _currentTime}</span>
              <div className="progress-bar">
                {showProgressLoadBar && (
                  <div
                    className="progress-load-bar"
                    style={{ width: `${Math.min(loadProgress, 100)}%` }}
                  />
                )}
                {progressBar}
              </div>
              <span className="duration">{loading ? '--' : _duration}</span>
            </section>
          </div>
          <div className="player-content">
            {/* Play button */}
            {loading ? (
              <Load />
            ) : (
              showPlay && (
                <span className="group">
                  <span
                    className="group prev-audio"
                    title="Previous track"
                    {...(IS_MOBILE ? { onTouchStart: audioPrevPlay } : { onClick: audioPrevPlay })}
                  >
                    {prevAudioIcon}
                  </span>
                  <span
                    className="group play-btn"
                    ref={node => (this.playBtn = node)} // eslint-disable-line no-return-assign
                    {...(IS_MOBILE ? { onTouchStart: onPlay } : { onClick: onPlay })}
                    title={playing ? 'Click to pause' : 'Click to play'}
                  >
                    {playing ? <span>{pauseIcon}</span> : <span>{playIcon}</span>}
                  </span>
                  <span
                    className="group next-audio"
                    title="Next track"
                    {...(IS_MOBILE ? { onTouchStart: audioNextPlay } : { onClick: audioNextPlay })}
                  >
                    {nextAudioIcon}
                  </span>
                </span>
              )
            )}

            {/* Replay */}
            {reloadIcon}
            {/* Download songs */}
            {downloadIcon}
            {/* Theme selection */}
            {themeSwitch}

            {/* Custom extension buttons */}
            {extendsContent || null}

            {/* Volume control */}
            <span className="group play-sounds" title="Volume">
              {isMute ? (
                <span
                  className="sounds-icon"
                  {...(IS_MOBILE ? { onTouchStart: onSound } : { onClick: onSound })}
                >
                  <MdVolumeMute />
                </span>
              ) : (
                <span
                  className="sounds-icon"
                  {...(IS_MOBILE ? { onTouchStart: onMute } : { onClick: onMute })}
                >
                  <MdVolumeDown />
                </span>
              )}
              <Slider
                max={1}
                value={soundValue}
                onChange={this.audioSoundChange}
                className="sound-operation"
                {...sliderBaseOptions}
              />
            </span>

            {/* Play mode */}
            {playMode}

            {/* Lyrics button */}
            {LyricIcon}

            {/* Playlist button */}
            <span
              className="group audio-lists-btn"
              title="play lists"
              {...(IS_MOBILE
                ? { onTouchStart: openAudioListsPanel }
                : { onClick: openAudioListsPanel })}
            >
              <span className="audio-lists-icon">{playListsIcon}</span>
              <span className="audio-lists-num">{audioLists.length}</span>
            </span>

            {/* Collapse panel */}
            {toggleMode && (
              <span
                className="group hide-panel"
                {...(IS_MOBILE ? { onTouchStart: onClose } : { onClick: onClose })}
              >
                <FaMinusSquareO />
              </span>
            )}
          </div>
        </section>
        {/* Play mode prompt box */}
        <PlayModel visible={playModelNameVisible} value={currentPlayModeName} />
      </div>
    );
  }
}

PlayerPanel.propTypes = {
  audioLists: PropTypes.instanceOf(Array),
  audioNextPlay: PropTypes.func,
  audioPrevPlay: PropTypes.func,
  autoHiddenCover: PropTypes.bool,
  cover: PropTypes.string,
  currentPlayModeName: PropTypes.string,
  currentTime: PropTypes.string,
  downloadIcon: PropTypes.instanceOf(Object),
  duration: PropTypes.string,
  extendsContent: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
    PropTypes.object,
    PropTypes.node,
    PropTypes.element,
    PropTypes.string,
  ]),
  glassBg: PropTypes.bool,
  loading: PropTypes.instanceOf(Object),
  LyricIcon: PropTypes.instanceOf(Object),
  name: PropTypes.string,
  nextAudioIcon: PropTypes.instanceOf(Object),
  onClose: PropTypes.func,
  onMute: PropTypes.func,
  onPlay: PropTypes.func,
  onSound: PropTypes.func,
  openAudioListsPanel: PropTypes.func,
  pause: PropTypes.bool,
  pauseIcon: PropTypes.instanceOf(Object),
  playIcon: PropTypes.instanceOf(Object),
  playing: PropTypes.bool,
  playListsIcon: PropTypes.instanceOf(Object),
  playMode: PropTypes.instanceOf(Object),
  prevAudioIcon: PropTypes.instanceOf(Object),
  progressBar: PropTypes.instanceOf(Object),
  reloadIcon: PropTypes.instanceOf(Object),
  singer: PropTypes.string,
  themeSwitch: PropTypes.instanceOf(Object),
  playModelNameVisible: PropTypes.bool,
  toggleMode: PropTypes.bool,
  isMute: PropTypes.bool,
  showProgressLoadBar: PropTypes.bool,
  showPlay: PropTypes.bool,
  sliderBaseOptions: PropTypes.instanceOf(Array),
  soundValue: PropTypes.number,
  loadProgress: PropTypes.number,
};

export default PlayerPanel;
