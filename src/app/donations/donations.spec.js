var helper       = require('../../common/spec-helper');
var halmock      = require('../../common/angular-hal-mock');
var prxbus       = require('../../common/bus');
var prxdonations = require('./donations');

describe('prx.donations', function () {

  beforeEach(helper.module(prxdonations, halmock, prxbus));

  describe('prxDonateURL service', function () {

    it('returns a URL for Radiotopia accounts', inject(function (ngHal, prxDonateURL) {
      var acct = ngHal.mock('http://meta.prx.org/model/account', {id: 45139});
      expect(prxDonateURL.forAccount(acct)).toMatch(/^http:/);
    }));

    it('not returns a URL for non Radiotopia accounts', inject(function (ngHal, prxDonateURL) {
      var acct = ngHal.mock('http://meta.prx.org/model/account', {id: 0});
      expect(prxDonateURL.forAccount(acct)).toBeUndefined();
    }));

  });

  describe('prxDonate directive', function () {

    beforeEach(helper.module(function ($provide) {
      $provide.decorator('$analytics', function ($delegate) {
        spyOn($delegate, 'eventTrack');
        return $delegate;
      });
    }));

    var $analytics, prxDonateURL;
    beforeEach(inject(function (_$analytics_, _prxDonateURL_) {
      $analytics = _$analytics_;
      prxDonateURL = _prxDonateURL_;
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

    var scope, elem, span, elem2, emptySpan, elem3, button, busProxy;
    beforeEach(inject(function ($compile, $rootScope, ngHal, Bus) {
      scope = $rootScope.$new();

      scope.radiotopiaAaccount = ngHal.mock('http://meta.prx.org/model/account', {id: 45139});
      elem = '<span><prx-donate account="radiotopiaAaccount"></prx-donate><span>';
      span = $compile(elem)(scope);

      scope.miscAccount = ngHal.mock('http://meta.prx.org/model/account', {id: 0});
      elem2 = '<span><prx-donate account="miscAccount"></prx-donate></span>';
      emptySpan = $compile(elem2)(scope);

      elem3 = '<prx-donate account="radiotopiaAaccount"></prx-donate>';
      button = $compile(elem3)(scope);

      busProxy = {
        click: function () {}
      };

      Bus.on('donate.outbound', function () {
        busProxy.click();
      });
    }));

    it('compiles', function () {
      expect(span).toBeDefined();
    });

    it('exists when the account is in Radiotopia', function () {
      expect(span.children().length).toBeGreaterThan(0);
    });

    it('is removed from DOM when account is not in Radiotopia', function () {
      expect(emptySpan.children().length).toBe(0);
    });

    it('binds to clicks when in the DOM', function () {
      spyOn(busProxy, 'click');
      button.triggerHandler('click');
      expect(busProxy.click).toHaveBeenCalled();
    });

    it('tracks an event when clicked', function () {
      button.triggerHandler('click');
      account = scope.radiotopiaAaccount;
      url = prxDonateURL.forAccount(account);
      label = 'Account-' + account.id.toString() + '-' + url;
      expect(eventTracked('Donate', {label: label})).toBe(true);
    });

  });

});
