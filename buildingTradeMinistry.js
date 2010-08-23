YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Trade == "undefined" || !YAHOO.lacuna.buildings.Trade) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Trade = function(result){
		Trade.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Trade;
		
		this.createEvent("onLoadGlyphs");
		this.createEvent("onLoadPlans");
		this.createEvent("onLoadPrisoners");
		this.createEvent("onLoadResources");
		this.createEvent("onLoadShips");
		
		this.subscribe("onLoad", this.getStoredResources, this, true);
	};
	
	Lang.extend(Trade, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getPushTab()];
		},
		_getPushTab : function() {
			this.push = new YAHOO.widget.Tab({ label: "Push", content: ['<div>',
				'<ul>',
				'	<li><label>Colony:</label><select id="tradePushColony"></select></li>',
				'	<li><label>Add Item:</label><select id="tradePushItem">',
				'			<option value="resource" selected>Resource</option>',
				'			<option value="glyph">Glyph</option>',
				'			<option value="plan">Plan</option>',
				'		</select></li>',
				'	<li id="tradePushResource" style="border:1px solid black;"><ul>',
				'		<li><label>Type:</label><select id="tradePushResourceName"></select></li>',
				'		<li><label>Quantity:</label><input type="text" id="tradePushResourceQuantity" /></li>',
				'		<li><button id="tradePushResourceAdd">Add</button></li>',
				'	</ul></li>',
				'	<li id="tradePushGlyph" style="display:none;border:1px solid black;"><ul>',
				'		<li><label>Name:</label><select id="tradePushGlyphName"></select></li>',
				'		<li><button id="tradePushGlyphAdd">Add</button></li>',
				'	</ul></li>',
				'	<li id="tradePushPlan" style="display:none;border:1px solid black;"><ul>',
				'		<li><label>Name:</label><select id="tradePushPlanName"></select></li>',
				'		<li><button id="tradePushPlanAdd">Add</button></li>',
				'	</ul></li>',
				'	<li><ul id="tradePushItems"></ul></li>',
				'	<li id="tradePushMessage" class="alert"></li>',
				'	<li><button id="tradePushSend">Send</button></li>',
				'</ul>',
			'</div>'].join('')});

			this.subscribe("onLoadResources", this.populatePushResourceName, this, true);
			this.subscribe("onLoadGlyphs", this.populatePushGlyphName, this, true);
			this.subscribe("onLoadPlans", this.populatePushPlanName, this, true);
			
			Event.onAvailable("tradePushColony", function(){
				var opt = document.createElement("option"),
					planets = Game.EmpireData.planets,
					cp = Game.GetCurrentPlanet(),
					nOpt;
				for(var pId in planets) {
					if(planets.hasOwnProperty(pId) && pId != cp.id){
						nOpt = opt.cloneNode(false);
						nOpt.value = pId;
						nOpt.innerHTML = planets[pId].name;
						this.appendChild(nOpt);
					}
				}
			});
			
			Event.on("tradePushItem", "change", function(e, oSelf){
				Dom.setStyle("tradePushResource", "display", this.selectedIndex === 0 ? "" : "none");
				Dom.setStyle("tradePushGlyph", "display", this.selectedIndex === 1 ? "" : "none");
				Dom.setStyle("tradePushPlan", "display", this.selectedIndex == 2 ? "" : "none");
				
				switch(this.selectedIndex) {
					case 1:
						oSelf.getGlyphs();
						break;
					case 2:
						oSelf.getPlans();
						break;
				}
			}, this);
			Event.on("tradePushResourceAdd", "click", this.PushAddResource, this, true);
			Event.on("tradePushGlyphAdd", "click", this.PushAddGlyph, this, true);
			Event.on("tradePushPlanAdd", "click", this.PushAddPlan, this, true);
			Event.on("tradePushSend", "click", this.Push, this, true);
			
			return this.push;
		},
		
		getGlyphs : function(force) {
			if(force || !this.glyphs) {
				this.service.get_glyphs({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Trade.getGlyphs.success");
						this.fireEvent("onMapRpc", o.result);
						this.glyphs = o.result.glyphs;
						this.fireEvent("onLoadGlyphs");
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.getGlyphs.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getPlans : function(force) {
			if(force || !this.plans) {
				this.service.get_plans({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Trade.getPlans.success");
						this.fireEvent("onMapRpc", o.result);
						this.plans = o.result.plans;
						this.fireEvent("onLoadPlans");
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.getPlans.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getPrisoners : function(force) {
			if(force || !this.prisoners) {
				this.service.get_prisoners({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Trade.getPrisoners.success");
						this.fireEvent("onMapRpc", o.result);
						this.prisoners = o.result.prisoners;
						this.fireEvent("onLoadPrisoners");
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.getPrisoners.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getShips : function(force) {
			if(force || !this.ships) {
				this.service.get_ships({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Trade.getShips.success");
						this.fireEvent("onMapRpc", o.result);
						this.ships = o.result.ships;
						this.fireEvent("onLoadShips");
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.getShips.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getStoredResources : function(force) {
			if(force || !this.resources) {
				this.service.get_stored_resources({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Trade.getStoredResources.success");
						this.fireEvent("onMapRpc", o.result);
						this.resources = o.result.resources;
						this.fireEvent("onLoadResources");
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.getStoredResources.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		
		populatePushResourceName: function() {
			var elm = Dom.get("tradePushResourceName"),
				opt = document.createElement("option"),
				nOpt, optGroup;
				
			if(elm) {
				elm.options.length = 0;
				for(var r in Lib.ResourceTypes) {
					if(Lib.ResourceTypes.hasOwnProperty(r)) {
						var resource = Lib.ResourceTypes[r];
						if(Lang.isArray(resource)) {
							optGroup = document.createElement("optgroup");
							optGroup.label = r.titleCaps();
							
							for(var x=0; x < resource.length; x++) {
								var name = resource[x];
								if(this.resources[name]) {
									nOpt = opt.cloneNode(false);
									nOpt.value = name;
									nOpt.innerHTML = [name.titleCaps(), ' (', this.resources[name], ')'].join('');
									optGroup.appendChild(nOpt);
								}
							}
							
							elm.appendChild(optGroup);
						}
						else if(this.resources[r] && resource) {
							nOpt = opt.cloneNode(false);
							nOpt.value = r;
							nOpt.innerHTML = [r.titleCaps(), ' (', this.resources[r], ')'].join('');
							elm.appendChild(nOpt);
						}
					}
				}
			}
		},
		populatePushGlyphName: function() {
			var elm = Dom.get("tradePushGlyphName"),
				opt = document.createElement("option"),
				nOpt;
				
			if(elm) {
				elm.options.length = 0;
				for(var x=0; x < this.glyphs.length; x++) {
					var obj = this.glyphs[x];
					nOpt = opt.cloneNode(false);
					nOpt.Glyph = obj;
					nOpt.value = obj.id;
					nOpt.innerHTML = obj.type.titleCaps();
					elm.appendChild(nOpt);
				}
			}
		},
		populatePushPlanName: function() {
			var elm = Dom.get("tradePushPlanName"),
				opt = document.createElement("option"),
				nOpt;
				
			if(elm) {
				elm.options.length = 0;	
				for(var x=0; x < this.plans.length; x++) {
					var obj = this.plans[x];
					nOpt = opt.cloneNode(false);
					nOpt.Plan = obj;
					nOpt.value = obj.id;
					nOpt.innerHTML = [obj.name, ' ', obj.level].join('');
					elm.appendChild(nOpt);
				}
			}
		},
			
		PushAddResource : function(){
			var opt = Lib.getSelectedOption("tradePushResourceName"),
				c = Dom.get("tradePushItems"),
				q = Dom.get("tradePushResourceQuantity");
			if(opt && c && q) {
				var item = document.createElement("li"),
					del = item.appendChild(document.createElement("div")),
					content = item.appendChild(document.createElement("div"));
				item.id = "tradeResource-" + opt.value;
				if(Sel.query("#"+item.id, c).length == 0) {
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ this.parentNode.removeChild(this); }, item, true);
					item.Object = {type:opt.value, quantity:q.value};
					content.innerHTML = opt.innerHTML;
					c.appendChild(item);
				}
			}
		},
		PushAddGlyph : function(){
			var opt = Lib.getSelectedOption("tradePushGlyphName"),
				c = Dom.get("tradePushItems");
			if(opt && c) {
				var item = document.createElement("li"),
					del = item.appendChild(document.createElement("div")),
					content = item.appendChild(document.createElement("div"));
				item.id = "tradeGlyph-" + opt.value;
				if(Sel.query("#"+item.id, c).length == 0) {
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ this.parentNode.removeChild(this); }, item, true);
					item.Object = {glyph_id:opt.value, type:"glyph"};
					content.innerHTML = opt.innerHTML;
					c.appendChild(item);
				}
			}
		},
		PushAddPlan : function(){
			var opt = Lib.getSelectedOption("tradePushPlanName"),
				c = Dom.get("tradePushItems");
			if(opt && c) {
				var item = document.createElement("li"),
					del = item.appendChild(document.createElement("div")),
					content = item.appendChild(document.createElement("div"));
				item.id = "tradePlan-" + opt.value;
				if(Sel.query("#"+item.id, c).length == 0) {
					Dom.addClass(item, "tradeItem");
					Dom.addClass(del, "tradeDelete");
					Event.on(del, "click", function(){ this.parentNode.removeChild(this); }, item, true);
					item.Object = {plan_id:opt.value, type:"plan"};
					content.innerHTML = opt.innerHTML;
					c.appendChild(item);
				}
			}
		},
		
		Push : function() {
			var data = {
					session_id: Game.GetSession(""),
					building_id: this.building.id,
					target_id: Lib.getSelectedOptionValue(Dom.get("tradePushColony"))
				},
				lis = Sel.query("li","tradePushItems"),
				items = [],
				hasResources, hasPlans, hasGlyphs;
				
			for(var n=0; n<lis.length; n++) {
				items[n] = lis[n].Object;
				switch(items[n].type) {
					case "plan":
						hasPlanes = true;
						break;
					case "glyph":
						hasGlyphs = true;
						break;
					default:
						hasResources = true;
						break;
				}
			}
			data.items = items;
			
			if(data.items.length == 0) {
				Dom.get("tradePushMessage").innerHTML = "Must add items to send to colony.";
			}
			else {
				this.service.push_items(data, {
					success : function(o){
						YAHOO.log(o, "info", "Trade.Push.success");
						this.fireEvent("onMapRpc", o.result);
						
						var ic = Dom.get("tradePushItems");
						Event.purgeElement(ic);
						ic.innerHTML = "";
						
						if(hasResources) {
							this.getStoredResources(true);
						}
						if(hasPlans) {
							this.getPlans(true);
						}
						if(hasGlyphs) {
							this.getGlyphs(true);
						}
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Trade.Push.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		}
	
	});
	
	Lacuna.buildings.Trade = Trade;

})();
YAHOO.register("trade", YAHOO.lacuna.buildings.Trade, {version: "1", build: "0"}); 

}