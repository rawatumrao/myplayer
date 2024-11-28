<%@ page import="java.util.*" trimDirectiveWhitespaces="true"%>
<%@ page import="tcorej.*"%>
<%@ page import="org.json.*"%>
<%@ include file="/include/globalinclude.jsp"%>
<%
String ei = StringTools.n2s(request.getParameter("ei"));
String ui = StringTools.n2s(request.getParameter("ui"));
String si = StringTools.n2s(request.getParameter("si"));
int iEventId = Integer.parseInt(ei);

AdminUser admin = AdminUser.getInstance(ui);
Event currentEvent = Event.getInstance(iEventId);

if (admin == null || currentEvent == null) {
	throw new Exception(Constants.ENOUSERAUTH);
}

boolean isOD = "od".equalsIgnoreCase(currentEvent.getProperty(EventProps.contenttype)) || "ondemand".equals(currentEvent.getStatus(EventStatus.mode).getValue());

boolean isSecondaryMediaAllowed = admin.can(Perms.User.SECONDARYMEDIA);
boolean isPrimaryMediaAllowed = admin.can(Perms.User.ODSTUDIO) && isOD;

if (!isPrimaryMediaAllowed && !isSecondaryMediaAllowed) {
	throw new Exception(Constants.ENOUSERAUTH);
}

OdPlaylist odp = new OdPlaylist(Constants.DB_ADMINDB,iEventId);
JSONArray mediaJSON = null;
JSONArray unprocessedMediaJSON = null;
JSONArray secondaryMediaJSON = null;
JSONArray unprocessedSecondaryMediaJSON = null;

if (isPrimaryMediaAllowed) {
	mediaJSON = odp.getMovieJson(true, true);
	unprocessedMediaJSON = odp.getUnprocessedMediaJSON(true);
} 

if (isSecondaryMediaAllowed) {
	secondaryMediaJSON = odp.getSecondaryMediaJson(true);
	unprocessedSecondaryMediaJSON = odp.getUnprocessedSecondaryMediaJson();
}

JSONObject jResult = new JSONObject();
jResult.put("media", mediaJSON);
jResult.put("unprocessedMedia", unprocessedMediaJSON);
jResult.put("secondaryMedia", secondaryMediaJSON);
jResult.put("unprocessedSecondaryMedia", unprocessedSecondaryMediaJSON);
out.print(jResult.toString());
%>