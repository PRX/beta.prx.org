var angular = require('angular');

// top-level application
var app = angular.module('prx.appCtrl', [
  require('./ui/nav/nav'),
  require('./ui/chrome/chrome'),
  require('./player/player'),
  require('../common/url-translater'),
  require('./errors/errors'),
  (FEAT.SHOW_TCFDEMO ? require('./upload/upload') : 'ng')
]);
module.exports = app.name;

app.controller('appCtrl', function ($scope, $location, prxPlayer, prxChrome, urlTranslate, prxError, PRXFilePicker, Upload, $state) {
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
  if (FEAT.SHOW_TCFDEMO) {
    app.showFileTarget = function (event) {
      var ev = $scope.$broadcast('dragOver');
      if (!ev.defaultPrevented) {
        PRXFilePicker.selectFiles(['audio/*'], false).then(function (files) {
          var guids = [];
          angular.forEach(files, function (file) {
            guids.push(Upload.upload(file).guid);
          });
          $state.go('story.edit.create', {uploadIds: guids});
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

if (!FEAT.SHOW_TCFDEMO) {
  app.service('PRXFilePicker', angular.noop).service('Upload', angular.noop);
}
