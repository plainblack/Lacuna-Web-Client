'use strict';

var browserifyInc = require('browserify-incremental');
var debowerify    = require('debowerify');
var reactify      = require('reactify');
var source        = require('vinyl-source-stream');

var cssConcat     = require('gulp-concat-css');
var gulp          = require('gulp');

var path          = require('path');
var exec          = require('child_process').exec;

var express       = require('express');
var del           = require('del');
var runSequence   = require('run-sequence');

gulp.task('dev', function(done) {
    runSequence(
        'browserify',
        'cssify',
        'watch',
    done);
});

gulp.task('dev-with-server', function(done) {
    runSequence(
        'browserify',
        'cssify',
        'serve',
        'watch',
    done);
});

gulp.task('watch', function() {
    var watcher = gulp.watch('./app/**/*', ['browserify', 'cssify']);

    watcher.on('ready', function() {
        console.log('Watching for changes.');
    });

    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks.');
    });

    return watcher;
});

gulp.task('browserify', function() {
    var b = browserifyInc(['./app/js/load.js'], {
        extensions : ['.jsx'],
        paths      : [path.join(__dirname, 'app')],
        cachefile  : path.join(__dirname, 'browserify-cache.json')
    });

    // This transforms all the .jsx files into JavaScript.
    b.transform(reactify);

    // This brings Bower-installed libraries into the bundle.
    b.transform(debowerify);

    var stream = b
        .bundle()
        .pipe(source('load.js'))
        .pipe(gulp.dest('./lacuna'));

    return stream;
});

gulp.task('cssify', function() {
    var stream = gulp.src('app/css/styles.css')
        .pipe(cssConcat(''))
        .pipe(gulp.dest('lacuna/styles.css'));

    return stream;
});

gulp.task('serve', function(done) {
    var app = express();
    var port = process.env.PORT || 8080;
    app.use(express.static(path.join(__dirname)));

    app.listen(port, function() {
        console.log('Listening on http://localhost:' + port + ' for requests.');
        done();
    });
});

gulp.task('clean', function() {
    var files = [
        'browserify-cache.json',
        'lacuna/*.js',
        'lacuna/*.css'
    ];

    return del(files);
});

gulp.task('lint', function(done) {
    var command = './node_modules/eslint/bin/eslint.js . --ext .js --ext .jsx';

    exec(command, function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        done(error);
    });
});

// The default task is a build of everything.
gulp.task('build', function(done) {
    runSequence(
        'lint',
        ['browserify', 'cssify'],
    done);
});

gulp.task('default', ['build']);
