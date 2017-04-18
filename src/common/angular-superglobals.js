var angular = require('angular');

// suuuuper
var app = angular.module('ngSuperglobal', []);
module.exports = app.name;

app.provider('ngSuperGlobals', {
  key: 'ngSuperGlobals',
  setKey: function (key) {
    this.key = key;
    return this;
  },
  $get: ['$rootScope', function ($rootScope) {
    var bindings = [], baseKey = this.key;
    function SuperGlobals() {
      angular.element(window).on('storage', function (event) {
        var copies = [];
        angular.forEach(bindings, function (binding) {
          if (binding.key === event.key) {
            copies.push([angular.fromJson(event.newValue), binding.object]);
          }
        });
        if (copies.length > 0) {
          $rootScope.$apply(function () {
            angular.forEach(copies, function (copy) {
              angular.copy(copy[0], copy[1]);
            });
          });
        }
      });
    }
    SuperGlobals.prototype = {
      bind: function (key, object) {
        var boot = true;
        if (!angular.isString(key) && !angular.isDefined(object)) {
          object = key;
          key = baseKey;
        } else {
          key = baseKey + '/' + key;
        }
        if (angular.toJson(object) == "{}" && localStorage[key]) {
          angular.copy(angular.fromJson(localStorage[key]), object);
        } else {
          localStorage.setItem(key, angular.toJson(object));
        }

        $rootScope.$watch(function () {
          return angular.toJson(object);
        }, function (is) {
          if (boot) {
            boot = false;
          } else {
            localStorage.setItem(key, is);
          }
        });
        bindings.push(new Binding(key, object));
        return this;
      }
    };
    var object = new SuperGlobals();
    object.bind(object);

    return object;

    function Binding(key, object) {
      this.key = key;
      this.object = object;
    }
  }]
});
