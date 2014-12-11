// simple service to get uuids using node-uuid project

angular.module('angular-id3', ['async-loader'])
.service('Id3Service', function ($rootScope, $q, $window, AsyncLoader) {

  var Id3Service = this;

  var loadId3 = function () {
    return AsyncLoader.load('/vendor/id3/dist/id3.js').then( function() {
      Id3Service.$id3 = $window.id3;
    });
  };



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

  Id3Service.analyze = function (file) {
    var deferred = $q.defer();

    loadId3().then( function () {
      Id3Service.$id3(file, function(err, tags) {
        $rootScope.$evalAsync( function() {
          if (angular.isDefined(tags)) {
            var flat = flattenTags(tags);
            deferred.resolve(flat);
          } else {
            deferred.reject(err);
          }
        });
      });
    });

    return deferred.promise;
  };
});
