angular.module('angular-hal', ['ng', 'uri-template'])
.provider('ngHal', function () {
  function bind (object, fun) {
    return function () {
      return fun.apply(object, Array.prototype.slice.call(arguments));
    };
  }

  function wrap (Wrapper, fun) {
    return function () {
      var thing = fun.apply(undefined, Array.prototype.slice.call(arguments));
      return new Wrapper(thing);
    };
  }

  function memoized (object, method) {
    var responses = {};
    var memoizedFunction = function () {
      var args = [].slice.call(arguments), key = JSON.stringify(args);
      if (typeof responses[key] === 'undefined') {
        responses[key] = method.apply(object, args);
      }
      return responses[key];
    };
    memoizedFunction._memoized = true;
    return memoizedFunction;
  }

  function memoize (object, methods) {
    methods = [].slice.call(arguments, 1);
    angular.forEach(methods, function (method) {
      var oldMethod = object[method];
      if (!oldMethod._memoized) {
        object[method] = memoized(object, oldMethod);
      }
    });
  }

  function constructor (mods) {
    var Base = Object.create(HAL.Document.prototype);
    angular.forEach(mods, function (module) {
      if (typeof modules[module] !== 'undefined') {
        angular.forEach(modules[module], function (mod) {
          if (angular.isArray(mod) || angular.isFunction(mod)) {
            mod = $injector.invoke(mod);
          }
          Base = Object.create(angular.extend(Base, mod));
        });
      }
    });
    return function Document (document, config) {
      return HAL.Document(document, config, Base);
    };
  }

  function constructDocument (document, config, mods) {
    if (typeof constructorCache[mods] === 'undefined') {
      constructorCache[mods] = constructor(mods);
    }
    var ExtendedDocument = constructorCache[mods];
    return new ExtendedDocument(document, config);
  }

  var HAL = {
    Document: function HALDocument (document, config, Base) {
      Base.addLinks(document, config);
      memoize(Base, '_follow', 'follow');
      Base.constructor = HAL.Document;
      o = Object.create(Base);
      o.importData(document);
      return o;
    },
    DocPromise: function (promise, mods) {
      HAL.Promise.call(this, $q.all({response: promise, mods: $q.when(mods)}).then(function (args) {
        return constructDocument(args.response.data, args.response.config, args.mods);
      }));
      memoize(this, 'get', 'call', 'link', 'follow', 'url');
    },
    Link: function (linkspecs, rel, from) {
      if (!angular.isArray(linkspecs)) {
        linkspecs = [linkspecs];
      }
      this.specs = [];
      angular.forEach(linkspecs, function (linkspec) {
        if (from && from.indexOf('://') !== -1 && linkspec.href.split('://', 2).length != 2) {
          if (linkspec.href[0] == '/') {
            linkspec.href = from.split('/').slice(0, 3).join('/') + linkspec.href;
          } else {
            linkspec.href = [from.replace('/\/$/', ''), linkspec.href].join('/');
          }
        }
        var spec = {};
        spec.profile = linkspec.profile;
        spec.template = UriTemplate.parse(linkspec.href);
        this.specs.push(spec);
      }, this);
    },
    Promise: function (promise) {
      promise = $q.when(promise);
      this['finally'] = wrap(HAL.Promise, bind(promise, promise['finally']));
      this.then = wrap(HAL.Promise, bind(promise, promise.then));
      memoize(this, 'get', 'call');
    }
  };

  HAL.Promise.prototype = {
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

  HAL.Document.prototype = {
    _follow: function (rel, params) {
      return $http.get(this.link(rel).href(params));
    },
    follow: function follow (rel, params) {
      return new HAL.DocPromise(this._follow(rel, params));
    },
    url: function url () {
      return this.link('self').href();
    },
    persisted: function persisted () {
      return !!this.link('self');
    },
    save: function save () {
      var self = this;
      if (this.persisted()) {
        return $http.put(this.url(), this).then(function () {
          return self;
        });
      } else {
        return $http.post(this.link('create').href(), this).then(function (response) {
          var protowithlinks = self;
          while (protowithlinks !== Object.prototype && !protowithlinks.hasOwnProperty('link')) {
            protowithlinks = Object.getPrototypeOf(protowithlinks);
          }
          protowithlinks.addLinks(response.data, response.config);
          self.importData(response.data);
          return self;
        });
      }
    },
    destroy: function destroy () {
      $http['delete'](this.url());
    },
    build: function build (rel, params) {
      var link = this.link(rel);
      return constructDocument({_links: {create: {href: link.href(params) }}}, undefined, [link.profile(params), rel]);
    },
    importData: function importData (document) {
      delete document['_links'];
      angular.extend(this, document);
    },
    addLinks: function addLinks (document, config) {
      var links = {};
      angular.forEach(document._links, function (link, rel) {
        links[rel] = new HAL.Link(link, rel, config ? config.url : undefined);
      });
      if (typeof links['self'] === 'undefined' && typeof config !== 'undefined') {
        links.self = new HAL.Link({href: config.url}, 'self', config.url);
      }
      this.link = function (rel) { return links[rel]; };
    }
  };

  HAL.Link.prototype = {
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
      var template = this.template(params);
      if (template) {
        return template.profile;
      }
    }
  };

  HAL.DocPromise.prototype = angular.extend({}, HAL.Promise.prototype);
  angular.extend(HAL.DocPromise.prototype, {
    link: function link (rel) {
      return this.then(function (document) {
        return document.link(rel) || $q.reject('no such link' + rel);
      });
    },
    follow: function follow (rel, params) {
      return new HAL.DocPromise(this.then(function (document) {
        return document._follow(rel, params);
      }), this.then(function (document) {
        return [document.link(rel).profile(), rel];
      }));
    },
    url: function url () {
      return this.then(function (document) {
        return document.url();
      });
    },
    destroy: function destroy () {
      return this.then(function (document) {
        return document.destroy();
      });
    },
    build: function build (rel) {
      return this.then(function (document) {
        return document.build(rel);
      });
    }
  });

  var root, $q, $http, UriTemplate, $injector, modules = {}, constructorCache = {};

  this.setRootUrl = function (rootUrl) {
    root = rootUrl;
    return this;
  };

  this.defineModule = function (uri, module) {
    if (typeof modules[uri] === 'undefined') {
      modules[uri] = [module];
    } else {
      modules[uri].push(module);
    }
    return this;
  };
  
  var self = this;

  this.$get = ['$http', '$q', '$injector', 'UriTemplate', function (h, q, i, u) {
    self.generateConstructor = constructor;
    $http = h;
    $q = q;
    $injector = i;
    UriTemplate = u;
    return new HAL.DocPromise(h.get(root), ['root']);
  }];
});