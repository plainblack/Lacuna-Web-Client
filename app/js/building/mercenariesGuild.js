YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.MercenariesGuild == "undefined" || !YAHOO.lacuna.buildings.MercenariesGuild) {
    
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

    var MercenariesGuild = function(result){
        MercenariesGuild.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.MercenariesGuild;
        
        this.availableAcceptText = "Accept";
        var cost =  Math.round( (3-(this.building.level * 0.1)) * 10 ) / 10;
        this.addMercenariesGuildText = ['Add for ',cost,'<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" style="vertical-align:middle;" />'].join('');
        
        //defaults.  Values are updated to server numbers during get_* calls
        this.spySize = 350;
        this.createEvent("onLoadSpies");
        
        if(this.building.level > 0) {
            this.subscribe("onLoad", function() {
                this.getSpies();
                this.mine.subscribe("activeChange", this.getMine, this, true);
                this.avail.subscribe("activeChange", this.getAvailable, this, true);
                this.add.subscribe("activeChange", this.getAddShips, this, true);
            }, this, true);
        }
    };

    Lang.extend(MercenariesGuild, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.availablePager) {
                this.availablePager.destroy();
            }
            if(this.minePage) {
                this.minePage.destroy();
            }
            MercenariesGuild.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            this.mineTabIndex = 2; //array location plus 1 since Production tab is always first
            return [this._getAvailTab(), this._getMineTab(), this._getAddTab()];
        },
        _getAvailTab : function() {
            this.avail = new YAHOO.widget.Tab({ label: "Available Mercs", content: [
                '<div>',
                '    <ul class="tradeHeader tradeInfo clearafter">',
                '        <li class="tradeEmpire">Empire</li>',
                '        <li class="tradeOfferedDate">Offered Date</li>',
                '        <li class="tradeAsking">Cost</li>',
                '        <li class="tradeOffer">Offering</li>',
                '        <li class="tradeAction"></li>',
                '        <li class="tradeAction"></li>',
                '    </ul>',
                '    <div><div id="tradeAvailableDetails"></div></div>',
                '    <div id="tradeAvailablePaginator"></div>',
                '</div>'].join('')});
            
            return this.avail;
        },
        _getMineTab : function() {
            this.mine = new YAHOO.widget.Tab({ label: "My Mercs", content: ['<div class="myMercenariesGuilds">',
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
        _getAddTab : function() {
            this.add = new YAHOO.widget.Tab({ label: "Add Merc", content: [
            '<div id="aHt">',
            '<ul style="margin-top:5px;">',
            '    <li><label>Spy:</label><select id="tradeAddSpyName"></select></li>',
            '    <li style="margin: 5px 0;"><label>Asking Essentia:</label><input type="text" id="tradeAddAskingQuantity" /></li>',
            '    <li style="margin-bottom:5px;"><label>With Ship:</label><select id="tradeAddShip"></select></li>',
            '    <li id="tradeAddMessage" class="alert"></li>',
            '</ul></div><button id="tradeAdd" type="button">',this.addMercenariesGuildText,'</button>'].join('')});
            
            this.subscribe("onLoadSpies", this.populateAddSpyName, this, true);
            
            Event.on("tradeAdd", "click", this.AddMerc, this, true);
            return this.add;
        },
        
        getSpies : function(force) {
            if(force || !this.spies) {
                require('js/actions/menu/loader').show();
                this.service.get_spies({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.spies = o.result.spies;
                        this.spySize = o.result.cargo_space_used_each || this.spySize;
                        this.fireEvent("onLoadSpies");
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },

        //View Available
        getAvailable : function(e) {
            if(e.newValue && !this.availableMercs) {
                require('js/actions/menu/loader').show();
                var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:1};

                this.service.view_market(data, {
                    success : function(o){
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        delete o.result.status; //get rid of status after we process it, since it's big
                        this.availableMercs = o.result; //store: trades=[], trade_count = 1, page_number=1,  captcha = {guid, url}
                        
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
                var trades = this.availableMercs.trades,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                                
                for(var i=0; i<trades.length; i++) {
                    var trade = trades[i],
                        bbtn,
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.MercenariesGuild = trade;
                    Dom.addClass(nUl, "tradeInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeEmpire");
                    nLi.innerHTML = trade.empire.name;
                    Event.on(nLi, "click", this.EmpireProfile, trade.empire);
                    nUl.appendChild(nLi);

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
                    bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = this.availableAcceptText;
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.AvailableAccept, {Self:this,MercenariesGuild:trade,Line:nUl}, true);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"tradeAction");
                    bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    Dom.addClass(bbtn, "reportAbuse");
                    bbtn.innerHTML = "Spam";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.AvailableReport, {Self:this,MercenariesGuild:trade,Line:nUl}, true);
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
            var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:newState.page};

            this.service.view_market(data, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    delete o.result.status; //get rid of status after we process it, since it's big
                    this.availableMercs = o.result; //store: trades=[], trade_count = 1, page_number=1,  captcha = {guid, url}
                    
                    this.AvailablePopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.availablePager.setState(newState);
        },
        AvailableAccept : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            this.Self.service.accept_from_market({
                session_id:Game.GetSession(""),
                building_id:this.Self.building.id,
                trade_id:this.MercenariesGuild.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "MercenariesGuild.accept_trade.success");
                    this.Self.rpcSuccess(o);
                    //force get the new availabe list after accepting so we get a new captcha
                    delete this.Self.availableMercs;
                    this.Self.getAvailable({newValue:true});
                    require('js/actions/menu/loader').hide();
                },
                failure : function() {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        AvailableReport : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            this.Self.service.report_abuse({
                session_id:Game.GetSession(""),
                building_id:this.Self.building.id,
                trade_id:this.MercenariesGuild.id
            }, {
                success : function(o){
                    Event.purgeElement(btn);
                    btn.parentNode.removeChild(btn);

                    this.Self.rpcSuccess(o);
                    require('js/actions/menu/loader').hide();
                },
                failure : function() {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        EmpireProfile : function(e, empire) {
            Lacuna.Info.Empire.Load(empire.id);
        },
        
        //View Mine
        getMine : function(e) {
            if(e.newValue && !this.mineMercs) {
                require('js/actions/menu/loader').show();
                this.service.view_my_market({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                    success : function(o){
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        delete o.result.status; //get rid of status after we process it, since it's big
                        this.mineMercs = o.result; //store: trades=[], trade_count = 1, page_number=1
                        
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
                var trades = this.mineMercs.trades,
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
                    var Ht = Game.GetSize().h - 240;
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
                    YAHOO.log(o, "info", "MercenariesGuild.view_available_trades.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    delete o.result.status; //get rid of status after we process it, since it's big
                    this.mineMercs = o.result; //store: trades=[], trade_count = 1, page_number=1
                    
                    this.MinePopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.minePage.setState(newState);
        },
        MineWithdraw : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            if(confirm(['Are you sure you want to withdraw the trade asking for ', this.Trade.ask, ' essentia and offering ', this.Trade.offer,'?'].join(''))) {
                require('js/actions/menu/loader').show();
                this.Self.service.withdraw_from_market({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    trade_id:this.Trade.id
                }, {
                    success : function(o){
                        this.Self.rpcSuccess(o);
                        //splice out removed trade
                        var trades = this.Self.mineMercs.trades;
                        for(var i=0; i<trades.length; i++) {
                            if(trades[i].id == this.Trade.id) {
                                trades.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        
                        require('js/actions/menu/loader').hide();
                        //delete ships since we'll get one back on withdraw
                        delete this.Self.tradeShips;
                        this.Self.getSpies(true);
                    },
                    failure : function() {
                        btn.disabled = false;
                    },
                    scope:this
                });
            }
            else {
                btn.disabled = false;
            }
        },
        
        //Add trade
        populateAddSpyName : function() {
            var elm = Dom.get("tradeAddSpyName"),
                opt = document.createElement("option"), nOpt;
                
            if(elm) {
                elm.options.length = 0;    
                for(var x=0; x < this.spies.length; x++) {
                    var obj = this.spies[x];
                    nOpt = opt.cloneNode(false);
                    nOpt.value = obj.id;
                    nOpt.innerHTML = [obj.name, ' - ', obj.level].join('');
                    elm.appendChild(nOpt);
                }
            }
        },
        getAddShips : function(e) {
            if(e.newValue && !this.tradeShips) {
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
                            this.tradeShips = ships;
                            
                            var selectedVal = Lib.getSelectedOptionValue(elm);
                            elm.options.length = 0;    
                            for(var x=0; x < ships.length; x++) {
                                var obj = ships[x];
                                nOpt = opt.cloneNode(false);
                                nOpt.value = obj.id;
                                nOpt.innerHTML = [obj.name, ' (', obj.type_human, ' - Hold:', obj.hold_size, ' - Speed:', obj.speed, ')'].join('');
                                nOpt.selected = selectedVal == obj.id;
                                elm.appendChild(nOpt);
                            }
                        }
                        
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        updateAddCargo : function(byVal) {
            var c = Dom.get("tradeAddCargo"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        AddMerc : function(e) {
            var qVal = Dom.get("tradeAddAskingQuantity").value*1;
            if(!Lang.isNumber(qVal) || qVal <= 0) {
                Dom.get("tradeAddMessage").innerHTML = "Quantity of asking essentia must be a number and greater than 0";
                return;
            }
            else {
                Dom.get("tradeAddMessage").innerHTML = "";
            }
            
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            var data = {
                session_id:Game.GetSession(""),
                building_id:this.building.id,
                spy_id: Lib.getSelectedOptionValue("tradeAddSpyName"),
                ask: qVal,
                ship_id: Lib.getSelectedOptionValue("tradeAddShip")
            };
            
            require('js/actions/menu/loader').show();
            this.service.add_to_market(data, {
                success : function(o){
                    this.rpcSuccess(o);
                    delete this.tradeShips;
                    this.getSpies(true);
                    Dom.get("tradeAddAskingQuantity").value = "";
                    delete this.mineMercs;
                    this.fireEvent("onSelectTab", this.mineTabIndex);
                    btn.disabled = false;
                    require('js/actions/menu/loader').hide();
                },
                failure : function() {
                    btn.disabled = false;
                },
                scope:this
            });
        }

    });
    
    Lacuna.buildings.MercenariesGuild = MercenariesGuild;

})();
YAHOO.register("trade", YAHOO.lacuna.buildings.MercenariesGuild, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
