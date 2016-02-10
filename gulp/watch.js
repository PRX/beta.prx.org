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
    gulp.watch('./gulp/html.js',        ['html']);
    gulp.watch(config.app.assets,       ['assets']);
    gulp.watch('./gulp/assets.js',      ['assets']);
    gulp.watch('./src/**/*.js',         ['js:app']);
    gulp.watch('./gulp/jsapp.js',       ['js:app']);
    gulp.watch('./package.json',        ['js:app']);
    gulp.watch(config.app.jade,         ['js:templates']);
    gulp.watch('./gulp/jstemplates.js', ['js:templates']);
    gulp.watch('./config/flags.*.json', ['js:flags']);
    gulp.watch('./gulp/jsflags.js',     ['js:flags']);
    gulp.watch(config.app.stylus,       ['css:app']);
    gulp.watch('./gulp/cssapp.js',      ['css:app']);
  };

};



// gulp.task('watch', ['build_', 'installWebdriver', 'helperJs'], function (cb) {

//   gulp.watch('./src/**/*.styl', ['buildCss']);
//   gulp.watch(c.app.jade, ['templates']);
//   gulp.watch(c.app.html, ['html']);
//   gulp.watch([buildDir + '/**/*.js', buildDir + '/**/*.css'], function (e) {
//     if (e.type != 'changed') {
//       gulp.run('html');
//     }
//   });

//   gulp.watch(c.e2eSpecs, ['runProtractor']);


//   karma.start({ autoWatch: true });


//   gulp.watch(allAppJs.concat(featsDev), ['buildJs', 'helperJs']);
//   gulp.watch("src/**/*.js", ['buildJs', 'helperJs']);
// });

// gulp.task('default', ['watch']);

// gulp.on('err', function (e) {
//   if (!this.tasks['watch'].running) {
//     plugin.util.log("Failure. Terminating.");
//     process.exit(1);
//   } else {
//     notifier.notify({message: "Error in " + e.err.plugin + ": " + e.message }, function (e, t) { });
//     plugin.util.log(plugin.util.colors.red("Error in build. Continuing execution for `watch` task."));
//     console.log('');
//     plugin.util.beep();
//   }
// });
