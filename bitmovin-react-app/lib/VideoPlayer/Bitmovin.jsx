import Logger from './../Logger';
import VideoPlayer from './VideoPlayer';
import { defaultUiConfig } from '../../src/bitmovin/ui/config/defaultUiConfig';
import { UIManager } from 'bitmovin-player-ui';

const log = new Logger();

class BitmovinPlayer extends VideoPlayer {
    constructor(config) {
        super(config);
        
        this.playerConfig = {
            key: '2994c75f-d1d0-46fa-abf0-d1d785f81e3a',
            analytics: {
                key: '5a27f534-b907-4190-8244-9040a45ddfbb',
                title: '',
                videoId: this.videoId,
            },
            playback: {
                autoplay: true,
                muted: false
            },
            ui: true,
            adaptationConfig: {
              //intentionally set low so the first loaded bitrate will be the lowest available
              maxStartupBitrate: 700000,
              startupBitrate: 700000
            }
        }
        
        this.player = new bitmovin.player.Player(this.playerElement, this.playerConfig);
        
        let videoElement = document.getElementById(this.config.playerVideoElementId);
        if (videoElement instanceof HTMLVideoElement) {
          this.player.setVideoElement(videoElement);
        }

        let uiManager = new UIManager(this.player, defaultUiConfig);
        this.setupEventListeners();
        this.setStatus(VideoPlayer.STATUS_INITALIZED);
    }

    play() {
        log.debug('BitmovinPlayer::play()');
    }

    pause() {
        log.debug('BitmovinPlayer::pause()');
    }

    load(title, uri) {
        this.setStatus(VideoPlayer.STATUS_LOADING);
        let qualityLabelingFunction = typeof this.config.qualityLabelingFunction === 'function' ? this.config.qualityLabelingFunction : this.defaultQualityLabeling;
        var source = {
            title: title,
            hls: uri,
            labeling: {
              hls: {
                qualities: qualityLabelingFunction
              }
            }
        }
        this.player.load(source);
        log.debug(`BitmovinPlayer::load()`);
        log.debug(`Title: ${source.title}`);
        log.debug(`URI: ${source.hls}`);
        this.setStatus(VideoPlayer.STATUS_LOADED);
    }

    //Use live stream labeling logic if no custom function is provided.
    defaultQualityLabeling(quality) {
      let kbps = quality.bitrate / 1000;

      if (kbps <= 830) {
        return "270p";
      }
      if (kbps <= 1080) {
        return "480p";
      }
      if (kbps <= 1980) {
        return "720p";
      }
      return '1080p';
    }

    // resize player
    resize(width, height) {

    }

    // hide video, continue playing audio
    hideVideo() {

    }

    // show video
    showVideo() {

    }

    setPosition(position) {

    }

    getPosition() {
        
    }

    getPlayer() {
        return this.player;
    }

