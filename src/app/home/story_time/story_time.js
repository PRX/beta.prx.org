angular.module('prx.home.storytime', ['ui.router', 'prx.url-translate'])
.config(function ($stateProvider, urlTranslateProvider) {
  urlTranslateProvider.translate('/storytime', '/');

  $stateProvider.state('home.storyTime', {
    url: '/storytime',
    title: 'Storytime - A weekly newsletter',
    views: {
      '@': {
        controller: 'StoryTimeFormCtrl as storyTime',
        templateUrl: 'home/story_time/story_time.html'
      }
    }
  }).state('home.storyTime.error', {
    resolve: {
      message: ['$stateParams', function ($stateParams) {
        return $stateParams.message;
      }]
    },
    params: ['message'],
    views: {
      'modal@': {
        controller: 'StoryTimeErrorCtrl as error',
        templateUrl: 'home/story_time/error_modal.html'
      }
    }
  });
}).service('MailChimp', function ($http, $q) {
  this.subscribe = function (email) {
    return $http.jsonp("http://prx.us3.list-manage.com/subscribe/post-json?u=b030d898f636b90f47f8cd820&id=31613e47c3&c=JSON_CALLBACK", {
      params: {EMAIL: email},
      responseType: 'json'
    }).then(function (response) {
      if (response.data.result == "success") {
        return response.data.msg;
      } else {
        return $q.reject(response.data.msg);
      }
    }, function (error) {
      return $q.reject("An unknown error has occurred. Try again later.");
    });
  };
}).controller('StoryTimeErrorCtrl', function (message) {
  this.message = message;
}).controller('StoryTimeFormCtrl', function (MailChimp, $state, $timeout) {
  var self = this;

  this.subscribe = function () {
    this.submitting = true;
    MailChimp.subscribe(this.email).then(function (message) {
      self.message = message;
      self.subscribed = true;
    }, function (error) {
      $state.go('.error', {message: error});
    }).finally(function () {
      self.submitting = false;
    });
  };
});
