import * as React from 'react'

export interface ReactAmaiMusicPlayerAudioInfo {
  cover: string
  currentTime: number
  duration: number
  ended: boolean
  musicSrc: string
  muted: boolean
  name: string
  networkState: number
  paused: boolean
  played: any
  readyState: number
  startDate: any
  volume: number
  lyric: string
  [key: string]: any
}

export type ReactAmaiMusicPlayerTheme = 'dark' | 'light'
export type ReactAmaiMusicPlayerMode = 'mini' | 'full'
export type ReactAmaiMusicPlayerPlayMode =
  | 'order'
  | 'orderLoop'
  | 'singleLoop'
  | 'shufflePlay'

export interface ReactAmaiMusicPlayerAudioList {
  name: string | React.ReactNode
  singer?: string | React.ReactNode
  cover?: string
  musicSrc: (() => Promise<string>) | string
  lyric?: string
  [key: string]: any
}

export interface ReactAmaiMusicPlayerProps {
  audioLists: Array<ReactAmaiMusicPlayerAudioList>
  theme?: ReactAmaiMusicPlayerTheme
  mode?: ReactAmaiMusicPlayerMode
  defaultPlayMode?: ReactAmaiMusicPlayerPlayMode
  drag?: boolean
  seeked?: boolean
  autoPlay?: boolean
  playModeText?: {
    order: string | React.ReactNode
    orderLoop: string | React.ReactNode
    singleLoop: string | React.ReactNode
    shufflePlay: string | React.ReactNode
  }
  panelTitle?: string | React.ReactNode
  closeText?: string | React.ReactNode
  openText?: string | React.ReactNode
  notContentText?: string | React.ReactNode
  controllerTitle?: string | React.ReactNode
  defaultPosition?: {
    top: number | string
    left: number | string
    right: number | string
    bottom: number | string
  }
  onAudioPlay?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioPause?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioEnded?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioAbort?: (data: any) => void
  onAudioVolumeChange?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioLoadError?: (data: any) => void
  onAudioProgress?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioSeeked?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onAudioDownload?: (
    audioInfo: ReactAmaiMusicPlayerAudioInfo,
    transformedDownloadAudioInfo: TransformedDownloadAudioInfo
  ) => void
  onAudioReload?: (audioInfo: ReactAmaiMusicPlayerAudioInfo) => void
  onThemeChange?: (theme: ReactAmaiMusicPlayerTheme) => void
  onAudioListsChange?: (
    currentPlayId: string,
    audioLists: Array<ReactAmaiMusicPlayerAudioList>,
    audioInfo: ReactAmaiMusicPlayerAudioInfo
  ) => void
  onPlayModeChange?: (playMode: ReactAmaiMusicPlayerPlayMode) => void
  onModeChange?: (mode: ReactAmaiMusicPlayerMode) => void
  onAudioListsPanelChange?: (panelVisible: boolean) => void
  onAudioPlayTrackChange?: (fromIndex: number, endIndex: number) => void
  onAudioListsDragEnd?: (
    currentPlayId: string,
    audioLists: Array<ReactAmaiMusicPlayerAudioList>,
    audioInfo: ReactAmaiMusicPlayerAudioInfo
  ) => void
  showDownload?: boolean
  showPlay?: boolean
  showReload?: boolean
  showPlayMode?: boolean
  showThemeSwitch?: boolean
  showMiniModeCover?: boolean
  toggleMode?: boolean
  once?: boolean
  extendsContent?:
    | (Array<React.ReactNode | string>)
    | React.ReactNode
    | boolean
    | string
  checkedText?: string | React.ReactNode
  unCheckedText?: string | React.ReactNode
  defaultVolume?: number
  playModeShowTime?: number
  bounds?: string | React.ReactNode
  showMiniProcessBar?: boolean
  loadAudioErrorPlayNext?: boolean
  preload?: boolean | 'auto' | 'metadata' | 'none'
  glassBg?: boolean
  remember?: boolean
  remove?: boolean
  defaultPlayIndex?: number
  playIndex?: number
  lyricClassName?: string
  emptyLyricPlaceholder?: string | React.ReactNode
  showLyric?: boolean
  getContainer?: () => HTMLElement
  getAudioInstance?: (instance: HTMLAudioElement) => void
  autoHiddenCover?: boolean
  onBeforeAudioDownload?: (
    audioInfo: ReactAmaiMusicPlayerAudioInfo
  ) => Promise<TransformedDownloadAudioInfo>
  clearPriorAudioLists?: boolean
  autoPlayInitLoadPlayList?: boolean
}

export interface TransformedDownloadAudioInfo {
  src: string
  filename?: string
  mimeType?: string
}

export default class ReactAmaiMusicPlayer extends React.PureComponent<
  ReactAmaiMusicPlayerProps,
  any
> {}
