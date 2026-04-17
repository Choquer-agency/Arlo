/**
 * ARLO Looker Studio Community Connector — Apps Script entry points.
 * Paste this + Config.gs into a Google Apps Script project linked to Looker
 * Studio. Do NOT deploy from this repository as-is; see README.md for publish
 * flow.
 */

function getAuthType() {
  return {
    type: "USER_TOKEN",
    helpUrl: "https://askarlo.app/destinations/looker_studio"
  };
}

function isAuthValid() {
  var token = PropertiesService.getUserProperties().getProperty("arlo_token");
  if (!token) return false;
  try {
    var res = UrlFetchApp.fetch(ARLO_ENDPOINT, {
      method: "get",
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) return false;
    var body = JSON.parse(res.getContentText());
    return body && body.ok === true;
  } catch (err) {
    return false;
  }
}

function setCredentials(request) {
  var token = request && request.userToken && request.userToken.token;
  if (!token) return { errorCode: "INVALID_CREDENTIALS" };
  PropertiesService.getUserProperties().setProperty("arlo_token", token);
  return { errorCode: "NONE" };
}

function resetAuth() {
  PropertiesService.getUserProperties().deleteProperty("arlo_token");
}

function getConfig() {
  // No per-view config — the ARLO destination row fixes platform + metrics.
  return { configParams: [] };
}

function getSchema() {
  var body = arloFetch({ action: "getSchema" });
  return { schema: mapFields(body.schema) };
}

function getData(request) {
  var fields = (request.fields || []).map(function (f) { return f.name; });
  var dateRange = request.dateRange || null;
  var body = arloFetch({
    action: "getData",
    fields: fields,
    dateRange: dateRange
      ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
      : null
  });
  return {
    schema: mapFields(body.schema),
    rows: body.rows
  };
}

function arloFetch(payload) {
  var token = PropertiesService.getUserProperties().getProperty("arlo_token");
  if (!token) throw new Error("ARLO token missing. Use Edit → Manage credentials.");
  var res = UrlFetchApp.fetch(ARLO_ENDPOINT, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code !== 200) {
    throw new Error("ARLO error (" + code + "): " + res.getContentText().slice(0, 300));
  }
  return JSON.parse(res.getContentText());
}

function mapFields(fields) {
  return (fields || []).map(function (f) {
    return {
      name: f.name,
      label: f.label,
      dataType: f.dataType,
      semantics: f.semantics
    };
  });
}
