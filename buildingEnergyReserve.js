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

            this.dumpMessageEl = div.appendChild(document.createElement('div'));

            return div;
        },
        Dump : function(e) {
            var planet = Game.GetCurrentPlanet();
            var building = this.building;
            if(building) {
                var energy = this.dumpAmountEl.value*1;
                if(energy > planet.energy_stored) {
                    this.dumpMessageEl.innerHTML = "Can only convert ore you have stored.";
                }
                else {
                    Lacuna.Pulser.Show();
                    this.service.dump({
                        session_id:Game.GetSession(),
                        building_id:this.building.id,
                        amount:energy,
                    }, {
                        success : function(o){
                            YAHOO.log(o, "info", "EnergyReserve.Dump.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            if(this.dumpTab){
                                var ce = this.dumpTab.get("contentEl");
                                Event.purgeElement(ce);
                                ce.innerHTML = "";
								ce.appendChild(this.DumpGetDisplay(o.result.dump));
                                this.dumpMessageEl.innerHTML = "Successfully converted " + energy + " energy to waste.";
                            }
                        },
                        failure : function(o){
                            YAHOO.log(o, "error", "EnergyReserve.Dump.failure");
                            Lacuna.Pulser.Hide();
                            this.rpcFailure(o);
                        },
                        timeout:Game.Timeout,
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
