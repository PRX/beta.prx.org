var gutil   = require('gulp-util');
var through = require('through2');

/**
 * Copy non-bundled vendor files to the build directory
 */
module.exports = function (gulp) {

  var files = [
    'node_modules/av/build/aurora.js',
    'node_modules/evaporate/evaporate.js',
    'node_modules/id3js/dist/id3.js',
    'node_modules/mp3/build/mp3.js',
    'node_modules/soundmanager2/swf/soundmanager2.swf'
  ];

  return function () {
    var copied = [];

    // record which files we're about to copy
    function copiedFiles(file, enc, next) {
      var name = file.path.split('/')[file.path.split('/').length - 1];
      copied.push(name);
      this.push(file);
      return next();
    }

    // check for missing files
    function alertMissing(next) {
      var missed = files.filter(function(path) {
        var name = path.split('/')[path.split('/').length - 1];
        if (copied.indexOf(name) > -1) {
          return false; // copied it
        }
        else {
          try {
            require.resolve('../build/vendor/' + name);
            return false; // already got it
          }
          catch (e) {}
        }
      });
      if (missed.length) {
        var msg = 'Missing required vendor files: ' + missed.join(', ');
        throw new gutil.PluginError('vendor', {message: msg});
      }
      return next();
    }

    return gulp.src(files)
      .pipe(through({objectMode: true}, copiedFiles, alertMissing))
      .pipe(gulp.dest('build/vendor'));
  };

};
