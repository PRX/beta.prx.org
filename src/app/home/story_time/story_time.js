angular.module('prx.home.storytime', ['ui.router', 'prx.url-translate', 'angulartics'])
.config(function ($stateProvider, urlTranslateProvider) {
  urlTranslateProvider.translate('/storytime', '/');

  $stateProvider.state('home.storyTime', {
    url: 'storytime',
    title: 'Storytime - A weekly newsletter',
    views: {
      '@': {
        controller: 'StoryTimeFormCtrl as storyTime',
        templateUrl: 'home/story_time/story_time.html'
      }
    }
  }).state('home.storyTime.error', {
    params: {'message':''},
    views: {
      'modal@': {
        controller: 'StoryTimeErrorCtrl as error',
        templateUrl: 'home/story_time/error_modal.html'
      }
    }
  });
}).service('MailChimp', function ($http, $q, $analytics) {
  this.subscribe = function (email) {
    $analytics.eventTrack('Subscribe', {
      category: 'Mailing Lists',
      label: 'Story Time'
    });
    return $http.jsonp("https://prx.us3.list-manage.com/subscribe/post-json?u=b030d898f636b90f47f8cd820&id=31613e47c3&c=JSON_CALLBACK", {
      params: {EMAIL: email},
      responseType: 'json'
    }).then(function (response) {
      if (response.data.result == "success") {
        $analytics.eventTrack('Subscribe Success', {
          category: 'Mailing Lists',
          label: 'Story Time',
          noninteraction: true
        });
        return response.data.msg;
      } else {
        return $q.reject(response.data.msg);
      }
    }, function (error) {
      return $q.reject("An unknown error has occurred. Try again later.");
    });
  };
}).controller('StoryTimeErrorCtrl', function ($stateParams) {
  this.message = $stateParams.message;
}).controller('StoryTimeFormCtrl', function (MailChimp, $state) {
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
}).directive('storytimeCta', function () {
  return {
    restrict: 'E',
    replace: true,
    template: '<section class="story-time-cta"><a ui-sref="home.storyTime">Get Free Stories</a></section>'
  };
});
