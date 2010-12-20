YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Shipyard == "undefined" || !YAHOO.lacuna.buildings.Shipyard) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Shipyard = function(result){
		Shipyard.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Shipyard;
	};
	
	Lang.extend(Shipyard, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getQueueTab(), this._getBuildTab()];
		},
		_getQueueTab : function() {
			var div = document.createElement("div");
			div.innerHTML = ['<div>You may subsidize the build queue for 1 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per ship. <button type="button" class="shipQueueSubsidize">Subsidize</button> </div>',
				'<ul class="shipQueue shipQueueHeader clearafter"><li class="shipQueueType">Type</li><li class="shipQueueEach">Time To Complete</li></ul>',
				'<div id="shipsBuilding"></div>'].join('');
			Event.on(Sel.query(".shipQueueSubsidize",div,true), "click", this.SubsidizeBuildQueue, this, true);
		
			var queueTab = new YAHOO.widget.Tab({ label: "Build Queue", contentEl:div });
			queueTab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					this.getQueue();
				}
			}, this, true);
					
			this.queueTab = queueTab;
			
			return queueTab;
		},
		_getBuildTab : function() {
											
			var buildTab = new YAHOO.widget.Tab({ label: "Build Ships", content: [
				'<div>',
				'	<div class="clearafter" style="font-weight:bold;">',
				'		<span id="shipDocksAvailable" style="float:left;"></span>',
				'		<span style="float:right;"><select id="shipBuildView"><option value="All">All</option><option value="Now" selected="selected">Now</option><option value="Later">Later</option></select></span>',
				'	</div>',
				'	<div id="shipBuildMessage" class="error"></div>',
				'	<div style="height:300px;overflow:auto;margin-top:2px;border-top:1px solid #52acff;">',
				'		<ul id="shipDetails">',
				'		</ul>',
				'	</div>',
				'</div>'
			].join('')});
			
			buildTab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					this.getBuild();
				}
			}, this, true);
			
			Event.on("shipBuildView", "change", this.ShipPopulate, this, true);
					
			this.buildTab = buildTab;
			
			return buildTab;
		},
		
		getBuild : function() {
			if(!this.ships) {
				Lacuna.Pulser.Show();
				this.service.get_buildable({session_id:Game.GetSession(),building_id:this.building.id}, {
					success : function(o){
						YAHOO.log(o, "info", "Shipyard.getBuild.get_buildable.success");
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						this.ships = {
							buildable: o.result.buildable,
							docks_available: o.result.docks_available
						};
						this.SetDocksAvailableMessage();
						this.ShipPopulate();
					},
					failure : function(o){
						YAHOO.log(o, "error", "Shipyard.getBuild.get_buildable.failure");
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
			else {
				this.ShipPopulate();
			}
		},
		getQueue : function() {
			if(!this.ship_build_queue) {
				Lacuna.Pulser.Show();
				this.service.view_build_queue({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
					success : function(o){
						YAHOO.log(o, "info", "Shipyard.getQueue.view_build_queue.success");
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						this.ship_build_queue = o.result;
						this.ShipyardDisplay();
					},
					failure : function(o){
						YAHOO.log(o, "error", "Shipyard.getQueue.view_build_queue.failure");
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
			else {
				this.ShipyardDisplay();
			}
		},
		
		ShipyardDisplay : function() {
			var bq = this.ship_build_queue,
				div = Dom.get("shipsBuilding");

			if(div) {
				var divParent = div.parentNode,
					ul = document.createElement("ul"),
					li = document.createElement("li"),
					now = new Date();
					
				this.resetQueue();
				div = divParent.removeChild(div);
				div.innerHTML = "";
				
				/*= {
					number_of_ships_building: o.result.number_of_ships_building,
					ships_building: o.result.ships_building
				};*/
				if(bq && bq.ships_building && bq.ships_building.length > 0) {
					for(var i=0; i<bq.ships_building.length; i++) {
						var bqo = bq.ships_building[i],
							nUl = ul.cloneNode(false),
							nLi = li.cloneNode(false),
							ncs = (Lib.parseServerDate(bqo.date_completed).getTime() - now.getTime()) / 1000;
						
						nUl.Build = bqo;
						
						Dom.addClass(nUl, "shipQueue");
						Dom.addClass(nUl, "clearafter");

						Dom.addClass(nLi,"shipQueueType");
						nLi.innerHTML = bqo.type_human;
						nUl.appendChild(nLi);
						
						nLi = li.cloneNode(false);
						Dom.addClass(nLi,"shipQueueEach");
						nLi.innerHTML = Lib.formatTime(ncs);
						nUl.appendChild(nLi);

						div.appendChild(nUl);
						
						this.addQueue(ncs, this.ShipyardQueue, nUl);
					}
				}
				//add child back in
				divParent.appendChild(div);
			}
		},
		ShipyardQueue : function(remaining, elLine){
			if(remaining <= 0) {
				elLine.parentNode.removeChild(elLine);
			}
			else {
				Sel.query("li.shipQueueEach",elLine,true).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		},
		SubsidizeBuildQueue : function() {
			Lacuna.Pulser.Show();
			
			this.service.subsidize_build_queue({
				session_id:Game.GetSession(),
				building_id:this.building.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Shipyard.SubsidizeBuildQueue.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);

					this.ship_build_queue = undefined;
					this.ShipyardDisplay();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Shipyard.SubsidizeBuildQueue.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		
		SetBuildMessage : function(message) {
			var msg = Dom.get("shipBuildMessage");
			if(msg) {
				msg.innerHTML = message;
				Lib.fadeOutElm("shipBuildMessage");
			}
		},
		SetDocksAvailableMessage : function() {
			var sda = Dom.get("shipDocksAvailable");
			if(sda) {
				if(this.ships.docks_available) {
					sda.innerHTML = 'There are ' + this.ships.docks_available + ' docks available for new ships.';
				}
				else {
					sda.innerHTML = 'You have no docks available.  Do you still have a Space Port?';
				}
			}
		},
		ShipPopulate : function() {
			var details = Dom.get("shipDetails");
			
			if(details) {
				var ships = this.ships.buildable,
					li = document.createElement("li"),
					shipNames = [],
					filter = Lib.getSelectedOptionValue("shipBuildView"),
					defReason = !this.ships.docks_available ? "No docks available at Space Port." : undefined;
					
				Event.purgeElement(details);
				details.innerHTML = "";
						
				for(var shipType in ships) {
					if(ships.hasOwnProperty(shipType)) {
						if(filter == "All") {
							shipNames.push(shipType);
						}
						else if(filter == "Now" && ships[shipType].can) {
							shipNames.push(shipType);
						}
						else if(filter == "Later" && !ships[shipType].can) {
							shipNames.push(shipType);
						}
					}
				}
				shipNames.sort();
				
				for(var i=0; i<shipNames.length; i++) {
					var shipName = shipNames[i],
						ship = ships[shipName],
						nLi = li.cloneNode(false),
						reason="", attributes = [];
					
					if(ship.reason) {						
						reason = '<div style="font-style:italic;">'+Lib.parseReason(ship.reason, defReason)+'</div>';
					}
					
					for(var a in ship.attributes) {
						attributes[attributes.length] = '<span style="white-space:nowrap;margin-left:10px;"><label style="font-style:italic">';
						attributes[attributes.length] = a.titleCaps('_',' ');
						attributes[attributes.length] = ': </label>';
						attributes[attributes.length] = ship.attributes[a];
						attributes[attributes.length] = '</span>';
					}
					
					nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
					'	<div class="yui-u first" style="width:20%;background:transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center;text-align:center;">',
					'		<img src="',Lib.AssetUrl,'ships/',shipName,'.png" style="width:100px;height:100px;" class="shipImage" />',
					'	</div>',
					'	<div class="yui-u" style="width:67%">',
					'		<span class="shipName">',ship.type_human,'</span>: ',
					'		<div class="shipDesc" style="display:none;">',Game.GetShipDesc(shipName),'</div>',
					'		<div><label style="font-weight:bold;">Cost:</label>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" />',ship.cost.food,'</span>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" />',ship.cost.ore,'</span>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" />',ship.cost.water,'</span>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" />',ship.cost.energy,'</span>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" />',ship.cost.waste,'</span>',
					'			<span style="white-space:nowrap;"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" />',Lib.formatTime(ship.cost.seconds),'</span>',
					'		</div>',
					'		<div><label style="font-weight:bold;">Attributes:</label>',attributes.join(''),'</div>',
					!ship.can ? reason : '',
					'	</div>',
					'	<div class="yui-u" style="width:8%">',
					ship.can ? '		<button type="button">Build</button>' : '',
					'	</div>',
					'</div>'].join('');
					if(ship.can) {
						Event.on(Sel.query("button", nLi, true), "click", this.ShipBuild, {Self:this,Type:shipName,Ship:ship}, true);
					}
					
					details.appendChild(nLi);
					
				}
				
				Event.delegate(details, "click", this.ShipExpandDesc, ".shipName");
				Event.delegate(details, "click", this.ShipExpandDesc, ".shipImage");
			}
		},
		ShipExpandDesc : function(e, matchedEl, container) {
			var desc = Sel.query('div.shipDesc', matchedEl.parentNode.parentNode, true);
			if(desc) {
				var dis = Dom.getStyle(desc, "display");
				Dom.setStyle(desc, "display", dis == "none" ? "" : "none");
			}
		},
		ShipBuild : function() {
			Lacuna.Pulser.Show();
			
			this.Self.service.build_ship({
				session_id:Game.GetSession(),
				building_id:this.Self.building.id,
				type:this.Type,
				quantity:1
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Shipyard.ShipBuild.success");
					Lacuna.Pulser.Hide();
					this.Self.rpcSuccess(o);

					this.Self.ship_build_queue = o.result;
					this.Self.ShipyardDisplay();
					
					this.Self.ships.docks_available--;
					if(this.Self.ships.docks_available < 0) {
						this.Self.ships.docks_available = 0;
					}
					this.Self.SetDocksAvailableMessage();
					this.Self.SetBuildMessage("Successfully started building " + this.Ship.type_human + ".");
				},
				failure : function(o){
					YAHOO.log(o, "error", "Shipyard.ShipBuild.failure");
					Lacuna.Pulser.Hide();
					this.Self.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}
		
	});
	
	YAHOO.lacuna.buildings.Shipyard = Shipyard;

})();
YAHOO.register("shipyard", YAHOO.lacuna.buildings.Shipyard, {version: "1", build: "0"}); 

}
