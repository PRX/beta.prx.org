// simple service to get uuids using node-uuid project

angular.module('angular-uuid', [])
.factory('$uuid', function ($window) {
  return $window.uuid;
});
