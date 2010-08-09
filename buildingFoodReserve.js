YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.FoodReserve == "undefined" || !YAHOO.lacuna.buildings.FoodReserve) {
	
(function(){
	var FoodReserve = function(result){
		FoodReserve.superclass.constructor.call(this, result);
	};
	
	YAHOO.lang.extend(FoodReserve, YAHOO.lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getFoodTab()];
		},
		_getFoodTab : function() {
			var stored = this.result.food_stored;
			return new YAHOO.widget.Tab({ label: "Food", content: [
				'<div class="yui-g buildingDetailsExtra">',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li><label>Algae</label><span class="buildingDetailsNum">',stored.algae,'</span></li>',
				'			<li><label>Apple</label><span class="buildingDetailsNum">',stored.apple,'</span></li>',
				'			<li><label>Bean</label><span class="buildingDetailsNum">',stored.bean,'</span></li>',
				'			<li><label>Beetle</label><span class="buildingDetailsNum">',stored.beetle,'</span></li>',
				'			<li><label>Bread</label><span class="buildingDetailsNum">',stored.bread,'</span></li>',
				'			<li><label>Burger</label><span class="buildingDetailsNum">',stored.burger,'</span></li>',
				'			<li><label>Cheese</label><span class="buildingDetailsNum">',stored.cheese,'</span></li>',
				'			<li><label>Chip</label><span class="buildingDetailsNum">',stored.chip,'</span></li>',
				'			<li><label>Cider</label><span class="buildingDetailsNum">',stored.cider,'</span></li>',
				'			<li><label>Corn</label><span class="buildingDetailsNum">',stored.corn,'</span></li>',
				'			<li><label>Fungus</label><span class="buildingDetailsNum">',stored.fungus,'</span></li>',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li><label>Lapis</label><span class="buildingDetailsNum">',stored.lapis,'</span></li>',
				'			<li><label>Meal</label><span class="buildingDetailsNum">',stored.meal,'</span></li>',
				'			<li><label>Milk</label><span class="buildingDetailsNum">',stored.milk,'</span></li>',
				'			<li><label>Pancake</label><span class="buildingDetailsNum">',stored.pancake,'</span></li>',
				'			<li><label>Pie</label><span class="buildingDetailsNum">',stored.pie,'</span></li>',
				'			<li><label>Potato</label><span class="buildingDetailsNum">',stored.potato,'</span></li>',
				'			<li><label>Root</label><span class="buildingDetailsNum">',stored.root,'</span></li>',
				'			<li><label>Shake</label><span class="buildingDetailsNum">',stored.shake,'</span></li>',
				'			<li><label>Soup</label><span class="buildingDetailsNum">',stored.soup,'</span></li>',
				'			<li><label>Syrup</label><span class="buildingDetailsNum">',stored.syrup,'</span></li>',
				'			<li><label>Wheat</label><span class="buildingDetailsNum">',stored.wheat,'</span></li>',
				'		</ul>',
				'	</div>',
				'</div>'
			].join('')});
		}
		
	});
	
	YAHOO.lacuna.buildings.FoodReserve = FoodReserve;

})();
YAHOO.register("foodreserve", YAHOO.lacuna.buildings.FoodReserve, {version: "1", build: "0"}); 

}