YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.TheDillonForge == "undefined" || !YAHOO.lacuna.buildings.TheDillonForge) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var TheDillonForge = function(result){
		TheDillonForge.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.TheDillonForge;
	};
	
	Lang.extend(TheDillonForge, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getTab()];
		},
		_getTab : function() {
			this.tab = new YAHOO.widget.Tab({ label: "Operations", content: [
				'<div id="TheDillonForge" style="display:none;">',
				'	Time left on current operations: <span id="TheDillonForge"></span>',
				'</div>',
				'<div id="TheDillonForgeMessage" style="margin-top:5px;"></div>',
				'<div id="TheDillonForgeDisplay" style="display:none;margin:5px 0;">',
				'	<button type="button" id="Operate">Open The Dillon Forge</button>',
				'</div>'
			].join('')});
			
			return this.tab;
		}
	});
	
	YAHOO.lacuna.buildings.TheDillonForge = TheDillonForge;

})();
YAHOO.register("TheDillonForge", YAHOO.lacuna.buildings.TheDillonForge, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
