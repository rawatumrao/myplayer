<%@ page import="tcorej.*"%>
<%@ page import="java.util.*"%>
<%@ page import="org.apache.commons.text.StringEscapeUtils"%>
<%@ include file="/viewer/include/globalinclude.jsp"%>
<%
	String sVideoHeight =  StringTools.n2s(request.getParameter("h"));
	String sTemplatePath = "";
	String sVideoWidth = StringTools.n2s(request.getParameter("w"));
	String codetag = StringTools.n2s(request.getParameter("codetag"));
	String sBranding_highlight = StringTools.n2s(request.getParameter("bh"));
	String mode = StringTools.n2s(request.getParameter("mode"));
	boolean isOverlayLive = false;
	if ("live".equals(StringTools.n2s(request.getParameter("sSecondaryMediaMode")))) {
		isOverlayLive = true;
	}
	String sSimLive = StringTools.n2s(request.getParameter("simlive"));
	boolean isOD = (mode.equals("od") || (mode.equals("ondemand"))) ? true : false;
	boolean isQa = StringTools.n2b(request.getParameter("isQa"));
	boolean disable_od_seek = StringTools.n2b(request.getParameter("disable_od_seek"));
	boolean isSimlive = "true".equals(sSimLive);

	if (Constants.EMPTY.equals(sVideoWidth)) {
		sVideoWidth = "320";
	}
	
	if (Constants.EMPTY.equals(sVideoHeight)) {
		sVideoHeight = "240";
	}
    
	String userAgent = request.getHeader("user-agent").toLowerCase();
	boolean bIE11 = userAgent.contains("windows nt 6.1") && userAgent.contains("rv:");
	boolean isIOS = (userAgent.indexOf("iphone") != -1 || userAgent.indexOf("ipad") != -1);
	boolean isHLS = ((userAgent.indexOf("chrome") != -1 && userAgent.indexOf("android") != -1) || userAgent.indexOf("blackberry") != -1 || userAgent.indexOf("bb10;") != -1 || userAgent.indexOf("playbook") != -1);
	boolean isIPhone = userAgent.indexOf("iphone") != -1;
	boolean isHTML5 = StringTools.n2b(request.getParameter("ishtml5player"));
    
	if (isHLS) {
		isIOS = true; // Use same logic as ios stream...
	}
    
	String cacheUrl = Constants.EMPTY; 
    
	if (!isOverlayLive) {
		Configurator globalConfig = Configurator.getInstance(Constants.ConfigFile.GLOBAL);
		cacheUrl = globalConfig.get(Constants.CACHE_BASE_URL);     
	}

	String sEventId =  StringTools.n2s(request.getParameter("ei"));
	Event event =  Event.getInstance(StringTools.n2i(sEventId));
	HashMap<String, String> hmAllPlayerText = event.getAllPlayerText();
    
	boolean displayAnsweredQA = StringTools.n2b(request.getParameter("qa_ans"));
	String qaTabTitle = StringTools.n2s(request.getParameter("qa_title"));
	String sViblast = event.getProperty(EventProps.viblast_folder);
	String sVideojs = "videojs";
    
	if (!bIE11) {
		sVideojs = event.getProperty(EventProps.videojs_folder);
	}

	String sMode = event.getStatus(EventStatus.mode).getValue();
	boolean isLive = sMode.equals("live") || sMode.equals("prelive");
	boolean isRampCache = event.isRampCache() && isLive;
	boolean isRampMulticast = event.isRampMulticast() && isLive;    
	boolean isHiveMulticast = event.isHiveMulticast() && (event.hasSimLiveSchedule() || isLive);
	boolean isKollectiveMulticast = event.isKollectiveMulticast() && isLive;
	boolean bVideoJSOnly = event.isVideoJSOnly();
	boolean isAdaptiveBitrateEnabled = true; // Some will be some will not be, not based on event ABR setting..
	String sPlayer_customcss = event.getBranding().getPlayer_customcss();
	
	if (!Constants.EMPTY.equals(sPlayer_customcss) && sPlayer_customcss.indexOf("__MODERNLAYOUT__") > -1) {
		String sReplace = "</style><link href=\"" + sTemplatePath + "style/modernlayout.css?" + codetag + "\" rel=\"stylesheet\" type=\"text/css\" /><style>"; 
		sPlayer_customcss = sPlayer_customcss.replaceAll("__MODERNLAYOUT__",sReplace);
	}
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="robots" content="none" />
<link href="<%=sTemplatePath%>style/jquery-ui.css?<%=codetag%>" rel="stylesheet" type="text/css" />
<link href="<%=sTemplatePath%>style/player.css?<%=codetag%>" rel="stylesheet" type="text/css" />
<style>
	/********************/
	/* Responsive Code  */
	/********************/
	@media only screen and (max-width: 639px) { 
		.small-player, #playbuttonDiv{
			width: 100vw !important;
		}
	}
	
	@media only screen and (max-height: 500px) {
		#player, #flvplayer{
			height: 100vh !important;
			width: 100% !important;
		}
		
		#eventexit{
			display: none !important;
		}
	}
