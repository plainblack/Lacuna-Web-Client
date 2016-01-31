'use strict';

var Reflux              = require('reflux');
var moment              = require('moment');
var util                = require('js/util');

var ServerStatusActions = require('js/actions/serverStatus');
var TickerActions       = require('js/actions/ticker');

// ServerTimeRPCStore holds the last recorded time at which the server
// sent a status update (containing a 'time' attribute).
// together with the client time at which it happened.
//
// This allows the current server time to be calculated, when needed
// by simple maths (last_server_time + ago_seconds)
//
// Any user of the store can determine the server time without having
// to do a render every second. They only render when their own data
// has changed.
//

var ServerTimeRPCStore = Reflux.createStore({
    listenables: [
        ServerStatusActions,
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return {
            lastServerTimeMoment    : moment(),
            lastClientTimeMoment    : moment(),
        }
    },

    getData: function() {
        return this.data;
    },

    // Helper methods to get the current server time
    //
    getCurrentServerTimeMoment: function() {
        var elapsedInSeconds = moment().diff(moment(this.data.lastClientTimeMoment), 'seconds');
        var thisMoment = moment(this.data.lastServerTimeMoment).add(elapsedInSeconds, 'seconds');
        return thisMoment;
    },

    getCurrentServerTimeFormatted: function() {
        var thisMoment = this.getCurrentServerTimeMoment();
        return util.formatMomentLong(thisMoment);
    },

    onServerStatusUpdate: function(serverStatus) {
        var serverTime = serverStatus.time;

        this.data.lastServerTimeMoment = util.serverDateToMoment(serverTime).utcOffset(0);
        this.data.lastClientTimeMoment = moment();

        this.trigger(this.data);
    },

    onServerStatusClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    },
});

module.exports = ServerTimeRPCStore;
