var angular = require('angular');

// direct upload to s3
var app = angular.module('angular-evaporate', [
  require('./async-loader')
]);
module.exports = app.name;

app.provider('evaporate', function () {

  var injector;

  var config = {
    signerUrl: null,
    bucket: null,
    awsKey: null,
    awsUrl: 'https://s3.amazonaws.com',
    cloudfront: false,
    options: {}
  };

  var Provider = {
    signerUrl: function (signerUrl) {
      config.signerUrl = signerUrl;
      return Provider;
    },
    awsKey: function (awsKey) {
      config.awsKey = awsKey;
      return Provider;
    },
    awsUrl: function (awsUrl) {
      config.awsUrl = awsUrl;
      return Provider;
    },
    bucket: function (bucket) {
      config.bucket = bucket;
      return Provider;
    },
    cloudfront: function (cloudfront) {
      config.cloudfront = cloudfront;
      return Provider;
    },
    options: function (options) {
      config.options = options;
      return Provider;
    },
    '$get': ['$q', '$window', '$rootScope', 'AsyncLoader',
      function ($q, $window, $rootScope, AsyncLoader) {
        return new NgEvaporate($q, $window, $rootScope, config, AsyncLoader);
    }]
  };

  function NgEvaporate ($q, $window, $rootScope, config, AsyncLoader) {
    var e = this;
    e.q         = $q;
    e.rootScope = $rootScope;
    e.window    = $window;
    e.options   = config;
    e.loader    = AsyncLoader;

    e.opts = angular.copy(e.options.options);
    e.opts.signerUrl  = e.options['signerUrl'];
    e.opts.bucket     = e.options['bucket'];
    e.opts.cloudfront = e.options['cloudfront'];

    // rename awsKey -> aws_key
    e.opts.aws_key    = e.options['awsKey'];
    e.opts.aws_url    = e.options['awsUrl'];
  }

  NgEvaporate.prototype = {
    loadEvaporate: function() {
      var e = this;
      return e.loader.load('/vendor/EvaporateJS/evaporate.js').then( function(loaded) {
        // TODO Save the promise so we don't need to worry about doing other
        // things before load resolves.
        e._evaporate = new e.window.Evaporate(e.opts);
      });
    },
    cancel: function(id) {
      return this._evaporate.cancel(id);
    },
    add: function(config) {
      var e = this;

      var deferred = e.q.defer(), uploadId = e.q.defer();

      config.complete = function () {
        e.rootScope.$evalAsync( function() {
          deferred.resolve();
        });
      };

      config.error = function(msg) {
        e.rootScope.$evalAsync( function() {
          deferred.reject(msg);
        });
      };

      config.progress = function(p) {
        e.rootScope.$evalAsync( function() {
          deferred.notify(p);
        });
      };

      // add the upload info to the underlying evaporate obj
      // save the returned `id` on the promise itself
      var promise = e.loadEvaporate().then( function () {
        uploadId.resolve(e._evaporate.add(config));
        return deferred.promise;
      });

      promise.uploadId = uploadId.promise;
      return promise;
    }
  };

  return Provider;

});
