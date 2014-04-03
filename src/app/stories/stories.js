angular.module('prx.stories', ['ui.router', 'angular-hal', 'ngPlayerHater', 'prx.url-translate', 'prx.accounts'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider, urlTranslateProvider) {
  $stateProvider
  .state('story', {
    abstract: true
  })
  .state('story.show', {
    url: '/stories/:storyId?autoPlay',
    views: {
      '@': {
        controller: 'StoryCtrl as story',
        templateUrl: 'stories/story.html'
      }
    },
    title: ['story', function (story) {
      return ['Stories', story.title];
    }],
    resolve: {
      story: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('prx:story', {id: $stateParams.storyId});
      }],
      account: ['story', function (story) {
        return story.follow('prx:account');
      }],
      audioUrls: ['story', function (story) {
        return story.follow('prx:audio').then(function (files) {
          var result = [];
          angular.forEach(files, function (file) {
            result.push(file.links('enclosure').url());
          });
          return result;
        });
      }]
    }
  })
  .state('story.show.details', {
    url: '/details',
    title: "Details",
    views: {
      'modal@': {
        controller: 'StoryDetailCtrl as story',
        templateUrl: 'stories/detail_modal.html'
      }
    }
  });

  /* istanbul ignore else */
  if (FEAT.LISTEN_LATER) {
    $stateProvider.state('story.remindMe', {
      views: {
        'modal@': {
          controller: 'StoryDetailCtrl as story',
          templateUrl: 'stories/remind_me_modal.html'
        }
      }
    });
  }

  $urlRouterProvider.when('/pieces/:pieceId', "/stories/{pieceId}");
  urlTranslateProvider.translate('/stories/:storyId', '/pieces/{storyId}');

  ngHalProvider.setRootUrl(FEAT.apiServer)
  .mixin('http://meta.prx.org/model/story/*any', ['resolved', 'playerHater', function (resolved, playerHater) {
    resolved.$audioFiles = resolved.follow('prx:audio');
    resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl').or(null);
    return { };
  }])
  .mixin('http://meta.prx.org/model/story', ['$sce', function ($sce) {
    return function (story) {
      story.description = $sce.trustAsHtml(story.description);
    };
  }])
  .mixin('http://meta.prx.org/model/image/*splat', ['resolved', function (resolved) {
    resolved.enclosureUrl = resolved.call('link', 'enclosure').call('url');
  }]);
})
.directive('prxStory', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'stories/embedded_story.html',
    scope: {story: '='}
  };
})
.controller('StoryCtrl', function (story, account, audioUrls, prxSoundFactory, $stateParams) {
  this.current = story;
  this.account = account;
  this.getSound = prxSoundFactory({
    story: story,
    producer: account,
    audioFiles: audioUrls
  });
  if ($stateParams.autoPlay) {
    story.play();
  }
})
.controller('StoryDetailCtrl', function (story) {
  this.current = story;
});
