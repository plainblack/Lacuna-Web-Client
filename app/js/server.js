'use strict';

var $ = require('js/hacks/jquery');
var _ = require('lodash');

var LoaderActions = require('js/actions/menu/loader');

var SessionStore = require('js/stores/session');
var StatusActions = require('js/actions/status');

var defaults = {
    module: '',
    method: '',
    params: [],
    addSession: true,
    success: _.noop,
    error: _.noop,
    scope: window
};

/////////////////////////////////////////////////
// TODO: this method needs a LOT of work!!!!!! //
/////////////////////////////////////////////////

var call = function(config) {

    LoaderActions.show();

    // Manage config stuff.
    config = _.merge(defaults, config || {});

    // If there was only one parameter passed and it's an object, it's fine. Otherwise make it into
    // an array to be sent off.
    if (!_.isObject(config.params) || !_.isArray(config.params)) {
      config.params = [config.params];
    }

    // Add in the session ID.
    if (config.addSession === true) {
        if (_.isArray(config.params)) {
            config.params = [SessionStore.getData()].concat(config.params);
        } else {
            config.params.session_id = SessionStore.getData();
        }
    }

    var data = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: config.method,
        params: config.params
    });

    // Organize a url to send this data to.
    var url = window.location.origin + '/' + config.module;

    $.ajax({
        data: data,
        dataType: 'json',
        type: 'POST',
        url: url,
        success: function(data, textStatus, jqXHR) {
            if (textStatus === 'success' && jqXHR.status === 200) {

                if (data.result) {
                    if (data.result.status) {
                        StatusActions.update(data.result.status);
                    } else if (config.method === 'get_status') {

                        // Need to wrap this so that it gets taken to the right place.
                        var obj = {};
                        obj[config.module] = data.result;

                        StatusActions.update(obj);
                    }
                }

                LoaderActions.hide();
                config.success.call(config.scope, data.result);
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            var error = jqXHR.responseJSON.error;

            // TODO: implement a smarter way of handling this!
            alert(error.message + ' (' + error.code + ')');
            console.error('Request error: ', error);

            LoaderActions.hide();
        }
    });
};

module.exports.call = call;
