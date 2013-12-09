angular.module('angular-hal', ['ng'])
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
      var args = [].slice.call(arguments);
      if (typeof responses[args] === 'undefined') {
        responses[args] = method.apply(object, args);
      }
      return responses[args];
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
        Base = Object.create(angular.extend(Base, modules[module]));
      }
    });
    var cxt = function (document, config) {
      HAL.Document.call(this, document, config);
    };
    cxt.prototype = Base;
    return cxt;
  }

  function constructDocument (document, config, mods) {
    if (typeof constructorCache[mods] === 'undefined') {
      constructorCache[mods] = constructor(mods);
    }
    var ExtendedDocument = constructorCache[mods];
    return new ExtendedDocument(document, config);
  }

  var HAL = {
    Document: function (document, config) {
      var links = {};
      angular.forEach(document._links, function (link, rel) {
        links[rel] = new HAL.Link(link, rel, config.url);
      });
      if (typeof links['self'] === 'undefined') {
        links.self = new HAL.Link({href: config.url}, 'self', config.url);
      }
      this.link = function (rel) { return links[rel]; };
      memoize(this, '_follow', 'follow');
      delete document['_links'];
      angular.extend(this, document);
    },
    DocPromise: function (promise, mods) {
      HAL.Promise.call(this, $q.all({response: promise, mods: $q.when(mods)}).then(function (args) {
        return constructDocument(args.response.data, args.response.config, args.mods);
      }));
      memoize(this, 'get', 'call', 'link', 'follow', 'url');
    },
    Link: function (linkspec) {
      this.href = linkspec.href;
      this.profile = linkspec['profile'];
    },
    Promise: function (promise) {
      this.then = wrap(HAL.Promise, bind(promise, $q.when(promise).then));
      memoize(this, 'get', 'call');
    }
  };

  HAL.Promise.prototype = {
    'catch': function (errback) {
      return this.then(undefined, errback);
    },
    'finally': function (fin) {
      return this.then()['finally'](fin);
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
    _follow: function (rel) {
      return $http.get(this.link(rel).href);
    },
    follow: function (rel) {
      return new HAL.DocPromise(this._follow(rel));
    },
    url: function () {
      return this.link('self').href;
    },
    save: function () {
      $http.put(this.url(), this);
    }
  };

  HAL.DocPromise.prototype = angular.extend({}, HAL.Promise.prototype);
  angular.extend(HAL.DocPromise.prototype, {
    link: function link (rel) {
      return this.then(function (document) {
        return document.link(rel) || $q.reject('no such link' + rel);
      });
    },
    follow: function follow (rel) {
      return new HAL.DocPromise(this.then(function (document) {
        return document._follow(rel);
      }), this.then(function (document) {
        return [document.link(rel).profile, rel];
      }));
    },
    url: function url () {
      return this.then(function (document) {
        return document.url();
      });
    }
  });

  var root, $q, $http, modules = {}, constructorCache = {};

  this.setRootUrl = function (rootUrl) {
    root = rootUrl;
  };

  this.defineModule = function (uri, module) {
    if (typeof modules[uri] === 'undefined') {
      modules[uri] = angular.copy(module);
    } else {
      angular.extend(modules[uri], module);
    }
  };

  this.$get = ['$http', '$q', function (h, q) {
    $http = h;
    $q = q;
    return new HAL.DocPromise(h.get(root), ['root']);
  }];
});