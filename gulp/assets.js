var newer    = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var pngquant = require('imagemin-pngquant');

/**
 * Compress and copy assets
 */
module.exports = function (gulp, config) {
  var minifier = imagemin({
    progressive: true,
    use: [
      pngcrush({reduce: true}),
      pngquant()
    ]
  });

  return function () {
    return gulp.src(config.app.assets)
      .pipe(newer(config.buildDir + '/assets'))
      .pipe(minifier)
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
