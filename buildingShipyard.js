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
            div.innerHTML = [
                '<div>You may subsidize the build queue for 1 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per ship. <button type="button" class="shipQueueSubsidize">Subsidize</button> </div>',
                '<ul class="shipQueue shipQueueHeader clearafter"><li class="shipQueueQty">Quantity</li><li class="shipQueueType">Type</li><li class="shipQueueEach">Time To Complete</li></ul>',
                '<div id="qHt" style="overflow:auto;"><div id="shipsBuilding"></div></div>'
            ].join('');
            
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
            var buildTab = new YAHOO.widget.Tab({ label: "Build Fleets", content: [
                '<div>',
                '    <div class="clearafter" style="font-weight:bold;">',
                '        <span id="shipDocksAvailable" style="float:left;"></span>',
                '        <span style="float:right;">',
				'			<select id="shipBuildView">',
				'				<option value="All">All</option>',
				'				<option value="Now" selected="selected">Now</option>',
				'				<option value="Later">Later</option>',
				'			</select>',
				'			<select id="shipBuildTag">',
				'				<option value="all" selected="selected">All</option>',
				'				<option value="Colonization">Colonization</option>',
				'				<option value="Exploration">Exploration</option>',
				'				<option value="Intelligence">Intelligence</option>',
				'				<option value="Mining">Mining</option>',
				'				<option value="Trade">Trade</option>',
				'				<option value="War">War</option>',
				'			</select>',
				'		</span>',
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
			Event.on("shipBuildTag", "change", this.ShipPopulate, this, true);
			
            this.buildTab = buildTab;
            
            return buildTab;
        },
        getBuild : function() {
            if(!this.ships) {
                Lacuna.Pulser.Show();
                this.service.get_buildable({"args": {
                    session_id:Game.GetSession(),
                    building_id:this.building.id
                }}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Shipyard.getBuild.get_buildable.success");
                        Lacuna.Pulser.Hide();
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
                Lacuna.Pulser.Show();
                this.service.view_build_queue({"args": {
                    session_id:Game.GetSession(), 
                    building_id:this.building.id,
                    page_number:1}}, {

                    success : function(o){
                        YAHOO.log(o, "info", "Shipyard.getQueue.view_build_queue.success");
                        Lacuna.Pulser.Hide();
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

            if (div) {
                var divParent = div.parentNode,
                    ul = document.createElement("ul"),
                    li = document.createElement("li"),
                    serverTime = Lib.getTime(Game.ServerData.time);

                this.resetQueue();
                div = divParent.removeChild(div);
                div.innerHTML = '';
                
                if(bq && bq.fleets_building && bq.fleets_building.length > 0) {
                    for(var i = 0; i < bq.fleets_building.length; i++) {
                        var bqo = bq.fleets_building[i],
                            nUl = ul.cloneNode(false),
                            nLi = li.cloneNode(false),
                            ncs = (Lib.getTime(bqo.date_completed) - serverTime) / 1000;
                        
                        nUl.Build = bqo;
                        
                        Dom.addClass(nUl, "shipQueue");
                        Dom.addClass(nUl, "clearafter");

                        Dom.addClass(nLi,"shipQueueQty");
                        nLi.innerHTML = parseInt(bqo.quantity); // Integer, right?
                        nUl.appendChild(nLi);
                        
                        nLi = li.cloneNode(false);
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
                        Event.on(sbtn, "click", this.SubsidizeFleet, {Self:this, Fleet:bqo, Item:nUl}, true);
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
            Lacuna.Pulser.Show();
            
            this.service.subsidize_build_queue({"args": {
                session_id:Game.GetSession(),
                building_id:this.building.id
            }}, {
                success : function(o){
                    YAHOO.log(o, "info", "Shipyard.SubsidizeBuildQueue.success");
                    Lacuna.Pulser.Hide();
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
                    filter = Lib.getSelectedOptionValue("shipBuildView") || '',
					tag = Lib.getSelectedOptionValue('shipBuildTag') || '',
                    defReason = !this.ships.docks_available ? "No docks available at Space Port." : undefined;
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                
                for(var shipType in ships) {
                    if(ships.hasOwnProperty(shipType)) {
						// If a tag was selected, ignore filter.
						if (tag === "all") {
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
						else {
							// Handle the selected tag.
							for (shipTagIndex in ships[shipType].tags) {
								var shipTag = ships[shipType].tags[shipTagIndex];
								if (shipTag === tag) {
									shipNames.push(shipType);
								}
							}
						}
                    }
                }
                shipNames.sort();
                
                for(var i=0; i<shipNames.length; i++) {
                    var shipName = shipNames[i],
                        ship = ships[shipName],
                        nLi = li.cloneNode(false);
					
					nLi.innerHTML = [
						'<div class="yui-gb">',
						'<table>',
						'	<colgroup>',
						'		<col style="width:100px;height:100px;">',
						'		<col style="width:200px;">',
						'		<col span="6" style="width:75px">',
						'	</colgroup>',
						'	<tr>',
						'		<td rowspan="4">',
						'			<div style="width:100px;height:100px;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;display:table-cell;vertical-align:middle;">',
						'        		<img src="', Lib.AssetUrl, 'ships/', shipName, '.png" style="width:80px;height:80px;" />',
						'			</div>',
						'		</td>',
						'		<td><span style="font-weight:bold;">', ship.type_human, '</span></td>',
						'		<td colspan="4"></td>',
								// Only display the Build Button and Quantity field if the ship is buildable!
								ship.can ?
								'<td><input type="text" style="width:75px;" id="ship_' + shipName+'" value="1"></td>'+
								'<td><button type="button" style="width:75px;">Build</button></td>' : '',
						'	</tr>',
						'	<tr>',
						'		<td><span style="font-weight:bold;">Cost:</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/food.png" title="Food" class="smallFood" />', ship.cost.food, '</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/ore.png" title="Ore" class="smallOre" />', ship.cost.ore, '</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/water.png" title="Water" class="smallWater" />', ship.cost.water, '</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/energy.png" title="Energy" class="smallEnergy" />', ship.cost.energy, '</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/waste.png" title="Waste" class="smallWaste" />', ship.cost.waste, '</span></td>',
						'		<td><span style="white-space:nowrap;"><img src="', Lib.AssetUrl, 'ui/s/time.png" title="Time" class="smallTime" />', Lib.formatTime(ship.cost.seconds), '</span></td>',
						'	</tr>',
						'	<tr>',
						'		<td><span style="font-weight:bold;">Attributes:</span></td>',
						'		<td>Speed:</td>',
						'		<td>', ship.attributes.speed, '</td>',
						'		<td>Berth:</td>', // 'Berth Level:' takes up two rows in a cell, which messes things up.
						'		<td>', ship.attributes.berth_level, '</td>',
						'		<td>Hold Size:</td>',
						'		<td>', ship.attributes.hold_size, '</td>',
						'	</tr>',
						'	<tr>',
						'		<td>&nbsp;</td>',
						'		<td>Occupants:</td>', // 'Max Occumapnts:' takes up two rows in a cell, which messes things up.
						'		<td>', ship.attributes.max_occupants, '</td>',
						'		<td>Stealth:</td>',
						'		<td>', ship.attributes.stealth, '</td>',
						'		<td>Combat:</td>',
						'		<td>', ship.attributes.combat, '</td>',
						'	</tr>',
						ship.reason[1] ? '<tr><td colspan="5" style="text-align:center;"><span style="font-style:italic;">' + ship.reason[1] + '</span></td></tr>' : '',
						'</table>',
						'<hr />',
						'</div>'
					].join('');
					
					if(ship.can) {
                        Event.on(Sel.query("button", nLi, true), "click", this.ShipBuild, {Self:this,Type:shipName,Ship:ship}, true);
                    }
                    
                    details.appendChild(nLi);
                    
                }
                
				/*    TODO!!    */
                //Event.delegate(details, "click", this.ShipExpandDesc, ".shipName");
                //Event.delegate(details, "click", this.ShipExpandDesc, ".shipImage");
            }
        },
        ShipExpandDesc : function(e, matchedEl, container) {
            var desc = Sel.query('span.shipDesc', matchedEl.parentNode.parentNode, true);
            if(desc) {
                var dis = Dom.getStyle(desc, "display");
                Dom.setStyle(desc, "display", dis == "none" ? "" : "none");
            }
        },
        SubsidizeFleet : function() {
             Lacuna.Pulser.Show();
             this.Self.service.subsidize_fleet({"args":{
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    fleet_id: this.Fleet.id
             }},{
                    success: function(o) {
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);
                        
                        var queue = this.Self.ship_build_queue.fleets_building;
                        for(var i = 0; i < queue.length; i++) {
                            if ( queue[i].id == this.Fleet.id ){
                                queue.splice(i,1);
                                break;
                            }
                        }
                        this.Self.ShipyardDisplay();
                    }, scope: this
                });
        },
        ShipBuild : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            Lacuna.Pulser.Show();
            var qty = Dom.get("ship_"+this.Type);
            this.Self.service.build_fleet({"args": {
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                type:this.Type,
                quantity:qty.value
                }}, {
                success : function(o){
                    btn.disabled = false;
                    Lacuna.Pulser.Hide();
                    this.Self.rpcSuccess(o);

                    this.Self.ship_build_queue = o.result;
                    this.Self.ShipyardDisplay();
                    
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
