angular.module('prx.picks', ['prx.modelConfig'])
.config(function (ngHalProvider) {
  ngHalProvider.mixin('http://meta.prx.org/model/pick/*any', ['resolved', function (resolved) {
    resolved.story = resolved.follow('prx:story');
    resolved.account = resolved.follow('prx:account');
  }]);
})
.directive('prxPick', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/pick.html',
    scope: {pick: '='}
  };
})
;
