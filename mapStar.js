YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapStar == "undefined" || !YAHOO.lacuna.MapStar) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;
        
    var MapStar = function() {
        this.createEvent("onMapRpc");
        //this.createEvent("onChangeToSystemView");
        this.createEvent("onChangeToPlanetView");
        
        this._renameLabel = "Rename";
        this._sendLabel = "Send";
        this._unavailableLabel = "Unavailable";
        this._incomingLabel = "Incoming";
        this._orbitingLabel = "Orbiting";
        this._miningLabel = "Mining";
        this._excavLabel = "Excavators";
        this._sendSpiesLabel = "Send Spy";
        this._fetchSpiesLabel = "Fetch Spy";
        
        this._buildDetailsPanel();
        this._buildPlanetDetailsPanel();
        this._buildFindPanel();
    };
    MapStar.prototype = {
        _buildDetailsPanel : function() {
            var panelId = "starDetails";
            
            var panel = document.createElement("div");
            panel.id = panelId;
            panel.innerHTML = ['<div class="hd">Details</div>',
                '<div class="bd">',
                '    <div class="yui-g">',
                '        <div class="yui-u first" id="starDetailsImg" class="background:black:width:100px;">',
                '        </div>',
                '        <div class="yui-u" id="starDetailsInfo">',
                '        </div>',
                '    </div>',
                '    <div id="starDetailTabs" class="yui-navset">',
                '        <ul class="yui-nav">',
                '            <li><a href="#"><em>',this._sendLabel,'</em></a></li>',
                '            <li><a href="#"><em>',this._unavailableLabel,'</em></a></li>',
                '            <li><a href="#"><em>',this._incomingLabel,'</em></a></li>',
                '        </ul>',
                '        <div class="yui-content">',
                '            <div id="starDetailSendShips">',
                '                <div>',
                '                    To Arrive Soonest <input type="checkbox" id="sendStarFleetSoonest" checked="checked"><br />',
				'					<span id="starDetailsSendShipSpecificTime" style="display:none">',
                '                    	Or to Arrive On: ',
                '                    	Month: <input type="text" id="sendStarFleetMonth" value="0" size="4">',
                '                    	Date: <input type="text" id="sendStarFleetDate" value="0" size="4">',
                '                    	Hour: <input type="text" id="sendStarFleetHour" value="0" size="4">',
                '                    	Minute: <input type="text" id="sendStarFleetMinute" value="0" size="4">',
                '                    	Second: <select id="sendStarFleetSecond">',
                '                        	<option value="0">0</option>',
                '                        	<option value="15">15</option>',
                '                        	<option value="30">30</option>',
                '                        	<option value="45">45</option>',
                '                    	</select>',
				'					</span>',
                '                </div>',
                '                <div><ul class="responseContainer"></ul></div></div>',
                '            <div id="starDetailUnavailShips"><div><ul class="responseContainer"></ul></div></div>',
                '            <div id="starDetailIncomingShips"><div><ul class="responseContainer"></ul></div></div>',
                '        </div>',
                '    </div>',
                '</div>'
			].join('');
            
            Event.on("sendStarFleetMonth",  "change", function(){Dom.get("sendStarFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendStarFleetDate",   "change", function(){Dom.get("sendStarFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendStarFleetHour",   "change", function(){Dom.get("sendStarFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendStarFleetMinute", "change", function(){Dom.get("sendStarFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendStarFleetSecone", "change", function(){Dom.get("sendStarFleetSoonest").checked = ""; this.checkboxState = true;});
			
			this.checkboxState = true; // Sadly, this is the way to go.
			Event.on("sendStarFleetSoonest", "change", function(e) {
				var checkbox = Dom.get("sendStarFleetSoonest");
				var sendDetails = Dom.get("starDetailsSendShipSpecificTime");
				this.Self.checkboxState = !this.Self.checkboxState;
				
				sendDetails.style.display = this.Self.checkboxState ? 'none' : '';
			}, {Self: this}, true);
			
            document.body.insertBefore(panel, document.body.firstChild);
            Dom.addClass(panel, "nofooter");
            
            this.starDetails = new YAHOO.widget.Panel(panelId, {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                fixedcenter:false,
                close:true,
                underlay:false,
                width:"710px",
                zIndex:9997,
                context:["header","tl","bl"]
            });
            this.starDetails.addQueue = function(seconds, queueFn, elm, sc) {
                this.queue = this.queue || [];
                //check if the queue is empty and store
                var notStarted = this.queue.length == 0;
                //push new queue item so it's immediately available for the tick
                this.queue.push({secondsRemaining:seconds*1, el:elm, fn:queueFn, scope:sc});
                //make sure we subscribe to the tick
                if(notStarted) {
                    Game.onTick.subscribe(this.processQueue, this, true);
                }
            };
            this.starDetails.processQueue = function(e, oArgs) {
                if(this.queue.length > 0) {
                    var queue = this.queue,
                        diff = oArgs[0]/1000,
                        newq = [];

                    while(queue.length > 0) {
                        var callback = queue.pop();
                        callback.secondsRemaining -= diff;
                        if(callback.secondsRemaining > 0) {
                            newq.push(callback);
                        }
                        callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el);
                    }
                    this.queue = newq;
                }
                else {
                    Game.onTick.unsubscribe(this.processQueue);
                }
            };
            this.starDetails.resetQueue = function() {
                Game.onTick.unsubscribe(this.processQueue);
                this.queue = [];
            };
            this.starDetails.addTab = function(tab) {
                this.removeableTabs = this.removeableTabs || [];
                this.removeableTabs.push(tab);
                this.tabView.addTab(tab);
            };
            this.starDetails.removeTabs = function() {
                var rt = this.removeableTabs;
                if(rt && rt.length > 0) {
                    for(var n=0; n<rt.length; n++) {
                        Event.purgeElement(rt[n].get("contentEl"), true);
                        this.tabView.removeTab(rt[n]);
                    }
                    delete this.removeableTabs;
                }
                this.tabView.selectTab(0);
            };
            this.starDetails.resetDisplay = function(oSelf) {
                delete oSelf.availableFleets;
                delete oSelf.unavailableFleets;
                delete oSelf.incomingFleets;
                delete oSelf.selectedStar;
				oSelf.checkboxState = true;
                this.resetQueue();
                this.removeTabs();
            };
            
            this.starDetails.renderEvent.subscribe(function(){
                this.starDetails.tabView = new YAHOO.widget.TabView("starDetailTabs");
                
                /*Event.delegate("starDetailsInfo", "click", function(e, matchedEl, container){
                    var data = this.selectedStar;
                    if(data) {
                        if(matchedEl.innerHTML == "Send Probe") {
                            this.SendProbe(data);
                        }
                    }
                }, "button", this, true);*/
            }, this, true);
            this.starDetails.hideEvent.subscribe(function(){
                this.starDetails.resetDisplay(this);
            }, this, true);
            this.starDetails.showEvent.subscribe(function(){
                this.bringToTop();
            });
            
            this.starDetails.isStarPanel = true;
            
            this.starDetails.render();
            Game.OverlayManager.register(this.starDetails);
        },
        _buildPlanetDetailsPanel : function() {
            var panelId = "planetDetails";
            var panel = document.createElement("div");
            panel.id = panelId;
            panel.innerHTML = ['<div class="hd">Details</div>',
                '<div class="bd">',
                '    <div class="yui-g">',
                '        <div class="yui-u first" id="planetDetailsImg">',
                '        </div>',
                '        <div class="yui-u" id="planetDetailsInfo">',
                '        </div>',
                '    </div>',
                '    <div id="planetDetailTabs" class="yui-navset">',
                '        <ul class="yui-nav">',
                '            <li><a href="#planetDetailOre"><em>Ore</em></a></li>',
                '            <li><a href="#planetDetailSend"><em>',this._sendLabel,'</em></a></li>',
                '            <li><a href="#planetDetailUnavailShips"><em>',this._unavailableLabel,'</em></a></li>',
                '            <li><a href="#planetDetailIncomingShips"><em>',this._incomingLabel,'</em></a></li>',
                '            <li><a href="#planetDetailOrbitingShips"><em>',this._orbitingLabel,'</em></a></li>',
                '            <li><a href="#planetDetailMiningShips"><em>',this._miningLabel,'</em></a></li>',
                '            <li><a href="#planetDetailExcavators"><em>',this._excavLabel,'</em></a></li>',
                '            <li><a href="#planetDetailRename"><em>',this._renameLabel,'</em></a></li>',
                '            <li><a href="#planetDetailSendSpies"><em>',this._sendSpiesLabel,'</em></a></li>',
                '            <li><a href="#planetDetailFetchSpies"><em>',this._fetchSpiesLabel,'</em></a></li>',
                '        </ul>',
                '        <div class="yui-content">',
                '            <div id="planetDetailOre">',
                '                <div class="yui-g">',
                '                    <div class="yui-u first">',
                '                        <ul>',
                '                            <li><label>Anthracite</label><span class="buildingDetailsNum" id="planetDetailsAnthracite"></span></li>',
                '                            <li><label>Bauxite</label><span class="buildingDetailsNum" id="planetDetailsBauxite"></span></li>',
                '                            <li><label>Beryl</label><span class="buildingDetailsNum" id="planetDetailsBeryl"></span></li>',
                '                            <li><label>Chalcopyrite</label><span class="buildingDetailsNum" id="planetDetailsChalcopyrite"></span></li>',
                '                            <li><label>Chromite</label><span class="buildingDetailsNum" id="planetDetailsChromite"></span></li>',
                '                            <li><label>Fluorite</label><span class="buildingDetailsNum" id="planetDetailsFluorite"></span></li>',
                '                            <li><label>Galena</label><span class="buildingDetailsNum" id="planetDetailsGalena"></span></li>',
                '                            <li><label>Goethite</label><span class="buildingDetailsNum" id="planetDetailsGoethite"></span></li>',
                '                            <li><label>Gold</label><span class="buildingDetailsNum" id="planetDetailsGold"></span></li>',
                '                            <li><label>Gypsum</label><span class="buildingDetailsNum" id="planetDetailsGypsum"></span></li>',
                '                        </ul>',
                '                    </div>',
                '                    <div class="yui-u">',
                '                        <ul>',
                '                            <li><label>Halite</label><span class="buildingDetailsNum" id="planetDetailsHalite"></span></li>',
                '                            <li><label>Kerogen</label><span class="buildingDetailsNum" id="planetDetailsKerogen"></span></li>',
                '                            <li><label>Magnetite</label><span class="buildingDetailsNum" id="planetDetailsMagnetite"></span></li>',
                '                            <li><label>Methane</label><span class="buildingDetailsNum" id="planetDetailsMethane"></span></li>',
                '                            <li><label>Monazite</label><span class="buildingDetailsNum" id="planetDetailsMonazite"></span></li>',
                '                            <li><label>Rutile</label><span class="buildingDetailsNum" id="planetDetailsRutile"></span></li>',
                '                            <li><label>Sulfur</label><span class="buildingDetailsNum" id="planetDetailsSulfur"></span></li>',
                '                            <li><label>Trona</label><span class="buildingDetailsNum" id="planetDetailsTrona"></span></li>',
                '                            <li><label>Uraninite</label><span class="buildingDetailsNum" id="planetDetailsUraninite"></span></li>',
                '                            <li><label>Zircon</label><span class="buildingDetailsNum" id="planetDetailsZircon"></span></li>',
                '                        </ul>',
                '                    </div>',
                '                </div>',
                '            </div>',
                '            <div id="planetDetailSendShips">',
                '                <div>',
                '                    To Arrive Soonest <input type="checkbox" id="sendBodyFleetSoonest" checked="checked"><br />',
				'					<span id="planetDetailsSendShipSpecificTime" style="display:none">',
                '                    Or to Arrive On: ',
                '                    Month:<input type="text" id="sendBodyFleetMonth" value="0" size="4">',
                '                    Date:<input type="text" id="sendBodyFleetDate" value="0" size="4">',
                '                    Hour:<input type="text" id="sendBodyFleetHour" value="0" size="4">',
                '                    Minute:<input type="text" id="sendBodyFleetMinute" value="0" size="4">',
                '                    Second:<select id="sendBodyFleetSecond">',
                '                        <option value="0">0</option>',
                '                        <option value="15">15</option>',
                '                        <option value="30">30</option>',
                '                        <option value="45">45</option>',
                '                    </select>',
				'					</span>',
                '                </div>',
                '                <div><ul class="responseContainer"></ul>',
                '            </div></div>',
                '            <div id="planetDetailUnavailShips"><div><ul class="responseContainer"></ul></div></div>',
                '            <div id="planetDetailIncomingShips"><div><ul class="responseContainer"></ul></div></div>',
                '            <div id="planetDetailOrbitingShips"><div><ul class="responseContainer"></ul></div></div>',
                '            <div id="planetDetailMiningShips">',
                '                <div class="planetDetailListHeader">From Empire</div>',
                '                <div id="planetDetailNoMining">No Mining Platforms</div>',
                '                <div><ol class="responseContainer"></ol></div>',
                '            </div>',
                '            <div id="planetDetailExcavators">',
                '                <div class="planetDetailListHeader">From Empire</div>',
                '                <div id="planetDetailNoExcavators">No Excavators</div>',
                '                <div><ol class="responseContainer"></ol></div>',
                '            </div>',
                '            <div id="planetDetailRename"><ul>',
                '                <li><label>New Planet Name: </label><input type="text" id="planetDetailNewName" maxlength="100" /></li>',
                '                <li class="alert" id="planetDetailRenameMessage"></li>',
                '                <li><button type="button" id="planetDetailRenameSubmit">Rename</button></li>',
                '            </ul></div>',
                '            <div id="planetDetailSendSpies">',
                '                <div class="planetDetailSelectSpies">',
                '                    <div class="planetDetailSpiesMessage"></div><button>Next</button>',
                '                    <ol class="planetDetailSpiesList"></ol>',
                '                </div>',
                '                <div class="planetDetailSelectSpyShip">',
                '                    <div class="planetDetailSpyShipHeader">',
                '                        <div class="planetDetailSpyShipMessage">Sending <span class="count"></span> spies.  Select Ship:</div><button>Back</button>',
                '                    </div>',
                '                    <ul class="planetDetailSpyShipList"></ul>',
                '                </div>',
                '            </div>',
                '            <div id="planetDetailFetchSpies">',
                '                <div class="planetDetailSelectSpies">',
                '                    <div class="planetDetailSpiesMessage"></div><button>Next</button>',
                '                    <ul class="planetDetailSpiesList"></ul>',
                '                </div>',
                '                <div class="planetDetailSelectSpyShip">',
                '                    <div class="planetDetailSpyShipHeader">',
                '                        <div class="planetDetailSpyShipMessage">Fetching <span class="count"></span> spies.  Select Ship:</div><button>Back</button>',
                '                    </div>',
                '                    <ul class="planetDetailSpyShipList">',
                '                    </ul>',
                '                </div>',
                '            </div>',
                '        </div>',
                '    </div>',
                '</div>'].join('');
            
            Event.on("sendBodyFleetMonth",  "change", function(){Dom.get("sendBodyFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendBodyFleetDate",   "change", function(){Dom.get("sendBodyFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendBodyFleetHour",   "change", function(){Dom.get("sendBodyFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendBodyFleetMinute", "change", function(){Dom.get("sendBodyFleetSoonest").checked = ""; this.checkboxState = true;});
            Event.on("sendBodyFleetSecone", "change", function(){Dom.get("sendBodyFleetSoonest").checked = ""; this.checkboxState = true;});
			
			this.checkboxState = true; // Sadly, this is the way to go.
			Event.on("sendBodyFleetSoonest", "change", function(e) {
				var checkbox = Dom.get("sendBodyFleetSoonest");
				var sendDetails = Dom.get("planetDetailsSendShipSpecificTime");
				this.Self.checkboxState = !this.Self.checkboxState;
				
				sendDetails.style.display = this.Self.checkboxState ? 'none' : '';
			}, {Self: this}, true);
            
            document.body.insertBefore(panel, document.body.firstChild);
            Dom.addClass(panel, "nofooter");
            
            this.planetDetails = new YAHOO.widget.Panel(panelId, {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                fixedcenter:false,
                close:true,
                underlay:false,
                width:"710px",
                zIndex:9997,
                context:["header","tr","br", ["beforeShow", "windowResize"], [-200,40]]
            });
            this.planetDetails.addQueue = function(seconds, queueFn, elm, sc) {
                this.queue = this.queue || [];
                //check if the queue is empty and store
                var notStarted = this.queue.length == 0;
                //push new queue item so it's immediately available for the tick
                this.queue.push({secondsRemaining:seconds*1, el:elm, fn:queueFn, scope:sc});
                //make sure we subscribe to the tick
                if(notStarted) {
                    Game.onTick.subscribe(this.processQueue, this, true);
                }
            };
            this.planetDetails.processQueue = function(e, oArgs) {
                if(this.queue.length > 0) {
                    var queue = this.queue,
                        diff = oArgs[0]/1000,
                        newq = [];

                    while(queue.length > 0) {
                        var callback = queue.pop();
                        callback.secondsRemaining -= diff;
                        if(callback.secondsRemaining > 0) {
                            newq.push(callback);
                        }
                        callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el);
                    }
                    this.queue = newq;
                }
                else {
                    Game.onTick.unsubscribe(this.processQueue);
                }
            };
            this.planetDetails.resetQueue = function() {
                Game.onTick.unsubscribe(this.processQueue);
                this.queue = [];
            };
            this.planetDetails.addTab = function(tab) {
                this.removeableTabs = this.removeableTabs || [];
                this.removeableTabs.push(tab);
                this.tabView.addTab(tab);
            };
            this.planetDetails.removeTabs = function() {
                var rt = this.removeableTabs;
                if(rt && rt.length > 0) {
                    for(var n=0; n<rt.length; n++) {
                        this.tabView.removeTab(rt[n]);
                    }
                    delete this.removeableTabs;
                }
                //this.tabView.selectTab(0);
            };
            this.planetDetails.resetDisplay = function(oSelf) {
                delete oSelf.availableFleets;
                delete oSelf.unavailableFleets;
                delete oSelf.incomingFleets;
                delete oSelf.orbitingFleets;
                delete oSelf.miningPlatforms;
                delete oSelf.deployedExcavators;
                delete oSelf.availableSendSpies;
                delete oSelf.availableSendSpyFleets;
                delete oSelf.availableFetchSpies;
                delete oSelf.availableFetchSpyFleets;
                delete oSelf.spiesToSend;
                delete oSelf.spiesToFetch;
                delete oSelf.selectedBody;
                delete oSelf.selectedTile;
				oSelf.checkboxState = true;
                this.resetQueue();
                this.removeTabs();
                
                var send = Sel.query("#planetDetailSendShips", false, true),
                    fleet = Sel.query("#planetDetailSendFleet", false, true),
                    unavail = Sel.query("#planetDetailUnavailShips", false, true),
                    mining = Sel.query("#planetDetailMiningShips", false, true),
                    excav = Sel.query("#planetDetailExcavators", false, true),
                    incoming = Sel.query("#planetDetailIncomingShips", false, true),
                    orbiting = Sel.query("#planetDetailOrbitingShips", false, true),
                    sendSpies = Sel.query("#planetDetailSendSpies", false, true),
                    fetchSpies = Sel.query("#planetDetailFetchSpies", false, true);
                
                if(send) {
                    Event.purgeElement(send, true);
                    Sel.query(".responseContainer", send, false, true).innerHTML = "";
                }
                if(fleet) {
                    Event.purgeElement(fleet, true);
                    Sel.query(".responseContainer", fleet, false, true).innerHTML = "";
                }
                if(unavail) {
                    Event.purgeElement(unavail, true);
                    Sel.query(".responseContainer", unavail, false, true).innerHTML = "";
                }
                if(mining) {
                    Event.purgeElement(mining, true);
                    
                    var responseContainer = Sel.query(".responseContainer", mining, true);
                    responseContainer.innerHTML = "";
                    Dom.setStyle(responseContainer, "display", "none");
                    
                    Dom.setStyle( Sel.query(".planetDetailListHeader", false, true), "display", "none" );
                    Dom.setStyle( Sel.query("#planetDetailNoMining", false, true), "display", "none" );
                }
                if(excav) {
                    Event.purgeElement(excav, true);
                    
                    var responseContainer = Sel.query(".responseContainer", excav, true);
                    responseContainer.innerHTML = "";
                    Dom.setStyle(responseContainer, "display", "none");
                    
                    Dom.setStyle( Sel.query(".planetDetailListHeader", false, true), "display", "none" );
                    Dom.setStyle( Sel.query("#planetDetailNoExcavators", false, true), "display", "none" );
                }
                if(incoming) {
                    Event.purgeElement(incoming, true);
                    Sel.query(".responseContainer", incoming, false, true).innerHTML = "";
                }
                if(orbiting) {
                    Event.purgeElement(orbiting, true);
                    Sel.query(".responseContainer", orbiting, false, true).innerHTML = "";
                }
                if(sendSpies) {
                    Event.purgeElement(sendSpies, true);
                    
                    Dom.setStyle( Sel.query(".planetDetailSelectSpies", sendSpies, true), "display", "none" );
                    Dom.setStyle( Sel.query("button", sendSpies, true), "display", "none" );
                    Dom.setStyle( Sel.query(".planetDetailSelectSpyShip", sendSpies, true), "display", "none" );
                    
                    Sel.query(".planetDetailSpiesList", sendSpies, true).innerHTML = "";
                    Sel.query(".planetDetailSpyShipList", sendSpies, true).innerHTML = "";
                }
                if(fetchSpies) {
                    Event.purgeElement(fetchSpies, true);
                    
                    Dom.setStyle( Sel.query(".planetDetailSelectSpies", sendSpies, true), "display", "none" );
                    Dom.setStyle( Sel.query("button", sendSpies, true), "display", "none" );
                    Dom.setStyle( Sel.query(".planetDetailSelectSpyShip", sendSpies, true), "display", "none" );
                    
                    Sel.query(".planetDetailSpiesList", sendSpies, true).innerHTML = "";
                    Sel.query(".planetDetailSpyShipList", sendSpies, true).innerHTML = "";
                }
            };
            
            this.planetDetails.renderEvent.subscribe(function(){
                Event.delegate("planetDetailsInfo", "click", this.DetailsClick, "button", this, true);
                var tv = this.planetDetails.tabView = new YAHOO.widget.TabView("planetDetailTabs");
                
                // add events to tabs
                tabs = tv.get("tabs");
                for(var nt=0; nt<tabs.length; nt++) {
                    tab = tv.getTab(nt);
                    if (!tab)
                        continue;
                    
                    var label = tab.get("label");
                    
                    if(label == this._sendLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetAvailableFleets(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._unavailableLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetUnavailableFleets(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._incomingLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetIncomingFleets(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._orbitingLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetOrbitingFleets(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._miningLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetMiningPlatforms(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._excavLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetExcavators(this.planetDetails, {"body_id": this.selectedBody.id});
                            }
                        }, this, true );
                    }
                    else if (label == this._sendSpiesLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetSpies("planetDetailSendSpies");
                            }
                        }, this, true );
                    }
                    else if (label == this._fetchSpiesLabel) {
                        tab.subscribe( "activeChange", function(e) {
                            if (e.newValue) {
                                this.GetSpies("planetDetailFetchSpies");
                            }
                        }, this, true );
                    }
                }
                
                Event.on("planetDetailSendFleetSubmit", "click", this.FleetSend, this, true);
                Event.on("starDetailSendFleetSubmit", "click", this.FleetSend, this, true);
                Event.on("planetDetailRenameSubmit", "click", this.Rename, this, true);
            }, this, true);
            this.planetDetails.hideEvent.subscribe(function(){
                this.planetDetails.resetDisplay(this);
            }, this, true);
            this.planetDetails.showEvent.subscribe(function(){
                this.bringToTop();
            });
            this.planetDetails.render();
            Game.OverlayManager.register(this.planetDetails);
        },
        _buildFindPanel : function() {
            var panelId = "starFind";
            
            var panel = document.createElement("div");
            panel.id = panelId;
            panel.innerHTML = ['<div class="hd">Find</div>',
                '<div class="bd">',
                '    <label for="',panelId,'Find">By Star Name:</label><input type="text" id="',panelId,'Find" />',
                '    <hr />',
                '    <div>',
                '        <label for="',panelId,'X">X:</label><input type="text" id="',panelId,'X" size="4" />',
                '        <label for="',panelId,'Y">Y:</label><input type="text" id="',panelId,'Y" size="4" />',
                '        <button type="button" id="',panelId,'Jump">Jump</button>',
                '    </div>',
                '</div>'].join('');
            document.body.insertBefore(panel, document.body.firstChild);
            Dom.addClass(panel, "nofooter");
            
            this.starFind = new YAHOO.widget.Panel(panelId, {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                fixedcenter:false,
                close:false,
                underlay:false,
                width:"300px",
                zIndex:10005,
                context:["footer","bl","tl", ["beforeShow", "windowResize"], [0,-5]]
            });
            this.starFind.createFind = function() {
                var dataSource = new Util.XHRDataSource("/map");
                dataSource.connMethodPost = "POST";
                dataSource.maxCacheEntries = 2;
                dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                dataSource.responseSchema = {
                    resultsList : "result.stars",
                    fields : ["name","color","x","y"]
                };
                
                var oTextboxList = new YAHOO.lacuna.TextboxList(this.findInput, dataSource, { //config options
                    maxResultsDisplayed: 25,
                    minQueryLength:3,
                    multiSelect:false,
                    forceSelection:false,
                    useIndicator:true
                });
                oTextboxList.formatResult = function(oResultData, sQuery, sResultMatch) {
                    return [
                        '<div class="yui-gf">',
                        '    <div class="yui-u first" style="background-color:black;">',
                        '        <img src="',Lib.AssetUrl,'star_map/',oResultData.color,'.png" alt="',oResultData,name,'" style="width:50px;height:50px;" />',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <div>',oResultData.name,'</div>',
                        '        <div>',oResultData.x,' : ',oResultData.y,'</div>',
                        '    </div>',
                        '</div>'].join("");
                };
                oTextboxList.generateRequest = function(sQuery){                
                    var s = Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "search_stars",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                decodeURIComponent(sQuery)
                            ]
                        });
                    return s;
                };
                oTextboxList.dirtyEvent.subscribe(function(event, isDirty, oSelf){
                    var star = this._oTblSingleSelection.Object;
                    oSelf.X.value = star.x;
                    oSelf.Y.value = star.y;
                },this);
                this.findStar = oTextboxList;
            };
            this.starFind.renderEvent.subscribe(function(){
                this.starFind.findInput = Dom.get(panelId+"Find");
                this.starFind.X = Dom.get(panelId+"X");
                this.starFind.Y = Dom.get(panelId+"Y");
                Event.on(panelId+"Jump", "click", this.FindJump, this, true);
                this.starFind.createFind();
            },this,true);
            this.starFind.showEvent.subscribe(function(){
                this.starFind.findInput.blur();
            },this,true);
            
            this.starFind.render();
        },
        
        IsVisible : function() {
            return this._isVisible;
        },
        MapVisible : function(visible) {
            if(visible) {
                this.starFind.show();
            }
            else {
                this.starFind.hide();
            }
            if(this._isVisible != visible) {
                if(this._elGrid) {
                    this._isVisible = visible;
                    YAHOO.log(visible, "info", "MapStar.MapVisible");
                    if(visible) {
                        if(!Dom.inDocument(this._elGrid)) {
                            document.getElementById("content").appendChild(this._elGrid);
                        }
                        //Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
                    }
                    else {
                        this._elGrid = this._elGrid.parentNode.removeChild(this._elGrid);
                    }
                    if (visible) {
                        this.Resize();
                    }
                }
            }
        },

        FindJump : function() {
            var x = this.starFind.X.value*1,
                y = this.starFind.Y.value*1;
                
            if(Lang.isNumber(x) && Lang.isNumber(y)) {
                this.Jump(x,y);
            }
        },
        Jump : function(xC,yC) {
            this.LoadGrid({
                x:xC, //(xC-1),
                y:yC //(yC+1)
            });
        },
        Load : function() {
            var cId = Game.GetCurrentPlanet().id;
            if(cId) {
                var loc = Game.EmpireData.planets[cId];
                if(loc) {
                    this.locationId = cId;
                    loc.x *= 1;
                    loc.y *= 1;
                    this.LoadGrid(loc);
                }
            }
        },
        LoadGrid : function(loc) {
            Lacuna.Pulser.Show();
            if(!this._gridCreated) {
                var starMap = document.createElement("div");
                starMap.id = "starMap";
                this._elGrid = document.getElementById("content").appendChild(starMap);
                this.SetSize();
                                
                var map = new Lacuna.Mapper.StarMap("starMap");
                //map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
                
                //draw what we got
                map.redraw();
                //move to current planet
                map.setCenterTo(loc.x,loc.y);
                
                this._map = map;
                this._gridCreated = true;
                
                Event.delegate(this._map.mapDiv, "click", this.GridClick, "div.tile", this, true);
            }
            else {
                //move to current planet
                this._map.setCenterTo(loc.x,loc.y);
            }
            
            this.MapVisible(true);
            Lacuna.Pulser.Hide();
        },
        GridClick : function(e, matchedEl, container) {
            if(!this._map.controller.isDragging()) {
                var tile = this._map.tileLayer.findTileById(matchedEl.id);
                if(tile && tile.data) {
                    if(tile.data.isStar) {
                        this.ShowStar(tile);
                    }
                    else if(tile.data.isPlanet) {
                        this.ShowPlanet(tile);
                    }
                }
            }
        },
        DetailsClick : function(e, matchedEl, container){
            if(this.selectedBody) {
                if(matchedEl.innerHTML == "View") {
                    var id = this.selectedBody.id;
                    this.planetDetails.hide();
                    this.fireEvent("onChangeToPlanetView", id);
                }
            }
        },
        SetSize : function() {
            var size = Game.GetSize();
            Dom.setStyle(this._elGrid, "width", size.w+"px");
            Dom.setStyle(this._elGrid, "height", size.h+"px");
        },
        Resize : function() {
            this.SetSize();
            this._map.resize();
        },
        Reset : function() {
            delete this.locationId;
            if(this._map) {
                this._map.reset();
            }
            this.MapVisible(false);
        },
    
        ArrivesQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query(".shipArrives",elLine,true).innerHTML = arrTime;
        },
        
        NotFleetIsolationist : function(ships) {
            if(Game.EmpireData.is_isolationist == "1") {
                var hasIsoShip;
                for(var n=0; n<ships.length; n++) {
                    if(ships[n].type == "colony_ship" || ships[n].type == "short_range_colony_ship" || ships[n].type == "space_station_hull") { // Although it's uncommon, SS's break ISO.
                        hasIsoShip = true;
                        break;
                    }
                }
                
                if(hasIsoShip) {
                    return confirm("If you colonize another planet you will no longer be considered an Isolationist and you will be open to attack.  Are you sure you want to do this?");
                }
            }
            return true;
        },
    
        ShowEmpire : function(e, id){
            Lacuna.Info.Empire.Load(id);
        },
    
        GetAvailableFleets : function(panel, target, reload) {
            if ( !reload ) {
                Dom.get(panel.isStarPanel ? "sendStarFleetSoonest" : "sendBodyFleetSoonest").checked = true;
            }
            
            if ( !this.availableFleets ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_available_fleets({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_available_fleets.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.availableFleets = o.result;

                        this.PopulateAvailableFleetsTab(panel);

                        //panel.removeTabs(); //remove any tabs that are removable before adding new ones
                    },
                    scope:this
                });
            }
        },
        PopulateAvailableFleetsTab : function(panel) {
            var fleets = this.availableFleets.available,
                details_id = panel.isStarPanel ? "starDetailSendShips" : "planetDetailSendShips",
                details = Sel.query("#"+details_id+" .responseContainer", false, true),
                detailsParent = details.parentNode,
                li = document.createElement("li");
            
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            if (!fleets || fleets.length === 0) {
                details.innerHTML = "No available fleets to send.";
            }
            else {
                for (var i = 0; i < fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.Fleet = fleet;
                    nLi.innerHTML = [
						'<div>',
						'<table>',
						'	<colgroup>',
						'		<col>',
						'		<col style="width:200px">',
						'		<col span="5" style="width:70px">',
						'	</colgroup>',
						'	<tr>',
						'		<td rowspan="4">',
						'			<div style="width:100px;height:100px;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;display:table-cell;vertical-align:middle;">',
						'        		<img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:80px;height:80px;" />',
						'    		</div>',
						'		</td>',
						'		<td><span style="font-weight:bold;">', fleet.details.type_human, '</span></td>',
						'		<td colspan="4">&nbsp;</td>',
						'		<td><input type="text" style="width:70px" id="send_fleet_quantity_' + fleet.id + '" value="' + Math.floor(fleet.quantity) + '"></td>',
						'	</tr>',
						'	<tr>',
						'		<td><span style="font-weight:bold;">Details:</span></td>',
						'		<td colspan="2"><span style="font-weight:bold;">Earliest Arrival:</span></td>',
						'		<td colspan="2">',
										fleet.earliest_arrival.month,'-',
										fleet.earliest_arrival.day,' ',
										fleet.earliest_arrival.hour, ':',
										fleet.earliest_arrival.minute, ':',
										fleet.earliest_arrival.second,
						'		</td>',
						'		<td><button type="button" id="send_fleet_' + fleet.id + '">Send Fleet</button></td>',
						'	</tr>',
						'	<tr>',
						'		<td><span style="font-weight:bold;">Attributes:</span></td>',
						'		<td>Speed:</td>',
						'		<td>', fleet.details.speed, '</td>',
						'		<td>Hold Size:</td>',
						'		<td>', fleet.details.hold_size, '</td>',
						'		<td rowspan="2"><button type="button" id="send_ship_' + fleet.id + '">Send 1 Ship</button></td>',
						'	</tr>',
						'	<tr>',
						'		<td>&nbsp;</td>',
						'		<td>Stealth:</td>',
						'		<td>', fleet.details.stealth, '</td>',
						'		<td>Combat:</td>',
						'		<td>', fleet.details.combat, '</td>',
						'	</tr>',
						'</table>',
						'<hr />',
						'</div>'
					].join('');
                    
                    details.appendChild(nLi);
                    
                    Event.on("send_fleet_"+fleet.id, "click", this.FleetSend, {Self:this,Fleet:fleet,Line:nLi,Panel:panel}, true);
                    Event.on("send_ship_"+fleet.id,  "click", this.FleetSend, {Self:this,Fleet:fleet,Line:nLi,Panel:panel,Quantity:1}, true);
                }
            }
            detailsParent.appendChild(details); //add back as child
                            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(detailsParent,"height",Ht + "px");
                Dom.setStyle(detailsParent,"overflow-y","auto");
            },10);
        },
        FleetSend : function() {
            var oSelf = this.Self,
                fleet = this.Fleet,
                quantity = this.Quantity,
                panel = this.Panel,
                arriveSoonest = Dom.get(panel.isStarPanel ? "sendStarFleetSoonest" : "sendBodyFleetSoonest").checked,
                sendFleetBtn = Dom.get("send_fleet_"+fleet.id),
                sendShipBtn = Dom.get("send_ship_"+fleet.id),
                fleet_line = this.Line,
                arrival_date, target, targetName, panel;
            
            // disable buttons
            sendFleetBtn.disabled = true;
            sendShipBtn.disabled  = true;
            
            if(oSelf.selectedBody) {
                target = {body_id : oSelf.selectedBody.id};
                targetName = oSelf.selectedBody.name;
                panel = oSelf.planetDetails;
            }
            else if(oSelf.selectedStar) {
                target = {star_id : oSelf.selectedStar.id};
                targetName = oSelf.selectedStar.name;
                panel = oSelf.starDetails;
            }
            
            if ( !quantity ) {
                quantity = Dom.get("send_fleet_quantity_"+fleet.id).value;
            }
            
            if (arriveSoonest) {
                arrival_date = {soonest: 1 };
            }
            else {
                arrival_date = {
                    month:  Dom.get(panel.isStarPanel ? "sendStarFleetMonth" : "sendBodyFleetMonth").value,
                    date:   Dom.get(panel.isStarPanel ? "sendStarFleetDate" : "sendBodyFleetDate").value,
                    hour:   Dom.get(panel.isStarPanel ? "sendStarFleetHour" : "sendBodyFleetHour").value,
                    minute: Dom.get(panel.isStarPanel ? "sendStarFleetMinute" : "sendBodyFleetMinute").value,
                    second: Dom.get(panel.isStarPanel ? "sendStarFleetSecond" : "sendBodyFleetSecond").value
                };
            }
            
            if(target && oSelf.NotFleetIsolationist(fleet)) {
                Game.Services.Buildings.SpacePort.send_fleet({"args":{
                    session_id:Game.GetSession(),
                    fleet_id:fleet.id,
                    quantity: quantity,
                    arrival_date: arrival_date,
                    target:target
                }}, {
                    success : function(o){
                        YAHOO.log(o, "info", "MapStar.FleetSend.send_fleet.success");
                        Lacuna.Pulser.Hide();
                        this.Self.fireEvent("onMapRpc", o.result);
                        delete this.Self.availableFleets;
                        delete this.Self.incomingFleets;
                        this.Self.GetAvailableFleets(panel, target, true);
                    },
                    failure : function(o){
                        var msg = document.createElement("span");
                        if ( o.error && o.error.message ) {
                            msg.innerHTML = "Failed to send fleet!<br/>" + o.error.message;
                        }
                        else {
                            msg.innerHTML = "Failed to send fleet!";
                        }
                        fleet_line.appendChild(msg);
                        sendFleetBtn.disabled = false;
                        sendShipBtn.disabled  = false;
                    },
                    scope:this
                });
            }
        },
        
        GetUnavailableFleets : function(panel, target) {
            if ( !this.unavailableFleets ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_unavailable_fleets({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_unavailable_fleets.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.unavailableFleets = o.result;

                        this.PopulateUnavailableFleetsTab(panel);

                        //panel.removeTabs(); //remove any tabs that are removable before adding new ones
                    },
                    scope:this
                });
            }
        },
        PopulateUnavailableFleetsTab : function(panel) {
            var fleets = this.unavailableFleets.unavailable,
                details_id = panel.isStarPanel ? "starDetailUnavailShips" : "planetDetailUnavailShips",
                details = Sel.query("#"+details_id+" .responseContainer", false, true),
                detailsParent = details.parentNode,
                li = document.createElement("li");
            
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            
            if(fleets && fleets.length > 0) {
                Event.purgeElement(details, true);
                details.innerHTML = '';
                
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);
                    
                    if ( !fleet.details ) {
                        fleet.details = {
                            name: 'Unknown',
                            type: 'unknown',
                            type_human: 'Unknown',
                            speed: 'Unknown',
                            hold_size: 'Unknown',
                            stealth: 'Unknown',
                            combat: 'Unknown',
                            payload: []
                        };
                    }
                    
                    if ( !fleet.from ) {
                        fleet.from = {
                            name: "Unknown"
                        };
                    }
                    
                    //nLi.Fleet = fleet;
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:5px;">',
                    '    <div class="yui-u first" style="width:20%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:75px;height:75px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:75%">',
                    '        <div class="buildingName">',fleet.details.type_human,'</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span><span>Task:</span><span>',fleet.details.task,'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',fleet.details.speed,'</span></span>,',
                    '            <span>Berth Level:<span>',fleet.details.berth_level,'</span></span>,',
                    '            <span>Hold Size:<span>',fleet.details.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',fleet.details.stealth,'</span></span>',
                    '            <span>Combat:<span>',fleet.details.combat,'</span></span>',
                    '        </div>',
                    '        <div style="font-style:italic;">',fleet.reason[1],'</div>',
                    '    </div>',
                    '</div>'].join('');
                    
                    details.appendChild(nLi);
                }
            }
            else {
                details.innerHTML = '<li>No Unavailable fleets</li>';
            }
            detailsParent.appendChild(details); //add back as child
            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(detailsParent,"height",Ht + "px");
                Dom.setStyle(detailsParent,"overflow-y","auto");
            },10);
            
        },
        
        GetIncomingFleets : function(panel, target) {
            if ( !this.incomingFleets ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_incoming_fleets({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_incoming_fleets.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.incomingFleets = o.result;

                        this.PopulateIncomingFleetsTab(panel);

                        //panel.removeTabs(); //remove any tabs that are removable before adding new ones
                    },
                    scope:this
                });
            }
        },
        PopulateIncomingFleetsTab : function(panel) {
            var fleets = this.incomingFleets.incoming,
                details_id = panel.isStarPanel ? "starDetailIncomingShips" : "planetDetailIncomingShips",
                details = Sel.query("#"+details_id+" .responseContainer", false, true),
                detailsParent = details.parentNode;
            
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            
            if(fleets && fleets.length > 0) {
                Event.purgeElement(details, true);
                details.innerHTML = '';
                
                var li = document.createElement("li");
                
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
                
                var serverTime = Lib.getTime(Game.ServerData.time);
                
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(fleet.date_arrives) - serverTime) / 1000;
                        
                    nLi.Fleet = fleet;
                    
                    if ( !fleet.details ) {
                        fleet.details = {
                            name: 'Unknown',
                            type: 'unknown',
                            type_human: 'Unknown',
                            speed: 'Unknown',
                            hold_size: 'Unknown',
                            stealth: 'Unknown',
                            combat: 'Unknown'
                        };
                    }
                    
                    if ( !fleet.from ) {
                        fleet.from = {
                            name: "Unknown"
                        };
                    }
                    
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:2px;">',
                    '    <div class="yui-u first" style="width:20%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:75px;height:75px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:75%">',
                    '        <div class="buildingName">',fleet.details.type_human,' - Arrives in: <span class="shipArrives">',Lib.formatTime(sec),'</span></div>',
                    '        <div><label style="font-weight:bold;">Quantity:</label> ',fleet.quantity, '</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span><span>Task:</span><span>',fleet.task,'</span></span>',
                    '            <span><span>From:</span><span>',fleet.from.name,'</span></span>',
                    '            <span><span>To:</span><span>',fleet.to.name,'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',fleet.details.speed,'</span></span>,',
                    '            <span>Hold Size:<span>',fleet.details.hold_size,'</span></span>',
                    '            <span>Stealth:<span>',fleet.details.stealth,'</span></span>',
                    '            <span>Combat:<span>',fleet.details.combat,'</span></span>',
                    '        </div>',
                        fleet.details.payload ? [
                                                    '<div><label style="font-weight:bold;">Payload:</label> ',
                                                    fleet.details.payload.join(', '),
                                                    '</div>'
                                                ].join('')
                                              : '',
                    '    </div>',
                    '</div>'].join('');
                    
                    panel.addQueue(sec, this.ArrivesQueue, nLi);
                    
                    details.appendChild(nLi);
                }
                
            }    
            else {
                details.innerHTML = '<li>No Incoming fleets</li>';
            }
            detailsParent.appendChild(details); //add back as child
            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(details.parentNode,"height",Ht + "px");
                Dom.setStyle(details.parentNode,"overflow-y","auto");
            },10);
        },
        
        GetOrbitingFleets : function(panel, target) {
            if ( !this.orbitingFleets ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_orbiting_fleets({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_orbiting_fleets.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.orbitingFleets = o.result;

                        this.PopulateOrbitingFleetsTab(panel);

                        //panel.removeTabs(); //remove any tabs that are removable before adding new ones
                    },
                    scope:this
                });
            }
        },
        PopulateOrbitingFleetsTab : function(panel) {
            var fleets = this.orbitingFleets.orbiting,
                details_id = panel.isStarPanel ? "starDetailOrbitingShips" : "planetDetailOrbitingShips",
                details = Sel.query("#"+details_id+" .responseContainer", false, true),
                detailsParent = details.parentNode,
                li = document.createElement("li");
            
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            
            if(fleets && fleets.length > 0) {
                Event.purgeElement(details, true);
                details.innerHTML = '';
                
                for(var i=0; i<fleets.length; i++) {
                    var fleet = fleets[i],
                        nLi = li.cloneNode(false);
                    
                    if ( !fleet.details ) {
                        fleet.details = {
                            name: 'Unknown',
                            type: 'unknown',
                            type_human: 'Unknown',
                            speed: 'Unknown',
                            hold_size: 'Unknown',
                            stealth: 'Unknown',
                            combat: 'Unknown',
                            payload: []
                        };
                    }
                    
                    if ( !fleet.from ) {
                        fleet.from = {
                            name: "Unknown"
                        };
                    }
                    
                    //nLi.Fleet = fleet;
                    nLi.innerHTML = ['<div class="yui-gd" style="margin-bottom:5px;">',
                    '    <div class="yui-u first" style="width:20%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                    '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:75px;height:75px;" />',
                    '    </div>',
                    '    <div class="yui-u" style="width:75%">',
                    '        <div class="buildingName">',fleet.details.type_human,'</div>',
                    '        <div><label style="font-weight:bold;">Quantity:</label> ',fleet.quantity, '</div>',
                    '        <div><label style="font-weight:bold;">Details:</label>',
                    '            <span><span>Task:</span><span>',fleet.details.task,'</span></span>',
                    '        </div>',
                    '        <div><label style="font-weight:bold;">Attributes:</label>',
                    '            <span>Speed:<span>',fleet.details.speed,'</span></span>,',
                    '            <span>Berth Level:<span>',fleet.details.berth_level,'</span></span>,',
                    '            <span>Hold Size:<span>',fleet.details.hold_size,'</span></span>,',
                    '            <span>Stealth:<span>',fleet.details.stealth,'</span></span>',
                    '            <span>Combat:<span>',fleet.details.combat,'</span></span>',
                    '        </div>',
                    '    </div>',
                    '</div>'].join('');
                    
                    details.appendChild(nLi);
                }
            }
            else {
                details.innerHTML = '<li>No Orbiting fleets</li>';
            }
            detailsParent.appendChild(details); //add back as child
            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(detailsParent,"height",Ht + "px");
                Dom.setStyle(detailsParent,"overflow-y","auto");
            },10);
            
        },
        
        GetMiningPlatforms : function(panel, target) {
            if ( !this.miningPlatforms ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_mining_platforms({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_mining_platforms.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.miningPlatforms = o.result;

                        this.PopulateMiningPlatformsTab(panel);
                    },
                    scope:this
                });
            }
        },
        PopulateMiningPlatformsTab : function(panel) {
            var platforms = this.miningPlatforms.mining_platforms,
                window = Sel.query("#planetDetailMiningShips", false, true),
                details = Sel.query(".responseContainer", window, true),
                detailsParent = details.parentNode;
            
            if (!details)
                return;
            
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            
            if(platforms && platforms.length > 0) {
                Dom.setStyle( Sel.query(".planetDetailListHeader", window, true), "display", "block" );
                Dom.setStyle(details, "display", "block");
                
                Event.purgeElement(details, true);
                details.innerHTML = '';

                var li = document.createElement("li");
                
                for(var i=0; i<platforms.length; i++) {
                    var ship = platforms[i],
                        nLi = li.cloneNode(false);
                        
                    Dom.addClass(nLi,"empireName");
                    nLi.innerHTML = ship.empire_name;
                    Event.on(nLi, "click", this.ShowEmpire, ship.empire_id);
                    
                    details.appendChild(nLi);
                }
                
            }    
            else {
                Dom.setStyle( Sel.query("#planetDetailNoMining", window, true), "display", "block" );
            }
            
            detailsParent.appendChild(details);
            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(details.parentNode,"height",Ht + "px");
                Dom.setStyle(details.parentNode,"overflow-y","auto");
            },10);
        },
        
        GetExcavators : function(panel, target) {
            if ( !this.deployedExcavators ) {
                Lacuna.Pulser.Show();
                Game.Services.Buildings.SpacePort.view_excavators({"args":{
                    session_id: Game.GetSession(),
                    body_id: Game.GetCurrentPlanet().id,
                    target: target}
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "SpacePort.view_excavators.success");
                        Lacuna.Pulser.Hide();
                        this.fireEvent("onMapRpc", o.result);

                        this.deployedExcavators = o.result;

                        this.PopulateExcavatorsTab(panel);
                    },
                    scope:this
                });
            }
        },
        PopulateExcavatorsTab : function(panel) {
            var excavators = this.deployedExcavators.excavators,
                window = Sel.query("#planetDetailExcavators", false, true),
                details = Sel.query(".responseContainer", window, true),
                detailsParent = details.parentNode;
            
            if (!details)
                return;
            
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            
            if(excavators && excavators.length > 0) {
                Dom.setStyle( Sel.query(".planetDetailListHeader", window, true), "display", "block" );
                Dom.setStyle(details, "display", "block");
                
                Event.purgeElement(details, true);
                details.innerHTML = '';

                var li = document.createElement("li");
                
                for(var i=0; i<excavators.length; i++) {
                    var ship = excavators[i],
                        nLi = li.cloneNode(false);
                        
                    Dom.addClass(nLi,"empireName");
                    nLi.innerHTML = ship.empire_name;
                    Event.on(nLi, "click", this.ShowEmpire, ship.empire_id);
                    
                    details.appendChild(nLi);
                }
                
            }    
            else {
                Dom.setStyle( Sel.query("#planetDetailNoExcavators", window, true), "display", "block" );
            }
            
            detailsParent.appendChild(details);
            
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 330;
                if(Ht > 240) { Ht = 240; }
                Dom.setStyle(details.parentNode,"height",Ht + "px");
                Dom.setStyle(details.parentNode,"overflow-y","auto");
            },10);
        },

        ShowStar : function(tile, keepOpen) {
            if(!keepOpen) {
                Game.OverlayManager.hideAllBut(this.starDetails.id);
            }
            
            var star = tile.data,
                panel = this.starDetails;
                
            panel.resetDisplay(this);
            
            Dom.get("starDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',star.color,'.png" alt="',star.name,'" style="width:100px;height:100px;" />'].join('');
            
            Dom.get("starDetailsInfo").innerHTML = [
                '<ul>',
                '    <li id="starDetailsName">',star.name,'</li>',
                '    <li><label>X: </label>',star.x,'</li>',
                '    <li><label>Y: </label>',star.y,'</li>',
                '    <li><label>Zone: </label>',star.zone,'</li>',
                star.station ? ('    <li><label>Station: </label>'+star.station.name+' ('+star.station.x+' : '+star.station.y+')</li>') : '',
                '</ul>'
            ].join('');
            
            var tv = panel.tabView = new YAHOO.widget.TabView("starDetailTabs");
            
            tv.getTab(0).subscribe( "activeChange", function(e) {
                if (e.newValue) {
                    this.GetAvailableFleets(panel, {"star_id": star.id});
                }
            }, this, true );
            
            tv.getTab(1).subscribe( "activeChange", function(e) {
                if (e.newValue) {
                    this.GetUnavailableFleets(panel, {"star_id": star.id});
                }
            }, this, true );
            
            tv.getTab(2).subscribe( "activeChange", function(e) {
                if (e.newValue) {
                    this.GetIncomingFleets(panel, {"star_id": star.id});
                }
            }, this, true );
            
            this.selectedStar = star;
            panel.tabView.selectTab(0);
            panel.show();
        },
        ShowPlanet : function(tile, keepOpen) {
            if(!keepOpen) {
                Game.OverlayManager.hideAllBut(this.planetDetails.id);
            }
            
            var body = tile.data,
                tab, tabs,
                panel = this.planetDetails,
                empire = body.empire || {alignment:"none", name:""};
                
            panel.resetDisplay(this);
            
            Dom.get("planetDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',body.image,'.png" alt="',body.name,'" style="width:200px;height:200px;" />'].join('');
            Dom.get("planetDetailsInfo").innerHTML = [
                '<ul>',
                '    <li id="planetDetailsName">',body.name,'</li>',
                '    <li><label>Type: </label>',body.type,'</li>',
                '    <li><label>Empire: </label><span id="planetDetailsEmpire">',empire.name,'</span></li>',
                empire.id ? ('<li><label>Isolationist: </label>'+(empire.is_isolationist=="1" ? 'Yes' : 'No')+'</li>') : '',
                '    <li><label>Water: </label>',body.water,'</li>',
                '    <li><label>Planet Size:</label>',body.size,'</li>',
                '    <li><label>Location in Universe:</label>',body.x,'x : ',body.y,'y</li>',
                '    <li><label>Zone:</label>',body.zone,'</li>',
                '    <li><label>Star:</label>',body.star_name,'</li>',
                '    <li><label>Orbit:</label>',body.orbit,'</li>',
                (empire.alignment == "self" || (empire.alignment == "ally" && body.type == "space station")) ? '    <li><button type="button">View</button></li>' : '',
                '</ul>'
            ].join('');
            
            Dom.get("planetDetailsAnthracite").innerHTML = body.ore.anthracite;
            Dom.get("planetDetailsBauxite").innerHTML = body.ore.bauxite;
            Dom.get("planetDetailsBeryl").innerHTML = body.ore.beryl;
            Dom.get("planetDetailsChalcopyrite").innerHTML = body.ore.chalcopyrite;
            Dom.get("planetDetailsChromite").innerHTML = body.ore.chromite;
            Dom.get("planetDetailsFluorite").innerHTML = body.ore.fluorite;
            Dom.get("planetDetailsGalena").innerHTML = body.ore.galena;
            Dom.get("planetDetailsGoethite").innerHTML = body.ore.goethite;
            Dom.get("planetDetailsGold").innerHTML = body.ore.gold;
            Dom.get("planetDetailsGypsum").innerHTML = body.ore.gypsum;
            Dom.get("planetDetailsHalite").innerHTML = body.ore.halite;
            Dom.get("planetDetailsKerogen").innerHTML = body.ore.kerogen;
            Dom.get("planetDetailsMagnetite").innerHTML = body.ore.magnetite;
            Dom.get("planetDetailsMethane").innerHTML = body.ore.methane;
            Dom.get("planetDetailsMonazite").innerHTML = body.ore.monazite;
            Dom.get("planetDetailsRutile").innerHTML = body.ore.rutile;
            Dom.get("planetDetailsSulfur").innerHTML = body.ore.sulfur;
            Dom.get("planetDetailsTrona").innerHTML = body.ore.trona;
            Dom.get("planetDetailsUraninite").innerHTML = body.ore.uraninite;
            Dom.get("planetDetailsZircon").innerHTML = body.ore.zircon;
            
            if(empire.id) {
                Dom.setStyle("planetDetailsEmpire", "cursor", "pointer");
                Dom.setStyle("planetDetailsEmpire", "text-decoration", "underline");
                Event.on("planetDetailsEmpire", "click", function(){
                    Lacuna.Info.Empire.Load(this.id);
                }, empire, true);
            }
            else {
                Dom.setStyle("planetDetailsEmpire", "cursor", "normal");
                Dom.setStyle("planetDetailsEmpire", "text-decoration", "none");
                Event.removeListener("planetDetailsEmpire", "click");
            }
            
            if(empire.alignment == "self"){
                if(panel.renameTab) {
                    panel.tabView.addTab(panel.renameTab, 1);
                    delete panel.renameTab;
                }

                Dom.get("planetDetailNewName").value = "";
            }
            else {
                tabs = panel.tabView.get("tabs");
                for(var nt=0; nt<tabs.length; nt++) {
                    tab = panel.tabView.getTab(nt);
                    if(tab && tab.get("label") == this._renameLabel) {
                        panel.renameTab = tab;
                        panel.tabView.removeTab(tab);
                        break;
                    }
                }
            }
            if(empire.alignment == "none" || empire.is_isolationist == "1" ){
                tabs = panel.tabView.get("tabs");
                for(var snt = tabs.length; snt >= 0; snt--) {
                    tab = panel.tabView.getTab(snt);
                    if(tab && tab.get("label") == this._sendSpiesLabel) {
                        panel.sendSpiesTab = tab;
                        panel.tabView.removeTab(tab);
                    }
                    else if(tab && tab.get("label") == this._fetchSpiesLabel) {
                        panel.fetchSpiesTab = tab;
                        panel.tabView.removeTab(tab);
                    }
                }
            }
            else {
                if(panel.sendSpiesTab) {
                    panel.tabView.addTab(panel.sendSpiesTab);
                    delete panel.sendSpiesTab;
                }
                if(panel.fetchSpiesTab) {
                    panel.tabView.addTab(panel.fetchSpiesTab);
                    delete panel.fetchSpiesTab;
                }
            }
            
            if(body.type == "asteroid") {
                if(panel.miningTab) {
                    panel.tabView.addTab(panel.miningTab);
                    delete panel.miningTab;
                }
            }
            else {
                tabs = panel.tabView.get("tabs");
                for(var mnt = tabs.length; mnt >= 0; mnt--) {
                    tab = panel.tabView.getTab(mnt);
                    if(tab && tab.get("label") == this._miningLabel) {
                        panel.miningTab = tab;
                        panel.tabView.removeTab(tab);
                    }
                }
            }
            if(panel.excavTab) {
                panel.tabView.addTab(panel.excavTab);
                delete panel.excavTab;
            }

            this.selectedBody = body;
            this.selectedTile = tile;
            panel.tabView.selectTab(0);
            panel.show();
        },
        
        Rename : function() {
            var newName = Dom.get("planetDetailNewName").value;
            Game.Services.Body.rename({
                    session_id: Game.GetSession(""),
                    body_id:this.selectedBody.id,
                    name:newName
                },{
                    success : function(o){
                        YAHOO.log(o, "info", "MapStar.Rename.success");
                        if(o.result && this.selectedBody) {
                            Dom.get("planetDetailRenameMessage").innerHTML = [
                                "Successfully renamed your planet from ",
                                this.selectedBody.name," to ", newName, '.'
                            ].join('');
                            Lib.fadeOutElm("planetDetailRenameMessage");
                            Dom.get("planetDetailsName").innerHTML = newName;
                            Game.EmpireData.planets[this.selectedBody.id].name = newName;
                            Lacuna.Menu.update();
                            if(this.selectedTile instanceof YAHOO.lacuna.Mapper.StarTile) {
                                this._map.tileCache[this.selectedTile.x][this.selectedTile.y].name = newName;
                                this.selectedTile.refresh();
                            }
                            
                            this.selectedBody.name = newName;
                        }
                    },
                    failure : function(o){
                        Dom.get("planetDetailRenameMessage").innerHTML = o.error.message;
                        Lib.fadeOutElm("planetDetailRenameMessage");
                        return true;
                    },
                    scope:this
                }
            );
        },
        
        GetSpies : function(tab) {
            var send = ( tab == 'planetDetailSendSpies' ) ? true : false;
            var has_data = send ? this.availableSendSpies : this.availableFetchSpies;
            
            if (has_data)
                return;
            
            Lacuna.Pulser.Show();
            var method,data;
            if (send) {
                method = 'prepare_send_spies';
                data = {
                    session_id:Game.GetSession(),
                    on_body_id:Game.GetCurrentPlanet().id,
                    to_body_id:this.selectedBody.id
                };
            }
            else {
                method = 'prepare_fetch_spies';
                data = {
                    session_id:Game.GetSession(),
                    on_body_id:this.selectedBody.id,
                    to_body_id:Game.GetCurrentPlanet().id
                };
            }

            Game.Services.Buildings.SpacePort[method]({"args": data},{
                success : function(o){
                    YAHOO.log(o, "info", "MapStar.ShowSpies."+method+".success");
                    this.fireEvent("onMapRpc", o.result);
                    Lacuna.Pulser.Hide();
                    
                    if (send) {
                        this.availableSendSpies     = o.result.spies;
                        this.availableSendSpyFleets = o.result.fleets;
                    }
                    else {
                        this.availableFetchSpies    = o.result.spies;
                        this.availableFetchSpyFleets = o.result.fleets;
                    }
                    
                    this.SelectSpiesTab({ Self: this, tab: tab });
                },
                scope:this
            });
        },
        SelectSpiesTab : function(arg) {
            var tab = arg.tab,
                oSelf = arg.Self;
            var send = ( tab == 'planetDetailSendSpies' ) ? true : false;
            var verb = send ? 'send' : 'fetch';
            var container = Dom.get( tab );
            
            var containerParent = container.parentNode,
                spies  = send ? this.availableSendSpies     : this.availableFetchSpies,
                fleets = send ? this.availableSendSpyFleets : this.availableFetchSpyFleets,
                spyDIV   = Sel.query( '.planetDetailSelectSpies', container, true ),
                spyMSG   = Sel.query( '.planetDetailSpiesMessage', container, true ),
                spyUL    = Sel.query( '.planetDetailSpiesList', spyDIV, true ),
                fleetDIV = Sel.query( '.planetDetailSelectSpyShip', container, true ),
                button   = Sel.query( 'button', spyDIV, true );
            
            Dom.setStyle( spyDIV, "display", "block" );
            Dom.setStyle( fleetDIV, "display", "none" );
            Dom.setStyle( button, 'display', 'none' );
            
            if ( spies.length == 0 ) {
                spyMSG.innerHTML = 'No spies available.';
                return;
            }
            
            var maxSpies = 0;
            for (var i = 0; i < fleets.length; i++) {
                var fleet = fleets[i];
                if (fleet.details.max_occupants > maxSpies) {
                    maxSpies = fleet.details.max_occupants;
                }
            }
            if (maxSpies == 0) {
                spyMSG.innerHTML = 'No ships available.';
                return;
            }
            
            spyMSG.innerHTML = 'Select up to ' + maxSpies + ' spies to ' + verb + ':';
            Dom.setStyle(button, 'display', 'inline');
            
            container = containerParent.removeChild(container); //remove from DOM to make this faster
            
            var li = document.createElement('li');
            
            for (var si = 0; si < spies.length; si++) {
                var spy = spies[si],
                    nLi = li.cloneNode(false);
                nLi.innerHTML = [
                '<div class="yui-gd" style="margin-bottom:2px;">',
                '    <div class="yui-u first description">',
                '        <div><strong>', spy.name, '</strong></div><div>Level ', spy.level,'</div>',
                '    </div>',
                '    <div class="yui-u">',
                maxSpies == 0 ? '' : '<input type="checkbox" name="spyId" value="'+spy.id+'" />',
                '        <div class="attributes"><span class="attribute">Offense: ', spy.offense_rating, '</span><span class="attribute">Defense: ',spy.defense_rating,'</span></div>',
                '    </div>',
                '</div>'
                ].join('');
                spyUL.appendChild(nLi);
            }
            
            Event.purgeElement( button );
            Event.on( button, "click", this.SelectSpyShipTab, {Self: oSelf, tab: tab} );
            
            containerParent.appendChild(container); //add back as child
            
            var Ht = Game.GetSize().h - 330;
            if(Ht > 240) { Ht = 240; }
            Dom.setStyle(spyUL,'height',Ht + 'px');
        },
        SelectSpyShipTab : function(e, arg) {
            var tab = arg.tab;
            Event.stopEvent(e);
            
            var send = ( tab == 'planetDetailSendSpies' ) ? true : false;
            var verb = send ? 'send' : 'fetch';
            var container = Dom.get( tab );
            
            var oSelf = arg.Self,
                containerParent = container.parentNode,
                spies    = [],
                fleets   = send ? oSelf.availableSendSpyFleets : oSelf.availableFetchSpyFleets,
                spyDIV   = Sel.query( '.planetDetailSelectSpies', container, true ),
                spyUL    = Sel.query( '.planetDetailSpiesList', spyDIV, true ),
                fleetDIV = Sel.query( '.planetDetailSelectSpyShip', container, true ),
                fleetUL  = Sel.query( '.planetDetailSpyShipList', fleetDIV, true ),
                spyCount = Sel.query( '.planetDetailSpyShipMessage span.count', fleetDIV, true );
                button   = Sel.query( 'button', fleetDIV, true );
            
            Dom.setStyle( spyDIV, "display", "none" );
            Dom.setStyle( fleetDIV, "display", "block" );
            
            Dom.batch(spyUL.getElementsByTagName('input'), function(el) {
                if (el.checked) {
                    spies.push(el.value);
                }
            });
            
            Event.purgeElement( button );
            Event.on( button, "click", oSelf.MoveSpiesCancel, {Self: oSelf, tab: tab} );
            Dom.setStyle(button, 'display', 'none');
            
            if (spies.length == 0) {
                alert("You must select at least one spy to "+verb+"!");
                return;
            }
            if (spies.length > tab.maxSpies) {
                alert("You don't have any ships large enough to "+verb+" " + spies.length + " spies.");
                return;
            }

            if (send) {
                oSelf.spiesToSend = spies;
            }
            else {
                oSelf.spiesToFetch = spies;
            }
            fleetUL.innerHTML = '';
            spyCount.innerHTML = spies.length;
            
            container = containerParent.removeChild(container); //remove from DOM to make this faster

            var li = document.createElement('li');
            for (var i = 0; i < fleets.length; i++) {
                var fleet = fleets[i];
                var usable = fleet.details.max_occupants * fleet.quantity >= spies.length;
                var nLi = li.cloneNode(false);
                nLi.fleetId = fleet.id;
                nLi.innerHTML = [
                '<div class="yui-gd" style="margin-bottom:2px;">',
                '    <div class="yui-u first" style="width:20%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
                '        <img src="',Lib.AssetUrl,'ships/',fleet.details.type,'.png" style="width:50px;height:50px;" />',
                '    </div>',
                '    <div class="yui-u" style="width:78%">',
                     usable ? '        <button type="button">'+verb.charAt(0).toUpperCase()+verb.slice(1)+' Spies</button>'
                            : '',
                '        <div><strong>[',fleet.details.type_human,'] ',fleet.details.name,'</strong></div>',
                '        <div><strong>Attributes:</strong>',
                '            <span>Speed:<span>',fleet.details.speed,'</span></span>',
                '            <span>Stealth:<span>',fleet.details.stealth,'</span></span>',
                '            <span>Max Spies:<span>',fleet.details.max_occupants,'</span></span>',
                '            <span>Quantity:<span>',fleet.quantity,'</span></span>',
                '        </div>',
                '    </div>',
                '</div>'
                ].join('');
                fleetUL.appendChild(nLi);
                
                var send_button = Sel.query( 'button', nLi, true );
                if (send_button) {
                    Event.on( send_button, "click", oSelf.SendSpyShip, {Self: oSelf, tab: tab, fleet: fleet} );
                }
            }
            
            containerParent.appendChild(container); //add back as child
            
            Dom.setStyle(button, 'display', 'inline');
            
            var Ht = Game.GetSize().h - 260;
            if(Ht > 240) { Ht = 240; }
            Dom.setStyle(fleetUL,'height',Ht + 'px');
        },
        SendSpyShip : function(e, arg) {
            Event.stopEvent(e);
            var tab   = arg.tab,
                oSelf = arg.Self,
                fleet = arg.fleet;
            
            var send = ( tab == 'planetDetailSendSpies' ) ? true : false;
            
            Lacuna.Pulser.Show();
            var spies = send ? oSelf.spiesToSend : oSelf.spiesToFetch;
            var data = {
                    session_id:Game.GetSession(),
                    spy_ids:spies,
                    fleet_id:fleet.id
                },
                successMessage, method;
            
            if (send) {
                successMessage = 'Spies sent!';
                method = "send_spies";
                data.on_body_id = Game.GetCurrentPlanet().id;
                data.to_body_id = oSelf.selectedBody.id;
            }
            else {
                successMessage = 'Spies fetched!';
                method = "fetch_spies";
                data.on_body_id = oSelf.selectedBody.id;
                data.to_body_id = Game.GetCurrentPlanet().id;
            }
            
            Game.Services.Buildings.SpacePort[method]({args: data}, {
                success : function(o){
                    Lacuna.Pulser.Hide();
                    oSelf.fireEvent("onMapRpc", o.result);
                    alert(successMessage + '  Arrival time: ' + Lib.formatServerDateShort(o.result.fleet.date_arrives));
                    
                    delete oSelf.availableSendSpies;
                    delete oSelf.availableSendSpyFleets;
                    delete oSelf.spiesToSend;
                    delete oSelf.availableFetchSpies;
                    delete oSelf.availableFetchSpyFleets;
                    delete oSelf.spiesToFetch;
                    
                    var container = Dom.get(tab);
                    
                    Dom.setStyle( Sel.query(".planetDetailSelectSpies", container, true), "display", "none" );
                    Dom.setStyle( Sel.query("button", container, true), "display", "none" );
                    Dom.setStyle( Sel.query(".planetDetailSelectSpyShip", container, true), "display", "none" );
                    
                    Sel.query(".planetDetailSpiesList", container, true).innerHTML = "";
                    Sel.query(".planetDetailSpyShipList", container, true).innerHTML = "";
                    
                    oSelf.GetSpies(tab);
                },
                scope:this
            });
        },
        MoveSpiesCancel : function(e, arg) {
            var tab = arg.tab;
            var container = Dom.get( tab );
            
            var spyDIV   = Sel.query( '.planetDetailSelectSpies', container, true ),
                fleetDIV = Sel.query( '.planetDetailSelectSpyShip', container, true );
            
            Dom.setStyle( spyDIV, "display", "block" );
            Dom.setStyle( fleetDIV, "display", "none" );
            
            Event.stopEvent(e);
        }
    };
    Lang.augmentProto(MapStar, Util.EventProvider);
    
    Lacuna.MapStar = new MapStar();
})();
YAHOO.register("mapStar", YAHOO.lacuna.MapStar, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
