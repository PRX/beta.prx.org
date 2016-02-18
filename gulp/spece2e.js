var protractor = require('gulp-protractor').protractor;
var webdriver  = require('gulp-protractor').webdriver_update;

/**
 * Run e2e specs via protractor
 */
module.exports = function (gulp) {
  var port  = process.env.PORT || 8080;
  var files = ['src/**/*.e2e.spec.js'];
  var args  = [
    '--capabilities.browserName=chrome',
    '--baseUrl=http://localhost:' + port,
    '--jasmineNodeOpts.showColors=true',
    '--jasmineNodeOpts.defaultTimeoutInterval=5000'
  ];

  // optional "--file" globs
  if (process.argv.indexOf('--file') > -1) {
    files = [];
    for (var i = 0; i < process.argv.length; i++) {
      if (process.argv[i] == '--file' && process.argv[i+1]) {
        files.push(process.argv[i+1]);
      }
    }
  }

  // ensure webdriver is around
  function installWebDriver (cb) {
    process.env['TRAVIS'] ? cb() : webdriver(cb);
  }

  // test server
  var server;
  function startServer () {
    if (server) server.close();
    server = require('../lib/server').listen(port, 'build');
  }
  function stopServer () {
    if (server) { server.close(); server = null; }
  }

  return function (cb) {
    installWebDriver(function(err) {
      if (err) {
        cb(err);
      }
      else {
        startServer();
        gulp.src(files)
          .pipe(protractor({ args: args }))
          .on('end', function () { stopServer(); cb(); });
      }
    });
  };

};
