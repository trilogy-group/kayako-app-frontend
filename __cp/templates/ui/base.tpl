<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">

    
<meta name="frontend-cp/config/environment" content="%7B%22sessionIdCookieName%22%3A%22novo_sessionid%22%2C%22modulePrefix%22%3A%22frontend-cp%22%2C%22zuoraSandboxUrl%22%3A%22https%3A//my.kayakostage.net/service/Backend/Hosted/Index%22%2C%22environment%22%3A%22production%22%2C%22rootURL%22%3A%22/%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%7D%2C%22contentSecurityPolicy%22%3A%7B%22img-src%22%3A%22*%20data%3A%22%2C%22style-src%22%3A%22%27self%27%20%27unsafe-inline%27%20https%3A//*.kayakocdn.com%20https%3A//assets.kayakostage.net%20https%3A//assets.kayako.com%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%20https%3A//fonts.googleapis.com%22%2C%22font-src%22%3A%22%27self%27%20https%3A//assets.kayakostage.net%20https%3A//assets.kayako.com%20https%3A//*.kayakocdn.com%20https%3A//fonts.gstatic.com%22%2C%22connect-src%22%3A%22%27self%27%20https%3A//support.kayako.com%20ws%3A//*.pusher.com%20https%3A//*.pusher.com%20wss%3A//*.pusher.com%20ws%3A//ws.realtime.kayako.com%20https%3A//*.realtime.kayako.com%20wss%3A//ws.realtime.kayako.com%20http%3A//api.segment.io%20https%3A//api.segment.io%20https%3A//*.fullstory.com%20https%3A//*.kayakocdn.com%20https%3A//*.mixpanel.com%20https%3A//*.kissmetrics.com%20https%3A//assets.kayakostage.net%20https%3A//assets.kayako.com%22%2C%22script-src%22%3A%22%27self%27%20%27unsafe-eval%27%20%27unsafe-inline%27%20https%3A//*.kayakocdn.com%20https%3A//assets.kayakostage.net%20https%3A//assets.kayako.com%20https%3A//d2wy8f7a9ursnm.cloudfront.net%20https%3A//stats.pusher.com%20https%3A//pusher.com%20https%3A//*.pusher.com%20http%3A//cdn.segment.com%20https%3A//cdn.segment.com%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%20https%3A//static.zuora.com%20https%3A//*.pingdom.com%20https%3A//*.pingdom.net%20https%3A//*.nr-data.net%20https%3A//*.fullstory.com%20https%3A//*.google-analytics.com%20https%3A//*.kissmetrics.com%20https%3A//*.mxpnl.com%20https%3A//heapanalytics.com%20https%3A//*.heapanalytics.com%20https%3A//*.totango.com%22%2C%22frame-src%22%3A%22https%3A//*.kayako.com%20https%3A//*.kayakostage.net%20http%3A//headwayapp.co%20https%3A//headwayapp.co%20http%3A//backend%22%2C%22media-src%22%3A%22%27self%27%20https%3A//assets.kayakostage.net%20https%3A//assets.kayako.com%20https%3A//*.kayakocdn.com%22%2C%22default-src%22%3A%5B%22%27none%27%22%5D%7D%2C%22contentSecurityPolicyMeta%22%3Atrue%2C%22APP%22%3A%7B%22updateLogRefreshTimeout%22%3A30000%2C%22viewingUsersInactiveThreshold%22%3A300000%2C%22PUSHER_OPTIONS%22%3A%7B%22logEvents%22%3Atrue%2C%22encrypted%22%3Atrue%2C%22authEndpoint%22%3A%22/api/v1/realtime/auth%22%2C%22wsHost%22%3A%22ws.realtime.kayako.com%22%2C%22httpHost%22%3A%22sockjs.realtime.kayako.com%22%7D%2C%22views%22%3A%7B%22maxLimit%22%3A999%2C%22viewsPollingInterval%22%3A60%2C%22casesPollingInterval%22%3A60%7D%2C%22forceTrial%22%3Afalse%2C%22name%22%3A%22frontend-cp%22%2C%22version%22%3A%220.0.0+458f6d5d%22%7D%2C%22featureFlags%22%3A%7B%22user-note%22%3Atrue%2C%22organization-note%22%3Atrue%2C%22admin-twitter%22%3Atrue%2C%22admin-facebook%22%3Atrue%2C%22notification-badge%22%3Atrue%2C%22user-tab%22%3Afalse%2C%22can-edit-requester%22%3Afalse%2C%22admin-business-hours%22%3Atrue%2C%22admin-slas%22%3Atrue%2C%22admin-triggers%22%3Atrue%2C%22admin-monitors%22%3Atrue%2C%22apply-macro%22%3Atrue%2C%22bulk-update%22%3Atrue%2C%22roles%22%3Atrue%2C%22admin-apps-endpoints%22%3Atrue%2C%22admin-brands%22%3Atrue%2C%22admin-webhooks%22%3Atrue%2C%22advanced-search%22%3Atrue%2C%22email-dns-status%22%3Atrue%2C%22insights%22%3Atrue%2C%22keyboard-shortcuts%22%3Atrue%7D%2C%22froalaEditor%22%3A%7B%22key%22%3A%22GIBEVFBOHF1c1UNYVM%3D%3D%22%7D%2C%22metricsAdapters%22%3A%5B%7B%22name%22%3A%22Segment%22%2C%22environments%22%3A%5B%22production%22%5D%2C%22config%22%3A%7B%22key%22%3A%22jSiherbyTwW3twI4Yqv0vzhhK2LdWoQU%22%7D%7D%5D%2C%22defaultLocale%22%3A1%2C%22localStore%22%3A%7B%22defaultNamespace%22%3A%22core%22%7D%2C%22headAwayApp%22%3A%7B%22key%22%3A%229JlDMJ%22%7D%2C%22bugsnag%22%3A%7B%22apiKey%22%3A%22dee7cbbc59697623dc4372a809972e6c%22%2C%22notifyReleaseStages%22%3A%5B%22production%22%5D%7D%2C%22moment%22%3A%7B%22includeTimezone%22%3A%22all%22%2C%22allowEmpty%22%3Atrue%2C%22includeLocales%22%3Atrue%7D%2C%22messengerApiUrl%22%3A%22https%3A//support.kayako.com/api/v1%22%2C%22messengerCdnUrl%22%3A%22https%3A//support.kayakocdn.com/__apps/widget/assets/visitor%22%2C%22casesPageSize%22%3A20%2C%22intl%22%3A%7B%22locales%22%3A%5B%22en-us%22%2C%22en-gb%22%5D%7D%2C%22ember-cli-mirage%22%3A%7B%22excludeFilesFromBuild%22%3Atrue%2C%22usingProxy%22%3Afalse%2C%22useDefaultPassthroughs%22%3Atrue%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22something%22%3A%22test%22%2C%22resizeServiceDefaults%22%3A%7B%22widthSensitive%22%3Atrue%2C%22heightSensitive%22%3Atrue%2C%22debounceTimeout%22%3A200%2C%22injectionFactories%22%3A%5B%22view%22%2C%22component%22%5D%7D%2C%22exportApplicationGlobal%22%3Afalse%2C%22currentRevision%22%3A%22458f6d5d2d%22%7D" />
<meta http-equiv="Content-Security-Policy" content="img-src * data:; style-src 'self' 'unsafe-inline' https://*.kayakocdn.com https://assets.kayakostage.net https://assets.kayako.com http://cdn.headwayapp.co https://cdn.headwayapp.co https://fonts.googleapis.com; font-src 'self' https://assets.kayakostage.net https://assets.kayako.com https://*.kayakocdn.com https://fonts.gstatic.com; connect-src 'self' https://support.kayako.com ws://*.pusher.com https://*.pusher.com wss://*.pusher.com ws://ws.realtime.kayako.com https://*.realtime.kayako.com wss://ws.realtime.kayako.com http://api.segment.io https://api.segment.io https://*.fullstory.com https://*.kayakocdn.com https://*.mixpanel.com https://*.kissmetrics.com https://assets.kayakostage.net https://assets.kayako.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.kayakocdn.com https://assets.kayakostage.net https://assets.kayako.com https://d2wy8f7a9ursnm.cloudfront.net https://stats.pusher.com https://pusher.com https://*.pusher.com http://cdn.segment.com https://cdn.segment.com http://cdn.headwayapp.co https://cdn.headwayapp.co https://static.zuora.com https://*.pingdom.com https://*.pingdom.net https://*.nr-data.net https://*.fullstory.com https://*.google-analytics.com https://*.kissmetrics.com https://*.mxpnl.com https://heapanalytics.com https://*.heapanalytics.com https://*.totango.com; frame-src https://*.kayako.com https://*.kayakostage.net http://headwayapp.co https://headwayapp.co http://backend; media-src 'self' https://assets.kayakostage.net https://assets.kayako.com https://*.kayakocdn.com; default-src 'none'; ">

    <link rel="stylesheet" href="https://assets.kayakostage.net/assets/vendor-69f1b7b610eebe5b47810e71f17dffc8.css" crossorigin="anonymous" integrity="sha256-Iy9PcifJVVjkmyE4I2vrWqIKnlU3SkuDCxcmhfaY0zQ= sha512-7EdriOlV9XuoEzKCeMdlVbJ7zuUD8SHW/yYpQbrBvJfh5iBsChEXUY/ALVE9tje2vutVG4U7JKTdsf7gcualDw==" >
    <link rel="stylesheet" href="https://assets.kayakostage.net/assets/frontend-cp-088ca254c607f4a0c7f5b41de7e6bbdf.css" crossorigin="anonymous" integrity="sha256-UnYLNSLJFFL32/jLT0/2EPr+pGdIMFPmjokJQCZ+Hn0= sha512-D51QW8EFjh3Rcmn61Rw9Ly9gYqnmfX0tD5/9dJHujIru6YW4FZoqRgziLHLL1He5GD5Zmtvz+5dWIo2/cIRKGw==" >

    
  </head>
  <body>
    
    <script>
