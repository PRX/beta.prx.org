describe ('prx.stories.edit', function () {
  beforeEach(module('prx.stories.edit', 'angular-hal-mock'));

  describe ('state provider decorator', function () {
    beforeEach(inject(function ($stateProvider) {
      $stateProvider.state('livestate', {
        views: {
          '@': {
            template: 'stories/story.html',
            live: true
          }
        }
      });
    }));

    it ('', function () {

    });
  });

  describe ('story create state', function () {
    var state, $injector, ngHal, prxPlayer, prxSoundFactory;
    beforeEach(inject(function ($state, _$injector_, _ngHal_, _prxPlayer_, _prxSoundFactory_) {
      state = $state.get('story.edit.create');
      $injector = _$injector_;
      ngHal = _ngHal_;
      prxPlayer = _prxPlayer_;
      prxSoundFactory = _prxSoundFactory_;
    }));
  });

  describe ('story edit state', function () {
    var state, $injector, ngHal, prxPlayer, prxSoundFactory;
    beforeEach(inject(function ($state, _$injector_, _ngHal_, _prxPlayer_, _prxSoundFactory_) {
      state = $state.get('story.edit');
      $injector = _$injector_;
      ngHal = _ngHal_;
      prxPlayer = _prxPlayer_;
      prxSoundFactory = _prxSoundFactory_;
    }));

    it ('stops the player when exiting state and preview is playing', function () {
      var sound = prxSoundFactory({
        data: { preview: true }
      });

      prxPlayer.nowPlaying = sound;
      spyOn(prxPlayer, "stop");
      $injector.invoke(state.onExit);
      expect(prxPlayer.stop).toHaveBeenCalled();
    });

    it ('does not stop the player when exiting state and preview is not playing', function () {
      var sound = prxSoundFactory({
        data: { preview: false }
      });

      prxPlayer.nowPlaying = sound;
      spyOn(prxPlayer, "stop");
      $injector.invoke(state.onExit);
      expect(prxPlayer.stop).not.toHaveBeenCalled();
    });

    it ('does nothing to the player when leaving state and nothing is playing', function () {
      spyOn(prxPlayer, "stop");
      $injector.invoke(state.onExit);
      expect(prxPlayer.stop).not.toHaveBeenCalled();
    });
  });

  describe ('StoryPreviewCtrl', function () {
    var ngHal, $controller, mock, injects, scope;
    beforeEach(inject(function (_ngHal_, _$controller_, $rootScope) {
      ngHal = _ngHal_;
      $controller = _$controller_;
      mock = ngHal.mock();
      scope = $rootScope.$new();
      injects = {
        story: mock,
        account: mock,
        audioFiles: [],
        imageFiles: [],
        audioUrls: [mock],
        audioVersions: [mock],
        musicalWorks: [mock],
        musicalWorksList: mock,
        $scope: scope,
        series: false
      };
    }));

    it ('attaches the story and accounts injected to $scope', function () {
      var controller = $controller('StoryPreviewCtrl', injects);

      expect(controller.current).toBe(mock);
      expect(controller.account).toBe(mock);
    });
  });
});
