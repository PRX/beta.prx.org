describe('prx.welcome', function () {
  beforeEach(module('prx.welcome'));

  describe ('WelcomeCtrl', function () {
  });

  describe ('directive', function () {
    it ('compiles', inject(function ($compile) {
      $compile('<prx-welcome></prx-welcome>');
    }));
  });
});
