<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Kayako - Powered by Kayako</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">

    <base href="/" />
<meta name="frontend-cp/config/environment" content="%7B%22sessionIdCookieName%22%3A%22novo_sessionid%22%2C%22modulePrefix%22%3A%22frontend-cp%22%2C%22environment%22%3A%22production%22%2C%22baseURL%22%3A%22/%22%2C%22locationType%22%3A%22history%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%7D%2C%22assetRoot%22%3A%22/__apps/frontend/assets/__cp%22%2C%22contentSecurityPolicy%22%3A%7B%22img-src%22%3A%22*%22%2C%22style-src%22%3A%22%27self%27%20%27unsafe-inline%27%20i.icomoon.io%20https%3A//fonts.googleapis.com%22%2C%22font-src%22%3A%22%27self%27%20i.icomoon.io%20https%3A//fonts.gstatic.com%22%2C%22connect-src%22%3A%22%27self%27%20ws%3A//ws.realtime.kayako.com%20wss%3A//ws.realtime.kayako.com%20http%3A//novo/api/v1/realtime/auth%20http%3A//api.segment.io%20https%3A//api.segment.io%22%2C%22script-src%22%3A%22%27self%27%20%27unsafe-eval%27%20https%3A//stats.pusher.com%20https%3A//pusher.com%20http%3A//cdn.segment.com%20https%3A//cdn.segment.com%22%2C%22default-src%22%3A%22%27none%27%22%2C%22media-src%22%3A%22%27self%27%22%7D%2C%22sassOptions%22%3A%7B%22includePaths%22%3A%5B%22app/styles/production%22%5D%7D%2C%22APP%22%3A%7B%22autodismissTimeout%22%3A3000%2C%22PUSHER_OPTIONS%22%3A%7B%22disabled%22%3Afalse%2C%22logEvents%22%3Atrue%2C%22encrypted%22%3Atrue%2C%22authEndpoint%22%3A%22/api/v1/realtime/auth%22%2C%22wsHost%22%3A%22ws.realtime.kayako.com%22%2C%22httpHost%22%3A%22sockjs.realtime.kayako.com%22%7D%2C%22views%22%3A%7B%22maxLimit%22%3A999%2C%22viewsPollingInterval%22%3A30%2C%22casesPollingInterval%22%3A30%2C%22isPollingEnabled%22%3Atrue%7D%2C%22name%22%3A%22frontend-cp%22%2C%22version%22%3A%22v2016-02-09_12-02-production%22%7D%2C%22featureFlags%22%3A%7B%22user-note%22%3Atrue%2C%22organization-note%22%3Atrue%2C%22admin-twitter%22%3Afalse%2C%22notification-badge%22%3Afalse%2C%22user-tab%22%3Afalse%2C%22can-edit-requester%22%3Afalse%2C%22admin-business-hours%22%3Afalse%7D%2C%22metricsAdapters%22%3A%5B%7B%22name%22%3A%22Segment%22%2C%22environments%22%3A%5B%22production%22%2C%22staging%22%5D%2C%22config%22%3A%7B%22key%22%3A%22hBGgFGyU7yqAnhLA6P9wiivY6iMbmb4U%22%7D%7D%5D%2C%22defaultLocale%22%3A%22en-us%22%2C%22localStore%22%3A%7B%22defaultNamespace%22%3A%22core%22%7D%2C%22newRelicErrorReporting%22%3Atrue%2C%22casesPageSize%22%3A20%2C%22intl%22%3A%7B%22locales%22%3A%5B%22en-us%22%2C%22en-gb%22%5D%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22ember-cli-mirage%22%3A%7B%22usingProxy%22%3Afalse%7D%2C%22exportApplicationGlobal%22%3Afalse%2C%22currentRevision%22%3A%229ffea6500e%22%7D" />

    <!--@TODO this needs to be removed for launch and self hosted-->
    <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400italic,600,600italic' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="//i.icomoon.io/public/6ae4e69a02/KayakoApp/style.css">
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/vendor-d41d8cd98f00b204e9800998ecf8427e.css" integrity="sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU= sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==" >
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/frontend-cp-bf9c359afe5fb61d31999b5862fef416.css" integrity="sha256-H/PGXpMV8MVsnN961itBtjp5/fxlc2Jew9UsffMyqHE= sha512-OUtZKcSc3IpgYa8/34DSxoDPils/KONs9V9acM0mJVTpqDF6kl7WH6PpzibeBjomwbS+WFvDrnwrkvNezvcEvQ==" >

    
  </head>
  <body>
    

    <!-- TODO load only if required -->
    <script src="{{ assets('frontend') }}__cp/assets/intl/intl.complete-d4932f9c3c31253c9d2bde19bf47e4e5.js" integrity="sha256-Ow8Rbjw3iIILHVkGRCV3MO1ZAuRaHUa+KbWkawYF3hY= sha512-+WdEgeOCEanHX08cSAQuzaWtd+P2V/RoMmb1N+hRwMS+xxReZwtzPihh4sZLRU0azvW6mUd22ayfrFA3oW/w8g==" ></script>

    <script src="{{ assets('frontend') }}__cp/assets/vendor-920f9ac459eed20688e2284017d16421.js" integrity="sha256-KgrgqAyhNDu+FJaOUvF/C+rqAQwWAl+RQyo7ZvlYGkQ= sha512-yBZEVeoVVoPFTzHnDIdoJ8OSPC04Jf9tygjDc0+ABs5MXurTtL2tSkR8gvogXaU1J1ynV0eIGcC4nB6C7aSBKQ==" ></script>
    <script src="{{ assets('frontend') }}__cp/assets/frontend-cp-21c4100fd0082eb628b797e89d8ad4fd.js" integrity="sha256-EcTGzlbuIh8Jsi1EW6cfqHhAOqEI7wKBIT0Xn4J1Z58= sha512-nTzj94ufqINsqHQ1EDcEm16Ytv6HiLkTGv/Q65Iji/ElF1nFHmIcSkvNZhRILHWaGxPjF3d1E2xWuO2N/qjvhQ==" ></script>

    <div id="ember-basic-dropdown-wormhole"></div>

    {% autoescape false %} {{ pingdom_monitoring_code }} {% endautoescape %}

    {% autoescape false %} {{ newrelic_monitoring_code }} {% endautoescape %}
  </body>
</html>
