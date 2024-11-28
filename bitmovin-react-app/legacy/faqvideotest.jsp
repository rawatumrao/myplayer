<%@ page errorPage="/error.jsp"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="java.text.*"%>
<%@ page import="java.net.*"%>
<%@ page import="org.json.*"%>
<%@ page import="tcorej.*"%>
<%@ page import="org.apache.commons.text.StringEscapeUtils"%>
<%@ include file="/viewer/include/globalinclude.jsp"%>
<%
Configurator globalConf = Configurator.getInstance(Constants.ConfigFile.GLOBAL);
String sVideoWidth = "320";
String sVideoHeight = "240";
String userAgent = StringTools.n2s(request.getHeader("user-agent"), "Unknown").toLowerCase();
String mType = StringTools.n2s(request.getParameter("mType"));
if (!"a".equalsIgnoreCase(mType)) {
	mType = "v";
}
String sLanguage = StringTools.n2s(request.getParameter("dlang")); // Default language variable. Will be used to select correct help/faq language.
String codetag = globalConf.get("codetag");
boolean bAudio = StringTools.n2b(request.getParameter("audio"));
String sViblast = globalConf.get("viblast_folder", "viblast");
String sVideojs = globalConf.get("videojs_folder", "videojs");
JSONObject jDefaultPaths = new JSONObject(); // JSON Object to hold default streaming path 
JSONArray jResult = new JSONArray(); // JSON Array 
JSONObject jContainer = new JSONObject(); // Parent JSON Object
String sProtocol = "https://";
String sPlayerType = "html5"; // Default is HTML5 video
String streamPath = "";
	
if ("a".equalsIgnoreCase(mType)) { // Is the test audio only?
	sVideoHeight="30";
	sPlayerType = "html5_audio";
} else { // The test is video
	sPlayerType = "html5";
}
 
// Get the path from the DB
ArrayList<HashMap<String, String>> aldefault = EventTools.getPlayerResourceByTypeLocation(sPlayerType, "prelive", "1", "viewerdb", false,true,"0");
if (aldefault.size() > 0) {
	HashMap<String, String> hmRow = aldefault.get(0);
	jDefaultPaths.put("type", hmRow.get("type"));
	jDefaultPaths.put("playertype", hmRow.get("playertype"));
	jDefaultPaths.put("hostname", hmRow.get("hostname"));
	jDefaultPaths.put("appid", hmRow.get("appid"));
	jDefaultPaths.put("filename", hmRow.get("filename"));
}
jResult.put(jDefaultPaths);
jContainer.put("paths",jResult); // Put json results in json object
streamPath=jContainer.toString();

// Get the system test page text
HashMap<String, String> hmAllSystemTestText = null;
try {
	hmAllSystemTestText = EventTools.getAllSystemTestText(sLanguage, Constants.DB_VIEWERDB, true);
}catch (Exception e) { }

boolean bVideoJSOnly = true;
%>

<%-- Get Faq and help variables --%>
<%@ include file="/viewer/proc_faqLang.jsp" %>

<!DOCTYPE html>
<html>
<head>
	<% response.setHeader("X-DOWNLOAD-OPTIONS","NOOPEN"); %>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="robots" content="none" />
 	<title>System Video Test</title>
	<link href="style/player.css?<%=codetag%>" rel="stylesheet" type="text/css" />
	<link href="/include/talkpoint.css?<%=codetag %>" rel="stylesheet" type="text/css" />

	<script type="text/javascript" src="/js/systemtest/detect.js?codetag=<%=codetag%>"></script>
	<script type="text/javascript" src="/js/systemtest/html5check.js?codetag=<%=codetag%>"></script>
	
	<style>
		body {
			background-color: #fff !important;
			font-family: Arial, HGelvetica, sans-serif;
		}

		#top-control-bar .vjs-status-display{
			z-index: 3 !important;
		}

		#hlsVideo {
			display: none;
		}

		.bmpui-ui-watermark {
			display: none !important;
		}
	</style>
 </head>
 <body id="test_body">
  <div id="ReactWedge"></div>
  <div id="master_div">
	<div id="hlsVideo"></div>
    <div class="clear"></div>
	<div class="vjs-status-display"></div>
</div>

<script type="text/javascript">
// data to inject into React wedge
var g_player = null;
var g_sPath = '';
var g_sPlayerDiv = 'hlsVideo';
var g_sVideoId = 'SystemVideoTest'; // analytics stuff
var g_sEventTitle = 'System Video Test'; // event title
var jsStreamPaths = <%=streamPath%>;
console.log(jsStreamPaths);
for (var i = 0; i < jsStreamPaths.paths.length; i++) {
	if (jsStreamPaths.paths[i].playertype === '<%=sPlayerType%>') {
		sHostname = jsStreamPaths.paths[i].hostname;
		sAppid = jsStreamPaths.paths[i].appid;
		sFilename = jsStreamPaths.paths[i].filename;
 		g_sPath = ('<%=sProtocol%>' + sHostname + '/' + sAppid + '/' + sFilename + '/playlist.m3u8');
	}
}
</script>

<!-- TODO: replace with local copies -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/bitmovin-player@8/bitmovinplayer.js" crossorigin></script>
<script type="text/javascript" src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script type="text/javascript" src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script type="text/javascript" src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js" crossorigin></script>
<script type="text/javascript" src="/include/react/index.js"></script>
 
<script type="text/javascript">

document.addEventListener(VideoPlayer.EVENT_PLAYING, (e) => {
	console.log(VideoPlayer.EVENT_PLAYING);
	document.querySelector('.vjs-status-display').innerHTML = '<%=faq90%>';
	parent.showmediapassfail('#mediapassfail','<span class=\"passed\"><%=faq56%></span>');
});

document.addEventListener(VideoPlayer.EVENT_PAUSED, (e) => {
	console.log(VideoPlayer.EVENT_PAUSED);
	document.querySelector('.vjs-status-display').innerHTML = '<%=faq93%>';
});

document.addEventListener(VideoPlayer.EVENT_ERROR, (e) => {
	console.log(VideoPlayer.EVENT_ERROR);
	parent.showmediapassfail('#mediapassfail','<span class=\"failed\"><%=faq57%></span><br><br><%=faq97%>.');
});

const globalCssPrefix = 'bmpui-';
const testTaggerClass = 'tagging-test-class';
const testTaggerClassComplete = globalCssPrefix + testTaggerClass;

const testTagger = () => {
	const uiElements = document.querySelectorAll('[class*="bmpui-"]');
	uiElements.forEach((element, index) => {
		element.setAttribute('data-testid', 'bmpui-' + element);
		console.log(`element = bmpui-${element}`);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('hlsVideo').style.display = 'block';

	//g_player.load(g_sEventTitle, g_sPath);

	//testTagger();

	// adjust the size of the iframe based on the parent page size.
	var iframe = parent.document.querySelector('#mediaplayback iframe');
	if (iframe === null) return; // ignore if we access video test directly.
	if ('<%=mType%>' === 'v') {
		iframe.style.width = (parent.innerWidth > 670) ? '480px' : '<%=sVideoWidth%>px';
		iframe.style.height = (parent.innerWidth > 670) ? '360px' : '<%=sVideoHeight%>px';
	} else {
		iframe.style.height = '55px';
	}
});
</script>
</body>
</html>
