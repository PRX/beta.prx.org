var template = require('gulp-template');

/**
 * Compile index html
 */
module.exports = function (gulp, config) {
  var context = {
    styles:  ['assets/app.css'],
    scripts: ['assets/flags.js', 'assets/app.js', 'assets/templates.js'],
    compile: false
  };

  return function () {
    gulp.src(config.app.html)
      .pipe(template(context))
      .pipe(gulp.dest(config.buildDir));
  };

};
