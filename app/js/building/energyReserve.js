YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.EnergyReserve == "undefined" || !YAHOO.lacuna.buildings.EnergyReserve) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var EnergyReserve = function(result){
        EnergyReserve.superclass.constructor.call(this, result);

        this.service = Game.Services.Buildings.EnergyReserve;
    };

    YAHOO.lang.extend(EnergyReserve, YAHOO.lacuna.buildings.Building, {
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
            nLi.innerHTML = 'Convert energy into waste.';
            ul.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/energy.png" class="smallEnergy" /></span>';
            input = document.createElement("input");
            input.id = 'dumpAmount';
            input.type = "text";
            input.value = 0;
            input = nLi.appendChild(input);
            Event.on(input, "change", this.DumpValueChange, this, true);
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
            var type = "energy";
            if(building) {
                var amount = Dom.get("dumpAmount").value*1;
                if(amount > planet.energy_stored) {
                    Dom.get("dumpMessage").innerHTML = "Can only convert " + type + " you have stored.";
                    Lib.fadeOutElm("dumpMessage");
                }
                else if( amount <= 0 ) {
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
                            YAHOO.log(o, "info", "EnergyReserve.Dump.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            if(this.dumpTab){
                                var ce = this.dumpTab.get("contentEl");
                                Event.purgeElement(ce);
                                ce.innerHTML = "";
                                ce.appendChild(this.DumpGetDisplay(o.result.dump));
                                Dom.get("dumpMessage").innerHTML = "Successfully converted " + amount + " " + type + " to waste.";
                                Lib.fadeOutElm("dumpMessage");
                            }
                        },
                        scope:this
                    });
                }
            }
        }

    });

    YAHOO.lacuna.buildings.EnergyReserve = EnergyReserve;

})();
YAHOO.register("energyreserve", YAHOO.lacuna.buildings.EnergyReserve, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
