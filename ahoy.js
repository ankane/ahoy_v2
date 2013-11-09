/*
 * Ahoy.js - 0.0.1
 * Super simple visit tracking
 * https://github.com/ankane/ahoy
 * MIT License
 */

(function () {
  "use strict";

  // cookies

  function setCookie(visitId) {
    document.cookie = "ahoy=" + visitId + "; expires=" + (new Date((new Date()).getTime() + 5000)).toUTCString();
  }

  function cookieExists() {
    return document.cookie.indexOf("ahoy=") !== -1;
  }

  // mobile detection

  // http://stackoverflow.com/a/15050887/1177228
  function mobile() {
    return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
  }

  // query parameters

  // http://stackoverflow.com/a/3855394/1177228
  function queryParams() {
    var a = window.location.search.substr(1).split("&");
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p=a[i].split('=');
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  }

  // location

  function getLocation(callback) {
    $.getJSON("https://freegeoip.net/json/", callback);
  }

  // ajax

  // TODO w/o jQuery

  // visit id

  // http://stackoverflow.com/a/16693578/1177228
  function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
  }

  // main

  if (cookieExists()) {
    console.log("Active visit");
  } else {
    // set cookie
    var visitId = guid();
    setCookie(visitId);

    if (cookieExists()) {
      console.log("Visit started", visitId);

      var data = {
        visit_id: visitId,
        user_agent: navigator.userAgent,
        mobile: mobile()
      };

      // referrer
      if (document.referrer.length > 0) {
        data.referrer = document.referrer;
        var r = /:\/\/(.[^/]+)/;
        data.referring_domain = document.referrer.match(r)[1];
      }

      // utm params
      var params = queryParams();
      var utm_params = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      for (var i = 0; i < utm_params.length; i++) {
        var utm_param = utm_params[i];
        if (params[utm_param]) {
          data[utm_param] = params[utm_param];
        }
      }

      getLocation( function(response) {
        for (var i in response) {
          if (response[i]) {
            data[i] = response[i];
          }
        }
        if (data.areacode) {
          data.area_code = data.areacode;
          delete data.areacode;
        }
        if (data.zipcode) {
          data.zip_code = data.zipcode;
          delete data.zipcode;
        }

        $.post("/visits", data);
      });
    } else {
      console.log("Cookies disabled")
    }
  }

}());
