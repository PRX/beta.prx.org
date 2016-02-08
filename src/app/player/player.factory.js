module.exports = function prxSoundFactory(smSound, prxPlayer, $q) {
  function soundFactory (options) {
    var sound;

    if (prxPlayer.nowPlaying && options.story.id == prxPlayer.nowPlaying.story.id) {
      sound = prxPlayer.nowPlaying;
    } else {
      sound = smSound.createList(options.audioFiles||[], {
        onfinish: function () {
          if (angular.isFunction(sound.onfinish)) {
            sound.onfinish();
          }
        }
      });
    }

    sound.producer = options.producer;
    sound.story = options.story;
    sound.data = options.data || {};
    sound.next = sound.next || (options.next ? mkNextFun(options.next) : undefined);

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
        calculated = $q.when(calculator.call(this, this)).then(function (data) {
          data = soundFactory(data);
          data.previous = previous;
          return data;
        });
      }
      return calculated;
    };
  }
};
