import React from 'react';
import cls from 'classnames';
import NotContent from 'react-icons/lib/md/library-music';
import ArrowDownIcon from 'react-icons/lib/fa/angle-double-down';
import ReactDragListView from 'react-drag-listview/lib/ReactDragListView';

import PropTypes from 'prop-types';

const AudioListsPanel = ({
  audioLists,
  notContentText,
  onCancel,
  onDelete,
  onPlay,
  pause,
  playId,
  loading,
  playIcon,
  pauseIcon,
  closeIcon,
  deleteIcon,
  panelTitle,
  panelToggleAnimate,
  glassBg,
  remove,
  removeId,
  audioListsDragEnd,
  isMobile,
}) => (
  <div className={cls('audio-lists-panel', panelToggleAnimate, { 'glass-bg': glassBg })}>
    <div className="audio-lists-panel-header">
      <h2 className="title">
        <span>
          {panelTitle}
          {' / '}
        </span>
        <span className="num">{audioLists.length}</span>
        <button type="button" className="close-btn" title="Close" onClick={onCancel}>
          {isMobile ? <ArrowDownIcon /> : closeIcon}
        </button>
        {remove && (
          <>
            <span className="line" key="line" />
            <button
              type="button"
              className="delete-btn"
              title="Delete audio lists"
              onClick={onDelete()}
            >
              {deleteIcon}
            </button>
          </>
        )}
      </h2>
    </div>
    <div className={cls('audio-lists-panel-content', { 'no-content': audioLists.length < 1 })}>
      {audioLists.length >= 1 ? (
        <ReactDragListView
          nodeSelector="li"
          handleSelector=".player-name"
          lineClassName="audio-lists-panel-drag-line"
          onDragEnd={audioListsDragEnd}
        >
          <ul>
            {audioLists.map(audio => {
              const { name, singer } = audio;
              const playing = playId === audio.id;
              return (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={audio.id}
                  title={pause ? 'Click to play' : playing ? 'Click to pause' : 'Click to play'}
                  className={cls(
                    'audio-item',
                    { playing },
                    { pause },
                    { remove: removeId === audio.id }
                  )}
                  onClick={() => onPlay(audio.id)}
                >
                  <span className="group player-status">
                    <span className="player-icons">
                      {playing && loading && loading}
                      {!(playing && loading) && playing && (pause ? playIcon : pauseIcon)}
                    </span>
                  </span>
                  <span className="group player-name">{name}</span>
                  <span className="group player-time">{singer}</span>
                  {remove && (
                    <button
                      type="button"
                      className="group player-delete"
                      title={`Click to delete ${name}`}
                      onClick={onDelete(audio.id)}
                    >
                      {closeIcon}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </ReactDragListView>
      ) : (
        <>
          <span>
            <NotContent />
          </span>
          <span className="no-data">{notContentText}</span>
        </>
      )}
    </div>
  </div>
);

AudioListsPanel.propTypes = {
  audioLists: PropTypes.instanceOf(Array),
  audioListsDragEnd: PropTypes.func,
  closeIcon: PropTypes.instanceOf(Object),
  deleteIcon: PropTypes.instanceOf(Object),
  glassBg: PropTypes.bool,
  isMobile: PropTypes.bool,
  loading: PropTypes.instanceOf(Object),
  notContentText: PropTypes.string,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onPlay: PropTypes.func,
  panelTitle: PropTypes.string,
  panelToggleAnimate: PropTypes.instanceOf(Object),
  pause: PropTypes.bool,
  pauseIcon: PropTypes.instanceOf(Object),
  playIcon: PropTypes.instanceOf(Object),
  playId: PropTypes.string,
  remove: PropTypes.bool,
  removeId: PropTypes.number,
};

export default AudioListsPanel;
