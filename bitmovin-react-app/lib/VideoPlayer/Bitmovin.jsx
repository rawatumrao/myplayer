import Logger from './../Logger';
import VideoPlayer from './VideoPlayer';

const log = new Logger();

class BitmovinPlayer extends VideoPlayer {
    constructor(playerId, videoId) {
        super(playerId, videoId);
        this.conf = {
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
        }
        this.player = new bitmovin.player.Player(this.playerElement, this.conf);
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
        var source = {
            title: title,
            hls: uri
        }
        this.player.load(source);
        log.debug(`BitmovinPlayer::load()`);
        log.debug(`Title: ${source.title}`);
        log.debug(`URI: ${source.hls}`);
        this.setStatus(VideoPlayer.STATUS_LOADED);
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

    hideControls(controls) {

    }

    showControls(controls) {

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
            this.dispatchEvent(VideoPlayer.EVENT_PLAYING, playingEvent);
            $.oVideoInfo.status = "Playing";
        });

        this.player.on(bitmovin.player.PlayerEvent.Paused, (pausedEvent) => {
            log.debug(`PlayerEvent.Paused`);
            this.setStatus(VideoPlayer.STATUS_PAUSED);
            this.dispatchEvent(VideoPlayer.EVENT_PAUSED, pausedEvent);
            $.oVideoInfo.status = "Paused";
        });

        this.player.on(bitmovin.player.PlayerEvent.Error, (errorEvent) => {
            log.debug(`PlayerEvent.Error`);
            this.setStatus(VideoPlayer.STATUS_ERROR);
            this.dispatchEvent(VideoPlayer.EVENT_ERROR, errorEvent);
        })

        this.player.on(bitmovin.player.PlayerEvent.Ready, (readyEvent) => {
            const allElements = document.querySelectorAll('[class*="bmpui-"]');
            const filteredElements = Array.from(allElements).filter(el =>
                el.className.split(/\s+/).some(cls => cls.startsWith('bmpui-'))
            );
            filteredElements.forEach(element => {
                let testId = element.className.split(/\s+/).find(cls => cls.startsWith('bmpui-'));
                element.setAttribute('data-testid', testId);
            });

            log.debug(`PlayerEvent.Ready`);
            this.setStatus(VideoPlayer.STATUS_READY);
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
                        console.log("TimeChanged - Current Stream has ended.");
                    }
            }

        })
    }
}

export default BitmovinPlayer;
