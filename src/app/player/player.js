angular.module('prx.player', ['ngPlayerHater'])
.directive('prxGlobalPlayer', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'player/global_player.html'
  };
})
.factory('prxSoundFactory', function (playerHater) {
  return function (options) {
    return function getSound () {
      if (!getSound.sound) {
        var specs = [];
        angular.forEach(options.audioFiles, function (fileUrl) {
          specs.push({url: fileUrl});
        });

        getSound.sound = sound = playerHater.newSong.apply(playerHater, specs);
        sound.producer = options.producer;
        sound.story = options.story;
      }
      return getSound.sound;
    };
  };
})
.directive('prxPlayerButton', function ($controller) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'player/button.html',
    link: function (scope, element, attrs) {
      var sound = scope.$eval(attrs.sound);
      function soundFactory () { return soundFactory.sound; }
      if (!angular.isFunction(sound)) {
        soundFactory.sound = sound;
        sound = soundFactory;
      }

      scope.player = $controller('PlayerCtrl', {
        $scope: scope,
        soundFactory: sound
      });

      element.data('$ngControllerController', scope.player);
    }
  };
})
.controller('PlayerCtrl', function (soundFactory, playerHater, $analytics) {
  this.pause = function () {
    if (soundFactory.sound) {
      $analytics.eventTrack('Pause', {
        category: 'Audio Player',
        label: soundFactory().story.id
      });
      playerHater.pause(soundFactory.sound);
    }
  };

  this.play = function () {
    if (playerHater.nowPlaying == soundFactory()) {
      $analytics.eventTrack('Resume', {
        category: 'Audio Player',
        label: soundFactory().story.id
      });
      playerHater.resume();
    } else {
      $analytics.eventTrack('Play', {
        category: 'Audio Player',
        label: soundFactory().story.id
      });
      playerHater.play(soundFactory());
    }
  };

  this.toggle  = function () {
    if (this.paused()) {
      this.play();
    } else {
      this.pause();
    }
  };

  this.loading = function () {
    return !this.paused() && isNaN(soundFactory().position);
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
});
