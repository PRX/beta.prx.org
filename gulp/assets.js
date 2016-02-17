var newer    = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var pngquant = require('imagemin-pngquant');

/**
 * Compress and copy assets
 */
module.exports = function (gulp) {
  var minifier = imagemin({
    progressive: true,
    use: [
      pngcrush({reduce: true}),
      pngquant()
    ]
  });

  return function () {
    return gulp.src('src/assets/**/*')
      .pipe(newer('build/assets'))
      .pipe(minifier)
      .pipe(gulp.dest('build/assets'));
  };

};
