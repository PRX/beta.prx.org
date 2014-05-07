describe('prx.home', function () {

  beforeEach(module('prx.home'));

  if (!FEAT.HOME_PAGE) {
    it ('redirects from home to home.nxt', inject(function ($rootScope, $state) {
      spyOn($state, 'go');
      $rootScope.$broadcast('$stateChangeStart', {name: 'home'});
      expect($state.go).toHaveBeenCalled();
    }));
  }

});
