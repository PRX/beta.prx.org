angular.module('angular-evaporate', [])
.provider('evaporate', function () {

  var injector;

  var config = {
    signerUrl: '',
    awsKey: '',
    bucket: '',
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
    bucket: function (bucket) {
      config.bucket = bucket;
      return Provider;
    },
    options: function (options) {
      config.options = options;
      return Provider;
    },
    '$get': ['$q', '$window', '$rootScope',
      function ($q, $window, $rootScope) {
        return new NgEvaporate($q, $window, $rootScope, config);
    }]
  };

  function NgEvaporate ($q, $window, $rootScope, config) {
    var e = this;
    e.q = $q;
    e.rootScope = $rootScope;
    e.window = $window;
    e.options = config;

    var opts = angular.copy(e.options.options);
    opts.signerUrl = config['signerUrl'];
    opts.bucket    = config['bucket'];

    // rename awsKey -> aws_key
    opts.aws_key   = config['awsKey'];

    // rename optional awsUrl -> aws_url
    if (opts['aws_url']) {
      opts.awsUrl = opts.aws_url;
      delete opts.aws_url;
    }

    e._evaporate = new e.window.Evaporate(opts);
  }

  NgEvaporate.prototype = {
    add: function(config) {
      var e = this;

      var deferred = e.q.defer();

      config.complete = function () {
        e.rootScope.$evalAsync( function() {
          deferred.resolve();
        });
      };

      config.progress = function(p) {
        e.rootScope.$evalAsync( function() {
          deferred.notify(p);
        });
      };

      // add the upload info to the underlying evaporate obj
      // save the returned `id` on the promise itself
      var promise = deferred.promise;
      promise.uploadId = e._evaporate.add(config);
      return promise;
    }
  };

  return Provider;

});
