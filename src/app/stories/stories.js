angular.module('prx.stories', ['ui.state'])

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
.factory('Story', function ($q, $timeout) {
  return {get: function () {
    var deferred = $q.defer();
    $timeout(function () { deferred.resolve({title: "OK"}); }, 2000);
    return deferred.promise;
  }};
})
.controller('StoryCtrl', function ($scope, story) {
  $scope.story = story;
});