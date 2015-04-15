YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.OreStorage == "undefined" || !YAHOO.lacuna.buildings.OreStorage) {
    
(function(){
    var    Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var OreStorage = function(result){
        OreStorage.superclass.constructor.call(this, result);

        this.service = Game.Services.Buildings.OreStorage;
    };
    
    YAHOO.lang.extend(OreStorage, YAHOO.lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getOreTab(),this._getDumpTab()];
        },
        _getOreTab : function() {
            var stored = this.result.ore_stored;
            return new YAHOO.widget.Tab({ label: "Ore", content: [
                '<div class="yui-g buildingDetailsExtra">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><label>Anthracite</label><span class="buildingDetailsNum">',stored.anthracite,'</span></li>',
                '            <li><label>Bauxite</label><span class="buildingDetailsNum">',stored.bauxite,'</span></li>',
                '            <li><label>Beryl</label><span class="buildingDetailsNum">',stored.beryl,'</span></li>',
                '            <li><label>Chalcopyrite</label><span class="buildingDetailsNum">',stored.chalcopyrite,'</span></li>',
                '            <li><label>Chromite</label><span class="buildingDetailsNum">',stored.chromite,'</span></li>',
                '            <li><label>Fluorite</label><span class="buildingDetailsNum">',stored.fluorite,'</span></li>',
                '            <li><label>Galena</label><span class="buildingDetailsNum">',stored.galena,'</span></li>',
                '            <li><label>Goethite</label><span class="buildingDetailsNum">',stored.goethite,'</span></li>',
                '            <li><label>Gold</label><span class="buildingDetailsNum">',stored.gold,'</span></li>',
                '            <li><label>Gypsum</label><span class="buildingDetailsNum">',stored.gypsum,'</span></li>',
                '        </ul>',
                '    </div>',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><label>Halite</label><span class="buildingDetailsNum">',stored.halite,'</span></li>',
                '            <li><label>Kerogen</label><span class="buildingDetailsNum">',stored.kerogen,'</span></li>',
                '            <li><label>Magnetite</label><span class="buildingDetailsNum">',stored.magnetite,'</span></li>',
                '            <li><label>Methane</label><span class="buildingDetailsNum">',stored.methane,'</span></li>',
                '            <li><label>Monazite</label><span class="buildingDetailsNum">',stored.monazite,'</span></li>',
                '            <li><label>Rutile</label><span class="buildingDetailsNum">',stored.rutile,'</span></li>',
                '            <li><label>Sulfur</label><span class="buildingDetailsNum">',stored.sulfur,'</span></li>',
                '            <li><label>Trona</label><span class="buildingDetailsNum">',stored.trona,'</span></li>',
                '            <li><label>Uraninite</label><span class="buildingDetailsNum">',stored.uraninite,'</span></li>',
                '            <li><label>Zircon</label><span class="buildingDetailsNum">',stored.zircon,'</span></li>',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
        },
        _getDumpTab : function() {
            this.resources = this.result.ore_stored;
            this.dumpTab = new YAHOO.widget.Tab({ label: "Dump", contentEl: this.DumpGetDisplay(this.result.dump)});
            this.dumpTab.subscribe("activeChange", this.DumpGetDisplay, this, true);
            return this.dumpTab;
        },
        DumpGetDisplay : function() {
            var div = document.createElement("div"),
                resources = [],
                rKey;

            for(rKey in this.resources) {
                resources.push(rKey);
            }
            resources = resources.sort();

            if( resources.length > 0 ) {
                var ul = document.createElement('ul'),
                    li = document.createElement('li'),
                    nLi = li.cloneNode(false);
                nLi.innerHTML = 'Convert ore into waste.';
                ul.appendChild(nLi);

                nLi = li.cloneNode(false);
                nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/ore.png" class="smallOre" /></span>';

                var sel = document.createElement("select"),
                    opt = document.createElement("option");
                for(var i=0; i<resources.length; i++) {
                    rKey = resources[i];
                    if(this.resources.hasOwnProperty(rKey) && this.resources[rKey] > 0) {
                        var nOpt = opt.cloneNode(false);
                        nOpt.value = rKey;
                        nOpt.innerHTML = [rKey, ' (', this.resources[rKey], ')'].join('');
                        sel.appendChild(nOpt);
                    }
                }
                if( sel.options.length == 0 ) {
                    div.innerHTML = "No ore to dump.";
                    return div;
                }
                sel.id = "type";
                nLi.appendChild(sel);

                input = document.createElement("input");
                input.id = 'dumpAmount';
                input.type = "text";
                input.value = 0;
                input = nLi.appendChild(input);
                ul.appendChild(nLi);

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

            }
            else {
                div.innerHTML = "No ore to dump.";
            }

            return div;
        },
        Dump : function(e) {
            var building = this.building;
            if(building) {
                var sel = Dom.get("type");
                var type = sel[sel.selectedIndex].value;
                var amount = Dom.get("dumpAmount").value*1;
                if(amount > this.resources[type]) {
                    Dom.get("dumpMessage").innerHTML = "Can only convert " + type + " you have stored.";
                    Lib.fadeOutElm("dumpMessage");
                }
                else if(amount <= 0) {
                    Dom.get("dumpMessage").innerHTML = "You must specify an amount greater than zero.";
                    Lib.fadeOutElm("dumpMessage");
                }
                else {
                    Lacuna.Pulser.Show();
                    this.service.dump({
                        session_id:Game.GetSession(),
                        building_id:this.building.id,
                        type:type,
                        amount:amount
                    }, {
                        success : function(o){
                            YAHOO.log(o, "info", "OreStorage.Dump.success");
                            this.rpcSuccess(o);
                            
                            if(this.dumpTab){
                                var ce = this.dumpTab.get("contentEl");
                                Event.purgeElement(ce);
                                ce.innerHTML = "";
                                this.resources[type] -= amount;
                                ce.appendChild(this.DumpGetDisplay(o.result.dump));
                                Dom.get("dumpMessage").innerHTML = "Successfully converted " + amount + " " + type + " to waste.";
                                Lib.fadeOutElm("dumpMessage");
                            }
                            Lacuna.Pulser.Hide();
                        },
                        scope:this
                    });
                }
            }
        }
    });
    
    YAHOO.lacuna.buildings.OreStorage = OreStorage;

})();
YAHOO.register("orestorage", YAHOO.lacuna.buildings.OreStorage, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
