YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Transporter == "undefined" || !YAHOO.lacuna.buildings.Transporter) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Transporter = function(result){
		Transporter.superclass.constructor.call(this, result);
		
		this.transport = result.transport;
		
		this.availableAcceptText = "Accept For 1 Essentia";
		this.addTradeText = "Add Trade For 1 Essentia";
		this.pushTradeText = "Send For 2 Essentia";
		
		this.service = Game.Services.Buildings.Transporter;
	};
	
	Lang.extend(Transporter, Lacuna.buildings.Trade, {
		getChildTabs : function() {
			this.mineTabIndex = 4; //array location plus 1 since Production tab is always first
			return [this._getOneForOneTab(),this._getPushTab(), this._getAvailTab(), this._getMineTab(), this._getAddTab()];
		},
		_getOneForOneTab : function() {
			this.oneForOne = new YAHOO.widget.Tab({ label: "One For One", content: ['<div>',
				'<div>You may trade one-for-one with Lacuna Corp for 3<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per transaction.</div>',
				'<ul>',
				'	<li><label>Want:</label><select id="transporterOneForOneWant"></select></li>',
				'	<li><label>Have:</label><select id="transporterOneForOneHave"></select></li>',
				'	<li><label>Quantity:</label><input type="text" id="transporterOneForOneQuantity" /></li>',
				'	<li id="transporterOneForOneMessage" class="alert"></li>',
				'	<li><button id="transporterOneForOneTrade">Submit Trade for 3 Essentia</button></li>',
				'</ul>',
			'</div>'].join('')});
			
			this.subscribe("onLoadResources", this.populateOneForOneHave, this, true);
			
			Event.onAvailable("transporterOneForOneWant", function(e){
				var elm = Dom.get("transporterOneForOneWant"),
					opt = document.createElement("option"),
					nOpt, optGroup;
				for(var r in Lib.ResourceTypes) {
					if(Lib.ResourceTypes.hasOwnProperty(r)) {
						var resource = Lib.ResourceTypes[r];
						if(Lang.isArray(resource)) {
							optGroup = document.createElement("optgroup");
							optGroup.label = r.titleCaps();
							
							for(var x=0; x < resource.length; x++) {
								nOpt = opt.cloneNode(false);
								nOpt.value = resource[x];
								nOpt.innerHTML = resource[x].titleCaps();
								optGroup.appendChild(nOpt);
							}
							
							elm.appendChild(optGroup);
						}
						else if(resource) {
							nOpt = opt.cloneNode(false);
							nOpt.value = r;
							nOpt.innerHTML = r.titleCaps();
							elm.appendChild(nOpt);
						}
					}
				}
			}, this, true);
			Event.on("transporterOneForOneTrade", "click", this.Trade, this, true);
			
			return this.oneForOne;
		},
		
		populateOneForOneHave : function() {
			var elm = Dom.get("transporterOneForOneHave"),
				opt = document.createElement("option"),
				nOpt, optGroup;
				
			if(elm) {
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
		Trade : function() {
			var data = {
				session_id: Game.GetSession(""),
				building_id: this.building.id,
				have: Lib.getSelectedOptionValue(Dom.get("transporterOneForOneHave")),
				want: Lib.getSelectedOptionValue(Dom.get("transporterOneForOneWant")),
				quantity: Dom.get("transporterOneForOneQuantity").value*1
			};
			
			if(data.quantity > this.transport.max) {
				Dom.get("transporterOneForOneMessage").innerHTML = ["Quantity must be less than ", this.transport.max, ", which is the maximum for this level transporter."].join('');
				Lib.fadeOutElm("transporterOneForOneMessage");
			}
			else if(data.quantity < 0 || data.quantity > this.resources[data.have]*1) {
				Dom.get("transporterOneForOneMessage").innerHTML = "Quantity must be greater than 0 and less than or equal to the resources you have on hand.";
				Lib.fadeOutElm("transporterOneForOneMessage");
			}
			else {
				this.service.trade_one_for_one(data, {
					success : function(o){
						YAHOO.log(o, "info", "Transporter.Trade.success");
						this.fireEvent("onMapRpc", o.result);
						Dom.get("transporterOneForOneHave").selectedIndex = -1;
						Dom.get("transporterOneForOneWant").selectedIndex = -1;
						Dom.get("transporterOneForOneQuantity").value = "";
						this.getStoredResources(true);
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Transporter.Trade.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		}
	
	});
	
	Lacuna.buildings.Transporter = Transporter;

})();
YAHOO.register("transporter", YAHOO.lacuna.buildings.Transporter, {version: "1", build: "0"}); 

}