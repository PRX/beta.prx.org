beforeEach(function () {
  browser.addMockModule('noAnimate', function () {
    angular.module('noAnimate', ['ngAnimate'])
    .run(function ($animate) {
      $animate.enabled(false);
    });
  });
});

describe('application', function () {
  describe('home page', function () {
    beforeEach(function () {
      browser.get('/');
    });

    it ('redirects to the /nxt modal', function () {
      expect(browser.getCurrentUrl()).toMatch(/\/nxt$/);
    });
  });

  describe('any page', function () {
    beforeEach(function () {
      browser.addMockModule('fakeStates', function () {
        angular.module('fakeStates', ['ui.router'])
        .config(function ($stateProvider) {
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
        });
      });

      browser.get('/fake');
    });

    it ('takes you to the /nxt page when you tap the prx logo', function () {
      $('h1 a').click();
      expect(browser.getCurrentUrl()).toMatch(/\/nxt$/);
    });

    it ('opens modals', function () {
      var modal = $('.modal');

      expect(modal.isDisplayed()).toBe(false);
      element(by.linkText('modal')).click();
      expect(modal.isDisplayed()).toBe(true);
      $('.dismiss').click();
      expect(modal.isDisplayed()).toBe(false);
    });
  });
});