</style>
<link href="/include/<%=sVideojs%>/video-js.min.css?<%=codetag%>" rel="stylesheet" type="text/css" />
<link href="/include/talkpoint.css?<%=codetag %>" rel="stylesheet" type="text/css" />
<jsp:include page="branding.jsp">
	<jsp:param name="sBranding_highlight" value="<%=sBranding_highlight%>"/>
	<jsp:param name="sBackground_content" value=""/>
	<jsp:param name="sBackground_image" value=""/>
	<jsp:param name="sBackground_color" value="transparent"/>
	<jsp:param name="sPlayer_customcss" value="<%=sPlayer_customcss%>"/>
	<jsp:param name="sReg_customcss" value=""/>
	<jsp:param name="sReg_templatecss" value=""/>
	<jsp:param name="sPlayer_templatecss" value=""/>
</jsp:include>
<style type="text/css">
	body: {
		margin: 0px;
		padding: 0px;
		background-color: transparent
	}
	<% if(isIPhone) { %>
		video::-webkit-media-controls {
			display:none !important;
		}
	<% } %>
</style>
</head>
<body>
<div id="viewer" class="ui-widget">
	<% if(isOD && !disable_od_seek && !isSimlive) { %>
		<ul class="right ui-widget ui-helper-clearfix" id="eventexit">
			<li id="exitImg" title="Exit Overaly Button" tabindex="0" class="ui-state-default ui-corner-all"> <a href="#" onclick="return false"><span class="ui-icon ui-icon-closethick" id="close"></span></a> </li>
		</ul>
	<% } %>
	<div class="clear"></div>
	<div id="viewer_video" class="popupVideo" class="left">
		<div id="player" style="height:<%=sVideoHeight%>px;width:<%=sVideoWidth%>px;" class="ui-corner-tl ui-corner-tr">
			<div id="flvplayer"></div>
			<div id="playbuttonDiv" style="height:<%=StringTools.n2I(sVideoHeight)-30%>px;width:<%=sVideoWidth%>px;position:absolute;display:flex;justify-content:center;align-items:center;left:0px;top:0px;z-index:10;">
				<span><img src="<%=sTemplatePath%>style/images/playbutton-large.png" name="playbutton" id="playbutton" style="display:block;margin:auto;width:25%;" title="<%=StringEscapeUtils.escapeHtml4(hmAllPlayerText.get("alt_play"))%>" alt="<%=StringEscapeUtils.escapeHtml4(hmAllPlayerText.get("alt_play"))%>"/></span>
			</div>
			<% if (isKollectiveMulticast) { %>
				<div id="streamProgressDiv">
					<div id="streamProgress">
						<div id="streamSuccess"></div>
						<div id="progressText">Loading Stream <span id="streampercent">5 %</span></div>
					</div>
				</div>
			<% } %>
		</div>
		<% if (event.isOpenCaptionsInViewerEnabled() && !isSimlive && isOD) { %>
			<div id="caption" class="transcript_caption_overlay ui-corner-bl ui-corner-br ui-widget-header" style="display:none">
	    		<span id="transcript_txt_overlay" class="transcript_txt"></span>
	    	</div>
	    <% } %>       

	    <% if(isQa) { %>
	    	<div id="divQaAccordion" class="ui-accordion ui-widget" style="display:none">
	    		<h3 class="accordianiframeheader" id="reviewqa" tabindex="0">
	    			<a href="#"><%=StringEscapeUtils.escapeHtml4(hmAllPlayerText.get("tab_ask_question"))%></a>
	    		</h3>
	    		<div class="accordian_div">
	    			<iframe class="accordian_iframe" name="reviewqa_frame" id="reviewqa_frame" frameborder="0" src="javascript:'';"></iframe>
	    		</div>
	    	</div>
		<% } %>   
	</div>
	<div class="clear"></div>
</div>
<jsp:include page="footerTop.jsp"/>

<% if (isIOS) { %>
	<script type="text/javascript" src="/viewer/include/jquery.ui.touch-punch.js?<%=codetag%>"></script>
<% } %>

<script src="/include/<%=sVideojs%>/video.min.js?<%=codetag %>"></script>
<script type="application/json" src="/include/<%=sVideojs%>/video.min.js.map?<%=codetag %>"></script>

