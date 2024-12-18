import { UIContainer, PlaybackToggleOverlay, ControlBar, Container, BufferingOverlay, PlaybackTimeLabel, SeekBar, VolumeToggleButton, VolumeSlider, Spacer, FullscreenToggleButton, SubtitleOverlay, PlaybackToggleButton, ReplayButton, Label, PlaybackSpeedSelectBox, SettingsToggleButton, SettingsPanel, PictureInPictureToggleButton, VideoQualitySelectBox, SettingsPanelItem, SettingsPanelPage, AudioQualitySelectBox, CastToggleButton, AirPlayToggleButton, CastStatusOverlay, RecommendationOverlay, ErrorMessageOverlay } from 'bitmovin-player-ui';

const playbackSpeedSelectBox = new PlaybackSpeedSelectBox(
    {
        id: 'speed-select-box',
        cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'ui-playbackspeedselectbox'],
    });

playbackSpeedSelectBox.clearItems();

export const settingsPanel = new SettingsPanel({
    components: [
        new SettingsPanelPage({
            components: [
                new SettingsPanelItem('Video Quality', new VideoQualitySelectBox(),
                    {
                        id: 'video-quality-selectbox',
                        cssClass: 'video-quality-selectbox',
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }, { cssClass: 'the-item-class' }),
                new SettingsPanelItem('Speed', playbackSpeedSelectBox,
                    {
                        id: 'video-speed-selectbox',
                        //cssClass: 'video-speed-selectbox', 
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }),
                new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox(),
                    {
                        id: 'audio-quality-selectbox',
                        cssClass: 'audio-quality-selectbox',
                        cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                    }),
            ],
            //cssClasses: ['settings-panel-page-extended']
        })
    ],
    hidden: true,
});

//settingsPanel.getDomElement().css({ width: '1300px', height: '1300px' });

export const defaultUiConfig = (themeSettings) => {
    return new UIContainer({
        components: [
            new SubtitleOverlay(),
            new BufferingOverlay(),
            new CastStatusOverlay(),
            new PlaybackToggleOverlay({
                id: 'playback-toggle-button',
                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
            }),
            new ControlBar({
                components: [
                    settingsPanel,
                    new Container({
                        components: [
                            new PlaybackTimeLabel(),
                            new SeekBar({
                                cssClasses: ['seekbar'],  // Apply dynamic styles for SeekBar
                                style: {
                                    backgroundColor: themeSettings.seekbarColor,  // Dynamic seekbar background color
                                    progressColor: themeSettings.seekbarPlayedColor  // Dynamic progress color
                                }
                            })
                        ]
                    }),
                    new Container({
                        components: [
                            new PlaybackToggleButton({
                                id: 'playback-pause-button',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                            }),
                            new ReplayButton({
                                id: 'replay-button',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                            }),
                            new VolumeToggleButton({
                                id: 'volume-toggle-button',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                            }),
                            new VolumeSlider({
                                id: 'volume-slider',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class'],
                                style: {
                                    backgroundColor: themeSettings.volumeBarColor  // Apply dynamic volume bar color
                                }
                            }),
                            new Spacer(),
                            new Label({
                                id: 'player-status-label',
                                text: '',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class', 'status-label']
                            }),
                            new Spacer(),
                            new PictureInPictureToggleButton(),
                            new AirPlayToggleButton(),
                            new CastToggleButton(),
                            new SettingsToggleButton({
                                settingsPanel: settingsPanel,
                                id: 'player-settings-button',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                            }),
                            new FullscreenToggleButton({
                                id: 'fullscreen-button',
                                cssClasses: ['tagging-test-class', 'globalmeet-custom-class']
                            })
                        ],
                        cssClasses: ['controlbar-bottom']
                    })
                ]
            }),
            new RecommendationOverlay(),
            new ErrorMessageOverlay(),
        ],
        cssClasses: ['ui-skin-modern']
    });
};

