angular.module('angular-hal', ['ng', 'uri-template'])
.provider('ngHal', function () {
  var $q, UriTemplate;

  /**
   * HAL Document
   * 
   * This is not strictly a constructor - it expects to be
   * subclassed and invoked on an instance of a subclass.
   * It also does not return `this', instead creating an
   * anonymous prototype so that non-data properties that
   * are instance specific are not serialized / have some-
   * where to go.
   **/
  function Document (data, context) {
    this.link = linkAccessor(data._links, context);
    this.context = context;
    var propHolder = Object.create(this);
    angular.forEach(data, function (value, key) {
      if (key != '_links' && key  != '_embedded') {
        propHolder[key] = angular.copy(value);
      }
    });
    return propHolder;
  }

  Document.prototype = {
    constructor: Document,
    build: function build (rel, params) {
      var link = this.link(rel);
      return this.context.makeConstructor([link.profile(params), rel])({
        _links: {
          create: {
            href:link.href(params)
          }
        }
      }, undefined);
    },
    destroy: function destroy () {
      this.context['delete'](this.url());
    },
    follow: function follow (rel, params) {
      return new DocumentPromise(this.link(rel).get(params),
        [this.link(rel).profile(params), rel], this.context);
    },
    persisted: function persisted () {
      return !!this.link('self');
    },
    save: function save () {
      var self = this;
      if (this.persisted()) {
        return this.context.put(this.url(), this).then(function () {
          return self;
        });
      } else {
        return this.context.post(this.link('create').href(), this)
          .then(function (response) {
            var protowithlinks = self;
            while (protowithlinks !== Object.prototype &&
              !protowithlinks.hasOwnProperty('link')) {
              protowithlinks = Object.getPrototypeOf(protowithlinks);
            }
            self.context.origin = response.config.url;
            protowithlinks.link = linkAccessor(response.data._links,
              self.context);
            angular.forEach(response.data, function (value, key) {
              if (key != '_links' && key  != '_embedded') {
                self[key] = angular.copy(value);
              }
            });
            return self;
          });
      }
    },
    url: function url () {
      return this.link('self').href();
    }
  };

  /**
   * HAL Link
   * 
   * Contrasted with above, this actually *is* a constructor.
   * Responsible for determining how to turn a link into a
   * URL which can then be promised into a HAL Document.
   */

  function Link (lSpecs, relation, context) {
    if (!angular.isArray(lSpecs)) {
      lSpecs = [lSpecs];
    }
    this.context = context;
    this.specs = [];
    angular.forEach(lSpecs, function (spec) {
      this.specs.push({
        profile: spec.profile,
        template: UriTemplate.parse(spec.href)
      });
    }, this);
    this.rel = relation;
  }

  Link.prototype = {
    constructor: Link,
    href: function (params) {
      var template = this.template(params);
      if (template) {
        return template.template.expand(params);
      }
    },
    hrefs: function (params) {
      var hrefs = [], compiled;
      angular.forEach(this.specs, function (spec) {
        compiled = spec.template.expand(params);
        if (typeof compiled !== 'undefined') {
          hrefs.push(compiled);
        }
      });
      return hrefs;
    },
    template: function (params) {
      var highScore = -1, template;
      angular.forEach(this.specs, function (spec) {
        var score = spec.template.score(params);
        if (score >= 0 && score > highScore) {
          highScore = score;
          template = spec;
        }
      });
      return template;
    },
    profile: function (params) {
      return this.template(params).profile;
    },
    get: function (opts) {
      return this.context.get(this.href(opts));
    }
  };

  // helper which generates an accessor method for
  // links.
  function linkAccessor(oLinks, context) {
    var links = {};
    angular.forEach(oLinks, function (link, rel) {
      links[rel] = new Link(link, rel, context);
    });
    if (typeof links['self'] === 'undefined' &&
      typeof context.origin !== 'undefined') {
      links.self = new Link({href: context.origin},
        'self', context);
    }

    return function link (rel) {
      return links[rel];
    };
  }

  /**
   * HAL Promise
   *
   * This is a subclass of the $q promise mechanism included
   * with Angular. Provides some helper methods which make it
   * easier to compose a graph of promises. Basically sugar.
   */

  function Promise (promise) {
    promise = $q.when(promise);
    this['finally'] = reconstruct(Promise, bound(promise,
      promise['finally']));
    this.then = reconstruct(Promise, bound(promise,
      promise.then));
  }

  Promise.prototype = {
    constructor: Promise,
    'catch': function (errback) {
      return this.then(undefined, errback);
    },
    'get': function (property) {
      return this.then(function (data) {
        return data[property];
      });
    },
    'call': function (method) {
      var args = Array.prototype.slice.call(arguments, 1);
      return this.then(function (data) {
        return data[method].apply(data, args);
      });
    }
  };

  // function which wraps the return value of method in
  // the constructor. Used to ensure HALPromise's stay
  // HALPromises instead of reverting to $q promises.
  function reconstruct(Constructor, method) {
    return function () {
      return new Constructor(method.apply(null,
        [].slice.call(arguments)));
    };
  }

  // helper which ensures that the recipient of the
  // method call will always be the passed object.
  function bound(object, method) {
    return function () {
      return method.apply(object, [].slice.call(arguments));
    };
  }

  /**
   * HAL Document Promise
   *
   * A subclass of the HAL Promise specified above,
   * has some additional methods which we can assume
   * make sense since the resolution of the promise
   * will be a HAL Document.
   */
  function DocumentPromise (dPromise, mPromise, cPromise) {
    Promise.call(this, $q.all({d:dPromise, m:mPromise, c:cPromise})
      .then(mkPromisedDoc));
  }

  function mkPromisedDoc (opts) {
    return new (opts.c.makeConstructor(opts.m))(opts.d.data,
      opts.d.config.url);
  }

  DocumentPromise.prototype = Object.create(Promise.prototype);
  angular.extend(DocumentPromise.prototype, {
    constructor: DocumentPromise,
    build: function build (rel) {
      return this.then(function (document) {
        return document.build(rel);
      });
    },
    destroy: function destroy () {
      return this.then(function (document) {
        return document.destroy();
      });
    },
    follow: function follow (rel, opts) {
      return new DocumentPromise(this.then(function (document) {
        return document.link(rel).get(opts);
      }), this.then(function (document) {
        return [document.link(rel).profile(opts), rel];
      }), this.then(function (document) {
        return document.context;
      }));
    },
    link: function link (rel) {
      return this.then(function (document) {
        return document.link(rel) || $q.reject('no such link' + rel);
      });
    },
    url: function url () {
      return this.then(function (document) {
        return document.url();
      });
    }
  });

  /**
   * ngHal Context
   *
   * This is responsible for holding the configuration
   * options set in angular's `config' blocks and holding
   * global state.
   */

  function Context (parent, origin) {
    this.origin = origin;
    this.mixins = {};
    this.parent = parent;
  }

  Context.prototype = {
    constructor: Context,
    subContext: function subContext (origin) {
      var obj = Object.create(this);
      Context.call(obj, this,
        arguments.length ? origin : this.origin);
      return obj;
    },
    get: function get (path, config) {
      return this.http.get(this.relativePath(path), config);
    },
    put: function put (path, data, config) {
      return this.http.put(this.relativePath(path), data, config);
    },
    post: function post (path, data, config) {
      return this.http.post(this.relativePath(path), data, config);
    },
    'delete': function (path, config) {
      return this.http['delete'](this.relativePath(path), config);
    },
    // returns a constructor with the prototype set to an
    // object with all of the mixins requested already
    // attached. This is really the only place that should
    // ever need to call `Document'
    makeConstructor: function makeConstructor (mixins) {
      var context = this;
      function Constructor (data, url) {
        if (!(this instanceof Constructor)) {
          return new Constructor(data, url);
        }
        return Document.call(this, data, context.subContext(url));
      }
      Constructor.prototype = this.prototypeForMixins(mixins);
      return Constructor;
    },
    mixin: function (mixin, def) {
      this.mixins[mixin] = [].concat(this.mixins[mixin], def);
    },
    mixinsFor: function mixinsFor (mixin) {
      if (this.parent) {
        return this.parent.mixinsFor(mixin).concat(this.mixins[mixin]);
      } else {
        return (this.mixins[mixin] || []).slice(0);
      }
    },
    // A function which generates an object with the
    // prototype chain consisting of Document at the root
    // and the requested mixins built up to the top.
    prototypeForMixins: function prototypeForMixins (mixins) {
      var proto = Object.create(Document.prototype);
      angular.forEach(mixins.reverse(), function (mixin) {
        angular.forEach(this.mixinsFor(mixin), function (mix) {
          if (angular.isArray(mix) || angular.isFunction(mix)) {
            mix = this.injector.invoke(mix);
          }
          proto = angular.extend(Object.create(proto), mix);
        }, this);
      }, this);
      return proto;
    },
    relativePath: function relativePath (path) {
      if (this.origin && path.split('://', 2).length != 2 &&
        this.origin.indexOf('://') !== -1) {
        if (path[0] == '/') {
          path =  this.origin.split('/')
            .slice(0, 3).join('/') + path;
        } else {
          path = [this.origin.replace(/\/$/, ''), path].join('/');
        }
      }
      return path;
    }
  };

  function ContextProvider(context) {
    this.ctx = context;
    this.subProviders = {};
  }

  ContextProvider.prototype = {
    constructor: ContextProvider,
    setRootUrl: function setRootUrl (rootUrl) {
      this.ctx.origin = rootUrl;
      return this;
    },
    defineModule: function defineModule (uri, module) {
      return this.mixin(uri, module);
    },
    mixin: function mixin (uri, def) {
      this.ctx.mixin(uri, def);
      return this;
    },
    get: function () {
      if (!this._gotten) { 
        var self = this, p = new DocumentPromise(this.ctx.get(this.ctx.origin),
          ['root'], this.ctx);
        p.context = function (context) {
          return self.subProviders[context].get();
        };
        this._gotten = p;
      }
      return this._gotten;
    },
    context: function context (contextName, def) {
      var provider = this.subProviders[contextName] =
        this.subProviders[contextName] || 
        new ContextProvider(this.ctx.subContext());
      if (angular.isFunction(def)) {
        def.call(provider, provider);
        return this;  
      } else {
        return provider;
      }
    }
  };

  var rootContext = new Context(),
    rootProvider = new ContextProvider(rootContext);

  rootProvider.$get = getNgHal;
  getNgHal.$inject = ['$cacheFactory', '$http', '$injector', '$q', 'UriTemplate'];
  function getNgHal ($cacheFactory, $http, $injector, _$q_, _UriTemplate_) {
    rootProvider.generateConstructor = bound(rootContext, rootContext.makeConstructor);
    rootContext.http = $http;
    rootContext.injector = $injector;
    $q = _$q_;
    UriTemplate = _UriTemplate_;
    return this.get();
  }

  return rootProvider;
});