(function () {
  var $q;
  angular.module('angular-hal-mock', ['angular-hal', 'ngMock', 'ng'])
  .config(function ($provide, ngHalProvider) {

    function unfolded(doc) {
      if (angular.isFunction(doc.links)) {
        doc._links = doc.links.dump();
      }
      return doc;
    }

    function promised(obj) {
      obj = $q.when(obj);
      var then = obj.then;
      obj.then = function () {
        return promised(then.apply(obj, [].slice.call(arguments)));
      };
      obj.follow = function (rel, params) {
        return promised(this.then(function (d) {
          return d.follow(rel, params);
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
      var docStubs = {};
      doc.stubFollow = function (rel, obj) {
        docStubs[rel] = promised(obj);
      };
      var originalFollow = doc.follow;
      doc.follow = function (rel, params) {
        if (typeof docStubs[rel] !== 'undefined') {
          return docStubs[rel];
        } else {
          return originalFollow.call(doc, rel, params);
        }
      };

      return doc;
    }

    ngHalProvider.setRootUrl('/_ngHal_mock_default');
    $provide.decorator('ngHal', function ($delegate) {
      $delegate.mock = function mock (o) {
        var args = Array.prototype.slice.call(arguments);
        if (angular.isObject(args[args.length-1])) {
          o = args.pop();
        } else {
          o = {};
        }

        return mocked(ngHalProvider.generateConstructor(args)(unfolded(o)));
      };

      return $delegate;
    });
  })
  .run(['$q', '$httpBackend', function (_$q_, $httpBackend) {
    $httpBackend.when('GET', '/_ngHal_mock_default').respond({});
    $q = _$q_;
  }]);
})();