angular.module('prx.stories', [
  'ui.router', 'prx.modelConfig', 'prx.player', 'prx.url-translate',
  'prx.accounts', 'prx.experiments', 'angulartics'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider, urlTranslateProvider) {
  $stateProvider
  .state('story', {
    abstract: true,
    title: 'Stories'
  })
  .state('story.show', {
    url: '/stories/:storyId?s&play',
    views: {
      '@': {
        controller: 'StoryCtrl as story',
        templateUrl: 'stories/story.html'
      }
    },
    title: ['story', 'account', function (story, account) {
      return story.toString() + ' by ' + account.toString();
    }],
    resolve: {
      story: function (ngHal, $stateParams) {
        return ngHal.followOne('prx:story', {id: $stateParams.storyId});
      },
      account: function (story) {
        return story.follow('prx:account');
      },
      audioVersions: function (story) {
        return story.follow('prx:audio-versions');
      },
      series: function (story) {
        if (story.links.all('prx:series')) {
          return story.follow('prx:series');
        } else {
          return null;
        }
      },
      musicalWorksList: function (story) {
        return story.follow('prx:musical-works');
      },
      musicalWorks: function (musicalWorksList) {
        return musicalWorksList.follow('prx:items');
      },
      audioUrls: function (story) {
        return story.toSoundParams().then(function (sfParams) {
          return sfParams.audioFiles;
        });
      },
      coverExperiment: function (prxperiment) {
        return prxperiment.participate('storyCover', ['blueMics', 'matt']);
      }
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
  .state('story.show.timingCues', {
    views: {
      'modal@': {
        controller: 'StoryDetailCtrl as story',
        templateUrl: 'stories/timing_cues_modal.html'
      }
    }
  })
  .state('story.show.embed', {
    url: '/embed?s&play&playlist&ts',
    data: {
      chromeless: true
    },
    views: {
      '@': {
        controller: 'StoryEmbedCtrl as story',
        templateUrl: 'stories/embed.html'
      }
    }
  })
  .state('story.show.embed.donate', {
    url: '/donate',
    views: {
      'modal@': {
        controller: 'StoryDonationCtrl as story',
        templateUrl: 'stories/embed_donate.html'
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
  }]).mixin('http://meta.prx.org/model/story/*any', ['prxPlayer', '$q',
  function (prxPlayer, $q) {
    return {
      toString: function () { return this.title; },
      stateParams: function () {
        return { storyId: this.id, s: null, play: null, ts: null };
      },
      toSoundParams: function () {
        return $q.all([
          this.follow('prx:audio').follow('prx:items'),
          this.getAccount()
        ]).then(angular.bind(this, generateSoundParams));
      },
      playing: function () {
        return prxPlayer.nowPlaying && prxPlayer.nowPlaying.story.id == this.id;
      },
      getAccount: function () {
        if (!angular.isDefined(this.$account)) {
          this.$account = this.follow('prx:account').then(
            angular.bind(this, setAccount)
          );
        }
        return $q.when(this.$account);
      }
    };

    function generateSoundParams(options) {
      var files = options[0],
        producer = options[1],
        result = [];
      angular.forEach(files, function (file) {
        result.push({
          id: file.id,
          duration: file.duration * 1000,
          url: file.links('enclosure').url()
        });
      });
      return {
        audioFiles: result,
        story: this,
        producer: producer
      };
    }

    function setAccount(account) {
      this.$account = account;
      return account;
    }
  }]);
})
.directive('prxStory', function (prxSoundFactory, prxPlayer) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'stories/embedded_story.html',
    scope: {story: '='},
    controller: function ($scope) {
      $scope.play = function () {
        $scope.story.toSoundParams().then(function (sp) {
          var event = $scope.$emit('$play', sp);
          if (!event.defaultPrevented) {
            prxPlayer.play(prxSoundFactory(sp));
          }
        });
      };
    }
  };
})
.controller('StoryCtrl', function (story, account, series, audioUrls, $window,
  musicalWorks, musicalWorksList, audioVersions, prxSoundFactory, $stateParams,
  prxPlayer, prxperiment, $analytics, $timeout) {
  var storyCtrl = this;

  this.current = story;
  this.account = account;
  this.series = series;
  this.audioVersions = audioVersions;

  this.cover = prxperiment.get('storyCover');
  this.sound = prxSoundFactory({ story: story, producer: account,
    audioFiles: audioUrls, next: function (sound) {
      return account.generatePlaylist(sound);
    }
  });
  if (angular.isDefined($stateParams.s) && $stateParams.s !== null) {
    this.sound.setPosition($stateParams.s * 1000);
  }
  if ((angular.isDefined($stateParams.s) && $stateParams.s !== null) || $stateParams.play) {
    prxPlayer.play(this.sound);
  }
  this.donate = function(e, url) {
    e.preventDefault();
    $analytics.eventTrack('Donate', {
      category: 'Outbound',
      label: 'Story-' + this.current.id.toString()+ '-' + url,
      // hitcallback: function () {
      //   $window.location.href = url;
      // }
    });
    $timeout(function() { $window.location.href = url; }, 200);
  };

  this.musicalWorks = musicalWorks;

  this.loadNextWorks = function() {
    ctrl = this;

    musicalWorksList.follow('next').then(function (nextList) {
      return nextList.follow('prx:items').then(function (works) {
        musicalWorksList = nextList;
        Array.prototype.push.apply(ctrl.musicalWorks, works);
      });
    })['finally'](function () {
      if (angular.isDefined(musicalWorksList.link('next'))) {
        ctrl.loadNextWorks();
      }
    });
  };
  this.loadNextWorks();

  this.current.follow('prx:license').then(function (license) {
    storyCtrl.license = license;
  });
})
.controller('StoryDetailCtrl', function (story) {
  this.current = story;
})
.controller('StoryEmbedCtrl', function (story, account, series, audioUrls, prxSoundFactory, prxPlayer, $state, $stateParams) {
  var sound = prxSoundFactory({
    story: story,
    producer: account,
    series: series,
    audioFiles: audioUrls, next: function (sound) {
      // console.log("$stateParams.playlist");

      // if ($stateParams.playlist == 'picks') {
      //
      // }

      return account.generatePlaylist(sound);
    }
  });

  // if ($stateParams.ts) {
  //   console.log($stateParams.ts);
  // }

  this.currentSound = function () {
    return prxPlayer.nowPlaying || sound;
  };

  this.shareStoryURL = $state.href('story.show', $state.params, {absolute: true});
  this.shareTitle = this.currentSound().story.title;
})
.controller('StoryDonationCtrl', function (story, $timeout) {
  this.step = 1;

  this.donation = {};

  this.submitEmail = function () {
    var exp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var valid = exp.test(this.donation.email);

    if (1||valid) {
      this.step = 2;
    }
  };

  this.submitPayment = function () {
    this.step = 3;
  };

  this.submitAmount = function () {
    this.step = 88;
    var self = this;
    $timeout(function () {
      self.step = 99;
    }, 1000);
  };
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
.filter('simpleFormat', function () {
  return function (string) {
    return "<p>" + string.replace(/[\n]{2,}/g, '</p><p>').replace(/\n/g, "<br>") + "</p>";
  };
})
.filter('highlightTimecodes', function () {
  return function (string) {
    return string.replace(/([\d]{1,2}:){1,2}\d\d/g, "<strong>$&</strong>");
  };
})
.filter('sentence', function () {
  return function (list) {
    if (list && list.length) {
      if (list.length == 1) {
        return list[0];
      } else if (list.length == 2) {
        return list.join(' and ');
      } else {
        return [list.slice(0, list.length-1).join(', '), list[list.length-1]].join(', and ');
      }
    } else {
      return list;
    }
  };
})
.filter('absUrl', function () {
  var PROTOCOL_SEPARATOR = /:\/\//;

  return function (url) {
    if (!angular.isString(url) || PROTOCOL_SEPARATOR.exec(url)) {
      return url;
    }
    return 'http://' + url;
  };
})
.filter('prettyUrl', function () {
  var EXPRESSION = /(^(https?:\/\/)?(www\.)?)|(\/$)/ig;
  var EMPTY_STRING = '';

  return function (url) {
    if (!angular.isString(url)) {
      return url;
    }
    return url.replace(EXPRESSION, EMPTY_STRING);
  };
})
;
