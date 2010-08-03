YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.SpacePort == "undefined" || !YAHOO.lacuna.buildings.SpacePort) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var SpacePort = function(result){
		SpacePort.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.SpacePort;
	};
	
	Lang.extend(SpacePort, Lacuna.buildings.Building, {
		getTabs : function() {
			return SpacePort.superclass.getTabs.call(this).concat([this._getDockTab(), this._getTravelTab(), this._getViewTab()]);
		},
		_getDockTab : function() {
			var ships = this.result.docked_ships;
			this.dockTab = new YAHOO.widget.Tab({ label: "Docked Ships", content: [
				'<div class="yui-g">',
				'	<div class="yui-u first">',
				'		<ul class="buildingDetailsDockedShips">',
				'			<li><label>Probe</label><span class="buildingDetailsNum">',ships.probe,'</span></li>',
				'			<li><label>Spy Pod</label><span class="buildingDetailsNum">',ships.spy_pod,'</span></li>',
				'			<li><label>Smuggler Ship</label><span class="buildingDetailsNum">',ships.smuggler_ship,'</span></li>',
				'			<li><label>Mining Platform Ship</label><span class="buildingDetailsNum">',ships.mining_platform_ship,'</span></li>',
				'			<li><label>Cargo Ship</label><span class="buildingDetailsNum">',ships.cargo_ship,'</span></li>',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u">',
				'		<ul class="buildingDetailsDockedShips">',
				'			<li><label>Terraforming Platform Ship</label><span class="buildingDetailsNum">',ships.terraforming_platform_ship,'</span></li>',
				'			<li><label>Gas Giant Settlement Platform Ship</label><span class="buildingDetailsNum">',ships.gas_giant_settlement_platform_ship,'</span></li>',
				'			<li><label>Space Station</label><span class="buildingDetailsNum">',ships.space_station,'</span></li>',
				'			<li><label>Colony Ship</label><span class="buildingDetailsNum">',ships.colony_ship,'</span></li>',
				'		</ul>',
				'	</div>',
				'</div>'
			].join('')});
			
			return this.dockTab;
		},
		_getTravelTab : function() {
			this.travelTab = new YAHOO.widget.Tab({ label: "Traveling Ships", content: [
				'<div>',
				'	<ul class="shipHeader shipInfo clearafter">',
				'		<li class="shipType">Type</li>',
				'		<li class="shipArrives">Arrives</li>',
				'		<li class="shipFrom">From</li>',
				'		<li class="shipTo">To</li>',
				'	</ul>',
				'	<div><div id="shipDetails"></div></div>',
				'</div>'
			].join('')});
			//subscribe after adding so active doesn't fire
			this.travelTab.subscribe("activeChange", this.getTravel, this, true);
			
			return this.travelTab;
		},
		_getViewTab : function() {
			this.viewShipsTab = new YAHOO.widget.Tab({ label: "View Ships", content: [
				'<div>',
				'	<ul class="shipHeader shipInfo clearafter">',
				'		<li class="shipTypeImage">&nbsp;</li>',
				'		<li class="shipName">Name</li>',
				'		<li class="shipTask">Task</li>',
				'		<li class="shipSpeed">Speed</li>',
				'		<li class="shipHold">Hold Size</li>',
				'	</ul>',
				'	<div><div id="shipsAllDetails"></div></div>',
				'</div>'
			].join('')});
			//subscribe after adding so active doesn't fire
			this.viewShipsTab.subscribe("activeChange", this.getShips, this, true);
			
			return this.viewShipsTab;
		},
		
		getTravel : function(e) {
			if(e.newValue) {
				if(!this.shipsTraveling) {
					Lacuna.Pulser.Show();
					this.service.view_ships_travelling({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
						success : function(o){
							YAHOO.log(o, "info", "MapPlanet.SpacePort.view_ships_travelling.success");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpc", o.result);
							this.shipsTraveling = {
								number_of_ships_travelling: o.result.number_of_ships_travelling,
								ships_travelling: o.result.ships_travelling
							};
							this.SpacePortPopulate();
						},
						failure : function(o){
							YAHOO.log(o, "error", "MapPlanet.SpacePort.view_ships_travelling.failure");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpcFailed", o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.SpacePortPopulate();
				}
			}
		},
		getShips : function(e) {
			if(e.newValue) {
				if(!this.shipsAll) {
					Lacuna.Pulser.Show();
					this.service.view_all_ships({session_id:Game.GetSession(),building_id:this.building.id}, {
						success : function(o){
							YAHOO.log(o, "info", "MapPlanet.SpacePort.view_all_ships.success");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpc", o.result);
							this.shipsAll = {
								number_of_ships: o.result.number_of_ships,
								ships: o.result.ships
							};
							this.SpacePortShipsPopulate();
						},
						failure : function(o){
							YAHOO.log(o, "error", "MapPlanet.SpacePort.view_all_ships.failure");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpcFailed", o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.SpacePortShipsPopulate();
				}
			}
		},
		
		SpacePortPopulate : function() {
			var details = Dom.get("shipDetails");
			
			if(details) {
				var ships = this.shipsTraveling.ships_travelling,
					ul = document.createElement("ul"),
					li = document.createElement("li");
					
				Event.purgeElement(details);
				details.innerHTML = "";
				
				var now = new Date();
				
				for(var i=0; i<ships.length; i++) {
					var ship = ships[i],
						nUl = ul.cloneNode(false),
						nLi = li.cloneNode(false),
						sec = (Lib.parseServerDate(ship.date_arrives).getTime() - now.getTime()) / 1000;
						
					nUl.Ship = ship;
					Dom.addClass(nUl, "shipInfo");
					Dom.addClass(nUl, "clearafter");

					Dom.addClass(nLi,"shipType");
					nLi.innerHTML = Lib.Ships[ship.type];
					nUl.appendChild(nLi);

					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"shipArrives");
					nLi.innerHTML = Lib.formatTime(sec);
					nUl.appendChild(nLi);
					
					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"shipFrom");
					nLi.innerHTML = ship.from.name;
					nUl.appendChild(nLi);

					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"shipTo");
					nLi.innerHTML = ship.to.name;
					nUl.appendChild(nLi);

					this.addQueue(sec, this.SpacePortQueue, nUl);
								
					details.appendChild(nUl);
					
				}
				
				//wait for tab to display first
				setTimeout(function() {
					if(details.parentNode.clientHeight > 300) {
						Dom.setStyle(details.parentNode,"height","300px");
						Dom.setStyle(details.parentNode,"overflow-y","auto");
					}
				},10);
			}
		},
		SpacePortQueue : function(remaining, elLine){
			if(remaining <= 0) {
				elLine.parentNode.removeChild(elLine);
			}
			else {
				Sel.query("li.shipArrives",elLine,true).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		},
		SpacePortShipsPopulate : function() {
			var details = Dom.get("shipsAllDetails");
			
			if(details) {
				var ships = this.shipsAll.ships,
					ul = document.createElement("ul"),
					li = document.createElement("li");
					
				Event.purgeElement(details);
				details.innerHTML = "";
				
				var now = new Date();
				
				for(var i=0; i<ships.length; i++) {
					var ship = ships[i],
						nUl = ul.cloneNode(false),
						nLi = li.cloneNode(false);
						
					nUl.Ship = ship;
					Dom.addClass(nUl, "shipInfo");
					Dom.addClass(nUl, "clearafter");

					Dom.addClass(nLi,"shipTypeImage");
					Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
					Dom.setStyle(nLi, "text-align", "center");
					nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',ship.type,'.png" style="width:50px;height:50px;" />'].join('');
					nUl.appendChild(nLi);

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
					nLi.innerHTML = ship.hold_size;
					nUl.appendChild(nLi);
								
					details.appendChild(nUl);
					
				}
				
				//wait for tab to display first
				setTimeout(function() {
					if(details.parentNode.clientHeight > 300) {
						Dom.setStyle(details.parentNode,"height","300px");
						Dom.setStyle(details.parentNode,"overflow-y","auto");
					}
				},10);
			}
		}
		
	});
	
	YAHOO.lacuna.buildings.SpacePort = SpacePort;

})();
YAHOO.register("spaceport", YAHOO.lacuna.buildings.SpacePort, {version: "1", build: "0"}); 

}