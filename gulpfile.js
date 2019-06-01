// Load plugins
const babel           = require('gulp-babel');
const browsersync     = require('browser-sync');
const concat          = require('gulp-concat');
const cleanCSS        = require('gulp-clean-css');
const del             = require('del');
const gulp            = require('gulp');
const hb              = require('gulp-hb');
const htmlmin         = require('gulp-htmlmin');
const imagemin        = require('gulp-imagemin');
const notify          = require('gulp-notify');
const plumber         = require('gulp-plumber');
const prefix          = require('gulp-autoprefixer');
const purgecss        = require('gulp-purgecss');
const rename          = require('gulp-rename');
const sass            = require('gulp-sass');
const sassGlob        = require('gulp-sass-glob');
const sourcemaps      = require('gulp-sourcemaps');
const stylelint       = require('gulp-stylelint');
const tildeImporter   = require('node-sass-tilde-importer');
const uglify          = require('gulp-uglify');


// Define Paths
const paths = {
  src: {
    root: 'src',
    data: 'src/hbs/data/',
    hbs: 'src/hbs/**/*.hbs',
    pages: 'src/hbs/pages/',
    partials: 'src/hbs/partials/',
    helpers: 'src/hbs/helpers/',
    sass: 'src/scss/',

    javascript: 'src/js/**/*.js',
    libs: 'src/libs/**/*',
    images: 'src/images/**/*.{jpg,jpeg,svg,png,gif}',
    files: 'src/*.{html,txt}'
  },
  dist: {
    root: 'docs',
    css: 'docs/css',
    images: 'docs/images',
    javascript: 'docs/js',
    libs: 'docs/libs'
  }
};


// Error Messaging
var onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};


// Clean Dist
function cleanDist() {
  return del(paths.dist.root);
}


// Start Server
function runBrowsersync(done) {
  browsersync.init({
    server: {
      baseDir: paths.dist.root
    },
    port: 3000,
    notify: true
  });
  done();
}


// Import Libraries
function importLibraries(done) {
  gulp
    .src([
      'node_modules/bulma/sass/**/*'
    ])
    .pipe(gulp.dest(paths.src.sass+"bulma"))

  done();
}


// Compile Handlebars into HTML
function html() {
  return gulp
    .src(paths.src.pages+'**/*.hbs')
    .pipe(hb({ debug: true })
      .partials(paths.src.partials+'**/*.{hbs,js}')
      .helpers(paths.src.helpers+'**/*.js')
      .data(paths.src.data+'**/*.{js,json}')
    )
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(paths.dist.root))
    .pipe(browsersync.stream());
}


// Glob SCSS Imports, Generate Sourcemaps, and Compile to CSS
var sassOptions = {
  outputStyle: 'expanded',
  importer: tildeImporter
};
var prefixerOptions = {
  browsers: ['last 2 versions']
};

function styles() {
  return gulp
    .src([paths.src.sass+'main.scss'])
    .pipe(sassGlob())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(purgecss({
      content: [paths.src.root + "/hbs/**/*.hbs"]
    }))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))
    .pipe(cleanCSS({ compatibility: '*' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browsersync.stream())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browsersync.stream());
}

function runStylelint() {
  return gulp
    .src([paths.src.sass+'**/*.scss'])
    .pipe(stylelint({
      failAfterError: false,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'verbose', console: true}
      ],
      debug: true
    }))
}


// Bundle and Minify JS
function scripts(done) {

  gulp
    .src(paths.src.javascript)
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(concat('bundle.js'))
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(paths.dist.javascript))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(uglify())
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(paths.dist.javascript))
    .pipe(browsersync.stream());

  gulp
    .src([paths.src.libs])
    .pipe(uglify())
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('bundle.js'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(paths.dist.libs))
    .pipe(browsersync.stream());

  done();
}


// Copy Images to Dist
function images() {
  return gulp
    .src([paths.src.images])
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(paths.dist.images))
    .pipe(browsersync.stream());
}


// Copy Files to Dist
function files(done) {
  gulp
    .src([paths.src.files])
    .pipe(gulp.dest(paths.dist.root));
  done();
}


// Watch Folders
function watchFiles() {
  gulp.watch(paths.src.sass, gulp.series(styles, runStylelint));
  gulp.watch(paths.src.javascript, scripts);
  gulp.watch(paths.src.images, images);
  gulp.watch(paths.src.hbs, gulp.parallel(html, styles));
}


// Build Tasks
gulp.task('default', gulp.series(cleanDist, runStylelint, importLibraries, html, scripts, images, files, styles, gulp.parallel(watchFiles, runBrowsersync), function (done) {
  done();
}));