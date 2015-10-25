'use strict';

window.jQuery = window.$ = require('jquery');

// semantic will hook itself to window.jQuery.
require('semantic');


// Everything should now be attached to the `jQuery` object so export it.
module.exports = window.jQuery;
