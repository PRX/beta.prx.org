var shell = require('gulp-shell');

/**
 * Browserify mp3.js
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src('node_modules/mp3')
      .pipe(shell(
        ['npm install', 'make clean browser'],
        { cwd: 'node_modules/mp3', quiet: true } ));
  };

};
