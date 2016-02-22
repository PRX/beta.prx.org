var karma = require('karma');
var gutil = require('gulp-util');

/**
 * Run jasmine specs via karma
 */
module.exports = function (gulp) {
  var files = ['src/**/*.spec.js'];

  // optional "--file" globs
  if (process.argv.indexOf('--file') > -1) {
    files = [];
    for (var i = 0; i < process.argv.length; i++) {
      if (process.argv[i] == '--file' && process.argv[i+1]) {
        files.push(process.argv[i+1]);
      }
    }
  }

  var preprocessors = {};
  files.forEach(function (file) {
    preprocessors[file] = ['browserify'];
  });

  // TODO: this is hacky
  files.push('build/assets/templates.js');

  // prevent annoying 404 errors
  files.push({pattern: 'src/assets/images/*', watched: false, included: false, served: true});

  // TODO: move back into karma.conf.js
  return function (done) {

    // karma exit codes don't work with gulp
    function handleKarmaExit(exitStatus) {
      if (exitStatus) {
        var err = new Error('Karma run failed with status ' + exitStatus);
        err.showStack = false;
        done(err);
      }
      else {
        done();
      }
    }

    new karma.Server({
      singleRun: true,
      config: { basePath: '../' },
      proxies: {
        '/assets/images/': '/base/src/assets/images/'
      },
      frameworks: [ 'browserify', 'jasmine' ],
      plugins:    [ 'karma-browserify', 'karma-jasmine', 'karma-chrome-launcher' ],
      browsers:   ['Chrome'],
      files: files,
      exclude: [ '**/*.e2e.spec.js' ],
      preprocessors: preprocessors,
      browserify: { fullpaths: true, debug: true, builtins: [/* don't need 'em */] },
      reporters: [ 'dots' ]
    }, handleKarmaExit).start();

  };

};
