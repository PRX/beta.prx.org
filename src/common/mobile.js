var angular = require('angular');

// mobile browser helpers
var app = angular.module('ngMobile', []);
module.exports = app.name;

app.factory('ngMobileOS', function ($window) {
  var ANDROID_UA = /android/i,
    IOS_UA = /iP(?:hone|ad|od)/i;
  if (ANDROID_UA.test($window.navigator.userAgent)) {
    return {
      android: true,
      iOS: false,
      isMobile: true
    };
  } else if (IOS_UA.test($window.navigator.userAgent)) {
    return {
      iOS: true,
      android: false,
      isMobile: true
    };
  }
  return {
    android: false,
    iOS: false,
    isMobile: false
  };
})
.directive('iosOnly', function (ngMobileOS) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      if (ngMobileOS.isMobile && !ngMobileOS.iOS) {
        elem.remove();
      }
    }
  };
})
.directive('androidOnly', function (ngMobileOS) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      if (ngMobileOS.isMobile && !ngMobileOS.android) {
        elem.remove();
      }
    }
  };
})
.directive('mobileOnly', function (ngMobileOS) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      if (!ngMobileOS.isMobile) {
        elem.remove();
      }
    }
  };
});
