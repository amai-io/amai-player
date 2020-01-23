import React from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import PlayModeTip from './PlayModeTip';

const prefix = 'react-amai-music-player-mobile';

const PlayerMobile = ({
  name,
  cover,
  singer,
  playing,
  duration,
  currentTime,
  loading,
  loadingIcon,
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
  closeIcon,
  onClose,
  pause,
  playModeTipVisible,
  currentPlayModeName,
  extendsContent,
  onPlay,
  glassBg,
  LyricIcon,
  autoHiddenCover,
}) => (
  <div className={cls(prefix, { 'default-bg': !glassBg, 'glass-bg': glassBg })}>
    <PlayModeTip visible={playModeTipVisible} title={playMode} text={currentPlayModeName} />
    <div className={`${prefix}-header group`}>
      <div className="left item" />
      <div className="title">{name}</div>
      <button type="button" className="right item" onClick={onClose}>
        {closeIcon}
      </button>
    </div>
    <div className={`${prefix}-singer text-center group`}>
      <span className="name">{singer}</span>
    </div>
    <div className={`${prefix}-switch text-center group`}>{themeSwitch}</div>
    {(!autoHiddenCover || (autoHiddenCover && cover)) && (
      <div className={`${prefix}-cover text-center`}>
        <img
          src={cover}
          alt="cover"
          className={cls('cover', {
            'img-rotate-pause': pause || !playing || !cover,
          })}
        />
      </div>
    )}
    <div className={`${prefix}-progress group`}>
      <span className="current-time">{loading ? '--' : currentTime}</span>
      {progressBar}
      <span className="duration text-right">{loading ? '--' : duration}</span>
    </div>
    <div className={`${prefix}-toggle text-center group`}>
      {loading ? (
        loadingIcon
      ) : (
        <>
          <button
            type="button"
            className="group prev-audio"
            title="Previous track"
            onClick={audioPrevPlay}
          >
            {prevAudioIcon}
          </button>
          <button
            type="button"
            className="group play-btn"
            title={playing ? 'Click to pause' : 'Click to play'}
            onClick={onPlay}
          >
            {playing ? pauseIcon : playIcon}
          </button>
          <button
            type="button"
            className="group next-audio"
            title="Next track"
            onClick={audioNextPlay}
          >
            {nextAudioIcon}
          </button>
        </>
      )}
    </div>
    <div className={`${prefix}-operation group`}>
      <ul className="items">
        {[playMode, downloadIcon, reloadIcon, LyricIcon].filter(Boolean).map(icon => (
          <li className="item" key={icon.id}>
            {icon}
          </li>
        ))}
        {extendsContent &&
          extendsContent.length >= 1 &&
          extendsContent.map(content => {
            return (
              <li className="item" key={content.id}>
                {content}
              </li>
            );
          })}
        <li className="item">
          <button type="button" onClick={openAudioListsPanel}>
            {playListsIcon}
          </button>
        </li>
      </ul>
    </div>
  </div>
);

PlayerMobile.propTypes = {
  audioNextPlay: PropTypes.func,
  audioPrevPlay: PropTypes.func,
  autoHiddenCover: PropTypes.bool,
  closeIcon: PropTypes.instanceOf(Object),
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
  loadingIcon: PropTypes.instanceOf(Object),
  LyricIcon: PropTypes.instanceOf(Object),
  name: PropTypes.string,
  nextAudioIcon: PropTypes.instanceOf(Object),
  onClose: PropTypes.func,
  onPlay: PropTypes.func,
  openAudioListsPanel: PropTypes.func,
  pause: PropTypes.bool,
  pauseIcon: PropTypes.instanceOf(Object),
  playIcon: PropTypes.instanceOf(Object),
  playing: PropTypes.bool,
  playListsIcon: PropTypes.instanceOf(Object),
  playMode: PropTypes.instanceOf(Object),
  playModeTipVisible: PropTypes.bool,
  prevAudioIcon: PropTypes.instanceOf(Object),
  progressBar: PropTypes.instanceOf(Object),
  reloadIcon: PropTypes.instanceOf(Object),
  singer: PropTypes.string,
  themeSwitch: PropTypes.instanceOf(Object),
};

export default PlayerMobile;
