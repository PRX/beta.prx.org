var shell = require('gulp-shell');
var gutil = require('gulp-util');

/**
 * Browserify mp3.js
 */
module.exports = function (gulp, config) {

  return function () {
    try {
      require.resolve('../node_modules/mp3/build/mp3.js');
      gutil.log('Already built mp3.js');
    }
    catch (e) {
      return gulp.src('node_modules/mp3')
      .pipe(shell(
        ['npm install', 'make clean browser'],
        { cwd: 'node_modules/mp3', quiet: true } ));
    }
  };

};
