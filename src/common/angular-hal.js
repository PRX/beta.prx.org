angular.module('angular-hal', ['ng', 'uri-template'])
.factory('halUriMatcher', function () {
  function UriMatcher(uri) {
    var self = this;
    this.matchers = [];
    this.splats = [];
    this.exp = new RegExp('^' + uri.replace(/([\/\A])(\:|\?|\*)([^\/]+)/g, function (_, start, sigil, name) {
      self.matchers.push(name);
      if (sigil == ':') {
        self.splats.push(false);
        return start + "([^\\/]+)";
      } else if (sigil == '?') {
        self.splats.push(false);
        return "(?:" + start + "([^\\/]*))?";
      } else {
        self.splats.push(true);
        return "(?:" + start + "(.*))?";
      }
    }).replace(/\/$/, '/?') + '$');
  }

  UriMatcher.prototype = {
    constructor: UriMatcher,
    test: function (test) {
      return this.exp.test(test);
    },
    match: function (tester) {
      var match = this.exp.exec(tester);
      if (match) {
        var result = {};
        angular.forEach(this.matchers, function (matcher, index) {
          if (this.splats[index]) {
            return result[matcher] = match[index+1].split('/');
          }
          result[matcher] = match[index+1];
        }, this);
        return result;
      }
      return null;
    }
  };

  return UriMatcher;
})
.factory('halDocument', function (halLinkCollection, halDocumentPromise, $q) {
  var DocumentPromise = halDocumentPromise;
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
    this.link = this.links = halLinkCollection(data._links, context);
    this.$embedded = data._embedded || {};
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
      return new DocumentPromise(this.followEmbedded(rel)
        .catch(angular.bind(this, this.followLink, rel, params)));
    },
    followOne: function followOne (rel, params) {
      return this.links.getDocument(rel, params);
    },
    followAll: function followAll (rel, params) {
      return this.links.getDocuments(rel, params);
    },
    followEmbedded: function followEmbedded (rel) {
      if (typeof this.$embedded[rel] === 'undefined') {
        return $q.reject('No embedded object with rel ' + rel);
      }
      var embed = this.$embedded[rel];
      if (!angular.isArray(embed)) {
        return $q.when(this.context.construct(embed, rel));
      } else {
        var results = [];
        angular.forEach(embed, function (e) {
          results.push(this.context.construct(e, rel));
        }, this);
        return $q.all(results);
      }
    },
    followLink: function followLink (rel, params) {
      var size = this.links.all(rel, params).length;
      if (size == 1) {
        return this.followOne(rel, params);
      } else if (size > 1) {
        return this.followAll(rel, params);
      }
      return $q.reject("No link with rel " + rel);
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
            protowithlinks.link = halLinkCollection(response.data._links,
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

  return Document;
})
.factory('halLinkCollection', function (halLink) {
  var Link = halLink;

  /**
   * HAL Link Collection
   *
   * Handles different ways to access individual links.
   *
   * The object returned by this function is attached to
   * documents as both `link' and `links', meaning that
   * the following are all valid:
   *
   *     doc.link(rel).to(params);
   *     doc.links(rel).to(params);
   *     doc.link.to(rel, params);
   *     doc.links.to(rel, params);
   *     doc.link(rel, params).to();
   *     doc.links(rel, params).to();
   *
   * and all do the same thing. This should probably be
   * fixed at some point.
   */

  return function linkCollection(rLinks, context) {
    var links = {};
    angular.forEach(rLinks, function (link, rel) {
      links[rel] = new Link(link, rel, context);
    });
    if (typeof links['self'] === 'undefined' &&
      typeof context.origin !== 'undefined') {
      links.self = new Link({href: context.origin},
        'self', context);
    }
    function accessor (rel, opts) {
      var link = links[rel];
      if (!link) { return undefined; }
      var obj = {};
      angular.forEach(Link.prototype, function (method, name) {
        obj[name] = function (params) {
          return method.call(link, angular.extend({}, opts, params));
        };
      });
      return obj;
    }

    accessor.dump = function () {
      return angular.copy(rLinks);
    };

    angular.forEach(Link.prototype, function (method, name) {
      accessor[name] = function (rel, params) {
        return method.call(links[rel], params);
      };
    });

    return accessor;
  };
})
.factory('halLink', function (UriTemplate, halDocumentPromise, $q) {
  var DocumentPromise = halDocumentPromise;

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
    all: function (params) {
      var result = [];
      angular.forEach(this.specs, function (spec) {
        compiled = spec.template.expand(params);
        if (typeof compiled !== 'undefined') {
          result.push(angular.extend({},
            spec, {href: compiled}));
        }
      });
      return result;
    },
    to: function to (params) {
      var highScore = -1, template;
      angular.forEach(this.specs, function (spec) {
        var score = spec.template.score(params);
        if (score >= 0 && score > highScore) {
          highScore = score;
          template = spec;
        }
      });
      if (template) {
        return angular.extend({}, template,
          {href: template.template.expand(params)});
      }
    },
    href: function (params) {
      var template = this.to(params);
      if (template) {
        return template.template.expand(params);
      }
    },
    url: function (params) {
      return this.context.relativePath(this.href(params));
    },
    hrefs: function (params) {
      var hrefs = [];
      angular.forEach(this.all(params), function (spec) {
        hrefs.push(spec.href);
      });
      return hrefs;
    },
    profile: function profile (params) {
      return this.to(params).profile;
    },
    getDocument: function getDocument (params) {
      var spec = this.to(params);
      return new DocumentPromise(
        this.context.get(spec.template.expand(params)),
        [spec.profile, this.rel], this.context);
    },
    getDocuments: function getDocuments (params) {
      var specs = this.all(params), array = [];
      angular.forEach(specs, function (spec) {
        array.push(new DocumentPromise(
          this.context.get(spec.template.expand(params)),
          [spec.profile, this.rel], this.context));
      }, this);
      return $q.all(array);
    }
  };

  return Link;
})
.factory('halDocumentPromise', function ($q, halPromise) {
  /**
   * HAL Document Promise
   *
   * A subclass of the HAL Promise specified above,
   * has some additional methods which we can assume
   * make sense since the resolution of the promise
   * will be a HAL Document.
   *
   * This function works in 2 different ways - if the
   * first parameter resolves to a Document, you're
   * golden. Otherwise, it will use the mixin and context
   * promises to make a new constructor.
   */
  function DocumentPromise (dPromise, mPromise, cPromise) {
    halPromise.call(this, $q.all({d:dPromise, m:mPromise, c:cPromise })
      .then(mkPromisedDoc));
  }

  function mkPromisedDoc (opts) {
    if (opts.d instanceof DocumentPromise || !opts.c ) {
      return opts.d;
    }
    return opts.c.construct(opts.d.data, opts.m, opts.d.config.url);
  }

  DocumentPromise.prototype = Object.create(halPromise.prototype);
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
        return document.follow(rel, opts);
      }));
    },
    followOne: function followOne (rel, opts) {
      return new DocumentPromise(this.then(function (document) {
        return document.followOne(rel, opts);
      }));
    },
    followAll: function followAll (rel, opts) {
      return new DocumentPromise(this.then(function (document) {
        return document.follow(rel, opts);
      }));
    },
    link: function link (rel, opts) {
      return this.then(function (document) {
        return document.link(rel, opts) || $q.reject('no such link' + rel);
      });
    },
    url: function url () {
      return this.then(function (document) {
        return document.url();
      });
    }
  });

  return DocumentPromise;
})
.factory('halPromise', function ($q) {
  // function which wraps the return value of method in
  // the constructor. Used to ensure HALPromise's stay
  // HALPromises instead of reverting to $q promises.
  function reconstruct(Constructor, method) {
    return function () {
      return new Constructor(method.apply(null,
        [].slice.call(arguments)));
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
    this['finally'] = reconstruct(Promise,
      angular.bind(promise, promise['finally']));
    this.then = reconstruct(Promise,
      angular.bind(promise, promise.then));
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

  return Promise;
})
.provider('ngHal', function () {
  var $q, halLinkCollection, DocumentPromise, Document, UriMatcher;

  /**
   * ResolutionDependencyHolder
   *
   * Holds the chains of dependencies.
   */

  function ResolutionDependencyHolder () { }

  ResolutionDependencyHolder.prototype = {
    constructor: ResolutionDependencyHolder,
    hasTransformations: function () {
      return Object.keys(this).length > 0;
    },
    toTransformer: function () {
      var dependencies = this;
      return function (object) {
        var depPromises = {};
        angular.forEach(dependencies, function (dependency, key) {
          depPromises[key] = (dependency instanceof DocumentDependency) ?
            dependency.resolve(object) : dependency;
        });
        return $q.all(depPromises).then(function (resolution) {
          angular.forEach(resolution, function (val, key) {
            object[key] = val;
          });
          return object;
        });
      };
    }
  };

  angular.forEach(['call', 'follow', 'get'], function (method) {
    ResolutionDependencyHolder.prototype[method] = function () {
      return new DocumentDependency(undefined,
        [method].concat([].slice.call(arguments)));
    };
  });

  /**
   * DocumentDependency
   *
   * Really a chain of method calls.
   */

  function DocumentDependency (recipient, called) {
    this.recipient = recipient;
    if (called[0] == 'follow') {
      called.unshift('call');
    }
    this.called = called;
  }

  DocumentDependency.prototype = {
    constructor: DocumentDependency,
    resolve: function (resolution) {
      if (this.resolved) {
        return this.resolved;
      }
      if (this.recipient) {
        resolution = this.recipient.resolve(resolution);
      }
      var called = this.called;
      return this.resolved = $q.when(resolution).then(function (r) {
        switch(called[0]) {
          case 'call':
            return r[called[1]].apply(r, called.slice(2));
          case 'get':
            return r[called[1]];
        }
      });
    }
  };

  angular.forEach(['call', 'follow', 'get'], function (method) {
    DocumentDependency.prototype[method] = function () {
      return new DocumentDependency(this,
        [method].concat([].slice.call(arguments)));
    };
  });

  function documentOr(fn) {
    return function (doc) {
      var ret = fn(doc);
      if (typeof ret !== 'undefined') {
        return ret;
      } else {
        return doc;
      }
    };
  }

  /**
   * ngHal Context
   *
   * This is responsible for holding the configuration
   * options set in angular's `config' blocks and holding
   * global state.
   */

  function Context (parent, origin) {
    this.origin = origin;
    this.mixins = [];
    this.transformations = {};
    this.parent = parent;
  }

  Context.prototype = {
    constructor: Context,
    subContext: function subContext (origin) {
      var obj = Object.create(this);
      Context.call(obj, this,
        arguments.length ? this.relativePath(origin) : this.origin);
      return obj;
    },
    disableTransforms: false,
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
        var doc = Document.call(this, data, context.subContext(url));
        if (Context.prototype.disableTransforms) {
          return doc;
        } else {
          return doc.transform();
        }
      }
      Constructor.prototype = this.prototypeForMixins(mixins);
      return Constructor;
    },
    mixin: function (uri, def) {
      this.mixins.push([new UriMatcher(uri), def]);
    },
    mixinsFor: function mixinsFor (uri) {
      var myMixins = [];
      angular.forEach(this.mixins, function (mixin) {
        if (mixin[0].test(uri)) {
          myMixins.push([mixin[1], mixin[0].match(uri)]);
        }
      });
      if (this.parent) {
        return this.parent.mixinsFor(uri).concat(myMixins);
      } else {
        return myMixins;
      }
    },
    construct: function construct (doc, uris, url) {
      var selfLink = halLinkCollection(doc._links, this)('self');
      if (selfLink) {
        url = url || selfLink.href();
        uris = [].concat(uris, selfLink.profile());
      }
      return this.makeConstructor(uris)(doc, url);
    },
    // A function which generates an object with the
    // prototype chain consisting of Document at the root
    // and the requested mixins built up to the top.
    prototypeForMixins: function prototypeForMixins (mixins) {
      var proto = Object.create(Document.prototype);
      var transform = [];
      angular.forEach(mixins.reverse(), function (mixin) {
        angular.forEach(this.mixinsFor(mixin), function (mixinDefinition) {
          var mix = mixinDefinition[0], others = mixinDefinition[1];
          if (angular.isArray(mix) || angular.isFunction(mix)) {
            if (this.injector.annotate(mix).indexOf('resolved') !== -1) {
              others.resolved = new ResolutionDependencyHolder();
            }
            mix = this.injector.invoke(mix, this, others);
          }
          if (others.resolved && others.resolved.hasTransformations()) {
            transform.push(others.resolved.toTransformer());
          }
          if (angular.isFunction(mix)) {
            transform.push(mix);
          } else {
            proto = angular.extend(Object.create(proto), mix);
          }
        }, this);
      }, this);
      proto.transform = function () {
        var promise = $q.when(this);
        var self = this;
        angular.forEach(transform, function (fn) {
          promise = promise.then(documentOr(fn));
        });
        return promise;
      };
      return proto;
    },
    relativePath: function relativePath (path) {
      if (typeof path === 'undefined') { return path; }
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
    this.mixins = [];
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
      this.mixins.push([uri, def]);
      return this;
    },
    get: function () {
      if (!this._gotten) {
        angular.forEach(this.mixins, function (mixin) {
          this.ctx.mixin(mixin[0], mixin[1]);
        }, this);
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
  getNgHal.$inject = ['$cacheFactory', 'halDocument', 'halDocumentPromise', 'halLinkCollection', '$http', '$injector', '$q', 'halUriMatcher'];
  function getNgHal ($cacheFactory, halDocument, halDocumentPromise, hll, $http, $injector, _$q_, halUriMatcher) {
    rootProvider.disableTransforms = function () {
      Context.prototype.disableTransforms = true;
    };
    Document = halDocument;
    halLinkCollection = hll;
    UriMatcher = halUriMatcher;
    DocumentPromise = halDocumentPromise;
    rootProvider.generateConstructor = angular.bind(rootContext, rootContext.makeConstructor);
    rootContext.http = $http;
    rootContext.injector = $injector;
    $q = _$q_;
    return this.get();
  }

  return rootProvider;
});