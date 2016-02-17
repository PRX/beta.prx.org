var uglify     = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat     = require('gulp-concat');
var through    = require('through2');
var fs         = require('fs');

/**
 * Minify app.js + templates.js
 */
module.exports = function (gulp) {
  var flagFile = __dirname + '/../build/assets/flags.js';
  var flagExp = new RegExp('([^\\w])FEAT\\.([\\w_0-9]+)', 'g');

  return function () {
    var mtime = fs.statSync(flagFile).mtime;

    // read flags from the global window
    GLOBAL.window = {};
    require(flagFile);
    var flags = GLOBAL.window.FEAT;

    // regexp replace FEATs
    function replaceFeats(file, enc, next) {
      var oldStr = String(file.contents);
      var newStr = oldStr.replace(flagExp, function (s, b, feat) {
        console.log('match', s, b, feat);
        if (typeof flags[feat] !== 'undefined') {
          return b + JSON.stringify(flags[feat]);
        }
        else {
          throw new Error('Undefined feature flag ' + feat);
        }
      });
      if (newStr !== oldStr) {
        file.contents = new Buffer(newStr);
        file.stat.mtime = Math.max(mtime, file.stat.mtime);
      }

      this.push(file);
      return next();
    }

    return gulp.src(['build/assets/app.js', 'build/assets/templates.js'])
      .pipe(concat('app.min.js'))
      .pipe(through.obj(replaceFeats))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/assets'));
  };

};
