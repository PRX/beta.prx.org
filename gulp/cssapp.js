var stylus     = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var concat     = require('gulp-concat');
var nib        = require('nib');
var postcss    = require('gulp-postcss');
var mqpacker   = require('css-mqpacker');
var newer      = require('gulp-newer');
var through    = require('through2');

/**
 * Compile stylus into browser-ready css
 */
module.exports = function (gulp) {

  return function () {

    // newer will select all files - filter to just the manifest
    function onlyManifest(file, enc, next) {
      if (file.path.match(/src\/stylesheets\/main\.styl$/)) {
        this.push(file);
      }
      return next();
    }

    return gulp.src('src/**/*.styl')
      .pipe(newer('build/assets/app.css'))
      .pipe(through.obj(onlyManifest))
      .pipe(sourcemaps.init())
      .pipe(stylus({
        use: [nib()],
        import: ['nib'],
        paths: ['src/app']
      }))
      .pipe(concat('app.css'))
      .pipe(postcss([mqpacker]))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('build/assets'));
  };

};
