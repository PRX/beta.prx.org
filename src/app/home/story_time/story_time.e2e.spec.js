var helper = require('../../../common/spec-e2e-helper');

describe ('story time', function () {

  beforeEach(function () {
    browser.addMockModule('fakeMailchimp', function () {
      angular.module('fakeMailchimp', ['ngAnimate'])
      .service("MailChimp", ['$q', function ($q) {
        this.subscribe = function (email) {
          if (email == 'fail@example.com') {
            return $q.reject('no');
          } else {
            return $q.when("yeah");
          }
        };
      }]);
    });

    browser.get('/storytime');
  });

  it ('requires a valid email', function () {
    var button = $('form[name=subscribe] button[type=submit]');
    expect(button.getAttribute('disabled')).toBeTruthy();
    element(by.model('storyTime.email')).sendKeys('example');
    expect(button.getAttribute('disabled')).toBeTruthy();
    element(by.model('storyTime.email')).sendKeys('@example.com');
    expect(button.getAttribute('disabled')).toBeFalsy();
    button.click();
    expect($('p.subscribed').getText()).toMatch(/yeah/);
  });

  it ('shows an error when passed an invalid email', function () {
    var button = $('form[name=subscribe] button[type=submit]');
    element(by.model('storyTime.email')).sendKeys('fail@example.com');
    button.click();
    expect($('.modal:not(.error)').getText()).toMatch(/no/);
  });

});
