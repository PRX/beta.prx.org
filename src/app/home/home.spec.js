describe('prx.home', function () {

  beforeEach(module('prx.home', 'angular-hal-mock'));

  if (!FEAT.HOME_PAGE) {
    it ('redirects from home to home.nxt', inject(function ($rootScope, $state) {
      spyOn($state, 'go');
      $rootScope.$broadcast('$stateChangeStart', {name: 'home'});
      expect($state.go).toHaveBeenCalled();
    }));
  }

  if (FEAT.HOME_PAGE) {
    describe ('HomeCtrl', function () {
      it ('attaches the picklist injected to $scope', inject(function ($controller) {
        var sigil = 'sigil';
        var scope = {};
        var controller = $controller('HomeCtrl', {picklist: sigil});
        expect(controller.picklist).toBe(sigil);
      }));
    });
  }


  describe ('home state', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('home');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

    it ('gets the picklist', function () {
      var spy = ngHal.stubFollow('prx:pick-list', ngHal.mock());
      $injector.invoke(state.resolve.picklist, null, {});
      expect(spy.calls.mostRecent().args[0]).toEqual({id: FEAT.home_pick_list_id});
    });
  });

});
