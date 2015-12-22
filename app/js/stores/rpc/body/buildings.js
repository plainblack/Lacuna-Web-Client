'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var BodyRPCStore = require('js/stores/rpc/body');

var MapActions = require('js/actions/menu/map');
var SurfaceImageActions = require('js/actions/menu/surfaceImage');
var TickerActions = require('js/actions/ticker');

var server = require('js/server');
var util = require('js/util');

var X_RANGE = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
var Y_RANGE = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

var BuildingsRPCStore = Reflux.createStore({
    listenables: [
        MapActions,
        TickerActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return {};
    },

    handleNewBuilding: function(b, id) {
        b.efficiency = util.int(b.efficiency);
        b.level = util.int(b.level);
        b.x = util.int(b.x);
        b.y = util.int(b.y);

        b.empty = false;
        b.id = id;

        if (b.pending_build) {
            b.pending_build.seconds_remaining = util.int(b.pending_build.seconds_remaining);
            b.pending_build.remaining = util.formatTime(b.pending_build.seconds_remaining);
        }

        if (b.work) {
            b.work.seconds_remaining = util.int(b.work.seconds_remaining);
            b.work.remaining = util.formatTime(b.work.seconds_remaining);
        }

        return b;
    },

    handleData: function(buildings) {
        return _.mapValues(buildings, this.handleNewBuilding);
    },

    handleResult: function(result) {
        SurfaceImageActions.set(result.body.surface_image);

        this.data = this.handleData(result.buildings);
        this.trigger(this.data);
    },

    onAddBuilding: function(id, b) {
        this.data[id] = this.handleNewBuilding(b, id);
        this.trigger(this.data);
    },

    onChangePlanet: function(id) {
        server.call({
            module: 'body',
            method: 'get_buildings',
            params: [id],
            scope: this,
            success: this.handleResult
        });
    },

    onClearBuildings: function() {
        this.data = {};
        this.trigger(this.data);
    },

    onRefresh: function() {
        server.call({
            module: 'body',
            method: 'get_buildings',
            params: [BodyRPCStore.getData().id],
            scope: this,
            success: this.handleResult
        });
    },

    onRemoveBuilding: function(id) {
        delete this.data[id];
        this.trigger(this.data);
    },

    onTick: function() {
        this.data = _.mapValues(this.data, function(b) {
            if (b.pending_build) {
                b.pending_build.seconds_remaining -= 1;
                b.pending_build.remaining = util.formatTime(b.pending_build.seconds_remaining);
            }

            if (b.work) {
                b.work.seconds_remaining -= 1;
                b.work.remaining = util.formatTime(b.work.seconds_remaining);
            }

            return b;
        });

        this.trigger(this.data);
    },

    onUpdateBuildings: function(buildings) {
        this.data = this.handleData(buildings);
        this.trigger(this.data);
    },

    onUpdateBuilding: function(id, newBuilding) {
        var currentBuilding = _.merge({}, this.data[id], newBuilding);
        this.data[id] = this.handleNewBuilding(currentBuilding, id);

        this.trigger(this.data);
    }
});

module.exports = BuildingsRPCStore;

module.exports.X_RANGE = X_RANGE;
module.exports.Y_RANGE = Y_RANGE;
