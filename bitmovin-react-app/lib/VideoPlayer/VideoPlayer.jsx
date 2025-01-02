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

    static EVENT_ERROR = 'VideoPlayerEvent_Error';
    static EVENT_READY = 'VideoPlayerEvent_Ready';
    static EVENT_PLAY = 'VideoPlayerEvent_Play';
    static EVENT_PLAYING = 'VideoPlayerEvent_Playing';
    static EVENT_PAUSED = 'VideoPlayerEvent_Paused';
    static EVENT_FINISHED = 'VideoPlayerEvent_Finished';    // Finished playback
    static EVENT_TIMECHANGED = 'VideoPlayerEvent_TimeChanged';

    constructor(playerId, videoId) {
        this.playerElement = document.getElementById(playerId);
        this.videoId = videoId;
        this.player = null;
        this.state = {
            status: this.STATUS_NONE
        };
    }

    createHive(playerId) {
        console.log('createhive');
        HiveConfig.ErrorMonitor.enabled = true;
        var hiveConf = {
            debugLevel: 'debug',
            hiveTechOrder: ['HiveJava', 'HiveJS', 'StatsJS'],
            onActiveSession: (session) => {
                // showSnackbar(session)
            },
            onSessionStatechange: (stateChange) => {
                // onSessionStateChange(statechange)}
            },
            HiveJS: {
                onActiveSession: (session) => {
                    // showRenderStats(session)
                },
                onError: (error) => {
                    // onErrorCallback(error)
                    console.log(`hive error: ${error}`);
                    return true;
                },
                //renderStatsCallback: window.hiveRenderStatsCallback
            }
        }
        window['plugin'] = new HiveHtml5(playerId, hiveConf);
        HiveModule.enable(window['plugin'], this.player);

        if (typeof this.createHivePlugin !== 'undefined') {
            console.log(`hive createPlugin`);
            if (Array.isArray(this.player)) {
                window.plugin = this.createHivePlugin.apply(window, this.player);
            } else {
                window.plugin = this.createHivePlugin(this.player);
            }
            this.loadHiveSource(playerId, 'https', window.plugin);
        } else {
            console.log(`poopie`);
        }
    }

    createHivePlugin(player) {
        return window['plugin'];
    }

    loadHiveSource(playerId, protocol, plugin) {
        console.log('loadHiveSource');
        window.playerSrc = playerId;
        window.protocol = protocol;
        var key = protocol == 'dash_wowza' ? 'dash' : 'hls';
        var ticketInfo = this.hiveTicketInfo(playerId);
        var source = {};
        this.player.unload();

        if (ticketInfo) {
            console.log(`Using Hive Ticket System`);
            plugin.initSession(playerId)
                .then((hiveSession) => {
                    console.log(`hiveSession: ${hiveSession}`);
                    source[key] = hiveSession.manifest;
                    console.log(`hiveSource: ${source}`);
                    this.player.load(source)
                        .then(() => {
                            console.log('Hive: loaded source');
                        })
                        .catch((e) => {
                            console.log(`Hive: error loading source ${e}`);
                        });
                })
        } else {
            console.log(`No Hive Ticket.`);
            source[key] = playerId;
            this.player.load(source)
                .then(() => {
                    console.log('Hive: loaded source without Hive');
                })
                .catch((e) => {
                    console.log(`Hive: error loading source without hive ${e}`);
                })
        }
    }

    hiveTicketInfo(ticket) {
        var ticketInfo = ticket && typeof ticket === "string" ? ticket.match(/https:\/\/api(-test|-dev)?\.hivestreaming\.com\/v1\/events\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)/) : null;
        if (ticketInfo) {
            return {
                test: !!ticketInfo[1],
                partnerId: ticketInfo[2],
                customerId: ticketInfo[3],
                eventId: ticketInfo[4],
                secret: ticketInfo[5]
            }
        } else if (ticket && ticket.jwt && ticket.videoId && ticket.manifest) {
            return true;
        }
        return null;
    }

    createEvent(event, data) {
        return new CustomEvent(event, {detail: data});
    }

    dispatchEvent(event, data) {
        var customEvent = this.createEvent(event, data);
        document.dispatchEvent(customEvent);
    }

    play() {}
  
    pause() {}
  
    load(title, uri) {}

    resize(width, height) {}

    hideVideo() {}
    
    showVideo() {}

    hideControls(controls) {}

    showControls(controls) {}

    setPosition(position) {}

    getPosition() {}

    getPlayer() {}

    getState() {
        return this.state;
    }

    getStatus() { 
        return this.state.status;
    }
    
    setStatus(status) {
        this.state.status = status;
    }

    setupEventListeners() {}

}

export default VideoPlayer;
