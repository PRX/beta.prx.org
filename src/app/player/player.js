angular.module('prx.player', ['ngPlayerHater', 'angulartics', 'prx.bus'])
.run(function (Bus, $analytics) {
  var category = 'Audio Player';

  Bus.on('audioPlayer.stop', function () {
    $analytics.eventTrack('Stop', {
      category: category,
      label: this.story.id
    });
  }).on('audioPlayer.resume', function () {
    $analytics.eventTrack(this.previous ? 'Resume Radio' : 'Resume', {
      category: category,
      label: this.story.id
    });
  }).on('audioPlayer.pause', function () {
    $analytics.eventTrack(this.previous ? 'Pause Radio' : 'Pause', {
      category: category,
      label: this.story.id
    });
  }).on('audioPlayer.play', function () {
    $analytics.eventTrack(this.previous ? 'Play Radio' : 'Play', {
      category: category,
      label: this.story.id
    });
  }).on('audioPlayer.listen', function (audioFile, duration, startTime) {
    $analytics.eventTrack(this.previous ? 'Listen Radio' : 'Listen', {
      category: category,
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
.factory('prxSoundFactory', function (smSound, prxPlayer, $q) {
  function soundFactory (options) {
    var sound;

    if (prxPlayer.nowPlaying && options.story.id == prxPlayer.nowPlaying.story.id) {
      sound = prxPlayer.nowPlaying;
    } else {
      sound = smSound.createList(options.audioFiles, {
        onfinish: function () {
          if (angular.isFunction(sound.onfinish)) {
            sound.onfinish();
          }
        }
      });
    }

    sound.producer = options.producer;
    sound.story = options.story;
    sound.next = options.next ? mkNextFun(options.next) : undefined;

    return sound;
  }

  return soundFactory;

  function mkNextFun(calculator) {
    var calculated;
    if (!angular.isFunction(calculator)) {
      var opts = calculator;
      calculator = angular.bind(undefined, angular.identity, opts);
    }
    return function () {
      if (!calculated) {
        var previous = angular.bind(undefined, angular.identity, $q.when(this));
        calculated = $q.when(calculator(this)).then(function (data) {
          data = soundFactory(data);
          data.previous = previous;
          return data;
        });
      }
      return calculated;
    };
  }
})
.service('prxPlayer', function (Bus) {
  return {
    $lastHeartbeat: 0,
    play: function (sound) {
      if (!sound || this.nowPlaying == sound && this.nowPlaying.paused) {
        return this.resume();
      } else if (this.nowPlaying != sound) {
        this.stop();
        this.nowPlaying = sound;
        this.nowPlaying.onfinish = angular.bind(this, this.finish);
        Bus.emit('audioPlayer.play', this.nowPlaying);
        return sound.play();
      }
    },
    sendHeartbeat: function (force) {
      if (this.nowPlaying) {
        var position = Math.round(this.nowPlaying.position / 1000);
        if (force || (position - this.$lastHeartbeat) >= 15) {
          var seconds = position - this.$lastHeartbeat;
          if (seconds > 60) { seconds = 15; }
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
      var percent = Math.round(this.nowPlaying.position /
        this.nowPlaying.story.duration) / 10;
      if (percent > 90 && this.nowPlaying.next) {
        this.nowPlaying.next();
      }
      return percent + '%';
    },
    stop: function () {
      if (this.nowPlaying) {
        this.nowPlaying.onfinish = undefined;
        this.sendHeartbeat(true);
        this.nowPlaying.stop();
        this.$lastHeartbeat = 0;
        Bus.emit('audioPlayer.stop', this.nowPlaying);
        this.nowPlaying = undefined;
      }
    },
    finish: function () {
      if (this.nowPlaying.next) {
        var self = this;
        this.nowPlaying.next().then(function (nxt) {
          self.stop();
          self.play(nxt);
        }, function () {
          self.stop();
        });
      } else {
        this.stop();
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
    templateUrl: 'player/player.directive.html',
    controller: 'PlayerCtrl as player',
    link: function (scope, elem, attrs, ctrl) {
      scope.$watch(attrs.sound, angular.bind(ctrl, ctrl.setSound));
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
        ctrl = $controller('PlayerCtrl', {$scope: scope});
        scope.$parent.$watch(attrs.sound, angular.bind(ctrl, ctrl.setSound));
      }
      scope.player = ctrl;
    }
  };
})
.controller('PlayerCtrl', function (prxPlayer) {
  this.setSound = function (newSound) {
    this.sound = newSound;
  };

  this.pause = function () {
    if (this.sound == prxPlayer.nowPlaying) {
      prxPlayer.pause();
    }
  };

  this.play = function () {
    prxPlayer.play(this.sound);
  };

  this.toggle = function () {
    if (this.sound && this.sound.paused) {
      this.play();
    } else {
      this.pause();
    }
  };

  this.active = function () {
    return this.sound && (!this.sound.paused || this.sound.position > 0);
  };

  this.progress = function () {
    return this.sound && Math.round((this.sound.position || 0) /
      this.duration()) / 10;
  };

  this.duration = function () {
    return (this.sound && this.sound.story.duration) || 1;
  };

  this.scrubToPercent = function (percent) {
    return this.setPosition(this.duration() * percent * 10);
  };

  this.setPosition = function (position) {
    if (prxPlayer.nowPlaying == this.sound) {
      prxPlayer.sendHeartbeat(true);
    }
    this.sound.setPosition(position);
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
        scope.prxPlayerScrubber({percentage: (event.offsetX || event.layerX) * 100 / event.target.offsetWidth});
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
})
.directive('waveform', function ($window, $timeout) {
  return {
    restrict: 'C',
    require: '^prxPlayer',
    link: function (scope, elem, attrs, ctrl) {
      var animated = false,
          _window = angular.element($window),
          timeout, setSound = ctrl.setSound,
          ctx = elem[0].getContext('2d');

      _window.on('resize', scheduleWaveform);

      scope.$on('$destroy', function() {
        ctrl.setSound = setSound;
        _window.off('resize', scheduleWaveform);
      });

      ctrl.setSound = function (sound) {
        setSound.call(ctrl, sound);
        if (sound && !sound.$waveform) {
          sound.$waveform = [];

          for (var i=0; i < 15; i+= 0.3) {
            sound.$waveform.push(Math.sin(i) * 49 + 51);
          }
        }
        scheduleWaveform();
      };

      function scheduleWaveform () {
        // If the user is continuously resizing,
        // we basically avoid redrawing until they have
        // stopped for at least 300ms
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(generateWaveform, 300);
      }

      function generateWaveform () {
        var count = Math.floor(elem[0].offsetWidth / 5),
          waveform = ctrl.sound && ctrl.sound.$waveform;
        /* istanbul ignore if: Count will always be 0 in testing (the window does not exist)*/
        if (count && waveform) {
          elem[0].width = elem[0].offsetWidth * 2;
          elem[0].height = elem[0].offsetHeight * 2;
          if (elem[0].currentStyle) {
            ctx.strokeStyle = elem[0].currentStyle['border-color'];
          } else if (window.getComputedStyle) {
            var style = window.getComputedStyle(elem[0], null);
            ctx.strokeStyle = style['borderRightColor'] || style.getPropertyValue('border-color');
          }

          ctx.lineWidth = 6;

          var points = [];
          var perBar = (waveform.length - 1) / count;
          var i = perBar / 2, x, start;

          do {
            start = Math.min(i, waveform.length - 1);
            if (start == ~~start) {
              points.push(waveform[start]);
            } else if (start < waveform.length - 1) {
              x = start - ~~start;
              points.push(waveform[~~start] * (1 - x) + waveform[~~start+1] * (x));
            }

            i += perBar;
          } while (i <= waveform.length - 1);

          if (!animated && window.requestAnimationFrame) {
            animateIn(points, ctx, elem[0].height, elem[0].width).then(function () {
              timeout = undefined;
            });
          } else {
            angular.forEach(points, function (point, index) {
              ctx.beginPath();
              ctx.moveTo(10 * index + 5, elem[0].height);
              ctx.lineTo(10 * index + 5, (100-point) / 100 * elem[0].height);
              ctx.stroke();
            });
            timeout = undefined;
          }
        } else {
          timeout = undefined;
        }
      }

      /* istanbul ignore next: Purely display logic */
      function animateIn(points, ctx, height, width) {
        animated = ~~new Date();
        animate();
        function animate() {
          var time = Math.pow(Math.min((~~new Date() - animated) / 500, 1) - 1, 3) + 1;
          ctx.clearRect(0, 0, width, height);
          angular.forEach(points, function (point, index) {
            ctx.beginPath();
            ctx.moveTo(10 * index + 5, height);
            ctx.lineTo(10 * index + 5, Math.max(100 - point * time + (point * index/points.length * (1 - Math.pow(time, 3))), 1) / 100 * height);
            ctx.stroke();
          });
          if (time < 1) {
            window.requestAnimationFrame(animate);
          }
        }
        return $timeout(angular.noop, 510);
      }
    }
  };
});
