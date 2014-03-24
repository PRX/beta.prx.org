angular.module('prx.stories', ['ui.router', 'angular-hal', 'ngPlayerHater', 'prx.url-translate'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider, urlTranslateProvider) {
  $stateProvider.state('story', {
    url: '/stories/:storyId?autoPlay',
    controller: 'StoryCtrl',
    templateUrl: 'stories/story.html',
    title: ['story', function (story) {
      return ['Stories', story.title];
    }],
    resolve: {
      story: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('prx:story', {id: $stateParams.storyId});
      }],
      account: ['story', function (story) {
        return story.follow('prx:account');
      }]
    }
  })
  .state('story.details', {
    url: '/details',
    title: "Details",
    views: {
      'modal@': {
        controller: 'StoryDetailCtrl',
        templateUrl: 'stories/detail_modal.html'
      }
    }
  });

  /* istanbul ignore else */
  if (FEAT.LISTEN_LATER) {
    $stateProvider.state('story.remindMe', {
      views: {
        'modal@': {
          controller: 'StoryDetailCtrl',
          templateUrl: 'stories/remind_me_modal.html'
        }
      }
    });
  }

  $urlRouterProvider.when('/pieces/:pieceId', "/stories/{pieceId}");
  urlTranslateProvider.translate('/stories/:storyId', '/pieces/{storyId}');

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .mixin('http://meta.prx.org/model/story', ['resolved', 'playerHater', function (resolved, playerHater) {
    resolved.$audioFiles = resolved.follow('prx:audio');
    resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl');
    return {
      sound: function () {
        if (typeof this.$sound === 'undefined') {
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
  }])
  .mixin('http://meta.prx.org/model/story', ['$sce', function ($sce) {
    return function (story) {
      story.description = $sce.trustAsHtml(story.description);
    };
  }])
  .mixin('http://meta.prx.org/model/image/*splat', ['resolved', function (resolved) {
    resolved.enclosureUrl = resolved.call('link', 'enclosure').call('url');
  }])
  .mixin('http://meta.prx.org/model/account/:type/*splat', ['type', 'resolved', function (type, resolved) {
    resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl');
    resolved.address = resolved.follow('prx:address');
  }])
  .mixin('http://meta.prx.org/model/address', {
    toString: function () {
      return this.city + ', ' + this.state;
    }
  });
})
.controller('StoryCtrl', function ($scope, story, account, $stateParams) {
  $scope.story = story;
  $scope.account = account;
  $scope.activeStory = $scope.activeStory || {};
  $scope.activeStory.id = ~~$stateParams.storyId;
  if ($stateParams.autoPlay) {
    story.play();
  }
})
.controller('StoryDetailCtrl', function ($scope, story) {
  $scope.story = story;
});
