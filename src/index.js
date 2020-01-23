/**
 * @version 1.1.1
 * @name react-amai-music-player
 * @description Maybe the best beautiful HTML5 responsive player component for react :)
 * @author Jinke.Li <1359518268@qq.com>
 */

import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import isMobile from 'is-mobile';
import Slider from 'rc-slider/lib/Slider';
import Switch from 'rc-switch';
import download from 'downloadjs';
import Draggable from 'react-draggable';

import FaHeadphones from 'react-icons/lib/fa/headphones';
import LyricIcon from 'react-icons/lib/fa/angellist';
import Reload from 'react-icons/lib/fa/refresh';
import Download from 'react-icons/lib/fa/cloud-download';
import LoopIcon from 'react-icons/lib/md/repeat-one';
import RepeatIcon from 'react-icons/lib/md/repeat';
import ShufflePlayIcon from 'react-icons/lib/ti/arrow-shuffle';
import OrderPlayIcon from 'react-icons/lib/md/view-headline';
import PlayLists from 'react-icons/lib/md/queue-music';
import NextAudioIcon from 'react-icons/lib/md/skip-next';
import PrevAudioIcon from 'react-icons/lib/md/skip-previous';
import CloseBtn from 'react-icons/lib/md/close';
import DeleteIcon from 'react-icons/lib/fa/trash-o';

import PropTypes from 'prop-types';

import AudioController from './components/AudioController';
import AudioListsPanel from './components/AudioListsPanel';
import AnimatePauseIcon from './components/AnimatePauseIcon';
import AnimatePlayIcon from './components/AnimatePlayIcon';
import AudioPlayerMobile from './components/PlayerMobile';
import Load from './components/Load';

import formatTime from './utils/formatTime';
import createRandomNum from './utils/createRandomNum';
import arrayEqual from './utils/arrayEqual';
import uuId from './utils/uuId';
import isSafari from './utils/isSafari';

import Lyric from './lyric';

import 'rc-slider/assets/index.css';
import 'rc-switch/assets/index.css';
import PlayerPanel from './components/PlayerPanel';

const IS_MOBILE = isMobile();

const sliderBaseOptions = {
  min: 0,
  step: 0.01,
  trackStyle: { backgroundColor: '#31c27c' },
  handleStyle: { backgroundColor: '#31c27c', border: '2px solid #fff' },
};

class ReactAmaiMusicPlayer extends PureComponent {
  initPlayId = ''; // Initial play id

  audioListRemoveAnimateTime = 350; // List delete animation time (ms)

  NETWORK_STATE = {
    NETWORK_EMPTY: 0, // Uninitialized
    NETWORK_IDLE: 1, // Network 304 cache not used
    NETWORK_LOADING: 2, // Browser is downloading data
    NETWORK_NO_SOURCE: 3, // No resources found
  };

  READY_SUCCESS_STATE = 4;

  constructor(props) {
    super(props);
    this.state = {
      audioLists: [],
      playId: this.initPlayId, // play id
      name: '', // Current song name
      cover: '', // Current song cover
      singer: '', // Current singer
      musicSrc: '', // Current song chain
      lyric: '', // Current Lyrics
      currentLyric: '',
      isMobile: IS_MOBILE,
      toggle: false,
      pause: true,
      playing: false,
      duration: 0,
      currentTime: 0,
      isLoop: false,
      isMute: false,
      soundValue: 100,
      isDrag: false, // Whether to support drag and drop
      moveX: 0,
      moveY: 0,
      isMove: false,
      loading: false,
      audioListsPanelVisible: false,
      playModelNameVisible: false,
      theme: this.darkThemeName,
      playMode: '', // Current playback mode
      currentAudioVolume: 0, // Current volume Restores the previously recorded volume after muting
      initAnimate: false,
      isInitAutoplay: false,
      isInitRemember: false,
      loadProgress: 0,
      removeId: -1,
      isNeedMobileHack: IS_MOBILE,
      audioLyricVisible: false,
      isAudioListsChange: false,
    };
    this.audio = null; // Current player
    this.lightThemeName = 'light';
    this.darkThemeName = 'dark'; // Mode configuration
    this.toggleModeName = {
      full: 'full',
      mini: 'mini',
    };
    this.targetId = 'music-player-controller';
    this.openPanelPeriphery = 1; // Move the difference between this and consider it to click to open the panel
    this.x = 0;
    this.y = 0;

    const {
      playModeText: { order, orderLoop, singleLoop, shufflePlay },
    } = props;

    // Playback mode configuration
    this.PLAY_MODE = {
      order: {
        key: 'order',
        value: order,
      },
      orderLoop: {
        key: 'orderLoop',
        value: orderLoop,
      },
      singleLoop: {
        key: 'singleLoop',
        value: singleLoop,
      },
      shufflePlay: {
        key: 'shufflePlay',
        value: shufflePlay,
      },
    };
    this._PLAY_MODE_ = Object.values(this.PLAY_MODE);
    this._PLAY_MODE_LENGTH_ = this._PLAY_MODE_.length;
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const {
      mode,
      audioLists,
      defaultPlayMode,
      remember,
      theme,
      defaultPlayIndex,
      autoPlay,
    } = this.props;

    // Toggle 'mini' or 'full' mode
    this.toggleMode(mode);

    if (audioLists.length >= 1) {
      const info = {
        ...this.getPlayInfo(audioLists),
        isInitAutoplay: autoPlay,
      };
      const lastPlayStatus = remember
        ? this.getLastPlayStatus(defaultPlayIndex)
        : { playMode: defaultPlayMode, theme };

      if (typeof info.musicSrc === 'function') {
        info
          .musicSrc()
          .then(val => {
            this.setState({
              ...info,
              musicSrc: val,
              ...lastPlayStatus,
            });
            return null;
          })
          .catch(this.onAudioLoadError);
      } else {
        this.setState({
          ...info,
          ...lastPlayStatus,
        });
      }
    }
  }

  componentDidMount() {
    this.addMobileListener();
    this.setDefaultAudioVolume();
    this.bindUnhandledRejection();
    if (this.props.audioLists.length >= 1) {
      this.bindEvents(this.audio);
      this.onGetAudioInstance();
      this.initLyricParser();
      if (IS_MOBILE) {
        this.bindMobileAutoPlayEvents();
      }
      if (!IS_MOBILE && isSafari()) {
        this.bindSafariAutoPlayEvents();
      }
    }
  }