if (!('Intl' in window)) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = (window.ASSET_ROOT || '') + 'https://assets.kayakostage.net/assets/intl/intl.complete-b4b949624aee7e9988cfdd5c09db2869.js';
  script.defer = true;
  document.body.appendChild(script);
}
</script>

    <script src="https://assets.kayakostage.net/assets/vendor-8bc361dde117e12fe83f06b6dfef021f.js" crossorigin="anonymous" defer integrity="sha256-1VH/5ZBEp9h4dZ8EmRwhHWlSEaNr7WbZgIK1j84upGY= sha512-l+ZEIVftrARlr0gctv2G7a+8gu+FBnYqWwwj+Qkv3n3f6WVG8B0AuD4Xijy1HFQsRUxywumG9A3PSRaqoD4s+A==" ></script>
    <script src="https://assets.kayakostage.net/assets/frontend-cp-3a88abfc7b87576444e9a6721e623ea4.js" crossorigin="anonymous" defer integrity="sha256-gG2zf0sHSYvYcee6EJyb6J/BbHlfVnBei3OBetM4hbc= sha512-tZNn5JbfhYmsGIVkwK3hOciE2n8PTSAGMsDK8MWl7mOVwlCFLozGl2bV1GmE99M3rVPqDEdiTJbXQtICFKsIAQ==" ></script>

    <div id="ember-basic-dropdown-wormhole"></div>

    <div id="preboot-spinner" style="position: absolute; top: 0; right:
      0; bottom: 0; left: 0; display: flex; align-items: center;
      justify-content: center;">
      <img width="39" height="39" src="https://assets.kayakostage.net/images/K-loader-grey-light-f540a6b516ce46e29f5be80642e65f19.gif">
    </div>

    <!-- Messenger -->
    <div id="Kykw__app" class="k-widget"></div>
  </body>
</html>
