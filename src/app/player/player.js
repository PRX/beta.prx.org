angular.module('prx.player', ['ngPlayerHater', 'angulartics', 'prx.bus'])
.run(function (Bus, $analytics) {
  Bus.on('audioPlayer.stop', function () {
    $analytics.eventTrack('Stop', {
      category: 'Audio Player',
      label: this.story.id
    });
  }).on('audioPlayer.resume', function () {
    $analytics.eventTrack('Resume', {
      category: 'Audio Player',
      label: this.story.id
    });
  }).on('audioPlayer.pause', function () {
    $analytics.eventTrack('Pause', {
      category: 'Audio Player',
      label: this.story.id
    });
  }).on('audioPlayer.play', function () {
    $analytics.eventTrack('Play', {
      category: 'Audio Player',
      label: this.story.id
    });
  }).on('audioPlayer.listen', function (audioFile, duration, startTime) {
    $analytics.eventTrack('Listen', {
      category: 'Audio Player',
      label: this.story.id,
      pieceId: this.story.id,
      audioFileId: audioFile.id,
      value: duration,
      duration: duration,
      startedAt: startTime,
      noninteraction: true
    });
  });
})
.factory('prxSoundFactory', function (smSound) {
  function SoundFactory (options) {
    getSound.story = options && options.story;
    getSound.producer = options && options.producer;

    return getSound;

    function getSound () {
      if (!getSound.sound) {
        getSound.sound = sound = smSound.createList(options.audioFiles, {
          onfinish: function () {
            if (angular.isFunction(sound.onfinish)) {
              sound.onfinish();
            }
          }
        });
        sound.producer = options.producer;
        sound.story = options.story;
      }
      return getSound.sound;
    }
  }

  SoundFactory.wrap = function () {
    function soundFactory () {
      if (!soundFactory.sound) {
        soundFactory.sound = soundFactory.factory;
      }
      if(angular.isFunction(soundFactory.sound)) {
        soundFactory.sound = soundFactory.sound();
      }
      return soundFactory.sound;
    }

    soundFactory.set = function (sound) {
      if (angular.isFunction(sound)) {
        if (sound.sound) {
          soundFactory.sound = sound.sound;
        } else {
          soundFactory.sound = undefined;
          soundFactory.factory = sound;
        }
      } else {
        soundFactory.sound = sound;
      }
    };

    return soundFactory;
  };

  return SoundFactory;
})
.service('prxPlayer', function (Bus) {
  return {
    $lastHeartbeat: 0,
    play: function (sound) {
      if (this.nowPlaying != sound) {
        this.stop();
        this.nowPlaying = sound;
        this.nowPlaying.onfinish = angular.bind(this, this.stop);
        Bus.emit('audioPlayer.play', this.nowPlaying);
        return sound.play();
      } else if (this.nowPlaying.paused) {
        this.resume();
      }
    },
    sendHeartbeat: function (force) {
      if (this.nowPlaying) {
        var position = Math.round(this.nowPlaying.position / 1000);
        if (force || (position - this.$lastHeartbeat) >= 15) {
          var seconds = position - this.$lastHeartbeat;
          Bus.emit('audioPlayer.listen', this.nowPlaying, seconds, this.$lastHeartbeat);
          this.$lastHeartbeat = position;
        }
      }
    },
    pause: function () {
      if (!this.nowPlaying.paused) {
        Bus.emit('audioPlayer.pause', this.nowPlaying);
        this.sendHeartbeat(true);
        return this.nowPlaying.pause();
      }
    },
    resume: function () {
      if (this.nowPlaying) {
        Bus.emit('audioPlayer.resume', this.nowPlaying);
        this.nowPlaying.resume();
      }
    },
    progress: function () {
      if (!this.nowPlaying) {
        return 0;
      }
      this.sendHeartbeat();
      return Math.round(this.nowPlaying.position /
        this.nowPlaying.story.length) / 10 + '%';
    },
    stop: function () {
      if (this.nowPlaying) {
        this.nowPlaying.onfinish = undefined;
        this.sendHeartbeat(true);
        this.nowPlaying.stop();
        Bus.emit('audioPlayer.stop', this.nowPlaying);
        this.nowPlaying = undefined;
      }
    }
  };
})
.directive('prxGlobalPlayer', function () {
  return {
    restrict: 'E',
    replace: true,
    controller: 'GlobalPlayerCtrl',
    controllerAs: 'player',
    templateUrl: 'player/global_player.html'
  };
})
.directive('prxPlayer', function ($controller, prxSoundFactory) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'player/player.html',
    scope: true,
    link: function (scope, element, attrs) {
      var factory = prxSoundFactory.wrap();

      scope.$parent.$watch(attrs.sound, angular.bind(factory, factory.set));

      scope.player = $controller('PlayerCtrl', {
        $scope: scope,
        soundFactory: factory
      });

      element.data('$prxPlayerController', scope.player);
    }
  };
})
.directive('prxPlayerButton', function ($controller, prxSoundFactory) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    require: '^?prxPlayer',
    templateUrl: 'player/button.html',
    link: function (scope, elem, attrs, ctrl) {
      if (!ctrl) {
        var factory = prxSoundFactory.wrap();
        scope.$parent.$watch(attrs.sound, angular.bind(factory, factory.set));

        scope.player = $controller('PlayerCtrl', {
          $scope: scope,
          soundFactory: factory
        });
      } else {
        scope.player = ctrl;
      }
    }
  };
})
.controller('PlayerCtrl', function (soundFactory, prxPlayer) {
  this.pause = function () {
    if (soundFactory.sound && prxPlayer.nowPlaying == soundFactory()) {
      prxPlayer.pause(soundFactory());
    }
  };

  this.play = function () {
    prxPlayer.play(soundFactory());
  };

  this.toggle  = function () {
    if (this.paused()) {
      this.play();
    } else {
      this.pause();
    }
  };

  this.loading = function () {
    return soundFactory.sound && soundFactory.sound.loading;
  };

  this.paused  = function () {
    return !soundFactory.sound || soundFactory().paused;
  };

  this.active = function () {
    return soundFactory.sound &&
    (!soundFactory().paused || soundFactory().position > 0);
  };

  this.position = function () {
    return (soundFactory.sound && soundFactory().position) || 0;
  };

  this.progress = function () {
    return Math.round(this.position() /
      this.duration()) / 10;
  };

  this.duration = function () {
    return this.story() && this.story().length;
  };

  this.scrub = function (percent) {
    return this.setPosition(this.duration() * percent * 10);
  };

  this.story = function () {
    return soundFactory.sound ? soundFactory().story : soundFactory.story;
  };

  this.segmented = function () {
    return soundFactory.sound && soundFactory().length > 1;
  };

  this.segments = function () {
    return soundFactory().segments;
  };

  this.setPosition = function (position) {
    if (prxPlayer.nowPlaying == soundFactory.sound) {
      prxPlayer.sendHeartbeat(true);
    }
    soundFactory().setPosition(position);
  };

  this.goToSegment = function (index, event) {
    event.stopPropagation();
    var sum = 0;
    angular.forEach(this.segments().slice(0, index), function (duration) {
      sum += duration;
    });
    return this.setPosition(sum);
  };
})
.directive('prxPlayerScrubber', function () {
  return {
    restrict: 'A',
    scope: {'prxPlayerScrubber': '&'},
    link: function (scope, elem, attrs) {
      elem.bind('click', click);

      elem.children().css('pointer-events', 'none');

      scope.$on('$destroy', function () {
        elem.unbind('click', click);
      });

      function click (event) {
        scope.prxPlayerScrubber({percentage: event.offsetX * 100 / event.target.offsetWidth});
      }
    }
  };
})
.filter('timeCode', function () {
  var zero = timeCode(0);

  function dd(num) {
    if (num < 10) {
      return '0' + num;
    }
    return num;
  }

  function timeCode(time, fmt) {
    if (typeof fmt === 'undefined') {
      fmt = 'long';
    }

    var hours, minutes, seconds;
    if (isNaN(time)) {
      return zero;
    } else {
      time = ~~(time / 1000);
    }
    hours = ~~(time / 3600);
    minutes = ~~((time % 3600) / 60);
    seconds = ~~(time % 60);

    if (fmt == 'long' || hours) {
      return [hours, ":", dd(minutes), ":", dd(seconds)].join('');
    } else {
      return [minutes, ":", dd(seconds)].join('');
    }
  }

  return timeCode;
})
.controller('GlobalPlayerCtrl', function (prxPlayer) {
  this.global = prxPlayer;
});
