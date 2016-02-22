var uglify     = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat     = require('gulp-concat');
var fflags     = require('../lib/gulp-featureflags');
var newer      = require('gulp-newer');

/**
 * Minify app.js + templates.js
 */
module.exports = function (gulp) {

  return function () {
    return gulp.src(['build/assets/app.js', 'build/assets/templates.js'])
      .pipe(fflags.replace())
      .pipe(newer('build/assets/app.min.js'))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(concat('app.min.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/assets'));
  };

};
