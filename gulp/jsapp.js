var browserify = require('browserify');
var vsource    = require('vinyl-source-stream');
var vbuffer    = require('vinyl-buffer');
var gutil      = require('gulp-util');

/**
 * Build the browser-ready application js
 */
module.exports = function (gulp, config) {
  var browserified = browserify({
    entries: config.app.js,
    fullPaths: true,
    debug: true,
    builtins: [/* don't need 'em */]
    // transform: [ngannotate, shim] happen IMPLICITLY due to package.json
  });

  return function () {
    return browserified.bundle()
      .pipe(vsource('app.js'))
      .pipe(vbuffer())
      .on('error', gutil.log)
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
