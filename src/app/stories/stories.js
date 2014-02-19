angular.module('prx.stories', ['ui.router', 'angular-hal', 'prx-experiments', 'ngPlayerHater'])

.config(function ($stateProvider, ngHalProvider, prxperimentProvider, $urlRouterProvider) {

  $stateProvider.state('story', {
    url: '/stories/:storyId',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    resolve: {
      story: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('stories', {id: $stateParams.storyId});
      }],
      titleSize: ['prxperiment', function (prxperiment) {
        return prxperiment.run('title', ['big', 'small']);
      }],
      audioFiles: ['story', function (story) {
        return story.follow('audio');
      }]
    }
  });

  $urlRouterProvider
    .when('/pieces/:pieceId', "/stories/{pieceId}")
    .otherwise('/not_found');

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .defineModule('http://meta.prx.org/model/story', ['playerHater', function (playerHater) {
    return {
      audioFiles: function () {
        return this.$audioFiles = this.$audioFiles || this.follow('audio');
      },
      sound: function () {
        if (typeof this._sound !== 'undefined') { return this._sound; }
        if (playerHater.nowPlaying && playerHater.nowPlaying.story && playerHater.nowPlaying.story.id == this.id) {
          playerHater.nowPlaying.story = this;
          return this.$sound = playerHater.nowPlaying;
        }
        return this.audioFiles().then(function (audioFiles) {
          var files = [];
          angular.forEach(audioFiles, function (audioFile) {
            files.push(audioFile.url);
          });

          this.$sound = playerHater.newSong.apply(playerHater, files);
          this.$sound.story = this;
          return this._sound;
        });
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