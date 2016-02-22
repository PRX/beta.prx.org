var helper  = require('../../common/spec-helper');
var halmock = require('../../common/angular-hal-mock');
var prxads  = require('./ads');

describe('prx.ads', function () {

  beforeEach(helper.module(prxads));

  describe('prxAd directive', function () {
    var elem, googletag, displaySpy, gSlot;

    beforeEach(helper.module('templates'));

    beforeEach(inject(function ($compile, $rootScope, $window) {
      gSlot = jasmine.createSpyObj('gSlot', ['defineSizeMapping']);
      googletag = {
        cmd: {
          push: function (fn) { return fn.call(); }
        },
        display: function() {},
        defineSlot: function() {
          return {
            addService: function() {
              return gSlot;
            }
          };
        },
        enableServices: function() {},
        pubads: function() {
          return {
            refresh: function() { }
          };
        }
      };
      $window.googletag = googletag;
      displaySpy = spyOn(googletag, 'display');
      elem = $compile('<prx-ad slot="/foo"></prx-ad>')($rootScope).children().eq(0);
      $rootScope.$digest();
    }));

    afterEach(inject(function($window) {
      $window.googletag = undefined;
    }));

    it('compiles', function () {
      expect(elem).toBeDefined();
    });

    it('sets random id on element', function() {
      expect(elem.attr('id')).toBeDefined();
      expect(elem.attr('id')).toMatch(/div-gpt-ad-/);
      expect(elem.attr('id').length).toBeGreaterThan(11);
    });

    it('asks to display an ad in the element', function() {
      expect(displaySpy).toHaveBeenCalledWith(elem.attr('id'));
    });

    it('reloads element on window resize', inject(function($window, $timeout) {
      var controller = elem.controller('prxAd');
      controller.reload = jasmine.createSpy('reload');
      angular.element($window).triggerHandler('resize');
      expect(controller.reload).toHaveBeenCalled();
    }));

    it('can perform a reload if ad element size changes', inject(function($timeout) {
      var controller = elem.controller('prxAd');
      var called = null;
      controller.width = 300;
      controller.height = 250;
      controller.reload(gSlot, 320, 50);
      $timeout.flush();
      expect(gSlot.defineSizeMapping).toHaveBeenCalled();
      expect(controller.width).toBe(320);
      expect(controller.height).toBe(50);
    }));

    it('removes reload callback when the scope is destroyed', inject(function($window, $rootScope) {
      var controller = elem.controller('prxAd');
      var spy = spyOn(controller.win, 'off');
      $rootScope.$emit('$destroy');
      expect(spy).toHaveBeenCalledWith('resize', controller.doReload);
    }));

  });

});
