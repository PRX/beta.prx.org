var newer         = require('gulp-newer');
var jade          = require('gulp-jade');
var rename        = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');

/**
 * Concatenate and register angular templates
 */
module.exports = function (gulp) {

  // remove app directory, and jade extension
  function normalizeTemplateName (path) {
    path.dirname = path.dirname.replace(/^app\/?/, '');
    path.extname = '';
  }

  return function () {
    return gulp.src('src/**/*.html.jade')
      .pipe(newer('build/assets/templates.js'))
      .pipe(rename(normalizeTemplateName))
      .pipe(jade())
      .pipe(templateCache('templates.js', {standalone: true}))
      .pipe(gulp.dest('build/assets'));
  };

};
