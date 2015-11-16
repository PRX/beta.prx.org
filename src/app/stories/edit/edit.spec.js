describe ('prx.stories.edit', function () {
  beforeEach(module('prx.stories.edit', 'angular-hal-mock'));

  // describe ('state provider decorator', function () {
  //   beforeEach(inject(function ($stateProvider) {
  //     $stateProvider.state('livestate', {
  //       views: {
  //         '@': {
  //           template: 'stories/story.html',
  //           live: true
  //         }
  //       }
  //     });
  //   }));
  //
  //   it ('', function () {
  //
  //   });
  // });

  // TODO Move this to another module when the directive gets moved
  describe ('lockParentScrolling directive', function () {
    var elem, scope;

    beforeEach(inject(function ($rootScope, $compile) {
      scope = $rootScope.$new();
      elem = $compile('<div lock-parent-scrolling></div>')(scope);
      scope.$digest();
    }));

    it ('compiles', function () {
      expect(elem).toBeDefined();
    });

    it ('', function () {

    });
  });

  // TODO Move this to another module when the directive gets moved
  describe ('xiProgressBar directive', function () {
    var elem, scope;

    beforeEach(inject(function ($rootScope, $compile) {
      scope = $rootScope.$new();
      scope.foo = { progress: 0 };
      elem = $compile('<xi-progress-bar progress="foo.progress"></xi-progress-bar>')(scope);
      scope.$digest();
    }));

    it ('compiles', function () {
      expect(elem).toBeDefined();
    });

    it ('updates its width when progress changes', function () {
      scope.foo.progress = 0.5;
      scope.$digest();
      expect(elem.children().eq(0).css('width')).toBe('50%');
    });
  });

  describe ('prxImageFileFactory', function () {
    var prxImageFileFactory, Upload;
    beforeEach(inject(function (_prxImageFileFactory_, _Upload_) {
      prxImageFileFactory = _prxImageFileFactory_;
      Upload = Upload;
    }));

    // it ('return an PrxImageFile', function () {
    //   var upload = Upload.upload();
    //   var imageFile = prxImageFileFactory(upload);
    //   expect(imageFile).toBeTruthy();
    // });
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

  describe ('StoryEditContextMenuCtrl', function () {
    var controller, mock, ngHal, injects, scope;
    beforeEach(inject(function (_$controller_, _ngHal_, $rootScope) {
      ngHal = _ngHal_;
      $controller = _$controller_;
      mock = ngHal.mock();
      scope = $rootScope.$new();
      injects = {
        story: mock = ngHal.mock(),
        audioFiles: []
      };
    }));

    it ('save method returns a story', function () {
      var controller = $controller('StoryEditContextMenuCtrl', injects);

      // TODO
      // expect(controller.save);
    });
  });

  describe ('StoryEditCtrl', function () {
    var ngHal, $controller, mock, injects, scope;
    beforeEach(inject(function (_ngHal_, _$controller_, $rootScope) {
      ngHal = _ngHal_;
      $controller = _$controller_;
      mock = ngHal.mock();
      scope = $rootScope.$new();
      injects = {
        story: mock,
        audioFiles: [],
        imageFiles: [],
        $scope: scope
      };
    }));

    it ('attaches the story injected to $scope', function () {
      var controller = $controller('StoryEditCtrl', injects);

      expect(controller.current).toBe(mock);
      expect(controller.imageFiles).toBe([]);
    });
  });

  describe ('StoryPreviewCtrl', function () {
    var ngHal, $controller, mock, injects, scope, $window;
    beforeEach(inject(function (_ngHal_, _$controller_, $rootScope, _$window_) {
      ngHal = _ngHal_;
      $controller = _$controller_;
      $window = _$window_;
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

    it ('removes the onbeforeunload when the scope is destroyed', function () {
      var controller = $controller('StoryPreviewCtrl', injects);
      scope.$destroy();
      scope.$digest();
      expect($window.onbeforeunload).toBeFalsy();
    });

    it ('attaches the story and accounts injected to $scope', function () {
      var controller = $controller('StoryPreviewCtrl', injects);

      expect(controller.current).toBe(mock);
      expect(controller.account).toBe(mock);
    });
  });
});
