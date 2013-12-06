angular.module('angular-hal', ['ng'])
.provider('ngHal', function () {
  var models = {};
  var entrypoint, http;

  UriTemplate.prototype.hasKeys = function (keys) {
    for (var i=0; i<keys.length; i++) {
      if (!this.hasKey(keys[i])) {
        return false;
      }
    }
    return true;
  };

  function calculateVariableCount(uriTemplate) {
    var count = 0;
    angular.forEach(this.expressions, function (expression) {
      if (expression['varspecs']) {
        count += expression['varspecs'].length;
      }
    });
    return count;
  }

  UriTemplate.prototype.variableCount = function () {
    if (typeof this._variableCount === 'undefined') {
      this._variableCount = calculateVariableCount(this);
    }
    return this._variableCount;
  };

  UriTemplate.prototype.hasKey = function (key) {
    var i, j, expression;
    for (j=0; j<this.expressions.length; j++) {
      expression = this.expressions[j];
      if (typeof expression['varspecs'] !== 'undefined') {
        for(i=0; i<expression.varspecs.length; i++) {
          if (expression.varspecs[i].varname == key) {
            return true;
          }
        }
      }
    }
    return false;
  };

  var slice = Array.prototype.slice;
  function a2a (a) {
    return slice.call(a);
  }

  function getModel(uri) {
    if (typeof models[uri] === 'undefined') {
      return AngularHalObject;
    } else {
      return models[uri];
    }
  }

  function buildWithType () {
    var types = a2a(arguments);
    return function (data, status, headers, config) {
      return buildHalObject(data, status, headers, config, types);
    };
  }

  function buildHalObject(data, status, headers, config, types) {
    var M = HalObject;
    angular.forEach(types, function (type) {
      if (M == HalObject && typeof models[type] !== 'undefined') {
        M = models[type];
      }
    });

    var links = {};
    if (angular.isDefined(data['_links'])) {
      angular.forEach(data._links, function (link, rel) {
        links[rel] = new HalLink(rel, link, config);
      });
      delete data['_links'];
    }
    return new M(data, links);
  }

  function AngularHal () {
    http.get(entrypoint).success(buildHalObject);
  }

  function HalObject (data, links) {
    this.getLinks = function () { return links; };
    angular.extend(this, data);
    window.thing = this;
  }

  HalObject.prototype.url = function () {
    return this.getLinks()['self'].href();
  };

  function HalLink (rel, data, config) {
    if (!angular.isArray(data)) {
      data = [data];
    }
    this.rel = rel;
    this.templates = [];
    angular.forEach(data, function (spec) {
      if (spec.href.charAt(0) == '/') {
        spec.href = config.url.split('/').slice(0,3).join('/') + spec.href;
      }
      spec.href = UriTemplate.parse(spec.href);
      this.templates.push(spec);
      console.log(spec);
    }, this);
  }

  HalLink.prototype.selectLink = function (params) {
    if (angular.isObject(params)) {
      var keys = [];
      angular.forEach(params, function(value, key) {
        keys.push(key);
      });

      for (i=0; i<this.templates.length; i++) {
        if (this.templates[i].href.hasKeys(keys)) {
          return this.templates[i];
        }
      }
    } else {
      var template = this.templates[0];
      for (i=1; i<this.templates.length; i++) {
        if (template.href.variableCount() > this.templates[i].href.variableCount()) {
          template = this.templates[i];
        }
      }
      return template;
    }
  };

  HalLink.prototype.href = function (params) {
    return this.selectLink(params).href.expand(params);
  };

  HalLink.prototype.follow = function (params) {
    var link = this.selectLink(params);
    return http.get(link.href.expand(params)).success(buildWithType(link.profile, this.rel));
  };

  return {
    defineModel: function (uri, methods) {
      if (typeof models[uri] === 'undefined') {
        models[uri] = function () { HalObject.apply(this, a2a(arguments)); };
        models[uri].prototype = {};
      }
      angular.extend(models[uri].prototype, methods);
    },
    setEntrypoint: function (newEntrypoint) {
      entrypoint = newEntrypoint;
    },
    $get: function ($http) {
      http = $http;
      return new AngularHal();
    }
  };
});