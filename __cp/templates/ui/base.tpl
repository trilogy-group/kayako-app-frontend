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
<meta name="frontend-cp/config/environment" content="%7B%22sessionIdCookieName%22%3A%22novo_sessionid%22%2C%22modulePrefix%22%3A%22frontend-cp%22%2C%22environment%22%3A%22production%22%2C%22baseURL%22%3A%22/%22%2C%22locationType%22%3A%22history%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%7D%2C%22assetRoot%22%3A%22/__apps/frontend/assets/__cp%22%2C%22contentSecurityPolicy%22%3A%7B%22img-src%22%3A%22*%22%2C%22style-src%22%3A%22%27self%27%20%27unsafe-inline%27%20i.icomoon.io%20https%3A//fonts.googleapis.com%22%2C%22font-src%22%3A%22%27self%27%20i.icomoon.io%20https%3A//fonts.gstatic.com%22%2C%22connect-src%22%3A%22%27self%27%20ws%3A//ws.realtime.kayako.com%20wss%3A//ws.realtime.kayako.com%20http%3A//novo/api/v1/realtime/auth%20http%3A//api.segment.io%20https%3A//api.segment.io%22%2C%22script-src%22%3A%22%27self%27%20%27unsafe-eval%27%20https%3A//stats.pusher.com%20https%3A//pusher.com%20http%3A//cdn.segment.com%20https%3A//cdn.segment.com%22%2C%22default-src%22%3A%22%27none%27%22%2C%22media-src%22%3A%22%27self%27%22%7D%2C%22sassOptions%22%3A%7B%22includePaths%22%3A%5B%22app/styles%22%2C%22node_modules/ember-basic-dropdown/app/styles%22%2C%22node_modules/ember-power-select/app/styles%22%2C%22node_modules/ember-power-select-typeahead/app/styles%22%2C%22app/styles/production%22%5D%7D%2C%22APP%22%3A%7B%22autodismissTimeout%22%3A3000%2C%22PUSHER_OPTIONS%22%3A%7B%22disabled%22%3Afalse%2C%22logEvents%22%3Atrue%2C%22encrypted%22%3Atrue%2C%22authEndpoint%22%3A%22/api/v1/realtime/auth%22%2C%22wsHost%22%3A%22ws.realtime.kayako.com%22%2C%22httpHost%22%3A%22sockjs.realtime.kayako.com%22%7D%2C%22views%22%3A%7B%22maxLimit%22%3A999%2C%22viewsPollingInterval%22%3A30%2C%22casesPollingInterval%22%3A30%2C%22isPollingEnabled%22%3Atrue%7D%2C%22name%22%3A%22frontend-cp%22%2C%22version%22%3A%22v2016-03-07_09-03-production%22%7D%2C%22featureFlags%22%3A%7B%22user-note%22%3Atrue%2C%22organization-note%22%3Atrue%2C%22admin-twitter%22%3Atrue%2C%22notification-badge%22%3Afalse%2C%22user-tab%22%3Afalse%2C%22can-edit-requester%22%3Afalse%2C%22admin-business-hours%22%3Atrue%2C%22apply-macro%22%3Atrue%2C%22bulk-update%22%3Atrue%2C%22roles%22%3Afalse%7D%2C%22metricsAdapters%22%3A%5B%7B%22name%22%3A%22Segment%22%2C%22environments%22%3A%5B%22production%22%2C%22staging%22%5D%2C%22config%22%3A%7B%22key%22%3A%22hBGgFGyU7yqAnhLA6P9wiivY6iMbmb4U%22%7D%7D%5D%2C%22defaultLocale%22%3A1%2C%22localStore%22%3A%7B%22defaultNamespace%22%3A%22core%22%7D%2C%22newRelicErrorReporting%22%3Atrue%2C%22casesPageSize%22%3A20%2C%22intl%22%3A%7B%22locales%22%3A%5B%22en-us%22%2C%22en-gb%22%5D%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22ember-cli-mirage%22%3A%7B%22usingProxy%22%3Afalse%7D%2C%22exportApplicationGlobal%22%3Afalse%2C%22currentRevision%22%3A%22bd1f04a6b0%22%7D" />

    <!--@TODO this needs to be removed for launch and self hosted-->
    <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400italic,600,600italic' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="//i.icomoon.io/public/6ae4e69a02/KayakoApp/style.css">
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/vendor-b45792e32350f0660aebd461d2621e28.css" integrity="sha256-2bGwIReV4tobzsCX+hWndMjJ93FxZfv9+S5zIsuaDks= sha512-xvpZEYicZb8wcYHS7cmX4R2MBiWOyuN8rpt//TEnONhGwt1zVPeCOW23SDYUKOc0y2yCcPCveKxtQEs7Vj1i+Q==" >
    <link rel="stylesheet" href="{{ assets('frontend') }}__cp/assets/frontend-cp-8935dedbd126d95490a8b0751806d283.css" integrity="sha256-iQwj48ZarNUTSnc5gVd8t9rp0iBL3Uzj/vo/4oA7wwc= sha512-3uaIerz/PPS0UEx1qUWb5Mro9nZvST962U2BssW5HEKvzyOyq2M1LQQSQk3QOuV5c31Gw5aI+F0X12orZdbtVQ==" >

    
  </head>
  <body>
    

    <!-- TODO load only if required -->
    <script src="{{ assets('frontend') }}__cp/assets/intl/intl.complete-faf5482dfe15f99980683768da777c4c.js" integrity="sha256-hq3UpuhliBds5buVZgUbrw80ozi8qNz9bWgQANgOO5c= sha512-LcBSSjjqsFRFIImCYTYS+oWlKieFnGwYJJIRb+rp95pUw6USbWHtHHKIM6rbDLM7Pqz7rWBs2KyRabachYkkQQ==" ></script>

    <script src="{{ assets('frontend') }}__cp/assets/vendor-fef99c9e3789c26bb09f27423446cdfc.js" integrity="sha256-zNPWNIChxpEjWi0ErefyWL2jlPi3vrwJ5kiCS9G3Cho= sha512-xLIe7LkOxgcNiGnitfcHFJJzujU/Ry8UcaEKh0/wpg8VAL9kUu6AZdUYrIbguCsbxeyvJpqhpCjZKAj0FSV2yg==" ></script>
    <script src="{{ assets('frontend') }}__cp/assets/frontend-cp-dc969a5e513f32c9f964b628d55c745b.js" integrity="sha256-voz1sg4+W075Mk+yCLcQkuansHU/y7lem8kure/wTL0= sha512-XliQvsjC8seZheq1hSE147x67C2NsokVAyeCgbXOfJ0H6DQveUWU7NQ5Lg7h21TREyaDdaUh3KjdaL4A69R1tA==" ></script>

    <div id="ember-basic-dropdown-wormhole"></div>

    {% autoescape false %} {{ pingdom_monitoring_code }} {% endautoescape %}

    {% autoescape false %} {{ newrelic_monitoring_code }} {% endautoescape %}
  </body>
</html>
