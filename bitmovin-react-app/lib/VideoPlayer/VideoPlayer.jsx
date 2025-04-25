import { Player, PlayerEvent } from 'bitmovin-player';
import { I18n, i18n, UIManager } from 'bitmovin-player-ui';
import { defaultUiConfig } from '../../src/bitmovin/ui/config/defaultUiConfig';
import VideoPlayerEvents from './VideoPlayerEvents';
import Logger from './../Logger';

const logger = new Logger();

class VideoPlayer {
    static STATUS_NONE = null;                  // Inital state when loaded
    static STATUS_ERROR = 'error';              // error state
    static STATUS_INITALIZED = 'initalized';    // player initalized
    static STATUS_LOADING = 'loading';          // video loading
    static STATUS_LOADED = 'loaded';            // video loaded
    static STATUS_READY = 'ready';              // player has enough data to start playback
    static STATUS_PLAY = 'play';                // play button hit
    static STATUS_PLAYING = 'playing';          // video playing 
    static STATUS_PAUSED = 'paused';            // video paused by user
    static STATUS_STOPPED = 'stopped';          // video stopped by user
    static STATUS_FINISHED = 'finished';        // video finished playing

    constructor(config) {
      this.events = VideoPlayerEvents;
      this.config = config;
      this.playerElement = document.getElementById(config.playerElementId);
      this.videoId = config.eventId;
      this.player = null;
      this.state = {
        status: this.STATUS_NONE
      };
      this.volume = config.volume;
      this.muted = config.muted;

      // The position where the stream should be started.
      this.startOffset = config.startOffset === undefined ? 0 : config.startOffset;

      if (typeof config.refreshFunction === 'function') {
        this.refreshFunction = config.refreshFunction;
      }

      this.isSeekbarDisplayed = true; // Default: Seekbar is shown
      var localizationConfig = {
        language: 'gm',
        vocabularies: {
          gm:this.config.playerControls
        }
      };
      
      this.playerConfig = {
        key: '2994c75f-d1d0-46fa-abf0-d1d785f81e3a',
        analytics: {
          key: '5a27f534-b907-4190-8244-9040a45ddfbb',
          title: '',
          videoId: this.videoId,
        },
        playback: {
          autoplay: true,
          muted: this.muted,
          volume: this.volume,
        },
        logs: {
          level: config.logLevel
        },
        ui: false,
        i18n: i18n.setConfig(localizationConfig),
        adaptation: {
          //intentionally set low so the first loaded bitrate will be the lowest available
          startupBitrate: 1000
        },
      }
      this.player = new Player(this.playerElement, this.playerConfig);
      
      let videoElement = document.getElementById(this.config.playerVideoElementId);
      if (videoElement instanceof HTMLVideoElement) {
        this.player.setVideoElement(videoElement);
      }

      let uiManager = new UIManager(this.player, defaultUiConfig);
      this.setupEventListeners();
      this.setStatus(VideoPlayer.STATUS_INITALIZED);
    }

    createEvent(event, data) {
        return new CustomEvent(event, {detail: data});
    }

    dispatchEvent(event, data) {
        var customEvent = this.createEvent(event, data);
        document.dispatchEvent(customEvent);
    }

    play() {
      document.getElementById('playback-toggle-button').style.display = 'block';
      document.getElementById('playback-pause-button').style.display = 'block';
      
      if (this.player.isPlaying()) {
        document.getElementById('playback-toggle-button').style.display = 'none';
        return;
      } else if (!this.isStreamLoaded()) {
        setTimeout(() => this.play(), 100);
      } else {
        this.player.play();
      }
    }
  
    pause() {
      if (this.player.isPlaying()) {
        this.player.pause();
      }
    }
  