<% if (!bVideoJSOnly) { %>
	<% if (isHiveMulticast) { %>
		<script type="text/javascript" src="/include/hive/hivejs.interceptor.v8.js?<%=codetag%>"></script>
	<% } %>
	
	<script type="text/javascript" src="/include/<%=sViblast%>/viblast.js?<%=codetag %>"></script>
	
	<% if (isHiveMulticast) { %>
		<script src="/include/hive/talkpoint2.java.hivejs.hive.min.js?<%=codetag%>"></script>
		<script type="text/javascript" src="/include/hive/renderStats.js?<%=codetag%>"></script> 
	<% } %>
	
	<script type="text/javascript" src="/js/jquery/jquery.ui.viblastprototype.js?<%=codetag %>"></script>

	<% if (isHiveMulticast || isKollectiveMulticast) { %>
		<script type="text/javascript" src="/js/multicastTools.js?<%=codetag%>"></script>
	<% } %>
	
	<% if (isKollectiveMulticast) { %>
		<script src="https://cdn.kollective.app/sdk/ksdk-latest.min.js" defer></script>
	<% } %>

<% } else { %>
	<script type="text/javascript" src="/js/jquery/jquery.ui.videojs.js?<%=codetag %>"></script>
	<script type="text/javascript" src="/include/videojs_plugins/videojs-contrib-quality-levels.min.js?<%=codetag %>"></script>
<% } %>

