angular.module('prx.title', ['ui.router'])
.factory('stateTitle', function ($rootScope, $state, $injector) {
  var titleService = {
    parts: [],
    string: "",
    setPrefix: setPrefix,
    toString: toString
  };
  $rootScope.$on('$stateChangeSuccess', function () {
    var titles = [], cState = $state.$current;
    while (cState) {
      if (cState.self.title) {
        var title = cState.self.title;
        if (angular.isFunction(title) ||
          (angular.isArray(title) && angular.isFunction(title[title.length-1]))) {
            title = $injector.invoke(title, cState.self, cState.locals.globals);
        }
        titles.unshift.apply(titles, [].concat(title));
      }
      cState = cState.parent;
    }
    titleService.parts.length = titleService.prefix ? 1 : 0;
    [].push.apply(titleService.parts, titles);
    titleService.string = titleService.parts.join(' » ');
  });

  return titleService;

  function toString () { return this.string; }
  function setPrefix (prefix) {
    if (this.prefix) {
      this.parts.splice(0, 1, prefix);
    } else {
      this.parts.unshift(prefix);
    }
    this.prefix = prefix;
    this.string = this.parts.join(' » ');
  }
})
.directive('title', function (stateTitle, $compile) {
  return {
    restrict: 'E',
    compile: function (tElem) {
      if (tElem.attr('ng-bind')) { return; }
      stateTitle.setPrefix(tElem.text());
      tElem.attr('ng-bind', "stateTitle.string");
      return function (scope, iElem) {
        scope.stateTitle = stateTitle;
        $compile(iElem)(scope);
      };
    }
  };
});
