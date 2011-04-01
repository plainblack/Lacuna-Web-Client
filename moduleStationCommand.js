YAHOO.namespace("lacuna.modules");

if (typeof YAHOO.lacuna.modules.StationCommand == "undefined" || !YAHOO.lacuna.modules.StationCommand) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var StationCommand = function(result){
		StationCommand.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Modules.StationCommand;
	};
	
	Lang.extend(StationCommand, Lacuna.buildings.PlanetaryCommand);
	/*, {
		getChildTabs : function() {
			return [this._getPlanetTab(), this._getPlanTab()];
		},
		_getPlanetTab : function() {
			var planet = this.result.planet,
				tab = new YAHOO.widget.Tab({ label: "Station", content: [
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
					'			<li><label>Plots Available:</label>',planet.plots_available*1,'</li>',
					'			<li><label>Population:</label>',Lib.formatNumber(planet.population),'</li>',
					'			<li><label>Next Colony Cost:</label>',Lib.formatNumber(this.result.next_colony_cost),'<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span></li>',
					'			<li><label>Location:</label>',planet.x,'x : ',planet.y,'y</li>',
					'			<li><label>Zone:</label>',planet.zone,'</li>',
					'			<li><label>Star:</label>',planet.star_name,'</li>',
					'			<li><label>Orbit:</label>',planet.orbit,'</li>',
					'		</ul>',
					'	</div>',
					'</div>'
				].join('')});
				
			this.planetTab = tab;
			
			return tab;
		},
		_getPlanTab : function() {
			this.planTab = new YAHOO.widget.Tab({ label: "Plans", content: [
				'<ul class="plan planHeader clearafter"><li class="planName">Name</li><li class="planLevel">Level</li><li class="planExtra">Extra Level</li></ul>',
				'<div>',
				'	<div id="planDetails">',
				'	</div>',
				'</div>'
			].join('')});
			this.planTab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					if(!this.plans) {
						Lacuna.Pulser.Show();
						this.service.view_plans({session_id:Game.GetSession(),building_id:this.building.id}, {
							success : function(o){
								Lacuna.Pulser.Hide();
								this.rpcSuccess(o);
								this.plans = o.result.plans;
								
								this.PlanPopulate();
							},
							scope:this
						});
					}
					else {
						this.PlanPopulate();
					}
				}
			}, this, true);
				
			return this.planTab;
		},
		PlanPopulate : function(){
			var div = Dom.get("planDetails");
			if(div) {
				var divParent = div.parentNode,
					ul = document.createElement("ul"),
					li = document.createElement("li");
					
				div = divParent.removeChild(div);
				
				if(this.plans.length > 0) {
					div.innerHTML = "";

					for(var i=0; i<this.plans.length; i++) {
						var plan = this.plans[i],
							nUl = ul.cloneNode(false),
							nLi = li.cloneNode(false);
						
						Dom.addClass(nUl, "plan");
						Dom.addClass(nUl, "clearafter");

						Dom.addClass(nLi,"planName");
						nLi.innerHTML = plan.name;
						nUl.appendChild(nLi);
						
						nLi = li.cloneNode(false);
						Dom.addClass(nLi,"planLevel");
						nLi.innerHTML = plan.level;
						nUl.appendChild(nLi);
						
						nLi = li.cloneNode(false);
						Dom.addClass(nLi,"planExtra");
						nLi.innerHTML = plan.extra_build_level;
						nUl.appendChild(nLi);

						div.appendChild(nUl);
					}
				}
				else {
					div.innerHTML = "No Plans currently available on this planet.";
				}
				
				//add child back in
				divParent.appendChild(div);
				
				//wait for tab to display first
				setTimeout(function() {
					var Ht = Game.GetSize().h - 170;
					if(Ht > 300) { Ht = 300; }
					Dom.setStyle(divParent,"height",Ht + "px");
					Dom.setStyle(divParent,"overflow-y","auto");
				},10);
			}
		}
	});*/
	
	Lacuna.modules.StationCommand = StationCommand;

})();
YAHOO.register("StationCommand", YAHOO.lacuna.modules.StationCommand, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
