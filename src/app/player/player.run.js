(function () {

  angular
    .module('prx.player')
    .run(run);

  run.$inject = ['Bus', '$analytics'];

  function run(Bus, $analytics) {
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
  }

}());
