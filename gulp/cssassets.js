var rename = require('gulp-rename');
var base64 = require('gulp-base64');
var gutil  = require('gulp-util');

/**
 * Base64-encode assets into the minified css
 */
module.exports = function (gulp) {

  return function () {
    var oldconsole = {
      log:   console.log,
      info:  console.info,
      warn:  console.warn,
      error: console.error
    };

    // suppress/highlight base64 debug messages
    console.log = console.info = function(msg) {
      if (!msg.match(/^Encoding file:|^in build\/assets/)) {
        oldconsole.log.apply(this, arguments);
      }
    }
    console.warn = function(msg) {
      gutil.log(gutil.colors.underline('WARN: ' + msg));
    }

    return gulp.src('build/assets/app.min.css')
      .pipe(base64({ baseDir: 'build', debug: true }))
      .on('end', function() {
        console.log = oldconsole.log;
        console.info = oldconsole.info;
        console.warn = oldconsole.warn;
      })
      .pipe(rename('app.min.assets.css'))
      .pipe(gulp.dest('build/assets'));
  };

};
