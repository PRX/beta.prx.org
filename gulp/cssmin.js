var csso       = require('gulp-csso');
var rename     = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

/**
 * Compress css files
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src(config.buildDir + '/assets/app.css')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(csso())
      .pipe(rename('app.css.min'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
