'use strict';

var CLIEngine = require('eslint').CLIEngine;

module.exports = function() {
    var cli = new CLIEngine({
        extensions : ['.js', '.jsx']
    });

    var report = cli.executeOnFiles(['.']);
    var formatter = cli.getFormatter('stylish');
    var output = formatter(report.results);

    if (!output) {
        console.log('Passed!');
    } else {
        console.log(output);
    }
};
