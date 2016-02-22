var helper = require('../common/spec-e2e-helper');

describe('application', function () {

  describe('home page', function () {
    beforeEach(function () {
      browser.get('/');
    });

    helper.featit('redirects to the /nxt modal', '!HOME_PAGE', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/nxt$/);
    });
  });

  describe('any page', function () {
    beforeEach(function () {
      browser.addMockModule('fakeStates', function () {
        angular.module('fakeStates', ['ui.router'])
        .config(['$stateProvider', function ($stateProvider) {
          $stateProvider.state('fake', {
            url: '/fake',
            template: 'Hello! <a ui-sref=".modal">modal</a>'
          }).state('fake.modal', {
            url: '/modal',
            views: {
              'modal@': {
                template: 'Hello!'
              }
            }
          });
        }]);
      });

      browser.get('/fake');
    });

    helper.featit('takes you to the / page when you tap the prx logo', 'HOME_PAGE', function() {
      $('h1 a').click();
      expect(browser.getCurrentUrl()).toMatch(/\//);
    });

    helper.featit('takes you to the /nxt page when you tap the prx logo', '!HOME_PAGE', function() {
      $('h1 a').click();
      expect(browser.getCurrentUrl()).toMatch(/\/nxt/);
    });

    it ('opens modals', function () {
      var modal = $('.modal:not(.error)');
      var dismiss = $('.modal:not(.error) .dismiss');

      expect(modal.isDisplayed()).toBe(false);
      element(by.linkText('modal')).click();
      expect(modal.isDisplayed()).toBe(true);
      dismiss.click();
      expect(modal.isDisplayed()).toBe(false);
    });
  });
});
