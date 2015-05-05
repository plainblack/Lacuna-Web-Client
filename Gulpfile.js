'use strict';

var browserify = require('browserify');
var source     = require('vinyl-source-stream');

var cssConcat = require('gulp-concat-css');
var cssMin    = require('gulp-minify-css');
var gulp      = require('gulp');
var rename    = require('gulp-rename');
var uglify    = require('gulp-uglify');

var path    = require('path');
var express = require('express');

gulp.task('dev', ['browserify', 'cssify', 'serve'], function() {

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
    var b = browserify(['./app/js/load.js'], {
        noParse: [
            'jquery'
        ],
        insertGlobals : true,
        paths: [
            path.join(__dirname, 'app')
        ]
    });

    var stream = b
        .bundle()
        .pipe(source('lacuna.js'))
        .pipe(gulp.dest('./lacuna'));

    return stream;
});

gulp.task('cssify', ['browserify'], function() {
    var stream = gulp.src('app/css/styles.css')
        .pipe(cssConcat(''))
        .pipe(gulp.dest('lacuna/styles.css'));

    return stream;
})

gulp.task('minify-js', ['browserify', 'cssify'], function() {
    var stream =  gulp.src('./build/lacuna.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('./lacuna'));

    return stream;
});

gulp.task('minify-css', ['browserify', 'cssify', 'minify-js'], function() {
    var stream = gulp.src('./build/styles.css')
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

// The default task is a build of everything.
gulp.task('default', ['browserify', 'cssify', 'minify-js', 'minify-css']);
