'use strict'

// Vex is a library for making pretty alert/prompt/confirm windows.
// This module gets the right file within vex (yeah, I know, weird) and sets the theme.

var vex = require('vex-js/js/vex.dialog.js');

vex.defaultOptions.className = 'vex-theme-default';

module.exports = vex;