    load(uri, title) {
      this.setStatus(VideoPlayer.STATUS_LOADING);

      let qualityLabelingFunction = typeof this.config.qualityLabelingFunction === 'function' ? this.config.qualityLabelingFunction : this.defaultQualityLabeling;
      let source = {
        title: (title === undefined) ? this.config.title : title,
        hls: uri,
        labeling: {
          hls: {
            qualities: qualityLabelingFunction
          }
        }
      }

      if (!this.isStreamLoaded()) {
        // Add startOffset to source config
        source.options = {startOffset: this.startOffset};
      }
      logger.info("VideoPlayer.load: isStreamLoaded=" + this.isStreamLoaded() + " sourceConfig=" + JSON.stringify(source));

      this.player.load(source).then((res) => this.setStatus(VideoPlayer.STATUS_LOADED)).catch((error) => this.playerLoadErrorHandler(error));

      this.source = source.hls;
      logger.debug(`BitmovinPlayer::load()`);
      logger.debug(`Title: ${source.title}`);
      logger.debug(`URI: ${source.hls}`);
    }

    playerLoadErrorHandler(error) {
      logger.warn("playerLoadErrorHandler; code=" + error.code + " name=" + error.name + " message=" + error.message 
                    + " data=" + JSON.stringify(error.data));

      this.dispatchEvent(VideoPlayerEvents.EVENT_SOURCE_LOAD_ERROR, error);
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

    getVideoPlayerEvents() {
      return this.events;
    }

    getState() {
        return this.state;
    }

    getStatus() { 
        return this.state.status;
    }
    
    setStatus(status) {
        this.state.status = status;
    }

    getSource() {
      return this.source;
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
      this.player.seek(position);
    }

    getPosition() {
        
    }

    toggleSeekBar(display){
        if(display){
            this.showSeekBar();
        } else {
            this.hideSeekBar();
        }
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
            this.isSeekbarDisplayed = true; //Update state
        }
    }

