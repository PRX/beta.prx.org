angular.module('prx.stories', ['ui.router', 'angular-hal', 'prx-experiments', 'ngPlayerHater'])

.config(function ($stateProvider, ngHalProvider, prxperimentProvider, $urlRouterProvider) {

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

  $urlRouterProvider
    .when('/pieces/:pieceId', "/stories/{pieceId}")
    .otherwise('/not_found');
    
  var urls = [
    'https://dl.dropboxusercontent.com/u/125516/Microcastle/01%20Cover%20Me%20%28Slowly%29.mp3',
    'https://dl.dropboxusercontent.com/u/125516/Microcastle/02%20Agoraphobia.mp3',
    'https://dl.dropboxusercontent.com/u/125516/Microcastle/03%20Never%20Stops.mp3',
    'https://dl.dropboxusercontent.com/u/125516/Microcastle/04%20Little%20Kids.mp3'
  ];

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .defineModule('http://meta.prx.org/model/story', ['playerHater', function (playerHater) {
    return {
      sound: function () {
        if (typeof this._sound !== 'undefined') { return this._sound; }
        if (playerHater.nowPlaying && playerHater.nowPlaying.story && playerHater.nowPlaying.story.id == this.id) {
          playerHater.nowPlaying.story = this;
          return this._sound = playerHater.nowPlaying;
        }
        var files = angular.copy(urls);
        angular.forEach(files, function (file, index) {
          files[index] = {url: file};
        });
        this._sound = playerHater.newSong.apply(playerHater, files);
        this._sound.story = this;
        return this._sound;
      },
      play: function () {
        if (this.sound() == playerHater.nowPlaying) {
          playerHater.resume();
        } else {
          playerHater.play(this.sound());  
        }
      },
      pause: function () {
        playerHater.pause(this.sound());
      },
      togglePlay: function () {
        if (this.paused()) {
          this.play();
        } else {
          this.pause();
        }
      },
      paused: function () {
        return (typeof this._sound === 'undefined' || this._sound.paused);
      }
    };
  }]);
  prxperimentProvider.base('http://x.prx.org').clientId('123');
})
.controller('StoryCtrl', function ($scope, story, titleSize, $stateParams) {
  $scope.titleSize = titleSize;
  $scope.story = story;
  $scope.activeStory = $scope.activeStory || {};
  $scope.activeStory.id = ~~$stateParams.storyId;
});