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
		getTabs : function() {
			return [this._getPlanetTab()];
		},
		_getPlanetTab : function() {
			var planet = this.result.planet,
				tab = new YAHOO.widget.Tab({ label: "Planet", content: [
					'<div class="yui-g buildingDetailsExtra">',
					'	<div class="yui-u first">',
					'		<ul>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span>',
					'				<span class="pcStored">',planet.food_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.food_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.food_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span>',
					'				<span class="pcStored">',planet.ore_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.ore_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.ore_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span>',
					'				<span class="pcStored">',planet.water_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.water_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.water_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span>',
					'				<span class="pcStored">',planet.energy_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.energy_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.energy_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span>',
					'				<span class="pcStored">',planet.waste_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.waste_capacity, '</span> @ <span class="pcPerHour">', Lib.convertNumDisplay(planet.waste_hour),'</span>/hr</li>',
					'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span>',
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
	});
	
	Lacuna.buildings.PlanetaryCommand = PlanetaryCommand;

})();
YAHOO.register("planetarycommand", YAHOO.lacuna.buildings.PlanetaryCommand, {version: "1", build: "0"}); 

}