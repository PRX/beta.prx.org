describe('prx.home', function () {

  beforeEach(module('prx.home', 'angular-hal-mock'));

  if (!FEAT.HOME_PAGE) {
    it ('redirects from home to home.nxt', inject(function ($rootScope, $state) {
      spyOn($state, 'go');
      $rootScope.$broadcast('$stateChangeStart', {name: 'home'});
      expect($state.go).toHaveBeenCalled();
    }));
  }

  describe ('HomeCtrl', function () {
    it ('attaches the picks injected to $scope', inject(function ($controller) {
      var controller = $controller('HomeCtrl', {
        picks: 'sigil',
        pickList: {},
        $scope: {$on: function () {}},
        $filter: null
      });
      expect(controller.picks).toBe('sigil');
      expect(controller.hasMore).toBeFalsy();
      expect(controller.loadingMore).toBeFalsy();
    }));

    it ('checks the pickList for hasMore', inject(function ($controller) {
      var controller = $controller('HomeCtrl', {
        picks: 'sigil',
        pickList: {link: function() {return true;}},
        $scope: {$on: function () {}},
        $filter: null
      });
      expect(controller.picks).toBe('sigil');
      expect(controller.hasMore).toBeTruthy();
      expect(controller.loadingMore).toBeFalsy();
    }));
  });

  describe ('home state', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('home');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

    it ('gets the pickList', function () {
      var spy = ngHal.stubFollow('prx:picks', ngHal.mock());
      $injector.invoke(state.resolve.pickList, null, {});
      expect(spy).toHaveBeenCalled();
    });

    it ('gets the picks from the pickList', function () {
      var mock = ngHal.mock();
      var spy = mock.stubFollow('prx:items');
      $injector.invoke(state.resolve.picks, null, {pickList: mock});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe ('loadMore', function () {
    it ('loads the next page', inject(function ($controller, _ngHal_) {
      var pickList = _ngHal_.mock();
      var nextPicks = _ngHal_.mock();
      var spy = pickList.stubFollow('next', nextPicks);
      var spy2 = nextPicks.stubFollow('prx:items', ['bar']);
      var controller = $controller('HomeCtrl', {
        picks: ['foo'],
        pickList: pickList,
        $scope: {$on: function () {}},
        $filter: function() { return function(a) {return a;}; }
      });
      controller.loadMore();
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(controller.picks).toEqual(['foo', 'bar']);
      expect(controller.hasMore).toBeFalsy();
      expect(controller.loadingMore).toBeFalsy();
    }));
  });

  describe ('onScrollIn', function () {
    it ('triggers when an element scrolls into view', inject(function ($compile, $rootScope, $window) {
      if ($window.parent._phantom) {
        return; // window scroll detection doesn't work here
      }

      var elem = angular.element("<div style='padding-top:1000px'><div style='height:10px' on-scroll-in='triggered=true'></div></div>");
      var scope = $rootScope.$new();
      elem = $compile(elem)(scope);
      win = angular.element($window);
      $window.document.body.appendChild(elem[0]);

      win.triggerHandler('scroll');
      expect(scope.triggered).toBeFalsy();

      $window.scroll(0, 1000 - $window.innerHeight - 100);
      win.triggerHandler('scroll');
      expect(scope.triggered).toBeFalsy();

      $window.scroll(0, 1000 - $window.innerHeight + 100);
      win.triggerHandler('scroll');
      expect(scope.triggered).toBeTruthy();

      $window.document.body.removeChild(elem[0]);
      scope.$destroy();
    }));
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
      controller = $controller('HomeCtrl', {
        pickList: {link: function() {}},
        picks: [],
        $scope: $scope
      });
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
