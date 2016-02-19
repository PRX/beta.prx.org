var csso       = require('gulp-csso');
var rename     = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var newer      = require('gulp-newer');

/**
 * Compress css files
 */
module.exports = function (gulp) {

  return function () {
    return gulp.src('build/assets/app.css')
      .pipe(newer('build/assets/app.min.css'))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(csso())
      .pipe(rename('app.min.css'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/assets'));
  };

};
