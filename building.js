YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Building == "undefined" || !YAHOO.lacuna.buildings.Building) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Building = function(oResults){
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		this.createEvent("onQueueAdd");
		this.createEvent("onQueueReload");
		this.createEvent("onQueueReset");
		this.createEvent("onAddTab");
		this.createEvent("onRemoveTab");
		this.createEvent("onSelectTab");
		this.createEvent("onReloadTabs");
		this.createEvent("onUpdateTile");
		this.createEvent("onRemoveTile");
		this.createEvent("onHide");
		//for internal use
		this.createEvent("onLoad");
		this.createEvent("onRepair");
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
		load : function() {
			this.fireEvent("onLoad");
		},
		getTabs : function() {
			if(this.building.efficiency*1 < 100 && this.building.repair_costs) {
				return [this._getProductionTab(), this._getRepairTab()];
			}
			else {
				var tabs = [this._getProductionTab()],
					childTabs = this.getChildTabs();
					
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
		addQueue : function(sec, func, elm, sc) {
			this.fireEvent("onQueueAdd", {seconds:sec, fn:func, el:elm, scope:sc});
		},
		reloadQueue : function(building) {
			this.fireEvent("onQueueReload", building);
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
			this.fireEvent("onUpdateTile", building);
		},
		removeBuildingTile : function(building) {
			this.fireEvent("onRemoveTile", building);
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
					this.fireEvent("onMapRpc", o.result);
					if(this.repairTab) {
						Event.removeListener("repair", "click");
						this.removeTab(this.repairTab);
						o.result.building.url = this.building.url;
						this.building = o.result.building;
						this.work = o.result.work;
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
					this.fireEvent("onMapRpcFailed", o);
					target.disabled = false;
				},
				target:this.building.url,
				timeout:Game.Timeout,
				scope:this
			});
		},
		
		_getProductionTab : function() {
			var up = this.building.upgrade;
				
			this.productionTab = new YAHOO.widget.Tab({ label: "Production", content: [
				'<div id="detailsProduction">',
				'	<div id="buildingDetailsProduction" class="yui-gb">',
				'		<div class="yui-u first">',
				'			<ul>',
				'				<li>Current Production</li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span id="buildingDetailsFood" class="buildingDetailsNum">',this.building.food_hour,'</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span id="buildingDetailsOre" class="buildingDetailsNum">',this.building.ore_hour,'</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span id="buildingDetailsWater" class="buildingDetailsNum">',this.building.water_hour,'</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span id="buildingDetailsEnergy" class="buildingDetailsNum">',this.building.energy_hour,'</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span id="buildingDetailsWaste" class="buildingDetailsNum">',this.building.waste_hour,'</span></li>',
				'				<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span><span id="buildingDetailsHappiness" class="buildingDetailsNum">',this.building.happiness_hour,'</span></li>',
				'				<li>', (this.building.pending_build) ? '<span class="alert">Unable to Demolish</span>' : '<button id="buildingDetailsDemolish" type="button">Demolish</button>' ,'</li>',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeProduction">',
				up ? [
					'<li><ul><li>Upgrade Production</li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',up.production.food_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',up.production.ore_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',up.production.water_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.production.energy_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',up.production.waste_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span><span class="buildingDetailsNum">',up.production.happiness_hour,'</span></li>',
					'	</ul></li>',
					up.can ? '<li><button id="buildingDetailsUpgrade" type="button">Upgrade to Level ' + (1 + (this.building.level*1)) + '</button></li>' : '<li class="alert">Unable to Upgrade:</li><li class="alert">',up.reason[1],'</li>'
					].join('') : '',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeCost">',
				up ? [
					'	<li>Upgrade Cost</li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',up.cost.food,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',up.cost.ore,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',up.cost.water,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.cost.energy,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',up.cost.waste,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(up.cost.time),'</span></li>'
					].join('') : '',
				'			</ul>',
				'		</div>',
				'	</div>',
				'</div>'
				].join('')});
			
			if(up.can) {
				Event.on("buildingDetailsUpgrade", "click", this.Upgrade, this, true);
			}
			if(!this.building.pending_build) {
				Event.on("buildingDetailsDemolish", "click", this.Demolish, this, true);
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
						this.fireEvent("onMapRpc", o.result);
						this.removeBuildingTile(this.building);
						this.fireEvent("onHide");					
					},
					failure : function(o){
						YAHOO.log(o, "error", "Building.Demolish.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
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
					
					this.reloadQueue(b);
					
					this.fireEvent("onHide");
				},
				failure : function(o){
					YAHOO.log(o, "error", "Building.Upgrade.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		
		_getStorageTab : function() {
			var fc = this.building.food_capacity*1,
				oc = this.building.ore_capacity*1,
				wc = this.building.water_capacity*1,
				ec = this.building.energy_capacity*1,
				sc = this.building.waste_capacity*1,
				currentStorage = 0;
				
			if(fc != 0) {
				currentStorage += fc;
			}
			if(oc != 0) {
				currentStorage += oc;
			}
			if(wc != 0) {
				currentStorage += wc;
			}
			if(ec != 0) {
				currentStorage += ec;
			}
			if(sc != 0) {
				currentStorage += sc;
			}
			
			var p = this.building.upgrade.production;
			output = [
				'<div style="margin-bottom:2px;padding-bottom:2px;border-bottom:1px solid #52acff;">Currently Used Storage: ',currentStorage,'/',fc+oc+wc+ec+sc,'</div>',
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
