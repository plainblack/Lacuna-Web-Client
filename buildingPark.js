YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Park == "undefined" || !YAHOO.lacuna.buildings.Park) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Park = function(result){
		Park.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Park;
	};
	
	Lang.extend(Park, Lacuna.buildings.Building, {
		getTabs : function() {
			return [this._getPartyTab()];
		},
		_getPartyTab : function() {
			var div = document.createElement("div");
			if(this.result.party.can_throw) {
				var btn = document.createElement("button");
				btn.setAttribute("type", "button");
				btn.innerHTML = "Throw Party!";
				btn = div.appendChild(btn);
				Event.on(btn, "click", this.Party, this, true);
			}
			else if(this.result.party.seconds_remaining*1 > 0) {
				div.innerHTML = ['<p>You will get ',Lib.formatNumber(this.result.party.happiness),' happiness from your party!'].join('');
				div.appendChild(this.PartyGetTimeDisplay(this.result.party));
				this.addQueue(this.result.party.seconds_remaining, this.PartyQueue, "partyTime");
			}
			else {
				div.innerHTML = '<p>You need at least 10,000 food to throw a party.</p>';
			}
			this.partyTab = new YAHOO.widget.Tab({ label: "Party", contentEl: div});
			return this.partyTab;
		},
		Party : function(e) {
			Lacuna.Pulser.Show();
			
			this.service.throw_a_party({
				session_id:Game.GetSession(),
				building_id:this.building.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Park.Party.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					
					if(this.partyTab) {
						var ce = tab.get("contentEl");
						Event.purgeElement(ce);
						
						if(o.result.seconds_remaining && o.result.seconds_remaining*1 > 0) {
							ce.innerHTML = "";
							ce.appendChild(this.PartyGetTimeDisplay(o.result));
							this.addQueue(o.result.seconds_remaining, this.PartyQueue, "partyTime");
						}
						else {
							this.removeTab(this.partyTab);
						}
					}
					
					//remove all tile timers
					Game.QueueResetPlanet();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Park.Party.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});	
		},
		PartyGetTimeDisplay : function(party) {
			var div = document.createElement("div");
			div.innerHTML = ['<span>Party time remaining: </span><span id="partyTime">',Lib.formatTime(party.seconds_remaining),'</span>'].join('');
					
			return div;
		},
		PartyQueue : function(remaining, el){
			if(remaining <= 0) {
				var span = Dom.get(el),
					p = span.parentNode;
				p.removeChild(span);
				p.innerHTML = "No Parties being thrown.";
			}
			else {
				Dom.get(el).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		}
		
	});
	
	YAHOO.lacuna.buildings.Park = Park;

})();
YAHOO.register("park", YAHOO.lacuna.buildings.Park, {version: "1", build: "0"}); 

}