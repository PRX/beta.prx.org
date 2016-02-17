var gutil = require('gulp-util');
var tinylr = require('tiny-lr');
var path = require('path');

/**
 * Run live-reload server
 */
module.exports = function (gulp, config) {
  var port = process.env.PORT || 8080;
  var script = __dirname + '/../' + config.app.server;

  return function () {
    var server = require(script).listen(port, config.buildDir);
    gutil.log('Listening on port ' + port);

    var lr = tinylr();
    lr.listen(35729);
    gutil.log('LiveReload server started on port 35729');
    gulp.watch(config.buildDir + '/**/*', function (e) {
      gutil.log('--reloading ' + path.relative(config.buildDir, e.path));
      lr.changed({ body: { files: [path.relative(config.buildDir, e.path)] } });
    });

    gulp.watch(config.app.html,         ['html']);
    gulp.watch(config.app.assets,       ['assets']);
    gulp.watch('./src/**/*.js',         ['js:app']);
    gulp.watch('./package.json',        ['js:app']);
    gulp.watch(config.app.jade,         ['js:templates']);
    gulp.watch('./config/flags.*.json', ['js:flags']);
    gulp.watch(config.app.stylus,       ['css:app']);
  };

};
