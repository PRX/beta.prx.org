/**
 * Karma unit testing configs
 */
module.exports = function(config) {
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

  // preprocess for browserify and coverage
  var preprocessors = {};
  files.forEach(function (file) {
    preprocessors[file] = ['browserify', 'coverage'];
  });

  // TODO: this is a bit hacky
  files.push('build/assets/templates.js');

  // prevent annoying 404 errors
  files.push({pattern: 'src/assets/images/*', watched: false, included: false, served: true});

  config.set({
    basePath: '../',
    urlRoot: '/',
    autoWatch: false,

    frameworks: ['browserify', 'jasmine'],
    plugins:    [
      'karma-browserify',
      'karma-jasmine',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher'
    ],

    browsers:   ['Chrome'],

    files: files,
    preprocessors: preprocessors,
    proxies: {
      '/assets/images/': '/base/src/assets/images/'
    },
    exclude: [ '**/*.e2e.spec.js' ],

    browserify: {
      fullpaths: true,
      debug: true,
      builtins: [/* don't need 'em */],
      transform: [
        ['browserify-istanbul', {
          ignore: ['**/*.spec.js'],
          // TODO: https://github.com/karma-runner/karma-coverage/issues/157#issuecomment-160555004
          instrumenterConfig: { embedSource: true }
        }],
      ]
    },

    reporters: ['dots', 'coverage'],
    coverageReporter: {
      check: {
        global: {
          statements: 70,
          branches:   70,
          functions:  70,
          lines:      70
        }
      },
      reporters: [
        {type: 'text-summary'},
        {type: 'html', dir: 'coverage'},
        {type: 'json', dir: 'coverage'},
        {type: 'lcov', dir: 'coverage'}
      ]
    }

  });
};
