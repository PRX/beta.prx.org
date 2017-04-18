var angular = require('angular');
var scriptjs = require('scriptjs');

// load files asynchronously
var app = angular.module('async-loader', []);
module.exports = app.name;

app.factory('$scriptjs', function () {
  return scriptjs;
})
.service('AsyncLoader', function ($scriptjs, $rootScope, $q) {

  this.load = function (files) {
    var loadFiles = files;
    var deferred = $q.defer();
    $scriptjs(files,
      function() {
        $rootScope.$evalAsync( function() {
          deferred.resolve(loadFiles);
        });
      },
      function(depsNotFound) {
        $rootScope.$evalAsync( function() {
          deferred.reject({load: loadFiles, notFound: depsNotFound});
        });
      }
    );

    return deferred.promise;
  };
});
