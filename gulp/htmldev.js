var template = require('gulp-template');
var rename   = require('gulp-rename');

/**
 * Compile dev.html (non-minified)
 */
module.exports = function (gulp) {
  var context = {
    styles:  ['assets/app.css'],
    scripts: ['assets/flags.js', 'assets/app.js', 'assets/templates.js'],
    compile: false
  };

  return function () {
    return gulp.src('src/index.html')
      .pipe(template(context))
      .pipe(rename('dev.html'))
      .pipe(gulp.dest('build'));
  };

};
