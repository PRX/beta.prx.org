var gulp  = require('gulp');
var gutil = require('gulp-util');
var gseq  = require('gulp-sequence');

/**
 * Ye olde tasks (name - deps - args)
 */
gulpTask('html',   []);
gulpTask('assets', []);
gulpTask('gzip',   []);

gulpTask('vendor:aurora', []);
gulpTask('vendor:mp3',    []);
gulpTask('vendor',        ['vendor:aurora', 'vendor:mp3']);

gulpTask('js:hint',       []);
gulpTask('js:app',        []);
gulpTask('js:templates',  []);
gulpTask('js:min',        ['js:hint', 'js:app', 'js:templates']);
gulp.task('js:dev',       ['js:hint', 'js:app', 'js:templates']);
gulp.task('js',           ['js:min']);

gulpTask('css:app',    []);
gulpTask('css:min',    ['css:app']);
gulpTask('css:assets', ['css:min', 'assets']);
gulp.task('css',       ['css:assets']);

gulp.task('build:dev',  ['html', 'assets', 'vendor', 'js:dev', 'css:app']);
gulp.task('build:dist', ['js', 'css', 'html', 'vendor']);
gulp.task('build',      gseq('build:dist', 'gzip'));

gulpTask('watch:dev',  ['clean:gzip', 'build:dev']);
gulpTask('watch:dist', ['clean:gzip', 'build:dist']);
gulp.task('watch',     ['watch:dev']);

gulpTask('spec:unit',  ['js:templates']);
gulpTask('spec:e2e',   ['build']);
gulp.task('spec',      gseq('spec:unit', 'spec:e2e'));

gulpTask('clean:gzip', []);

// require a task from the gulp sub-dir
function gulpTask(name, deps) {
  var loc = './gulp/' + name.replace(':', '');
  gulp.task(name, deps || [], require(loc)(gulp));
}

// global error handler
gulp.on('err', function (e) {
  if (gulp.isWatchingStuff) {
    gutil.log(gutil.colors.red('Error in build. Continuing execution for `watch` task.'));
    console.log('');
    gutil.beep();
  }
  else {
    process.exit(1);
  }
});
