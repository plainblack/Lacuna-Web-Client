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
			return [this._getSplitTab(), this._getMakeTab()];
		},
		_getSplitTab : function() {
			this.splitTab = new YAHOO.widget.Tab({ label: "Split Plans", content: [
                '<div id="forgeSplitReadyContainer">',
                '  Ready to split a plan',
                '  <button id="forgeSplitButton">Split</button>',
                '</div>',
                '<div id="forgeSplitWorkingContainer">',
                '  Forge is busy splitting a plan',
                '</div>',
			].join('')});
			
			return this.splitTab;
		},
        _getMakeTab : function() {
            this.makeTab = new YAHOO.widget.Tab({ label: "Combine Plans", content: [
                '<div id="TheDillonForge_make">',
                '  Combine level 1 plans into higher level plans.',
                '</div>'
            ].join('')});
            return this.makeTab;
   	    },
        checkIfWorking : function() {
            if(this.result.tasks.can && this.result.tasks.seconds_remaining) {
                Dom.setStyle("forgeSplitReadyContainer", "display", "none");
                Dom.setStyle("forgeSplitWorkingContainer", "display", "");
            }
            else {
                Dom.setStyle("forgeSplitReadyContainer", "display", "");
                Dom.setStyle("forgeSplitWorkingContainer", "display", "none");
            }
        }

	});
	
	YAHOO.lacuna.buildings.TheDillonForge = TheDillonForge;

})();
YAHOO.register("TheDillonForge", YAHOO.lacuna.buildings.TheDillonForge, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
