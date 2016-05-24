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
<meta name="frontend-cp/config/environment" content="%7B%22sessionIdCookieName%22%3A%22novo_sessionid%22%2C%22modulePrefix%22%3A%22frontend-cp%22%2C%22environment%22%3A%22production%22%2C%22baseURL%22%3A%22/%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%7D%2C%22assetRoot%22%3A%22/__apps/frontend/assets/__cp%22%2C%22contentSecurityPolicy%22%3A%7B%22img-src%22%3A%22*%22%2C%22style-src%22%3A%22%27self%27%20%27unsafe-inline%27%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%22%2C%22font-src%22%3A%22%27self%27%22%2C%22connect-src%22%3A%22%27self%27%20ws%3A//ws.realtime.kayako.com%20wss%3A//ws.realtime.kayako.com%20http%3A//novo/api/v1/realtime/auth%20http%3A//api.segment.io%20https%3A//api.segment.io%22%2C%22script-src%22%3A%22%27self%27%20%27unsafe-eval%27%20https%3A//d2wy8f7a9ursnm.cloudfront.net%20https%3A//stats.pusher.com%20https%3A//pusher.com%20http%3A//cdn.segment.com%20https%3A//cdn.segment.com%20http%3A//cdn.headwayapp.co%20https%3A//cdn.headwayapp.co%20https%3A//static.zuora.com%22%2C%22frame-src%22%3A%22http%3A//headwayapp.co%20https%3A//headwayapp.co%20https%3A//apisandbox.zuora.com%22%2C%22default-src%22%3A%22%27none%27%22%2C%22media-src%22%3A%22%27self%27%22%7D%2C%22APP%22%3A%7B%22autodismissTimeout%22%3A3000%2C%22updateLogRefreshTimeout%22%3A30000%2C%22viewingUsersInactiveThreshold%22%3A300000%2C%22PUSHER_OPTIONS%22%3A%7B%22disabled%22%3Afalse%2C%22logEvents%22%3Atrue%2C%22encrypted%22%3Atrue%2C%22authEndpoint%22%3A%22/api/v1/realtime/auth%22%2C%22wsHost%22%3A%22ws.realtime.kayako.com%22%2C%22httpHost%22%3A%22sockjs.realtime.kayako.com%22%7D%2C%22views%22%3A%7B%22maxLimit%22%3A999%2C%22viewsPollingInterval%22%3A60%2C%22casesPollingInterval%22%3A60%2C%22isPollingEnabled%22%3Atrue%7D%2C%22name%22%3A%22frontend-cp%22%2C%22version%22%3A%22v2016-05-24_10-05-production%22%7D%2C%22featureFlags%22%3A%7B%22user-note%22%3Atrue%2C%22organization-note%22%3Atrue%2C%22admin-twitter%22%3Atrue%2C%22admin-facebook%22%3Afalse%2C%22notification-badge%22%3Atrue%2C%22user-tab%22%3Afalse%2C%22can-edit-requester%22%3Afalse%2C%22admin-business-hours%22%3Atrue%2C%22admin-slas%22%3Afalse%2C%22admin-triggers%22%3Afalse%2C%22admin-monitors%22%3Afalse%2C%22apply-macro%22%3Atrue%2C%22bulk-update%22%3Atrue%2C%22roles%22%3Atrue%2C%22admin-account-overview%22%3Afalse%2C%22admin-apps-endpoints%22%3Afalse%2C%22admin-brands%22%3Afalse%2C%22advanced-search%22%3Atrue%7D%2C%22metricsAdapters%22%3A%5B%7B%22name%22%3A%22Segment%22%2C%22environments%22%3A%5B%22production%22%2C%22staging%22%5D%2C%22config%22%3A%7B%22key%22%3A%22hBGgFGyU7yqAnhLA6P9wiivY6iMbmb4U%22%7D%7D%5D%2C%22defaultLocale%22%3A1%2C%22localStore%22%3A%7B%22defaultNamespace%22%3A%22core%22%7D%2C%22newRelicErrorReporting%22%3Atrue%2C%22headAwayApp%22%3A%7B%22key%22%3A%229JlDMJ%22%7D%2C%22bugsnag%22%3A%7B%22apiKey%22%3A%222fbf7c1482a94ccc684738033f2c1f8c%22%2C%22notifyReleaseStages%22%3A%5B%22staging%22%2C%22production%22%5D%7D%2C%22casesPageSize%22%3A20%2C%22intl%22%3A%7B%22locales%22%3A%5B%22en-us%22%2C%22en-gb%22%5D%7D%2C%22sassOptions%22%3A%7B%22includePaths%22%3A%5B%22app/styles%22%2C%22node_modules/ember-basic-dropdown/app/styles%22%2C%22node_modules/ember-power-select/app/styles%22%2C%22app/styles/production%22%5D%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22ember-cli-mirage%22%3A%7B%22usingProxy%22%3Afalse%2C%22useDefaultPassthroughs%22%3Atrue%7D%2C%22resizeServiceDefaults%22%3A%7B%22widthSensitive%22%3Atrue%2C%22heightSensitive%22%3Afalse%2C%22debounceTimeout%22%3A200%2C%22injectionFactories%22%3A%5B%22view%22%2C%22component%22%5D%7D%2C%22exportApplicationGlobal%22%3Afalse%2C%22currentRevision%22%3A%2294a2854ff9%22%7D" />
<script 
src="https://d2wy8f7a9ursnm.cloudfront.net/bugsnag-2.min.js" 
data-appversion="94a2854ff9" 
data-apikey="2fbf7c1482a94ccc684738033f2c1f8c">
</script>
<script>
if (typeof Bugsnag !== "undefined") {
Bugsnag.releaseStage = "production";
Bugsnag.notifyReleaseStages = ["staging","production"];

}
</script>

    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/vendor-4f2891f1413e443f02e0fbffb0bc6b61.css" crossorigin="anonymous" integrity="sha256-RV48V5og2D0wgV5BC9VlBy6TarDY9WX7Xt10wnjbUxc= sha512-SQZE1LZ5eNqCnT21hf9vlSuDogXm5JVHBx1JC6uotqy1O0l7p/Gmbi0gWMbx7aIruG38vSRBN203RjUvtixwlA==" >
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/frontend-cp-30debbc0cac518e621be74598118ed64.css" crossorigin="anonymous" integrity="sha256-6JLGsNxG4v4wRVeRESQMYE/lFBOSnD1uIcCabsCzOO8= sha512-Lcve1rdC102Pk2DexYSUt/wIJkKWqNKpv2VU1BI8z8fzeJPgs1Jv3AgqANI9vqFooCX97KicccMScaT8iMnzMg==" >

    
  </head>
  <body>
    

    <!-- TODO load only if required -->
    <script src="{{ assets('frontend') }}__cp/assets/intl/intl.complete-faf5482dfe15f99980683768da777c4c.js" crossorigin="anonymous" integrity="sha256-hq3UpuhliBds5buVZgUbrw80ozi8qNz9bWgQANgOO5c= sha512-LcBSSjjqsFRFIImCYTYS+oWlKieFnGwYJJIRb+rp95pUw6USbWHtHHKIM6rbDLM7Pqz7rWBs2KyRabachYkkQQ==" ></script>

    <script src="{{ assets('frontend') }}__cp/assets/vendor-32b8354a29b7dfce04b661f287746d7a.js" crossorigin="anonymous" integrity="sha256-/cQVCcoXd56aYDAmB8WHP/DQnS3nnox8IGWKprKQ7gc= sha512-Xz4MC/QhIpxvLUAFcl370ZhNhO/EzXbGrZ3tgnfkktxHrQDUHxvPbgrG6dMhxhf+xIYacSDVv7Acij/iUu4F/g==" ></script>
    <script src="{{ assets('frontend') }}__cp/assets/frontend-cp-2c2c68acbb2b3b6f124ece955e78bdbe.js" crossorigin="anonymous" integrity="sha256-4u2Nw7/jlp3dyg3oAFxKl4NvtcMOHd1RouvIzjmpioQ= sha512-iQCudp6j+QhW2QArXoUlTkcwLYKubIayYNOrKvYaz/dHvcqWk0b/O469Y7rhESu+voqhyXfSs2Ql5fNoTvJp8w==" ></script>

    <div id="ember-basic-dropdown-wormhole"></div>

    {% autoescape false %} {{ pingdom_monitoring_code }} {% endautoescape %}

    {% autoescape false %} {{ newrelic_monitoring_code }} {% endautoescape %}
  </body>
</html>
