'use strict';

var Reflux = require('reflux');

var CaptchaActions = Reflux.createActions([
    'captchaWindowClear',
    'captchaWindowRefresh',
    'captchaWindowShow',
    'captchaWindowHide'
]);

module.exports = CaptchaActions;
