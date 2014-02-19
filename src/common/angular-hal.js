angular.module('angular-hal', ['ng', 'uri-template'])
.provider('ngHal', function () {
  var $http, $injector, providers = {}, $q, UriTemplate;

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
  function Document (data, config) {
    var propHolder = Object.create(this);
    this.link = linkAccessor(data._links,
      config ? config.url : undefined);
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
      return mkConstructor([link.profile(params), rel])({
        _links: {
          create: {
            href:link.href(params)
          }
        }
      });
    },
    destroy: function destroy () {
      $http['delete'](this.url());
    },
    follow: function follow (rel, params) {
      return new DocumentPromise(this.link(rel).get(params),
        [this.link(rel).profile(params), rel]);
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
          while (protowithlinks !== Object.prototype &&
            !protowithlinks.hasOwnProperty('link')) {
            protowithlinks = Object.getPrototypeOf(protowithlinks);
          }
          protowithlinks.link = linkAccessor(response.data._links,
            response.config.url);
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

  // returns a constructor with the prototype set to an
  // object with all of the mixins requested already
  // attached. This is really the only place that should
  // ever need to call `Document'
  function mkConstructor (mixins) {
    function Constructor (data, config) {
      if (!(this instanceof Constructor)) {
        return new Constructor(data, config);
      }
      return Document.call(this, data, config);
    }
    Constructor.prototype = prototypeForMixins(mixins);
    return Constructor;
  }

  /**
   * HAL Link
   * 
   * Contrasted with above, this actually *is* a constructor.
   * Responsible for determining how to turn a link into a
   * URL which can then be promised into a HAL Document.
   */

  function Link (lSpecs, relation, origin) {
    var aRelative = (origin && origin.indexOf('://') !== -1),
      starter;
    if (aRelative) {
      starter = origin.split('/').slice(0, 3).join('/');
      origin = origin.replace(/\/$/, '');
    }

    if (!angular.isArray(lSpecs)) {
      lSpecs = [lSpecs];
    }

    this.specs = [];
    angular.forEach(lSpecs, function (spec) {
      if (aRelative && spec.href.split('://', 2).length != 2) {
        if (spec.href[0] == '/') {
          spec.href =  starter + spec.href;
        } else {
          spec.href = [origin, spec.href].join('/');
        }
      }
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
    get: function () {
      return $http.get(this.href());
    }
  };

  // helper which generates an accessor method for
  // links.
  function linkAccessor(oLinks, origin) {
    var links = {};
    angular.forEach(oLinks, function (link, rel) {
      links[rel] = new Link(link, rel, origin);
    });
    if (typeof links['self'] === 'undefined' &&
      typeof origin !== 'undefined') {
      links.self = new Link({href: origin}, 'self');
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

  function DocumentPromise (dPromise, mPromise) {
    Promise.call(this, $q.all({d:dPromise, m:mPromise})
      .then(mkPromisedDoc));
  }

  function mkPromisedDoc (opts) {
    return new (mkConstructor(opts.m))(opts.d.data,
      opts.d.config);
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
        return document.link(rel, opts).get();
      }), this.then(function (document) {
        return [document.link(rel, opts).profile(), rel];
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

  // A function which generates an object with the
  // prototype chain consisting of Document at the root
  // and the requested mixins built up to the top.
  function prototypeForMixins (mixins) {
    var proto = Object.create(Document.prototype);
    angular.forEach(mixins, function (mixin) {
      if (typeof this.mixins[mixin] !== 'undefined') {
        angular.forEach(this.mixins[mixin], function (mix) {
          if (angular.isArray(mix) || angular.isFunction(mix)) {
            mix = $injector.invoke(mix);
          }
          proto = angular.extend(Object.create(proto), mix);
        });
      }
    }, providers['default']);
    return proto;
  }

  /**
   * ngHal Provider
   *
   * This is responsible for holding the configuration
   * options set in angular's `config' blocks.
   */

  function NgHalProvider (parent) {
    this.root = '/';
    this.mixins = {};
    this.parent = parent;
  }

  NgHalProvider.prototype = {
    constructor: NgHalProvider, 
    setRootUrl: function setRootUrl (rootUrl) {
      this.root = rootUrl;
      return this;
    },
    defineModule: function defineModule (uri, module) {
      if (typeof this.mixins[uri] === 'undefined') {
        this.mixins[uri] = [module];
      } else {
        this.mixins[uri].push(module);
      }
      return this;
    }
  };

  NgHalProvider.runtimeMethods = {
    generateConstructor: mkConstructor
  };

  // Only one of our providers is an actual angular provider.
  providers['default'] = new NgHalProvider();
  providers['default'].$get = getNgHal;
  getNgHal.$inject = ['$cacheFactory', '$injector', '$http', '$q', 'UriTemplate'];
  function getNgHal ($cacheFactory, _$injector_, _$http_, _$q_, _UriTemplate_) {
    angular.extend(NgHalProvider.prototype, NgHalProvider.runtimeMethods);
    $http = _$http_; $injector = _$injector_; $q = _$q_;
    UriTemplate = _UriTemplate_;
    return new DocumentPromise($http.get(this.root), ['root']);
  }

  return providers['default'];
});