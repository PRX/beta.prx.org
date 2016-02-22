var angular = require('angular');

// breadcrumbs
var app = angular.module('prx.breadcrumbs', [
  require('angular-ui-router')
]);
module.exports = app.name;

app.factory('stateCrumbs', function ($rootScope, $state, $injector, $window, $timeout) {
  var stateCrumbs = {
    crumbs: [],
    title: "",
    toString: toString,
    setSuffix: setSuffix
  };

  function setTitle () {
    $timeout(function () {
      var crumbs = [], depth = 0, title, cState = $state.$current;

      while (cState) {
        if (cState.self.title) {
          title = cState.self.title;
          if (angular.isFunction(title) ||
            (angular.isArray(title) && angular.isFunction(title[title.length-1]))) {
              title = $injector.invoke(title, cState.self, cState.locals.globals);
          }
          crumbs.push(mkCrumb(title, cState.self, depth));
        }
        depth += 1;
        cState = cState.parent;
      }

      if (crumbs.length) {
        stateCrumbs.title = crumbs[0].title + (stateCrumbs.suffix || '');
      }

      stateCrumbs.crumbs = crumbs;

      if ($window.history.replaceState) {
        $window.history.replaceState({}, stateCrumbs.title);
      }
    });
  }

  $rootScope.$on('$stateChangeSuccess', setTitle);
  $rootScope.stateCrumbs = stateCrumbs;

  return stateCrumbs;

  function toString () { return this.title; }
  function setSuffix(suffix) {
    this.suffix = suffix;
    if (this.crumbs.length) {
      this.title = this.crumbs[0].title + suffix;
    }
  }

  function mkCrumb(title, state, depth) {
    var crumb = {title: title};
    if (!state.abstract && depth) {
      for(var i=0, a=[]; i<depth; i++) {
        a.push('^');
      }
      crumb.sref = a.join('');
    }
    return crumb;
  }
})
.directive('title', function (stateCrumbs, $compile) {
  return {
    restrict: 'E',
    compile: function (tElem) {
      if (tElem.attr('ng-bind')) { return; }
      stateCrumbs.setSuffix(" on " + tElem.text());
      tElem.attr('ng-bind', "stateCrumbs.title");
      return function (scope, iElem) {
        scope.stateCrumbs = stateCrumbs;
        stateCrumbs.title = tElem.text();
        $compile(iElem)(scope);
      };
    }
  };
});
