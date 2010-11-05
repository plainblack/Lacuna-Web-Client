YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.TempleOfTheDrajilites == "undefined" || !YAHOO.lacuna.buildings.TempleOfTheDrajilites) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Pager = YAHOO.widget.Paginator,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var TempleOfTheDrajilites = function(result){
		TempleOfTheDrajilites.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.TempleOfTheDrajilites;
		this.maps = {};
	};
	
	Lang.extend(TempleOfTheDrajilites, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getPlanetsTab()];
		},
		_getPlanetsTab : function() {
			this.planetsTab = new YAHOO.widget.Tab({ label: "Planets", content: [
					'<div>',
					'	<div class="clearafter">',
					'		<ul id="plantsDetails" class="planetsInfo">',
					'		</ul>',
					'	</div>',
					'</div>'
				].join('')});
			this.planetsTab.subscribe("activeChange", this.GetPlanets, this, true);
					
			return this.planetsTab;
		},
		
		GetPlanets : function(e) {
			if(e.newValue) {
				if(!this.plants) {
					Lacuna.Pulser.Show();
					this.service.list_planets({session_id:Game.GetSession(),building_id:this.building.id}, {
						success : function(o){
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
							this.plants = o.result.planets;
							this.PlanetsDisplay();
						},
						failure : function(o){
							Lacuna.Pulser.Hide();
							this.rpcFailure(o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.PlanetsDisplay();
				}
			}
		},
		PlanetsDisplay : function() {
			var plants = this.plants,
				plantsDetails = Dom.get("plantsDetails");
				
			if(plantsDetails) {
				Event.purgeElement(plantsDetails);
				plantsDetails.innerHTML = "";
				
				var li = document.createElement("li");
				
				for(var i=0; i<plants.length; i++) {
					var pt = plants[i],
						nLi = li.cloneNode(false);
						
					nLi.Planet = pt;
					Dom.addClass(nLi,"planetDisplay");
					
					nLi.innerHTML = pt.name;
					
					nLi = plantsDetails.appendChild(nLi);
					Event.on(nLi, "click", this.PlanetView, this, true);
				}
			}
		},
		PlanetView : function(e) {
			var nLi = Event.getTarget(e);
			if(nLi.Planet) {
				if(!this.maps[nLi.Planet.id]) {
					Lacuna.Pulser.Show();
					this.service.view_planet({session_id:Game.GetSession(),building_id:this.building.id,planet_id:nLi.Planet.id}, {
						success : function(o){
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
							this.maps[nLi.Planet.id] = o.result.map;
							Lacuna.Messaging.attachmentPanel.load(o.result.map);
						},
						failure : function(o){
							Lacuna.Pulser.Hide();
							this.rpcFailure(o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					Lacuna.Messaging.attachmentPanel.load(this.maps[nLi.Planet.id]);
				}
			}
		}

	});
	
	YAHOO.lacuna.buildings.TempleOfTheDrajilites = TempleOfTheDrajilites;

})();
YAHOO.register("templeofthedrajilites", YAHOO.lacuna.buildings.TempleOfTheDrajilites, {version: "1", build: "0"}); 

}