(function () {
  "use strict";

  var config = window.SelfHostedAnalyticsConfig || {};
  var endpoint = typeof config.endpoint === "string" ? config.endpoint : "";
  var respectPrivacySignals = config.respectPrivacySignals !== false;
  var optOutKey = "self-hosted-analytics-opt-out";
  var lastPath = "";
  var enabled = false;

  function optedOut() {
    try {
      if (window.location.hash === "#analytics-off" || window.location.pathname === "/analytics-optout") {
        window.localStorage.setItem(optOutKey, "1");
        return true;
      }
      return window.localStorage.getItem(optOutKey) === "1";
    } catch (_) {
      return window.location.hash === "#analytics-off" || window.location.pathname === "/analytics-optout";
    }
  }

  function privacySignalSet() {
    if (!respectPrivacySignals) return false;
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  }

  function id() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    } catch (_) {}
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }

  function utmFields() {
    var query;
    try { query = new URLSearchParams(window.location.search); } catch (_) { return undefined; }
    var utm = {};
    ["source", "medium", "campaign"].forEach(function (key) {
      var value = query.get("utm_" + key);
      if (value) utm[key] = value.slice(0, 100);
    });
    return Object.keys(utm).length ? utm : undefined;
  }

  function send(type, props) {
    try {
      if (!enabled || !endpoint || document.prerendering || optedOut() || privacySignalSet()) return;
      var payload = {
        event_id: id(),
        v: 1,
        type: type,
        path: window.location.pathname || "/"
      };
      if (type === "pageview") {
        if (document.referrer) payload.referrer = document.referrer;
        var utm = utmFields();
        if (utm) payload.utm = utm;
      } else if (props && typeof props === "object" && !Array.isArray(props)) {
        payload.props = props;
      }
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        try {
          if (navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }))) return;
        } catch (_) {}
      }
      fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: body
      }).catch(function () {});
    } catch (_) {
      // Analytics must never surface errors to site code.
    }
  }

  function pageview() {
    try {
      if (document.prerendering || document.visibilityState === "hidden" || optedOut() || privacySignalSet()) return;
      var path = window.location.pathname || "/";
      if (path === lastPath) return;
      lastPath = path;
      send("pageview");
    } catch (_) {}
  }

  function installNavigationHooks() {
    ["pushState", "replaceState"].forEach(function (method) {
      try {
        var original = history[method];
        if (typeof original !== "function") return;
        history[method] = function () {
          var result = original.apply(this, arguments);
          Promise.resolve().then(pageview);
          return result;
        };
      } catch (_) {}
    });
    window.addEventListener("popstate", pageview);
  }

  try {
    window.analytics = window.analytics || {};
    window.analytics.track = function (name, props) {
      try {
        if (typeof name !== "string" || !/^[a-z][a-z0-9_]{0,31}$/.test(name) || name === "pageview") return;
        send(name, props);
      } catch (_) {}
    };
    if (optedOut() || privacySignalSet()) return;
    if (!endpoint) return;
    enabled = true;
    installNavigationHooks();
    if (document.prerendering) {
      document.addEventListener("prerenderingchange", pageview, { once: true });
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", pageview, { once: true });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") pageview();
      });
    } else {
      pageview();
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") pageview();
      });
    }
  } catch (_) {}
})();
