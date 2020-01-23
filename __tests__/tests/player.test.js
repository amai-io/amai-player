/* global describe,it*/
/*eslint-disable no-console */
import React from 'react';
import assert from 'power-assert';
import { shallow, mount } from 'enzyme';

import ReactAmaiMusicPlayer, {
  AnimatePlayIcon,
  AnimatePauseIcon,
  Load,
  PlayModel,
  CircleProcessBar
} from '../../src';
import createRandomNum from '../../src/utils/createRandomNum';
import formatTime from '../../src/utils/formatTime';
import arrayEqual from '../../src/utils/arrayEqual';
import distinct from '../../src/utils/distinct';
import PlayerMobile, { PlayModeTip } from '../../src/components/PlayerMobile';
import AudioListsPanel from '../../src/components/AudioListsPanel';

describe('<ReactAmaiMusicPlayer/>', () => {
  it('should render a <ReactAmaiMusicPlayer/> components', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer className="text-class-name" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a <ReactAmaiMusicPlayer/> components', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        className="text-class-name"
        showMiniProcessBar={true}
      />
    );
    assert(wrapper.find('.react-amai-music-player-main').length === 1);
    assert(wrapper.find('.react-amai-music-player').length >= 1);
    assert(wrapper.find('.text-class-name').length >= 1);
    assert(wrapper.find('.audio-circle-process-bar').length >= 1);
    wrapper.setProps({ showMiniProcessBar: false });
    assert(wrapper.find('.audio-circle-process-bar').length === 0);
    wrapper.setState({ pause: false, playing: true, toggle: true });
    assert(wrapper.find(AnimatePauseIcon).length >= 1);
    wrapper.setState({ pause: true, playing: false });
    assert(wrapper.find(AnimatePlayIcon).length >= 1);
    wrapper.setState({ loading: true });
    assert(wrapper.find(Load).length >= 1);
    assert(wrapper.find(PlayModel).length >= 1);
    wrapper.setState({ toggle: false });
    wrapper.setProps({ showMiniProcessBar: true });
    assert(wrapper.find(CircleProcessBar).length >= 1);
  });
  it('should render <AudioListsPanel/> components', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer />);
    assert(wrapper.find(AudioListsPanel).length === 1);
    assert(wrapper.find('.audio-lists-panel').length === 1);
  });
  it('should find a <PlayerMobile/> components', () => {
    const wrapper = shallow(<PlayerMobile />);
    assert(wrapper.find('.react-amai-music-player-mobile').length === 1);
    assert(wrapper.find(PlayModeTip).length === 1);
  });
  it('should render mini of full mode', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer mode="full" />);
    assert(wrapper.props().mode === 'full');
    wrapper.setProps({ mode: 'mini' });
    assert(wrapper.props().mode === 'mini');
  });
  it('should render dark and light theme', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer theme="dark" />);
    assert(wrapper.props().theme === 'dark');
    wrapper.setState({ theme: 'dark' });
    assert(wrapper.find('.light-theme').length === 0);
    assert(wrapper.find('.dark-theme').length === 1);
    wrapper.setProps({ theme: 'light' });
    wrapper.setState({ theme: 'light' });
    assert(wrapper.props().theme === 'light');
    assert(wrapper.find('.dark-theme').length === 0);
    assert(wrapper.find('.light-theme').length === 1);
  });
  it('should find audioLists and return Array, playlists show "no music" text ', () => {
    const testProps = {
      audioLists: [
        {
          name: 'name',
          singer: 'singer',
          cover: 'test.jpg',
          musicSrc: 'test.mp3'
        }
      ]
    };
    const wrapper = mount(<ReactAmaiMusicPlayer {...testProps} />);
    assert(wrapper.props().audioLists.length >= 1);
    assert(wrapper.props().audioLists[0].name === 'name');
    assert(wrapper.props().audioLists[0].singer === 'singer');
    assert(wrapper.props().audioLists[0].cover === 'test.jpg');
    assert(wrapper.props().audioLists[0].musicSrc === 'test.mp3');
    wrapper.setProps({ audioLists: [] });
    setTimeout(() => {
      assert(wrapper.props().audioLists.length === 0);
      expect(wrapper.text()).toContain('no music');
    });
  });
  it('should toggle group setting buttons', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        showDownload={true}
        showThemeSwitch={true}
        showReload={true}
        showPlayMode={true}
      />
    );
    wrapper.setState({ loading: false, toggle: true });
    assert(wrapper.find('.audio-download').length >= 1);
    assert(wrapper.find('.group').length >= 1);
    assert(wrapper.find('.theme-switch').length >= 1);
    assert(wrapper.find('.reload-btn').length >= 1);
    assert(wrapper.find('.loop-btn').length === 1);
    wrapper.setState({ toggle: false });
    assert(wrapper.find('.audio-download').length === 0);
    assert(wrapper.find('.theme-switch').length === 0);
    assert(wrapper.find('.reload-btn').length === 0);
    assert(wrapper.find('.loop-btn').length === 0);
  });
  it('should find Specified text', () => {
    const testProps = {
      playModeText: {
        order: 'order',
        orderLoop: 'orderLoop',
        singleLoop: 'singleLoop',
        shufflePlay: 'shufflePlay'
      },
      controllerTitle: 'controllerTitle',
      openText: 'openText',
      closeText: 'closeText',
      panelTitle: 'panelTitle',
      notContentText: 'notContentText',
      checkedText: 'checkedText',
      unCheckedText: 'unCheckedText',
      showDownload: true,
      showThemeSwitch: true,
      showReload: true,
      showPlayMode: true,
      defaultPlayMode: 'order'
    };
    const wrapper = mount(<ReactAmaiMusicPlayer {...testProps} />);
    expect(wrapper.text()).toContain('openText');

    wrapper.setState({ toggle: false, loading: false });
    expect(wrapper.text()).toContain('controllerTitle');

    wrapper.setState({ toggle: true });
    expect(wrapper.text()).toContain('panelTitle');
    expect(wrapper.text()).toContain('unCheckedText');

    wrapper.setState({ theme: 'light' });
    expect(wrapper.text()).toContain('checkedText');
    expect(wrapper.text()).toContain('order');

    wrapper.setProps({ audioLists: [] });
    expect(wrapper.text()).toContain('notContentText');
  });
  it('should render seeked', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer seeked={true} />);
    assert(wrapper.props().seeked === true);
    wrapper.setProps({ seeked: false });
    assert(wrapper.props().seeked === false);
  });
  it('should render extendsContent', () => {
    const extendsContent = [
      <span key="1" className="extendsContent">
        extendsText1
      </span>,
      <span key="2">extendsText2</span>
    ];
    const wrapper = mount(
      <ReactAmaiMusicPlayer extendsContent={extendsContent} />
    );
    wrapper.setState({ toggle: true });
    expect(wrapper.text()).toContain('extendsText1');
    expect(wrapper.text()).toContain('extendsText2');
    assert(wrapper.find('.extendsContent').length === 1);
  });
  it('should render extendsContent with react fragment', () => {
    const ExtendsContent = () => (
      <>
        <button>1</button>
      </>
    );
    const wrapper = mount(
      <ReactAmaiMusicPlayer extendsContent={<ExtendsContent />} />
    );
    const wrapper1 = mount(<ReactAmaiMusicPlayer extendsContent={'extends'} />);
    wrapper.setState({ toggle: true });
    wrapper1.setState({ toggle: true });
    assert(wrapper.find(ExtendsContent).length === 1);
    expect(wrapper1.text()).toContain('extends');
  });
  it('should render range random', () => {
    const repeat = 10;
    const result = new Array(repeat).fill().map((_, i) => {
      return createRandomNum(0, i + 1) <= i + 1;
    });
    expect(result.filter((v) => v)).toHaveLength(repeat);
  });
  it('should set defaultVolume', () => {
    const volumes = [100, 20];
    const wrapper = mount(<ReactAmaiMusicPlayer defaultVolume={volumes[0]} />);
    assert(wrapper.props().defaultVolume === volumes[0]);
    wrapper.setProps({ defaultVolume: volumes[1] });
    assert(wrapper.props().defaultVolume === volumes[1]);
  });
  it('should autoPlay', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer autoPlay={false} />);
    assert(wrapper.state().playing === false);
    assert(wrapper.state().pause === true);
    wrapper.setProps({ autoPlay: true });
    assert(wrapper.props().autoPlay === true);
  });
  it('should render glass background', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer glassBg={true} />);
    assert(wrapper.props().glassBg === true);
    assert(wrapper.find('.glass-bg').length >= 1);
  });
  it('should render delete btns', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer audioLists={[]} remove={true} />);
    assert(wrapper.find('.delete-btn').length >= 1);
    assert(wrapper.find('.player-delete').length === 0);
    wrapper.setState({
      audioLists: [
        {
          name: 'name',
          singer: 'singer',
          cover: 'test.jpg',
          musicSrc: 'test.mp3'
        }
      ]
    });
    assert(wrapper.find('.player-delete').length === 1);
  });
  it('should render progress load bar', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer showProgressLoadBar={true} />);
    wrapper.setState({ toggle: true });
    assert(wrapper.props().showProgressLoadBar === true);
    assert(wrapper.find('.progress-load-bar').length === 1);
    wrapper.setProps({ showProgressLoadBar: false });
    assert(wrapper.props().showProgressLoadBar === false);
    assert(wrapper.find('.progress-load-bar').length === 0);
  });
  it('should print second return format time', () => {
    assert(formatTime(30000) === '08:20:00');
    assert(formatTime(60) === '00:60');
    assert(formatTime(140) === '02:20');
    assert(formatTime(2 * 60 * 60) === '02:00:00');
    assert(formatTime(2 * 60 * 60 + 30) === '02:00:30');
  });
  it('should return array is equal', () => {
    assert(arrayEqual([1])([1]) === true);
    assert(arrayEqual([1])([2]) === false);
    assert(arrayEqual([{ musicSrc: '' }])([{ musicSrc: 'xx' }]) === false);
    assert(arrayEqual([{ musicSrc: 'aa' }])([{ musicSrc: 'aa' }]) === true);
  });
  it('should distinct arrar', () => {
    assert(arrayEqual(distinct([1, 1, 1]))([1]) === true);
    assert(arrayEqual(distinct([{ a: 1 }, { a: 1 }]))([{ a: 1 }]) === true);
  });
  it('should render operation group', () => {
    const prefix = '.react-amai-music-player-mobile';
    const wrapper = mount(<ReactAmaiMusicPlayer />);
    wrapper.setState({ toggle: true });
    assert(wrapper.find(PlayerMobile).length === 0);
    wrapper.setState({ isMobile: true });
    assert(wrapper.find(PlayerMobile).length === 1);
    assert(wrapper.find(`${prefix}-header`).length === 1);
    assert(wrapper.find(`${prefix}-singer`).length === 1);
    assert(wrapper.find(`${prefix}-switch`).length === 1);
    assert(wrapper.find(`${prefix}-cover`).length === 1);
    assert(wrapper.find(`${prefix}-progress`).length === 1);
    assert(wrapper.find(`${prefix}-toggle`).length === 1);
    assert(wrapper.find(`${prefix}-operation`).length === 1);
    assert(wrapper.find('.img-rotate-pause').length === 1);
  });
  it('should render extendsContent with mobile', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer extendsContent={[<div key="test">extends</div>]} />
    );
    wrapper.setState({ toggle: true, isMobile: true });
    assert(
      wrapper.find('.react-amai-music-player-mobile-operation .item').length >=
        5
    );
  });
  it('should render music player in custom root node', () => {
    const div = document.createElement('div');
    div.className = 'test';
    const wrapper = mount(<ReactAmaiMusicPlayer getContainer={() => div} />);
    expect(wrapper.find('.test')).toHaveLength(0);
  });

  it('should render music player in custom root node', () => {
    const wrapper = mount(
      <div>
        <div className="test">
          <ReactAmaiMusicPlayer
            getContainer={() => document.querySelector('.test')}
          />
        </div>
        <span className="test1"></span>
      </div>
    );
    expect(wrapper.find('.test1').find(ReactAmaiMusicPlayer)).toHaveLength(0);
    expect(wrapper.find('.test').find(ReactAmaiMusicPlayer)).toHaveLength(1);
  });

  it('should cannot render player in invalid custom root node', () => {
    const div = 1;
    try {
      mount(<ReactAmaiMusicPlayer getContainer={() => div} />);
    } catch (error) {
      expect(error.message).toContain('Target container is not a DOM element');
    }
  });
  it('update state theme when option theme change', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer theme="light" />);
    wrapper.setProps({ theme: 'dark' });
    expect(wrapper.state().theme).toEqual('dark');
    wrapper.setProps({ theme: 'xxxx' });
    expect(wrapper.state().theme).toEqual('dark');
  });

  it('trigger theme change handler when option theme change', () => {
    const onThemeChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer theme="light" onThemeChange={onThemeChange} />
    );
    wrapper.setProps({ theme: 'dark' });
    expect(onThemeChange).toHaveBeenCalled();
  });

  it('update mode', () => {
    const onModeChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer mode="mini" onModeChange={onModeChange} />
    );
    wrapper.setProps({ mode: 'full' });
    expect(onModeChange).toHaveBeenCalled();
    expect(wrapper.state().toggle).toEqual(true);
    wrapper.setProps({ mode: 'xxxx' });
    expect(wrapper.state().toggle).toEqual(true);
    wrapper.setProps({ mode: 'mini' });
    expect(wrapper.state().toggle).toEqual(false);
  });

  it('mode change handler when update mode', () => {
    const onModeChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer mode="mini" onModeChange={onModeChange} />
    );
    wrapper.setProps({ mode: 'full' });
    expect(onModeChange).toHaveBeenCalled();
  });
  it('should cannot find lyric operation button', () => {
    const wrapper = mount(<ReactAmaiMusicPlayer audioLists={[]} mode="full" />);
    wrapper.setState({ isMobile: true });
    expect(
      wrapper.find('.react-amai-music-player-mobile-operation .item')
    ).toHaveLength(4);
  });

  it('should find five operation button when toggle lyric option', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer audioLists={[]} mode="full" showLyric={false} />
    );
    wrapper.setState({ isMobile: true });
    expect(
      wrapper.find('.react-amai-music-player-mobile-operation .item')
    ).toHaveLength(4);
    wrapper.setProps({ showLyric: true });
    expect(
      wrapper.find('.react-amai-music-player-mobile-operation .item')
    ).toHaveLength(5);
  });
  it('should only render audio list menu button when ', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[]}
        mode="full"
        showLyric={false}
        showDownload={false}
        showPlayMode={false}
        showReload={false}
      />
    );
    wrapper.setState({ isMobile: true });
    expect(
      wrapper.find('.react-amai-music-player-mobile-operation .item')
    ).toHaveLength(1);
  });
  it('should cannot trigger onAudioLoadError when clear audioLists', () => {
    const onAudioLoadError = jest.fn();
    const testProps = {
      audioLists: [
        {
          name: 'name',
          singer: 'singer',
          cover: 'test.jpg',
          musicSrc: 'test.mp3'
        }
      ],
      onAudioLoadError
    };
    const wrapper = mount(<ReactAmaiMusicPlayer {...testProps} mode="full" />);
    wrapper.setState({ audioListsPanelVisible: true });
    wrapper.find('.delete-btn').simulate('click');
    expect(onAudioLoadError).not.toHaveBeenCalled();
  });
  it('should call getAudioInstance function', () => {
    const getAudioInstance = jest.fn();
    mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x' }]}
        getAudioInstance={getAudioInstance}
      />
    );
    expect(getAudioInstance).toHaveBeenCalled();
  });
  it('should get audio instance', () => {
    let _instance;
    mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x' }]}
        getAudioInstance={(instance) => (_instance = instance)}
      />
    );
    expect(typeof _instance).toEqual('object');
  });
  it('should auto hide the cover photo if no cover photo is available for pc', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', cover: '' }]}
        mode="full"
        autoHiddenCover
      />
    );
    expect(wrapper.find('.img-content')).toHaveLength(0);
    wrapper.setProps({
      audioLists: [
        { musicSrc: '2', cover: 'xxxx' },
        { musicSrc: '22', cover: 'xxxxx' }
      ]
    });
    setTimeout(() => {
      expect(wrapper.find('.img-content')).toHaveLength(1)
    });
  });
  it('should auto hide the cover photo if no cover photo is available for mobile', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', cover: '' }]}
        mode="full"
        autoHiddenCover
      />
    );
    wrapper.setState({ isMobile: true });
    expect(wrapper.find('.cover')).toHaveLength(0);
    wrapper.setProps({
      audioLists: [
        { musicSrc: '2', cover: 'xxxx' },
        { musicSrc: '22', cover: 'xxxxx' }
      ]
    });
    setTimeout(() => {
      expect(wrapper.find('.cover')).toHaveLength(1)
    });
  });
  it('should transform download audio info before', () => {
    const onBeforeAudioDownload = jest.fn(() => {
      return Promise.resolve({
        src: '123.mpg',
        filename: 'test'
      });
    });
    const onAudioDownload = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', cover: '' }]}
        mode="full"
        onBeforeAudioDownload={onBeforeAudioDownload}
        onAudioDownload={onAudioDownload}
      />
    );
    wrapper.find('.audio-download').simulate('click');
    expect(onBeforeAudioDownload).toHaveBeenCalled();
    expect(onAudioDownload).toHaveBeenCalled();
  });
  it('should trigger onAudioPlay hook when audio track list change', () => {
    const onAudioPlay = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[
          { musicSrc: 'x', cover: '' },
          { musicSrc: 'xx', cover: '' }
        ]}
        mode="full"
        onAudioPlay={onAudioPlay}
      />
    );
    wrapper.find('.next-audio').simulate('click');
    expect(onAudioPlay).toHaveBeenCalled();
  });

  it('should export custom fields in audioLists with audio info', () => {
    let _audioInfo;
    const onAudioPlay = jest.fn((audioInfo) => {
      _audioInfo = audioInfo
    });
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[
          { musicSrc: 'x', name: '1', cover: '11', id: '1', customField: '1' },
          { musicSrc: 'x', name: '2', cover: '22', id: '2', customField: '2' }
        ]}
        mode="full"
        onAudioPlay={onAudioPlay}
      />
    );
    wrapper.find('.next-audio').simulate('click');
    expect(_audioInfo.id).toEqual('1');
    expect(_audioInfo.customField).toEqual('1');
  });
  it('should trigger onAudioListsChange when audioList Change', () => {
    const onThemeChange = jest.fn();
    const onModeChange = jest.fn();
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[
          { musicSrc: 'x', name: '1', cover: '11', id: '1', customField: '1' },
          { musicSrc: 'x', name: '2', cover: '22', id: '2', customField: '2' }
        ]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
        onModeChange={onModeChange}
        onThemeChange={onThemeChange}
      />
    );
    wrapper.setProps({ audioLists: [] });
    expect(onAudioListsChange).toHaveBeenCalled();
    expect(onModeChange).not.toHaveBeenCalled();
    expect(onThemeChange).not.toHaveBeenCalled();
  });
  it('should not trigger onAudioListsChange when audioList is equal', () => {
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', name: '1' }]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
      />
    );
    wrapper.setProps({ audioLists: [{ musicSrc: 'x', name: '1' }] });
    expect(onAudioListsChange).not.toHaveBeenCalled();
    wrapper.setProps({ audioLists: [{ musicSrc: 'x', name: '2' }] });
    expect(onAudioListsChange).toHaveBeenCalled();
  });
  it('should update audioLists', () => {
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', name: '1' }]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
      />
    );
    wrapper.setProps({
      audioLists: [
        { musicSrc: 'xx', name: '11' },
        { musicSrc: 'xxx', name: '111' }
      ]
    });

    expect(wrapper.state().audioLists.map(({ id, ...attr }) => attr)).toEqual([
      { musicSrc: 'x', name: '1' },
      { musicSrc: 'xx', name: '11' },
      { musicSrc: 'xxx', name: '111' }
    ]);
  });
  it('should replace audioLists with clearPriorAudioLists option', () => {
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', name: '1' }]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
      />
    );
    wrapper.setProps({
      clearPriorAudioLists: true,
      audioLists: [
        { musicSrc: 'xx', name: '11' },
        { musicSrc: 'xxx', name: '111' }
      ]
    });

    expect(wrapper.state().audioLists.map(({ id, ...attr }) => attr)).toEqual([
      { musicSrc: 'xx', name: '11' },
      { musicSrc: 'xxx', name: '111' }
    ]);

    expect(onAudioListsChange).toHaveBeenCalled();
  });

  it('should not set playing state when audioLists is change and autoPlayInitLoadPlayList is false', () => {
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', name: '1' }]}
        mode="full"
        autoPlayInitLoadPlayList={false}
      />
    );
    wrapper.setProps({
      audioLists: [
        { musicSrc: 'xx', name: '11' },
        { musicSrc: 'xxx', name: '111' }
      ]
    });

    expect(wrapper.state().playing).toEqual(false);
  });

  it('should trigger onAudioListsChange when clear all audio list', () => {
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[{ musicSrc: 'x', name: '1' }]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
      />
    );
    wrapper.find('.delete-btn').simulate('click');
    expect(onAudioListsChange).toHaveBeenCalled();
  });

  it('should trigger onAudioListsChange when audio list update', () => {
    const onAudioListsChange = jest.fn();
    const wrapper = mount(
      <ReactAmaiMusicPlayer
        audioLists={[
          { musicSrc: 'x', name: '1' },
          { musicSrc: 'xx', name: '2' }
        ]}
        mode="full"
        onAudioListsChange={onAudioListsChange}
      />
    );
    wrapper.setProps({
      audioLists: []
    });
    expect(onAudioListsChange).toHaveBeenCalled();
  });
});
