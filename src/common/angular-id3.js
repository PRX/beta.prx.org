// simple service to get uuids using node-uuid project

angular.module('angular-id3', [])
.factory('id3', function ($window) {
  return $window.id3;
})
.service('Id3Service', function (id3, $rootScope, $q) {

  var flattenTags = function (tags) {
    var ft = angular.copy(tags);
    for (var i=0; i<=3; i++) {
      var vtags = ft['v'+i];
      if (angular.isDefined(vtags)) {
        angular.extend(ft, vtags);
        delete ft['v'+i];
      }
    }
    return ft;
  };

  this.analyze = function (file) {
    var deferred = $q.defer();
    id3(file, function(err, tags) {

      $rootScope.$evalAsync( function() {
        if (angular.isDefined(tags)) {
          var flat = flattenTags(tags);
          deferred.resolve(flat);
        } else {
          deferred.reject(err);
        }
      });
    });

    return deferred.promise;
  };
});
