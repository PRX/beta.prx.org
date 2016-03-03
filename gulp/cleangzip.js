var clean = require('gulp-clean');

/**
 * Remove gzipped files
 */
module.exports = function (gulp) {

  return function () {
    return gulp.src('build/**/*.gz')
      .pipe(clean());
  };

};
