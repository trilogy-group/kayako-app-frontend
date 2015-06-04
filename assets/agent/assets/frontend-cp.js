/* jshint ignore:start */

/* jshint ignore:end */

define('frontend-cp/adapters/-intl-adapter', ['exports', 'ember', 'ember-intl/models/intl-get-result', 'ember-intl/models/locale', 'ember-intl/adapter'], function (exports, Ember, IntlGetResult, Locale, IntlAdapter) {

    'use strict';

    function normalize(fullName) {
        Ember['default'].assert('Lookup name must be a string', typeof fullName === 'string');

        return fullName.toLowerCase();
    }

    exports['default'] = IntlAdapter['default'].extend({
        findLanguage: function findLanguage(locale) {
            if (locale instanceof Locale['default']) {
                return locale;
            }

            if (typeof locale === 'string') {
                return this.container.lookup('locale:' + normalize(locale));
            }
        },

        findTranslation: function findTranslation(locales, translationKey) {
            var container = this.container;
            var locale, translation, key;

            for (var i = 0, len = locales.length; i < len; i++) {
                key = locales[i];
                locale = this.findLanguage(key);

                if (locale) {
                    translation = locale.getValue(translationKey);

                    if (typeof translation !== 'undefined') {
                        return new IntlGetResult['default'](translation, key);
                    }
                }
            }
        }
    });

});
define('frontend-cp/adapters/access-log', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'accesslogs';
    }
  });

});
define('frontend-cp/adapters/activity', function () {

	'use strict';

	// import ApplicationAdapter from './application';
	//
	// export default ApplicationAdapter.extend({
	//   // replaceQueryParams: {
	//   //   userId: 'user'
	//   // }
	//
	//   buildURLFragment(type, id, snapshot, requestType, query) {
	//     let url = [];
	//     let hasParentURL = false;
	//
	//     if (snapshot) {
	//       snapshot.type.eachRelationship((name, relationship) => {
	//         if (relationship.options.parent) {
	//           hasParentURL = true;
	//           let parent = snapshot.belongsTo(name);
	//           let adapter = get(this, 'store').adapterFor(parent.modelName);
	//           url.push(adapter.buildURLFragment(parent.modelName, parent.id, parent, requestType, query));
	//           let reverseRelationship = snapshot.type.inverseFor(name);
	//           let relationshipMeta = parent.type.metaForProperty(reverseRelationship.name);
	//           url.push(relationshipMeta.options.url || reverseRelationship.name);
	//         }
	//       });
	//     // } else if (this.replaceQueryParams) {
	//     //   _.each(this.replaceQueryParams, (modelName, queryParam) => {
	//     //     let adapter = get(this, 'store').adapterFor(modelName);
	//     //     let value = query[queryParam];
	//     //     delete query[queryParam];
	//     //     url.push(adapter.buildURLFragment(modelName, value, null, requestType, query));
	//     //   });
	//     }
	//
	//     if (!hasParentURL && type) {
	//       let path = this.pathForType(type);
	//       if (path) { url.push(path); }
	//     }
	//
	//     if (id) {
	//       url.push(encodeURIComponent(id));
	//     }
	//
	//     return url.join('/');
	//   }
	// });

});
define('frontend-cp/adapters/application', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  var get = Ember['default'].get;

  exports['default'] = DS['default'].RESTAdapter.extend({
    namespace: 'api/v1',
    primaryRecordKey: 'data',
    sessionService: Ember['default'].inject.service('session'),

    headers: (function () {
      return {
        // 'X-Session-ID': this.get('sessionService.sessionId'),
        'X-Portal': 'admin',
        'Accept': 'application/json',
        'X-Options': 'flat'
      };
    }).property('session.sessionId'),

    buildURL: function buildURL() {
      var url = [];
      var prefix = this.getURLPrefix();
      if (prefix) {
        url.push(prefix);
      }
      url.push(this.buildURLFragment.apply(this, arguments));
      url = url.join('/');

      var host = get(this, 'host');
      if (!host && url && url.charAt(0) !== '/') {
        url = '/' + url;
      }

      return url;
    },

    buildURLFragment: function buildURLFragment(type, id, snapshot, requestType, query) {
      var url = [];
      var inverseRelationship = undefined;
      var store = get(this, 'store');
      var typeObject = store.modelFor(type);
      var parentSnapshot = undefined;

      typeObject.eachRelationship(function (name, relationship) {
        if (relationship.options.parent) {
          // Entity representing the parent
          if (snapshot) {
            parentSnapshot = snapshot.belongsTo(name);
          } else if (query.parent) {
            parentSnapshot = query.parent._createSnapshot();
            delete query.parent;
          }
          // The inverse relationship (parent-child)
          inverseRelationship = typeObject.inverseFor(name);
        }
      });

      if (parentSnapshot) {
        // Adapter for the parent entity
        var adapter = store.adapterFor(parentSnapshot.modelName);
        // Build the URL for the parent entity
        url.push(adapter.buildURLFragment(parentSnapshot.modelName, parentSnapshot.id, parentSnapshot, requestType, query));
        // Options hash for the inverse relationship
        var relationshipMeta = parentSnapshot.type.metaForProperty(inverseRelationship.name);
        url.push(relationshipMeta.options.url || this.pathForType(type));
      } else {
        url.push(this.pathForType(type));
      }

      if (id) {
        url.push(encodeURIComponent(id));
      }

      return url.join('/');
    },

    urlPrefix: function urlPrefix(path, parentURL) {
      var host = get(this, 'host');
      var url = [];

      // Protocol relative url
      if (/^\/\//.test(path)) {} else if (path.charAt(0) === '/') {
        if (host) {
          path = path.slice(1);
          url.push(host);
        }
        // Relative path
      } else if (!/^http(s)?:\/\//.test(path)) {
        url.push(parentURL);
      }
      url.push(path);

      return url.join('/');
    },

    getURLPrefix: function getURLPrefix() {
      var url = [];
      var host = this.get('host');
      var namespace = this.get('namespace');
      if (host) {
        url.push(host);
      }
      if (namespace) {
        url.push(namespace);
      }

      return url.join('/');
    },

    // If the items fetched via hasMany relationship refer to the related entity
    // as their parent (via "parent" property in options), a property with the
    // parent's ID will be added to every child.
    // Ideally it's a job of a serializer, but this is the only place where we can
    // get access the relationship object.
    findHasMany: function findHasMany(store, snapshot, url, relationship) {
      var _this = this;

      return this._super.apply(this, arguments).then(function (payload) {
        var inverse = snapshot.type.inverseFor(relationship.name);
        if (inverse && payload[_this.primaryRecordKey]) {
          payload[_this.primaryRecordKey].forEach(function (entry) {
            if (!entry[inverse]) {
              entry[inverse] = {
                id: snapshot.id,
                type: snapshot.type
              };
            }
          });
        }
        return payload;
      });
    },

    pathForType: function pathForType(type) {
      var dasherized = Ember['default'].String.dasherize(type);
      return Ember['default'].String.pluralize(dasherized);
    },

    findQuery: function findQuery(store, type, query) {
      var url = this.buildURL(type.modelName, null, null, 'findQuery', query);

      if (this.sortQueryParams) {
        query = this.sortQueryParams(query);
      }

      return this.ajax(url, 'GET', { data: query });
    }
  });

  // Do nothing, the full host is already included. This branch
  // avoids the absolute path logic and the relative path logic.

  // Absolute path

});
define('frontend-cp/adapters/case-message', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'messages';
    }
  });

});
define('frontend-cp/adapters/case-reply', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'reply';
    }
  });

});
define('frontend-cp/adapters/facebook-account', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'facebook/accounts';
    }
  });

});
define('frontend-cp/adapters/identity-twitter', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'identities/twitter';
    }
  });

});
define('frontend-cp/adapters/intl', ['exports', 'frontend-cp/adapters/-intl-adapter', 'frontend-cp/locales/new-locale'], function (exports, IntlAdapter, Locale) {

  'use strict';

  exports['default'] = IntlAdapter['default'].extend({
    locales: {},

    findLanguage: function findLanguage(locale) {
      if (locale instanceof Locale['default']) {
        return locale;
      }

      if (typeof locale === 'string') {
        if (!this.locales[locale]) {
          this.locales[locale] = new (Locale['default'].extend({
            locale: locale
          }))();
        }
        return this.locales[locale];
      }
    }
  });

});
define('frontend-cp/adapters/metric', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'cases/ratings/metrics';
    }
  });

});
define('frontend-cp/adapters/person', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'persons';
    }
  });

});
define('frontend-cp/adapters/priority', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'cases/priorities';
    }
  });

});
define('frontend-cp/adapters/private', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

	'use strict';

	exports['default'] = ApplicationAdapter['default'].extend({
		namespace: 'base/admin/index.php?/Base'
	});

});
define('frontend-cp/adapters/slack-identity', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'identities/slack';
    }
  });

});
define('frontend-cp/adapters/status', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'cases/statuses';
    }
  });

});
define('frontend-cp/adapters/twitter-account', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'twitter/accounts';
    }
  });

});
define('frontend-cp/adapters/type', ['exports', 'frontend-cp/adapters/application'], function (exports, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({
    pathForType: function pathForType() {
      return 'cases/types';
    }
  });

});
define('frontend-cp/app', ['exports', 'ember', 'frontend-cp/resolver', 'ember/load-initializers', 'frontend-cp/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('frontend-cp/application/controller', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    urlService: Ember['default'].inject.service('url'),
    sessionService: Ember['default'].inject.service('session'),

    bootFromSession: (function () {
      if (this.get('sessionService').get('sessionId') === null) {
        this.transitionToRoute('login');
      }
    }).observes('session.sessionId'),

    currentPathDidChange: (function () {
      this.get('urlService').set('currentPath', this.get('currentPath'));
    }).observes('currentPath')
  });

});
define('frontend-cp/application/route', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    navMenu: null,
    sessionService: Ember['default'].inject.service('session'),
    intl: Ember['default'].inject.service('intl'),

    beforeModel: function beforeModel(transition) {
      this.get('intl').set('adapterType', 'intl');
      if (this.get('sessionService').getSessionId() === null) {
        this.transitionTo('login');
      } else {
        if (transition.state.handlerInfos.length === 2) {
          this.transitionTo('session');
        }
      }
    },

    model: function model() {
      var _this = this;

      var locale = this.store.find('locale', 'current');
      return locale.then(function (locale) {
        var intl = _this.get('intl');
        intl.set('locales', [locale.id]);
        moment['default'].locale(locale.id);

        return locale.get('strings').then(function (strings) {
          strings.forEach(function (string) {
            intl.addMessage(locale.id, string.id, string.get('value'));
          });
          return Ember['default'].Object.create({
            navMenu: _this.get('navMenu')
          });
        });
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('model', model);
    },

    actions: {
      logout: function logout() {
        this.get('sessionService').logout();
      }
    }
  });

});
define('frontend-cp/application/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        content(env, morph1, context, "ko-context-modal");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/application/view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({

    classNames: ['application']
  });

});
define('frontend-cp/cldrs/en-us', ['exports'], function (exports) {

	'use strict';

	/*jslint eqeq: true*/
	exports['default'] = { "locale": "en-US", "parentLocale": "en" };

});
define('frontend-cp/cldrs/en', ['exports'], function (exports) {

  'use strict';

  /*jslint eqeq: true*/
  exports['default'] = { "locale": "en", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
      var s = String(n).split("."),
          v0 = !s[1],
          t0 = Number(s[0]) == n,
          n10 = t0 && s[0].slice(-1),
          n100 = t0 && s[0].slice(-2);if (ord) return n10 == 1 && n100 != 11 ? "one" : n10 == 2 && n100 != 12 ? "two" : n10 == 3 && n100 != 13 ? "few" : "other";return n == 1 && v0 ? "one" : "other";
    }, "fields": { "year": { "displayName": "Year", "relative": { "0": "this year", "1": "next year", "-1": "last year" }, "relativeTime": { "future": { "one": "in {0} year", "other": "in {0} years" }, "past": { "one": "{0} year ago", "other": "{0} years ago" } } }, "month": { "displayName": "Month", "relative": { "0": "this month", "1": "next month", "-1": "last month" }, "relativeTime": { "future": { "one": "in {0} month", "other": "in {0} months" }, "past": { "one": "{0} month ago", "other": "{0} months ago" } } }, "day": { "displayName": "Day", "relative": { "0": "today", "1": "tomorrow", "-1": "yesterday" }, "relativeTime": { "future": { "one": "in {0} day", "other": "in {0} days" }, "past": { "one": "{0} day ago", "other": "{0} days ago" } } }, "hour": { "displayName": "Hour", "relativeTime": { "future": { "one": "in {0} hour", "other": "in {0} hours" }, "past": { "one": "{0} hour ago", "other": "{0} hours ago" } } }, "minute": { "displayName": "Minute", "relativeTime": { "future": { "one": "in {0} minute", "other": "in {0} minutes" }, "past": { "one": "{0} minute ago", "other": "{0} minutes ago" } } }, "second": { "displayName": "Second", "relative": { "0": "now" }, "relativeTime": { "future": { "one": "in {0} second", "other": "in {0} seconds" }, "past": { "one": "{0} second ago", "other": "{0} seconds ago" } } } } };

});
define('frontend-cp/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('frontend-cp/components/ko-add-participants-context-menu/component', ['exports', 'ember', 'frontend-cp/components/mixins/context-menu-set'], function (exports, Ember, ContextMenuSetComponentMixin) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend(ContextMenuSetComponentMixin['default'], {});

});
define('frontend-cp/components/ko-add-participants-context-menu/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("some kind of test\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element1,0,0);
          element(env, element1, context, "action", ["next"], {});
          inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["generic.popover.next"], {})], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("adding monk ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          element(env, element0, context, "action", ["prev"], {});
          inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["generic.popover.previous"], {})], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-context-modal-item", [], {"index": "0", "title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.addparticipant"], {})], {}), "contextModalId": get(env, context, "contextModalId")}, child0, null);
        block(env, morph1, context, "ko-context-modal-item", [], {"index": "1", "title": "Add a monkey", "contextModalId": get(env, context, "contextModalId")}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-address/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['info-bar-item', 'u-no-bottom-border']
  });

});
define('frontend-cp/components/ko-address/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,0,0);
          var morph2 = dom.createMorphAt(element0,2,2);
          var morph3 = dom.createMorphAt(dom.childAt(fragment, [5]),0,0);
          set(env, context, "address", blockArguments[0]);
          content(env, morph0, context, "address.address1");
          content(env, morph1, context, "address.address2");
          content(env, morph2, context, "address.postCode");
          content(env, morph3, context, "address.country");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "address")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-admin-card-team/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    teamName: null,
    memberType: 'Agent',
    members: null,

    memberCount: (function () {
      return this.get('members.length');
    }).property('members'),

    pluralizedMemberType: (function () {
      if (this.get('memberCount') === 1) {
        return this.get('memberType');
      }
      return Ember['default'].Inflector.inflector.pluralize(this.get('memberType'));
    }).property('memberType', 'memberCount')

  });

});
define('frontend-cp/components/ko-admin-card-team/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
            set(env, context, "member", blockArguments[0]);
            inline(env, morph0, context, "ko-avatar", [], {"avatar": get(env, context, "member.avatar")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-admin-card-team__header");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","ko-admin-card-team__team-name");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","ko-admin-card-team__membership");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-admin-card-team__content");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","list-inline");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element1,0,0);
          var morph2 = dom.createMorphAt(element1,2,2);
          var morph3 = dom.createMorphAt(dom.childAt(fragment, [3, 1]),1,1);
          content(env, morph0, context, "teamName");
          content(env, morph1, context, "members.length");
          content(env, morph2, context, "pluralizedMemberType");
          block(env, morph3, context, "each", [get(env, context, "members")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-admin-selectable-card", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-admin-card-user/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-admin-card-user/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-admin-card-user__avatar");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-admin-card-user__name");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-admin-card-user__email");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(fragment, [5]),0,0);
          inline(env, morph0, context, "ko-avatar", [], {"avatar": get(env, context, "user.avatar"), "size": "large"});
          content(env, morph1, context, "user.fullName");
          content(env, morph2, context, "user.primaryEmailAddress");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-admin-selectable-card", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-admin-selectable-card/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    onComponentWasSelectedAction: null,
    onComponentWasDeselectedAction: null,
    selectableModelId: null,
    isSelected: false,
    isActive: true,

    classNameBindings: ['isActive::ko-admin-selectable-card--inactive', ':u-1/2'],

    modelWasSelectedOrDeSelected: (function () {
      if (this.get('isSelected')) {
        this.sendAction('onComponentWasSelectedAction', this.get('selectableModelId'));
      } else {
        this.sendAction('onComponentWasDeselectedAction', this.get('selectableModelId'));
      }
    }).observes('isSelected')
  });

});
define('frontend-cp/components/ko-admin-selectable-card/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-admin-selectable-card__checkbox");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-admin-selectable-card__content");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        inline(env, morph0, context, "ko-checkbox", [], {"checked": get(env, context, "isSelected")});
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-agent-dropdown/component', ['exports', 'ember', 'ember-cli-keyboard-actions/mixins/keyboard-actions', 'frontend-cp/mixins/drop-down-keyboard-nav'], function (exports, Ember, KeyboardActionsMixin, DropdownKeyboardNav) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(KeyboardActionsMixin['default'], DropdownKeyboardNav['default'], {
    attributeBindings: ['data-region', 'tabindex'],
    dataRegion: 'navigation-new',
    tabindex: 0,
    classNames: ['u-inline-block'],
    navItems: [{ text: 'Case', path: 'session.cases.new', icon: 'images/icons/case.svg' }, { text: 'User', icon: 'images/icons/user.svg' }, { text: 'Organization', icon: 'images/icons/organization.svg' }],
    showDropdown: false,
    isMouseAccess: false,
    keyboardPosition: 0,

    click: function click(e) {
      if (e.target.className !== 'nav-new') {
        this.set('showDropdown', false);
      }
      this.set('isMouseAccess', true);
    },

    focusIn: function focusIn() {
      var mouseAccess = this.get('isMouseAccess');
      if (!mouseAccess) {
        this.set('showDropdown', true);
      }
    },

    focusOut: function focusOut() {
      this.set('isMouseAccess', false);
      this.set('keyboardPosition', 0);
      this.set('showDropdown', false);
    },

    keyDownActions: {
      up: function up() {
        var navItems = this.get('navItems');
        this.moveSelectedItem(navItems.length, 'ul', 'up', 'keyboardPosition');
        return false;
      },
      down: function down() {
        var navItems = this.get('navItems');
        this.set('showDropdown', true);
        this.moveSelectedItem(navItems.length, 'ul', 'down', 'keyboardPosition');
        return false;
      },
      tab: function tab() {
        this.set('showDropdown', false);
      },
      enter: function enter() {
        var keyboardPosition = this.get('keyboardPosition');
        this.$('ul li:nth-child(' + keyboardPosition + ') a').click();
        this.$().focus();
        this.set('showDropdown', false);
        this.set('keyboardPosition', 0);
        return false;
      }
    },

    actions: {
      showDropdown: function showDropdown() {
        this.set('showDropdown', true);
      }
    }
  });

});
define('frontend-cp/components/ko-agent-dropdown/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","t-center");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var attrMorph0 = dom.createAttrMorph(element0, 'src');
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            attribute(env, attrMorph0, element0, "src", concat(env, [get(env, context, "item.icon")]));
            content(env, morph0, context, "item.text");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","agent-dropdown__item");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          block(env, morph0, context, "link-to", [get(env, context, "item.path")], {"class": "agent-dropdown__link"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("a");
        dom.setAttribute(el1,"class","nav-new");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"tabindex","-1");
        dom.setAttribute(el1,"role","menu");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","box box--secondary");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","list-inline");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","box");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-caption t-small u-mb-");
        var el4 = dom.createTextNode("\n    Recently viewed:\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag flag--auto flag--small u-mb-");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__img");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"class","avatar");
        dom.setAttribute(el5,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el5,"alt","");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__body");
        var el5 = dom.createTextNode("\n        I can't open the internet.\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","t-small t-caption");
        var el6 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag flag--auto flag--small u-mb-");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__img");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"class","avatar");
        dom.setAttribute(el5,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el5,"alt","");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__body");
        var el5 = dom.createTextNode("\n        I can't open the internet.\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","t-small t-caption");
        var el6 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag flag--auto flag--small");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__img");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"class","avatar");
        dom.setAttribute(el5,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el5,"alt","");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__body");
        var el5 = dom.createTextNode("\n        I can't open the internet.\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","t-small t-caption");
        var el6 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(fragment, [2]);
        var attrMorph0 = dom.createAttrMorph(element2, 'class');
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1, 1]),1,1);
        element(env, element1, context, "action", ["showDropdown"], {});
        attribute(env, attrMorph0, element2, "class", concat(env, ["agent-dropdown box-container ", subexpr(env, context, "unless", [get(env, context, "showDropdown"), "u-hidden"], {})]));
        block(env, morph0, context, "each", [get(env, context, "navItems")], {"keyword": "item"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-avatar/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    avatar: null,
    size: 'normal', // [normal | large]

    //classNameBindings: ['isLarge:ko-avatar--large'],

    isLarge: (function () {
      return this.get('size') === 'large';
    }).property('size'),

    // will be used flip between avatar / gravatar etc when we need that functionality!
    imageURL: (function () {
      return this.get('avatar.url');
    }).property('avatar.url')

  });

});
define('frontend-cp/components/ko-avatar/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("img");
        dom.setAttribute(el2,"alt","");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var attrMorph0 = dom.createAttrMorph(element0, 'class');
        var attrMorph1 = dom.createAttrMorph(element0, 'src');
        attribute(env, attrMorph0, element0, "class", concat(env, ["ko-avatar__image ", subexpr(env, context, "if", [get(env, context, "isLarge"), "ko-avatar__image--large"], {})]));
        attribute(env, attrMorph1, element0, "src", concat(env, [get(env, context, "imageURL")]));
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-breadcrumbs/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    breadcrumbs: [],
    activeBreadcrumb: null,

    actions: {
      breadcrumbChange: function breadcrumbChange(id) {
        this.sendAction('action', id);
      }
    }
  });

});
define('frontend-cp/components/ko-breadcrumbs/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          set(env, context, "breadcrumb", blockArguments[0]);
          attribute(env, attrMorph0, element0, "class", concat(env, ["breadcrumbs__item ", subexpr(env, context, "if", [subexpr(env, context, "eq", [get(env, context, "activeBreadcrumb"), get(env, context, "breadcrumb.id")], {}), "breadcrumbs__item--active"], {})]));
          element(env, element0, context, "action", ["breadcrumbChange", get(env, context, "breadcrumb.id")], {});
          content(env, morph0, context, "breadcrumb.name");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","breadcrumbs");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","breadcrumbs__item breadcrumbs__action i--right-chevron");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, subexpr = hooks.subexpr, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(element1,1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
        block(env, morph0, context, "each", [get(env, context, "breadcrumbs")], {}, child0, null);
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["generic.next"], {})], {});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-checkbox-field/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'li',
    isErrored: false,
    isEdited: false,
    title: '',
    classNames: ['info-bar-item'],
    classNameBindings: ['isEdited:info-bar-item--edited', 'isErrored:info-bar-item--error'],
    labelPath: 'label',
    checkedPath: 'checked'
  });

});
define('frontend-cp/components/ko-case-checkbox-field/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("label");
          dom.setAttribute(el2,"tabindex","-1");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(element0,1,1);
          var morph1 = dom.createMorphAt(element0,3,3);
          set(env, context, "item", blockArguments[0]);
          inline(env, morph0, context, "input", [], {"type": "checkbox", "checked": subexpr(env, context, "get", [get(env, context, "item"), get(env, context, "checkedPath")], {})});
          inline(env, morph1, context, "get", [get(env, context, "item"), get(env, context, "labelPath")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","info-bar-item__header");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "content")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-content/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    store: Ember['default'].inject.service(),

    initMessages: (function () {
      var _this = this;

      this.get('store').find('case-message', { parent: this.get('case'), page: 1 }).then(function (messages) {
        _this.set('messages', messages);
      });
    }).on('init'),

    hasBrand: (function () {
      return !!this.get('case.brand.companyName');
    }).property('case.brand.companyName'),

    actions: {
      setStatus: function setStatus(status) {
        this.set('case.status', status);
      },

      setType: function setType(type) {
        this.set('case.caseType', type);
      },

      setPriority: function setPriority(priority) {
        this.set('case.priority', priority);
      },

      setCustomField: function setCustomField() {},

      submit: function submit() {
        var _this2 = this;

        var reply = this.get('store').createRecord('case-reply');
        reply.set('case', this.get('case'));
        reply.set('status', this.get('case.status'));
        reply.set('type', this.get('case.type'));
        reply.set('priority', this.get('case.priority'));
        reply.set('channelType', this.get('channel'));
        reply.set('contents', this.get('postEditor').getMarkdown());
        reply.save().then(function () {
          _this2.get('postEditor').clear();
        });
      }
    }
  });

});
define('frontend-cp/components/ko-case-content/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","info-bar-item");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"class","button button--primary u-1/1");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, subexpr = hooks.subexpr, inline = hooks.inline, get = hooks.get;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          var morph5 = dom.createMorphAt(fragment,11,11,contextualElement);
          element(env, element0, context, "action", ["submit"], {});
          inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["cases.submit"], {})], {});
          inline(env, morph1, context, "ko-case-select-field", [], {"title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.requester"], {})], {})});
          inline(env, morph2, context, "ko-case-select-field", [], {"title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.assignee"], {})], {})});
          inline(env, morph3, context, "ko-case-select-field", [], {"title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.status"], {})], {}), "content": get(env, context, "statuses"), "value": get(env, context, "case.status"), "labelPath": "label", "action": "setStatus"});
          inline(env, morph4, context, "ko-case-select-field", [], {"title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.type"], {})], {}), "content": get(env, context, "types"), "value": get(env, context, "case.caseType"), "labelPath": "label", "action": "setType"});
          inline(env, morph5, context, "ko-case-select-field", [], {"title": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["cases.priority"], {})], {}), "content": get(env, context, "priorities"), "value": get(env, context, "case.priority"), "labelPath": "label", "action": "setPriority"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout--flush");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-1/1 u-mt");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag--bottom");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"alt","");
        dom.setAttribute(el6,"class","header__image");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__body");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h4");
        dom.setAttribute(el6,"class","header__title");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","header__subtitle");
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout--flush u-mt");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-3/4");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","main-content main-content--has-info");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-1/4");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, inline = hooks.inline, subexpr = hooks.subexpr, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1, 1, 1]);
        var element3 = dom.childAt(element2, [1, 1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element1, [3]);
        var element6 = dom.childAt(element5, [1, 1]);
        var attrMorph0 = dom.createAttrMorph(element3, 'src');
        var morph0 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        var morph2 = dom.createMorphAt(element6,1,1);
        var morph3 = dom.createMorphAt(element6,3,3);
        var morph4 = dom.createMorphAt(dom.childAt(element5, [3]),1,1);
        attribute(env, attrMorph0, element3, "src", concat(env, [get(env, context, "case.requester.avatar.url")]));
        inline(env, morph0, context, "ko-editable-text", [], {"value": get(env, context, "case.subject")});
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.subheader"], {})], {"time": get(env, context, "case.createdAt"), "channel": "\\{{case.channel.title}}", "hasBrand": get(env, context, "hasBrand"), "brand": get(env, context, "case.brand.companyName")});
        inline(env, morph2, context, "ko-text-editor", [], {"viewName": "postEditor", "channels": get(env, context, "case.channels"), "channel": get(env, context, "channel")});
        inline(env, morph3, context, "ko-feed", [], {"events": get(env, context, "messages")});
        block(env, morph4, context, "ko-info-bar", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-custom-field/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    setInitValue: (function () {
      this.set('value', this.get('field'));
    }).on('init'),

    actions: {
      setCustomField: function setCustomField(value) {
        this.set('value', value);
      }
    }
  });

});
define('frontend-cp/components/ko-case-custom-field/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "ko-case-select-field", [], {"title": get(env, context, "field.description"), "content": get(env, context, "field.options"), "value": get(env, context, "value"), "labelPath": "value", "action": "setCustomField"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "ko-case-checkbox-field", [], {"title": get(env, context, "field.description"), "content": get(env, context, "field.options"), "value": get(env, context, "value"), "labelPath": "value", "checkedPath": "selected"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [subexpr(env, context, "eq", [get(env, context, "field.fieldType"), "SELECT"], {})], {}, child0, null);
        block(env, morph1, context, "if", [subexpr(env, context, "eq", [get(env, context, "field.fieldType"), "CHECKBOX"], {})], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-metric/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'li',
    classNames: ['info-bar-item', 'u-no-bottom-border']
  });

});
define('frontend-cp/components/ko-case-metric/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h1");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","flag__body");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h4");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2,"class","t-small t-caption");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, subexpr = hooks.subexpr, inline = hooks.inline, get = hooks.get;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
          set(env, context, "metric", blockArguments[0]);
          content(env, morph0, context, "metric.value");
          inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.metric.unresolved"], {})], {});
          inline(env, morph2, context, "format-message", [subexpr(env, context, "intl-get", ["cases.metric.total"], {})], {"number": get(env, context, "metric.total")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","flag flag--auto flag--small u-mb-");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "metrics")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-select-field/component', ['exports', 'ember', 'ember-cli-keyboard-actions/mixins/keyboard-actions'], function (exports, Ember, KeyboardActionsMixin) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(KeyboardActionsMixin['default'], {
    tagName: 'li',
    attributeBindings: ['tabindex', 'role'],
    classNames: ['info-bar-item'],
    classNameBindings: ['isEdited:info-bar-item--edited', 'isErrored:info-bar-item--error'],
    tabindex: 0,
    showDropdown: false,
    isErrored: false,
    selectedField: null,
    isEdited: false,
    isMouseAccess: false,
    keyboardPosition: 0,
    labelPath: null,

    role: 'menuitem',

    moveSelectedItem: function moveSelectedItem(direction) {
      var content = this.get('content');
      var keyboardPosition = this.get('keyboardPosition');
      switch (direction) {
        case 'down':
          {
            keyboardPosition = keyboardPosition + 1;
            if (keyboardPosition <= content.length) {
              this.$('ul li:nth-child(' + keyboardPosition + ')').focus();
              this.set('keyboardPosition', keyboardPosition);
            }
            break;
          }
        case 'up':
          {
            keyboardPosition = keyboardPosition - 1;
            if (keyboardPosition > 0) {
              this.$('ul li:nth-child(' + keyboardPosition + ')').focus();
              this.set('keyboardPosition', keyboardPosition);
            }
            break;
          }
      }
    },

    click: function click() {
      this.set('isMouseAccess', true);
    },

    focusIn: function focusIn() {
      var mouseAccess = this.get('isMouseAccess');
      if (!mouseAccess) {
        this.set('showDropdown', true);
      }
    },

    focusOut: function focusOut() {
      this.set('isMouseAccess', false);
      this.set('keyboardPosition', 0);
    },

    keyDownActions: {
      up: function up() {
        this.moveSelectedItem('up');
        return false;
      },
      down: function down() {
        this.set('showDropdown', true);
        this.moveSelectedItem('down');
        return false;
      },
      tab: function tab() {
        this.set('showDropdown', false);
      },
      enter: function enter() {
        var keyboardPosition = this.get('keyboardPosition');
        this.$('ul li:nth-child(' + keyboardPosition + ')').click();
        this.$().focus();
        this.set('showDropdown', false);
        this.set('keyboardPosition', 0);
        return false;
      }
    },

    actions: {
      selectItem: function selectItem(selection) {
        this.set('isEdited', true);
        this.set('showDropdown', false);
        this.sendAction('action', selection);
      }
    }
  });

});
define('frontend-cp/components/ko-case-select-field/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","dropdown-menu__item");
          dom.setAttribute(el1,"tabindex","-1");
          dom.setAttribute(el1,"role","menuitemradio");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,1,1);
          set(env, context, "item", blockArguments[0]);
          element(env, element0, context, "action", ["selectItem", get(env, context, "item")], {});
          inline(env, morph0, context, "if", [get(env, context, "labelPath"), subexpr(env, context, "get", [get(env, context, "item"), get(env, context, "labelPath")], {}), get(env, context, "item")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","info-bar-item__header");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("a");
        dom.setAttribute(el1,"class","dropdown i--chevrons");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"role","menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [4]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        var morph2 = dom.createMorphAt(element1,1,1);
        var attrMorph0 = dom.createAttrMorph(element1, 'class');
        content(env, morph0, context, "title");
        inline(env, morph1, context, "if", [get(env, context, "labelPath"), subexpr(env, context, "get", [get(env, context, "value"), get(env, context, "labelPath")], {}), get(env, context, "value")], {});
        attribute(env, attrMorph0, element1, "class", concat(env, ["dropdown-menu ", subexpr(env, context, "if", [get(env, context, "showDropdown"), "", "u-hidden"], {})]));
        block(env, morph2, context, "each", [get(env, context, "content")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-case-tags-field/component', ['exports', 'ember', 'frontend-cp/mixins/suggestions', 'frontend-cp/mixins/drop-down-keyboard-nav'], function (exports, Ember, Suggestions, DropDownKeyboardNav) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(Suggestions['default'], DropDownKeyboardNav['default'], {

    classNames: ['info-bar-item'],
    classNameBindings: ['showDropdown:active'],
    attributeBindings: ['tabindex', 'role'],
    tabindex: 0,
    tagName: 'li',
    role: 'menuitem',
    title: 'Tags',
    searchTerm: '',
    tags: new Ember['default'].A([]),
    selectedTags: new Ember['default'].A([]),
    suggestedTags: new Ember['default'].A([]),
    isMouseAccess: false,
    showDropdown: false,
    dropdownKeyboardPosition: 0,
    selectedTagsKeyboardPosition: 0,
    isValidQuery: Ember['default'].computed.notEmpty('searchTerm'),
    isNotSuggested: Ember['default'].computed.not('isSuggested'),
    isNotSelected: Ember['default'].computed.not('isSelected'),
    isCreateAllowed: Ember['default'].computed.and('isNotSuggested', 'isNotSelected', 'isValidQuery'),

    isSuggested: (function () {
      var searchTerm = this.get('searchTerm');
      var suggestedTags = this.get('suggestedTags');
      return suggestedTags.contains(searchTerm);
    }).property('searchTerm', 'suggestedTags'),

    isSelected: (function () {
      var searchTerm = this.get('searchTerm');
      var selectedTags = this.get('selectedTags');
      return selectedTags.contains(searchTerm);
    }).property('searchTerm', 'selectedTags'),

    onSearchTermChange: (function () {
      this.send('resetSuggestedTagKeyboardPosition');
    }).observes('searchTerm'),

    didInsertElement: function didInsertElement() {
      this.set('suggestedTags', this.get('tags'));
      this.send('resetSuggestedTagKeyboardPosition');
    },

    click: function click() {
      this.set('isMouseAccess', true);
    },

    focusIn: function focusIn(e) {
      this.set('lastTagText', this.$(e.target).find('span:first').text());
      var mouseAccess = this.get('isMouseAccess');
      if (!mouseAccess) {
        this.set('showDropdown', true);
      }
    },

    focusOut: function focusOut() {
      this.set('isMouseAccess', false);
      this.set('dropdownKeyboardPosition', 0);
      this.set('showDropdown', false);
    },

    keyDown: function keyDown(e) {
      var left = 37;
      var up = 38;
      var right = 39;
      var down = 40;
      var backspace = 8;
      var enter = 13;
      var tab = 9;
      var searchTerm = this.get('searchTerm');
      var dropdownKeyboardPosition = this.get('dropdownKeyboardPosition');
      var selectedTags = this.get('selectedTags');
      var suggestedTags = this.get('suggestedTags');
      var selectedTagsSelector = 'ul:nth-child(2)';
      var suggestionsListSelector = 'ul:nth-child(3)';

      switch (e.keyCode) {
        case up:
          {
            this.send('resetSuggestedTagKeyboardPosition');
            this.moveSelectedItem(suggestedTags.length + 1, suggestionsListSelector, 'up', 'dropdownKeyboardPosition');
            return false;
          }
        case down:
          {
            this.send('resetSuggestedTagKeyboardPosition');
            this.set('showDropdown', true);
            this.moveSelectedItem(suggestedTags.length + 1, suggestionsListSelector, 'down', 'dropdownKeyboardPosition');
            return false;
          }
        case left:
          {
            this.moveSelectedItem(selectedTags.length, selectedTagsSelector, 'up', 'selectedTagsKeyboardPosition');
            return false;
          }
        case right:
          {
            this.moveSelectedItem(selectedTags.length, selectedTagsSelector, 'down', 'selectedTagsKeyboardPosition');
            return false;
          }
        case tab:
          {
            this.set('showDropdown', false);
            break;
          }
        case enter:
          {
            if (dropdownKeyboardPosition === 0) {
              this.send('newTag', searchTerm);
            } else {
              var _dropdownKeyboardPosition = this.get('dropdownKeyboardPosition');
              this.$('ul:nth-child(3) li:nth-child(' + _dropdownKeyboardPosition + ')').click();
              this.$().focus();
              this.set('showDropdown', false);
              this.set('dropdownKeyboardPosition', 0);
              return false;
            }
            break;
          }
        case backspace:
          {
            var tag = this.get('lastTagText');
            if (tag !== '') {
              this.send('removeTag', tag);
              this.$().focus();
              return false;
            } else {
              this.$('input').focus();
            }
            break;
          }
        default:
          {
            this.$('input').focus();
          }
      }
    },

    keyUp: function keyUp(e) {
      var up = 38;
      var down = 40;
      var enter = 13;
      var tab = 9;

      if (e.keyCode !== up && e.keyCode !== down && e.keyCode !== enter && e.keyCode !== tab) {
        this.send('updateSuggestions');
        this.set('showDropdown', true);
      }
    },

    actions: {
      tagSelected: function tagSelected(tag) {
        var selectedTags = this.get('selectedTags');
        selectedTags.pushObject(tag);
        this.set('searchTerm', '');
        this.set('showDropdown', false);
        this.send('updateSuggestions');
        this.send('resetSuggestedTagKeyboardPosition');
        this.sendAction('onTagSelectionChange', selectedTags);
      },

      removeTag: function removeTag(tag) {
        var selectedTags = this.get('selectedTags').without(tag);
        this.set('selectedTags', selectedTags);
        this.sendAction('onTagSelectionChange', selectedTags);
      },

      newTag: function newTag(tag) {
        this.send('tagSelected', tag);
        this.sendAction('onTagAddition', tag);
      },

      updateSuggestions: function updateSuggestions() {
        var selectedTags = this.get('selectedTags');
        var searchTerm = this.get('searchTerm');
        var tags = this.get('tags');
        var suggestions = this.matches(searchTerm, tags);
        this.set('suggestedTags', suggestions.removeObjects(selectedTags));
      },

      resetSuggestedTagKeyboardPosition: function resetSuggestedTagKeyboardPosition() {
        var selectedTags = this.get('selectedTags');
        this.set('selectedTagsKeyboardPosition', selectedTags.length + 1);
      }
    }
  });

});
define('frontend-cp/components/ko-case-tags-field/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","tag");
          dom.setAttribute(el1,"tabindex","-1");
          dom.setAttribute(el1,"role","menuitem");
          var el2 = dom.createElement("span");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","tag__action");
          var el3 = dom.createTextNode("x");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, get = hooks.get, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element2 = dom.childAt(fragment, [1]);
          var element3 = dom.childAt(element2, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element2, [0]),0,0);
          set(env, context, "tag", blockArguments[0]);
          content(env, morph0, context, "tag");
          element(env, element3, context, "action", ["removeTag", get(env, context, "tag")], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","dropdown-menu__item");
          dom.setAttribute(el1,"tabindex","-1");
          dom.setAttribute(el1,"role","menuitem");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element1,0,0);
          set(env, context, "tag", blockArguments[0]);
          element(env, element1, context, "action", ["tagSelected", get(env, context, "tag")], {});
          content(env, morph0, context, "tag");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","tag-new dropdown-menu__item");
          dom.setAttribute(el1,"tabindex","-1");
          dom.setAttribute(el1,"role","menuItem");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","t-caption t-small u-ml--");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          element(env, element0, context, "action", ["newTag", get(env, context, "searchTerm")], {});
          content(env, morph0, context, "searchTerm");
          inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.newtag"], {})], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","info-bar-item__header");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","list-inline u-overflow-scroll");
        dom.setAttribute(el1,"role","menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"role","menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, inline = hooks.inline, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element4 = dom.childAt(fragment, [2]);
        var element5 = dom.childAt(fragment, [4]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(element4,1,1);
        var morph2 = dom.createMorphAt(dom.childAt(element4, [3]),0,0);
        var morph3 = dom.createMorphAt(element5,1,1);
        var morph4 = dom.createMorphAt(element5,2,2);
        var attrMorph0 = dom.createAttrMorph(element5, 'class');
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "selectedTags")], {}, child0, null);
        inline(env, morph2, context, "input", [], {"class": "tag-input", "placeholder": "Add a tag...", "value": get(env, context, "searchTerm"), "on": "key-down", "tabindex": 0, "role": "textbox"});
        attribute(env, attrMorph0, element5, "class", concat(env, ["dropdown-menu ", subexpr(env, context, "unless", [get(env, context, "showDropdown"), "u-hidden"], {}), " list-bare"]));
        block(env, morph3, context, "each", [get(env, context, "suggestedTags")], {}, child1, null);
        block(env, morph4, context, "if", [get(env, context, "isCreateAllowed")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-cases-list/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("strong");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
            content(env, morph0, context, "case.subject");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block, content = hooks.content, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),0,0);
          var morph4 = dom.createMorphAt(dom.childAt(element0, [9]),0,0);
          var morph5 = dom.createMorphAt(dom.childAt(element0, [11]),0,0);
          set(env, context, "case", blockArguments[0]);
          block(env, morph0, context, "link-to", ["session.cases.case", get(env, context, "case")], {}, child0, null);
          content(env, morph1, context, "case.maskId");
          inline(env, morph2, context, "ko-priority", [], {"priority": get(env, context, "case.priority")});
          content(env, morph3, context, "case.maskId");
          content(env, morph4, context, "case.updatedAt");
          content(env, morph5, context, "case.replyDueAt");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, subexpr = hooks.subexpr, inline = hooks.inline, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [3]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [5]),0,0);
        var morph3 = dom.createMorphAt(dom.childAt(element2, [7]),0,0);
        var morph4 = dom.createMorphAt(dom.childAt(element2, [9]),0,0);
        var morph5 = dom.createMorphAt(dom.childAt(element2, [11]),0,0);
        var morph6 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["cases.subject"], {})], {});
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.lastreplier"], {})], {});
        inline(env, morph2, context, "format-message", [subexpr(env, context, "intl-get", ["cases.priority"], {})], {});
        inline(env, morph3, context, "format-message", [subexpr(env, context, "intl-get", ["cases.ticketid"], {})], {});
        inline(env, morph4, context, "format-message", [subexpr(env, context, "intl-get", ["cases.activity"], {})], {});
        inline(env, morph5, context, "format-message", [subexpr(env, context, "intl-get", ["cases.due"], {})], {});
        block(env, morph6, context, "each", [get(env, context, "cases")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-center/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-center__contents");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-checkbox/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    disabled: false,
    large: false,
    checked: false,
    ariaLive: 'assertive',
    tabindex: 0,
    label: '',

    // https://github.com/terrawheat/ember-cli-keyboard-actions/issues/1

    keyDown: function keyDown(e) {
      if (e.keyCode === 32) {
        return false;
      }
    },

    keyUp: function keyUp(e) {
      if (e.keyCode === 32) {
        this.send('toggleCheckbox');
      }
      return false;
    },

    actions: {
      toggleCheckbox: function toggleCheckbox() {
        if (!this.disabled) {
          this.toggleProperty('checked');
        }
      }
    }

  });

});
define('frontend-cp/components/ko-checkbox/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--checkbox-tick");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          var attrMorph1 = dom.createAttrMorph(element0, 'for');
          attribute(env, attrMorph0, element0, "class", concat(env, ["ko-checkbox__label ", subexpr(env, context, "if", [get(env, context, "disabled"), "ko-checkbox__label--disabled"], {})]));
          attribute(env, attrMorph1, element0, "for", concat(env, [get(env, context, "elementId"), "-checkbox"]));
          element(env, element0, context, "action", ["toggleCheckbox"], {});
          content(env, morph0, context, "label");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"role","checkbox");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element1,1,1);
        var attrMorph0 = dom.createAttrMorph(element1, 'class');
        var attrMorph1 = dom.createAttrMorph(element1, 'aria-checked');
        var attrMorph2 = dom.createAttrMorph(element1, 'tabindex');
        var attrMorph3 = dom.createAttrMorph(element1, 'aria-disabled');
        var attrMorph4 = dom.createAttrMorph(element1, 'aria-live');
        var attrMorph5 = dom.createAttrMorph(element1, 'id');
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        attribute(env, attrMorph0, element1, "class", concat(env, ["ko-checkbox__checkbox ", subexpr(env, context, "if", [get(env, context, "large"), "ko-checkbox__checkbox--large"], {}), " ", subexpr(env, context, "if", [get(env, context, "disabled"), "ko-checkbox__checkbox--disabled"], {})]));
        attribute(env, attrMorph1, element1, "aria-checked", concat(env, [get(env, context, "checked")]));
        attribute(env, attrMorph2, element1, "tabindex", concat(env, [get(env, context, "tabindex")]));
        attribute(env, attrMorph3, element1, "aria-disabled", concat(env, [subexpr(env, context, "if", [get(env, context, "disabled"), "true", "false"], {})]));
        attribute(env, attrMorph4, element1, "aria-live", concat(env, [get(env, context, "ariaLive")]));
        attribute(env, attrMorph5, element1, "id", concat(env, [get(env, context, "elementId"), "-checkbox"]));
        element(env, element1, context, "action", ["toggleCheckbox"], {});
        block(env, morph0, context, "if", [get(env, context, "checked")], {}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "label")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-contact-info/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['info-bar-item', 'u-no-bottom-border']
  });

});
define('frontend-cp/components/ko-contact-info/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--case-phone");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          set(env, context, "phone", blockArguments[0]);
          content(env, morph0, context, "phone");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--case-twitter");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          set(env, context, "twitterAccount", blockArguments[0]);
          content(env, morph0, context, "twitterAccount");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--case-facebook");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          set(env, context, "facebookAccount", blockArguments[0]);
          content(env, morph0, context, "facebookAccount");
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--case-email");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          set(env, context, "email", blockArguments[0]);
          content(env, morph0, context, "email");
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","i--case-linkedin");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          set(env, context, "linkedinAccount", blockArguments[0]);
          content(env, morph0, context, "linkedinAccount");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,4,4,contextualElement);
        var morph2 = dom.createMorphAt(fragment,8,8,contextualElement);
        var morph3 = dom.createMorphAt(fragment,12,12,contextualElement);
        var morph4 = dom.createMorphAt(fragment,16,16,contextualElement);
        var morph5 = dom.createMorphAt(fragment,20,20,contextualElement);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "phones")], {}, child0, null);
        block(env, morph2, context, "each", [get(env, context, "twitter")], {}, child1, null);
        block(env, morph3, context, "each", [get(env, context, "facebook")], {}, child2, null);
        block(env, morph4, context, "each", [get(env, context, "emails")], {}, child3, null);
        block(env, morph5, context, "each", [get(env, context, "linkedin")], {}, child4, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-context-modal-item/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    contextModalService: Ember['default'].inject.service('context-modal'),
    activeContextModalId: Ember['default'].computed.alias('contextModalService.activeContextModalId'),
    activeIndex: Ember['default'].computed.alias('contextModalService.index'),

    /**
     * Check this is the correct modal set
     * @return {undefined}
     */
    isContextModalActive: (function () {
      return this.get('activeContextModalId') === this.get('contextModalId') && this.get('activeContextModalId') !== null;
    }).property('activeContextModalId', 'contextModalId'),

    /**
     * Check the modal set is both active and that we are on the correct index (page)
     * @return {undefined}
     */
    isHidden: (function () {
      return this.get('activeIndex') !== Number(this.get('index')) || !this.get('isContextModalActive');
    }).property('activeIndex', 'index', 'isContextModalActive'),

    didShow: (function () {
      if (!this.get('isHidden')) {
        this.get('contextModalService').set('title', this.get('title'));
      }
    }).observes('isHidden')
  });

});
define('frontend-cp/components/ko-context-modal-item/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "yield");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "if", [subexpr(env, context, "not", [get(env, context, "isHidden")], {})], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ember-wormhole", [], {"to": "ko-context-modal__content"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-context-modal/component', ['exports', 'ember', 'jquery'], function (exports, Ember, $) {

  'use strict';

  var POSITION_MARGIN = 18,
      // Padding around window bounds to apply if modal's natural position is outside the bounds and it gets moved inside.
  ARROW_OFFSET = 9,
      // Distance between the originating element and the modal
  ARROW_SIZE = 9; // Size of the arrow in pixels (can be confirmed in _arrow.scss)

  exports['default'] = Ember['default'].Component.extend({

    classNameBindings: [':overlay', 'visible:u-visible'],

    contextModalService: Ember['default'].inject.service('context-modal'),

    event: Ember['default'].computed.alias('contextModalService.event'),
    title: Ember['default'].computed.alias('contextModalService.title'),
    visible: Ember['default'].computed.alias('contextModalService.visible'),
    activeContextModalId: Ember['default'].computed.alias('contextModalService.activeContextModalId'),
    activeIndex: Ember['default'].computed.alias('contextModalService.index'),

    $modal: null,

    eventX: null,
    eventY: null,
    buttonWidth: null,
    buttonHeight: null,
    windowWidth: null,
    windowHeight: null,
    documentWidth: null,
    documentHeight: null,
    modalWidth: null,
    modalHeight: null,
    scrollTop: null,
    modalVisible: false,

    didInsertElement: function didInsertElement() {
      var _this = this;

      this.set('$modal', this.$().find('.ko-context-modal__container'));
      $['default'](window).on('resize', function () {
        _this.set('modalVisible', false);
        Ember['default'].run.next(_this, _this.updatePositionInputs);
      });
    },

    actions: {
      close: function close() {
        this.get('contextModalService').close();
      }
    },

    eventDidChange: (function () {
      this.set('modalVisible', false);
      Ember['default'].run.next(this, this.updatePositionInputs);
    }).observes('event', 'activeContextModalId', 'activeIndex'),

    updatePositionInputs: function updatePositionInputs() {
      var event = this.get('event');

      if (event === undefined || event === null) {
        return;
      }

      var $modal = this.get('$modal');

      var eventPosition = this.getPosition(event.target);

      this.set('eventX', eventPosition.x);
      this.set('eventY', eventPosition.y);
      this.set('buttonHeight', $['default'](event.target).outerHeight());
      this.set('buttonWidth', $['default'](event.target).outerWidth(true));
      this.set('windowWidth', $['default'](window).width());
      this.set('windowHeight', $['default'](window).height());
      this.set('documentWidth', $['default'](document).width());
      this.set('documentHeight', $['default'](document).height());
      this.set('modalWidth', $modal.outerWidth(true));
      this.set('modalHeight', $modal.outerHeight());
      this.set('scrollTop', $['default'](window).scrollTop());

      this.set('modalVisible', true);
    },

    /**
     * Calculates the x position of the arrow, relative to the left of the modal.
     * @return {Number} Arrow x Position
     */
    arrowX: (function () {
      return this.get('modalWidth') / 2 + this.get('boundingOffsetX') - ARROW_SIZE / 2;
    }).property('modalWidth', 'boundingOffsetX'),

    /**
     * Based on the vertical position of the modal, set the arrow to appear on the top or bottom of the modal
     * @return {[type]} [description]
     */
    arrowClass: (function () {
      return 'arrow--' + (this.get('isArrowUnderneath') ? 'bottom' : 'top') + ' arrow';
    }).property('isArrowUnderneath'),

    targetModalOriginX: (function () {
      var originX = this.get('eventX') + this.get('buttonWidth') / 2; // Find the coordinate for the centre of the element clicked
      return originX - this.get('modalWidth') / 2; // Move the modal 50% of its width to the left of the centre of element clicked
    }).property('eventX', 'buttonWidth', 'modalWidth'),

    positionX: (function () {
      return Math.max(POSITION_MARGIN, Math.min(this.get('targetModalOriginX'), this.get('windowWidth') - this.get('modalWidth') - POSITION_MARGIN));
    }).property('targetModalOriginX', 'windowWidth', 'modalWidth'),

    positionY: (function () {
      if (this.get('isArrowUnderneath')) {
        return this.get('eventY') - this.get('modalHeight') + this.get('scrollTop') - ARROW_OFFSET;
      } else {
        return this.get('eventY') + this.get('buttonHeight') + this.get('scrollTop') + ARROW_OFFSET;
      }
    }).property('isArrowUnderneath', 'eventY', 'buttonHeight', 'scrollTop', 'modalHeight'),

    offsetY: (function () {
      return this.get('eventY') + this.get('modalHeight') + this.get('buttonHeight');
    }).property('eventY', 'modalHeight', 'buttonHeight'),

    /**
     * If the modals offset is greater than the size of the window
     * We need to display the modal above the element, as opposed to the default below.
     * Checks whether or not it can fit above, if not sticks with the default of being below.
     * @return {Boolean} true if the arrow is below the modal
     */
    isArrowUnderneath: (function () {
      return this.get('windowHeight') - this.get('offsetY') < 0 && this.get('eventY') - this.get('modalHeight') > 0;
    }).property('windowHeight', 'offsetY', 'eventY', 'modalHeight'),

    /**
     * Distance between where we want to put the modal, and where the bounding logic has moved it
     * @return {Number} X Distance in px between bounded and unbounded modal position
     */
    boundingOffsetX: (function () {
      return this.get('targetModalOriginX') - this.get('positionX');
    }).property('targetModalOriginX', 'positionX'),

    /**
     * Returns the x and y coordinates of the element passed in.
     * For a detailed breakdown and analysis of what is going on and why, please see:
     * http://www.kirupa.com/html5/get_element_position_using_javascript.htm
     *
     * @param {{HTMLElement}} element - DOM node to base positioning off of.
     * @returns {{x: number, y: number}}
     */
    getPosition: function getPosition(element) {
      if (!element) {
        throw new Error('No element found, cannot calculate coordinates');
      }

      var x = 0,
          y = 0;

      while (element) {
        x += element.offsetLeft - element.scrollLeft + element.clientLeft;
        y += element.offsetTop - element.scrollTop + element.clientTop;
        element = element.offsetParent;
      }

      return { x: x, y: y };
    }
  });

});
define('frontend-cp/components/ko-context-modal/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-context-modal__overlay");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-context-modal__container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","box box--secondary");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h6");
        dom.setAttribute(el3,"class","ko-context-modal__header");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","#");
        dom.setAttribute(el3,"class","ko-context-modal__action");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","ko-context-modal__content");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, subexpr = hooks.subexpr, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element1, [5]);
        var attrMorph0 = dom.createAttrMorph(element0, 'style');
        var attrMorph1 = dom.createAttrMorph(element1, 'style');
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        var morph1 = dom.createMorphAt(element3,0,0);
        var attrMorph2 = dom.createAttrMorph(element4, 'class');
        var attrMorph3 = dom.createAttrMorph(element4, 'style');
        attribute(env, attrMorph0, element0, "style", concat(env, ["width:", get(env, context, "documentWidth"), "px;height:", get(env, context, "documentHeight"), "px;"]));
        element(env, element0, context, "action", ["close"], {});
        attribute(env, attrMorph1, element1, "style", concat(env, ["top:", get(env, context, "positionY"), "px; left:", get(env, context, "positionX"), "px; ", subexpr(env, context, "if", [subexpr(env, context, "not", [get(env, context, "modalVisible")], {}), "visibility: hidden;"], {})]));
        content(env, morph0, context, "title");
        element(env, element3, context, "action", ["close"], {});
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["generic.close"], {})], {});
        attribute(env, attrMorph2, element4, "class", concat(env, [get(env, context, "arrowClass")]));
        attribute(env, attrMorph3, element4, "style", concat(env, ["left:", get(env, context, "arrowX"), "px;"]));
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-datepicker/component', ['exports', 'ember', 'npm:lodash', 'moment', 'ember-cli-keyboard-actions/mixins/keyboard-actions'], function (exports, Ember, _, moment, KeyboardActionsMixin) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(KeyboardActionsMixin['default'], {
    attributeBindings: ['tabindex'],
    tabindex: '-1',

    today: moment['default'](),
    shownDate: null,
    date: moment['default'](''),

    momentDate: (function () {
      return moment['default'](this.get('date'));
    }).property('date'),

    onDateParamChange: (function () {
      this.set('shownDate', moment['default'](this.get('momentDate').isValid() ? this.get('momentDate') : this.get('today')).toDate());
    }).observes('momentDate').on('init'),

    month: (function () {
      return moment['default'](this.get('shownDate')).month();
    }).property('shownDate'),

    year: (function () {
      return moment['default'](this.get('shownDate')).year();
    }).property('shownDate'),

    weekdays: (function () {
      var weekdays = moment['default'].weekdaysShort();
      var firstDayOfWeek = moment['default'].localeData().firstDayOfWeek();
      _['default'].times(firstDayOfWeek, function () {
        return weekdays.push(weekdays.shift());
      });
      return weekdays;
    }).property(),

    days: (function () {
      var date = moment['default']({
        year: this.get('year'),
        month: this.get('month'),
        day: 1
      }).startOf('week');

      var end = moment['default']({
        year: this.get('year'),
        month: this.get('month'),
        day: 1
      }).add(1, 'month').endOf('week');

      var dates = [];
      while (date.isBefore(end, 'day') || date.isSame(end, 'day')) {
        dates.push({
          date: date.date(),
          currentMonth: date.month() === this.get('month'),
          today: this.get('today').isSame(date, 'day'),
          selected: date.isSame(this.get('momentDate'), 'day')
        });
        date.add(1, 'day');
      }
      return dates;
    }).property('year', 'month', 'today', 'momentDate'),

    jumpDateBy: function jumpDateBy(method, range) {
      if (this.get('momentDate').isValid()) {
        this.setDate(moment['default'](this.get('momentDate'))[method](1, range));
      }
      return false;
    },

    setDate: function setDate(date) {
      this.sendAction('on-date-change', date.toDate());
    },

    actions: {
      previousMonth: function previousMonth() {
        this.set('shownDate', moment['default'](this.get('shownDate')).subtract(1, 'month').toDate());
      },

      nextMonth: function nextMonth() {
        this.set('shownDate', moment['default'](this.get('shownDate')).add(1, 'month').toDate());
      },

      selectDate: function selectDate(date) {
        this.setDate(moment['default']({
          year: this.get('year'),
          month: this.get('month'),
          day: date.date
        }));
      },

      today: function today() {
        this.setDate(moment['default'](this.get('today')));
      },

      clear: function clear() {
        this.setDate(moment['default'](''));
      },

      close: function close() {
        this.sendAction('close');
      }
    },

    keyDownActions: {
      up: function up() {
        return this.jumpDateBy('subtract', 'week');
      },

      down: function down() {
        return this.jumpDateBy('add', 'week');
      },

      left: function left() {
        return this.jumpDateBy('subtract', 'day');
      },

      right: function right() {
        return this.jumpDateBy('add', 'day');
      }
    }
  });

});
define('frontend-cp/components/ko-datepicker/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","ko-datepicker__weekday");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          set(env, context, "weekday", blockArguments[0]);
          content(env, morph0, context, "weekday");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          set(env, context, "date", blockArguments[0]);
          attribute(env, attrMorph0, element0, "class", concat(env, ["ko-datepicker__date ", subexpr(env, context, "if", [get(env, context, "date.currentMonth"), "ko-datepicker__date--current-month"], {}), "\n    ", subexpr(env, context, "if", [get(env, context, "date.today"), "ko-datepicker__date--today"], {}), " ", subexpr(env, context, "if", [get(env, context, "date.selected"), "ko-datepicker__date--selected"], {})]));
          element(env, element0, context, "action", ["selectDate", get(env, context, "date")], {});
          content(env, morph0, context, "date.date");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-datepicker__header");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-datepicker__month");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-datepicker__year");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-datepicker__previous");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-datepicker__next");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-datepicker__calendar");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-datepicker__actions");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-datepicker__action");
        var el3 = dom.createElement("span");
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","/images/icons/datepicker-today.svg");
        dom.setAttribute(el4,"alt","");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-datepicker__action");
        var el3 = dom.createElement("span");
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","/images/icons/datepicker-clear.svg");
        dom.setAttribute(el4,"alt","");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-datepicker__action");
        var el3 = dom.createElement("span");
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","/images/icons/datepicker-close.svg");
        dom.setAttribute(el4,"alt","");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, block = hooks.block, subexpr = hooks.subexpr;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [1]);
        var element2 = dom.childAt(element1, [5]);
        var element3 = dom.childAt(element1, [7]);
        var element4 = dom.childAt(fragment, [3]);
        var element5 = dom.childAt(fragment, [5]);
        var element6 = dom.childAt(element5, [1, 0]);
        var element7 = dom.childAt(element5, [3, 0]);
        var element8 = dom.childAt(element5, [5, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
        var morph2 = dom.createMorphAt(element4,1,1);
        var morph3 = dom.createMorphAt(element4,2,2);
        var morph4 = dom.createMorphAt(element6,1,1);
        var morph5 = dom.createMorphAt(element7,1,1);
        var morph6 = dom.createMorphAt(element8,1,1);
        inline(env, morph0, context, "format-date", [get(env, context, "shownDate")], {"format": "month"});
        inline(env, morph1, context, "format-date", [get(env, context, "shownDate")], {"format": "year"});
        element(env, element2, context, "action", ["previousMonth"], {});
        element(env, element3, context, "action", ["nextMonth"], {});
        block(env, morph2, context, "each", [get(env, context, "weekdays")], {}, child0, null);
        block(env, morph3, context, "each", [get(env, context, "days")], {}, child1, null);
        element(env, element6, context, "action", ["today"], {});
        inline(env, morph4, context, "format-message", [subexpr(env, context, "intl-get", ["generic.datepicker.today"], {})], {});
        element(env, element7, context, "action", ["clear"], {});
        inline(env, morph5, context, "format-message", [subexpr(env, context, "intl-get", ["generic.datepicker.clear"], {})], {});
        element(env, element8, context, "action", ["close"], {});
        inline(env, morph6, context, "format-message", [subexpr(env, context, "intl-get", ["generic.datepicker.close"], {})], {});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-draggable-dropzone/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    totalSize: 0,
    dragCounter: 0,
    classNames: ['koDraggableDropzone'],
    classNameBindings: ['dragClass:ko-draggable-dropzone--activated:ko-draggable-dropzone--deactivated'],
    dragClass: false,

    dragEnter: function dragEnter(event) {
      event.preventDefault();
      this.incrementProperty('dragCounter');
      this.set('dragClass', true);
    },

    dragOver: function dragOver(event) {
      event.preventDefault();
    },

    dragLeave: function dragLeave(event) {
      event.preventDefault();
      this.decrementProperty('dragCounter');
      if (this.dragCounter === 0) {
        this.set('dragClass', false);
      }
    },

    drop: function drop(event) {
      var _this = this;

      event.preventDefault();
      var file = event.dataTransfer.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        _this.sendAction('dropped', reader.result);
      };
      this.set('dragClass', false);
    }

  });

});
define('frontend-cp/components/ko-draggable-dropzone/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-draggable-dropzone__container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-draggable-dropzone__border");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-editable-text/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    isEditing: false,
    isEdited: false,
    valueToSave: null,

    valueDidChange: (function () {
      if (this.get('isEditing')) {
        return;
      }
      this.set('valueToSave', this.get('value'));
    }).observes('value'),

    actions: {
      edit: function edit() {
        this.startEditing();
      },

      editComplete: function editComplete() {
        this.stopEditing();
        this.set('value', this.get('valueToSave'));
        this.set('isEdited', true);
      }
    },

    focusOut: function focusOut() {
      this.stopEditing();
    },

    startEditing: function startEditing() {
      var _this = this;

      this.set('isEditing', true);
      this.set('valueToSave', this.get('value'));
      Ember['default'].run.scheduleOnce('afterRender', this, function () {
        _this.$().find('.editable-text__input').focus();
      });
    },

    stopEditing: function stopEditing() {
      this.set('isEditing', false);
    }
  });

});
define('frontend-cp/components/ko-editable-text/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(element0,0,0);
        var attrMorph0 = dom.createAttrMorph(element0, 'class');
        var morph1 = dom.createMorphAt(element1,0,0);
        var attrMorph1 = dom.createAttrMorph(element1, 'class');
        attribute(env, attrMorph0, element0, "class", concat(env, ["editable-text__text ", subexpr(env, context, "if", [get(env, context, "isEditing"), "u-hidden"], {}), " ", subexpr(env, context, "if", [get(env, context, "isEdited"), "editable-text__text--edited"], {})]));
        element(env, element0, context, "action", ["edit"], {});
        content(env, morph0, context, "value");
        attribute(env, attrMorph1, element1, "class", concat(env, [subexpr(env, context, "unless", [get(env, context, "isEditing"), "u-hidden"], {})]));
        inline(env, morph1, context, "input", [], {"value": get(env, context, "valueToSave"), "action": "editComplete", "class": "editable-text__input"});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-event-button/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'span',
    click: function click(event) {
      this.sendAction('on-click', event);
    }
  });

});
define('frontend-cp/components/ko-event-button/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("button");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-feed/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-feed/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.12.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("img");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("br");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, content = hooks.content, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              var attrMorph0 = dom.createAttrMorph(element0, 'src');
              var morph0 = dom.createMorphAt(fragment,5,5,contextualElement);
              var morph1 = dom.createMorphAt(fragment,7,7,contextualElement);
              set(env, context, "attachment", blockArguments[0]);
              attribute(env, attrMorph0, element0, "src", concat(env, [get(env, context, "attachment.url")]));
              content(env, morph0, context, "attachment.name");
              inline(env, morph1, context, "ko-file-size", [], {"size": get(env, context, "attachment.size")});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "each", [get(env, context, "event.attachments")], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","feed__item");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2,"class","feed__image");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","feed__title");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","feed__title--small");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","feed__content");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, content = hooks.content, subexpr = hooks.subexpr, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [3]);
          var attrMorph0 = dom.createAttrMorph(element2, 'src');
          var morph0 = dom.createMorphAt(element3,0,0);
          var morph1 = dom.createMorphAt(dom.childAt(element3, [2]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(element1, [5]),0,0);
          var morph3 = dom.createMorphAt(element1,7,7);
          set(env, context, "event", blockArguments[0]);
          attribute(env, attrMorph0, element2, "src", concat(env, [get(env, context, "event.creator.avatar.url")]));
          content(env, morph0, context, "event.creator.fullName");
          inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["feed.replied"], {})], {"ago": subexpr(env, context, "ago", [get(env, context, "event.createdAt")], {})});
          content(env, morph2, context, "event.contents");
          block(env, morph3, context, "if", [get(env, context, "event.attachments")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "each", [get(env, context, "events")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-feedback/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'li',
    classNames: ['info-bar-item', 'u-no-bottom-border'],
    icon: function icon(feedback) {
      return feedback === 1 ? 'i--feedback-positive' : 'i--feedback-negative';
    }
  });

});
define('frontend-cp/components/ko-feedback/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","u-inline-block ko-feedback__item");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("TODO");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","u-inline-block ko-feedback__item");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("TODO");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","u-inline-block ko-feedback__item");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("TODO");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          var element1 = dom.childAt(fragment, [3, 1]);
          var element2 = dom.childAt(fragment, [5, 1]);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          var attrMorph1 = dom.createAttrMorph(element1, 'class');
          var attrMorph2 = dom.createAttrMorph(element2, 'class');
          set(env, context, "feedbackItem", blockArguments[0]);
          attribute(env, attrMorph0, element0, "class", concat(env, [subexpr(env, context, "ko-helper", [get(env, context, "icon"), get(env, context, "feedbackItem.yesterday")], {})]));
          attribute(env, attrMorph1, element1, "class", concat(env, [subexpr(env, context, "ko-helper", [get(env, context, "icon"), get(env, context, "feedbackItem.lastWeek")], {})]));
          attribute(env, attrMorph2, element2, "class", concat(env, [subexpr(env, context, "ko-helper", [get(env, context, "icon"), get(env, context, "feedbackItem.lastYear")], {})]));
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "feedback")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-file-field/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'input',
    attributeBindings: ['type', 'multiple'],
    type: 'file',
    multiple: true,
    change: function change() {
      var files = this.element.files;
      this.sendAction('on-change', files);
    }

  });

});
define('frontend-cp/components/ko-file-field/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-file-size/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'span',
    size: null,

    options: (function () {
      var size = this.size;
      var options = undefined;
      if (size > 1024 * 1024) {
        options = {
          size: size / 1024 / 1024,
          unit: 'mb'
        };
      } else {
        options = {
          size: size / 1024,
          unit: 'kb'
        };
      }
      return options;
    }).property('size')
  });

});
define('frontend-cp/components/ko-file-size/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["generic.filesize"], {})], {"size": get(env, context, "options.size"), "unit": get(env, context, "options.unit")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-info-bar/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'ul',
    classNames: ['list-bare']
  });

});
define('frontend-cp/components/ko-info-bar/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-limited-text-area/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['u-pos-rel'],

    text: '',

    counter: (function () {
      return this.get('max') - this.get('text').length;
    }).property('max', 'text')
  });

});
define('frontend-cp/components/ko-limited-text-area/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","input__counter");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "textarea", [], {"value": get(env, context, "text"), "maxlength": get(env, context, "max"), "placeholder": get(env, context, "placeholder"), "class": "input__text-area--clean"});
        content(env, morph1, context, "counter");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-loader/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'ul',
    classNames: ['ko-loader'],
    classNameBindings: ['large:ko-loader--large']
  });

});
define('frontend-cp/components/ko-loader/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","ko-loader__item");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","ko-loader__item");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","ko-loader__item");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-login-otp/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-login-otp/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","otp-form login-form__wrapper js-otp-form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h6");
        dom.setAttribute(el2,"class","t-center");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),3,3);
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "otp"), "name": "otp-code", "class": "login__input--alone u-intimate", "placeholder": "Verification code", "disabled": get(env, context, "isLoading")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-login-password/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-login-password/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","login-form__wrapper");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        inline(env, morph0, context, "input", [], {"type": "email", "value": get(env, context, "model.email"), "name": "email", "autofocus": "autofocus", "class": "login__input", "placeholder": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["login.email"], {})], {}), "disabled": get(env, context, "isLoading")});
        inline(env, morph1, context, "input", [], {"type": "password", "value": get(env, context, "model.password"), "name": "password", "class": "login__input", "placeholder": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["login.password"], {})], {}), "disabled": get(env, context, "isLoading")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-login-reset/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-login-reset/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","reset-password-form login-form__wrapper");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        inline(env, morph0, context, "input", [], {"type": "password", "value": get(env, context, "newPassword1"), "name": "reset-password", "class": "login__input", "placeholder": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["login.newpassword"], {})], {}), "disabled": get(env, context, "isLoading")});
        inline(env, morph1, context, "input", [], {"type": "password", "value": get(env, context, "newPassword2"), "name": "reset-password-2", "class": "login__input u-intimate", "placeholder": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["login.repeatpassword"], {})], {}), "disabled": get(env, context, "isLoading")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-organisation-content/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-organisation-content/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("Organisation component\n\nOrg name: ");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
        content(env, morph0, context, "model.name");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-page-container/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-page-container/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-pagination/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    currentPage: 1,
    loadingPage: null,
    pageCount: 1,

    previousPage: (function () {
      return this.get('currentPage') - 1;
    }).property('currentPage'),

    nextPage: (function () {
      return this.get('currentPage') + 1;
    }).property('currentPage'),

    hasPreviousPage: (function () {
      return this.get('currentPage') > 1;
    }).property('currentPage'),

    hasNextPage: (function () {
      return this.get('currentPage') < this.get('pageCount');
    }).property('currentPage', 'pageCount')
  });

});
define('frontend-cp/components/ko-pagination/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "ko-loader");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "ko-center", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "yield", [1], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "ko-loader");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "ko-center", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "yield", [get(env, context, "previousPage")], {});
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "ko-loader");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "ko-center", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child5 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "yield", [get(env, context, "nextPage")], {});
          return fragment;
        }
      };
    }());
    var child6 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "ko-loader");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "ko-center", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child7 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "yield", [get(env, context, "pageCount")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-pagination__container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-pagination__pageNumber");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","ko-pagination__pageCount");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5]);
        var element2 = dom.childAt(element0, [7]);
        var element3 = dom.childAt(element0, [9]);
        var element4 = dom.childAt(element0, [11]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
        var morph2 = dom.createMorphAt(element1,1,1);
        var attrMorph0 = dom.createAttrMorph(element1, 'class');
        var morph3 = dom.createMorphAt(element2,1,1);
        var attrMorph1 = dom.createAttrMorph(element2, 'class');
        var morph4 = dom.createMorphAt(element3,1,1);
        var attrMorph2 = dom.createAttrMorph(element3, 'class');
        var morph5 = dom.createMorphAt(element4,1,1);
        var attrMorph3 = dom.createAttrMorph(element4, 'class');
        content(env, morph0, context, "currentPage");
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["generic.paginatorof"], {})], {"number": get(env, context, "pageCount")});
        attribute(env, attrMorph0, element1, "class", concat(env, ["ko-pagination__first ", subexpr(env, context, "if", [get(env, context, "hasPreviousPage"), "ko-pagination__first--available", ""], {})]));
        block(env, morph2, context, "if", [subexpr(env, context, "eq", [get(env, context, "loadingPage"), 1], {})], {}, child0, child1);
        attribute(env, attrMorph1, element2, "class", concat(env, ["ko-pagination__previous ", subexpr(env, context, "if", [get(env, context, "hasPreviousPage"), "ko-pagination__previous--available", ""], {})]));
        block(env, morph3, context, "if", [subexpr(env, context, "eq", [get(env, context, "loadingPage"), get(env, context, "previousPage")], {})], {}, child2, child3);
        attribute(env, attrMorph2, element3, "class", concat(env, ["ko-pagination__next ", subexpr(env, context, "if", [get(env, context, "hasNextPage"), "ko-pagination__next--available", ""], {})]));
        block(env, morph4, context, "if", [subexpr(env, context, "eq", [get(env, context, "loadingPage"), get(env, context, "nextPage")], {})], {}, child4, child5);
        attribute(env, attrMorph3, element4, "class", concat(env, ["ko-pagination__last ", subexpr(env, context, "if", [get(env, context, "hasNextPage"), "ko-pagination__last--available", ""], {})]));
        block(env, morph5, context, "if", [subexpr(env, context, "eq", [get(env, context, "loadingPage"), get(env, context, "pageCount")], {})], {}, child6, child7);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-participants-add/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    click: function click(event) {
      this.sendAction('addParticipant', event);
    }
  });

});
define('frontend-cp/components/ko-participants-add/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","plus");
        var el2 = dom.createTextNode("+");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-participants/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['figure-inline'],

    actions: {
      addParticipant: function addParticipant(event) {
        this.sendAction('addParticipant', event);
      }
    }
  });

});
define('frontend-cp/components/ko-participants/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"class","figure-inline__image");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var attrMorph0 = dom.createAttrMorph(element0, 'src');
          var attrMorph1 = dom.createAttrMorph(element0, 'alt');
          attribute(env, attrMorph0, element0, "src", concat(env, [get(env, context, "participant.image")]));
          attribute(env, attrMorph1, element0, "alt", concat(env, [get(env, context, "participant.alt")]));
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "each", [get(env, context, "participants")], {"keyword": "participant"}, child0, null);
        inline(env, morph1, context, "ko-participants-add", [], {"addParticipant": "addParticipant"});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-priority/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("style");
        var el2 = dom.createTextNode("\n  #");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" {\n    color: #");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(";\n  }\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(element0,1,1);
        var morph2 = dom.createMorphAt(element0,3,3);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "priority.label");
        content(env, morph1, context, "elementId");
        content(env, morph2, context, "priority.color");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-radio/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    disabled: false,
    large: false,
    selected: false,
    ariaLive: 'assertive',
    tabindex: 0,
    label: '',

    // https://github.com/terrawheat/ember-cli-keyboard-actions/issues/1

    keyDown: function keyDown(e) {
      if (e.keyCode === 32) {
        return false;
      }
    },

    keyUp: function keyUp(e) {
      if (e.keyCode === 32) {
        this.send('toggleRadio');
      }
      return false;
    },

    actions: {
      toggleRadio: function toggleRadio() {
        if (!this.disabled) {
          this.toggleProperty('selected');
        }
      }
    }

  });

});
define('frontend-cp/components/ko-radio/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var attrMorph0 = dom.createAttrMorph(element1, 'class');
          attribute(env, attrMorph0, element1, "class", concat(env, ["ko-radio__radio ", subexpr(env, context, "if", [get(env, context, "large"), "ko-radio__radio--large"], {})]));
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          var attrMorph1 = dom.createAttrMorph(element0, 'for');
          attribute(env, attrMorph0, element0, "class", concat(env, ["ko-radio__label ", subexpr(env, context, "if", [get(env, context, "disabled"), "ko-radio__label--disabled"], {})]));
          attribute(env, attrMorph1, element0, "for", concat(env, [get(env, context, "elementId"), "-radio"]));
          element(env, element0, context, "action", ["toggleRadio"], {});
          content(env, morph0, context, "label");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"role","radio");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element2,1,1);
        var attrMorph0 = dom.createAttrMorph(element2, 'class');
        var attrMorph1 = dom.createAttrMorph(element2, 'aria-checked');
        var attrMorph2 = dom.createAttrMorph(element2, 'tabindex');
        var attrMorph3 = dom.createAttrMorph(element2, 'aria-disabled');
        var attrMorph4 = dom.createAttrMorph(element2, 'aria-live');
        var attrMorph5 = dom.createAttrMorph(element2, 'id');
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        attribute(env, attrMorph0, element2, "class", concat(env, ["ko-radio__container ", subexpr(env, context, "if", [get(env, context, "large"), "ko-radio__container--large"], {}), " ", subexpr(env, context, "if", [get(env, context, "disabled"), "ko-radio__radio--disabled"], {})]));
        attribute(env, attrMorph1, element2, "aria-checked", concat(env, [get(env, context, "selected")]));
        attribute(env, attrMorph2, element2, "tabindex", concat(env, [get(env, context, "tabindex")]));
        attribute(env, attrMorph3, element2, "aria-disabled", concat(env, [get(env, context, "disabled")]));
        attribute(env, attrMorph4, element2, "aria-live", concat(env, [get(env, context, "ariaLive")]));
        attribute(env, attrMorph5, element2, "id", concat(env, [get(env, context, "elementId"), "-radio"]));
        element(env, element2, context, "action", ["toggleRadio"], {});
        block(env, morph0, context, "if", [get(env, context, "selected")], {}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "label")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-recent-cases/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'li',
    classNames: ['info-bar-item', 'u-no-bottom-border']
  });

});
define('frontend-cp/components/ko-recent-cases/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","t-small t-caption");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          set(env, context, "case", blockArguments[0]);
          content(env, morph0, context, "case.subject");
          inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.lastupdated"], {})], {"time": subexpr(env, context, "ago", [get(env, context, "case.createdAt")], {})});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","flag__body");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "cases")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-recent-members/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-recent-members/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          set(env, context, "member", blockArguments[0]);
          inline(env, morph0, context, "ko-avatar", [], {"avatar": get(env, context, "member.avatar")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("br");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","list-inline");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        content(env, morph0, context, "title");
        block(env, morph1, context, "each", [get(env, context, "members")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-search/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  /**
   * Have a selectedIndex on {this}
   * Computed properties to check if an item is selected
   * If the selectedIndex === index then we are active.
   */

  exports['default'] = Ember['default'].Component.extend({
    selectedIndex: null,
    results: [],

    searchTermDidChange: (function () {
      var _this = this;

      this.searchService.quickSearch('foo', 'bar').then(function (data) {
        _this.set('results', data);
      });
    }).observes('searchTerm'),

    filteredResults: (function () {
      var data = this.get('results.data') || new Ember['default'].A([]),
          parsed = new Ember['default'].A([]);

      data.forEach(function (item) {
        item.get('results').forEach(function (item) {
          return parsed.push(item);
        });
      });

      return parsed;
    }).property('results'),

    filteredResultsDidChange: (function () {
      this.selectByIndex(1);
    }).observes('filteredResults'),

    getSelectedIndex: function getSelectedIndex() {
      var data = this.get('filteredResults'),
          selectedIndex = null;

      if (data) {
        data.forEach(function (item, index) {
          if (item.get('selected')) {
            selectedIndex = index;
          }
        });
      }

      return selectedIndex;
    },

    getSelectedItem: function getSelectedItem() {
      var data = this.get('filteredResults');

      if (data) {
        return data.find(function (item) {
          return item.get('selected');
        });
      }

      return null;
    },

    selectByIndex: function selectByIndex(selectedIndex) {
      var data = this.get('filteredResults');

      if (data) {
        data.forEach(function (item, index) {
          item.set('selected', index === selectedIndex);
        });
      }
    },

    selectById: function selectById(id) {
      if (!this.filteredResults) {
        return;
      }
      this.filteredResults.forEach(function (item) {
        item.set('selected', item.get('id') === id);
      });
    },

    keyDown: function keyDown(ev) {
      switch (ev.keyCode) {
        case 38:
          //Up arrow
          this.selectPrev();
          break;
        case 40:
          //Down arrow
          this.selectNext();
          break;
      }
    },

    selectNext: function selectNext() {
      this.selectByIndex(this.getSelectedIndex() + 1);
    },

    selectPrev: function selectPrev() {
      this.selectByIndex(this.getSelectedIndex() - 1);
    }
  });

});
define('frontend-cp/components/ko-search/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          attribute(env, attrMorph0, element0, "class", concat(env, [subexpr(env, context, "if", [get(env, context, "result.selected"), "is-selected"], {})]));
          content(env, morph0, context, "result.title");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "input", [], {"value": get(env, context, "searchTerm")});
        block(env, morph1, context, "each", [get(env, context, "filteredResults")], {"keyword": "result"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-sidebar/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-sidebar/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-tab/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'a',
    classNameBindings: [':nav-tabs__item', 'tab.selected:is-active'],
    attributeBindings: ['href'],
    href: Ember['default'].computed.alias('tab.url'),

    click: function click(event) {
      event.preventDefault();
    },

    actions: {
      select: function select() {
        this.sendAction('openTab', this.get('tab'));
      },
      close: function close() {
        this.sendAction('closeTab', this.get('tab'));
      }
    }

  });

});
define('frontend-cp/components/ko-tab/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","nav-tabs__label");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","nav-tabs__close");
        var el2 = dom.createTextNode("×");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, content = hooks.content, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(element0,0,0);
        element(env, element0, context, "action", ["select"], {});
        content(env, morph0, context, "yield");
        element(env, element1, context, "action", ["close", get(env, context, "tab")], {});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-text-editor/component', ['exports', 'ember', 'npm:quill'], function (exports, Ember, Quill) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    quill: null,
    cursor: 0,
    attachedFiles: [],
    inlineFiles: [],
    totalSize: 0,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    maxTotalSize: 20 * 1024 * 1024, // 20 MB,

    fileIsNotTooBig: function fileIsNotTooBig(file) {
      return file.size < this.maxFileSize && this.totalSize < this.maxFileSize;
    },
    fileIsImage: function fileIsImage(file) {
      return file.type.match(/^image\//i);
    },
    tagDictionary: null,
    setupQuill: (function () {
      var _this = this;

      var tagDictionary = {
        'div': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '', '');
          }
        },
        'span': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '', '');
          }
        },
        'li': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem);
          }
        },
        'ul': {
          markdownable: true,
          process: function process(elem) {
            return _this.list(elem, 'unordered');
          }
        },
        'ol': {
          markdownable: true,
          process: function process(elem) {
            return _this.list(elem, 'ordered');
          }
        },
        'blockquote': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '\n> ', '\n');
          }
        },
        'pre': {
          markdownable: true,
          process: function process(elem) {
            return _this.code(elem);
          }
        },
        'code': {
          markdownable: true,
          process: function process(elem) {
            return _this.code(elem);
          }
        },
        'a': {
          markdownable: true,
          process: function process(elem) {
            return _this.link(elem);
          }
        },
        'hr': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '\n------', '\n');
          }
        },
        'em': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, ' *', '* ');
          }
        },
        'i': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, ' *', '* ');
          }
        },
        'strong': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, ' **', '** ');
          }
        },
        'b': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, ' **', '** ');
          }
        },
        'u': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, ' **', '** ');
          }
        },
        'p': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '\n', '\n');
          }
        },
        'br': {
          markdownable: true,
          process: function process(elem) {
            return _this.process(elem, '    \n', '');
          }
        },
        'img': {
          markdownable: true,
          process: function process(elem) {
            return _this.image(elem);
          }
        },
        '_text': {
          markdownable: true,
          process: function process(elem) {
            return elem === undefined ? '' : _this.getTextFromNode(elem);
          }
        }
      };
      this.set('tagDictionary', tagDictionary);
      this.quill = new Quill['default']('#' + this.elementId + ' .full-editor', {
        modules: {
          'multi-cursor': true,
          'toolbar': { container: '#' + this.elementId + ' .full-toolbar' },
          'link-tooltip': true
          // 'image-tooltip': true
        },
        theme: 'snow',
        styles: {
          '.ql-editor': {
            'font-family': '\'Source Sans Pro\', Sans-Serif'
          },
          '.ql-editor a': {
            'text-decoration': 'none'
          }
        }
      });
      Ember['default'].$('.ql-editor').on('blur', function () {

        if (_this.quill.getSelection() === null) {
          _this.set('cursor', 0);
        } else {
          _this.set('cursor', _this.quill.getSelection().start);
        }
      });
    }).on('didInsertElement'),
    process: function process(elem, prefix, postfix) {
      return prefix + this.parseChildren(elem) + postfix;
    },
    link: function link(elem) {
      var result = ' [';
      result += this.parseChildren(elem);
      return result + '](' + elem.getAttribute('href') + ') ';
    },
    list: function list(elem, type) {
      var count = 1,
          result = '\n',
          children = elem.getElementsByTagName('li');
      for (var i = 0; i < children.length; ++i) {
        // add the list item
        if (type === 'ordered') {
          result += count + '. ';
          count++;
        } else {
          result += '- ';
        }
        // add the child elements
        result += this.parseChildren(children[i]) + '\n';
      }
      return result + '\n';
    },
    code: function code(elem) {
      var tagName = elem.nodeType === 3 ? '_text' : elem.tagName.toLowerCase();
      if (elem.childNodes.length === 1) {
        if (tagName === 'code') {
          return ' `' + this.getTextFromNode(elem, true, true) + '` ';
        }
      }
      return '\n' + ('    ' + this.getTextFromNode(elem, true, true)).replace(/\n/g, '\n    ') + '\n';
    },

    image: function image(elem) {
      var alt = elem.getAttribute('alt');
      var title = elem.getAttribute('title');
      var url = elem.getAttribute('src');
      if (alt === null) {
        alt = url;
      }
      var op = ' ![' + alt + '](' + url;
      if (title !== null) {
        op += ' "' + title + ' "';
      }
      return op + ') ';
    },
    hasClass: function hasClass(elem, klass) {
      return (' ' + elem.className + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + klass + ' ') > -1;
    },
    getTextFromNode: function getTextFromNode(elem, allowNewlines, preserveWhitespace) {
      var txt = elem.innerText || elem.textContent;
      txt = txt.trim();
      if (allowNewlines === undefined || !allowNewlines) {
        txt = txt.replace(/\n/g, ' ');
      }
      if (preserveWhitespace === undefined || !preserveWhitespace) {
        txt = txt.replace(/\s{2,}/g, ' ');
      }
      return txt;
    },
    parseChildren: function parseChildren(elem) {
      var result = '',
          children = elem.childNodes;
      for (var i = 0; i < children.length; ++i) {
        var node = children[i];
        var nodeType = node.nodeType;
        var tagName = undefined;
        if (nodeType === 3) {
          tagName = '_text';
        } else {
          // No tag name, nothing to convert.
          if (!node.tagName) {
            continue;
          }
          tagName = node.tagName.toLowerCase();
        }
        if (tagName !== '_text') {
          if (!(tagName in this.tagDictionary)) {
            continue;
          }
          if (!this.tagDictionary[tagName].markdownable) {
            continue;
          }
          if (tagName === 'div') {
            if (this.hasClass(node, 'toc')) {
              result += '\n[TOC]\n';
              continue;
            }
          }
        }
        result += this.tagDictionary[tagName].process(node);
      }
      return result;
    },

    getMarkdown: function getMarkdown() {
      var elem = this.$('.ql-editor').get(0);
      var tagName = elem.nodeType === 3 ? '_text' : elem.tagName.toLowerCase();
      if (!(tagName in this.tagDictionary)) {
        return '';
      }
      return this.tagDictionary[tagName].process(elem);
    },

    clear: function clear() {
      this.quill.setText('');
    },

    actions: {
      insertImage: function insertImage() {
        this.quill.insertEmbed(this.cursor, 'image', 'http://quilljs.com/images/cloud.png');
      },
      imageDropped: function imageDropped(file) {
        this.quill.insertEmbed(this.cursor, 'image', file);
      },
      handleInlineFiles: function handleInlineFiles(files) {
        var _this2 = this;

        for (var i = 0, f = undefined; f = files[i]; i++) {
          if (this.fileIsNotTooBig(f) && this.fileIsImage(f)) {
            (function () {
              _this2.inlineFiles.pushObject(f);
              var reader = new FileReader();
              reader.onload = function () {
                _this2.quill.insertEmbed(_this2.cursor + 1, 'image', reader.result);
              };
              reader.readAsDataURL(f);
            })();
          } else {}
        }
      },
      handleAttachmentFiles: function handleAttachmentFiles(files) {
        for (var i = 0, f = undefined; f = files[i]; i++) {
          if (this.fileIsNotTooBig(f) && this.fileIsImage(f)) {
            this.attachedFiles.pushObject(f);
          } else {}
        }
      }
    }
  });

  // TODO: Ask design team where they want file is too big message to appear

  // TODO: Ask design team where they want file is too big message to appear

});
define('frontend-cp/components/ko-text-editor/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","full-editor");
          var el2 = dom.createTextNode("\n\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var morph1 = dom.createMorphAt(element0,2,2);
          set(env, context, "file", blockArguments[0]);
          content(env, morph0, context, "file.name");
          inline(env, morph1, context, "ko-file-size", [], {"size": get(env, context, "file.size")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","quill-wrapper");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" The toolbar container ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","full-toolbar");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","ql-format-group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","ql-format-group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-bold");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-italic");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","ql-format-group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-bullet");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-list");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-separator");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","ql-format-group");
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ko-text-editor__image-upload");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","ql-format-button ql-image");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-link");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-button ql-authorship");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-separator");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","ql-format-group");
        var el5 = dom.createTextNode("\n\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","ko-text-editor__image-upload");
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","ql-format-button ql-attachment");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n        ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n      ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","ql-format-button ql-cc");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","ql-format-button ql-billing");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        var el6 = dom.createTextNode("Convert to md!");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        var el6 = dom.createTextNode("Img!");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n    ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" Create the editor container ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-text-editor__dropzone-and-editor-container");
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("output");
        dom.setAttribute(el3,"class","files-list");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, subexpr = hooks.subexpr, attribute = hooks.attribute, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element2, [5]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element6, [1]);
        var element8 = dom.childAt(element6, [3]);
        var element9 = dom.childAt(element2, [9]);
        var element10 = dom.childAt(element9, [1]);
        var element11 = dom.childAt(element10, [1]);
        var element12 = dom.childAt(element11, [1]);
        var element13 = dom.childAt(element9, [3]);
        var element14 = dom.childAt(element9, [5]);
        var element15 = dom.childAt(element9, [9]);
        var element16 = dom.childAt(element15, [1]);
        var element17 = dom.childAt(element16, [1]);
        var element18 = dom.childAt(element17, [1]);
        var element19 = dom.childAt(element15, [3]);
        var element20 = dom.childAt(element15, [5]);
        var element21 = dom.childAt(element15, [7]);
        var element22 = dom.childAt(element15, [9]);
        var element23 = dom.childAt(element1, [7]);
        var morph0 = dom.createMorphAt(element2,1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [3, 1]),0,0);
        var attrMorph0 = dom.createAttrMorph(element4, 'title');
        var attrMorph1 = dom.createAttrMorph(element5, 'title');
        var attrMorph2 = dom.createAttrMorph(element7, 'title');
        var attrMorph3 = dom.createAttrMorph(element8, 'title');
        var attrMorph4 = dom.createAttrMorph(element11, 'for');
        var attrMorph5 = dom.createAttrMorph(element12, 'title');
        var morph2 = dom.createMorphAt(element10,3,3);
        var attrMorph6 = dom.createAttrMorph(element13, 'title');
        var attrMorph7 = dom.createAttrMorph(element14, 'title');
        var attrMorph8 = dom.createAttrMorph(element17, 'for');
        var attrMorph9 = dom.createAttrMorph(element18, 'title');
        var morph3 = dom.createMorphAt(element16,3,3);
        var attrMorph10 = dom.createAttrMorph(element19, 'title');
        var attrMorph11 = dom.createAttrMorph(element20, 'title');
        var morph4 = dom.createMorphAt(element23,1,1);
        var morph5 = dom.createMorphAt(dom.childAt(element23, [3, 1]),1,1);
        inline(env, morph0, context, "view", ["select"], {"class": "ql-social", "content": get(env, context, "channels"), "optionValuePath": "content.id", "optionLabelPath": "content.id", "value": get(env, context, "channel")});
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["cases.note"], {})], {});
        attribute(env, attrMorph0, element4, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.bold"], {})], {}));
        attribute(env, attrMorph1, element5, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.italic"], {})], {}));
        attribute(env, attrMorph2, element7, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.bullet"], {})], {}));
        attribute(env, attrMorph3, element8, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.list"], {})], {}));
        attribute(env, attrMorph4, element11, "for", get(env, context, "filesInline.elementId"));
        attribute(env, attrMorph5, element12, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.image"], {})], {}));
        inline(env, morph2, context, "ko-file-field", [], {"viewName": "filesInline", "on-change": "handleInlineFiles"});
        attribute(env, attrMorph6, element13, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.link"], {})], {}));
        attribute(env, attrMorph7, element14, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.authorship"], {})], {}));
        attribute(env, attrMorph8, element17, "for", get(env, context, "filesAttachment.elementId"));
        attribute(env, attrMorph9, element18, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.attachment"], {})], {}));
        inline(env, morph3, context, "ko-file-field", [], {"viewName": "filesAttachment", "on-change": "handleAttachmentFiles"});
        attribute(env, attrMorph10, element19, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.cc"], {})], {}));
        attribute(env, attrMorph11, element20, "title", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.texteditor.billing"], {})], {}));
        element(env, element21, context, "action", ["convertToMarkdown"], {});
        element(env, element22, context, "action", ["insertImage"], {});
        block(env, morph4, context, "ko-draggable-dropzone", [], {"dropped": "imageDropped"}, child0, null);
        block(env, morph5, context, "each", [get(env, context, "attachedFiles")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-toggle/component', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    activated: false,
    ariaLive: 'assertive',
    tabindex: 0,
    label: '',

    keyDown: function keyDown(e) {
      if (e.keyCode === 32) {
        return false;
      }
    },

    keyUp: function keyUp(e) {
      if (e.keyCode === 32) {
        this.send('toggleRadio');
      }
      return false;
    },

    actions: {
      toggleRadio: function toggleRadio() {
        this.toggleProperty('activated');
      }
    }

  });

});
define('frontend-cp/components/ko-toggle/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'class');
          var attrMorph1 = dom.createAttrMorph(element0, 'for');
          attribute(env, attrMorph0, element0, "class", concat(env, ["ko-toggle__label u-v-center ", subexpr(env, context, "if", [get(env, context, "micro"), "ko-toggle__label--micro"], {})]));
          attribute(env, attrMorph1, element0, "for", concat(env, [get(env, context, "elementId"), "-toggle"]));
          element(env, element0, context, "action", ["toggleRadio"], {});
          content(env, morph0, context, "label");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"role","radio");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1]);
        var attrMorph0 = dom.createAttrMorph(element1, 'class');
        var attrMorph1 = dom.createAttrMorph(element1, 'aria-checked');
        var attrMorph2 = dom.createAttrMorph(element1, 'tabindex');
        var attrMorph3 = dom.createAttrMorph(element1, 'aria-live');
        var attrMorph4 = dom.createAttrMorph(element1, 'id');
        var attrMorph5 = dom.createAttrMorph(element2, 'class');
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        attribute(env, attrMorph0, element1, "class", concat(env, ["ko-toggle__container ", subexpr(env, context, "if", [get(env, context, "micro"), "ko-toggle__container--micro"], {}), " ", subexpr(env, context, "if", [get(env, context, "activated"), "ko-toggle__container--activated"], {})]));
        attribute(env, attrMorph1, element1, "aria-checked", concat(env, [get(env, context, "activated")]));
        attribute(env, attrMorph2, element1, "tabindex", concat(env, [get(env, context, "tabindex")]));
        attribute(env, attrMorph3, element1, "aria-live", concat(env, [get(env, context, "ariaLive")]));
        attribute(env, attrMorph4, element1, "id", concat(env, [get(env, context, "elementId"), "-toggle"]));
        element(env, element1, context, "action", ["toggleRadio"], {});
        attribute(env, attrMorph5, element2, "class", concat(env, ["ko-toggle__toggle u-v-center ", subexpr(env, context, "if", [get(env, context, "micro"), "ko-toggle__toggle--micro"], {}), " ", subexpr(env, context, "if", [get(env, context, "activated"), "ko-toggle__toggle--activated"], {})]));
        block(env, morph0, context, "if", [get(env, context, "label")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/ko-user-content/component', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('frontend-cp/components/ko-user-content/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            set(env, context, "field", blockArguments[0]);
            inline(env, morph0, context, "ko-case-custom-field", [], {"field": get(env, context, "field")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "each", [get(env, context, "model.customFields")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout--flush");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-1/1 u-mt");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag--bottom");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"alt","");
        dom.setAttribute(el6,"class","header__image");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__body");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h4");
        dom.setAttribute(el6,"class","header__title");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","header__subtitle");
        var el7 = dom.createTextNode("\n            TODO\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout--flush u-mt");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-3/4");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","main-content main-content--has-info");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","layout__item u-1/4");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1, 1]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element0, [3]);
        var element4 = dom.childAt(element3, [1, 1]);
        var attrMorph0 = dom.createAttrMorph(element2, 'src');
        var morph0 = dom.createMorphAt(dom.childAt(element1, [3, 1]),1,1);
        var morph1 = dom.createMorphAt(element4,1,1);
        var morph2 = dom.createMorphAt(element4,3,3);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        attribute(env, attrMorph0, element2, "src", concat(env, [get(env, context, "model.requester.avatar.url")]));
        inline(env, morph0, context, "ko-editable-text", [], {"value": get(env, context, "model.subject")});
        inline(env, morph1, context, "ko-limited-text-area", [], {"max": 140, "placeholder": "TODO"});
        inline(env, morph2, context, "ko-feed", [], {"events": get(env, context, "model.timeline")});
        block(env, morph3, context, "ko-info-bar", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/components/mixins/context-menu-set', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    contextModalService: Ember['default'].inject.service('contextModal'),

    actions: {
      next: function next() {
        this.get('contextModalService').next();
      },
      prev: function prev() {
        this.get('contextModalService').prev();
      }
    }
  });

});
define('frontend-cp/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('frontend-cp/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('frontend-cp/formats', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    date: {
      month: {
        month: 'long'
      },
      year: {
        year: 'numeric'
      }
    },
    number: {
      filesize: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    },
    time: {}
  };

});
define('frontend-cp/formatters/format-date', ['exports', 'ember', 'ember-intl/formatter-base'], function (exports, Ember, Formatter) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var FormatDate = Formatter['default'].extend({
        format: function format(value, hash) {
            var args = this.buildOptions(value, hash);
            var intl = this.intl;

            return intl.formatDate.apply(intl, args);
        }
    });

    FormatDate.reopenClass({
        formatOptions: Ember['default'].A(['localeMatcher', 'timeZone', 'hour12', 'formatMatcher', 'weekday', 'era', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timeZoneName'])
    });

    exports['default'] = FormatDate;

});
define('frontend-cp/formatters/format-html-message', ['exports', 'ember', 'frontend-cp/formatters/format-message', 'ember-intl/models/intl-get-result'], function (exports, Ember, FormatterMessage, IntlGetResult) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var FormatHtmlMessage = FormatterMessage['default'].extend({
        escapeProps: function escapeProps(hash) {
            var value;

            return Object.keys(hash).reduce(function (result, hashKey) {
                value = hash[hashKey];

                if (typeof value === 'string') {
                    value = Ember['default'].Handlebars.Utils.escapeExpression(value);
                }

                result[hashKey] = value;
                return result;
            }, {});
        },

        format: function format(value, hash) {
            var locales = hash.locales;
            hash = this.escapeProps(hash);
            var superResult = this._super(value, hash, locales);
            return Ember['default'].String.htmlSafe(superResult);
        }
    });

    exports['default'] = FormatHtmlMessage;

});
define('frontend-cp/formatters/format-message', ['exports', 'ember', 'ember-intl/formatter-base', 'ember-intl/models/intl-get-result'], function (exports, Ember, Formatter, IntlGetResult) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var validKey = /[\w|.]/;

    var FormatMessage = Formatter['default'].extend({
        format: function format(value, hash, optionalLocale) {
            var locales = optionalLocale || hash.locales;
            var formatOptions = {};

            if (value instanceof IntlGetResult['default']) {
                if (typeof locales === 'undefined') {
                    locales = value.locale;
                }

                value = value.translation;
            }

            if (locales) {
                formatOptions.locales = locales;
            }

            return this.intl.formatMessage(value, hash, formatOptions);
        }
    });

    FormatMessage.reopenClass({
        formatOptions: Ember['default'].A()
    });

    exports['default'] = FormatMessage;

});
define('frontend-cp/formatters/format-number', ['exports', 'ember', 'ember-intl/formatter-base'], function (exports, Ember, Formatter) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var FormatNumber = Formatter['default'].extend({
        format: function format(value, hash) {
            var args = this.buildOptions(value, hash);
            var intl = this.intl;

            return intl.formatNumber.apply(intl, args);
        }
    });

    FormatNumber.reopenClass({
        formatOptions: Ember['default'].A(['localeMatcher', 'style', 'currency', 'currencyDisplay', 'useGrouping', 'minimumIntegerDigits', 'minimumFractionDigits', 'maximumFractionDigits', 'minimumSignificantDigits', 'maximumSignificantDigits'])
    });

    exports['default'] = FormatNumber;

});
define('frontend-cp/formatters/format-relative', ['exports', 'ember', 'ember-intl/formatter-base'], function (exports, Ember, Formatter) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var FormatRelative = Formatter['default'].extend({
        format: function format(value, hash) {
            var args = this.buildOptions(value, hash);
            var intl = this.intl;

            return intl.formatRelative.apply(intl, args);
        }
    });

    FormatRelative.reopenClass({
        formatOptions: Ember['default'].A(['style', 'units'])
    });

    exports['default'] = FormatRelative;

});
define('frontend-cp/formatters/format-time', ['exports', 'ember', 'ember-intl/formatter-base'], function (exports, Ember, Formatter) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var FormatTime = Formatter['default'].extend({
        format: function format(value, hash) {
            var args = this.buildOptions(value, hash);
            var intl = this.intl;

            return intl.formatTime.apply(intl, args);
        }
    });

    FormatTime.reopenClass({
        formatOptions: Ember['default'].A(['localeMatcher', 'timeZone', 'hour12', 'formatMatcher', 'weekday', 'era', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timeZoneName'])
    });

    exports['default'] = FormatTime;

});
define('frontend-cp/helpers/-intl-get', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return '%' + value + '%';
  });

});
define('frontend-cp/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, Ember, andHelper) {

	'use strict';

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(andHelper['default']);

	exports.andHelper = andHelper['default'];

});
define('frontend-cp/helpers/equal', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, Ember, equalHelper) {

	'use strict';

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(equalHelper['default']);

	exports.equalHelper = equalHelper['default'];

});
define('frontend-cp/helpers/escape-html', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return value;
  });

});
define('frontend-cp/helpers/format-date', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-date');

});
define('frontend-cp/helpers/format-html-message', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-html-message');

});
define('frontend-cp/helpers/format-message', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-message');

});
define('frontend-cp/helpers/format-number', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-number');

});
define('frontend-cp/helpers/format-relative', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-relative');

});
define('frontend-cp/helpers/format-time', ['exports', 'ember-intl/helpers/base'], function (exports, FormatHelper) {

	'use strict';

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */

	exports['default'] = FormatHelper['default']('format-time');

});
define('frontend-cp/helpers/get', ['exports', 'ember', 'ember-get-helper/helpers/get'], function (exports, Ember, getHelper) {

	'use strict';

	exports['default'] = getHelper['default'];

	exports.getHelper = getHelper['default'];

});
define('frontend-cp/helpers/intl-get', ['exports', 'ember', 'ember-intl/utils/streams'], function (exports, Ember, streams) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    exports['default'] = function (value, options) {
        Ember['default'].assert('intl-get helper must be used as a subexpression', options.isInline === true);

        var view = options.data.view;
        var types = options.types;
        var hash = streams.readHash(options.hash);
        var intl = view.container.lookup('service:intl');

        var currentValue = value;
        var outStreamValue = '';
        var valueStream;

        var outStream = new streams.Stream(function () {
            return outStreamValue;
        });

        outStream.setValue = function (_value) {
            outStreamValue = _value;
            this.notify();
        };

        function valueStreamChanged() {
            currentValue = valueStream.value();
            pokeStream();
        }

        function pokeStream() {
            return intl.getTranslation(streams.read(currentValue), hash.locales).then(function (translation) {
                outStream.setValue(translation);
            });
        }

        if (types[0] === 'ID') {
            valueStream = view.getStream(value);
            currentValue = valueStream.value();
            valueStream.subscribe(valueStreamChanged);
        }

        intl.on('localesChanged', this, pokeStream);

        view.one('willDestroyElement', this, function () {
            intl.off('localesChanged', this, pokeStream);

            if (valueStream) {
                valueStream.unsubscribe(valueStreamChanged);
            }

            streams.destroyStream(outStream);
        });

        pokeStream();

        return outStream;
    };

});
define('frontend-cp/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, Ember, isArrayHelper) {

	'use strict';

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(isArrayHelper['default']);

	exports.isArrayHelper = isArrayHelper['default'];

});
define('frontend-cp/helpers/ko-helper', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var _this = undefined;

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args[0].apply(_this, args.slice(1, -1));
  });

});
define('frontend-cp/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, Ember, notHelper) {

	'use strict';

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(notHelper['default']);

	exports.notHelper = notHelper['default'];

});
define('frontend-cp/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, Ember, orHelper) {

	'use strict';

	exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(orHelper['default']);

	exports.orHelper = orHelper['default'];

});
define('frontend-cp/initializers/app-version', ['exports', 'frontend-cp/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('frontend-cp/initializers/ember-cli-mirage', ['exports', 'frontend-cp/config/environment', 'frontend-cp/mirage/config', 'ember-cli-mirage/server', 'ember-cli-mirage/utils/read-fixtures', 'ember-cli-mirage/utils/read-factories'], function (exports, ENV, userConfig, Server, readFixtures, readFactories) {

  'use strict';

  exports['default'] = {
    name: 'ember-cli-mirage',
    initialize: function initialize(container, application) {
      var env = ENV['default'].environment;

      if (_shouldUseMirage(env, ENV['default']['ember-cli-mirage'])) {
        var factoryMap = readFactories['default'](ENV['default'].modulePrefix);
        var fixtures = readFixtures['default'](ENV['default'].modulePrefix);
        var server = new Server['default']({
          environment: env
        });

        server.loadConfig(userConfig['default']);

        if (env === 'test' && factoryMap) {
          server.loadFactories(factoryMap);
        } else {
          server.db.loadData(fixtures);
        }
      }
    }
  };

  function _shouldUseMirage(env, addonConfig) {
    var userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
    var defaultEnabled = _defaultEnabled(env, addonConfig);

    return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
  };

  /*
    Returns a boolean specifying the default behavior for whether
    to initialize Mirage.
  */
  function _defaultEnabled(env, addonConfig) {
    var usingInDev = env === 'development' && !addonConfig.usingProxy;
    var usingInTest = env === 'test';

    return usingInDev || usingInTest;
  }

});
define('frontend-cp/initializers/ember-intl', ['exports', 'ember', 'frontend-cp/config/environment', 'frontend-cp/services/intl', 'ember-intl/utils/data', 'frontend-cp/helpers/format-date', 'frontend-cp/helpers/format-time', 'frontend-cp/helpers/format-relative', 'frontend-cp/helpers/format-number', 'frontend-cp/helpers/format-html-message', 'frontend-cp/helpers/format-message'], function (exports, Ember, ENV, IntlService, data, FormatDate, FormatTime, FormatRelative, FormatNumber, FormatHtmlMessage, FormatMessage) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var registerIntl = function registerIntl(container) {
        var seen = requirejs._eak_seen;
        var prefix = ENV['default'].modulePrefix;

        container.optionsForType('formats', {
            singleton: true,
            instantiate: false
        });

        container.optionsForType('locale', {
            singleton: true,
            instantiate: true
        });

        Object.keys(seen).filter(function (key) {
            return key.indexOf(prefix + '/cldrs/') === 0;
        }).forEach(function (key) {
            data.addLocaleData(require(key, null, null, true)['default']);
        });

        if (Ember['default'].HTMLBars) {
            Ember['default'].HTMLBars._registerHelper('format-date', FormatDate['default']);
            Ember['default'].HTMLBars._registerHelper('format-time', FormatTime['default']);
            Ember['default'].HTMLBars._registerHelper('format-relative', FormatRelative['default']);
            Ember['default'].HTMLBars._registerHelper('format-number', FormatNumber['default']);
            Ember['default'].HTMLBars._registerHelper('format-html-message', FormatHtmlMessage['default']);
            Ember['default'].HTMLBars._registerHelper('format-message', FormatMessage['default']);
        }

        // only here for backwards compat.
        container.register('intl:main', container.lookup('service:intl'), {
            instantiate: false,
            singleton: true
        });

        container.typeInjection('controller', 'intl', 'service:intl');
        container.typeInjection('component', 'intl', 'service:intl');
        container.typeInjection('route', 'intl', 'service:intl');
        container.typeInjection('model', 'intl', 'service:intl');
        container.typeInjection('view', 'intl', 'service:intl');
        container.typeInjection('formatter', 'intl', 'service:intl');
    };

    exports['default'] = {
        name: 'ember-intl',

        initialize: function initialize(container, app) {
            registerIntl(container);
            app.intl = container.lookup('service:intl');
        }
    };

    exports.registerIntl = registerIntl;

});
define('frontend-cp/initializers/ember-moment', ['exports', 'ember-moment/helpers/moment', 'ember-moment/helpers/ago', 'ember-moment/helpers/duration', 'ember'], function (exports, moment, ago, duration, Ember) {

  'use strict';

  var initialize = function initialize() {
    var registerHelper;

    if (Ember['default'].HTMLBars) {
      registerHelper = function (helperName, fn) {
        Ember['default'].HTMLBars._registerHelper(helperName, Ember['default'].HTMLBars.makeBoundHelper(fn));
      };
    } else {
      registerHelper = Ember['default'].Handlebars.helper;
    };

    registerHelper('moment', moment['default']);
    registerHelper('ago', ago['default']);
    registerHelper('duration', duration['default']);
  };

  exports['default'] = {
    name: 'ember-moment',

    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});
define('frontend-cp/initializers/export-application-global', ['exports', 'ember', 'frontend-cp/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('frontend-cp/initializers/get-helper', ['exports', 'ember-get-helper/utils/register-helper', 'ember-get-helper/helpers/get'], function (exports, register_helper, getHelper) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    register_helper.registerHelper('get', getHelper['default']);
  }

  exports['default'] = {
    name: 'get-helper',
    initialize: initialize
  };
  /* container, application */

});
define('frontend-cp/initializers/inflector', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = {
    name: 'inflector',

    initialize: function initialize() {
      var inflector = Ember['default'].Inflector.inflector;
      inflector.irregular('person', 'persons');
    }
  };

});
define('frontend-cp/initializers/truth-helpers', ['exports', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array'], function (exports, register_helper, and, or, equal, not, is_array) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    register_helper.registerHelper('and', and.andHelper);
    register_helper.registerHelper('or', or.orHelper);
    register_helper.registerHelper('eq', equal.equalHelper);
    register_helper.registerHelper('not', not.notHelper);
    register_helper.registerHelper('is-array', is_array.isArrayHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };
  /* container, application */

});
define('frontend-cp/instance-initializers/session', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    name: 'session',

    initialize: function initialize(instance) {
      var localStoreService = instance.container.lookup('service:localStore');
      var sessionService = instance.container.lookup('service:session');

      // Use sessionId stored in the localStore if available
      var sessionId = localStoreService.getItem('sessionId');
      sessionService.setSessionId(sessionId);
    }
  };

});
define('frontend-cp/loading/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "ko-loader", [], {"large": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-center", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/locales/new-locale', ['exports', 'ember-intl/models/locale'], function (exports, Locale) {

  'use strict';

  exports['default'] = Locale['default'].extend({
    locale: '',
    messages: {},

    addMessage: function addMessage(key, value) {
      this.messages[key] = value;
      return value;
    },

    getValue: function getValue(key) {
      return this.messages['frontendcp.universal.' + key];
    }
  });

});
define('frontend-cp/login/controller', ['exports', 'ember', 'frontend-cp/mixins/simple-state'], function (exports, Ember, SimpleStateMixin) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(SimpleStateMixin['default'], {

    sessionService: Ember['default'].inject.service('session'),
    newPassword1: '',
    newPassword2: '',
    forgotPasswordMessage: '',
    stepToken: null,
    fieldErrors: [],
    avatarBackground: null,
    validAvatar: false,
    flipAvatar: false,
    authEndpoint: '/admin/index.php?/Base/Auth/',
    isContentDown: false,
    prevLoginState: null,
    topFormSet: null,
    bottomFormSet: null,
    isAnimatingContent: null,

    init: function init() {
      this.setState('login.password.input');
      this.set('prevLoginState', this.get('currentState'));
      this._super.apply(this);
    },

    stateMap: {
      login: {
        password: {
          input: {},
          loading: {},
          confirmed: {},
          error: {}
        },
        otp: {
          input: {},
          loading: {},
          confirmed: {},
          error: {}
        },
        resetPassword: {
          input: {},
          loading: {},
          confirmed: {},
          error: {}
        }
      },
      forgotPassword: {
        input: {},
        loading: {},
        confirmed: {},
        error: {}
      }
    },

    // Observers

    emailValidDidChange: (function () {
      if (this.get('emailValid')) {
        this.requestAvatar(this.get('model.email'));
      }
    }).observes('emailValid').on('render'),

    avatarBackgroundDidChange: (function () {
      this.set('flipAvatar', this.get('validAvatar') && this.get('avatarBackground'));
    }).observes('validAvatar', 'avatarBackground'),

    sessionDidClear: (function () {
      if (this.get('session.sessionId') === null) {
        this.setState('login.password.input');
      }
    }).observes('session.sessionId').on('init'),

    currentStateDidChange: (function () {
      var _this = this;

      var currentState = this.get('currentState');

      // Ignore anything outside the login root state
      if (!this.isInState('login', currentState)) {
        return;
      }

      var stateMeta = {
        'password': {
          order: 0,
          component: 'ko-login-password'
        },
        'otp': {
          order: 1,
          component: 'ko-login-otp'
        },
        'resetPassword': {
          order: 2,
          component: 'ko-login-reset'
        }
      };

      var prevState = this.get('prevLoginState');
      var currentSubState = this.getStateAtLevel(1, currentState);
      var prevSubState = this.getStateAtLevel(1, prevState);
      var currentStateMeta = stateMeta[currentSubState];
      var prevStateMeta = stateMeta[prevSubState];
      var isContentDown = null;

      /**
       * Determine the direction of movement depending on 'order' of item
       * Eg. moving from password to otp will move down,
       * otp to resetPassword will move down again
       * resetPassword to password will move up (once, we don't want to go 'past' otp)
       */

      // This should explicitly do nothing if the orders are equal
      if (currentStateMeta.order > prevStateMeta.order) {
        isContentDown = true;
      } else if (currentStateMeta.order < prevStateMeta.order) {
        isContentDown = false;
      }

      // Place content area in pre-animation state
      Ember['default'].run(function () {
        // Choose where to place the prev and next components
        _this.setProperties({
          topFormSet: isContentDown ? prevStateMeta.component : currentStateMeta.component,
          bottomFormSet: isContentDown ? currentStateMeta.component : prevStateMeta.component
        });

        // Switch off animation
        _this.set('isAnimatingContent', false);

        if (currentSubState !== prevSubState) {
          // Move content to show the previous component
          _this.set('isContentDown', !isContentDown);
        }
      });

      // In next run loop run the animation
      Ember['default'].run.next(function () {
        // Switch on animation
        _this.set('isAnimatingContent', true);
        _this.set('isContentDown', isContentDown);
      });

      // Store prevState for comparison
      this.set('prevLoginState', currentState);
    }).observes('currentState').on('init'),

    // Computed Properties

    isLogin: (function () {
      var currentState = this.get('currentState');
      var prevState = this.get('prevLoginState');
      var isInLogin = this.isInState('login', currentState);
      var wasInLogin = this.isInState('login', prevState);
      if (isInLogin !== wasInLogin) {
        this.clearErrors();
      }
      return isInLogin;
    }).property('currentState', 'prevLoginState'),

    isLoading: (function () {
      return this.endsWithSubState('loading', this.get('currentState'));
    }).property('currentState'),

    isOtp: (function () {
      return this.isInState('login.otp', this.get('currentState'));
    }).property('currentState'),

    isPassword: (function () {
      return this.isInState('login.password', this.get('currentState'));
    }).property('currentState'),

    isResetPassword: (function () {
      return this.isInState('login.resetPassword', this.get('currentState'));
    }).property('currentState'),

    isError: (function () {
      return this.endsWithSubState('error', this.get('currentState'));
    }).property('currentState'),

    isForgotPasswordEmailSent: (function () {
      return this.isInState('forgotPassword.confirmed', this.get('currentState'));
    }).property('currentState'),

    emailValid: (function () {
      var emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i;
      return !!this.get('model.email').match(emailRegex);
    }).property('model.email'),

    passwordValid: (function () {
      return this.get('model.password').length > 0;
    }).property('model.password'),

    canAttemptLogin: (function () {
      return this.get('emailValid') && this.get('passwordValid');
    }).property('emailValid', 'passwordValid'),

    loginButtonDisabled: (function () {
      return !this.get('canAttemptLogin') || this.get('isLoading') || !this.get('newPasswordValid') && this.get('isResetPassword');
    }).property('canAttemptLogin', 'isLoading', 'newPasswordValid', 'isResetPassword'),

    newPasswordValid: (function () {
      var password1 = this.get('newPassword1');
      var password2 = this.get('newPassword2');
      return password1 === password2 && !!password1 && password1.length > 7;
    }).property('newPassword1', 'newPassword2'),

    errorMessages: (function () {
      return this.get('fieldErrors').map(function (error) {
        return error.message;
      });
    }).property('fieldErrors.@each'),

    // Methods

    setErrors: function setErrors(errors) {
      this.set('fieldErrors', new Ember['default'].A(errors));
    },

    clearErrors: function clearErrors() {
      this.set('fieldErrors', []);
    },

    authRequest: function authRequest(endpoint, params) {
      var _this2 = this;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        Ember['default'].$.ajax({
          type: 'POST',
          url: _this2.get('authEndpoint') + endpoint,
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          dataType: 'json',
          data: Ember['default'].$.param(params),
          success: function success(data) {
            resolve(data);
          },
          error: function error(xhr) {
            reject(xhr.responseText);
          }
        });
      });
    },

    requestAvatar: function requestAvatar(email) {
      var _this3 = this;

      Ember['default'].$.ajax({
        type: 'POST',
        url: '/admin/index.php?/Base/Avatar/JSON/0/200',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        data: Ember['default'].$.param({ email: email }),
        success: function success(response) {
          /**
           * data.is_user dictates whether or not the returned image was gravatars
           * default image or not, if it was, we do not want to flip, treat it as a failed
           * call
           */

          var valid = !!response.data.is_user;

          _this3.set('validAvatar', valid);

          if (valid) {
            _this3.set('avatarBackground', response.data.data);
          }
        },
        error: function error() {}
      });
    },

    login: function login() {
      var _this4 = this;

      this.setState('login.password.loading');
      this.get('sessionService').requestSession(this.get('model.email'), this.get('model.password')).then(function (response) {
        var data = response.data;
        if (data.otp_required) {
          // User needs to enter one time password for two factor authentication
          _this4.set('stepToken', data.step_token);
          _this4.setState('login.otp.input');
        } else if (data.password_expired) {
          // User needs to enter a new password to continue
          _this4.set('stepToken', data.step_token);
          _this4.setState('login.resetPassword.input');
        } else {
          // No additional info required, log in.
          if (data.session) {
            _this4.get('sessionService').setSessionId(data.session);
            _this4.setState('login.password.confirmed');
            _this4.transitionToRoute('session');
          } else {
            _this4.setState('login.resetPassword.error');
            _this4.setErrors({ message: 'Session missing' });
          }
        }
      }, function (response) {
        _this4.setState('login.password.error');
        _this4.setErrors(JSON.parse(response).errors);
      });
    },

    resetPassword: function resetPassword() {
      var _this5 = this;

      this.setState('login.resetPassword.loading');
      this.setErrors([]);
      this.authRequest('ResetPassword', {
        newpassword: this.get('newPassword1'),
        hash: this.get('steptoken')
      }).then(function (response) {
        if (response.data.session) {
          _this5.setState('login.resetPassword.confirmed');
          _this5.set('resetPasswordMessage', response.notifications.success[0]);
          _this5.get('sessionService').setSessionId(response.data.session);
          _this5.set('newPassword1', null);
          _this5.set('newPassword2', null);
          _this5.transitionToRoute('session');
        } else {
          _this5.setState('login.resetPassword.error');
          _this5.setErrors({ message: 'Session missing' });
        }
      }, function (response) {
        _this5.setState('login.resetPassword.error');
        _this5.setErrors(JSON.parse(response).errors);
      });
    },

    submitOtp: function submitOtp() {
      var _this6 = this;

      this.setState('login.otp.loading');
      this.setErrors([]);
      this.authRequest('OTP', {
        otp: this.get('otp'),
        token: this.get('steptoken')
      }).then(function (response) {
        if (response.data.session) {
          _this6.setState('login.otp.confirmed');
          _this6.get('sessionService').setSessionId(response.data.session);
          _this6.set('otp', null);
          _this6.transitionToRoute('session');
        } else {
          _this6.setState('login.otp.error');
          _this6.setErrors([{ message: 'Session missing' }]);
        }
      }, function (response) {
        _this6.setState('login.otp.error');
        _this6.setErrors(JSON.parse(response).errors);
      });
    },

    actions: {
      login: function login() {
        this.setErrors([]);

        if (!this.isInState('login', this.get('currentState'))) {
          return;
        }

        var funcMap = {
          password: this.login,
          resetPassword: this.resetPassword,
          otp: this.submitOtp
        };

        funcMap[this.getStateAtLevel(1)].call(this);
      },

      gotoForgotPassword: function gotoForgotPassword() {
        this.setState('forgotPassword.input');
      },

      gotoLogin: function gotoLogin() {
        this.setState('login.password.input');
      },

      sendForgotPasswordEmail: function sendForgotPasswordEmail() {
        var _this7 = this;

        this.setState('forgotPassword.loading');
        this.setErrors([]);
        this.authRequest('ForgotPassword', { email: this.get('model.email') }).then(function (response) {
          _this7.setState('forgotPassword.confirmed');
          _this7.set('forgotPasswordMessage', response.notifications.success[0]);
        }, function (response) {
          _this7.setState('forgotPassword.error');
          _this7.setErrors(JSON.parse(response).errors);
        });
      }
    }
  });

  // TODO

});
define('frontend-cp/login/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    sessionService: Ember['default'].inject.service('session'),

    beforeModel: function beforeModel() {
      if (this.get('sessionService').getSessionId() !== null) {
        this.transitionTo('session');
      }
    },

    model: function model() {
      // FIXME temp
      return Ember['default'].Object.create({
        email: 'test@kayako.com',
        password: 'setup'
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('model', model);
    }
  });

});
define('frontend-cp/login/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","login-form__wrapper");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h6");
          dom.setAttribute(el2,"class","t-center t-good");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),0,0);
          content(env, morph0, context, "forgotPasswordMessage");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          set(env, context, "message", blockArguments[0]);
          content(env, morph0, context, "message");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","login-form__wrapper");
          var el2 = dom.createTextNode("\n                  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","login-form__wrapper");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"class","button button--primary u-1/1 u-mt");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, inline = hooks.inline, attribute = hooks.attribute, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [3, 1]);
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          var morph1 = dom.createMorphAt(element0,0,0);
          var attrMorph0 = dom.createAttrMorph(element0, 'disabled');
          inline(env, morph0, context, "input", [], {"type": "email", "value": get(env, context, "model.email"), "name": "forgot-password", "class": "login__input login__input--alone", "placeholder": subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["login.email"], {})], {}), "disabled": get(env, context, "isLoading")});
          attribute(env, attrMorph0, element0, "disabled", get(env, context, "isLoading"));
          element(env, element0, context, "action", ["sendForgotPasswordEmail"], {});
          inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["login.resetpassword"], {})], {});
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          set(env, context, "message", blockArguments[0]);
          content(env, morph0, context, "message");
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "component", [get(env, context, "topFormSet")], {"model": get(env, context, "model"), "isLoading": get(env, context, "isLoading"), "otp": get(env, context, "top"), "newPassword1": get(env, context, "newPassword1"), "newPassword2": get(env, context, "newPassword2")});
          return fragment;
        }
      };
    }());
    var child5 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "component", [get(env, context, "bottomFormSet")], {"model": get(env, context, "model"), "isLoading": get(env, context, "isLoading"), "otp": get(env, context, "top"), "newPassword1": get(env, context, "newPassword1"), "newPassword2": get(env, context, "newPassword2")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","login");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flipper");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","front");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login__image");
        dom.setAttribute(el5,"style","background-image: url('/images/person/avatar.png');");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","back");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login__image");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","login-form");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4,"class","login-form__reset-form");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        dom.setAttribute(el5,"class","login__header login__header--reset t-center");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h6");
        dom.setAttribute(el5,"class","t-center t-bad");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login-form__wrapper login__actions");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","javascript:void(0);");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4,"class","login-form__form");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        dom.setAttribute(el5,"class","login__header t-center");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h6");
        dom.setAttribute(el5,"class","t-center t-bad");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login-form__mask");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","login-form__fields-container-top");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","login-form__fields-container-bottom");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login-form__wrapper");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"class","button button--primary u-1/1 u-mt");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","login-form__wrapper login__actions");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","javascript:void(0);");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, inline = hooks.inline, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [1, 3, 1]);
        var element4 = dom.childAt(element1, [3, 1]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element5, [9, 1]);
        var element7 = dom.childAt(element4, [3]);
        var element8 = dom.childAt(element7, [5, 1]);
        var element9 = dom.childAt(element7, [7, 1]);
        var element10 = dom.childAt(element7, [9, 1]);
        var attrMorph0 = dom.createAttrMorph(element2, 'class');
        var attrMorph1 = dom.createAttrMorph(element3, 'style');
        var attrMorph2 = dom.createAttrMorph(element4, 'class');
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1]),0,0);
        var morph1 = dom.createMorphAt(element5,3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element5, [5]),0,0);
        var morph3 = dom.createMorphAt(element5,7,7);
        var morph4 = dom.createMorphAt(element6,0,0);
        var attrMorph3 = dom.createAttrMorph(element6, 'class');
        var morph5 = dom.createMorphAt(dom.childAt(element7, [1]),0,0);
        var morph6 = dom.createMorphAt(dom.childAt(element7, [3]),0,0);
        var attrMorph4 = dom.createAttrMorph(element8, 'class');
        var morph7 = dom.createMorphAt(dom.childAt(element8, [1]),1,1);
        var morph8 = dom.createMorphAt(dom.childAt(element8, [3]),1,1);
        var morph9 = dom.createMorphAt(element9,0,0);
        var attrMorph5 = dom.createAttrMorph(element9, 'disabled');
        var morph10 = dom.createMorphAt(element10,0,0);
        var attrMorph6 = dom.createAttrMorph(element10, 'class');
        attribute(env, attrMorph0, element2, "class", concat(env, ["flip-container ", subexpr(env, context, "if", [get(env, context, "flipAvatar"), "flip"], {}), " ", subexpr(env, context, "if", [get(env, context, "isLoading"), "a-success"], {}), " ", subexpr(env, context, "if", [get(env, context, "isError"), "a-error"], {})]));
        attribute(env, attrMorph1, element3, "style", concat(env, ["background-image: url('", get(env, context, "avatarBackground"), "');"]));
        attribute(env, attrMorph2, element4, "class", concat(env, ["login-form__container ", subexpr(env, context, "if", [get(env, context, "isLogin"), "u-slide"], {})]));
        inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["login.resetpassword"], {})], {});
        block(env, morph1, context, "if", [get(env, context, "isForgotPasswordEmailSent")], {}, child0, null);
        block(env, morph2, context, "each", [get(env, context, "errorMessages")], {}, child1, null);
        block(env, morph3, context, "if", [subexpr(env, context, "not", [get(env, context, "isForgotPasswordEmailSent")], {})], {}, child2, null);
        attribute(env, attrMorph3, element6, "class", concat(env, ["js-slide ", subexpr(env, context, "if", [get(env, context, "isLoading"), "u-disable-link"], {})]));
        element(env, element6, context, "action", ["gotoLogin"], {});
        inline(env, morph4, context, "format-message", [subexpr(env, context, "intl-get", ["login.back"], {})], {});
        inline(env, morph5, context, "format-message", [subexpr(env, context, "intl-get", ["login.welcome"], {})], {});
        block(env, morph6, context, "each", [get(env, context, "errorMessages")], {}, child3, null);
        attribute(env, attrMorph4, element8, "class", concat(env, ["login-form__content ", subexpr(env, context, "if", [get(env, context, "isAnimatingContent"), "login-form__content--animate"], {}), " ", subexpr(env, context, "if", [get(env, context, "isContentDown"), "login-form__content-down"], {})]));
        block(env, morph7, context, "if", [get(env, context, "topFormSet")], {}, child4, null);
        block(env, morph8, context, "if", [get(env, context, "bottomFormSet")], {}, child5, null);
        attribute(env, attrMorph5, element9, "disabled", get(env, context, "loginButtonDisabled"));
        element(env, element9, context, "action", ["login"], {});
        inline(env, morph9, context, "format-message", [subexpr(env, context, "intl-get", ["login.login"], {})], {});
        attribute(env, attrMorph6, element10, "class", concat(env, ["js-slide ", subexpr(env, context, "if", [get(env, context, "isLoading"), "u-disable-link"], {})]));
        element(env, element10, context, "action", ["gotoForgotPassword"], {});
        inline(env, morph10, context, "format-message", [subexpr(env, context, "intl-get", ["login.forgot"], {})], {});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/mirage/config', ['exports'], function (exports) {

  'use strict';

  exports['default'] = function () {

    this.post('admin/index.php', function () {
      return {
        'data': {
          'redirect': '/Base/Dashboard/',
          'session': 'AyUeuWPDD8JC2OA0c8335f8d1a99218c84cd7b97f7fcc2269a2e4274ieu04PQxkr2EAjPp9Z2Y2tJKd'
        },
        'errors': [],
        'notifications': {
          'error': [],
          'info': [],
          'success': [],
          'warning': []
        },
        'status': 200,
        'timestamp': 1432593047
      };
    });

    this.get('api/v1/locales/current', function () {
      return {
        'status': 200,
        'data': {
          'locale': 'en-us',
          'name': 'English (United States)',
          'native_name': 'English (United States)',
          'region': 'US',
          'native_region': 'United States',
          'script': '',
          'variant': '',
          'direction': 'LTR',
          'is_enabled': true,
          'created_at': '2015-05-28T14:12:59Z',
          'updated_at': '2015-05-28T14:12:59Z',
          'resource_type': 'locale'
        },
        'resource': 'locale'
      };
    });

    this.get('api/v1/locales/en-us/strings', function () {
      return {
        'status': 200,
        'data': {
          'frontendcp.universal.admin.administration': 'Administration',
          'frontendcp.universal.admin.apps': 'Apps',
          'frontendcp.universal.admin.endpoints': 'Endpoints',
          'frontendcp.universal.cases.activity': 'Activity',
          'frontendcp.universal.cases.addparticipant': 'Add a participant',
          'frontendcp.universal.cases.assignee': 'Assignee',
          'frontendcp.universal.cases.cases': 'Cases',
          'frontendcp.universal.cases.due': 'Due',
          'frontendcp.universal.cases.lastreplier': 'Last replier',
          'frontendcp.universal.cases.lastupdated': 'Last updated {time}',
          'frontendcp.universal.cases.metric.total': '{number, number} Total',
          'frontendcp.universal.cases.metric.unresolved': 'Unresolved',
          'frontendcp.universal.cases.newtag': 'New Tag',
          'frontendcp.universal.cases.note': 'Note',
          'frontendcp.universal.cases.priority': 'Priority',
          'frontendcp.universal.cases.requester': 'Requester',
          'frontendcp.universal.cases.status': 'Status',
          'frontendcp.universal.cases.subheader': '{time, date, medium} – {time, time, short} created via {channel}{hasBrand, select,\n    true {, {brand}}\n    false {}\n  }',
          'frontendcp.universal.cases.subject': 'Subject',
          'frontendcp.universal.cases.submit': 'Submit',
          'frontendcp.universal.cases.ticketid': 'Ticket ID',
          'frontendcp.universal.cases.type': 'Type',
          'frontendcp.universal.feed.replied': 'replied {ago}',
          'frontendcp.universal.generic.next': 'Next',
          'frontendcp.universal.generic.close': 'close',
          'frontendcp.universal.generic.datepicker.clear': 'Clear',
          'frontendcp.universal.generic.datepicker.close': 'Close',
          'frontendcp.universal.generic.datepicker.today': 'Today',
          'frontendcp.universal.generic.filesize': '{size, number, filesize} {unit, select,\n    mb {MB}\n    kb {KB}\n  }',
          'frontendcp.universal.generic.logout': 'logout',
          'frontendcp.universal.generic.paginatorof': 'of {number, number}',
          'frontendcp.universal.generic.popover.next': 'next',
          'frontendcp.universal.generic.popover.previous': 'previous',
          'frontendcp.universal.generic.search': 'Search helpdesk...',
          'frontendcp.universal.generic.texteditor.attachment': 'Attachment',
          'frontendcp.universal.generic.texteditor.authorship': 'Authorship',
          'frontendcp.universal.generic.texteditor.cc': 'CC',
          'frontendcp.universal.generic.texteditor.billing': 'Billing',
          'frontendcp.universal.generic.texteditor.bold': 'Bold',
          'frontendcp.universal.generic.texteditor.bullet': 'Bullet',
          'frontendcp.universal.generic.texteditor.image': 'Image',
          'frontendcp.universal.generic.texteditor.italic': 'Italic',
          'frontendcp.universal.generic.texteditor.link': 'Link',
          'frontendcp.universal.generic.texteditor.list': 'List',
          'frontendcp.universal.generic.users': 'Users',
          'frontendcp.universal.login.back': '« Back',
          'frontendcp.universal.login.email': 'Email',
          'frontendcp.universal.login.forgot': 'Forgot password?',
          'frontendcp.universal.login.login': 'Login',
          'frontendcp.universal.login.newpassword': 'New Password',
          'frontendcp.universal.login.password': 'Password',
          'frontendcp.universal.login.repeatpassword': 'Password (repeat)',
          'frontendcp.universal.login.resetpassword': 'Reset your password',
          'frontendcp.universal.login.welcome': 'Welcome to Kayako'
        },
        'resource': 'string'
      };
    });

    // These comments are here to help you get started. Feel free to delete them.

    /*
      Default config
    */
    // this.namespace = '';    // make this `api`, for example, if your API is namespaced
    // this.timing = 400;      // delay for each request, automatically set to 0 during testing

    /*
      Route shorthand cheatsheet
    */
    /*
      GET shorthands
       // Collections
      this.get('/contacts');
      this.get('/contacts', 'users');
      this.get('/contacts', ['contacts', 'addresses']);
       // Single objects
      this.get('/contacts/:id');
      this.get('/contacts/:id', 'user');
      this.get('/contacts/:id', ['contact', 'addresses']);
    */

    /*
      POST shorthands
       this.post('/contacts');
      this.post('/contacts', 'user'); // specify the type of resource to be created
    */

    /*
      PUT shorthands
       this.put('/contacts/:id');
      this.put('/contacts/:id', 'user'); // specify the type of resource to be updated
    */

    /*
      DELETE shorthands
       this.del('/contacts/:id');
      this.del('/contacts/:id', 'user'); // specify the type of resource to be deleted
       // Single object + related resources. Make sure parent resource is first.
      this.del('/contacts/:id', ['contact', 'addresses']);
    */

    /*
      Function fallback. Manipulate data in the db via
         - db.{collection} // returns all the data defined in /app/mirage/fixtures/{collection}.js
        - db.{collection}.find(id)
        - db.{collection}.where(query)
        - db.{collection}.update(target, attrs)
        - db.{collection}.remove(target)
       // Example: return a single object with related models
      this.get('/contacts/:id', function(db, request) {
        var contactId = +request.params.id;
        var contact = db.contacts.find(contactId);
        var addresses = db.addresses
          .filterBy('contact_id', contactId);
         return {
          contact: contact,
          addresses: addresses
        };
      });
     */
  }

});
define('frontend-cp/mirage/factories/contact', ['exports', 'ember-cli-mirage'], function (exports, Mirage) {

  'use strict';

  /*
    This is an example factory definition. Factories are
    used inside acceptance tests.

    Create more files in this directory to define additional factories.
  */
  exports['default'] = Mirage['default'].Factory.extend({
    name: 'Pete',
    age: 20,

    email: function email(i) {
      return 'person' + i + '@test.com';
    },

    admin: function admin() {
      return this.age > 30;
    }
  });

});
define('frontend-cp/mirage/fixtures/contacts', ['exports'], function (exports) {

  'use strict';

  /*
    This is an example. This data will be added to the db
    under the `contacts` key.

    Create more files in this directory to add more data.
  */
  exports['default'] = [{
    id: 1,
    name: 'Zelda'
  }, {
    id: 2,
    name: 'Link'
  }];

});
define('frontend-cp/mixins/breadcrumbable', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    urlService: Ember['default'].inject.service('url'),

    activeBreadcrumb: (function () {
      var breadcrumbs = this.get('breadcrumbs');
      if (!breadcrumbs) {
        return null;
      }
      var currentPath = this.get('urlService.currentPath');

      if (!currentPath) {
        return null;
      }

      var selected = breadcrumbs.find(function (breadcrumb) {
        return currentPath.indexOf(breadcrumb.route) === 0;
      });

      return selected ? selected.id : null;
    }).property('urlService.currentPath', 'breadcrumbs'),

    setBreadcrumb: function setBreadcrumb(id) {
      var breadcrumb = this.get('breadcrumbs').find(function (breadcrumb) {
        return breadcrumb.id === id;
      });
      this.transitionToRoute(breadcrumb.route);
    },

    actions: {
      breadcrumbChange: function breadcrumbChange(id) {
        this.setBreadcrumb(id);
      }
    }
  });

});
define('frontend-cp/mixins/drop-down-keyboard-nav', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({

    moveSelectedItem: function moveSelectedItem(listLength, ulSelector, direction, positionProperty) {
      var position = this.get(positionProperty);
      switch (direction) {
        case 'down':
          {
            position = ++position;
            if (position <= listLength) {
              this.$(ulSelector + ' li:nth-child(' + position + ')').focus();
              this.set(positionProperty, position);
            }
            break;
          }
        case 'up':
          {
            position = --position;
            if (position > 0) {
              this.$(ulSelector + ' li:nth-child(' + position + ')').focus();
              this.set(positionProperty, position);
            }
            break;
          }
      }
    }
  });

});
define('frontend-cp/mixins/simple-state', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({

    /**
     * An object tree representing all possible
     * states and their parent/child relationships
     * @type {Object}
     */
    stateMap: null,

    /**
     * The current state as a dot separated list
     * representing the state hierarchy
     * @type {String}
     */
    _currentState: '',

    /**
     * Read-only current state property
     * For most use cases use isInState, used mostly as a property
     * in computed properties to observe when state changes
     * @return {String} current state as a dot separated list representing the state hierarchy
     */
    currentState: (function () {
      return this.get('_currentState');
    }).property('_currentState'),

    /**
     * Sets the current state as a dot separated
     * list representing the desired state hierarchy
     * eg. 'root.session.foo'
     * Throws an error if the state is not available
     * in the stateMap object tree
     * @param {String} state Dot separated string of state hierarchy
     */
    setState: function setState(state) {
      if (this.get('stateMap.' + state)) {
        this.set('_currentState', state);
      } else {
        throw new Error('Invalid state: ' + state);
      }
    },

    /**
     * Returns true if you are in the current state, you must specify the currentState
     * in order force a call to this.get('currentState') in computed properties,
     * otherwise the computed property will not be called.
     * or any of its parent states
     * @param  {String}  state Dot separated string of state hierarchy
     * @param  {String}  currentState Dot separated string of state hierarchy
     * @return {Boolean}
     */
    isInState: function isInState(state, currentState) {
      if (currentState === undefined) {
        throw new Error('currentState is not defined');
      }
      return currentState.indexOf(state) === 0;
    },

    /**
     * Returns true if the last substate in the state string
     * is the leafState/s
     * @param  {String}  subState     Dot separated string of sub-state
     * @param  {String}  currentState currentState Dot separated string of state hierarchy
     * @return {Boolean}
     */
    endsWithSubState: function endsWithSubState(subState, currentState) {
      if (currentState === undefined) {
        throw new Error('currentState is not defined');
      }
      return currentState.indexOf(subState) === currentState.length - subState.length;
    },

    getStateAtLevel: function getStateAtLevel(level, currentState) {
      currentState = currentState || this.get('_currentState');
      return currentState.split('.')[level];
    }
  });

});
define('frontend-cp/mixins/suggestions', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({

    matches: function matches(searchStr, source) {
      var result = [];

      if (source.length > 0) {
        result = source.filter(RegExp.prototype.test, new RegExp(searchStr, 'i'));
      }

      return new Ember['default'].A(result);
    }
  });

});
define('frontend-cp/models/access-log', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    person: DS['default'].belongsTo('person', { async: true, parent: true }),
    action: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/account', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({});

});
define('frontend-cp/models/app', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    version: DS['default'].attr('string'),
    author: DS['default'].attr('string'),
    authorEmail: DS['default'].attr('string'),
    shortDescription: DS['default'].attr('string'),
    longDescription: DS['default'].attr('string'),
    visibility: DS['default'].attr('string'),
    installable: DS['default'].attr('boolean'),
    installed: DS['default'].attr('boolean'),
    smallIcon: DS['default'].attr('string'),
    largeIcon: DS['default'].attr('string'),
    // categories: TODO what they are?
    defaultLocale: DS['default'].attr('string'),
    productVersion: DS['default'].attr('string')

    // TODO action: install
    // TODO action: upgrade
    // TODO action: uninstall
  });

});
define('frontend-cp/models/attachment', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    size: DS['default'].attr('number'),
    width: DS['default'].attr('number'), // TODO should exist on attachment within posts/:id
    height: DS['default'].attr('number'), // TODO should exist on attachment within posts/:id
    type: DS['default'].attr('string'), // TODO should exist on attachment within posts/:id
    url: DS['default'].attr('string'), // TODO should exist on attachment within posts/:id
    urlDownload: DS['default'].attr('string'), // TODO should exist on attachment within posts/:id
    thumbnails: DS['default'].hasMany('thumbnail', { async: true, child: true }),
    createdAt: DS['default'].attr('date'), // TODO should exist on attachment within posts/:id

    // Virtual parent field
    message: DS['default'].belongsTo('case-message', { async: true, parent: true })
  });

});
define('frontend-cp/models/avatar', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    base64Data: DS['default'].attr('string'),
    avatarType: DS['default'].attr('string'),
    url: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),

    person: DS['default'].belongsTo('person', { async: true, parent: true })
  });

});
define('frontend-cp/models/brand', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    companyName: DS['default'].attr('string'),
    url: DS['default'].attr('string'),
    language: DS['default'].belongsTo('language'),
    isEnabled: DS['default'].attr('boolean')
  });

});
define('frontend-cp/models/business-hour', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    zones: DS['default'].hasMany('zone'),
    holidays: DS['default'].hasMany('holiday'),
    teams: DS['default'].hasMany('team'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/case-message', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    uuid: DS['default'].attr('string'),
    subject: DS['default'].attr('string'),
    contents: DS['default'].attr('string'),
    fullname: DS['default'].attr('string'),
    email: DS['default'].attr('string'),
    creator: DS['default'].belongsTo('person'),
    identity: DS['default'].belongsTo('identity'),
    mailbox: DS['default'].belongsTo('mailbox'),
    attachments: DS['default'].hasMany('attachment'),
    location: DS['default'].belongsTo('location'),
    creationMode: DS['default'].attr('string'),
    locale: DS['default'].attr('string'),
    responseTime: DS['default'].attr('number'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),

    // Parent field
    'case': DS['default'].belongsTo('case', { async: true, parent: true })
  });

});
define('frontend-cp/models/case-reply', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    contents: DS['default'].attr('string'),
    channelType: DS['default'].attr('string'),
    channel: DS['default'].belongsTo('channel'),
    inReplyToUuid: DS['default'].attr('string'),
    cc: DS['default'].attr('string'),
    bcc: DS['default'].attr('string'),
    status: DS['default'].belongsTo('status'),
    priority: DS['default'].belongsTo('priority'),
    caseType: DS['default'].belongsTo('type'),
    ownerTeam: DS['default'].belongsTo('team'),
    // ownerAgent: DS.belongsTo('?'),
    // tags: DS.belongsTo('?'),
    // fieldValues: DS.belongsTo('?'),
    // _filename: DS.belongsTo('?'),

    'case': DS['default'].belongsTo('case', { async: true, parent: true })
  });

});
define('frontend-cp/models/case', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    maskId: DS['default'].attr('string'),
    subject: DS['default'].attr('string'),
    portal: DS['default'].attr('string'),
    // channel: DS.belongsTo('channel'),
    requester: DS['default'].belongsTo('person'),
    creator: DS['default'].belongsTo('person'),
    identity: DS['default'].belongsTo('identity', { polymorphic: true }),
    // owner: DS.belongsTo('team'),
    brand: DS['default'].belongsTo('brand'),
    status: DS['default'].belongsTo('status'),
    priority: DS['default'].belongsTo('priority'),
    caseType: DS['default'].belongsTo('type'),
    // sla
    // tags: DS.hasMany('tag'),
    customFields: DS['default'].hasMany('custom-field'),
    // metadata
    lastReplier: DS['default'].belongsTo('person'),
    lastReplierIdentity: DS['default'].belongsTo('identity'),
    creationMode: DS['default'].attr('string'),
    state: DS['default'].attr('string'),
    flag: DS['default'].attr('string'),
    totalPosts: DS['default'].attr('number'),
    hasNotes: DS['default'].attr('boolean'),
    hasAttachments: DS['default'].attr('boolean'),
    rating: DS['default'].attr('number'),
    ratingStatus: DS['default'].attr('string'),
    assignDueAt: DS['default'].attr('date'),
    replyDueAt: DS['default'].attr('date'),
    resolutionDueAt: DS['default'].attr('date'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),
    lastAgentActivityAt: DS['default'].attr('date'),
    lastCustomerActivityAt: DS['default'].attr('date'),

    // Children fields
    notes: DS['default'].hasMany('note', { async: true, child: true }),
    messages: DS['default'].hasMany('case-message', { async: true, child: true }),
    channels: DS['default'].hasMany('channel', { async: true, child: true, url: 'reply/channels' }),
    reply: DS['default'].hasMany('case-reply', { async: true, child: true }),

    saveWithPost: function saveWithPost(post) {
      var reply = this.get('store').createRecord('case-reply', {
        contents: post.get('contents')
      });
      return reply.save();
    }
  });

});
define('frontend-cp/models/channel', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    objects: DS['default'].hasMany('account', { polymorphic: true }),

    // Virtual fields
    'case': DS['default'].belongsTo('case', { async: true, parent: true })
  });

});
define('frontend-cp/models/contact-address', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    isPrimary: DS['default'].attr('boolean', { defaultValue: false }),
    address1: DS['default'].attr('string'),
    address2: DS['default'].attr('string'),
    city: DS['default'].attr('string'),
    state: DS['default'].attr('string'),
    postalCode: DS['default'].attr('string'), // TODO maybe integer?
    country: DS['default'].attr('string'), // TODO should be country code
    type: DS['default'].attr('string', { defaultValue: 'OTHER' }),

    parent: DS['default'].belongsTo('has-addresses', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/contact-website', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    isPrimary: DS['default'].attr('boolean', { defaultValue: false }),
    url: DS['default'].attr('string'),

    parent: DS['default'].belongsTo('has-websites', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/custom-field', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    fielduuid: DS['default'].attr('string'),
    fieldType: DS['default'].attr('string'),
    name: DS['default'].attr('string'),
    title: DS['default'].attr('string'),
    description: DS['default'].attr('string'),
    agentTitle: DS['default'].attr('string'),
    customerEditable: DS['default'].attr('boolean'),
    visibleToCustomers: DS['default'].attr('boolean'),
    regularExpression: DS['default'].attr('string'),
    sortOrder: DS['default'].attr('number'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),
    value: DS['default'].attr('string'),
    options: DS['default'].hasMany('field-option')
  });

});
define('frontend-cp/models/event', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({});

});
define('frontend-cp/models/facebook-account', ['exports', 'ember-data', 'frontend-cp/models/account'], function (exports, DS, Account) {

  'use strict';

  exports['default'] = Account['default'].extend({
    accountId: DS['default'].attr('string'),
    title: DS['default'].attr('string'),
    isEnabled: DS['default'].attr('boolean', { defaultValue: true }),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/field-option', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    fielduuid: DS['default'].attr('string'),
    value: DS['default'].attr('string'),
    // tag: ???,
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),
    selected: DS['default'].attr('boolean')
  });

});
define('frontend-cp/models/has-addresses', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    addresses: DS['default'].hasMany('contact-address', { async: true, url: 'contacts/addresses' })
  });

});
define('frontend-cp/models/has-email-identities', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    emails: DS['default'].hasMany('identity-email', { async: true })
  });

});
define('frontend-cp/models/has-facebook-identities', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    facebook: DS['default'].hasMany('identity-facebook', { async: true })
  });

});
define('frontend-cp/models/has-phone-identities', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    phones: DS['default'].hasMany('identity-phone', { async: true })
  });

});
define('frontend-cp/models/has-slack-identities', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    slack: DS['default'].hasMany('identity-slack', { async: true })
  });

});
define('frontend-cp/models/has-twitter-identities', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    twitter: DS['default'].hasMany('identity-twitter', { async: true })
  });

});
define('frontend-cp/models/has-websites', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    websites: DS['default'].hasMany('contact-website', { async: true })
  });

});
define('frontend-cp/models/holiday', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    date: DS['default'].attr('date'),
    openHours: DS['default'].attr() //array http://stackoverflow.com/a/26107853
  });

});
define('frontend-cp/models/identity-domain', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    domain: DS['default'].attr('string'),

    parent: DS['default'].belongsTo('organization', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity-email', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    email: DS['default'].attr('string'),
    isNotificationEnabled: DS['default'].attr('string'),

    parent: DS['default'].belongsTo('has-email-identities', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity-facebook', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    facebookId: DS['default'].attr('string'),
    userName: DS['default'].attr('string'),
    fullName: DS['default'].attr('string'),
    email: DS['default'].attr('string'),
    bio: DS['default'].attr('string'),
    birthDate: DS['default'].attr('date'),
    website: DS['default'].attr('string'),
    profileUrl: DS['default'].attr('string'),
    locale: DS['default'].attr('string'),
    verified: DS['default'].attr('boolean'),

    parent: DS['default'].belongsTo('has-facebook-identities', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity-phone', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    number: DS['default'].attr('string'),
    type: DS['default'].attr('string'),

    parent: DS['default'].belongsTo('has-phone-identities', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity-slack', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    userName: DS['default'].attr('string'),

    parent: DS['default'].belongsTo('has-slack-identities', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity-twitter', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

  'use strict';

  exports['default'] = Identity['default'].extend({
    twitterId: DS['default'].attr('string'),
    fullName: DS['default'].attr('string'),
    screenName: DS['default'].attr('string'),
    followerCount: DS['default'].attr('number'),
    description: DS['default'].attr('string'),
    url: DS['default'].attr('string'),
    location: DS['default'].attr('string'),
    profileImageUrl: DS['default'].attr('string'),
    locale: DS['default'].attr('string'),
    verified: DS['default'].attr('boolean'),

    parent: DS['default'].belongsTo('has-twitter-identities', { async: true, polymorphic: true, parent: true })
  });

});
define('frontend-cp/models/identity', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    isPrimary: DS['default'].attr('boolean'),
    isValidated: DS['default'].attr('boolean')
  });

});
define('frontend-cp/models/language-statistics', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].ModelFragment.extend({
    uptodate: DS['default'].attr('number'),
    outdated: DS['default'].attr('number'),
    missing: DS['default'].attr('number')
  });

});
define('frontend-cp/models/language', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    locale: DS['default'].attr('string'),
    flagIcon: DS['default'].attr('string'),
    direction: DS['default'].attr('string'),
    isEnabled: DS['default'].attr('boolean'),
    statistics: DS['default'].hasOneFragment('language-statistics'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/locale', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    nativeName: DS['default'].attr('string'),
    region: DS['default'].attr('string'),
    nativeRegion: DS['default'].attr('string'),
    script: DS['default'].attr('string'),
    variant: DS['default'].attr('string'),
    direction: DS['default'].attr('string'),
    isEnabled: DS['default'].attr('boolean'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),
    strings: DS['default'].hasMany('string', { async: true, child: true })
  });

});
define('frontend-cp/models/location', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    city: DS['default'].attr('string'),
    region: DS['default'].attr('string'),
    regionCode: DS['default'].attr('string'),
    areaCode: DS['default'].attr('string'),
    timeZone: DS['default'].attr('string'),
    organization: DS['default'].attr('string'),
    netSpeed: DS['default'].attr('string'),
    country: DS['default'].attr('string'),
    countryCode: DS['default'].attr('string'),
    postalCode: DS['default'].attr('string'),
    latitude: DS['default'].attr('string'),
    longitude: DS['default'].attr('string'),
    metroCode: DS['default'].attr('string'),
    isp: DS['default'].attr('string')
  });

});
define('frontend-cp/models/mailbox', ['exports', 'ember-data', 'frontend-cp/models/account'], function (exports, DS, Account) {

  'use strict';

  exports['default'] = Account['default'].extend({
    service: DS['default'].attr('string'),
    encryption: DS['default'].attr('string'),
    address: DS['default'].attr('string'),
    prefix: DS['default'].attr('string'),
    smtpType: DS['default'].attr('string'),
    host: DS['default'].attr('string'),
    port: DS['default'].attr('number'),
    username: DS['default'].attr('string'),
    preserveMails: DS['default'].attr('boolean'),
    brand: DS['default'].belongsTo('brand'),
    isDefault: DS['default'].attr('boolean'),
    isEnabled: DS['default'].attr('boolean')
  });

});
define('frontend-cp/models/note', ['exports', 'ember-data', 'frontend-cp/models/event'], function (exports, DS, Event) {

  'use strict';

  exports['default'] = Event['default'].extend({
    uuid: DS['default'].attr('string'),
    subject: DS['default'].attr('string'),
    contents: DS['default'].attr('string'),
    isPinned: DS['default'].attr('boolean'),
    color: DS['default'].attr('string', { defaultValue: 'YELLOW' }), // TODO enum YELLOW, RED, GREEN, BLUE, ORANGE, PURPLE
    creator: DS['default'].belongsTo('person'),
    identity: DS['default'].belongsTo('identity'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),

    'case': DS['default'].belongsTo('case', { async: true, parent: true })
  });

});
define('frontend-cp/models/organization', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    isShared: DS['default'].attr('boolean'),
    locale: DS['default'].attr('string'),
    brand: DS['default'].belongsTo('brand', { async: true }),
    emails: DS['default'].hasMany('identity-email', { async: true, url: 'identities/emails' }),
    phones: DS['default'].hasMany('identity-phone', { async: true, url: 'identities/phones' }),
    twitter: DS['default'].hasMany('identity-twitter', { async: true, url: 'identities/twitter' }),
    facebook: DS['default'].hasMany('identity-facebook', { async: true, url: 'identities/facebook' }),
    addresses: DS['default'].hasMany('contact-address', { async: true, url: 'contacts/addresses' }),
    websites: DS['default'].hasMany('contact-website', { async: true, url: 'contacts/websites' }),
    // notes: DS.hasMany('note', { async: true }), TODO
    tags: DS['default'].hasMany('tag', { async: true }),
    customFields: DS['default'].hasMany('custom-field', { async: true }),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),

    // Shadow children fields
    domains: DS['default'].hasMany('identity-domain', { async: true, child: true, url: 'identities/domains' })
  });

});
define('frontend-cp/models/person-note', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    contents: DS['default'].attr('string'),
    color: DS['default'].attr('string'), // TODO option
    person: DS['default'].belongsTo('person', { async: true, parent: true }),
    attachments: DS['default'].hasMany('attachment'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/person-timeline', function () {

	'use strict';

});
define('frontend-cp/models/person', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    fullName: DS['default'].attr('string'),
    designation: DS['default'].attr('string'),
    alias: DS['default'].attr('string'),
    isEnabled: DS['default'].attr('boolean'),
    role: DS['default'].belongsTo('role', { async: true }),
    avatar: DS['default'].belongsTo('avatar', { async: true, child: true }),
    organization: DS['default'].belongsTo('organization', { async: true }),
    teams: DS['default'].hasMany('team'),
    emails: DS['default'].hasMany('identity-email', { async: true, url: 'identities/emails' }),
    phones: DS['default'].hasMany('identity-phone', { async: true, url: 'identities/phones' }),
    twitter: DS['default'].hasMany('identity-twitter', { async: true, url: 'identities/twitter' }),
    facebook: DS['default'].hasMany('identity-facebook', { async: true, url: 'identities/facebook' }),
    addresses: DS['default'].hasMany('contact-address', { async: true, url: 'contacts/addresses' }),
    websites: DS['default'].hasMany('contact-website', { async: true, url: 'contacts/websites' }),
    customFields: DS['default'].hasMany('custom-field'),
    tags: DS['default'].hasMany('tag'),
    notes: DS['default'].hasMany('person-note', { child: true, url: 'notes' }),
    accessLevel: DS['default'].attr('string'),
    locale: DS['default'].attr('string'),
    timeZone: DS['default'].attr('string'),
    timeZoneOffset: DS['default'].attr('number'),
    greeting: DS['default'].attr('string'),
    signature: DS['default'].attr('string'),
    statusMessage: DS['default'].attr('string'),
    passwordUpdateAt: DS['default'].attr('date'),
    avatarUpdateAt: DS['default'].attr('date'),
    activityAt: DS['default'].attr('date'),
    visitedAt: DS['default'].attr('date'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),

    // Shadow children fields
    accesslogs: DS['default'].hasMany('access-log', { async: true, child: true }),
    slack: DS['default'].hasMany('identity-slack', { async: true, child: true }),

    primaryEmail: (function () {
      var emails = this.get('emails');
      var primaryEmails = emails.filter(function (email) {
        return email.isPrimary;
      });

      return Ember['default'].isEmpty(primaryEmails) ? primaryEmails.get('firstObject') : emails.get('firstObject');
    }).property('emails'),

    primaryEmailAddress: (function () {
      return this.get('primaryEmail.email');
    }).property('primaryEmail')
  });

});
define('frontend-cp/models/priority', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    label: DS['default'].attr('string'),
    level: DS['default'].attr('number'),
    color: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/role', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    type: DS['default'].attr('string')
  });

});
define('frontend-cp/models/slack-identity', ['exports', 'ember-data', 'frontend-cp/models/identity'], function (exports, DS, Identity) {

	'use strict';

	exports['default'] = Identity['default'].extend({
		userName: DS['default'].attr('string')
	});

});
define('frontend-cp/models/status', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    label: DS['default'].attr('string'),
    color: DS['default'].attr('string'),
    statusType: DS['default'].attr('string'),
    visibility: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/string', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    value: DS['default'].attr('string'),

    locale: DS['default'].belongsTo('locale', { async: true, parent: true })
  });

});
define('frontend-cp/models/tab', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({

    tabsService: Ember['default'].inject.service('tabs'),

    label: null,

    type: null,

    url: null,

    ids: null,

    index: null,

    scrollPosition: 0,

    browserTabId: null,

    selected: (function () {
      return this.get('tabsService.selectedTab') === this;
    }).property('tabsService.selectedTab')
  });

});
define('frontend-cp/models/tag', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string')
  });

});
define('frontend-cp/models/team', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),

    emails: DS['default'].hasMany('identity-email', { async: true, child: true, url: 'identities/emails' }),
    facebook: DS['default'].hasMany('identity-facebook', { async: true, child: true, url: 'identities/facebook' }),
    phones: DS['default'].hasMany('identity-phone', { async: true, child: true, url: 'identities/phones' }),
    slack: DS['default'].hasMany('identity-slack', { async: true, child: true, url: 'identities/slack' }),
    twitter: DS['default'].hasMany('identity-twitter', { async: true, child: true, url: 'identities/twitter' }),
    websites: DS['default'].hasMany('contact-website', { async: true, child: true, url: 'contacts/websites' })
  });

});
define('frontend-cp/models/thumbnail', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    size: DS['default'].attr('number'),
    width: DS['default'].attr('number'),
    height: DS['default'].attr('number'),
    thumbnailType: DS['default'].attr('string'),
    url: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date'),

    attachment: DS['default'].belongsTo('attachment', { async: true, parent: true })
  });

});
define('frontend-cp/models/twitter-account', ['exports', 'ember-data', 'frontend-cp/models/account'], function (exports, DS, Account) {

  'use strict';

  exports['default'] = Account['default'].extend({
    twitterId: DS['default'].attr('string'),
    screenName: DS['default'].attr('string'),
    brand: DS['default'].belongsTo('brand'),
    routeMentions: DS['default'].attr('boolean'),
    routeMessages: DS['default'].attr('boolean'),
    routeFavorites: DS['default'].attr('boolean'),
    isPublic: DS['default'].attr('boolean'),
    isEnabled: DS['default'].attr('boolean'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/type', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    label: DS['default'].attr('string'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/vote', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    type: DS['default'].attr('string'),
    person: DS['default'].belongsTo('person'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date')
  });

});
define('frontend-cp/models/zone', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({});

});
define('frontend-cp/resolver', ['exports', 'ember', 'ember/resolver'], function (exports, Ember, Resolver) {

  'use strict';

  exports['default'] = Resolver['default'].extend({
    parseName: function parseName(fullName) {
      /*jshint validthis:true */

      if (fullName.parsedName === true) {
        return fullName;
      }

      var prefixParts = fullName.split('@');
      var prefix = undefined;

      if (prefixParts.length === 2) {
        var parts = prefixParts[0].split(':');
        if (parts.length === 2) {
          prefixParts[0] = parts[1];
          prefixParts[1] = parts[0] + ':' + prefixParts[1];
          fullName = prefixParts.join('@');
        }

        prefix = this.prefix() + '/features/' + prefixParts[0];
      }

      var nameParts = prefixParts[prefixParts.length - 1].split(':');
      var type = nameParts[0],
          fullNameWithoutType = nameParts[1];
      var name = fullNameWithoutType;
      var namespace = Ember['default'].get(this, 'namespace');
      var root = namespace;

      return {
        parsedName: true,
        fullName: fullName,
        prefix: prefix || this.prefix({ type: type }),
        type: type,
        fullNameWithoutType: fullNameWithoutType,
        name: name,
        root: root,
        resolveMethodName: 'resolve' + Ember['default'].String.classify(type)
      };
    }
  });
  /*{type: type}*/

});
define('frontend-cp/router', ['exports', 'ember', 'frontend-cp/config/environment'], function (exports, Ember, config) {

  'use strict';

  Ember['default'].Router.reopen({
    urlDidChange: (function () {
      var urlService = this.get('container').lookup('service:url');
      urlService.set('currentUrl', this.get('url'));
    }).on('didTransition')
  });

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  exports['default'] = Router.map(function () {
    this.route('login');
    this.route('session', { path: '' }, function () {
      this.route('showcase', { path: '/showcase' });
      this.route('styleguide', { path: '/styleguide' });
      this.route('cases', function () {
        this.route('new', { path: '/new' });
        this.route('case', { path: '/:case_id' }, function () {
          this.route('notes');
          this.route('organisation');
          this.route('user');
        });
      });
      this.route('users', function () {
        this.route('user', { path: '/:person_id' }, function () {
          this.route('organisation');
        });
      });

      this.route('admin', function () {
        this.route('showcase');
      });
    });
  });

});
define('frontend-cp/routes/abstract/organisation-route', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('frontend-cp/routes/abstract/tabbed-route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    /**
     * Store tab so we can set the label once the model has loaded.
     * @type {Tab}
     */
    tab: null,
    tabsService: Ember['default'].inject.service('tabs'),

    beforeModel: function beforeModel(transition) {
      var _transition$router;

      var routeName = this.routeName;

      // We only want to include ids required to get to this point down the route hierarchy
      var ids = [];

      /**
       * Reliably returns the number of dynamic segments up to the current route
       * @param {Transition} transition An ember transition object
       * @return {number}
       */
      function getNumParams(transition) {
        return transition.handlerInfos.filter(function (info) {
          // Ignore if name contains routeName and is not routeName
          // since we only want ids up to the current route
          if (info.name.indexOf(routeName) === 0 && info.name !== routeName) {
            return false;
          }
          return info.params || info.names;
        }).map(function (section) {
          return section.params || section.names;
        }).map(function (info) {
          return info.length ? info.length : Object.keys(info).length;
        }).reduce(function (lengthA, lengthB) {
          return lengthA + lengthB;
        }, 0);
      }

      /**
       * Try and find all dynamic segments as a list of ids
       */
      if (transition.intent.contexts) {
        // If clicking within the app use transition.intent.contexts
        ids = transition.intent.contexts.map(function (context) {
          return context.id ? context.id : context;
        });
      } else if (transition.params) {
        // If opening a new instance use transition.params
        ids = extractNumsAsArray(transition.params);
      }

      // Cut ids to the number to get to this level
      ids = ids.splice(0, getNumParams(transition));

      var url = transition.intent.url || (_transition$router = transition.router).generate.apply(_transition$router, [routeName].concat(ids));

      this.tab = this.get('tabsService').getTab(routeName, ids);

      if (this.tab) {
        this.get('tabsService').selectTab(this.tab);
      } else {
        this.tab = this.get('tabsService').createTab(routeName, ids, url, true);
      }
    }

  });

  var squashToArray = function squashToArray(vals) {
    return vals.reduce(function (valA, valB) {
      return valA.concat(valB);
    });
  };

  function mergeHashNums(hash) {
    var keys = Object.keys(hash);
    var vals = keys.map(function (key) {
      return [hash[key]];
    });

    return squashToArray(vals);
  }

  function extractNumsAsArray(hash) {
    var keys = Object.keys(hash).filter(function (key) {
      return Object.keys(hash[key]).length > 0;
    });

    var vals = keys.map(function (key) {
      return mergeHashNums(hash[key]);
    });

    return squashToArray(vals);
  }

});
define('frontend-cp/routes/abstract/user-route', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('frontend-cp/serializers/application', ['exports', 'ember', 'ember-data', 'npm:lodash'], function (exports, Ember, DS, _) {

  'use strict';

  var get = Ember['default'].get;
  var merge = Ember['default'].merge;

  exports['default'] = DS['default'].RESTSerializer.extend({
    primaryRecordKey: 'data',
    sideloadedRecordsKey: 'resources',

    normalizePayload: function normalizePayload(payload) {
      if (!payload) {
        return {};
      }

      if (_['default'].isNumber(payload.status)) {
        delete payload.status;
      }

      var data = payload[this.primaryRecordKey];
      if (data) {
        this.extractData(data, payload);
        delete payload[this.primaryRecordKey];
      }

      var sideloaded = payload[this.sideloadedRecordsKey];
      if (sideloaded) {
        this.extractSideloaded(sideloaded);
        delete payload[this.sideloadedRecordsKey];
      }

      delete payload.resource;
      return payload;
    },

    extractData: function extractData(data, payload) {
      if (Ember['default'].isArray(data)) {
        this.extractArrayData(data, payload);
      } else {
        this.extractSingleData(data, payload);
      }
    },

    /**
     * Extract top-level "data" containing a single primary data
     *
     * @param {Object[]} data - data
     * @param {Object[]} payload - payload
     */
    extractSingleData: function extractSingleData(data, payload) {
      payload[data.resource_type] = data;
      this.extractItem(data, data.resource_type);
    },

    /**
     * @param {Object[]} data - data
     * @param {String} typeKey - type of the item being extracted
     * @return {Object} data — data extracted
     */
    extractItem: function extractItem(data, typeKey) {
      this.extractRelationships(data);
      var store = get(this, 'store');
      var type = store.modelFor(typeKey);
      if (!data.links) {
        data.links = {};
      }

      type.eachRelationship(function (name, relationship) {
        if (relationship.options.child) {
          if (relationship.options.url) {
            data.links[name] = relationship.options.url;
          } else {
            var inverseRelationship = type.inverseFor(name);
            var childType = inverseRelationship.type;
            var childAdapter = store.adapterFor(childType.modelName);
            data.links[name] = childAdapter.pathForType(childType.modelName);
          }
        }
      });

      delete data.resource_type;
      return data;
    },

    /**
     * Extract top-level "data" containing a single primary data
     *
     * @param {Object[]} data - data
     * @param {Object[]} payload - payload
     */
    extractArrayData: function extractArrayData(data, payload) {
      var _this = this;

      data.forEach(function (item) {
        return _this.extractItem(item, payload.resource);
      });
      payload[payload.resource] = data;
    },

    /**
     * Extract top-level "included" containing associated objects
     *
     * @param {Object} sideloaded - sideloaded
     */
    extractSideloaded: function extractSideloaded(sideloaded) {
      var _this2 = this;

      var store = get(this, 'store');
      var models = {};

      _['default'].each(sideloaded, function (resources, type) {
        models[type] = [];
        _['default'].each(resources, function (resource) {
          // TODO remove || type — this is a temporary fix
          type = resource.resource_type || type;
          _this2.extractRelationships(resource);
          models[type].push(resource);
        });
      });

      this.pushPayload(store, models);
    },

    extractMeta: function extractMeta(store, typeClass, payload) {
      if (!payload.meta) {
        payload.meta = {};
      }
      if (payload.total_count !== undefined) {
        payload.meta.total = payload.total_count;
        delete payload.total_count;
      }
      if (payload.offset !== undefined) {
        payload.meta.offset = payload.offset;
        delete payload.offset;
      }
      if (payload.limit !== undefined) {
        payload.meta.limit = payload.limit;
        delete payload.limit;
      }
      this._super.apply(this, arguments);
    },

    extractFindHasMany: function extractFindHasMany() {
      return this._super.apply(this, arguments);
    },

    extractRelationships: function extractRelationships(resource) {
      _['default'].each(resource, function (value, key) {
        if (value && value.id && value.resource_type) {
          resource[key] = {
            id: value.id,
            type: value.resource_type
          };
        } else if (_['default'].isArray(value)) {
          resource[key] = value.map(function (v) {
            if (v.id && v.resource_type) {
              return {
                id: v.id,
                type: v.resource_type
              };
            } else {
              return v;
            }
          });
        }
      });
    },

    keyForAttribute: function keyForAttribute(key /*, method*/) {
      return Ember['default'].String.underscore(key);
    },

    keyForRelationship: function keyForRelationship(key, relationship, method) {
      if (!method || method === 'serialize') {
        return Ember['default'].String.underscore(key) + (relationship === 'belongsTo' ? '_id' : '');
      } else {
        return Ember['default'].String.underscore(key);
      }
    },

    serializeIntoHash: function serializeIntoHash(hash, type, snapshot, options) {
      merge(hash, this.serialize(snapshot, options));
    }
  });

});
define('frontend-cp/serializers/avatar', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      base64Data: { key: 'data' },
      avatarType: { key: 'type' },
      url: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
    }
  });

});
define('frontend-cp/serializers/case-reply', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      channelType: { key: 'channel' },
      caseType: { key: 'type' },
      'case': { serialize: false }
    }
  });

});
define('frontend-cp/serializers/case', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      caseType: { key: 'type' }
    }
  });

});
define('frontend-cp/serializers/channel', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    // Channel doesn't have an id, but the type is unique, so
    // it can be used as a primary key
    primaryKey: 'type'
  });

});
define('frontend-cp/serializers/custom-field', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      fieldType: { key: 'type' }
    }
  });

});
define('frontend-cp/serializers/facebook-account', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      accountId: { serialize: false },
      title: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
    }
  });

});
define('frontend-cp/serializers/locale', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    primaryKey: 'locale'
  });

});
define('frontend-cp/serializers/note', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      uuid: { serialize: false },
      subject: { serialize: false },
      creator: { serialize: false },
      identity: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false },
      'case': { serialize: false }
    }
  });

});
define('frontend-cp/serializers/organization', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      emails: { serialize: false },
      phones: { serialize: false },
      twitter: { serialize: false },
      facebook: { serialize: false },
      addresses: { serialize: false },
      websites: { serialize: false },
      notes: { serialize: false },
      tags: { serialize: false },
      customFields: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
      // TODO fieldValues
    }
  });

});
define('frontend-cp/serializers/person-note', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
    }
  });

});
define('frontend-cp/serializers/person', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      avatar: { serialize: false },
      emails: { serialize: false },
      phones: { serialize: false },
      twitter: { serialize: false },
      facebook: { serialize: false },
      addresses: { serialize: false },
      website: { serialize: false },
      customFields: { serialize: false },
      tags: { serialize: false },
      notes: { serialize: false },
      passwordUpdateAt: { serialize: false },
      avatarUpdateAt: { serialize: false },
      activityAt: { serialize: false },
      visitedAt: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
    }
  });

});
define('frontend-cp/serializers/status', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      statusType: { key: 'type' }
    }
  });

});
define('frontend-cp/serializers/string', ['exports', 'frontend-cp/serializers/application', 'npm:lodash'], function (exports, ApplicationSerializer, _) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    // Response is an object, but a collection of resources nevertheless
    extractData: function extractData(data, payload) {
      this.extractArrayData(data, payload);
    },

    // Turning an object of type {key => value} into array [{id: key, value: value}]
    extractArrayData: function extractArrayData(data, payload) {
      var _this = this;

      payload[payload.resource] = _['default'].map(data, function (val, id) {
        return _this.extractItem({
          id: id,
          value: val
        }, payload.resource);
      });
    }
  });

});
define('frontend-cp/serializers/tag', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      name: { serialize: false }
    }
  });

});
define('frontend-cp/serializers/thumbnail', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      thumbnailType: { key: 'type' }
    }
  });

});
define('frontend-cp/serializers/twitter-account', ['exports', 'frontend-cp/serializers/application'], function (exports, ApplicationSerializer) {

  'use strict';

  exports['default'] = ApplicationSerializer['default'].extend({
    attrs: {
      twitterId: { serialize: false },
      screenName: { serialize: false },
      createdAt: { serialize: false },
      updatedAt: { serialize: false }
    }
  });

});
define('frontend-cp/services/context-modal', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({
    visible: false,
    event: null,
    title: '',
    activeContextModalId: null,
    index: null,

    open: function open(contextModalId, event) {
      this.setProperties({
        'visible': true,
        'event': event,
        'index': 0,
        'activeContextModalId': contextModalId
      });
    },

    close: function close() {
      this.set('visible', false);
    },

    next: function next() {
      this.incrementProperty('index');
    },

    prev: function prev() {
      this.decrementProperty('index');
    }

  });

});
define('frontend-cp/services/intl', ['exports', 'ember', 'ember-intl/utils/data', 'ember-intl/format-cache/memoizer', 'ember-intl/models/intl-get-result'], function (exports, Ember, data, createFormatCache, IntlGetResult) {

    'use strict';

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */

    var ServiceKlass = Ember['default'].Service || Ember['default'].Controller;
    var makeArray = Ember['default'].makeArray;
    var get = Ember['default'].get;
    var on = Ember['default'].on;
    var computed = Ember['default'].computed;
    var observer = Ember['default'].observer;
    var isEmpty = Ember['default'].isEmpty;
    var isPresent = Ember['default'].isPresent;
    var runOnce = Ember['default'].run.once;

    function assertIsDate(date, errMsg) {
        Ember['default'].assert(errMsg, isFinite(date));
    }

    exports['default'] = ServiceKlass.extend(Ember['default'].Evented, {
        locales: null,
        defaultLocale: null,

        getDateTimeFormat: null,
        getRelativeFormat: null,
        getMessageFormat: null,
        getNumberFormat: null,

        adapterType: '-intl-adapter',

        setupMemoizers: on('init', function () {
            this.setProperties({
                getDateTimeFormat: createFormatCache['default'](Intl.DateTimeFormat),
                getRelativeFormat: createFormatCache['default'](data.IntlRelativeFormat),
                getNumberFormat: createFormatCache['default'](Intl.NumberFormat),
                getMessageFormat: createFormatCache['default'](data.IntlMessageFormat)
            });
        }),

        adapter: computed('adapterType', function () {
            var adapterType = get(this, 'adapterType');
            var app = this.container.lookup('application:main');

            if (app && app.IntlAdapter) {
                return app.IntlAdapter.create({
                    container: this.container
                });
            } else if (typeof adapterType === 'string') {
                return this.container.lookup('adapter:' + adapterType);
            }
        }).readOnly(),

        current: computed('locales', 'defaultLocale', function () {
            var locales = makeArray(get(this, 'locales'));
            var defaultLocale = get(this, 'defaultLocale');

            if (isPresent(defaultLocale) && locales.indexOf(defaultLocale) === -1) {
                locales.push(defaultLocale);
            }

            return locales;
        }).readOnly(),

        formats: computed(function () {
            return this.container.lookup('formats:main', {
                instantiate: false
            }) || {};
        }).readOnly(),

        localeChanged: observer('current', function () {
            runOnce(this, this.notifyLocaleChanged);
        }),

        addMessage: function addMessage(locale, key, value) {
            return this.getLanguage(locale).then(function (localeInstance) {
                return localeInstance.addMessage(key, value);
            });
        },

        addMessages: function addMessages(locale, messageObject) {
            return this.getLanguage(locale).then(function (localeInstance) {
                return localeInstance.addMessages(messageObject);
            });
        },

        notifyLocaleChanged: function notifyLocaleChanged() {
            this.trigger('localesChanged');
        },

        formatMessage: function formatMessage(message, values, options) {
            // When `message` is a function, assume it's an IntlMessageFormat
            // instance's `format()` method passed by reference, and call it. This
            // is possible because its `this` will be pre-bound to the instance.
            if (typeof message === 'function') {
                return message(values);
            }

            options = options || {};

            var locales = makeArray(options.locales);
            var formats = options.formats || get(this, 'formats');

            if (isEmpty(locales)) {
                locales = get(this, 'current');
            }

            if (typeof message === 'string') {
                message = this.getMessageFormat(message, locales, formats);
            }

            return message.format(values);
        },

        formatTime: function formatTime(date, formatOptions, options) {
            date = new Date(date);
            assertIsDate(date, 'A date or timestamp must be provided to formatTime()');

            return this._format('time', date, formatOptions, options);
        },

        formatRelative: function formatRelative(date, formatOptions, options) {
            date = new Date(date);
            assertIsDate(date, 'A date or timestamp must be provided to formatRelative()');

            return this._format('relative', date, formatOptions, options);
        },

        formatDate: function formatDate(date, formatOptions, options) {
            date = new Date(date);
            assertIsDate(date, 'A date or timestamp must be provided to formatDate()');

            return this._format('date', date, formatOptions, options);
        },

        formatNumber: function formatNumber(num, formatOptions, options) {
            return this._format('number', num, formatOptions, options);
        },

        _format: function _format(type, value, formatOptions, helperOptions) {
            if (!helperOptions) {
                helperOptions = formatOptions || {};
                formatOptions = null;
            }

            var locales = makeArray(helperOptions.locales);
            var formats = get(this, 'formats');

            if (isEmpty(locales)) {
                locales = get(this, 'current');
            }

            if (formatOptions) {
                if (typeof formatOptions === 'string' && formats) {
                    formatOptions = get(formats, type + '.' + formatOptions);
                }

                formatOptions = Ember['default'].$.extend({}, formatOptions, helperOptions);
            } else {
                formatOptions = helperOptions;
            }

            switch (type) {
                case 'date':
                case 'time':
                    return this.getDateTimeFormat(locales, formatOptions).format(value);
                case 'number':
                    return this.getNumberFormat(locales, formatOptions).format(value);
                case 'relative':
                    return this.getRelativeFormat(locales, formatOptions).format(value);
                default:
                    throw new Error('Unrecognized simple format type: ' + type);
            }
        },

        getLanguage: function getLanguage(locale) {
            var result = this.get('adapter').findLanguage(locale);

            return Ember['default'].RSVP.cast(result).then(function (localeInstance) {
                if (typeof localeInstance === 'undefined') {
                    throw new Error('`locale` must be a string or a locale instance');
                }

                return localeInstance;
            });
        },

        getTranslation: function getTranslation(key, locales) {
            locales = locales ? Ember['default'].makeArray(locales) : this.get('current');

            var result = this.get('adapter').findTranslation(locales, key);

            return Ember['default'].RSVP.cast(result).then(function (result) {
                Ember['default'].assert('findTranslation should return an object of instance `IntlGetResult`', result instanceof IntlGetResult['default']);

                if (typeof result === 'undefined') {
                    throw new Error('translation: `' + key + '` on locale(s): ' + locales.join(',') + ' was not found.');
                }

                return result;
            });
        }
    });

});
define('frontend-cp/services/local-store', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({
    /**
     * Retrieve an item from the store by key
     *
     * Items are stored as JSON strings
     *
     * @param  {string} key - @todo add this doc
     * @return {*} Stored object
     */
    getItem: function getItem(key) {
      var item = sessionStorage.getItem(key) || localStorage.getItem(key);

      // Note: stringified undefined will return 'undefined'
      if (item !== null && item !== 'undefined') {
        return JSON.parse(item);
      } else {
        return null;
      }
    },

    /**
     * Place item in the store as a JSON string.
     *
     * Note: only plain objects can be stored.
     *
     * @param {[type]}  key       [description]
     * @param {[type]}  item      [description]
     * @param {Boolean} isSession [description]
     */
    setItem: function setItem(key, item, isSession) {
      // using typeof for strict undefined check
      if (typeof item !== 'undefined') {
        (isSession ? sessionStorage : localStorage).setItem(key, JSON.stringify(item));
      }
    },

    /**
     * Clear everything in the store
     */
    clearAll: function clearAll() {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

});
define('frontend-cp/services/scroll', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({
    scroll: 0,
    targetScroll: 0
  });

});
define('frontend-cp/services/session', ['exports', 'ember', 'jquery'], function (exports, Ember, $) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({

    /**
     * Property for use in computed properties and observers
     * Ember automatically converts this to an ember array.
     * @type {Array}
     */
    sessionId: null,
    localStoreService: Ember['default'].inject.service('localStore'),

    /**
     * Retrieves a sessionId from the store and copies it to this.sessionId
     * so it can be observed.
     * @return {string} sessionId
     */
    getSessionId: function getSessionId() {
      this.set('sessionId', this.get('localStoreService').getItem('sessionId'));

      return this.get('sessionId');
    },

    /**
     * Validates a sesionId and places in the store.
     * @param {string} sessionId - sessionId
     */
    setSessionId: function setSessionId(sessionId) {
      if (typeof sessionId !== 'string' && sessionId !== null) {
        throw new Error('sessionId should be of type \'string\' got type ' + typeof sessionId);
      }
      this.get('localStoreService').setItem('sessionId', sessionId, true);
      this.set('sessionId', sessionId);
    },

    /**
     * Removes sessionId from store and from local variable.
     */
    logout: function logout() {
      this.set('sessionId', null);
      this.get('localStoreService').setItem('sessionId', null, true);
      this.get('localStoreService').setItem('sessionId', null);
    },

    /**
     * Sends email and password to backend for authentication.
     * @param  {string} email - email
     * @param  {string} password - password
     * @return {Promise} Ember.RSVP.Promise containing sessionId
     */
    requestSession: function requestSession(email, password) {
      return this._requestSession(email, password);
    },

    _requestSession: function _requestSession(email, password) {
      // TODO remove http
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        $['default'].ajax({
          type: 'POST',
          // TODO de-hardcode admin
          url: '/admin/index.php?/Base/Auth/Email',
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          dataType: 'json',
          data: $['default'].param({
            email: email,
            password: password
          }),
          success: function success(data) {
            resolve(data);
          },
          error: function error(xhr) {
            reject(xhr.responseText);
          }
        });
      });
    }
  });

});
define('frontend-cp/services/tabs', ['exports', 'ember', 'frontend-cp/models/tab'], function (exports, Ember, Tab) {

  'use strict';

  function arrayToObject(fields, func, thisObj) {
    return fields.reduce(function (obj, k) {
      obj[k] = func.call(thisObj, k);
      return obj;
    }, {});
  }

  exports['default'] = Ember['default'].Service.extend({

    /**
     * Property for use in computed properties and observers
     * Ember automatically converts this to an ember array
     * @type {array}
     */
    tabs: [],

    urlService: Ember['default'].inject.service('url'),
    localStoreService: Ember['default'].inject.service('localStore'),
    scrollService: Ember['default'].inject.service('scroll'),

    /**
     * Used to keep track of when tabs were opened and provide a
     * unique index
     * @type {number}
     */
    counter: 0,

    /**
     * The currently selected tab, always a Tab or null
     * Used for observers so should always be set with .set()
     * @type {Tab}
     */
    selectedTab: null,

    isTabAtRoot: null,

    scrollUpdated: (function () {
      var tab = this.get('selectedTab');
      if (tab) {
        tab.set('scrollPosition', this.get('scrollService.scroll'));
      }
    }).observes('scrollService.scroll'),

    currentUrlDidChange: (function () {
      var _this = this;

      var currentUrl = this.get('urlService.currentUrl');
      if (currentUrl === null) {
        return;
      }

      var selected = false;

      this.tabs.forEach(function (tab) {
        // Selects if you are in a tabs route hierarchy
        if (currentUrl.indexOf(tab.get('url')) === 0) {
          _this.set('isTabAtRoot', currentUrl === tab.get('url'));
          _this.selectTab(tab);
          selected = true;
          return;
        }
      });

      if (!selected) {
        this.set('isTabAtRoot', null);
        this.deselectAll();
      }

      // TODO this should not on('init') but without it it never fires
    }).observes('urlService.currentUrl').on('init'),

    /**
     * Returns a tab if it exists in the cached store, otherwise returns null.
     * @param  {string} routeName - routeName
     * @param {Object[]} ids - a list of dynamic segment ids
     * @return {Tab}
     */
    getTab: function getTab(routeName, ids) {
      var tab = this.tabs.find(function (tab) {
        return tab.routeName === routeName && tab.ids.join() === ids.join();
      });

      if (typeof tab === 'undefined') {
        return null;
      } else {
        return tab;
      }
    },

    /**
     * Retrieve tabs from store and convert to Ember object
     * Used to populate the tabs in a recovered session
     * @return {Object} A Tab object
     */
    getTabs: function getTabs() {
      // If the tabs array is empty and the store is not
      // then copy over the tabs from the store
      var tabsInStore = this.get('localStoreService').getItem('tabs');

      if (tabsInStore !== null) {
        this.copyTabsFromStorage();
      }

      return this.get('tabs');
    },

    /**
     * Remove all stored tabs from memory and local storage.
     */
    clearTabs: function clearTabs() {
      this.tabs.clear();
      this.get('localStoreService').setItem('tabs', [], true);
    },

    /**
     * Adding a new tab to the store
     * @param {string} routeName - dot separated route
     * @param {Object[]} ids - a list of dynamic segment ids
     * @param {string} url - url for html anchor href
     * @param {boolean} [select=true] - if false will open the tab without selecting it
     * @return {Tab}
     */
    createTab: function createTab(routeName, ids, url, select) {
      // TODO only open tab if validated on backend

      this.incrementProperty('counter');

      // tabService is passed to allow computed property on tab to know if it is selected
      var tabModel = Tab['default'].create({
        tabsService: this,
        routeName: routeName,
        ids: ids,
        url: url,
        index: this.get('counter')
      });

      this.tabs.pushObject(tabModel);

      if (select) {
        this.selectTab(tabModel);
      }

      return tabModel;
    },

    /**
     * Select a tab as a Tab object or as null
     * @param  {Tab | null} tab - tab
     */
    selectTab: function selectTab(tab) {
      this.get('scrollService').set('targetScroll', tab.get('scrollPosition'));
      this.set('selectedTab', tab);
    },

    /**
     * Deselect all tabs
     */
    deselectAll: function deselectAll() {
      this.set('selectedTab', null);
    },

    /**
     * Closes the tab and, if the closed tab is the one
     * that was selected, selects the tab with the
     * highest index.
     * @param  {Tab} tab - The tab object to remove.
     */
    closeTab: function closeTab(tab) {
      var _this2 = this;

      this.tabs.removeObject(tab);

      if (tab.get('selected')) {
        (function () {
          var high = 0,
              replacementTab = null;

          _this2.tabs.forEach(function (tabItem) {
            var index = tabItem.get('index');

            if (index >= high) {
              replacementTab = tabItem;
              high = index;
            }
          });

          // Select the next available tab

          if (replacementTab) {
            _this2.selectTab(replacementTab);
          }
        })();
      }

      if (this.tabs.length === 0) {
        this.deselectAll();
      }
    },

    /**
     * Observes tabs and updates storage on change
     */
    tabsUpdated: (function () {
      this.copyTabsToStorage();

      // Set counter to highest index in tabs array
      var counter = 0;

      this.tabs.forEach(function (tab) {
        counter = counter > tab.get('index') ? counter : tab.get('index');
      });

      this.set('counter', counter);
    }).observes('tabs.@each', 'tabs.@each.selected', 'tabs.@each.index', 'tabs.@each.ids.@each', 'tabs.@each.routeName', 'tabs.@each.label', 'tabs.@each.url', 'tabs.@each.scrollPosition'),

    /**
     * Loops through tabs, simplifying them for storage
     */
    copyTabsToStorage: function copyTabsToStorage() {
      // Simplify tabs object
      var tabs = this.tabs.map(function (tabModel) {
        var fields = ['routeName', 'ids', 'url', 'label', 'index', 'scrollPosition'];

        return arrayToObject(fields, tabModel.get, tabModel);
      });
      // Copy tabs array into store
      this.get('localStoreService').setItem('tabs', tabs.toArray(), true);
    },

    /**
     * Loops through stored tabs, adding to Ember Array as Tab objects
     * There should never be a situation where tabs are added to
     * this.tabs and not to the store.
     */
    copyTabsFromStorage: function copyTabsFromStorage() {
      var _this3 = this;

      // Converts simple objects in the store into Tab objects.

      var tabs = this.get('localStoreService').getItem('tabs');

      if (tabs) {
        tabs.forEach(function (tab) {
          // Only add tabs that are not already stored in this.tabs
          if (!_this3.getTab(tab.routeName, tab.ids)) {
            var tabModel = Tab['default'].create(tab);

            tabModel.set('tabsService', _this3);
            tabModel.set('scrollPosition', 0);

            _this3.tabs.pushObject(tabModel);
          }
        });
      }
    }
  });

});
define('frontend-cp/services/url', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({
    currentUrl: null
  });

});
define('frontend-cp/session/admin/showcase/controller', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    people: new Ember['default'].A([{
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }, {
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }, {
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }])

  });

});
define('frontend-cp/session/admin/showcase/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    setupController: function setupController(controller, model) {
      controller.set('model', model);

      var userModel = this.store.createRecord('person', {
        fullName: 'James Brown'
      });
      var email = this.store.createRecord('identity-email', { email: 'james.brown@the.sole.train.com' });
      userModel.get('emails').pushObject(email);
      userModel.set('avatar', this.store.createRecord('avatar', {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }));

      controller.set('userModel', userModel);
    }
  });

});
define('frontend-cp/session/admin/showcase/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      Some demo content!\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      Some demo content!\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","showcase-container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-admin-selectable-card");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{#ko-admin-selectable-card onComponentWasSelectedAction=\"selectedModel\" selectableModelId=model.id }}\n      Some demo content!\n    {{\\ko-admin-selectable-card}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{#ko-admin-selectable-card active=false }}\n      Some demo content!\n    {{\\ko-admin-selectable-card}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-admin-card-user");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-admin-card-user user=user}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-admin-card-team");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-admin-card-user user=user}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-checkbox");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my preferences'\n      large=true\n      disabled=false\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my preferences'\n      large=true\n      disabled=false\n      tabindex=0\n      checked=true\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my diet'\n      large=true\n      disabled=true\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my color'\n      large=false\n      disabled=true\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my name'\n      large=false\n      disabled=false\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-toggle");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-toggle\n      activated=false\n      label='Nuclear bomb switch'\n      micro=false\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=true\n      label='Nuclear bomb switch'\n      micro=false\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=false\n      label='Nuclear bomb switch'\n      micro=true\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=true\n      label='Nuclear bomb switch'\n      micro=true\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-radio");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-radio\n      label='You can choose this'\n      large=true\n      disabled=false\n      tabindex=0\n      selected=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-radio\n      label='or this'\n      large=true\n      disabled=false\n      tabindex=0\n      selected=true\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-radio\n      label='but not this'\n      large=true\n      disabled=true\n      tabindex=0\n      selected=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-radio\n      label='nor this'\n      large=false\n      disabled=true\n      tabindex=0\n      selected=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-radio\n      label='This is fine however'\n      large=false\n      disabled=false\n      tabindex=0\n      selected=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,5,5);
        var morph1 = dom.createMorphAt(element0,9,9);
        var morph2 = dom.createMorphAt(element0,17,17);
        var morph3 = dom.createMorphAt(element0,25,25);
        var morph4 = dom.createMorphAt(element0,33,33);
        var morph5 = dom.createMorphAt(element0,35,35);
        var morph6 = dom.createMorphAt(element0,37,37);
        var morph7 = dom.createMorphAt(element0,39,39);
        var morph8 = dom.createMorphAt(element0,41,41);
        var morph9 = dom.createMorphAt(element0,49,49);
        var morph10 = dom.createMorphAt(element0,53,53);
        var morph11 = dom.createMorphAt(element0,57,57);
        var morph12 = dom.createMorphAt(element0,61,61);
        var morph13 = dom.createMorphAt(element0,71,71);
        var morph14 = dom.createMorphAt(element0,75,75);
        var morph15 = dom.createMorphAt(element0,79,79);
        var morph16 = dom.createMorphAt(element0,83,83);
        var morph17 = dom.createMorphAt(element0,87,87);
        block(env, morph0, context, "ko-admin-selectable-card", [], {}, child0, null);
        block(env, morph1, context, "ko-admin-selectable-card", [], {"isActive": false}, child1, null);
        inline(env, morph2, context, "ko-admin-card-user", [], {"user": get(env, context, "userModel")});
        inline(env, morph3, context, "ko-admin-card-team", [], {"teamName": "marketing", "members": get(env, context, "people")});
        inline(env, morph4, context, "ko-checkbox", [], {"label": "Remember my preferences", "large": true, "disabled": false, "tabindex": 0, "checked": false});
        inline(env, morph5, context, "ko-checkbox", [], {"label": "Remember my preferences", "large": true, "disabled": false, "tabindex": 0, "checked": true});
        inline(env, morph6, context, "ko-checkbox", [], {"label": "Remember my diet", "large": true, "disabled": true, "tabindex": 0, "checked": false});
        inline(env, morph7, context, "ko-checkbox", [], {"label": "Remember my color", "large": false, "disabled": true, "tabindex": 0, "checked": false});
        inline(env, morph8, context, "ko-checkbox", [], {"label": "Remember my name", "large": false, "disabled": false, "tabindex": 0, "checked": false});
        inline(env, morph9, context, "ko-toggle", [], {"activated": false, "label": "Nuclear bomb switch", "micro": false, "tabindex": 0});
        inline(env, morph10, context, "ko-toggle", [], {"activated": true, "label": "Nuclear bomb switch", "micro": false, "tabindex": 0});
        inline(env, morph11, context, "ko-toggle", [], {"activated": false, "label": "Nuclear bomb switch", "micro": true, "tabindex": 0});
        inline(env, morph12, context, "ko-toggle", [], {"activated": true, "label": "Nuclear bomb switch", "micro": true, "tabindex": 0});
        inline(env, morph13, context, "ko-radio", [], {"label": "You can choose this", "large": true, "disabled": false, "tabindex": 0, "selected": false});
        inline(env, morph14, context, "ko-radio", [], {"label": "or this", "large": true, "disabled": false, "tabindex": 0, "selected": true});
        inline(env, morph15, context, "ko-radio", [], {"label": "but not this", "large": true, "disabled": true, "tabindex": 0, "selected": false});
        inline(env, morph16, context, "ko-radio", [], {"label": "nor this", "large": false, "disabled": true, "tabindex": 0, "selected": false});
        inline(env, morph17, context, "ko-radio", [], {"label": "This is fine however", "large": false, "disabled": false, "tabindex": 0, "selected": false});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/admin/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","session-admin");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","session-admin--page-title");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","session-admin--page-container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","session-admin-navigation");
        var el4 = dom.createTextNode("\n\n\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","session-admin-navigation__heading");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","session-admin-navigation__list-group");
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, subexpr = hooks.subexpr, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [1]),0,0);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [3]),0,0);
        var morph4 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["admin.administration"], {})], {});
        inline(env, morph1, context, "format-message", [subexpr(env, context, "intl-get", ["admin.apps"], {})], {});
        inline(env, morph2, context, "format-message", [subexpr(env, context, "intl-get", ["admin.apps"], {})], {});
        inline(env, morph3, context, "format-message", [subexpr(env, context, "intl-get", ["admin.endpoints"], {})], {});
        content(env, morph4, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/case/controller', ['exports', 'ember', 'frontend-cp/mixins/breadcrumbable'], function (exports, Ember, Breadcrumbable) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(Breadcrumbable['default'], {

    /**
     * Returns a breadcrumb hash depending on what
     * data is available. Should hierarchical:
     * Organisation>User>Case
     * @return {Object} Breadcrumb data hash
     */
    breadcrumbs: (function () {

      var hasOrganisation = this.get('model.creator.organization.id');
      var hasUser = this.get('model.creator.id');
      var caseCrumb = {
        id: 'case',
        name: 'Case',
        route: 'session.cases.case.index'
      };
      var userCrumb = {
        id: 'user',
        name: 'User',
        route: 'session.cases.case.user'
      };
      var organisationCrumb = {
        id: 'organisation',
        name: 'Organisation',
        route: 'session.cases.case.organisation'
      };

      var crumbs = [];

      if (hasOrganisation) {
        crumbs.push(organisationCrumb);
      }

      if (hasUser) {
        crumbs.push(userCrumb);
      }

      crumbs.push(caseCrumb);

      return crumbs;
    }).property('model.creator.organization.id', 'model.creator.id')
  });

});
define('frontend-cp/session/cases/case/index/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return Ember['default'].RSVP.hash({
        'case': this.modelFor('session.cases.case'),
        priorities: this.get('store').find('priority'),
        types: this.get('store').find('type'),
        statuses: this.get('store').find('status')
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('case', model['case']);
      controller.set('priorities', model.priorities);
      controller.set('types', model.types);
      controller.set('statuses', model.statuses);
    }
  });

});
define('frontend-cp/session/cases/case/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "ko-case-content", [], {"case": get(env, context, "case"), "priorities": get(env, context, "priorities"), "types": get(env, context, "types"), "statuses": get(env, context, "statuses")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/case/loading/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "ko-loader", [], {"large": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-center", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/case/organisation/route', ['exports', 'frontend-cp/routes/abstract/organisation-route'], function (exports, OrganisationRoute) {

  'use strict';

  exports['default'] = OrganisationRoute['default'].extend({

    model: function model() {
      var parentModel = this.modelFor('case');
      return parentModel ? parentModel.get('organization') : {};
    }

  });

});
define('frontend-cp/session/cases/case/organisation/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "ko-organisation-content", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/case/route', ['exports', 'frontend-cp/routes/abstract/tabbed-route'], function (exports, TabbedRoute) {

  'use strict';

  exports['default'] = TabbedRoute['default'].extend({

    model: function model(params) {
      return this.store.find('case', +params.case_id);
    },

    setupController: function setupController(controller, model) {
      controller.set('model', model);
      this.get('tab').set('label', model.get('subject'));
    }

  });

});
define('frontend-cp/session/cases/case/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","content layout--flush");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout__item u-1/1");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        inline(env, morph0, context, "ko-breadcrumbs", [], {"breadcrumbs": get(env, context, "breadcrumbs"), "activeBreadcrumb": get(env, context, "activeBreadcrumb"), "action": "breadcrumbChange"});
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/case/user/route', ['exports', 'frontend-cp/routes/abstract/user-route'], function (exports, UserRoute) {

	'use strict';

	exports['default'] = UserRoute['default'].extend({});

	// model() {
	//   return this.modelFor('case').get('organization').then((org) => {
	//     Ember.RSVP.hash({
	//       metrics: this.find('metric', { organization_id: org.id }),
	//       organization: org
	//     });
	//   });
	// let parentModel = this.modelFor('case');
	// return parentModel ? parentModel.get('organization') : {};
	// }

});
define('frontend-cp/session/cases/case/user/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "ko-user-content", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/index/controller', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    queryParams: {
      page: {
        refreshModel: true
      }
    },

    // Indicates whether route is loading (to show loading spinner instead
    // of a list)
    loading: true,

    // Page number being loaded, used by the ko-pagination to correctly
    // turn links into spinners
    loadingPage: null
  });

});
define('frontend-cp/session/cases/index/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var parseIntOrDefault = function parseIntOrDefault(string, defaultValue) {
    return isNaN(string) ? defaultValue : Math.floor(Math.abs(string));
  };

  exports['default'] = Ember['default'].Route.extend({
    page: 1,
    limit: 5,
    offset: 0,
    firstLoad: true,

    queryParams: {
      page: {
        refreshModel: true
      }
    },

    model: function model(params) {
      if (params.page) {
        var page = params.page;
        this.set('page', parseIntOrDefault(page, 1));
      }
      this.set('offset', (this.get('page') - 1) * this.get('limit'));

      return this.store.find('case', {
        offset: this.get('offset'),
        limit: this.get('limit')
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('cases', model);
      controller.setProperties({
        page: this.get('page'),
        total: Math.ceil(this.store.metadataFor('case').total / this.get('limit'))
      });

      // Resetting loading state
      controller.set('loading', false);
      controller.set('loadingPage', null);
    },

    resetController: function resetController(controller, isExiting) {
      // As routes are persisted across the entire app lifecycle,
      // we have to reset things manually
      if (isExiting) {
        this.set('firstLoad', true);
      }
    },

    actions: {
      // Called whenever a transition to this route is performed.
      // Not implementing this event or returning "true" causes Ember
      // to enter loading substate.
      loading: function loading(transition) {
        // Enter loading substate, but only if we are coming from another route
        if (this.get('firstLoad')) {
          this.set('firstLoad', false);
          return true;
        }

        // Switching between pages on this route won't remove the paginator
        var controller = this.controllerFor('session.cases.index');
        controller.set('loadingPage', parseIntOrDefault(transition.queryParams.page, null));
        controller.set('loading', true);
      }
    }
  });

});
define('frontend-cp/session/cases/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            inline(env, morph0, context, "ko-loader", [], {"large": true});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "ko-center", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ko-session-cases-index__contents");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "ko-cases-list", [], {"cases": get(env, context, "cases")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, subexpr = hooks.subexpr, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          set(env, context, "number", blockArguments[0]);
          block(env, morph0, context, "link-to", ["session.cases", subexpr(env, context, "query-params", [], {"page": get(env, context, "number")})], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ko-session-cases-index");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-session-cases-index__scrollable");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ko-session-cases-index__pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        block(env, morph0, context, "if", [get(env, context, "loading")], {}, child0, child1);
        block(env, morph1, context, "ko-pagination", [], {"currentPage": get(env, context, "page"), "loadingPage": get(env, context, "loadingPage"), "pageCount": get(env, context, "total")}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/loading/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "ko-loader", [], {"large": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-center", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/cases/new/controller', ['exports', 'ember', 'frontend-cp/mixins/breadcrumbable'], function (exports, Ember, Breadcrumbable) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(Breadcrumbable['default'], {

    breadcrumbs: (function () {

      var hasOrganisation = this.get('model.creator.organization.id');
      var hasUser = this.get('model.creator.id');
      var caseCrumb = {
        id: 'case',
        name: 'Case',
        route: 'session.cases.case.index'
      };
      var userCrumb = {
        id: 'user',
        name: 'User',
        route: 'session.cases.case.user'
      };
      var organisationCrumb = {
        id: 'organisation',
        name: 'Organisation',
        route: 'session.cases.case.organisation'
      };

      var crumbs = [caseCrumb];

      if (hasOrganisation) {
        crumbs.push(organisationCrumb);
      }

      if (hasUser) {
        crumbs.push(userCrumb);
      }

      return crumbs;
    }).property('model.creator.organization.id', 'model.creator.id')
  });

});
define('frontend-cp/session/cases/new/route', ['exports', 'frontend-cp/routes/abstract/tabbed-route'], function (exports, TabbedRoute) {

  'use strict';

  exports['default'] = TabbedRoute['default'].extend({

    model: function model() {
      return this.store.createRecord('case', {
        subject: 'New Case'
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('model', model);
      this.get('tab').set('label', model.get('subject'));
    }

  });

});
define('frontend-cp/session/cases/new/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","content layout--flush");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout__item u-1/1");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        inline(env, morph0, context, "ko-breadcrumbs", [], {"breadcrumbs": get(env, context, "breadcrumbs"), "activeBreadcrumb": get(env, context, "activeBreadcrumb"), "action": "breadcrumbChange"});
        inline(env, morph1, context, "ko-case-content", [], {"case": get(env, context, "case"), "priorities": get(env, context, "priorities"), "types": get(env, context, "types"), "statuses": get(env, context, "statuses")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/controller', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    tabsService: Ember['default'].inject.service('tabs')
  });

});
define('frontend-cp/session/loading/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "ko-loader", [], {"large": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "ko-center", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  /**
   * SessionRoute
   *
   * This route is resposible for checking the session exists for all its
   * child routes. Since a parent route loads before all its children, no
   * child route will load if the session id is not available.
   *
   * Note that the application route is not a child of this one so the
   * application route needs to check for the session independently.
   *
   * This route also loads all data shared by all its children,
   * including stored tabs from local storage and menus from the API.
   */

  exports['default'] = Ember['default'].Route.extend({

    sessionService: Ember['default'].inject.service('session'),
    tabsService: Ember['default'].inject.service('tabs'),

    beforeModel: function beforeModel() {
      // Retrieve tabs from storage if available
      this.get('tabsService').getTabs();

      // Redirect to login if not validated
      if (this.get('sessionService').getSessionId() === null) {
        this.transitionTo('login');
      }
    },

    /**
     * Listen for a change in the selected tab and open it
     * as a route. This is used when tabs are automatically
     * selected, such as when closing the current tab, in
     * which case the next tab will be selected for you.
     */
    selectionDidChange: (function () {
      var tab = this.get('tabsService').get('selectedTab');
      // Ignore if is not the exact tabs route, eg if it is a subroute
      if (tab && this.get('tabsService').get('isTabAtRoot')) {
        var ids = tab.get('ids');
        if (ids) {
          this.transitionTo.apply(this, [tab.get('routeName')].concat(_toConsumableArray(ids)));
        } else {
          this.transitionTo(tab.get('routeName'));
        }
      } else if (tab === null && this.get('tabsService').get('tabs.length') === 0) {
        this.transitionTo('session.cases');
      }
    }).observes('tabsService.selectedTab'),

    actions: {
      openTab: function openTab(tab) {
        var ids = tab.get('ids');
        this.transitionTo.apply(this, [tab.get('routeName')].concat(_toConsumableArray(ids)));
      },
      closeTab: function closeTab(tab) {
        this.get('tabsService').closeTab(tab);
      }
    }
  });

});
define('frontend-cp/session/showcase/controller', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    contextModalService: Ember['default'].inject.service('context-modal'),

    actions: {
      closeContextModal: function closeContextModal() {
        this.get('contextModalService').close();
      },

      addParticipant: function addParticipant(event) {
        this.get('contextModalService').open('addParticipants', event);
      },

      tabChange: function tabChange(tab) {
        this.set('activeTab', tab);
      },

      toggleCaseFieldError: function toggleCaseFieldError() {
        this.toggleProperty('caseFieldError');
      },

      caseFieldSelected: function caseFieldSelected(field) {
        this.set('selectedField', field);
      },

      clearChanges: function clearChanges() {
        this.set('selectFieldsChanged', false);
      },

      dateChange: function dateChange(date) {
        this.set('date', date);
      }
    },

    editableTextVal: 'I am a hunky munky',
    editableTextValB: 'I am a chunky munky',

    tabs: [{
      id: 1,
      name: 'Cicso Systems Inc.'
    }, {
      id: 2,
      name: 'Audrey Raines'
    }, {
      id: 3,
      name: 'Create Case 987-0989'
    }],

    activeTab: 3,

    contactTitle: 'CONTACT INFORMATION',
    facebook: ['facebook.com/jessebc'],
    twitter: ['@jessebc', '@31three unverified'],
    email: ['jesse@31three.com', 'jessebc@gmail.com'],
    linkedin: ['jessebc'],
    phone: ['904-987-0987'],

    feedbackTitle: 'RECENT FEEDBACK',

    feedback: [{
      'yesterday': 1,
      'lastWeek': 1,
      'lastMonth': 1,
      'lastThreeMonths': 1,
      'lastSixMonths': 1,
      'lastYear': -1,
      'all': 1
    }],

    casesTitle: 'RECENT CASES',

    cases: [{ subject: 'I cant connect to the internet!', createdAt: '2015-05-06T08:27:13Z' }, { subject: 'My printers wont work. Is it my issue or yours? Please help!', createdAt: '2015-05-04T13:19:31Z' }, { subject: 'My printers wont work. Is it my issue or yours? Please help!', createdAt: '2015-05-04T13:19:31Z' }],

    addressTitle: 'ADDRESS',

    address: [{
      'address1': '10 Main Street East',
      'address2': 'Grimsby Ontario',
      'postalCode': 'L3M1M8',
      'country': 'Canada'
    }],

    src: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg',

    avatar: {
      url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
    },

    membersTitle: 'RECENTLY ACTIVE MEMBERS',

    people: [{
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }, {
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }, {
      avatar: {
        url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
      }
    }],

    metricTitle: 'CASES',

    metrics: [{ value: 9, total: 120 }],

    events: [{
      'uuid': 'f4fa0cf1-d4d9-420d-87d9-d357ea2c47df',
      'subject': 'Windows 7 64 bit Upgrade Project',
      'contents': 'Installed windows 7 in to new workstation with the image disk . Workstation contains all the generic software but missing drivers for network and chipset.',
      'isPinned': false,
      'creator': {
        'id': 19,
        'fullName': 'John Doe',
        'resourceType': 'person',
        'resourceURL': 'http://lorempixel.com/42/42/people/'
      },
      'identity': {
        'id': 19,
        'isPrimary': true,
        'email': 'johndoe2891067559@gmail.com',
        'isNotificationEnabled': false,
        'isValidated': true,
        'createdAt': '2015-05-06T08:27:13Z',
        'updatedAt': '2015-05-06T08:27:13Z',
        'resourceType': 'identityEmail',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/19/identities/emails/19'
      },
      'attachments': [{
        'id': 1,
        'name': 'winter-tiger-wild-cat-images.jpg',
        'size': 197625,
        'width': 1920,
        'height': 1080,
        'type': 'image/jpeg',
        'url': 'http://regmedia.co.uk/2013/03/18/nigellaLawsonPhotoHugoBurnand.jpg',
        'urlDownload': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/download',
        'thumbnails': [{
          'name': 'winter-tiger-wild-cat-images64.jpg',
          'size': 4151,
          'width': 64,
          'height': 36,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=64',
          'createdAt': '2015-05-19T06:48:38Z'
        }, {
          'name': 'winter-tiger-wild-cat-images80.jpg',
          'size': 5615,
          'width': 80,
          'height': 45,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=80',
          'createdAt': '2015-05-19T06:48:38Z'
        }, {
          'name': 'winter-tiger-wild-cat-images100.jpg',
          'size': 8244,
          'width': 100,
          'height': 56,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=100',
          'createdAt': '2015-05-19T06:48:38Z'
        }, {
          'name': 'winter-tiger-wild-cat-images160.jpg',
          'size': 18189,
          'width': 160,
          'height': 90,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=160',
          'createdAt': '2015-05-19T06:48:38Z'
        }, {
          'name': 'winter-tiger-wild-cat-images200.jpg',
          'size': 25677,
          'width': 200,
          'height': 112,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=200',
          'createdAt': '2015-05-19T06:48:38Z'
        }, {
          'name': 'winter-tiger-wild-cat-images360.jpg',
          'size': 72257,
          'width': 360,
          'height': 202,
          'type': 'image/jpeg',
          'url': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1/url&size=360',
          'createdAt': '2015-05-19T06:48:38Z'
        }],
        'createdAt': '2015-05-19T06:48:38Z',
        'resourceType': 'attachment',
        'resourceURL': 'http://k5.kayako.com:8888/api/index.php?/v1/cases/1/messages/1/attachments/1'
      }],
      'original': {
        'id': 6,
        'uuid': 'f4fa0cf1-d4d9-420d-87d9-d357ea2c47df',
        'subject': 'Windows 7 64 bit Upgrade Project',
        'contents': 'Installed windows 7 in to new workstation with the image disk . Workstation contains all the generic software but missing drivers for network and chipset.',
        'fullname': null,
        'email': null,
        'creator': {
          'id': 19,
          'fullName': 'John Doe',
          'resourceType': 'person',
          'resourceURL': 'http://lorempixel.com/42/42/people/'
        },
        'identity': {
          'id': 19,
          'isPrimary': true,
          'email': 'johndoe2891067559@gmail.com',
          'isNotificationEnabled': false,
          'isValidated': true,
          'createdAt': '2015-05-06T08:27:13Z',
          'updatedAt': '2015-05-06T08:27:13Z',
          'resourceType': 'identityEmail',
          'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/19/identities/emails/19'
        },
        'attachments': [],
        'location': null,
        'metadata': {
          'custom': null,
          'system': {
            'ipaddress': '',
            'useragent': ''
          }
        },
        'creationMode': 'SYSTEM',
        'locale': null,
        'responseTime': 0,
        'createdAt': '2015-05-06T08:27:13Z',
        'resourceType': 'caseMessage',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/cases/2/messages/6'
      },
      'createdAt': '2015-05-06T08:27:13Z',
      'updatedAt': '2015-05-06T08:27:13Z',
      'resourceType': 'post'
    }, {
      'uuid': '55b49d92-9a71-42a5-8955-ee952017a1c6',
      'subject': 'Windows 7 64 bit Upgrade Project',
      'contents': 'Started compiling a list of workstations used by development and system test.',
      'isPinned': false,
      'creator': {
        'id': 8,
        'fullName': 'John Doe',
        'resourceType': 'person',
        'resourceURL': 'http://lorempixel.com/42/42/people/'
      },
      'identity': {
        'id': 8,
        'isPrimary': true,
        'email': 'johndoe6902018771@gmail.com',
        'isNotificationEnabled': false,
        'isValidated': false,
        'createdAt': '2015-05-06T08:27:13Z',
        'updatedAt': '2015-05-06T08:27:13Z',
        'resourceType': 'identityEmail',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/8/identities/emails/8'
      },
      'attachments': [],
      'original': {
        'id': 4,
        'uuid': '55b49d92-9a71-42a5-8955-ee952017a1c6',
        'subject': 'Windows 7 64 bit Upgrade Project',
        'contents': 'Started compiling a list of workstations used by development and system test.',
        'fullname': null,
        'email': null,
        'creator': {
          'id': 8,
          'fullName': 'John Doe',
          'resourceType': 'person',
          'resourceURL': 'http://lorempixel.com/42/42/people/'
        },
        'identity': {
          'id': 8,
          'isPrimary': true,
          'email': 'johndoe6902018771@gmail.com',
          'isNotificationEnabled': false,
          'isValidated': false,
          'createdAt': '2015-05-06T08:27:13Z',
          'updatedAt': '2015-05-06T08:27:13Z',
          'resourceType': 'identityEmail',
          'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/8/identities/emails/8'
        },
        'attachments': [],
        'location': null,
        'metadata': {
          'custom': null,
          'system': {
            'ipaddress': '',
            'useragent': ''
          }
        },
        'creationMode': 'SYSTEM',
        'locale': null,
        'responseTime': 0,
        'createdAt': '2015-05-06T08:27:13Z',
        'resourceType': 'caseMessage',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/cases/2/messages/4'
      },
      'createdAt': '2015-05-06T08:27:13Z',
      'updatedAt': '2015-05-06T08:27:13Z',
      'resourceType': 'post'
    }, {
      'uuid': '267c965e-5b8a-4a58-89f6-5735578bd0d7',
      'subject': 'Windows 7 64 bit Upgrade Project',
      'contents': 'completed the deployment to the first 3 development workstations ready for the setup of the user specific software. ',
      'isPinned': false,
      'creator': {
        'id': 9,
        'fullName': 'John Doe',
        'resourceType': 'person',
        'resourceURL': 'http://lorempixel.com/42/42/people/'
      },
      'identity': {
        'id': 9,
        'isPrimary': true,
        'email': 'johndoe2946456483@gmail.com',
        'isNotificationEnabled': false,
        'isValidated': true,
        'createdAt': '2015-05-06T08:27:13Z',
        'updatedAt': '2015-05-06T08:27:13Z',
        'resourceType': 'identityEmail',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/9/identities/emails/9'
      },
      'attachments': [],
      'original': {
        'id': 5,
        'uuid': '267c965e-5b8a-4a58-89f6-5735578bd0d7',
        'subject': 'Windows 7 64 bit Upgrade Project',
        'contents': 'completed the deployment to the first 3 development workstations ready for the setup of the user specific software. ',
        'fullname': null,
        'email': null,
        'creator': {
          'id': 9,
          'fullName': 'John Doe',
          'resourceType': 'person',
          'resourceURL': 'http://lorempixel.com/42/42/people/'
        },
        'identity': {
          'id': 9,
          'isPrimary': true,
          'email': 'johndoe2946456483@gmail.com',
          'isNotificationEnabled': false,
          'isValidated': true,
          'createdAt': '2015-05-06T08:27:13Z',
          'updatedAt': '2015-05-06T08:27:13Z',
          'resourceType': 'identityEmail',
          'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/persons/9/identities/emails/9'
        },
        'attachments': [],
        'location': null,
        'metadata': {
          'custom': null,
          'system': {
            'ipaddress': '',
            'useragent': ''
          }
        },
        'creationMode': 'SYSTEM',
        'locale': null,
        'responseTime': 0,
        'createdAt': '2015-05-06T08:27:13Z',
        'resourceType': 'caseMessage',
        'resourceURL': 'http://k5.kayako.com/api/index.php?/v1/cases/2/messages/5'
      },
      'createdAt': '2015-05-06T08:27:13Z',
      'updatedAt': '2015-05-06T08:27:13Z',
      'resourceType': 'post'
    }],

    participants: [{ image: 'http://cdn2.thegloss.com/wp-content/uploads/2013/06/Nigella-Lawson.jpg', alt: 'Lord' }, { image: 'http://images.tvnz.co.nz/tvnzImages/entertainmentNews/2014/03/nigellaLawsonMaster.jpg', alt: 'Have Mercy' }, { image: 'http://regmedia.co.uk/2013/03/18/nigellaLawsonPhotoHugoBurnand.jpg', alt: 'On My' }, { image: 'http://i.dailymail.co.uk/i/pix/2012/11/18/article-2234773-0B6AFF92000005DC-297634x722.jpg', alt: 'Deadlifts' }],

    selectFields: [{ id: 1, label: 'Open' }, { id: 2, label: 'Pending' }, { id: 3, label: 'Closed' }],

    checkboxFields: [{ id: 1, label: 'Red' }, { id: 2, label: 'Blue' }, { id: 3, label: 'Green' }],

    isCheckboxEdited: (function () {
      return this.get('checkboxFields').reduce(function (acc, val) {
        return acc || val.checked;
      }, false);
    }).property('checkboxFields.@each.checked'),

    selectFieldsChanged: false,

    selectedTags: ['DSL', 'ABCD', 'DEFASD'],

    allTags: ['ballpark', 'bandwidth', 'close the loop', 'deep dive', 'low hanging fruit', 'quick-win', 'synergy']
  });

});
define('frontend-cp/session/showcase/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    setupController: function setupController(controller, model) {
      controller.set('model', model);
    }
  });

});
define('frontend-cp/session/showcase/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          inline(env, morph0, context, "ko-contact-info", [], {"title": get(env, context, "contactTitle"), "facebook": get(env, context, "facebook"), "twitter": get(env, context, "twitter"), "linkedin": get(env, context, "linkedin"), "emails": get(env, context, "email"), "phones": get(env, context, "phone")});
          inline(env, morph1, context, "ko-feedback", [], {"title": get(env, context, "feedbackTitle"), "feedback": get(env, context, "feedback")});
          inline(env, morph2, context, "ko-recent-cases", [], {"title": get(env, context, "casesTitle"), "cases": get(env, context, "cases")});
          inline(env, morph3, context, "ko-address", [], {"title": get(env, context, "addressTitle"), "address": get(env, context, "address")});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          var morph5 = dom.createMorphAt(fragment,11,11,contextualElement);
          inline(env, morph0, context, "ko-case-metric", [], {"title": get(env, context, "metricTitle"), "metrics": get(env, context, "metrics")});
          inline(env, morph1, context, "ko-recent-members", [], {"title": get(env, context, "membersTitle"), "members": get(env, context, "members")});
          inline(env, morph2, context, "ko-contact-info", [], {"title": get(env, context, "contactTitle"), "facebook": get(env, context, "facebook"), "twitter": get(env, context, "twitter"), "linkedin": get(env, context, "linkedin"), "emails": get(env, context, "email"), "phones": get(env, context, "phone")});
          inline(env, morph3, context, "ko-feedback", [], {"title": get(env, context, "feedbackTitle"), "feedback": get(env, context, "feedback")});
          inline(env, morph4, context, "ko-recent-cases", [], {"title": get(env, context, "casesTitle"), "cases": get(env, context, "cases")});
          inline(env, morph5, context, "ko-address", [], {"title": get(env, context, "addressTitle"), "address": get(env, context, "address")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","info-bar-item");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","info-bar-item__header");
          var el3 = dom.createTextNode("Also viewing");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","figure-inline");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","u-pos-rel");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("img");
          dom.setAttribute(el4,"class","figure-inline__image--med u-mt--");
          dom.setAttribute(el4,"src","http://images5.fanpop.com/image/photos/30400000/Daenerys-daenerys-targaryen-30464045-988-719.jpg");
          dom.setAttribute(el4,"alt","");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","u-typing u-is-typing");
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","u-pos-rel");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("img");
          dom.setAttribute(el4,"class","figure-inline__image--med u-mt--");
          dom.setAttribute(el4,"src","http://images5.fanpop.com/image/photos/30400000/Daenerys-daenerys-targaryen-30464045-988-719.jpg");
          dom.setAttribute(el4,"alt","");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","u-typing u-was-typing");
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","u-pos-rel u-is-inactive");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("img");
          dom.setAttribute(el4,"class","figure-inline__image--med u-mt--");
          dom.setAttribute(el4,"src","http://images5.fanpop.com/image/photos/30400000/Daenerys-daenerys-targaryen-30464045-988-719.jpg");
          dom.setAttribute(el4,"alt","");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","u-typing u-hidden");
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n              ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","u-typing__item");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, subexpr = hooks.subexpr;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          inline(env, morph0, context, "ko-case-select-field", [], {"content": get(env, context, "selectFields"), "title": "Assignee", "isErrored": get(env, context, "caseFieldError"), "isEdited": get(env, context, "selectFieldsChanged"), "action": "caseFieldSelected", "value": get(env, context, "selectedField"), "labelPath": "label"});
          inline(env, morph1, context, "ko-case-tags-field", [], {"selectedTags": get(env, context, "selectedTags"), "tags": get(env, context, "allTags"), "onTagSelectionChange": get(env, context, "tagSelectionChanged"), "onTagAddition": get(env, context, "tagAdded")});
          inline(env, morph2, context, "ko-case-checkbox-field", [], {"content": get(env, context, "checkboxFields"), "title": subexpr(env, context, "if", [get(env, context, "isCheckboxEdited"), "Checkbox Edited", "Checkbox"], {}), "isEdited": get(env, context, "isCheckboxEdited")});
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","info-bar-item");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"class","button button--primary u-1/1");
          var el3 = dom.createTextNode("Submit");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","info-bar-item");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","info-bar-item__header");
          var el3 = dom.createTextNode("Tags");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","list-inline");
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","tag");
          var el4 = dom.createTextNode("DSL ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","tag__action");
          var el5 = dom.createTextNode("×");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","tag");
          var el4 = dom.createTextNode("ABCD ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","tag__action");
          var el5 = dom.createTextNode("×");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","tag tag--changed");
          var el4 = dom.createTextNode("DEFASD ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","tag__action");
          var el5 = dom.createTextNode("×");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph1 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph2 = dom.createMorphAt(fragment,9,9,contextualElement);
          var morph3 = dom.createMorphAt(fragment,11,11,contextualElement);
          inline(env, morph0, context, "ko-case-select-field", [], {"content": get(env, context, "selectFields"), "title": "Requester", "isErrored": get(env, context, "caseFieldError"), "isEdited": get(env, context, "selectFieldsChanged"), "action": "caseFieldSelected", "value": get(env, context, "selectedField"), "labelPath": "label"});
          inline(env, morph1, context, "ko-case-select-field", [], {"content": get(env, context, "selectFields"), "title": "Assignee", "isErrored": get(env, context, "caseFieldError"), "isEdited": get(env, context, "selectFieldsChanged"), "action": "caseFieldSelected", "value": get(env, context, "selectedField"), "labelPath": "label"});
          inline(env, morph2, context, "ko-case-checkbox-field", [], {"title": "Edited checkbox", "isEdited": true, "content": get(env, context, "checkboxFields")});
          inline(env, morph3, context, "ko-case-checkbox-field", [], {"title": "Errored checkbox", "isErrored": true, "content": get(env, context, "checkboxFields")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","showcase-container");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Loader");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-loader}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-loader large=true}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-feed");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Contact information");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-contact-info title=contactTitle facebook=facebook twitter=twitter linkedin=linkedin emails=email phones=phone}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Recent feedback");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-feedback title=feedbackTitle feedback=feedback}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Recent cases");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-recent-cases title=casesTitle cases=cases}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Recent metric");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-case-metric title=metricTitle metrics=metrics}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Avatar");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-avatar avatar=avatar}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Recent members");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-recent-members title=membersTitle members=people}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Address");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-address title=addressTitle address=address}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("KO-USER-CONTENT");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("KO-ORGANIZATION-CONTENT");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-checkbox");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my preferences'\n      large=true\n      disabled=false\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my preferences'\n      large=true\n      disabled=false\n      tabindex=0\n      checked=true\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my diet'\n      large=true\n      disabled=true\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my color'\n      large=false\n      disabled=true\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-checkbox\n      label='Remember my name'\n      large=false\n      disabled=false\n      tabindex=0\n      checked=false\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-toggle");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-toggle\n      activated=false\n      label='Nuclear bomb switch'\n      micro=false\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=true\n      label='Nuclear bomb switch'\n      micro=false\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=false\n      label='Nuclear bomb switch'\n      micro=true\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    {{ko-toggle\n      activated=true\n      label='Nuclear bomb switch'\n      micro=true\n      tabindex=0\n    }} ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("ko-breadcrumbs");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("{{ko-breadcrumbs breadcrumbs=tabs activeTab=activeTab action=\"tabChange\"}}");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Add Participant");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createTextNode("\n    {{ko-participants participants=participants addParticipant=\"addParticipant\"}}\n\n    {{ko-add-participants-context-menu contextModalId=\"addParticipants\"}}\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Search");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  TODO - needs refactoring\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Buttons");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--default");
        var el4 = dom.createTextNode("Button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--default");
        dom.setAttribute(el3,"disabled","disabled");
        var el4 = dom.createTextNode("Disabled button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--action i--chevrons");
        var el4 = dom.createTextNode("Actions");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--primary");
        var el4 = dom.createTextNode("Primary button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--highlight");
        var el4 = dom.createTextNode("Highlight button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--alert");
        var el4 = dom.createTextNode("Alert button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--twitter i--twitter");
        var el4 = dom.createTextNode("Twitter button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--facebook i--facebook");
        var el4 = dom.createTextNode("Facebook button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","button-group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","button-group__item is-active");
        var el5 = dom.createTextNode("Button");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("\n   ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","button-group__item");
        var el5 = dom.createTextNode("Toggled button");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("\n   ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","button-group__item");
        var el5 = dom.createTextNode("Button");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","button-split");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--primary");
        var el4 = dom.createTextNode("Split button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","button--primary button-split__action i--chevron");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","button-split");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","button button--twitter i--twitter");
        var el4 = dom.createTextNode("Twitter Split button");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","button-split__action button--twitter i--chevron");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","flag--bottom");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag__img");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","http://lorempixel.com/42/42/people/");
        dom.setAttribute(el4,"alt","");
        dom.setAttribute(el4,"class","header__image");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag__body");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        dom.setAttribute(el4,"class","header__title");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","header__subtitle");
        var el5 = dom.createTextNode("\n        January 22, 2015 - 12:14PM created via Twitter, {{ brand_name }}\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Case info-bar fields");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        var el3 = dom.createTextNode("Toggle Error");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        var el3 = dom.createTextNode("Clear Changes");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"style","width: 275px; min-height: 0 !important;");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        dom.setAttribute(el2,"id","datepicker");
        var el3 = dom.createTextNode("Datepicker");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("code");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Create button");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","box-container");
        dom.setAttribute(el2,"style","width: auto; display: inline-block;");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","list-inline");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"src","images/icons/case.svg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-caption t-small t-center u-mt--");
        var el7 = dom.createTextNode("\n            Case\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"class","u-mh--");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"src","images/icons/user.svg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-caption t-small t-center u-mt--");
        var el7 = dom.createTextNode("\n            User\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"src","images/icons/organisation.svg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-caption t-small t-center u-mt--");
        var el7 = dom.createTextNode("\n            Organisation\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","t-caption t-small u-mb-");
        var el5 = dom.createTextNode("\n        Recently viewed:\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag flag--auto flag--small u-mb-");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"class","avatar");
        dom.setAttribute(el6,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__body");
        var el6 = dom.createTextNode("\n          I can't open the internet.\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-small t-caption");
        var el7 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag flag--auto flag--small u-mb-");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"class","avatar");
        dom.setAttribute(el6,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__body");
        var el6 = dom.createTextNode("\n          I can't open the internet.\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-small t-caption");
        var el7 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag flag--auto flag--small");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6,"class","avatar");
        dom.setAttribute(el6,"src","https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg");
        dom.setAttribute(el6,"alt","");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag__body");
        var el6 = dom.createTextNode("\n          I can't open the internet.\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","t-small t-caption");
        var el7 = dom.createTextNode("Samantha Jones");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Case Page Skeleton");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content layout--flush");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","layout__item u-1/1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","layout__item u-1/1 u-mt");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","flag--bottom");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","flag__img");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("img");
        dom.setAttribute(el7,"src","http://lorempixel.com/42/42/people/");
        dom.setAttribute(el7,"alt","");
        dom.setAttribute(el7,"class","header__image");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","flag__body");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("h4");
        dom.setAttribute(el7,"class","header__title");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("p");
        dom.setAttribute(el7,"class","header__subtitle");
        var el8 = dom.createTextNode("\n            January 22, 2015 - 12:14PM created via Twitter, {{ brand_name }}\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content layout--flush u-mt");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","layout__item u-3/4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","main-content main-content--has-info");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","layout__item u-1/4");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","showcase-spacer");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [201]);
        var element2 = dom.childAt(element0, [203]);
        var element3 = dom.childAt(element0, [227]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var morph0 = dom.createMorphAt(element0,3,3);
        var morph1 = dom.createMorphAt(element0,9,9);
        var morph2 = dom.createMorphAt(element0,17,17);
        var morph3 = dom.createMorphAt(element0,23,23);
        var morph4 = dom.createMorphAt(element0,31,31);
        var morph5 = dom.createMorphAt(element0,39,39);
        var morph6 = dom.createMorphAt(element0,47,47);
        var morph7 = dom.createMorphAt(element0,55,55);
        var morph8 = dom.createMorphAt(element0,63,63);
        var morph9 = dom.createMorphAt(element0,71,71);
        var morph10 = dom.createMorphAt(element0,79,79);
        var morph11 = dom.createMorphAt(element0,85,85);
        var morph12 = dom.createMorphAt(element0,91,91);
        var morph13 = dom.createMorphAt(element0,93,93);
        var morph14 = dom.createMorphAt(element0,95,95);
        var morph15 = dom.createMorphAt(element0,97,97);
        var morph16 = dom.createMorphAt(element0,99,99);
        var morph17 = dom.createMorphAt(element0,107,107);
        var morph18 = dom.createMorphAt(element0,111,111);
        var morph19 = dom.createMorphAt(element0,115,115);
        var morph20 = dom.createMorphAt(element0,119,119);
        var morph21 = dom.createMorphAt(dom.childAt(element0, [129]),0,0);
        var morph22 = dom.createMorphAt(element0,137,137);
        var morph23 = dom.createMorphAt(element0,139,139);
        var morph24 = dom.createMorphAt(dom.childAt(element0, [153]),0,0);
        var morph25 = dom.createMorphAt(dom.childAt(element0, [157]),0,0);
        var morph26 = dom.createMorphAt(dom.childAt(element0, [161]),0,0);
        var morph27 = dom.createMorphAt(dom.childAt(element0, [165]),0,0);
        var morph28 = dom.createMorphAt(dom.childAt(element0, [169]),0,0);
        var morph29 = dom.createMorphAt(dom.childAt(element0, [173]),0,0);
        var morph30 = dom.createMorphAt(dom.childAt(element0, [177]),0,0);
        var morph31 = dom.createMorphAt(dom.childAt(element0, [181]),0,0);
        var morph32 = dom.createMorphAt(dom.childAt(element0, [185]),0,0);
        var morph33 = dom.createMorphAt(dom.childAt(element0, [191]),0,0);
        var morph34 = dom.createMorphAt(dom.childAt(element0, [195, 3, 1]),1,1);
        var morph35 = dom.createMorphAt(dom.childAt(element0, [207]),1,1);
        var morph36 = dom.createMorphAt(dom.childAt(element0, [213]),1,1);
        var morph37 = dom.createMorphAt(dom.childAt(element0, [215]),0,0);
        var morph38 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        var morph39 = dom.createMorphAt(dom.childAt(element4, [3, 1, 3, 1]),1,1);
        var morph40 = dom.createMorphAt(dom.childAt(element5, [1, 1]),1,1);
        var morph41 = dom.createMorphAt(dom.childAt(element5, [3]),1,1);
        content(env, morph0, context, "ko-loader");
        inline(env, morph1, context, "ko-loader", [], {"large": true});
        inline(env, morph2, context, "ko-feed", [], {"events": get(env, context, "events")});
        inline(env, morph3, context, "ko-contact-info", [], {"title": get(env, context, "contactTitle"), "facebook": get(env, context, "facebook"), "twitter": get(env, context, "twitter"), "linkedin": get(env, context, "linkedin"), "emails": get(env, context, "email"), "phones": get(env, context, "phone")});
        inline(env, morph4, context, "ko-feedback", [], {"title": get(env, context, "feedbackTitle"), "feedback": get(env, context, "feedback")});
        inline(env, morph5, context, "ko-recent-cases", [], {"title": get(env, context, "casesTitle"), "cases": get(env, context, "cases")});
        inline(env, morph6, context, "ko-case-metric", [], {"title": get(env, context, "metricTitle"), "metrics": get(env, context, "metrics")});
        inline(env, morph7, context, "ko-avatar", [], {"avatar": get(env, context, "avatar")});
        inline(env, morph8, context, "ko-recent-members", [], {"title": get(env, context, "membersTitle"), "members": get(env, context, "people")});
        inline(env, morph9, context, "ko-address", [], {"title": get(env, context, "addressTitle"), "address": get(env, context, "address")});
        block(env, morph10, context, "ko-info-bar", [], {}, child0, null);
        block(env, morph11, context, "ko-info-bar", [], {}, child1, null);
        inline(env, morph12, context, "ko-checkbox", [], {"label": "Remember my preferences", "large": true, "disabled": false, "tabindex": 0, "checked": false});
        inline(env, morph13, context, "ko-checkbox", [], {"label": "Remember my preferences", "large": true, "disabled": false, "tabindex": 0, "checked": true});
        inline(env, morph14, context, "ko-checkbox", [], {"label": "Remember my diet", "large": true, "disabled": true, "tabindex": 0, "checked": false});
        inline(env, morph15, context, "ko-checkbox", [], {"label": "Remember my color", "large": false, "disabled": true, "tabindex": 0, "checked": false});
        inline(env, morph16, context, "ko-checkbox", [], {"label": "Remember my name", "large": false, "disabled": false, "tabindex": 0, "checked": false});
        inline(env, morph17, context, "ko-toggle", [], {"activated": false, "label": "Nuclear bomb switch", "micro": false, "tabindex": 0});
        inline(env, morph18, context, "ko-toggle", [], {"activated": true, "label": "Nuclear bomb switch", "micro": false, "tabindex": 0});
        inline(env, morph19, context, "ko-toggle", [], {"activated": false, "label": "Nuclear bomb switch", "micro": true, "tabindex": 0});
        inline(env, morph20, context, "ko-toggle", [], {"activated": true, "label": "Nuclear bomb switch", "micro": true, "tabindex": 0});
        inline(env, morph21, context, "ko-breadcrumbs", [], {"breadcrumbs": get(env, context, "tabs"), "activeTab": get(env, context, "activeTab"), "action": "tabChange"});
        inline(env, morph22, context, "ko-participants", [], {"participants": get(env, context, "participants"), "addParticipant": "addParticipant"});
        inline(env, morph23, context, "ko-add-participants-context-menu", [], {"contextModalId": "addParticipants"});
        inline(env, morph24, context, "escape-html", ["<button class=\"button button--default\">Button</button>"], {});
        inline(env, morph25, context, "escape-html", ["<button class=\"button button--default\" disabled=\"disabled\">Disabled button</button>"], {});
        inline(env, morph26, context, "escape-html", ["<button class=\"button button--action i--chevrons\">Actions</button>"], {});
        inline(env, morph27, context, "escape-html", ["<button class=\"button button--primary\">Primary button</button>"], {});
        inline(env, morph28, context, "escape-html", ["<button class=\"button button--highlight\">Highlight button</button>"], {});
        inline(env, morph29, context, "escape-html", ["<button class=\"button button--alert\">Alert button</button>"], {});
        inline(env, morph30, context, "escape-html", ["<button class=\"button button--twitter\">Twitter button</button>"], {});
        inline(env, morph31, context, "escape-html", ["<button class=\"button button--facebook\">Facebook button</button>"], {});
        inline(env, morph32, context, "escape-html", ["<div class=\"button-group\">\n  	<button class=\"button-group__item\">Button</button><button class=\"button-group__item toggled\">Toggled button</button><button class=\"button-group__item\">Button</button>\n  </div>"], {});
        inline(env, morph33, context, "escape-html", ["<button class=\"button button--primary button--dropdown\">Split button</button>"], {});
        inline(env, morph34, context, "ko-editable-text", [], {"value": get(env, context, "editableTextVal")});
        element(env, element1, context, "action", ["toggleCaseFieldError"], {});
        element(env, element2, context, "action", ["clearChanges"], {});
        block(env, morph35, context, "ko-info-bar", [], {}, child2, null);
        inline(env, morph36, context, "ko-datepicker", [], {"date": get(env, context, "date"), "on-date-change": "dateChange"});
        inline(env, morph37, context, "escape-html", ["{{ko-datepicker date=date on-date-change=\"dateChange\"}}"], {});
        inline(env, morph38, context, "ko-breadcrumbs", [], {"tabs": get(env, context, "tabs"), "activeTab": get(env, context, "activeTab"), "action": "tabChange"});
        inline(env, morph39, context, "ko-editable-text", [], {"value": get(env, context, "editableTextVal")});
        content(env, morph40, context, "ko-text-editor");
        block(env, morph41, context, "ko-info-bar", [], {}, child3, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/showcase/view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    classNames: ['showcase']
  });

});
define('frontend-cp/session/styleguide/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","styleguide container");
        var el2 = dom.createTextNode("\n  Add style guide here!\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Headings");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Heading 1");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Heading 2");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("Heading 3");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Heading 3");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h5");
        var el4 = dom.createTextNode("Heading 5");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h6");
        var el4 = dom.createTextNode("Heading 6");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Arrow");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box u-pos-rel");
        var el4 = dom.createTextNode("\n      I have an arrow at the top! :)\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","arrow arrow--top");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box u-pos-rel");
        var el4 = dom.createTextNode("\n      I have an arrow at the bottom! :(\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","arrow arrow--bottom");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Box");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box");
        var el4 = dom.createTextNode("\n      I am a standard box!\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box box--secondary");
        var el4 = dom.createTextNode("\n      i am a box with secondary styling!\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","box-container");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","box");
        var el5 = dom.createTextNode("I am a box with a container");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","box box--wide");
        var el5 = dom.createTextNode("\n        I am a wide box with a container ;)\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","box");
        var el5 = dom.createTextNode("I am a box container");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Flag");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flag");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__img");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"width","48");
        dom.setAttribute(el5,"height","48");
        dom.setAttribute(el5,"src","http://i.imgur.com/C9QgICy.jpg");
        dom.setAttribute(el5,"alt","");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","flag__body");
        var el5 = dom.createTextNode("\n        I am the flag body!\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Typography Utilities");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("States");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-good");
        var el4 = dom.createTextNode("I am a good message! :)");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-bad");
        var el4 = dom.createTextNode("I am a bad message! >:)");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-warning");
        var el4 = dom.createTextNode("I am a warning message! :(");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Position");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-center");
        var el4 = dom.createTextNode("I am center aligned");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-left");
        var el4 = dom.createTextNode("I am left aligned");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-right");
        var el4 = dom.createTextNode("I am right aligned");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Style");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-caption");
        var el4 = dom.createTextNode("I am a caption!");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","t-small");
        var el4 = dom.createTextNode("I am small!");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","styleguide__item");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Variables");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Brand");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n$brand-rounding | border-radius\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Colors");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n$color-primary\n$color-secondary\n$color-tertiary\n$color-trim\n  $color-trim--dark\n\n$color-active\n\n\n$color-text-primary\n$color-text-secondary\n  $color-text-secondary--dark\n\n\n$color-good\n$color-bad\n$color-warning\n\n\n$color-twitter\n$color-facebook\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h4");
        var el4 = dom.createTextNode("Defaults");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("code");
        var el4 = dom.createTextNode("\n$base-spacing-unit\n$half-spacing-unit\n$quarter-spacing-unit\n$large-spacing-unit\n\n$base-font-size\n$base-line-height\n$base-text-color\n$base-background-color\n$base-font-family\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5]);
        var element3 = dom.childAt(element0, [9]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [5]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [9]),1,1);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [5]),1,1);
        var morph3 = dom.createMorphAt(dom.childAt(element2, [9]),1,1);
        var morph4 = dom.createMorphAt(dom.childAt(element2, [13]),1,1);
        var morph5 = dom.createMorphAt(dom.childAt(element0, [7, 5]),1,1);
        var morph6 = dom.createMorphAt(dom.childAt(element3, [11]),1,1);
        var morph7 = dom.createMorphAt(dom.childAt(element3, [21]),1,1);
        var morph8 = dom.createMorphAt(dom.childAt(element3, [29]),1,1);
        inline(env, morph0, context, "escape-html", ["<div class=\"arrow arrow--top\"></div>"], {});
        inline(env, morph1, context, "escape-html", ["<div class=\"arrow arrow--bottom\"></div>"], {});
        inline(env, morph2, context, "escape-html", ["<div class=\"box\">\n  I am a box with secondary styling!\n</div>"], {});
        inline(env, morph3, context, "escape-html", ["<div class=\"box box--secondary\">\n  I am a box with secondary styling!\n</div>"], {});
        inline(env, morph4, context, "escape-html", ["<div class=\"box-container\">\n  <div class=\"box\">I am a box with a container</div>\n  <div class=\"box box--wide\">\n    I am a wide box with a container ;)\n  </div>\n  <div class=\"box\">I am a box container</div>\n</div>"], {});
        inline(env, morph5, context, "escape-html", ["<div class=\"flag\">\n  <div class=\"flag__img\">\n    <img class=\"avatar\" src=\"http://i.imgur.com/C9QgICy.jpg\" alt=\"\">\n  </div>\n  <div class=\"flag__body\">\n    I am the flag body!\n  </div>\n</div>"], {});
        inline(env, morph6, context, "escape-html", ["<p class=\"t-good\">I am a good message! :)</p>\n<p class=\"t-bad\">I am a bad message! >:)</p>\n<p class=\"t-warning\">I am a warning message! :(</p>"], {});
        inline(env, morph7, context, "escape-html", ["<p class=\"t-center\">I am center aligned</p>\n<p class=\"t-left\">I am left aligned</p>\n<p class=\"t-right\">I am right aligned</p>"], {});
        inline(env, morph8, context, "escape-html", ["<p class=\"t-caption\">I am a caption!</p>\n<p class=\"t-small\">I am small!</p>"], {});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["cases.cases"], {})], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, subexpr = hooks.subexpr, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "format-message", [subexpr(env, context, "intl-get", ["generic.users"], {})], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Showcase");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Style Guide");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "tab.label");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          set(env, context, "tab", blockArguments[0]);
          block(env, morph0, context, "ko-tab", [], {"tab": get(env, context, "tab"), "openTab": "openTab", "closeTab": "closeTab"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"class","header");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","nav");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","nav__image");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n	 ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","u-inline-block");
        dom.setAttribute(el3,"data-region","navigation-menu");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("nav");
        dom.setAttribute(el4,"class","nav-main");
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n	 ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","u-inline-block");
        dom.setAttribute(el3,"data-region","navigation-tabs");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("nav");
        dom.setAttribute(el4,"class","nav-tabs");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n	 ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","nav-secondary");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","6/10 u-inline-block");
        dom.setAttribute(el3,"data-region","navigation-search");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","search");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5,"type","text");
        dom.setAttribute(el5,"class","input__search");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("\n	 ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","4/10 u-inline-block");
        dom.setAttribute(el3,"data-region","navigation-profile");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","session__content");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, block = hooks.block, element = hooks.element, inline = hooks.inline, content = hooks.content, attribute = hooks.attribute;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [3, 1]);
        var element3 = dom.childAt(element2, [9]);
        var element4 = dom.childAt(element0, [3, 1, 1, 1]);
        var morph0 = dom.createMorphAt(element2,1,1);
        var morph1 = dom.createMorphAt(element2,3,3);
        var morph2 = dom.createMorphAt(element2,5,5);
        var morph3 = dom.createMorphAt(element2,7,7);
        var morph4 = dom.createMorphAt(element3,0,0);
        var morph5 = dom.createMorphAt(dom.childAt(element1, [5, 1]),1,1);
        var morph6 = dom.createMorphAt(element1,7,7);
        var attrMorph0 = dom.createAttrMorph(element4, 'placeholder');
        var morph7 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        block(env, morph0, context, "link-to", ["session.cases", subexpr(env, context, "query-params", [], {"page": get(env, context, "null")})], {"class": "nav-main__item"}, child0, null);
        block(env, morph1, context, "link-to", ["session.users"], {"class": "nav-main__item"}, child1, null);
        block(env, morph2, context, "link-to", ["session.showcase"], {"class": "nav-main__item"}, child2, null);
        block(env, morph3, context, "link-to", ["session.styleguide"], {"class": "nav-main__item"}, child3, null);
        element(env, element3, context, "action", ["logout"], {});
        inline(env, morph4, context, "format-message", [subexpr(env, context, "intl-get", ["generic.logout"], {})], {});
        block(env, morph5, context, "each", [get(env, context, "tabsService.tabs")], {}, child4, null);
        content(env, morph6, context, "ko-agent-dropdown");
        attribute(env, attrMorph0, element4, "placeholder", subexpr(env, context, "format-message", [subexpr(env, context, "intl-get", ["generic.search"], {})], {}));
        content(env, morph7, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/users/index/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    page: 1,
    limit: 5,
    offset: 0,

    queryParams: {
      page: {
        refreshModel: true
      }
    },

    model: function model(params) {
      if (params.page) {
        var page = params.page;
        this.set('page', isNaN(page) ? 1 : Math.floor(Math.abs(page)));
      }
      this.set('offset', (this.get('page') - 1) * this.get('limit'));

      return this.store.find('person', {
        offset: this.get('offset'),
        limit: this.get('limit')
      });
    },

    setupController: function setupController(controller, model) {
      controller.set('persons', model);
      controller.setProperties({
        page: this.get('page'),
        total: Math.ceil(this.store.metadataFor('person').total / this.get('limit'))
      });
    }
  });

});
define('frontend-cp/session/users/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            content(env, morph0, context, "person.fullName");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          set(env, context, "person", blockArguments[0]);
          block(env, morph0, context, "link-to", ["session.users.user", get(env, context, "person")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("List of users\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
        block(env, morph0, context, "each", [get(env, context, "persons")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/users/user/controller', ['exports', 'ember', 'frontend-cp/mixins/breadcrumbable'], function (exports, Ember, Breadcrumbable) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(Breadcrumbable['default'], {

    /**
     * Returns a breadcrumb hash depending on what
     * data is available. Should hierarchical:
     * Organisation>User
     * @return {Object} Breadcrumb data hash
     */
    breadcrumbs: (function () {

      var hasOrganisation = this.get('model.organization.id');

      var userCrumb = {
        id: 'user',
        name: 'User',
        route: 'session.users.user.index'
      };
      var organisationCrumb = {
        id: 'organisation',
        name: 'Organisation',
        route: 'session.users.user.organisation'
      };

      var crumbs = [];

      if (hasOrganisation) {
        crumbs.push(organisationCrumb);
      }

      crumbs.push(userCrumb);

      return crumbs;
    }).property('model.organization.id')

  });

});
define('frontend-cp/session/users/user/index/route', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('frontend-cp/session/users/user/index/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "ko-user-content", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/users/user/organisation/route', ['exports', 'frontend-cp/routes/abstract/organisation-route'], function (exports, OrganisationRoute) {

  'use strict';

  exports['default'] = OrganisationRoute['default'].extend({

    model: function model() {
      var parentModel = this.modelFor('person');
      return parentModel ? parentModel.get('organization') : {};
    }

  });

});
define('frontend-cp/session/users/user/organisation/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "ko-organisation-content", [], {"model": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/users/user/route', ['exports', 'frontend-cp/routes/abstract/tabbed-route'], function (exports, TabbedRoute) {

  'use strict';

  exports['default'] = TabbedRoute['default'].extend({

    model: function model(params) {
      return this.store.find('person', +params.person_id);
    },

    setupController: function setupController(controller, model) {
      controller.set('model', model);

      this.get('tab').set('label', model.get('fullName'));
    }
  });

});
define('frontend-cp/session/users/user/template', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","content layout--flush");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","layout__item u-1/1");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        inline(env, morph0, context, "ko-breadcrumbs", [], {"breadcrumbs": get(env, context, "breadcrumbs"), "activeBreadcrumb": get(env, context, "activeBreadcrumb"), "action": "breadcrumbChange"});
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('frontend-cp/session/view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    scrollService: Ember['default'].inject.service('scroll'),
    $sessionContent: null,

    didUpdateTargetScroll: (function () {
      this.$().find('.session__content').scrollTop(this.get('scrollService.targetScroll'));
    }).observes('scrollService.targetScroll'),

    didInsertElement: function didInsertElement() {
      var _this = this;

      // Bind scrolling
      this.set('$sessionContent', this.$().find('.session__content'));
      this.get('$sessionContent').on('scroll', function () {
        _this.onScroll();
      });
      this.get('$sessionContent').on('touchMove', function () {
        _this.onScroll();
      });
    },

    willDestroyElement: function willDestroyElement() {
      // Unbind scrolling
      this.get('$sessionContent').off('scroll');
      this.get('$sessionContent').off('touchMove');
    },

    onScroll: function onScroll() {
      this.get('scrollService').set('scroll', this.get('$sessionContent').scrollTop());
    }

  });

});
define('frontend-cp/tests/acceptance/create-case-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - acceptance');
  qunit.test('acceptance/create-case-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'acceptance/create-case-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/acceptance/create-case-test', ['ember', 'qunit', 'frontend-cp/tests/helpers/start-app'], function (Ember, qunit, startApp) {

  'use strict';

  var application = undefined;

  qunit.module('Acceptance | create case', {
    beforeEach: function beforeEach() {
      application = startApp['default']();
      login();
    },

    afterEach: function afterEach() {
      Ember['default'].run(application, 'destroy');
    }
  });

  qunit.test('creating a case by visiting /cases/new', function (assert) {
    assert.expect(1);

    visit('/cases/new');

    andThen(function () {
      assert.equal(currentURL(), '/cases/new');
    });
  });

});
define('frontend-cp/tests/acceptance/create-case-test.jshint', function () {

  'use strict';

  module('JSHint - acceptance');
  test('acceptance/create-case-test.js should pass jshint', function() { 
    ok(true, 'acceptance/create-case-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/access-log.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/access-log.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/access-log.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/access-log.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/access-log.js should pass jshint', function() { 
    ok(true, 'adapters/access-log.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/activity.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/activity.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/activity.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/activity.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/activity.js should pass jshint', function() { 
    ok(true, 'adapters/activity.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/application.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/application.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/application.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/case-message.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/case-message.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/case-message.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/case-message.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/case-message.js should pass jshint', function() { 
    ok(true, 'adapters/case-message.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/case-reply.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/case-reply.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/case-reply.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/case-reply.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/case-reply.js should pass jshint', function() { 
    ok(true, 'adapters/case-reply.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/facebook-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/facebook-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/facebook-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/facebook-account.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/facebook-account.js should pass jshint', function() { 
    ok(true, 'adapters/facebook-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/identity-twitter.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/identity-twitter.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/identity-twitter.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/identity-twitter.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/identity-twitter.js should pass jshint', function() { 
    ok(true, 'adapters/identity-twitter.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/intl.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/intl.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/intl.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/intl.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/intl.js should pass jshint', function() { 
    ok(true, 'adapters/intl.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/metric.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/metric.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/metric.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/metric.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/metric.js should pass jshint', function() { 
    ok(true, 'adapters/metric.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/person.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/person.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/person.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/person.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/person.js should pass jshint', function() { 
    ok(true, 'adapters/person.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/priority.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/priority.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/priority.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/priority.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/priority.js should pass jshint', function() { 
    ok(true, 'adapters/priority.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/private.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/private.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/private.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/private.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/private.js should pass jshint', function() { 
    ok(true, 'adapters/private.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/slack-identity.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/slack-identity.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/slack-identity.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/slack-identity.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/slack-identity.js should pass jshint', function() { 
    ok(true, 'adapters/slack-identity.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/status.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/status.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/status.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/status.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/status.js should pass jshint', function() { 
    ok(true, 'adapters/status.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/twitter-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/twitter-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/twitter-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/twitter-account.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/twitter-account.js should pass jshint', function() { 
    ok(true, 'adapters/twitter-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/adapters/type.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - adapters');
  qunit.test('adapters/type.js should pass ESLint', function(assert) {
    assert.ok(true, 'adapters/type.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/adapters/type.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/type.js should pass jshint', function() { 
    ok(true, 'adapters/type.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/app.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - .');
  qunit.test('app.js should pass ESLint', function(assert) {
    assert.ok(true, 'app.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/application/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - application');
  qunit.test('application/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'application/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/application/controller.jshint', function () {

  'use strict';

  module('JSHint - application');
  test('application/controller.js should pass jshint', function() { 
    ok(true, 'application/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/application/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - application');
  qunit.test('application/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'application/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/application/route.jshint', function () {

  'use strict';

  module('JSHint - application');
  test('application/route.js should pass jshint', function() { 
    ok(true, 'application/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/application/view.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - application');
  qunit.test('application/view.js should pass ESLint', function(assert) {
    assert.ok(true, 'application/view.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/application/view.jshint', function () {

  'use strict';

  module('JSHint - application');
  test('application/view.js should pass jshint', function() { 
    ok(true, 'application/view.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-add-participants-context-menu/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-add-participants-context-menu');
  qunit.test('components/ko-add-participants-context-menu/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-add-participants-context-menu/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-add-participants-context-menu/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-add-participants-context-menu');
  test('components/ko-add-participants-context-menu/component.js should pass jshint', function() { 
    ok(true, 'components/ko-add-participants-context-menu/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-address/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-address');
  qunit.test('components/ko-address/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-address/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-address/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-address');
  test('components/ko-address/component.js should pass jshint', function() { 
    ok(true, 'components/ko-address/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-admin-card-team/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-admin-card-team');
  qunit.test('components/ko-admin-card-team/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-admin-card-team/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-admin-card-team/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-admin-card-team');
  test('components/ko-admin-card-team/component.js should pass jshint', function() { 
    ok(true, 'components/ko-admin-card-team/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-admin-card-user/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-admin-card-user');
  qunit.test('components/ko-admin-card-user/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-admin-card-user/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-admin-card-user/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-admin-card-user');
  test('components/ko-admin-card-user/component.js should pass jshint', function() { 
    ok(true, 'components/ko-admin-card-user/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-admin-selectable-card/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-admin-selectable-card');
  qunit.test('components/ko-admin-selectable-card/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-admin-selectable-card/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-admin-selectable-card/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-admin-selectable-card');
  test('components/ko-admin-selectable-card/component.js should pass jshint', function() { 
    ok(true, 'components/ko-admin-selectable-card/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-agent-dropdown/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-agent-dropdown');
  qunit.test('components/ko-agent-dropdown/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-agent-dropdown/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-agent-dropdown/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-agent-dropdown');
  test('components/ko-agent-dropdown/component.js should pass jshint', function() { 
    ok(true, 'components/ko-agent-dropdown/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-avatar/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-avatar');
  qunit.test('components/ko-avatar/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-avatar/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-avatar/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-avatar');
  test('components/ko-avatar/component.js should pass jshint', function() { 
    ok(true, 'components/ko-avatar/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-breadcrumbs/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-breadcrumbs');
  qunit.test('components/ko-breadcrumbs/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-breadcrumbs/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-breadcrumbs/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-breadcrumbs');
  test('components/ko-breadcrumbs/component.js should pass jshint', function() { 
    ok(true, 'components/ko-breadcrumbs/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-checkbox-field/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-checkbox-field');
  qunit.test('components/ko-case-checkbox-field/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-checkbox-field/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-checkbox-field/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-checkbox-field');
  test('components/ko-case-checkbox-field/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-checkbox-field/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-content/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-content');
  qunit.test('components/ko-case-content/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-content/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-content/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-content');
  test('components/ko-case-content/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-content/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-custom-field/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-custom-field');
  qunit.test('components/ko-case-custom-field/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-custom-field/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-custom-field/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-custom-field');
  test('components/ko-case-custom-field/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-custom-field/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-metric/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-metric');
  qunit.test('components/ko-case-metric/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-metric/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-metric/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-metric');
  test('components/ko-case-metric/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-metric/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-select-field/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-select-field');
  qunit.test('components/ko-case-select-field/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-select-field/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-select-field/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-select-field');
  test('components/ko-case-select-field/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-select-field/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-case-tags-field/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-case-tags-field');
  qunit.test('components/ko-case-tags-field/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-case-tags-field/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-case-tags-field/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-case-tags-field');
  test('components/ko-case-tags-field/component.js should pass jshint', function() { 
    ok(true, 'components/ko-case-tags-field/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-checkbox/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-checkbox');
  qunit.test('components/ko-checkbox/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-checkbox/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-checkbox/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-checkbox');
  test('components/ko-checkbox/component.js should pass jshint', function() { 
    ok(true, 'components/ko-checkbox/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-contact-info/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-contact-info');
  qunit.test('components/ko-contact-info/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-contact-info/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-contact-info/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-contact-info');
  test('components/ko-contact-info/component.js should pass jshint', function() { 
    ok(true, 'components/ko-contact-info/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-context-modal-item/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-context-modal-item');
  qunit.test('components/ko-context-modal-item/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-context-modal-item/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-context-modal-item/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-context-modal-item');
  test('components/ko-context-modal-item/component.js should pass jshint', function() { 
    ok(true, 'components/ko-context-modal-item/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-context-modal/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-context-modal');
  qunit.test('components/ko-context-modal/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-context-modal/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-context-modal/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-context-modal');
  test('components/ko-context-modal/component.js should pass jshint', function() { 
    ok(true, 'components/ko-context-modal/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-datepicker/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-datepicker');
  qunit.test('components/ko-datepicker/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-datepicker/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-datepicker/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-datepicker');
  test('components/ko-datepicker/component.js should pass jshint', function() { 
    ok(true, 'components/ko-datepicker/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-draggable-dropzone/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-draggable-dropzone');
  qunit.test('components/ko-draggable-dropzone/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-draggable-dropzone/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-draggable-dropzone/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-draggable-dropzone');
  test('components/ko-draggable-dropzone/component.js should pass jshint', function() { 
    ok(true, 'components/ko-draggable-dropzone/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-editable-text/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-editable-text');
  qunit.test('components/ko-editable-text/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-editable-text/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-editable-text/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-editable-text');
  test('components/ko-editable-text/component.js should pass jshint', function() { 
    ok(true, 'components/ko-editable-text/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-event-button/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-event-button');
  qunit.test('components/ko-event-button/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-event-button/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-event-button/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-event-button');
  test('components/ko-event-button/component.js should pass jshint', function() { 
    ok(true, 'components/ko-event-button/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-feed/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-feed');
  qunit.test('components/ko-feed/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-feed/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-feed/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-feed');
  test('components/ko-feed/component.js should pass jshint', function() { 
    ok(true, 'components/ko-feed/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-feedback/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-feedback');
  qunit.test('components/ko-feedback/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-feedback/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-feedback/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-feedback');
  test('components/ko-feedback/component.js should pass jshint', function() { 
    ok(true, 'components/ko-feedback/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-file-field/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-file-field');
  qunit.test('components/ko-file-field/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-file-field/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-file-field/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-file-field');
  test('components/ko-file-field/component.js should pass jshint', function() { 
    ok(true, 'components/ko-file-field/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-file-size/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-file-size');
  qunit.test('components/ko-file-size/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-file-size/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-file-size/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-file-size');
  test('components/ko-file-size/component.js should pass jshint', function() { 
    ok(true, 'components/ko-file-size/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-info-bar/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-info-bar');
  qunit.test('components/ko-info-bar/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-info-bar/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-info-bar/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-info-bar');
  test('components/ko-info-bar/component.js should pass jshint', function() { 
    ok(true, 'components/ko-info-bar/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-limited-text-area/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-limited-text-area');
  qunit.test('components/ko-limited-text-area/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-limited-text-area/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-limited-text-area/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-limited-text-area');
  test('components/ko-limited-text-area/component.js should pass jshint', function() { 
    ok(true, 'components/ko-limited-text-area/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-loader/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-loader');
  qunit.test('components/ko-loader/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-loader/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-loader/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-loader');
  test('components/ko-loader/component.js should pass jshint', function() { 
    ok(true, 'components/ko-loader/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-login-otp/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-login-otp');
  qunit.test('components/ko-login-otp/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-login-otp/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-login-otp/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-login-otp');
  test('components/ko-login-otp/component.js should pass jshint', function() { 
    ok(true, 'components/ko-login-otp/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-login-password/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-login-password');
  qunit.test('components/ko-login-password/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-login-password/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-login-password/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-login-password');
  test('components/ko-login-password/component.js should pass jshint', function() { 
    ok(true, 'components/ko-login-password/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-login-reset/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-login-reset');
  qunit.test('components/ko-login-reset/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-login-reset/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-login-reset/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-login-reset');
  test('components/ko-login-reset/component.js should pass jshint', function() { 
    ok(true, 'components/ko-login-reset/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-organisation-content/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-organisation-content');
  qunit.test('components/ko-organisation-content/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-organisation-content/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-organisation-content/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-organisation-content');
  test('components/ko-organisation-content/component.js should pass jshint', function() { 
    ok(true, 'components/ko-organisation-content/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-page-container/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-page-container');
  qunit.test('components/ko-page-container/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-page-container/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-page-container/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-page-container');
  test('components/ko-page-container/component.js should pass jshint', function() { 
    ok(true, 'components/ko-page-container/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-pagination/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-pagination');
  qunit.test('components/ko-pagination/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-pagination/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-pagination/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-pagination');
  test('components/ko-pagination/component.js should pass jshint', function() { 
    ok(true, 'components/ko-pagination/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-participants-add/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-participants-add');
  qunit.test('components/ko-participants-add/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-participants-add/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-participants-add/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-participants-add');
  test('components/ko-participants-add/component.js should pass jshint', function() { 
    ok(true, 'components/ko-participants-add/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-participants/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-participants');
  qunit.test('components/ko-participants/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-participants/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-participants/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-participants');
  test('components/ko-participants/component.js should pass jshint', function() { 
    ok(true, 'components/ko-participants/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-radio/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-radio');
  qunit.test('components/ko-radio/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-radio/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-radio/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-radio');
  test('components/ko-radio/component.js should pass jshint', function() { 
    ok(true, 'components/ko-radio/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-recent-cases/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-recent-cases');
  qunit.test('components/ko-recent-cases/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-recent-cases/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-recent-cases/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-recent-cases');
  test('components/ko-recent-cases/component.js should pass jshint', function() { 
    ok(true, 'components/ko-recent-cases/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-recent-members/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-recent-members');
  qunit.test('components/ko-recent-members/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-recent-members/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-recent-members/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-recent-members');
  test('components/ko-recent-members/component.js should pass jshint', function() { 
    ok(true, 'components/ko-recent-members/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-search/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-search');
  qunit.test('components/ko-search/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-search/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-search/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-search');
  test('components/ko-search/component.js should pass jshint', function() { 
    ok(true, 'components/ko-search/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-sidebar/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-sidebar');
  qunit.test('components/ko-sidebar/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-sidebar/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-sidebar/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-sidebar');
  test('components/ko-sidebar/component.js should pass jshint', function() { 
    ok(true, 'components/ko-sidebar/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-tab/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-tab');
  qunit.test('components/ko-tab/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-tab/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-tab/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-tab');
  test('components/ko-tab/component.js should pass jshint', function() { 
    ok(true, 'components/ko-tab/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-text-editor/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-text-editor');
  qunit.test('components/ko-text-editor/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-text-editor/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-text-editor/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-text-editor');
  test('components/ko-text-editor/component.js should pass jshint', function() { 
    ok(true, 'components/ko-text-editor/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-toggle/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-toggle');
  qunit.test('components/ko-toggle/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-toggle/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-toggle/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-toggle');
  test('components/ko-toggle/component.js should pass jshint', function() { 
    ok(true, 'components/ko-toggle/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/ko-user-content/component.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/ko-user-content');
  qunit.test('components/ko-user-content/component.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/ko-user-content/component.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/ko-user-content/component.jshint', function () {

  'use strict';

  module('JSHint - components/ko-user-content');
  test('components/ko-user-content/component.js should pass jshint', function() { 
    ok(true, 'components/ko-user-content/component.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/components/mixins/context-menu-set.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - components/mixins');
  qunit.test('components/mixins/context-menu-set.js should pass ESLint', function(assert) {
    assert.ok(true, 'components/mixins/context-menu-set.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/components/mixins/context-menu-set.jshint', function () {

  'use strict';

  module('JSHint - components/mixins');
  test('components/mixins/context-menu-set.js should pass jshint', function() { 
    ok(true, 'components/mixins/context-menu-set.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/formats.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - .');
  qunit.test('formats.js should pass ESLint', function(assert) {
    assert.ok(true, 'formats.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/formats.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('formats.js should pass jshint', function() { 
    ok(true, 'formats.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/-intl-get.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/-intl-get.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/-intl-get.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/-intl-get.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/-intl-get.js should pass jshint', function() { 
    ok(true, 'helpers/-intl-get.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/escape-html.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/escape-html.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/escape-html.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/escape-html.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/escape-html.js should pass jshint', function() { 
    ok(true, 'helpers/escape-html.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-date.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-date.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-date.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-date', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'DATE %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-date.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-date.js should pass jshint', function() { 
    ok(true, 'helpers/format-date.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-html-message.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-html-message.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-html-message.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-html-message', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'HTML MESSAGE %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-html-message.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-html-message.js should pass jshint', function() { 
    ok(true, 'helpers/format-html-message.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-message.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-message.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-message.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-message', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'MESSAGE %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-message.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-message.js should pass jshint', function() { 
    ok(true, 'helpers/format-message.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-number.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-number.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-number.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-number', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'NUMBER %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-number.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-number.js should pass jshint', function() { 
    ok(true, 'helpers/format-number.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-relative.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-relative.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-relative.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-relative', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'RELATIVE %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-relative.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-relative.js should pass jshint', function() { 
    ok(true, 'helpers/format-relative.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/format-time.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/format-time.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/format-time.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/format-time', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return 'TIME %' + value + '%';
  });

});
define('frontend-cp/tests/helpers/format-time.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-time.js should pass jshint', function() { 
    ok(true, 'helpers/format-time.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/intl-get.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/intl-get.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/intl-get.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/intl-get', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return '%' + value + '%';
  });

});
define('frontend-cp/tests/helpers/intl-get.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/intl-get.js should pass jshint', function() { 
    ok(true, 'helpers/intl-get.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/ko-helper.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/ko-helper.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/ko-helper.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/ko-helper.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/ko-helper.js should pass jshint', function() { 
    ok(true, 'helpers/ko-helper.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/login.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/login.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/login.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Test.registerAsyncHelper('login', function (app, assert) {

    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('tabs');

    visit('/login');
    fillIn('input[name=email]', 'test@kayako.com');
    fillIn('input[name=password]', 'setup');
    click('button:last');
  });

});
define('frontend-cp/tests/helpers/login.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/login.js should pass jshint', function() { 
    ok(true, 'helpers/login.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/qunit.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/qunit.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/qunit.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/qunit', ['exports', 'ember', 'ember-qunit/qunit-module', 'ember-test-helpers', 'ember-qunit/test', 'frontend-cp/initializers/ember-intl', 'frontend-cp/tests/helpers/format-date', 'frontend-cp/tests/helpers/format-time', 'frontend-cp/tests/helpers/format-relative', 'frontend-cp/tests/helpers/format-number', 'frontend-cp/tests/helpers/format-html-message', 'frontend-cp/tests/helpers/format-message', 'frontend-cp/tests/helpers/intl-get'], function (exports, Ember, qunit_module, ember_test_helpers, test, ember_intl, FormatDate, FormatTime, FormatRelative, FormatNumber, FormatHtmlMessage, FormatMessage, IntlGet) {

  'use strict';

  exports.createModule = createModule;
  exports.moduleForComponent = moduleForComponent;
  exports.moduleForModel = moduleForModel;
  exports.moduleFor = moduleFor;

  function createModule(Constructor, name, description, callbacks) {
    var actualCallbacks = callbacks || (typeof description === 'object' ? description : {});
    var beforeCallback = actualCallbacks.setup || actualCallbacks.beforeEach;
    actualCallbacks.setup = function () {
      Ember['default'].HTMLBars._registerHelper('format-date', FormatDate['default']);
      Ember['default'].HTMLBars._registerHelper('format-time', FormatTime['default']);
      Ember['default'].HTMLBars._registerHelper('format-relative', FormatRelative['default']);
      Ember['default'].HTMLBars._registerHelper('format-number', FormatNumber['default']);
      Ember['default'].HTMLBars._registerHelper('format-html-message', FormatHtmlMessage['default']);
      Ember['default'].HTMLBars._registerHelper('format-message', FormatMessage['default']);
      Ember['default'].HTMLBars._registerHelper('intl-get', IntlGet['default']);
      if (beforeCallback) {
        beforeCallback.apply(this, arguments);
      }
    };

    if (typeof description !== 'object' && !!description) {
      return qunit_module.createModule(Constructor, name, description, actualCallbacks);
    } else {
      return qunit_module.createModule(Constructor, name, actualCallbacks);
    }
  }

  function moduleForComponent(name, description, callbacks) {
    createModule(ember_test_helpers.TestModuleForComponent, name, description, callbacks);
  }

  function moduleForModel(name, description, callbacks) {
    createModule(ember_test_helpers.TestModuleForModel, name, description, callbacks);
  }

  function moduleFor(name, description, callbacks) {
    createModule(ember_test_helpers.TestModule, name, description, callbacks);
  }

  exports.test = test['default'];
  exports.setResolver = ember_test_helpers.setResolver;

});
define('frontend-cp/tests/helpers/qunit.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/qunit.js should pass jshint', function() { 
    ok(true, 'helpers/qunit.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/resolver.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/resolver.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/resolver.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/resolver', ['exports', 'frontend-cp/resolver', 'frontend-cp/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('frontend-cp/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/helpers/start-app.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - helpers');
  qunit.test('helpers/start-app.js should pass ESLint', function(assert) {
    assert.ok(true, 'helpers/start-app.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/helpers/start-app', ['exports', 'ember', 'frontend-cp/app', 'frontend-cp/router', 'frontend-cp/config/environment', 'frontend-cp/tests/helpers/login'], function (exports, Ember, Application, Router, config, login) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application = undefined;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('frontend-cp/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/initializers/inflector.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - initializers');
  qunit.test('initializers/inflector.js should pass ESLint', function(assert) {
    assert.ok(true, 'initializers/inflector.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/initializers/inflector.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/inflector.js should pass jshint', function() { 
    ok(true, 'initializers/inflector.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/instance-initializers/session.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - instance-initializers');
  qunit.test('instance-initializers/session.js should pass ESLint', function(assert) {
    assert.ok(true, 'instance-initializers/session.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/instance-initializers/session.jshint', function () {

  'use strict';

  module('JSHint - instance-initializers');
  test('instance-initializers/session.js should pass jshint', function() { 
    ok(true, 'instance-initializers/session.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/locales/new-locale.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - locales');
  qunit.test('locales/new-locale.js should pass ESLint', function(assert) {
    assert.ok(true, 'locales/new-locale.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/locales/new-locale.jshint', function () {

  'use strict';

  module('JSHint - locales');
  test('locales/new-locale.js should pass jshint', function() { 
    ok(true, 'locales/new-locale.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/login/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - login');
  qunit.test('login/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'login/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/login/controller.jshint', function () {

  'use strict';

  module('JSHint - login');
  test('login/controller.js should pass jshint', function() { 
    ok(true, 'login/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/login/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - login');
  qunit.test('login/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'login/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/login/route.jshint', function () {

  'use strict';

  module('JSHint - login');
  test('login/route.js should pass jshint', function() { 
    ok(true, 'login/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mirage/config.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mirage');
  qunit.test('mirage/config.js should pass ESLint', function(assert) {
    assert.ok(true, 'mirage/config.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mirage/config.jshint', function () {

  'use strict';

  module('JSHint - mirage');
  test('mirage/config.js should pass jshint', function() { 
    ok(true, 'mirage/config.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mirage/factories/contact.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mirage/factories');
  qunit.test('mirage/factories/contact.js should pass ESLint', function(assert) {
    assert.ok(true, 'mirage/factories/contact.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mirage/factories/contact.jshint', function () {

  'use strict';

  module('JSHint - mirage/factories');
  test('mirage/factories/contact.js should pass jshint', function() { 
    ok(true, 'mirage/factories/contact.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mirage/fixtures/contacts.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mirage/fixtures');
  qunit.test('mirage/fixtures/contacts.js should pass ESLint', function(assert) {
    assert.ok(true, 'mirage/fixtures/contacts.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mirage/fixtures/contacts.jshint', function () {

  'use strict';

  module('JSHint - mirage/fixtures');
  test('mirage/fixtures/contacts.js should pass jshint', function() { 
    ok(true, 'mirage/fixtures/contacts.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mixins/breadcrumbable.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mixins');
  qunit.test('mixins/breadcrumbable.js should pass ESLint', function(assert) {
    assert.ok(true, 'mixins/breadcrumbable.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mixins/breadcrumbable.jshint', function () {

  'use strict';

  module('JSHint - mixins');
  test('mixins/breadcrumbable.js should pass jshint', function() { 
    ok(true, 'mixins/breadcrumbable.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mixins/drop-down-keyboard-nav.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mixins');
  qunit.test('mixins/drop-down-keyboard-nav.js should pass ESLint', function(assert) {
    assert.ok(true, 'mixins/drop-down-keyboard-nav.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mixins/drop-down-keyboard-nav.jshint', function () {

  'use strict';

  module('JSHint - mixins');
  test('mixins/drop-down-keyboard-nav.js should pass jshint', function() { 
    ok(true, 'mixins/drop-down-keyboard-nav.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mixins/simple-state.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mixins');
  qunit.test('mixins/simple-state.js should pass ESLint', function(assert) {
    assert.ok(true, 'mixins/simple-state.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mixins/simple-state.jshint', function () {

  'use strict';

  module('JSHint - mixins');
  test('mixins/simple-state.js should pass jshint', function() { 
    ok(true, 'mixins/simple-state.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/mixins/suggestions.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - mixins');
  qunit.test('mixins/suggestions.js should pass ESLint', function(assert) {
    assert.ok(true, 'mixins/suggestions.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/mixins/suggestions.jshint', function () {

  'use strict';

  module('JSHint - mixins');
  test('mixins/suggestions.js should pass jshint', function() { 
    ok(true, 'mixins/suggestions.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/access-log.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/access-log.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/access-log.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/access-log.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/access-log.js should pass jshint', function() { 
    ok(true, 'models/access-log.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/account.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/account.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/account.js should pass jshint', function() { 
    ok(true, 'models/account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/app.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/app.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/app.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/app.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/app.js should pass jshint', function() { 
    ok(true, 'models/app.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/attachment.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/attachment.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/attachment.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/attachment.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/attachment.js should pass jshint', function() { 
    ok(true, 'models/attachment.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/avatar.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/avatar.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/avatar.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/avatar.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/avatar.js should pass jshint', function() { 
    ok(true, 'models/avatar.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/brand.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/brand.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/brand.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/brand.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/brand.js should pass jshint', function() { 
    ok(true, 'models/brand.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/business-hour.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/business-hour.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/business-hour.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/business-hour.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/business-hour.js should pass jshint', function() { 
    ok(true, 'models/business-hour.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/case-message.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/case-message.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/case-message.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/case-message.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/case-message.js should pass jshint', function() { 
    ok(true, 'models/case-message.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/case-reply.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/case-reply.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/case-reply.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/case-reply.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/case-reply.js should pass jshint', function() { 
    ok(true, 'models/case-reply.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/case.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/case.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/case.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/case.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/case.js should pass jshint', function() { 
    ok(true, 'models/case.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/channel.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/channel.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/channel.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/channel.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/channel.js should pass jshint', function() { 
    ok(true, 'models/channel.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/contact-address.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/contact-address.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/contact-address.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/contact-address.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/contact-address.js should pass jshint', function() { 
    ok(true, 'models/contact-address.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/contact-website.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/contact-website.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/contact-website.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/contact-website.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/contact-website.js should pass jshint', function() { 
    ok(true, 'models/contact-website.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/custom-field.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/custom-field.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/custom-field.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/custom-field.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/custom-field.js should pass jshint', function() { 
    ok(true, 'models/custom-field.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/event.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/event.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/event.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/event.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/event.js should pass jshint', function() { 
    ok(true, 'models/event.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/facebook-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/facebook-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/facebook-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/facebook-account.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/facebook-account.js should pass jshint', function() { 
    ok(true, 'models/facebook-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/field-option.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/field-option.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/field-option.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/field-option.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/field-option.js should pass jshint', function() { 
    ok(true, 'models/field-option.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-addresses.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-addresses.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-addresses.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-addresses.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-addresses.js should pass jshint', function() { 
    ok(true, 'models/has-addresses.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-email-identities.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-email-identities.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-email-identities.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-email-identities.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-email-identities.js should pass jshint', function() { 
    ok(true, 'models/has-email-identities.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-facebook-identities.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-facebook-identities.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-facebook-identities.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-facebook-identities.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-facebook-identities.js should pass jshint', function() { 
    ok(true, 'models/has-facebook-identities.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-phone-identities.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-phone-identities.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-phone-identities.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-phone-identities.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-phone-identities.js should pass jshint', function() { 
    ok(true, 'models/has-phone-identities.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-slack-identities.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-slack-identities.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-slack-identities.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-slack-identities.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-slack-identities.js should pass jshint', function() { 
    ok(true, 'models/has-slack-identities.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-twitter-identities.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-twitter-identities.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-twitter-identities.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-twitter-identities.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-twitter-identities.js should pass jshint', function() { 
    ok(true, 'models/has-twitter-identities.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/has-websites.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/has-websites.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/has-websites.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/has-websites.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/has-websites.js should pass jshint', function() { 
    ok(true, 'models/has-websites.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/holiday.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/holiday.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/holiday.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/holiday.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/holiday.js should pass jshint', function() { 
    ok(true, 'models/holiday.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-domain.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-domain.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-domain.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-domain.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-domain.js should pass jshint', function() { 
    ok(true, 'models/identity-domain.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-email.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-email.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-email.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-email.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-email.js should pass jshint', function() { 
    ok(true, 'models/identity-email.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-facebook.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-facebook.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-facebook.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-facebook.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-facebook.js should pass jshint', function() { 
    ok(true, 'models/identity-facebook.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-phone.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-phone.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-phone.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-phone.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-phone.js should pass jshint', function() { 
    ok(true, 'models/identity-phone.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-slack.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-slack.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-slack.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-slack.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-slack.js should pass jshint', function() { 
    ok(true, 'models/identity-slack.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity-twitter.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity-twitter.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity-twitter.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity-twitter.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity-twitter.js should pass jshint', function() { 
    ok(true, 'models/identity-twitter.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/identity.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/identity.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/identity.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/identity.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/identity.js should pass jshint', function() { 
    ok(true, 'models/identity.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/language-statistics.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/language-statistics.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/language-statistics.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/language-statistics.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/language-statistics.js should pass jshint', function() { 
    ok(true, 'models/language-statistics.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/language.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/language.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/language.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/language.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/language.js should pass jshint', function() { 
    ok(true, 'models/language.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/locale.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/locale.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/locale.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/locale.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/locale.js should pass jshint', function() { 
    ok(true, 'models/locale.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/location.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/location.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/location.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/location.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/location.js should pass jshint', function() { 
    ok(true, 'models/location.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/mailbox.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/mailbox.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/mailbox.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/mailbox.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/mailbox.js should pass jshint', function() { 
    ok(true, 'models/mailbox.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/note.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/note.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/note.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/note.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/note.js should pass jshint', function() { 
    ok(true, 'models/note.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/organization.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/organization.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/organization.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/organization.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/organization.js should pass jshint', function() { 
    ok(true, 'models/organization.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/person-note.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/person-note.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/person-note.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/person-note.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/person-note.js should pass jshint', function() { 
    ok(true, 'models/person-note.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/person-timeline.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/person-timeline.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/person-timeline.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/person-timeline.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/person-timeline.js should pass jshint', function() { 
    ok(true, 'models/person-timeline.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/person.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/person.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/person.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/person.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/person.js should pass jshint', function() { 
    ok(true, 'models/person.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/priority.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/priority.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/priority.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/priority.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/priority.js should pass jshint', function() { 
    ok(true, 'models/priority.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/role.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/role.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/role.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/role.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/role.js should pass jshint', function() { 
    ok(true, 'models/role.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/slack-identity.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/slack-identity.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/slack-identity.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/slack-identity.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/slack-identity.js should pass jshint', function() { 
    ok(true, 'models/slack-identity.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/status.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/status.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/status.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/status.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/status.js should pass jshint', function() { 
    ok(true, 'models/status.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/string.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/string.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/string.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/string.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/string.js should pass jshint', function() { 
    ok(true, 'models/string.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/tab.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/tab.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/tab.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/tab.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/tab.js should pass jshint', function() { 
    ok(true, 'models/tab.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/tag.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/tag.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/tag.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/tag.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/tag.js should pass jshint', function() { 
    ok(true, 'models/tag.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/team.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/team.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/team.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/team.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/team.js should pass jshint', function() { 
    ok(true, 'models/team.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/thumbnail.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/thumbnail.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/thumbnail.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/thumbnail.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/thumbnail.js should pass jshint', function() { 
    ok(true, 'models/thumbnail.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/twitter-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/twitter-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/twitter-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/twitter-account.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/twitter-account.js should pass jshint', function() { 
    ok(true, 'models/twitter-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/type.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/type.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/type.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/type.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/type.js should pass jshint', function() { 
    ok(true, 'models/type.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/vote.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/vote.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/vote.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/vote.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/vote.js should pass jshint', function() { 
    ok(true, 'models/vote.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/models/zone.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - models');
  qunit.test('models/zone.js should pass ESLint', function(assert) {
    assert.ok(true, 'models/zone.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/models/zone.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/zone.js should pass jshint', function() { 
    ok(true, 'models/zone.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/resolver.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - .');
  qunit.test('resolver.js should pass ESLint', function(assert) {
    assert.ok(true, 'resolver.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/resolver.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('resolver.js should pass jshint', function() { 
    ok(true, 'resolver.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/router.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - .');
  qunit.test('router.js should pass ESLint', function(assert) {
    assert.ok(true, 'router.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/routes/abstract/organisation-route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - routes/abstract');
  qunit.test('routes/abstract/organisation-route.js should pass ESLint', function(assert) {
    assert.ok(true, 'routes/abstract/organisation-route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/routes/abstract/organisation-route.jshint', function () {

  'use strict';

  module('JSHint - routes/abstract');
  test('routes/abstract/organisation-route.js should pass jshint', function() { 
    ok(true, 'routes/abstract/organisation-route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/routes/abstract/tabbed-route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - routes/abstract');
  qunit.test('routes/abstract/tabbed-route.js should pass ESLint', function(assert) {
    assert.ok(true, 'routes/abstract/tabbed-route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/routes/abstract/tabbed-route.jshint', function () {

  'use strict';

  module('JSHint - routes/abstract');
  test('routes/abstract/tabbed-route.js should pass jshint', function() { 
    ok(true, 'routes/abstract/tabbed-route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/routes/abstract/user-route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - routes/abstract');
  qunit.test('routes/abstract/user-route.js should pass ESLint', function(assert) {
    assert.ok(true, 'routes/abstract/user-route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/routes/abstract/user-route.jshint', function () {

  'use strict';

  module('JSHint - routes/abstract');
  test('routes/abstract/user-route.js should pass jshint', function() { 
    ok(true, 'routes/abstract/user-route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/application.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/application.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/application.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/avatar.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/avatar.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/avatar.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/avatar.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/avatar.js should pass jshint', function() { 
    ok(true, 'serializers/avatar.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/case-reply.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/case-reply.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/case-reply.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/case-reply.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/case-reply.js should pass jshint', function() { 
    ok(true, 'serializers/case-reply.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/case.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/case.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/case.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/case.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/case.js should pass jshint', function() { 
    ok(true, 'serializers/case.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/channel.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/channel.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/channel.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/channel.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/channel.js should pass jshint', function() { 
    ok(true, 'serializers/channel.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/custom-field.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/custom-field.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/custom-field.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/custom-field.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/custom-field.js should pass jshint', function() { 
    ok(true, 'serializers/custom-field.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/facebook-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/facebook-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/facebook-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/facebook-account.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/facebook-account.js should pass jshint', function() { 
    ok(true, 'serializers/facebook-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/locale.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/locale.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/locale.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/locale.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/locale.js should pass jshint', function() { 
    ok(true, 'serializers/locale.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/note.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/note.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/note.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/note.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/note.js should pass jshint', function() { 
    ok(true, 'serializers/note.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/organization.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/organization.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/organization.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/organization.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/organization.js should pass jshint', function() { 
    ok(true, 'serializers/organization.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/person-note.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/person-note.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/person-note.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/person-note.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/person-note.js should pass jshint', function() { 
    ok(true, 'serializers/person-note.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/person.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/person.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/person.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/person.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/person.js should pass jshint', function() { 
    ok(true, 'serializers/person.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/status.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/status.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/status.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/status.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/status.js should pass jshint', function() { 
    ok(true, 'serializers/status.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/string.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/string.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/string.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/string.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/string.js should pass jshint', function() { 
    ok(true, 'serializers/string.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/tag.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/tag.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/tag.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/tag.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/tag.js should pass jshint', function() { 
    ok(true, 'serializers/tag.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/thumbnail.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/thumbnail.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/thumbnail.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/thumbnail.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/thumbnail.js should pass jshint', function() { 
    ok(true, 'serializers/thumbnail.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/serializers/twitter-account.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - serializers');
  qunit.test('serializers/twitter-account.js should pass ESLint', function(assert) {
    assert.ok(true, 'serializers/twitter-account.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/serializers/twitter-account.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/twitter-account.js should pass jshint', function() { 
    ok(true, 'serializers/twitter-account.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/context-modal.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/context-modal.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/context-modal.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/context-modal.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/context-modal.js should pass jshint', function() { 
    ok(true, 'services/context-modal.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/local-store.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/local-store.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/local-store.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/local-store.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/local-store.js should pass jshint', function() { 
    ok(true, 'services/local-store.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/scroll.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/scroll.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/scroll.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/scroll.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/scroll.js should pass jshint', function() { 
    ok(true, 'services/scroll.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/session.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/session.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/session.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/session.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/session.js should pass jshint', function() { 
    ok(true, 'services/session.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/tabs.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/tabs.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/tabs.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/tabs.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/tabs.js should pass jshint', function() { 
    ok(true, 'services/tabs.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/services/url.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - services');
  qunit.test('services/url.js should pass ESLint', function(assert) {
    assert.ok(true, 'services/url.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/services/url.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/url.js should pass jshint', function() { 
    ok(true, 'services/url.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/admin/showcase/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/admin/showcase');
  qunit.test('session/admin/showcase/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/admin/showcase/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/admin/showcase/controller.jshint', function () {

  'use strict';

  module('JSHint - session/admin/showcase');
  test('session/admin/showcase/controller.js should pass jshint', function() { 
    ok(true, 'session/admin/showcase/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/admin/showcase/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/admin/showcase');
  qunit.test('session/admin/showcase/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/admin/showcase/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/admin/showcase/route.jshint', function () {

  'use strict';

  module('JSHint - session/admin/showcase');
  test('session/admin/showcase/route.js should pass jshint', function() { 
    ok(true, 'session/admin/showcase/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/case/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/case');
  qunit.test('session/cases/case/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/case/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/case/controller.jshint', function () {

  'use strict';

  module('JSHint - session/cases/case');
  test('session/cases/case/controller.js should pass jshint', function() { 
    ok(true, 'session/cases/case/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/case/index/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/case/index');
  qunit.test('session/cases/case/index/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/case/index/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/case/index/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/case/index');
  test('session/cases/case/index/route.js should pass jshint', function() { 
    ok(true, 'session/cases/case/index/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/case/organisation/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/case/organisation');
  qunit.test('session/cases/case/organisation/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/case/organisation/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/case/organisation/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/case/organisation');
  test('session/cases/case/organisation/route.js should pass jshint', function() { 
    ok(true, 'session/cases/case/organisation/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/case/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/case');
  qunit.test('session/cases/case/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/case/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/case/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/case');
  test('session/cases/case/route.js should pass jshint', function() { 
    ok(true, 'session/cases/case/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/case/user/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/case/user');
  qunit.test('session/cases/case/user/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/case/user/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/case/user/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/case/user');
  test('session/cases/case/user/route.js should pass jshint', function() { 
    ok(true, 'session/cases/case/user/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/index/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/index');
  qunit.test('session/cases/index/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/index/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/index/controller.jshint', function () {

  'use strict';

  module('JSHint - session/cases/index');
  test('session/cases/index/controller.js should pass jshint', function() { 
    ok(true, 'session/cases/index/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/index/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/index');
  qunit.test('session/cases/index/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/index/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/index/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/index');
  test('session/cases/index/route.js should pass jshint', function() { 
    ok(true, 'session/cases/index/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/new/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/new');
  qunit.test('session/cases/new/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/new/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/new/controller.jshint', function () {

  'use strict';

  module('JSHint - session/cases/new');
  test('session/cases/new/controller.js should pass jshint', function() { 
    ok(true, 'session/cases/new/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/cases/new/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/cases/new');
  qunit.test('session/cases/new/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/cases/new/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/cases/new/route.jshint', function () {

  'use strict';

  module('JSHint - session/cases/new');
  test('session/cases/new/route.js should pass jshint', function() { 
    ok(true, 'session/cases/new/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session');
  qunit.test('session/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/controller.jshint', function () {

  'use strict';

  module('JSHint - session');
  test('session/controller.js should pass jshint', function() { 
    ok(true, 'session/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session');
  qunit.test('session/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/route.jshint', function () {

  'use strict';

  module('JSHint - session');
  test('session/route.js should pass jshint', function() { 
    ok(true, 'session/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/showcase/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/showcase');
  qunit.test('session/showcase/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/showcase/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/showcase/controller.jshint', function () {

  'use strict';

  module('JSHint - session/showcase');
  test('session/showcase/controller.js should pass jshint', function() { 
    ok(true, 'session/showcase/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/showcase/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/showcase');
  qunit.test('session/showcase/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/showcase/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/showcase/route.jshint', function () {

  'use strict';

  module('JSHint - session/showcase');
  test('session/showcase/route.js should pass jshint', function() { 
    ok(true, 'session/showcase/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/showcase/view.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/showcase');
  qunit.test('session/showcase/view.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/showcase/view.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/showcase/view.jshint', function () {

  'use strict';

  module('JSHint - session/showcase');
  test('session/showcase/view.js should pass jshint', function() { 
    ok(true, 'session/showcase/view.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/users/index/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/users/index');
  qunit.test('session/users/index/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/users/index/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/users/index/route.jshint', function () {

  'use strict';

  module('JSHint - session/users/index');
  test('session/users/index/route.js should pass jshint', function() { 
    ok(true, 'session/users/index/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/users/user/controller.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/users/user');
  qunit.test('session/users/user/controller.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/users/user/controller.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/users/user/controller.jshint', function () {

  'use strict';

  module('JSHint - session/users/user');
  test('session/users/user/controller.js should pass jshint', function() { 
    ok(true, 'session/users/user/controller.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/users/user/index/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/users/user/index');
  qunit.test('session/users/user/index/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/users/user/index/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/users/user/index/route.jshint', function () {

  'use strict';

  module('JSHint - session/users/user/index');
  test('session/users/user/index/route.js should pass jshint', function() { 
    ok(true, 'session/users/user/index/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/users/user/organisation/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/users/user/organisation');
  qunit.test('session/users/user/organisation/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/users/user/organisation/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/users/user/organisation/route.jshint', function () {

  'use strict';

  module('JSHint - session/users/user/organisation');
  test('session/users/user/organisation/route.js should pass jshint', function() { 
    ok(true, 'session/users/user/organisation/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/users/user/route.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session/users/user');
  qunit.test('session/users/user/route.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/users/user/route.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/users/user/route.jshint', function () {

  'use strict';

  module('JSHint - session/users/user');
  test('session/users/user/route.js should pass jshint', function() { 
    ok(true, 'session/users/user/route.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/session/view.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - session');
  qunit.test('session/view.js should pass ESLint', function(assert) {
    assert.ok(true, 'session/view.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/session/view.jshint', function () {

  'use strict';

  module('JSHint - session');
  test('session/view.js should pass jshint', function() { 
    ok(true, 'session/view.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/test-helper.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - .');
  qunit.test('test-helper.js should pass ESLint', function(assert) {
    assert.ok(true, 'test-helper.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/test-helper', ['frontend-cp/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('frontend-cp/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/adapters/application-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/adapters');
  qunit.test('unit/adapters/application-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/adapters/application-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/adapters/application-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleFor('adapter:application', 'ApplicationAdapter', {});

  // Replace this with your real tests.
  qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('frontend-cp/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/adapters/private-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/adapters');
  qunit.test('unit/adapters/private-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/adapters/private-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/adapters/private-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleFor('adapter:private', 'PrivateAdapter', {});

  // Replace this with your real tests.
  qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('frontend-cp/tests/unit/adapters/private-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/private-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/private-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-address/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-address');
  qunit.test('unit/components/ko-address/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-address/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-address/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-address', 'Unit | Component | ko address', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-address/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-address');
  test('unit/components/ko-address/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-address/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-team/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-admin-card-team');
  qunit.test('unit/components/ko-admin-card-team/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-admin-card-team/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-team/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;

  var people = new Ember['default'].A([{
    avatar: {
      url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
    }
  }, {
    avatar: {
      url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
    }
  }, {
    avatar: {
      url: 'https://s-media-cache-ak0.pinimg.com/736x/ca/c1/18/cac1189a8df5498d17ef09d65ad0f698.jpg'
    }
  }]);

  qunit.moduleForComponent('ko-admin-card-team', {
    needs: ['ko-admin-selectable-card'],
    integration: true,

    setup: function setup() {
      component = this.subject();
    },
    teardown: function teardown() {}
  });

  qunit.test('it correctly calculates number of members', function (assert) {
    component.set('members', people);
    assert.equal(component.get('memberCount'), people.length);
  });

  qunit.test('it doesn\'t pluralize member type if only 1 member is present', function (assert) {
    component.set('members', [people.firstObject]);
    component.set('memberType', 'Agent');

    assert.equal(component.get('pluralizedMemberType'), 'Agent');
  });

  qunit.test('it pluralizes member type if there are 3 members present', function (assert) {
    component.set('members', people);
    component.set('memberType', 'Agent');

    assert.equal(component.get('pluralizedMemberType'), 'Agents');
  });

  qunit.test('it renders a member', function (assert) {
    component.set('members', people);

    this.render();

    assert.equal(component._state, 'inDOM');
    assert.ok(this.$('.ko-avatar__image').length);
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-team/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-admin-card-team');
  test('unit/components/ko-admin-card-team/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-admin-card-team/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-user/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-admin-card-user');
  qunit.test('unit/components/ko-admin-card-user/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-admin-card-user/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-user/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-admin-card-user', 'Unit | Component | ko admin card user', {
    // Specify the other units that are required for this test
    needs: ['component:ko-admin-selectable-card', 'component:ko-avatar']
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('frontend-cp/tests/unit/components/ko-admin-card-user/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-admin-card-user');
  test('unit/components/ko-admin-card-user/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-admin-card-user/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-admin-selectable-card/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-admin-selectable-card');
  qunit.test('unit/components/ko-admin-selectable-card/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-admin-selectable-card/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-admin-selectable-card/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined,
      checkbox = '.ko-checkbox__checkbox';

  qunit.moduleForComponent('ko-admin-selectable-card', {
    needs: ['component:ko-checkbox'],
    integration: true,

    setup: function setup() {
      component = this.subject();
    },
    teardown: function teardown() {}
  });

  qunit.test('toggling isSelected property to true fires selected action', function (assert) {
    assert.expect(1);

    var modelId = 1;

    var targetObject = {
      componentWasSelectedAction: function componentWasSelectedAction(id) {
        assert.equal(id, modelId);
      }
    };

    Ember['default'].run(function () {
      component.set('selectableModelId', modelId);
      component.set('onComponentWasSelectedAction', 'componentWasSelectedAction');
      component.set('targetObject', targetObject);
      component.set('isSelected', true);
    });
  });

  qunit.test('toggling isSelected property to true fires selected action', function (assert) {
    assert.expect(1);

    var modelId = 2;

    var targetObject = {
      componentWasDeselectedAction: function componentWasDeselectedAction(id) {
        assert.equal(id, modelId);
      }
    };

    Ember['default'].run(function () {
      component.set('selectableModelId', modelId);
      component.set('onComponentWasDeselectedAction', 'componentWasDeselectedAction');
      component.set('targetObject', targetObject);
      component.set('isSelected', true);
      component.set('isSelected', false);
    });
  });

  qunit.test('toggling checkbox fires action', function (assert) {
    assert.expect(1);

    var modelId = 1;

    var targetObject = {
      componentWasSelectedAction: function componentWasSelectedAction(id) {
        assert.equal(id, modelId);
      }
    };

    this.render();

    Ember['default'].run(function () {
      component.set('selectableModelId', modelId);
      component.set('onComponentWasSelectedAction', 'componentWasSelectedAction');
      component.set('targetObject', targetObject);
    });

    this.$(checkbox).click();
  });

  qunit.test('setting inactive state adds class', function (assert) {
    Ember['default'].run(function () {
      component.set('isActive', false);
    });

    this.render();
    assert.ok(this.$().hasClass('ko-admin-selectable-card--inactive'));
  });

});
define('frontend-cp/tests/unit/components/ko-admin-selectable-card/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-admin-selectable-card');
  test('unit/components/ko-admin-selectable-card/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-admin-selectable-card/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-agent-dropdown/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-agent-dropdown');
  qunit.test('unit/components/ko-agent-dropdown/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-agent-dropdown/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-agent-dropdown/component-test', ['frontend-cp/tests/helpers/qunit', 'ember'], function (qunit, Ember) {

  'use strict';

  var downArrow = 40;
  var enter = 13;

  qunit.moduleForComponent('ko-agent-dropdown', 'Unit | Component | ko agent dropdown', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  qunit.test('the dropdown can be expanded by mouse', function (assert) {
    assert.expect(2);

    var component = this.subject();

    component.set('navItems', [{ text: 'ham' }]);

    this.$('.nav-new').click();

    assert.equal(component.get('showDropdown'), true, 'dropdown menu is expanded');
    assert.equal($.trim(component.$('ul li:first:visible').text()), 'ham', 'the first menu item');
  });

  qunit.test('an item can be selected by mouse', function (assert) {
    assert.expect(2);

    var component = this.subject();

    component.set('navItems', [{ text: 'ham' }]);

    this.$().click(function () {
      assert.ok(true);
      assert.equal(component.get('showDropdown'), false, 'dropdown menu is collapsed');
    });

    this.$('.nav-new').click();
    this.$('.nav-new li a:first').click();
  });

  qunit.test('the dropdown can be expanded by keyboard', function (assert) {
    assert.expect(2);

    var component = this.subject();

    component.set('navItems', [{ text: 'ham' }]);

    Ember['default'].run(function () {
      component.focusIn();
    });

    this.$().trigger(new $.Event('keydown', { keyCode: downArrow }));

    assert.equal(component.get('showDropdown'), true, 'dropdown menu is expanded');
    assert.equal($.trim(component.$('ul li:first:visible').text()), 'ham', 'the first menu item');
  });

  qunit.test('an item can be selected by keyboard', function (assert) {
    assert.expect(2);

    var component = this.subject();

    component.set('navItems', [{ text: 'ham' }]);

    this.$().click(function () {
      assert.ok(true);
    });

    Ember['default'].run(function () {
      component.focusIn();
    });

    this.$().trigger(new $.Event('keydown', { keyCode: downArrow }));
    this.$().trigger(new $.Event('keydown', { keyCode: enter }));

    assert.equal(component.get('showDropdown'), false, 'dropdown menu is collapsed');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-agent-dropdown/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-agent-dropdown');
  test('unit/components/ko-agent-dropdown/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-agent-dropdown/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-avatar/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-avatar');
  qunit.test('unit/components/ko-avatar/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-avatar/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-avatar/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-avatar', 'Unit | Component | ko avatar', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-avatar/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-avatar');
  test('unit/components/ko-avatar/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-avatar/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-case-checkbox-field/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-case-checkbox-field');
  qunit.test('unit/components/ko-case-checkbox-field/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-case-checkbox-field/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-case-checkbox-field/component-test', function () {

	'use strict';

	// import Ember from 'ember';
	// import {
	//   moduleForComponent,
	//   test
	// } from 'frontend-cp/tests/helpers/qunit';
	//
	// moduleForComponent('ko-case-checkbox-field', {
	//   needs: []
	// });
	//
	// let checkboxes = [
	//     { id: 1, label: 'Red' },
	//     { id: 2, label: 'Green', checked: true },
	//     { id: 3, label: 'Blue' }
	// ];
	//
	// test('it renders', function(assert) {
	//   assert.expect(2);
	//
	//   // Creates the component instance
	//   let component = this.subject();
	//   assert.equal(component._state, 'preRender');
	//
	//   // Renders the component to the page
	//   this.render();
	//   assert.equal(component._state, 'inDOM');
	// });
	//
	// test('it has a title', function (assert) {
	//   assert.expect(2);
	//
	//   let component = this.subject();
	//
	//   assert.equal($.trim(this.$().text()), '');
	//
	//   let title = 'Title Goes Here';
	//   Ember.run(() => {
	//     component.set('title', title);
	//   });
	//
	//   assert.equal($.trim(this.$('.info-bar-item__header').text()), title);
	// });
	//
	// test('it has checkboxes', function (assert) {
	//   let component = this.subject();
	//
	//   Ember.run(() => {
	//     component.set('content', checkboxes);
	//   });
	//
	//   assert.equal($.trim(this.$('div:nth-of-type(1) label').text().trim()), checkboxes[0].label);
	//   assert.equal($.trim(this.$('div:nth-of-type(2) label').text().trim()), checkboxes[1].label);
	//   assert.equal($.trim(this.$('div:nth-of-type(3) label').text().trim()), checkboxes[2].label);
	// });
	//
	// test('checkbox state is in sync with the data', function (assert) {
	//   let component = this.subject();
	//
	//   Ember.run(() => {
	//     component.set('content', checkboxes);
	//   });
	//
	//   assert.equal(this.$('div:nth-of-type(1) input').is(':checked'), false);
	//   assert.equal(this.$('div:nth-of-type(2) input').is(':checked'), true);
	//   assert.equal(this.$('div:nth-of-type(3) input').is(':checked'), false);
	//
	//   Ember.run(() => {
	//     this.$('div:nth-of-type(1) input').click();
	//   });
	//
	//   assert.equal(component.get('content')[0].checked, true);
	// });

});
define('frontend-cp/tests/unit/components/ko-case-checkbox-field/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-case-checkbox-field');
  test('unit/components/ko-case-checkbox-field/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-case-checkbox-field/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-case-metric/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-case-metric');
  qunit.test('unit/components/ko-case-metric/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-case-metric/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-case-metric/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-case-metric', 'Unit | Component | ko case metric', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-case-metric/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-case-metric');
  test('unit/components/ko-case-metric/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-case-metric/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-case-select-field/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-case-select-field');
  qunit.test('unit/components/ko-case-select-field/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-case-select-field/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-case-select-field/component-test', function () {

	'use strict';

	// import Ember from 'ember';
	// import {
	//   moduleForComponent,
	//   test
	// } from 'frontend-cp/tests/helpers/qunit';
	//
	// moduleForComponent('ko-case-select-field', {
	//   needs: []
	// });
	//
	// let dummyContent = [
	//       'Open',
	//       'Pending',
	//       'Closed'
	//     ];
	//
	// let dummyContentObject = [
	//       { id: 1, label: 'Open' },
	//       { id: 2, label: 'Pending' },
	//       { id: 3, label: 'Closed' }
	//     ];
	//
	// test('it renders', function(assert) {
	//   assert.expect(2);
	//
	//   // Creates the component instance
	//   let component = this.subject();
	//   assert.equal(component._state, 'preRender');
	//
	//   // Renders the component to the page
	//   this.render();
	//   assert.equal(component._state, 'inDOM');
	// });
	//
	// test('it has a title', function(assert) {
	//   assert.expect(2);
	//
	//   let component = this.subject();
	//
	//   assert.equal($.trim(this.$().text()), '');
	//
	//   Ember.run(function() {
	//     component.set('title', 'Title Goes Here');
	//   });
	//
	//   assert.equal($.trim(this.$().text()), 'Title Goes Here');
	// });
	//
	// test('content appears in the dropdown', function(assert) {
	//   assert.expect(1);
	//
	//   let component = this.subject();
	//
	//   Ember.run(function() {
	//     component.set('content', dummyContent);
	//   });
	//
	//   this.$().find('li').click();
	//
	//   assert.equal(this.$('ul li').text().replace(/(\r\n|\n|\r| )/g, ''), 'OpenPendingClosed');
	// });
	//
	// test('clicking on a content item triggers value change', function(assert) {
	//   assert.expect(3);
	//
	//   let component = this.subject();
	//
	//   Ember.run(function() {
	//     component.set('content', dummyContent);
	//   });
	//
	//   component.set('action', 'change');
	//   component.set('targetObject', {
	//     change(value) {
	//       assert.equal(value, undefined);
	//     }
	//   });
	//
	//   assert.equal(component.get('value'), undefined);
	//
	//   Ember.run(() => {
	//     this.$('li').click();
	//     this.$('ul li:first').click();
	//   });
	//
	//   Ember.run(function() {
	//     assert.equal(component.get('value'), 'Open');
	//   });
	// });
	//
	// test('pressing enter on a content item changes the value', function(assert) {
	//   assert.expect(1);
	//
	//   let component = this.subject();
	//
	//   Ember.run(function() {
	//     component.set('content', dummyContent);
	//   });
	//
	//   component.set('action', 'change');
	//   component.set('targetObject', {
	//     change(value) {
	//       assert.equal(value, 'Open');
	//     }
	//   });
	//
	//   Ember.run(() => {
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 9 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 40 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 13 }));
	//   });
	// });
	//
	// test('when repeatedly selecting content items using the keyboard the selection should always start from the first position', function(assert) {
	//   assert.expect(2);
	//
	//   let component = this.subject();
	//
	//   Ember.run(function() {
	//     component.set('content', dummyContent);
	//   });
	//
	//   component.set('action', 'change');
	//   component.set('targetObject', {
	//     change(value) {
	//       assert.equal(value, 'Closed');
	//     }
	//   });
	//
	//   Ember.run(() => {
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 9 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 40 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 40 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 40 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 13 }));
	//   });
	//
	//   component.set('targetObject', {
	//     change(value) {
	//       assert.equal(value, 'Open');
	//     }
	//   });
	//
	//   Ember.run(() => {
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 40 }));
	//     this.$('li').trigger(new $.Event('keydown', { keyCode: 13 }));
	//   });
	// });

});
define('frontend-cp/tests/unit/components/ko-case-select-field/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-case-select-field');
  test('unit/components/ko-case-select-field/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-case-select-field/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-case-tags-field/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-case-tags-field');
  qunit.test('unit/components/ko-case-tags-field/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-case-tags-field/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-case-tags-field/component-test', ['ember', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/initializers/ember-intl'], function (Ember, qunit, ember_intl) {

  'use strict';

  var component = undefined;
  var title = 'span:first';
  var firstSelectedTag = 'ul:first li:first';
  var secondSelectedTag = 'ul:first li:nth-child(2)';
  var firstSelectedTagText = 'ul:first li:first span:first';
  var deleteTag = 'span:nth-child(2)';
  var suggestionsList = 'ul:nth-child(3) li';
  var firstSuggestion = 'ul:nth-child(3) li:first';
  var newTag = 'ul:nth-child(3) li:last span';
  var searchField = 'ul:first li input';
  var upArrow = 38;
  var downArrow = 40;
  var enter = 13;
  var backspace = 8;
  var tab = 9;
  var d = 68;
  var g = 71;
  var w = 87;
  var y = 89;

  qunit.moduleForComponent('ko-case-tags-field', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
    setup: function setup() {
      component = this.subject();
      component.set('selectedTags', new Ember['default'].A([]));
      component.set('tags', ['dog', 'pig', 'moose', 'duck', 'donkey', 'dave', 'don', 'derek']);
    },
    teardown: function teardown() {}
  });

  qunit.test('is suggested', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.set('tags', ['dog']);
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal(component.get('isSuggested'), true);
  });

  qunit.test('is not suggested when there are no tags', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.set('tags', []);
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal(component.get('isSuggested'), false);
  });

  qunit.test('is not suggested when nothing has been typed', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.set('tags', ['dog']);
      component.set('searchTerm', '');
    });

    assert.equal(component.get('isSuggested'), false);
  });

  qunit.test('is selected', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.set('selectedTags', new Ember['default'].A(['dog']));
      component.set('tags', ['dog']);
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal(component.get('isSelected'), true);
  });

  qunit.test('is not selected', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.set('selectedTags', new Ember['default'].A([]));
      component.set('tags', ['dog']);
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal(component.get('isSelected'), false);
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  qunit.test('title can be set', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('title', 'Tags');
    });

    assert.equal(this.$(title).text(), 'Tags', 'title');
  });

  qunit.test('after a selection has taken place the text in the input should be cleared', function (assert) {
    assert.expect(3);

    this.render();

    Ember['default'].run(function () {
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal(this.$(firstSuggestion).text(), 'dog', 'suggestions list');

    this.$(firstSuggestion).click();

    assert.equal($.trim(component.$(firstSelectedTagText).text()), 'dog', 'The tag has been selected');
    assert.equal($.trim(component.$(searchField).val()), '', 'The search field has been cleared');
  });

  qunit.test('selected tags should not appear in suggestions', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('selectedTags', new Ember['default'].A(['dog']));
      component.set('tags', ['dog', 'duck']);
      component.set('searchTerm', 'd');
      component.keyUp({ keyCode: d });
    });

    assert.equal(this.$(suggestionsList).text(), 'duckdMESSAGE %%cases.newtag%%', 'suggestions list');
  });

  qunit.test('suggested tags should be able to be selected by mouse', function (assert) {
    assert.expect(4);

    this.render();

    var targetObject = {
      externalAction: function externalAction(tags) {
        assert.deepEqual(tags, new Ember['default'].A(['dog']), 'external action was called');
      }
    };

    component.set('onTagSelectionChange', 'externalAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    assert.equal($.trim(this.$(firstSelectedTagText).text()), '', 'selected tags');
    assert.equal(this.$(firstSuggestion).text(), 'dog', 'suggested list');

    this.$(firstSuggestion).click();

    assert.equal($.trim(this.$(firstSelectedTagText).text()), 'dog', 'selected tags');
  });

  qunit.test('selected tags should be able to be removed by mouse', function (assert) {
    assert.expect(3);

    this.render();

    var targetObject = {
      externalAction: function externalAction(tags) {
        assert.deepEqual(tags, new Ember['default'].A([]), 'external action was called');
      }
    };

    component.set('onTagSelectionChange', 'externalAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('selectedTags', new Ember['default'].A(['dog']));
    });

    assert.equal($.trim(component.$(firstSelectedTagText).text()), 'dog', 'selected tags');

    this.$(firstSelectedTag + ' ' + deleteTag).click();

    assert.equal($.trim(component.$(firstSelectedTagText).text()), '', 'selected tags');
  });

  qunit.test('new tags can be created and added by mouse', function (assert) {
    assert.expect(4);

    this.render();

    var targetObject = {
      externalTagSelectionChangeAction: function externalTagSelectionChangeAction(tags) {
        assert.deepEqual(tags, new Ember['default'].A(['new']), 'external tag selection change action was called');
      },

      externalTagAdditionAction: function externalTagAdditionAction(tag) {
        assert.deepEqual(tag, 'new', 'external tag addition action was called');
      }
    };

    component.set('onTagAddition', 'externalTagAdditionAction');
    component.set('onTagSelectionChange', 'externalTagSelectionChangeAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('searchTerm', 'new');
      component.keyUp({ keyCode: w });
    });

    assert.equal($.trim(component.$(firstSelectedTagText).text()), '', 'selected tags');

    this.$(newTag).click();

    assert.equal($.trim(component.$(firstSelectedTagText).text()), 'new', 'selected tags');
  });

  qunit.test('all suggested tags should be visible when tabing in by keyboard', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.focusIn({ target: component.$(searchField) });
    });

    this.$().trigger(new $.Event('keydown', { keyCode: downArrow }));

    assert.equal(this.$(suggestionsList).text(), 'dogpigmooseduckdonkeydavedonderek', 'suggestions list');
  });

  qunit.test('suggested tags should be able to be selected by keyboard', function (assert) {
    assert.expect(1);

    this.render();

    var targetObject = {
      externalTagSelectionChangeAction: function externalTagSelectionChangeAction(tags) {
        assert.deepEqual(tags, new Ember['default'].A(['dog']), 'external tag selection change action was called');
      }
    };

    component.set('onTagSelectionChange', 'externalTagSelectionChangeAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('searchTerm', 'dog');
      component.keyUp({ keyCode: g });
    });

    component.keyDown({ keyCode: downArrow });

    Ember['default'].run(function () {
      component.keyDown({ keyCode: enter });
    });
  });

  qunit.test('selected tags should be able to be removed by keyboard', function (assert) {
    assert.expect(1);

    this.render();

    var targetObject = {
      externalTagSelectionChangeAction: function externalTagSelectionChangeAction(tags) {
        assert.deepEqual(tags, new Ember['default'].A(['dog', 'mouse']), 'external tag selection change action was called');
      }
    };

    component.set('onTagSelectionChange', 'externalTagSelectionChangeAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('selectedTags', new Ember['default'].A(['dog', 'cat', 'mouse']));
    });

    Ember['default'].run(function () {
      component.focusIn({ target: component.$(secondSelectedTag) });
      component.keyDown({ keyCode: backspace });
    });
  });

  qunit.test('new tags can be created and added by keyboard', function (assert) {
    assert.expect(1);

    this.render();

    var targetObject = {
      externalTagAdditionAction: function externalTagAdditionAction(tags) {
        assert.deepEqual(tags, 'qwerty', 'external tag addition action was called');
      }
    };

    component.set('onTagAddition', 'externalTagAdditionAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('tags', '');
      component.set('searchTerm', 'qwerty');
      component.keyUp({ keyCode: y });
    });

    component.keyDown({ keyCode: downArrow });
    Ember['default'].run(function () {
      component.keyDown({ keyCode: enter });
    });
  });

  qunit.test('new tags can be created and added by enter press on keyboard', function (assert) {
    assert.expect(1);

    this.render();

    var targetObject = {
      externalTagAdditionAction: function externalTagAdditionAction(tags) {
        assert.deepEqual(tags, 'qwerty', 'external tag addition action was called');
      }
    };

    component.set('onTagAddition', 'externalTagAdditionAction');
    component.set('targetObject', targetObject);

    Ember['default'].run(function () {
      component.set('tags', '');
      component.set('searchTerm', 'qwerty');
      component.keyUp({ keyCode: y });
      component.keyDown({ keyCode: enter });
    });
  });

  qunit.test('make sure suggestions are recalculated after selection by keyboard', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('searchTerm', 'd');
      component.keyUp({ keyCode: d });
    });

    component.keyDown({ keyCode: downArrow });

    Ember['default'].run(function () {
      component.keyDown({ keyCode: enter });
    });

    assert.equal(this.$(suggestionsList).text(), 'pigmooseduckdonkeydavedonderek', 'suggestions list');
  });

});
define('frontend-cp/tests/unit/components/ko-case-tags-field/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-case-tags-field');
  test('unit/components/ko-case-tags-field/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-case-tags-field/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-checkbox/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-checkbox');
  qunit.test('unit/components/ko-checkbox/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-checkbox/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-checkbox/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;
  var space = 32;
  var enter = 13;
  var tab = 9;
  var checkbox = 'div:first';
  var label = 'label:first';

  qunit.moduleForComponent('ko-checkbox', {
    setup: function setup() {
      component = this.subject();
      component.set('label', 'Remember my preferences');
      component.set('tabindex', 0);
    },
    teardown: function teardown() {}
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    this.render();
    assert.equal(component._state, 'inDOM');
  });

  qunit.test('can be checked by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  qunit.test('can be unchecked by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('checked', true);
    });

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  qunit.test('can be checked by clicking on checkbox', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this.$(checkbox).click();
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  qunit.test('can be unchecked by clicking on checkbox', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('checked', true);
    });

    Ember['default'].run(function () {
      _this2.$(checkbox).click();
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  qunit.test('can be checked by clicking on label', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this3.$(label).click();
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  qunit.test('can be unchecked by clicking on label', function (assert) {
    var _this4 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('checked', true);
    });

    Ember['default'].run(function () {
      _this4.$(label).click();
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  qunit.test('when disabled checkbox cant be checked', function (assert) {
    var _this5 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('disabled', true);
    });

    Ember['default'].run(function () {
      _this5.$(checkbox).click();
    });

    assert.equal(component.checked, false, 'checkbox cant be checked');
  });

});
define('frontend-cp/tests/unit/components/ko-checkbox/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-checkbox');
  test('unit/components/ko-checkbox/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-checkbox/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-contact-info/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-contact-info');
  qunit.test('unit/components/ko-contact-info/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-contact-info/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-contact-info/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-contact-info', 'Unit | Component | ko contact info', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-contact-info/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-contact-info');
  test('unit/components/ko-contact-info/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-contact-info/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-datepicker/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-datepicker');
  qunit.test('unit/components/ko-datepicker/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-datepicker/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-datepicker/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-datepicker', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-datepicker/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-datepicker');
  test('unit/components/ko-datepicker/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-datepicker/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-draggable-dropzone/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-draggable-dropzone');
  qunit.test('unit/components/ko-draggable-dropzone/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-draggable-dropzone/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-draggable-dropzone/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;

  var dropzone = '.ko-draggable-dropzone__container';
  var filesMock = [{ name: 'Adam.png', type: 'image/png' }, { name: 'Peter.png', type: 'image/png' }];

  var eventMock = document.createEvent('CustomEvent');
  eventMock.initCustomEvent('drop', true, true, null);
  eventMock.dataTransfer = { data: {}, files: filesMock };

  var space = 32;
  var enter = 13;
  var tab = 9;
  var d = 68;
  var g = 71;
  var w = 87;
  var y = 89;

  qunit.moduleForComponent('ko-draggable-dropzone', {
    setup: function setup() {
      component = this.subject();
    },
    teardown: function teardown() {}
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    this.render();

    assert.equal(component._state, 'inDOM');
  });

  qunit.test('it has total size of 0 by default', function (assert) {
    assert.expect(1);

    this.render();

    assert.equal(component.totalSize, 0, 'has total size of 0');
  });

  qunit.test('it has drag counter of 0 by default', function (assert) {
    assert.expect(1);

    this.render();

    assert.equal(component.dragCounter, 0, 'drag counter is zero');
  });

  qunit.test('it can drop files', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {});

    assert.equal(component.dragClass, false, 'drag and drop is over');
  });

  qunit.test('dragging in increments drag counter', function (assert) {
    assert.expect(1);

    Ember['default'].run(function () {
      component.dragEnter(eventMock);
    });

    assert.equal(component.dragCounter, 1, 'drag counter got incremented');
  });

  qunit.test('dragging out decrements drag counter', function (assert) {
    assert.expect(2);

    Ember['default'].run(function () {
      component.dragEnter(eventMock);
    });

    assert.equal(component.dragCounter, 1, 'drag counted got incremented');

    Ember['default'].run(function () {
      component.dragLeave(eventMock);
    });

    assert.equal(component.dragCounter, 0, 'drag counter got decremented');
  });

  // TODO: neither of the two below work yet

  // component.drop(this.$(dropzone).trigger(new $.Event('drop', { dataTransfer: { files: filesMock } })));
  // component.drop(eventMock);

});
define('frontend-cp/tests/unit/components/ko-draggable-dropzone/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-draggable-dropzone');
  test('unit/components/ko-draggable-dropzone/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-draggable-dropzone/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-editable-text/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-editable-text');
  qunit.test('unit/components/ko-editable-text/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-editable-text/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-editable-text/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;
  var space = 32;
  var enter = 13;
  var tab = 9;
  var d = 68;
  var g = 71;
  var w = 87;
  var y = 89;
  var edit = 'div:first';
  var input = 'input';

  qunit.moduleForComponent('ko-editable-text', {
    setup: function setup() {
      component = this.subject();
      component.set('value', 'I am a hunky munky');
    },
    teardown: function teardown() {}
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    this.render();

    assert.equal(component._state, 'inDOM');
  });

  qunit.test('is not editing by default', function (assert) {
    assert.expect(1);

    assert.equal(component.isEditing, false, 'is not editing by default');
  });

  qunit.test('when clicked/on focus it becomes editable', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this.$(edit).click();
    });

    assert.equal(component.isEditing, true, 'is editable');
  });

  qunit.test('when focused out it becomes not editable', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this2.$(edit).click();
    });

    Ember['default'].run(function () {
      component.focusOut();
    });

    assert.equal(component.isEditing, false, 'is not editable');
  });

  qunit.test('focus out cancels editing changes', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this3.$(edit).click();
    });

    Ember['default'].run(function () {
      component.set('value', 'I am a hunky munkyy');
    });

    Ember['default'].run(function () {
      component.focusOut();
    });

    assert.equal(component.valueToSave, 'I am a hunky munky', 'value stays the same');
  });

  qunit.test('pressing enter saves editing changes', function (assert) {
    var _this4 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this4.$(edit).click();
    });

    Ember['default'].run(function () {
      component.set('valueToSave', 'I am a hunky munkyy bla bla');
    });

    Ember['default'].run(function () {
      component.send('editComplete');
    });

    assert.equal(component.valueToSave, 'I am a hunky munkyy bla bla', 'value stays the same');
  });

});
define('frontend-cp/tests/unit/components/ko-editable-text/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-editable-text');
  test('unit/components/ko-editable-text/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-editable-text/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-feedback/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-feedback');
  qunit.test('unit/components/ko-feedback/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-feedback/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-feedback/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-feedback', 'Unit | Component | ko feedback', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-feedback/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-feedback');
  test('unit/components/ko-feedback/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-feedback/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-file-field/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-file-field');
  qunit.test('unit/components/ko-file-field/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-file-field/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-file-field/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-file-field', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-file-field/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-file-field');
  test('unit/components/ko-file-field/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-file-field/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-file-size/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-file-size');
  qunit.test('unit/components/ko-file-size/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-file-size/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-file-size/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-file-size', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-file-size/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-file-size');
  test('unit/components/ko-file-size/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-file-size/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-info-bar/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-info-bar');
  qunit.test('unit/components/ko-info-bar/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-info-bar/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-info-bar/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-info-bar', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-info-bar/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-info-bar');
  test('unit/components/ko-info-bar/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-info-bar/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-pagination/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-pagination');
  qunit.test('unit/components/ko-pagination/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-pagination/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-pagination/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-pagination', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-pagination/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-pagination');
  test('unit/components/ko-pagination/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-pagination/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-radio/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-radio');
  qunit.test('unit/components/ko-radio/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-radio/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-radio/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;
  var space = 32;
  var enter = 13;
  var tab = 9;
  var radio = 'div:first';
  var label = 'label:first';

  qunit.moduleForComponent('ko-radio', {
    setup: function setup() {
      component = this.subject();
      component.set('label', 'You can do this!');
      component.set('tabindex', 0);
    },
    teardown: function teardown() {}
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    this.render();
    assert.equal(component._state, 'inDOM');
  });

  qunit.test('can be selected by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.selected, true, 'it has been selected');
  });

  qunit.test('can be unselected by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('selected', true);
    });

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.selected, false, 'it has been unselected');
  });

  qunit.test('can be selected by clicking on radio', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this.$(radio).click();
    });

    assert.equal(component.selected, true, 'it has been selected');
  });

  qunit.test('can be unselected by clicking on radio', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('selected', true);
    });

    Ember['default'].run(function () {
      _this2.$(radio).click();
    });

    assert.equal(component.selected, false, 'it has been unselected');
  });

  qunit.test('can be selected by clicking on label', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this3.$(label).click();
    });

    assert.equal(component.selected, true, 'it has been selected');
  });

  qunit.test('can be unselected by clicking on label', function (assert) {
    var _this4 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('selected', true);
    });

    Ember['default'].run(function () {
      _this4.$(label).click();
    });

    assert.equal(component.selected, false, 'it has been unselected');
  });

  qunit.test('when disabled radio cant be selected', function (assert) {
    var _this5 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('disabled', true);
    });

    Ember['default'].run(function () {
      _this5.$(radio).click();
    });

    assert.equal(component.selected, false, 'radio cant be selected');
  });

});
define('frontend-cp/tests/unit/components/ko-radio/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-radio');
  test('unit/components/ko-radio/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-radio/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-recent-cases/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-recent-cases');
  qunit.test('unit/components/ko-recent-cases/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-recent-cases/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-recent-cases/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-recent-cases', 'Unit | Component | ko recent cases', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-recent-cases/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-recent-cases');
  test('unit/components/ko-recent-cases/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-recent-cases/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-recent-members/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-recent-members');
  qunit.test('unit/components/ko-recent-members/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-recent-members/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-recent-members/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-recent-members', 'Unit | Component | ko recent members', {});

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('frontend-cp/tests/unit/components/ko-recent-members/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-recent-members');
  test('unit/components/ko-recent-members/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-recent-members/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-text-editor/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-text-editor');
  qunit.test('unit/components/ko-text-editor/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-text-editor/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-text-editor/component-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForComponent('ko-text-editor', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
    needs: ['component:ko-file-field', 'component:ko-draggable-dropzone']
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('frontend-cp/tests/unit/components/ko-text-editor/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-text-editor');
  test('unit/components/ko-text-editor/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-text-editor/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/components/ko-toggle/component-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/components/ko-toggle');
  qunit.test('unit/components/ko-toggle/component-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/components/ko-toggle/component-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/components/ko-toggle/component-test', ['ember', 'frontend-cp/tests/helpers/qunit'], function (Ember, qunit) {

  'use strict';

  var component = undefined;
  var space = 32;
  var enter = 13;
  var tab = 9;
  var radio = 'div:first';
  var label = 'label:first';

  qunit.moduleForComponent('ko-toggle', {
    setup: function setup() {
      component = this.subject();
      component.set('label', 'Nuclear bomb switch');
      component.set('tabindex', 0);
    },
    teardown: function teardown() {}
  });

  qunit.test('it renders', function (assert) {
    assert.expect(2);

    assert.equal(component._state, 'preRender');

    this.render();
    assert.equal(component._state, 'inDOM');
  });

  qunit.test('can be activated by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.activated, true, 'it has been activated');
  });

  qunit.test('can be deactivated by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('activated', true);
    });

    Ember['default'].run(function () {
      component.keyUp({ keyCode: space });
    });

    assert.equal(component.activated, false, 'it has been deactivated');
  });

  qunit.test('can be activated by clicking on radio', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this.$(radio).click();
    });

    assert.equal(component.activated, true, 'it has been activated');
  });

  qunit.test('can be deactivated by clicking on radio', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('activated', true);
    });

    Ember['default'].run(function () {
      _this2.$(radio).click();
    });

    assert.equal(component.activated, false, 'it has been deactivated');
  });

  qunit.test('can be activated by clicking on label', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      _this3.$(label).click();
    });

    assert.equal(component.activated, true, 'it has been activated');
  });

  qunit.test('can be deactivated by clicking on label', function (assert) {
    var _this4 = this;

    assert.expect(1);

    this.render();

    Ember['default'].run(function () {
      component.set('activated', true);
    });

    Ember['default'].run(function () {
      _this4.$(label).click();
    });

    assert.equal(component.activated, false, 'it has been deactivated');
  });

});
define('frontend-cp/tests/unit/components/ko-toggle/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components/ko-toggle');
  test('unit/components/ko-toggle/component-test.js should pass jshint', function() { 
    ok(true, 'unit/components/ko-toggle/component-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/mixins/drop-down-keyboard-nav-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/mixins');
  qunit.test('unit/mixins/drop-down-keyboard-nav-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/mixins/drop-down-keyboard-nav-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/mixins/drop-down-keyboard-nav-test', ['ember', 'frontend-cp/mixins/drop-down-keyboard-nav', 'qunit'], function (Ember, DropDownKeyboardNavMixin, qunit) {

  'use strict';

  qunit.module('DropDownKeyboardNavMixin');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var DropDownKeyboardNavObject = Ember['default'].Object.extend(DropDownKeyboardNavMixin['default']);
    var subject = DropDownKeyboardNavObject.create();
    assert.ok(subject);
  });

});
define('frontend-cp/tests/unit/mixins/drop-down-keyboard-nav-test.jshint', function () {

  'use strict';

  module('JSHint - unit/mixins');
  test('unit/mixins/drop-down-keyboard-nav-test.js should pass jshint', function() { 
    ok(true, 'unit/mixins/drop-down-keyboard-nav-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/mixins/simple-state-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/mixins');
  qunit.test('unit/mixins/simple-state-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/mixins/simple-state-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/mixins/simple-state-test', ['ember', 'frontend-cp/mixins/simple-state', 'qunit'], function (Ember, SimpleStateMixin, qunit) {

  'use strict';

  qunit.module('SimpleStateMixin');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var SimpleStateObject = Ember['default'].Object.extend(SimpleStateMixin['default']);
    var subject = SimpleStateObject.create();
    assert.ok(subject);
  });

});
define('frontend-cp/tests/unit/mixins/simple-state-test.jshint', function () {

  'use strict';

  module('JSHint - unit/mixins');
  test('unit/mixins/simple-state-test.js should pass jshint', function() { 
    ok(true, 'unit/mixins/simple-state-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/mixins/suggestions-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/mixins');
  qunit.test('unit/mixins/suggestions-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/mixins/suggestions-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/mixins/suggestions-test', ['ember', 'frontend-cp/mixins/suggestions', 'qunit'], function (Ember, SuggestionsMixin, qunit) {

  'use strict';

  var SuggestionsObject = undefined;
  var subject = undefined;
  var source = undefined;

  qunit.module('SuggestionsMixin', {
    setup: function setup() {
      SuggestionsObject = Ember['default'].Object.extend(SuggestionsMixin['default']);
      subject = SuggestionsObject.create();
      source = new Ember['default'].A(['pig', 'dog', 'chicken']);
    }
  });

  qunit.test('searching for a unique string in the source returns only that string', function (assert) {
    assert.expect(1);

    var results = subject.matches('dog', source);

    assert.equal(results, 'dog');
  });

  qunit.test('searching for a single character in the source returns any string that contains that character', function (assert) {
    assert.expect(1);

    var results = subject.matches('i', source);

    assert.equal(results, 'pig,chicken');
  });

  qunit.test('can handle empty source', function (assert) {
    assert.expect(1);

    source = new Ember['default'].A();

    var results = subject.matches('i', source);

    assert.equal(results, '');
  });

});
define('frontend-cp/tests/unit/mixins/suggestions-test.jshint', function () {

  'use strict';

  module('JSHint - unit/mixins');
  test('unit/mixins/suggestions-test.js should pass jshint', function() { 
    ok(true, 'unit/mixins/suggestions-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/attachment-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/attachment-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/attachment-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/attachment-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('attachment', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/attachment-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/attachment-test.js should pass jshint', function() { 
    ok(true, 'unit/models/attachment-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/business-hour-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/business-hour-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/business-hour-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/business-hour-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('business-hour', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/business-hour-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/business-hour-test.js should pass jshint', function() { 
    ok(true, 'unit/models/business-hour-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/case-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/case-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/case-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/case-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('case', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/case-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/case-test.js should pass jshint', function() { 
    ok(true, 'unit/models/case-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/holiday-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/holiday-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/holiday-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/holiday-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('holiday', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/holiday-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/holiday-test.js should pass jshint', function() { 
    ok(true, 'unit/models/holiday-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-domain-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-domain-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-domain-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-domain-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity-domain', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-domain-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-domain-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-domain-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-email-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-email-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-email-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-email-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity-email', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-email-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-email-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-email-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-facebook-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-facebook-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-facebook-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-facebook-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity-facebook', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-facebook-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-facebook-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-facebook-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-phone-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-phone-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-phone-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-phone-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity-phone', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-phone-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-phone-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-phone-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/identity-twitter-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/identity-twitter-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/identity-twitter-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/identity-twitter-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('identity-twitter', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/identity-twitter-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/identity-twitter-test.js should pass jshint', function() { 
    ok(true, 'unit/models/identity-twitter-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/person-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/person-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/person-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/person-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('person', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/person-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/person-test.js should pass jshint', function() { 
    ok(true, 'unit/models/person-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/priority-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/priority-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/priority-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/priority-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('priority', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/priority-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/priority-test.js should pass jshint', function() { 
    ok(true, 'unit/models/priority-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/role-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/role-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/role-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/role-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('role', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/role-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/role-test.js should pass jshint', function() { 
    ok(true, 'unit/models/role-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/slack-identity-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/slack-identity-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/slack-identity-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/slack-identity-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('slack-identity', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/slack-identity-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/slack-identity-test.js should pass jshint', function() { 
    ok(true, 'unit/models/slack-identity-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/team-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/team-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/team-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/team-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('team', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/team-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/team-test.js should pass jshint', function() { 
    ok(true, 'unit/models/team-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/vote-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/vote-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/vote-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/vote-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('vote', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/vote-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/vote-test.js should pass jshint', function() { 
    ok(true, 'unit/models/vote-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/models/zone-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/models');
  qunit.test('unit/models/zone-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/models/zone-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/models/zone-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleForModel('zone', {
    // Specify the other units that are required for this test.
    integration: true
  });

  qunit.test('it exists', function (assert) {
    DS._setupContainer(this.container);
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

});
define('frontend-cp/tests/unit/models/zone-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/zone-test.js should pass jshint', function() { 
    ok(true, 'unit/models/zone-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/services/context-modal-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/services');
  qunit.test('unit/services/context-modal-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/services/context-modal-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/services/context-modal-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleFor('service:context-modal', {});

  // Replace this with your real tests.
  qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

  // Specify the other units that are required for this test.
  // needs: ['service:foo']

});
define('frontend-cp/tests/unit/services/context-modal-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/context-modal-test.js should pass jshint', function() { 
    ok(true, 'unit/services/context-modal-test.js should pass jshint.'); 
  });

});
define('frontend-cp/tests/unit/services/url-test.eslint-test', ['qunit'], function (qunit) {

  'use strict';

  qunit.module('ESLint - unit/services');
  qunit.test('unit/services/url-test.js should pass ESLint', function(assert) {
    assert.ok(true, 'unit/services/url-test.js should pass ESLint.\n');
  });

});
define('frontend-cp/tests/unit/services/url-test', ['frontend-cp/tests/helpers/qunit'], function (qunit) {

  'use strict';

  qunit.moduleFor('service:url', {});

  // Replace this with your real tests.
  qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

  // Specify the other units that are required for this test.
  // needs: ['service:foo']

});
define('frontend-cp/tests/unit/services/url-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/url-test.js should pass jshint', function() { 
    ok(true, 'unit/services/url-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('frontend-cp/config/environment', ['ember'], function(Ember) {
  var prefix = 'frontend-cp';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("frontend-cp/tests/test-helper");
} else {
  require("frontend-cp/app")["default"].create({"name":"frontend-cp","version":"0.0.0.6c44bad5"});
}

/* jshint ignore:end */
//# sourceMappingURL=frontend-cp.map