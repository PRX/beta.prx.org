angular.module('angular-aurora', [])
.factory('$AV', function ($window) {
  return $window.AV;
})
.service('AuroraService', function ($AV, $rootScope, $q) {

  // formatID is less than useful, update it
  var correctFormat = function (format) {
    var cf = angular.copy(format);
    return cf;
  };

  var getInfo = function (file, info) {
    var deferred = $q.defer();
    var asset = $AV.Asset.fromFile(file);

    asset.get(info, function (res) {
      $rootScope.$evalAsync( function() {
        deferred.resolve(res);
      });
    });

    return deferred.promise;
  };

  this.format = function (file) {
    return getInfo(file, 'format').then( function (format) {
      return correctFormat(format);
    });
  };

  this.duration = function (file) {
    return getInfo(file, 'duration');
  };

  this.metadata = function (file) {
    return getInfo(file, 'metadata');
  };

});
