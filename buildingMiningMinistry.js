YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.MiningMinistry == "undefined" || !YAHOO.lacuna.buildings.MiningMinistry) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var MiningMinistry = function(result){
		MiningMinistry.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Mining;
	};
	
	Lang.extend(MiningMinistry, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getPlatformTab(), this._getShipsTab()];
		},
		_getPlatformTab : function() {
			this.platformTab = new YAHOO.widget.Tab({ label: "Platforms", content: [
				'<div id="platformShippingInfo"></div>',
				'<div class="platformContainer">',
				'	<div id="platformDetails">',
				'	</div>',
				'</div>'
			].join('')});
			this.platformTab.subscribe("activeChange", this.viewPlatforms, this, true);
					
			return this.platformTab;
		},
		_getShipsTab : function() {
			this.shipsTab = new YAHOO.widget.Tab({ label: "Ships", content: [
				'<div class="shipsContainer">',
				'	<ul class="shipHeader shipInfo clearafter">',
				'		<li class="shipName">Name</li>',
				'		<li class="shipTask">Task</li>',
				'		<li class="shipSpeed">Speed</li>',
				'		<li class="shipHold">Hold</li>',
				'		<li class="shipAction"></li>',
				'	</ul>',
				'	<div><div id="shipsDetails"></div></div>',
				'</div>'
			].join('')});
			this.shipsTab.subscribe("activeChange", this.viewShips, this, true);
					
			return this.shipsTab;
		},
		
		viewPlatforms : function(e) {
			if(e.newValue) {
				if(!this.platforms) {
					Lacuna.Pulser.Show();
					this.service.view_platforms({session_id:Game.GetSession(),building_id:this.building.id}, {
						success : function(o){
							YAHOO.log(o, "info", "MiningMinistry.view_platforms.success");
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
							this.platforms = { 
								max_platforms:o.result.max_platforms,
								platforms:o.result.platforms
							};
							
							this.MiningMinistryPlatforms();
						},
						failure : function(o){
							YAHOO.log(o, "error", "MiningMinistry.view_platforms.failure");
							Lacuna.Pulser.Hide();
							this.rpcFailure(o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.MiningMinistryPlatforms();
				}
			}
		},
		viewShips : function(e) {
			if(e.newValue) {
				if(!this.ships) {
					this.MiningMinistryShipsView();
				}
				else {
					this.MiningMinistryShipsPopulate();
				}
			}
		},
		
		CapacityDescription : function(capacity) {
			var output = ['Current production to shipping metric is ', capacity, '. '];
			if(capacity == -1) {
				output.push('You have no ships servicing your platforms.');
			}
			else if(capacity == 0) {
				output.push('You are producing an insignificant amount of ore. Add more platforms or upgrade your Mining Ministry.');
			}
			else if(capacity > 100) {
				output.push('You are producing more than your ships can handle. Add more ship to bring the value closer to 100.');
			}
			else if(capacity < 100) {
				output.push('Your ships have more capacity than the platforms are producing. You may remove ships or add platforms to get closer to 100.');
			}
			else if(capacity == 100) {
				output.push('Your shipping capacity and production values are exactly in sync.');
			}
			return output.join('');
		},
		platformClick : function(){
			Game.StarJump(this);
		},
		MiningMinistryPlatforms : function() {
			var platforms = this.platforms.platforms,
				details = Dom.get("platformDetails");
				
			if(details) {
				var ul = document.createElement("ul"),
					li = document.createElement("li"),
					info = Dom.get("platformShippingInfo");
					
				if(platforms.length > 0) {
					info.innerHTML = ['Total of ', platforms.length, ' platforms deployed.  This ministry can control a maximum of ', this.platforms.max_platforms, 
						' platforms. ', this.CapacityDescription(platforms[0].shipping_capacity)
					].join('');
				}
					
				Event.purgeElement(details);
				details.innerHTML = "";
				
				for(var i=0; i<platforms.length; i++) {
					var obj = platforms[i],
						nUl = ul.cloneNode(false),
						nLi = li.cloneNode(false);
						
					nUl.Platform = obj;
					Dom.addClass(nUl, "platformInfo");
					Dom.addClass(nUl, "clearafter");

					Dom.addClass(nLi,"platformLocation");
					nLi.innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',obj.asteroid.image,'.png" />',obj.asteroid.name].join('');
					Event.on(nLi, "click", this.platformClick, obj, true);
					nUl.appendChild(nLi);
					
					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"platformAbandon");
					var bbtn = document.createElement("button");
					bbtn.setAttribute("type", "button");
					bbtn.innerHTML = "Abandon";
					bbtn = nLi.appendChild(bbtn);
					nUl.appendChild(nLi);
					
					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"platformOre");
					var outOre = ['<ul><li><label>Ore Per Hour:</label></li>'];
					if(obj.anthracite_hour > 0) {
						outOre.push('<li><label>Anthracite:</label> ');
						outOre.push(obj.anthracite_hour);
						outOre.push('</li>');
					}
					if(obj.bauxite_hour > 0) {
						outOre.push('<li><label>Bauxite:</label> ');
						outOre.push(obj.bauxite_hour);
						outOre.push('</li>');
					}
					if(obj.beryl_hour > 0) {
						outOre.push('<li><label>Beryl:</label> ');
						outOre.push(obj.beryl_hour);
						outOre.push('</li>');
					}
					if(obj.chalcopyrite_hour > 0) {
						outOre.push('<li><label>Chalcopyrite:</label> ');
						outOre.push(obj.chalcopyrite_hour);
						outOre.push('</li>');
					}
					if(obj.chromite_hour > 0) {
						outOre.push('<li><label>Chromite:</label> ');
						outOre.push(obj.chromite_hour);
						outOre.push('</li>');
					}
					if(obj.fluorite_hour > 0) {
						outOre.push('<li><label>Fluorite:</label> ');
						outOre.push(obj.fluorite_hour);
						outOre.push('</li>');
					}
					if(obj.galena_hour > 0) {
						outOre.push('<li><label>Galena:</label> ');
						outOre.push(obj.galena_hour);
						outOre.push('</li>');
					}
					if(obj.goethite_hour > 0) {
						outOre.push('<li><label>Goethite:</label> ');
						outOre.push(obj.goethite_hour);
						outOre.push('</li>');
					}
					if(obj.gold_hour > 0) {
						outOre.push('<li><label>Gold:</label> ');
						outOre.push(obj.gold_hour);
						outOre.push('</li>');
					}
					if(obj.gypsum_hour > 0) {
						outOre.push('<li><label>Gypsum:</label> ');
						outOre.push(obj.gypsum_hour);
						outOre.push('</li>');
					}
					if(obj.halite_hour > 0) {
						outOre.push('<li><label>Halite:</label> ');
						outOre.push(obj.halite_hour);
						outOre.push('</li>');
					}
					if(obj.kerogen_hour > 0) {
						outOre.push('<li><label>Kerogen:</label> ');
						outOre.push(obj.kerogen_hour);
						outOre.push('</li>');
					}
					if(obj.magnetite_hour > 0) {
						outOre.push('<li><label>Magnetite:</label> ');
						outOre.push(obj.magnetite_hour);
						outOre.push('</li>');
					}
					if(obj.methane_hour > 0) {
						outOre.push('<li><label>Methane:</label> ');
						outOre.push(obj.methane_hour);
						outOre.push('</li>');
					}
					if(obj.monazite_hour > 0) {
						outOre.push('<li><label>Monazite:</label> ');
						outOre.push(obj.monazite_hour);
						outOre.push('</li>');
					}
					if(obj.rutile_hour > 0) {
						outOre.push('<li><label>Rutile:</label> ');
						outOre.push(obj.rutile_hour);
						outOre.push('</li>');
					}
					if(obj.sulfur_hour > 0) {
						outOre.push('<li><label>Sulfur:</label> ');
						outOre.push(obj.sulfur_hour);
						outOre.push('</li>');
					}
					if(obj.trona_hour > 0) {
						outOre.push('<li><label>Trona:</label> ');
						outOre.push(obj.trona_hour);
						outOre.push('</li>');
					}
					if(obj.uraninite_hour > 0) {
						outOre.push('<li><label>Uraninite:</label> ');
						outOre.push(obj.uraninite_hour);
						outOre.push('</li>');
					}
					if(obj.zircon_hour > 0) {
						outOre.push('<li><label>Zircon:</label> ');
						outOre.push(obj.zircon_hour);
						outOre.push('</li>');
					}
					outOre.push('</ul>');
					nLi.innerHTML = outOre.join('');
					nUl.appendChild(nLi);

					details.appendChild(nUl);
					
					Event.on(bbtn, "click", this.MiningMinistryPlatformAbandon, {Self:this,Platform:obj,Line:nUl}, true);
				}
				
				//wait for tab to display first
				setTimeout(function() {
					if(details.parentNode.clientHeight > 280) {
						Dom.setStyle(details.parentNode,"height","280px");
						Dom.setStyle(details.parentNode,"overflow-y","auto");
					}
				},10);
			}
		},
		MiningMinistryPlatformAbandon : function() {
			if(confirm(["Are you sure you want to Abandon the mining platform at  ",this.Platform.asteroid.name,"?"].join(''))) {
				Lacuna.Pulser.Show();
				
				this.Self.service.abandon_platform({
					session_id:Game.GetSession(),
					building_id:this.Self.building.id,
					platform_id:this.Platform.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "MiningMinistry.MiningMinistryPlatformAbandon.success");
						Lacuna.Pulser.Hide();
						this.Self.rpcSuccess(o);
						var platforms = this.Self.platforms.platforms;
						for(var i=0; i<platforms.length; i++) {
							if(platforms[i].id == this.Platform.id) {
								platforms.splice(i,1);
								break;
							}
						}
						this.Line.parentNode.removeChild(this.Line);
					},
					failure : function(o){
						YAHOO.log(o, "error", "MiningMinistry.MiningMinistryPlatformAbandon.failure");
						Lacuna.Pulser.Hide();
						this.Self.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		MiningMinistryShipsView : function() {
			Lacuna.Pulser.Show();
			this.service.view_ships({session_id:Game.GetSession(),building_id:this.building.id}, {
				success : function(o){
					YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsView.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.ships = o.result.ships;
					
					this.MiningMinistryShipsPopulate();
				},
				failure : function(o){
					YAHOO.log(o, "error", "MiningMinistry.MiningMinistryShipsView.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		MiningMinistryShipsPopulate : function() {
			var ships = this.ships,
				details = Dom.get("shipsDetails");
			
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
					nLi.innerHTML = ship.hold_size;
					nUl.appendChild(nLi);
					
					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"shipAction");
					var bbtn = document.createElement("button");
					bbtn.setAttribute("type", "button");
					bbtn.innerHTML = ship.task == "Docked" ? "Start Mining" : "Stop Mining";
					bbtn = nLi.appendChild(bbtn);
					nUl.appendChild(nLi);
					
					if(ship.task == "Docked") {
						Event.on(bbtn, "click", this.MiningMinistryShipsAdd, {Self:this,Ship:ship}, true);
					}
					else {
						Event.on(bbtn, "click", this.MiningMinistryShipsRemove, {Self:this,Ship:ship}, true);
					}
								
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
		MiningMinistryShipsAdd : function() {
			Lacuna.Pulser.Show();
				
			this.Self.service.add_cargo_ship_to_fleet({
				session_id:Game.GetSession(),
				building_id:this.Self.building.id,
				ship_id:this.Ship.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsAdd.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.MiningMinistryShipsView();
					delete this.platforms; //reset platforms so we geto the new correct info
				},
				failure : function(o){
					YAHOO.log(o, "error", "MiningMinistry.MiningMinistryShipsAdd.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this.Self
			});
		},
		MiningMinistryShipsRemove : function() {
			Lacuna.Pulser.Show();
			
			this.Self.service.remove_cargo_ship_from_fleet({
				session_id:Game.GetSession(),
				building_id:this.Self.building.id,
				ship_id:this.Ship.id
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MiningMinistry.MiningMinistryShipsRemove.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.MiningMinistryShipsView();
					delete this.platforms; //reset platforms so we geto the new correct info
				},
				failure : function(o){
					YAHOO.log(o, "error", "MiningMinistry.MiningMinistryShipsRemove.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this.Self
			});
		}

	});
	
	YAHOO.lacuna.buildings.MiningMinistry = MiningMinistry;

})();
YAHOO.register("miningministry", YAHOO.lacuna.buildings.MiningMinistry, {version: "1", build: "0"}); 

}