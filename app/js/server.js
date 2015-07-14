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

var handleDefaults = function(options) {
    // NOTE: we merge this into `{}` so as to avoid leaking stuff into `defaults`.
    // The Lo-dash docs are not clear about this, so we just need to make sure.
    return _.merge({}, defaults, options || {});
};

var addSession = function(options) {
    var sessionId = SessionStore.getData();

    if (options.addSession === true && sessionId) {
        if (_.isArray(options.params)) {
            options.params = [sessionId].concat(options.params);
        } else {
            options.params.session_id = sessionId;
        }
    }

    return options;
};

var handleParams = function(options) {
    // If there was only one parameter passed and it's an object, it's fine. Otherwise make it into
    // an array to be sent off.
    if (!_.isObject(options.params) || !_.isArray(options.params)) {
      options.params = [options.params];
    }

    return addSession(options);
};

var handleConfig = function(options) {
    options = handleDefaults(options);
    return handleParams(options);
};

var createData = function(options) {
    return JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: options.method,
        params: options.params
    });
};

var createUrl = function(options) {
    if (window.lacuna_rpc_base_url) {
        return window.lacuna_rpc_base_url + options.module;
    } else {
        return window.location.protocol + '//' + window.location.host + '/' + options.module;
    }
};

var handleSuccess = function(options, result) {
    if (result) {
        if (result.status) {
            StatusActions.update(result.status);

            // Handle the legacy Status stuff...
            YAHOO.lacuna.Game.ProcessStatus(result.status);

        } else if (options.method === 'get_status') {
            StatusActions.update(result);

            // Handle the legacy Status stuff...
            YAHOO.lacuna.Game.ProcessStatus(result.status);
        }
    }

    LoaderActions.hide();
    options.success.call(options.scope, result);
};

var handleError = function(options, error) {

    // TODO: implement a smarter way of handling this!
    alert(error.message + ' (' + error.code + ')');
    console.error('Request error: ', error);

    LoaderActions.hide();
};

var sendRequest = function(url, data, options) {
    console.log('Calling', options.module + '/' + options.method, options.params);

    $.ajax({
        data: data,
        dataType: 'json',
        type: 'POST',
        url: url,

        success: function(data, textStatus, jqXHR) {
            if (textStatus === 'success' && jqXHR.status === 200) {
                handleSuccess(options, data.result);
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            handleError(options, jqXHR.responseJSON.error);
        }
    });
};

var call = function(obj) {

    LoaderActions.show();

    var options = handleConfig(obj);
    var data = createData(options);
    var url = createUrl(options);

    sendRequest(url, data, options);
};

module.exports.call = call;
