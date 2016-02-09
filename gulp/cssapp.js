var stylus     = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var rework     = require('gulp-rework');
var movemedia  = require('rework-move-media');
var concat     = require('gulp-concat');
var nib        = require('nib');

/**
 * Compile stylus into browser-ready css
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src(config.app.stylus)
      .pipe(sourcemaps.init())
      .pipe(stylus({
        set: ['linenos'],
        use: [nib],
        paths: [__dirname + '/../src/app']
      }))
      .pipe(rework(movemedia()))
      .pipe(concat('app.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
