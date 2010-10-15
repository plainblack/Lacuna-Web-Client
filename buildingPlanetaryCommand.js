YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.PlanetaryCommand == "undefined" || !YAHOO.lacuna.buildings.PlanetaryCommand) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var PlanetaryCommand = function(result){
		PlanetaryCommand.superclass.constructor.call(this, result);
	};
	
	Lang.extend(PlanetaryCommand, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getPlanetTab(), this._getAbandonTab(), this._getRenameTab()];
		},
		_getPlanetTab : function() {
			var planet = this.result.planet,
				tab = new YAHOO.widget.Tab({ label: "Planet", content: [
					'<div class="yui-g buildingDetailsExtra">',
					'	<div class="yui-u first">',
					'		<ul>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span>',
					'				<span class="pcStored">',planet.food_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.food_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.food_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span>',
					'				<span class="pcStored">',planet.ore_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.ore_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.ore_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span>',
					'				<span class="pcStored">',planet.water_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.water_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.water_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span>',
					'				<span class="pcStored">',planet.energy_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.energy_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.energy_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span>',
					'				<span class="pcStored">',planet.waste_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.waste_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.waste_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" title="Happiness" class="smallHappy" /></span>',
					'				<span class="pcStored">',planet.happiness, '</span><span class="pcSlash">&nbsp;</span><span class="pcCapacity">&nbsp;</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.happiness_hour),'</span>/hr</li>',
					'		</ul>',
					'	</div>',
					'	<div class="yui-u first">',
					'		<ul class="buildingDetailsPC">',
					'			<li><label>Buildings:</label>',planet.building_count,'</li>',
					'			<li><label>Planet Size:</label>',planet.size,'</li>',
					'			<li><label>Plots Available:</label>',(planet.size*1) - (planet.building_count*1),'</li>',
					'			<li><label>Population:</label>',Lib.formatNumber(planet.population),'</li>',
					'			<li><label>Next Colony Cost:</label>',Lib.formatNumber(this.result.next_colony_cost),'<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span></li>',
					'			<li><label>Location:</label>',planet.x,'x : ',planet.y,'y</li>',
					'			<li><label>Star:</label>',planet.star_name,'</li>',
					'			<li><label>Orbit:</label>',planet.orbit,'</li>',
					'		</ul>',
					'	</div>',
					'</div>'
				].join('')});
				
			this.planetTab = tab;
			
			return tab;
		},
		_getAbandonTab : function() {
			this.abandonTab = new YAHOO.widget.Tab({ label: "Abandon", content: ['<div>',
			'	<div id="commandMessage" class="alert">This colony and everything on it will disappear if you abandon it.</div>',
			'	<button type="button" id="commandAbandon">Abandon Colony</button>',
			'</div>'].join('')});
			
			Event.on("commandAbandon", "click", this.Abandon, this, true);
			
			return this.abandonTab;
		},
		_getRenameTab : function() {
			this.renameTab = new YAHOO.widget.Tab({ label: "Rename", content: ['<div><ul>',
			'	<li><label>Current Planet Name: </label><span id="commandPlanetCurrentName">',Game.GetCurrentPlanet().name,'</span></li>',
			'	<li><label>New Planet Name: </label><input type="text" id="commandPlanetNewName" maxlength="100" /></li>',
			'	<li class="alert" id="commandPlanetRenameMessage"></li>',
			'	<li><button type="button" id="commandRename">Rename</button></li>',
			'</ul></div>'].join('')});
			
			Event.on("commandRename", "click", this.Rename, this, true);
			
			return this.renameTab;
		},
		Abandon : function() {
			var cp = Game.GetCurrentPlanet();
			if(confirm(['Are you sure you want to abandon ',cp.name,'?'].join(''))) {
				Lacuna.Pulser.Show();
				Game.Services.Body.abandon({
					session_id:Game.GetSession(""),
					body_id:cp.id
				}, {
				success : function(o){
					YAHOO.log(o, "info", "PlanetaryCommand.abandon.success");
					this.fireEvent("onMapRpc", o.result);

					Game.PlanetJump(); //jumps to home planet if nothing passed in
					
					Lacuna.Pulser.Hide();
				},
				failure : function(o){
					Lacuna.Pulser.Hide();
					YAHOO.log(o, "error", "PlanetaryCommand.abandon.failure");
					
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
			}
		},
		Rename : function() {
			var newName = Dom.get("commandPlanetNewName").value,
				planetId = Game.GetCurrentPlanet().id;
			Game.Services.Body.rename({
					session_id: Game.GetSession(""),
					body_id:planetId,
					name:newName
				},{
					success : function(o){
						YAHOO.log(o, "info", "PlanetaryCommand.Rename.success");
						if(o.result && planetId) {
						
							Dom.get("commandPlanetRenameMessage").innerHTML = ["Successfully renamed your planet from ", Game.EmpireData.planets[planetId].name," to ", newName, '.'].join('');
							Lib.fadeOutElm("commandPlanetRenameMessage");
							Dom.get("commandPlanetNewName").value = "";
							Dom.get("commandPlanetCurrentName").innerHTML = newName;
							Game.EmpireData.planets[planetId].name = newName;
							Lacuna.Menu.update();
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "PlanetaryCommand.Rename.failure");
						Dom.get("commandPlanetRenameMessage").innerHTML = o.error.message;
						Lib.fadeOutElm("commandPlanetRenameMessage");
					},
					timeout:Game.Timeout,
					scope:this
				}
			);
		}
	});
	
	Lacuna.buildings.PlanetaryCommand = PlanetaryCommand;

})();
YAHOO.register("planetarycommand", YAHOO.lacuna.buildings.PlanetaryCommand, {version: "1", build: "0"}); 

}
