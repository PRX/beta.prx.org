describe('prx.stories', function () {

  beforeEach(module('prx.stories'));


  describe ('StoryCtrl', function () {
    it ('attaches the story injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      $controller('StoryCtrl', {story: sigil, titleSize: 'foo', $scope: scope});
      expect(scope.story).toBe(sigil);
    }));
  });

  // describe ('Story', function () {
  //   it ('has a get method', inject(function (Story, $httpBackend) {
  //     $httpBackend.when('/stories/123').respond({title: 'foo'});
  //     expect(Story.get(123)).toBeDefined();
  //   }));
  // });
});