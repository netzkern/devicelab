var path = require('path');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

function getTask(task) {

  return require('./gulp/tasks/' + task)(gulp, plugins);
}

gulp.task('views', getTask('views'));
gulp.task('images', getTask('images'));
gulp.task('fonts', getTask('fonts'));
gulp.task('templates', getTask('templates'));
gulp.task('lang', getTask('lang'));
gulp.task('extras', getTask('extras'));
gulp.task('styles', getTask('styles'));

gulp.task('build', ['styles', 'views', 'images', 'fonts', 'templates', 'lang', 'extras']);

gulp.task('clear-cache', function() {

  $.cache.clearAll();
});

gulp.task('clear', function() {

  return gulp.src(['assets'], {
    read: false
  }).pipe($.clean());
});

gulp.task('watch', function() {

  //gulp.watch('assets_dev/static/components/**/*.js', ['scripts']);
  //gulp.watch('assets_dev/static/components/**/*.ts', ['typescript']);

  gulp.watch('assets_dev/static/components/**/*.{scss,_scss}', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});
