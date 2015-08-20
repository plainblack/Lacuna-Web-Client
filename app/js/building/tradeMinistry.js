YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Trade == "undefined" || !YAHOO.lacuna.buildings.Trade) {
    
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

    var Trade = function(result){
        Trade.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Trade;
        
        this.availableAcceptText = "Accept";
        this.addTradeText = "Add Trade";
        this.pushTradeText = "Send";
        
        // defaults.  Values are updated to server numbers during get_* calls
        this.shipSize = 50000;
        this.planSize = 10000;
        this.spySize = 350;
        this.glyphSize = 100;
        
        this.createEvent("onLoadResources");
        this.createEvent("onLoadGlyphSummary");
        this.createEvent("onLoadPlanSummary");
        this.createEvent("onLoadShipSummary");
        this.createEvent("onLoadPrisoners");
        
        if(this.building.level > 0) {
            this.subscribe("onLoad", function() {
                this.getStoredResources();
                this.mine.subscribe("activeChange", this.getMyTrades, this, true);
                this.avail.subscribe("activeChange", this.getAvailableTrades, this, true);
                this.push.subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.getPushShips();
                        
                        if(!this.tradePushSubbed) {
                            Event.on("tradePushResources", "click", function(){
                                if(Dom.getStyle("tradePushResourceName", "display") == "none") {
                                    Dom.setStyle("tradePushResourceName", "display", "block");
                                    this.getStoredResources();
                                }
                                else {
                                    Dom.setStyle("tradePushResourceName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradePushGlyphSummary", "click", function(){
                                if(Dom.getStyle("tradePushGlyphSummaryName", "display") == "none") {
                                    Dom.setStyle("tradePushGlyphSummaryName", "display", "block");
                                    this.getGlyphSummary();
                                }
                                else {
                                    Dom.setStyle("tradePushGlyphSummaryName", "display", "none");
                                }
                            }, this, true);

                            Event.on("tradePushPlanSummary", "click", function(){
                                if(Dom.getStyle("tradePushPlanSummaryName", "display") == "none") {
                                    Dom.setStyle("tradePushPlanSummaryName", "display", "block");
                                    this.getPlanSummary();
                                }
                                else {
                                    Dom.setStyle("tradePushPlanSummaryName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradePushShipSummary", "click", function(){
                                if(Dom.getStyle("tradePushShipSummaryName", "display") == "none") {
                                    Dom.setStyle("tradePushShipSummaryName", "display", "block");
                                    this.getShipSummary();
                                }
                                else {
                                    Dom.setStyle("tradePushShipSummaryName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradePushPrisoners", "click", function(){
                                if(Dom.getStyle("tradePushPrisonerName", "display") == "none") {
                                    Dom.setStyle("tradePushPrisonerName", "display", "block");
                                    this.getPrisoners();
                                }
                                else {
                                    Dom.setStyle("tradePushPrisonerName", "display", "none");
                                }
                            }, this, true);
                        }
                        
                        this.tradePushSubbed = 1;
                    }
                },this,true);
                this.add.subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.getAddShips();
                        
                        if(!this.tradeAddSubbed) {
                            Event.on("tradeAddResources", "click", function(){
                                if(Dom.getStyle("tradeAddResourceName", "display") == "none") {
                                    Dom.setStyle("tradeAddResourceName", "display", "block");
                                    this.getStoredResources();
                                }
                                else {
                                    Dom.setStyle("tradeAddResourceName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradeAddGlyphSummary", "click", function(){
                                if(Dom.getStyle("tradeAddGlyphSummaryName", "display") == "none") {
                                    Dom.setStyle("tradeAddGlyphSummaryName", "display", "block");
                                    this.getGlyphSummary();
                                }
                                else {
                                    Dom.setStyle("tradeAddGlyphSummaryName", "display", "none");
                                }
                            }, this, true);

                            Event.on("tradeAddPlanSummary", "click", function(){
                                if(Dom.getStyle("tradeAddPlanSummaryName", "display") == "none") {
                                    Dom.setStyle("tradeAddPlanSummaryName", "display", "block");
                                    this.getPlanSummary();
                                }
                                else {
                                    Dom.setStyle("tradeAddPlanSummaryName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradeAddShipSummary", "click", function(){
                                if(Dom.getStyle("tradeAddShipSummaryName", "display") == "none") {
                                    Dom.setStyle("tradeAddShipSummaryName", "display", "block");
                                    this.getShipSummary();
                                }
                                else {
                                    Dom.setStyle("tradeAddShipSummaryName", "display", "none");
                                }
                            }, this, true);
                            Event.on("tradeAddPrisoners", "click", function(){
                                if(Dom.getStyle("tradeAddPrisonerName", "display") == "none") {
                                    Dom.setStyle("tradeAddPrisonerName", "display", "block");
                                    this.getPrisoners();
                                }
                                else {
                                    Dom.setStyle("tradeAddPrisonerName", "display", "none");
                                }
                            }, this, true);
                        }
                        
                        this.tradeAddSubbed = 1;
                    }
                },this,true);
            }, this, true);
        }
    };

    Lang.extend(Trade, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.availablePager) {
                this.availablePager.destroy();
            }
            if(this.minePage) {
                this.minePage.destroy();
            }
            Trade.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            this.mineTabIndex = 3; //array location plus 1 since Production tab is always first
            return [this._getPushTab(), this._getAvailableTradesTab(), this._getMyTradesTab(), this._getAddTradeTab(), this._getSupplyChainTab(), this._getSupplyShipsTab(), this._getWasteChainTab()];
            },
_getPushTab : function() {
this.push = new YAHOO.widget.Tab({ label: "Push", content: [
    '<div id="pHt"><div class="tradeStash yui-g">',
    '    <div class="yui-u first">',
    '        <legend>On Planet</legend>',
    '        <div class="tradeContainers">',
    '            <div><div id="tradePushResources" class="accordian">Resources</div><ul id="tradePushResourceName"></ul></div>',
    '           <div><div id="tradePushGlyphSummary" class="accordian">Glyphs</div><ul id="tradePushGlyphSummaryName" style="display:none;"></ul></div>',
    '           <div><div id="tradePushPlanSummary" class="accordian">Plans</div><ul id="tradePushPlanSummaryName" style="display:none;"></ul></div>',
    '           <div><div id="tradePushShipSummary" class="accordian">Ships</div><ul id="tradePushShipSummaryName" style="display:none;"></ul></div>',
    '            <div><div id="tradePushPrisoners" class="accordian">Prisoners</div><ul id="tradePushPrisonerName" style="display:none;"></ul></div>',
    '        </div>',
    '    </div>',
    '    <div class="yui-u">',
    '        <legend>To Push</legend>',
    '        <div class="tradeContainers"><ul id="tradePushItems"></ul></div>',
    '    </div>',
    '</div>',
    '<ul style="margin-top:5px;">',
    '    <li style=""><label>Total Cargo:</label><span id="tradePushCargo">0</span></li>',
    '    <li style="margin-bottom:5px;"><label>To Colony:</label><select id="tradePushColony"><option value="" selected>&nbsp;</option></select></li>',
    '    <li style="margin-bottom:5px;"><label>With Ship:</label><select id="tradePushShip"></select></li>',
    '    <li style="margin-bottom:5px;"><label>Stay at Colony:</label><input type="checkbox" id="tradePushStay" /></li>',
    '    <li id="tradePushMessage" class="alert"></li>',
    '</ul></div><button id="tradePushSend">',this.pushTradeText,'</button>'].join('')});

this.subscribe("onLoadResources", this.populatePushResourceName, this, true);
this.subscribe("onLoadGlyphSummary", this.populatePushGlyphSummaryName, this, true);
this.subscribe("onLoadPlanSummary", this.populatePushPlanSummaryName, this, true);
this.subscribe("onLoadShipSummary", this.populatePushShipSummaryName, this, true);
this.subscribe("onLoadPrisoners", this.populatePushPrisonerName, this, true);

Event.onAvailable("tradePushColony", function(){
        var opt = document.createElement("option"),
        planets = Lib.planetarySort(Game.EmpireData.planets),
        cp = Game.GetCurrentPlanet(),
        nOpt;

        for(var p=0; p<planets.length; p++) {
        if(planets[p].id != cp.id){
        nOpt = opt.cloneNode(false);
        nOpt.value = planets[p].id;
        nOpt.innerHTML = planets[p].name;
        this.appendChild(nOpt);
        }
        }
        });
Event.on("tradePushColony", "change", this.getPushShips, this, true);

Event.delegate("tradePushResourceName", "click", this.PushAddResource, "button", this, true);
Event.delegate("tradePushGlyphSummaryName", "click", this.PushAddGlyphSummary, "button", this, true);
Event.delegate("tradePushPlanSummaryName", "click", this.PushAddPlanSummary, "button", this, true);
Event.delegate("tradePushShipSummaryName", "click", this.PushAddShipSummary, "button", this, true);
Event.delegate("tradePushPrisonerName", "click", this.PushAddPrisoner, "button", this, true);

Event.delegate("tradePushItems", "click", this.PushRemove, "button", this, true);

Event.on("tradePushSend", "click", this.Push, this, true);

return this.push;
              },
_getAvailableTradesTab : function() {
                   this.avail = new YAHOO.widget.Tab({ label: "Trades", content: [
                           '<div>',
                           '    <div style="border-bottom: 1px solid #52ACFF; padding-bottom: 5px; margin-bottom: 5px;"><label>Filter:</label><select id="tradeFilter"><option value="">All</option><option value="energy">Energy</option><option value="food">Food</option><option value="ore">Ore</option>',
                           '    <option value="water">Water</option><option value="waste">Waste</option><option value="glyph">Glyph</option><option value="prisoner">Prisoner</option>',
                           '    <option value="ship">Ship</option><option value="plan">Plan</option></select></div>',
                           '    <ul class="tradeHeader tradeInfo clearafter">',
                           '        <li class="tradeEmpire">Empire</li>',
                           '        <li class="tradeOfferedDate">Travel Time</li>',
                           '        <li class="tradeAsking">Cost</li>',
                           '        <li class="tradeOffer">Offering</li>',
                           '        <li class="tradeAction"></li>',
                           '        <li class="tradeAction"></li>',
                           '    </ul>',
                           '    <div><div id="tradeAvailableDetails"></div></div>',
                           '    <div id="tradeAvailablePaginator"></div>',
                           '</div>'].join('')});

                   Event.on("tradeFilter", "change", function(e) { this.getAvailableTrades({newValue:true}); }, this, true);

                   return this.avail;
               },
_getMyTradesTab : function() {
                  this.mine = new YAHOO.widget.Tab({ label: "My Trades", content: ['<div class="myTrades">',
                          '    <ul class="tradeHeader tradeInfo clearafter">',
                          '        <li class="tradeOfferedDate">Offered Date</li>',
                          '        <li class="tradeAsking">Cost</li>',
                          '        <li class="tradeOffer">Offering</li>',
                          '        <li class="tradeAction"></li>',
                          '    </ul>',
                          '    <div><div id="tradeMineDetails"></div></div>',
                          '    <div id="tradeMinePaginator"></div>',
                          '</div>'].join('')});

                  return this.mine;
              },
_getAddTradeTab : function() {
                 this.add = new YAHOO.widget.Tab({ label: "Add Trade", content: [
                         '<div id="aHt"><div class="tradeStash yui-g">',
                         '    <div class="yui-u first">',
                         '        <legend>On Planet</legend>',
                         '        <div class="tradeContainers">',
                         '            <div><div id="tradeAddResources" class="accordian">Resources</div><ul id="tradeAddResourceName"></ul></div>',
                         '           <div><div id="tradeAddGlyphSummary" class="accordian">Glyph</div><ul id="tradeAddGlyphSummaryName" style="display:none;"></ul></div>',
                         '           <div><div id="tradeAddPlanSummary" class="accordian">Plan</div><ul id="tradeAddPlanSummaryName" style="display:none;"></ul></div>',
                         '           <div><div id="tradeAddShipSummary" class="accordian">Ship</div><ul id="tradeAddShipSummaryName" style="display:none;"></ul></div>',
                         '            <div><div id="tradeAddPrisoners" class="accordian">Prisoners</div><ul id="tradeAddPrisonerName" style="display:none;"></ul></div>',
                         '        </div>',
                         '    </div>',
                         '    <div class="yui-u">',
                         '        <legend>To Offer</legend>',
                         '        <div class="tradeContainers"><ul id="tradeAddItems"></ul></div>',
                         '    </div>',
                         '</div>',
                         '<ul style="margin-top:5px;">',
                         '    <li style=""><label>Total Cargo:</label><span id="tradeAddCargo">0</span></li>',
                         '    <li style="margin: 5px 0;"><label style="font-weight:bold">Asking Essentia:</label><input type="text" id="tradeAddAskingQuantity" /></li>',
            '    <li style="margin-bottom:5px;"><label>With Ship:</label><select id="tradeAddShip"></select></li>',
            '    <li id="tradeAddMessage" class="alert"></li>',
            '</ul></div><button id="tradeAdd">',this.addTradeText,'</button>'].join('')});
            
            this.subscribe("onLoadResources", this.populateAddResourceName, this, true);
            this.subscribe("onLoadGlyphSummary", this.populateAddGlyphSummaryName, this, true);
            this.subscribe("onLoadPlanSummary", this.populateAddPlanSummaryName, this, true);
            this.subscribe("onLoadShipSummary", this.populateAddShipSummaryName, this, true);
            this.subscribe("onLoadPrisoners", this.populateAddPrisonerName, this, true);
            
            Event.delegate("tradeAddResourceName", "click", this.AddResource, "button", this, true);
            Event.delegate("tradeAddGlyphSummaryName", "click", this.AddGlyphSummary, "button", this, true);
            Event.delegate("tradeAddPlanSummaryName", "click", this.AddPlanSummary, "button", this, true);
            Event.delegate("tradeAddShipSummaryName", "click", this.AddShipSummary, "button", this, true);
            Event.delegate("tradeAddPrisonerName", "click", this.AddPrisoner, "button", this, true);
            
            Event.delegate("tradeAddItems", "click", this.AddRemove, "button", this, true);
            
            Event.on("tradeAdd", "click", this.AddTrade, this, true);
            return this.add;
        },
_getSupplyChainTab : function() {
    var planets = Lib.planetarySort(Game.EmpireData.planets),
        current_planet = Game.GetCurrentPlanet(),
        target_options = "";

    for(var p=0; p<planets.length; p++) {
      if(planets[p].id != current_planet.id){
        target_options += [
            '<option value="', planets[p].id, '">', planets[p].name, '</option>'
        ].join('');
      }
    }
    
    this.supplyChainTab = new YAHOO.widget.Tab({ label: "Supply Chains", content: [
        '<div id="supplyChainInfo" style="margin-bottom: 2px">',
        '    <div id="supplyChainMaxCount"></div><hr/>',
        '    <div id="supplyChainAddNew">',
        '     <b>Add New Supply Chain</b><br/>',
        '     Target: <select id="supplyChainAddTargetId">',
                target_options,
        '     </select>',
        '     Resource: <select id="supplyChainAddResourceType">',
                this.resourceOptionsHTML(),
        '     </select>',
        '     Resources/hr: <input id="supplyChainAddResourceHour" type="text"/>',
        '     <button id="supplyChainAddButton">Add</button>',
        '   </div>',
        '   <div id="supplyChainMetric"></div><hr/>',
        '   <div id="supplyChainList">',
        '      <ul id="supplyChainListHeader" class="supplyChainHeader supplyChainInfo clearafter">',
        '        <li class="supplyChainBody">Target</li>',
        '        <li class="supplyChainResource">Resource</li>',
        '        <li class="supplyChainHour">/hr</li>',
        '        <li class="supplyChainAction"></li>',
        '      </ul>',
        '      <div><div id="supplyChainListDetails"></div></div>',
        '   </div>',
        '   <div id="supplyChainListNone"><b>No Supply Chains In Use</b></div>',
        '</div>',
    ].join('')});
    
    Event.on("supplyChainAddButton", "click", this.SupplyChainAddNew, {Self:this}, true);
    
    this.supplyChainTab.subscribe("activeChange", this.viewSupplyChainInfo, this, true);

    return this.supplyChainTab;
},
_getSupplyShipsTab : function() {
    this.supplyShipsTab = new YAHOO.widget.Tab({ label: "Supply Ships", content: [
        '<div id="supplyChainShipsInfo"></div><hr/>',
        '<div id="supplyChainShipsHeader">',
        '  <ul class="shipHeader shipInfo clearafter">',
        '    <li class="shipName">Name</li>',
        '    <li class="shipTask">Task</li>',
        '    <li class="shipSpeed">Speed</li>',
        '    <li class="shipHold">Hold</li>',
        '    <li class="shipAction"></li>',
        '  </ul>',
        '  <div><div id="supplyChainShipsDetails"></div></div>',
        '</div>',
        '<div id="supplyChainShipsNone">There are no supply ships available.</div>'
    ].join('')});
    
    this.supplyShipsTab.subscribe("activeChange", this.viewSupplyShips, this, true);

    return this.supplyShipsTab;
},
_getWasteChainTab : function() {
    this.wasteChainTab = new YAHOO.widget.Tab({ label: "Waste Chain", content: [
        '<div id="wasteChainDetails" style="margin-bottom: 2px"></div>',
        '<div id="wasteChainShips">',
        '    <ul class="shipHeader shipInfo clearafter">',
        '        <li class="shipName">Name</li>',
        '        <li class="shipTask">Task</li>',
        '        <li class="shipSpeed">Speed</li>',
        '        <li class="shipHold">Hold</li>',
        '        <li class="shipAction"></li>',
        '    </ul>',
        '    <div><div id="wasteChainShipsDetails"></div></div>',
        '</div>',
        '<div id="wasteChainShipsNone">There are no scows available.</div>'
    ].join('')});
    
    this.wasteChainTab.subscribe("activeChange", this.viewWasteChainInfo, this, true);

    return this.wasteChainTab;
},
        
        getGlyphSummary : function(force) {
            if(force || !this.glyph_summary) {
                require('js/actions/menu/loader').show();
                this.service.get_glyph_summary({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.glyph_summary = o.result.glyphs;
                        this.glyphSize = o.result.cargo_space_used_each;
                        this.fireEvent("onLoadGlyphSummary");
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },

        getPlanSummary : function(force) {
            if(force || !this.plan_summary) {
                require('js/actions/menu/loader').show();
                this.service.get_plan_summary({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.plan_summary = o.result.plans;
                        this.planSize = o.result.cargo_space_used_each;
                        this.fireEvent("onLoadPlanSummary");
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        getPrisoners : function(force) {
            if(force || !this.prisoners) {
                require('js/actions/menu/loader').show();
                this.service.get_prisoners({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.prisoners = o.result.prisoners;
                        this.spySize = o.result.cargo_space_used_each;
                        this.fireEvent("onLoadPrisoners");
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        getShipSummary : function(force) {
            if(force || !this.ship_summary) {
                require('js/actions/menu/loader').show();
                this.service.get_ship_summary({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.ship_summary = o.result.ships;
                        this.shipSize = o.result.cargo_space_used_each;
                        this.fireEvent("onLoadShipSummary");
                        require('js/actions/menu/loader').hide();
                    }, 
                    scope:this
                });
            }
        },
        getStoredResources : function(force) {
            if(force || !this.resources) {
                require('js/actions/menu/loader').show();
                this.service.get_stored_resources({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.resources = o.result.resources;
                        this.fireEvent("onLoadResources");
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        
        //View Available
        getAvailableTrades : function(e) {
            if(e.newValue) {
                require('js/actions/menu/loader').show();
                var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:1},
                    selVal = Lib.getSelectedOptionValue("tradeFilter");
                if(selVal) {
                    data.filter = selVal;
                }
                this.service.view_market(data, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.view_available_trades.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        delete o.result.status; //get rid of status after we process it, since it's big
                        this.availableTrades = o.result; //store: trades=[], trade_count = 1, page_number=1,  captcha = {guid, url}
                        
                        this.availablePager = new Pager({
                            rowsPerPage : 25,
                            totalRecords: o.result.trade_count,
                            containers  : 'tradeAvailablePaginator',
                            template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                            alwaysVisible : false

                        });
                        this.availablePager.subscribe('changeRequest',this.AvailableHandlePagination, this, true);
                        this.availablePager.render();
                        
                        this.AvailablePopulate();
                    },
                    scope:this
                });
            }
        },
        AvailablePopulate : function() {
            var details = Dom.get("tradeAvailableDetails");
            
            if(details) {
                var trades = this.availableTrades.trades,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                                
                for(var i=0; i<trades.length; i++) {
                    var trade = trades[i],
                        bbtn,
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.Trade = trade;
                    Dom.addClass(nUl, "tradeInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeEmpire");
                    nLi.innerHTML = trade.empire.name;
                    Event.on(nLi, "click", this.EmpireProfile, trade.empire);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeOfferedDate");
                    nLi.innerHTML = Lib.formatTime(Math.round(trade.delivery.duration));
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAsking");
                    nLi.innerHTML = [trade.ask,'<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" />'].join('');
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeOffer");
                    nLi.innerHTML = Lib.formatInlineList(trade.offer);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAction");
                    bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = this.availableAcceptText;
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.AvailableAccept, {Self:this,Trade:trade,Line:nUl}, true);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAction");
                    bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    Dom.addClass(bbtn, "reportAbuse");
                    bbtn.innerHTML = "Spam";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.AvailableReport, {Self:this,Trade:trade,Line:nUl}, true);
                    nUl.appendChild(nLi);
                                
                    details.appendChild(nUl);
                    
                }
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 240;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        AvailableHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:newState.page},
                selVal = Lib.getSelectedOptionValue("tradeFilter");
            if(selVal) {
                data.filter = selVal;
            }
            this.service.view_market(data, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.view_available_trades.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    delete o.result.status; //get rid of status after we process it, since it's big
                    this.availableTrades = o.result; //store: trades=[], trade_count = 1, page_number=1,  captcha = {guid, url}
                    
                    this.AvailablePopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.availablePager.setState(newState);
        },
        AvailableAccept : function() {
            require('js/actions/menu/loader').show();
            this.Self.service.accept_from_market({
                session_id:Game.GetSession(""),
                building_id:this.Self.building.id,
                trade_id:this.Trade.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.accept_trade.success");
                    this.Self.rpcSuccess(o);
                    //force get the new availabe list after accepting so we get a new captcha
                    this.Self.getAvailableTrades({newValue:true});
                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
        },
        AvailableReport : function() {
            require('js/actions/menu/loader').show();
            this.Self.service.report_abuse({
                session_id:Game.GetSession(""),
                building_id:this.Self.building.id,
                trade_id:this.Trade.id
            }, {
                success : function(o){
                    var btn = Sel.query(".reportAbuse",this.Line, true);
                    if(btn) {
                        Event.purgeElement(btn);
                        btn.parentNode.removeChild(btn);
                    }
                    this.Self.rpcSuccess(o);
                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
        },
        EmpireProfile : function(e, empire) {
            Lacuna.Info.Empire.Load(empire.id);
        },
        
        
        //View Mine
        getMyTrades : function(e) {
            if(e.newValue) {
                require('js/actions/menu/loader').show();
                this.service.view_my_market({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.view_my_trades.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        delete o.result.status; //get rid of status after we process it, since it's big
                        this.mineTrades = o.result; //store: trades=[], trade_count = 1, page_number=1
                        
                        this.minePage = new Pager({
                            rowsPerPage : 25,
                            totalRecords: o.result.trade_count,
                            containers  : 'tradeMinePaginator',
                            template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                            alwaysVisible : false

                        });
                        this.minePage.subscribe('changeRequest',this.MineHandlePagination, this, true);
                        this.minePage.render();
                        
                        this.MinePopulate();
                    },
                    scope:this
                });
            }
        },
        MinePopulate : function() {
            var details = Dom.get("tradeMineDetails");
            
            if(details) {
                var trades = this.mineTrades.trades,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";

                for(var i=0; i<trades.length; i++) {
                    var trade = trades[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.Trade = trade;
                    Dom.addClass(nUl, "tradeInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeOfferedDate");
                    nLi.innerHTML = Lib.formatServerDateTimeShort(trade.date_offered);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAsking");
                    nLi.innerHTML = [trade.ask,'<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" />'].join('');
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeOffer");
                    nLi.innerHTML = Lib.formatInlineList(trade.offer);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = "Withdraw";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.MineWithdraw, {Self:this,Trade:trade,Line:nUl}, true);

                    nUl.appendChild(nLi);
                                
                    details.appendChild(nUl);
                    
                }

                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 185;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        MineHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.view_my_market({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.view_available_trades.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    delete o.result.status; //get rid of status after we process it, since it's big
                    this.mineTrades = o.result; //store: trades=[], trade_count = 1, page_number=1
                    
                    this.MinePopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.minePage.setState(newState);
        },
        MineWithdraw : function() {
            if(confirm(['Are you sure you want to withdraw the trade asking for ', this.Trade.ask, ' essentia and offering ', this.Trade.offer.join(', '),'?'].join(''))) {
                require('js/actions/menu/loader').show();
                this.Self.service.withdraw_from_market({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    trade_id:this.Trade.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.withdraw_trade.success");
                        this.Self.rpcSuccess(o);
                        var trades = this.Self.mineTrades.trades;
                        for(var i=0; i<trades.length; i++) {
                            if(trades[i].id == this.Trade.id) {
                                trades.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        require('js/actions/menu/loader').hide();
                        
                        this.Self.getStoredResources(true);
                        this.Self.getPlanSummary(true);
                        this.Self.getGlyphSummary(true);
                        this.Self.getPrisoners(true);
                        this.Self.getShipSummary(true);
                    },
                    scope:this
                });
            }
        },
        
        //Add trade
        populateAddResourceName : function() {
            var elm = Dom.get("tradeAddResourceName"),
                li = document.createElement("li"), nLi, x, r, name, resource;
                
            if(elm) {
                elm.innerHTML = "";
                for(r in Lib.ResourceTypes) {
                    if(Lib.ResourceTypes.hasOwnProperty(r)) {
                        resource = Lib.ResourceTypes[r];
                        if(Lang.isArray(resource)) {
                            for(x=0; x < resource.length; x++) {
                                name = resource[x];
                                if(this.resources[name]) {
                                    nLi = li.cloneNode(false);
                                    nLi.Resource = {type:name,quantity:this.resources[name]*1};
                                    nLi.innerHTML = ['<span class="tradeResourceName">',name.titleCaps(), ' (<label class="quantity">', this.resources[name], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                                    elm.appendChild(nLi);
                                }
                            }
                        }
                        else if(this.resources[r] && resource) {
                            nLi = li.cloneNode(false);
                            nLi.Resource = {type:r,quantity:this.resources[r]*1};
                            nLi.innerHTML = ['<span class="tradeResourceName">',r.titleCaps(), ' (<label class="quantity">', this.resources[r], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                            elm.appendChild(nLi);
                        }
                    }
                }
            }
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 180;
                if(Ht > 300) { Ht = 300; }
                var aHt = Dom.get('aHt');
                Dom.setStyle(aHt,"height",Ht + "px");
                Dom.setStyle(aHt,"overflow-y","auto");
            },10);
        },
        populateAddGlyphSummaryName : function() {
            var elm = Dom.get("tradeAddGlyphSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.glyph_summary.length > 0) {
                    for(var x=0; x < this.glyph_summary.length; x++) {
                        var obj = this.glyph_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.GlyphSummary = obj;
                        nLi.innerHTML = ['<span class="tradeResourceName">',obj.name.titleCaps(), ' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Glyphs Available";
                    elm.appendChild(nLi);
                }
            }
        },
        populateAddPlanSummaryName : function() {
            var elm = Dom.get("tradeAddPlanSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.plan_summary.length > 0) {
                    for(var x=0; x < this.plan_summary.length; x++) {
                        var obj = this.plan_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.PlanSummary = obj;
                        if (obj.extra_build_level > 0) {
                            nLi.innerHTML = ['<span class="tradeResourceName">',obj.name,' ',obj.level,'+',obj.extra_build_level, ' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        }
                        else {
                            nLi.innerHTML = ['<span class="tradeResourceName">',obj.name,' ',obj.level,' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        }
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Plans Available";
                    elm.appendChild(nLi);
                }
            }
        },
        populateAddShipSummaryName : function() {
            var elm = Dom.get("tradeAddShipSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.ship_summary.length > 0) {
                    for(var x=0; x < this.ship_summary.length; x++) {
                        var obj = this.ship_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.ShipSummary = obj;
                        nLi.innerHTML = ['<span class="tradeResourceName">', obj.name,' - ',obj.type.titleCaps('_',' '),
                                         ' - Hold:',obj.hold_size,
                                         ' - Berth:',obj.berth_level,
                                         ' - Speed:',obj.speed,
                                         ' (<label class="quantity">', obj.quantity,
                                         '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Ships Available";
                    elm.appendChild(nLi);
                }
            }
        },
        populateAddPrisonerName : function() {
            var elm = Dom.get("tradeAddPrisonerName"),
                li = document.createElement("li"), nLi;
                
            if(elm) {
                elm.innerHTML = "";
                if(this.prisoners.length > 0) {
                    for(var x=0; x < this.prisoners.length; x++) {
                        var obj = this.prisoners[x];
                        nLi = li.cloneNode(false);
                        nLi.Prisoner = obj;
                        nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '</span> <button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Prisoners Available";
                    elm.appendChild(nLi);
                }
            }
        },
        getAddShips : function() {
            require('js/actions/menu/loader').show();
            
            this.service.get_trade_ships({
                session_id: Game.GetSession(""),
                building_id: this.building.id
            },{
                success : function(o){
                    this.rpcSuccess(o);
                    
                    var elm = Dom.get("tradeAddShip"),
                        opt = document.createElement("option"),
                        ships = o.result.ships,
                        nOpt;
                        
                    if(elm && ships) {
                        var selectedVal = Lib.getSelectedOptionValue(elm);
                        elm.options.length = 0;    
                        for(var x=0; x < ships.length; x++) {
                            var obj = ships[x];
                            nOpt = opt.cloneNode(false);
                            nOpt.value = obj.id;
                            nOpt.innerHTML = [obj.name, ' (', obj.type_human, ' - Hold:', obj.hold_size,
                                                                          ' - Berth:', obj.berth_level,
                                                                          ' - Speed:', obj.speed, ')'
                                                                         ].join('');
                            nOpt.selected = selectedVal == obj.id;
                            elm.appendChild(nOpt);
                        }
                    }
                    
                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
        },
        updateAddCargo : function(byVal) {
            var c = Dom.get("tradeAddCargo"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        AddResource : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradeAddItems");
            if(quantity && c) {
                var id = "addResource-" + li.Resource.type,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    if(quantity > li.Resource.quantity) {
                        quantity = li.Resource.quantity;
                    }
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateAddCargo(ep.Object.quantity * -1);
                        Event.purgeElement(ep);
                        ep.parentNode.removeChild(ep);
                    }, this, true);
                    item.Object = {type:li.Resource.type, quantity:quantity, size:1};
                    content.innerHTML = ['<span class="tradeResourceName">',item.Object.type.titleCaps(), ' (<label class="quantity">', quantity, '</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updateAddCargo(quantity);
                }
                else {
                    var found = exists[0],
                        newTotal = found.Object.quantity + quantity,
                        diff = quantity,
                        lq = Sel.query(".quantity", found, true),
                        inp = Sel.query("input", found, true);
                    if(newTotal > li.Resource.quantity) {
                        newTotal = li.Resource.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateAddCargo(diff);
                    
                    var a = new Util.ColorAnim(lq, {color:{from:'#0f0',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        AddGlyphSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradeAddItems");
            if(li && c) {
                var gName = li.GlyphSummary.name,
                    id = "addGlyphSummary-" + gName,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateAddCargo(ep.Object.quantity * -this.glyphSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {name:gName, quantity:quantity, type:"glyph", size:this.glyphSize};
                    content.innerHTML = ['<span class="tradeResourceName">',gName.titleCaps(),' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updateAddCargo(this.glyphSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.GlyphSummary.quantity) {
                        newTotal = li.GlyphSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateAddCargo(this.glyphSize * diff);
                }
            }
        },
        AddPlanSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradeAddItems");
            if(li && c) {
                var pName = li.PlanSummary.name,
                    pType = li.PlanSummary.plan_type,
                    pLevel = li.PlanSummary.level,
                    pExtra = li.PlanSummary.extra_build_level,
                    id = ['addPlanSummary-', pType, '-', pLevel, '-', pExtra].join('').titleCaps(' ','_'),
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateAddCargo(ep.Object.quantity * -this.planSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {plan_type:pType, quantity:quantity, type:"plan", level:pLevel, extra_build_level:pExtra, size:this.planSize};
                    if(pExtra > 0) {
                        content.innerHTML = ['<span class="tradeResourceName">',pName, ' ', pLevel, '+', pExtra,' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    }
                    else {
                        content.innerHTML = ['<span class="tradeResourceName">',pName, ' ', pLevel,' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    }

                    c.appendChild(item);
                    this.updateAddCargo(this.planSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.PlanSummary.quantity) {
                        newTotal = li.PlanSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateAddCargo(this.planSize * diff);
                }
            }
        },
        AddShipSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradeAddItems");
            if(li && c) {
                var sName = li.ShipSummary.name,
                    sType = li.ShipSummary.type,
                    sSize = li.ShipSummary.hold_size,
                    sBerth = li.ShipSummary.berth_level,
                    sSpeed = li.ShipSummary.speed,
                    id = ['addShipSummary', sName, sType, sSize, sBerth, sSpeed].join('-').titleCaps(' ','_'),
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateAddCargo(ep.Object.quantity * -this.shipSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {quantity:quantity, type:"ship", name:sName, ship_type:sType, hold_size:sSize, berth_level:sBerth, speed:sSpeed, size:this.shipSize};
                    content.innerHTML = ['<span class="tradeResourceName">', sName, ' - ', sType.titleCaps('_',' '),
                                         ' - Hold:', sSize,
                                         ' - Berth:', sBerth,
                                         ' - Speed:', sSpeed,
                                         ' (<label class="quantity">',quantity,
                                         '</label>)</span> <input type="text" style="width:75px;" value="',
                                         quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updateAddCargo(this.shipSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.ShipSummary.quantity) {
                        newTotal = li.ShipSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateAddCargo(this.shipSize * diff);
                }
            }
        },

        AddPrisoner : function(e, matchedEl, container){
            var li = matchedEl.parentNode,
                c = Dom.get("tradeAddItems");
            if(li && c) {
                var obj = li.Prisoner,
                    gId = obj.id,
                    id = "addPrisoner-" + gId;
                if(Sel.query("#"+id, c).length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(){ 
                        this.updateAddCargo(this.spySize*-1);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item); 
                    }, this, true);
                    item.Object = {prisoner_id:gId, type:"prisoner", size:this.spySize};
                    content.innerHTML = [obj.name, ' ', obj.level].join('');
                    c.appendChild(item);
                    this.updateAddCargo(this.spySize);
                }
            }
        },
        AddRemove : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode.parentNode;
            if(quantity) {
                var newTotal = li.Object.quantity - quantity,
                    diff = quantity*-1,
                    lq = Sel.query(".quantity", li, true);
                if(newTotal < 0) {
                    newTotal = 0;
                    diff = li.Object.quantity*-1;
                }
                
                if(newTotal == 0) {
                    this.updateAddCargo(li.Object.quantity * -1 * li.Object.size);
                    Event.purgeElement(li);
                    li.parentNode.removeChild(li);
                }
                else {
                    lq.innerHTML = newTotal;
                    li.Object.quantity = newTotal;
                    this.updateAddCargo(diff * li.Object.size);
                    var a = new Util.ColorAnim(lq, {color:{from:'#f00',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        AddTrade : function() {
            var qVal = Dom.get("tradeAddAskingQuantity").value*1;
            if(!Lang.isNumber(qVal) || qVal <= 0) {
                Dom.get("tradeAddMessage").innerHTML = "Quantity of asking essentia must be a number and greater than 0";
                return;
            }
            else {
                Dom.get("tradeAddMessage").innerHTML = "";
            }
                
            var data = {
                    session_id:Game.GetSession(""),
                    building_id:this.building.id,
                    offer: [],
                    ask: qVal,
                    options: {
                        ship_id:Lib.getSelectedOptionValue("tradeAddShip")
                    }
                },
                hasResources, hasPlans, hasGlyphs, hasShips, hasPrisoners,
                lis = Sel.query("li","tradeAddItems");
                
            for(n=0; n<lis.length; n++) {
                obj = lis[n].Object;
                if(obj) {
                    data.offer[data.offer.length] = obj;
                    switch(obj.type) {
                        case "plan":
                            hasPlanes = true;
                            break;
                        case "glyph":
                            hasGlyphs = true;
                            break;
                        case "prisoner":
                            hasPrisoners = true;
                            break;
                        case "ship":
                            hasShips = true;
                            break;
                        default:
                            hasResources = true;
                            break;
                    }
                }
            }
            
            require('js/actions/menu/loader').show();
            this.service.add_to_market(data, {
                success : function(o){
                    this.rpcSuccess(o);
                    if(hasResources) {
                        this.getStoredResources(true);
                    }
                    if(hasPlans) {
                        this.getPlanSummary(true);
                    }
                    if(hasGlyphs) {
                        this.getGlyphSummary(true);
                    }
                    if(hasPrisoners) {
                        this.getPrisoners(true);
                    }
                    if(hasShips) {
                        this.getShipSummary(true);
                    }
                    for(var i=0; i<lis.length; i++) {
                        if(lis[i].Object) {
                            Event.purgeElement(lis[i]);
                            lis[i].parentNode.removeChild(lis[i]);
                        }
                    }
                    Dom.get("tradeAddAskingQuantity").value = "";
                    Dom.get("tradeAddCargo").innerHTML = "0";
                    this.fireEvent("onSelectTab", this.mineTabIndex);
                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
        },
        
        //Push Resources
        populatePushResourceName : function() {
            var elm = Dom.get("tradePushResourceName"),
                li = document.createElement("li"), nLi, x, r, name, resource;
                
            if(elm) {
                elm.innerHTML = "";
                for(r in Lib.ResourceTypes) {
                    if(Lib.ResourceTypes.hasOwnProperty(r)) {
                        resource = Lib.ResourceTypes[r];
                        if(Lang.isArray(resource)) {
                            for(x=0; x < resource.length; x++) {
                                name = resource[x];
                                if(this.resources[name]) {
                                    nLi = li.cloneNode(false);
                                    nLi.Resource = {type:name,quantity:this.resources[name]*1};
                                    nLi.innerHTML = ['<span class="tradeResourceName">',name.titleCaps(), ' (<label class="quantity">', this.resources[name], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                                    elm.appendChild(nLi);
                                }
                            }
                        }
                        else if(this.resources[r] && resource) {
                            nLi = li.cloneNode(false);
                            nLi.Resource = {type:r,quantity:this.resources[r]*1};
                            nLi.innerHTML = ['<span class="tradeResourceName">',r.titleCaps(), ' (<label class="quantity">', this.resources[r], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                            elm.appendChild(nLi);
                        }
                    }
                }
            }
            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 180;
                if(Ht > 320) { Ht = 320; }
                var pHt = Dom.get('pHt');
                Dom.setStyle(pHt,"height",Ht + "px");
                Dom.setStyle(pHt,"overflow-y","auto");
            },10);
        },
        populatePushGlyphSummaryName : function() {
            var elm = Dom.get("tradePushGlyphSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.glyph_summary.length > 0) {
                    for(var x=0; x < this.glyph_summary.length; x++) {
                        var obj = this.glyph_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.GlyphSummary = obj;
                        nLi.innerHTML = ['<span class="tradeResourceName">',obj.name.titleCaps(), ' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Glyphs Available";
                    elm.appendChild(nLi);
                }
            }
        },

        populatePushPlanSummaryName : function() {
            var elm = Dom.get("tradePushPlanSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.plan_summary.length > 0) {
                    for(var x=0; x < this.plan_summary.length; x++) {
                        var obj = this.plan_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.PlanSummary = obj;
                        if(obj.extra_build_level > 0) {
                            nLi.innerHTML = ['<span class="tradeResourceName">',obj.name,' ',obj.level,'+',obj.extra_build_level, ' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        }
                        else {
                            nLi.innerHTML = ['<span class="tradeResourceName">',obj.name,' ',obj.level, ' (<label class="quantity">', obj.quantity, '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        }
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Plans Available";
                    elm.appendChild(nLi);
                }
            }
        },
        populatePushShipSummaryName : function() {
            var elm = Dom.get("tradePushShipSummaryName"),
                li = document.createElement("li"), nLi;

            if(elm) {
                elm.innerHTML = "";
                if(this.ship_summary.length > 0) {
                    for(var x=0; x < this.ship_summary.length; x++) {
                        var obj = this.ship_summary[x];
                        nLi = li.cloneNode(false);
                        nLi.ShipSummary = obj;
                        nLi.innerHTML = ['<span class="tradeName">',obj.name,
                                         ' - ', obj.type.titleCaps('_',' '),
                                         ' - Hold:', obj.hold_size,
                                         ' - Berth:', obj.berth_level,
                                         ' - Speed:', obj.speed,
                                         ' (<label class="quantity">', obj.quantity,
                                         '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Ships Available";
                    elm.appendChild(nLi);
                }
            }
        },
        populatePushPrisonerName : function() {
            var elm = Dom.get("tradePushPrisonerName"),
                li = document.createElement("li"), nLi;
                
            if(elm) {
                elm.innerHTML = "";
                if(this.prisoners.length > 0) {
                    for(var x=0; x < this.prisoners.length; x++) {
                        var obj = this.prisoners[x];
                        nLi = li.cloneNode(false);
                        nLi.Prisoner = obj;
                        nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '</span> <button type="button">+</button>'].join('');
                        elm.appendChild(nLi);
                    }
                }
                else {
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = "No Prisoners Available";
                    elm.appendChild(nLi);
                }
            }
        },
        getPushShips : function() {
            var targetId = Lib.getSelectedOptionValue("tradePushColony");
            if(targetId) {
                require('js/actions/menu/loader').show();
                this.service.get_trade_ships({
                    session_id: Game.GetSession(""),
                    building_id: this.building.id,
                    target_body_id: targetId
                },{
                    success : function(o){
                        this.rpcSuccess(o);
                        
                        var elm = Dom.get("tradePushShip"),
                            opt = document.createElement("option"),
                            ships = o.result.ships,
                            nOpt;
                            
                        if(elm && ships) {
                            var selectedVal = Lib.getSelectedOptionValue(elm);
                            elm.options.length = 0;    
                            for(var x=0; x < ships.length; x++) {
                                var obj = ships[x];
                                nOpt = opt.cloneNode(false);
                                nOpt.value = obj.id;
                                nOpt.innerHTML = [obj.name, ' (', obj.type_human, ' - Hold:', obj.hold_size, ' - Estimated Travel Time:', Lib.formatTime(obj.estimated_travel_time), ')'].join('');
                                nOpt.selected = selectedVal == obj.id;
                                elm.appendChild(nOpt);
                            }
                        }
                        
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
            else {
                Dom.get("tradePushShip").options.length = 0;
            }
        },
        updatePushCargo : function(byVal) {
            var c = Dom.get("tradePushCargo"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        PushAddResource : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradePushItems");
            if(quantity && c) {
                var id = "pushResource-" + li.Resource.type,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    if(quantity > li.Resource.quantity) {
                        quantity = li.Resource.quantity;
                    }
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updatePushCargo(ep.Object.quantity * -1);
                        Event.purgeElement(ep);
                        ep.parentNode.removeChild(ep);
                    }, this, true);
                    item.Object = {type:li.Resource.type, quantity:quantity, size:1};
                    content.innerHTML = ['<span class="tradeResourceName">',item.Object.type.titleCaps(), ' (<label class="quantity">', quantity, '</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updatePushCargo(quantity);
                }
                else {
                    var found = exists[0],
                        newTotal = found.Object.quantity + quantity,
                        diff = quantity,
                        lq = Sel.query(".quantity", found, true),
                        inp = Sel.query("input", found, true);
                    if(newTotal > li.Resource.quantity) {
                        newTotal = li.Resource.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updatePushCargo(diff);

                    var a = new Util.ColorAnim(lq, {color:{from:'#0f0',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        PushAddGlyphSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradePushItems");
            if(li && c) {
                var gName = li.GlyphSummary.name,
                    id = "pushGlyphSummary-" + gName,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updatePushCargo(ep.Object.quantity * -this.glyphSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {name:gName, quantity:quantity, type:"glyph", size:this.glyphSize};
                    content.innerHTML = ['<span class="tradeResourceName">',gName.titleCaps(),' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updatePushCargo(this.glyphSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.GlyphSummary.quantity) {
                        newTotal = li.GlyphSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updatePushCargo(this.glyphSize * diff);
                }
            }
        },
        PushAddPlanSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradePushItems");
            if(quantity && li && c) {
                var pName = li.PlanSummary.name,
                    pType = li.PlanSummary.plan_type,
                    pLevel = li.PlanSummary.level,
                    pExtra = li.PlanSummary.extra_build_level,
                    id = ['pushPlanSummary-', pType, '-', pLevel, '-', pExtra].join('').titleCaps(' ','_'),
                    exists = Sel.query("#"+id, c);

                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updatePushCargo(ep.Object.quantity * -this.planSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {plan_type:pType, quantity:quantity, type:"plan", level:pLevel, extra_build_level:pExtra, size:this.planSize};
                    if(pExtra > 0) {
                        content.innerHTML = ['<span class="tradeResourceName">',pName, ' ', pLevel, '+', pExtra,' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    }
                    else {
                        content.innerHTML = ['<span class="tradeResourceName">',pName, ' ', pLevel,' (<label class="quantity">',quantity,'</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    }

                    c.appendChild(item);
                    this.updatePushCargo(this.planSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.PlanSummary.quantity) {
                        newTotal = li.PlanSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updatePushCargo(this.planSize * diff);
                }
            }
        },

        PushAddShipSummary : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("tradePushItems");
            if(li && c) {
                var sName = li.ShipSummary.name,
                    sType = li.ShipSummary.type,
                    sSize = li.ShipSummary.hold_size,
                    sBerth = li.ShipSummary.berth_level,
                    sSpeed = li.ShipSummary.speed,
                    id = ['pushShipSummary-', sName, sType, sSize, sBerth, sSpeed].join('-').titleCaps(' ','_'),
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updatePushCargo(ep.Object.quantity * -this.shipSize);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item);
                    }, this, true);
                    item.Object = {quantity:quantity,
                                   type:"ship",
                                   name:sName,
                                   ship_type:sType,
                                   hold_size:sSize,
                                   berth_level:sBerth,
                                   speed:sSpeed,
                                   size:this.shipSize};
                    content.innerHTML = ['<span class="tradeResourceName">',sName, ' - ',
                                         sType.titleCaps('_',' '),
                                         ' - Hold:', sSize,
                                         ' - Berth:', sBerth,
                                         ' - Speed:', sSpeed,
                                         ' (<label class="quantity">',quantity,
                                         '</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');

                    c.appendChild(item);
                    this.updatePushCargo(this.shipSize * quantity);
                }
                else {
                    var found = exists[0],
                    newTotal = found.Object.quantity + quantity,
                    diff = quantity,
                    lq = Sel.query(".quantity", found, true),
                    inp = Sel.query("input", found, true);
                    if(newTotal > li.ShipSummary.quantity) {
                        newTotal = li.ShipSummary.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updatePushCargo(this.shipSize * diff);
                }
            }
        },
        PushAddPrisoner : function(e, matchedEl, container){
            var li = matchedEl.parentNode,
                c = Dom.get("tradePushItems");
            if(li && c) {
                var obj = li.Prisoner,
                    gId = obj.id,
                    id = "pushPrisoner-" + gId;
                if(Sel.query("#"+id, c).length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    Dom.addClass(item, "tradeItem");
                    Dom.addClass(del, "tradeDelete");
                    Event.on(del, "click", function(){ 
                        this.updatePushCargo(this.spySize*-1);
                        Event.purgeElement(item);
                        item.parentNode.removeChild(item); 
                    }, this, true);
                    item.Object = {prisoner_id:gId, type:"prisoner", size:this.spySize};
                    content.innerHTML = [obj.name, ' ', obj.level].join('');
                    c.appendChild(item);
                    this.updatePushCargo(this.spySize);
                }
            }
        },
        PushRemove : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode.parentNode;
            if(quantity) {
                var newTotal = li.Object.quantity - quantity,
                    diff = quantity*-1,
                    lq = Sel.query(".quantity", li, true);
                if(newTotal < 0) {
                    newTotal = 0;
                    diff = li.Object.quantity*-1;
                }
                
                if(newTotal == 0) {
                    this.updatePushCargo(li.Object.quantity * -1 * li.Object.size);
                    Event.purgeElement(li);
                    li.parentNode.removeChild(li);
                }
                else {
                    lq.innerHTML = newTotal;
                    li.Object.quantity = newTotal;
                    this.updatePushCargo(diff * li.Object.size);
                    var a = new Util.ColorAnim(lq, {color:{from:'#f00',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        Push : function() {
            var data = {
                    session_id: Game.GetSession(""),
                    building_id: this.building.id,
                    target_id: Lib.getSelectedOptionValue(Dom.get("tradePushColony")),
                    options: {
                        ship_id: Lib.getSelectedOptionValue(Dom.get("tradePushShip")),
                        stay: Dom.get("tradePushStay").checked ? 1 : 0
                    }
                },
                lis = Sel.query("li","tradePushItems"),
                items = [],
                hasResources, hasPlans, hasGlyphs, hasShips, hasPrisoners;
                
            for(var n=0; n<lis.length; n++) {
                if(lis[n].Object) {
                    items[n] = lis[n].Object;
                    switch(items[n].type) {
                        case "plan":
                            hasPlanes = true;
                            break;
                        case "glyph":
                            hasGlyphs = true;
                            break;
                        case "prisoner":
                            hasPrisoners = true;
                            break;
                        case "ship":
                            hasShips = true;
                            break;
                        default:
                            hasResources = true;
                            break;
                    }
                }
            }
            data.items = items;
            
            if(data.items.length == 0) {
                Dom.get("tradePushMessage").innerHTML = "Must add items to send to colony.";
            }
            else {
                Dom.get("tradePushMessage").innerHTML = "";
                require('js/actions/menu/loader').show();
                this.service.push_items(data, {
                    success : function(o){
                        this.rpcSuccess(o);
                        
                        for(var i=0; i<lis.length; i++) {
                            if(lis[i].Object) {
                                Event.purgeElement(lis[i]);
                                lis[i].parentNode.removeChild(lis[i]);
                            }
                        }

                        Dom.get("tradePushCargo").innerHTML = "0";
                        
                        if(hasResources) {
                            this.getStoredResources(true);
                        }
                        if(hasPlans) {
                            this.getPlanSummary(true);
                        }
                        if(hasGlyphs) {
                            this.getGlyphSummary(true);
                        }
                        if(hasPrisoners) {
                            this.getPrisoners(true);
                        }
                        if(hasShips) {
                            this.getShipSummary(true);
                        }
                    
                        var msg = Dom.get("tradePushMessage");
                        msg.innerHTML = ["Successfully pushed to ", Lib.getSelectedOption(Dom.get("tradePushColony")).innerHTML, '.'].join('');
                        Lib.fadeOutElm("tradePushMessage");
                        require('js/actions/menu/loader').hide();
                        //get new ships since we just sent one
                        this.getPushShips();
                    },
                    scope:this
                });
            }
        },
        addResourceOptions : function(selectElement, selected) {
            for(r in Lib.ResourceTypes) {
                if(Lib.ResourceTypes.hasOwnProperty(r)) {
                    resource = Lib.ResourceTypes[r];
                    if(Lang.isArray(resource)) {
                        var optGroup = document.createElement("optgroup");
                        optGroup.setAttribute("label", r.titleCaps());
                        
                        for(x=0; x < resource.length; x++) {
                            name = resource[x];
                            option = document.createElement("option");
                            option.setAttribute("value", name);
                            option.innerHTML = name.titleCaps();
                            
                            if ( selected && name == selected ) {
                                option.setAttribute("selected", "selected");
                            }
                            optGroup.appendChild(option);
                        }
                        selectElement.appendChild(optGroup);
                    }
                    else if(resource) {
                        option = document.createElement("option");
                        option.setAttribute("value", r);
                        option.innerHTML = r.titleCaps();
                        
                        if ( selected && r == selected ) {
                            option.setAttribute("selected", "selected");
                        }
                        
                        selectElement.appendChild(option);
                    }
                }
            }
        },
        resourceOptionsHTML : function(selected) {
            var resource_options = "";
    
            for(r in Lib.ResourceTypes) {
                if(Lib.ResourceTypes.hasOwnProperty(r)) {
                    resource = Lib.ResourceTypes[r];
                    if(Lang.isArray(resource)) {
                        resource_options += [
                            '<optgroup label="', r.titleCaps(), '">'
                        ].join('');
                        
                        for(x=0; x < resource.length; x++) {
                            name = resource[x];
                            resource_options += [
                                '<option value="', name, '"'
                            ].join('');
                            
                            if ( selected && name == selected ) {
                                resource_options += ' selected="selected"';
                            }
                            
                            resource_options += [
                            '>', name.titleCaps(), '</option>'
                        ].join('');
                        }
                        resource_options += '</optgroup>';
                    }
                    else if(resource) {
                        resource_options += [
                            '<option value="', r, '"'
                        ].join('');
                        
                        if ( selected && r == selected ) {
                            resource_options += ' selected="selected"';
                        }
                        
                        resource_options += [
                            '>', r.titleCaps(), '</option>'
                        ].join('');
                    }
                }
            }
            
            return resource_options;
        },
        viewSupplyChainInfo : function(e) {
            Dom.setStyle("supplyChainList", "display", "none");
            Dom.setStyle("supplyChainListNone", "display", "none");
            
            if ( !this.supply_chains ) {
                require('js/actions/menu/loader').show();
                this.service.view_supply_chains({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.viewSupplyChainList.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.max_supply_chains = o.result.max_supply_chains;
                        this.supply_chains = o.result.supply_chains;
                        
                        this.SupplyChainMaxCount();
                        this.SupplyChainList();
                    },
                    scope:this
                });
            }
            else {
                this.SupplyChainMaxCount();
                this.SupplyChainList();
            }
        },
        SupplyChainMaxCount : function() {
            var max_container = Dom.get("supplyChainMaxCount");
            
            max_container.innerHTML = [
                "<b>Total of",
                this.supply_chains.length,
                "supply chains in use. This ministry can control a maximum of",
                this.max_supply_chains,
                "supply chains.</b>"
            ].join( " ");
        },
        SupplyChainList : function() {
          var supply_chains = this.supply_chains;
          
          if ( supply_chains.length == 0 ) {
            Dom.setStyle("supplyChainList", "display", "none");
            Dom.setStyle("supplyChainListNone", "display", "");
            return;
          }
          else {
            Dom.setStyle("supplyChainList", "display", "");
            Dom.setStyle("supplyChainListNone", "display", "none");
          }
          
          var metric = Dom.get("supplyChainMetric"),
              details = Dom.get("supplyChainListDetails"),
              detailsParent = details.parentNode,
              ul = document.createElement("ul"),
              li = document.createElement("li"),
              supply_chains = this.supply_chains;
          
          // chains metric text
          metric.innerHTML =
            this.SupplyMetricDescription( supply_chains[0].percent_transferred );
          
          // chains list
          Event.purgeElement(details, true); //clear any events before we remove
          details = detailsParent.removeChild(details); //remove from DOM to make this faster
          details.innerHTML = "";
          
          //Dom.setStyle(detailsParent, "display", "");
          detailsParent.appendChild(details); //add back as child
          
          for (var i=0; i<supply_chains.length; i++) {
            var chain = supply_chains[i],
                nUl = ul.cloneNode(false);
            
            Dom.addClass(nUl, "supplyChainInfo");
            Dom.addClass(nUl, "clearafter");
            
            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "supplyChainBody");
            if (chain.stalled == 1) {
                Dom.addClass(nUl, "supplyChainStalled");
                nLi.innerHTML = chain.body.name + " (Stalled)";
            }
            else {
                nLi.innerHTML = chain.body.name;
            }
            nUl.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "supplyChainResource");
            nSel = document.createElement("select");
            this.addResourceOptions(nSel, chain.resource_type);
            nLi.appendChild(nSel);
            nUl.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "supplyChainHour");
            nText = document.createElement("input");
            nText.type = "text";
            nText.size = 10;
            nText.value = chain.resource_hour;
            nLi.appendChild(nText);
            nUl.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"supplyChainAction");
            var editBtn = document.createElement("button");
            editBtn.setAttribute("type", "button");
            editBtn.innerHTML = "Update Chain";
            nLi.appendChild(editBtn);
            var delBtn = document.createElement("button");
            delBtn.setAttribute("type", "button");
            delBtn.innerHTML = "Delete Chain";
            nLi.appendChild(delBtn);
            nUl.appendChild(nLi);
            
            Event.on(editBtn, "click", this.SupplyChainUpdate, {Self:this,Chain:chain,Type:nSel,Hour:nText,Line:nUl}, true);
            Event.on(delBtn, "click", this.SupplyChainRemove, {Self:this,Chain:chain,Line:nUl}, true);
            
            details.appendChild(nUl);
          }
          
          //wait for tab to display first
          setTimeout(function() {
            var Ht = Game.GetSize().h - 250;
            if(Ht > 250) { Ht = 250; }
            Dom.setStyle(detailsParent,"height",Ht + "px");
            Dom.setStyle(detailsParent,"overflow-y","auto");
          },10);
        },
        SupplyMetricDescription : function(percent_transferred) {
            var output = ['Current supply capacity is ', percent_transferred, '&#37;. '];
            if(percent_transferred == 0) {
                output.push('You have no ships servicing your supply chains.');
            }
            else if(percent_transferred > 100) {
                output.push('You have excess ships servicing your supply chains. You can increase your chain hourly rate, or you may be able to remove some ships to get closer to 100&#37;.');
            }
            else if(percent_transferred < 100) {
                output.push('You have insufficient ships servicing your supply chains. You should reduce your chain hourly rate or add more supply ships.');
            }
            else if(percent_transferred == 100) {
                output.push('Your shipping capacity and supply chains requirements are exactly in sync.');
            }
            return output.join('');
        },
        SupplyChainAddNew : function() {
            var target_id = Lib.getSelectedOptionValue("supplyChainAddTargetId"),
                resource_type = Lib.getSelectedOptionValue("supplyChainAddResourceType"),
                resource_hour = Dom.get("supplyChainAddResourceHour").value;
            
            require('js/actions/menu/loader').show();
            this.Self.service.create_supply_chain({
                session_id: Game.GetSession(),
                building_id: this.Self.building.id,
                target_id: target_id,
                resource_type: resource_type,
                resource_hour: resource_hour
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.SupplyChainAddNew.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    
                    delete this.Self.supply_chains;
                    this.Self.viewSupplyChainInfo();
                },
                scope:this
            });
        },
        SupplyChainUpdate : function() {
            require('js/actions/menu/loader').show();
            this.Self.service.update_supply_chain({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                supply_chain_id:this.Chain.id,
                resource_type: Lib.getSelectedOptionValueFromSelectElement(this.Type),
                resource_hour:this.Hour.value
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.SupplyChainUpdate.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    
                    delete this.Self.supply_chains;
                    this.Self.viewSupplyChainInfo();
                },
                scope:this
            });
        },
        SupplyChainRemove : function() {
            var chain = this.Chain;
            
            if (!confirm(['Are you sure you want to delete the supply chain of', chain.resource_hour, chain.resource_type.titleCaps(), 'to', chain.body.name].join(' ')))
                return;
            
            require('js/actions/menu/loader').show();
            this.Self.service.delete_supply_chain({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                supply_chain_id:this.Chain.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.SupplyChainRemove.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    
                    delete this.Self.supply_chains;
                    this.Self.viewSupplyChainInfo();
                },
                scope:this
            });
        },
        viewSupplyShips : function(e) {
            // we have 2 asynchronous functions below both wanting to hide
            // the pulser - keep a count of requests so it only gets hidden
            // once they've both completed
            var request_count = 0;
            
            if ( !this.supply_chains ) {
                require('js/actions/menu/loader').show();
                request_count++;
                
                this.service.view_supply_chains({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.viewSupplyChainList.success");
                        request_count--;
                        if ( request_count == 0 ) {
                            require('js/actions/menu/loader').hide();
                        }
                        this.rpcSuccess(o);
                        this.supply_chains = o.result.supply_chains;
                        
                        this.SupplyChainShipsInfo();
                    },
                    scope:this
                });
            }
            else {
                this.SupplyChainShipsInfo();
            }
            
            if ( !this.supply_chain_ships ) {
                require('js/actions/menu/loader').show();
                request_count++;
                
                this.service.get_supply_ships({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Trade.viewSupplyShipsInfo.success");
                        request_count--;
                        if ( request_count == 0 ) {
                            require('js/actions/menu/loader').hide();
                        }
                        this.rpcSuccess(o);
                        this.supply_chain_ships = o.result.ships;
                        
                        this.SupplyChainShipsPopulate();
                    },
                    scope:this
                });
            }
            else {
                this.SupplyChainShipsPopulate();
            }
        },
        SupplyChainShipsInfo : function() {
            var metric = Dom.get("supplyChainShipsInfo");
            
            metric.innerHTML =
                this.SupplyMetricDescription( this.supply_chains[0].percent_transferred );
        },
        SupplyChainShipsPopulate : function() {
            var ships = this.supply_chain_ships,
                no_ships = Dom.get("supplyChainShipsNone"),
                details = Dom.get("supplyChainShipsDetails"),
                detailsParent = details.parentNode;
            
            if ( ships.length == 0 ) {
                Dom.setStyle(details, "display", "none");
                Dom.setStyle(no_ships, "display", "");
                return;
            }
            else {
                Dom.setStyle(details, "display", "");
                Dom.setStyle(no_ships, "display", "none");
            }
            
            Event.purgeElement(details, true); //clear any events before we remove
            details = detailsParent.removeChild(details); //remove from DOM to make this faster
            details.innerHTML = "";
            
            Dom.setStyle(detailsParent, "display", "");
            detailsParent.appendChild(details); //add back as child
            
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
                    nLi.innerHTML = Lib.formatNumber(ship.hold_size);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = ship.task == "Docked" ? "Add to Chain" : "Remove from Chain";
                    bbtn = nLi.appendChild(bbtn);
                    nUl.appendChild(nLi);
                    
                    if(ship.task == "Docked") {
                        Event.on(bbtn, "click", this.SupplyChainShipAdd, {Self:this,Ship:ship,Line:nUl}, true);
                    }
                    else {
                        Event.on(bbtn, "click", this.SupplyChainShipRemove, {Self:this,Ship:ship,Line:nUl}, true);
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
        SupplyChainShipAdd : function() {
            require('js/actions/menu/loader').show();
            
            this.Self.service.add_supply_ship_to_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.SupplyChainShipAdd.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    var ships = this.Self.supply_chain_ships;
                    for(var i=0; i<ships.length; i++) {
                        if(ships[i].id == this.Ship.id) {
                            ships.splice(i,1);
                            break;
                        }
                    }
                    
                    delete this.Self.supply_chains;
                    this.Self.viewSupplyShips();
                },
                scope:this
            });
        },
        SupplyChainShipRemove : function() {
            require('js/actions/menu/loader').show();
            
            this.Self.service.remove_supply_ship_from_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.SupplyChainShipRemove.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    var ships = this.Self.supply_chain_ships;
                    for(var i=0; i<ships.length; i++) {
                        if(ships[i].id == this.Ship.id) {
                            ships.splice(i,1);
                            break;
                        }
                    }
                    
                    delete this.Self.supply_chains;
                    this.Self.viewSupplyShips();
                },
                scope:this
            });
        },
        viewWasteChainInfo : function(e) {
            if(e.newValue) {
                this.WasteChainDetails();
                
                if(!this.waste_chain_ships) {
                    this.WasteChainShipsView();
                }
                else {
                    this.WasteChainShipsPopulate();
                }
            }
        },
        WasteChainDetails : function() {
            require('js/actions/menu/loader').show();
            this.service.view_waste_chains({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.WasteChainDetails.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.waste_chain = o.result.waste_chain[0];
                    
                    this.WasteChainDetailsPopulate();
                },
                scope:this
            });
        },
        WasteChainDetailsPopulate : function() {
            var waste_chain = this.waste_chain,
                details = Dom.get("wasteChainDetails");
            
            if (details) {
                var show_equalize_button;
                
                if ( Game.GetCurrentPlanet().waste_hour != 0
                    && this.waste_chain.percent_transferred >= 100 )
                {
                    show_equalize_button = 1;
                }
                
                details.innerHTML = [
                    '<b>Local Star Waste Chain</b><br/>',
                    'Waste/hr: ',
                    '<input id="chainWasteHourInput" type="text" value="', waste_chain.waste_hour, '"/> ',
                    '<button id="chainWasteHourButton">Update</button>',
                    show_equalize_button
                      ? '<button id="chainWasteEqualizeButton">Equalize Body Waste Production</button><br/>'
                      : '<br/>',
                    'Percent Transferred: ', waste_chain.percent_transferred, '&#37;',
                    '<hr>'
                ].join('');
                
                Event.on("chainWasteHourButton", "click", this.WasteChainUpdateWasteHour, {Self:this}, true);
                Event.on("chainWasteEqualizeButton", "click", this.WasteChainEqualize, {Self:this}, true);
            }
        },
        WasteChainUpdateWasteHour : function() {
            var waste_chain_id = this.Self.waste_chain.id,
                waste_hour = Dom.get("chainWasteHourInput").value;
            
            require('js/actions/menu/loader').show();
            this.Self.service.update_waste_chain({
                session_id: Game.GetSession(),
                building_id: this.Self.building.id,
                waste_chain_id: waste_chain_id,
                waste_hour: waste_hour
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.WasteChainUpdateWasteHour.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    
                    this.Self.WasteChainDetails();
                },
                scope:this
            });
        },
        WasteChainEqualize : function() {
            var waste_hour = 1*this.Self.waste_chain.waste_hour,
                body_waste_hour = Game.GetCurrentPlanet().waste_hour;
            
            waste_hour = parseInt(waste_hour) + parseInt(body_waste_hour);

            if ( waste_hour <= 0 )
                waste_hour = 0;

            Dom.get("chainWasteHourInput").value = waste_hour;
        },
        WasteChainShipsView : function() {
            require('js/actions/menu/loader').show();
            this.service.get_waste_ships({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.WasteChainShipsView.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.waste_chain_ships = o.result.ships;
                    
                    this.WasteChainShipsPopulate();
                },
                scope:this
            });
        },
        WasteChainShipsPopulate : function() {
            var ships = this.waste_chain_ships,
                no_ships = Dom.get("wasteChainShipsNone"),
                details = Dom.get("wasteChainShipsDetails");
            
            if ( ships.length == 0 ) {
                Dom.setStyle(details, "display", "none");
                Dom.setStyle(no_ships, "display", "");
                return;
            }
            else {
                Dom.setStyle(details, "display", "");
                Dom.setStyle(no_ships, "display", "none");
            }
            
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
                    nLi.innerHTML = Lib.formatNumber(ship.hold_size);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = ship.task == "Docked" ? "Add to Chain" : "Remove from Chain";
                    bbtn = nLi.appendChild(bbtn);
                    nUl.appendChild(nLi);
                    
                    if(ship.task == "Docked") {
                        Event.on(bbtn, "click", this.WasteChainShipAdd, {Self:this,Ship:ship,Line:nUl}, true);
                    }
                    else {
                        Event.on(bbtn, "click", this.WasteChainShipRemove, {Self:this,Ship:ship,Line:nUl}, true);
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
        WasteChainShipAdd : function() {
            require('js/actions/menu/loader').show();
            
            this.Self.service.add_waste_ship_to_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.WasteChainShipAdd.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    var ships = this.Self.waste_chain_ships;
                    for(var i=0; i<ships.length; i++) {
                        if(ships[i].id == this.Ship.id) {
                            ships.splice(i,1);
                            break;
                        }
                    }
                    this.Line.parentNode.removeChild(this.Line);
                    
                    this.Self.WasteChainDetails();
                },
                scope:this
            });
        },
        WasteChainShipRemove : function() {
            require('js/actions/menu/loader').show();
            
            this.Self.service.remove_waste_ship_from_fleet({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                ship_id:this.Ship.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Trade.WasteChainShipRemove.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    var ships = this.Self.waste_chain_ships;
                    for(var i=0; i<ships.length; i++) {
                        if(ships[i].id == this.Ship.id) {
                            ships.splice(i,1);
                            break;
                        }
                    }
                    this.Line.parentNode.removeChild(this.Line);
                    
                    this.Self.WasteChainDetails();
                },
                scope:this
            });
        }
    
    });
    
    Lacuna.buildings.Trade = Trade;

})();
YAHOO.register("trade", YAHOO.lacuna.buildings.Trade, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
