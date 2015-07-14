/**
* Code taken from inputEx's  (http://javascript.neyric.com/inputex/) rpc library and slightly modified
*/

var StatusActions = require('js/actions/status');

YAHOO.namespace("rpc");

if (typeof YAHOO.rpc.Service == "undefined" || !YAHOO.rpc.Service) {

(function() {

    var Lang = YAHOO.lang,
        Util = YAHOO.util;

    var Service = function(smd, callback, baseUrl) {

       if( Lang.isString(smd) ) {
          this.smdUrl = smd;
          this.fetch(smd, callback);
       }
       else if( Lang.isObject(smd) ) {
          this._smd = smd;
          this._baseUrl = baseUrl;
          this.process(callback);
       }
       else {
          throw new Error("smd should be an object or an url");
       }

    };

    Service.prototype = {

        /**
        * Generate the function from a service definition
        * @method _generateService
        * @param {String} serviceName
        * @param {Method definition} method
        */
        _generateService: function(serviceName, method) {

            if(this[method]){
                throw new Error("WARNING: " + serviceName + " already exists for service. Unable to generate function");
            }
            method.name = serviceName;

            var self = this;
            var func = function(oParams, opts) {
                // Note: oParams = Object Parameters.
                var smd = self._smd;
                var baseUrl = self._baseUrl;

                var envelope = YAHOO.rpc.Envelope[method.envelope || smd.envelope];

                var callback = {
                    success: function(o) {
                        var results = envelope.deserialize(o);

                        // Send the status block off to relevant stores to update UI.
                        if (results.result && results.result.status) {
                            YAHOO.lacuna.Game.ProcessStatus(results.result.status);
                            StatusActions.update(results.result.status);
                        }

                        opts.success.call(opts.scope || self, results);
                    },
                    failure: function(o) {
                        if (Lang.isFunction(opts.failure) ) {
                            var results;
                            try {
                                results = envelope.deserialize(o);
                            }
                            catch(e) {
                                results = o;
                            }
                            opts.failure.call(opts.scope || self, results);
                        }
                    },
                    scope: self
                };

                if (opts.timeout) {
                    callback.timeout = opts.timeout;
                }

                var params = [], p;

                // Handle any SMD parameters.
                if (smd.additionalParameters && Lang.isArray(smd.parameters)) {
                    for (var i = 0; i < smd.parameters.length; i++) {
                        p = smd.parameters[i];
                        params.push(p["default"]);
                    }
                }

                // Then make sure that all the other params are in order.
                for (var i = 0; i < method.parameters.length; i++) {
                    params.push(oParams[method.parameters[i].name]);
                }

                // Now make sure that it all came out right.
                if (params) {
                    if (!params[0] || params[0].name == 'args') {
                        params = oParams;
                    }
                }
                else {
                    params = oParams;
                }

//                console.log('Calling ' + method.name + ' with the parameters of ' + Lang.JSON.stringify(params) + '.'); //debug
                var url = opts.target || method.target || smd.target;
                var urlRegexp = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$/i;

                   if(smd.target && !url.match(urlRegexp) && url != smd.target) {
                    url = smd.target+url;
                }

                if (!!this.smdUrl && !url.match(urlRegexp)) {
                    // URL is still relative !
                    var a=this.smdUrl.split('/');
                    a[a.length-1]="";
                    url = a.join("/")+url;
                }
                else if (baseUrl) {
                    baseUrl = baseUrl.replace(/\/?$/,'/');
                    url = url.replace(/^\//, baseUrl);
                }

                var r = {
                    target: url,
                    callback: callback,
                    data: params,
                    origData: oParams,
                    opts: opts,
                    callbackParamName: method.callbackParamName || smd.callbackParamName,
                    transport: method.transport || smd.transport
                };

                //YAHOO.log('Sending ' + r.data + '.', 'debug', 'RPC._generateService');//debug

                var serialized = envelope.serialize(smd, method, params);
                Lang.augmentObject(r, serialized, true);

                return YAHOO.rpc.Transport[r.transport].call(self, r);
            };

            func.name = serviceName;
            func.description = method.description;
            func._parameters = method.parameters;

            return func;

        },

        /**
        * Process the SMD definition.
        * @method process
        */
        process: function(callback) {

            var serviceDefs = this._smd.services;

            // Generate the methods to this object
            for(var serviceName in serviceDefs){
                if( serviceDefs.hasOwnProperty(serviceName) ) {

                    // Get the object that will contain the method.
                    // handles "namespaced" services by breaking apart by '.'
                    var current = this;
                    var pieces = serviceName.split(".");
                    for(var i=0; i< pieces.length-1; i++){
                        current = current[pieces[i]] || (current[pieces[i]] = {});
                    }

                    current[pieces[pieces.length-1]] =    this._generateService(serviceName, serviceDefs[serviceName]);
                }
            }

            // call the success handler
            if(Lang.isObject(callback) && Lang.isFunction(callback.success)) {
                callback.success.call(callback.scope || this);
            }

        },

        /**
        * Download the SMD at the given url
        * @method fetch
        * @param {String} Absolute or relative url
        */
        fetch: function(url, callback) {
            if(YAHOO.rpc.Service._smdCache[url]) {
                this._smd = YAHOO.rpc.Service._smdCache[url];
                this.process(callback);
            }
            else {
                // TODO: if url is not in the same domain, we should use jsonp !
                Util.Connect.asyncRequest('GET', url, {
                    success: function(o) {
                        try {
                            this._smd = Lang.JSON.parse(o.responseText);
                            YAHOO.rpc.Service._smdCache[url] = this._smd;
                            this.process(callback);
                        }
                        catch(ex) {
                            //YAHOO.log(ex);
                            if( Lang.isFunction(callback.failure) ) {
                                callback.failure.call(callback.scope || this, {error: ex});
                            }
                        }
                    },
                    failure: function(o) {
                        if( Lang.isFunction(callback.failure) ) {
                            callback.failure.call(callback.scope || this, {error: "unable to fetch url "+url});
                        }
                    },
                    scope: this
                });
            }
        }

    };

    Service._smdCache = {}; //collection of smd objects by URL
    Service._requestId = 1;


    /**
     * YAHOO.rpc.Transport
     * @class YAHOO.rpc.Transport
     * @static
     */
    YAHOO.rpc.Transport = {
        /**
        * Build a ajax request using 'POST' method
        * @method POST
        * @param {Object} r Object specifying target, callback and data attributes
        */
        "POST": function(r) {
            return Util.Connect.asyncRequest('POST', r.target, r.callback, r.data );
        },

        /**
        * Build a ajax request using 'GET' method
        * @method GET
        * @param {Object} r Object specifying target, callback and data attributes
        */
        "GET": function(r) {
            return Util.Connect.asyncRequest('GET', r.target + (r.data ? '?'+r.data : ''), r.callback, '');
        },


        jsonp_id: 0,
        /**
        * Receive data through JSONP (insert a script tag within the page)
        * @method JSONP
        * @param {Object} r Object specifying target, callback and data attributes
        */
        "JSONP": function(r) {
            r.callbackParamName = r.callbackParamName || "callback";
            var fctName = encodeURIComponent("YAHOO.rpc.Transport.JSONP.jsonpCallback"+YAHOO.rpc.Transport.jsonp_id);
            YAHOO.rpc.Transport.JSONP["jsonpCallback"+YAHOO.rpc.Transport.jsonp_id] = function(results) {
                if(Lang.isObject(r.callback) && Lang.isFunction(r.callback.success)) {
                    r.callback.success.call(r.callback.scope || this, results);
                }
            };
            YAHOO.rpc.Transport.jsonp_id+=1;
            return Util.Get.script( r.target + ((r.target.indexOf("?") == -1) ? '?' : '&') + r.data + "&"+r.callbackParamName+"="+fctName);
        }
    };


    /**
     * YAHOO.rpc.Envelope
     * @class YAHOO.rpc.Envelope
     * @static
     */
    YAHOO.rpc.Envelope = {
        /**
        * JSON-RPC-2.0 envelope
        * @class YAHOO.rpc.Envelope.JSON-RPC-2.0
        * @static
        */
        "JSON-RPC-2.0": {
            /**
            * serialize
            */
            serialize: function(smd, method, data) {
                return {
                    data: Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": method.name,
                        "jsonrpc": "2.0",
                        "params": data
                    })
                };
            },
            /**
            * deserialize
            */
            deserialize: function(results) {
                if(results.getResponseHeader && (results.getResponseHeader["Content-Type"] == "application/json-rpc" || results.getResponseHeader["Content-Type"] == "application/json")) {
                    return Lang.JSON.parse(results.responseText);
                }
                else {
                    if(results.status == -1) {
                        return {"error":{"message":"The Request has been Aborted because it was taking too long."}};
                    }
                    else if(results.status === 0) {
                        return {"error":{"message":"Communication with the server has been interrupted for an unknown reason."}};
                    }
                    else {
                        // YUI loses headers for Cross-Origin requests, so try as JSON anyway
                        try {
                            return Lang.JSON.parse(results.responseText);
                        }
                        catch(e) {
                            return {"error":{"message":"Response Content-Type is not JSON"}};
                        }
                    }
                }
            }
        }

    };

    //set connects post header to json
    Util.Connect.setDefaultPostHeader("application/json");
    Util.Connect.setDefaultPostHeader(true);
    //assign to global
    YAHOO.rpc.Service = Service;

})();
YAHOO.register("rpc", YAHOO.rpc.Service, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
