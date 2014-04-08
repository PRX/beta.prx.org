angular.module('prx.player', ['ngPlayerHater', 'angulartics'])
.factory('prxSoundFactory', function (smSound) {
  return function (options) {
    return function getSound () {
      if (!getSound.sound) {
        getSound.sound = sound = smSound.createList(options.audioFiles);
        sound.producer = options.producer;
        sound.story = options.story;
      }
      return getSound.sound;
    };
  };
})
.service('prxPlayer', function ($analytics) {
  return {
    $lastHeartbeat: 0,
    play: function (sound) {
      if (this.nowPlaying != sound) {
        this.stop();
        this.nowPlaying = sound;
        $analytics.eventTrack('Play', {
          category: 'Audio Player',
          label: this.nowPlaying.story.id
        });
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
          $analytics.eventTrack('Listen', {
            category: 'Audio Player',
            label: this.nowPlaying.story.id,
            pieceId: this.nowPlaying.story.id,
            audioFileId: this.nowPlaying.id,
            value: seconds,
            duration: seconds,
            startedAt: this.$lastHeartbeat
          });
          this.$lastHeartbeat = position;
        }
      }
    },
    pause: function () {
      if (!this.nowPlaying.paused) {
        $analytics.eventTrack('Pause', {
          category: 'Audio Player',
          label: this.nowPlaying.story.id
        });
        this.sendHeartbeat(true);
        return this.nowPlaying.pause();
      }
    },
    resume: function () {
      if (this.nowPlaying) {
        $analytics.eventTrack('Resume', {
          category: 'Audio Player',
          label: this.nowPlaying.story.id
        });
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
        $analytics.eventTrack('Stop', {
          category: 'Audio Player',
          label: this.nowPlaying.story.id
        });
        this.nowPlaying.stop();
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
.directive('prxPlayerButton', function ($controller) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: 'player/button.html',
    link: function (scope, element, attrs) {
      var soundFactory = function soundFactory () {
        if (!soundFactory.sound) {
          soundFactory.sound = soundFactory.factory;
        }
        while(angular.isFunction(soundFactory.sound)) {
          soundFactory.sound = soundFactory.sound();
        }
        return soundFactory.sound;
      };

      scope.$parent.$watch(attrs.sound, function (sound) {
        while (true) {
          if (angular.isFunction(sound)) {
            if (sound.sound) {
              sound = sound.sound;
            } else {
              soundFactory.sound = undefined;
              soundFactory.factory = sound;
              break;
            }
          } else {
            soundFactory.sound = sound;
            break;
          }
        }
      });

      scope.player = $controller('PlayerButtonCtrl', {
        $scope: scope,
        soundFactory: soundFactory
      });

      element.data('$prxPlayerButtonController', scope.player);
    }
  };
})
.controller('PlayerButtonCtrl', function (soundFactory, prxPlayer) {
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
      return [dd(hours), ":", dd(minutes), ":", dd(seconds)].join('');
    } else {
      return [minutes, ":", dd(seconds)].join('');
    }
  }

  return timeCode;
})
.controller('GlobalPlayerCtrl', function (prxPlayer) {
  this.global = prxPlayer;
});
