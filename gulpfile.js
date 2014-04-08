var c   = require( './config/build.json' );
var pkg = require('./package.json');

var spawn  = require('child_process').spawn;
var fs     = require('fs');

var gulp   = require('gulp');
var es     = require('event-stream');
var through= require('through2');
var gutil  = require('gulp-util');
var clean  = require('gulp-clean');
var jade   = require('gulp-jade');
var aTempl = require('gulp-angular-templatecache');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var templt = require('gulp-template');
var walk   = require('walk');
var karma  = require('gulp-karma');
var newer  = require('gulp-newer');
var runSeq = require('run-sequence');
var ngmin  = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var tinyLr = require('tiny-lr');
var path   = require('path');
var map    = require('vinyl-map');
var istnbl = require('gulp-istanbul-enforcer');
var csso   = require('gulp-csso');
var rework = require('gulp-rework');
var moveMe = require('rework-move-media');
var imgmin = require('gulp-imagemin');
var jshint = require('jshint').JSHINT;
var Notify = require('node-notifier');
var instWd = require('gulp-protractor').webdriver_update;
var prtrct = require('gulp-protractor').protractor;
var order  = require('gulp-order');
var gzip   = require('gulp-gzip');
var feats  = require('./lib/gulp-featureflags');

var buildDir = c.buildDir;
var complDir = c.compileDir;
var cwd      = __dirname;
var src      = cwd + '/src';
var hintCfg  = c.jsHintCfg;
var fileName = pkg.name + "-" + pkg.version;
var specJs   = c.test.js.concat(buildDir+"/**/*.js", c.app.specs);
var vBuildJs = c.vendor.buildJs.concat(c.vendor.js);
var vComplJs = c.vendor.compileJs.concat(c.vendor.js);
var allAppJs = c.app.js.concat(vBuildJs);
var featsDev = cwd + '/config/flags.dev.json';
var featDist = cwd + '/config/flags.release.json';

var notifier = new Notify({});

function bStyl() {
  return gulp.src(c.app.stylus)
  .pipe(stylus({
      set: ['linenos'],
      use: ['nib'],
      paths: [__dirname + '/public'],
      urlFunc: ['url']
    }))
    .pipe(rework(moveMe()))
    .pipe(csso());
}


// Fix formatting of error messages with newlines
// so that the whole message starts on its own line.
(function () {
  var listeners = gulp.listeners('task_err');
  gulp.removeAllListeners('task_err');

  function formatMultiline(message) {
    if (message.indexOf("\n") !== -1) {
      return ("\n"+message).replace(/\n(?:error[^\s]*\s*)?/ig, "\n   [" + gutil.colors.red('error') + "] ");
    } else {
      return message;
    }
  }

  gulp.on('task_err', function (e) {
    if (e.err && e.err.message) {
      e.err.message = formatMultiline(e.err.message);
    } else if (e.message) {
      e.message = formatMultiline(e.message);
    }
  });

  listeners.forEach(function (listener) {
    gulp.on('task_err', listener);
  });
})();

gulp.task('clean', function () {
  return gulp.src([buildDir, complDir, 'coverage'], {read: false})
    .pipe(clean());
});

gulp.task('assets', function () {
  return es.merge(
      gulp.src(c.app.assets, {base: src}),
      gulp.src(c.vendor.assets, {base: cwd})
    )
    .pipe(newer(buildDir))
    .pipe(imgmin())
    .pipe(gulp.dest(buildDir));
});

gulp.task('jshint', function () {
  var errors = { length : 0 };
  function formatErrors (errors) {
    return errors.length + " total errors. \n" + (Object.keys(errors).map(function (file) {
      if (file == 'length') { return }
      ers = errors[file];
      return file + ": " + ers.length + " errors \n" + ers.map(function (error) {
        return "    l" + error.line + "c" + error.character + ": " + error.evidence + " – " + error.reason;
      }).join("\n");
    }).join("\n"));
  }

  return es.merge(gulp.src(c.app.js), gulp.src(c.app.specs))
    .pipe(through.obj(function (file, enc, next) {
      if (!file.isNull()) {
        if(!jshint(file.contents.toString('utf8'), hintCfg)) {
          errors[file.relative] = jshint.errors;
          errors.length += jshint.errors.length;
        }
      }
      this.push(file);
      next();
    }))
    .pipe(through.obj(function (file, enc, next) {
      if (errors.length) {
        next(new gutil.PluginError('gulp-jshint', formatErrors(errors)));
        this.end();
      } else {
        next();
      }
    }));
});