  // When the parent component updates props, such as audioLists change, update playback information
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ audioLists, playIndex, theme, mode, clearPriorAudioLists }) {
    if (!arrayEqual(audioLists)(this.props.audioLists)) {
      if (clearPriorAudioLists) {
        this.changeAudioLists(audioLists);
      } else {
        this.updateAudioLists(audioLists);
      }
    } else {
      this.updatePlayIndex(playIndex);
    }
    this.updateTheme(theme);
    this.updateMode(mode);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (
      nextProps.clearPriorAudioLists &&
      nextState.isAudioListsChange !== this.state.isAudioListsChange
    ) {
      this.resetPlayList(nextState);
    }
  }

  componentWillUnmount() {
    this.unBindEvents(this.audio, undefined, false);
    this.unBindUnhandledRejection();
    this.media.removeListener(this.listenerIsMobile);
    this.media = undefined;
  }

  // Music information returned to the user
  getBaseAudioInfo() {
    const { playId, cover, name, musicSrc, soundValue, lyric, audioLists } = this.state;

    const {
      currentTime,
      duration,
      muted,
      networkState,
      readyState,
      played,
      paused,
      ended,
      startDate,
    } = this.audio;

    const currentPlayIndex = audioLists.findIndex(audio => audio.id === playId);
    const currentAudioListInfo = audioLists[currentPlayIndex] || {};

    return {
      ...currentAudioListInfo,
      cover,
      name,
      musicSrc,
      volume: soundValue,
      currentTime,
      duration,
      muted,
      networkState,
      readyState,
      played,
      paused,
      ended,
      startDate,
      lyric,
    };
  }

  bindUnhandledRejection = () => {
    window.addEventListener('unhandledrejection', this.onAudioLoadError); // eslint-disable-line no-undef
  };

  unBindUnhandledRejection = () => {
    window.removeEventListener('unhandledrejection', this.onAudioLoadError); // eslint-disable-line no-undef
  };

  // Render Play Mode Corresponding Button
  renderPlayModeIcon = playMode => {
    let IconNode = '';
    const animateName = 'react-jinke-music-player-mode-icon';
    switch (playMode) {
      case this.PLAY_MODE.order.key:
        IconNode = <OrderPlayIcon className={animateName} />;
        break;
      case this.PLAY_MODE.orderLoop.key:
        IconNode = <RepeatIcon className={animateName} />;
        break;
      case this.PLAY_MODE.singleLoop.key:
        IconNode = <LoopIcon className={animateName} />;
        break;
      case this.PLAY_MODE.shufflePlay.key:
        IconNode = <ShufflePlayIcon className={animateName} />;
        break;
      default:
        IconNode = <OrderPlayIcon className={animateName} />;
    }
    return IconNode;
  };

  toggleAudioLyric = () => {
    this.setState(prevState => {
      return { audioLyricVisible: prevState.audioLyricVisible };
    });
  };

  // Play mode switching
  togglePlayMode = () => {
    let index = this._PLAY_MODE_.findIndex(({ key }) => key === this.state.playMode);
    const playMode =
      index === this._PLAY_MODE_LENGTH_ - 1
        ? this._PLAY_MODE_[0].key
        : this._PLAY_MODE_[++index].key;
    this.setState({
      playMode,
      playModelNameVisible: true,
      playModeTipVisible: true,
    });
    this.props.onPlayModeChange && this.props.onPlayModeChange(this.PLAY_MODE[playMode]);

    clearTimeout(this.playModelTimer);
    this.playModelTimer = setTimeout(() => {
      this.setState({ playModelNameVisible: false, playModeTipVisible: false });
    }, this.props.playModeShowTime);
  };

  /**
   * Select songs in the music list panel
   * Previous song Next song
   * Music ends
   * General method
   * @tip: ignore if true, playId is not paused, but replay is suitable for logic such as random play and replay
   */
  audioListsPlay = (playId, ignore = false, state = this.state) => {
    const { playId: currentPlayId, pause, playing, audioLists } = state;
    if (Array.isArray(audioLists) && audioLists.length === 0) {
      /* eslint-disable no-console */
      return console.warn('Your playlist has no songs. and cannot play !');
      /* eslint-disable no-console */
    }
    // If click the current item, pause or play
    if (playId === currentPlayId && !ignore) {
      this.setState({ pause: !pause, playing: !playing });
      return pause ? this.audio.play() : this._pauseAudio();
    }

    const { name, cover, musicSrc, singer, lyric = '' } = audioLists.find(
      audio => audio.id === playId
    );

    // eslint-disable-next-line no-shadow
    const loadAudio = musicSrc => {
      this.setState(
        {
          name,
          cover,
          musicSrc,
          singer,
          playId,
          lyric,
          currentTime: 0,
          duration: 0,
          playing: false,
          loading: true,
          loadProgress: 0,
        },
        () => {
          this.initLyricParser();
          this.audio.load();
        }
      );
      this.props.onAudioPlay && this.props.onAudioPlay(this.getBaseAudioInfo());
      this.props.onAudioPlayTrackChange &&
        this.props.onAudioPlayTrackChange(playId, audioLists, this.getBaseAudioInfo());
    };

    if (typeof musicSrc === 'function') {
      musicSrc()
        .then(originMusicSrc => {
          loadAudio(originMusicSrc);
          return null;
        })
        .catch(this.onAudioLoadError);
    } else {
      loadAudio(musicSrc);
    }

    return true;
  };

  resetAudioStatus = () => {
    this.audio.pause();
    this.initPlayInfo([]);
    this.setState({
      currentTime: 0,
      duration: 0,
      loading: false,
      playing: false,
      pause: true,
      currentLyric: '',
    });
  };

  deleteAudioLists = audioId => e => {
    e.stopPropagation();
    // If you don't pass id, delete all
    const { audioLists, playId } = this.state;
    if (audioLists.length < 1) {
      return true;
    }
    this.lyric && this.lyric.stop();
    if (!audioId) {
      this.props.onAudioListsChange && this.props.onAudioListsChange('', [], {});
      return this.resetAudioStatus();
    }
    // eslint-disable-next-line consistent-return
    const newAudioLists = [...audioLists].filter(audio => audio.id !== audioId);
    // Trigger delete animation, wait for animation to end
    this.setState({ removeId: audioId });
    setTimeout(() => {
      this.setState(
        {
          audioLists: newAudioLists,
          removeId: -1,
        },
        () => {
          if (!newAudioLists.length) {
            return this.resetAudioStatus();
          }
          // If the deletion is currently playing, postpone the next song
          if (audioId === playId) {
            this.handlePlay(this.PLAY_MODE.orderLoop.key);
          }
          return true;
        }
      );
    }, this.audioListRemoveAnimateTime);

    this.props.onAudioListsChange &&
      this.props.onAudioListsChange(playId, newAudioLists, this.getBaseAudioInfo());
    return true;
  };

  openAudioListsPanel = () => {
    this.setState(({ audioListsPanelVisible }) => ({
      initAnimate: true,
      audioListsPanelVisible: !audioListsPanelVisible,
    }));
    this.props.onAudioListsPanelChange &&
      this.props.onAudioListsPanelChange(!this.state.audioListsPanelVisible);
  };

  closeAudioListsPanel = e => {
    e.stopPropagation();
    this.setState({ audioListsPanelVisible: false });
    this.props.onAudioListsPanelChange && this.props.onAudioListsPanelChange(false);
  };

  themeChange = isLight => {
    const theme = isLight ? this.lightThemeName : this.darkThemeName;
    this.setState({
      theme,
    });
    this.props.onThemeChange && this.props.onThemeChange(theme);
  };

  onAudioDownload = () => {
    if (this.state.musicSrc) {
      const baseAudioInfo = this.getBaseAudioInfo();
      const onBeforeAudioDownload = this.props.onBeforeAudioDownload(baseAudioInfo);
      let transformedDownloadAudioInfo = {};
      // eslint-disable-next-line promise/catch-or-return
      if (onBeforeAudioDownload && onBeforeAudioDownload.then) {
        onBeforeAudioDownload
          .then(info => {
            const { src, filename, mimeType } = info;
            transformedDownloadAudioInfo = info;
            download(src, filename, mimeType);
            return null;
          })
          .catch();
      } else {
        download(this.state.musicSrc);
      }
      this.props.onAudioDownload &&
        this.props.onAudioDownload(baseAudioInfo, transformedDownloadAudioInfo);
    }
  };

  controllerMouseMove = (e, { deltaX, deltaY }) => {
    const isMove =
      Math.abs(deltaX) >= this.openPanelPeriphery || Math.abs(deltaY) >= this.openPanelPeriphery;
    this.setState({
      isMove,
    });
  };

  controllerMouseUp = (e, { x, y }) => {
    if (!this.state.isMove) {
      if (this.state.isNeedMobileHack) {
        this.loadAndPlayAudio();
        this.setState({ isNeedMobileHack: false });
      }
      this.openPanel();
    }
    this.setState({ moveX: x, moveY: y });
    return false;
  };

  controllerMouseOut = e => {
    e.preventDefault();
    this.state.isDrag = false;
  };

  onHandleProgress = value => {
    this.audio.currentTime = value;
  };

  onSound = () => {
    this.setAudioVolume(this.state.currentAudioVolume);
  };

  setAudioVolume = value => {
    this.audio.volume = value;
    this.setState({
      currentAudioVolume: value,
      soundValue: value,
    });
  };

  stopAll = target => {
    target.stopPropagation();
    target.preventDefault();
  };

  getBoundingClientRect = ele => {
    const { left, top } = ele.getBoundingClientRect();
    return {
      left,
      top,
    };
  };

  // Loop
  audioLoop = () => {
    this.setState(({ isLoop }) => {
      return {
        isLoop: !isLoop,
      };
    });
  };

  // Replay
  onAudioReload = () => {
    this.handlePlay(this.PLAY_MODE.singleLoop.key);
    this.props.onAudioReload && this.props.onAudioReload(this.getBaseAudioInfo());
  };

  openPanel = () => {
    if (this.props.toggleMode) {
      this.setState({ toggle: true });
      this.props.onModeChange && this.props.onModeChange(this.toggleModeName.full);
    }
  };

  // Collapse player
  onHidePanel = () => {
    this.setState({ toggle: false, audioListsPanelVisible: false });
    this.props.onModeChange && this.props.onModeChange(this.toggleModeName.mini);
  };

  // Play
  onPlay = () => {
    if (this.state.audioLists.length >= 1) {
      this.lyric.togglePlay();
      if (this.state.playing) {
        this._pauseAudio();
      } else {
        this.loadAndPlayAudio();
      }
    }
  };

  canPlay = () => {
    this.setAudioLength();
    this.setState({
      loading: false,
      playing: false,
      isAudioListsChange: false,
    });

    if (this.state.isInitAutoplay) {
      this.loadAndPlayAudio();
    }
  };

  // Time out
  _pauseAudio = () => {
    this.audio.pause();
    this.setState({ playing: false, pause: true }, () => {
      this.lyric && this.lyric.stop();
    });
  };

  onPauseAudio = () => {
    this.lyric && this.lyric.stop();
    this.props.onAudioPause && this.props.onAudioPause(this.getBaseAudioInfo());
  };

  // Load audio
  loadAndPlayAudio = () => {
    const { autoPlay, remember } = this.props;
    const { isInitAutoplay, isInitRemember, loadProgress } = this.state;
    const { networkState } = this.audio;
    const maxLoadProgress = 100;
    this.setState({ loading: true });
    if (loadProgress < maxLoadProgress) {
      this.setState({ loadProgress: loadProgress + 1 });
    }
    if (
      // readyState === this.READY_SUCCESS_STATE &&
      networkState !== this.NETWORK_STATE.NETWORK_NO_SOURCE
    ) {
      const { pause } = this.getLastPlayStatus();
      const isLastPause = remember && !isInitRemember && pause;
      const canPlay = isInitAutoplay || autoPlay === true;
      this.setState(
        {
          playing: remember ? !isLastPause : canPlay,
          loading: false,
          pause: remember ? isLastPause : !canPlay,
          loadProgress: maxLoadProgress,
        },
        () => {
          if (remember ? !isLastPause : canPlay) {
            // fuck Safari is need muted :(
            // this.audio.muted = true
            this.audio.play();
          }
          this.setState({ isInitAutoplay: true, isInitRemember: true });
        }
      );
    } else {
      this.onAudioLoadError();
    }
  };

  // Set audio length
  setAudioLength = () => {
    this.setState({
      duration: this.audio.duration,
    });
  };

  onAudioLoadError = e => {
    const { playMode, audioLists, playId, musicSrc } = this.state;
    this.lyric.stop();

    // If there is an error loading the current music, try playing the next song
    const { loadAudioErrorPlayNext } = this.props;
    if (loadAudioErrorPlayNext && playId < audioLists.length - 1) {
      this.handlePlay(playMode);
    }

    // If the list is empty due to deleted songs or other reasons
    // Will trigger at this time https://developer.mozilla.org/en-US/docs/Web/API/MediaError
    if (musicSrc) {
      const info = this.getBaseAudioInfo();
      this.props.onAudioLoadError &&
        this.props.onAudioLoadError({
          ...e,
          audioInfo: info,
          errMsg: this.audio.error || null,
        });
    }
  };

  // isNext true next song  false
  /* eslint-disable no-unused-vars */
  handlePlay = (playMode, isNext = true) => {
    let IconNode = '';
    const { playId, audioLists } = this.state;
    const audioListsLen = audioLists.length;
    const currentPlayIndex = audioLists.findIndex(audio => audio.id === playId);
    switch (playMode) {
      // play in order
      case this.PLAY_MODE.order.key:
        IconNode = <OrderPlayIcon />;
        // After sorting by dragging or playing normally until the last song, pause
        if (currentPlayIndex === audioListsLen - 1) return this._pauseAudio();
        this.audioListsPlay(
          isNext ? audioLists[currentPlayIndex + 1].id : audioLists[currentPlayIndex - 1].id
        );
        break;

      // List loop
      case this.PLAY_MODE.orderLoop.key:
        IconNode = <RepeatIcon />;
        if (isNext) {
          if (currentPlayIndex === audioListsLen - 1) {
            return this.audioListsPlay(audioLists[0].id);
          }
          this.audioListsPlay(audioLists[currentPlayIndex + 1].id);
        } else {
          if (currentPlayIndex === 0) {
            return this.audioListsPlay(audioLists[audioListsLen - 1].id);
          }
          this.audioListsPlay(audioLists[currentPlayIndex - 1].id);
        }
        break;

      // Single cycle
      case this.PLAY_MODE.singleLoop.key:
        IconNode = <LoopIcon />;
        this.audio.currentTime = 0;
        this.audioListsPlay(playId, true);
        break;

      // Shuffle Playback
      case this.PLAY_MODE.shufflePlay.key:
        {
          IconNode = <ShufflePlayIcon />;
          const randomIndex = createRandomNum(0, audioListsLen - 1);
          const randomPlayId = (audioLists[randomIndex] || {}).id;
          this.audioListsPlay(randomPlayId, true);
        }
        break;
      default:
        IconNode = <OrderPlayIcon />;
    }
    return true;
  };

  // Audio playback ends
  audioEnd = () => {
    this.props.onAudioEnded && this.props.onAudioEnded(this.getBaseAudioInfo());
    this.handlePlay(this.state.playMode);
  };

  /**
   * Previous song Next song
   * Except for random playback, the next song is clicked in the order of the previous or next song.
   * Reference to regular player logic
   */
  audioPrevAndNextBasePlayHandle = (isNext = true) => {
    const { playMode } = this.state;
    let _playMode = '';
    if (playMode === this.PLAY_MODE.shufflePlay.key) {
      _playMode = playMode;
    } else {
      _playMode = this.PLAY_MODE.orderLoop.key;
    }
    this.handlePlay(_playMode, isNext);
  };

  // Previous song
  audioPrevPlay = () => {
    this.audioPrevAndNextBasePlayHandle(false);
  };

  // Next song
  audioNextPlay = () => {
    this.audioPrevAndNextBasePlayHandle(true);
  };

  // Play progress update
  audioTimeUpdate = () => {
    const { currentTime } = this.audio;
    this.setState({ currentTime });
    if (this.props.remember) {
      this.saveLastPlayStatus();
    }
    this.props.onAudioProgress && this.props.onAudioProgress(this.getBaseAudioInfo());
  };

  // Volume change
  audioSoundChange = value => {
    this.setAudioVolume(value);
  };

  onAudioVolumeChange = () => {
    this.setState({ isMute: this.audio.volume <= 0 });
    this.props.onAudioVolumeChange && this.props.onAudioVolumeChange(this.audio.volume);
  };

  onAudioPlay = () => {
    this.setState({ playing: true, loading: false }, this.initLyricParser);
    this.props.onAudioPlay && this.props.onAudioPlay(this.getBaseAudioInfo());
  };

  // Progress bar jump
  onAudioSeeked = () => {
    if (this.state.audioLists.length >= 1) {
      if (this.state.playing) {
        this.loadAndPlayAudio();
        setTimeout(() => {
          this.setState({ playing: true });
          this.lyric.seek(this.getLyricPlayTime());
        });
      }
      this.props.onAudioSeeked && this.props.onAudioSeeked(this.getBaseAudioInfo());
    }
  };

  // Mute
  onMute = () => {
    this.setState(
      {
        isMute: true,
        soundValue: 0,
        currentAudioVolume: this.audio.volume,
      },
      () => {
        this.audio.volume = 0;
      }
    );
  };

  // Load interrupted
  onAudioAbort = e => {
    const { audioLists } = this.state;
    const audioInfo = this.getBaseAudioInfo();
    const mergedError = { ...e, ...audioInfo };
    this.props.onAudioAbort && this.props.onAudioAbort(mergedError);
    if (audioLists.length) {
      this.audio.pause();
      this.state.isInitAutoplay && this.audio.play();
      this.lyric.stop();
    }
  };

  // Switch player mode
  toggleMode = mode => {
    if (mode === this.toggleModeName.full) {
      this.setState({ toggle: true });
    }
  };

  // Sort by drag and drop
  audioListsDragEnd = (fromIndex, toIndex) => {
    const { playId, audioLists } = this.state;
    const _audioLists = [...audioLists];
    const item = _audioLists.splice(fromIndex, 1)[0];
    _audioLists.splice(toIndex, 0, item);

    // If you drag a song that is playing, the playback Id is equal to the index after dragging
    const _playId = fromIndex === playId ? toIndex : playId;

    this.setState({ audioLists: _audioLists, playId: _playId });

    this.props.onAudioListsDragEnd && this.props.onAudioListsDragEnd(fromIndex, toIndex);

    this.props.onAudioListsChange &&
      this.props.onAudioListsChange(_playId, _audioLists, this.getBaseAudioInfo());
  };

  saveLastPlayStatus = () => {
    const {
      currentTime,
      playId,
      duration,
      theme,
      soundValue,
      playMode,
      name,
      cover,
      singer,
      musicSrc,
      pause,
    } = this.state;
    const lastPlayStatus = JSON.stringify({
      currentTime,
      playId,
      duration,
      theme,
      playMode,
      soundValue,
      name,
      cover,
      singer,
      musicSrc,
      pause,
    });
    localStorage.setItem('lastPlayStatus', lastPlayStatus);
  };

  getLastPlayStatus = () => {
    const { theme, defaultPlayMode } = this.props;

    const status = {
      currentTime: 0,
      duration: 0,
      playMode: defaultPlayMode,
      name: '',
      cover: '',
      singer: '',
      musicSrc: '',
      lyric: '',
      playId: this.getDefaultPlayId(),
      theme,
      pause: false,
    };
    try {
      return JSON.parse(localStorage.getItem('lastPlayStatus')) || status;
    } catch (error) {
      return status;
    }
  };

  mockAutoPlayForMobile = () => {
    if (this.props.autoPlay && !this.state.playing && this.state.pause) {
      this.audio.load();
      this.audio.pause();
      this.audio.play();
    }
  };

  bindMobileAutoPlayEvents = () => {
    document.addEventListener(
      'touchstart',
      () => {
        this.mockAutoPlayForMobile();
      },
      { once: true }
    );
    // Listen for WeChat Ready events
    document.addEventListener('WeixinJSBridgeReady', () => {
      this.mockAutoPlayForMobile();
    });
  };

  bindSafariAutoPlayEvents = () => {
    document.addEventListener(
      'click',
      () => {
        this.mockAutoPlayForMobile();
      },
      { once: true }
    );
  };

  unBindEvents = (...options) => {
    this.bindEvents(...options);
  };

  /**
   * Bind audio tag event
   */
  bindEvents = (
    target = this.audio,
    eventsNames = {
      waiting: this.loadAndPlayAudio,
      canplay: this.canPlay,
      error: this.onAudioLoadError,
      ended: this.audioEnd,
      seeked: this.onAudioSeeked,
      pause: this.onPauseAudio,
      play: this.onAudioPlay,
      timeupdate: this.audioTimeUpdate,
      volumechange: this.onAudioVolumeChange,
      stalled: this.onAudioLoadError, // When the browser tries to get media data but the data is not available
      abort: this.onAudioAbort,
    },
    bind = true
  ) => {
    const { once } = this.props;
    Object.keys(eventsNames).forEach(name => {
      const _events = eventsNames[name];
      // eslint-disable-next-line no-unused-expressions
      bind
        ? target.addEventListener(name, _events, { once: !!(once && name === 'play') })
        : target.removeEventListener(name, _events);
    });
  };

  getPlayInfo = (audioLists = []) => {
    const newAudioLists = audioLists.filter(audio => !audio.id);
    const lastAudioLists = audioLists.filter(audio => audio.id);
    const _audioLists = [
      ...lastAudioLists,
      ...newAudioLists.map(info => {
        return {
          ...info,
          id: uuId(),
        };
      }),
    ];
    const playIndex = Math.max(0, Math.min(_audioLists.length, this.props.defaultPlayIndex));
    const playId = this.state.playId || _audioLists[playIndex].id;
    const { name = '', cover = '', singer = '', musicSrc = '', lyric = '' } =
      _audioLists.find(({ id }) => id === playId) || {};
    return {
      name,
      cover,
      singer,
      musicSrc,
      lyric,
      audioLists: _audioLists,
      playId,
    };
  };

  // I change the name of getPlayInfo to getPlayInfoOfNewList because i didn't want to change the prior changes
  // the only thing this function does is to add id to audiolist elements.
  getPlayInfoOfNewList = (audioLists = []) => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    const _audioLists = audioLists.map(info => {
      return {
        ...info,
        id: uuId(),
      };
    });

    const playIndex = Math.max(0, Math.min(_audioLists.length, this.props.defaultPlayIndex));

    const playId = this.state.playId || _audioLists[playIndex].id;

    const { name = '', cover = '', singer = '', musicSrc = '', lyric = '' } =
      _audioLists.find(({ id }) => id === playId) || {};
    return {
      name,
      cover,
      singer,
      musicSrc,
      lyric,
      audioLists: _audioLists,
      playId,
    };
  };

  initPlayInfo = (audioLists, cb) => {
    const info = this.getPlayInfo(audioLists);

    if (typeof info.musicSrc === 'function') {
      info
        .musicSrc()
        .then(originMusicSrc => {
          this.setState({ ...info, musicSrc: originMusicSrc }, cb);
          return null;
        })
        .catch(this.onAudioLoadError);
    } else {
      this.setState(info, cb);
    }
  };

  listenerIsMobile = ({ matches }) => {
    this.setState({
      isMobile: !!matches,
    });
  };

  addMobileListener = () => {
    this.media = window.matchMedia('(max-width: 768px) and (orientation : portrait)'); // eslint-disable-line no-undef
    this.media.addListener(this.listenerIsMobile);
  };

  setDefaultAudioVolume = () => {
    const { defaultVolume, remember } = this.props;
    // Volume [0-100]
    this.defaultVolume = Math.max(0, Math.min(defaultVolume, 100)) / 100;
    const { soundValue = this.defaultVolume } = this.getLastPlayStatus();
    this.setAudioVolume(remember ? soundValue : this.defaultVolume);
  };

  getDefaultPlayId = (audioLists = this.props.audioLists) => {
    const playIndex = Math.max(0, Math.min(audioLists.length, this.props.defaultPlayIndex));
    return audioLists[playIndex] && audioLists[playIndex].id;
  };

  getLyricPlayTime = () => {
    const [m, s] = formatTime(this.audio.currentTime).split(':');
    return m * 1000 + s * 10;
  };

  initLyricParser = () => {
    this.lyric = undefined;
    this.lyric = new Lyric(this.state.lyric, this.onLyricChange);
    this.lyric.stop();
    if (this.props.showLyric && this.state.playing) {
      this.lyric.seek(this.getLyricPlayTime());
      this.lyric.play();
    }
  };

  onLyricChange = ({ lineNum, txt }) => {
    this.setState({
      currentLyric: txt,
    });
    this.props.onAudioLyricChange && this.props.onAudioLyricChange(lineNum, txt);
  };

  updateTheme = theme => {
    if (
      theme &&
      theme !== this.props.theme &&
      (theme === this.lightThemeName || theme === this.darkThemeName)
    ) {
      this.setState({ theme });
      this.props.onThemeChange && this.props.onThemeChange(theme);
    }
  };

  updateMode = mode => {
    if (
      mode &&
      mode !== this.props.mode &&
      (mode === this.toggleModeName.full || mode === this.toggleModeName.mini)
    ) {
      this.setState({ toggle: mode === this.toggleModeName.full });
      this.props.onModeChange && this.props.onModeChange(mode);
    }
  };

  updateAudioLists = audioLists => {
    const newAudioLists = [
      ...this.state.audioLists,
      ...audioLists.filter(
        audio => this.state.audioLists.findIndex(v => v.musicSrc === audio.musicSrc) === -1
      ),
    ];
    this.initPlayInfo(newAudioLists);
    this.bindEvents(this.audio);
    this.props.onAudioListsChange &&
      this.props.onAudioListsChange(this.state.playId, audioLists, this.getBaseAudioInfo());
  };

  loadNewAudioLists = (
    audioLists,
    { remember, defaultPlayIndex, defaultPlayMode, theme, autoPlayInitLoadPlayList }
  ) => {
    if (audioLists.length >= 1) {
      const info = this.getPlayInfoOfNewList(audioLists);
      const lastPlayStatus = remember
        ? this.getLastPlayStatus(defaultPlayIndex)
        : { playMode: defaultPlayMode, theme };

      if (typeof info.musicSrc === 'function') {
        info
          .musicSrc()
          .then(val => {
            this.setState({
              ...info,
              musicSrc: val,
              isInitAutoplay: autoPlayInitLoadPlayList,
              ...lastPlayStatus,
            });
            return null;
          })
          .catch(this.onAudioLoadError);
      } else {
        this.setState({
          ...info,
          isInitAutoplay: autoPlayInitLoadPlayList,
          ...lastPlayStatus,
        });
      }
    }
  };

  changeAudioLists = audioLists => {
    this.resetAudioStatus();
    this.loadNewAudioLists(audioLists, this.props);
    this.props.onAudioListsChange &&
      this.props.onAudioListsChange(this.state.playId, audioLists, this.getBaseAudioInfo());
    this.setState({ isAudioListsChange: true });
  };

  resetPlayList = state => {
    const _playIndex = Math.max(0, Math.min(state.audioLists.length, this.props.defaultPlayIndex));

    const currentPlay = state.audioLists[_playIndex];
    if (currentPlay && currentPlay.id) {
      this.audioListsPlay(currentPlay.id, true, state);
    }
  };

  updatePlayIndex = playIndex => {
    // Play index change
    const currentPlayIndex = this.state.audioLists.findIndex(
      audio => audio.id === this.state.playId
    );
    if (currentPlayIndex !== playIndex) {
      const _playIndex = Math.max(0, Math.min(this.state.audioLists.length, playIndex));
      const currentPlay = this.state.audioLists[_playIndex];
      if (currentPlay && currentPlay.id) {
        this.audioListsPlay(currentPlay.id, true);
      }
    }
  };

  onGetAudioInstance = () => {
    this.props.getAudioInstance && this.props.getAudioInstance(this.audio);
  };

  render() {
    const {
      className,
      controllerTitle,
      closeText,
      openText,
      notContentText,
      drag,
      style,
      showDownload,
      showPlay,
      showReload,
      showPlayMode,
      showThemeSwitch,
      panelTitle,
      checkedText,
      unCheckedText,
      toggleMode,
      showMiniModeCover,
      extendsContent,
      defaultPlayMode,
      seeked,
      showProgressLoadBar,
      bounds,
      defaultPosition,
      showMiniProcessBar,
      preload,
      glassBg,
      remove,
      lyricClassName,
      showLyric,
      emptyLyricPlaceholder,
      getContainer,
      autoHiddenCover,
    } = this.props;

    const {
      toggle,
      playing,
      duration,
      currentTime,
      isMute,
      soundValue,
      moveX,
      moveY,
      loading,
      audioListsPanelVisible,
      pause,
      theme,
      name,
      cover,
      singer,
      musicSrc,
      playId,
      isMobile, // eslint-disable-line no-shadow
      playMode,
      playModeTipVisible,
      playModelNameVisible,
      initAnimate,
      loadProgress,
      audioLists,
      removeId,
      currentLyric,
      audioLyricVisible,
    } = this.state;

    const preloadState =
      !(preload === false || preload === 'none') &&
      (preload === true ? { preload: 'auto' } : { preload });

    const panelToggleAnimate = initAnimate
      ? { show: audioListsPanelVisible, hide: !audioListsPanelVisible }
      : { show: audioListsPanelVisible };

    const _playMode_ = this.PLAY_MODE[playMode || defaultPlayMode];

    const currentPlayMode = _playMode_.key;
    const currentPlayModeName = _playMode_.value;

    const isShowMiniModeCover =
      (showMiniModeCover && !autoHiddenCover) ||
      (autoHiddenCover && cover && { style: { backgroundImage: `url(${cover})` } });

    const _currentTime = formatTime(currentTime);
    const _duration = formatTime(duration);

    const progressHandler = seeked && {
      onChange: this.onHandleProgress,
      onAfterChange: this.onAudioSeeked,
    };

    // progress bar
    const ProgressBar = (
      <Slider
        max={Math.ceil(duration)}
        defaultValue={0}
        value={Math.ceil(currentTime)}
        {...progressHandler}
        {...sliderBaseOptions}
      />
    );

    // Download button
    const DownloadComponent = showDownload && (
      <span
        className="group audio-download"
        {...{ [IS_MOBILE ? 'onTouchStart' : 'onClick']: this.onAudioDownload }}
      >
        <Download />
      </span>
    );

    // Theme switch
    const ThemeSwitchComponent = showThemeSwitch && (
      <span className="group theme-switch">
        <Switch
          className="theme-switch-container"
          onChange={this.themeChange}
          checkedChildren={checkedText}
          unCheckedChildren={unCheckedText}
          checked={theme === this.lightThemeName}
        />
      </span>
    );

    // Replay
    const ReloadComponent = showReload && (
      <span
        className="group reload-btn"
        {...(IS_MOBILE ? { onTouchStart: this.onAudioReload } : { onClick: this.onAudioReload })}
        key="reload-btn"
        title="Reload"
      >
        <Reload />
      </span>
    );

    // lyrics
    const LyricComponent = showLyric && (
      <span
        className={classNames('group lyric-btn', {
          'lyric-btn-active': audioLyricVisible,
        })}
        {...(IS_MOBILE
          ? { onTouchStart: this.toggleAudioLyric }
          : { onClick: this.toggleAudioLyric })}
        key="lyric-btn"
        title="toggle lyric"
      >
        <LyricIcon />
      </span>
    );

    const LyricComponentDraggable = audioLyricVisible && (
      <Draggable>
        <div className={classNames('music-player-lyric', lyricClassName)}>
          {currentLyric || emptyLyricPlaceholder}
        </div>
      </Draggable>
    );

    // Play mode
    const PlayModeComponent = showPlayMode && (
      <span
        className={classNames('group loop-btn')}
        {...(IS_MOBILE ? { onTouchStart: this.togglePlayMode } : { onClick: this.togglePlayMode })}
        key="play-mode-btn"
        title={this.PLAY_MODE[currentPlayMode].value}
      >
        {this.renderPlayModeIcon(currentPlayMode)}
      </span>
    );

    const miniProcessBarR = isMobile ? 30 : 40;

    const container = getContainer() || document.body;

    return createPortal(
      <div
        className={classNames(
          'react-amai-music-player-main',
          {
            'light-theme': theme === this.lightThemeName,
            'dark-theme': theme === this.darkThemeName,
          },
          className
        )}
        style={style}
      >
        {toggle && isMobile && (
          <AudioPlayerMobile
            playing={playing}
            loading={loading}
            pause={pause}
            name={name}
            singer={singer}
            cover={cover}
            themeSwitch={ThemeSwitchComponent}
            duration={_duration}
            currentTime={_currentTime}
            progressBar={ProgressBar}
            onPlay={this.onPlay}
            currentPlayModeName={this.PLAY_MODE[currentPlayMode].value}
            playMode={PlayModeComponent}
            audioNextPlay={this.audioNextPlay}
            audioPrevPlay={this.audioPrevPlay}
            playListsIcon={<PlayLists />}
            reloadIcon={ReloadComponent}
            downloadIcon={DownloadComponent}
            nextAudioIcon={<NextAudioIcon />}
            prevAudioIcon={<PrevAudioIcon />}
            playIcon={<AnimatePlayIcon />}
            pauseIcon={<AnimatePauseIcon />}
            closeIcon={<CloseBtn />}
            loadingIcon={<Load />}
            playModeTipVisible={playModeTipVisible}
            openAudioListsPanel={this.openAudioListsPanel}
            onClose={this.onHidePanel}
            extendsContent={extendsContent}
            glassBg={glassBg}
            LyricIcon={LyricComponent}
            autoHiddenCover={autoHiddenCover}
          />
        )}

        {!toggle && drag ? (
          <Draggable
            bounds={bounds}
            position={{ x: moveX, y: moveY }}
            onDrag={this.controllerMouseMove}
            onStop={this.controllerMouseUp}
            onStart={this.controllerMouseMove}
          >
            <AudioController
              defaultPosition={defaultPosition}
              showMiniProcessBar={showMiniProcessBar}
              currentTime={currentTime}
              duration={duration}
              miniProcessBarR={miniProcessBarR}
              isShowMiniModeCover={isShowMiniModeCover}
              loading={loading}
              controllerTitle={controllerTitle}
              toggle={toggle}
              closeText={closeText}
              openText={openText}
            />
          </Draggable>
        ) : (
          <AudioController
            defaultPosition={defaultPosition}
            showMiniProcessBar={showMiniProcessBar}
            currentTime={currentTime}
            duration={duration}
            miniProcessBarR={miniProcessBarR}
            isShowMiniModeCover={isShowMiniModeCover}
            loading={loading}
            controllerTitle={controllerTitle}
            toggle={toggle}
            closeText={closeText}
            openText={openText}
          />
        )}

        {toggle && !isMobile && (
          <PlayerPanel
            audioLists={audioLists}
            playing={playing}
            loading={loading}
            pause={pause}
            name={name}
            singer={singer}
            cover={cover}
            currentPlayModeName={this.PLAY_MODE[currentPlayMode].value}
            onClose={this.onHidePanel}
            extendsContent={extendsContent}
            glassBg={glassBg}
            autoHiddenCover={autoHiddenCover}
            playModelNameVisible={playModelNameVisible}
            toggleMode={toggleMode}
            LyricIcon={LyricComponent}
            playMode={PlayModeComponent}
            soundValue={soundValue}
            isMute={isMute}
            reloadIcon={ReloadComponent}
            downloadIcon={DownloadComponent}
            themeSwitch={ThemeSwitchComponent}
            showPlay={showPlay}
            showProgressLoadBar={showProgressLoadBar}
            loadProgress={loadProgress}
            nextAudioIcon={<NextAudioIcon />}
            prevAudioIcon={<PrevAudioIcon />}
            playListsIcon={<PlayLists />}
            closeIcon={<CloseBtn />}
          />
        )}

        {/* Playlist panel */}
        <AudioListsPanel
          playId={playId}
          pause={pause}
          loading={loading ? <Load /> : undefined}
          visible={audioListsPanelVisible}
          audioLists={audioLists}
          notContentText={notContentText}
          onPlay={this.audioListsPlay}
          onCancel={this.closeAudioListsPanel}
          onMute={this.onMute}
          playIcon={<AnimatePlayIcon />}
          pauseIcon={<AnimatePauseIcon />}
          closeIcon={<CloseBtn />}
          panelTitle={panelTitle}
          isMobile={isMobile}
          panelToggleAnimate={panelToggleAnimate}
          glassBg={glassBg}
          cover={cover}
          remove={remove}
          deleteIcon={<DeleteIcon />}
          onDelete={this.deleteAudioLists}
          removeId={removeId}
          audioListsDragEnd={this.audioListsDragEnd}
          sliderBaseOptions={sliderBaseOptions}
        />

        {/* lyrics */}
        {LyricComponentDraggable}

        <audio
          className="music-player-audio"
          {...preloadState}
          src={musicSrc}
          ref={node => (this.audio = node)} // eslint-disable-line no-return-assign
        />
      </div>,
      container
    );
  }
}

