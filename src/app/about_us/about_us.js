angular.module('prx.aboutus', ['ui.router'])
.config(function ($stateProvider) {
  $stateProvider.state('aboutUs', {
    abstract: true,
    title: 'About Us'
  })
  .state('aboutUs.press', {
    url: '/about-us/press',
    title: 'Press',
    views: {
      '@': {
        templateUrl: 'about_us/press.html'
      }
    }
  })
  .state('aboutUs.team', {
    url: 'about-us/team',
    title: 'Team',
    views: {
      '@': {
        templateUrl: 'about_us/team.html'
      }
    }
  })
  .state('aboutUs.whatIsPrx', {
    url: '/about-us/what-is-prx',
    views: {
      '@': {
        templateUrl: 'about_us/what_is_prx.html'
      }
    },
    title: 'What Is PRX'
  })
  .state('aboutUs.funding', {
    url: '/about-us/funding',
    title: "Funding"
    views: {
      '@': {
        templateUrl: 'about_us/funding.html'
      }
    }
  });
});
