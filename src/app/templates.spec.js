describe('templates', function () {
  var $scope, $compile;
  beforeEach(function () {
    angular.module('prx').directive('transcludeabilibuddy', function () {
      return {
        restrict: 'E',
        transclude: true
      };
    });
  });


  beforeEach(module('prx', 'templates', function ($provide, $stateProvider) {
    $stateProvider.state('fakeState', {});

    $provide.decorator('$templateCache', function ($delegate) {
      var put = $delegate.put;
      $delegate.toTest = [];
      $delegate.put = function (uri) {
        if (!/\.directive\.html$/.test(uri)) {
          this.toTest.push(uri);
        }
        return put.apply(this, [].slice.call(arguments));
      };
      return $delegate;
    });
  }));

  beforeEach(inject(function ($state, $rootScope, _$compile_, $httpBackend) {

    //Set up an endless tree of states
    $state.go('fakeState');
    $state.$current.parent = $state.$current;
    $httpBackend.when('GET').respond({});
    $scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it ('can compile all templates', inject(function ($templateCache) {

    angular.forEach($templateCache.toTest, function (uri) {
      try {
        $compile("<transcludeabilibuddy>" + $templateCache.get(uri) + "</transcludeabilibuddy>")($scope);
      } catch (e) {
        expect(uri + " compiles").toBe(true);
        throw e;
      }
    });
  }));
});
