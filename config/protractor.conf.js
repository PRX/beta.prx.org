exports.config = {
  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8080',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};

if (process.env['TRAVIS']) {
  exports.config.capabilities['tunnel-identifier'] = process.env['TRAVIS_JOB_NUMBER'];
} else {
  exports.config.seleniumServerJar = '../node_modules/protractor/selenium/selenium-server-standalone-2.40.0.jar';
}
