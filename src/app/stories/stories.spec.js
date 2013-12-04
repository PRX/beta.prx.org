describe('prx.stories', function () {

  beforeEach(module('prx.stories'));

  describe ('StoryCtrl', function () {
    it ('attaches the story injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      $controller('StoryCtrl', {story: sigil, $scope: scope});
      expect(scope.story).toBe(sigil);
    }));
  });
});