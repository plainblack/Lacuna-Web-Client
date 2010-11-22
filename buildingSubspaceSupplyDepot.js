YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.SubspaceSupplyDepot == "undefined" || !YAHOO.lacuna.buildings.SubspaceSupplyDepot) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var SubspaceSupplyDepot = function(result){
		SubspaceSupplyDepot.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.SubspaceSupplyDepot;
	};
	
	YAHOO.lang.extend(SubspaceSupplyDepot, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getTransmitTab()];
		},
		_getTransmitTab : function() {
			var div = document.createElement("div");
			div.innerHTML = [
				'<div>',
				'	<button class="subspaceTransmit" id="subspaceTransmitFood">Transmit <span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span>3600 Food</button>',
				'	<button class="subspaceTransmit" id="subspaceTransmitOre">Transmit <span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span>3600 Ore</button>',
				'</div>',
				'<div>',
				'	<button class="subspaceTransmit" id="subspaceTransmitWater">Transmit <span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span>3600 Water</button>',
				'	<button class="subspaceTransmit" id="subspaceTransmitEnergy">Transmit <span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span>3600 Energy</button>',
				'</div>',
				'<div>',
				'	<button class="subspaceTransmit" id="subspaceCompleteBuildQueue">Complete Build Queue (<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span id="subspaceQueueTime"></span>)</button>',
				'</div>',
				'<div id="subspaceMessage">&nbsp;</div>'
			].join('');
			Dom.setStyle(div, 'text-align', 'center');

			Event.on('subspaceTransmitFood', 'click', this.Transmit, {method:"transmit_food"}, this);
			Event.on('subspaceTransmitOre', 'click', this.Transmit, {method:"transmit_ore"}, this);
			Event.on('subspaceTransmitWater', 'click', this.Transmit, {method:"transmit_water"}, this);
			Event.on('subspaceTransmitEnergy', 'click', this.Transmit, {method:"transmit_energy"}, this);
			Event.on('subspaceCompleteBuildQueue', 'click', this.Transmit, {method:"complete_build_queue"}, this);

			Game.onTick.subscribe(this.UpdateQueueTime, this, true);
			var tab = new YAHOO.widget.Tab({ label: "Transmit Resources", contentEl: div });
			tab.subscribe("activeChange", function(e) {
				var buildQueueTotal = 0;
				if(e.newValue) {
					var buildings = Lacuna.MapPlanet.buildings;
					for (var building in buildings) {
						if( buildings.hasOwnProperty(building) ) {
							var b = buildings[building];
							if (b.pending_build) {
								buildQueueTotal += b.pending_build.seconds_remaining*1;
							}
						}
					}
				}
				this.queueStartTime = new Date();
				this.buildQueueTotal = buildQueueTotal;
				this.UpdateQueueTime();
			}, this, true);
			
			return tab;
		},
		UpdateQueueTime : function(e) {
			if (! this.queueStartTime) {
				return;
			}
			var timeLeft = this.buildQueueTotal - ( (new Date()).getTime() - this.queueStartTime.getTime() ) / 1000;
			if (timeLeft < 1) {
				timeLeft = 0;
				delete this.buildQueueTotal;
				delete this.queueStartTime;
				Dom.get('subspaceCompleteBuildQueue').disabled = true;
			}
			else {
				Dom.get('subspaceCompleteBuildQueue').disabled = false;
			}
			Dom.get('subspaceQueueTime').innerHTML = Lib.formatTime(timeLeft);
		},
		Transmit : function(e, opt) {
			var btn = Event.getTarget(e);
			Event.stopEvent(e);
			Lacuna.Pulser.Show();
			btn.disabled = true;
			var oldStartTime;
			if (opt.method == 'complete_build_queue') {
				oldStartTime = this.queueStartTime;
				delete this.queueStartTime;
			}
			this.service[opt.method]({
				session_id:Game.GetSession(),
				building_id:this.building.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "SubspaceSupplyDepot.Transmit.success");
					var elMessage = Dom.get('subspaceMessage');
					if (opt.method == 'complete_build_queue') {
						this.queueStartTime = oldStartTime;
						this.buildQueueTotal = 0;
						this.UpdateQueueTime();
						elMessage.innerHTML = 'Build queue completed.';
					}
					else {
						btn.disabled = false;
						elMessage.innerHTML = 'Transmission completed.';
					}
					var a = new Util.Anim(elMessage, {opacity:{from:1,to:0}}, 4);
					a.onComplete.subscribe(function(){
						elMessage.innerHTML = "&nbsp;";
					}, this, true);
					a.animate();
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
				},
				failure : function(o){
					YAHOO.log(o, "error", "SubspaceSupplyDepot.Transmit.failure");
					if (opt.method == 'complete_build_queue') {
						this.queueStartTime = oldStartTime;
						this.UpdateQueueTime();
					}
					else {
						btn.disabled = false;
					}
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}
	});
	
	Lacuna.buildings.SubspaceSupplyDepot = SubspaceSupplyDepot;

})();
YAHOO.register("SubspaceSupplyDepot", YAHOO.lacuna.buildings.SubspaceSupplyDepot, {version: "1", build: "0"}); 

}
