(function ($) {
    $.widget("ui.viblastprototype", {
        options: {
            myURL: "",
            mywidth: 640,
            myheight: 360,
            myeventid: 0,
            allowFullScreen: true,
            controls: true,
            positionSlider: true,
            volume: 0.8,
            ls: false,
            ods: false,
            currentTimePosition: 0,
            initJump: false,
            useNative: false,
            prevTimePosition: 0,
            playerName: "flvplayer",
            autoplay: true,
            streamstatus: 0,
            isOD: true,
            pdn: false,
            callbackobj: window,
            arrayOfMethodsToCall: {},
            localtimeoffset: 0,
            isAudioAT: false,
            currentPlayer: undefined,
            refreshed: false,
            playeroffset:false,
            getLiveStatusCallBack:false,
            showPlaybackSpeed : false,
            textTrackSettings: true,
            caption_isvtt: false,
            caption_isopen: false,
            isAudio: false, // for safari on iOS
            safariCueChange: false,
            vttActiveCaptionsArea: "vttcaptions",
        },
        _init: function () {
         	if(typeof isNewViewer!="undefined" && isNewViewer===true){
            	$.oViewerText = VIEWER_DATA.localText;
            	$.oViewerData = VIEWER_DATA.data;
            	$.oMulticast = VIEWER_DATA.multicast;
            }
        	
            if(typeof $.oMulticast === "undefined"){
            	$.oMulticast = {};
            }
            if(typeof $.oViewerData === "undefined"){
            	$.oViewerData = {};            
            } else {
            	if (!$.oViewerData.vtt_caption !== "undefined") {
            	} else {
            	}
            	if (typeof $.oViewerData.caption !== 'undefined') {
           			if (typeof $.oViewerData.caption.isvtt === 'undefined') {
           				this.options.caption_isvtt = false;
	           		} else {
    	       			this.options.caption_isvtt = ($.oViewerData.caption.isvtt === 1) ? true : false;
        	   		}
           			if (typeof $.oViewerData.caption.open === 'undefined') {
            			this.options.caption_isopen = false;
	            	} else {
	            		this.options.caption_isopen = ($.oViewerData.caption.open === 1) ? true : false;
           			}
           		}
           	}
           
            if (typeof $.oViewerText == 'undefined') {
                $.oViewerText = {"sts_live": "Live","sts_ready": "Ready", "sts_playing": "Playing", "sts_connecting": "Connecting", "sts_buffering": "Buffering", "sts_failed": "Connection Failed", "sts_paused": "Paused", "sts_stopped": "Stopped", "alt_play": "Play", "alt_stop": "Stop", "alt_pause": "Pause", "alt_refresh": "Refresh Media", "alt_volume": "Volume","alt_mute": "Mute","alt_unmute": "Unmute", "alt_jump": "Jump to a Chapter", "alt_video": "Switch to Video Stream", "alt_audio": "Switch to Audio Stream", "alt_flash": "Change Media Type", "alt_windows": "Switch to Windows Media Player", "alt_captions": "Captions", "ios_click_play": "Click Play","alt_fullscreen":"Fullscreen","alt_abr_quality":"Quality","alt_settings_container":"Settings Container","alt_more_settings":"More Settings","player_abr_low":"Low","player_abr_auto":"Auto","player_abr_standard":"Standard","player_abr_high":"High"};
            }
            this.arrayOfMethodsToCall = this.options.arrayOfMethodsToCall;
            this.arrayOfMethodsToCallWhenCanPlay = {};

            if ($("#flvplayer").length && !this.options.ods) {
                $("#flvplayer").remove();
            }

            if (this.options.audioTag) {
                var video = document.createElement('audio');
            } else {
                var video = document.createElement('video');
            }
            video.id = this.options.playerName;

            if(this.options.autoplay===true){
                video.autoplay = this.options.autoplay;
            }
            video.controls = this.options.controls;
        
            //If the user is a small screen iOS device add the playsinline attribute to the player
            var isSmallIOSDevice = /iPhone|iPod/.test(navigator.userAgent);
            if (isSmallIOSDevice) {
                video.setAttribute('playsinline','');
            }
            //video.setAttribute('muted', '');
            if (this.isMSESupported()) {
                $(video).attr('data-viblast-player', 'auto');
            }
            
            if(this.options.showPlaybackSpeed === true){            
            	$(video).attr('data-setup', '{ "playbackRates": [0.5, 1, 1.5, 2] }');
            }
            
            $(video).attr('data-viblast-buffer-while-paused', 'off');
            $(video).attr('data-viblast-log', 'warning');
            $(video).attr('data-viblast-remuxer-log', 'warn');
            $(video).attr('data-viblast-abr-consider-dimensions', 'false');
            $(video).attr('data-viblast-playlist-timeout', '30000');
            $(video).attr('data-viblast-long-pause-timeout', '1.0');
            
            var abrIndex = 0;
            if (this.isOD() && $.oViewerData.sMode != "live") {
            	abrIndex = 999;
            }
            $(video).attr('data-viblast-initial-abr-index', abrIndex);
            
            //Add player offet on live streams, if its not safari, webcam or hive stream.
            //var isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
            if (this.options.playeroffset){
               console.log("TPQA - Adding playlist offset");
               $(video).attr('data-viblast-playlist-starting-offset','0.75');
            }
                        
            $(video).attr('data-viblast-key', '26c0a6776347a9cf2323243ba936649d200d3b9872a3bba951047b618ea83afbc60117b3d2c88fa2047a3638e9bc3f48');
           
            //if (this.options.pdn) {
                //$(video).attr('data-viblast-enable-pdn', 'true');
                //$(video).attr('data-viblast-enable-realtime-logger','true'); 
            //
            if(/iPad|iPhone|iPod/.test(navigator.userAgent)){
            	this.options.useNative=true;
            }
            if (this.options.useNative) {
                console.log("TPQA - Use native HTML5 player");
                $(video).attr('data-setup', '{"techOrder": ["html5", "viblast"]}');
            } 
            //else {
                //$(video).attr('data-setup','{"techOrder": ["html5", "viblast","viblastflash"]}');
            //}
            $(video).addClass("video-js vjs-default-skin");

            var source = document.createElement('source');
            source.src = this.options.myURL;
            source.type = "application/x-mpegURL";
            //For hive and collective we initially set 
            if ($.oMulticast.isHiveMulticast || $.oMulticast.isKollectiveMulticast) {
            	$("#playbuttonDiv").hide();
                source.src = "";
            }else{
            	$(video).append(source);
            }
            

            this.element.append(video);
            this.video = video;
            that = this;
      
            var isAnyMulticast = $.oMulticast.isHiveMulticast || $.oMulticast.isRampMulticast || $.oMulticast.isRampCache || $.oMulticast.isKollectiveMulticast; 
            var options1 = { 
            		 controlBar: {
            			 PictureInPictureToggle: false
            			  },
            		userActions: {doubleClick: false},
                    nativeControlsForTouch : false,
            		viblast: {
	    			xhrBeforeSend: function(ev) {
	    				if (!that.options.ods && !isAnyMulticast) {
	    					ev.xhr.withCredentials = "true";
	    					//console.log('Viblast html5 is making a', ev.method, 'request to ', ev.url);
	    				}	
	    				if (!that.options.ls && $.oMulticast.isKollectiveMulticast) {
	    					window.ksdk.api.tech.get('viblast.xhrBeforeSend')(ev);
	    				}
	    			}
	              },
	              viblastflash: {
	                  xhrBeforeSend: function(ev) {                            
	                	  if (!isAnyMulticast) {
	                          ev.xhr.withCredentials = "true";
	                          //console.log('FLASH Viblast is making a', ev.method, 'request to ', ev.url);
	                	  }                          
	                  }
	              }
            };
           
            videojs(that.options.playerName, options1, function () {
                if (typeof videojs == "function") {
                	console.log("TPQA -  videojs loaded");
                	player = videojs(that.options.playerName);
                	
                	// event uses new multi-vtt setup
                	if ($.oViewerData.vtt_caption && $.oViewerData.vtt_caption.length > 0 && !$.oViewerData.isPreSimlive && !$.viewerAction.oActiveSecondaryMedia.active) {
                		console.log("TPQA - Adding multi-VTT captions.");
                		this.addcuetracks();
                	}
                	
                	// previous vtt/xml setup
                	else if (this.options.caption_isvtt) {
                		console.log("TPQA - Previous XMl/VTT setup.");
                		if (!$.oViewerData.isPreSimlive && !$.viewerAction.oActiveSecondaryMedia.active) {
                			player.addRemoteTextTrack({
                				src: $.oViewerData.sContentUrl + $.oViewerData.sEventGUID + $.oViewerData.caption.odpath,
                				kind: "subtitles",
                				//default: this.options.caption_isopen.toString(),
                				mode: (this.options.caption_isopen === true) ? "showing" : "disabled",
                				label: "subtitles on",
                				language: "en"
                			}, false);
                			
                			// Fix VTT files playing even if "display by default" isn't selected when viewer joins in the middle of a simlive broadcast.
                			if (!this.options.caption_isopen) {
                				var tracks = player.remoteTextTracks();
                				for (var i = 0; i < tracks.length; i++) {
                					var track = tracks[i];
                					if (track.label !== 'subtitles off') {
                						track.mode = 'disabled';
                					}
                				}
                			}
                		}
                	}

                    that.options.currentPlayer = player;
                    if (!this.options.ls && $.oMulticast.isHiveMulticast) {
                        this.loadHivePlugin();
                       	this.initHiveTicket(that.options.myURL);                                               
                    }
                    
                     if (!this.options.ls && $.oMulticast.isKollectiveMulticast) {
                        this.loadKollectivePlugin();
                                            
                    }
             
                    $(this.getVideoIDPound()).width(that.options.mywidth).height(that.options.myheight);
                    $(this.getVideoIDPound()).find(".vjs-control-bar").css("visibility", "hidden");

                    this.totalBuffering = 0;
                    this.bufferingStartTime = -1;

                    if (this.options.controls) {
                        this.showControls();
                    }

                    if (this.isOD()) {
                        $(".vjs-live-display").hide();
                        $(".vjs-remaining-time").hide();
                    }

                    /*if (this.options.allowFullScreen) {
                        this.showFullScreenButton();
                    } else {
                        this.hideFullScreenButton();
                    }*/

                    if (this.options.positionSlider) {
                        this.showPosSlider();
                    } else {
                        this.hidePosSlider();
                    }

                    this.setVolume(this.options.volume);

                    this.addTopControlBar();
                    this.addStatusDiv();
                    this.addControlAttributes();
                    //alert(player.Ta);
                    if (!this.options.useNative) {
                    	console.log("not native");
                        player.on("canplay", this.canplaylistener.bind(this));
                        player.on("ready", this.readylistener.bind(this));
                        player.on("play", this.playlistener.bind(this));
                        player.on("playing", this.playinglistener.bind(this));
                        player.on("pause", this.pausedlistener.bind(this));
                        player.on("seeking", this.seekinglistener.bind(this));
                        player.on("waiting", this.bufferinglistener.bind(this));
                        player.on("volumechange", this.volumechangelistener.bind(this));
                        player.on("ended", this.endedlistener.bind(this));
                        player.on("timeupdate", this.timeupdatelistener.bind(this));
                        player.on("fullscreenchange", this.fullscreenchange.bind(this));
                        player.on("change", this.trackchange.bind(this));
                        //player.viblast.addEventListener("updatedmetadata", this.abrlistener.bind(this));
                        //player.viblast.addEventListener("videoqualitychange", this.videoqualitychangelistener.bind(this));
                    } else {
                    	//All native player listeners
                        var video = document.getElementById(that.options.playerName + "_html5_api");
                        this.video = video;
                        console.log("native");
                        video.addEventListener("canplay", this.canplaylistener.bind(this));
                        video.addEventListener("ready", this.readylistener.bind(this));
                        video.addEventListener("play", this.playlistener.bind(this));
                        video.addEventListener("playing", this.playinglistener.bind(this));
                        video.addEventListener("pause", this.pausedlistener.bind(this));
                        video.addEventListener("seeking", this.seekinglistener.bind(this));
                        //video.addEventListener("stalled", this.bufferinglistener.bind(this));
                        video.addEventListener("waiting", this.bufferinglistener.bind(this));
                        video.addEventListener("volumechange", this.volumechangelistener.bind(this));
                        video.addEventListener("ended", this.endedlistener.bind(this));
                        video.addEventListener("timeupdate", this.timeupdatelistener.bind(this));
                        video.addEventListener("change", this.trackchange.bind(this));
                    }

                    if (player.width() <= 320) {
                        $(this.getVideoIDPound()).addClass("small-player");
                    }

                    this.isPlayerLoaded = true;
                    for (var key in that.arrayOfMethodsToCall) {
                        //console.log(key);
                        var codeToExecute = key;
                        var tmpFunc = new Function(codeToExecute);
                        tmpFunc();
                    }
                    if(typeof isNewViewer!="undefined" && isNewViewer){
                    	this.options.callbackobj.PlayerLoaded();
                    }
                    this.syncSlides();
                    if (!this.options.useNative) {
                        this.abrlistener();
                    }
                  
                } else {
                    console.log("TPQA - Player not created yet");
                    this.isPlayerLoaded = false;
                }
            }.bind(this))
        },
        isMSESupported: function () {
            var mse = false;
            try {
                mse = !!(window['MediaSource'] || window['WebKitMediaSource']);
            } catch (e) { }
            return mse;
        },
        isIE11:function(){
        	// return navigator.appVersion.indexOf("Windows NT 6.1") == -1 && !!window.MSInputMethodContext && !!document.documentMode;
        	return $.oViewerData.bIE11;
        },
        getVideoIDPound: function (enhanced) {
            return "#" + that.options.playerName;
        },
        showControls: function (controlsDiv, player) {
            $(this.getVideoIDPound()).find(".vjs-control-bar").css("visibility", "visible");
        },
        hideControls: function (controlsDiv, player) {
            $(this.getVideoIDPound()).find(".vjs-control-bar").css("visibility", "hidden");
        },
        showFullScreenButton: function () {
            $(this.getVideoIDPound()).find(".vjs-fullscreen-control").css("visibility", "visible");
            if (!this.options.controls) {
                $(this.getVideoIDPound()).find(".vjs-control-bar").css("display", "block");
            }
        },
        hideFullScreenButton: function () {
            //$(this.getVideoIDPound()).find(".vjs-fullscreen-control").css("visibility", "hidden");
            $(".vjs-fullscreen-control").hide();
        },
        showPosSlider: function () {
            $(this.getVideoIDPound()).find(".vjs-progress-control").css("visibility", "visible");
            if (!this.options.controls) {
                $(this.getVideoIDPound()).find(".vjs-control-bar").css("display", "block");
            }
        },
        hidePosSlider: function () {
            $(this.getVideoIDPound()).find(".vjs-progress-control").css("visibility", "hidden");
        },
        showStatus: function () {
            $(this.getVideoIDPound()).find(".vjs-status-controls").css("visibility", "visible");
            if (!this.options.controls) {
                $(this.getVideoIDPound()).find(".vjs-control-bar").css("display", "block");
            }
        },
        hideStatus: function () {
            $(this.getVideoIDPound()).find(".vjs-status-controls").css("visibility", "hidden");
        },
        showVolume: function () {
            $(this.getVideoIDPound()).find(".vjs-volume-control").css("visibility", "visible");
            $(this.getVideoIDPound()).find(".vjs-mute-control").css("visibility", "visible");
            if (!this.options.controls) {
                $(this.getVideoIDPound()).find(".vjs-control-bar").css("display", "block");
            }
        },
        hideVolume: function () {
            $(this.getVideoIDPound()).find(".vjs-volume-control").css("visibility", "hidden");
            $(this.getVideoIDPound()).find(".vjs-mute-control").css("visibility", "hidden");
        },
        showRefresh: function () {
            $(this.getVideoIDPound()).find(".vjs-refresh-control").css("visibility", "visible");
            if (!this.options.controls) {
                $(this.getVideoIDPound()).find(".vjs-control-bar").css("display", "block");
            }
        },
        hideRefresh: function () {
            $(this.getVideoIDPound()).find(".vjs-refresh-control").css("visibility", "hidden");
        },
        showTime: function () {
            $(this.getVideoIDPound()).find(".vjs-current-time").show();
            $(this.getVideoIDPound()).find(".vjs-time-divider").show();
            $(this.getVideoIDPound()).find(".vjs-duration").show();
        },
        hideTime: function () {
            $(this.getVideoIDPound()).find(".vjs-current-time").addClass('dont-display-element');//.css("display","none");
            $(this.getVideoIDPound()).find(".vjs-time-divider").addClass('dont-display-element');//.css("display","none");
            $(this.getVideoIDPound()).find(".vjs-duration").addClass('dont-display-element');//.css("display","none");
        },
        getPlayer : function (){
        	return this.options.currentPlayer;
        },
        play: function () {
            if (typeof this.options.currentPlayer !== "undefined" && typeof videojs == "function") {
                this.options.currentPlayer.play();
            } else {
                that.arrayOfMethodsToCall["that.play()"] = 1;
            }
        },
        pause: function () {
            if (typeof videojs == "function") {
                this.options.currentPlayer.pause();
            } else {
                that.arrayOfMethodsToCall["that.pause()"] = 1;
            }
        },
        stop: function () {
            if (typeof videojs == "function") {
                this.options.currentPlayer.pause();
            } else {
                that.arrayOfMethodsToCall["that.stop()"] = 1;
            }
        },
        load: function () {
            if (typeof videojs == "function") {
                this.options.currentPlayer.load();
                console.log("TPQA - Player has been loaded");
            } else {
                that.arrayOfMethodsToCall["that.load()"] = 1;
            }
        },
        dispose: function () {
            try {
                this.options.currentPlayer.dispose();
                console.log("TPQA - Player has been disposed");
            } catch (e) {
                console.log("TPQA - dispose error" + e.message);
            }
        },
        refresh: function () {
            try {
                this.setStreamSrc(this.options.myURL);
            } catch (e) {
                console.log("TPQA - refresh error" + e.message);
            }
        },
        dopostrefresh: function () {
        	console.log("TPQA - postrefresh");
            $("#abr-select").val("Auto");
            $(".vjs-abr-control").hide();
            if (!that.options.useNative) {
                this.abrlistener();
            }
        },
        setODTimePosition: function (seconds) {
            this.options.currentPlayer.currentTime(seconds);
        },
        setTimePosition: function (seconds) {
            //this.options.currentTimePosition = seconds;
            if (typeof videojs == "function") {
                //console.log("setTimePosition this.isLive() " + this.isLive());
                if (!this.isLive() || this.options.initJump) {
                    if (this.options.ods) {
                        this.setTimePositionRaw(seconds);
                    } else {
                        setTimeout("that.setTimePositionRaw('" + seconds + "');", 1000);
                    }
                    console.log("TPQA - setTimePosition has been requested / set to " + seconds + " / " + this.options.currentPlayer.currentTime());
                }
            } else {
                that.arrayOfMethodsToCall["that.setTimePosition('" + seconds + "')"] = 1;
                //console.log("setTimePosition typeof videojs" + typeof videojs);
            }
        },
        setTimePositionRaw: function (seconds) {
            this.options.currentPlayer.currentTime(seconds);
            console.log("TPQA - setTimePositionRaw has been requested / set to " + seconds + " / " + this.options.currentPlayer.currentTime());
            if ($("#flvplayer_flash_api").length > 0 || $("#flvplayer_Viblastflash_api").length > 0) {
                console.log("TPQA - setTimePositionRaw skipped userAgent.indexOf(windows)" + navigator.userAgent.toLowerCase().indexOf("windows") + " !(window['MediaSource'] || window['WebKitMediaSource']) " + !(window['MediaSource'] || window['WebKitMediaSource']));
                return;
            }
            if (this.options.currentPlayer.currentTime() < (seconds - 2)) {
                console.log("TPQA - setTimePositionRaw has been actually requested / set to " + seconds + " / " + this.options.currentPlayer.currentTime());
                setTimeout("that.setTimePositionRaw('" + seconds + "');", 5000);
            } else {
                if ((/rv:11.0/i.test(navigator.userAgent)) || (/Edge\/1./i.test(navigator.userAgent))) {
                    this.options.currentPlayer.pause();
                    this.options.currentPlayer.play();
                    console.log("TPQA - setTimePositionRaw has been done and Play/Pause called.");
                }
            }
        },
        getTimePosition: function (seconds) {
            try {
                return this.options.currentPlayer.currentTime();
            } catch (e) {
                console.log("TPQA - getTimePosition Error" + e.message);
            }
        },
        setVolume: function (vol) {
            this.options.volume = vol;
            if (typeof videojs == "function") {
                this.options.currentPlayer.volume(this.options.volume);
            } else {
                that.arrayOfMethodsToCall["that.setVolume(" + this.options.volume + ")"] = 1;
            }
        },
        setMute: function (bMute) {
             if (typeof videojs == "function") {
                this.options.currentPlayer.muted(bMute);
            } 
        },
        setPlayerHeight: function (height) {
            this.options.myheight = height;
            $(this.getVideoIDPound()).height(height);
	
        },
        setPlayerWidth: function (width) {
            this.options.mywidth = width;
            $(this.getVideoIDPound()).width(width);
		
        },
        setInitJump: function (bEnable) {
            this.options.initJump = bEnable;
        },
        makeAudio: function (width, timePositionSeconds) {
            if (typeof videojs == "function" && typeof this.options.currentPlayer !== "undefined") {
                if (width) {
                    this.options.mywidth = width;
                    this.setPlayerWidth(width);
                }
                this.setPlayerHeight(30);
                $(this.getVideoIDPound()).find(".vjs-fullscreen-control").hide();
                $(this.getVideoIDPound()).find(".vjs-picture-in-picture-control").hide();
                $(this.getVideoIDPound()).find(".vjs-tech").hide();
                $(this.getVideoIDPound()).find(".vjs-loading-spinner").hide();
                $(this.getVideoIDPound()).find(".vjs-abr-control").hide();
                $(this.getVideoIDPound()).find(".vjs-control-bar").addClass("make-opaque");
                $("#top-control-bar").css("top", 30 - $("#player").height());
                this.madeAudio = true;
                this.options.isAudio = true;
                console.log("TPQA - Player was made audio");

				// when user enters in middle of simlive
                if (!$.oViewerData.isPreSimlive && (this.options.caption_isvtt || ($.oViewerData.vtt_caption !== null && $.oViewerData.vtt_caption.length > 0))) {
                	// Double check that cue tracks exists, and add them back if they don't.
                	if (player.remoteTextTracks().length === 0) {
                		console.log("TPQA - Cue tracks missing, adding back in.");
                		this.addcuetracks();
                	}
                	this.addcuechange();
               	}
            } else {
                that.arrayOfMethodsToCall["that.makeAudio('" + this.options.mywidth + "','" + timePositionSeconds + "')"] = 1;
            }
        },
        makeVideo: function (width, height, timePositionSeconds) {
            if (typeof videojs == "function" && typeof this.options.currentPlayer !== "undefined") {
                if (width) {
                    this.options.mywidth = width;
                    this.setPlayerWidth(width);
                }
                if (height) {
                    this.options.myheight = height;
                    this.setPlayerHeight(height);
                }
                $(this.getVideoIDPound()).find(".vjs-fullscreen-control").show();
                $(this.getVideoIDPound()).find(".vjs-picture-in-picture-control").show();
                $(this.getVideoIDPound()).find(".vjs-tech").show();
                $(this.getVideoIDPound()).find(".vjs-loading-spinner").show();
                $(this.getVideoIDPound()).find(".vjs-control-bar").removeClass("make-opaque");
                $("#top-control-bar").css("top", 0);
                this.madeAudio = false;
                console.log("TPQA - Player was made video");
            } else {
                //that.arrayOfMethodsToCall["that.makeVideo(" + this.options.mywidth + "," + this.options.myheight + "," + this.options.currentTimePosition + ")"] = 1;
                that.arrayOfMethodsToCall["that.makeVideo('" + width + "','" + height + "','" + timePositionSeconds + "')"] = 1;
            }
        },
        switchVideo: function (params) {
            this.options.flashopts = params;
            this.getFlashMovieObject(this.options.playerName).switchVideo(params.myURL, params.myEcdn, params.myeventid, params.myEventType, 0);
        },
        getDuration: function () {
            return this.options.duration;
        },
        getPosition: function () {
            return this.options.position;
        },
        setStreamSrcRaw: function (streamSrc, iAttempt) {
            var delay = (((new Date()) - this.curProgramDateTime) / 1000);//Streaming delay in seconds
            if (that.options.useNative && delay < 11 && streamSrc.indexOf("convey_hls") > 5 && iAttempt < 2) {
                this.options.myURL = streamSrc;
                this.options.currentPlayer.src(streamSrc);
                this.options.currentPlayer.play();
                setTimeout("that.setStreamSrcRaw('" + streamSrc + "'," + (iAttempt + 1) + ");", 60000);
                console.log("TPQA - setStreamSrcRaw Attempt " + iAttempt + " Stream source set to ..." + streamSrc.substring(40));
            }
        },
        setStreamSrc: function (streamSrc) {        	
            if (typeof videojs == "function" && typeof this.options.currentPlayer !== "undefined") {
                this.options.myURL = streamSrc;
                if (!this.options.ls && $.oMulticast.isHiveMulticast) {
                    this.initHiveTicket(streamSrc);
                } else {
                    this.options.currentPlayer.src(streamSrc);
                }

                if (this.isOD() && ($("#flvplayer_flash_api").length > 0)) {
                    this.options.currentPlayer.ready(function () { this.options.currentPlayer.play(); });
                }
                if (that.options.useNative && streamSrc.indexOf("convey_hls") > 5) {
                    setTimeout("that.setStreamSrcRaw('" + streamSrc + "',1);", 60000);
                }
                console.log("TPQA - setStreamSrc : Stream source called set to... " + streamSrc.substring(40));
            } else {
                that.arrayOfMethodsToCall["that.setStreamSrc('" + streamSrc + "')"] = 1;
            }

        },
        getStreamSrc: function () {
            if (typeof videojs == "function") {
                return this.options.currentPlayer.currentSrc();
                //return this.options.myURL;
            } else {
                that.arrayOfMethodsToCall["that.getStreamSrc()"] = 1;
            }
        },
        getBufferedTime: function () {
            var buffered = this.options.currentPlayer.buffered();
            var currentTime = this.options.currentPlayer.currentTime();
            for (var i = 0; i < buffered.length; i++) {
                if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
                    return buffered.end(i) - currentTime;
                }
            }
            return 0;
        },
        addTopControlBar: function () {
            $(".vjs-control-bar").attr("id", "original-control-bar");
            $(this.getVideoIDPound()).find(".vjs-big-play-button").before("<div id='top-control-bar' class='vjs-control-bar'></div>");
        },
        addStatusDiv: function () {
            //$(this.getVideoIDPound()).find(".vjs-live-controls").before("<div class='vjs-status-controls vjs-control'><div class='vjs-status-display vjs-control'></div></div>");
            $(this.getVideoIDPound()).find("#top-control-bar").append("<div class='vjs-status-controls vjs-control'><div class='vjs-status-display vjs-control'></div></div>");
        },
        addLiveStudioControls: function () {
            if (this.isLive()) {
                $("#top-control-bar").after("<div id='lsviewaudstream' alt='lsviewaudstream' title='lsviewaudstream'><span id='lvdelaymsg' style='display:none'>This video is delayed by <span id='showcap'>??</span>s&nbsp; <a href='#' id='delaylearnmore' style='color:#fff; font-weight:normal;text-decoration: underline;'>Learn more</a><span></div>");
            }
            $(this.getVideoIDPound()).append("<div id='lsvolcontrol' alt='lsvolcontrol' title='lsvolcontrol'><img src='/images/listen-presenter_enable.png' id='lsvolon' /><img src='/images/listen-presenter_disable.png' id='lsvoloff' style='display:none' /></div>").show();
            $(".vjs-tech").css("pointer-events", "none");
            $("#delaylearnmore").click(function () {
                window.open("/include/learnmore.html", "MsgWindow", "width=480,height=275");
                return false;
            });

            if($("#media_overlay_flashplayer").length>0){
                $("#media_overlay_flashplayer").append("<img src='/images/icon_sm_fullscreen.png' id='overlay-fullscreen'>");    
            }
            
            if($("#mediaOverlayVideo #media_player").length>0){
                $("#media_player").append("<img src='/images/icon_sm_fullscreen.png' id='overlay-fullscreen'>");    
            }

            
            $("#overlay-fullscreen").click(function () {
                player.requestFullscreen();
            });
        },
        addControlAttributes: function () {
            player.removeChild("PosterImage");
        	player.removeChild("BigPlayButton");
        	//player.controlBar.removeChild("LiveDisplay");
        	player.controlBar.removeChild("RemainingTimeDisplay");
        	player.controlBar.removeChild("ChaptersButton");
        	if (this.options.caption_isvtt || ($.oViewerData.vtt_caption && $.oViewerData.vtt_caption.length > 0)) {
        		player.controlBar.addChild("SubtitlesButton"); // audio player
        		player.controlBar.addChild("CaptionsButton"); // video player
        	}
        	player.controlBar.removeChild("PictureInPictureToggle");
        	player.controlBar.removeChild("DescriptionsButton");
        	player.controlBar.removeChild("AudioButton");
        	player.controlBar.removeChild("SubsCapsButton");
        	player.controlBar.removeChild("SeekToLiveControls");
        	
        	  $(".vjs-play-control").hover(function () {
                  if (player.paused()) {
                      $(".vjs-play-control").attr("title", $.oViewerText.alt_play);
                  } else {
                      $(".vjs-play-control").attr("title", $.oViewerText.alt_pause);
                  }
              });
               $(".vjs-mute-control").hover(function () {
                  if (player.muted()) {
                       $(".vjs-mute-control").attr("title", $.oViewerText.alt_unmute);
                  } else {
                       $(".vjs-mute-control").attr("title", $.oViewerText.alt_mute);
                  }
              });
              $(".vjs-play-control").after("<button class='vjs-refresh-control vjs-control  vjs-button' id='refreshvideo' title='" + $.oViewerText.alt_refresh + "'><span aria-hidden='true' class='vjs-icon-placeholder'></span><span class='vjs-control-text'>" + $.oViewerText.alt_refresh + "</span></button>");

              //==============================================================

              $(".vjs-play-progress").addClass("ui-state-active");
              $(".vjs-volume-level").addClass("ui-state-active");
              //================================================================
              $("#toggleAudio").attr("title", $.oViewerText.alt_audio);
              $("#changemedia").attr("title", $.oViewerText.alt_flash);

      	      $(".vjs-volume-menu-button").attr("title", $.oViewerText.alt_volume);
              $(".vjs-fullscreen-control").attr("title", $.oViewerText.alt_fullscreen);
              $(".vjs-captions-button").attr("title", $.oViewerText.alt_captions).hide();

              $(".vjs-fullscreen-control").before("<button class='vjs-jumppoint-control vjs-control vjs-button' id='jumppoint' style='display:none' title='" + $.oViewerText.alt_jump + "'><span aria-hidden='true' class='vjs-icon-placeholder'></span><span class='vjs-control-text'>" + $.oViewerText.alt_jump + "</span></button>");
              $(".vjs-fullscreen-control").before("<button class='vjs-settings-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button' tabindex='0' aria-haspopup='true' title='" + $.oViewerText.alt_more_settings + "'><span aria-hidden='true' class='vjs-icon-placeholder'></span><span class='vjs-control-text'>" + $.oViewerText.alt_more_settings + "</span></button>");
              $(".vjs-settings-button").after("<div class='vjs-settings-container aria-haspopup='true' title='" + $.oViewerText.alt_settings_container + "'><div class='vjs-control-content'><span class='vjs-control-text'>" + $.oViewerText.alt_settings_container + "</span><div class='vjs-menu'><ul class='vjs-menu-content'></ul></div></div></div>");
              //$(".vjs-play-control").before($(".vjs-fullscreen-control"));

              $(".vjs-settings-container").find(".vjs-menu-content").append("<li class='vjs-menu-item vjs-selected vjs-abr-control' id='abr' style='display:none' title='" +  $.oViewerText.alt_abr_quality  + "' role='button' tabindex='0' aria-selected='true'><div id='abr-select-container' class='vjs-panel-item'><label id='abr-label' for='abr-select'>" + $.oViewerText.alt_abr_quality + "</label><select id='abr-select' class='vjs-panel-content'></div></li>");
              $(".vjs-settings-container").find(".vjs-menu-content").append("<li class='vjs-menu-item vjs-selected vjs-talkpoint-caption-control' id='cc' style='display:none'  title='Captions' tabindex='0' aria-selected='true'><div class='vjs-panel-item'><label id='abr-label'>Captions</label><span id='cc_on'><a href='#'>ON</a></span><span class='off' id='cc_off'><a href='#'>OFF</a></span></div></li>");
              $(".vjs-settings-container").find(".vjs-menu-content").append("<li class='vjs-menu-item vjs-selected vjs-toggleaudio-control ui-helper-hidden' id='toggleAudio'  title='" + $.oViewerText.alt_audio + "' role='button' tabindex='0' aria-selected='true'>&nbsp;&nbsp;&nbsp;" + $.oViewerText.alt_audio + "</li>");
              //$(".vjs-settings-container").find(".vjs-menu-content").append("<li class='vjs-menu-item vjs-selected vjs-changemedia-control ui-helper-hidden' id='changemedia' alt='" + $.oViewerText.alt_windows + "' title='" + $.oViewerText.alt_windows + "' role='button' tabindex='0' aria-selected='true'>&nbsp;&nbsp;&nbsp;" + $.oViewerText.alt_windows + "</li>");

              // Remove aria-live attr
              $(".vjs-control-text").removeAttr('aria-live');
              $(".vjs-volume-bar").removeAttr('aria-live');
              $(".vjs-current-time-display").removeAttr('aria-live');
              $(".vjs-live-display").removeAttr('aria-live');
              $(".vjs-text-track-display").removeAttr('aria-live');
              $(".vjs-duration-display").removeAttr('aria-live');

              // DOM manipulation 
              $("#original-control-bar").prepend($('.vjs-progress-control'));
              $('.vjs-progress-holder').attr('aria-label', 'Seek Slider');
              $('.vjs-playback-rate button').removeAttr('aria-disabled').removeAttr('aria-haspopup').removeAttr('aria-expanded');
              $('.vjs-playback-rate button').attr('aria-label', `Playback Speed is Currently 1x.  Speed Can Be Changed By Pressing Enter`);
              $('.vjs-playback-rate button').attr('aria-live', 'polite');
              $('.vjs-playback-rate button').attr('title', 'Playback Speed');
            //   $('.vjs-playback-rate .vjs-menu-item')[0].setAttribute("aria-label" , "Change Playback Speed to 2x.");
            //   $('.vjs-playback-rate .vjs-menu-item')[1].setAttribute("aria-label" , "Change Playback Speed to 1.5x.");
            //   $('.vjs-playback-rate .vjs-menu-item')[2].setAttribute("aria-label" , "Change Playback Speed to 1x.");
            //   $('.vjs-playback-rate .vjs-menu-item')[3].setAttribute("aria-label" , "Change Playback Speed to 0.5x.");
              $('.vjs-jumppoint-control').attr('aria-label', 'Jump to Chapter Button.  Will open jump to chapter modal.');
              $('.vjs-settings-container').insertBefore('.vjs-settings-button');
              $('.vjs-status-display').attr('aria-live', 'polite');
              $('#vttcaptions').css( 'font-size', '14px' );
              $('#vttcontentonly').css( 'font-size', '14px' );

              //Add Event Listeners
              $('.vjs-playback-rate button').on('click', ()=>{
                $('.vjs-playback-rate')[0].classList.add('vjs-hover');

                setTimeout(()=>{
                    let currPlaybackRate = document.getElementsByClassName('vjs-playback-rate-value')[0].innerText;
                    $('.vjs-playback-rate button').attr('aria-label', `Playback Speed is Currently ${currPlaybackRate}. Speed Can Be Changed By Pressing Enter`);
                    $('.vjs-playback-rate')[0].classList.remove('vjs-hover');
                }, 200);
              });

              var settingsHeightBool = false;

              $(".vjs-settings-button").on("click",function () {
            	  if (!$(".vjs-settings-button").hasClass("open")) {
            		  					
                    $(".vjs-settings-container .vjs-menu").show();
                    $(".vjs-settings-container").show();
                    $(".vjs-settings-button").addClass("open");

                      // Setting height for settings Container
                      //if (settingsHeightBool === false) {
                          var settingsArr = [
                              '.vjs-abr-control',
                              '.vjs-talkpoint-caption-control',
                              '.vjs-toggleaudio-control'
                           ],
                            settingsCtrlsTop = [
                                  '-36px',
                                  '-71px',
                                  '-102px'
                                      ],
                              settingsCount = -1;

                          for (var x = 0; x < settingsArr.length; x++) {
                              if ($(settingsArr[x]).css('display') !== 'none') {
                                  settingsCount++;
                              }
                          }

                          $('.vjs-settings-container').css('top', settingsCtrlsTop[settingsCount]);
                          //settingsHeightBool = true;
                          //$('.vjs-settings-container .vjs-menu-content .vjs-menu-item').focus();
                          $('#abr-select').focus();
                      //}
                  } else {
                    $(".vjs-settings-container .vjs-menu").hide();
                    $(".vjs-settings-container").hide();
                      $(".vjs-settings-button").removeClass("open");
                  }
              })
              $(".vjs-abr-control").on("click",function () {
                  if ($(".vjs-panel").css("display") == "none") {
                      $(".vjs-panel").show();
                  } else {
                      $(".vjs-panel").hide();
                  }
              });

              $('.vjs-fullscreen-control').click(function () {
                  if ($(".vjs-settings-button").hasClass("open")) {
                      $.viewerControls.dopostsettingmenu();
                  }
                  if ($("#jumppoint").hasClass("open")) {
                      $("#jumppoint").click();
                  }
              });

              $("#abr-select").change(function () {
                  if ($(".vjs-panel").css("display") == "none") {
                      $(".vjs-panel").show();
                  } else {
                      $(".vjs-panel").hide();
                  }
              });
              setInterval(function () {
                if (!$(that.getVideoIDPound() + " " + ".vjs-settings-container").find(".vjs-menu-content li").filter(function () { return $(this).css('display') !== 'none' }).length) {
                      $(that.getVideoIDPound() + " " + ".vjs-settings-button").hide();
                  } else {
                      $(that.getVideoIDPound() + " " + ".vjs-settings-button").show();
                  }
              }, 1000);


              //Add Context Menu
              var cMenuYear = "";
              try {
                  var cMenuDate = new Date();
                  cMenuYear = cMenuDate.getFullYear();
              } catch (err) { }
              $("#" + that.options.playerName).after("<div id='cMenu'><div id='cClose'><img src='/images/close_panel.png' title='Close Menu' alt='Close Menu' border='0'></div><div id='cTitle' class='cMenuItem'>Webcasts.com HTML5 Video Player</div><div id='cCopyright' class='cMenuItem'>&copy; " + cMenuYear + ". All rights reserved.</div><div id='cInfo' class='cMenuItem'></div><div id='cStreamInfo' class='cMenuItem'>Stream: Unicast</div></div>");

              var version = "";
              setTimeout(function () {
                  try {
                      var fullversion = Viblast.version();//Get viblast player version
                      var version = fullversion.substring(8, 21);
                      $("#cInfo").html("Version: " + version + "<hr>");
                  } catch (err) {
                      console.log(err);
                  }
              }, 2000);


              $(".vjs-tech").bind("contextmenu", function (e) {//Attaches context menu to html5 video player
                  //Position the context menu based on the position of the user's mouse
                  var menuContainer = $(".vjs-tech").offset();
                  var menuContainerTop = menuContainer.top;
                  var menuContainerLeft = menuContainer.left;
                  var toppos = (e.pageY - menuContainer.top) + "px";
                  var leftpos = (e.pageX - menuContainer.left) + "px";
                  $("#cMenu").css({ top: toppos, left: leftpos });
                  $("#cMenu").show();
                  var contWidth = $(".vjs-tech").width();
                  var contHeight = $(".vjs-tech").height();
                  var menuWidth = $("#cMenu").width();
                  var menuHeight = $("#cMenu").height();
                  var xBoundary = ((menuContainerLeft + contWidth) - menuWidth);
                  var yBoundary = ((menuContainerTop + contHeight) - menuHeight);
                  if (e.pageX > xBoundary) {
                      $("#cMenu").css('margin-left', -menuWidth);
                      //console.log("TPQA: Setting margin-left to: " + -menuWidth);
                  } else {
                      $("#cMenu").css('margin-left', 0);
                      //console.log("TPQA: Setting margin-left to: 0");
                  }
                  if (e.pageY > yBoundary) {
                      $("#cMenu").css('margin-top', -menuHeight);
                  } else {
                      $("#cMenu").css('margin-top', 0);
                  }

                  $("#cMenu").show();
                  return false;
              });
              $("#cClose").click(function () {
                  $("#cMenu").hide();
                  return false;
              });
              if (this.options.ls) {
                  this.addLiveStudioControls();
              }
              $("#lsvolon").click(function () {
                  that.setVolume(50);
                  $("#lsvolon").hide();
                  $("#lsvoloff").show();
                  return false;
              });
              $("#lsvoloff").click(function () {
                  that.setVolume(0);
                  $("#lsvoloff").hide();
                  $("#lsvolon").show();
                  return false;
              });

            // Remove title attributes from player buttons      
            $('.vjs-play-control').removeAttr('title');
			$('.vjs-refresh-control').removeAttr('title');
			$('.vjs-mute-control').removeAttr('title');
			$('.vjs-playback-control').removeAttr('title');
			$('.vjs-jumppoint-control').removeAttr('title');
			$('.vjs-settings-button').removeAttr('title');
			$('.vjs-fullscreen-control').removeAttr('title');
          },
        readylistener: function () {
        	var videoPlayer = document.getElementById('flvplayer_viblast_api');
        	if(typeof videoPlayer!="undefined" && videoPlayer!=null){
        		videoPlayer.setAttribute("playsinline","");
        		videoPlayer.setAttribute("webkit-playsinline",""); 
        		videoPlayer.setAttribute('disablePictureInPicture','');
        		//videoPlayer.setAttribute('controls', '');
        	}
        	
        	var flvPlayer = document.getElementById('flvplayer');
        	if(typeof flvPlayer!="undefined" && flvPlayer!=null){
        		flvPlayer.setAttribute("playsinline","");
        		flvPlayer.setAttribute("webkit-playsinline","");
        		flvPlayer.setAttribute('disablePictureInPicture','');
        	}
        	
           
        },
        canplaylistener: function () {
           /*if (videojs.browser.IS_IOS && ) {
            	$(".vjs-fullscreen-control").hide();
           }*/
           
           if (this.options.allowFullScreen) {
                 this.showFullScreenButton();
           } else {
                 this.hideFullScreenButton();                 
           }
            	
        	if(this.isLive()){
        		   $(".vjs-live-display").html($.oViewerText.sts_live);
        	}
        	//this.options.currentPlayer.currentTime(this.options.currentTimePosition);
            $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_ready);
            if (this.isOD() && typeof this.options.callbackobj.setTotalDuration === "function") {
                this.options.callbackobj.setTotalDuration(this.options.currentPlayer.duration());
            }
            for (var key in that.arrayOfMethodsToCallWhenCanPlay) {
                //console.log(key);
                var codeToExecute = key;
                var tmpFunc = new Function(codeToExecute);
                tmpFunc();
            }
            if (!that.options.useNative) {
                this.options.currentPlayer.viblast.addEventListener("videoqualitychange", that.videoqualitychangelistener.bind(this));
                this.abrlistener();
            }
        },
        overlayJump: function (){
	    	 if (this.options.initJump) {
	    		
	    		 var jump_sec = 0; 
	    		 if(typeof isNewViewer!="undefined" && isNewViewer){	    			
	    			 jump_sec = this.options.callbackobj.getMediaOffset();
	    		 }else{
	    			 if (typeof getMediaOffset !== "undefined") {
		                 var jump_sec = getMediaOffset();
	    			 }
	    		 }
	    		 
                 //var jump_sec = getMediaOffset();
                 console.log("TPQA - jump_sec-this.options.currentPlayer.currentTime() " + (jump_sec - this.options.currentPlayer.currentTime()));
                 if (jump_sec > 0 && (jump_sec - this.options.currentPlayer.currentTime()) > 5) {
                     this.options.currentTimePosition = jump_sec;                     
                     this.setTimePosition(jump_sec);
                 }
	             
	         }
       },
       playlistener: function () {
            console.log("TPQA - playlistener");
            
            this.playinglistener();
            
            if(window.Viewer && window.Viewer.EventDispatcher !== undefined){
            	window.Viewer.EventDispatcher.trigger('PlayerController.handlePlayListener');
            }
            
            if ($("#playbuttonDiv").length > 0) {
                $("#playbuttonDiv").hide();
                $(".vjs-live-display").show();
            }

            if ((this.options.useNative || !this.isMSESupported()) && this.isLive() && !$.oMulticast.isKollectiveMulticast) {
                if (this.options.streamstatus == 1) {
                    this.options.streamstatus = 2;
                    this.options.currentPlayer.src(this.options.myURL);
                    this.options.currentPlayer.play();
                    this.options.streamstatus = 2;
                } else if (this.options.streamstatus == 2) {
                    this.options.streamstatus = 0;
                }
            }

			// new multi-language vtt system
			if ($.oViewerData.vtt_caption && $.oViewerData.vtt_caption.length > 0 && !$.oViewerData.isPreSimlive && !$.viewerAction.oActiveSecondaryMedia.active) {
				console.log("TPQA - multi-language VTT");
				// Safari
				if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
					console.log("TPQA - Safari detected, readding tracks");
					this.addcuetracks();
					this.addcuechange();
				}
				// vtt enabled but no tracks added, add them.
				if (player.textTracks().length === 0 && player.remoteTextTracks().length === 0) {
					console.log("TPQA - VTT enabled but tracks not added, adding back");
					this.addcuetracks();
					this.addcuechange();
				}
			}

			// previous vtt setup
            else if (this.options.caption_isvtt) {
            	console.log("TPQA - Previous VTT/XML setup");
            	if (player.textTracks().length === 0 && player.remoteTextTracks().length === 0 && !$.oViewerData.isPreSimlive && !$.viewerAction.oActiveSecondaryMedia.active) { // vtt enabled but no tracks added, add them
	            	console.log("TPQA - VTT enabled, adding tracks");
            		player.addRemoteTextTrack({
            			src: $.oViewerData.sContentUrl + $.oViewerData.sEventGUID + $.oViewerData.caption.odpath,
            			kind: "subtitles",
            			default: this.options.caption_isopen,
            			label: "subtitles on",
            			mode: (this.options.caption_isopen === true) ? "showing" : "disabled",
            			language: "en"
            		}, false);
            		if (this.options.isAudio && this.options.caption_isopen) { // if simlive audio event and display by default is enabled. we need to add the trackchange and cuechange events again
            			console.log("TPQA - Previous VTT/XML adding cuechange events");
            			player.textTracks().addEventListener("change", this.trackchange.bind(this));
            			var tracks = player.textTracks();
                		for (var i = 0; i < tracks.length; i++) {
                			let track = tracks[i];
                			if (track.label === "'subtitles on") {
                				track.mode = "showing";
                			}
                			let trackdata = track;
                			track.addEventListener("cuechange", () => { console.log("track.addEventListener 5"); });
            			}
            		}
            	}
            	else if (player.textTracks().length !== player.remoteTextTracks().length) { // safari iOSs
            		console.log('TPQA - ' + player.textTracks().length + ' text track / ' + player.remoteTextTracks().length + ' remote text tracks');
            		if (this.options.isAudio) {
            			player.textTracks().addEventListener("change", this.trackchange);
            		}
            	}
            }
        },
        playinglistener: function () {
        	console.log("TPQA - playinglistener");
            $("#playbuttonDiv").hide();
            $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_playing);

            $(this.getVideoIDPound()).find("#top-control-bar").addClass("dont-show-element");
            if (typeof this.options.callbackobj.setStatus === "function") {
                this.options.callbackobj.setStatus("Playing");
            }
            if (this.bufferingStartTime > 0) { this.totalBuffering += Date.now() - this.bufferingStartTime; this.bufferingStartTime = -1; }

        
            if($.oMulticast.multicastDisplay!="Ramp Multicast"){
            	this.overlayJump();
            }
            
            if($.oMulticast.isKollectiveMulticast===true) {
            	$(".vjs-loading-spinner").hide();
            }
        },
        pausedlistener: function () {
            $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_paused);
            $(this.getVideoIDPound()).find("#top-control-bar").addClass("dont-show-element");
            if (typeof this.options.callbackobj.setStatus === "function") {
                this.options.callbackobj.setStatus("Paused");
            }
            if ((this.options.useNative || !this.isMSESupported()) && this.isLive()) {
                this.options.streamstatus = 1;
            }
            if(this.options.currentPlayer.seeking()===false && $.oViewerData.playerType != "phone"){
	            if ($("#playbuttonDiv").length) {//Show the play button if the page has the playbutton div
	                $("#playbuttonDiv").show();
	            }
            }
        },
        bufferinglistener: function () {
            $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_buffering);
            $(this.getVideoIDPound()).find("#top-control-bar").removeClass("dont-show-element");
            if (typeof this.options.callbackobj.setStatus === "function") {
                this.options.callbackobj.setStatus("Buffering..");
            }
            this.bufferingStartTime = Date.now();
        },
        seekinglistener: function () {
            $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_seeking);
            $(this.getVideoIDPound()).find("#top-control-bar").removeClass("dont-show-element");
        },
        volumechangelistener: function () {
        	 if (typeof this.options.callbackobj.setMute === "function") {
             	//console.log("vol " + this.options.currentPlayer.volume());
                 this.options.callbackobj.setMute(this.options.currentPlayer.muted());
             }
            if (typeof this.options.callbackobj.setCurrentVolume === "function") {
            	//console.log("vol " + this.options.currentPlayer.volume());
                this.options.callbackobj.setCurrentVolume(this.options.currentPlayer.volume());
            }
        },
        endedlistener: function () {        	  
            if (typeof this.options.callbackobj.closeme === "function") {
                this.options.callbackobj.closeme();
                console.log("TPQA - endedlistener Current Stream has ended");
            }            
        },
        fullscreenchange: function () {
        	var fullScreenText =  $.oViewerText.alt_fullscreen;
        	if(this.options.currentPlayer.isFullscreen()){
        		fullScreenText = $.oViewerText.alt_fullscreen_exit;        		
        	}
        	$(".vjs-fullscreen-control").attr("alt", fullScreenText).attr("title", fullScreenText);
        },
        layoutchange: function(layoutId) {
        	console.log("TPQA - viblast layoutchange");
        	console.log(layoutId);
        	if (layoutId === "LAYOUT_SLIDE_ONLY") {
        		//$("#vttcaptions").css("visibility", "hidden");
        		$("#vttcaptions").css("display", "none");
        		this.options.vttActiveCaptionsArea = "vttcontentonly"
        		player.addClass("vjs-text-track-cue-hidden");
        		$(".vjs-text-track-cue-hidden").css("visibility", "hidden");
        		$(".vjs-text-track-display").css("visibility", "hidden");
        	} else if (layoutId === "LAYOUT_SLIDE_LARGE") {
        		this.options.vttActiveCaptionsArea = "vttcontentonly"
        		//$("#flvplayer_viblast_api::cue").css("visibility", "hidden");
        		$(".vjs-text-track-cue-hidden").css("visibility", "visible");
        		$(".vjs-text-track-display").css("visibility", "hidden");
        		player.removeClass("vjs-text-track-cue-hidden");
        	} else {
        		//$("#vttcontentonly").css("visibility", "hidden");
        		$("#vttcontentonly").css("display", "none");
        		//$("#flvplayer_viblast_api::cue").css("visibility", "hidden");
        		$(".vjs-text-track-cue-hidden").css("visibility", "visible");
        		$(".vjs-text-track-display").css("visibility", "visible");
        		this.options.vttActiveCaptionsArea = "vttcaptions"
        		if (this.options.isAudio === true || this.madeAudio === true) { // hide the default VTT display
        			player.removeClass("vjs-text-track-cue-hidden");
        			$(".vjs-text-track-cue-hidden").css("visibility", "hidden");
        			$(".vjs-text-track-display").css("visibility", "hidden");
        		}
        	}
        	this.trackchange();
        },
        addcuetracks: function() {
        	console.log('TPQA - Adding caption tracks');

        	var hasDefault = false;
        	for (var i = 0; i < $.oViewerData.vtt_caption.length; i++) {
        		let track = player.addRemoteTextTrack({
        			//src: $.oViewerData.sVTTUrl + $.oViewerData.sEventGUID + $.oViewerData.vtt_caption[i].filename,
        			src: $.oViewerData.sVTTUrl + $.oViewerData.vtt_caption[i].filename,
        			kind: "subtitles",
        			// setting default is causing player to select multiple tracks on load. why?
        			//default: (($.oViewerData.vtt_caption[i].isdefault === "1") ? true : false),
        			mode: (($.oViewerData.vtt_caption[i].isdefault === "1") ? "showing" : "disabled"),
        			label: $.oViewerData.vtt_caption[i].languagename,
        			language: "en"
        		}, false);
        	}
        	
        	this.addcuechange();

        	if (this.options.isAudio === true || this.madeAudio === true) { // hide the default VTT display
        		player.addClass("vjs-text-track-cue-hidden");
        	}
        },
        addcuechange: function() {
        	console.log("TPQA - Adding cuechange events");

        	let tracks = player.remoteTextTracks();
        	for (var i = 0; i < $.oViewerData.vtt_caption.length; i++) {
        		let track = tracks[i];
        		track.removeEventListener("cuechange", () => { this.cuechange(track); });
        		track.addEventListener("cuechange", () => { this.cuechange(track); });
        	}
        	
        	player.textTracks().removeEventListener("change", () => { this.trackchange(); });
        	player.textTracks().addEventListener("change", () => { this.trackchange(); });
        	
        	if (this.options.isAudio === true) { // hide the default VTT display
        		this.options.currentPlayer.addClass("vjs-text-track-cue-hidden");
        	}
        },
        cuechange: function(trackdata) {
        	if (trackdata.mode === "showing") {
        		if (this.options.vttActiveCaptionsArea === "vttcontentonly") {
        			//$("#vttcontentonly").css("visibility", "visible");
        			$("#vttcontentonly").css("display", "block");
        		} else {
        			//$("#vttcaptions").css("visibility", "visible");
        			$("#vttcaptions").css("display", "block");
        		}
				if (trackdata.activeCues.length === 0) {
					$("#" + this.options.vttActiveCaptionsArea).html("");
				} else {
					$("#" + this.options.vttActiveCaptionsArea).html(trackdata.activeCues[0].text);
				}
			}
        },
        trackchange: function() { // when the subtitle is changed
        	console.log('TPQA - trackchange');

			//if (this.options === undefined || (this.options.isAudio && this.options.caption_isopen)) {	}
			var isShowing = false;
        	var tracks = player.remoteTextTracks();
        	// need to go through the text tracks and see which one is active then force render the active cue
        	// because changing the track doesn't always trigger a cuechange event
        	for (var i = 0; i < tracks.length; i++) {
        		if (tracks[i].mode === "showing") {
        			isShowing = true;
        			if (tracks[i].activeCues !== "undefined" && tracks[i].activeCues !== null && tracks[i].activeCues.length > 0) {
        				this.cuechange(tracks[i]);
        			} else {
        				console.log('TPQA - trackchange called by activeCues.length <= 0');
        			}
        		}
        	}
        	
        	// can't think of a better way to hide the captions div
        	if (!isShowing) {
        		console.log("TPQA - captions turned off.");
        		//$("#vttcaptions").css("visibility", "hidden");
        		//$("#vttcontentonly").css("visibility", "hidden");
        		$("#vttcaptions").css("display", "none");
        		$("#vttcontentonly").css("display", "none");
        	}
        },
        timeupdatelistener: function (event) {
        	$("#playbuttonDiv").hide();
        	 if(this.options.getLiveStatusCallBack){
            	 try {
                 	if(typeof getLiveStatus==="function"){       
                 		var curTime = Math.round(this.options.currentPlayer.currentTime());
                 		if(curTime%5===0){//Call every 5 seconds..
                 			getLiveStatus(curTime);
                 		} 
                 	}
                 } catch (err) {
                     console.log("TPQA - Trouble calling getLiveStatus : " + err);
                 }
            }
            if (this.isOD()) {
                if (typeof this.options.callbackobj.setCurrentPosition === "function") {
                    this.options.callbackobj.setCurrentPosition(this.options.currentPlayer.currentTime());
                    if (this.options.ods) {
                        if ((/rv:11.0/i.test(navigator.userAgent)) || (/Edge\/1./i.test(navigator.userAgent))) {
                            this.options.callbackobj.setStatus("Playing");
                        }
                    }
                }
                
                if (!this.options.ods && this.options.currentPlayer.duration() > 1 && (this.options.currentPlayer.currentTime() >= (this.options.currentPlayer.duration() - 0.3))) {
                    $(this.getVideoIDPound()).find(".vjs-status-display").text($.oViewerText.sts_stopped);
                    if (typeof this.options.callbackobj.closeme === "function") {
                        this.options.callbackobj.closeme();
                        console.log("TPQA - timeupdatelistener Current Stream has ended");
                    }
                }
                var isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);                
                if(!this.options.ods && isSafari && $.oVideoInfo.status != "Playing") {//$.oViewerData.isIOS
			        this.options.callbackobj.setStatus("Playing");
			    }
                return;
            } 
            //Programdatetime
            try {
                if (this.options.currentPlayer.viblast) {
                    //var curProgramDateTime = this.player.viblast.currentProgramDateTime;
                    var curProgramDateTime = this.options.currentPlayer.viblast.currentProgramDateTime;
                } else {//Special call added for iOS devices
                    var curProgramDateTime = this.video.getStartDate().getTime() + this.video.currentTime * 1000;
                }
                this.curProgramDateTime = new Date(curProgramDateTime).getTime();
            } catch (err) {
                console.log("TPQA - Trouble getting Program date time: " + err);
            }
        },
        syncSlides: function () {
            counter = 0;
            curdelay = 0;
            setInterval(function () {
                try {
                    if (that.isLive() && that.curProgramDateTime != undefined && that.curProgramDateTime > 1400000000000 && (that.prevTimePosition == undefined || that.prevTimePosition < that.curProgramDateTime)) {
                        if (typeof that.options.callbackobj.onCuePoint === "function") {
                            that.options.callbackobj.onCuePoint(that.curProgramDateTime);
                        }
                        if ($("#showcap").length) {
                            var delay = Math.round(((new Date().getTime() + that.options.localtimeoffset) - that.curProgramDateTime) / 1000);//Streaming delay in seconds
                            if (that.options.ls) {
                                if (delay > 0 && delay < 50) {
                                    if (curdelay == 0) {
                                        document.getElementById("lvdelaymsg").style.display = "block";
                                    }
                                    curdelay = delay;
                                }
                                document.getElementById("showcap").innerHTML = curdelay;
                            } else {
                                document.getElementById("showcap").innerHTML = delay + " / " + new Date(that.curProgramDateTime);
                            }
                        }
                        that.prevTimePosition = that.curProgramDateTime;
                     

                    }
                } catch (e) {
                    console.log("TPQA - syncSlides() error : " + e);
                }

            }, 3000);

        },
        abrlistener: function () {
        	if(this.madeAudio){
        		return;
        	}
            var abrQualities = [];
            var getQualityDisplay = bw=>{
            	bw = bw / 1000;
            	if (this.isLive()){
            		if (bw <= 830) {
				   		return "270p";
				   	}
				   	if (bw <= 1080) {
				   		return "480p";
				   	}
				   	if (bw <= 1980) {
				   		return "720p";
				   	}
            	}else{
            		if (bw <= 300) {
				   		return "180p"
				   	}
				   	if (bw <= 600) {
				   		return "270p";
				   	}
				   	if (bw <= 1000) {
				   		return "480p";
				   	}
				   	if (bw <= 1900) {
				   		return "720p";
				   	}
            	}
			   	return "1080p";
            }
            
             try {
                abrQualities = this.options.currentPlayer.viblast.video.qualities;
            } catch (e) { }
            if (abrQualities.length > 1) {
                $(".vjs-abr-control").show();
                //console.log(abrQualities);
                var options = $("#abr-select");
                var $selectedBitRate = $('#abr-select option:selected');
                //var abrQuality = this.player.viblast.video.quality;
                options.empty();
                options.append($("<option />").val("Auto").text($.oViewerText.player_abr_auto));
                try {
                    $.each(abrQualities, function (index) {
                        options.append($("<option />").val(index).text(getQualityDisplay(abrQualities[index].bandwidth)));
                    });
                } catch (e) {
                    console.log("TPQA - Error adding speeds to dropdown");
                }
                
                if($selectedBitRate.length > 0){
                    var selected = $selectedBitRate.val(); 
                    options.val($selectedBitRate.val()).change();
                }
                
                $("#abr-select").change(function () {
                    var value = $("#abr-select").val();
                    if (value == "Auto") {
                        that.options.currentPlayer.viblast.abr = true;
                        //console.log("ABR is now Auto");
                    } else {
                        //that.player.viblast.video.quality = that.player.viblast.video.qualities[value];
                        that.options.currentPlayer.viblast.video.quality = that.options.currentPlayer.viblast.video.qualities[value];
                    }
                    if (typeof $.viewerControls !== "undefined") {
                        $.viewerControls.dopostsettingmenu();
                    }

                });

            }
        },
        videoqualitychangelistener: function () {
            try {
                console.log("TPQA - Current bandwidth " + that.options.currentPlayer.viblast.cdnBandwidth + " kbps, ABR set to " + that.options.currentPlayer.viblast.video.quality.bandwidth / 1000 + " kbps");
            } catch (e) { }

        },
        getFilename: function () {
            return this.options.myeventid;
        },
        isLive: function () {
            return !this.options.isOD;
        },
        isOD: function () {
            return this.options.isOD;
        },
        destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        },
        setLiveTitle: function (title) {
            $(".vjs-live-display").attr("title", title);
        },
        closeHiveSession: function (title) {
            this.options.currentPlayer.closeHiveSession();
        },
        loadHivePlugin: function () {
            var hiveTechOrder = Array();
            hiveTechOrder.push("HiveJava");
            if ($.oMulticast.enableHiveJS) {
                hiveTechOrder.push("HiveJS");
            }
            hiveTechOrder.push("StatsJS");
            var hiveOptions = {
                debugLevel: 'error',
                hiveTechOrder: hiveTechOrder,
                HiveJS: {                 
                    renderStatsCallback: window.hiveRenderStatsCallback
                }
            };
           if(document.domain.toLowerCase().endsWith("webcasts.cn")){
           		 hiveOptions.manifestDomainMatcher=/(?:[\w\-]+\.)+(?:gm|cn|tp)webcasts.cn/; 
            }
            player.hive(hiveOptions);
        },
        initHiveTicket: function (streamSrc) {
            //console.log("Hive Ticket:" + streamSrc);
            that.options.currentPlayer.initSession(
                streamSrc,
                function (manifest, session) {
                    console.log('Hive Session initialized', session);
                    var sessionType = session.tech;
                    if (!$.oMulticast.isHiveFallback && sessionType == "StatsJS") {
                        $.viewerNONEPlayer.init();
                        $.viewerAction.hideLobby();
                        return;
                    } else {
                    	if(document.domain.toLowerCase().endsWith("webcasts.cn")){
                    	 	let arrDomain = document.domain.toLowerCase().match(/\.(?:gm|cn|tp)webcasts.cn/); 
	        			 	if(Array.isArray(arrDomain)){
    	        				manifest=manifest.replace(".webcasts.com",arrDomain[0]);
    	        			}
    	        		}
                        that.options.myURL = manifest;
                        that.options.currentPlayer.src({
                            type: "application/x-mpegURL",
                            src: manifest
                        });
                    }
                    if (typeof $.oMulticast.callback != "undefined") {
                        $.oMulticast.callback(sessionType);
                    }
                    if (typeof $.multicastTools != "undefined") {
                        $.multicastTools.updateMulticastDisplay($.multicastTools.multicastTypes[sessionType.toUpperCase()]);
                    }
                },
                function (error) {
                	var message = error.message + ":" + error.detailedMessage + ":" + error.ticketUrl;
                	console.log('TPQA - Error : Hive Session initialized failed : ', message);
                	if(typeof $.activePlayer === "undefined"){
                		return;
                	}
                    if (!$.oMulticast.isHiveFallback) {
                     	if(typeof $.viewerAction != "undefined" && $.viewerAction.oActiveSecondaryMedia.active){
							//Its overlay, nothing can be done to main player.	
							return;	    		
		    			}
                        $.viewerNONEPlayer.init();
                        $.viewerAction.hideLobby();
                    } else {
                        $.oMulticast.useMulticastFallback = true;
                        $.oMulticast.isHiveMulticast = false;
                       	if(typeof $.viewerAction != "undefined" && $.viewerAction.oActiveSecondaryMedia.active && $.viewerAction.oActiveSecondaryMedia.bInline){
							//Its an inline overlay
							$.activePlayer.switchVideoOverlay();   		
		    			}else{
		    				$.activePlayer.switchVideo();
		    			}
                        $.viewerControls.logMedia("media",$.oViewerData.playerType);
                        $.viewerAction.serverLog("multicast.log","Hive Ticket Failure:" + message,"crit","jquery.ui.viblastprototype.js","initHiveTicket");
                    }
                }
            );
        },
        loadKollectivePlugin: function () {
            const KSDK = window.ksdk.forViblastVideoJS(that.options.currentPlayer);
            //console.log(contentToken , KSDK);
    		KSDK.addEventListener('KsdkError', event => {
				console.log(`Error:`, event);
				 if (!$.oMulticast.isKollectiveFallback) {
                     $.viewerNONEPlayer.init();
                     $.viewerAction.hideLobby();
                 }
                  if (typeof $.viewerControls!= "undefined") {
                  	$.viewerControls.logMedia("media",$.oViewerData.playerType);
                 }
			});
			KSDK.addEventListener('ConnectionStatusEvent', event => {
				console.log(`ConnectionStatusEvent:`, event);
			});
			KSDK.addEventListener('WebsocketConnect', event => {
				console.log(`WebsocketConnect:`, event);
			});
			KSDK.addEventListener('SourcesReady', event => {
				console.log(`SourcesReady:`, event);
				console.log('Kollective SDK emitted SourcesReady, meaning we can go ahead and set the source and begin playback', event);
				that.setStreamSrc(that.options.myURL);
				 if (typeof $.multicastTools != "undefined") {
                    $.multicastTools.updateMulticastDisplay($.multicastTools.multicastTypes["KOLLECTIVE"]);
                 }
			});
			KSDK.addEventListener('playerEvent', event => {
				console.log('ksdk.playerEvent:', event);
			});
			KSDK.load({contentToken:$.oMulticast.kollectiveToken,setSource:false,playlistType:'EVENT',userToken:( $.oViewerData.ui || '00000000-0000-0000-0000-000000000000')});
			
        }
            
    });
})(jQuery);
//Required for IE11 and new Viblast
try{
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position) {
			position = position || 0;
			return this.indexOf(searchString, position) === position;
		};
	}
}catch(e){console.log(e);}