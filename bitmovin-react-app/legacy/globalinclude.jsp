<%@ page import="java.util.ArrayList" %>
<%@ page import="org.apache.commons.text.StringEscapeUtils" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="tcorej.Constants"%>
<%@ page import="tcorej.General"%>
<%@ page import="tcorej.Logger"%>

<%@ page contentType="text/html; charset=utf-8" %>
<% request.setCharacterEncoding("UTF-8"); %>
<% response.setHeader("X-DOWNLOAD-OPTIONS","NOOPEN"); %>
<% response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); %> 
<% response.setHeader("Pragma", "no-cache"); %> 
<% response.setHeader("Referrer-Policy", "no-referrer-when-downgrade"); %> 
<% response.setDateHeader("Expires", 0); %> 
<%
	if("true".equals(request.getAttribute("ERROR"))) {
		ArrayList<String> arrInsecureID = (ArrayList<String>)request.getAttribute("INSECURE");

		if (arrInsecureID != null && !arrInsecureID.isEmpty()) {
			JSONObject resultObject = new JSONObject();

			for (String sInsecure : arrInsecureID)	{
				resultObject.append(Constants.JSON_FORM_ERRORS_LIST, General.createJSONErrorObject(StringEscapeUtils.escapeHtml4(sInsecure), "Restricted text used."));
			}
			
			if (!resultObject.isNull(Constants.JSON_FORM_ERRORS_LIST)) {
				resultObject.append(Constants.JSON_FORM_ERRORS_LIST, General.createJSONErrorObject("__ERROR__", "There was an error in your text input, Please check the input and try again."));
			}
			
			resultObject.put(Constants.JSON_FORM_SUCCESS, false);
						
			out.print(new JSONArray().put(resultObject).toString());
			return;
		}
		
		Logger.getInstance().log(Logger.INFO, "globalinclude.jsp", "Security Error-Insecure inputs used, but not identifiable.");
		return;
	}
%>
