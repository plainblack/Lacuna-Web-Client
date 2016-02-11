YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.EssentiaVein == "undefined" || !YAHOO.lacuna.buildings.EssentiaVein) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Sel = Util.Selector,
        Lib = Lacuna.Library;

    var EssentiaVein = function(result){
        EssentiaVein.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.EssentiaVein;
    };
    
    Lang.extend(EssentiaVein, Lacuna.buildings.Building, {
        getChildTabs : function() {
            if (this.result.building.drain_capable > 0) {
                return [this._getDrainTab()];
            }
            return [];
        },
        _getDrainTab : function() {
            this.drainTab = new YAHOO.widget.Tab({ label: "Drain", content: [
                '<div id="essentiaveinDrain">',
                '  <div><b>Quickly deplete the vein of its essentia at a lower efficiency.</b></div>',
                '  <div id="essentiaveinDrainForm">Drain <select id="essentiaveinDrainNumber"></select> days. <button type="button" id="essentiaveinDrain">Drain Now</button></div>',
                '</div>'
            ].join('')});

            this.drainTab.subscribe("activeChange", this.essentiaveinDrainTab, this, true);
            var btn = Sel.query("button", this.drainTab.get("contentEl"), true);
            if (btn) {
                Event.on(btn, "click", this.DrainVein, this, true);
            }

            return this.drainTab;
        },
        essentiaveinDrainTab : function() {
            var can_drain = this.result.building.drain_capable;
            if (can_drain > 0) {
                var elNumSelect = Dom.get("essentiaveinDrainNumber");
                var currentNum = elNumSelect.children.length;
                for (var i = can_drain; i < currentNum; i++) {
                    elNumSelect.removeChild(elNumSelect.lastChild);
                }
                for (var n = currentNum + 1; n <= can_drain; n++) {
                    var elOption = document.createElement('option');
                    elOption.value = n;
                    elOption.innerHTML = n * 30;
                    elNumSelect.appendChild(elOption);
                }
            }
            else {
                this.removeTab(this.drainTab);
            }
        },
        DrainVein : function () {
            var select = Dom.get("essentiaveinDrainNumber"),
                num    = select[select.selectedIndex].value*1;

            if(this.result.building.drain_capable > 0 &&
               Lang.isNumber(num) && num <= this.result.building.drain_capable) {
                require('js/actions/menu/loader').show();
                this.service.drain({session_id:Game.GetSession(),building_id:this.building.id,times:num}, {
                    success: function(o){
                        YAHOO.log(o, "info", "EssentiaVein.DrainVein.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.result = o.result;
                        this.essentiaveinDrainTab();
                    },
                    scope:this
                });
            }
        }
    });
    
    YAHOO.lacuna.buildings.EssentiaVein = EssentiaVein;

})();
YAHOO.register("EssentiaVein", YAHOO.lacuna.buildings.EssentiaVein, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
