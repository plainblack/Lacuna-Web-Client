YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Shipyard == "undefined" || !YAHOO.lacuna.buildings.Shipyard) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Shipyard = function(result){
        Shipyard.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Shipyard;
    };
    
    Lang.extend(Shipyard, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getQueueTab(), this._getBuildTab()];
        },
        _getQueueTab : function() {
            var div = document.createElement("div");
            div.innerHTML = ['<div>You may subsidize the build queue for 1 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per ship. <button type="button" class="shipQueueSubsidize">Subsidize</button> </div>',
                '<ul class="shipQueue shipQueueHeader clearafter"><li class="shipQueueType">Type</li><li class="shipQueueEach">Time To Complete</li></ul>',
                '<div id="qHt" style="overflow:auto;"><div id="shipsBuilding"></div></div>'].join('');
            Event.on(Sel.query(".shipQueueSubsidize",div,true), "click", this.SubsidizeBuildQueue, this, true);
        
            var queueTab = new YAHOO.widget.Tab({ label: "Build Queue", contentEl:div });
            queueTab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    this.getQueue();
                    var Ht = Game.GetSize().h - 210;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(Dom.get('qHt'),'height',Ht + 'px');
                    }
            }, this, true);
                    
            this.queueTab = queueTab;
            
            return queueTab;
        },
        _getBuildTab : function() {
            var buildTab = new YAHOO.widget.Tab({ label: "Build Ships", content: [
                '<div>',
                '    <div class="clearafter" style="font-weight:bold;">',
                '        <span id="shipDocksAvailable" style="float:left;"></span>',
                '        <span style="float:right;"><select id="shipBuildView"><option value="All">All</option><option value="Now" selected="selected">Now</option><option value="Later">Later</option></select></span>',
                '    </div>',
                '    <div class="clearafter" style="font-weight:bold;">',
                '        <span style="float:left;">Shipyards to use: <select id="shipBuildYards"><option value="">Only this shipyard</option><option value="all" selected="selected">All shipyards</option><option value="higher">This and higher level</option><option value="only">Same level only</option></select></span>',
                '    </div>',
                '    <div id="shipBuildMessage" class="error"></div>',
                '    <div id="bHt" style="overflow:auto;margin-top:2px;border-top:1px solid #52acff;">',
                '        <ul id="shipDetails">',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});

            buildTab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    this.getBuild();
                    var Ht = Game.GetSize().h - 190;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(Dom.get('bHt'),'height',Ht + 'px');
                }
            }, this, true);
            
            Event.on("shipBuildView", "change", this.ShipPopulate, this, true);

            this.buildTab = buildTab;
            
            return buildTab;
        },
        getBuild : function() {
            if(!this.ships) {
                require('js/actions/menu/loader').show();
                this.service.get_buildable({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Shipyard.getBuild.get_buildable.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.ships = {
                            buildable: o.result.buildable,
                            docks_available: o.result.docks_available,
                            build_queue_max: o.result['build_queue_max'],
                            build_queue_used: o.result['build_queue_used']
                        };
                        this.SetDocksAvailableMessage();
                        this.ShipPopulate();
                    },
                    scope:this
                });
            }
            else {
                this.ShipPopulate();
            }
        },
        getQueue : function() {
            if(!this.ship_build_queue) {
                require('js/actions/menu/loader').show();
                this.service.view_build_queue({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Shipyard.getQueue.view_build_queue.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.ship_build_queue = o.result;
                        this.ShipyardDisplay();
                    },
                    scope:this
                });
            }
            else {
                this.ShipyardDisplay();
            }
        },
        ShipyardDisplay : function() {
            var bq = this.ship_build_queue,
                div = Dom.get("shipsBuilding");

            if(div) {
                var divParent = div.parentNode,
                    ul = document.createElement("ul"),
                    li = document.createElement("li"),
                    serverTime = Lib.getTime(Game.ServerData.time);

                this.resetQueue();
                div = divParent.removeChild(div);
                div.innerHTML = "";
                
                /*= {
                    number_of_ships_building: o.result.number_of_ships_building,
                    ships_building: o.result.ships_building
                };*/
                if(bq && bq.ships_building && bq.ships_building.length > 0) {
                    for(var i=0; i<bq.ships_building.length; i++) {
                        var bqo = bq.ships_building[i],
                            nUl = ul.cloneNode(false),
                            nLi = li.cloneNode(false),
                            ncs = (Lib.getTime(bqo.date_completed) - serverTime) / 1000;
                        
                        nUl.Build = bqo;
                        
                        Dom.addClass(nUl, "shipQueue");
                        Dom.addClass(nUl, "clearafter");

                        Dom.addClass(nLi,"shipQueueType");
                        nLi.innerHTML = bqo.type_human;
                        nUl.appendChild(nLi);
                        
                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"shipQueueEach");
                        nLi.innerHTML = Lib.formatTime(ncs);
                        nUl.appendChild(nLi);

                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"shipQueueEach");
                        sbtn = document.createElement('button');
                        sbtn.setAttribute('type', 'button');
                        sbtn.innerHTML = 'Subsidize';
                        nLi.appendChild(sbtn);
                        nUl.appendChild(nLi);


                        div.appendChild(nUl);
                        Event.on(sbtn, "click", this.SubsidizeShip, {Self:this,Ship:bqo, Item:nUl}, true);
                        this.addQueue(ncs, this.ShipyardQueue, nUl);
                    }
                }
                //add child back in
                divParent.appendChild(div);
            }
        },
        ShipyardQueue : function(remaining, elLine){
            var compTime;
            if(remaining <= 0) {
                compTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                compTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("li.shipQueueEach",elLine,true).innerHTML = compTime;
        },
        SubsidizeBuildQueue : function() {
            require('js/actions/menu/loader').show();
            
            this.service.subsidize_build_queue({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Shipyard.SubsidizeBuildQueue.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);

                    this.ship_build_queue = undefined;
                    this.ShipyardDisplay();
                },
                scope:this
            });
        },
        
        SetBuildMessage : function(message) {
            var msg = Dom.get("shipBuildMessage");
            if(msg) {
                msg.innerHTML = message;
                Lib.fadeOutElm("shipBuildMessage");
            }
        },
        SetDocksAvailableMessage : function() {
            var sda = Dom.get("shipDocksAvailable");
            if(sda) {
                if(this.ships.docks_available) {
                    var message = 'There are ' + this.ships.docks_available + ' docks available for new ships.';
                    if (this.ships.build_queue_max && this.ships.build_queue_max - this.ships.build_queue_used > 0) {
                        message += '  You can queue ' + (this.ships.build_queue_max - this.ships.build_queue_used) + (this.ships.build_queue_used && this.ships.build_queue_used-0 ? ' additional' : '') + ' ships.';
                    }
                    else if (this.ships.build_queue_max) {
                        message += '  However, your build queue is full.';
                    }
                    sda.innerHTML = message;
                }
                else {
                    sda.innerHTML = 'You have no docks available.  Do you still have a Space Port?';
                }
            }
        },
        ShipPopulate : function() {
            var details = Dom.get("shipDetails");
            
            if(details) {
                var ships = this.ships.buildable,
                    li = document.createElement("li"),
                    shipNames = [],
                    filter = Lib.getSelectedOptionValue("shipBuildView"),
                    defReason = !this.ships.docks_available ? "No docks available at Space Port." : undefined;
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                        
                for(var shipType in ships) {
                    if(ships.hasOwnProperty(shipType)) {
                        if(filter == "All") {
                            shipNames.push(shipType);
                        }
                        else if(filter == "Now" && ships[shipType].can) {
                            shipNames.push(shipType);
                        }
                        else if(filter == "Later" && !ships[shipType].can) {
                            shipNames.push(shipType);
                        }
                    }
                }
                shipNames.sort();
                
                for(var i=0; i<shipNames.length; i++) {
                    var shipName = shipNames[i],
                        ship = ships[shipName],
                        nLi = li.cloneNode(false),
                        reason="", attributes = [];
                    
                    if(ship.reason) {
                        reason = '<div style="font-style:italic;">'+ship.reason[1]+'</div>';
                        //reason = '<div style="font-style:italic;">'+Lib.parseReason(ship.reason, defReason)+'</div>';
                    }
                    
                    for(var a in ship.attributes) {
                        attributes[attributes.length] = '<span style="white-space:nowrap;margin-left:5px;"><label style="font-style:italic">';
                        attributes[attributes.length] = a.titleCaps('_',' ');
                        attributes[attributes.length] = ': </label>';
                        attributes[attributes.length] = Lib.formatNumber(ship.attributes[a]);
                        attributes[attributes.length] = '</span> ';
                    }
                    
                    nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:15%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',ship.image,'.png" style="width:100px;height:100px;" class="shipImage" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:63%">',
                    '        <span class="shipName">',ship.type_human,'</span>: ',
                    '        <div class="shipDesc" style="display:none;">',Game.GetShipDesc(shipName),'</div>',
                    '        <div><label style="font-weight:bold;">Cost:</label>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" />',Lib.formatNumber(ship.cost.food),'</span>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" />',Lib.formatNumber(ship.cost.ore),'</span>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" />',Lib.formatNumber(ship.cost.water),'</span>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" />',Lib.formatNumber(ship.cost.energy),'</span>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" />',Lib.formatNumber(ship.cost.waste),'</span>',
                    '            <span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" />',Lib.formatTime(ship.cost.seconds),'</span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',attributes.join(''),'</div>',
                    !ship.can ? reason : '',
                    '    </div>',
                    '    <div class="yui-u" style="width:18%">',
                    ship.can ? ' <input type="text" style="width:25px;" id="ship_'+shipName+'" value="1"> <button type="button">Build</button>' : 
                    '    </div>',
                    '</div>'].join('');
                    if(ship.can) {
                        Event.on(Sel.query("button", nLi, true), "click", this.ShipBuild, {Self:this,Type:shipName,Ship:ship}, true);
                    }
                    
                    details.appendChild(nLi);
                    
                }
                
                Event.delegate(details, "click", this.ShipExpandDesc, ".shipName");
                Event.delegate(details, "click", this.ShipExpandDesc, ".shipImage");
            }
        },
        ShipExpandDesc : function(e, matchedEl, container) {
            var desc = Sel.query('div.shipDesc', matchedEl.parentNode.parentNode, true);
            if(desc) {
                var dis = Dom.getStyle(desc, "display");
                Dom.setStyle(desc, "display", dis == "none" ? "" : "none");
            }
        },
        SubsidizeShip : function() {
             require('js/actions/menu/loader').show();
             this.Self.service.subsidize_ship({args: {
				    session_id: Game.GetSession(),
                    building_id: this.Self.building.id,
					ship_id: this.Ship.id
			 }},{
					success: function(o) {
						require('js/actions/menu/loader').hide();
						this.Self.rpcSuccess(o);
						this.Item.parentNode.removeChild(this.Item);
						
					}, scope: this
				});
		},
        ShipBuild : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            var qty = Dom.get("ship_"+this.Type);
            var use = Lib.getSelectedOptionValue("shipBuildYards");
            this.Self.service.build_ships({
                session_id:Game.GetSession(),
                options: {
                    building_id:this.Self.building.id,
                    type:this.Type,
                    quantity:qty.value,
                    autoselect:use
                }
            }, {
                success : function(o){
                    btn.disabled = false;
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);

                    //this.Self.ship_build_queue = o.result;
                    //this.Self.ShipyardDisplay();
                    YAHOO.lacuna.MapPlanet.RefreshWithData(o);
                    
                    this.Self.ships.docks_available-=qty.value;
                    if(this.Self.ships.docks_available < 0) {
                        this.Self.ships.docks_available = 0;
                    }
                    this.Self.SetDocksAvailableMessage();
                    this.Self.SetBuildMessage("Successfully started building " + this.Ship.type_human + ".");
                },
                failure : function(o){
                    btn.disabled = false;
                },
                scope:this
            });
        }
        
    });
    
    YAHOO.lacuna.buildings.Shipyard = Shipyard;

})();
YAHOO.register("shipyard", YAHOO.lacuna.buildings.Shipyard, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
