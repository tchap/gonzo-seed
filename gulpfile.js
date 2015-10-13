/*
  chili
  github.com/salsita/chili
  2015 | MIT
  ============================== */

var gulp         = require('gulp');
var stylus       = require('gulp-stylus');
var sass         = require('gulp-sass');
var rubySass     = require('gulp-ruby-sass');
var rename       = require("gulp-rename");
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var consolidate  = require("gulp-consolidate");
var minifyCss    = require('gulp-minify-css');
var iconfont     = require('gulp-iconfont');
var lodash       = require('lodash');

// Paths
var buildPath  = './build/'
var sassPath   = './src/sass/';
var stylusPath = './src/stylus/';
var fontName   = 'icons';
var fontPath   = 'assets/font/';

// Compile SASS (currently using latest Ruby SASS)
gulp.task('build-sass', function () {
  return rubySass(sassPath + 'main.sass')
    .on('error', rubySass.logError)
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
    .pipe(minifyCss({keepSpecialComments: 0}))
    .pipe(gulp.dest(buildPath));
});

// Compile Stylus
gulp.task('build-stylus', function () {
  gulp.src(stylusPath + 'main.styl')
    .pipe(stylus({
      compress: true,
      'include css': true
     }))
    .pipe(rename('main.css'))
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
    .pipe(minifyCss())
    .pipe(gulp.dest(buildPath));
});

// Iconfont SASS
gulp.task('build-iconfont-sass', function () {
  gulp.src([sassPath + 'components/icons/*.svg'])
    .pipe(iconfont({
      fontName: fontName,
      fontHeight: 1001,
      normalize: true,
      appendUnicode: true
    }))
      .on('glyphs', function(glyphs, options) {
        gulp.src(sassPath + 'components/icons/icons.template')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: fontName,
            fontPath: fontPath,
            warning: 'GENERATED BY ICONS.TEMPLATE'
          }))
          .pipe(rename('icons.sass'))
          .pipe(gulp.dest(sassPath + 'components/'));
    })
  .pipe(gulp.dest(buildPath + fontPath));
});

// Watchers
gulp.task('watch-sass', function() {
  gulp.watch([sassPath + '**/*.sass', sassPath + '**/*.scss'], ['build-sass']);
  gulp.watch(sassPath + 'components/icons/icons.template', ['build-iconfont-sass']);
});

gulp.task('watch-stylus', function() {
  gulp.watch('./src/styl/*.styl', ['build-stylus']);
});

gulp.task('sass', ['build-iconfont-sass', 'build-sass', 'watch-sass']);
gulp.task('stylus', ['build-stylus', 'watch-stylus']);
gulp.task('default', ['sass']);