ReactAmaiMusicPlayer.propTypes = {
  audioLists: PropTypes.instanceOf(Array),
  theme: PropTypes.oneOf(['dark', 'light']),
  mode: PropTypes.oneOf(['mini', 'full']),
  defaultPlayMode: PropTypes.oneOf(['order', 'orderLoop', 'singleLoop', 'shufflePlay']),
  drag: PropTypes.bool,
  seeked: PropTypes.bool,
  autoPlay: PropTypes.bool,
  clearPriorAudioLists: PropTypes.bool,
  autoPlayInitLoadPlayList: PropTypes.bool,
  playModeText: PropTypes.instanceOf(Object),
  panelTitle: PropTypes.string,
  closeText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  openText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  notContentText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  controllerTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  defaultPosition: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    right: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  playModeTipVisible: PropTypes.bool,
  onAudioPlay: PropTypes.func,
  onAudioPause: PropTypes.func,
  onAudioEnded: PropTypes.func,
  onAudioAbort: PropTypes.func,
  onAudioVolumeChange: PropTypes.func,
  onAudioLoadError: PropTypes.func,
  onAudioProgress: PropTypes.func,
  onAudioSeeked: PropTypes.func,
  onAudioDownload: PropTypes.func,
  onAudioReload: PropTypes.func,
  onThemeChange: PropTypes.func,
  onAudioListsChange: PropTypes.func,
  onPlayModeChange: PropTypes.func,
  onModeChange: PropTypes.func,
  onAudioListsPanelChange: PropTypes.func,
  onAudioPlayTrackChange: PropTypes.func,
  onAudioListsDragEnd: PropTypes.func,
  onAudioLyricChange: PropTypes.func,
  showDownload: PropTypes.bool,
  showPlay: PropTypes.bool,
  showReload: PropTypes.bool,
  showPlayMode: PropTypes.bool,
  showThemeSwitch: PropTypes.bool,
  showMiniModeCover: PropTypes.bool,
  toggleMode: PropTypes.bool,
  once: PropTypes.bool,
  extendsContent: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
    PropTypes.object,
    PropTypes.node,
    PropTypes.element,
    PropTypes.string,
  ]),
  checkedText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  unCheckedText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  defaultVolume: PropTypes.number,
  playModeShowTime: PropTypes.number,
  bounds: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  showMiniProcessBar: PropTypes.bool,
  loadAudioErrorPlayNext: PropTypes.bool,
  preload: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['auto', 'metadata', 'none'])]),
  glassBg: PropTypes.bool,
  remember: PropTypes.bool,
  remove: PropTypes.bool,
  defaultPlayIndex: PropTypes.number,
  playIndex: PropTypes.number,
  lyricClassName: PropTypes.string,
  emptyLyricPlaceholder: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  showLyric: PropTypes.bool,
  getContainer: PropTypes.func,
  getAudioInstance: PropTypes.func,
  onBeforeAudioDownload: PropTypes.func,
  autoHiddenCover: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.string,
  showProgressLoadBar: PropTypes.bool,
};

