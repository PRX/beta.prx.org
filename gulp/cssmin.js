var csso       = require('gulp-csso');
var rename     = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var newer      = require('gulp-newer');
var stylus     = require('gulp-stylus');
var nib        = require('nib');
var postcss    = require('gulp-postcss');
var mqpacker   = require('css-mqpacker');
var through    = require('through2');

/**
 * Compress css files
 */
module.exports = function (gulp) {

  return function() {

    // TODO: for some reason, this fails if we try to read in the sourcemap from
    // app.css.  So for now, just repeat all the stylus/nib/mqpacker work of
    // css:app here, instead of:
    //
    //     return gulp.src('build/assets/app.css')
    //       .pipe(newer('build/assets/app.min.css'))
    //       .pipe(sourcemaps.init({loadMaps: true}))

    return gulp.src('src/**/*.styl')
      .pipe(newer('build/assets/app.min.css'))
      .pipe(through.obj(function onlyManifest(file, enc, next) {
          if (file.path.match(/src\/stylesheets\/main\.styl$/)) {
            this.push(file);
          }
          return next();
        }))
      .pipe(sourcemaps.init())
      .pipe(stylus({
        use: [nib()],
        import: ['nib'],
        paths: ['src/app', 'src/stylesheets']
      }))
      .pipe(postcss([mqpacker]))
      .pipe(csso())
      .pipe(rename('app.min.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('build/assets'));
  };

};
