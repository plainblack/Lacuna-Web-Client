YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Building == "undefined" || !YAHOO.lacuna.buildings.Building) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util;

	var Building = function(oResults){
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		this.createEvent("onQueueAdd");
		this.createEvent("onQueueReset");
		this.createEvent("onRemoveTab");
		//common elements
		this.building = oResults.building;
		this.work = oResults.work;
		//delete status since it's rather large
		delete oResults.status;
		//so we can store just in case anyway
		this.result = oResults;
	};
	
	Building.prototype = {
		destroy : function() {
			this.unsubscribeAll();
		},
		getTabs : function() {
			return [];
		},
		addQueue : function(sec, func, elm, sc) {
			this.fireEvent("onQueueAdd", {seconds:sec, fn:func, el:elm, scope:sc});
		},
		resetQueue : function() {
			this.fireEvent("onQueueReset");
		},
		removeTab : function(tab) {
			this.fireEvent("onRemoveTab", tab);
		}
};
	Lang.augmentProto(Building, Util.EventProvider);
	
	YAHOO.lacuna.buildings.Building = Building;

})();
YAHOO.register("building", YAHOO.lacuna.buildings.Building, {version: "1", build: "0"}); 

}