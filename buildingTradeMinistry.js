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
		
		//defaults.  Values are updated to server numbers during get_* calls
		this.shipSize = 50000;
		this.planSize = 10000;
		this.spySize = 350;
		this.glyphSize = 100;
		
		this.createEvent("onLoadResources");
		this.createEvent("onLoadGlyphs");
        this.createEvent("onLoadGlyphSummary");
		this.createEvent("onLoadPlans");
		this.createEvent("onLoadShips");
		this.createEvent("onLoadPrisoners");
		
		if(this.building.level > 0) {
			this.subscribe("onLoad", function() {
				this.getStoredResources();
				this.mine.subscribe("activeChange", this.getMine, this, true);
				this.avail.subscribe("activeChange", this.getAvailable, this, true);
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

							Event.on("tradePushGlyphs", "click", function(){
								if(Dom.getStyle("tradePushGlyphName", "display") == "none") {
									Dom.setStyle("tradePushGlyphName", "display", "block");
									this.getGlyphs();
								}
								else {
									Dom.setStyle("tradePushGlyphName", "display", "none");
								}
							}, this, true);
							Event.on("tradePushPlans", "click", function(){
								if(Dom.getStyle("tradePushPlanName", "display") == "none") {
									Dom.setStyle("tradePushPlanName", "display", "block");
									this.getPlans();
								}
								else {
									Dom.setStyle("tradePushPlanName", "display", "none");
								}
							}, this, true);
							Event.on("tradePushShips", "click", function(){
								if(Dom.getStyle("tradePushShipName", "display") == "none") {
									Dom.setStyle("tradePushShipName", "display", "block");
									this.getShips();
								}
								else {
									Dom.setStyle("tradePushShipName", "display", "none");
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

							Event.on("tradeAddGlyphs", "click", function(){
								if(Dom.getStyle("tradeAddGlyphName", "display") == "none") {
									Dom.setStyle("tradeAddGlyphName", "display", "block");
									this.getGlyphs();
								}
								else {
									Dom.setStyle("tradeAddGlyphName", "display", "none");
								}
							}, this, true);
							Event.on("tradeAddPlans", "click", function(){
								if(Dom.getStyle("tradeAddPlanName", "display") == "none") {
									Dom.setStyle("tradeAddPlanName", "display", "block");
									this.getPlans();
								}
								else {
									Dom.setStyle("tradeAddPlanName", "display", "none");
								}
							}, this, true);
							Event.on("tradeAddShips", "click", function(){
								if(Dom.getStyle("tradeAddShipName", "display") == "none") {
									Dom.setStyle("tradeAddShipName", "display", "block");
									this.getShips();
								}
								else {
									Dom.setStyle("tradeAddShipName", "display", "none");
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
			return [this._getPushTab(), this._getAvailTab(), this._getMineTab(), this._getAddTab()];
		},
		_getPushTab : function() {
			this.push = new YAHOO.widget.Tab({ label: "Push", content: [
			'<div id="pHt"><div class="tradeStash yui-g">',
			'	<div class="yui-u first">',
			'		<legend>On Planet</legend>',
			'		<div class="tradeContainers">',
			'			<div><div id="tradePushResources" class="accordian">Resources</div><ul id="tradePushResourceName"></ul></div>',
			'			<div><div id="tradePushGlyphs" class="accordian">Glyphs</div><ul id="tradePushGlyphName" style="display:none;"></ul></div>',
            '           <div><div id="tradePushGlyphSummary" class="accordian">Glyph Summary</div><ul id="tradePushGlyphSummoryName" style="display:none;"></ul></div>',
			'			<div><div id="tradePushPlans" class="accordian">Plans</div><ul id="tradePushPlanName" style="display:none;"></ul></div>',
			'			<div><div id="tradePushShips" class="accordian">Ships</div><ul id="tradePushShipName" style="display:none;"></ul></div>',
			'			<div><div id="tradePushPrisoners" class="accordian">Prisoners</div><ul id="tradePushPrisonerName" style="display:none;"></ul></div>',
			'		</div>',
			'	</div>',
			'	<div class="yui-u">',
			'		<legend>To Push</legend>',
			'		<div class="tradeContainers"><ul id="tradePushItems"></ul></div>',
			'	</div>',
			'</div>',
			'<ul style="margin-top:5px;">',
			'	<li style=""><label>Total Cargo:</label><span id="tradePushCargo">0</span></li>',
			'	<li style="margin-bottom:5px;"><label>To Colony:</label><select id="tradePushColony"><option value="" selected>&nbsp;</option></select></li>',
			'	<li style="margin-bottom:5px;"><label>With Ship:</label><select id="tradePushShip"></select></li>',
			'	<li style="margin-bottom:5px;"><label>Stay at Colony:</label><input type="checkbox" id="tradePushStay" /></li>',
			'	<li id="tradePushMessage" class="alert"></li>',
			'</ul></div><button id="tradePushSend">',this.pushTradeText,'</button>'].join('')});

			this.subscribe("onLoadResources", this.populatePushResourceName, this, true);
			this.subscribe("onLoadGlyphs", this.populatePushGlyphName, this, true);
            this.subscribe("onLoadGlyphSummary", this.populatePushGlyphSummaryName, this, true);
			this.subscribe("onLoadPlans", this.populatePushPlanName, this, true);
			this.subscribe("onLoadShips", this.populatePushShipName, this, true);
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
			Event.delegate("tradePushGlyphName", "click", this.PushAddGlyph, "button", this, true);
			Event.delegate("tradePushPlanName", "click", this.PushAddPlan, "button", this, true);
			Event.delegate("tradePushShipName", "click", this.PushAddShip, "button", this, true);
			Event.delegate("tradePushPrisonerName", "click", this.PushAddPrisoner, "button", this, true);
			
			Event.delegate("tradePushItems", "click", this.PushRemove, "button", this, true);
			
			Event.on("tradePushSend", "click", this.Push, this, true);
			
			return this.push;
		},
		_getAvailTab : function() {
			this.avail = new YAHOO.widget.Tab({ label: "Available Trades", content: [
				'<div>',
				'	<div style="border-bottom: 1px solid #52ACFF; padding-bottom: 5px; margin-bottom: 5px;"><label>Filter:</label><select id="tradeFilter"><option value="">All</option><option value="energy">Energy</option><option value="food">Food</option><option value="ore">Ore</option>',
				'	<option value="water">Water</option><option value="waste">Waste</option><option value="glyph">Glyph</option><option value="prisoner">Prisoner</option>',
				'	<option value="ship">Ship</option><option value="plan">Plan</option></select></div>',
				'	<ul class="tradeHeader tradeInfo clearafter">',
				'		<li class="tradeEmpire">Empire</li>',
				'		<li class="tradeOfferedDate">Offered Date</li>',
				'		<li class="tradeAsking">Cost</li>',
				'		<li class="tradeOffer">Offering</li>',
				'		<li class="tradeAction"></li>',
				'		<li class="tradeAction"></li>',
				'	</ul>',
				'	<div><div id="tradeAvailableDetails"></div></div>',
				'	<div id="tradeAvailablePaginator"></div>',
				'</div>'].join('')});
				
			Event.on("tradeFilter", "change", function(e) { this.getAvailable({newValue:true}); }, this, true);
			
			return this.avail;
		},
		_getMineTab : function() {
			this.mine = new YAHOO.widget.Tab({ label: "My Trades", content: ['<div class="myTrades">',
				'	<ul class="tradeHeader tradeInfo clearafter">',
				'		<li class="tradeOfferedDate">Offered Date</li>',
				'		<li class="tradeAsking">Cost</li>',
				'		<li class="tradeOffer">Offering</li>',
				'		<li class="tradeAction"></li>',
				'	</ul>',
				'	<div><div id="tradeMineDetails"></div></div>',
				'	<div id="tradeMinePaginator"></div>',
				'</div>'].join('')});
			
			return this.mine;
		},
		_getAddTab : function() {
			this.add = new YAHOO.widget.Tab({ label: "Add Trade", content: [
			'<div id="aHt"><div class="tradeStash yui-g">',
			'	<div class="yui-u first">',
			'		<legend>On Planet</legend>',
			'		<div class="tradeContainers">',
			'			<div><div id="tradeAddResources" class="accordian">Resources</div><ul id="tradeAddResourceName"></ul></div>',
			'			<div><div id="tradeAddGlyphs" class="accordian">Glyphs</div><ul id="tradeAddGlyphName" style="display:none;"></ul></div>',
            '           <div><div id="tradeAddGlyphSummary" class="accordian">Glyph Summary</div><ul id="tradeAddGlyphSummaryName" style="display:none;"></ul></div>',
			'			<div><div id="tradeAddPlans" class="accordian">Plans</div><ul id="tradeAddPlanName" style="display:none;"></ul></div>',
			'			<div><div id="tradeAddShips" class="accordian">Ships</div><ul id="tradeAddShipName" style="display:none;"></ul></div>',
			'			<div><div id="tradeAddPrisoners" class="accordian">Prisoners</div><ul id="tradeAddPrisonerName" style="display:none;"></ul></div>',
			'		</div>',
			'	</div>',
			'	<div class="yui-u">',
			'		<legend>To Offer</legend>',
			'		<div class="tradeContainers"><ul id="tradeAddItems"></ul></div>',
			'	</div>',
			'</div>',
			'<ul style="margin-top:5px;">',
			'	<li style=""><label>Total Cargo:</label><span id="tradeAddCargo">0</span></li>',
			'	<li style="margin: 5px 0;"><label style="font-weight:bold">Asking Essentia:</label><input type="text" id="tradeAddAskingQuantity" /></li>',
			'	<li style="margin-bottom:5px;"><label>With Ship:</label><select id="tradeAddShip"></select></li>',
			'	<li id="tradeAddMessage" class="alert"></li>',
			'</ul></div><button id="tradeAdd">',this.addTradeText,'</button>'].join('')});
			
			this.subscribe("onLoadResources", this.populateAddResourceName, this, true);
			this.subscribe("onLoadGlyphs", this.populateAddGlyphName, this, true);
            this.subscribe("onLoadGlyphSummary", this.populateAddGlyphSummaryName, this, true);
			this.subscribe("onLoadPlans", this.populateAddPlanName, this, true);
			this.subscribe("onLoadPrisoners", this.populateAddPrisonerName, this, true);
			this.subscribe("onLoadShips", this.populateAddShipName, this, true);
			
			Event.delegate("tradeAddResourceName", "click", this.AddResource, "button", this, true);
			Event.delegate("tradeAddGlyphName", "click", this.AddGlyph, "button", this, true);
            Event.delegate("tradeAddGlyphSummaryName", "click", this.AddGlyphSummary, "button", this, true);

			Event.delegate("tradeAddPlanName", "click", this.AddPlan, "button", this, true);
			Event.delegate("tradeAddShipName", "click", this.AddShip, "button", this, true);
			Event.delegate("tradeAddPrisonerName", "click", this.AddPrisoner, "button", this, true);
			
			Event.delegate("tradeAddItems", "click", this.AddRemove, "button", this, true);
			
			Event.on("tradeAdd", "click", this.AddTrade, this, true);
			return this.add;
		},
		
        getGlyphSummary : function(force) {
            if(force || !this.glyph_summary) {
                Lacuna.Pulser.Show();
                this.service.get_glyph_summary({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.glyph_summary = o.result.glyphs;
                        this.glyphSize = o.result.cargo_space_used_each;
                        this.fireEvent("onLoadGlyphSummary");
                        Lacuna.Pulser.Hide();
                    },
                    scope:this
                });
            }
        },

		getGlyphs : function(force) {
			if(force || !this.glyphs) {
				Lacuna.Pulser.Show();
				this.service.get_glyphs({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						this.rpcSuccess(o);
						this.glyphs = o.result.glyphs;
						this.glyphSize = o.result.cargo_space_used_each;
						this.fireEvent("onLoadGlyphs");
						Lacuna.Pulser.Hide();
					},
					scope:this
				});
			}
		},
		getPlans : function(force) {
			if(force || !this.plans) {
				Lacuna.Pulser.Show();
				this.service.get_plans({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						this.rpcSuccess(o);
						this.plans = o.result.plans;
						this.planSize = o.result.cargo_space_used_each;
						this.fireEvent("onLoadPlans");
						Lacuna.Pulser.Hide();
					},
					scope:this
				});
			}
		},
		getPrisoners : function(force) {
			if(force || !this.prisoners) {
				Lacuna.Pulser.Show();
				this.service.get_prisoners({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						this.rpcSuccess(o);
						this.prisoners = o.result.prisoners;
						this.spySize = o.result.cargo_space_used_each;
						this.fireEvent("onLoadPrisoners");
						Lacuna.Pulser.Hide();
					},
					scope:this
				});
			}
		},
		getShips : function(force) {
			if(force || !this.ships) {
				Lacuna.Pulser.Show();
				this.service.get_ships({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						this.rpcSuccess(o);
						this.ships = o.result.ships;
						this.shipSize = o.result.cargo_space_used_each;
						this.fireEvent("onLoadShips");
						Lacuna.Pulser.Hide();
					},
					scope:this
				});
			}
		},
		getStoredResources : function(force) {
			if(force || !this.resources) {
				Lacuna.Pulser.Show();
				this.service.get_stored_resources({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						this.rpcSuccess(o);
						this.resources = o.result.resources;
						this.fireEvent("onLoadResources");
						Lacuna.Pulser.Hide();
					},
					scope:this
				});
			}
		},
		
		//View Available
		getAvailable : function(e) {
			if(e.newValue) {
				Lacuna.Pulser.Show();
				var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:1},
					selVal = Lib.getSelectedOptionValue("tradeFilter");
				if(selVal) {
					data.filter = selVal;
				}
				this.service.view_market(data, {
					success : function(o){
						YAHOO.log(o, "info", "Trade.view_available_trades.success");
						Lacuna.Pulser.Hide();
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
			Lacuna.Pulser.Show();
			var data = {session_id:Game.GetSession(),building_id:this.building.id,page_number:newState.page},
				selVal = Lib.getSelectedOptionValue("tradeFilter");
			if(selVal) {
				data.filter = selVal;
			}
			this.service.view_market(data, {
				success : function(o){
					YAHOO.log(o, "info", "Trade.view_available_trades.success");
					Lacuna.Pulser.Hide();
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
			Lacuna.Pulser.Show();
			this.Self.service.accept_from_market({
				session_id:Game.GetSession(""),
				building_id:this.Self.building.id,
				trade_id:this.Trade.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Trade.accept_trade.success");
					this.Self.rpcSuccess(o);
					//force get the new availabe list after accepting so we get a new captcha
					this.Self.getAvailable({newValue:true});
					Lacuna.Pulser.Hide();
				},
				scope:this
			});
		},
		AvailableReport : function() {
			Lacuna.Pulser.Show();
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
					Lacuna.Pulser.Hide();
				},
				scope:this
			});
		},
		EmpireProfile : function(e, empire) {
			Lacuna.Info.Empire.Load(empire.id);
		},
		
		
		//View Mine
		getMine : function(e) {
			if(e.newValue) {
				Lacuna.Pulser.Show();
				this.service.view_my_market({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
					success : function(o){
						YAHOO.log(o, "info", "Trade.view_my_trades.success");
						Lacuna.Pulser.Hide();
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
			Lacuna.Pulser.Show();
			this.service.view_my_market({
				session_id:Game.GetSession(),
				building_id:this.building.id,
				page_number:newState.page
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Trade.view_available_trades.success");
					Lacuna.Pulser.Hide();
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
				Lacuna.Pulser.Show();
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
						Lacuna.Pulser.Hide();
						
						this.Self.getStoredResources(true);
						this.Self.getPlans(true);
						this.Self.getGlyphs(true);
						this.Self.getPrisoners(true);
						this.Self.getShips(true);
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
		populateAddGlyphName : function() {
			var elm = Dom.get("tradeAddGlyphName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.glyphs.length > 0) {
					var glyphs = this.glyphs.sort(function(a,b) {
						if (a.type > b.type) {
							return 1;
						}
						else if (a.type < b.type) {
							return -1;
						}
						else {
							return 0;
						}
					});
					
					for(var x=0; x < glyphs.length; x++) {
						var obj = glyphs[x];
						nLi = li.cloneNode(false);
						nLi.Glyph = obj;
						nLi.innerHTML = ['<span class="tradeName">',obj.type.titleCaps(), '</span> <button type="button">+</button>'].join('');
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
		populateAddPlanName : function() {
			var elm = Dom.get("tradeAddPlanName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.plans.length > 0) {
					for(var x=0; x < this.plans.length; x++) {
						var obj = this.plans[x];
						nLi = li.cloneNode(false);
						nLi.Plan = obj;
						if(obj.extra_build_level > 0) {
							nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '+', obj.extra_build_level, '</span> <button type="button">+</button>'].join('');
						}
						else {
							nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '</span> <button type="button">+</button>'].join('');
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
		populateAddShipName : function() {
			var elm = Dom.get("tradeAddShipName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.ships.length > 0) {
					for(var x=0; x < this.ships.length; x++) {
						var obj = this.ships[x];
						nLi = li.cloneNode(false);
						nLi.Ship = obj;
						nLi.innerHTML = ['<span class="tradeName">',obj.name, ' - ', obj.type.titleCaps('_',' '), ' - Hold:', obj.hold_size, ' - Speed:', obj.speed, '</span> <button type="button">+</button>'].join('');
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
			Lacuna.Pulser.Show();
			
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
							nOpt.innerHTML = [obj.name, ' (', obj.type_human, ' - Hold:', obj.hold_size, ' - Speed:', obj.speed, ')'].join('');
							nOpt.selected = selectedVal == obj.id;
							elm.appendChild(nOpt);
						}
					}
					
					Lacuna.Pulser.Hide();
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
		AddGlyph : function(e, matchedEl, container){
			var li = matchedEl.parentNode,
				c = Dom.get("tradeAddItems");
			if(li && c) {
				var gId = li.Glyph.id,
					id = "addGlyph-" + gId;
				if(Sel.query("#"+id, c).length == 0) {
					var item = document.createElement("li"),
						del = item.appendChild(document.createElement("div")),
						content = item.appendChild(document.createElement("div"));
					item.id = id;
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ 
						this.updateAddCargo(this.glyphSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {glyph_id:gId, type:"glyph", size:this.glyphSize};
					content.innerHTML = li.Glyph.type.titleCaps();
					c.appendChild(item);
					this.updateAddCargo(this.glyphSize);
				}
			}
		},
		AddPlan : function(e, matchedEl, container){
			var li = matchedEl.parentNode,
				c = Dom.get("tradeAddItems");
			if(li && c) {
				var gId = li.Plan.id,
					id = "addPlan-" + gId;
				if(Sel.query("#"+id, c).length == 0) {
					var item = document.createElement("li"),
						del = item.appendChild(document.createElement("div")),
						content = item.appendChild(document.createElement("div"));
					item.id = id;
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ 
						this.updateAddCargo(this.planSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {plan_id:gId, type:"plan", size:this.planSize};
					if(li.Plan.extra_build_level > 0) {
						content.innerHTML = [li.Plan.name, ' ', li.Plan.level, '+', li.Plan.extra_build_level].join('');
					}
					else {
						content.innerHTML = [li.Plan.name, ' ', li.Plan.level].join('');
					}
					c.appendChild(item);
					this.updateAddCargo(this.planSize);
				}
			}
		},
		AddShip : function(e, matchedEl, container){
			var li = matchedEl.parentNode,
				c = Dom.get("tradeAddItems");
			if(li && c) {
				var obj = li.Ship,
					gId = obj.id,
					id = "addShip-" + gId;
				if(Sel.query("#"+id, c).length == 0) {
					var item = document.createElement("li"),
						del = item.appendChild(document.createElement("div")),
						content = item.appendChild(document.createElement("div"));
					item.id = id;
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ 
						this.updateAddCargo(this.shipSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {ship_id:gId, type:"ship", size:this.shipSize};
					content.innerHTML = [obj.name, ' - ', obj.type.titleCaps('_',' '), ' - Hold:', obj.hold_size, ' - Speed:', obj.speed].join('');
					c.appendChild(item);
					this.updateAddCargo(this.shipSize);
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
			
			Lacuna.Pulser.Show();
			this.service.add_to_market(data, {
				success : function(o){
					this.rpcSuccess(o);
					if(hasResources) {
						this.getStoredResources(true);
					}
					if(hasPlans) {
						this.getPlans(true);
					}
					if(hasGlyphs) {
						this.getGlyphs(true);
					}
					if(hasPrisoners) {
						this.getPrisoners(true);
					}
					if(hasShips) {
						this.getShips(true);
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
					Lacuna.Pulser.Hide();
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
                elm.innerHTML = "hello world";
            }
        },

		populatePushGlyphName : function() {
			var elm = Dom.get("tradePushGlyphName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.glyphs.length > 0) {
					var glyphs = this.glyphs.sort(function(a,b) {
						if (a.type > b.type) {
							return 1;
						}
						else if (a.type < b.type) {
							return -1;
						}
						else {
							return 0;
						}
					});
					
					for(var x=0; x < glyphs.length; x++) {
						var obj = glyphs[x];
						nLi = li.cloneNode(false);
						nLi.Glyph = obj;
						nLi.innerHTML = ['<span class="tradeName">',obj.type.titleCaps(), '</span> <button type="button">+</button>'].join('');
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
		populatePushPlanName : function() {
			var elm = Dom.get("tradePushPlanName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.plans.length > 0) {
					for(var x=0; x < this.plans.length; x++) {
						var obj = this.plans[x];
						nLi = li.cloneNode(false);
						nLi.Plan = obj;
						if(obj.extra_build_level > 0) {
							nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '+', obj.extra_build_level, '</span> <button type="button">+</button>'].join('');
						}
						else {
							nLi.innerHTML = ['<span class="tradeName">',obj.name, ' ', obj.level, '</span> <button type="button">+</button>'].join('');
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
		populatePushShipName : function() {
			var elm = Dom.get("tradePushShipName"),
				li = document.createElement("li"), nLi;
				
			if(elm) {
				elm.innerHTML = "";
				if(this.ships.length > 0) {
					for(var x=0; x < this.ships.length; x++) {
						var obj = this.ships[x];
						nLi = li.cloneNode(false);
						nLi.Ship = obj;
						nLi.innerHTML = ['<span class="tradeName">',obj.name, ' - ', obj.type.titleCaps('_',' '), ' - Hold:', obj.hold_size, ' - Speed:', obj.speed, '</span> <button type="button">+</button>'].join('');
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
				Lacuna.Pulser.Show();
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
						
						Lacuna.Pulser.Hide();
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
PushAddGlyph : function(e, matchedEl, container){
				   var li = matchedEl.parentNode,
				   c = Dom.get("tradePushItems");
				   if(li && c) {
					   var gId = li.Glyph.id,
						   id = "pushGlyph-" + gId;
					   if(Sel.query("#"+id, c).length == 0) {
						   var item = document.createElement("li"),
							   del = item.appendChild(document.createElement("div")),
							   content = item.appendChild(document.createElement("div"));
						   item.id = id;
						   Dom.addClass(item, "tradeItem");
						   Dom.addClass(del, "tradeDelete");
						   Event.on(del, "click", function(){ 
								   this.updatePushCargo(this.glyphSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {glyph_id:gId, type:"glyph", size:this.glyphSize};
					content.innerHTML = li.Glyph.type.titleCaps();
					c.appendChild(item);
					this.updatePushCargo(this.glyphSize);
				}
			}
		},
		PushAddPlan : function(e, matchedEl, container){
			var li = matchedEl.parentNode,
				c = Dom.get("tradePushItems");
			if(li && c) {
				var gId = li.Plan.id,
					id = "pushPlan-" + gId;
				if(Sel.query("#"+id, c).length == 0) {
					var item = document.createElement("li"),
						del = item.appendChild(document.createElement("div")),
						content = item.appendChild(document.createElement("div"));
					item.id = id;
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ 
						this.updatePushCargo(this.planSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {plan_id:gId, type:"plan", size:this.planSize};
					if(li.Plan.extra_build_level > 0) {
						content.innerHTML = [li.Plan.name, ' ', li.Plan.level, '+', li.Plan.extra_build_level].join('');
					}
					else {
						content.innerHTML = [li.Plan.name, ' ', li.Plan.level].join('');
					}
					c.appendChild(item);
					this.updatePushCargo(this.planSize);
				}
			}
		},
		PushAddShip : function(e, matchedEl, container){
			var li = matchedEl.parentNode,
				c = Dom.get("tradePushItems");
			if(li && c) {
				var obj = li.Ship,
					gId = obj.id,
					id = "pushShip-" + gId;
				if(Sel.query("#"+id, c).length == 0) {
					var item = document.createElement("li"),
						del = item.appendChild(document.createElement("div")),
						content = item.appendChild(document.createElement("div"));
					item.id = id;
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ 
						this.updatePushCargo(this.shipSize*-1);
						Event.purgeElement(item);
						item.parentNode.removeChild(item); 
					}, this, true);
					item.Object = {ship_id:gId, type:"ship", size:this.shipSize};
					content.innerHTML = [obj.name, ' - ', obj.type.titleCaps('_',' '), ' - Hold:', obj.hold_size, ' - Speed:', obj.speed].join('');
					c.appendChild(item);
					this.updatePushCargo(this.shipSize);
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
					this.updatePushCargo(diffi * li.Object.size);
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
				Lacuna.Pulser.Show();
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
							this.getPlans(true);
						}
						if(hasGlyphs) {
							this.getGlyphs(true);
						}
						if(hasPrisoners) {
							this.getPrisoners(true);
						}
						if(hasShips) {
							this.getShips(true);
						}
					
						var msg = Dom.get("tradePushMessage");
						msg.innerHTML = ["Successfully pushed to ", Lib.getSelectedOption(Dom.get("tradePushColony")).innerHTML, '.'].join('');
						Lib.fadeOutElm("tradePushMessage");
						Lacuna.Pulser.Hide();
						//get new ships since we just sent one
						this.getPushShips();
					},
					scope:this
				});
			}
		}
	
	});
	
	Lacuna.buildings.Trade = Trade;

})();
YAHOO.register("trade", YAHOO.lacuna.buildings.Trade, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
