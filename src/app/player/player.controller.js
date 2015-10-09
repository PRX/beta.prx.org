(function () {

  angular
    .module('prx.player')
    .controller('PlayerCtrl', PlayerCtrl);

  PlayerCtrl.$inject = ['prxPlayer'];

  function PlayerCtrl(prxPlayer) {
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
      return (this.sound && this.sound.story && this.sound.story.duration) || 1;
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
  }

}());
