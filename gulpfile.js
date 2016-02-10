var gulp   = require('gulp');
var gutil  = require('gulp-util');
var config = require( './config/build.json' );

/**
 * Ye olde tasks (name - deps - args)
 */
gulpTask('html',   []);
gulpTask('assets', []);

gulpTask('vendor:aurora', []);
gulpTask('vendor:mp3',    []);
gulpTask('vendor',        ['vendor:aurora', 'vendor:mp3']);

gulpTask('js:hint',       []);
gulpTask('js:app',        ['js:hint']);
gulpTask('js:templates',  []);
gulpTask('js:flags',      []);
gulpTask('js:min',        ['js:app', 'js:templates', 'js:flags']);
gulp.task('js',           ['js:min']);

gulpTask('css:app',    []);
gulpTask('css:min',    ['css:app']);
gulpTask('css:assets', ['css:min', 'assets']);
gulp.task('css',       ['css:assets']);

gulp.task('build', ['js', 'css', 'html', 'vendor']);
gulpTask('watch', ['html', /*'assets',*/ 'js:app', 'js:templates', 'js:flags', 'css:app']);

// require a task from the gulp sub-dir
function gulpTask(name, deps) {
  var loc = './gulp/' + name.replace(':', '');
  gulp.task(name, deps || [], require(loc)(gulp, config));
}
