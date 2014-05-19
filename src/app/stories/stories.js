angular.module('prx.stories', ['ui.router', 'prx.modelConfig', 'prx.player', 'prx.url-translate', 'prx.accounts', 'prx.experiments'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider, urlTranslateProvider) {
  $stateProvider
  .state('story', {
    abstract: true,
    title: 'Stories'
  })
  .state('story.show', {
    url: '/stories/:storyId?autoPlay',
    views: {
      '@': {
        controller: 'StoryCtrl as story',
        templateUrl: 'stories/story.html'
      }
    },
    title: ['story', 'account', function (story, account) { return story.toString() + ' by ' + account.toString(); }],
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
            result.push({id: file.id, duration: file.duration * 1000, url: file.links('enclosure').url()});
          });
          return result;
        });
      }],
      coverExperiment: ['prxperiment', function (prxperiment) {
        return prxperiment.participate('storyCover', ['blueMics', 'matt']);
      }]
    }
  })
  .state('story.show.details', {
    url: '/details',
    views: {
      'modal@': {
        controller: 'StoryDetailCtrl as story',
        templateUrl: 'stories/detail_modal.html'
      }
    }
  })
  .state('story.show.content_advisory', {
    views: {
      'modal@': {
        controller: 'StoryDetailCtrl as story',
        templateUrl: 'stories/content_advisory_modal.html'
      }
    }

  })
  ;

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
  .mixin('http://meta.prx.org/model/story/*any', ['resolved', function (resolved) {
    resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl').or(null);
    return function (story) {
      if (angular.isDefined(story.length)) {
        story.duration = story.length;
        story.length = undefined;
        return story;
      }
    };
  }]).mixin('http://meta.prx.org/model/story/*any', {
    toString: function () { return this.title; }
  });
})
.directive('prxStory', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'stories/embedded_story.html',
    scope: {story: '='}
  };
})
.controller('StoryCtrl', function (story, account, audioUrls,
  prxSoundFactory, $stateParams, prxPlayer, prxperiment) {
  this.current = story;
  this.account = account;
  this.cover = prxperiment.get('storyCover');
  this.sound = prxSoundFactory({ story: story, producer: account,
    audioFiles: audioUrls });
})
.controller('StoryDetailCtrl', function (story) {
  this.current = story;
})
.directive('prxSocialActions', function($location) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'stories/social_actions.html',
    scope: {
      text: '='
    },
    link: function (scope, elem, attrs, ctrl) {
      scope.$location = $location;
    }
  };
})
;
