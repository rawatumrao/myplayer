import Logger from './../Logger';
import VideoPlayerEvents from './VideoPlayerEvents';
import { defaultUiConfig } from '../../src/bitmovin/ui/config/defaultUiConfig';
import { UIManager } from 'bitmovin-player-ui';

const log = new Logger();

class VideoPlayer {
    // Existing static status definitions...
    
    constructor(config) {
        this.events = VideoPlayerEvents;
        this.config = config;
        this.playerElement = document.getElementById(config.playerElementId);
        this.videoId = config.eventId;
        this.player = null;
        this.state = { status: VideoPlayer.STATUS_NONE };
        this.isSeekbarDisplayed = true;

        this.playerConfig = {
            key: '2994c75f-d1d0-46fa-abf0-d1d785f81e3a',
            analytics: {
                key: '5a27f534-b907-4190-8244-9040a45ddfbb',
                title: '',
                videoId: this.videoId,
            },
            playback: { autoplay: true, muted: false },
            ui: {},
            adaptationConfig: {
                maxStartupBitrate: 700000,
                startupBitrate: 700000
            }
        };
        
        this.player = new bitmovin.player.Player(this.playerElement, this.playerConfig);
        
        let videoElement = document.getElementById(this.config.playerVideoElementId);
        if (videoElement instanceof HTMLVideoElement) {
            this.player.setVideoElement(videoElement);
        }
        
        let uiManager = new UIManager(this.player, defaultUiConfig);
        this.setupEventListeners();
        this.setStatus(VideoPlayer.STATUS_INITALIZED);
        this.initializeRefreshButton();
    }

    initializeRefreshButton() {
        const targetElement = document.getElementById('playback-pause-button');
        const refreshButton = document.getElementById('refresh-button');
        
        if (targetElement && !refreshButton) {
            const replayButton = document.createElement('button');
            replayButton.id = 'refresh-button';
            replayButton.title = 'Refresh';
            replayButton.classList.add('bmpui-ui-replaybutton');
            targetElement.parentNode.insertBefore(replayButton, targetElement.nextSibling);
            
            replayButton.addEventListener('click', () => {
                this.refreshPlayer().then(() => {
                    log.debug("Player refreshed successfully.");
                }).catch(error => {
                    log.error("Error refreshing player:", error);
                });
            });
        }
    }

    refreshPlayer() {
        return new Promise((resolve, reject) => {
            try {
                const source = this.player.getSource();
                this.player.unload();
                this.player.load(source);

                this.player.on(bitmovin.player.PlayerEvent.Ready, (readyEvent) => {
                    this.handlePlayerReady(readyEvent);
                    resolve(); // Resolve promise when player is fully ready
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    handlePlayerReady(readyEvent) {
        log.debug(`BitmovinPlayer::Ready - Seekbar: ${this.isSeekbarDisplayed}`);
        this.toggleSeekBar(this.isSeekbarDisplayed);
        
        this.setStatus(VideoPlayer.STATUS_READY);
        this.dispatchEvent(VideoPlayerEvents.EVENT_READY, readyEvent);
    }

    // Existing functions and event listeners remain unchanged...
    
}

export default VideoPlayer;
