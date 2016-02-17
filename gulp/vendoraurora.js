var shell = require('gulp-shell');
var gutil = require('gulp-util');

/**
 * Browserify aurora.js
 */
module.exports = function (gulp, config) {

  return function () {
    try {
      require.resolve('../node_modules/av/build/aurora.js');
      gutil.log('Already built aurora.js');
    }
    catch (e) {
      return gulp.src('node_modules/av')
      .pipe(shell(
        ['npm install', 'make clean browser'],
        { cwd: 'node_modules/av', quiet: true } ));
    }
  };

};
