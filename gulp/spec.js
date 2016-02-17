var karma = require('karma');

/**
 * Run specs
 */
module.exports = function (gulp, config) {

  // optional "--file" globs
  var files = ['src/app/**/*.spec.js'];
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

  // TODO: move back into karma.conf.js
  return function (done) {
    new karma.Server({
      singleRun: true,
      config: {
        basePath: '../',
      },
      frameworks: [ 'browserify', 'jasmine' ],
      plugins:    [ 'karma-browserify', 'karma-jasmine', 'karma-chrome-launcher' ],
      browsers:   ['Chrome'],
      files: files,
      exclude: [ '**/*.e2e.spec.js' ],
      preprocessors: preprocessors,
      browserify: { debug: true, builtins: [/* don't need 'em */] },
      reporters: ['dots']
    }, done).start();
  };

};
