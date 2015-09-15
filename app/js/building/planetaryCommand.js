YAHOO.namespace("lacuna.buildings");

var $ = require('js/hacks/jquery');

var MapActions = require('js/actions/menu/map');

var EmpireRPCStore = require('js/stores/rpc/empire');

if (typeof YAHOO.lacuna.buildings.PlanetaryCommand == "undefined" || !YAHOO.lacuna.buildings.PlanetaryCommand) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var PlanetaryCommand = function(result){
        PlanetaryCommand.superclass.constructor.call(this, result);

        this.service = Game.Services.Buildings.PlanetaryCommand;
    };

    Lang.extend(PlanetaryCommand, Lacuna.buildings.Building, {
        getTabs : function() {
            var tabs = PlanetaryCommand.superclass.getTabs.call(this);
            tabs.splice(1, 0, this._getPlanetTab(), this._getAbandonTab(), this._getRenameTab());
            return tabs;
        },
        getChildTabs : function() {
            return [this._getPlanTab(), this._getResourcesTab(), this._getNotesTab()];
        },
        _getPlanetTab : function() {
            var planet = this.result.planet;
            var details = function(type,imgclass) {
                var Type = Lib.capitalizeFirstLetter(type);
                var stored   = planet[type+"_stored"] || planet[type];
                var capacity = planet[type+"_capacity"];
                var perhour  = planet[type+"_hour"];
                if (!imgclass) {
                    imgclass = Type;
                }
                return [
                        '<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/',type,'.png" title="',Type,'" class="small',imgclass,'" /></span>',
                        '    <span class="pcStored" title="',Lib.formatNumber(stored),'">',Lib.convertNumDisplay(stored),'</span>',
                        capacity ? [
                        '    <span class="pcSlash">/</span>',
                        '    <span class="pcCapacity" title="',Lib.formatNumber(capacity),'">',Lib.convertNumDisplay(capacity),'</span>'].join('') :
                        [
                         '<span class="pcSlash">&nbsp;</span><span class="pcCapacity">&nbsp;</span>'
                        ].join(''),
                        '  @ <span class="pcPerHour" title="',Lib.formatNumber(perhour),'">',Lib.convertNumDisplay(perhour),'/hr</span></li>',
                       ].join('');
            };
            var tab = new YAHOO.widget.Tab({ label: "Planet", content: [
                    '<div class="yui-g buildingDetailsExtra">',
                    '    <div class="yui-u first">',
                    '        <ul>',
                    details('food'),
                    details('ore'),
                    details('water'),
                    details('energy'),
                    details('waste'),
                    details('happiness','Happy'),
                    '        </ul>',
                    '    </div>',
                    '    <div class="yui-u first">',
                    '        <ul class="buildingDetailsPC">',
                    '            <li><label>Buildings:</label>',planet.building_count,'</li>',
                    '            <li><label>Planet Size:</label>',planet.size,'</li>',
                    '            <li><label>Plots Available:</label>',(planet.plots_available || 0)*1,'</li>',
                    '            <li><label>Population:</label>',Lib.formatNumber(planet.population),'</li>',
                    '            <li title="',Lib.formatNumber(this.result.next_colony_cost),'"><label>Next Colony Cost:</label>',Lib.convertNumDisplay(this.result.next_colony_cost),'<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span></li>',
                    this.result.next_station_cost ? ['<li title="',Lib.formatNumber(this.result.next_station_cost),'"><label>Next Station Cost:</label>',Lib.convertNumDisplay(this.result.next_station_cost),'<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span></li>'].join('') : '',
                    '            <li><label>Location:</label>',planet.x,'x : ',planet.y,'y</li>',
                    '            <li><label>Zone:</label>',planet.zone,'</li>',
                    '            <li><label>Star:</label>',planet.star_name,' (Star ID: ',planet.star_id,')</li>',
                    '            <li><label>Orbit:</label>',planet.orbit,'</li>',
                    '            <li><label>Body ID:</label>',planet.id,'</li>',
                    '        </ul>',
                    '    </div>',
                    '</div>'
                ].join('')});

            this.planetTab = tab;

            return tab;
        },
        _getAbandonTab : function() {
            this.abandonTab = new YAHOO.widget.Tab({ label: "Abandon", content: ['<div>',
            '    <div id="commandMessage" class="alert">This colony and everything on it will disappear if you abandon it.</div>',
            '    <button type="button" id="commandAbandon">Abandon Colony</button>',
            '</div>'].join('')});

            Event.on("commandAbandon", "click", this.Abandon, this, true);

            return this.abandonTab;
        },
        _getRenameTab : function() {
            this.renameTab = new YAHOO.widget.Tab({ label: "Rename", content: ['<div><ul>',
            '    <li><label>Current Planet Name: </label><span id="commandPlanetCurrentName">',Game.GetCurrentPlanet().name,'</span></li>',
            '    <li><label>New Planet Name: </label><input type="text" id="commandPlanetNewName" maxlength="100" /></li>',
            '    <li class="alert" id="commandPlanetRenameMessage"></li>',
            '    <li><button type="button" id="commandRename">Rename</button></li>',
            '</ul></div>'].join('')});

            Event.on("commandRename", "click", this.Rename, this, true);

            return this.renameTab;
        },
        _getPlanTab : function() {
            this.planTab = new YAHOO.widget.Tab({ label: "Plans", content: [
                '<ul class="plan planHeader clearafter"><li class="planQuan">Quantity</li><li class="planName">Name</li><li class="planLevel">Level</li><li class="planExtra">Extra Level</li></ul>',
                '<div>',
                '    <div id="planDetails">',
                '    </div>',
                '</div>'
            ].join('')});
            this.planTab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    if(!this.plans) {
                        require('js/actions/menu/loader').show();
                        this.service.view_plans({session_id:Game.GetSession(),building_id:this.building.id}, {
                            success : function(o){
                                require('js/actions/menu/loader').hide();
                                this.rpcSuccess(o);
                                this.plans = o.result.plans;

                                this.PlanPopulate();
                            },
                            scope:this
                        });
                    }
                    else {
                        this.PlanPopulate();
                    }
                }
            }, this, true);

            return this.planTab;
        },
        _getResourcesTab : function() {

            var food_items = '',
                foods      = Lib.ResourceTypes.food;

            for(x=0; x < foods.length; x++) {
                food = foods[x];

                food_items += [
                    '<li><label>',
                    food.titleCaps(),
                    '</label><span class="pcStored" title="', Lib.formatNumber(this.result.food[food+"_stored"]),'">',
                    Lib.convertNumDisplay(this.result.food[food+"_stored"]),
                    '</span> @ <span class="pcPerHour" title="',Lib.formatNumber(this.result.food[food+"_hour"]),'">',
                    Lib.convertNumDisplay(this.result.food[food+"_hour"]),
                    '</span>/hr</li>',
                ].join('');
            }

            var ore_items = '',
                ores      = Lib.ResourceTypes.ore;

            for(x=0; x < ores.length; x++) {
                ore = ores[x];

                ore_items += [
                    '<li><label>',
                    ore.titleCaps(),
                    '</label><span class="pcStored" title="', Lib.formatNumber(this.result.ore[ore+"_stored"]),'">',
                    Lib.convertNumDisplay(this.result.ore[ore+"_stored"]),
                    '</span> @ <span class="pcPerHour" title="',Lib.formatNumber(this.result.ore[ore+"_hour"]),'">',
                    Lib.convertNumDisplay(this.result.ore[ore+"_hour"]),
                    '</span>/hr</li>',
                ].join('');
            }
            ore_items += [
                    '<li><label>Water</label><span class="pcStored" title="', Lib.formatNumber(this.result.planet.water_stored),'">',
                    Lib.convertNumDisplay(this.result.planet.water_stored),
                    '</span> @ <span class="pcPerHour" title="',Lib.formatNumber(this.result.planet.water_hour),'">',
                    Lib.convertNumDisplay(this.result.planet.water_hour),
                    '</span>/hr</li>',
                ].join('');
            ore_items += [
                    '<li><label>Energy</label><span class="pcStored" title="', Lib.formatNumber(this.result.planet.energy_stored),'">',
                    Lib.convertNumDisplay(this.result.planet.energy_stored),
                    '</span> @ <span class="pcPerHour" title="',Lib.formatNumber(this.result.planet.energy_hour),'">',
                    Lib.convertNumDisplay(this.result.planet.energy_hour),
                    '</span>/hr</li>',
                ].join('');

            this.resourcesTab = new YAHOO.widget.Tab({ label: "Resources", content: [
                    '<div class="yui-g buildingDetailsExtra">',
                    '    <div class="yui-u first">',
                    '        <ul class="buildingDetailsPC">',
                    food_items,
                    '        </ul>',
                    '    </div>',
                    '    <div class="yui-u first">',
                    '        <ul class="buildingDetailsPC">',
                    ore_items,
                    '        </ul>',
                    '    </div>',
                    '</div>'
                ].join('')});

            return this.resourcesTab;
        },
        _getNotesTab : function() {
            var notes = Game.GetCurrentPlanet().notes;
            this.notesTab = new YAHOO.widget.Tab({ label: "Notes", content: [
            '<div id="pccNotes">',
            '    <textarea id="pccNotesText" title="Write down anything you would like to store with this body.">', $('<div/>').text(notes ? notes : '').html(), '</textarea>',
            '    <button type="button" id="saveColonyNotes">Save</button>',
            '</div>'
            ].join('')});

            Event.on("saveColonyNotes","click",this.SaveColonyNotes, this, true);

            return this.notesTab;
        },
        Abandon : function() {
            var cp = Game.GetCurrentPlanet();
            if(confirm(['Are you sure you want to abandon ',cp.name,'?'].join(''))) {
                require('js/actions/menu/loader').show();
                Game.Services.Body.abandon({
                    session_id:Game.GetSession(""),
                    body_id:cp.id
                }, {
                success : function(o){
                    YAHOO.log(o, "info", "PlanetaryCommand.abandon.success");
                    this.rpcSuccess(o);

                    delete Game.EmpireData.planets[cp.id]; // Remove the abandoned planet

                    // Clean up the star map
                    if(Lacuna.MapStar._map) {
                        if(cp.x && cp.y) {
                            if(Lacuna.MapStar._map.tileCache[cp.x] && Lacuna.MapStar._map.tileCache[cp.x][cp.y]) {
                                delete Lacuna.MapStar._map.tileCache[cp.x][cp.y]; // Remove the planet from the cache
                            }
                            var tileId = ['tile',cp.x,cp.y,Lacuna.MapStar._map.zoom].join('_');
                            var tile = Lacuna.MapStar._map.tileLayer.tileCache[tileId];
                            if(tile) {
                                if(tile.domElement) {
                                    var domEl = tile.domElement; // get the element
                                    var childEl = domEl.childNodes[1]; // find the alignment child
                                    if(childEl) {
                                        domEl.removeChild(childEl); // remove it
                                    }
                                }
                                delete tile.data; // Remove the data
                                delete tile.alignHolder; // Remove the alignment display
                                tile.blank = true; // Force the planet to redraw
                            }
                        }
                    }

                    this.fireEvent("onHide");

                    // Go to home planet.
                    var home = EmpireRPCStore.getData().home_planet_id;
                    MapActions.changePlanet(home);

                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
            }
        },
        Rename : function() {
            var newName = Dom.get("commandPlanetNewName").value,
                cp = Game.GetCurrentPlanet(),
                planetId = cp.id;
            Game.Services.Body.rename({
                    session_id: Game.GetSession(""),
                    body_id:planetId,
                    name:newName
                },{
                    success : function(o){
                        YAHOO.log(o, "info", "PlanetaryCommand.Rename.success");
                        if(o.result && planetId) {

                            Dom.get("commandPlanetRenameMessage").innerHTML = ["Successfully renamed your planet from ", Game.EmpireData.planets[planetId].name," to ", newName, '.'].join('');
                            Lib.fadeOutElm("commandPlanetRenameMessage");
                            Dom.get("commandPlanetNewName").value = "";
                            Dom.get("commandPlanetCurrentName").innerHTML = newName;
                            Game.EmpireData.planets[planetId].name = newName;

                            if(Lacuna.MapStar._map) {
                                Lacuna.MapStar._map.tileCache[cp.x][cp.y].name = newName; // Change the name in the cache
                                var tileId = ['tile',cp.x,cp.y,Lacuna.MapStar._map.zoom].join('_');
                                var tile = Lacuna.MapStar._map.tileLayer.tileCache[tileId];
                                if(tile) {
                                    tile.blank = true; // Force the planet to redraw
                                }
                            }
                        }
                    },
                    failure : function(o){
                        Dom.get("commandPlanetRenameMessage").innerHTML = o.error.message;
                        Lib.fadeOutElm("commandPlanetRenameMessage");
                        return true;
                    },
                    scope:this
                }
            );
        },
        SaveColonyNotes : function(){
            var cp = Game.GetCurrentPlanet();
            var notes = Dom.get("pccNotesText").value;
            require('js/actions/menu/loader').show();
            Game.Services.Body.set_colony_notes({
                session_id: Game.GetSession(""),
                body_id: cp.id,
                options: { notes: notes }
            }, {
                success : function(o) {
                    require('js/actions/menu/loader').hide();
                }
            });
        },
        PlanPopulate : function(){
            var div = Dom.get("planDetails");
            if(div) {
                var divParent = div.parentNode,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");

                div = divParent.removeChild(div);

                if(this.plans.length > 0) {
                    div.innerHTML = "";

                    for(var i=0; i<this.plans.length; i++) {
                        var plan = this.plans[i],
                            nUl = ul.cloneNode(false),
                            nLi = li.cloneNode(false);

                        Dom.addClass(nUl, "plan");
                        Dom.addClass(nUl, "clearafter");

                        Dom.addClass(nLi,"planQuan");
                        nLi.innerHTML = Lib.formatNumber(plan.quantity);
                        nUl.appendChild(nLi);

                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"planName");
                        nLi.innerHTML = plan.name;
                        nUl.appendChild(nLi);

                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"planLevel");
                        nLi.innerHTML = plan.level;
                        nUl.appendChild(nLi);

                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"planExtra");
                        nLi.innerHTML = plan.extra_build_level;
                        nUl.appendChild(nLi);

                        div.appendChild(nUl);
                    }
                }
                else {
                    div.innerHTML = "No Plans currently available on this planet.";
                }

                //add child back in
                divParent.appendChild(div);

                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 170;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(divParent,"height",Ht + "px");
                    Dom.setStyle(divParent,"overflow-y","auto");
                },10);
            }
        }
    });

    Lacuna.buildings.PlanetaryCommand = PlanetaryCommand;

})();
YAHOO.register("planetarycommand", YAHOO.lacuna.buildings.PlanetaryCommand, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
