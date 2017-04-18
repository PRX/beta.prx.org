var newer = require('gulp-newer');

/**
 * Copy html (and config flags) to the build directory
 */
module.exports = function (gulp) {

  return function () {
    return gulp.src(['src/index.jade', 'config/flags.conf.js'])
      .pipe(newer('build'))
      .pipe(gulp.dest('build'));
  };

};
