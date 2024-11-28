<%@ page errorPage="/error.jsp"%>
<%@ page import="java.util.Date"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="java.text.*"%>
<%@ page import="java.net.*"%>
<%@ page import="org.json.*"%>
<%@ page import="tcorej.*"%>
<%@ page import="org.apache.commons.text.StringEscapeUtils"%>
<%@ page import="javax.servlet.http.Cookie"%>
<%@ include file="/viewer/include/globalinclude.jsp"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ page contentType="text/html; charset=utf-8"%>
<%
request.setCharacterEncoding("UTF-8");
response.setHeader("X-DOWNLOAD-OPTIONS","NOOPEN");
response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
response.setHeader("Pragma", "no-cache");
response.setDateHeader("Expires", 0);

String sURL = request.getRequestURL().toString();
if (sURL.indexOf("http://") != -1) {
	sURL = sURL.replace("http://", "https://");
	if (request.getQueryString() != null) {
		sURL += "?" + request.getQueryString();
	}
	response.sendRedirect(sURL);
	return;
}

Configurator conf = Configurator.getInstance(Constants.ConfigFile.GLOBAL);
String sCodeTag = conf.get("codetag");
String sCdnPayload = conf.get("cdn_payload");
String sWebsocketUrl = Configurator.getInstance(Constants.ConfigFile.CHAT).get(Constants.CHAT_URL_CONFIG);

// Setup variables
String sEventId = Constants.EMPTY;
String sTestemail = Constants.EMPTY;
String sGetAllTextError = Constants.EMPTY; // Used for debugging
int iEventId = -1;
Event myEvent = null;
String sLanguage = StringTools.n2s(request.getParameter("dlang")); // Default language variable. Will be used to select correct help/faq language.

if (Constants.EMPTY.equals(sLanguage)) {
	sLanguage = StringTools.n2s(request.getParameter("language")); // Max 7 chars, All chars and - only
}

String sTscinfo = Constants.EMPTY; 
String userip = request.getRemoteAddr();
String sReferer = request.getHeader("referer");
String userXffip = request.getHeader("X-FORWARDED-FOR"); // Get users x-forwarded for IP
String srvrip = InetAddress.getLocalHost().getHostAddress(); // Get server IP
Date date = new Date(); // Get the date from the server
boolean isTechview = StringTools.n2b(request.getParameter("techview")); // Show the advanced system test?
boolean cna = StringTools.n2b(request.getParameter("cna")); // Easter Egg fun with Chuck
boolean scottie = StringTools.n2b(request.getParameter("scottie")); // Easter Egg fun with Scottie Karate from Brooklyn
boolean hideCloseBtn = "no".equalsIgnoreCase(StringTools.n2s(request.getParameter("closebtn"))); // Show the close button on the system test?
String mType = StringTools.n2s(request.getParameter("mType")); // Is the system test for audio or video presentations?

if (!"a".equalsIgnoreCase(mType)) {
	mType = "v";
}

boolean showResultsOption = StringTools.n2b(request.getParameter("results")); // Show the form to email system test results to TSC?
boolean showPortTestOption = StringTools.n2b(request.getParameter("porttest")); // Show the form to email system test results to TSC?
String sAcceptLang = StringTools.n2s(request.getHeader("Accept-Language")); // Show the browsers accept language 
String sAcceptEnc = StringTools.n2s(request.getHeader("Accept-Encoding")); // Show the browsers accept encoding 
boolean bHtml5 = true;
boolean bUseHtml5Slide = true;
boolean bSetIeEdge = StringTools.n2b(request.getParameter("setedge")); // Will be used to force IE to run as lasest mode available using meta tag.
boolean bAudio = StringTools.n2b(request.getParameter("audio"));

if (Constants.EMPTY.equals(userXffip)) {
	userXffip = "Not set";
}

try {
	if (!Constants.EMPTY.equals(sLanguage)) {
		if (sLanguage.length() > 7 || !sLanguage.toLowerCase().matches("[a-z\\-]{2,7}")) {
			sLanguage = "en-us";
		}
	}	
	  
	sEventId = StringTools.n2s(request.getParameter(Constants.RQEVENTID));
	if (!Constants.EMPTY.equals(sEventId)) {
		try {
			iEventId = Integer.parseInt(sEventId);
			if (Event.exists(iEventId)) {
				myEvent = Event.getInstance(iEventId);
				sTscinfo = myEvent.getProperty(EventProps.tsc_info); // Does the event have tsc info?
				mType = myEvent.getProperty(EventProps.acquisition_source).equals("audio")?"a":"v"; // Is the event audio or video?
				bUseHtml5Slide = myEvent.useHTMLSlide("viewer") || (myEvent.getProperty(EventProps.html5_slide).equals(Constants.EMPTY) && myEvent.getSlideDecks().size() == 0);
				if (Constants.EMPTY.equals(sLanguage)) {
					String sCurrFixedTextLang = myEvent.getProperty(EventProps.default_language); // Is there a default langauge set?
					if (!Constants.EMPTY.equals(sCurrFixedTextLang)) {
						JSONObject jDefaultLang = new JSONObject(sCurrFixedTextLang);
						sLanguage = jDefaultLang.optString("default_lang"); // Set the language template if one exists with the event id. Will override the query param.
					}
				}
			}
		} catch (NumberFormatException e) { }
	}
} catch (Exception e) { }

