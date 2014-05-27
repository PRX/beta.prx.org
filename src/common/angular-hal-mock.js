angular.module('angular-hal-mock', ['angular-hal', 'ngMock', 'ng'])
.config(function ($provide, ngHalProvider) {
  var $q, $rootScope, FAKE_ROOT = 'http://nghal.org/fake_root';
  
  function unfolded(doc) {
    if (angular.isFunction(doc.links)) {
      doc._links = doc.links.dump();
    }
    return doc;
  }

  function promiseTransform (p) {
    return $q.when(p).then(transform);
  }

  function transform (doc) {
    if (doc && doc.transform) {
      return doc.transform();
    }
    return doc;
  }

  function promised (obj) {
    if (obj.then && obj.stubFollow) { return obj; }
    var sfs = [];
    var sfos = [];
    var stubbed = false;
    obj = $q.when(obj);
    var then = obj.then;
    obj.stubFollow = function (rel, obj) {
      var spy = jasmine.createSpy().and.returnValue(promised(promiseTransform(obj)));
      sfs.push([rel, spy]);
      return spy;
    };
    obj.stubFollowOne = function (rel, obj) {
      var spy = jasmine.createSpy().and.returnValue(promised(promiseTransform(obj)));
      sfos.push([rel, spy]);
      return spy;
    };
    obj.then = function () {
      if (!stubbed) {
        stubbed = then.call(obj, function (obj) {
          angular.forEach(sfs, function (sf) {
            obj.stubFollow_.apply(obj, sf);
          });
          angular.forEach(sfos, function (sfo) {
            obj.stubFollowOne_.apply(obj, sfo);
          });
          return obj;
        });
      }
      var p = promised(stubbed.then.apply(stubbed, [].slice.call(arguments)));
      if (!$rootScope.$$phase) { $rootScope.$digest(); }
      return p;
    };
    obj.follow = function (rel, params) {
      return promised(this.then(function (d) {
        return d.follow(rel, params);
      }));
    };
    obj.followOne = function (rel, params) {
      return promised(this.then(function (d) {
        return d.followOne(rel, params);
      }));
    };
    obj.get = function (prop) {
      return promised(this.then(function (d) {
        return d[prop];
      }));
    };
    obj.call = function (meth) {
      var args = [].slice.call(arguments, 1);
      return promised(this.then(function (d) {
        return d[meth].apply(d, args);
      }));
    };
    return obj;
  }

  function mocked (doc) {
    var docFollowStubs = {};
    var docFollowOneStubs = {};
    doc.stubFollow = function (rel, obj) {
      return this.stubFollow_(rel, jasmine.createSpy().and.returnValue(
        promised(promiseTransform(obj))));
    };
    doc.stubFollowOne = function (rel, obj) {
      return this.stubFollowOne_(rel, jasmine.createSpy().and.returnValue(
        promised(promiseTransform(obj))));
    };
    doc.stubFollow_ = function (rel, spy) {
      return docFollowStubs[rel] = spy;
    };
    doc.stubFollowOne_ = function (rel, spy) {
      return docFollowOneStubs[rel] = spy;
    };
    var originalFollow = doc.follow;
    doc.follow = function (rel, params) {
      if (typeof docFollowStubs[rel] !== 'undefined') {
        return docFollowStubs[rel](params);
      } else {
        return originalFollow.call(doc, rel, params);
      }
    };
    var originalFollowOne = doc.followOne;
    doc.followOne = function(rel, params) {
      if (typeof docFollowOneStubs[rel] !== 'undefined') {
          return transform(docFollowOneStubs[rel](params));
        } else {
          return originalFollowOne.call(doc, rel, params);
        }
    };
    var originalTransform = doc.transform;
    doc.transform = function () {
      var p = originalTransform.call(doc);
      if (!$rootScope.$$phase){
        $rootScope.$digest();
      }
      return p;
    }
    return doc;
  }

  ngHalProvider.setRootUrl(FAKE_ROOT);
  $provide.decorator('ngHal', ['$delegate', '$httpBackend', '$q', '$rootScope', function ($delegate, $httpBackend, _$q_, _$rootScope_) {
    $q = _$q_;
    $rootScope = _$rootScope_;

    ngHalProvider.disableTransforms();
    if (ngHalProvider.ctx.origin == FAKE_ROOT) {
      $httpBackend.when('GET', FAKE_ROOT).respond({});
      $httpBackend.flush(1);
    }

    var mock = promised($delegate.then(function (d) {
      return mocked(d);
    }));

    mock.context = function () {
      return $delegate.context.apply($delegate, [].slice.call(arguments));
    };

    mock.mock = function (o) {
      var args = Array.prototype.slice.call(arguments);
      if (angular.isObject(args[args.length-1])) {
        o = args.pop();
      } else {
        o = {};
      }
      return mocked(ngHalProvider.generateConstructor(args)(unfolded(o)));
    };

    mock.mockEnclosure = function () {
      var args = [].slice.call(arguments), url = args.pop();
      return this.mock.apply(this,
        args.concat({_links:{enclosure:{href:url||'file.ext'}}}));
    };

    return mock;
  }]);
});
