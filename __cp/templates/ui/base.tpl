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
<meta name="frontend-cp/config/environment" content="%7B%22sessionIdCookieName%22%3A%22novo_sessionid%22%2C%22modulePrefix%22%3A%22frontend-cp%22%2C%22zuoraSandboxUrl%22%3A%22https%3A//my.kayako.com/service/Backend/Hosted/Index%22%2C%22environment%22%3A%22production%22%2C%22baseURL%22%3A%22/%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%7D%2C%22assetRoot%22%3A%22/__apps/frontend/assets/__cp%22%2C%22contentSecurityPolicy%22%3A%7B%22img-src%22%3A%22*%20data%3A%22%2C%22style-src%22%3A%22%27self%27%20%27unsafe-inline%27%20https%3A//*.kayakocdn.com%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%22%2C%22font-src%22%3A%22%27self%27%20https%3A//*.kayakocdn.com%22%2C%22connect-src%22%3A%22%27self%27%20ws%3A//*.pusher.com%20https%3A//*.pusher.com%20wss%3A//*.pusher.com%20ws%3A//ws.realtime.kayako.com%20https%3A//*.realtime.kayako.com%20wss%3A//ws.realtime.kayako.com%20http%3A//api.segment.io%20https%3A//api.segment.io%20https%3A//*.fullstory.com%22%2C%22script-src%22%3A%22%27self%27%20%27unsafe-eval%27%20%27unsafe-inline%27%20https%3A//*.kayakocdn.com%20https%3A//d2wy8f7a9ursnm.cloudfront.net%20https%3A//stats.pusher.com%20https%3A//pusher.com%20https%3A//*.pusher.com%20http%3A//cdn.segment.com%20https%3A//cdn.segment.com%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%20https%3A//static.zuora.com%20https%3A//*.pingdom.com%20https%3A//*.pingdom.net%20https%3A//*.newrelic.com%20https%3A//*.nr-data.net%20https%3A//*.fullstory.com%20https%3A//*.google-analytics.com%22%2C%22frame-src%22%3A%22https%3A//*.kayako.com%20https%3A//*.kayakostage.net%20http%3A//headwayapp.co%20https%3A//headwayapp.co%20http%3A//backend%22%2C%22default-src%22%3A%5B%22%27none%27%22%5D%2C%22media-src%22%3A%5B%22%27self%27%22%5D%7D%2C%22contentSecurityPolicyMeta%22%3Atrue%2C%22APP%22%3A%7B%22autodismissTimeout%22%3A3000%2C%22updateLogRefreshTimeout%22%3A30000%2C%22viewingUsersInactiveThreshold%22%3A300000%2C%22PUSHER_OPTIONS%22%3A%7B%22disabled%22%3Afalse%2C%22logEvents%22%3Atrue%2C%22encrypted%22%3Atrue%2C%22authEndpoint%22%3A%22/api/v1/realtime/auth%22%2C%22wsHost%22%3A%22ws.realtime.kayako.com%22%2C%22httpHost%22%3A%22sockjs.realtime.kayako.com%22%7D%2C%22views%22%3A%7B%22maxLimit%22%3A999%2C%22viewsPollingInterval%22%3A60%2C%22casesPollingInterval%22%3A60%2C%22isPollingEnabled%22%3Atrue%7D%2C%22forceTrial%22%3Afalse%2C%22name%22%3A%22frontend-cp%22%2C%22version%22%3A%22v2016-07-15_12-07-production%22%7D%2C%22featureFlags%22%3A%7B%22user-note%22%3Atrue%2C%22organization-note%22%3Atrue%2C%22admin-twitter%22%3Atrue%2C%22admin-facebook%22%3Atrue%2C%22notification-badge%22%3Atrue%2C%22user-tab%22%3Afalse%2C%22can-edit-requester%22%3Afalse%2C%22admin-business-hours%22%3Atrue%2C%22admin-slas%22%3Atrue%2C%22admin-triggers%22%3Atrue%2C%22admin-monitors%22%3Atrue%2C%22apply-macro%22%3Atrue%2C%22bulk-update%22%3Atrue%2C%22roles%22%3Atrue%2C%22admin-apps-endpoints%22%3Atrue%2C%22admin-brands%22%3Atrue%2C%22admin-webhooks%22%3Atrue%2C%22advanced-search%22%3Atrue%2C%22insights%22%3Atrue%7D%2C%22froalaEditor%22%3A%7B%22key%22%3A%22GIBEVFBOHF1c1UNYVM%3D%3D%22%7D%2C%22metricsAdapters%22%3A%5B%7B%22name%22%3A%22Segment%22%2C%22environments%22%3A%5B%22production%22%2C%22staging%22%5D%2C%22config%22%3A%7B%22key%22%3A%22hBGgFGyU7yqAnhLA6P9wiivY6iMbmb4U%22%7D%7D%5D%2C%22defaultLocale%22%3A1%2C%22localStore%22%3A%7B%22defaultNamespace%22%3A%22core%22%7D%2C%22newRelicErrorReporting%22%3Atrue%2C%22headAwayApp%22%3A%7B%22key%22%3A%229JlDMJ%22%7D%2C%22bugsnag%22%3A%7B%22apiKey%22%3A%222fbf7c1482a94ccc684738033f2c1f8c%22%2C%22notifyReleaseStages%22%3A%5B%22staging%22%2C%22production%22%5D%7D%2C%22moment%22%3A%7B%22includeTimezone%22%3A%22all%22%2C%22allowEmpty%22%3Atrue%2C%22includeLocales%22%3Atrue%7D%2C%22casesPageSize%22%3A20%2C%22intl%22%3A%7B%22locales%22%3A%5B%22en-us%22%2C%22en-gb%22%5D%7D%2C%22sassOptions%22%3A%7B%22includePaths%22%3A%5B%22app/styles%22%2C%22node_modules/ember-basic-dropdown/app/styles%22%2C%22node_modules/ember-power-select/app/styles%22%2C%22app/styles/production%22%5D%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22ember-cli-mirage%22%3A%7B%22usingProxy%22%3Afalse%2C%22useDefaultPassthroughs%22%3Atrue%7D%2C%22resizeServiceDefaults%22%3A%7B%22widthSensitive%22%3Atrue%2C%22heightSensitive%22%3Afalse%2C%22debounceTimeout%22%3A200%2C%22injectionFactories%22%3A%5B%22view%22%2C%22component%22%5D%7D%2C%22exportApplicationGlobal%22%3Afalse%2C%22currentRevision%22%3A%22d9d864f323%22%7D" />
<meta http-equiv="Content-Security-Policy" content="img-src * data:; style-src 'self' 'unsafe-inline' https://*.kayakocdn.com http://cdn.headwayapp.co https://cdn.headwayapp.co; font-src 'self' https://*.kayakocdn.com; connect-src 'self' ws://*.pusher.com https://*.pusher.com wss://*.pusher.com ws://ws.realtime.kayako.com https://*.realtime.kayako.com wss://ws.realtime.kayako.com http://api.segment.io https://api.segment.io https://*.fullstory.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.kayakocdn.com https://d2wy8f7a9ursnm.cloudfront.net https://stats.pusher.com https://pusher.com https://*.pusher.com http://cdn.segment.com https://cdn.segment.com http://cdn.headwayapp.co https://cdn.headwayapp.co https://static.zuora.com https://*.pingdom.com https://*.pingdom.net https://*.newrelic.com https://*.nr-data.net https://*.fullstory.com https://*.google-analytics.com; frame-src https://*.kayako.com https://*.kayakostage.net http://headwayapp.co https://headwayapp.co http://backend; default-src 'none'; media-src 'self'; ">
<script 
src="https://d2wy8f7a9ursnm.cloudfront.net/bugsnag-2.min.js" 
data-appversion="d9d864f323" 
data-apikey="2fbf7c1482a94ccc684738033f2c1f8c">
</script>
<script>
if (typeof Bugsnag !== "undefined") {
Bugsnag.releaseStage = "production";
Bugsnag.notifyReleaseStages = ["staging","production"];

}
</script>

    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/vendor-4e03707929632a6fcbf29c9b000ce9df.css" crossorigin="anonymous" integrity="sha256-2RY/r6u50ez3YFw9rmK/NVnTV3aftU7NlSglumQXYWU= sha512-DuwsO4OcnJsIZ3zSeegvBUyAngb+U3Hln8Oy9Rk643yt1CLDtYE6yqzM3C2Grj5N/CYWKUc3hSTAhYQBkEbFrw==" >
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/frontend-cp-b440657ec64afac1a81c7fce4cb871d3.css" crossorigin="anonymous" integrity="sha256-odnfbgv1iBljlxKBih5Puw8AmqaK1nxCCF88CuFCOiY= sha512-TQzm4GXtkiilirp4MBQThEjXk2Nh0lasfIE8/3oDIYFoU8IZDRv5lkz28j573jF7PeG7FMLvelFs0ztRquMuHQ==" >

    
  </head>
  <body>
    

    <!-- TODO load only if required -->
    <script src="{{ assets('frontend') }}__cp/assets/intl/intl.complete-9f2ae624e9f622257363543be0860026.js" crossorigin="anonymous" integrity="sha256-u5aEkbAAND61nmRwLLvWYydnXndgLNExPr/pgZusVZI= sha512-BCtYrigBiu2ke3fLR1fl63LX7M4mDBDx7O0MLnLvi08XaErsfPhyVPLBCIvnCVRIhDM80JIezCAqRHatrnagiA==" ></script>

    <script src="{{ assets('frontend') }}__cp/assets/vendor-fc1efa12b64e5b5a03d24d0411f4c6dd.js" crossorigin="anonymous" integrity="sha256-zg1OLFFP/QyrbgwDfHeGmZo5N8asIat4fXHAQ6PfQ5I= sha512-rj+qyrK3OiW18N0raDTf0I/OZbGDuGfRjXsVArt4uAQpqYahHzM/YO6Y+aXIXdwX7NcOCmJD9AByKbRJE+o/Zg==" ></script>
    <script src="{{ assets('frontend') }}__cp/assets/frontend-cp-f0383305a16e662f551d05ac5cd46378.js" crossorigin="anonymous" integrity="sha256-WF+FbOaP93ifnmkZxgd3KP87aw8TrU1lpzrXl2ADtkI= sha512-bNilmpO8btT9jFILJLdlI10Yl3eh3jB9G7f3CRuOVEAUXc1x8qkXtjLqLJ6wypLzj2SdAGsJUlykhzKCfd2NPg==" ></script>

    <div id="ember-basic-dropdown-wormhole"></div>

    {% autoescape false %} {{ pingdom_monitoring_code }} {% endautoescape %}

    {% autoescape false %} {{ newrelic_monitoring_code }} {% endautoescape %}
  </body>
</html>
