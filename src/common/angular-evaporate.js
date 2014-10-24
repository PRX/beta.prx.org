angular.module('angular-evaporate', [])
.provider('evaporate', function () {

  var injector;

  var config = {
    signerUrl: '/sign',
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
    '$get': ['$q', '$window',
      function ($q, $window) {
        return new NgEvaporate($q, $window, config);
    }]
  };

  function NgEvaporate ($q, $window, config) {
    var e = this;
    e.q = $q;
    e.window = $window;
    e.options = config;

    var opts = angular.copy(e.options.options);
    opts.signerUrl = config['signerUrl'];
    opts.aws_key   = config['awsKey'];
    opts.bucket    = config['bucket'];
    if (opts['aws_url']) {
      opts.awsUrl = opts.aws_url;
      delete opts.aws_url;
    }

    e._evaporate = new e.window.Evaporate(opts);
  }

  NgEvaporate.protoype = {
    add: function(config) {
      var e = this;
      // todo: wrap callbacks from config to provide a promise instead of accepting callbacks
      return e._evaporate.add(config);
    }
  };

  return Provider;

});
