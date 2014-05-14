exports.config = {
  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8080',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  specs: [ '../src/**/*.e2e.spec.js' ]
};

if (process.env['TRAVIS']) {
  exports.config.sauceUser = process.env['SAUCE_USERNAME'];
  exports.config.sauceKey  = process.env['SAUCE_ACCESS_KEY'];
  exports.config.multiCapabilities =  [{
    'browserName': 'firefox'
  }];

  for(var i=0; i<exports.config.multiCapabilities.length; i++) {
    exports.config.multiCapabilities[i]['tunnel-identifier'] = process.env['TRAVIS_JOB_NUMBER'];
  }

} else {
  exports.config.seleniumServerJar = '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.41.0.jar';
}
