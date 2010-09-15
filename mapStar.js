YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapStar == "undefined" || !YAHOO.lacuna.MapStar) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var MapStar = function() {
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		//this.createEvent("onChangeToSystemView");
		this.createEvent("onChangeToPlanetView");
		
		this._renameLabel = "Rename";
		
		this._buildDetailsPanel();
		this._buildPlanetDetailsPanel();
	};
	MapStar.prototype = {
		_buildDetailsPanel : function() {
			var panelId = "starDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g">',
				'		<div class="yui-u first" id="starDetailsImg" class="background:black:width:100px;">',
				'		</div>',
				'		<div class="yui-u" id="starDetailsInfo">',
				'		</div>',
				'	</div>',
				'	<div id="starDetailTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'		</ul>',
				'		<div class="yui-content">',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.starDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"500px",
				zIndex:9995,
				context:["header","tr","br", ["beforeShow", "windowResize"], [0,40]]
			});
			this.starDetails.addQueue = function(seconds, queueFn, elm, sc) {
				this.queue = this.queue || [];
				//check if the queue is empty and store
				var notStarted = this.queue.length == 0;
				//push new queue item so it's immediately available for the tick
				this.queue.push({secondsRemaining:seconds*1, el:elm, fn:queueFn, scope:sc});
				//make sure we subscribe to the tick
				if(notStarted) {
					Game.onTick.subscribe(this.processQueue, this, true);
				}
			};
			this.starDetails.processQueue = function(e, oArgs) {
				if(this.queue.length > 0) {
					var queue = this.queue,
						diff = oArgs[0]/1000,
						newq = [];

					while(queue.length > 0) {
						var callback = queue.pop();
						callback.secondsRemaining -= diff;
						if(callback.secondsRemaining > 0) {
							newq.push(callback);
						}
						callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el);
					}
					this.queue = newq;
				}
				else {
					Game.onTick.unsubscribe(this.processQueue);
				}
			};
			this.starDetails.resetQueue = function() {
				Game.onTick.unsubscribe(this.processQueue);
				this.queue = [];
			};
			this.starDetails.addTab = function(tab) {
				this.removeableTabs = this.removeableTabs || [];
				this.removeableTabs.push(tab);
				this.tabView.addTab(tab);
			};
			
			this.starDetails.renderEvent.subscribe(function(){
				this.starDetails.tabView = new YAHOO.widget.TabView("starDetailTabs");
				/*Event.delegate("starDetailsInfo", "click", function(e, matchedEl, container){
					var data = this.selectedStar;
					if(data) {
						if(matchedEl.innerHTML == "Send Probe") {
							this.SendProbe(data);
						}
					}
				}, "button", this, true);*/
			}, this, true);
			this.starDetails.hideEvent.subscribe(function(){
				this.selectedStar = undefined;
				this.starDetails.resetQueue();
				
				var rt = this.starDetails.removeableTabs;
				if(rt && rt.length > 0) {
					for(var n=0; n<rt.length; n++) {
						this.starDetails.tabView.removeTab(rt[n]);
					}
					delete this.starDetails.removeableTabs;
				}
			}, this, true);
			
			this.starDetails.render();
			Game.OverlayManager.register(this.starDetails);
		},
		_buildPlanetDetailsPanel : function() {
			var panelId = "planetDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g">',
				'		<div class="yui-u first" id="planetDetailsImg">',
				'		</div>',
				'		<div class="yui-u" id="planetDetailsInfo">',
				'		</div>',
				'	</div>',
				'	<div id="planetDetailTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'			<li><a href="#planetDetailOre"><em>Ore</em></a></li>',
				'			<li><a href="#planetDetailRename"><em>',this._renameLabel,'</em></a></li>',
				'		</ul>',
				'		<div class="yui-content">',
				'			<div id="planetDetailOre">',
				'				<div class="yui-g">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li><label>Anthracite</label><span class="buildingDetailsNum" id="planetDetailsAnthracite"></span></li>',
				'							<li><label>Bauxite</label><span class="buildingDetailsNum" id="planetDetailsBauxite"></span></li>',
				'							<li><label>Beryl</label><span class="buildingDetailsNum" id="planetDetailsBeryl"></span></li>',
				'							<li><label>Chalcopyrite</label><span class="buildingDetailsNum" id="planetDetailsChalcopyrite"></span></li>',
				'							<li><label>Chromite</label><span class="buildingDetailsNum" id="planetDetailsChromite"></span></li>',
				'							<li><label>Fluorite</label><span class="buildingDetailsNum" id="planetDetailsFluorite"></span></li>',
				'							<li><label>Galena</label><span class="buildingDetailsNum" id="planetDetailsGalena"></span></li>',
				'							<li><label>Goethite</label><span class="buildingDetailsNum" id="planetDetailsGoethite"></span></li>',
				'							<li><label>Gold</label><span class="buildingDetailsNum" id="planetDetailsGold"></span></li>',
				'							<li><label>Gypsum</label><span class="buildingDetailsNum" id="planetDetailsGypsum"></span></li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul>',
				'							<li><label>Halite</label><span class="buildingDetailsNum" id="planetDetailsHalite"></span></li>',
				'							<li><label>Kerogen</label><span class="buildingDetailsNum" id="planetDetailsKerogen"></span></li>',
				'							<li><label>Magnetite</label><span class="buildingDetailsNum" id="planetDetailsMagnetite"></span></li>',
				'							<li><label>Methane</label><span class="buildingDetailsNum" id="planetDetailsMethane"></span></li>',
				'							<li><label>Monazite</label><span class="buildingDetailsNum" id="planetDetailsMonazite"></span></li>',
				'							<li><label>Rutile</label><span class="buildingDetailsNum" id="planetDetailsRutile"></span></li>',
				'							<li><label>Sulfur</label><span class="buildingDetailsNum" id="planetDetailsSulfur"></span></li>',
				'							<li><label>Trona</label><span class="buildingDetailsNum" id="planetDetailsTrona"></span></li>',
				'							<li><label>Uraninite</label><span class="buildingDetailsNum" id="planetDetailsUraninite"></span></li>',
				'							<li><label>Zircon</label><span class="buildingDetailsNum" id="planetDetailsZircon"></span></li>',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
				'			<div id="planetDetailRename"><ul>',
				'				<li><label>New Planet Name: </label><input type="text" id="planetDetailNewName" maxlength="100" /></li>',
				'				<li><button type="button" id="planetDetailRenameSubmit">Rename</button></li>',
				'			</ul></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.planetDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"500px",
				zIndex:9995,
				context:["header","tr","br", ["beforeShow", "windowResize"], [0,20]]
			});
			this.planetDetails.addQueue = function(seconds, queueFn, elm, sc) {
				this.queue = this.queue || [];
				//check if the queue is empty and store
				var notStarted = this.queue.length == 0;
				//push new queue item so it's immediately available for the tick
				this.queue.push({secondsRemaining:seconds*1, el:elm, fn:queueFn, scope:sc});
				//make sure we subscribe to the tick
				if(notStarted) {
					Game.onTick.subscribe(this.processQueue, this, true);
				}
			};
			this.planetDetails.processQueue = function(e, oArgs) {
				if(this.queue.length > 0) {
					var queue = this.queue,
						diff = oArgs[0]/1000,
						newq = [];

					while(queue.length > 0) {
						var callback = queue.pop();
						callback.secondsRemaining -= diff;
						if(callback.secondsRemaining > 0) {
							newq.push(callback);
						}
						callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el);
					}
					this.queue = newq;
				}
				else {
					Game.onTick.unsubscribe(this.processQueue);
				}
			};
			this.planetDetails.resetQueue = function() {
				Game.onTick.unsubscribe(this.processQueue);
				this.queue = [];
			};
			this.planetDetails.addTab = function(tab) {
				this.removeableTabs = this.removeableTabs || [];
				this.removeableTabs.push(tab);
				this.tabView.addTab(tab);
			};
			
			this.planetDetails.renderEvent.subscribe(function(){
				this.planetDetails.tabView = new YAHOO.widget.TabView("planetDetailTabs");
				Event.on("planetDetailRenameSubmit", "click", this.Rename, this, true);
				Event.delegate("planetDetailsInfo", "click", this.DetailsClick, "button", this, true);
				Event.delegate("planetDetailMoveSpies", "click", this.MoveSpiesClick, "button", this, true);
			}, this, true);
			this.planetDetails.hideEvent.subscribe(function(){
				this.selectedBody = undefined;
				this.selectedTile = undefined;
				this.planetDetails.resetQueue();
				
				var rt = this.planetDetails.removeableTabs;
				if(rt && rt.length > 0) {
					for(var n=0; n<rt.length; n++) {
						this.planetDetails.tabView.removeTab(rt[n]);
					}
					delete this.planetDetails.removeableTabs;
				}
			}, this, true);
			
			this.planetDetails.render();
			Game.OverlayManager.register(this.planetDetails);
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			/*if(visible) {
				this.starJump.show();
			}
			else {
				this.starJump.hide();
			}*/
			if(this._isVisible != visible) {
				if(this._elGrid) {
					this._isVisible = visible;
					YAHOO.log(visible, "info", "MapStar.MapVisible");
					Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
				}
			}
		},

		Jump : function(xC,yC) {
			this.LoadGrid({
				x:(xC-1),
				y:(yC+1)
			});
		},
		Load : function() {
			var cId = Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id;
			if(!this.locationId) {
				if(cId) {
					var loc = Game.EmpireData.planets[cId];
					if(loc) {
						this.locationId = cId;
						loc.x *= 1;
						loc.y *= 1;
						this.LoadGrid(loc);
					}
				}
			}
		},
		LoadGrid : function(loc) {
			Lacuna.Pulser.Show();
			if(!this._gridCreated) {
				var starMap = document.createElement("div");
				starMap.id = "starMap";
				this._elGrid = document.getElementById("content").appendChild(starMap);
				this.SetSize();
								
				var map = new Lacuna.Mapper.StarMap("starMap");
				map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
				
				//draw what we got
				map.redraw();
				//move to current planet
				map.setCenterTo(loc.x,loc.y);
				
				this._map = map;
				this._gridCreated = true;
				
				Event.delegate(this._map.mapDiv, "click", this.GridClick, "div.tile", this, true);
			}
			else {
				//move to current planet
				this._map.setCenterTo(loc.x,loc.y);
			}
			
			this.MapVisible(true);
			Lacuna.Pulser.Hide();
		},
		GridClick : function(e, matchedEl, container) {
			if(!this._map.controller.isDragging()) {
				var tile = this._map.tileLayer.findTileById(matchedEl.id);
				if(tile && tile.data) {
					if(tile.data.isStar) {
						this.ShowStar(tile);
					}
					else if(tile.data.isPlanet) {
						this.ShowPlanet(tile);
					}
				}
			}
		},
		SetSize : function() {
			var size = Game.GetSize();
			Dom.setStyle(this._elGrid, "width", size.w+"px");
			Dom.setStyle(this._elGrid, "height", size.h+"px");
		},
		Resize : function() {
			this.SetSize();
			this._map.resize();
		},
		Reset : function() {
			delete this.locationId;
			if(this._map) {
				this._map.reset();
			}
			this.MapVisible(false);
		},
	
		CreateShipsIncomingTab : function(panel) {
			var ships = this.currentShips.incoming,
				elm = document.createElement("div"),
				c = elm.cloneNode(false),
				details = elm.cloneNode(false);
				
			elm.innerHTML = [
				'<ul class="shipHeader shipInfo clearafter">',
				'	<li class="shipTypeImage">Type</li>',
				'	<li class="shipName">Name</li>',
				'	<li class="shipTask">Task</li>',
				'	<li class="shipFrom">From</li>',
				'	<li class="shipTo">To</li>',
				'	<li class="shipStarted">Started</li>',
				'	<li class="shipArrives">Arrives</li>',
				'</ul>'
			].join('');
			
			details = elm.appendChild(c).appendChild(details);

			var ul = document.createElement("ul"),
				li = document.createElement("li");
			
			var now = new Date();
			
			for(var i=0; i<ships.length; i++) {
				var ship = ships[i],
					nUl = ul.cloneNode(false),
					nLi = li.cloneNode(false),
					sec = (Lib.parseServerDate(ship.date_arrives).getTime() - now.getTime()) / 1000;
					
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
				Dom.addClass(nLi,"shipFrom");
				nLi.innerHTML = ship.from.name;
				nUl.appendChild(nLi);

				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipTo");
				nLi.innerHTML = ship.to.name;
				nUl.appendChild(nLi);

				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipStarted");
				nLi.innerHTML = Lib.formatTime(ship.date_started);
				nUl.appendChild(nLi);

				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipArrives");
				nLi.innerHTML = Lib.formatTime(sec);
				nUl.appendChild(nLi);

				panel.addQueue(sec, this.ArrivesQueue, nUl);
							
				details.appendChild(nUl);
				
			}
			
			//wait for tab to display first
			setTimeout(function() {
				if(details.parentNode.clientHeight > 300) {
					Dom.setStyle(details.parentNode,"height","300px");
					Dom.setStyle(details.parentNode,"overflow-y","auto");
				}
			},10);
				
			panel.addTab(new YAHOO.widget.Tab({ label: "Incoming Ships", contentEl:elm }));
		},
		ArrivesQueue : function(remaining, elLine){
			if(remaining <= 0) {
				elLine.parentNode.removeChild(elLine);
			}
			else {
				Sel.query("li.shipArrives",elLine,true).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		},
		
		CreateShipsSendTab : function(panel) {
			var ships = this.currentShips.available,
				elm = document.createElement("div"),
				c = elm.cloneNode(false),
				details = elm.cloneNode(false);
				
			elm.innerHTML = [
				'<ul class="shipHeader shipInfo clearafter">',
				'	<li class="shipTypeImage">Type</li>',
				'	<li class="shipName">Name</li>',
				'	<li class="shipTask">Task</li>',
				'	<li class="shipSpeed">Speed</li>',
				'	<li class="shipStarted">Started</li>',
				'	<li class="shipAvailable">Available</li>',
				'	<li class="shipAction"></li>',
				'</ul>'
			].join('');
			
			details = elm.appendChild(c).appendChild(details);

			var ul = document.createElement("ul"),
				li = document.createElement("li");
			
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
				Dom.addClass(nLi,"shipStarted");
				nLi.innerHTML = Lib.formatTime(ship.date_started);
				nUl.appendChild(nLi);

				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipAvailable");
				nLi.innerHTML = Lib.formatTime(ship.date_available);
				nUl.appendChild(nLi);

				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipAction");
				if(ship.task == "Docked") {
					var bbtn = document.createElement("button");
					bbtn.setAttribute("type", "button");
					bbtn.innerHTML = "Send";
					bbtn = nLi.appendChild(bbtn);
					Event.on(bbtn, "click", this.ShipSend, {Self:this,Ship:ship,Line:nUl}, true);
				}
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
			
			panel.addTab(new YAHOO.widget.Tab({ label: "Send Ships", contentEl:elm }));
		},
		ShipSend : function() {
		},
	
		CreateShipsMiningPlatforms : function(panel) {
			var ships = this.currentShips.mining_platforms,
				elm = document.createElement("div"),
				c = elm.cloneNode(false),
				details = elm.cloneNode(false);
				
			elm.innerHTML = [
				'<ul class="shipHeader shipInfo clearafter">',
				'	<li class="shipName">From Empire</li>',
				'</ul>'
			].join('');
			
			details = elm.appendChild(c).appendChild(details);

			var ul = document.createElement("ul"),
				li = document.createElement("li");
			
			for(var i=0; i<ships.length; i++) {
				var ship = ships[i],
					nUl = ul.cloneNode(false),
					nLi = li.cloneNode(false);
					
				nUl.Ship = ship;
				Dom.addClass(nUl, "shipInfo");
				Dom.addClass(nUl, "clearafter");
				
				nLi = li.cloneNode(false);
				Dom.addClass(nLi,"shipName");
				nLi.innerHTML = ship.empire_name;
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
			
			panel.addTab(new YAHOO.widget.Tab({ label: "Mining Platforms", contentEl:elm }));
		},
	
		GetShips : function(panel, target) {
			Game.Services.Buildings.SpacePort.get_ships_for({
				session_id:Game.GetSession(),
				from_body_id:Game.GetCurrentPlanet().id,
				target:target
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapStar.ShowStar.get_ships_for.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					this.currentShips = o.result;
					if(o.result.incoming && o.result.incoming.length > 0) {
						this.CreateShipsIncomingTab(panel);
					}
					else if(o.result.available && o.result.available.length > 0) {
						this.CreateShipsSendTab(panel);
					}
					if(o.result.mining_platforms && o.result.mining_platforms.length > 0) {
						this.CreateShipsMiningPlatforms(panel);
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapStar.ShowStar.get_ships_for.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
			
		},
		ShowStar : function(tile) {
			//hide everything first so the hideEvents get run
			Game.OverlayManager.hideAll();
			
			var data = tile.data,
				panel = this.starDetails;
			Dom.get("starDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',data.color,'.png" alt="',data.name,'" style="width:100px;height:100px;" />'].join('');
			
			Dom.get("starDetailsInfo").innerHTML = [
				'<ul>',
				'	<li id="starDetailsName">',data.name,'</li>',
				'	<li><label>X: </label>',data.x,'</li>',
				'	<li><label>Y: </label>',data.y,'</li>',
				'</ul>'
			].join('');
			
			this.GetShips(panel,{star_id:data.id});
			
			this.selectedStar = data;
			panel.show();
		},
		ShowPlanet : function(tile) {
			//hide everything first so the hideEvents get run
			Game.OverlayManager.hideAll();
			
			var body = tile.data,
				panel = this.planetDetails,
				empire = body.empire || {alignment:"none"};
			Dom.get("planetDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',body.image,'.png" alt="',body.name,'" style="width:200px;height:200px;" />'].join('');
			Dom.get("planetDetailsInfo").innerHTML = [
				'<ul>',
				'	<li id="planetDetailsName">',body.name,'</li>',
				'	<li><label>Type: </label>',body.type,'</li>',
				'	<li><label>Empire: </label>',(body.empire && body.empire.name ? body.empire.name : "None"),'</li>',
				'	<li><label>Water: </label>',body.water,'</li>',
				'	<li><label>Planet Size:</label>',body.size,'</li>',
				'	<li><label>Location in Universe:</label>',body.x,'x : ',body.y,'y</li>',
				'	<li><label>Star:</label>',body.star_name,'</li>',
				'	<li><label>Orbit:</label>',body.orbit,'</li>',
				empire.alignment == "self" ? '	<li><button type="button">View</button></li>' : '',
				/*empire.alignment != "none" && empire.name ? '	<li><button id="sendSpy" type="button">Send Spy</button></li>' : '',
				empire.alignment == "none" && body.type == "habitable planet" ? '	<li><button id="sendColony" type="button">Send Colony Ship</button></li>' : '',
				empire.alignment == "none" && body.type == "asteroid" ? '	<li><button id="sendMining" type="button">Send Mining Ship</button></li>' : '',
				*/
				'</ul>'
			].join('');
			
			Dom.get("planetDetailsAnthracite").innerHTML = body.ore.anthracite;
			Dom.get("planetDetailsBauxite").innerHTML = body.ore.bauxite;
			Dom.get("planetDetailsBeryl").innerHTML = body.ore.beryl;
			Dom.get("planetDetailsChalcopyrite").innerHTML = body.ore.chalcopyrite;
			Dom.get("planetDetailsChromite").innerHTML = body.ore.chromite;
			Dom.get("planetDetailsFluorite").innerHTML = body.ore.fluorite;
			Dom.get("planetDetailsGalena").innerHTML = body.ore.galena;
			Dom.get("planetDetailsGoethite").innerHTML = body.ore.goethite;
			Dom.get("planetDetailsGold").innerHTML = body.ore.gold;
			Dom.get("planetDetailsGypsum").innerHTML = body.ore.gypsum;
			Dom.get("planetDetailsHalite").innerHTML = body.ore.halite;
			Dom.get("planetDetailsKerogen").innerHTML = body.ore.kerogen;
			Dom.get("planetDetailsMagnetite").innerHTML = body.ore.magnetite;
			Dom.get("planetDetailsMethane").innerHTML = body.ore.methane;
			Dom.get("planetDetailsMonazite").innerHTML = body.ore.monazite;
			Dom.get("planetDetailsRutile").innerHTML = body.ore.rutile;
			Dom.get("planetDetailsSulfur").innerHTML = body.ore.sulfur;
			Dom.get("planetDetailsTrona").innerHTML = body.ore.trona;
			Dom.get("planetDetailsUraninite").innerHTML = body.ore.uraninite;
			Dom.get("planetDetailsZircon").innerHTML = body.ore.zircon;
			
			if(empire.alignment == "self"){
				if(panel.renameTab) {
					panel.tabView.addTab(panel.renameTab, 1);
					delete panel.renameTab;
				}

				Dom.get("planetDetailNewName").value = "";
			}
			else {
				var tabs = panel.tabView.get("tabs");
				for(var nt=0; nt<tabs.length; nt++) {
					var tab = panel.tabView.getTab(nt);
					if(tab && tab.get("label") == this._renameLabel) {
						panel.renameTab = tab;
						panel.tabView.removeTab(tab);
						break;
					}
				}
			}
			
			this.GetShips(panel,{body_id:body.id});
			
			this.selectedBody = body;
			this.selectedTile = tile;
			panel.tabView.selectTab(0);
			panel.show();
		},
		
		Rename : function() {
			var newName = Dom.get("planetDetailNewName").value;
			Game.Services.Body.rename({
					session_id: Game.GetSession(""),
					body_id:this.selectedBody.id,
					name:newName
				},{
					success : function(o){
						YAHOO.log(o, "info", "MapStar.Rename.success");
						if(o.result && this.selectedBody) {
							Dom.get("planetDetailsName").innerHTML = newName;
							Game.EmpireData.planets[this.selectedBody.id].name = newName;
							Lacuna.Menu.update();
							this._map.tileCache[this.selectedTile.x][this.selectedTile.y].name = newName;
							this.selectedTile.refresh();
							
							this.selectedBody.name = newName;
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapStar.Rename.failure");
					},
					timeout:Game.Timeout,
					scope:this
				}
			);
		},
		DetailsClick : function(e, matchedEl, container){
			if(this.selectedBody) {
				if(matchedEl.innerHTML == "View") {
					var id = this.selectedBody.id;
					this.planetDetails.hide();
					this.fireEvent("onChangeToPlanetView", id);
				}
				else if(matchedEl.id == "sendSpy") {
					this.SendSpy(matchedEl, this.selectedBody.id);
				}
				else if(matchedEl.id == "sendColony") {
					this.SendColonyShip(matchedEl, this.selectedBody.id);
				}
				else if(matchedEl.id == "sendMining") {
					this.SendMiningShip(matchedEl, this.selectedBody.id);
				}
			}
		},
		SendProbe : function(data) {
			Lacuna.Pulser.Show();
			var send = Dom.get("sendProbe");
			send.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_probe({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_star:{star_id:data.id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapStar.SendProbe.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = send.parentNode;
					par.removeChild(send);
					par.innerHTML = "Arrives: " + Lib.formatServerDate(o.result.probe.date_arrives);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapStar.SendProbe.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = send.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(send);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SendSpy : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_spy_pod({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendSpy.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.spy_pod.date_arrives),"</div>",
						"<div>Carrying: ", o.result.spy_pod.carrying_spy.name, "</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendSpy.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SendColonyShip : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_colony_ship({
				session_id:Game.GetSession(),
				from_body_id:Game.GetCurrentPlanet().id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendColonyShip.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.colony_ship.date_arrives),"</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendColonyShip.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SendMiningShip : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_mining_platform_ship({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendMiningShip.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.mining_platform_ship.date_arrives),"</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendMiningShip.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}
	};
	Lang.augmentProto(MapStar, Util.EventProvider);
	
	Lacuna.MapStar = new MapStar();
})();
YAHOO.register("mapStar", YAHOO.lacuna.MapStar, {version: "1", build: "0"}); 

}
