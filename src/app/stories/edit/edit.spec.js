describe('prx.stories.edit', function () {
  beforeEach(module('prx.stories.edit', 'angular-hal-mock'));

  describe ('story state', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('story.create');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

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
        $scope: scope
      };
    }));

    it ('attaches the story and accounts injected to $scope', function () {
      var controller = $controller('StoryPreviewCtrl', injects);

      expect(controller.current).toBe(mock);
      expect(controller.account).toBe(mock);
    });
  });
});