ReactAmaiMusicPlayer.defaultProps = {
  audioLists: [],
  theme: 'dark',
  mode: 'mini',
  playModeText: {
    order: 'order',
    orderLoop: 'orderLoop',
    singleLoop: 'singleLoop',
    shufflePlay: 'shufflePlay',
  },
  defaultPlayMode: 'order',
  defaultPosition: {
    left: 0,
    top: 0,
  },
  controllerTitle: <FaHeadphones />,
  panelTitle: 'PlayList',
  closeText: 'close',
  openText: 'open',
  notContentText: 'no music',
  checkedText: '',
  unCheckedText: '',
  once: false, // onAudioPlay Whether the event is triggered only once
  drag: true,
  toggleMode: true, // Can switch between mini and full mode
  showMiniModeCover: true, // Whether to display the cover image in mini mode
  showDownload: true,
  showPlay: true,
  showReload: true,
  showPlayMode: true,
  showThemeSwitch: true,
  showLyric: false,
  playModeTipVisible: false, // Switch playback mode on mobile phone
  autoPlay: true,
  defaultVolume: 100,
  showProgressLoadBar: true, // Audio preload progress
  seeked: true,
  playModeShowTime: 600, // Play mode prompts show time
  bounds: 'body', // mini Removable borders
  showMiniProcessBar: false, // Whether to show progress bar in mini mode
  loadAudioErrorPlayNext: true, // When loading audio fails, whether to try to play the next song
  preload: false, // Whether to load audio immediately after the page loads
  glassBg: false, // Whether it is frosted glass effect
  remember: false, // Whether to remember the current playback status
  remove: true, // Can the music be deleted
  defaultPlayIndex: 0, // Default play index
  emptyLyricPlaceholder: 'NO LYRIC',
  getContainer: () => document.body, // Player-mounted node // eslint-disable-line no-undef
  autoHiddenCover: false, // Whether to hide automatically when the currently playing song has no cover
  onBeforeAudioDownload: () => {}, // Convert audio address before downloading, etc.
};

export default ReactAmaiMusicPlayer;
