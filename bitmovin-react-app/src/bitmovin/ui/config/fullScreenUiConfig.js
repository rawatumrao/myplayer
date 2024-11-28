import {
    UIContainer, PlaybackToggleOverlay, TitleBar, PlaybackToggleButton, FullscreenToggleButton, ControlBar, Container,
    BufferingOverlay, VolumeToggleButton, VolumeSlider, SeekBar, PlaybackTimeLabel, Spacer, SubtitleOverlay, SubtitleSelectBox
} from 'bitmovin-player-ui';


export const fullScreenUiConfig = new UIContainer({
    components: [
        new TitleBar(),
        new SubtitleOverlay(),
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        new ControlBar({
            components: [
                new Container({
                    components: [
                        new PlaybackTimeLabel(),
                        new SeekBar()
                    ]
                }),
                new Container({
                    components: [
                        new PlaybackToggleButton(),
                        //new VolumeToggleButton(),
                        //new VolumeSlider(),
                        new Spacer(),
                        new SubtitleSelectBox({
                            cssClasses: ['bmpui-ui-selectbox']
                        }),
                        new FullscreenToggleButton()
                    ],
                    cssClasses: ['controlbar-bottom']
                })
            ]
        })
    ],
    cssClasses: ['ui-skin-modern']
});