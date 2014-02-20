angular.module('prx.stories', ['ui.router', 'angular-hal', 'ngPlayerHater'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider) {
  $stateProvider.state('story', {
    url: '/stories/:storyId',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    resolve: {
      story: ['Story', '$stateParams', function (Story, $stateParams) {
        return Story.get($stateParams.storyId);
      }]
    }
  });

  $urlRouterProvider.when('/pieces/:pieceId', "/stories/{pieceId}");

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .defineModule('http://meta.prx.org/model/story', ['Story', function (Story) {
    return Story.prototype;
  }]);
})
.factory('Story', function (ngHal, playerHater) {
  function Story () {
    return ngHal.build('story');
  }
  
  Story.prototype = {
    sound: function () {
      if (typeof this.$sound === 'undefined') {
        if (playerHater.nowPlaying && playerHater.nowPlaying.story &&
          playerHater.nowPlaying.story.id == this.id) {
          playerHater.nowPlaying.story = this;
          return this.$sound = playerHater.nowPlaying;
        }

        this.$sound = playerHater.newSong.apply(playerHater, this.$audioFiles);
        this.$sound.story = this;
      }
      return this.$sound;
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
  
  Story.get = function (storyId) {
    return ngHal.followOne('stories', {id: storyId}).then(function (story) {
      return story.follow('audio').then(function (audioFiles) {
        story.$audioFiles = audioFiles;
        return story;
      });
    });
  };

  return Story;
})
.controller('StoryCtrl', function ($scope, story, $stateParams) {
  $scope.story = story;
  $scope.activeStory = $scope.activeStory || {};
  $scope.activeStory.id = ~~$stateParams.storyId;
});