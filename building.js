YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Building == "undefined" || !YAHOO.lacuna.buildings.Building) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

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
			if(this.building.efficiency*1 < 100 && this.building.repair_costs) {
				return [this._getRepairTab()];
			}
			else {
				return [];
			}
		},
		addQueue : function(sec, func, elm, sc) {
			this.fireEvent("onQueueAdd", {seconds:sec, fn:func, el:elm, scope:sc});
		},
		resetQueue : function() {
			this.fireEvent("onQueueReset");
		},
		removeTab : function(tab) {
			this.fireEvent("onRemoveTab", tab);
		},
		
		_getRepairTab : function() {
			this.repairTab = new YAHOO.widget.Tab({ label: "Repair", content: [
					'<div id="repairContainer">',
					'	<span id="repairText">Building is currently running at ',this.building.efficiency,'% efficiency.  Costs to repair the building are:</span>',
					'	<ul>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',this.building.repair_costs.food,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',this.building.repair_costs.ore,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',this.building.repair_costs.water,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',this.building.repair_costs.energy,'</span></li>',
					'	</ul>',
					'	<button id="repairBuilding" type="button">Repair</button>',
					'</div>',
				].join('')});

			Event.on("repairBuilding", "click", this.Repair, this, true);
					
			return this.repairTab;
		},
		Repair : function() {
			Lacuna.Pulser.Show();
			Game.Services.Buildings.Generic.repair({session_id:Game.GetSession(),building_id:this.building.id}, {
				success : function(o){
					YAHOO.log(o, "info", "Building.Repair.repair.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					if(this.repairTab) {
						Event.removeListener("repair", "click");
						this.removeTab(this.repairTab);
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "Building.Repair.repair.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					target.disabled = false;
				},
				target:this.building.url,
				timeout:Game.Timeout,
				scope:this
			});
		}
		
};
	Lang.augmentProto(Building, Util.EventProvider);
	
	YAHOO.lacuna.buildings.Building = Building;

})();
YAHOO.register("building", YAHOO.lacuna.buildings.Building, {version: "1", build: "0"}); 

}