if (Constants.EMPTY.equals(sLanguage)) {
	sLanguage = "en-us"; // If there is no language template set use en-us.
}

//Get the system test page text
HashMap<String, String> hmAllSystemTestText = null;
try {
	hmAllSystemTestText = EventTools.getAllSystemTestText(sLanguage, Constants.DB_VIEWERDB, true);
} catch (Exception e) {
	sGetAllTextError = e.toString();
}

// Set a secure cookie
StringBuffer sRequestURL = request.getRequestURL();
URL url = new URL(sRequestURL.toString());
String sHost = url.getHost();
// String sPath = url.getPath();
String sPath = "/";
Cookie myCookie = new Cookie("iml_system_test","yes");
myCookie.setMaxAge(86400); // 24 hours in seconds
myCookie.setDomain(sHost);
myCookie.setPath(sPath);
myCookie.setSecure(true);
myCookie.setHttpOnly(true);
response.addCookie(myCookie);

//Setup vars for minimum requirements. Changing these will change system test results

// TODO: These should not be hardcoded.

String sMinIos = StringTools.n2s("12"); // Minimum iOS version 
String sMinIe = StringTools.n2s("11"); //Minimum IE version 
String sMinFF = StringTools.n2s("85"); //Minimum Firefox version 
String sMinChrome = StringTools.n2s("88"); //Minimum Chrome version 
String sMinEdge = StringTools.n2s("88"); //Minimum Edge version 
String sMinSafari = StringTools.n2s("14"); //Minimum Safari version 
String sMinMobSafari = StringTools.n2s("533"); //Minimum mobile Safari version 
String sMinAndroid = StringTools.n2s("5.1"); //Minimum Android version 
String sMinMajMacos = StringTools.n2s("10"); //Minimum Major MacOS version number 
String sMinMacos = StringTools.n2s("14"); //Minimum Minor MacOS version number 
String sMinBwSpeed = StringTools.n2s("1.0"); //Minimum bandwidth speed for advanced test. 0.9 = 900kpbs, 1.0 = 1mpbs
String sMinFlashVersion = StringTools.n2s("30"); //Minimum Flash player version. Setting the number to a version that will fail.
String sMinGhz = StringTools.n2s("2.0"); //Minimum Ghz processor
String sMinRam = StringTools.n2s("4"); //Minimum RAM
String sMinResolution = StringTools.n2s("1024x768"); //Minimum screen resolution
%>

<%-- Get Faq and help variables --%>
<%@ include file="/viewer/proc_faqLang.jsp"%>
<%-- Get Faq and help html --%>
<%@ include file="/viewer/faqMinReq.jsp"%>


<%-- <jsp:include page="footerTop.jsp" /> --%>
<script type="text/javascript" src="/js/jquery/jquery-3.6.4.min.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/bwtest.js?codetag=<%=sCodeTag%>"></script>
<!-- <script type="text/javascript" src="/js/javascript-bandwidth-tester/bins/jquery-1.4.3.min.js?codetag=<%=sCodeTag%>"></script>-->
<script type="text/javascript" src="/js/javascript-bandwidth-tester/bins/jQuery.wlBWT.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/pdfdetect.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/detect.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/compatibilitymode.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/swfobject.js?codetag=<%=sCodeTag%>"></script>
<!-- <script type="text/javascript" src="/js/systemtest/wmpdetect.js?codetag=<%=sCodeTag%>"></script> -->
<script type="text/javascript" src="/js/systemtest/popupcheck.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/webrtccheck.js?codetag=<%=sCodeTag%>"></script>
<script type="text/javascript" src="/js/systemtest/html5check.js?codetag=<%=sCodeTag%>"></script>
<% if (isTechview) { %>
	<script type="text/javascript" src="/js/systemtest/geolocate.js?codetag=<%=sCodeTag%>"></script>
	<script type="text/javascript" src="/js/systemtest/wssCheck.js?codetag=<%=sCodeTag%>"></script>
	<script type="text/javascript" src="/js/systemtest/emecheck.js?codetag=<%=sCodeTag%>"></script>
	<script type="text/javascript" src="/js/systemtest/languageCheck.js?codetag=<%=sCodeTag%>"></script>
<% } %>
<style>
	#wl-bwt-dnl-bar-You-you {
		width: calc(100vw - 173px);
	}
	
	@media (max-width: 414px) {
		.advanced tr {
			width: 100vw;
		}
	}
	
	.versionNum {
		display: inline-block; 
	}
</style>

<script type="text/javascript">
// todo this needs to actually be a redirect or another jsp embed or something other than this!
function legacyBrowserRedirect() {  //  If the browser is very old redirect them to this message
	document.body.innerHTML = ("<img class='closeBtn' src='/viewer/images/icon_reg-close-white.png' style='position:absolute; top:1%;left: 94%;' onclick='if(self.parent==self){self.close();}else{parent.closeHelp();}return false;'/>" +
		"<div class='oldBrowser' style='display: flex;align-items: center;justify-content: center;height: 100vh;margin-top:10%;'>" +
		"<h1 class='oldBrowser-text' style='text-align:center;color:#c00;padding: 0 60px;'><%=faq125%><br/><br/><%=faq126%></h1>" +
	"</div>");
}

