'use strict';

var del = require('del');

module.exports = function() {
    var files = [
        'lacuna/*.js',
        'lacuna/*.css'
    ];

    return del(files);
};
