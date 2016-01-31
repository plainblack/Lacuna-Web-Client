'use strict';

var browserifyInc = require('browserify-incremental');
var debowerify = require('debowerify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

var cssConcat = require('gulp-concat-css');
var cssMin = require('gulp-minify-css');
var gulp = require('gulp');
var gulpUtil = require('gulp-util')
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var path = require('path');

var express = require('express');
var del = require('del');

gulp.task('dev', ['browserify', 'cssify'], function() {

    var watcher = gulp.watch('./app/**/*', ['browserify', 'cssify']);

    watcher.on('ready', function() {
        console.log('Watching for changes.');
    });

    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks.');
    });

    return watcher;
});

gulp.task('dev-with-server', ['browserify', 'cssify', 'serve'], function() {

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
        extensions: ['.jsx'],
        paths: [path.join(__dirname, 'app')],
        cachefile: path.join(__dirname, 'browserify-cache.json')
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

gulp.task('cssify', ['browserify'], function() {
    var stream = gulp.src('app/css/styles.css')
        .pipe(cssConcat(''))
        .pipe(gulp.dest('lacuna/styles.css'));

    return stream;
});

gulp.task('minify-js', ['browserify', 'cssify'], function() {
    var stream =  gulp.src('./lacuna/load.js')
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('./lacuna'));

    return stream;
});

gulp.task('minify-css', ['browserify', 'cssify', 'minify-js'], function() {
    var stream = gulp.src('./lacuna/styles.css')
    .pipe(cssMin())
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(gulp.dest('./lacuna'));

    return stream;
});

gulp.task('serve', ['browserify', 'cssify'], function(done) {
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

    del.sync(files);
});

// The default task is a build of everything.
gulp.task('default', ['browserify', 'cssify', 'minify-js', 'minify-css']);
