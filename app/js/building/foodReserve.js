YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.FoodReserve == "undefined" || !YAHOO.lacuna.buildings.FoodReserve) {
    
(function(){
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var FoodReserve = function(result){
        FoodReserve.superclass.constructor.call(this, result);

        this.service = Game.Services.Buildings.FoodReserve;
    };

    YAHOO.lang.extend(FoodReserve, YAHOO.lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getFoodTab(),this._getDumpTab()];
        },
        _getFoodTab : function() {
            var stored = this.result.food_stored;
            return new YAHOO.widget.Tab({ label: "Food", content: [
                '<div class="yui-g buildingDetailsExtra">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><label>Algae</label><span class="buildingDetailsNum">',stored.algae,'</span></li>',
                '            <li><label>Apple</label><span class="buildingDetailsNum">',stored.apple,'</span></li>',
                '            <li><label>Bean</label><span class="buildingDetailsNum">',stored.bean,'</span></li>',
                '            <li><label>Beetle</label><span class="buildingDetailsNum">',stored.beetle,'</span></li>',
                '            <li><label>Bread</label><span class="buildingDetailsNum">',stored.bread,'</span></li>',
                '            <li><label>Burger</label><span class="buildingDetailsNum">',stored.burger,'</span></li>',
                '            <li><label>Cheese</label><span class="buildingDetailsNum">',stored.cheese,'</span></li>',
                '            <li><label>Chip</label><span class="buildingDetailsNum">',stored.chip,'</span></li>',
                '            <li><label>Cider</label><span class="buildingDetailsNum">',stored.cider,'</span></li>',
                '            <li><label>Corn</label><span class="buildingDetailsNum">',stored.corn,'</span></li>',
                '            <li><label>Fungus</label><span class="buildingDetailsNum">',stored.fungus,'</span></li>',
                '        </ul>',
                '    </div>',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><label>Lapis</label><span class="buildingDetailsNum">',stored.lapis,'</span></li>',
                '            <li><label>Meal</label><span class="buildingDetailsNum">',stored.meal,'</span></li>',
                '            <li><label>Milk</label><span class="buildingDetailsNum">',stored.milk,'</span></li>',
                '            <li><label>Pancake</label><span class="buildingDetailsNum">',stored.pancake,'</span></li>',
                '            <li><label>Pie</label><span class="buildingDetailsNum">',stored.pie,'</span></li>',
                '            <li><label>Potato</label><span class="buildingDetailsNum">',stored.potato,'</span></li>',
                '            <li><label>Root</label><span class="buildingDetailsNum">',stored.root,'</span></li>',
                '            <li><label>Shake</label><span class="buildingDetailsNum">',stored.shake,'</span></li>',
                '            <li><label>Soup</label><span class="buildingDetailsNum">',stored.soup,'</span></li>',
                '            <li><label>Syrup</label><span class="buildingDetailsNum">',stored.syrup,'</span></li>',
                '            <li><label>Wheat</label><span class="buildingDetailsNum">',stored.wheat,'</span></li>',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
        },
        _getDumpTab : function() {
            this.resources = this.result.food_stored;
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
                nLi.innerHTML = 'Convert food into waste.';
                ul.appendChild(nLi);

                nLi = li.cloneNode(false);
                nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/food.png" class="smallFood" /></span>';

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
                    div.innerHTML = "No food to dump.";
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
                div.innerHTML = "No food to dump.";
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
                            YAHOO.log(o, "info", "FoodReserve.Dump.success");
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
    
    YAHOO.lacuna.buildings.FoodReserve = FoodReserve;

})();
YAHOO.register("foodreserve", YAHOO.lacuna.buildings.FoodReserve, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
