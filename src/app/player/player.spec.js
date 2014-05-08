describe('prx.player', function () {

  beforeEach(module('prx.player'));

  it('has a timeCode filter', inject(function ($filter) {
    expect($filter('timeCode')).toBeDefined();
  }));

  describe('timeCode filter', function () {
    var timeCode;

    beforeEach(inject(function ($filter){
      timeCode = $filter('timeCode');
    }));

    it('returns 0:00:00 when a non-number is passed', function () {
      expect(timeCode('foo')).toEqual('0:00:00');
    });

    it('pads seconds smaller than 10 with a leading 0', function () {
      expect(timeCode(9000)).toEqual('0:00:09');
    });

    it('pads minutes smaller than 10 with a leading 0', function () {
      expect(timeCode(540000)).toEqual('0:09:00');
    });

    it('handles decimal numbers by rounding down', function () {
      expect(timeCode(9900)).toEqual('0:00:09');
    });

    it('does not pad numbers > 10', function () {
      expect(timeCode(11000)).toEqual('0:00:11');
    });

    it('has a short format', function () {
      expect(timeCode(11000, 'short')).toEqual('0:11');
    });
  });

  describe ('controllers', function () {
    var $controller;
    beforeEach(inject(function (_$controller_) {
      $controller = _$controller_;
    }));

    it('GlobalPlayerCtrl sets global to prxPlayer', function () {
      var controller = $controller('GlobalPlayerCtrl', {prxPlayer: 'asd'});
      expect(controller.global).toEqual('asd');
    });

    describe ('PlayerCtrl', function () {
      var ctrl, sound, prxPlayer;

      beforeEach(inject(function (_prxPlayer_) {
        sound = {};
        prxPlayer = _prxPlayer_;

        ctrl = $controller('PlayerCtrl');
        ctrl.setSound(sound);
      }));


      it ('pauses if appropriate', function () {
        spyOn(prxPlayer, 'pause');

        prxPlayer.nowPlaying = sound;

        ctrl.pause();
        expect(prxPlayer.pause).toHaveBeenCalled();
      });

      it ('does not pause if it isnt playing', function () {
        spyOn(prxPlayer, 'pause');

        ctrl.pause();
        expect(prxPlayer.pause).not.toHaveBeenCalled();
      });

      it ('plays', function () {
        spyOn(prxPlayer, 'play');

        ctrl.play();
        expect(prxPlayer.play.calls.mostRecent().args[0]).toBe(sound);
      });

      it ('toggles by playing if paused', function () {
        sound.paused = true;

        spyOn(ctrl, 'play');
        ctrl.toggle();
        expect(ctrl.play).toHaveBeenCalled();
      });

      it ('toggles by pausing if playing', function () {
        ctrl.paused = function () { return false; };

        spyOn(ctrl, 'pause');
        ctrl.toggle();
        expect(ctrl.pause).toHaveBeenCalled();
      });

      it ('is active if the sound is not paused', function () {
        sound.paused = false;

        expect(ctrl.active()).toBe(true);
      });

      it ('is active if the sound is not at the beginning', function () {
        sound.paused = true;
        sound.position = 10;

        expect(ctrl.active()).toBe(true);
      });
    });
  });

  xdescribe('soundFactory', function () {
    var soundFactory, smSound;
    beforeEach(inject(function (_smSound_, _prxSoundFactory_) {
      soundFactory = _prxSoundFactory_;
      smSound = _smSound_;
    }));

    it ('returns a function', function () {
      expect(angular.isFunction(soundFactory())).toBe(true);
    });

    it ('calls smSound.createList with passed audio files', function () {
      spyOn(smSound, 'createList').and.callThrough();
      soundFactory({audioFiles: [1]})();
      expect(smSound.createList.calls.mostRecent().args[0]).toEqual([1]);
    });

    it ('sets story from options', function () {
      spyOn(smSound, 'createList').and.returnValue({});
      var sound = soundFactory({story: 'sigil'})();
      expect(sound.story).toEqual('sigil');
    });

    it ('sets sound when memoized', function () {
      var factory = soundFactory({audioFiles: []}), sound = factory();
      expect(factory.sound).toBe(sound);
    });

    it ('returns whatever is memoized', function () {
      var factory = soundFactory({audioFiles: []});
      factory.sound = "sigil";
      expect(factory()).toEqual('sigil');
    });
  });

  describe ('prxPlayer', function () {
    var prxPlayer, $analytics;

    beforeEach(module(function ($provide) {
      $provide.decorator('$analytics', function ($delegate) {
        spyOn($delegate, 'eventTrack');
        spyOn($delegate, 'pageTrack');
        return $delegate;
      });
    }));

    beforeEach(inject(function (_prxPlayer_, _$analytics_) {
      prxPlayer = _prxPlayer_;
      $analytics = _$analytics_;
      sound = jasmine.createSpyObj('sound', ['play', 'pause', 'resume']);
      sound.story = {id: 1};
    }));

    function eventTracked(action, details) {
      var matched = false;
      details = details || {};
      angular.forEach($analytics.eventTrack.calls.allArgs(), function (args) {
        if (!matched && args[0] == action) {
          var fail = false;
          angular.forEach(details, function (value, key) {
            if (args[1][key] !== value) {
              fail = true;
            }
          });
          if (!fail) {
            matched = true;
          }
        }
      });
      return matched;
    }

    describe ('#play', function () {
      it ('calls play on the sound', function () {
        prxPlayer.play(sound);
        expect(sound.play).toHaveBeenCalled();
      });

      it ('sets nowPlaying as the sound', function () {
        prxPlayer.play(sound);
        expect(prxPlayer.nowPlaying).toBe(sound);
      });

      it ('calls resume if passed the nowPlaying sound paused', function () {
        sound.paused = true;
        spyOn(prxPlayer, 'resume');
        prxPlayer.nowPlaying = sound;
        prxPlayer.play(sound);
        expect(prxPlayer.resume).toHaveBeenCalled();
      });

      it ('does not call resume if passed nowPlaying', function () {
        sound.paused = false;
        spyOn(prxPlayer, 'resume');
        prxPlayer.nowPlaying = sound;
        prxPlayer.play(sound);
        expect(prxPlayer.resume).not.toHaveBeenCalled();
        expect(sound.play).not.toHaveBeenCalled();
      });
    });

    describe ('#pause', function () {
      it ('calls pause on nowPlaying', function () {
        prxPlayer.nowPlaying = sound;
        prxPlayer.pause();
        expect(sound.pause).toHaveBeenCalled();
      });

      it ('tracks the event', function () {
        prxPlayer.nowPlaying = sound;
        prxPlayer.pause();
        expect(eventTracked('Pause', {label: 1})).toBe(true);
      });

      it ('does nothing if nowPlaying is already paused', function () {
        prxPlayer.nowPlaying = sound;
        sound.paused = true;
        prxPlayer.pause();
        expect(eventTracked('Pause')).toBe(false);
        expect(sound.pause).not.toHaveBeenCalled();
      });
    });

    describe ('#resume', function () {
      it('calls resume on nowPlaying', function () {
        prxPlayer.nowPlaying = sound;
        prxPlayer.resume();
        expect(sound.resume).toHaveBeenCalled();
      });

      it ('tracks the event', function () {
        prxPlayer.nowPlaying = sound;
        prxPlayer.resume();
        expect(eventTracked('Resume', {
          category: 'Audio Player', label: 1
        })).toBe(true);
      });

      it('does nothing if there is nothing nowPlaying', function () {
        prxPlayer.resume();
        expect(eventTracked('Resume')).toBe(false);
        expect(sound.resume).not.toHaveBeenCalled();
      });
    });

  });
});
