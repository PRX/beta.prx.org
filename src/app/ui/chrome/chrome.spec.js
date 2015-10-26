describe('ui.chrome', function () {
  var prxChrome, $scope, $state;
  beforeEach(module('prx.ui.chrome', function ($stateProvider) {
    $stateProvider.state('root', {
      url: '/'
    }).state('chromeless', {
      url: '/chromeless',
      data: {
        chromeless: true
      }
    }).state('notchromeless', {
      url: '/notchromeless',
      data: {
        chromeless: false
      }
    });
  }));

  beforeEach(inject(function ($rootScope, _prxChrome_, _$state_) {
    $state = _$state_;
    $scope = $rootScope.$new();
    prxChrome = _prxChrome_;
  }));

  it ('expects chrome to be visible by default', function () {
    expect(prxChrome.visible).toBeTruthy();
  });

  describe('states', function () {
    beforeEach(inject(function (_$stateParams_) {
      $stateParams = _$stateParams_;
      $state.go('root');
    }));

    it ('expects chrome to be hidden when state is chromeless', function () {
      $state.go('chromeless');
      expect(prxChrome.visible).toBeFalsy();
    });

    it ('expects chrome to be visible when state is not chromeless', function () {
      $state.go('notchromeless');
      expect(prxChrome.visible).toBeTruthy();
    });
  });
});
