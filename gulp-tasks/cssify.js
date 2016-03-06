'use strict';

var gulp      = require('gulp');
var concatCss = require('gulp-concat-css');

module.exports = function() {
    var stream = gulp.src('app/css/styles.css')
        .pipe(concatCss(''))
        .pipe(gulp.dest('lacuna/styles.css'));

    return stream;
};
