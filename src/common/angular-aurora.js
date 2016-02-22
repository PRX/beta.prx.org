var angular = require('angular');

// audio decoding
var app = angular.module('angular-aurora', [
  require('./async-loader')
]);
module.exports = app.name;

app.service('AuroraService', function ($rootScope, $q, $window, AsyncLoader) {

  var AuroraService = this;

  var loadAV = function () {
    // load codecs or other libs that need to be available before loading aurora.js
    return AsyncLoader.load('/vendor/aurora.js').then( function() {
      return AsyncLoader.load(['/vendor/mp3.js']).then( function () {
        // AV is loaded on the window now.
        AuroraService.$AV = $window.AV;
      });
    });
  };

  // formatID is less than useful, update it
  var correctFormat = function (format) {
    if ((format.formatID == 'mp3') && (format.layer == 2)) {
      format.format = 'mp2';
    } else {
      format.format = format.formatID;
    }
    return format;
  };

  var getInfo = function (file, info) {
    var deferred = $q.defer();
    var asset;

    loadAV().then( function() {
      asset = AuroraService.$AV.Asset.fromFile(file);

      asset.get(info, function (res) {
        $rootScope.$evalAsync( function() {
          deferred.resolve(res);
        });
      });

    });

    return deferred.promise;
  };

  AuroraService.format = function (file) {
    return getInfo(file, 'format').then( function (format) {
      return correctFormat(format);
    });
  };

  AuroraService.duration = function (file) {
    return getInfo(file, 'duration');
  };

  AuroraService.metadata = function (file) {
    return getInfo(file, 'metadata');
  };

});
