var shell = require('gulp-shell');

/**
 * Browserify aurora.js
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src('node_modules/av')
      .pipe(shell(
        ['npm install', 'make clean browser'],
        { cwd: 'node_modules/av', quiet: true } ));
  };

};
