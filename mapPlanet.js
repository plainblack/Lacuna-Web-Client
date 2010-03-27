YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapPlanet == "undefined" || !YAHOO.lacuna.MapPlanet) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var MapPlanet = function() {
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		this.createEvent("onBuildStart");
		this.createEvent("onBuildComplete");
		
		this._buildDetailsPanel();
		this._buildBuilderPanel();
		//this._buildStatusPanel();
		
		this.subscribe("onBuildStart", this.onBuildStartEvent);
		this.subscribe("onBuildComplete", this.onBuildCompleteEvent);
	};
	MapPlanet.prototype = {
		_buildDetailsPanel : function() {
			var panelId = "buildingDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g">',
				'		<div class="yui-u first">',
				'			<img id="buildingDetailsImg" src="" alt="" style="width:100px;height:100px;" />',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul>',
				'				<li id="buildingDetailsName"></li>',
				'				<li><label>Level: </label><span id="buildingDetailsLevel"></span></li>',
				'				<li id="buildingDetailsTimeLeft"></li>',
				'			</ul>',
				'		</div>',
				'	</div>',
				'	<div id="buildingDetailsExtra">',
				'	</div>',
				'	<div id="buildingDetailsProduction" class="yui-gb">',
				'		<div class="yui-u first">',
				'			<ul>',
				'				<li>Current Production</li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/food.png" /></span><span id="buildingDetailsFood"></span></li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/ore.png" /></span><span id="buildingDetailsOre"></span></li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/water.png" /></span><span id="buildingDetailsWater"></span></li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/energy.png" /></span><span id="buildingDetailsEnergy"></span></li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/waste.png" /></span><span id="buildingDetailsWaste"></span></li>',
				'				<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/happiness.png" /></span><span id="buildingDetailsHappiness"></span></li>',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeProduction">',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgradeCost">',
				'			</ul>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:true,
				close:true,
				width:"500px",
				underlay:false,
				zIndex:9995
			});
			
			this.buildingDetails.addQueue = function(seconds, queueFn, elm, sc) {
				this.queue = this.queue || [];
				if(this.queue.length == 0) {
					Game.onTick.subscribe(this.processQueue, this, true);
				}
				this.queue.push({secondsRemaining:seconds, el:elm, fn:queueFn, scope:sc});
			};
			this.buildingDetails.processQueue = function() {
				if(this.queue.length > 0) {
					var queue = this.queue,
						dt = new Date(),
						diff = (dt - this.recTime) / 1000,
						newq = [];
					this.recTime = dt;
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
			
			this.buildingDetails.renderEvent.subscribe(function(){
				this.img = Dom.get("buildingDetailsImg");
				this.upgradeUl = Dom.get("buildingDetailsUpgradeCost");
				this.upgradeProdUl = Dom.get("buildingDetailsUpgradeProduction");
				this.extraEl = Dom.get("buildingDetailsExtra");
				this.timeLeftLi = Dom.get("buildingDetailsTimeLeft");
				this.name = Dom.get("buildingDetailsName");
				this.level = Dom.get("buildingDetailsLevel");
				this.curEnergy = Dom.get("buildingDetailsEnergy");
				this.curFood = Dom.get("buildingDetailsFood");
				this.curHappiness = Dom.get("buildingDetailsHappiness");
				this.curOre = Dom.get("buildingDetailsOre");
				this.curWaste = Dom.get("buildingDetailsWaste");
				this.curWater = Dom.get("buildingDetailsWater");
			});
			this.buildingDetails.hideEvent.subscribe(function(){
				Game.onTick.unsubscribe(this.buildingDetails.processQueue);
				this.buildingDetails.interval = undefined;
				this.buildingDetails.queue = [];
				this.currentBuilding = undefined;
			}, this, true);
			this.buildingDetails.showEvent.subscribe(function() {
				this.buildingBuilder.hide();
				var panel = this.buildingDetails,
					results = this.currentBuilding,
					building = results.building;
				panel.name.innerHTML = building.name;
				panel.img.src = [Game.AssetUrl, "planet_side/", building.image, ".png"].join('');
				panel.level.innerHTML = building.level;
				panel.curEnergy.innerHTML = building.energy_hour;
				panel.curFood.innerHTML = building.food_hour;
				panel.curHappiness.innerHTML = building.happiness_hour;
				panel.curOre.innerHTML = building.ore_hour;
				panel.curWaste.innerHTML = building.waste_hour;
				panel.curWater.innerHTML = building.water_hour;
				
				if(building.pending_build) {
					panel.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + building.pending_build.seconds_remaining;
					if(building.pending_build.seconds_remaining > 0) {
						panel.addQueue(building.pending_build.seconds_remaining,
							function(remaining){
								var rf = Math.floor(remaining);
								if(rf <= 0) {
									this.buildingDetails.timeLeftLi.innerHTML = "";
									this.DetailsView({data:{id:building.id,url:building.url},x:building.x,y:building.y});
								}
								else {
									this.buildingDetails.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + rf;
								}
							},
							null,
							this
						);
					}
				}
				else {
					panel.timeLeftLi.innerHTML = "";
				}
				
				Event.purgeElement(panel.upgradeUl);
				Event.purgeElement(panel.upgradeProdUl);
				if(building.upgrade) {
					var up = building.upgrade;
					
					panel.upgradeUl.innerHTML = [
						'	<li>Upgrade Cost</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/food.png" /></span>',up.cost.food,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/ore.png" /></span>',up.cost.ore,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/water.png" /></span>',up.cost.water,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/energy.png" /></span>',up.cost.energy,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/waste.png" /></span>',up.cost.waste,'</li>',
						'	<li><span class="smallImg">T:</span>',up.cost.time,'</li>',
					].join('');

					if(up.can) {
						panel.upgradeProdUl.innerHTML = ['<li><ul><li>Upgrade Production</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/food.png" /></span>',up.production.food_hour,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/ore.png" /></span>',up.production.ore_hour,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/water.png" /></span>',up.production.water_hour,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/energy.png" /></span>',up.production.energy_hour,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/waste.png" /></span>',up.production.waste_hour,'</li>',
						'	<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/happiness.png" /></span>',up.production.happiness_hour,'</li>',
						'	</ul></li><li><button type="button">Upgrade</button></li>'].join('');
						
						Event.on(Sel.query("button", panel.upgradeProdUl, true), "click", function(e){
							this.Upgrade(this.currentBuilding.building);
						}, this, true);
					}
					else {
						panel.upgradeProdUl.innerHTML = ['<li style="color:red;">Unable to Upgrade:</li><li style="color:red;">',up.reason[1],'</li>'].join('');
					}
				}
				else {
					panel.upgradeUl.innerHTML = "";
				}
				
				panel.extraEl.innerHTML = "";
				
				if(results.planet) { //if it's the planetary command
					var planet = results.planet,
						output = [
							'<div class="yui-g">',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/food.png" /></span>',
							'				<span id="">',planet.food_stored, '</span>/', planet.food_capacity, ' : ', planet.food_hour,'/hr</li>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/ore.png" /></span>',
							'				<span id="">',planet.ore_stored, '</span>/', planet.ore_capacity, ' : ', planet.ore_hour,'/hr</li>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/water.png" /></span>',
							'				<span id="">',planet.water_stored, '</span>/', planet.water_capacity, ' : ', planet.water_hour,'/hr</li>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/energy.png" /></span>',
							'				<span id="">',planet.energy_stored, '</span>/', planet.energy_capacity, ' : ', planet.energy_hour,'/hr</li>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/waste.png" /></span>',
							'				<span id="">',planet.waste_stored, '</span>/', planet.waste_capacity, ' : ', planet.waste_hour,'/hr</li>',
							'			<li><span class="smallImg"><img src="',Game.AssetUrl,'ui/s/happiness.png" /></span>',
							'				<span id="">',planet.happiness, ' : ', planet.happiness_hour,'/hr</li>',
							'		</ul>',
							'	</div>',
							'	<div class="yui-u first">',
							'	</div>',
							'</div>'
						];
					panel.extraEl.innerHTML = output.join('');
					Dom.setStyle(panel.extraEl, "display", "");
				}
				else if(results.build_queue && results.build_queue.length > 0) { //if it's the development ministry
					var bq = results.build_queue,
						ul = document.createElement("ul"),
						li = document.createElement("li");
						
					panel.extraEl.innerHTML = ['<div><ul class="buildQueue clearafter"><li class="buildQueueName">Building</li><li class="buildQueueLevel">Level</li><li class="buildQueueTime">Time</li></ul>'];
						
					for(var i=0; i<bq.length; i++) {
						var bqo = bq[i],
							nUl = ul.cloneNode(false),
							nLi = li.cloneNode(false);
						Dom.addClass(nUl, "buildQueue");
						Dom.addClass(nUl, "clearafter");

						Dom.addClass(nLi,"buildQueueName");
						nLi.innerHTML = bqo.name;
						nUl.appendChild(nLi);
						nLi = li.cloneNode(false);

						Dom.addClass(nLi,"buildQueueLevel");
						nLi.innerHTML = bqo.to_level;
						nUl.appendChild(nLi);
						nLi = li.cloneNode(false);

						Dom.addClass(nLi,"buildQueueTime");
						nLi.innerHTML = bqo.seconds_remaining;
						nUl.appendChild(nLi);

						panel.extraEl.appendChild(nUl);
						
						panel.addQueue(bqo.seconds_remaining, function(remaining, el){
							if(remaining <= 0) {
								var ul = el.parentNode,
									c = ul.parentNode;
								c.removeChild(ul);
							}
							else {
								el.innerHTML = Math.floor(remaining);
							}
						}, nLi);
					}
					Dom.setStyle(panel.extraEl, "display", "");
				}
				/*else if(results.docked_ships) { //if it's the space port
					colony_ship
					gas_giant_settlement_platform_ship
					mining_platform_ship
					probe
					smuggler_ship
					space_station
					spy_pod
					terraforming_platform_ship
				}*/
				else if(results.party && results.party.can_throw) {
					Dom.setStyle(panel.extraEl, "display", "none");
				}
				else {
					Dom.setStyle(panel.extraEl, "display", "none");
				}
				
				panel.center();
			}, this, true);
			
			this.buildingDetails.render();
		},
		_buildBuilderPanel : function() {
			var panelId = "buildingBuilder";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Builder</div>',
				'<div class="bd" style="overflow:scroll;">',
				'	<label>Buildable</label>',
				'	<ul id="buildingBuilderList">',
				'	</ul>',
				'	<label id="buildingBuilderUnavailableToggle">Unavailable</label>',
				'	<ul id="buildingBuilderUnavailable">',
				'	</ul>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingBuilder = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:true,
				close:true,
				underlay:false,
				width:"600px",
				height:"500px",
				zIndex:9996
			});
			
			this.buildingBuilder.renderEvent.subscribe(function(){
				this.list = Dom.get("buildingBuilderList");
				this.unavailable = Dom.get("buildingBuilderUnavailable");
				Event.on("buildingBuilderUnavailableToggle","click",function(){
					Dom.setStyle(this, "display", (Dom.getStyle(this, "display") == "none" ? "" : "none"));
				}, this.unavailable, true);
			});
			
			this.buildingBuilder.showEvent.subscribe(function() {
				this.buildingDetails.hide();
				Dom.setStyle(this.buildingBuilder.unavailable, "display", "none");
			}, this, true);
			
			this.buildingBuilder.render();
		},
		/*_buildStatusPanel : function() {
			var panelId = "planetStatus";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Status</div>',
				'<div class="bd">',
				'	<ul class="planetStatusList">',
				'		<li><img src="',Game.AssetUrl,'ui/s/food.png" /><span id="planetStatusFood"></span></li>',
				'		<li><img src="',Game.AssetUrl,'ui/s/ore.png" /><span id="planetStatusOre"></span></li>',
				'		<li><img src="',Game.AssetUrl,'ui/s/water.png" /><span id="planetStatusWater"></span></li>',
				'		<li><img src="',Game.AssetUrl,'ui/s/energy.png" /><span id="planetStatusEnergy"></span></li>',
				'		<li><img src="',Game.AssetUrl,'ui/s/waste.png" /><span id="planetStatusWaste"></span></li>',
				'		<li><img src="',Game.AssetUrl,'ui/s/happiness.png" /><span id="planetStatusHappiness"></span></li>',
				'	</ul>',
				'	<ul id="planetStatusQueue">',
				'	</ul>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.planetStatus = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"300px",
				zIndex:900,
				context:["footer","tr","br", ["beforeShow", "windowResize"]]
			});
			
			this.planetStatus.renderEvent.subscribe(function(){
				this.food = Dom.get("planetStatusFood");
				this.ore = Dom.get("planetStatusOre");
				this.water = Dom.get("planetStatusWater");
				this.energy = Dom.get("planetStatusEnergy");
				this.waste = Dom.get("planetStatusWaste");
				this.happiness = Dom.get("planetStatusHappiness");
				this.queue = Dom.get("planetStatusQueue");
			});
			this.planetStatus.showEvent.subscribe(function(){
				var q = Game.queue[Game.QueueTypes.PLANET];
				this.queue.innerHTML = "";
				for(var id in q) {
					if(q.hasOwnProperty(id)) {
						var b = this.buildings[id];
						if(b && b.pending_build) {
							this.add(b);
						}
					}
				}
			});
			this.planetStatus.update = function(id, ms){
				var el = this.buildingQueueMap[id];
				if(el) {
					var sp = Sel.query('span',el,true);
					if(sp) {
						sp.innerHTML = Math.floor(ms/1000);
					}
				}
			};
			this.planetStatus.add = function(building) {
				var el = document.createElement("li");
				el.innerHTML = [building.name, 
					' [', 
					building.level+1, 
					']: <span>', 
					building.pending_build.seconds_remaining,
					'</span>'
				].join('');
				this.queue.appendChild(el);
				this.buildingQueueMap[building.id] = el;
			};
			this.planetStatus.remove = function(id) {
				var el = this.buildingQueueMap[id];
				if(el) {
					el.parentNode.removeChild(el);
				}
				delete this.buildingQueueMap[id];
			};
			
			this.planetStatus.render();
		},*/
		
		onBuildStartEvent : function(building) {
			if(building) {
				this.buildings[building.id] = building;
				//this.planetStatus.add(building);
				this._map.addSingleTileData(building);
				this._map.refresh();
			}
		},
		onBuildCompleteEvent : function(building) {
			if(building) {
				//this.planetStatus.remove(building.id);
				/*YAHOO.log(building, "info", "MapPlanet.onBuildCompleteEvent");
				this.ViewData(building.id, building.url, {
					success:function(oResult) {
						YAHOO.log(oResult, "info", "MapPlanet.onBuildCompleteEvent.ViewData.success");
						this.buildings[oResult.building.id] = oResult.building;
						this._map.addSingleTileData(oResult.building);
						this._map.refresh();
					},
					failure:function(oResult){ 
						this._map.addSingleTileData(building);
						this._map.refresh();
					}
				});*/
			}
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			if(this._elGrid) {
				this._isVisible = visible;
				Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
			}
			this.buildingDetails.hide();
			this.buildingBuilder.hide();
		},
		Mapper : function(oArgs) {
			YAHOO.log(oArgs.buildings, "debug", "Mapper");
			this.buildings = oArgs.buildings;
			if(!this._gridCreated) {
				var planetMap = document.createElement("div");
				planetMap.id = "planetMap";
				this._elGrid = document.getElementById("content").appendChild(planetMap);
				this.SetSize();
								
				var map = new Lacuna.Mapper.PlanetMap("planetMap");
				map.setZoomLevel(map.addTileData(oArgs.buildings));
				map.imgUrlLoc = Game.AssetUrl + 'ui/mapiator/';
				
				//draw what we got
				map.redraw();
				//move to command
				map.setCenterToCommand();
				
				this._map = map;
				this._gridCreated = true;
				
				Event.delegate(this._map.mapDiv, "dblclick", function(e, matchedEl, container) {
					var tile = this._map.tileLayer.findTileById(matchedEl.id);
					if(tile && tile.data) {
						this.DetailsView(tile);
					}
					else {
						this.BuilderView(tile);
					}
				}, "div.tile", this, true);
			}
			else {
				if(!this._elGrid.parentNode) {
					document.getElementById("content").appendChild(this._elGrid);
				}
				this._map.addTileData(oArgs.buildings);
				this._map.refresh();
			}
			
			this.MapVisible(true);
		},
		Load : function(planetId) {
			this.locationId = planetId;
			this.ReLoad();
		},
		ReLoad : function() {
			if(this.locationId) {
				var BodyServ = Game.Services.Body,
					data = {
						session_id: Cookie.getSub("lacuna","session") || "",
						body_id: this.locationId
					};
				
				BodyServ.get_buildings(data,{
					success : function(o){
						YAHOO.log(o, "info", "MapPlanet.ReLoad");
						this.fireEvent("onMapRpc", o.result);
						this.Mapper(o.result);
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapPlanet.ReLoad.FAILED");
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		ReLoadTile : function(id) {
			if(this._isVisible && id) {
				this.ReLoad();
				this.fireEvent("onBuildCompleteEvent", this.buildings[id]);
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
			if(this._map) {
				this._map.reset();
			}
		},
		
		ViewData : function(id, url, callback, x, y) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					building_id: id
				};
			
			BuildingServ.view(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.ViewData.success");
					this.fireEvent("onMapRpc", o.result);
					var newB = o.result.building,
						oldB = this.buildings[o.result.building.id];
					if(!oldB || newB.level != oldB.level) {
						this.buildings[newB.id] = newB;
						this._map.addSingleTileData(newB);
						this._map.refresh();
					}
					if(callback && callback.success) {
						callback.success.call(this, o.result, callback.url, x, y);
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.ViewData.failure");
					
					if(callback && callback.failure) {
						callback.failure.call(this, o.result, callback.url, x, y);
					}
					else {
						this.fireEvent("onMapRpcFailed", o);
					}
				},
				timeout:Game.Timeout,
				scope:this,
				target:url
			});
		},
		DetailsView : function(tile) {
			YAHOO.log(tile, "info", "DetailsView");
			this.ViewData(tile.data.id, tile.data.url, {
				success:this.DetailsProcess,
				url:tile.data.url
			}, tile.x, tile.y);
		},
		DetailsProcess : function(oResults, url, x, y) {
			var building = oResults.building,
				panel = this.buildingDetails;
				
			building.url = url;
			building.x = x;
			building.y = y;
			oResults.building = building;
			this.currentBuilding = oResults;
			
			panel.show();
		},
		
		BuilderView : function(tile) {
			YAHOO.log(tile, "info", "BuilderView");
			var BodyServ = Game.Services.Body,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					body_id: this.locationId,
					x:tile.x,
					y:tile.y
				};
			
			Event.purgeElement(this.buildingBuilder.list);
			this.buildingBuilder.list.innerHTML = "";
			Event.purgeElement(this.buildingBuilder.unavailable);
			this.buildingBuilder.unavailable.innerHTML = "";
			
			this.buildingBuilder.show();
			
			BodyServ.get_buildable(data,{
				success : function(o){
					YAHOO.log(o, "info", "GetBuildableSuccess");
					this.fireEvent("onMapRpc", o.result);
					
					this.BuilderProcess(o.result, data);
				},
				failure : function(o){
					YAHOO.log(o, "error", "GetBuildableFailed");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		BuilderProcess : function(oResults, request) {
			var b = oResults.buildable;
			if(b) {			
				var frag = document.createDocumentFragment(),
					unavailFrag = document.createDocumentFragment(),
					li = document.createElement("li");
				
				for(var name in b) {
					if(b.hasOwnProperty(name)) {
						var bd = b[name],
							nLi = li.cloneNode(false),
							costs = bd.build.cost,
							prod = bd.production;
							
						bd.name = name;
						
						if(bd.build.can) {
							nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
							'	<div class="yui-u first" style="width:20%">',
							'		<img src="',Game.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;" />',
							'	</div>',
							'	<div class="yui-u" style="width:65%">',
							'		<span style="font-weight:bold;">',name,'</span>: ',
							'		<span><label>Build Time:</label>',costs.time,'</span>',
							'		<div><label style="font-weight:bold;">Cost:</label>',
							'		<span><label>Energy:</label>',costs.energy,'</span>, ',
							'		<span><label>Food:</label>',costs.food,'</span>, ',
							'		<span><label>Ore:</label>',costs.ore,'</span>, ',
							'		<span><label>Waste:</label>',costs.waste,'</span>, ',
							'		<span><label>Water:</label>',costs.water,'</span></div>',
							'		<div><label style="font-weight:bold;">Production:</label>',
							'		<span><label>Happiness:</label>',prod.happiness_hour,'</span>, ',
							'		<span><label>Energy:</label>',prod.energy_hour,'</span>, ',
							'		<span><label>Food:</label>',prod.food_hour,'</span>, ',
							'		<span><label>Ore:</label>',prod.ore_hour,'</span>, ',
							'		<span><label>Waste:</label>',prod.waste_hour,'</span>, ',
							'		<span><label>Water:</label>',prod.water_hour,'</span></div>',
							'	</div>',
							'	<div class="yui-u" style="width:10%">',
							'		<button type="button">Build</button>',
							'	</div>',
							'</div>'].join('');
							Sel.query("button", nLi, true).building = bd;
							
							frag.appendChild(nLi);
						}
						else {
							nLi.innerHTML = ['<div class="yui-gf" style="margin-bottom:2px;">',
							'	<div class="yui-u first" style="width:20%;">',
							'		<img src="',Game.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;" />',
							'	</div>',
							'	<div class="yui-u" style="width:78%;">',
							'		<span style="font-weight:bold;">',name,'</span>: ',
							'		<span><label>Reason:</label>',bd.build.reason[1], ' - ', (Lang.isArray(bd.build.reason[2]) ? bd.build.reason[2].join('::Level') : 'Level:' + bd.build.reason[2]), '</span>',
							'		<div><label style="font-weight:bold;">Cost:</label>',
							'		<span><label>Energy:</label>',costs.energy,'</span>, ',
							'		<span><label>Food:</label>',costs.food,'</span>, ',
							'		<span><label>Ore:</label>',costs.ore,'</span>, ',
							'		<span><label>Waste:</label>',costs.waste,'</span>, ',
							'		<span><label>Water:</label>',costs.water,'</span></div>',
							'		<div><label style="font-weight:bold;">Production:</label>',
							'		<span><label>Happiness:</label>',prod.happiness_hour,'</span>, ',
							'		<span><label>Energy:</label>',prod.energy_hour,'</span>, ',
							'		<span><label>Food:</label>',prod.food_hour,'</span>, ',
							'		<span><label>Ore:</label>',prod.ore_hour,'</span>, ',
							'		<span><label>Waste:</label>',prod.waste_hour,'</span>, ',
							'		<span><label>Water:</label>',prod.water_hour,'</span></div>',
							'	</div>',
							'</div>'].join('');
							
							unavailFrag.appendChild(nLi);
						}
					}
				}
							
				Event.delegate(this.buildingBuilder.list, "click", function(e, matchedEl, container) {
					this.Build(matchedEl.building, request.x, request.y);
				}, "button", this, true);
				
				this.buildingBuilder.list.appendChild(frag);
				this.buildingBuilder.unavailable.appendChild(unavailFrag);
			}
		},
		
		Build : function(building, x, y) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					planet_id: this.locationId,
					x:x,
					y:y
				};
			
			BuildingServ.build(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.Build.success");
					this.fireEvent("onMapRpc", o.result);
					this.buildingBuilder.hide();

					var b = building; //originally passed in building data from BuildProcess
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					b.x = x;
					b.y = y;
					this.RemoveCost(b.build.cost);
					this.QueueReload(b);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.Build.failure");
					this.fireEvent("onMapRpcFailed", o);
					this.buildingBuilder.hide();
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		Upgrade : function(building) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					building_id: building.id
				};
			
			BuildingServ.upgrade(data,{
				success : function(o){
					YAHOO.log(o, "info", "UpgradeSuccess");
					this.fireEvent("onMapRpc", o.result);
					this.buildingDetails.hide();
					
					var b = building; //originally passed in building data from BuildProcess
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					this.RemoveCost(b.upgrade.cost);
					this.QueueReload(b);
				},
				failure : function(o){
					YAHOO.log(o, "error", "UpgradeFailed");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		RemoveCost : function(cost) {
			var planet = Game.EmpireData.planets[this.locationId];
			if(planet) {
				planet.energy_stored -= cost.energy*1;
				if(planet.energy_stored > planet.energy_capacity) {
					planet.energy_stored = planet.energy_capacity;
				}
				planet.food_stored -= cost.food*1;
				if(planet.food_stored > planet.food_capacity) {
					planet.food_stored = planet.food_capacity;
				}
				planet.ore_stored -= cost.ore*1;
				if(planet.ore_stored > planet.ore_capacity) {
					planet.ore_stored = planet.ore_capacity;
				}
				planet.waste_stored += cost.waste*1;
				if(planet.waste_stored > planet.waste_capacity) {
					planet.waste_stored = planet.waste_capacity;
				}
				planet.water_stored -= cost.water*1;
				if(planet.water_stored > planet.water_capacity) {
					planet.water_stored = planet.water_capacity;
				}
				Lacuna.Menu.updateTick();
			}
		},
		QueueReload : function(building) {
			if(building.pending_build) {
				this.fireEvent("onBuildStart", building);
				var ms = (building.pending_build.seconds_remaining * 1000);
				Game.QueueAdd(building.id, Game.QueueTypes.PLANET, ms);
			}
		},
		QueueTick : function(id, ms) {
			if(this.buildings) {
				var building = this.buildings[id];
				if(building) {
					if(building.pending_build) {
						building.pending_build.seconds_remaining = (ms / 1000);
					}
					else {
						building.pending_build = {seconds_remaining : (ms / 1000)};
					}
					this._map.refreshTileCounter(building);
				}
			}
		}
	};
	Lang.augmentProto(MapPlanet, Util.EventProvider);
	
	Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"}); 

}