try {
	var legacyBrowserTest = (document.addEventListener);
	if (!legacyBrowserTest) {  //  We are testing for old browsers that don't support eventListeners
		legacyBrowserRedirect();
	}
} catch (err) {
	console.log(err);
}
	
$('#mediapassfail').html('<img class="spinAni spinPosition" src="/viewer/images/icon_spinner.png"/>');

/*-- Start supporting functions --*/

//  Setup vars for minimum requirements. Changing these will change system test results 
minIos = "<%=sMinIos%>";//Minimum iOS version 
minIe = "<%=sMinIe%>";//Minimum IE version 
minFF = "<%=sMinFF%>";//Minimum Firefox version 
minChrome = "<%=sMinChrome%>"//Minimum Chrome version 
minEdge = "<%=sMinEdge%>";//Minimum Edge version
minSafari = "<%=sMinSafari%>";//Minimum Safari version 
minMobSafari = "<%=sMinMobSafari%>";//Minimum mobile Safari version 
minAndroid = "<%=sMinAndroid%>";//Minimum Android version 
minMajMacos = "<%=sMinMajMacos%>";//Minimum Major MacOS version number 
minMinMacos = "<%=sMinMacos%>";//Minimum Minor MacOS version number 
minBwSpeed = "<%=sMinBwSpeed%>";//Minimum bandwidth speed for advanced test. 0.9 = 900kpbs, 1.0 = 1mpbs
minFlashVersion = "<%=sMinFlashVersion%>";//Minimum Flash player version
minGhz = "<%=sMinGhz%>";
minRam = "<%=sMinRam%>";
minResolution = "<%=sMinResolution%>";
macOspassed = false;
bUseHtml5Slide = true;//  Should the system test look for HTML5 slides? Setting to true so it no longer checks for flash

//  If the device is a Mac we need a special test to see if the OS passes the minimum requirements 
if (systemDetect.OS == "Mac OS") {
	var mac = systemDetect.OSversion;
	var split = (mac.toString()).split(".");
	majMacos = parseInt(split[0]); //  Major Mac OS version 
	minMacos = parseInt(split[1]); //  Minor Mac OS version 
		if (majMacos>minMajMacos) {
			macOspassed = true; //  If the major version is greater than the minimum major version it's a pass.
		} else if ((majMacos>=minMajMacos)&&(minMacos>=minMinMacos)) {
			macOspassed = true;
		}
}

// Set flash player version variable based on results of swfobject.js
try {
	playerVersion = swfobject.getFlashPlayerVersion();
	var afpversion = playerVersion.major + "." + playerVersion.minor + "." + playerVersion.release;
} catch (err) {
	//  Do nothing
}
  
//  Function to detect if HTMl5 Video tag is supported by the browser
function supports_video() {
	return !!document.createElement('video').canPlayType;
}

//  Function to display the advanced bandwidth checker. 
function show_advBwtest() {
	$('#wl-bwt').wlBWt({
		BinPath: '/js/javascript-bandwidth-tester/bins', //Ping test and upload test rely on BinPath
		Payload: '<%=sCdnPayload%>',//Payload test file from CDN. Only requires the Payload path
		ServerPost: 'server.jsp',
		Theme: 'default',
		ShowComparison: false,
		TestPing: true
	});
};

//  Function to show pass fail message from the video test run from faqvideotest.jsp 
function showmediapassfail(div,txt) {
	if (txt.search("passed") > -1) {
		// $(div).html("<span class=\"passed\"><%=faq56%></span>");
		$(div).html('<img class="passed" src="/viewer/images/test_pass.png"/>');
	} else {
		// $(div).html("<span class=\"failed\"><%=faq57%></span>");
		$(div).html('<img class="failed" src="/viewer/images/test_fail.png"/>');
	}
}

// Function to update the Advanced bandwidth test div to let the user know the advanced test is complete.  Called from jQuery.wlBWT.js
function updateAdvancedbwtest(dSpeed) {
	var downloadSpeed = dSpeed.valueOf(); 
	if (downloadSpeed < minBwSpeed) {
		document.getElementById('bwttitle').innerHTML = "<strong><%=faq103%>:  </strong> <%=faq104%>. <strong><%=faq107%>:</strong> <%=faq57%>. <br /><br />";
	} else {
		document.getElementById('bwttitle').innerHTML = "<strong><%=faq103%>:  </strong> <%=faq104%>. <strong><%=faq107%>:</strong> <%=faq56%>. <br /><br />";
	}
}

// Change compatibility mode (cmode) text in case a custom language is set
if (cmode == "Yes") {
	cmode = "<%=faq58%>";
} else if (cmode == "No") {
	cmode = "<%=faq59%>"; 
}

// Check for for HTML5 video support
var html5vid = supports_video(); // Old test. MSE check is more accurate
var html5vresults = (html5vid === true) ? "<%=faq58%>" : "<%=faq59%>";

