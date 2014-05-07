describe('prx.home', function () {

  beforeEach(module('prx.home'));

  var flagProvider;

   beforeEach(module('ngFlag', function (ngFlagProvider) {
      flagProvider = ngFlagProvider;
   }));

  it ('redirects from home to home.nxt when HOME_PAGE feature is false', inject(function ($rootScope, $state) {
    spyOn($state, 'go');
    flagProvider.flags({HOME_PAGE: false});
    $rootScope.$broadcast('$stateChangeStart', {name: 'home'});
    expect($state.go).toHaveBeenCalled();
  }));
});
