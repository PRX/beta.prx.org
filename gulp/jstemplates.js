var jade          = require('gulp-jade');
var rename        = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');

/**
 * Concatenate and register angular templates
 */
module.exports = function (gulp, config) {

  // remove app directory, and jade extension
  function normalizeTemplateName (path) {
    path.dirname = path.dirname.replace(/^app\/?/, '');
    path.extname = '';
  }

  return function () {
    return gulp.src(config.app.jade)
      .pipe(rename(normalizeTemplateName))
      .pipe(jade())
      .pipe(templateCache('templates.js', {standalone: true}))
      .pipe(gulp.dest(config.buildDir));
  };

};