// Check for HTML5 media source extension support
var html5mse = isMSESupported();
var html5mseResults = (html5mse === true) ? "<%=faq58%>" : "<%=faq59%>";
 
// Check for HTML5 canvas support
var html5canvas = isCanvasSupported();
var html5canvasResults = (html5canvas === true) ? "<%=faq58%>" : "<%=faq59%>";

// Update advanced system test URL
function updateAdvSysTestUrl() {
	$(".sysTestHref").attr("href", "faq.jsp?techview=yes&dlang=<%=StringEscapeUtils.escapeEcmaScript(sLanguage)%>&closebtn=<%=hideCloseBtn ? "no" : ""%>");
	$(".sysTestHref").attr("target", "_self");
}
 
// Check for cookie support
function cCheckCookie(action,name) {
	$(".cookiecheck").html("Uknown");
	try {
		var params = "action=" + action + "&name=" + name;
		$.ajax({ type: "GET",
			// async: false, // Forcing the method to run and return. Not an issue because the call is local.
			url: "/viewer/faqCheckCookie.jsp", // Proc page to read secure cookie
			data: params,
			dataType: "json",
			success: function(jsonResult) {
				if (jsonResult.success === true) {
					$(".cookiecheck").html("<%=faq58%>");
				} else {
					$(".cookiecheck").html("<%=faq59%>");
				}
			},
			
			error: function(jsonResult) {
				$(".cookiecheck").html("Uknown");
			}
		});
	} catch (err) {
		console.log("TPQA - Error trying to set secure cookie");
	}
}

// Function to display the results generated by display() in bwtest.js
function bwPassed () {
	// $('#bwpassfail').html('<span class=\"passed\"><%=faq56%></span>');
	$('#bwpassfail').html('<img class="passed" src="/viewer/images/test_pass.png"/>');
	$('#bwmoreinfo').html('<span class=\"note\"><%=faq72%></span>');
}

function bwFailed () {
	// $('#bwpassfail').html('<span class=\"failed\"><%=faq57%></span>');
	$('#bwpassfail').html('<img class="failed" src="/viewer/images/test_fail.png"/>');
	$('#bwmoreinfo')
		.css('display', 'block')
		.html('<span class=\"note redFont \"><%=faq106%></span>');  //FAIL: Bandwidth
	updateAdvSysTestUrl();
}
<% if (isTechview) { /*Only load geo location files for the advanced system test */ %>
	// Functions that use the browser geolocation support to pinpoint latitude / longitude. Relies on geolocate.js
	var myLatitude = "Uknown";
	var myLongitude = "Uknown";
	
	function setCoords (latitude,longitude) {
		myLatitude = latitude;
		myLongitude = longitude;
		$("#geoLocation").html("<a href=\"https://www.google.com/maps?q=" + myLatitude + "," + myLongitude + "\" target=\"_blank\" rel=\"noopener\">" + myLatitude + "," + myLongitude + "</a>");
	}
	
	getGeo();
<% } %>

<% /* If results = yes is passed in with techview = yes show an option to send results to our techical support center. */
if (showResultsOption && isTechview) {
%>
	function sendResults (downSpeed, upSpeed) {
		$('#captchaiframe').show("slow"); // Show the captcha form
		// Call the faqcaptcha page in an iframe and pass all the test results in query string
		$('#captchaiframe').html(
			"<IFRAME src=\"faqcaptcha.jsp" +
			"?os=" + systemDetect.OS + "%20" + systemDetect.OSversion +
			"&browser=" + systemDetect.browser + "%20" + systemDetect.version +
			"&screenres=" + screen.width + "x" + screen.height +
			"&html5=" + html5vresults +
			"&webrtc=" + webrtcresults +
			"&adobeflash=" + afpversion +
			"&cmode=" + cmode +
			"&docmode=" + docmode +
			"&myLatitude=" + myLatitude +
			"&myLongitude=" + myLongitude +
			"&ip=<%=userip%>&srv=<%=srvrip%>&time=<%=date%>" +
			"&bandwidthUp=" + upSpeed +
			"&bandwidthDown=" + downSpeed +     
			//Note: User agent will be captured in the faqcaptcha page so no need to pass it here.
			"\" name=\"faqcaptcha\" width=\"720\" height=\"350\" scrolling=\"no\" frameborder=\"0\"><%=faq105%></IFRAME>");
	}
<% } else { %>
	function sendresults (downSpeed, upSpeed) {
		//No function call required
	}
<% } %>
/*-- End supporting functions --*/

