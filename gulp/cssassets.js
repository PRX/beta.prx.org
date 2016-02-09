var rename = require('gulp-rename');
var base64 = require('gulp-base64');

/**
 * Base64-encode assets into the minified css
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src(config.buildDir + '/assets/app.css.min')
      .pipe(base64({ baseDir: config.buildDir, debug: true }))
      .pipe(rename('app.css.min.assets'))
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
