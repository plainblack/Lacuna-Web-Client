/**
* Code taken from inputEx's  (http://javascript.neyric.com/inputex/) rpc library and slightly modified
*/

YAHOO.namespace("rpc");

if (typeof YAHOO.rpc.Service == "undefined" || !YAHOO.rpc.Service) {

(function() {

	var Lang = YAHOO.lang, 
		Util = YAHOO.util;

	var Service = function(smd, callback) {

	   if( Lang.isString(smd) ) {
		  this.smdUrl = smd;
		  this.fetch(smd, callback);
	   }
	   else if( Lang.isObject(smd) ) {
		  this._smd = smd;
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
				throw new Error("WARNING: "+ serviceName+ " already exists for service. Unable to generate function");
			}
			method.name = serviceName;

			var self = this;
			var func = function(oParams, opts) {
				var smd = self._smd;
				
				var envelope = YAHOO.rpc.Envelope[method.envelope || smd.envelope];
				var callback = {
					success: function(o) {
						console.log("RPC SUCCESS: ", o);
						var results = envelope.deserialize(o);
						opts.success.call(opts.scope || self, results);
					},
					failure: function(o) {
						console.log("RPC FAILURE: ", o);
						if(Lang.isFunction(opts.failure) ) {
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
				
				if(opts.timeout) {
					callback.timeout = opts.timeout;
				}

				var params, //will be either an Array or an Object depending on the type that method.parameters is
					pKey, i, p;
				//if this is array params
				if(Lang.isArray(method.parameters)) {
					params = [];
					if(smd.additionalParameters && Lang.isArray(smd.parameters)) {
						for(i = 0 ; i < smd.parameters.length ; i++) {
							p = smd.parameters[i];
							params.push(p["default"]);
						}
					}
					//push method params in correct order 
					for(i = 0 ; i < method.parameters.length ; i++) {
						p = method.parameters[i];
						params.push(oParams[p.name]);
					}
				}
				else {
					//other wise it's an object format and we don't care what order they are in
					params = {};
					//apply any additonal params
					if(smd.additionalParameters && Lang.isArray(smd.parameters)) {
						for(i = 0 ; i < smd.parameters.length ; i++) {
							p = smd.parameters[i];
							params[p.name] = p["default"];
						}
					}
					//augment with passing params after additional so we overwrite if we have to
					Lang.augmentObject(params, oParams, true);
				}
				
				/* 1.1 implementation
				var params = {};
				if(smd.additionalParameters && Lang.isArray(smd.parameters) ) {
					for(var i = 0 ; i < smd.parameters.length ; i++) {
						var p = smd.parameters[i];
						params[p.name] = p["default"];
					}
				}
				Lang.augmentObject(params, data, true);
				*/

				var url = method.target || smd.target;
				var urlRegexp = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$/i;
				if(!url.match(urlRegexp) && url != smd.target) {
					url = smd.target+url;
				}

				if( !!this.smdUrl && !url.match(urlRegexp) ) {
					// URL is still relative !
					var a=this.smdUrl.split('/');
					a[a.length-1]="";
					url = a.join("/")+url;
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
				var serialized = envelope.serialize(smd, method, params);
				Lang.augmentObject(r, serialized, true);

				return YAHOO.rpc.Transport[r.transport].call(self, r ); 
			};

			func.name = serviceName;
			func.description = method.description;
			func._parameters = method.parameters;

			return func;
		},
	   
		/**
		* Process the SMD definition
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

					current[pieces[pieces.length-1]] =	this._generateService(serviceName, serviceDefs[serviceName]);
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
							if(Lang.isObject(console) && Lang.isFunction(console.log))
								console.log(ex);
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
			YAHOO.rpc.Transport["JSONP"]["jsonpCallback"+YAHOO.rpc.Transport.jsonp_id] = function(results) {
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
			* serialize
			*/
			deserialize: function(results) {
				return Lang.JSON.parse(results.responseText);
			}
		}
	   
	};

	//assign to global
	YAHOO.rpc.Service = Service;
	
})();
YAHOO.register("rpc", YAHOO.rpc.Service, {version: "1", build: "0"}); 

}
