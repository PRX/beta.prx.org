var angular = require('angular');
var TheCount = require('./count');

// TODO: make require'able
TheCount = window.TheCount;

// the count analytics
var app = angular.module('angulartics.prx.count', [
  require('angulartics'),
  require('./url-translater')
]);
module.exports = app.name;

app.config(['$provide', function ($provide) {
  $provide.decorator('$analytics', ['$delegate', '$window', 'urlTranslate', function ($delegate, $window, urlTranslate) {
    var pageTrack = $delegate.pageTrack;
    var eventTrack = $delegate.eventTrack;
    var prefix = window.location.protocol + '//' + window.location.host;

    $delegate.pageTrack = function (url) {
      TheCount.logAction({action: 'view', url: prefix + urlTranslate(url)});
      pageTrack.call(this, url);
    };

    $delegate.eventTrack = function (eventName, eventValue) {
      TheCount.logAction({
        url: urlTranslate($window.location.href),
        action: eventName.split(' ',1).join('').toLowerCase(),
        action_value: JSON.stringify(eventValue)
      });
      eventTrack.call(this, eventName, eventValue);
    };

    return $delegate;
  }]);
}]);
