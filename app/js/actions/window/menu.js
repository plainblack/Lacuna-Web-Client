'use strict';

var Reflux = require('reflux');

module.exports = {
    show: Reflux.createAction({sync: true}),
    hide: Reflux.createAction({sync: true})
};