    setupEventListeners() {
        log.debug('BitmovinPlayer::setupEventListeners()');
        this.player.on(bitmovin.player.PlayerEvent.Play, (playEvent) => {
            log.debug(`PlayerEvent.Play`);
            this.setStatus(VideoPlayer.STATUS_PLAY);
            this.dispatchEvent(VideoPlayer.EVENT_PLAY, playEvent);
        });

        this.player.on(bitmovin.player.PlayerEvent.Playing, (playingEvent) => {
            
            log.debug(`PlayerEvent.Playing`);
            this.setStatus(VideoPlayer.STATUS_PLAYING);
            const pauseButton = document.getElementById("playback-pause-button");
            if (pauseButton) {
                pauseButton.setAttribute('title', 'Pause');
            }
            this.dispatchEvent(VideoPlayer.EVENT_PLAYING, playingEvent);
            $.oVideoInfo.status = "Playing";
        });

        this.player.on(bitmovin.player.PlayerEvent.Paused, (pausedEvent) => {
            
            log.debug(`PlayerEvent.Paused`);
            this.setStatus(VideoPlayer.STATUS_PAUSED);
            const playButton = document.getElementById("playback-pause-button");
            if (playButton) {
                playButton.setAttribute('title', 'Play');
            }
            this.dispatchEvent(VideoPlayer.EVENT_PAUSED, pausedEvent);
            $.oVideoInfo.status = "Paused";
        });

        this.player.on(bitmovin.player.PlayerEvent.Error, (errorEvent) => {
            log.debug(`PlayerEvent.Error`);
            const errorMessage = document.querySelector('.bmpui-ui-errormessage-label')
            if (errorMessage) {
                errorMessage.style.display = 'none';
                console.log("The downloaded manifest is invalid -- SOURCE_MANIFEST_INVALID");
            } else {
                this.setStatus(VideoPlayer.STATUS_ERROR);
                this.dispatchEvent(VideoPlayer.EVENT_ERROR, errorEvent);
            }   
        });

        this.player.on(bitmovin.player.PlayerEvent.Unmuted, (unmuteEvent) => {
            log.debug(`PlayerEvent.Unmuted`);
                   
            const unmuteButton = document.getElementById("volume-toggle-button");
            if (unmuteButton) {
                unmuteButton.setAttribute('title', 'Mute');
            }
        });

        this.player.on(bitmovin.player.PlayerEvent.Muted, (muteEvent) => {
            log.debug(`PlayerEvent.Muted`);
            
            const MuteButton = document.getElementById("volume-toggle-button");
            if (MuteButton) {
                MuteButton.setAttribute('title', 'Unmute');
            }
        });

        this.player.on(bitmovin.player.PlayerEvent.PlayerResized, (resizedEvent) => {
            log.debug(`PlayerEvent.Resized`);
            const resizedButton = document.getElementById("fullscreen-button");
            if (resizedButton) {
                if (resizedButton.classList.contains('bmpui-off')) {
                  resizedButton.setAttribute('title', 'Full screen');
                } else if (resizedButton.classList.contains('bmpui-on')) {
                  resizedButton.setAttribute('title', 'Exit full screen');
                }
            }
        });

        this.player.on(bitmovin.player.PlayerEvent.Ready, (readyEvent) => {
            const targetElement = document.getElementById('playback-pause-button');
            const refreshButton = document.getElementById('refresh-button');
            if (targetElement && !refreshButton) {
                const replayButton = document.createElement('button');
                replayButton.id = 'refresh-button';
                replayButton.title = 'Refresh';
                replayButton.classList.add('bmpui-ui-replaybutton');
                targetElement.parentNode.insertBefore(replayButton, targetElement.nextSibling);
                const player = this.player;
                replayButton.addEventListener('click', function() {
                    const source = player.getSource();
                    player.unload();
                    player.load(source);
                });
            }

            const allElements = document.querySelectorAll('[class*="bmpui-"]');
            const filteredElements = Array.from(allElements).filter(el =>
                el.className.split(/\s+/).some(cls => cls.startsWith('bmpui-'))
            );
            filteredElements.forEach(element => {
                let testId = element.className.split(/\s+/).find(cls => cls.startsWith('bmpui-'));
                element.setAttribute('data-testid', testId);
            });
            const volumemarkervalStyle = document.querySelector('.bmpui-ui-volumeslider .bmpui-seekbar .bmpui-seekbar-playbackposition-marker');
            const volumeplaybackposStyle = document.querySelector('.bmpui-ui-volumeslider .bmpui-seekbar .bmpui-seekbar-playbackposition');
            const playbackpositionStyle = document.querySelector('.bmpui-seekbar-playbackposition');
            const markerStyle = document.querySelector('.bmpui-seekbar-playbackposition-marker');
            const activeContent = document.querySelector(".ui-state-active");
            if (activeContent) { 
                const color = window.getComputedStyle(activeContent).backgroundColor;
                volumemarkervalStyle.style.backgroundColor = color;
                volumeplaybackposStyle.style.backgroundColor = color;
                playbackpositionStyle.style.backgroundColor = color;
                markerStyle.style.backgroundColor = color;
                markerStyle.style.border='.1875em solid ' + color;
            }
            log.debug(`PlayerEvent.Ready`);
            this.setStatus(VideoPlayer.STATUS_READY);
            const replayButton = document.getElementById("replay-button");
            if (replayButton) { 
                replayButton.setAttribute('title', 'Refresh');
            }
            const UnmuteButton = document.getElementById("volume-toggle-button");
            if (UnmuteButton) {
                UnmuteButton.setAttribute('title', 'Mute');
            }
            const settingsButton = document.getElementById("player-settings-button");
            if (settingsButton) {
                settingsButton.setAttribute('title', 'Settings');
            }
            const volumeButton = document.getElementById("volume-slider");
            if (volumeButton) {
                volumeButton.setAttribute('title', 'Volume');
            }
            const resizeButton = document.getElementById("fullscreen-button");
            if (resizeButton) {
                resizeButton.setAttribute('title', 'Full screen');
            }
            this.dispatchEvent(VideoPlayer.EVENT_READY, readyEvent);
        });

        this.player.on(bitmovin.player.PlayerEvent.PlaybackFinished, (playbackFinishedEvent) => {
            log.debug(`PlayerEvent.PlaybackFinished`);
            this.setStatus(VideoPlayer.STATUS_FINISHED);
            this.dispatchEvent(VideoPlayer.EVENT_FINISHED, playbackFinishedEvent);
            if (typeof window.closeme === 'function') {
                window.closeme();
                console.log('PlaybackFinished - Current Stream has ended.');
            } else {
                console.log('closeme not a function.');
            }
        });

        this.player.on(bitmovin.player.PlayerEvent.TimeChanged, (timeChanged) => {
            //log.debug(`PlayerEvent.TimeChanged ${timeChanged}`);
            $.oVideoInfo.currentPosition = timeChanged.time;
            if (!window.playerOptions.isODStudio && this.player.getDuration() > 1 && (this.player.currentTime() >= (this.player.getDuration() - 0.3))) {
                //$(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_stopped);
                if (window.closeme === "function") {
                        window.closeme();
                    }
            }

        });

        const isSeekBarDisplayedListener = (event) => {
            if (event.type === bitmovin.player.PlayerEvent.StreamSwitched) {
                this.isSeekBarDisplayed = true;
                this.player.seekbar.show();
            } else if (event.type === bitmovin.player.PlayerEvent.Reconnected) {
                this.isSeekBarDisplayed = true;
                this.player.seekbar.show();
            } else if (event.type === bitmovin.player.PlayerEvent.Disconnected) {
                this.isSeekBarDisplayed = false;
                this.player.seekbar.hide();
            }
        };

        this.player.on(bitmovin.player.PlayerEvent.StreamSwitched, isSeekBarDisplayedListener);
        this.player.on(bitmovin.player.PlayerEvent.Reconnected, isSeekBarDisplayedListener);
        this.player.on(bitmovin.player.PlayerEvent.Disconnected, isSeekBarDisplayedListener);
    }

