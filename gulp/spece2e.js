var protractor    = require('gulp-protractor').protractor;
var webdriver     = require('gulp-protractor').webdriver_update;
var gutil         = require('gulp-util');
var config        = require('../config/protractor.conf').config;

/**
 * Run e2e specs via protractor
 */
module.exports = function (gulp) {
  var files = ['src/**/*.e2e.spec.js'];

  // optional "--file" globs
  if (process.argv.indexOf('--file') > -1) {
    files = [];
    for (var i = 0; i < process.argv.length; i++) {
      if (process.argv[i] == '--file' && process.argv[i+1]) {
        files.push(process.argv[i+1]);
      }
    }
  }

  // run locally (webdriver) or remotely (sauce labs)
  function startServer (callback) {
    if (config.sauceUser) {
      gutil.log(gutil.colors.green('Running remotely via sauce labs...'));
      callback(null, require('../lib/server').listen(config.port));
    }
    else {
      gutil.log(gutil.colors.green('Running locally via chromedriver...'));
      webdriver(function(err) {
        callback(err, require('../lib/server').listen(config.port));
      });
    }
  }

  return function (done) {
    startServer(function(err, server) {
      if (err) {
        done(err);
      }
      else {
        gulp.src(files)
          .pipe(protractor({ configFile: 'config/protractor.conf' }))
          .on('end', function () { server.close(); done(); });
      }
    });
  };

};