gulp.task('css', ['assets'], function () {
  return bStyl()
  .pipe(concat(fileName + '.css'))
  .pipe(gulp.dest(buildDir + '/assets/'));
});

gulp.task('specs', ['templates', 'buildJs'], function (cb) {
  var karmaCfg = {configFile: c.karmaCfg, action: 'run'};

  if (process.env.TRAVIS) {
    karmaCfg.browsers = ['PhantomJS', 'Firefox'];
  }

  return gulp.src(specJs, {read: false})
    .pipe(order(['**/angular?(.*).js', '**/*.js']))
    .pipe(karma(karmaCfg)).on('error', cb);
});

gulp.task('buildJs', ['jshint'], function () {
  return es.merge(gulp.src(c.app.js)
      .pipe(feats(featsDev, {strict: false, default: true}))
    , gulp.src(vBuildJs, {base: cwd}))
    .pipe(newer(buildDir))
    .pipe(gulp.dest(buildDir));
});

gulp.task('js', ['specs', 'buildJs']);

gulp.task('html', function (cb) {
  var walker = walk.walk(buildDir, { followLinks: false });
  var ctx = {styles:[], scripts:[], compile: false};
  walker.on('file', function (root, stat, next) {
    root = path.relative(buildDir, root);
    if (stat.name == 'angular.js') {
      ctx.scripts.unshift(root + '/' + stat.name);
    } else {
      if (stat.name.match(/\.css$/)) {
        ctx.styles.push(root + '/' + stat.name);
      } else if (stat.name.match(/\.js$/)) {
        ctx.scripts.push(root + '/' + stat.name);
      }
    }
    next();
  });
  walker.on('end', function () {
    gulp.src(c.app.html)
      .pipe(templt(ctx))
      .pipe(gulp.dest(buildDir))
      .on('end', cb);
  });
});

gulp.task('templates', function () {
  var compiled = gulp.src(c.app.jade)
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/^app\/?/, '');
      path.extname = '';
    }))
    .pipe(newer(buildDir + '/templates-app.js'))
    .pipe(jade());
  return es.merge(
      compiled.pipe(map(function(code) { return code; }))
      .pipe(gulp.dest(buildDir)),
      compiled.pipe(aTempl('templates.js', {standalone: true}))
        .pipe(gulp.dest(buildDir + '/app'))
    );
});

gulp.task('build', function (cb) {
  runSeq('clean', ['templates', 'js', 'css', 'assets'], 'html', cb);
});

gulp.task('dist', ['distJs', 'distAssets', 'distHtml']);

gulp.task('distJs', ['buildJs', 'templates'], function () {
  return es.merge(
    gulp.src(vComplJs),
    gulp.src(c.app.js.concat(buildDir + '/app/templates.js'))
      .pipe(ngmin())
      .pipe(feats(featDist, {strict: true, default: false}))
  )
  .pipe(order(['**/angular?(.min).js', '*']))
  .pipe(concat(fileName+'.js'))
  .pipe(gulp.dest(complDir + '/assets'))
  .pipe(uglify({preserveComments: 'some', outSourceMap: true}))
  .pipe(rename(function (path) {
    if (path.extname == '.js') {
      path.extname = '.min.js';
    }
  }))
  .pipe(gulp.dest(complDir + '/assets'));
});

gulp.task('distAssets', ['css', 'assets'], function () {
  return gulp.src([buildDir + '/assets/**/*.*'])
    .pipe(gulp.dest(complDir + '/assets'));
});

gulp.task('distHtml', function () {
  var ctx = {
    styles:['/assets/' + fileName + '.css'],
    scripts:['/assets/' + fileName + '.min.js'],
    compile: true
  };
  return gulp.src(c.app.html)
    .pipe(templt(ctx))
    .pipe(gulp.dest(complDir));
});

