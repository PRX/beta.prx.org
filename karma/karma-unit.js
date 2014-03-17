module.exports = function ( config ) {
  config.set({
    basePath: '../',
    files: [ 'public/**/*.js', 'src/common/angular-hal-mock.js' ],
    exclude: [ 'public/assets/**/*.js' ],
    frameworks: [ 'jasmine' ],
    plugins: [ 'karma-jasmine', 'karma-firefox-launcher', 'karma-chrome-launcher', 'karma-safari-launcher', 'karma-phantomjs-launcher', 'karma-coverage' ],
    preprocessors: { '*/{app,common}/**/!(*.spec).js': ['coverage'] },
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      reporters: [
        {type: 'html', dir: 'coverage'},
        {type: 'json', dir: 'coverage'},
        {type: 'lcov', dir: 'coverage'},
        {type: 'text-summary'}
      ]
    },
    port: 9018,
    runnerPort: 9100,
    urlRoot: '/',
    autoWatch: false,
    browsers: ['Chrome']
  });
};
