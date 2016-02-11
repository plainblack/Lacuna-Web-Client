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
            var details = function(type) {
                return [
                        '<li title="',Lib.formatNumber(stored[type]),'"><label>',
                        Lib.capitalizeFirstLetter(type),
                        '</label><span class="buildingDetailsNum">',Lib.convertNumDisplay(stored[type],1),'</span></li>'
                       ].join('');
            };
            return new YAHOO.widget.Tab({ label: "Ore", content: [
                '<div class="yui-g buildingDetailsExtra">',
                '    <div class="yui-u first">',
                '        <ul>',
                details('anthracite'),
                details('bauxite'),
                details('beryl'),
                details('chalcopyrite'),
                details('chromite'),
                details('fluorite'),
                details('galena'),
                details('goethite'),
                details('gold'),
                details('gypsum'),
                '        </ul>',
                '    </div>',
                '    <div class="yui-u first">',
                '        <ul>',
                details('halite'),
                details('kerogen'),
                details('magnetite'),
                details('methane'),
                details('monazite'),
                details('rutile'),
                details('sulfur'),
                details('trona'),
                details('uraninite'),
                details('zircon'),
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
                    require('js/actions/menu/loader').show();
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
                            require('js/actions/menu/loader').hide();
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