gulp.task('testDist', function () {
  var karmaCfg = {configFile: c.karmaCfg, action: 'run', reporters: 'dots', browsers:['PhantomJS']};
  return gulp.src([complDir+"/**/*.min.js"].concat(c.test.js, c.app.specs), {read: false})
    .pipe(karma(karmaCfg));
});

gulp.task('cacheBust', function (done) {
  var cachebust = new require('gulp-cachebust')();
  gulp.src(complDir + '/assets/**/*.*')
    .pipe(cachebust.resources())
    .pipe(gulp.dest(complDir + '/assets'))
    .on('end', function () {
      gulp.src(complDir + '/*.html')
      .pipe(cachebust.references())
      .pipe(gulp.dest(complDir))
      .on('end', done);
    });
});

gulp.task('compressDist', function () {
  return gulp.src(complDir + "/**/*.*")
  .pipe(gzip())
  .pipe(gulp.dest(complDir));
});

gulp.task('compile', function (cb) {
  runSeq('clean', 'dist', 'testDist', 'cacheBust', 'compressDist', cb);
});

gulp.task('compileServer', function () {
  require(cwd+'/'+c.app.server).listen(process.env.PORT||8080, complDir);
});

gulp.task('build_', function (cb) {
  runSeq('clean', ['templates', 'buildJs', 'css', 'assets'], 'html', cb);
});

gulp.task('watch', ['build_'], function (cb) {
  var server = require(cwd+'/'+c.app.server)
    .listen(process.env.PORT || 8080, buildDir);
  gutil.log("Listening on port " + process.env.PORT || 8080);

  var lr = tinyLr();
  lr.listen(35729);
  gutil.log("LiveReload server started on port 35729");

  gulp.watch(buildDir + "/**/*", function (e) {
    lr.changed({
      body: {
        files: [path.relative(buildDir, e.path)]
      }
    });
  });

  gulp.watch('./src/**/*.styl', ['css']);
  gulp.watch(c.app.jade, ['templates']);
  gulp.watch(c.app.html, ['html']);
  gulp.watch([buildDir + '/**/*.js', buildDir + '/**/*.css'], function (e) {
    if (e.type != 'changed') {
      gulp.run('html');
    }
  });

  gulp.src(specJs, {read: false})
    .pipe(order(['**/angular?(.*).js', '**/*.js']))
    .pipe(karma({configFile: c.karmaCfg, action: 'watch'}));

  gulp.watch(allAppJs.concat(featsDev), ['buildJs']);
});

gulp.task('default', ['watch']);

gulp.on('err', function (e) {
  if (!this.tasks['watch'].running) {
    gutil.log("Failure. Terminating.");
    process.exit(1);
  } else {
    notifier.notify({message: "Error in " + e.err.plugin + ": " + e.message }, function (e, t) { });
    gutil.log(gutil.colors.red("Error in build. Continuing execution for `watch` task."));
    console.log('');
    gutil.beep();
  }
});

gulp.task('checkCoverage', ['specs'], function () {
  return gulp.src('.')
    .pipe(istnbl({
      thresholds: c.covReq,
      coverageDirectory : 'coverage',
      rootDirectory : ''
    }));
});

gulp.task('coveralls', ['checkCoverage'], function (done) {
  var ps = spawn(cwd+'/node_modules/coveralls/bin/coveralls.js');
  var coverageDir = cwd + '/coverage/';
  fs.readdir(coverageDir, pickFolder);
  ps.on('exit', function (c) {
    done();
  });
  ps.stdout.on('data', log);
  ps.stderr.on('data', log);

  function pickFolder (err, folders) {
    var folder = folders[0];
    fs.readFile(coverageDir + folder + '/lcov.info', pipeFile);
  }

  function pipeFile (err, data) {
    ps.stdin.write(data);
    ps.stdin.end();
  }

  function log (data) {
    gutil.log(data.toString().replace(/^\n|\n$/g, ''));
  }
});

gulp.task('installWebdriver', instWd);

gulp.task('protractor', ['installWebdriver', 'compile', 'compileServer'], function () {
  return gulp.src(c.e2eSpecs)
  .pipe(prtrct({configFile: c.protractorCfg, baseUrl: 'http://localhost:8080'}))
  .on('error', function (e) { throw e; });
});

gulp.task('ci', ['checkCoverage', 'coveralls']);
