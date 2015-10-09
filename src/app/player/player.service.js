(function () {

  angular
    .module('prx.player')
    .service('prxPlayer', prxPlayer);

  prxPlayer.$inject = ['Bus'];

  function prxPlayer(Bus) {
    return {
      $lastHeartbeat: 0,
      load: function (sound) {
        if (this.nowPlaying != sound) {
          this.stop();
          this.nowPlaying = sound;
          this.nowPlaying.onfinish = angular.bind(this, this.finish);
          return true;
        } else {
          return false;
        }
      },
      play: function (sound) {
        if (!sound || this.nowPlaying == sound && this.nowPlaying.paused) {
          return this.resume();
        } else {
          if (this.load(sound)) {
            Bus.emit('audioPlayer.play', this.nowPlaying);
            return sound.play();
          } else {
            return false;
          }
        }
      },
      sendHeartbeat: function (force) {
        if (this.nowPlaying) {
          var position = Math.round(this.nowPlaying.position / 1000);
          if (force || (position - this.$lastHeartbeat) >= 15) {
            var seconds = position - this.$lastHeartbeat;
            if (seconds > 60 || seconds < 0.5) { seconds = 15; }
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
  }

}());
