/**
 * Protractor tests can run against sauce labs or locally
 */
exports.config = {
  port:    (process.env['PORT'] || 8080),
  baseUrl: 'http://localhost:' + (process.env['PORT'] || 8080),
  jasmineNodeOpts: {
    showColors: true
  }
};

if (process.env['SAUCE_USERNAME'] && process.env['SAUCE_ACCESS_KEY']) {
  exports.config.jasmineNodeOpts.defaultTimeoutInterval = 20000;
  exports.config.sauceUser = process.env['SAUCE_USERNAME'];
  exports.config.sauceKey  = process.env['SAUCE_ACCESS_KEY'];
  exports.config.multiCapabilities = [{
    'browserName':       'firefox',
    'tunnel-identifier': (process.env['TRAVIS_JOB_NUMBER'] || null)
  },{
    'browserName':       'chrome',
    'tunnel-identifier': (process.env['TRAVIS_JOB_NUMBER'] || null)
  }];
}
else if (process.env['SNAP_CI']) {
  // TODO: chromedriver doesn't want to work here
  // exports.config.directConnect = true;
  // exports.config.chromeDriver = '/usr/local/bin/chromedriver';
  exports.config.jasmineNodeOpts.defaultTimeoutInterval = 10000;
  exports.config.capabilities = {
    'browserName': 'phantomjs'
  };
}
else {
  exports.config.jasmineNodeOpts.defaultTimeoutInterval = 10000;
  exports.config.capabilities = {
    'browserName': 'chrome'
  };
}
