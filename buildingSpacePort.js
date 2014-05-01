YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.SpacePort == "undefined" || !YAHOO.lacuna.buildings.SpacePort) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Pager = YAHOO.widget.Paginator,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var SpacePort = function(result){
        SpacePort.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.SpacePort;
    };
    
    Lang.extend(SpacePort, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.shipsPager) {
                this.shipsPager.destroy();
            }
            if(this.viewPager) {
                this.viewPager.destroy();
            }
            if(this.foreignPager) {
                this.foreignPager.destroy();
            }
            if(this.orbitingPager) {
                this.orbitingPager.destroy();
            }
            SpacePort.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getTravelTab(), this._getViewTab(), this._getOrbitingTab(), this._getForeignTab(), this._getLogsTab(), this._getSendTab(), this._getSendFleetTab()];
        },
        _getTravelTab : function() {
            this.travelTab = new YAHOO.widget.Tab({ label: "Travelling", content: [
                '<div>',
                '    <div style="overflow:auto;margin-top:2px;">',
                '        <ul id="shipDetails"></ul>',
                '    </div>',
                '    <div id="shipsPaginator"></div>',
                '</div>'
            ].join('')});
            /*
            
                '    <ul class="shipHeader shipInfo clearafter">',
                '        <li class="shipTypeImage">&nbsp;</li>',
                '        <li class="shipName">Name</li>',
                '        <li class="shipArrives">Arrives</li>',
                '        <li class="shipFrom">From</li>',
                '        <li class="shipTo">To</li>',
                '        <li class="shipSpeed">Speed</li>',
                '        <li class="shipHold">Hold Size</li>',
                '        <li class="shipHold">Stealth</li>',
                '    </ul>',
                '    <div><div id="shipDetails"></div></div>',
            */
            //subscribe after adding so active doesn't fire
            this.travelTab.subscribe("activeChange", this.getTravel, this, true);
            
            return this.travelTab;
        },
        _getViewTab : function() {
            this.viewShipsTab = new YAHOO.widget.Tab({ label: "View", content: [
                '<div>',
                '    <div class="yui-ge" style="border-bottom:1px solid #52acff;"><div id="shipsCount" class="yui-u first"></div><div class="yui-u"><button type="button" id="shipsRecallAll" style="display:none;">Recall All</button></div></div>',    
                '    <div style="overflow:auto;margin-top:2px;"><ul id="shipsViewDetails"></ul></div>',
                '    <div id="shipsViewPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.viewShipsTab.subscribe("activeChange", this.getShips, this, true);
            Event.on("shipsRecallAll", "click", this.ShipRecallAll, this, true);
            
            return this.viewShipsTab;
        },
        _getOrbitingTab : function() {
            this.viewOrbitingTab = new YAHOO.widget.Tab({ label: "Foreign Orbiting", content: [
                '<div>',
                '    <ul class="shipHeader shipInfo clearafter">',
                '        <li class="shipTypeImage">&nbsp;</li>',
                '        <li class="shipName">Name</li>',
                '        <li class="shipArrives">Arrived</li>',
                '        <li class="shipFrom">From</li>',
                '    </ul>',
                '    <div><div id="shipsOrbitingDetails"></div></div>',
                '    <div id="shipsOrbitingPaginator"></div>',
                '</div>'
            ].join('')});
            this.viewOrbitingTab.subscribe("activeChange", this.getOrbiting, this, true);
            
            return this.viewOrbitingTab;
        },
        _getForeignTab : function() {
            this.foreignShipsTab = new YAHOO.widget.Tab({ label: "Incoming", content: [
                '<div>',
                '    <ul class="shipHeader shipInfo clearafter">',
                '        <li class="shipTypeImage">&nbsp;</li>',
                '        <li class="shipName">Name</li>',
                '        <li class="shipArrives">Arrives</li>',
                '        <li class="shipFrom">From</li>',
                '    </ul>',
                '    <div><div id="shipsForeignDetails"></div></div>',
                '    <div id="shipsForeignPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.foreignShipsTab.subscribe("activeChange", this.getForeign, this, true);
            
            return this.foreignShipsTab;
        },
        _getLogsTab : function() {
            this.battleLogsTab = new YAHOO.widget.Tab({ label: "Battle Logs", content: [
                '<div>',
                '    <ul class="shipHeader shipInfo clearafter" style="padding-left:5px; padding-right:5px;">',
                '        <li class="shipTask">Role</li>',
                '        <li class="shipName">Name</li>',
                '        <li class="shipFrom">From</li>',
                '        <li>Details</li>',
                '    </ul>',
                '    <div><div id="battleLogsDetails"></div></div>',
                '    <div id="battleLogsPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.battleLogsTab.subscribe("activeChange", this.getLogs, this, true);
            
            return this.battleLogsTab;
        },
        _getSendTab : function() {
            this.sendTab = new YAHOO.widget.Tab({ label: "Send", content: [
                '<div id="sendShipPick">',
                '    Send To <select id="sendShipType"><option value="body_name">Planet Name</option><option value="body_id">Planet Id</option><option value="star_name">Star Name</option><option value="star_id">Star Id</option><option value="xy">X,Y</option></select>',
                '    <span id="sendShipTargetSelectText"><input type="text" id="sendShipTargetText" /></span>',
                '    <span id="sendShipTargetSelectXY" style="display:none;">X:<input type="text" id="sendShipTargetX" /> Y:<input type="text" id="sendShipTargetY" /></span>',
                '    <button type="button" id="sendShipGet">Get Available Ships For Target</button>',
                '</div>',
                '<div id="sendShipSend" style="display:none;border-top:1px solid #52ACFF;margin-top:5px;padding-top:5px">',
                '    Sending ships to: <span id="sendShipNote"></span>',
                '    <div style="border-top:1px solid #52ACFF;margin-top:5px;"><ul id="sendShipAvail"></ul></div>',
                '</div>'
            ].join('')});
            
            Event.on("sendShipType", "change", function(){
                if(Lib.getSelectedOptionValue(this) == "xy") {
                    Dom.setStyle("sendShipTargetSelectText", "display", "none");
                    Dom.setStyle("sendShipTargetSelectXY", "display", "");
                }
                else {
                    Dom.setStyle("sendShipTargetSelectText", "display", "");
                    Dom.setStyle("sendShipTargetSelectXY", "display", "none");
                }
            });
            Event.on("sendShipGet", "click", this.GetShipsFor, this, true);
            
            return this.sendTab;
        },
        _getSendFleetTab : function() {
            this.sendFleetTab = new YAHOO.widget.Tab({ label: "Fleet", content: [
                '<div id="sendFleetPick">',
                '    Send To <select id="sendFleetType"><option value="body_name">Planet Name</option><option value="body_id">Planet Id</option><option value="star_name">Star Name</option><option value="star_id">Star Id</option><option value="xy">X,Y</option></select>',
                '    <span id="sendFleetTargetSelectText"><input type="text" id="sendFleetTargetText" /></span>',
                '    <span id="sendFleetTargetSelectXY" style="display:none;">X:<input type="text" id="sendFleetTargetX" /> Y:<input type="text" id="sendFleetTargetY" /></span>',
                '    <button type="button" id="sendFleetGet">Get Available Ships For Target</button>',
                '</div>',
                '<div id="sendFleetSend" style="display:none;border-top:1px solid #52ACFF;margin-top:5px;padding-top:5px">',
                '    <div class="yui-g"><div class="yui-u first">Sending ships to: <span id="sendFleetNote"></span></div><div class="yui-u" style="text-align:right;">Set speed:<input type="text" id="setSpeed" value="0" size="6"><button type="button" id="sendFleetSubmit">Send Fleet</button></div></div>',
                '    <div style="border-top:1px solid #52ACFF;margin-top:5px;"><ul id="sendFleetAvail"></ul></div>',
                '</div>'
            ].join('')});
            
            Event.on("sendFleetType", "change", function(){
                if(Lib.getSelectedOptionValue(this) == "xy") {
                    Dom.setStyle("sendFleetTargetSelectText", "display", "none");
                    Dom.setStyle("sendFleetTargetSelectXY", "display", "");
                }
                else {
                    Dom.setStyle("sendFleetTargetSelectText", "display", "");
                    Dom.setStyle("sendFleetTargetSelectXY", "display", "none");
                }
            });
            Event.on("sendFleetGet", "click", this.GetFleetFor, this, true);
            Event.on("sendFleetSubmit", "click", this.FleetSend, this, true);
            
            return this.sendFleetTab;
        },
        
        getTravel : function(e) {
            if(e.newValue) {
                if(!this.shipsTravelling) {
                    Lacuna.Pulser.Show();
                    this.service.view_ships_travelling({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_ships_travelling.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.shipsTravelling = {
                                number_of_ships_travelling: o.result.number_of_ships_travelling,
                                ships_travelling: o.result.ships_travelling
                            };
                            this.shipsPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_ships_travelling,
                                containers  : 'shipsPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.shipsPager.subscribe('changeRequest',this.ShipHandlePagination, this, true);
                            this.shipsPager.render();
                            
                            this.SpacePortPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.SpacePortPopulate();
                }
            }
        },
        getShips : function(e) {
            if(e.newValue) {
                if(!this.shipsView) {
                    Lacuna.Pulser.Show();
                    this.service.view_all_ships({session_id:Game.GetSession(),building_id:this.building.id,paging:{page_number:1}}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_all_ships.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.shipsView = {
                                number_of_ships: o.result.number_of_ships,
                                ships: o.result.ships
                            };
                            this.viewPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_ships,
                                containers  : 'shipsViewPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.viewPager.subscribe('changeRequest',this.ViewHandlePagination, this, true);
                            this.viewPager.render();
                            
                            this.ViewPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.ViewPopulate();
                }
            }
        },
        getForeign : function(e) {
            if(e.newValue) {
                if(!this.shipsForeign) {
                    Lacuna.Pulser.Show();
                    this.service.view_foreign_ships({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_foreign_ships.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.shipsForeign = {
                                number_of_ships: o.result.number_of_ships,
                                ships: o.result.ships
                            };
                            this.foreignPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_ships,
                                containers  : 'shipsForeignPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.foreignPager.subscribe('changeRequest',this.ForeignHandlePagination, this, true);
                            this.foreignPager.render();
                            
                            this.ForeignPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.ForeignPopulate();
                }
            }
        },
        getLogs : function(e) {
            if(e.newValue) {
                if(!this.battleLogs) {
                    Lacuna.Pulser.Show();
                    this.service.view_battle_logs({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_battle_logs.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.battleLogs = {
                                number_of_logs: o.result.number_of_logs,
                                battle_log: o.result.battle_log
                            };
                            this.logsPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_logs,
                                containers  : 'battleLogsPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.logsPager.subscribe('changeRequest',this.LogsHandlePagination, this, true);
                            this.logsPager.render();
                            
                            this.LogsPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.LogsPopulate();
                }
            }
        },
        getOrbiting : function(e) {
            if(e.newValue) {
                if(!this.shipsOrbiting) {
                    Lacuna.Pulser.Show();
                    this.service.view_ships_orbiting({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.shipsOrbiting = {
                                number_of_ships: o.result.number_of_ships,
                                ships: o.result.ships
                            };
                            this.orbitingPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_ships,
                                containers  : 'shipsOrbitingPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.orbitingPager.subscribe('changeRequest',this.OrbitingHandlePagination, this, true);
                            this.orbitingPager.render();
                            
                            this.OrbitingPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.OrbitingPopulate();
                }
            }
        },
        
        SpacePortPopulate : function() {
            var ships = this.shipsTravelling.ships_travelling,
                details = Dom.get("shipDetails");

            if(details) {
                var parentEl = details.parentNode,
                    li = document.createElement("li"),
                    serverTime = Lib.getTime(Game.ServerData.time);

                Event.purgeElement(details, true);
                details = parentEl.removeChild(details);
                details.innerHTML = "";
                
                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(ship.date_arrives) - serverTime) / 1000;
                    
                    nLi.innerHTML = ['<div class="yui-g" style="margin-bottom:2px;">',
                    '<div class="yui-g first">',
                    '    <div class="yui-u first" style="background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',ship.type,'.png" title="',ship.type_human,'" style="width:105px;height:105px;" />',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <span class="shipName">',ship.name,'</span>: ',
                    '        <ul>',
                    '            <li><label style="font-weight:bold;">Travel:</label></li>',
                    '            <li style="white-space:nowrap;"><label style="font-style:italic">Arrives In: </label><span class="shipArrives">',Lib.formatTime(sec),'</span></li>',
                    '            <li style="white-space:nowrap;"><label style="font-style:italic">From: </label><span class="shipFrom">',ship.from.name,'</span></li>',
                    '            <li style="white-space:nowrap;"><label style="font-style:italic">To: </label><span class="shipTo">',ship.to.name,'</span></li>',
                    '        </ul>',
                    '    </div>',
                    '</div>',
                    '<div class="yui-g">',
                    '    <div class="yui-u first">',
                    '        <ul>',
                    '        <li><label style="font-weight:bold;">Attributes:</label></li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Speed: </label>',(ship.fleet_speed > 0 && ship.fleet_speed < ship.speed) ? ship.fleet_speed : ship.speed,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Hold Size: </label>',ship.hold_size,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Stealth: </label>',ship.stealth,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Combat: </label>',ship.combat,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Occupants: </label>',ship.max_occupants,'</li>',                    '        </ul>',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <div><label style="font-weight:bold;">Payload:</label></div>',
                    Lib.formatInlineList(ship.payload),
                    '    </div>',
                    '</div>',
                    '</div>'].join('');
                    var sn = Sel.query("span.shipName",nLi,true);
                    Event.on(sn, "click", this.ShipName, {Self:this,Ship:ship,el:sn}, true);
                    //Event.on(Sel.query("span.shipFrom",nLi,true), "click", this.EmpireProfile, ship.from);
                    //Event.on(Sel.query("span.shipTo",nLi,true), "click", this.EmpireProfile, ship.to);
                    
                    this.addQueue(sec, this.SpacePortQueue, nLi);
                    
                    details.appendChild(nLi);
                }

                //add child back in
                parentEl.appendChild(details);

                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 220;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        ShipHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_ships_travelling({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.ShipHandlePagination.view_ships_travelling.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.shipsTravelling = {
                        number_of_ships_travelling: o.result.number_of_ships_travelling,
                        ships_travelling: o.result.ships_travelling
                    };
                    this.SpacePortPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.shipsPager.setState(newState);
        },
        SpacePortQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("span.shipArrives",elLine,true).innerHTML = arrTime;
        },
        
        ViewActionDetails : function(nLi, ship, noEvent) {
            var ulDet = ['<li style="white-space:nowrap;"><label style="font-weight:bold;">',ship.task,'</label></li>'];

            if(ship.task == "Docked") {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;margin-top:5px"><button type="button" class="scuttle">Scuttle</button></li>';
                
                if(!noEvent) {
                    Event.delegate(nLi, 'click', this.ShipScuttle, 'button.scuttle', {Self:this,Ship:ship,Line:nLi}, true);
                }
            }
            else if(ship.task == "Travelling") {
                var serverTime = Lib.getTime(Game.ServerData.time),
                    sec = (Lib.getTime(ship.date_arrives) - serverTime) / 1000;

                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><label style="font-style:italic">Arrives In: </label><span class="shipArrives">';
                ulDet[ulDet.length] = Lib.formatTime(sec);
                ulDet[ulDet.length] = '</span></li><li style="white-space:nowrap;"><label style="font-style:italic">From: </label><span class="shipFrom">';
                ulDet[ulDet.length] = ship.from.name;
                ulDet[ulDet.length] = '</span></li><li style="white-space:nowrap;"><label style="font-style:italic">To: </label><span class="shipTo">';
                ulDet[ulDet.length] = ship.to.name;
                ulDet[ulDet.length] = '</span></li>';
                
                this.addQueue(sec, this.SpacePortQueue, nLi);
            }
            else if(ship.task == "Defend" || ship.task == "Orbiting") {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><span class="shipTo">';
                ulDet[ulDet.length] = ship.orbiting.name;
                ulDet[ulDet.length] = '</span></li><li style="white-space:nowrap;margin-top:5px"><button type="button" class="recall">Recall</button></li>';
                
                if(!noEvent) {
                    Event.delegate(nLi, 'click', this.ShipRecall, 'button.recall', {Self:this,Ship:ship,Line:nLi}, true);
                }
            }
            
            if(ship.payload && ship.payload.length > 0) {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;margin-top:5px"><button type="button" class="payload">Payload</button></li>';
                
                if(!noEvent) {
                    Event.delegate(nLi, 'click', function(e, matchedEl, container){
                        var div = Sel.query('div.shipPayload', container);
                            curDis = Dom.getStyle(div[0], "display");
                        Dom.setStyle(div, "display", curDis == "none" ? "" : "none");
                    }, 'button.payload', this, true);
                }
            }
            
            return ulDet.join('');
        },
        ViewPopulate : function() {
            var details = Dom.get("shipsViewDetails");
            
            if(details) {
                var ships = this.shipsView.ships,
                    parentEl = details.parentNode,
                    li = document.createElement("li"),
                    info = Dom.get("shipsCount"),
                    displayRecallAll;
                    
                Event.purgeElement(details, true);
                details = parentEl.removeChild(details);
                details.innerHTML = "";

                if(info && this.result.max_ships > 0) {
                    info.innerHTML = ['<div>This SpacePort can dock a maximum of ', this.result.max_ships, ' ships. There are ', this.result.docks_available, ' docks available.'].join(''); 
                }               

                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nLi = li.cloneNode(false);
                
                    Dom.setStyle(nLi, "margin-top", "3px");
                    nLi.innerHTML = ['<div class="yui-g" style="margin-bottom:2px;">',
                    '<div class="yui-g first">',
                    '    <div class="yui-u first" style="background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',ship.type,'.png" title="',ship.type_human,'" style="width:115px;height:115px;" />',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <span class="shipName">',ship.name,'</span>: ',
                    '        <ul class="shipActionDetails">',
                    this.ViewActionDetails(nLi, ship),
                    '        </ul>',
                    '    </div>',
                    '</div>',
                    '<div class="yui-g">',
                    '    <div class="yui-u first">',
                    '        <ul>',
                    '        <li><label style="font-weight:bold;">Attributes:</label></li>',
                    (ship.fleet_speed > 0 && ship.fleet_speed < ship.speed) ? '        <li style="white-space:nowrap;"><label style="font-style:italic">Fleet Speed: </label>'+ship.fleet_speed+'</li>' : '',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Speed: </label>',ship.speed,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Hold Size: </label>',ship.hold_size,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Berth Level: </label>',ship.berth_level,'</li>',
                    '        </ul>',
                    '        <div class="shipPayload" style="display:none;margin-top:5px"><div><label style="font-weight:bold;">Payload:</label></div>',
                    Lib.formatInlineList(ship.payload, 0, 3),
                    '</div>',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <ul>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Occupants: </label>',ship.max_occupants,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Stealth: </label>',ship.stealth,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Combat: </label>',ship.combat,'</li>',
                    '        </ul>',
                    '        <div class="shipPayload" style="display:none;margin-top:5px">',
                    Lib.formatInlineList(ship.payload, 3),
                    '        </div>',
                    '    </div>',
                    '</div>',
                    '</div>'].join('');
                    
                    if(ship.task == "Defend" || ship.task == "Orbiting") {
                        displayRecallAll = true;
                    }
                    
                    var sn = Sel.query("span.shipName",nLi,true);
                    Event.on(sn, "click", this.ShipName, {Self:this,Ship:ship,el:sn}, true);
                    //Event.on(Sel.query("span.shipFrom",nLi,true), "click", this.EmpireProfile, ship.from);
                    //Event.on(Sel.query("span.shipTo",nLi,true), "click", this.EmpireProfile, ship.to);

                                
                    details.appendChild(nLi);
                    
                }
                
                if(displayRecallAll) {
                    Dom.setStyle("shipsRecallAll","display","");
                }
                else {
                    Dom.setStyle("shipsRecallAll","display","none");
                }
                
                //add child back in
                parentEl.appendChild(details);
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 230;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        ViewHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_all_ships({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                paging:{page_number:newState.page}
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.ViewHandlePagination.view_all_ships.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.shipsView = {
                        number_of_ships: o.result.number_of_ships,
                        ships: o.result.ships
                    };
                    this.ViewPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.viewPager.setState(newState);
        },
        
        ShipName : function() {
            this.el.innerHTML = "";
            
            var inp = document.createElement("input"),
                bSave = document.createElement("button"),
                bCancel = bSave.cloneNode(false);
            inp.type = "text";
            inp.value = this.Ship.name;
            this.Input = inp;
            bSave.setAttribute("type", "button");
            bSave.innerHTML = "Save";
            Event.on(bSave,"click",this.Self.ShipNameSave,this,true);
            bCancel.setAttribute("type", "button");
            bCancel.innerHTML = "Cancel";
            Event.on(bCancel,"click",this.Self.ShipNameClear,this,true);
                        
            Event.removeListener(this.el, "click");        
                
            this.el.appendChild(inp);
            this.el.appendChild(document.createElement("br"));
            this.el.appendChild(bSave);
            this.el.appendChild(bCancel);
        },
        ShipNameSave : function(e) {
            Event.stopEvent(e);
            Lacuna.Pulser.Show();
            var newName = this.Input.value;
            
            this.Self.service.name_ship({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id,
                name:newName
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.ShipNameSave.success");
                    Lacuna.Pulser.Hide();
                    this.Self.rpcSuccess(o);
                    delete this.Self.shipsView;
                    delete this.Self.shipsTravelling;
                    this.Ship.name = newName;
                    if(this.Input) {
                        this.Input.value = newName;
                    }
                    this.Self.ShipNameClear.call(this);
                },
                failure : function(o){
                    if(this.Input) {
                        this.Input.value = this.Ship.name;
                    }
                },
                scope:this
            });
        },
        ShipNameClear : function(e) {
            if(e) { Event.stopEvent(e); }
            if(this.Input) {
                delete this.Input;
            }
            if(this.el) {
                Event.purgeElement(this.el, true);
                this.el.innerHTML = this.Ship.name;
                Event.on(this.el, "click", this.Self.ShipName, this, true);
            }
        },
        
        ForeignPopulate : function() {
            var details = Dom.get("shipsForeignDetails");
            
            if(details) {
                var ships = this.shipsForeign.ships,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                
                ships = ships.slice(0);
                ships.sort(function(a,b) {
                    if (a.date_arrives > b.date_arrives) {
                        return 1;
                    }
                    else if (a.date_arrives < b.date_arrives) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
                
                Event.purgeElement(details, true);
                details.innerHTML = "";
                
                var serverTime = Lib.getTime(Game.ServerData.time);

                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(ship.date_arrives) - serverTime) / 1000;
                        
                    nUl.Ship = ship;
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"shipTypeImage");
                    Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
                    Dom.setStyle(nLi, "text-align", "center");
                    nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',ship.type,'.png" title="',ship.type_human,'" style="width:50px;height:50px;" />'].join('');
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = ship.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipArrives");
                    nLi.innerHTML = Lib.formatTime(sec);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    if(ship.from && ship.from.name) {
                        if(ship.from.empire && ship.from.empire.name) {
                            nLi.innerHTML = ship.from.name + ' <span style="cursor:pointer;">[' + ship.from.empire.name + ']</span>';
                            Event.on(nLi, "click", this.EmpireProfile, ship.from.empire);
                        }
                        else {
                            nLi.innerHTML = ship.from.name;
                        }
                    }
                    else {
                        nLi.innerHTML = 'Unknown';
                    }
                    nUl.appendChild(nLi);

                    this.addQueue(sec, this.ForeignQueue, nUl);
                                
                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 220;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        LogsPopulate : function() {
            var details = Dom.get("battleLogsDetails");
            
            if(details) {
                var logs = this.battleLogs.battle_log,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                
                logs = logs.slice(0);
                
                Event.purgeElement(details, true);
                details.innerHTML = "";
                
                for(var i=0; i<logs.length; i++) {
                    var log = logs[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");
                    if (!details.children.length) Dom.addClass(nUl, "first");
                    Dom.addClass(nUl, "attacker");

                    Dom.addClass(nLi,"shipTask");
                    nLi.innerHTML = 'Attacker';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = log.attacking_unit;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    nLi.innerHTML = log.attacking_body + ' [' + log.attacking_empire + ']';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    nLi.innerHTML = '<label>Arrived:</label> ' + log.date;
                    nUl.appendChild(nLi);

                    details.appendChild(nUl);

                    nUl = ul.cloneNode(false),
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");
                    Dom.addClass(nUl, "defender");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipTask");
                    nLi.innerHTML = 'Defender';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = log.defending_unit;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    nLi.innerHTML = log.defending_body + ' [' + log.defending_empire + ']';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    nLi.innerHTML = '<label>Victory:</label> ' + log.victory_to.replace(/^\w/, function(c){return c.toUpperCase()});
                    nUl.appendChild(nLi);

                    details.appendChild(nUl);

                    nUl = ul.cloneNode(false),
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");
                    Dom.addClass(nUl, "attacked");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipTask");
                    nLi.innerHTML = 'Attacked';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    nLi.innerHTML = log.attacked_body + ' [' + log.attacked_empire + ']';
                    nUl.appendChild(nLi);

                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 220;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        ForeignHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_foreign_ships({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.view_foreign_ships.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.shipsForeign = {
                        number_of_ships: o.result.number_of_ships,
                        ships: o.result.ships
                    };
                    this.ForeignPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.foreignPager.setState(newState);
        },
        LogsHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_battle_logs({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.view_battle_logs.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.battleLogs = {
                        number_of_logs: o.result.number_of_logs,
                        battle_log: o.result.battle_log
                    };
                    this.LogsPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.logsPager.setState(newState);
        },
        ForeignQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("li.shipArrives",elLine,true).innerHTML = arrTime;
        },
        
        OrbitingPopulate : function() {
            var details = Dom.get("shipsOrbitingDetails");
            
            if(details) {
                var ships = this.shipsOrbiting.ships,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                
                ships = ships.slice(0);
                ships.sort(function(a,b) {
                    if(a.date_arrives || b.date_arrives) {
                        if (a.date_arrives > b.date_arrives) {
                            return 1;
                        }
                        else if (a.date_arrives < b.date_arrives) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                    else {
                        return 0;
                    }
                });
                Event.purgeElement(details, true);
                details.innerHTML = "";
                var serverTime = Lib.getTime(Game.ServerData.time);
                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(ship.date_arrived) - serverTime) / 1000;
                    nUl.Ship = ship;
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"shipTypeImage");
                    Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
                    Dom.setStyle(nLi, "text-align", "center");
                    nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',ship.type,'.png" title="',ship.type_human,'" style="width:50px;height:50px;" />'].join('');
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = ship.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipArrives");
                    nLi.innerHTML = Lib.formatServerDate(ship.date_arrived);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    if(ship.from && ship.from.name) {
                        if(ship.from.empire && ship.from.empire.name) {
                            nLi.innerHTML = ship.from.name + ' <span style="cursor:pointer;">[' + ship.from.empire.name + ']</span>';
                            Event.on(nLi, "click", this.EmpireProfile, ship.from.empire);
                        }
                        else {
                            nLi.innerHTML = ship.from.name;
                        }
                    }
                    else {
                        nLi.innerHTML = 'Unknown';
                    }
                    nUl.appendChild(nLi);

                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 220;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        OrbitingHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_ships_orbiting({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.shipsOrbiting = {
                        number_of_ships: o.result.number_of_ships,
                        ships: o.result.ships
                    };
                    this.OrbitingPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.orbitingPager.setState(newState);
        },
        
        EmpireProfile : function(e, empire) {
            Lacuna.Info.Empire.Load(empire.id);
        },
        ShipScuttle : function(e, matchedEl, container) {
            if(confirm(["Are you sure you want to Scuttle ",this.Ship.name,"?"].join(''))) {
                var btn = Event.getTarget(e);
                btn.disabled = true;
                Lacuna.Pulser.Show();
                
                this.Self.service.scuttle_ship({
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    ship_id:this.Ship.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.ShipScuttle.success");
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);
                        var ships = this.Self.shipsView.ships,
                            info = Dom.get("shipsCount");
                        for(var i=0; i<ships.length; i++) {
                            if(ships[i].id == this.Ship.id) {
                                ships.splice(i,1);
                                break;
                            }
                        }
                        if(info) {
                            this.Self.result.docks_available++;
                            info.innerHTML = ['This SpacePort can dock a maximum of ', this.Self.result.max_ships, ' ships. There are ', this.Self.result.docks_available, ' docks available.'].join(''); 
                        }
                        Event.removeDelegate(this.Line, 'click');
                        this.Line.parentNode.removeChild(this.Line);
                    },
                    failure : function(o){
                        btn.disabled = false;
                    },
                    scope:this
                });
            }
        },
        ShipRecall : function(e, matchedEl, container) {
            matchedEl.disabled = true;
            Lacuna.Pulser.Show();
            
            this.Self.service.recall_ship({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.Self.rpcSuccess(o);
                    
                    var ships = this.Self.shipsView.ships,
                        info = Dom.get("shipsCount");
                    for(var i=0; i<ships.length; i++) {
                        if(ships[i].id == this.Ship.id) {
                            ships[i] = o.result.ship;
                            break;
                        }
                    }
                    if(info) {
                        this.Self.result.docks_available++;
                        info.innerHTML = ['This SpacePort can dock a maximum of ', this.Self.result.max_ships, ' ships. There are ', this.Self.result.docks_available, ' docks available.'].join(''); 
                    }
                    //set to travelling
                    var ad = Sel.query("ul.shipActionDetails", this.Line, true);
                    ad.innerHTML = this.Self.ViewActionDetails(this.Line, o.result.ship, true);
                    
                    //remove ships travelling so the tab gets reloaded when viewed next time
                    delete this.Self.shipsTravelling;
                },
                failure : function(o){
                    matchedEl.disabled = false;
                },
                scope:this
            });
        },
        ShipRecallAll : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            Lacuna.Pulser.Show();
            
            this.service.recall_all({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    
                    delete this.shipsTravelling;
                    delete this.shipsView;
                    this.getShips({newValue:true});
                },
                failure : function(o){
                    btn.disabled = false;
                },
                scope:this
            });
        },
        
        GetShipsFor : function() {
            Lacuna.Pulser.Show();
            
            //Dom.setStyle("sendShipPick", "display", "none");
            Dom.setStyle("sendShipSend", "display", "none");
            
            var type = Lib.getSelectedOptionValue("sendShipType"),
                target = {};
            
            if(type == "xy") {
                target.x = Dom.get("sendShipTargetX").value;
                target.y = Dom.get("sendShipTargetY").value;
                Dom.get("sendShipNote").innerHTML = ['X: ', target.x, ' - Y: ', target.y].join('');
            }
            else {
                target[type] = Dom.get("sendShipTargetText").value;
                Dom.get("sendShipNote").innerHTML = target[type];
            }
            
            this.service.get_ships_for({
                session_id:Game.GetSession(),
                from_body_id:Game.GetCurrentPlanet().id,
                target:target
            }, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.PopulateShipsSendTab(target, o.result.available);
                },
                scope:this
            });
            
        },
        PopulateShipsSendTab : function(target, ships) {
            var details = Dom.get("sendShipAvail"),
                detailsParent = details.parentNode,
                li = document.createElement("li");
                
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            Dom.setStyle("sendShipSend", "display", "");
            
            if(ships.length === 0) {
                details.innerHTML = "No available ships to send.";
            }
            else {                
                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.Ship = ship;
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:15%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',ship.type,'.png" style="width:60px;height:60px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:67%">',
                    '        <div class="buildingName">[',ship.type_human,'] ',ship.name,'</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span>Task:<span>',ship.task,'</span></span>,',
                    '            <span>Travel Time:<span>',Lib.formatTime(ship.estimated_travel_time),'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',ship.speed,'</span></span>,',
                    '            <span>Hold Size:<span>',ship.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',ship.stealth,'</span></span>',
                    '            <span>Combat:<span>',ship.combat,'</span></span>',
                    '        </div>',
                    '    </div>',
                    '    <div class="yui-u" style="width:8%">',
                    ship.task == "Docked" ? '        <button type="button">Send</button>' : '',
                    '    </div>',
                    '</div>'].join('');
                    
                    if(ship.task == "Docked") {
                        Event.on(Sel.query("button", nLi, true), "click", this.ShipSend, {Self:this,Ship:ship,Target:target,Line:nLi}, true);
                    }
                    
                    details.appendChild(nLi);
                }
            }
            detailsParent.appendChild(details); //add back as child
                            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 250;
                if(Ht > 250) { Ht = 250; }
                Dom.setStyle(detailsParent,"height",Ht + "px");
                Dom.setStyle(detailsParent,"overflow-y","auto");
            },10);
        },
        ShipSend : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
        
            var oSelf = this.Self,
                ship = this.Ship,
                target = this.Target;
            
            if(target && ship.id && Lacuna.MapStar.NotIsolationist(ship)) {
                Lacuna.Pulser.Show();
                oSelf.service.send_ship({
                    session_id:Game.GetSession(),
                    ship_id:ship.id,
                    target:target
                }, {
                    success : function(o){
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);
                        delete this.Self.shipsView;
                        delete this.Self.shipsTravelling;
                        this.Self.GetShipsFor();
                        Event.purgeElement(this.Line, true);
                        this.Line.innerHTML = "Successfully sent " + this.Ship.type_human + ".";
                    },
                    failure : function(o){
                        btn.disabled = false;
                    },
                    scope:this
                });
            }
            else {
                btn.disabled = false;
            }
        },
                
        GetFleetFor : function() {
            Lacuna.Pulser.Show();
            
            Dom.setStyle("sendFleetSend", "display", "none");
            
            var type = Lib.getSelectedOptionValue("sendFleetType"),
                target = {};
            
            if(type == "xy") {
                target.x = Dom.get("sendFleetTargetX").value;
                target.y = Dom.get("sendFleetTargetY").value;
                Dom.get("sendFleetNote").innerHTML = ['X: ', target.x, ' - Y: ', target.y].join('');
            }
            else {
                target[type] = Dom.get("sendFleetTargetText").value;
                Dom.get("sendFleetNote").innerHTML = target[type];
            }
            
            this.service.get_ships_for({
                session_id:Game.GetSession(),
                from_body_id:Game.GetCurrentPlanet().id,
                target:target
            }, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.PopulateFleetSendTab(target, o.result.available);
                },
                scope:this
            });
            
        },
        PopulateFleetSendTab : function(target, ships) {
            var details = Dom.get("sendFleetAvail"),
                detailsParent = details.parentNode,
                li = document.createElement("li");
                
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            this.FleetTarget = target;
            
            Dom.setStyle("sendFleetSend", "display", "");
            
            if(ships.length === 0) {
                details.innerHTML = "No available ships to send.";
            }
            else {
                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:15%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',ship.type,'.png" style="width:60px;height:60px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:67%">',
                    '        <div class="buildingName">[',ship.type_human,'] ',ship.name,'</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span>Task:<span>',ship.task,'</span></span>,',
                    '            <span>Travel Time:<span>',Lib.formatTime(ship.estimated_travel_time),'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',ship.speed,'</span></span>,',
                    '            <span>Hold Size:<span>',ship.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',ship.stealth,'</span></span>',
                    '            <span>Combat:<span>',ship.combat,'</span></span>',
                    '        </div>',
                    '    </div>',
                    '    <div class="yui-u" style="width:8%">',
                    ship.task == "Docked" ? '<input type="checkbox" />' : '',
                    '    </div>',
                    '</div>'].join('');
                    
                    if(ship.task == "Docked") {
                        Sel.query("input", nLi, true).Ship = ship;
                    }
                    
                    details.appendChild(nLi);
                }
            }
            detailsParent.appendChild(details); //add back as child
                            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 250;
                if(Ht > 250) { Ht = 250; }
                Dom.setStyle(detailsParent,"height",Ht + "px");
                Dom.setStyle(detailsParent,"overflow-y","auto");
            },10);
        },
        FleetSend : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;

            var speed = parseInt(Dom.get("setSpeed").value,10);
            var selected = Sel.query("input:checked", "sendFleetAvail");
            if(selected.length > 0) {
                var ships = [], shipIds = [], minSpeed = 999999999;
                for(var n=0; n<selected.length; n++) {
                    var s = selected[n].Ship;
                    s.speed = parseInt(s.speed,10); // probably not needed but play it safe
                    ships.push(s);
                    shipIds.push(s.id);
                    if (s.speed < minSpeed) {
                        minSpeed = s.speed;
                    }
                }
                
                if(this.FleetTarget && Lacuna.MapStar.NotFleetIsolationist(ships)) {                    
                    if (speed < 0) {
                        alert('Set speed cannot be less than zero.');
                        btn.disabled = false;
                    }
                    else {
                        if (speed > 0 && speed > minSpeed) {
                            alert('Set speed cannot exceed the speed of the slowest ship.');
                            btn.disabled = false;
                        } else {
                            this.service.send_fleet({
                                session_id:Game.GetSession(),
                                ship_ids:shipIds,
                                target:this.FleetTarget,
                                set_speed:speed
                            }, {
                                success : function(o){
                                    Lacuna.Pulser.Hide();
                                    this.rpcSuccess(o);
                                    btn.disabled = false;
                                    delete this.FleetTarget;
                                    delete this.shipsView;
                                    delete this.shipsTravelling;
                                    this.GetFleetFor();
                                },
                                failure : function(o){
                                    btn.disabled = false;
                                },
                                scope:this
                            });
                        }
                    }
                }
            }
            else {
                btn.disabled = false;
            }
        }
    });
    
    YAHOO.lacuna.buildings.SpacePort = SpacePort;

})();
YAHOO.register("spaceport", YAHOO.lacuna.buildings.SpacePort, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
