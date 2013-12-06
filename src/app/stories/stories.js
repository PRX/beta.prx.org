angular.module('prx.stories', ['ui.state', 'restangular', 'angular-hal'])

.config(function ($stateProvider, ngHalProvider) {

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

  ngHalProvider.defineModel('http://meta.prx.org/model/story', {
    getSound: function () {
      console.log("got a sound!");
    }
  });

  ngHalProvider.setEntrypoint('http://api.prx4.dev/api/v1');

})
.factory('Story', function (Restangular) {
  return Restangular.withConfig(function (config) {
    config.setBaseUrl('http://api.prx4.dev/api/v1');
  }).all('stories');
})
.controller('StoryCtrl', function ($scope, story, ngHal) {
  $scope.story = story;
});