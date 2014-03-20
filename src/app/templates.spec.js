describe('templates', function () {
  var $scope, $compile;

  beforeEach(module('prx', 'templates', function ($provide, $stateProvider) {
    $stateProvider.state('fakeState', {});

    $provide.decorator('$templateCache', function ($delegate) {
      var put = $delegate.put;
      $delegate.toTest = [];
      $delegate.put = function (uri) {
        this.toTest.push(uri);
        return put.apply(this, [].slice.call(arguments));
      };
      return $delegate;
    });
  }));

  beforeEach(inject(function ($state, $rootScope, _$compile_) {
    var fakeState = $state.get('fakeState');
    fakeState.parent = fakeState;
    $state.$current = fakeState;

    $scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it ('can compile all templates', inject(function ($templateCache) {
    angular.forEach($templateCache.toTest, function (uri) {
      $compile($templateCache.get(uri))($scope);
    });
  }));
});
