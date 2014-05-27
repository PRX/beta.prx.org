angular.module('prx', ['ngAnimate',
  'ngSanitize',
  'prxNavigation',
  'ngTouch',
  'ui.router',
  'prx.home',
  'prx.stories',
  'prx.accounts',
  'prx.series',
  'templates',
  'prx.player',
  'ngFlag',
  'prx.experiments',
  'angulartics',
  'angulartics.google.analytics',
  'angulartics.prx.count',
  'prx.appCtrl',
  'prx.errors',
  'prx.modal',
  'prx.modelConfig',
  'ngMobile',
  'prx.breadcrumbs'])
.config(function ($locationProvider, ngFlagProvider,
  $analyticsProvider, $stateProvider, prxperimentProvider) {
  $analyticsProvider.firstPageview(false);
  $analyticsProvider.virtualPageviews(false);
  $locationProvider.html5Mode(true);
  prxperimentProvider.base('https://x.prx.org')
  .clientId(['$q', '$window', function ($q, $window) {
    if (angular.isDefined($window.ga)) {
      var deferred = $q.defer();
      $window.ga(function (tracker) { deferred.resolve(tracker.get('clientId')); });
      return deferred.promise;
    } else {
      return 'tests';
    }
  }]).enabled(FEAT.APPLICATION_VERSION != 'development' && FEAT.APPLICATION_VERSION != 'integration');
  ngFlagProvider.flags(FEAT.JSON);
}).run(function ($rootScope, $location, $analytics, $timeout) {
  $rootScope.$on('$stateChangeSuccess', function () {
    var url = $analytics.settings.pageTracking.basePath + $location.url();
    $timeout(function () {  $analytics.pageTrack(url); });
  });
});
angular.module('prx.modelConfig', ['angular-hal'])
.config(function (ngHalProvider) {
  ngHalProvider.mixin('http://meta.prx.org/model/:type/*splat', ['type', function (type) {
    var stateName = type+'.show';
    var idName = type + 'Id';
    return {
      stateName: type + '.show',
      stateParams: function () {
        if(!angular.isDefined(this.$$stateParams)) {
          this.$$stateParams = {};
          this.$$stateParams[idName] = this.id;
        }
        return this.$$stateParams;
      }
    };
  }])
  .mixin('http://meta.prx.org/model/image/*splat', ['resolved', function (resolved) {
    resolved.enclosureUrl = resolved.call('link', 'enclosure').call('url');
  }]);
});
angular.module('prx.appCtrl', ['prx.player', 'prx.url-translate'])
.controller('appCtrl', function ($scope, $location, prxPlayer, urlTranslate) {
  var app = this;
  this.player = prxPlayer;

  $scope.$on('$stateChangeSuccess', function () {
    $scope.loading = false;
    app.desktopUrl = "http://www.prx.org" + urlTranslate($location.path()) + "?m=false";
  });

  $scope.$on('$stateChangeStart', function () {
    $scope.loading = true;
  });

  $scope.$on('$stateChangeError', function () {
    $scope.loading = false;
  });
})
.filter('timeAgo', function () {
  return function (time) {
    if (!(time instanceof Date)) {
      time = Date.parse(time);
    }
    var diff = Math.floor(new Date() - time);
    var seconds = Math.round(diff / 1000);
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;
    var months = (years - Math.floor(years)) * 12;
    if (seconds < 15) {
      return "just now";
    } else if (seconds < 45) {
      return seconds + " seconds ago";
    } else if (seconds < 90) {
      return "about a minute ago";
    } else if (minutes < 45) {
      return Math.round(minutes) + " minutes ago";
    } else if (minutes < 90) {
      return "about an hour ago";
    } else if (hours < 24) {
      return Math.round(hours) + " hours ago";
    } else if (hours < 40) {
      return "about a day ago";
    } else if (days < 28) {
      return Math.round(days) + " days ago";
    } else if (days < 40) {
      return "about a month ago";
    } else if (days < 365) {
      return Math.round(months) + " months ago";
    } else if (years < 2 && months < 11.5) {
      if (months >= 1.5) {
        return "a year and " + Math.round(months) + " months ago";
      } else {
        return "about a year ago";
      }
    } else if (months >= 1.5 && months < 11.5) {
        return Math.floor(years) + " years and " + Math.round(months) + " months ago";
    } else {
      return Math.round(years) + " years ago";
    }
  };
})
.directive('prxImg', function ($timeout) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      src: '=',
      defaultClass: '@',
      default: '@'
    },
    template: "<div class='img'><img></div>",
    link: function (scope, element) {
      var img = element.children();

      img.on('load', function () {
        element.removeClass('loading');
        element.removeClass(scope.defaultClass);
        element.css({'background-image': 'url('+img.attr('src')+')', 'background-size': 'cover', 'background-repeat': 'no-repeat'});
      });
      scope.$watch('src', function (src) {
        if (src || scope.default) {
          img.attr('src', src || scope.default);
          element.addClass('loading');
          element.removeClass(scope.defaultClass);
        } else {
          img.removeAttr('src');
          element.removeClass('loading');
          element.addClass(scope.defaultClass);
        }
      });
    }
  };
})
.directive('uiSref', function ($compile) {
  return {
    restrict: 'A',
    priority: 1000,
    compile: function (tElem) {
      return {
        pre: function (scope, element, attrs) {
          var obj, newState = attrs.uiSref, lastScope;
          try {
            obj = scope.$eval(newState);
          } catch (e) {
            return;
          }
          if (obj) {
            scope.$watch(newState, function (obj) {
              if (angular.isFunction(obj.stateName)) {
                newState = obj.stateName();
              } else if (angular.isString(obj.stateName)) {
                newState = obj.stateName;
              }
              if (angular.isFunction(obj.stateParams)) {
                newState = newState + '('+JSON.stringify(obj.stateParams())+')';
              }
              attrs.uiSref = newState;
              element.attr('ui-sref', newState);
              if (lastScope) {
                lastScope.$destroy();
              }
              lastScope = scope.$new();
              element.unbind("click");
              $compile(element)(lastScope);
            });
          }
        }
      };
    }
  };
})
.directive('stickyScroller', function ($window) {
  var UP = 1, DOWN = 0;

  return {
    restrict: 'A',
    link: function (scope, element) {
      var fromPos = 0, pos = 0, dir = 3;

      if ($window.requestAnimationFrame) {
        handle();
      }

      function handle () {
        var newPos = Math.max(0, $window.scrollY);
        if (newPos < pos) {
          if (dir != UP) {
            fromPos = pos;
            dir = UP;
            element.css({'position': 'absolute', 'top' : pos - element[0].offsetHeight + 'px'});
          }
          if (fromPos - newPos >= element[0].offsetHeight) {
            element.removeClass('hidden');
            element.css({'position': 'fixed', 'top': '0px'});
          }
        } else if (newPos > pos) {
          if (dir != DOWN) {
            element.addClass('hidden');
            element.css({'position': 'absolute', 'top': newPos + 'px'});
            dir = DOWN;
          }
        }
        pos = newPos;
        $window.requestAnimationFrame(handle);
      }
    }
  };
});
