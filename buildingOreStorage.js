YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.OreStorage == "undefined" || !YAHOO.lacuna.buildings.OreStorage) {
	
(function(){

	var OreStorage = function(result){
		OreStorage.superclass.constructor.call(this, result);
	};
	
	YAHOO.lang.extend(OreStorage, YAHOO.lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getOreTab()];
		},
		_getOreTab : function() {
			var stored = this.result.ore_stored;
			return new YAHOO.widget.Tab({ label: "Ore", content: [
				'<div class="yui-g buildingDetailsExtra">',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li><label>Anthracite</label><span class="buildingDetailsNum">',stored.anthracite,'</span></li>',
				'			<li><label>Bauxite</label><span class="buildingDetailsNum">',stored.bauxite,'</span></li>',
				'			<li><label>Beryl</label><span class="buildingDetailsNum">',stored.beryl,'</span></li>',
				'			<li><label>Chalcopyrite</label><span class="buildingDetailsNum">',stored.chalcopyrite,'</span></li>',
				'			<li><label>Chromite</label><span class="buildingDetailsNum">',stored.chromite,'</span></li>',
				'			<li><label>Fluorite</label><span class="buildingDetailsNum">',stored.fluorite,'</span></li>',
				'			<li><label>Galena</label><span class="buildingDetailsNum">',stored.galena,'</span></li>',
				'			<li><label>Goethite</label><span class="buildingDetailsNum">',stored.goethite,'</span></li>',
				'			<li><label>Gold</label><span class="buildingDetailsNum">',stored.gold,'</span></li>',
				'			<li><label>Gypsum</label><span class="buildingDetailsNum">',stored.gypsum,'</span></li>',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li><label>Halite</label><span class="buildingDetailsNum">',stored.halite,'</span></li>',
				'			<li><label>Kerogen</label><span class="buildingDetailsNum">',stored.kerogen,'</span></li>',
				'			<li><label>Magnetite</label><span class="buildingDetailsNum">',stored.magnetite,'</span></li>',
				'			<li><label>Methane</label><span class="buildingDetailsNum">',stored.methane,'</span></li>',
				'			<li><label>Monazite</label><span class="buildingDetailsNum">',stored.monazite,'</span></li>',
				'			<li><label>Rutile</label><span class="buildingDetailsNum">',stored.rutile,'</span></li>',
				'			<li><label>Sulfur</label><span class="buildingDetailsNum">',stored.sulfur,'</span></li>',
				'			<li><label>Trona</label><span class="buildingDetailsNum">',stored.trona,'</span></li>',
				'			<li><label>Uraninite</label><span class="buildingDetailsNum">',stored.uraninite,'</span></li>',
				'			<li><label>Zircon</label><span class="buildingDetailsNum">',stored.zircon,'</span></li>',
				'		</ul>',
				'	</div>',
				'</div>'
			].join('')});
		}
		
	});
	
	YAHOO.lacuna.buildings.OreStorage = OreStorage;

})();
YAHOO.register("orestorage", YAHOO.lacuna.buildings.OreStorage, {version: "1", build: "0"}); 

}