/*-- Start of onload functions --*/
$(document).ready(function() {
	// Hiding the standard sytem test div. TODO: Add back when reworked.
	$("#bandwidth").hide();
	
	// focus on close button
	$('.faqTitle').focus();
	
	// Pressing enter on sections opens them
	$("#minreq, #hearaudio, #seevideo").on('keyup', function(event){
		if (event.keyCode === 13) {
			$(this).click();
		}
	});
	
	// Pressing esc or enter on will Close System Test
	$(document).on('keyup', function(e) {
		if (e.keyCode === 27) {
			try {
				parent.$('#eventDisplayTitle').focus();
				$(".closeBtn").click();
			} catch(err) {
				// not on reg page
			}
		}
	});
	
	$(".closeBtn").on('keyup', function(event) {
		if (event.keyCode === 13) {
			try {
				parent.$('#eventDisplayTitle').focus();
				$(this).click();
			} catch(err) {
				// not on reg page
			}
		}
	});
	
	// On last tab go back to first tab in this popup window
	$('.closeBtn').on('keydown', function(e) {
		if (e.keyCode === 9) {
			e.preventDefault(); 
			$('.faqTitle').focus();
		}
	});
	
	// Check to see if cookies can be set and read
	cCheckCookie("find","iml_system_test");
	
	// If the tester is using iOS, Android or MS Edge Browser make sure HTML5 is always used for the video test
	sUseHtml5Vid = "<%=bHtml5 ? "true" : "false"%>";
	if ((systemDetect.browser === "Microsoft Edge Browser") || (systemDetect.OS === "iPad iOS") || (systemDetect.OS === "iPhone iOS") || (systemDetect.OS === "iPod iOS") || (systemDetect.OS === "Android")) {
		sUseHtml5Vid = "true";
	}
	
	//  Check the users bandwidth
	setTimeout("initBwCheck()", 1000);
	
	//  Display OS and OS version onto the DOM next to "Operating System"
	$('#os').html(systemDetect.OS + " " + systemDetect.OSversion);
	
	//  Check OS and display if it passed or failed. Relies on detect.js
	if ((systemDetect.OS === "Windows 10") || (systemDetect.OS === "Windows 8.1") || (systemDetect.OS === "Windows 8") ||
		(systemDetect.OS === "iPad iOS" && (systemDetect.OSversion >= minIos)) ||
		(systemDetect.OS === "iPhone iOS" && (systemDetect.OSversion >= minIos)) ||
		(systemDetect.OS === "iPod iOS" && (systemDetect.OSversion >= minIos)) ||
		(systemDetect.OS === "Mac OS" && (macOspassed)) ||
		(systemDetect.OS === "Android" && (systemDetect.OSversion >= minAndroid)) || (systemDetect.OS === "Linux")) {
		// $('#ospassfail').html('<span class=\"passed\"><%=faq56%></span>');
		$('#ospassfail').html('<img class="passed" src="/viewer/images/test_pass.png"/>');	   
		$('#osmoreinfo').html('<%=faq70%>');
	} else {
		// $('#ospassfail').html('<span class=\"failed\"><%=faq57%></span>');
		$('#ospassfail').html('<img class="failed" src="/viewer/images/test_fail.png"/>');
		$('#osmoreinfo')
			.css('display', 'block')
			.html('<a class="redFont minreqDetailsAnchor" href="#minreqDetails"><%=faq121%></a>');
		$('.minreqDetailsAnchor').css('color', '#c00');
		$('.minreqDetailsAnchor').click(function () {
			var minreqDetailsAnchorDiv = $('#minreqDetails');
			if (minreqDetailsAnchorDiv.css('display') === 'none') {
				minreqDetailsAnchorDiv.css('display', 'flex');
				$('#minreq span').attr('class', 'arrowOpened');
			}
		});
	}
	
	// show click play if on mobile device
	var osTxt = $('#os').text().trim().slice(0, 3);
	
	if (osTxt === 'iPa' || osTxt === 'iPh' || osTxt === 'iPo' || osTxt === 'And') {
		$('#mobileMessage').css('display', 'block');
	}
	
	//  Display browser and browser version onto the DOM next to "Browser"
	$("#bversion").html(systemDetect.browser + '&nbsp;' + systemDetect.version);

	//  Check browser and version and display if it passed or failed.  Uses detect.js
	if ((systemDetect.browser === 'Microsoft Edge Browser' && (systemDetect.version >= minEdge)) ||
		(systemDetect.browser === 'Firefox' && (systemDetect.version >= minFF)) ||
		(systemDetect.browser === 'Google Chrome' && (systemDetect.version >= minChrome)) ||
		(systemDetect.browser === 'Safari' && (systemDetect.version >= minSafari)) ||
		(systemDetect.browser === 'Mobile Safari' && (systemDetect.version >= minMobSafari))) {
		// $('#bpassfail').html('<span class=\"passed\"><%=faq56%></span>');
		$('#bpassfail').html('<img class="passed" src="/viewer/images/test_pass.png"/>');	
		$('#bmoreinfo').html('<%=faq71%>');
	} else {
		// $('#bpassfail').html('<span class=\"failed\"><%=faq57%></span>');
		$('#bpassfail').html('<img class="failed" src="/viewer/images/test_fail.png"/>');	
		$('#bmoreinfo')
			.css('display', 'block')
			.html('<a class="redFont minreqDetailsAnchor" href="#minreqDetails"><%=faq121%></a>');
		$('.minreqDetailsAnchor').css('color', '#c00');	
		$('.minreqDetailsAnchor').click(function () {
			var minreqDetailsAnchorDiv = $('#minreqDetails');
			if (minreqDetailsAnchorDiv.css('display') === 'none') {
				minreqDetailsAnchorDiv.css('display', 'flex');
				$('#minreq span').attr('class', 'arrowOpened');
			}
		});
	}
	
	// Check the system to make sure slides can be displayed. 
	if (isCanvasSupported()) {
		// $('#sldpassfail').html('<span class=\"passed\"><%=faq56%></span>');
		$('#sldpassfail').html('<img class="passed" src="/viewer/images/test_pass.png"/>');	
		$('#sldmoreinfo').html('<%=faq73%>' + " <img src=\"images/HTML5_Logo_16.png\" border=\"0\" valign=\"middle\"/>");
	} else {  
		// $('#sldpassfail').html('<span class=\"failed\"><%=faq57%></span>');
		$('#sldpassfail').html('<img class="failed" src="/viewer/images/test_fail.png"/>');	
		$('#sldmoreinfo').css('display', 'block').html('<span class="redFont"> ' + '<%=faq101%> <%=faq102%>' + '</span>'); 
	}
	// Display advanced info to the audience member.  Will be used by Tech support to troubleshoot.
	$('#advanceInfo').html(navigator.userAgent + "<br /><br /><strong><%=faq69%>: </strong>" + systemDetect.OS + " | " + systemDetect.browser + "&nbsp;" + systemDetect.version + " | BW: <span id='speed2'>" + speedKbps + "</span> | AFP: " + afpversion +  " | IP: <%=userip%>" + " | RSA: <%=srvrip%>" + " | <%=faq110%>: " + screen.width + " x "+ screen.height + " | " +
		"CMode <%=faq108%>: " + cmode + " | Cookies <%=faq108%>: <span class=\"cookiecheck\"></span> | <a class=\"sysTestHref\" href=\"#\" target=\"_self\"><%=faq87%></a>.<br /><br /><b><strong><%=faq61%>: </strong>" +
		"<%=date%>");

	// Display the bandwidth detected by bwtest.js
	// This should go up between browser and slide section of the code
	$('#bw').html("<span id='speed'> " + speedKbps + "</span> ");

	// Display minimum requirements by toggle button
	$("#minreq").click(function () {
		var minreqDetailsDiv = $("#minreqDetails");
		if (minreqDetailsDiv.css('display') === 'flex') {
			minreqDetailsDiv.css('display', 'none');	
		} else {
			minreqDetailsDiv.css('display', 'flex');
		}
		$('#minreq span').toggleClass('arrowOpened arrowClosed')
	});
	
	// Dispay system test by toggle button. The video test opens in an iframe.
	$("#systest").click(function () {
		var ht = ("<%=mType%>" === "a") ? 53 : 293; //52 is the padded height of the embedded iframe for the audio player - 292 is the padded height of the embedded iframe for the video player.
		$('#mediaplayback').html("<IFRAME src=\"faqvideotest.jsp?mType=<%=mType%>&dlang=<%=sLanguage%>&audio=<%=bAudio%>\" name=\"videotest\" width=\"323\" height=\"" + ht + "\" scrolling=\"no\" frameborder=\"0\" allowfullscreen><%=faq105%></IFRAME>");
		<% if (cna) { %>
			<!-- Our Easter Egg tribute to Chuck Norris -->
			if ($("#systestDetails").is(":visible")) {
				$('#chuckmoreinfo').html('');
				$('#chuckpassfail').html('<span class="failed">Failed</span>');
			} else {
				$('#chuckmoreinfo').html('<img src="images/cna2.gif" border="0" />');
				setTimeout("$('#chuckpassfail').html('<span class=\"passed\"><%=faq56%></span>')",3500);
			}
			<!-- End Chuck Easter Egg -->
		<% } %>
		
		<% if (scottie) { %>
			<!-- Our Easter Egg tribute to Scottie Karate! -->
			if ($("#systestDetails").is(":visible")) {
				$('#scottiemoreinfo').html('');
				$('#scottiepassfail').html('<span class="failed">Failed</span>');
			} else {
				$('#scottiemoreinfo').html('<img src="images/scottiekarate2.gif" border="0" />');
				setTimeout(function(){$('#scottiemoreinfo').html('<img src=\"images/scottiekarate1.gif\" border=\"0\" />')}, 5000);
				setTimeout(function(){$('#scottiemoreinfo').html('<img src=\"images/scottiekarate3.gif\" border=\"0\" />')}, 10000);
				setTimeout(function(){$('#scottiemoreinfo').html('<img src=\"images/scottiekarate4.gif\" border=\"0\" />')}, 20000);
				setTimeout(function(){$('#scottiepassfail').html('<span class=\"passed\"><%=faq56%></span>')}, 21000);
			}
			<!-- End Scottie Easter Egg -->
		<% } %>
	});
	
	// Display audio help instructions via toggle button.
	$("#hearaudio").click(function () {
		$("#hearaudioDetails").toggle();
		$('#hearaudio span').toggleClass('arrowOpened arrowClosed')
	});
	
	// Display vieo help instructions via toggle button.
	$("#seevideo").click(function () {
		$("#seevideoDetails").toggle();
		$('#seevideo span').toggleClass('arrowOpened arrowClosed')
	});	
	
	<% if (!Constants.EMPTY.equals(sTscinfo)) { %>
		var oTscinfo = <%=sTscinfo%>;
		if (oTscinfo.Email !== "") {
			$("#tscemail").text(oTscinfo.Email);
			$("#tscemailDiv").show();
		}
		if (oTscinfo.Phone !== "") {
			$("#tscphone").text(oTscinfo.Phone);
			$("#tscphoneDiv").show();
		}
	<% } %>
	
	$("#seetsc").click(function () {
		$("#seetscDetails").toggle();
		$('#seetsc span').toggleClass('arrowOpened arrowClosed')
	});	
	
	<%-- If techview=yes is sent in the string the page will reset to advanced mode for better troubleshooting.  All code you see above will be replaced on the page with info below...--%>
	<% if (isTechview) { %>
		//  Advanced system test view for better troubleshooting.
		
		//  Check for popup blockers. 
		checkForpop(); // Relies on popupcheck.js
		
		setTimeout(function() {
			if (popcheck === "Yes") {
				document.getElementById("pcheckdiv").innerHTML = "<%=faq58%>";
			} else if (popcheck === "No") {
				document.getElementById("pcheckdiv").innerHTML = "<%=faq59%>";
			}
		}, 1500);
		
		//  Check to see if the browser supports WebRTC
		checkWebrtc(); // Relies on webrtccheck.js
		if (!checkWebrtc()) {
			webrtcresults = "<%=faq59%>";
		} else {
			webrtcresults = "<%=faq58%>";
		}
		
		// Did the browser pass a referer?
		function checkForReferer() {
			var refer = encodeURIComponent("<%=StringEscapeUtils.escapeEcmaScript(sReferer)%>");
			var url = (window.location.href);
			if ((refer === "") || (refer === "null")) {
				//  If a refer is not passed give the user another chance by using a simple href to the same page.
				return ("<%=faq59%>. Please <a href=\"" + url + "\" target=\"_self\">click here</a> to retest.");
			} else {
				console.log("TPQA - Referer header passed:  <%=StringEscapeUtils.escapeEcmaScript(sReferer)%>");
				return ("<%=faq58%>.");
			}
		}
		
		// Does the browser support Web sockets? Relies on wssCheck.js
		try {
			var wssconfgurl = "<%=sWebsocketUrl%>"; // Websocket server
			var wssurl = wssconfgurl.replace("https://", "wss://") + "/chatservice/";
			console.log("TPQA - Websocket URL: " + wssurl);
			checkWsSupport(wssurl);
			setTimeout(function() {
				if (wsSupported) { // Var is in wssCheck.js
					document.getElementById('websockettest').innerHTML = ("<%=faq58%>");
				} else {
					document.getElementById('websockettest').innerHTML = ("<%=faq59%>");
				}
				if (wsError) { // Var is in wssCheck.js
					document.getElementById('websockettest').innerHTML = ("Unable to connect to site");
				}
			}, 2000);
		} catch (err) {
			setTimeout(function() {
				document.getElementById('websockettest').innerHTML = ("Unable to run wss check");
			}, 2000);
		}
		
		//  Check for HTML5 EME support. Relies on emecheck.js
		supportsEncryptedMediaExtension();
		var html5emeResults = ("<%=faq59%>");
		if (hasEME) {
			html5emeResults = ("<%=faq58%>" + " (" + emeType + ")");
		}
		
		// Replace the entire standard system test page with the advanced view. Only appears with techview=yes in the URL   
		document.getElementById('pageContent').innerHTML = ("<table width=\"100%\" class=\"advanced\" cellspacing=\"0\">" +
			"<tr><td width=\"205\" valign=\"top\"><h1><%=faq111%> </td><td width=\"550\">" +
			<%-- Adding a parameter to hide the close button. Needed when the page is being linked to outside of a pop-up or fancy box. --%>
			<% if (!hideCloseBtn) { %>
				"<a href=\"#\" onclick=\"if(self.parent==self){self.close();}else{parent.closeHelp();}return false;\" style=\"float:right;\"><img class='closeBtn' src=\"/viewer/images/icon_reg-close-white.png\" border=\"0\" /></a>" +
			<% } %>
			"</h1></td></tr>" + 
			"<tr><td width=\"200\" valign=\"top\"><strong><%=faq4%> </strong></td><td width=\"550\">" + systemDetect.OS + " " + systemDetect.OSversion + "</th></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong><%=faq5%> </strong></td><td width=\"550\">" + systemDetect.browser + " " + systemDetect.version + "</td></tr>" +
			//"<tr><td width=\"200\" valign=\"top\">Approximate bandwidth: </td><td width=\"550\"><span id='speed'>" + speedKbps + //"</span> Kbps</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong><%=faq110%> </strong></td><td width=\"550\">" + screen.width + " x "+ screen.height + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>Popup blocker <%=faq108%> </strong></td><td width=\"550\"><div id=\"pcheckdiv\">" + popcheck + "</div></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>Cookies <%=faq108%> </strong></td><td width=\"550\"><span class=\"cookiecheck\"></span></td></tr>" +
			//"<tr><td width=\"200\" valign=\"top\"><strong>HTML5 video tag support </strong></td><td width=\"550\">" + html5vresults + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>HTML5 support </strong></td><td width=\"550\">Canvas: " + html5canvasResults + " | MSE: " + html5mseResults + " | EME: " + html5emeResults + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>WebRTC support </strong></td><td width=\"550\">" + webrtcresults + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>Adobe Flash Player </strong></td><td width=\"550\">" + afpversion + "</td></tr>" +
			//"<tr><td width=\"200\" valign=\"top\"><strong>Windows Media Player </strong></td><td width=\"550\">" + wmpversion + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>MSIE compatibility mode </strong></td><td width=\"550\">" + cmode + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>MSIE document mode </strong></td><td width=\"550\">" + docmode + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>PDF Support </strong></td><td width=\"550\"><div id=\"checkpdf\"></div><a href=\"/viewer/images/sample.pdf\" target=\"_blank\">Click here</a> to launch a test PDF in a new window</td></tr>" +
			<% if (showPortTestOption) { %>
				"<tr><td width=\"200\" valign=\"top\"><strong>Adobe Flash Port test</td><td width=\"550\"><div id=\"flashporttest\">The port test cannot be run on this system.</div></td></tr>" +
			<% } %>
			"<tr><td width=\"200\" valign=\"top\"><strong>WebSocket Support</td><td width=\"550\"><div id=\"websockettest\"></div></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>IP Address </strong></td><td width=\"550\"><%=userip%></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>XFF IP Address </strong></td><td width=\"550\"><%=userXffip%></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>RH Passed</strong></td><td width=\"550\">" + checkForReferer() + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>RSA </strong> </td><td width=\"550\"><%=srvrip%></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>HTML5 Geolocation </strong></td><td width=\"550\"><div id=\"geoLocation\">Not available or unsupported</div></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>Accept Language </strong></td><td width=\"550\"><%=sAcceptLang%> | Navigator language: " + getBrowserLang() + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong>Accept Encoding </strong></td><td width=\"550\"><%=sAcceptEnc%></td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong><%=faq60%>: </strong></td><td width=\"100vw\">" + navigator.userAgent + "</td></tr>" +
			"<tr><td width=\"200\" valign=\"top\"><strong><%=faq61%>: (GMT) </strong></td><td width=\"550\"><%=date%></td></tr>" +
			//Advanced bandwidth checker div
			"<tr><td colspan=\"2\" width=\"750\" valign=\"top\"><br />" +
			"<div id =\"bwttitle\"><strong><%=faq103%>:</strong>   " +
			"<img src=\"/js/javascript-bandwidth-tester/bins/css/images/l-gray-torus-small.gif\"><br /><br />" +
			"</div>" +
			"<div id=\"wl-bwt\">" +
			"</div>" +
			"<div>" +
			"<br />" +
			"</div>" +
			"</td></tr>" +
			"</table>" +
			// Iframe to send results to TSC. Hidden by default.
			"<div id=\"captchaiframe\" style=\"width:750px; padding:5px; height:300px; display:none\">" +
			"</div>");
		/* Due to a possible timing conflict between js files there is setTimeout of a few seconds to load the advanced bandwidth checker.
		It detects ping time, bandwidth up and bandwidth down. Relies on jQuery.wlBWT.js and puts the results in <div id="id="wl-bwt"> */
		setTimeout("show_advBwtest()", 3000);
		
		//  Check for PDF support
		setTimeout("checkPdfSupport()", 1000);
	<% } %>
	
	// make system test run when on click
	$("#systest").click();
	// Replace minimum version placeholders in help page text\
	// min version placeholder from help page text are stored on viewer DB
	/* 
		if we were to keep original system failure text, change the following faq variables in Viewer DB
		variables associate with:
			#minAndroidVer, #minMajorMacVer, #minMinorMacVer, #miniOSVer, #minIeVer, #minFFVer, 
			#minChromeVer, #minSafariVer, #minEdgeVer
		They are faq20, faq21, faq22, faq25, faq26, faq27, faq28, faq120
		sample code change if variables were changed on DB:
		$("#minEdgeVer").each(function() {$(this).html(minEdge);});
	*/
	updateAdvSysTestUrl();
	$("#minAndroidVer").html(minAndroid);
	$("#minAndroidVer2").html(minAndroid);
	$("#minMajorMacVer").html(minMajMacos);
	$("#minMinorMacVer").html(minMinMacos);
	$("#miniOSVer").html(minIos);
	$("#minGhz").html(minGhz + "Ghz");
	$("#minRam").html(minRam + "GB");
	$("#minIeVer").html(minIe);
	$("#minFFVer").html(minFF);
	$("#minChromeVer").html(minChrome);
	$("#minSafariVer").html(minSafari);
	$("#minEdgeVer").html(minEdge);
	$("#minMobSafariVer").html(minMobSafari); 
	$("#minBwSpeed").html(minBwSpeed * 1000);
	$("#minFlashPlayer").html(minFlashVersion);
	$("#minResolution").html(minResolution);
	
});
/*-- End of onload functions --*/

try {
	console.log("TPQA - JQuery version: " + (jQuery.fn.jquery));
} catch(err) { }
</script>
</body>
</html>
