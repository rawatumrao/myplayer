import { UIContainer, Button, ToggleButton, PlaybackToggleOverlay, ControlBar, Container, BufferingOverlay, PlaybackTimeLabel, PlaybackTimeLabelMode, SeekBar, SeekBarLabel, VolumeToggleButton, VolumeSlider, Spacer, FullscreenToggleButton, SubtitleOverlay, PlaybackToggleButton, ReplayButton, Label, PlaybackSpeedSelectBox, SettingsToggleButton, SettingsPanel, VideoQualitySelectBox, SettingsPanelItem, SettingsPanelPage, AudioQualitySelectBox, CastStatusOverlay, RecommendationOverlay, ErrorMessageOverlay, SubtitleSelectBox, i18n } from 'bitmovin-player-ui';

const playbackSpeedSelectBox = new PlaybackSpeedSelectBox(
    {
        id: 'speed-select-box',
        cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'ui-playbackspeedselectbox'],
    });
const customSeekBarLabel = new SeekBarLabel(
    {
        id: 'playback-time-seekbarlabel',
        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
    });
const subtitleOverlay = new SubtitleOverlay(
    {
        id: 'subtitle-select-overlay',
        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
    });

playbackSpeedSelectBox.clearItems();

export const settingsPanel = new SettingsPanel({
    components: [
        new SettingsPanelPage({
            components: [
                new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox({ getLabel: getQualityLabels }),
                    {
                        id: 'video-quality-selectbox',
                        cssClass: 'video-quality-selectbox',
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }, { cssClass: 'the-item-class' }),
                new SettingsPanelItem(i18n.getLocalizer('speed'), playbackSpeedSelectBox,
                    {
                        id: 'video-speed-selectbox',
                        //cssClass: 'video-speed-selectbox', 
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }),
                new SettingsPanelItem(i18n.getLocalizer('settings.subtitles'), new SubtitleSelectBox,
                    {
                        id: 'video-subtitle-selectbox',
                        //cssClass: 'video-speed-selectbox', 
                        cssClasses: ['bmpui-ui-selectbox', 'globalmeet-custom-class'],
                    }),
                new SettingsPanelItem(null,
                        new Label({
                            id: 'toggleAudioButton',
                            text: 'Switch to Audio Stream',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'status-label']
                    }),
                    {
                        id: 'toggleAudio',
                        hidden: true,
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }),

                // new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox(),
                //     {
                //         id: 'audio-quality-selectbox',
                //         cssClass: 'audio-quality-selectbox',
                //         cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                //     }),
            ],
            id: 'settings-panel-page',
            cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
        })
    ],
    hidden: true,

    id: 'settings-panel',
    cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],

});

//settingsPanel.getDomElement().css({ width: '1300px', height: '1300px' });


export const defaultUiConfig = new UIContainer({
    components: [
        subtitleOverlay,
        new BufferingOverlay(),
        //new CastStatusOverlay(),
        new PlaybackToggleOverlay({
            id: 'playback-toggle-button',
            cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
        }),
        // Add live regions for accessibility announcements
        new Label({
            id: 'player-status-live',
            text: '',
            cssClasses: ['sr-only', 'live-region'],
            hidden: false,
            role: 'status',
            ariaLive: 'polite'
        }),
        new Label({
            id: 'player-volume-live', 
            text: '',
            cssClasses: ['sr-only', 'live-region'],
            hidden: false,
            role: 'status',
            ariaLive: 'polite'
        }),
        new ControlBar({
            components: [
                settingsPanel,
                new Container({
                    components: [
                        new PlaybackTimeLabel({
                            id: 'playback-curr-time-label',
                            timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
                            hideInLivePlayback: true
                        }),
                        new SeekBar({
                            id: 'seek-bar-component',
                            label: customSeekBarLabel
                        }),
                        new PlaybackTimeLabel({
                            id: 'playback-total-time-label',
                            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
                            cssClasses: ['text-right']
                        }),
                    ],
                    id: 'seek-bar-container',
                    cssClasses: ['controlbar-top']
                }),
                new Container({
                    components: [
                        new PlaybackToggleButton({
                            id: 'playback-pause-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                        }),
                        /*new ReplayButton({
                            id: 'replay-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                        }),*/
                        new VolumeToggleButton({
                            id: 'volume-toggle-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
                            ariaLabel: i18n.getLocalizer('settings.audio.mute'),
                            onAriaLabel: i18n.getLocalizer('settings.audio.unmute')
                        }),
                        new VolumeSlider({
                            id: 'volume-slider',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
                            ariaLabel: i18n.getLocalizer('settings.audio.volume')
                        }),
                        new Spacer(),
                        new Label({
                            id: 'player-status-label',
                            text: '',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'status-label']
                        }),
                        new Spacer(),
                        /*new PlaybackSpeedSelectBox({
                            id: 'speed-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                        }),*/
                        new SettingsToggleButton({
                            settingsPanel: settingsPanel,
                            id: 'player-settings-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
                            ariaLabel: i18n.getLocalizer('settings'),
                            onAriaLabel: i18n.getLocalizer('settings'),
                            text: i18n.getLocalizer('settings'),
                        }),
                        new FullscreenToggleButton({
                            id: 'fullscreen-button',
                            cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
                            ariaLabel: i18n.getLocalizer('fullscreen'),
                            text: i18n.getLocalizer('fullscreen'),
                            onAriaLabel: i18n.getLocalizer('fullscreen'),
                            offAriaLable: i18n.getLocalizer('fullscreen'),
                        })
                    ],
                    id: 'control-bar-container',
                    cssClasses: ['controlbar-bottom']
                })
            ],
            id: 'ui-container-controlbar',
            cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
        }),
        new ErrorMessageOverlay(),
    ],
    id: 'ui-uicontainer-container',
    cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'ui-skin-modern']
});

var getQualityLabels = function (data) {
    if (data.height <= 1440) {
        return '1440p HD';
    } else if (data.height <= 2160) {
        return '2160p 4K';
    }
}