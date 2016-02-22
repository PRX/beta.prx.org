var template = require('gulp-template');
var fflags   = require('../lib/gulp-featureflags');

/**
 * Compile index html
 */
module.exports = function (gulp) {
  var context = {
    styles:  ['assets/app.min.assets.css'],
    scripts: ['assets/app.min.js'],
    compile: true
  };

  return function () {
    return gulp.src('src/index.html')
      .pipe(template(context))
      .pipe(fflags.replace())
      .pipe(gulp.dest('build'));
  };

};
