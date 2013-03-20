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
            if(this.fleetsPager) {
                this.fleetsPager.destroy();
            }
            if(this.viewPager) {
                this.viewPager.destroy();
            }
            if(this.incomingPager) {
                this.incomingPager.destroy();
            }
            if(this.orbitingPager) {
                this.orbitingPager.destroy();
            }
            SpacePort.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getTravelTab(), this._getViewTab(), this._getOrbitingTab(), this._getIncomingTab(), this._getLogsTab(), this._getSendTab()];
        },
        _getTravelTab : function() {
            this.travelTab = new YAHOO.widget.Tab({ label: "Travelling Fleets", content: [
                '<div>',
                '    <div style="overflow:auto;margin-top:2px;">',
                '        <ul id="fleetDetails"></ul>',
                '    </div>',
                '    <div id="fleetsPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.travelTab.subscribe("activeChange", this.getTravel, this, true);
            
            return this.travelTab;
        },
        _getViewTab : function() {
            this.viewFleetsTab = new YAHOO.widget.Tab({ label: "View Fleets", content: [
                '<div>',
                '    <div class="yui-ge" style="border-bottom:1px solid #52acff;">',
                '      <div id="fleetsCount" class="yui-u first"></div>',
                '      <div class="yui-u">',
                '        <button type="button" id="fleetsRecallAll" style="display:none;">Recall All</button>',
                '      </div>',
                '    </div>',    
                '    <div style="overflow:auto;margin-top:2px;"><ul id="fleetsViewDetails"></ul></div>',
                '    <div id="fleetsViewPaginator"></div>',
                '</div>'
            ].join('')});
            
            //subscribe after adding so active doesn't fire
            this.viewFleetsTab.subscribe("activeChange", this.getFleets, this, true);
            Event.on("fleetsRecallAll", "click", this.FleetRecallAll, this, true);
            
            return this.viewFleetsTab;
        },
        _getOrbitingTab : function() {
            this.viewOrbitingTab = new YAHOO.widget.Tab({ label: "Orbiting Fleets", content: [
                '<div>',
                '    <ul class="fleetHeader fleetInfo clearafter">',
                '        <li class="fleetTypeImage">&nbsp;</li>',
                '        <li class="fleetName">Name</li>',
                '        <li class="fleetQty">Quantity</li>',
                '        <li class="fleetArrives">Arrived</li>',
                '        <li class="fleetFrom">From</li>',
                '    </ul>',
                '    <div><div id="fleetsOrbitingDetails"></div></div>',
                '    <div id="fleetsOrbitingPaginator"></div>',
                '</div>'
            ].join('')});
            this.viewOrbitingTab.subscribe("activeChange", this.getOrbiting, this, true);
            
            return this.viewOrbitingTab;
        },
        _getIncomingTab : function() {
            this.incomingFleetsTab = new YAHOO.widget.Tab({ label: "Incoming Fleets", content: [
                '<div>',
                '    <ul class="fleetHeader fleetInfo clearafter">',
                '        <li class="fleetTypeImage">&nbsp;</li>',
                '        <li class="fleetName">Name</li>',
                '        <li class="fleetArrives">Arrives</li>',
                '        <li class="fleetFrom">From</li>',
                '    </ul>',
                '    <div><div id="fleetsIncomingDetails"></div></div>',
                '    <div id="fleetsIncomingPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.incomingFleetsTab.subscribe("activeChange", this.getIncoming, this, true);
            
            return this.incomingFleetsTab;
        },
        _getLogsTab : function() {
            this.battleLogsTab = new YAHOO.widget.Tab({ label: "Battle Logs", content: [
                '<div>',
                '    <ul class="fleetHeader fleetInfo clearafter" style="padding-left:5px; padding-right:5px;">',
                '        <li class="fleetTask">Role</li>',
                '        <li class="fleetName">Name</li>',
                '        <li class="fleetFrom">From</li>',
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
            this.sendTab = new YAHOO.widget.Tab({ label: "Send Fleet", content: [
                '<div id="sendFleetPick">',
                '    Send To <select id="sendFleetType">',
                '      <option value="body_name">Planet Name</option>',
                '      <option value="body_id">Planet Id</option>',
                '      <option value="star_name">Star Name</option>',
                '      <option value="star_id">Star Id</option>',
                '      <option value="xy">X,Y</option>',
                '    </select>',
                '    <span id="sendFleetTargetSelectText"><input type="text" id="sendFleetTargetText" /></span>',
                '    <span id="sendFleetTargetSelectXY" style="display:none;">',
                '      X:<input type="text" id="sendFleetTargetX" />',
                '      Y:<input type="text" id="sendFleetTargetY" />',
                '    </span>',
                '    <button type="button" id="sendFleetGet">Get Available Fleets For Target</button>',
                '</div>',
                '<div id="sendFleetSend" style="display:none;border-top:1px solid #52ACFF;margin-top:5px;padding-top:5px">',
                '    Sending fleets to: <span id="sendFleetNote"></span><br/>',
                '    <div class="yui-u" style="text-align:right;">',
                '        To Arrive Soonest - <input type="checkbox" id="sendFleetSoonest" checked> ',
                '       Or to Arrive On - ',
                '        Month:<input type="text" id="sendFleetMonth" value="0" size="4">',
                '        Date:<input type="text" id="sendFleetDate" value="0" size="4">',
                '        Hour:<input type="text" id="sendFleetHour" value="0" size="4">',
                '        Minute:<input type="text" id="sendFleetMinute" value="0" size="4">',
                '        Second:<select id="sendFleetSecond">',
                '          <option value="0">0</option>',
                '          <option value="15">15</option>',
                '          <option value="30">30</option>',
                '          <option value="45">45</option>',
                '        </select>',
                '    </div>',
                '    <div style="border-top:1px solid #52ACFF;margin-top:5px;"><ul id="sendFleetAvail"></ul></div>',
                '</div>'
            ].join('')});
            
            Event.on("sendFleetMonth",  "change", function(){Dom.get("sendFleetSoonest").checked = ""});
            Event.on("sendFleetDate",   "change", function(){Dom.get("sendFleetSoonest").checked = ""});
            Event.on("sendFleetHour",   "change", function(){Dom.get("sendFleetSoonest").checked = ""});
            Event.on("sendFleetMinute", "change", function(){Dom.get("sendFleetSoonest").checked = ""});
            Event.on("sendFleetSecone", "change", function(){Dom.get("sendFleetSoonest").checked = ""});
            
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
            Event.on("sendFleetGet", "click", this.GetFleetsFor, this, true);
            
            return this.sendTab;
        },
        getTravel : function(e) {
            if(e.newValue) {
                if(this.fleetsTravelling) {
                    this.SpacePortPopulate();
                }
                else {
                    Lacuna.Pulser.Show();
                    this.service.view_travelling_fleets({ args: {
                        session_id:Game.GetSession(),
                        building_id:this.building.id,
                        page_number:1
                        }}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_travelling_fleets.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.fleetsTravelling = {
                                number_of_fleets_travelling: o.result.number_of_fleets_travelling,
                                number_of_ships_travelling: o.result.number_of_ships_travelling,
                                travelling: o.result.travelling
                            };
                            this.fleetsPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_fleets_travelling,
                                containers  : 'fleetsPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.fleetsPager.subscribe('changeRequest',this.FleetHandlePagination, this, true);
                            this.fleetsPager.render();
                            
                            this.SpacePortPopulate();
                        },
                        scope:this
                    });
                }
            }
        },
        getFleets : function(e) {
            if(e.newValue) {
                if(!this.fleetsView) {
                    Lacuna.Pulser.Show();
                    this.service.view_all_fleets({args: {
                        session_id: Game.GetSession(),
                        building_id: this.building.id,
                        paging: {page_number: 1}
                    }}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_all_fleets.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.fleetsView = {
                                number_of_fleets: o.result.number_of_fleets,
                                fleets: o.result.fleets
                            };
                            this.viewPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_fleets,
                                containers  : 'fleetsViewPaginator',
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
        getIncoming : function(e) {
            if(e.newValue) {
                if(!this.fleetsIncoming) {
                    Lacuna.Pulser.Show();
                    this.service.view_incoming_fleets({args: {
                        session_id:Game.GetSession(),
                        target: {body_id: Game.GetCurrentPlanet().id },
                        page_number:1
                    }}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_incoming_fleets.success");
                            Lacuna.Pulser.Hide();
                            this.rpcSuccess(o);
                            this.fleetsIncoming = {
                                number_of_incoming: o.result.number_of_incoming,
                                incoming: o.result.incoming
                            };
                            this.incomingPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_incoming,
                                containers  : 'fleetsIncomingPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.incomingPager.subscribe('changeRequest',this.IncomingHandlePagination, this, true);
                            this.incomingPager.render();
                            
                            this.IncomingPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.IncomingPopulate();
                }
            }
        },
        getLogs : function(e) {
            if(e.newValue) {
                if(!this.battleLogs) {
                    Lacuna.Pulser.Show();
                    this.service.view_battle_logs({ args: {
                        session_id:Game.GetSession(),
                        building_id: this.building.id
                    }}, {
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
                if(!this.fleetsOrbiting) {
                    Lacuna.Pulser.Show();
                    this.service.view_orbiting_fleets({args : {
                        session_id: Game.GetSession(),
                        target: {body_id: Game.GetCurrentPlanet().id}
                    }}, {
                        success : function(o){
                            Lacuna.Pulser.Hide();
                            console.log(o); //debug
                            this.rpcSuccess(o);
                            this.fleetsOrbiting = {
                                number_of_fleets: o.result.orbiting.length,
                                fleets: o.result.orbiting
                            };
                            this.orbitingPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_fleets,
                                containers  : 'fleetsOrbitingPaginator',
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
            var fleets = this.fleetsTravelling.travelling,
                details = Dom.get("fleetDetails");

            if(details) {
                var parentEl = details.parentNode,
                    li = document.createElement("li"),
                    serverTime = Lib.getTime(Game.ServerData.time);

                Event.purgeElement(details, true);
                details = parentEl.removeChild(details);
                details.innerHTML = "";
                
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(fleet.date_arrives) - serverTime) / 1000;
                    
                    nLi.innerHTML = ['<div class="yui-g" style="margin-bottom:2px;">',
                    '<div class="yui-g first">',
                    '    <div class="yui-u first" style="background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" title="',fleet.details.type_human,'" style="width:105px;height:105px;" />',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <span class="fleetName">',fleet.details.name,'</span>: ',
                    '        <ul>',
                    this.ViewActionDetails(nLi, fleet),
                    '        </ul>',
                    '    </div>',
                    '</div>',
                    '<div class="yui-g">',
                    '    <div class="yui-u first">',
                    '        <ul>',
                    '        <li><label style="font-weight:bold;">Attributes:</label></li>',
                    '<li style="white-space:nowrap;"><label style="font-style:italic">Fleet Size: </label>',fleet.quantity,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Speed: </label>', fleet.details.speed,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Hold Size: </label>',fleet.details.hold_size,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Stealth: </label>',fleet.details.stealth,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Combat: </label>',fleet.details.combat,'</li>',
                    '        <li style="white-space:nowrap;"><label style="font-style:italic">Occupants: </label>',fleet.details.max_occupants,'</li>',                    '        </ul>',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <div><label style="font-weight:bold;">Payload:</label></div>',
                    Lib.formatInlineList(fleet.details.payload),
                    '    </div>',
                    '</div>',
                    '</div>'].join('');
                    var sn = Sel.query("span.fleetName",nLi,true);
                    Event.on(sn, "click", this.FleetRename, {Self:this,Fleet:fleet,el:sn}, true);

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
                    },
                    10
                );
            }
        },
        FleetHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_travelling_fleets({ args: {
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }}, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.FleetHandlePagination.view_travelling_fleets.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.fleetsTravelling = {
                        number_of_fleets_travelling: o.result.number_of_fleets_travelling,
                        number_of_ships_travelling: o.result.number_of_ships_travelling,
                        travelling: o.result.travelling
                    };
                    this.SpacePortPopulate();
                },
                scope:this
            });

            // Update the Paginator's state
            this.fleetsPager.setState(newState);
        },
        SpacePortQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("span.fleetArrives",elLine,true).innerHTML = arrTime;
        },

        ViewActionDetails : function(nLi, fleet, noEvent) {
            var ulDet = ['<li style="white-space:nowrap;"><label style="font-weight:bold;">',fleet.task,'</label></li>'];

            if (fleet.details.can_scuttle) {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;margin-top:5px">';
                ulDet[ulDet.length] = '<input type="text" class="scuttle_qty" style="width:25px;" value="' + parseInt(fleet.quantity) + '">';
                ulDet[ulDet.length] = '<button type="button" class="scuttle">Scuttle</button></li>';

                if(!noEvent) {
                    Event.delegate(nLi, 'click', this.FleetScuttle, 'button.scuttle', {Self:this,Fleet:fleet,Line:nLi}, true);
                }
            }
            
            if (fleet.task == "Travelling") {
                var serverTime = Lib.getTime(Game.ServerData.time),
                    sec = (Lib.getTime(fleet.date_arrives) - serverTime) / 1000;
                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><label style="font-style:italic">From: </label><span class="fleetFrom">';
                ulDet[ulDet.length] = fleet.from.name;
                ulDet[ulDet.length] = '</span></li><li style="white-space:nowrap;"><label style="font-style:italic">To: </label><span class="fleetTo">';
                ulDet[ulDet.length] = fleet.to.name;
                ulDet[ulDet.length] = '</span></li>';

                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><label style="font-style:italic">Arrives In: </label><span class="fleetArrives">';
                ulDet[ulDet.length] = Lib.formatTime(sec);
                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><label style="font-style:italic">Arrives At: </label><span class="fleetArrives">';
                ulDet[ulDet.length] = Lib.parseArrivalTime(fleet.date_arrives);
                ulDet[ulDet.length] = '</span></li>',

                this.addQueue(sec, this.SpacePortQueue, nLi);
            }

            if (fleet.details.can_recall) {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;"><span class="fleetTo">';
                ulDet[ulDet.length] = fleet.name;
                ulDet[ulDet.length] = '</span></li>';
                ulDet[ulDet.length] = '<li style="white-space:nowrap;margin-top:5px">';
                ulDet[ulDet.length] = '<input type="text" class="recall_qty" style="width:25px;" value="'+fleet.quantity+'">';
                ulDet[ulDet.length] = '<button type="button" class="recall">Recall</button></li>';
                if(!noEvent) {
                    Event.delegate(nLi, 'click', this.FleetRecall, 'button.recall', {Self:this,Fleet:fleet,Line:nLi,QtyDom:'fleet_action_'+fleet.id}, true);
                }
            }

            if(fleet.payload && fleet.payload.length > 0) {
                ulDet[ulDet.length] = '<li style="white-space:nowrap;margin-top:5px"><button type="button" class="payload">Payload</button></li>';

                if(!noEvent) {
                    Event.delegate(nLi, 'click', function(e, matchedEl, container){
                        var div = Sel.query('div.fleetPayload', container);
                        curDis = Dom.getStyle(div[0], "display");
                        Dom.setStyle(div, "display", curDis == "none" ? "" : "none");
                        }, 'button.payload', this, true);
                }
            }

            return ulDet.join('');
        },
        ViewPopulate : function() {
            var details = Dom.get("fleetsViewDetails");

            if (details) {
                var fleets = this.fleetsView.fleets,
                    parentEl = details.parentNode,
                    li = document.createElement("li"),
                    info = Dom.get("fleetsCount"),
                    displayRecallAll;

                Event.purgeElement(details, true);
                details = parentEl.removeChild(details);
                details.innerHTML = "";

                if (info && this.result.max_ships > 0) {
                    info.innerHTML = ['<div>This SpacePort can dock a maximum of ', this.result.max_ships, ' ships. There are ', this.result.docks_available, ' docks available.'].join(''); 
                }               

                for (var i = 0; i < fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);

                    Dom.setStyle(nLi, "margin-top", "3px");
                    nLi.innerHTML = ['<div class="yui-g" style="margin-bottom:2px;">',
                        '<div class="yui-g first">',
                        '    <div class="yui-u first" style="background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                        '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" title="',fleet.details.type_human,'" style="width:115px;height:115px;" />',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <span class="fleetName">',fleet.details.name,'</span>: ',
                        '        <ul class="fleetActionDetails">',
                        this.ViewActionDetails(nLi, fleet),
                        '        </ul>',
                        '    </div>',
                        '</div>',
                        '<div class="yui-g">',
                        '    <div class="yui-u first">',
                        '        <ul>',
                        '        <li><label style="font-weight:bold;">Attributes:</label></li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Speed: </label>',fleet.details.speed,'</li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Hold Size: </label>',fleet.details.hold_size,'</li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Berth Level: </label>',fleet.details.berth_level,'</li>',
                        '        </ul>',
                        '        <div class="fleetPayload" style="display:none;margin-top:5px"><div><label style="font-weight:bold;">Payload:</label></div>',
                        Lib.formatInlineList(fleet.details.payload, 0, 3),
                        '</div>',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <ul>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Fleet Size: </label>',parseInt(fleet.quantity),'</li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Occupants: </label>',fleet.details.max_occupants,'</li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Stealth: </label>',fleet.details.stealth,'</li>',
                        '        <li style="white-space:nowrap;"><label style="font-style:italic">Combat: </label>',fleet.details.combat,'</li>',
                        '        </ul>',
                        '        <div class="fleetPayload" style="display:none;margin-top:5px">',
                        Lib.formatInlineList(fleet.details.payload, 3),
                        '        </div>',
                        '    </div>',
                        '</div>',
                        '</div>'].join('');
           
                    if (fleet.task == "Defend" || fleet.task == "Orbiting") {
                        displayRecallAll = true;
                    }
           
                    var sn = Sel.query("span.fleetName", nLi, true);
                    Event.on(sn, "click", this.FleetRename, {Self :this, Fleet: fleet, el: sn}, true);

                       
                    details.appendChild(nLi);
                }
       
                if(displayRecallAll) {
                    Dom.setStyle("fleetsRecallAll","display","");
                }
                else {
                    Dom.setStyle("fleetsRecallAll","display","none");
                }
       
                //add child back in
                parentEl.appendChild(details);
       
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 230;
                    if (Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC, "height", Ht + "px");
                    Dom.setStyle(tC, "overflow-y", "auto");
                }, 10);
            }
        },
        ViewHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_all_fleets({ args: {
                session_id:Game.GetSession(),
                building_id:this.building.id,
                paging:{page_number:newState.page}
            }}, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.ViewHandlePagination.view_all_fleets.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.fleetsView = {
                        number_of_fleets: o.result.number_of_fleets,
                        fleets: o.result.fleets
                    };
                    this.ViewPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.viewPager.setState(newState);
        },
        
        FleetRename : function() {
            this.el.innerHTML = "";
            
            var inp = document.createElement("input"),
                inp_qty = document.createElement("input"),
                bSave = document.createElement("button"),
                bCancel = bSave.cloneNode(false);
            inp.type = "text";
            inp.value = this.Fleet.details.name;
            this.Input = inp;

            inp_qty.type = "text";
            inp_qty.value = this.Fleet.quantity;
            inp_qty.setAttribute("style", "width:25px;");
            this.InputQty = inp_qty;

            bSave.setAttribute("type", "button");
            bSave.innerHTML = "Save";
            Event.on(bSave,"click",this.Self.FleetRenameSave,this,true);
            bCancel.setAttribute("type", "button");
            bCancel.innerHTML = "Cancel";
            Event.on(bCancel,"click",this.Self.FleetRenameClear,this,true);
                        
            Event.removeListener(this.el, "click");        
                
            this.el.appendChild(inp);
            this.el.appendChild(inp_qty);
            this.el.appendChild(document.createElement("br"));
            this.el.appendChild(bSave);
            this.el.appendChild(bCancel);
        },
        FleetRenameSave : function(e) {
            Event.stopEvent(e);
            Lacuna.Pulser.Show();
            var newName = this.Input.value;
            var qty = this.InputQty.value; 
            this.Self.service.rename_fleet({ args: {
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                fleet_id:this.Fleet.id,
                quantity:qty,
                name:newName
            }}, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.FleetRenameSave.success");
                    Lacuna.Pulser.Hide();
                    this.Self.rpcSuccess(o);
                    delete this.Self.fleetsView;
                    delete this.Self.fleetsTravelling;
                    this.Self.getFleets({newValue:true});
                    this.Self.getTravel({newValue:true});
                },
                failure : function(o){
                    if(this.Input) {
                        this.Input.value = this.Fleet.details.name;
                    }
                },
                scope:this
            });
        },
        FleetRenameClear : function(e) {
            if(e) { Event.stopEvent(e); }
            if(this.Input) {
                delete this.Input;
            }
            if(this.el) {
                Event.purgeElement(this.el, true);
                this.el.innerHTML = this.Fleet.details.name;
                Event.on(this.el, "click", this.Self.FleetRename, this, true);
            }
        },
        
        IncomingPopulate : function() {
            var details = Dom.get("fleetsIncomingDetails");
            
            if(details) {
                var fleets = this.fleetsIncoming.incoming,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                
                fleets = fleets.slice(0);
                fleets.sort(function(a,b) {
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

                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(fleet.date_arrives) - serverTime) / 1000;
                        
                    nUl.Fleet = fleet;
                    Dom.addClass(nUl, "fleetInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"fleetTypeImage");
                    Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
                    Dom.setStyle(nLi, "text-align", "center");
                    if (fleet.details) {
                        nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" title="',fleet.details.type_human,'" style="width:50px;height:50px;" />'].join('');
                    }
                    else {
                        nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/unknown.png" title="Unknown" style="width:50px;height:50px;" />'].join('');
                    }
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetName");
                    if (fleet.details) {
                        nLi.innerHTML = fleet.details.name+' ('+fleet.quantity+')';
                    }
                    else {
                        nLi.innerHTML = 'Unknown ('+fleet.quantity+')';
                    }
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetArrives");
                    nLi.innerHTML = Lib.formatTime(sec) + ' ' + Lib.parseArrivalTime(fleet.date_arrives);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetFrom");
                    if (fleet.from && fleet.from.name) {
                        if (fleet.from.empire && fleet.from.empire.name) {
                            nLi.innerHTML = fleet.from.owner + ' - ' + fleet.from.name + ' <span style="cursor:pointer;">[' + fleet.from.empire.name + ']</span>';
                            Event.on(nLi, "click", this.EmpireProfile, fleet.from.empire);
                        }
                        else {
                            nLi.innerHTML = fleet.from.owner + ' - ' + fleet.from.name;
                        }
                    }
                    else {
                        nLi.innerHTML = 'Unknown';
                    }
                    nUl.appendChild(nLi);

                    this.addQueue(sec, this.IncomingQueue, nUl);
                                
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
                        
                    Dom.addClass(nUl, "fleetInfo");
                    Dom.addClass(nUl, "clearafter");
                    if (!details.children.length) Dom.addClass(nUl, "first");
                    Dom.addClass(nUl, "attacker");

                    Dom.addClass(nLi,"fleetTask");
                    nLi.innerHTML = 'Attacker';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetName");
                    nLi.innerHTML = log.attacking_unit;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetFrom");
                    nLi.innerHTML = log.attacking_body + ' [' + log.attacking_empire + ']';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    nLi.innerHTML = '<label>Arrived:</label> ' + log.date;
                    nUl.appendChild(nLi);

                    details.appendChild(nUl);

                    nUl = ul.cloneNode(false),
                    Dom.addClass(nUl, "fleetInfo");
                    Dom.addClass(nUl, "clearafter");
                    Dom.addClass(nUl, "defender");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetTask");
                    nLi.innerHTML = 'Defender';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetName");
                    nLi.innerHTML = log.defending_unit;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetFrom");
                    nLi.innerHTML = log.defending_body + ' [' + log.defending_empire + ']';
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    nLi.innerHTML = '<label>Victory:</label> ' + log.victory_to.replace(/^\w/, function(c){return c.toUpperCase()});
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
        IncomingHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_incoming_fleets({ args: {
                session_id:Game.GetSession(),
                target: {body_id: Game.GetCurrentPlanet().id },
                page_number:newState.page
            }}, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.view_incoming_fleets.success");
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.fleetsIncoming = {
                        number_of_incoming: o.result.number_of_incoming,
                        incoming: o.result.incoming
                    };
                    this.IncomingPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.incomingPager.setState(newState);
        },
        LogsHandlePagination : function(newState) {
            Lacuna.Pulser.Show();
            this.service.view_battle_logs({args: {
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }}, {
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
        IncomingQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("li.fleetArrives",elLine,true).innerHTML = arrTime;
        },
        
        OrbitingPopulate : function() {
            var details = Dom.get("fleetsOrbitingDetails");
            
            if(details) {
                var fleets = this.fleetsOrbiting.fleets,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                
                //fleets = fleets.slice(0);
                fleets.sort(function(a,b) {
                    if(a.details.date_available || b.details.date_available) {
                        if (a.details.date_available > b.details.date_available) {
                            return 1;
                        }
                        else if (a.details.date_available < b.details.date_available) {
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
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                    nUl.Fleet = fleet;
                    Dom.addClass(nUl, "fleetInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"fleetTypeImage");
                    Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
                    Dom.setStyle(nLi, "text-align", "center");
                    nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" title="',fleet.details.type_human,'" style="width:50px;height:50px;" />'].join('');
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetName");
                    nLi.innerHTML = fleet.details.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetQty");
                    nLi.innerHTML = fleet.quantity;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetArrives");
                    nLi.innerHTML = Lib.formatServerDate(fleet.details.date_available);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"fleetFrom");
                    if(fleet.from && fleet.from.name) {
                        if(fleet.from.empire && fleet.from.empire.name) {
                            nLi.innerHTML = fleet.from.name + ' <span style="cursor:pointer;">[' + fleet.from.empire.name + ']</span>';
                            Event.on(nLi, "click", this.EmpireProfile, fleet.from.empire);
                        }
                        else {
                            nLi.innerHTML = fleet.from.name;
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
            this.service.view_orbiting_fleets({args : {
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }}, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.fleetsOrbiting = {
                        number_of_fleets: o.result.number_of_fleets,
                        fleets: o.result.fleets
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
        FleetScuttle : function(e, matchedEl, container) {
            var to_delete = Dom.getElementsByClassName('scuttle_qty', 'input', this.Line)[0].value;
            var fleetName = Dom.getElementsByClassName('fleetName', 'span', this.Line)[0].childNodes[0].data;
            
            if(confirm('Are you sure you want to Scuttle ' + parseInt(to_delete) + ' ' + fleetName + '?')) {
                var btn = Event.getTarget(e);
                btn.disabled = true;
                Lacuna.Pulser.Show();
                to_delete *= 1.0;

                this.Self.service.scuttle_fleet({ args: {
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    fleet_id:this.Fleet.id,
                    quantity: to_delete
                }}, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.FleetScuttle.success");
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);

                        delete this.Self.fleetsView;
                        delete this.Self.fleetsTravelling;
                        this.Self.getFleets({newValue:true});
                        this.Self.getTravel({newValue:true});
                    },
                    failure : function(o){
                        btn.disabled = false;
                    },
                    scope:this
                });
            }
        },
        FleetRecall : function(e, matchedEl, container) {
            matchedEl.disabled = true;
            Lacuna.Pulser.Show();
            var xxx = Dom.getElementsByClassName('recall_qty','input', this.Line);
            var to_recall = xxx[0].value;

            this.Self.service.recall_fleet({ args: {
                session_id:Game.GetSession(),
                fleet_id:this.Fleet.id,
                quantity:to_recall
            }}, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.Self.rpcSuccess(o);
                    
                    delete this.Self.fleetsTravelling;
                    delete this.Self.fleetsView;
                    this.Self.getFleets({newValue:true});
                    this.Self.getTravel({newValue:true});
                },
                failure : function(o){
                    matchedEl.disabled = false;
                },
                scope:this
            });
        },
        FleetRecallAll : function(e) {
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
                    
                    delete this.fleetsTravelling;
                    delete this.fleetsView;
                    this.getFleets({newValue:true});
                    this.getTravel({newValue:true});
                },
                failure : function(o){
                    btn.disabled = false;
                },
                scope:this
            });
        },
        
        GetFleetsFor : function() {
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
            
            this.service.view_available_fleets({ args : {
                session_id: Game.GetSession(),
                body_id: Game.GetCurrentPlanet().id,
                target: target
            }}, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    this.rpcSuccess(o);
                    this.PopulateFleetsSendTab(target, o.result.available);
                },
                scope:this
            });
            
        },
        PopulateFleetsSendTab : function(target, fleets) {
            var details = Dom.get("sendFleetAvail"),
                detailsParent = details.parentNode,
                li = document.createElement("li");
                
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            Dom.setStyle("sendFleetSend", "display", "");
            
            if(fleets.length === 0) {
                details.innerHTML = "No available fleets to send.";
            }
            else {                
                for(var i = 0; i < fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:15%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:60px;height:60px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:52%">',
                    '        <div class="buildingName">[',fleet.details.type_human,'] ',fleet.details.name,' Quantity ',fleet.quantity,'</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span>Task:<span>',fleet.task,'</span></span>,',
                    '            <span>Earliest Arrival: <span>',
                                    fleet.earliest_arrival.month,'-',
                                    fleet.earliest_arrival.day,' ',
                                    fleet.earliest_arrival.hour, ':',
                                    fleet.earliest_arrival.minute, ':',
                                    fleet.earliest_arrival.second,
                    '            </span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',fleet.details.speed,'</span></span>,',
                    '            <span>Hold Size:<span>',fleet.details.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',fleet.details.stealth,'</span></span>',
                    '            <span>Combat:<span>',fleet.details.combat,'</span></span>',
                    '        </div>',
                    '    </div>',
                    '    <div class="yui-u" style="width:5%">',
                    fleet.task == "Docked"
                                ? '<span style="white-space:nowrap;margin-top:5px"><input type="text" id="send_fleet_quantity_'+fleet.id+'" style="width:35px;" value="'+Math.floor(fleet.quantity)+'"></span></div><div class="yui-u" style="width:15%"><button type="button" id="send_fleet_'+fleet.id+'">Send Fleet</button><button type="button" id="send_ship_'+fleet.id+'">Send 1 Ship</button>'
                                : '</div><div class="yui-u" style="width:15%">',
                    '    </div>',
                    '</div>'].join('');
                    
                    details.appendChild(nLi);
                    
                    if (fleet.task == "Docked") {
                        Event.on("send_fleet_"+fleet.id, "click", this.FleetSend, {Self:this, Fleet:fleet, Target:target, Line:nLi}, true);
                        Event.on("send_ship_"+fleet.id,  "click", this.FleetSend, {Self:this, Fleet:fleet, Target:target, Line:nLi, Quantity:1}, true);
                    }
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
        
            var oSelf = this.Self,
                fleet = this.Fleet,
                target = this.Target,
                quantity = this.Quantity,
                arriveSoonest = Dom.get("sendFleetSoonest").checked,
                arriveMonth = Dom.get("sendFleetMonth").value,
                arriveDate = Dom.get("sendFleetDate").value,
                arriveHour = Dom.get("sendFleetHour").value,
                arriveMinute = Dom.get("sendFleetMinute").value,
                arriveSecond = Dom.get("sendFleetSecond").value,
                arrival_date;
            if ( !quantity ) {
                quantity = Dom.get("send_fleet_quantity_"+fleet.id).value;
            }
            
            if (arriveSoonest) {
                arrival_date = {soonest: 1 };
            }
            else {
                arrival_date = {
                    month: arriveMonth,
                    date: arriveDate,
                    hour: arriveHour,
                    minute: arriveMinute,
                    second: arriveSecond
                };
            }
            if(target && fleet.id && Lacuna.MapStar.NotIsolationist(fleet)) {
                Lacuna.Pulser.Show();
                oSelf.service.send_fleet({ args: {
                    session_id:Game.GetSession(),
                    fleet_id:fleet.id,
                    quantity: quantity,
                    arrival_date: arrival_date,
                    target:target
                }}, {
                    success : function(o){
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);
                        delete this.Self.fleetsView;
                        delete this.Self.fleetsTravelling;
                        this.Self.GetFleetsFor();
                        Event.purgeElement(this.Line, true);
                        this.Line.innerHTML = "Successfully sent " + this.Fleet.type_human + ".";
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
                
        PopulateFleetSendTab : function(target, fleets) {
            var details = Dom.get("sendFleetAvail"),
                detailsParent = details.parentNode,
                li = document.createElement("li");
                
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            this.FleetTarget = target;
            
            Dom.setStyle("sendFleetSend", "display", "");
            
            if(fleets.length === 0) {
                details.innerHTML = "No available fleets to send.";
            }
            else {
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:15%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.type,'.png" style="width:60px;height:60px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:67%">',
                    '        <div class="buildingName">[',fleet.type_human,'] ',fleet.name,'</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span>Task:<span>',fleet.task,'</span></span>,',
                    '            <span>Travel Time:<span>',Lib.formatTime(fleet.estimated_travel_time),'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',fleet.speed,'</span></span>,',
                    '            <span>Hold Size:<span>',fleet.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',fleet.stealth,'</span></span>',
                    '            <span>Combat:<span>',fleet.combat,'</span></span>',
                    '        </div>',
                    '    </div>',
                    '    <div class="yui-u" style="width:8%">',
                    fleet.task == "Docked" ? '<input type="checkbox" />' : '',
                    '    </div>',
                    '</div>'].join('');
                    
                    if(fleet.task == "Docked") {
                        Sel.query("input", nLi, true).Fleet = fleet;
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
        }
    });
    
    YAHOO.lacuna.buildings.SpacePort = SpacePort;

})();
YAHOO.register("spaceport", YAHOO.lacuna.buildings.SpacePort, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
