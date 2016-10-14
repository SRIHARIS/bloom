/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass   = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css');

gulp.task('build-css', function() {
  return gulp.src('source/css/**/*.css')
    .pipe(sass())
    .pipe(concatCss("bundle.css"))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('copy-template', function() {
  return gulp.src('source/templates/**/*.html')
    .pipe(gulp.dest('public/templates'));
});

gulp.task('copy-fonts', function() {
  return gulp.src('source/fonts/**/*')
    .pipe(gulp.dest('public/fonts'));
});


gulp.task('copy-angular', function() {
  return gulp.src('source/vendor_scripts/angular/*.js')
    .pipe(gulp.dest('public/javascript'));
});

gulp.task('build-vendor-js', function() {
  return gulp.src(['!source/vendor_scripts/angular/*.js','source/vendor_scripts/**/*.js'])
    .pipe(concat('bundle.js'))
      //only uglify if gulp is ran with '--type production'
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest('public/javascript'));
});

gulp.task('build-js', function() {
  return gulp.src('source/js/**/*.js')
    .pipe(concat('scripts.js'))
      //only uglify if gulp is ran with '--type production'
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest('public/javascript'));
});

// define the default task and add the watch task to it
gulp.task('default', ['watch','build-css','build-js','build-vendor-js','copy-template','copy-angular','copy-fonts']);

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch('source/js/**/*.js',['build-js']);
  gulp.watch('source/css/**/*.css', ['build-css']);
  gulp.watch('source/templates/**/*.html', ['copy-template']);
});
