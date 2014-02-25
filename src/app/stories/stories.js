angular.module('prx.stories', ['ui.router', 'angular-hal', 'ngPlayerHater'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider) {
  $stateProvider.state('story', {
    url: '/stories/:storyId',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    resolve: {
      story: ['Story', '$stateParams', function (Story, $stateParams) {
        return Story.get($stateParams.storyId);
      }],
      account: ['story', function (story) {
        return story.follow('account');
      }]
    }
  });

  $urlRouterProvider.when('/pieces/:pieceId', "/stories/{pieceId}");

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .defineModule('http://meta.prx.org/model/story', ['Story', function (Story) {
    return Story.prototype;
  }])
  .transform('http://meta.prx.org/model/story', function () {
    this.$audioFiles = this.follow('audio');
    this.$image = this.follow('image');
  })
  .transform('account', function () {
    this.name = this.follow('opener').call('name');
  })
  .defineModule('opener', {
    name: function () {
      return this.first_name + ' ' + this.last_name;
    }
  });
})
.factory('Story', function (ngHal, playerHater, $q) {
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
        var audioFiles = [];
        angular.forEach(this.$audioFiles, function (audioFile) {
          audioFiles.push({url: audioFile.links('enclosure').url()});
        });

        this.$sound = playerHater.newSong.apply(playerHater, audioFiles);
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
    imageUrl: function () {
      return (this.$imageUrl = this.$imageUrl || this.$image.link('enclosure').url());
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
      return (typeof this.$sound === 'undefined' || this.$sound.paused);
    }
  };
  
  Story.get = function (storyId) {
    return ngHal.followOne('stories', {id: storyId});
  };

  return Story;
})
.controller('StoryCtrl', function ($scope, story, account, $stateParams) {
  $scope.story = story;
  $scope.account = account;
  $scope.activeStory = $scope.activeStory || {};
  $scope.activeStory.id = ~~$stateParams.storyId;
});