    showControls() {
        const controlBar = document.getElementById("control-bar-container");
        if (controlBar) {
            controlBar.classList.remove('hideViewerElements');
        }
    }

    hideControls() {
        const controlBar = document.getElementById("control-bar-container");
        if (controlBar) {
            controlBar.classList.add('hideViewerElements');
        }
    }

    showSeekBar() {
        const seekBar = document.getElementById("seek-bar-component");
        if (seekBar) {
            seekBar.classList.remove('hideViewerElements');
        }
    }

    hideSeekBar() {
        const seekBar = document.getElementById("seek-bar-component");
        if (seekBar) {
            seekBar.classList.add('hideViewerElements');
        }
    }

    hidePlaybackSpeed() {
        const videoSpeedSelect = document.getElementById("video-speed-selectbox");
        if (videoSpeedSelect) {
            videoSpeedSelect.classList.add('hideViewerElements');
        }
    }

    showTime() {
        const playbackTime = document.getElementById("playback-time-label");
        if (playbackTime) {
            playbackTime.classList.remove('hideViewerElements');
        }
    }

    hideTime() {
        const playbackTime = document.getElementById("playback-time-label");
        if (playbackTime) {
            playbackTime.classList.add('hideViewerElements');
        }
    }

    hidePlaybackToggleButton() {
        const playPauseButton = document.getElementById("playback-pause-button");
        if (playPauseButton) {
            playPauseButton.classList.add('hideViewerElements');
        }
        const playbackToggle = document.getElementById("playback-toggle-button");
        if (playbackToggle) {
            playbackToggle.classList.add('hideViewerElements');
        }
    }
    hideFullscreenToggleButton() {
        const fullscreenButton = document.getElementById("fullscreen-button");
        if (fullscreenButton) {
            fullscreenButton.classList.add('hideViewerElements');
        }
    }
    showFullscreenToggleButton() {
        const fullscreenButton = document.getElementById("fullscreen-button");
        if (fullscreenButton) {
            fullscreenButton.classList.remove('hideViewerElements');
        }
    }

    makeAudio() {
      const fullscreenButton = document.getElementById("fullscreen-button");
      if (fullscreenButton) {
        fullscreenButton.style.display = "none";
      }
  
      const playerSettingsBtn = document.getElementById("player-settings-button");
      if (playerSettingsBtn) {
        playerSettingsBtn.style.visibility = "hidden";
      }
    }
  
    makeVideo() {
      const fullscreenButton = document.getElementById("fullscreen-button");
      if (fullscreenButton) {
        fullscreenButton.style.display = "block";
      }
  
      const playerSettingsBtn = document.getElementById("player-settings-button");
      if (playerSettingsBtn) {
        playerSettingsBtn.style.visibility = "visible";
      }
    }
}

export default BitmovinPlayer;
