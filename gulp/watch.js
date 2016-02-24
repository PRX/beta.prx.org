var gutil = require('gulp-util');
var tinylr = require('tiny-lr');
var path = require('path');

/**
 * Run live-reload server
 */
module.exports = function (gulp) {
  var port = process.env.PORT || 8080;

  return function () {
    var server = require('../lib/server').listen(port, 'dev.html');
    gutil.log('Listening on port ' + port);

    var lr = tinylr();
    lr.listen(35729);
    gutil.log('LiveReload server started on port 35729');
    gulp.watch('build/**/*', function (e) {
      gutil.log('--reloading ' + path.relative('build', e.path));
      lr.changed({ body: { files: [path.relative('build', e.path)] } });
    });

    // only care about non-minified tasks here
    gulp.watch('src/index.html',        ['html']);
    gulp.watch('src/**/*.js',           ['js:hint', 'js:app']);
    gulp.watch('package.json',          ['js:app']);
    gulp.watch('src/**/*.html.jade',    ['js:templates']);
    gulp.watch('config/flags.*.json',   ['js:flags', 'html']);
    gulp.watch('src/**/*.styl',         ['css:app']);
  };

};
