'use strict';

// Vex is a library for making pretty alert/prompt/confirm windows.
// This module is a simple wrapper around said library to simplify the process of using Vex.

var vex = require('vex-js/js/vex.dialog.js');

vex.defaultOptions.className = 'vex-theme-default';

var vexAlert = function(message) {
    vex.alert(message);
};

var vexConfirm = function(message, yesCallback, noCallback) {
    vex.confirm({
        message  : message,
        callback : function(value) {

            if (value && typeof yesCallback === 'function') {
                yesCallback();
            } else if (!value && typeof noCallback === 'function') {
                noCallback();
            }
        }
    });
};

var vexPrompt = function(message, placeholder, callback) {
    vex.prompt({
        message     : message,
        placeholder : placeholder,
        callback    : callback
    });
};

module.exports = {
    alert   : vexAlert,
    confirm : vexConfirm,
    prompt  : vexPrompt
};
