var rename = require('gulp-rename');
var newer  = require('gulp-newer');
var gzip   = require('gulp-gzip');

/**
 * Gzip files
 */
module.exports = function (gulp) {

  return function () {

    var onlyNewer = newer({
      dest: 'build',
      map: function(path) {
        return path + '.gz';
      }
    });

    return gulp.src(['build/*/*.*', '!**/*.gz'])
      .pipe(onlyNewer)
      .pipe(gzip())
      .pipe(gulp.dest('build'));
  };

};
