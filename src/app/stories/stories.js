angular.module('prx.stories', ['ui.state', 'angular-hal', 'prx-experiments'])

.config(function ($stateProvider, ngHalProvider, prxperimentProvider) {

  $stateProvider.state('story', {
    url: '/stories/:storyId',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    resolve: {
      story: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.follow('stories', {id: $stateParams.storyId});
      }],
      titleSize: ['prxperiment', function (prxperiment) {
        return prxperiment.run('title', ['big', 'small']);
      }]
    }
  });

  ngHalProvider.setRootUrl('http://api.'+ window.location.host +'/api/v1');
  prxperimentProvider.base('http://x.prx.org').clientId('123');
})
.controller('StoryCtrl', function ($scope, story, titleSize) {
  $scope.titleSize = titleSize;
  $scope.story = story;
});