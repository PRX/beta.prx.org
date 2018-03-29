describe('prx.home', function () {

  beforeEach(module('prx.home', 'angular-hal-mock'));

  describe ('HomeCtrl', function () {
    it ('attaches the picks injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      var controller = $controller('HomeCtrl', {picks: sigil, $scope: {$on: function () {}}});
      expect(controller.picks).toBe(sigil);
    }));
  });

  describe ('home state', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('home');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

    it ('gets the picks', function () {
      var spy = ngHal.stubFollow('prx:picks', ngHal.mock());
      $injector.invoke(state.resolve.picks, null, {});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe ('continuous playback', function () {

    function makePick() {
      var story = {
        id: sid++
      };
      story.soundParams = $q.when(story);
      story.toSoundParams = function () {
        return this.soundParams;
      };
      story.story = story;
      return {
        story: story
      };
    }

    var controller, $scope, sid=0, $q;
    beforeEach(inject(function ($controller, $rootScope, _$q_) {
      $q = _$q_;
      $scope = $rootScope.$new();
      controller = $controller('HomeCtrl', {picks: [], $scope: $scope});
    }));

    it ('sets next on $play event', function () {
      var pick = makePick();
      $scope.$emit("$play", pick);
      expect(typeof pick.next).toBe('function');
    });

    it ('wont clobber an existing "next"', function () {
      var pick = makePick();
      pick.next = "sigil";
      $scope.$emit("$play", pick);
      expect(pick.next).toBe("sigil");
    });

    it ('schedules the next thing in the list of picks', function () {
      controller.picks.push(makePick(), makePick(), makePick());
      $scope.$emit("$play", controller.picks[1]);
      expect(controller.picks[1].next()).toResolveTo(controller.picks[2].story);
    });

    it ('falls off the end when there is nothing else to play', function () {
      controller.picks.push(makePick());
      $scope.$emit("$play", controller.picks[0]);
      expect(controller.picks[0].next()).toResolveTo(undefined);
    });
  });

});
