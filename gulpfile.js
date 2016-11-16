var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify        = require('gulp-uglify');
var preprocess    = require('gulp-preprocess');
var browserify    = require('browserify');
var source        = require('vinyl-source-stream');
var del           = require('del');
var shell         = require('gulp-shell');
var templateCache = require('gulp-angular-templatecache');
var argv          = require('yargs').argv;
var useref        = require('useref');
var jshint        = require('gulp-jshint');
var filter        = require('gulp-filter');
var webserver     = require('gulp-webserver');
var stripDebug = require('gulp-strip-debug');

var paths = {
  sass: ['./scss/**/*.scss'],
  html:       ['./index.html'],
  templates:  ['./templates/*.html', './www/templates/**/*.html'],
  js:         ['./js/app.js'],
  jsSrc:      ['./js/!(bundles)/**/*.js'],
  useref:     ['./*.html']
};

gulp.task('run', ['build-templatecache','default','webserver','watch']);


gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      fallback: "./index.html/app",
      directoryListing: false,
      open: true
    }));
});

gulp.task('default', ['build-templatecache', 'sass', 'preprocess-js', 'build-js', 'build-html', 'useref', 'uglify']);

/* **********************************************************************************
 * Builds scss into css
 * **********************************************************************************/
gulp.task('sass', function(done) {
  gulp.src('./scss/app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./css/'))
    .on('end', done);
});


gulp.task('useref', function (done) {
  //var assets = useref.assets();
  //gulp.src('./www/*.html')
  //  .pipe(useref())
  //  .pipe(gulp.dest('./www/dist'))
  //  .on('end', done);
});


/* **********************************************************************************
 * Uglify already bundled file
 * **********************************************************************************/
gulp.task('uglify', function() {
  if (argv.production) {
    console.log('uglify STARTED');
    return gulp.src('./js/bundles/app.bundle.js')
      .pipe(uglify())
      .pipe(stripDebug())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./js/bundles/'))
      .on('end', function() {
        console.log('uglify DONE');
      });
  }
});

/* **********************************************************************************
 * Watch task. Development only.
 * **********************************************************************************/
gulp.task('watch', function() {
  gulp.watch([paths.jsSrc, paths.html, paths.js, paths.templates],
             ['preprocess-js', 'build-templatecache', 'build-js', 'build-html']);
  gulp.watch([paths.sass], ['sass']);

});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('jshint', function() {

  var f = filter(['**','!bundles/*']);

  return gulp.src(['./js/*/*.js', './js/*.js'])
    .pipe(f)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


/* **********************************************************************************
 * Increase version number only if '--production' flag is set
 * **********************************************************************************/
gulp.task('version-increase', function() {
  if (argv.production) {
    //var fs = require('fs');
    //
    //fs.readFile("config.xml", 'utf8', function (err,data) {
    //  if (err) {
    //    return console.log(err);
    //  }
    //
    //  var version = data.match(/(]* version=\"[0-9]+\.[0-9]+\.)([0-9]+)(\")/i)[2];
    //  console.log('current minor version number is ',version, " increasing it to ", parseInt(version, 10) + 1);
    //  version++;
    //
    //  var result = data.replace(/(]* version=\"[0-9]+\.[0-9]+\.)([0-9]+)(\")/i, '$1' + version + '$3');
    //
    //  fs.writeFile("config.xml", result, 'utf8', function (err) {
    //    if (err) return console.log(err);
    //  });
    //});
  }
});

/* **********************************************************************************
 * Preparation tasks. Installs all javascript lib dependencies defined in bower.json
 * **********************************************************************************/
gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

/* **********************************************************************************
 * Builds vendor scripts. Same for development and production
 * **********************************************************************************/
/*gulp.task('build-vendor', function() {
  console.log('build-vendor STARTED');
  return gulp.src(paths.vendor)
    .pipe(concat('vendor.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./js/bundles/'))
    .on('end', function() {
      console.log('build-vendor DONE');
    });
});*/


/* **********************************************************************************
 * Builds all javascript files into one bundle
 * **********************************************************************************/
gulp.task('build-js', function() {
  console.log('build-js STARTED');
  return browserify(paths.js)
    .bundle()
    .pipe(source('app.bundle.js'))
    .pipe(gulp.dest('./js/bundles/'))
    .on('end', function() {
      console.log('build-js DONE');
    });
});

/* **********************************************************************************
 * Builds html for development/production
 * **********************************************************************************/
gulp.task('build-html', function() {
  console.log('build-html STARTED');
  gulp.src(paths.html)
    .pipe(preprocess({context: {ENVIRONMENT: argv.production ? 'production' : 'development'}}))
    .pipe(gulp.dest('./'))
    .on('end', function() {
      console.log('build-html DONE');
    });
});

gulp.task('preprocess-js', function() {
  console.log('preprocess-js STARTED');
  //gulp.src('./www/config.js')
  //  .pipe(preprocess({context: {ENVIRONMENT: argv.production ? 'production' : 'development'}}))
  //  .pipe(gulp.dest('./www/js/common/'))
  //  .on('end', function() {
  //    console.log('preprocess-js DONE');
  //  });
});


/* **********************************************************************************
 * Cache all angular templates to reduce the number of http requests
 * **********************************************************************************/
gulp.task('build-templatecache', function () {
  console.log('build-templatecache STARTED');
  gulp.src(paths.templates)
    .pipe(templateCache())
    .pipe(gulp.dest('./js/utility/'))
    .on('end', function() {
      console.log('build-templatecache DONE');
    });
});

gulp.task('build-prepare',[
  'default',
  //'build-images',
  'version-increase',
  'uglify'

], function() {
  console.log('build-prepare DONE');
});
