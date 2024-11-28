import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Player, PlayerEvent } from 'bitmovin-player';
import { UIManager } from 'bitmovin-player-ui';
import { defaultUiConfig, fullScreenUiConfig } from '../ui/config';
import { BitmovinLayout } from '../layouts/BitmovinLayout';
import { testTagger } from '../utils/testTagger';

export const BitmovinPlayerPage = ({ configs }) => {
    const { key, title, hls, progressive, poster } = configs;
    const ui = false;
    const [statusLabel, setStatusLabel] = useState("");

    const getQualityLabels = (data) => {
        if (data.height <= 320) {
            return '320p';
        } else if (data.height <= 480) {
            return '480p';
        } else if (data.height <= 720) {
            return '720p';
        } else if (data.height <= 1080) {
            return '1080p';
        } else if (data.height <= 1440) {
            return '1440p HD';
        } else if (data.height <= 2160) {
            return '2160p 4K';
        }
    }

    const config = {
        key: key,
        style: {
            width: 1080
        },
        playback: {
            autoplay: false,
            muted: false,
        },
        ui
    };

    const source = {
        title: title,
        progressive: progressive,
        hls: hls,
        poster: poster,
        labeling: {
            dash: {
                qualities: getQualityLabels
            },
            hls: {
                qualities: getQualityLabels
            }
        }
    };

    useEffect(() => {
        const player = new Player(document.getElementById('player-container'), config);


        const playerUiManager = new UIManager(player, [
            /*{
                ui: fullScreenUiConfig,
                condition: (context) => context.isFullscreen,
            },*/
            {
                ui: defaultUiConfig,
            }
        ]);

        testTagger();

        player.on(PlayerEvent.Playing, () => {
            setStatusLabel("Playing");
        });

        player.on(PlayerEvent.Paused, () => {
            setStatusLabel("Paused");
        });



        player.load(source).then(() => {


        }).catch((error) => {
            console.error('Player load failed', error);
        });

        return () => {
            player.unload();
            playerUiManager.release();
        };
    }, []);


    const updateStatusLabel = (text) => {
        const labelElement = document.getElementById('player-status-label');
        if (labelElement) {
            labelElement.innerText = text;
        }
    };


    useEffect(() => {
        updateStatusLabel(statusLabel);
    }, [statusLabel]);

    return (
        <BitmovinLayout title={"Player from React side"}>
            <div id="player-container"></div>
        </BitmovinLayout>
    );
};

BitmovinPlayerPage.propTypes = {
    configs: PropTypes.object.isRequired
};
