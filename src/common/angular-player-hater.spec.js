describe('soundManager', function () {
  'use strict';
  var soundManager, onready, windowSm, $scope;

  beforeEach(module('ngPlayerHater', 'soundManagerMock',
    function (soundManagerProvider, $provide) {
      onready = jasmine.createSpy('onready');
      soundManagerProvider.options.onready = onready;
      $provide.decorator('globalSoundManager', function ($delegate) {
        var globalSoundManager = $delegate;
        spyOn(globalSoundManager, 'createSound');
        spyOn(globalSoundManager, 'canPlayLink');
        spyOn(globalSoundManager, 'canPlayMIME');
        spyOn(globalSoundManager, 'canPlayURL');
        spyOn(globalSoundManager, 'mute');
        spyOn(globalSoundManager, 'pauseAll');
        spyOn(globalSoundManager, 'resumeAll');
        spyOn(globalSoundManager, 'stopAll');
        spyOn(globalSoundManager, 'unmute');

        return globalSoundManager;
      });
    }
  ));

  beforeEach(inject(function (globalSoundManager, _soundManager_, $rootScope) {
    soundManager = _soundManager_;
    $scope = $rootScope.$new();
    windowSm = globalSoundManager;
  }));

  it('defines soundManager2 for injection', function () {
    expect(soundManager).toBeDefined();
  });

  it('calls through to the configured onready', function () {
    expect(onready).toHaveBeenCalled();
  });

  it('defers sound creation until soundmanager is loaded', function () {
    soundManager.createSound();
    expect(windowSm.createSound).not.toHaveBeenCalled();
  });

  it('promises sounds', function () {
    var args = {url:'/test.mp3'};
    soundManager.createSound(args);
    $scope.$digest();
    expect(windowSm.createSound).toHaveBeenCalled();
    expect(windowSm.createSound.calls.mostRecent().args[0]).toBe(args);
  });

  it('checks to see if you can play a link', function () {
    soundManager.canPlayLink('foo');
    $scope.$digest();
    expect(windowSm.canPlayLink.calls.mostRecent().args[0]).toBe('foo');
  });

  it('checks to see if you can play a MIME type', function () {
    soundManager.canPlayMIME('foo');
    $scope.$digest();
    expect(windowSm.canPlayMIME.calls.mostRecent().args[0]).toBe('foo');
  });

  it('checks to see if you can play a URL', function () {
    soundManager.canPlayURL('foo');
    $scope.$digest();
    expect(windowSm.canPlayURL.calls.mostRecent().args[0]).toBe('foo');
  });

  it('mutes all sounds', function () {
    soundManager.mute();
    $scope.$digest();
    expect(windowSm.mute).toHaveBeenCalled();
  });

  it('pauses all sounds', function () {
    soundManager.pauseAll();
    $scope.$digest();
    expect(windowSm.pauseAll).toHaveBeenCalled();
  });

  it('resumes all sounds', function () {
    soundManager.resumeAll();
    $scope.$digest();
    expect(windowSm.resumeAll).toHaveBeenCalled();
  });

  it('stops all sounds', function () {
    soundManager.stopAll();
    $scope.$digest();
    expect(windowSm.stopAll).toHaveBeenCalled();
  });

  it('unmutes all sounds', function () {
    soundManager.unmute();
    $scope.$digest();
    expect(windowSm.unmute).toHaveBeenCalled();
  });

  describe('smSound', function () {
    var soundMethods = ('destruct load mute pause play resume setPan setPosition ' +
                     'setVolume stop toogleMute togglePause unload unmute').split(' ');
    var smSoundSpy, smSound;

    beforeEach(inject(function (globalSoundManager, _smSound_) {
      smSound = _smSound_;
      smSoundSpy = jasmine.createSpyObj('sound', soundMethods);
      globalSoundManager.createSound.and.returnValue(smSoundSpy);
    }));

    it('provides smSound factory for injection', function () {
      expect(smSound).toBeDefined();
      expect(angular.isFunction(smSound.create)).toBe(true);
    });

    it('requires the url argument to be present', function () {
      expect(function() {
        smSound.create();
      }).toThrow();
    });

    it ('accepts an object with the url property', function () {
      var sound = smSound.create({url: '/asd.mp3', name: 123});
      expect(sound.name).toBe(123);
    });

    describe('newly created', function () {
      var url, sound;

      beforeEach(inject(function (smSound) {
        url = '/mp3.mp3';
        sound = smSound.create(url);
      }));

      it('is not playing', function () {
        expect(sound.playing).toBe(false);
      });

      it('is not loading', function () {
        expect(sound.loading).toBe(false);
      });

      it('is paused', function () {
        expect(sound.paused).toBe(true);
      });

      it('has an undefined duration', function () {
        expect(sound.duration).not.toBeDefined();
      });

      it('has an undefined position', function (){
        expect(sound.position).not.toBeDefined();
      });

      it('has an empty id3 tag', function () {
        expect(sound.id3).toEqual({});
      });

      describe('after soundManager is loaded', function () {
        beforeEach(function () {
          $scope.$digest();
        });

        it('attempts to create a sound', function () {
          expect(windowSm.createSound).toHaveBeenCalled();
        });

        it('passes through its url to createSound', function () {
          expect(windowSm.createSound.calls.mostRecent().args[0].url).toBe(url);
        });

        for (var i = soundMethods.length - 1; i >= 0; i -= 1) {
          /* jshint loopfunc: true */
          (function (method) {
            it('calls ' + method + ' through to the underlying sound', function () {
              sound[method].call(sound);
              $scope.$digest();
              expect(smSoundSpy[method]).toHaveBeenCalled();
            });

            it('passes parameters through to the underlying sound for ' + method, function () {
              sound[method].call(sound, 'foo');
              $scope.$digest();
              expect(smSoundSpy[method].calls.mostRecent().args[0]).toEqual('foo');
            });
          }(soundMethods[i]));
        }

        it('does not expose the onPosition or clearOnPosition methods', function () {
          expect(sound.onPosition).toBeUndefined();
          expect(sound.clearOnPosition).toBeUndefined();
        });

        describe('soundManager lifecycle', function () {
          var callbacks;

          beforeEach(function () {
            callbacks = windowSm.createSound.calls.mostRecent().args[0];
          });

          function flush() {
            inject(function ($timeout) {
              $timeout.flush();
            });
          }

          it('passes an onload callback', function () {
            expect(callbacks.onload).toBeDefined();
          });

          it('sets loading when onload is called with readyState 1', function () {
            callbacks.onload.call({readyState:1});
            expect(sound.loading).toBe(false);
            flush();
            expect(sound.loading).toBe(true);
            expect(sound.error).toBe(false);
          });

          it('sets loading to false and error to true with readyState 2', function () {
            callbacks.onload.call({readyState:2});
            flush();
            expect(sound.loading).toBe(false);
            expect(sound.error).toBe(true);
          });

          it('sets loading to false and error to false with readyState 3', function () {
            callbacks.onload.call({readyState:3});
            flush();
            expect(sound.loading).toBe(false);
            expect(sound.error).toBe(false);
          });

          it('copies the duration when readyState is 3', function () {
            callbacks.onload.call({readyState:3, duration: 212});
            flush();
            expect(sound.duration).toBe(212);
          });

          it('passes an onpause callback', function () {
            expect(callbacks.onpause).toBeDefined();
          });

          it('is paused when the onpause callback is called', function () {
            sound.paused = false;
            callbacks.onpause();
            expect(sound.paused).toBe(false);
            flush();
            expect(sound.paused).toBe(true);
          });

          it('is not playing when the onpause callback is called', function () {
            sound.playing = true;
            callbacks.onpause();
            expect(sound.playing).toBe(true);
            flush();
            expect(sound.playing).toBe(false);
          });

          it('passes an onplay callback', function () {
            expect(callbacks.onplay).toBeDefined();
          });

          it('is not paused when the onplay callback is called', function () {
            callbacks.onplay();
            expect(sound.paused).toBe(true);
            flush();
            expect(sound.paused).toBe(false);
          });

          it('passes an onresume callback', function () {
            expect(callbacks.onresume).toBeDefined();
          });

          it('is not paused when the onresume callback is called', function () {
            callbacks.onresume();
            expect(sound.paused).toBe(true);
            flush();
            expect(sound.paused).toBe(false);
          });

          it('passes an onid3 callback', function () {
            expect(callbacks.onid3).toBeDefined();
          });

          it('copies the id3 property when onid3 is called', function () {
            callbacks.onid3.call({id3:{artist:'PRINCE'}});
            expect(sound.id3).toEqual({});
            flush();
            expect(sound.id3.artist).toEqual('PRINCE');
          });

          it('passes a whileloading callback', function () {
            expect(callbacks.whileloading).toBeDefined();
          });

          it('copies the duration estimate whileloading', function () {
            callbacks.whileloading.call({durationEstimate:214});
            flush();
            expect(sound.duration).toBe(214);
          });

          it('passes a whileplaying callback', function () {
            expect(callbacks.whileplaying).toBeDefined();
          });

          it('copies the position whileplaying', function () {
            callbacks.whileplaying.call({position:222});
            flush();
            expect(sound.position).toBe(222);
          });
        });
      });
    });
  });
});