<script type="text/javascript" src="/viewer/include/viewerAccordion.js?<%=codetag%>"></script>
<script type="text/javascript" src="/viewer/include/viewerQA.js?<%=codetag%>"></script>
<script type="text/javascript">
	var jumpTo = 0;
	var playerType = "";
	var enableHiveJS = parent.enableHiveJS;
	var overlay_mediatype = "ondemand";
	var ss_posttext = "";
	var localClientUrl = parent.localClientUrl;
	
	<% if (isOverlayLive) { %>
		var overlay_mediatype = "live";
		ss_posttext = "_ss";
	<% } %>
	
	var bPlayClicked = false;
	var pageloadTime =  Math.round(new Date().getTime());
	
	$(document).ready(function(){
		$.oViewerMsg = parent.$.oViewerMsg;
		$.oViewerData = parent.$.oViewerData;
		$.oMulticast = parent.$.oMulticast;
		$.oMulticast.multicastDisplay = "";
		$.oViewerText = parent.$.oViewerText;
		$.oVideoInfo = {"status":"","currentVolume":parent.$.oVideoInfo.currentVolume,"currentPosition":0,"totalDuration":0,"lastaction":"","lastHSaction":"","connType":parent.$.oVideoInfo.connType,"odSliderOn":false,"playerMsgType":"","odSlider":{"status":0,"pos":0}};
		$.oActiveSecondaryMedia = parent.$.viewerAction.oActiveSecondaryMedia;
		$.viewerTime.oTs = parent.$.viewerTime.oTs;
		$.iScriptDelay = parent.$.viewerAction.iScriptDelay;
		$.bRefreshClicked = false;
		$.bIPhonePlayClicked = false;
		$.isIPhone = <%= isIPhone %>;
		$.bOverlayEnded = false;
		$.initialPlayClick = true;

		// Added for hive error function in viblastprototype..
		$.viewerAction = {"oActiveSecondaryMedia":{"active":true,"bInline":false}};
		$("#controls").hide();
		$.activePlayer = $.viewerHTML5Player;
		playerType = "html5";
		$("#playbuttonDiv").click(function() {
			$.activePlayer.play();

			<% if (!isOverlayLive) { %>
				if (!$.oViewerData.isOD || $.oViewerData.isSimlive) {
					jumpTo = Math.round(getMediaOffset());
					//alert("jumpTo" + jumpTo + "$.oActiveSecondaryMedia.oMovie.duration" + $.oActiveSecondaryMedia.oMovie.duration);
					if (jumpTo > $.oActiveSecondaryMedia.oMovie.duration) {
						closeme();
					}
				}
			<% } %>
			
			$("#playbuttonDiv").hide();
			bPlayClicked = true;
		});

		<% if (!isOverlayLive) { %>
			if (!$.oViewerData.isOD || $.oViewerData.isSimlive) {
				jumpTo = Math.round(getMediaOffset());
				setTimeout("checkPlaying()",($.oActiveSecondaryMedia.oMovie.duration - jumpTo) * 1000);
			}
		<% } %>

		$.activePlayer.init();

		<% if (isQa) { %>
			$.viewerQA.init();
			$("#divQaAccordion").viewerAccordion();
			setTimeout("$('#divQaAccordion').show()", 1000);
			//$("#divQaAccordion>h3:first").trigger("click");
		<% } %>
		
		log("jumpTo "  + jumpTo);
		$(window).unload(doUnload);
		
		try {
			// accessibility focus and add tabs to video player
			setTimeout(function() {
				// focus on video play button if tp_special param isn't 15
				if ($.oViewerData.tp_special !== 15) {
					$('.vjs-play-control').focus();	
				}
				 
				if ($('#close').length) {
					//On last tab go back to first tab in this popup window
					tabNext($('#close'), $('.vjs-play-control'));
					
					// on enter close overlay
					$("#close").on('keyup', function(w) {
						if (w.keyCode == 13) {
							try {
								parent.$('.vjs-play-control').focus();
								$(this).click();
							} catch(err) {
								console.log(err);
							}
						}
					});
				}
				
				if ($('#divQaAccordion').length) {
					tabNext($('#reviewqa a'), $('#exitImg'));
					
					// onclick questions sections
					$('#reviewqa a').on('click', function() {
						if ($('#reviewqa').hasClass('ui-state-active') === true) {
							tabNext($('.accordianiframeheader a'), $('#exitImg'));	
						} else {
							$("#reviewqa a").off("keydown");
							setTimeout(function() {
								tabNext($('#reviewqa_frame').contents().find('#total_questions'), parent.$('#secondarymedia').contents().find('#exitImg'));
								$('#reviewqa_frame').contents().on('click', '#total_questions', function() {
									if ($('#reviewqa_frame').contents().find('#answeredHeader').hasClass('arrowOpened') === true) {
										$('#reviewqa_frame').contents().find('#total_questions').off('keydown');
										tabNext($('#reviewqa_frame').contents().find('#answerContainer'), parent.$('#secondarymedia').contents().find('#exitImg'));
									} else {
										tabNext($('#reviewqa_frame').contents().find('#total_questions'), parent.$('#secondarymedia').contents().find('#exitImg'));
									}
								});
							}, 1000);
						}
					});
				} else {
					if (!$('#close').length) {
						tabNext($('.vjs-fullscreen-control'), $('.vjs-play-control'));
					}
				}
			}, 3000);
			
			function tabNext($current, $next) {
				$current.on('keydown', function(e) {
					if (e.keyCode == 9) {
						e.preventDefault(); 
						try {
							$next.focus();
						} catch(err) {
							console.log(err);
						}
					}
				});
			}
		} catch(err) {
			console.log('accessibility functions failed');
		}
		
		// captions
		if ($.oViewerData.captionsVisible && $.oViewerData.transcriptEnabled && !$.oViewerData.isSimlive && $.oViewerData.isOD) {
			document.getElementsByClassName('transcript_caption_overlay')[0].classList.add('showOverlayCatptions');
			$('#transcript_txt_overlay').html(parent.$('#transcript_txt').html());
			
			setInterval(function() {
				if (document.getElementById('transcript_txt_overlay') && $('.transcript_txt').text() !== "") {
					var time = parent.$.viewerAction.oActiveSecondaryMedia.sMovieTs + $.oVideoInfo.currentPosition;
					var currTime = findLatest((time+1), parent.transcript.responseJSON.timesArr);
					var	prevTime = document.getElementsByClassName('captionsHighlightOverlay')[0] ? parseFloat(document.getElementsByClassName('captionsHighlightOverlay')[0].id) : 0;
					if (document.getElementsByClassName('captionsHighlightOverlay')[0]) {
						document.getElementsByClassName('captionsHighlightOverlay')[0].classList.remove('captionsHighlightOverlay');	
					}
					
					document.getElementsByClassName(currTime)[0].className += ' captionsHighlightOverlay';
					
					if (currTime !== -1) {
						if (currTime !== prevTime) {
							try {
								document.getElementsByClassName('transcript_caption_overlay')[0].scrollTop = document.getElementsByClassName('captionsHighlightOverlay')[0].offsetTop - $('#viewer_video').height() + 15;
							} catch(err) {
									// no parentNode
							}
						}
					}
				}			
			}, 1000);
			
			function findLatest(time, arrEvents) {
				var previndex = 0;
				for (timings in arrEvents) {
					if (time < arrEvents[timings]) {
						break;
					}
					previndex = timings;
				}
				return arrEvents[previndex];
			}
		}
	});

	$(window).on("resize",function() {
		// Resize the overlay video play button on a windows resize
		try {
			$("#playbutton").hide();
			setTimeout(function () {
				var pbdh = ($("#player").height()) - 30;
				var pbdw = $("#player").width();
				$("#playbuttonDiv").css({"height":pbdh,"width":pbdw});
				$("#playbutton").show();
				//console.log("TPQA - resizing playbuttondiv wxh is: " + pbdw + "x" + pbdh);
			},2000);
		} catch (err) {
			console.log("TPQA - Error resizing playbuttondiv: " + err);
		}
	});
	
	function doUnload() {
		clearInterval($.statusTimer);
	}
	
	var bOffsetSet = false;
	
	function getMediaOffset() {
		if ($.oViewerData.isOD) {
			if (!$.oViewerData.isSimlive && bOffsetSet) {
				// Not simlive and ont first time od we wil not jump every time play is called.
				return 0;
			}
			var curTime = parent.$.oVideoInfo.currentPosition;
			var offset = (curTime - $.oActiveSecondaryMedia.sMovieTs) + (Math.round(new Date().getTime()) - pageloadTime) / 1000;
		} else {
			var curTime = $.viewerTime.getCurMediaTime();
			var offset = (curTime-$.oActiveSecondaryMedia.sMovieTs) / 1000;
			offset = (offset > 20) ? (offset - 10) :0;
		}
		offset = Math.round(offset);
		log("curTime " + curTime + " $.oActiveSecondaryMedia.sMovieTs " + $.oActiveSecondaryMedia.sMovieTs + " offset " + offset +  " $.oActiveSecondaryMedia.oMovie.duration " + $.oActiveSecondaryMedia.oMovie.duration);
		var notIOS = true;
		
		if ((($.oActiveSecondaryMedia.oMovie.duration - offset) < 15) && (notIOS || $.oViewerData.isOD)) {
			offset=$.oActiveSecondaryMedia.oMovie.duration - 15;
		}
		log("getMediaOffset returning offset.." + offset);
		bOffsetSet = true;
		return offset;
	}
	
	function checkPlaying() {
		log("checkPlaying called will close if not playing.");
		if ($.oVideoInfo.status != "Playing") {
			closeme();
		}
	}
	
	function setCurrentPosition(seconds) {
		$.oVideoInfo.currentPosition = seconds;
	}
	
	function setTotalDuration(seconds) {
		$.oVideoInfo.totalDuration = seconds;
	}
	
	function setCurrentVolume(volume_value) {
		if ($.oViewerData.tp_player==1) {
			return;	 
		}
		parent.$.activePlayer.setVolume(volume_value);
	}
	
	function setMute(bMute) {
		if ($.oViewerData.tp_player == 1) {
			return;	 
		}
		parent.$.activePlayer.setMute(bMute);
	}
	
	function setStatus(txtstatus) {
		$.oVideoInfo.status = txtstatus;
	}
	
	function closeme() {
		log("secondarymedia closeme called");
		if (playerType == "html5") {
			var isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.fullscreenElement || document.msFullscreenElement;
			
			if (isFullScreen) {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
			
			if ($.oMulticast.isHiveMulticast) {
				$.activePlayer.closeHiveSession(); 
			}
			
			<% if (!isIPhone) { %>
				$("#player").data("ui-viblastprototype").dispose();
				//$("#player").data("ui-viblastprototype").destroy(); 
				console.log("TPQA - Viblast player is being disposed and destroyed");
			<% } %>
			
			setTimeout("closeme2()", 3000);
		} else {
			closeme2();
		}
	}

	function closeme2() {
		<% if (isIPhone) { %>
			if(playerType == "html5"){
				$("#flvplayer_html5_api")[0].webkitExitFullscreen(); 
			} else {
				$("#flvplayer")[0].webkitExitFullScreen();
			}
		<% } %>
		parent.$.viewerAction.secondaryMediaClosed = true;
		parent.$.viewerAction.closeSecondaryMedia();
	}
	
	function log(logtxt) {
		if (typeof console == "object") {
			console.log(logtxt);
		}
	}
	
	function loadIOSPlayer(pathinfo) {
		alert("loadIOSPlayer called , pathinfo " + pathinfo);	   		
	}
    
	(function($) {
		$.extend({
			activePlayer : null,
			oViewerData : {},
			oViewerMsg : {},
			oVideoInfo : {},
			isOverlayLive : <%=isOverlayLive%>,
			isLive: <%=mode.equals("live")%>,
			
			viewerTime: {
				oTs: {"cuePoint": {"server": 0, "local": 0}, "serverTs": {"server": 0,"local": 0}},
				setTime: function(ts_type, ts) {
					this.oTs[ts_type].server = parseInt(ts, 10);
					this.oTs[ts_type].local = Math.round(new Date().getTime());
				},
				getTime: function(ts_type) {
					return this.oTs[ts_type];
				},
				getCurMediaTime:function() {
					var ts_type = "cuePoint";
					var server_ts = this.oTs[ts_type].server;
					
					if (server_ts == 0 || $.oViewerData.playerType=="phone") {
						ts_type = "serverTs";
					}
					server_ts = this.oTs[ts_type].server + (Math.round(new Date().getTime()) - this.oTs[ts_type].local);
					
					if (playerType=="ios") {
						server_ts = server_ts - ($.iScriptDelay);
					}
					
					return server_ts;
				}
			},
			
			viewerPlayer: {
				init: function() {
					$.oViewerData.playerType = "phone";
					$.viewerControls.playerMsg("noFlashUnicast");
					$("#playbuttonDiv").hide();
					$.viewerControls.logMedia("media","none"); // We will use phoneshow code but log as none for reference..
					$.activePlayer.dispose();
				}
			},
			
			viewerHTML5Player: {
				init: function() {
					var playerType = "html5";
					var that = this;
					
					that.html5widget = $("#player").data("ui-viblastprototype");
					that.arrayOfMethodsToCall["$('#viewer_video').addClass('padding-top-for-theo-secondarymedia')"] = 1;
					that.arrayOfMethodsToCall["$.viewerControls.init()"] = 1;
					
					//controls
					<%if (isOD && !isSimlive) { %>
						//that.arrayOfMethodsToCall["that.hideRefresh()"] = 1;
					<% } else { %>
						//that.arrayOfMethodsToCall["that.hideRefresh()"] = 1;
						that.arrayOfMethodsToCall["that.showStatus()"] = 1;
						that.arrayOfMethodsToCall["that.showVolume()"] = 1;
						that.arrayOfMethodsToCall["$('.vjs-time-control, .vjs-time-divider').hide();"] = 1;
					<% } %>
					that.arrayOfMethodsToCall["$('#playbuttonDiv').css('zIndex','10')"] = 1;
					parent.$.viewerAction.getPlayerPath(playerType + ss_posttext, overlay_mediatype, $.oActiveSecondaryMedia.oMovie.filename, function(pathinfo) {
						var volume = 0.5;
						if ($.oViewerData.tp_player == 1) {
							volume = 0;
						} else {
							try {
								volume = parent.$.oVideoInfo.currentVolume;
								if (parent.$.oVideoInfo.muted) {
									volume = 0;
								}
							} catch(err) { }
						}
						pathinfo.overlay_mediatype = "ondemand";
						
						<% if (isOverlayLive) { %>
							pathinfo.overlay_mediatype = "live";
						<% } %>
						
						var conInfo = parent.$.activePlayer.getConInfo(pathinfo);        		 
						if ($.oMulticast.isHiveMulticast) {
							$.oMulticast.multicastDisplay = "";
							hiveStatsWindow = parent.hiveStatsWindow;
						}
						
						var allowFullScreen = true;
						
						if ($.oViewerData.isIOS) {
							allowFullScreen = !$.oViewerData.isTypeLiveOrSimlive;
						}
						
						var showPlaybackSpeed = !$.oViewerData.isTypeLiveOrSimlive && !$.oViewerData.disable_od_seek;
						
						$("#player").viblastprototype({
							myURL: conInfo.streamPath,
							mywidth: <%=sVideoWidth%>,
							myheight: <%=sVideoHeight%>,
							myeventid: $.oViewerData.sEventId,
							allowFullScreen: allowFullScreen,
							initJump: <%=!isOverlayLive%>,
							useNative: false,
							isOD: <%=!isOverlayLive%>,
							positionSlider: <%=(isOD && !disable_od_seek)%>,
							playerName: "flvplayer",
							arrayOfMethodsToCall: that.arrayOfMethodsToCall,
							volume: volume,
							multicastConfig: $.oMulticast,
							reportStats: false,
							playeroffset: false,
							showPlaybackSpeed: showPlaybackSpeed
						});
						
						that.html5widget = $("#player").data("ui-viblastprototype");
						
						<% if (!isIOS) { %>
							that.html5widget.play();
						<% } %>
					});
				},

				// What does this comment reference? -Felicia
				// Using parent.$.activePlayer.getConInfo, left here for reference for this release.
				
				getConInfo: function(pathinfo) {
					var obj = {};
					obj = pathinfo;
					var token = (pathinfo.token == undefined ? "" : (pathinfo.encodetoken ? encodeURIComponent(pathinfo.token) : pathinfo.token));     
					
					<% if(isOverlayLive) { %>
						obj.url = pathinfo.protocol +pathinfo.hostname + "/" +pathinfo.appid  + "/" + $.oActiveSecondaryMedia.oMovie.filename + "/playlist.m3u8?t=" + token;		        	
					<% } else { %>
						obj.url = pathinfo.protocol + pathinfo.hostname + "/" + pathinfo.appid;
						if ($.oActiveSecondaryMedia.oMovie.is_abr) {
							obj.url += "/smil:" + $.oActiveSecondaryMedia.oMovie.smilpath + "/playlist.m3u8?t=" + token;
						} else {
							obj.url += "/mp4:" + $.oActiveSecondaryMedia.oMovie.filename + "/playlist.m3u8?t=" + token;
						}
					<% } %>
					
					if (pathinfo.fullstreampath != undefined) {
						obj.url = pathinfo.fullstreampath;
					}
					
					obj.unicastpath = typeof pathinfo.unicastpath != "undefined" ? pathinfo.unicastpath : obj.url;
					
					if (typeof pathinfo.fallbackserver != "undefined") {
						obj.fallbackserver = pathinfo.fallbackserver;
					}
					
					// China
					if (document.domain.toLowerCase().endsWith("webcasts.cn")) {
						let arrDomain = document.domain.toLowerCase().match(/\.(?:gm|cn|tp)webcasts.cn/); 
						if (Array.isArray(arrDomain)) {
							obj.url = obj.url.replace(".webcasts.com", arrDomain[0]);
							if (obj.unicastpath!=undefined) {
								obj.unicastpath = obj.unicastpath.replace(".webcasts.com", arrDomain[0]);
							}
							if (obj.fallbackserver != undefined) {
								obj.fallbackserver = obj.fallbackserver.replace(".webcasts.com", arrDomain[0]);
							}
						}
					}
					return obj;
				},
				
				pause: function() {
					this.html5widget.pause();
				},
				
				play: function() {
					this.html5widget.play();
				},
				
				stop: function() {
					this.html5widget.pause();
				},
				
				setPosition : function (seconds) {
					this.html5widget.setTimePosition(seconds);
				},
				
				setVolume: function(vol) {
					this.html5widget.setVolume(parseInt(vol, 10) / 100);
				},
				
				closeHiveSession:function() {
					this.html5widget.closeHiveSession();
				},
				
				switchVideo: function() {
					var that = this;
					parent.$.viewerAction.getPlayerPath(playerType + ss_posttext,overlay_mediatype,$.oActiveSecondaryMedia.oMovie.filename,function(pathinfo) {                		
						pathinfo.overlay_mediatype = "ondemand";
						
						<% if (isOverlayLive) { %>
							pathinfo.overlay_mediatype = "live";
						<%}%>
						
						var conInfo = parent.$.activePlayer.getConInfo(pathinfo);
						that.html5widget = $("#player").data("ui-viblastprototype");
						that.html5widget.setStreamSrc(conInfo.streamPath);
						that.play();
						that.html5widget.dopostrefresh();
					});
				},
				
				setSource: function(newSrc) {
					this.html5widget.setStreamSrc(newSrc);
				},
				
				setLiveTitle: function(title) {
					if (typeof this.html5widget != "undefined") {
						this.html5widget.setLiveTitle(title);
					}
				},
				
				html5widget: $("#player").data("ui-viblastprototype"),
				
				arrayOfMethodsToCall: {"$.viewerHTML5Player.html5widget = $('#player').data('ui-viblastprototype')": 1}
			},
			
			viewerControls: {
				init: function() {
					$("#volslider").slider({
						orientation: "horizontal",
						value: 50,
						slide: function(event, ui) {
							$.activePlayer.setVolume(ui.value);
						}
					});
					
					<% if(isOD & !disable_od_seek) { %>
						$("#odslider").slider({
							orientation: 'horizontal',
							
							start: function(event, ui) {
								if ($.oVideoInfo.status == "Paused")
									return;
								$.oVideoInfo.odSlider.status = 1;
							},
							
							slide: function(event, ui) {
								if ($.oVideoInfo.status == "Paused")
									return;
								$.oVideoInfo.odSlider.pos = $.oVideoInfo.totalDuration * ui.value / 100;
								$("#counter").html($.viewerControls.timeToString($.oVideoInfo.odSlider.pos));
							},
							
							stop: function(event, ui) {
								if ($.oVideoInfo.status == "Paused")
									return;
								$.activePlayer.setPosition($.oVideoInfo.odSlider.pos);
								$.oVideoInfo.odSlider.status = 2;
							},
							
							range: "min"
						}).show();
					<% } %>
					
					$("#counterwrapper").show();
					$('.ui-state-default').live({
						mouseenter: function() {
							$(this).addClass('ui-state-hover');
						},
						
						mouseleave: function() {
							$(this).removeClass('ui-state-hover');
						}
					});
					
					$("#play").click(function() {
						$.activePlayer.play();
					});
					
					$("#pause").click(function() {
						$.activePlayer.pause();
					});
					
					$("#stop").click(function() {
						$.activePlayer.stop();
					});
					
					$("#playermsg_ok").click(function() {
						$.viewerControls.hidePlayerMsg("");
					});
					
					$("#close").click(function() {
						closeme();
					});
					
					$("#refreshvideo").click(function() {
						if (!$.isOverlayLive && $.isLive) {
							$.bRefreshClicked = true;
							$.activePlayer.pause();
							setTimeout(function() {
								$.activePlayer.play();
							}, 2000);
						} else {
							$.activePlayer.switchVideo();
						}
					});
					
					$.statusTimer = setInterval(this.showStatus, 300);
				},
				
				dopostsettingmenu: function() {
					$(".vjs-settings-container .vjs-menu").hide();
					$(".vjs-settings-button")
						.removeClass("make-green")
						.removeClass("open");
				},
				
				togglePlayPauseStop: function(tType) {
					switch (tType) {
						case "play":
							$("#play").addClass('ui-state-active');
							if ($("#pause"))
								$("#pause").removeClass('ui-state-active');
							if ($("#stop"))
								$("#stop").removeClass('ui-state-active');
							break;
						case "pause":
							if ($("#pause"))
								$("#pause").addClass('ui-state-active');
							if ($("#stop"))
								$("#stop").addClass('ui-state-active');
							$("#play").removeClass('ui-state-active');
							break;
						case "stop":
							$("#stop").addClass('ui-state-active');
							$("#play").removeClass('ui-state-active');
							break;
					}
				},
				
				showStatus: function() {
					var statustxt = $.oVideoInfo.status;
					if ($.oVideoInfo.status == "Playing") {
						statustxt = parent.$.oViewerText.sts_playing;
					} else if ($.oVideoInfo.status == "Connecting") {
						statustxt = parent.$.oViewerText.sts_connecting;
					} else if ($.oVideoInfo.status == "Connecting..") {
						statustxt = parent.$.oViewerText.sts_connecting + "..";
					} else if ($.oVideoInfo.status == "Buffering") {
						statustxt = parent.$.oViewerText.sts_buffering;
					} else if ($.oVideoInfo.status == "Buffering..") {
						statustxt = parent.$.oViewerText.sts_buffering + "..";
					} else if ($.oVideoInfo.status == "Connection Failed") {
						statustxt = parent.$.oViewerText.sts_failed;
					} else if ($.oVideoInfo.status == "Paused") {
						statustxt = parent.$.oViewerText.sts_paused;
					} else if ($.oVideoInfo.status == "Click Play") {
						statustxt = parent.$.oViewerText.ios_click_play;
					}
					
					$("#status").html(statustxt);
					
					<% if (isOD && !isSimlive) { %>
						if (statustxt == parent.$.oViewerText.sts_playing && $("#status").html != parent.$.oViewerText.sts_playing) {
							$.viewerControls.togglePlayPauseStop("play");
						}
						
						if (statustxt == parent.$.oViewerText.sts_paused && $("#status").html != parent.$.oViewerText.sts_paused) {
							$.viewerControls.togglePlayPauseStop("pause");
						}
						
						$("#duration").html($.viewerControls.timeToString($.oVideoInfo.totalDuration));
						
						if ($.oVideoInfo.odSlider.status == 0) {
							$("#counter").html($.viewerControls.timeToString($.oVideoInfo.currentPosition));
							var newPos = ($.oVideoInfo.currentPosition/$.oVideoInfo.totalDuration) * 100;
							if (!isNaN(newPos))
								$("#odslider").slider('value' , newPos);
						}
						
						if ($.oVideoInfo.odSlider.status == 2) {
							if (Math.abs($.oVideoInfo.odSlider.pos - $.oVideoInfo.currentPosition) < 1) {
								$.oVideoInfo.odSlider.status = 0;
							}
						}
					<% } %>
					
					<% if (isOverlayLive) { %>
						if (statustxt != parent.$.oViewerText.sts_playing && parent.$.viewerAction.arrSecondaryMedia.length > 0) {
							if (parent.$.viewerAction.arrSecondaryMedia[0].action == "close_media_live") {
								if ($.oMulticast.isHiveMulticast) {
									$.activePlayer.closeHiveSession(); 
								}
								console.log("closing secondary media.....");
								setTimeout(function() {
									//log(parent.$.viewerAction.arrSecondaryMedia[0].action + " Should call closesecondarymedia");
									parent.$.viewerAction.arrSecondaryMedia.shift();
									parent.$.viewerAction.closeSecondaryMedia();
								}, 3000);
							}
						}
					<% } %>
				},
				
				timeToString: function(tc) {
					var h = "00";
					var m = "00";
					var s = "00";
					
					if (isFinite(tc)) {
						tc = Math.round(tc);
						
						if (tc >= 3600) {
							hInt = Math.floor(tc / 3600);
							tc -= (hInt * 3600);
							h = hInt < 10 ? "0" + hInt : hInt;
						}
						
						if (tc >= 60) {
							mInt = Math.floor ( tc / 60 );
							tc -= (mInt * 60);
							m = mInt < 10? "0" + mInt : mInt;
						}
						
						s = tc < 10? "0" + tc :tc;
					}
					
					if (h == "00")
						return m + ":" + s;
					else
						return h + ":" + m + ":" + s;
				},
				
				playerMsg: function(dispType) {
					var dispTxt = $.oViewerMsg[dispType];
					$.oVideoInfo.playerMsgType = dispType;
					$("#playermsg_txt").html(dispTxt);
					$("#playermsg").removeClass("player_hide");
					$("#playermsg").next().addClass("player_hide");
				},
				
				hidePlayerMsg: function(dispType) {
					if (dispType=="" || $.oVideoInfo.playerMsgType == dispType) {
						$.oVideoInfo.playerMsgType = "";
						$("#playermsg").addClass("player_hide");
						$("#playermsg").next().removeClass("player_hide");
					}
					return false;
				},
				
				logMedia: function(logType,logData) {
					//parent.$.viewerControls.logMedia(logType,logData);
					//Do not log media from here. Parent player already logged it..
				}
			}
		});
	})(jQuery);
</script>
</body>
</html>