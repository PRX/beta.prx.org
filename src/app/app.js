angular.module('prx', ['ngAnimate',
  'ngSanitize',
  'prx.ui',
  'prxNavigation',
  'ngTouch',
  'ngStorage',
  'ui.router',
  'prx.ui',
  'ui.sortable',
  'prx.home',
  'prx.stories',
  'prx.accounts',
  'prx.series',
  'templates',
  'prx.player',
  'prx.donations',
  'ngFlag',
  'prx.experiments',
  'angulartics',
  'angulartics.google.analytics',
  'angulartics.prx.count',
  'prx.appCtrl',
  'prx.errors',
  'prx.modal',
  'prx.embed',
  'prx.welcome',
  'prx.modelConfig',
  'ngMobile',
  'prx.breadcrumbs',
  'prx.ads',
  'prx.auth'])
.config(function (ngFlagProvider,
  $analyticsProvider, $stateProvider, prxperimentProvider, PRXDrawerProvider) {
  $analyticsProvider.firstPageview(false);
  $analyticsProvider.virtualPageviews(false);
  prxperimentProvider.base('https://x.prx.org')
  .clientId(['$q', '$window', function ($q, $window) {
    /* istanbul ignore if */
    if (angular.isDefined($window.ga)) {
      var deferred = $q.defer();
      $window.ga(function (tracker) { deferred.resolve(tracker.get('clientId')); });
      return deferred.promise;
    } else {
      return 'tests';
    }
  }]);
  /* istanbul ignore next */
  if (!(FEAT.APPLICATION_VERSION != 'development' && FEAT.APPLICATION_VERSION != 'integration' && !window.callPhantom)) {
    prxperimentProvider.enabled(false);
  }
  ngFlagProvider.flags(FEAT.JSON);

  PRXDrawerProvider.register({
    name: 'Search',
    weight: PRXDrawerProvider.TOP,
    href: 'http://www.prx.org/search/all',
    type: 'search'
  }, {
    name: 'Browse',
    href: 'http://www.prx.org/pieces',
    type: 'category',
    children: [
      {
        name: "Diary",
        href: "http://www.prx.org/format/Diary",
        type: "item"
      },
      {
        name: "Documentary",
        href: "http://www.prx.org/format/Documentary",
        type: "item"
      },
      {
        name: "Essay",
        href: "http://www.prx.org/format/Essay",
        type: "item"
      },
      {
        name: "Fiction",
        href: "http://www.prx.org/format/Fiction",
        type: "item"
      },
      {
        name: "News Reporting",
        href: "http://www.prx.org/format/News%20Reporting",
        type: "item"
      },
      {
        name: "Special",
        href: "http://www.prx.org/format/Special",
        type: "item"
      },
    ]
  });
}).run(function ($rootScope, $location, $analytics, $timeout) {
  $rootScope.$on('$stateChangeSuccess', function () {
    var url = $analytics.settings.pageTracking.basePath + $location.url();
    $timeout(function () {  $analytics.pageTrack(url); }, 2);
  });
});
angular.module('prx.base',['prx'])
.config(/* istanbul ignore next */
  function ($locationProvider) {
    $locationProvider.html5Mode(true);
}).run(/* istanbul ignore next */
  function (PrxAuth) {
    PrxAuth.$checkLoggedIn();
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
(function () {
  var acm = angular.module('prx.appCtrl', ['prx.embed', 'prx.player', 'prx.url-translate', 'prx.errors', (FEAT.TCF_DEMO ? 'prx.upload' : 'ng')])
  .controller('appCtrl', function ($scope, $location, prxPlayer, prxChrome, urlTranslate, prxError, PRXFilePicker, Upload, $state) {
    var app = this;
    this.player = prxPlayer;
    this.chrome = prxChrome;

    app.fileTargetVisible = false;

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

    /* istanbul ignore next */
    if (FEAT.TCF_DEMO) {
      app.showFileTarget = function (event) {
        var ev = $scope.$broadcast('dragOver');
        if (!ev.defaultPrevented) {
          PRXFilePicker.selectFiles().then(function (files) {
            var guids = [];
            angular.forEach(files, function (file) {
              guids.push(Upload.upload(file).guid);
            });
            $state.go('story.create', {uploadIds: guids});
          }, function (error) {
            console.log(error);
          });
        }
      };
    }
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
  .directive('bindCanonical', function ($location, urlTranslate) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var attr = attrs.bindCanonical || 'href';
        scope.$on('$stateChangeSuccess', function () {
          elem.attr(attr, "http://www.prx.org" + urlTranslate($location.path()));
        });
      }
    };
  });

  if (!FEAT.TCF_DEMO) {
    acm.service('PRXFilePicker', angular.noop).service('Upload', angular.noop);
  }
})();
// .directive('quickReturn', function ($window) {
//   var UP = 1, DOWN = 0, STILL = -1;
//
//   return {
//     restrict: 'A',
//     link: function (scope, element) {
//       var fromPos = 0, pos = 0, dir = STILL;
//
//       if ($window.requestAnimationFrame) {
//         handle();
//       }
//
//       function handle () {
//         var newPos = Math.max(0, $window.scrollY);
//         if (newPos < pos) {
//           if (dir != UP) {
//             fromPos = pos;
//             dir = UP;
//             element.css({'position': 'absolute', 'top' : newPos - element[0].offsetHeight + 'px'});
//           }
//           if (fromPos - newPos >= element[0].offsetHeight) {
//             element.removeClass('hidden');
//             element.css({'position': 'fixed', 'top': '0px'});
//           }
//         } else if (newPos > pos) {
//           if (dir != DOWN) {
//             element.addClass('hidden');
//             element.css({'position': 'absolute', 'top': pos + 'px'});
//             dir = DOWN;
//           }
//         }
//         pos = newPos;
//         $window.requestAnimationFrame(handle);
//       }
//     }
//   };
// });
