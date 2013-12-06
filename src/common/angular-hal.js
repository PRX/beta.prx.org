angular.module('angular-hal', ['ng'])
.provider('ngHal', function () {
  function bind (object, fun) {
    return function () {
      return fun.apply(object, Array.prototype.slice.call(arguments));
    };
  }

  function wrap (Wrapper, fun) {
    return function () {
      return new Wrapper(fun.apply(undefined, Array.prototype.slice.call(arguments)));
    };
  }

  var HAL = {
    Object: function (promise) {
      if (promise) {
        promise = $q.when(promise);
        HAL.Promise.call(this, promise);
        promise = this.then();
        this.config = promise.get('config');
        var dataPromise = promise.get('data');
        this.then   = bind(dataPromise, dataPromise.then);
      }
    },
    Link: function (linkspec) {
      this.href = linkspec.href;
      this.profile = linkspec['profile'];
    },
    Promise: function (promise) {
      if (promise) { 
        this.then = wrap(HAL.Promise, bind(promise, promise.then));
      }
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

  HAL.Object.prototype = new HAL.Promise();

  angular.extend(HAL.Object.prototype, {
    links: function links () {
      return $q.all([this, this.config]).then(function (data) {
        var config = data[1];
        data = data[0];
        var links = {};
        angular.forEach(data._links, function (link, rel) {
          links[rel] = new HAL.Link(link, rel, config.url);
        });
        if (typeof links['self'] === 'undefined') {
          links.self = new HAL.Link({href: config.url}, 'self', config.url);
        }
        return links;
      });
    },
    link: function link (rel) {
      return this.links().then(function (links) {
        if (links && links[rel]) {
          return links[rel];
        } else {
          return $q.reject('no such link: ' + rel);
        }
      });
    },
    follow: function follow (rel) {
      return new HAL.Object(this.link(rel).then(function (link) {
        return $http.get(link.href).then(function (data) {
          data.data = angular.extend(new HAL.Object(), modules[link.profile], data.data);
          return data;
        });
      }));
    },
    url: function url () {
      var self = this;
      return this.link('self').then(function (link) {
        return link.href;
      });
    },
    save: function save () {
      return $q.all([this.url(), this]).then(function (data) {
        var link = data[0];
        data = data[1];
        return $http.put(link.href, data);
      });
    }
  });

  var root, $q, $http, modules = {};

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
    return new HAL.Object(h.get(root));
  }];
});