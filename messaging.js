YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Messaging == "undefined" || !YAHOO.lacuna.Messaging) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var Messaging = function() {
	};
	Messaging.prototype = {
	};
	Lang.augmentProto(Messaging, Util.EventProvider);
			
	Lacuna.Messaging = new Messaging();
})();
YAHOO.register("messaging", YAHOO.lacuna.Messaging, {version: "1", build: "0"}); 

}