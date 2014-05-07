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

  SoundFactory.$inject = ['soundManager', '$timeout', '$q'];
  function SoundFactory(soundManager, $timeout, $q) {
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
      this.$ld = $q.defer();
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
      return play.apply(this, [].slice.call(arguments));
    };

    var load = makePromisedProxy('load');
    Sound.prototype.load = function () {
      var self = this;
      return load.apply(this, arguments).then(function () {
        return self.$lp || self.$ld.promise;
      });
    };

    function SoundList (urls, options) {
      var firstSound, opts = (options || {}),
        subOpts = angular.copy(opts), self = this;
      angular.forEach(urls.reverse(), function (url) {
        (function (sound) {
          subOpts.onfinish = function () {
            if (angular.isDefined(sound)) {
              self.$behind += self.$current.duration;
              self.$current = sound;
              sound.play();
            } else {
              self.$behind = 0;
              self.$current = self.$first;
              angular.extend(self, self.$first);
              if (opts.onfinish) {
                opts.onfinish.call(this);
              }
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
          firstSound.$next = sound;
        })(firstSound);
      });
      this.$behind  = 0;
      this.$current = this.$first = firstSound;
      angular.extend(self, this.$current);
    }

    angular.forEach(proxies, function (proxy) {
      SoundList.prototype[proxy] = function () {
        console.log("ATTEMPTING TO CALL " + proxy + ' on ', this.$current);
        return this.$current[proxy].apply(this.$current, [].slice.call(arguments));
      };
    });

    SoundList.prototype.setPosition = function (position) {
      var sound, tmp, available;
      if (this.position > position) {
        if (this.$behind < position) {
          return this.$current.setPosition(position - this.$behind);
        } else {
          sound = this.$first;
          available = sound.duration;

          while (position > available) {
            sound = sound.$next;
            available += sound.duration;
          }
          tmp = this.$current;
          this.$current = sound;
          tmp.pause();
          tmp.setPosition(0);
          this.$behind = available - sound.duration;
          this.$current.setPosition(position - this.$behind).then(function (r) {
            return sound.play().then(function () {
              return r;
            });
          });
        }
      } else {
        if (this.$behind + this.$current.duration >= position) {
          return this.$current.setPosition(position - this.$behind);
        } else {
          return this.$searchSeek(position);
        }
      }
    };

    SoundList.prototype.$searchSeek = function (position, sound, behind) {
      var self = this;
      sound = sound || this.$current;
      behind = behind || this.$behind;
      if (sound.duration + behind < position) {
        this.loading = true;
        this.$current = {};
        sound.pause();
        sound.setPosition(0);
        return sound.$next.load().then(function () {
          return self.$searchSeek(position, sound.$next, behind + sound.duration);
        });
      } else {
        return sound.setPosition(position - behind).then(function (r) {
          self.$current = sound;
          self.loading = false;
          self.$behind = behind;
          return sound.play().then(function () {
            return r;
          });
        });
      }
    };

    return {
      create: function (url, options) {
        return new Sound(url, options);
      },
      createList: function (urls, options) {
        return new SoundList(urls, options);
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

          if (this.readyState > 1 && !sound.$lp) {
            sound.$lp = sound.$ld.promise;
            sound.$ld.resolve(sound);
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
        whileplaying: asyncDigest(function () {
          sound.loading = false;
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
