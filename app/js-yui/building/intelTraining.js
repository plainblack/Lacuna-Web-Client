YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.IntelTraining == "undefined" || !YAHOO.lacuna.buildings.IntelTraining) {
    
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

    var IntelTraining = function(result){
        IntelTraining.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.IntelTraining;
    };
    
    Lang.extend(IntelTraining, Lacuna.buildings.Building, {
        destroy : function() {
            IntelTraining.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getTrainTab()];
        },
        _getTrainTab : function() {
            var spies = this.result.spies;
            this.trainTab = new YAHOO.widget.Tab({ label: "Train Spies", content: [
                '<div class="yui-g">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><span style="font-weight:bold;">Spies Training : </span> <span id="spiesCurrent">',spies.in_training,'</span></li>',
                '            <li><span style="font-weight:bold;">Points per hour : </span> <span id="pointsper">',spies.points_per,'</span></li>',
                '            <li><span style="font-weight:bold;">Max Points : </span> <span id="pointsper">',spies.max_points,'</span></li>',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
            
            return this.trainTab;
        }
        
    });
    
    YAHOO.lacuna.buildings.IntelTraining = IntelTraining;

})();
YAHOO.register("IntelTraining", YAHOO.lacuna.buildings.IntelTraining, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
