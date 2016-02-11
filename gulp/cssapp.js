var stylus     = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var rework     = require('gulp-rework');
var movemedia  = require('rework-move-media');
var concat     = require('gulp-concat');
var nib        = require('nib');
var pleeease   = require('gulp-pleeease');

/**
 * Compile stylus into browser-ready css
 */
module.exports = function (gulp, config) {

  return function () {
    return gulp.src(config.app.stylus)
      .pipe(sourcemaps.init())
      .pipe(stylus({
        use: [nib()],
        import: ['nib'],
        paths: ['src/app']
      }))
      .pipe(concat('app.css'))
      .pipe(pleeease({mqpacker: true}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
