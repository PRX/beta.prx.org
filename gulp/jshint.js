var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');

/**
 * Lint the codebase via jshint
 */
module.exports = function (gulp) {

  var hintConfig = {
    "curly" : true,
    "immed" : true,
    "newcap": true,
    "noarg" : true,
    "sub"   : true,
    "boss"  : true,
    "eqnull": true
  };

  return function () {
    return gulp.src('src/**/*.js')
      .pipe(jshint(hintConfig))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));
  };

};
