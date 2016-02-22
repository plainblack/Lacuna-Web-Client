'use strict';

var gulp        = require('gulp');
var gulpTasks   = require('./gulp-tasks');
var runSequence = require('run-sequence');

gulp.task('browserify', function() {
    return gulpTasks.browserify({
        rootDir : __dirname,
        watch   : true
    });
});

gulp.task('browserify-no-watch', function() {
    return gulpTasks.browserify({
        rootDir : __dirname,
        watch   : false
    });
});

gulp.task('build', function(done) {
    runSequence(
        'lint',
        'browserify-no-watch',
        'cssify',
    done);
});

gulp.task('build-no-lint', function(done) {
    runSequence(
        'browserify-no-watch',
        'cssify',
    done);
});

gulp.task('clean', gulpTasks.clean);

gulp.task('cssify', gulpTasks.cssify);

gulp.task('default', [
    'build'
]);

gulp.task('dev', function(done) {
    runSequence(
        'cssify',
        'browserify',
    done);
});

gulp.task('dev-with-server', function(done) {
    runSequence(
        'cssify',
        'browserify',
        'server',
    done);
});

gulp.task('lint', gulpTasks.lint);

gulp.task('server', gulpTasks.server);
