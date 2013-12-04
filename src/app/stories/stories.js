angular.module('prx.stories', ['ui.state', 'restangular'])

.config(function ($stateProvider) {

  $stateProvider.state('story', {
    url: '/stories/:storyId',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    resolve: {
      story: function (Story, $stateParams) {
        return Story.get($stateParams.storyId);
      }
    }
  });

})
.factory('Story', function (Restangular) {
  return Restangular.withConfig(function (config) {
    config.setBaseUrl('http://api.prx4.dev/api/v1');
  }).all('stories');
})
.controller('StoryCtrl', function ($scope, story) {
  $scope.story = story;
});