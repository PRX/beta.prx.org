var expect = require('gulp-expect-file');

/**
 * Copy non-bundled vendor files to the build directory
 */
module.exports = function (gulp) {

  var files = [
    "node_modules/av/build/aurora.js",
    "node_modules/evaporate/evaporate.js",
    "node_modules/id3js/dist/id3.js",
    "node_modules/mp3/build/mp3.js",
    "node_modules/soundmanager2/swf/soundmanager2.swf"
  ];

  return function () {
    return gulp.src(files)
      .pipe(expect({errorOnFailure: true}, files))
      .pipe(gulp.dest('build/vendor'));
  };

};
