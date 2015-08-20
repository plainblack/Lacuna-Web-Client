YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.WaterStorage == "undefined" || !YAHOO.lacuna.buildings.WaterStorage) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var WaterStorage = function(result){
        WaterStorage.superclass.constructor.call(this, result);

        this.service = Game.Services.Buildings.WaterStorage;
    };

    YAHOO.lang.extend(WaterStorage, YAHOO.lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getDumpTab()];
        },
        _getDumpTab : function() {
            this.dumpTab = new YAHOO.widget.Tab({ label: "Dump", contentEl: this.DumpGetDisplay(this.result.dump)});
            return this.dumpTab;
        },
        DumpGetDisplay : function() {
            var ul = document.createElement('ul'),
                li = document.createElement('li'),
                nLi = li.cloneNode(false);
            nLi.innerHTML = 'Convert water into waste.';
            ul.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/water.png" class="smallWater" /></span>';
            input = document.createElement("input");
            input.id = 'dumpAmount';
            input.type = "text";
            input.value = 0;
            input = nLi.appendChild(input);
            Event.on(input, "change", this.DumpValueChange, this, true);
            this.dumpAmountEl = input;
            ul.appendChild(nLi);

        var div = document.createElement("div");
            Dom.addClass(div, 'dumpTab');
            div.appendChild(ul);

            var form = document.createElement('form');
            btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "Dump";
            btn = form.appendChild(btn);
            Event.on(btn, "click", this.Dump, this, true);

            div.appendChild(form);

            var msg = document.createElement('div');
            msg.id = "dumpMessage";
            div.appendChild(msg);

            return div;
        },
        Dump : function(e) {
            var planet = Game.GetCurrentPlanet();
            var building = this.building;
            var type = "water";
            if(building) {
                var amount = this.dumpAmountEl.value*1;
                if(amount > planet.water_stored) {
                    Dom.get("dumpMessage").innerHTML = "Can only convert " + type + " you have stored.";
                    Lib.fadeOutElm("dumpMessage");
                }
                else if(amount <= 0) {
                    Dom.get("dumpMessage").innerHTML = "You must specify an amount greater than zero.";
                    Lib.fadeOutElm("dumpMessage");
                }
                else {
                    require('js/actions/menu/loader').show();
                    this.service.dump({
                        session_id:Game.GetSession(),
                        building_id:this.building.id,
                        amount:amount
                    }, {
                        success : function(o){
                            YAHOO.log(o, "info", "WaterStorage.Dump.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            if(this.dumpTab){
                                var ce = this.dumpTab.get("contentEl");
                                Event.purgeElement(ce);
                                ce.innerHTML = "";
                                ce.appendChild(this.DumpGetDisplay(o.result.dump));
                                Dom.get("dumpMessage").innerHTML = "Successfully converted " + Lib.formatNumber(amount) + " " + type + " to waste.";
                                Lib.fadeOutElm("dumpMessage");
                            }
                        },
                        scope:this
                    });
                }
            }
        }

    });

    YAHOO.lacuna.buildings.WaterStorage = WaterStorage;

})();
YAHOO.register("waterstorage", YAHOO.lacuna.buildings.WaterStorage, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
