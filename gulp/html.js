var template = require('gulp-template');

/**
 * Compile index html
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
      .pipe(gulp.dest('build'));
  };

};