    hideSeekBar() {
        const seekBar = document.getElementById("seek-bar-component");
        if (seekBar) {
            seekBar.classList.add('hideViewerElements');
            this.isSeekbarDisplayed = false; //Update state
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

    hideAudioBackupToggleButton() {
      const audioToggleButton = document.getElementById("toggleAudio");
      if (audioToggleButton) {
        audioToggleButton.classList.add('hideViewerElements');
        //audioBackupToggleButton.classList.add("ui-helper-hidden");
      }
  }

    showAudioBackupToggleButton() {
      const audioToggleButton = document.getElementById("toggleAudio");
      if (audioToggleButton) {
        audioToggleButton.classList.remove('hideViewerElements');
        //audioBackupToggleButton.classList.remove("ui-helper-hidden");
      }
    }

    makeUserAudioBackup() {
      // userAudioBackup is a LiveStudio setting for encoder events that allows
      // viewers to switch to a backup audio stream.

      logger.debug("makeUserAudioBackup");

      /*
      const audioBackupToggleButton = document.getElementById("toggleAudio");
      if (audioBackupToggleButton) {
        audioBackupToggleButton.querySelector('span').innerText = "Switch to Video Stream";
      }
      */

      //audioBackupToggleButton.classList.remove("ui-helper-hidden");

      const fullscreenButton = document.getElementById("fullscreen-button");
      if (fullscreenButton) {
        fullscreenButton.style.display = "none";
      }

      // make the control bar visible so that user can switch back to video
      const controlBar = document.getElementById("ui-container-controlbar");
      if (controlBar) {
        controlBar.style.display = "block";
      }

      //this.showControls();
      this.hidePlaybackSpeed();
      this.hideQualitySelectDropdown();
    }

    makeUserAudioBackupLoadError() {
      // userAudioBackup is a LiveStudio setting for encoder events that allows
      // viewers to switch to a backup audio stream.

      logger.debug("makeUserAudioBackupLoadError");

      const fullscreenButton = document.getElementById("fullscreen-button");
      if (fullscreenButton) {
        fullscreenButton.style.display = "none";
      }

      // hide the bitmovin tv noise canvas displayed when a load stream fails
      const bmpuiId43 = document.getElementById("bmpui-id-43");
      if (bmpuiId43) {
        bmpuiId43.style.display = "none";
      }

      // make the control bar visible so that user can switch back to video
      const controlBar = document.getElementById("ui-container-controlbar");
      if (controlBar) {
        controlBar.style.display = "block";
      }

      //this.showControls();
      this.hidePlaybackSpeed();
      this.hideQualitySelectDropdown();
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

    isStreamLoaded() {
      return this.player.getSource() != null;
    }

    isPlaying() {
      return this.player.isPlaying();
    }

    isPaused() {
      return this.player.isPaused();
    }

    getDuration() {
      return this.player.getDuration();
    }

    showQualitySelectDropdown() {
      const videoQualitySelect = document.getElementById("video-quality-selectbox");
      if (videoQualitySelect) {
        videoQualitySelect.classList.remove('hideViewerElements');
      }
    }

    hideQualitySelectDropdown() {
      const videoQualitySelect = document.getElementById("video-quality-selectbox");
      if (videoQualitySelect) {
        videoQualitySelect.classList.add('hideViewerElements');
      }
    }

    setupEventListeners() {
        logger.debug('BitmovinPlayer::setupEventListeners()');     

        this.player.on(PlayerEvent.Play, (playEvent) => {
            logger.debug(`PlayerEvent.Play`);
            this.setStatus(VideoPlayer.STATUS_PLAY);
            this.dispatchEvent(VideoPlayerEvents.EVENT_PLAY, playEvent);
        });

        this.player.on(PlayerEvent.Playing, (playingEvent) => {
            
            logger.debug(`PlayerEvent.Playing`);
            this.setStatus(VideoPlayer.STATUS_PLAYING);
            const pauseButton = document.getElementById("playback-pause-button");
            if (pauseButton) {
                pauseButton.setAttribute('title', this.config.playerControls.pause);
            }
            this.dispatchEvent(VideoPlayerEvents.EVENT_PLAYING, playingEvent);
        });

        this.player.on(PlayerEvent.Paused, (pausedEvent) => {
            
            logger.debug(`PlayerEvent.Paused`);
            this.setStatus(VideoPlayer.STATUS_PAUSED);
            const playButton = document.getElementById("playback-pause-button");
            if (playButton) {
                playButton.setAttribute('title', this.config.playerControls.play);
            }
            this.dispatchEvent(VideoPlayerEvents.EVENT_PAUSED, pausedEvent);
        });

        this.player.on(PlayerEvent.Error, (errorEvent) => {
            logger.debug(`PlayerEvent.Error`);
            const errorMessage = document.querySelector('.bmpui-ui-errormessage-label')
            if (errorMessage) {
                errorMessage.style.display = 'none';
                logger.warn("The downloaded manifest is invalid -- SOURCE_MANIFEST_INVALID");
            } else {
                this.setStatus(VideoPlayer.STATUS_ERROR);
                this.dispatchEvent(VideoPlayerEvents.EVENT_ERROR, errorEvent);
            }   
        });

        this.player.on(PlayerEvent.Unmuted, (unmuteEvent) => {
            logger.debug(`PlayerEvent.Unmuted`);
                   
            const unmuteButton = document.getElementById("volume-toggle-button");
            if (unmuteButton) {
                unmuteButton.setAttribute('title', this.config.playerControls['settings.audio.mute']);
            }
        });

        this.player.on(PlayerEvent.Muted, (muteEvent) => {
            logger.debug(`PlayerEvent.Muted`);
            
            const MuteButton = document.getElementById("volume-toggle-button");
            if (MuteButton) {
                MuteButton.setAttribute('title', this.config.playerControls['settings.audio.unmute']);
            }
        });

        this.player.on(PlayerEvent.PlayerResized, (resizedEvent) => {
            logger.debug(`PlayerEvent.Resized`);
            const resizedButton = document.getElementById("fullscreen-button");
            if (resizedButton) {
                if (resizedButton.classList.contains('bmpui-off')) {
                  resizedButton.setAttribute('title', this.config.playerControls.fullscreen);
                } else if (resizedButton.classList.contains('bmpui-on')) {
                  resizedButton.setAttribute('title', this.config.playerControls.exitfullscreen);
                }
            }
        });

        this.player.on(PlayerEvent.Ready, (readyEvent) => {

            //maintain seekbar visibility when player is ready
            logger.debug(`BitmovinPlayer::Ready - Seekbar: ${this.isSeekbarDisplayed}`);
            this.toggleSeekBar(this.isSeekbarDisplayed);
            
            const PlayPauseButton = document.getElementById('playback-pause-button');
            
            if (PlayPauseButton) {
                if (PlayPauseButton.classList.contains('bmpui-off')) {
                  PlayPauseButton.setAttribute('title', this.config.playerControls.play);
                } else if (PlayPauseButton.classList.contains('bmpui-on')) {
                  PlayPauseButton.setAttribute('title', this.config.playerControls.pause);
                }
            }

            const targetElement = document.getElementById('playback-pause-button');
            const refreshButton = document.getElementById("refresh-button");
            if (refreshButton) {
                refreshButton.setAttribute('title', this.config.playerControls.replay);
             }
            const UnmuteButton = document.getElementById("volume-toggle-button");
            if (UnmuteButton) {
                if (this.config.muted) {
                  UnmuteButton.setAttribute('title', this.config.playerControls['settings.audio.unmute']);
                } else {
                  UnmuteButton.setAttribute('title', this.config.playerControls['settings.audio.mute']);
                }
            }
            const settingsButton = document.getElementById("player-settings-button");
            if (settingsButton) {
                settingsButton.setAttribute('title', this.config.playerControls.settings);
            }
            const volumeButton = document.getElementById("volume-slider");
            if (volumeButton) {
                volumeButton.setAttribute('title', this.config.playerControls['settings.audio.volume']);
            }
            const resizeButton = document.getElementById("fullscreen-button");
            if (resizeButton) {
                resizeButton.setAttribute('title', this.config.playerControls.fullscreen);
            }
            
            if (targetElement && !refreshButton) {
                const replayButton = document.createElement('button');
                replayButton.id = 'refresh-button';
                replayButton.title = this.config.playerControls.replay;
                replayButton.classList.add('bmpui-ui-replaybutton');
                targetElement.parentNode.insertBefore(replayButton, targetElement.nextSibling);
                const player = this.player;
                replayButton.addEventListener('click', () => {
                  if (typeof this.refreshFunction === 'function') {
                    this.refreshFunction(this.getSource());
                  } else {
                    this.player.load(this.player.getSource());
                  }
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
            logger.debug(`PlayerEvent.Ready`);
            this.setStatus(VideoPlayer.STATUS_READY);
            
            // hide full screen button on Mac OS and ios
            // if (this.config.isPreSimLive || this.config.mode == "prelive" || this.config.mode == "live") {
              if(this.config.OS_PLATFORM === 'iOS'){
                 document.getElementById("fullscreen-button").style.display = 'none';
              }
            // }

            this.dispatchEvent(VideoPlayerEvents.EVENT_READY, readyEvent);
            const waitForSubtitle = setInterval(() => {
              const subtitleOverlay = document.querySelector('.bmpui-ui-subtitle-overlay');
              if(subtitleOverlay){
                clearInterval(waitForSubtitle);
                const observer = new MutationObserver(mutations => {
                   mutations.forEach(mutation => {
                      mutation.addedNodes.forEach(node => {
                        if(node.nodeType === 1 && node.classList.contains('bmpui-ui-subtitle-label')){
                          node.style.removeProperty('left');
                          node.style.removeProperty('width');
                        }
                        if(node.querySelectorAll){
                          const innerLabels= node.querySelectorAll('.bmpui-ui-subtitle-label');
                          innerLabels.forEach(label => {
                                label.style.removeProperty('left');
                                label.style.removeProperty('width');
                            });
                        }
                       });
                    });
                  });
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
              }
            },100);
        });

        this.player.on(PlayerEvent.PlaybackFinished, (playbackFinishedEvent) => {
            logger.debug(`PlayerEvent.PlaybackFinished`);
            this.setStatus(VideoPlayer.STATUS_FINISHED);
            this.dispatchEvent(VideoPlayerEvents.EVENT_FINISHED, playbackFinishedEvent);
            if (typeof window.closeme === 'function') {
                window.closeme();
                console.log('PlaybackFinished - Current Stream has ended.');
            } else {
                console.log('closeme not a function.');
            }
        });

        this.player.on(PlayerEvent.TimeChanged, (timeChanged) => {
            this.dispatchEvent(VideoPlayerEvents.EVENT_TIMECHANGED, timeChanged);
        });

        // Maintain  seekbar visibility when source is loaded
        this.player.on(PlayerEvent.SourceLoaded, ()=>{
            //logger.debug(`BitmovinPlayer::SourceLoaded - Seekbar:${this.isSeekBarDisplayed}`);
          this.toggleSeekBar(this.isSeekBarDisplayed);
          if (this.player.getAvailableVideoQualities().length <= 1) {
            this.hideQualitySelectDropdown();
          } else {
            this.showQualitySelectDropdown();
          }

          var vtt_captions = this.config.vtt;
          if (!((this.config.isPreSimLive) || this.config.mode == "prelive")) {
            for (let i = 0; i < vtt_captions.length; i++) {
              this.player.subtitles.add(vtt_captions[i]);
            }
          }
        });
        // Detect when playback resumes after buffering (similar to reconnect)
        this.player.on(PlayerEvent.StallEnded, ()=>{
            //logger.debug(`BitmovinPlayer::StallEnded - Seekbar:${this.isSeekBarDisplayed}`);
            this.toggleSeekBar(this.isSeekBarDisplayed);
        });
    
        this.player.on("cueenter", function (event) {
        });

        this.player.on(PlayerEvent.SubtitleAdded, (playEvent) => {
          logger.debug(`PlayerEvent.SubtitleAdded`);

          try{
            // Hide CC1 on iOS and Mac OS (in some situations)
            if(this.config.OS_PLATFORM === 'iOS' || this.config.OS_PLATFORM === 'Mac OS'){
              setTimeout(function(){
                // This will trigger for Safari on IOS when there is a added CC1 captions and off options only
                const SUBTITLE_SELECTBOX = document.getElementsByClassName("bmpui-ui-subtitleselectbox")[0];

                if(SUBTITLE_SELECTBOX.querySelectorAll('option').length === 2 && SUBTITLE_SELECTBOX.querySelectorAll('option')[0].value === "CC1")
                  document.getElementById('video-subtitle-selectbox').style.display = 'none';
              }, 1000);
            }
          }catch (err){
            // can't find element
          }

          try{
            // Hide CC1 on Mac OS
            if(this.config.OS_PLATFORM === 'Mac OS' || this.config.OS_PLATFORM === 'iOS'){
              const SUBTITLES_LIST = this.player.subtitles.list();

              SUBTITLES_LIST.forEach(elem => {
                if(elem.id === "CC1"){
                  this.player.subtitles.remove(elem.id);
                }
              });
            }
          }catch (err){
            // subtitles.list() is undefined
          }
      });

      // Add click handler for the userAudioBackup toggle button in the settings panel
      const audioBackupToggleButton = document.getElementById("toggleAudio");

      if (audioBackupToggleButton) {
        let that = this;
        audioBackupToggleButton.addEventListener('click', function() {
          that.dispatchEvent(VideoPlayerEvents.EVENT_AUDIOBACKUP_CLICKED);
        });
      }
    }

}

export default VideoPlayer;
