'use strict';

var browserify = require('browserify');
var babelify   = require('babelify');
var debowerify = require('debowerify');
var watchify   = require('watchify');

var gutil      = require('gulp-util');

var path       = require('path');
var fs         = require('fs');

function handleBundle(b, options) {
    return b.bundle()
        .on('error', function(err) {
            gutil.log(
                gutil.colors.red('Browserify compile error:'),
                err.message
            );
            this.emit('end');
        })
        .pipe(fs.createWriteStream(path.join(options.rootDir, 'lacuna/lacuna.js')));
};

module.exports = function(options) {
    var b = browserify(['./app/js/load.js'], {
        extensions : [
            '.jsx'
        ],
        paths : [
            path.join(options.rootDir, 'app')
        ],

        // watchify options
        cache        : {},
        packageCache : {},
        plugin       : options.watch ? [watchify] : []
    });

    // This transforms all the .jsx files into JavaScript.
    b.transform(babelify.configure({
        presets : [
            'react'
        ],

        // Only touch jsx files because we're not using ES6 features at the moment.
        extensions : [
            '.jsx'
        ]
    }));

    // This brings Bower-installed libraries into the bundle.
    b.transform(debowerify);

    // Watchify emits 'update' events when a file has been changed and the build should run again.
    if (options.watch) {
        b.on('update', function() {
            gutil.log('Something changed - rebuilding.');
            handleBundle(b, options);
        });

        b.on('log', function(msg) {
            gutil.log(msg);
        });
    }

    return handleBundle(b, options);
};
