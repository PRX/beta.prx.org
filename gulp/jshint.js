var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');

/**
 * Lint the codebase via jshint
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src(config.app.lint)
      .pipe(jshint(config.jsHintCfg))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));
  };

};
