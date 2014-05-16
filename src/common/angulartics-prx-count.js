angular.module('angulartics.prx.count', ['angulartics', 'prx.url-translate'])
.config(['$provide', function ($provide) {
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
        action: eventName.split(' ',1).join('').toLowerCase(),
        action_value: JSON.stringify(eventValue)
      });
      eventTrack.call(this, eventName, eventValue);
    };

    return $delegate;
  }]);
}]);
