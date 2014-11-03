// simple service to get uuids using node-uuid project

angular.module('angular-id3', [])
.factory('id3', function ($window) {
  return $window.id3;
})
.service('Id3Service', function (id3, $rootScope, $q) {

  this.analyze = function (file) {
    var deferred = $q.defer();
    id3(file, function(err, tags){

      $rootScope.$evalAsync( function() {
        if (tags) {
          deferred.resolve(tags);
        } else {
          deferred.reject(err);
        }
      });
    });

    return deferred.promise;
  };
});
