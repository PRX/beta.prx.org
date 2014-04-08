(function(){
  'use strict';
  var module = angular.module('ngPlayerHater', []);
  module.factory('globalSoundManager', function ($window) {
    return $window.soundManager;
  });

  var soundManager2Provider = {
    $get: getSoundManager,
    options: {
      url: '/assets',
      flashVersion: 9,
      preferFlash: false,
      debugMode: false
    }
  };

  function wrapper(promise) {
    return function wrap(functionName) {
      return function () {
        var args = Array.prototype.slice.call(arguments);
        return promise.then(function (obj) {
          return obj[functionName].apply(obj, args);
        });
      };
    };
  }

  getSoundManager.$inject = ['$q', '$timeout', 'globalSoundManager'];
  function getSoundManager($q, $timeout, globalSoundManager) {
    var deferred = $q.defer(), onReady,
      wrap = wrapper(deferred.promise),
      options = soundManager2Provider.options;

    function resolvePromise() {
      $timeout(function () {
        deferred.resolve(globalSoundManager);
        if (angular.isFunction(onReady)) {
          onReady.call(null);
        }
      });
      if ($timeout.flush) {
        $timeout.flush();
      }
    }

    resolvePromise._shim = true;

    if (typeof options.onready !== 'undefined' && !options.onready._shim) {
      onReady = options.onready;
    } else {
      onReady = undefined;
    }

    options.onready = resolvePromise;

    globalSoundManager.setup(options);

    return {
      createSound: wrap('createSound'),
      canPlayLink: wrap('canPlayLink'),
      canPlayMIME: wrap('canPlayMIME'),
      canPlayURL:  wrap('canPlayURL'),
      mute:        wrap('mute'),
      pauseAll:    wrap('pauseAll'),
      resumeAll:   wrap('resumeAll'),
      stopAll:     wrap('stopAll'),
      unmute:      wrap('unmute')
    };
  }
  module.provider('soundManager', soundManager2Provider);

  SoundFactory.$inject = ['soundManager', '$timeout'];
  function SoundFactory(soundManager, $timeout) {
    var id = 0;

    function Sound(url, options) {
      if (!angular.isDefined(url)) {
        throw new Error("URL is required.");
      }
      if (angular.isObject(url)) {
        angular.extend(this, url);
        url = url.url;
      }
      options = options || {};
      angular.extend(options, generateCallbacks(this, options.onchange));
      options.url = url;
      this.id3 = {};
      this.id = id++;
      this.sound = soundManager.createSound(options);
    }

    Sound.prototype.playing = false;
    Sound.prototype.loading = false;
    Sound.prototype.paused  = false;
    Sound.prototype.error   = false;
    Sound.prototype.paused  = true;

    var proxies = ('destruct load mute pause resume setPan setPosition ' +
    'setVolume stop toogleMute play togglePause unload unmute').split(' ');
    angular.forEach(proxies, function (proxy) {
      Sound.prototype[proxy] = makePromisedProxy(proxy);
    });
    var play = makePromisedProxy('play');
    Sound.prototype.play = function () {
      this.loading = true;
      play.apply(this, [].slice.call(arguments));
    };

    function SoundList (urls, options) {
      this.id = id++;
      var firstSound, opts = (options || {}),
        subOpts = angular.copy(opts), self = this;
      angular.forEach(urls.reverse(), function (url) {
        (function (sound) {
          subOpts.onfinish = function () {
            if (angular.isDefined(sound)) {
              self.$behind += self.$current.duration;
              self.$current = sound;
              sound.play();
            } else if (opts.onfinish) {
              opts.onfinish.call(this);
            }
          };
          subOpts.onchange = function () {
            if (self.$current == this) {
              angular.extend(self, this);
              if (!this.position) { self.position = 0; }
              self.position = (self.position || 0) + self.$behind;
            }
          };
          firstSound = new Sound(url, angular.copy(subOpts));
        })(firstSound);
      });
      this.$behind  = 0;
      this.$current = firstSound;
      angular.extend(self, this.$current);
    }

    angular.forEach(proxies, function (proxy) {
      SoundList.prototype[proxy] = function () {
        this.$current[proxy].apply(this.$current, [].slice.call(arguments));
      };
    });

    return {
      create: function (url) {
        return new Sound(url);
      },
      createList: function (urls) {
        return new SoundList(urls);
      }
    };

    function asyncDigest(fun) {
      return function () {
        var self = this;
        $timeout(function () { fun.call(self); });
      };
    }

    function generateCallbacks(sound, onchange) {
      onchange = onchange || angular.noop;
      return {
        onload: asyncDigest(function () {
          if (this.readyState === 1) {
            sound.loading  = true;
            sound.error    = false;
          } else if (this.readyState === 2) {
            sound.error    = true;
            sound.loading  = false;
          } else if (this.readyState === 3) {
            sound.loading  = false;
            sound.error    = false;
            sound.duration = this.duration;
          }
          onchange.call(sound);
        }),
        onpause: asyncDigest(function () {
          sound.paused  = true;
          sound.playing = false;
          onchange.call(sound);
        }),
        onplay: asyncDigest(function () {
          sound.paused = false;
          onchange.call(sound);
        }),
        onresume: asyncDigest(function () {
          sound.paused = false;
          onchange.call(sound);
        }),
        onid3: asyncDigest(function () {
          angular.copy(this.id3, sound.id3);
          onchange.call(sound);
        }),
        whileloading: asyncDigest(function () {
          sound.duration = this.durationEstimate;
          onchange.call(sound);
        }),
        whileplaying: asyncDigest(function (){
          sound.position = this.position;
          onchange.call(sound);
        })
      };
    }

    function makePromisedProxy (property) {
      return function () {
        var args = [].slice.call(arguments);
        return this.sound.then(function (sound) {
          return sound[property].apply(sound, args);
        });
      };
    }
  }
  module.factory('smSound', SoundFactory);
})();
