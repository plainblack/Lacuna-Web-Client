YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.MiningMinistry == "undefined" || !YAHOO.lacuna.buildings.MiningMinistry) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var MiningMinistry = function(result){
        MiningMinistry.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Mining;
    };
    
    Lang.extend(MiningMinistry, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getPlatformTab(), this._getShipsTab(), this._getAbandonAllPlatformsTab() ];
        },
        _getPlatformTab : function() {
            this.platformTab = new YAHOO.widget.Tab({ label: "Platforms", content: [
                '<div id="platformShippingInfo"></div>',
                '<div class="platformContainer">',
                '    <div id="platformDetails">',
                '    </div>',
                '</div>'
            ].join('')});
            this.platformTab.subscribe("activeChange", this.viewPlatforms, this, true);
                    
            return this.platformTab;
        },
        _getShipsTab : function() {
            this.shipsTab = new YAHOO.widget.Tab({ label: "Ships", content: [
                '<div class="shipsContainer">',
                '    <ul class="shipHeader shipInfo clearafter">',
                '        <li class="shipName">Name</li>',
                '        <li class="shipTask">Task</li>',
                '        <li class="shipSpeed">Speed</li>',
                '        <li class="shipHold">Hold</li>',
                '        <li class="shipAction"></li>',
                '    </ul>',
                '    <div><div id="shipsDetails"></div></div>',
                '</div>'
            ].join('')});
            this.shipsTab.subscribe("activeChange", this.viewShips, this, true);
                    
            return this.shipsTab;
        },
        _getAbandonAllPlatformsTab : function() {
            this.probesTab = new YAHOO.widget.Tab({ label: "Abandon All Platforms", content: [
                    '<div>',
                    '    <button type="button" id="miningMinistryBigRedButton">Abandon All Platforms!</button>',
                    '</div>'
                ].join('')});
            
            Event.on("miningMinistryBigRedButton", "click", this.AbandonAllPlatforms, this, true);
            
            return this.probesTab;
        },
        
        viewPlatforms : function(e) {
            if(e.newValue) {
                if(!this.platforms) {
                    require('js/actions/menu/loader').show();
                    this.service.view_platforms({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            YAHOO.log(o, "info", "MiningMinistry.view_platforms.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.platforms = { 
                                max_platforms:o.result.max_platforms,
                                platforms:o.result.platforms
                            };
                            
                            this.MiningMinistryPlatforms();
                        },
                        scope:this
                    });
                }
                else {
                    this.MiningMinistryPlatforms();
                }
            }
        },
        viewShips : function(e) {
            if(e.newValue) {
                if(!this.ships) {
                    this.MiningMinistryShipsView();
                }
                else {
                    this.MiningMinistryShipsPopulate();
                }
            }
        },
        
        CapacityDescription : function(capacity) {
            var output = ['Current production to shipping metric is ', capacity, '. '];
            if(capacity == -1) {
                output.push('You have no ships servicing your platforms.');
            }
            else if(capacity == 0) {
                output.push('You are producing an insignificant amount of ore. Add more platforms or upgrade your Mining Ministry.');
            }
            else if(capacity > 100) {
                output.push('You are producing more than your ships can handle. Add more ship to bring the value closer to 100.');
            }
            else if(capacity < 100) {
                output.push('Your ships have more capacity than the platforms are producing. You may remove ships or add platforms to get closer to 100.');
            }
            else if(capacity == 100) {
                output.push('Your shipping capacity and production values are exactly in sync.');
            }
            return output.join('');
        },
        platformClick : function(){
            Game.StarJump(this);
        },
        MiningMinistryPlatforms : function() {
            var platforms = this.platforms.platforms,
                details = Dom.get("platformDetails");
                
            if(details) {
                var ul = document.createElement("ul"),
                    li = document.createElement("li"),
                    info = Dom.get("platformShippingInfo");
                    
                if(platforms.length > 0) {
                    info.innerHTML = ['Total of ', platforms.length, ' platforms deployed.  This ministry can control a maximum of ', this.platforms.max_platforms, 
                        ' platforms. ', this.CapacityDescription(platforms[0].shipping_capacity)
                    ].join('');
                }
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                
                var ores = Lib.ResourceTypes.ore;
                var totals = [];
                for (var i in ores) totals[i] = 0;
                var grand_total = 0;

                if (platforms.length > 0) {
                    for(var i=0; i<platforms.length; i++) {
                        var obj = platforms[i],
                            nUl = ul.cloneNode(false),
                            nLi = li.cloneNode(false);
                            
                        nUl.Platform = obj;
                        Dom.addClass(nUl, "platformInfo");
                        Dom.addClass(nUl, "clearafter");

                        Dom.addClass(nLi,"platformLocation");
                        nLi.innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',obj.asteroid.image,'.png" />',obj.asteroid.name].join('');
                        Event.on(nLi, "click", this.platformClick, obj, true);
                        nUl.appendChild(nLi);
                        
                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"platformAbandon");
                        var bbtn = document.createElement("button");
                        bbtn.setAttribute("type", "button");
                        bbtn.innerHTML = "Abandon";
                        bbtn = nLi.appendChild(bbtn);
                        nUl.appendChild(nLi);
                        
                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"platformOre");
                        var outOre = ['<ul><li><label>Ore Per Hour:</label></li>'];
                        var total = 0;
                        for (var ore_i in ores) {
                            var ore = ores[ore_i];
                            if(obj[ore + '_hour'] > 0) {
                                outOre.push('<li><label>' + ore.replace(/^\w/, function(c){ return c.toUpperCase() }) + ':</label> ');
                                outOre.push(obj[ore+'_hour']);
                                outOre.push('</li>');
                                totals[ore_i] += parseInt(obj[ore+'_hour']);
                                total += parseInt(obj[ore+'_hour']);
                            }
                        }
                        if(total > 0) {
                            outOre.splice(1, 0, '<li><label>Total:</label> ');
                            outOre.splice(2, 0, parseInt(total));
                            outOre.splice(3, 0, '</li>');
                            grand_total += total;
                        }
                        outOre.push('</ul>');
                        nLi.innerHTML = outOre.join('');
                        nUl.appendChild(nLi);

                        details.appendChild(nUl);
                        
                        Event.on(bbtn, "click", this.MiningMinistryPlatformAbandon, {Self:this,Platform:obj,Line:nUl}, true);
                    }

                    var nUl = ul.cloneNode(false), nLi = li.cloneNode(false);
                    Dom.addClass(nUl, "platformInfo");
                    Dom.addClass(nUl, "clearafter");
                    
                    Dom.addClass(nLi,"platformLocation");
                    Dom.setStyle(nLi, 'cursor', 'auto');
                    nLi.innerHTML = 'Total';
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"platformOre");
                    var outOre = ['<ul><li><label>Ore Per Hour:</label></li>'];
                    outOre.push('<li><label>Grand Total:</label> ');
                    outOre.push(parseInt(grand_total));
                    outOre.push('</li>');
                    for (var ore_i in ores) {
                        var ore = ores[ore_i];
                        if(totals[ore_i] > 0) {
                            outOre.push('<li><label>' + ore.replace(/^\w/, function(c){ return c.toUpperCase() }) + ':</label> ');
                            outOre.push(totals[ore_i]);
                            outOre.push('</li>');
                        }
                    }
                    outOre.push('</ul>');
                    nLi.innerHTML = outOre.join('');
                    nUl.appendChild(nLi);
                    details.insertBefore(nUl, details.firstChild);
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 210;
                    if(Ht > 280) { Ht = 280; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        MiningMinistryPlatformAbandon : function() {
            if(confirm(["Are you sure you want to Abandon the mining platform at  ",this.Platform.asteroid.name,"?"].join(''))) {
                require('js/actions/menu/loader').show();
                
                this.Self.service.abandon_platform({
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    platform_id:this.Platform.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "MiningMinistry.MiningMinistryPlatformAbandon.success");
                        require('js/actions/menu/loader').hide();
                        this.Self.rpcSuccess(o);
                        var platforms = this.Self.platforms.platforms;
                        for(var i=0; i<platforms.length; i++) {
                            if(platforms[i].id == this.Platform.id) {
                                platforms.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                    },
                    scope:this
                });
            }
        },
        MiningMinistryShipsView : function() {
            require('js/actions/menu/loader').show();
            this.service.view_ships({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsView.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.ships = o.result.ships;
                    
                    this.MiningMinistryShipsPopulate();
                },
                scope:this
            });
        },
        MiningMinistryShipsPopulate : function() {
            var ships = this.ships,
                details = Dom.get("shipsDetails");
            
            if(details) {
                var ul = document.createElement("ul"),
                    li = document.createElement("li"),
                    availShips = [],
                    workingShips = [];
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                
                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    if(ship.task == "Docked") {
                        availShips.push(ship);
                    }
                    else {
                        workingShips.push(ship);
                    }
                        
                    nUl.Ship = ship;
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = ship.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipTask");
                    nLi.innerHTML = ship.task;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipSpeed");
                    nLi.innerHTML = ship.speed;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipHold");
                    nLi.innerHTML = ship.hold_size;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = ship.task == "Docked" ? "Start Mining" : "Stop Mining";
                    bbtn = nLi.appendChild(bbtn);
                    nUl.appendChild(nLi);
                    
                    if(ship.task == "Docked") {
                        Event.on(bbtn, "click", this.MiningMinistryShipsAdd, {Self:this,Ship:ship}, true);
                    }
                    else {
                        Event.on(bbtn, "click", this.MiningMinistryShipsRemove, {Self:this,Ship:ship}, true);
                    }
                                
                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 175;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        MiningMinistryShipsAdd : function() {
            require('js/actions/menu/loader').show();
                
            this.Self.service.add_cargo_ship_to_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsAdd.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.MiningMinistryShipsView();
                    delete this.platforms; //reset platforms so we geto the new correct info
                },
                scope:this.Self
            });
        },
        MiningMinistryShipsRemove : function() {
            require('js/actions/menu/loader').show();
            
            this.Self.service.remove_cargo_ship_from_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsRemove.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.MiningMinistryShipsView();
                    delete this.platforms; //reset platforms so we go get the new correct info
                },
                scope:this.Self
            });
        },
        AbandonAllPlatforms : function(e) {
            if(confirm("Are you sure you want to abandon all platforms controlled by this Mining Ministry?")) {
                require('js/actions/menu/loader').show();
                this.service.mass_abandon_platform({
                        session_id:Game.GetSession(),
                        building_id:this.building.id
                    }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Observatory.AbandonAllPlatforms.mass_abandon_platform.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.probes = null;

                        //close buildingDetails
                        this.fireEvent("onHide");
                    },
                    scope:this
                });
            }
        }

    });
    
    YAHOO.lacuna.buildings.MiningMinistry = MiningMinistry;

})();
YAHOO.register("miningministry", YAHOO.lacuna.buildings.MiningMinistry, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
