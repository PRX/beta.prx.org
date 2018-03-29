var appCfg = require(__dirname + '/build.json');

module.exports = function ( config ) {
  config.set({
    basePath: '../',
    files: [appCfg.buildDir+"/**/angular.js"].concat(
      appCfg.test.js,
      appCfg.test.helper.dst,
      appCfg.buildDir + '/**/*.js',
      appCfg.app.specs,
      appCfg.test.assets.map(function (pattern) {
        return {
          pattern: pattern, watched: true, included: false, served: true
        };
      })
    ),
    proxies: {
      '/assets': '/base/src/assets',
      '/vendor': '/base/public/vendor'
    },
    exclude: [ 'public/assets/**/*.js', '**/*.e2e.spec.js' ],
    frameworks: [ 'jasmine' ],
    client: {
      jasmine: {
        random: false
      }
    },
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
    urlRoot: '/',
    autoWatch: false,
    browsers: ['Chrome']
  });
};
