YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.SpaceStationLab == "undefined" || !YAHOO.lacuna.buildings.SpaceStationLab) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var SpaceStationLab = function(result){
		SpaceStationLab.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.SpaceStationLab;
	};
	
	Lang.extend(SpaceStationLab, Lacuna.buildings.Building, {
		getChildTabs : function() {
			/*if(this.result.make_plan && this.result.make_plan.level_costs.length > 0) {
				return [this._getPlanTab()];
			}
			else {
				return [];
			}*/
		},
		_getPlanTab : function() {
			var makePlan = this.result.make_plan,
				html = [
					'<ul class="plan planHeader clearafter"><li class="planName">Name</li><li>Costs</li><li></li></ul>',
					'<div><div id="planDetails">'
				],
				ul = document.createElement("ul");
				
			for(var type in makePlan.types) {
				var nUl = ul.cloneNode(false);
				Dom.addClass(nUl, "plan");
				nUl.innerHTML = [
					'<li class="planName">', makePlan.types[type], '</li>',
					'<li>', makePlan.level_costs[type], '</li>',
					'<li class="planName"><button type="button">Make</button></li>'
				].join('');
			}
				
			html.push('</div></div>');
			
			return new YAHOO.widget.Tab({ label: "Make Plan", content: html.join('')});
		}
	});
	
	Lacuna.buildings.SpaceStationLab = SpaceStationLab;

})();
YAHOO.register("spacestationlab", YAHOO.lacuna.buildings.SpaceStationLab, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
