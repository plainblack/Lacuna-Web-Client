YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Building == "undefined" || !YAHOO.lacuna.buildings.Building) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Building = function(oResults){
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		this.createEvent("onQueueAdd");
		this.createEvent("onQueueReset");
		this.createEvent("onAddTab");
		this.createEvent("onRemoveTab");
		this.createEvent("onSelectTab");
		this.createEvent("onReloadTabs");
		this.createEvent("onUpdateTile");
		this.createEvent("onUpdateMap");
		this.createEvent("onRemoveTile");
		this.createEvent("onHide");
		//for internal use
		this.createEvent("onLoad");
		this.createEvent("onRepair");
		//common elements
		this.building = oResults.building;
		this.work = oResults.building.work;
		//delete status since it's rather large
		delete oResults.status;
		//so we can store just in case anyway
		this.result = oResults;
	};
	
	Building.prototype = {
		destroy : function() {
			this.unsubscribeAll();
		},
		load : function() {
			this.fireEvent("onLoad");
		},
		getTabs : function() {
			if(this.building.efficiency*1 < 100 && this.building.repair_costs) {
				return [this._getProductionTab(), this._getRepairTab()];
			}
			else {
				var tabs = [this._getProductionTab()],
					childTabs = this.building.level > 0 ? this.getChildTabs() : null;
					
				if(childTabs && Lang.isArray(childTabs)) {
					tabs = tabs.concat(childTabs);
				}
				
				//create storage tab last
				if(this.building.upgrade.production && ((this.building.food_capacity*1 + this.building.ore_capacity*1 + this.building.water_capacity*1 + this.building.energy_capacity*1 + this.building.waste_capacity*1) > 0)) {
					tabs[tabs.length] = this._getStorageTab();
				}
				
				return tabs;
			}
		},
		getChildTabs : function() {
			//overrideable function for child classes that have their own tabs
			//** Must return nothing or an array of tabs **
		},
		
		/*
		Event Helpers
		*/
		rpcSuccess : function(o) {
			this.fireEvent("onMapRpc", o.result);
			if(o.result.building && this.building) {
				//if we suddenly have work update the tile to add the tile.  if we don't have work update the tile to remove the timer
				var workChanged = (
					(this.building.work && !o.result.building.work)
					|| (!this.building.work && o.result.building.work)
					|| (this.building.work && o.result.building.work && this.building.work.end != o.result.building.work.end)
				);
				if(workChanged) {
					this.building.work = o.result.building.work;
					this.work = this.building.work;
					this.updateBuildingTile(this.building);
				}
				/*if(o.result.building.id && o.result.building.name) {
					delete this.building.work;
					delete this.building.pending_build;
					Lang.augmentObject(this.building, o.result.building, true);
				}
				else if(o.result.building.work) {
					this.building.work = o.result.building.work;
				}
				this.work = this.building.work;
				if(workChanged) {
					this.updateBuildingTile(this.building);
				}*/
			}
		},
		rpcFailure : function(o) {
			this.fireEvent("onMapRpcFailed", o);
		},
		addQueue : function(sec, func, elm, sc) {
			this.fireEvent("onQueueAdd", {seconds:sec, fn:func, el:elm, scope:sc});
		},
		resetQueue : function() {
			this.fireEvent("onQueueReset");
		},
		addTab : function(tab) {
			this.fireEvent("onAddTab", tab);
		},
		removeTab : function(tab) {
			this.fireEvent("onRemoveTab", tab);
		},
		updateBuildingTile : function(building) {
			//always updated url when doing this since some returns don't have the url
			building.url = this.building.url;
			this.building = building;
			this.fireEvent("onUpdateTile", this.building);
		},
		removeBuildingTile : function(building) {
			this.fireEvent("onRemoveTile", building);
		},
		
		_getRepairTab : function() {
			this.repairTab = new YAHOO.widget.Tab({ label: "Repair", content: [
					'<div id="repairContainer">',
					'	<span id="repairText">Building is currently running at ',this.building.efficiency,'% efficiency.  Costs to repair the building are:</span>',
					'	<ul>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',this.building.repair_costs.food,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',this.building.repair_costs.ore,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',this.building.repair_costs.water,'</span></li>',
					'		<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',this.building.repair_costs.energy,'</span></li>',
					'	</ul>',
					'	<button id="repairBuilding" type="button">Repair</button>',
					'</div>'
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
					this.rpcSuccess(o);
					if(this.repairTab) {
						Event.removeListener("repair", "click");
						this.removeTab(this.repairTab);
						o.result.building.url = this.building.url;
						this.building = o.result.building;
						this.work = o.result.building.work;
						this.result = o.result;
						this.updateBuildingTile(o.result.building);
						this.fireEvent("onReloadTabs");
					}
					if(!this.productionTab) {
						this.addTab(this._getProductionTab());
					}
					this.fireEvent("onRepair");
				},
				failure : function(o){
					YAHOO.log(o, "error", "Building.Repair.repair.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
					target.disabled = false;
				},
				target:this.building.url,
				timeout:Game.Timeout,
				scope:this
			});
		},
		
		_getProductionTab : function() {
			var up = this.building.upgrade,
				currentLevel = this.building.level*1;
				
			this.productionTab = new YAHOO.widget.Tab({ label: "Production", content: [
				'<div id="detailsProduction">',
				'	<div id="buildingDetailsProduction" class="yui-gb">',
				'		<div class="yui-u first">',
				'			<ul>',
				'				<li>Current Production</li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span id="buildingDetailsFood" class="buildingDetailsNum">',this.building.food_hour,'/hr</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span id="buildingDetailsOre" class="buildingDetailsNum">',this.building.ore_hour,'/hr</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span id="buildingDetailsWater" class="buildingDetailsNum">',this.building.water_hour,'/hr</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span id="buildingDetailsEnergy" class="buildingDetailsNum">',this.building.energy_hour,'/hr</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span id="buildingDetailsWaste" class="buildingDetailsNum">',this.building.waste_hour,'/hr</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" title="Happiness" class="smallHappy" /></span><span id="buildingDetailsHappiness" class="buildingDetailsNum">',this.building.happiness_hour,'/hr</span></li>',
				'				<li><button id="buildingDetailsDemolish" type="button">Demolish</button></li>',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeProduction">',
				up ? [
					'<li><ul><li>Upgrade Production</li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',up.production.food_hour,'/hr</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',up.production.ore_hour,'/hr</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',up.production.water_hour,'/hr</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.production.energy_hour,'/hr</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',up.production.waste_hour,'/hr</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" title="Happiness" class="smallHappy" /></span><span class="buildingDetailsNum">',up.production.happiness_hour,'/hr</span></li>',
					'	</ul></li>',
					up.can ? '<li><button id="buildingDetailsUpgrade" type="button">Upgrade to Level ' + (1 + (this.building.level*1)) + '</button></li>' : '<li class="alert">Unable to Upgrade:</li><li class="alert">',up.reason[1],'</li>'
					].join('') : '',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeCost">',
				up ? [
					'	<li>Upgrade Cost</li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',up.cost.food,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',up.cost.ore,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',up.cost.water,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.cost.energy,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',up.cost.waste,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(up.cost.time),'</span></li>'
					].join('') : '',
				currentLevel <= 1 ? '' : ' <li><button id="buildingDetailsDowngrade" type="button">Downgrade to Level ' + (currentLevel - 1) + '</button></li>',
				'			</ul>',
				'		</div>',
				'	</div>',
				'</div>'
				].join('')});
			
			Event.on("buildingDetailsDemolish", "click", this.Demolish, this, true);
			if(up.can) {
				Event.on("buildingDetailsUpgrade", "click", this.Upgrade, this, true);
			}
			if(currentLevel > 1) {
				Event.on("buildingDetailsDowngrade", "click", this.Downgrade, this, true);
			}
			
			return this.productionTab;

		},
		Demolish : function() {
			if(confirm(['Are you sure you want to Demolish the level ',this.building.level,' ',this.building.name,'?'].join(''))) {
				Lacuna.Pulser.Show();
				Game.Services.Buildings.Generic.demolish({
					session_id:Game.GetSession(),
					building_id:this.building.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "Building.Demolish.success");
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						this.removeBuildingTile(this.building);
						this.fireEvent("onHide");					
					},
					failure : function(o){
						YAHOO.log(o, "error", "Building.Demolish.failure");
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this,
					target:this.building.url
				});
			}
		},
		Downgrade : function() {
			if(confirm(['Are you sure you want to downgrade the level ',this.building.level,' ',this.building.name,'?'].join(''))) {
				Lacuna.Pulser.Show();
				Game.Services.Buildings.Generic.downgrade({
					session_id:Game.GetSession(),
					building_id:this.building.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "Building.Downgrade.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						
						var b = this.building; //originally passed in building data from currentBuilding
						b.id = o.result.building.id;
						b.level = o.result.building.level;
						b.pending_build = o.result.building.pending_build;
						YAHOO.log(b, "info", "Building.Upgrade.success.building");
						
						this.updateBuildingTile(b);
					
						this.fireEvent("onHide");					
					},
					failure : function(o){
						YAHOO.log(o, "error", "Building.Downgrade.failure");
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this,
					target:this.building.url
				});
			}
		},
		Upgrade : function() {
			Lacuna.Pulser.Show();
			var building = this.building,
				BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Game.GetSession(""),
					building_id: building.id
				};
			
			BuildingServ.upgrade(data,{
				success : function(o){
					YAHOO.log(o, "info", "Building.Upgrade.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					
					var b = building; //originally passed in building data from currentBuilding
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					YAHOO.log(b, "info", "Building.Upgrade.success.building");
					
					this.updateBuildingTile(b);
					
					this.fireEvent("onHide");
				},
				failure : function(o){
					YAHOO.log(o, "error", "Building.Upgrade.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		
		_getStorageTab : function() {			
			var p = this.building.upgrade.production,
				output = [
				'<div class="yui-g">',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li>Current Building Storage</li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',this.building.food_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',this.building.ore_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',this.building.water_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',this.building.energy_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',this.building.waste_capacity,'</span></li>',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u">',
				'		<ul id="buildingDetailsUpgradeStorage">',
				'			<li>Upgrade to Building Storage</li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',p.food_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',p.ore_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',p.water_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',p.energy_capacity,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',p.waste_capacity,'</span></li>',
				'		</ul>',
				'	</div>',
				'</div>'];
			return new YAHOO.widget.Tab({ label: "Storage", content: output.join('')});
		}
	};
	Lang.augmentProto(Building, Util.EventProvider);
	
	YAHOO.lacuna.buildings.Building = Building;

})();
YAHOO.register("building", YAHOO.lacuna.buildings.Building, {version: "1", build: "0"}); 

}
