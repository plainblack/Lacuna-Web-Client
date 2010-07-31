YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.WasteRecycling == "undefined" || !YAHOO.lacuna.buildings.WasteRecycling) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var WasteRecycling = function(result){
		WasteRecycling.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Recycler;
	};
	
	Lang.extend(WasteRecycling, Lacuna.buildings.Building, {
		getTabs : function() {
			var t = this._getRecycleTab(),
				rt = WasteRecycling.superclass.getTabs.call(this);
			if(t) {
				rt[rt.length] = t;
			}
			return rt;
		},
		_getRecycleTab : function() {
			if(this.result.recycle.can) {
				this.recycleTab = new YAHOO.widget.Tab({ label: "Recycle", contentEl: this.RecycleGetDisplay(this.result.recycle)});
			}
			else if(this.result.recycle.seconds_remaining) {
				this.recycleTab = new YAHOO.widget.Tab({label: "Recycle", contentEl: this.RecycleGetTimeDisplay(this.result.recycle)});
				this.addQueue(this.result.recycle.seconds_remaining, this.RecycleQueue, "recycleTime");
			}
					
			return this.recycleTab;
		},
		
		Recycle : function(e) {
			var planet = Game.GetCurrentPlanet();
			if(planet) {
				var ore = this.recycleOreEl.value*1,
					water = this.recycleWaterEl.value*1,
					energy = this.recycleEnergyEl.value*1,
					total = ore + water + energy,
					useE = this.recycleUseEssentiaEl ? this.recycleUseEssentiaEl.selectedIndex || 0 : 0;
				if(total > planet.waste_stored) {
					this.recycleMessageEl.innerHTML = "Can only recycle waste you have stored.";
				}
				else {
					Lacuna.Pulser.Show();
					
					this.service.recycle({
						session_id:Game.GetSession(),
						building_id:this.building.id,
						water:water,
						ore:ore,
						energy:energy,
						use_essentia:useE
					}, {
						success : function(o){
							YAHOO.log(o, "info", "WasteRecycling.Recycle.success");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpc", o.result);
							
							if(this.recycleTab){
								if(o.result.seconds_remaining && o.result.seconds_remaining*1 > 0) {
									var ce = this.recycleTab.get("contentEl");
									Event.purgeElement(ce);
									ce.innerHTML = "";
									ce.appendChild(this.RecycleGetTimeDisplay(o.result, water, ore, energy));
									this.addQueue(o.result.seconds_remaining, this.RecycleQueue, "recycleTime");
								}
								else {
									this.recycleOreEl.value = "";
									this.recycleWaterEl.value = "";
									this.recycleEnergyEl.value = "";
									this.recycleMessageEl.innerHTML = "";
								}
							}
						},
						failure : function(o){
							YAHOO.log(o, "error", "WasteRecycling.Recycle.failure");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpcFailed", o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
			}
		},
		RecycleGetDisplay : function(recycle) {
			var planet = Game.GetCurrentPlanet(),
				ul = document.createElement("ul"),
				li = document.createElement("li"),
				nLi = li.cloneNode(false),
				input;
			
			if(recycle) {
				nLi.innerHTML = ['Can recycle a maximum of ',Lib.formatNumber(recycle.max_recycle),' waste at ', Lib.formatNumber(Math.floor(3600 / recycle.seconds_per_resource)),'/hour.'].join(''); 
				ul.appendChild(nLi);
				
				nLi = li.cloneNode(false);
			}
			
			nLi.innerHTML = '<label>Recycle into:</label>';
			ul.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/ore.png" class="smallOre" /></span>';
			input = document.createElement("input");
			input.type = "text";
			input.originalValue = 0;
			input.value = 0;
			input = nLi.appendChild(input);
			Event.on(input, "change", this.RecycleValueChange, this, true);
			this.recycleOreEl = input;
			ul.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/water.png" class="smallWater" /></span>';
			input = document.createElement("input");
			input.type = "text";
			input.originalValue = 0;
			input.value = 0;
			input = nLi.appendChild(input);
			Event.on(input, "change", this.RecycleValueChange, this, true);
			this.recycleWaterEl = input;
			ul.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/energy.png" class="smallEnergy" /></span>';
			input = document.createElement("input");
			input.type = "text";
			input.originalValue = 0;
			input.value = 0;
			input = nLi.appendChild(input);
			Event.on(input, "change", this.RecycleValueChange, this, true);
			this.recycleEnergyEl = input;
			ul.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = '<label>Total:</label>';
			var span = nLi.appendChild(document.createElement("span"));
			span.innerHTML = 0;
			ul.appendChild(nLi);
			
			this.totalWasteToRecycle = 0;
			this.totalWasteToRecycleEl = span;
			
			if(Game.EmpireData.essentia != "") {
				nLi = li.cloneNode(false);
				nLi.innerHTML = '<label>Spend 2 Essentia to recycle immediately?</label>';
				var select = document.createElement("select"),
					optA = select.appendChild(document.createElement("option")),
					optB = select.appendChild(document.createElement("option"));
				optA.value = "0";
				optA.innerHTML = "No";
				optB.value = "1";
				optB.innerHTML = "Yes";
				select = nLi.appendChild(select);
				this.recycleUseEssentiaEl = select;
				ul.appendChild(nLi);
			}
			
			nLi = li.cloneNode(false);
			this.recycleMessageEl = nLi;
			ul.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			var btn = document.createElement("button");
			btn.setAttribute("type", "button");
			btn.innerHTML = "Recycle";
			btn = nLi.appendChild(btn);
			Event.on(btn, "click", this.Recycle, this, true);
			ul.appendChild(nLi);
			
			var div = document.createElement("div");
			div.appendChild(ul);
			
			return div;
		},
		RecycleGetTimeDisplay : function(recycle, water, ore, energy) {
			var div = document.createElement("div"),
				btnDiv = div.cloneNode(false);
			div.innerHTML = ['<p>Current recycling job:</p>',
				'<ul><li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span>',recycle.ore || ore || '','</li>',
				'<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span>',recycle.water || water || '','</li>',
				'<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span>',recycle.energy || energy || '','</li>',
				'<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span id="recycleTime">',Lib.formatTime(recycle.seconds_remaining),'</span></li></ul>'
			].join('');
			
			btnDiv.appendChild(document.createTextNode("You may subsidize the recycle job for 2 essentia and finish it immediately. "));
			
			var bbtn = document.createElement("button");
			bbtn.setAttribute("type", "button");
			bbtn.innerHTML = "Subsidize";
			bbtn = btnDiv.appendChild(bbtn);
			Event.on(bbtn, "click", this.RecycleSubsidize, this, true);
			
			div.appendChild(btnDiv);			
			return div;
		},
		RecycleQueue : function(remaining, el){
			if(remaining <= 0) {
				var span = Dom.get(el),
					p = span.parentNode;
				p.removeChild(span);
				p.innerHTML = "No recycling jobs running.";
			}
			else {
				Dom.get(el).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		},
		RecycleValueChange : function(e){
			var input = Event.getTarget(e),
				val = input.value*1;
			if(Lang.isNumber(val)){
				this.totalWasteToRecycle = this.totalWasteToRecycle - input.originalValue + val;
				this.totalWasteToRecycleEl.innerHTML = Lib.formatNumber(this.totalWasteToRecycle);
				input.originalValue = val;
			}
			else {
				input.value = input.originalValue;
			}
		},
		RecycleSubsidize : function() {
			Lacuna.Pulser.Show();
			this.service.subsidize_recycling({
				session_id:Game.GetSession(),
				building_id:this.building.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "WasteRecycling.RecycleSubsidize.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					
					this.resetQueue();

					if(this.recycleTab){
						var ce = this.recycleTab.get("contentEl");
						Event.purgeElement(ce);
						ce.innerHTML = "";
						ce.appendChild(this.RecycleGetDisplay());
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "WasteRecycling.RecycleSubsidize.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}

	});
	
	YAHOO.lacuna.buildings.WasteRecycling = WasteRecycling;

})();
YAHOO.register("wasterecycling", YAHOO.lacuna.buildings.WasteRecycling, {version: "1", build: "0"}); 

}