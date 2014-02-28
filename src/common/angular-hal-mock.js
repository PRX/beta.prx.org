angular.module('angular-hal-mock', ['angular-hal', 'ngMock', 'ng'])
.config(function ($provide, ngHalProvider) {
  var $q, $rootScope, FAKE_ROOT = 'http://nghal.org/fake_root';

  function unfolded(doc) {
    if (angular.isFunction(doc.links)) {
      doc._links = doc.links.dump();
    }
    return doc;
  }

  function promised(obj) {
    var sfs = [];
    var sfos = [];
    obj = $q.when(obj).then(function (obj) {
      angular.forEach(sfs, function (sf) {
        obj.stubFollow.apply(obj, sf);
      });
      angular.forEach(sfos, function (sfo) {
        obj.stubFollowOne.apply(obj, sfo);
      });
      return obj;
    }).then(function (doc) {
      if (doc && doc.transform) {
        return doc.transform();
      }
      return doc;
    });
    var then = obj.then;
    obj.stubFollow = function () {
      sfs.push([].slice.call(arguments));
    };
    obj.stubFollowOne = function() {
      sfos.push([].slice.call(arguments));
    };
    obj.then = function () {
      return promised(then.apply(obj, [].slice.call(arguments)));
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
      docFollowStubs[rel] = promised(obj);
    };
    doc.stubFollowOne = function (rel, obj) {
      docFollowOneStubs[rel] = promised(obj);
    };
    var originalFollow = doc.follow;
    doc.follow = function (rel, params) {
      if (typeof docFollowStubs[rel] !== 'undefined') {
        return docFollowStubs[rel];
      } else {
        return originalFollow.call(doc, rel, params);
      }
    };
    var originalFollowOne = doc.followOne;
    doc.followOne = function(rel, params) {
      if (typeof docFollowOneStubs[rel] !== 'undefined') {
          return docFollowOneStubs[rel];
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

    mock.mockEnclosure = function (url) {
      return this.mock({_links:{enclosure:{href:url||'file.ext'}}});
    };

    return mock;
  }]);
});
