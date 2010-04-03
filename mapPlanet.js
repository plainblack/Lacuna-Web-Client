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
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var MapPlanet = function() {
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		
		this._buildDetailsPanel();
		this._buildBuilderPanel();
	};
	MapPlanet.prototype = {
		_buildDetailsPanel : function() {
			var panelId = "buildingDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g" style="padding-bottom:5px;">',
				'		<div class="yui-u first">',
				'			<img id="buildingDetailsImg" src="" alt="" style="width:100px;height:100px;" />',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul>',
				'				<li id="buildingDetailsName"></li>',
				'				<li id="buildingDetailsTimeLeft"></li>',
				'			</ul>',
				'		</div>',
				'	</div>',
				'	<div id="buildingDetailTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'			<li><a href="#detailsExtra"><em>Main</em></a></li>',
				'			<li><a href="#detailsProduction"><em>Production</em></a></li>',
				'			<li><a href="#detailsStorage"><em>Storage</em></a></li>',
				'		</ul>',
				'		<div class="yui-content">',
				'			<div id="detailsExtra"><div id="buildingDetailsExtra"></div></div>',
				'			<div id="detailsProduction">',
				'				<div id="buildingDetailsProduction" class="yui-gb">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li>Current Production</li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span id="buildingDetailsFood" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span id="buildingDetailsOre" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span id="buildingDetailsWater" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span id="buildingDetailsEnergy" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span id="buildingDetailsWaste" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span><span id="buildingDetailsHappiness" class="buildingDetailsNum"></span></li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul id="buildingDetailsUpgradeProduction">',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul id="buildingDetailsUpgradeCost">',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
				'			<div id="detailsStorage">',
				'				<div class="yui-g">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li>Current Storage</li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span id="buildingDetailsFoodStorage" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span id="buildingDetailsOreStorage" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span id="buildingDetailsWaterStorage" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span id="buildingDetailsEnergyStorage" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span id="buildingDetailsWasteStorage" class="buildingDetailsNum"></span></li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul id="buildingDetailsUpgradeStorage">',
				'							<li>Current Storage</li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span id="buildingDetailsFoodStorageUpgrade" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span id="buildingDetailsOreStorageUpgrade" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span id="buildingDetailsWaterStorageUpgrade" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span id="buildingDetailsEnergyStorageUpgrade" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span id="buildingDetailsWasteStorageUpgrade" class="buildingDetailsNum"></span></li>',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				width:"600px",
				underlay:false,
				zIndex:9995,
				context:["header","tl","bl"]
			});
			
			this.buildingDetails.addQueue = function(seconds, queueFn, elm, sc) {
				this.queue = this.queue || [];
				if(this.queue.length == 0) {
					Game.onTick.subscribe(this.processQueue, this, true);
				}
				this.queue.push({secondsRemaining:seconds, el:elm, fn:queueFn, scope:sc});
			};
			this.buildingDetails.processQueue = function(e, oArgs) {
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
			
			this.buildingDetails.renderEvent.subscribe(function(){
				this.img = Dom.get("buildingDetailsImg");
				this.name = Dom.get("buildingDetailsName");
				
				this.tabView = new YAHOO.widget.TabView("buildingDetailTabs");
				this.tabView.set('activeIndex',0);
				
				this.upgradeUl = Dom.get("buildingDetailsUpgradeCost");
				this.upgradeProdUl = Dom.get("buildingDetailsUpgradeProduction");
				this.extraEl = Dom.get("buildingDetailsExtra");
				this.timeLeftLi = Dom.get("buildingDetailsTimeLeft");
				this.curEnergy = Dom.get("buildingDetailsEnergy");
				this.curFood = Dom.get("buildingDetailsFood");
				this.curHappiness = Dom.get("buildingDetailsHappiness");
				this.curOre = Dom.get("buildingDetailsOre");
				this.curWaste = Dom.get("buildingDetailsWaste");
				this.curWater = Dom.get("buildingDetailsWater");
				
				this.storage = {
					curFood : Dom.get("buildingDetailsFoodStorage"),
					curOre : Dom.get("buildingDetailsOreStorage"),
					curWater : Dom.get("buildingDetailsWaterStorage"),
					curEnergy : Dom.get("buildingDetailsEnergyStorage"),
					curWaste : Dom.get("buildingDetailsWasteStorage"),
					newFood : Dom.get("buildingDetailsFoodStorageUpgrade"),
					newOre : Dom.get("buildingDetailsOreStorageUpgrade"),
					newWater : Dom.get("buildingDetailsWaterStorageUpgrade"),
					newEnergy : Dom.get("buildingDetailsEnergyStorageUpgrade"),
					newWaste : Dom.get("buildingDetailsWasteStorageUpgrade"),
				}
			});
			this.buildingDetails.hideEvent.subscribe(function(){
				Game.onTick.unsubscribe(this.buildingDetails.processQueue);
				this.buildingDetails.interval = undefined;
				this.buildingDetails.queue = [];
				this.currentBuilding = undefined;
			}, this, true);
			
			this.buildingDetails.render();
			Game.OverlayManager.register(this.buildingDetails);
		},
		_buildBuilderPanel : function() {
			var panelId = "buildingBuilder";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Builder</div>',
				'<div class="bd">',
				'	<div id="builderTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'			<li><a href="#builderBuildable"><em>Buildable</em></a></li>',
				'			<li><a href="#builderUnavailable"><em>Unavailable</em></a></li>',
				'		</ul>',
				'		<div class="yui-content" style="overflow:auto;height:450px;">',
				'			<div id="builderBuildable"><ul id="buildingBuilderList"></ul></div>',
				'			<div id="builderUnavailable"><ul id="buildingBuilderUnavailable"></ul></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingBuilder = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"600px",
				zIndex:9996,
				context:["header","tr","br"]
			});
			
			this.buildingBuilder.renderEvent.subscribe(function(){
				this.tabView = new YAHOO.widget.TabView('builderTabs');
				this.list = Dom.get("buildingBuilderList");
				this.unavailable = Dom.get("buildingBuilderUnavailable");
			});
			
			this.buildingBuilder.showEvent.subscribe(function() {
				this.tabView.set('activeIndex', 0);
			});
			
			this.buildingBuilder.render();
			Game.OverlayManager.register(this.buildingBuilder);
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			if(this._elGrid) {
				this._isVisible = visible;
				Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
			}
			if(visible) {
				Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+Lib.AssetUrl+'planet_side/ground.png") repeat scroll 0 0 black');
			}
			else {
				this.buildingDetails.hide();
				this.buildingBuilder.hide();
			}
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
				map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
				
				//draw what we got
				map.redraw();
				//move to command
				map.setCenterToCommand();
				
				this._map = map;
				this._gridCreated = true;
				
				Event.delegate(this._map.mapDiv, "mouseup", function(e, matchedEl, container) {
					if(!this._map.controller.isDragging()) {
						var tile = this._map.tileLayer.findTileById(matchedEl.parentNode.id);
						if(tile && tile.data) {
							this.DetailsView(tile);
						}
						else {
							this.BuilderView(tile);
						}
					}
				}, "div.planetMapTileActionContainer", this, true); //"button.planetMapTileActionButton"
				Event.delegate(this._map.mapDiv, "mouseenter", function(e, matchedEl, container) {
					var c = Sel.query("div.planetMapTileActionContainer", matchedEl, true);
					Dom.setStyle(c, "visibility", "visible");
				}, "div.tile", this, true); 
				Event.delegate(this._map.mapDiv, "mouseleave", function(e, matchedEl, container) {
					var c = Sel.query("div.planetMapTileActionContainer", matchedEl, true);
					Dom.setStyle(c, "visibility", "hidden");
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
						session_id: Game.GetSession(""),
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
				var building = this.buildings[id];
				if(building) {
					YAHOO.log(building, "info", "MapPlanet.ReLoadTile");
					
					this.ViewData(id, building.url, {
						url:building.url
					}, building.x, building.y);
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
			if(this._map) {
				this._map.reset();
			}
		},
		
		ViewData : function(id, url, callback, x, y) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Game.GetSession(""),
					building_id: id
				};
			
			BuildingServ.view(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.ViewData.success");
					this.fireEvent("onMapRpc", o.result);
					var newB = o.result.building;
					newB.url = callback.url;
					newB.x = x;
					newB.y = y;
					newB.updated = (newB.level != this.buildings[newB.id].level);
					this.buildings[newB.id] = newB;
					this._map.refreshTile(newB);

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
			
			var panel = this.buildingDetails;
			Game.OverlayManager.hideAll();
			panel.hide(); //hide panel which removes existing info	
			//clear values
			panel.name.innerHTML = "Loading";
			panel.img.src = [Lib.AssetUrl, "planet_side/ground.png"].join('');
			panel.curEnergy.innerHTML = "";
			panel.curFood.innerHTML = "";
			panel.curHappiness.innerHTML = "";
			panel.curOre.innerHTML = "";
			panel.curWaste.innerHTML = "";
			panel.curWater.innerHTML = "";
			Event.purgeElement(panel.upgradeUl);
			panel.upgradeUl.innerHTML = "";
			Event.purgeElement(panel.upgradeProdUl);
			panel.upgradeProdUl.innerHTML = "";
			panel.extraEl.innerHTML = "";
			
			this.buildingDetails.show(); //show before we get data so it looks like we're doing something
			
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
					
			this.currentBuilding = oResults; //assign new building			

			panel.name.innerHTML = [building.name, ' ', building.level].join('');
			panel.img.src = [Lib.AssetUrl, "planet_side/", building.image, ".png"].join('');
			panel.curEnergy.innerHTML = building.energy_hour;
			panel.curFood.innerHTML = building.food_hour;
			panel.curHappiness.innerHTML = building.happiness_hour;
			panel.curOre.innerHTML = building.ore_hour;
			panel.curWaste.innerHTML = building.waste_hour;
			panel.curWater.innerHTML = building.water_hour;
			
			panel.storage.curFood.innerHTML = building.food_capacity;
			panel.storage.curOre.innerHTML = building.ore_capacity;
			panel.storage.curWater.innerHTML = building.water_capacity;
			panel.storage.curEnergy.innerHTML = building.energy_capacity;
			panel.storage.curWaste.innerHTML = building.waste_capacity;
			var p = building.upgrade.production || {};
			panel.storage.newFood.innerHTML = p.food_capacity || 0;
			panel.storage.newOre.innerHTML = p.ore_capacity || 0;
			panel.storage.newWater.innerHTML = p.water_capacity || 0;
			panel.storage.newEnergy.innerHTML = p.energy_capacity || 0;
			panel.storage.newWaste.innerHTML = p.waste_capacity || 0;
			
			if(building.pending_build) {
				panel.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(building.pending_build.seconds_remaining);
				if(building.pending_build.seconds_remaining > 0) {
					panel.addQueue(building.pending_build.seconds_remaining,
						function(remaining){
							var rf = Math.round(remaining);
							if(rf <= 0) {
								this.buildingDetails.timeLeftLi.innerHTML = "";
								YAHOO.log("Complete","info","buildingDetails.showEvent.BuildTimeRemaining");
								this.DetailsView({data:{id:building.id,url:building.url},x:building.x,y:building.y});
							}
							else {
								this.buildingDetails.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(rf);
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
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span class="buildingDetailsNum">',up.cost.food,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span class="buildingDetailsNum">',up.cost.ore,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span class="buildingDetailsNum">',up.cost.water,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span class="buildingDetailsNum">',up.cost.energy,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span class="buildingDetailsNum">',up.cost.waste,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" /></span><span class="buildingDetailsNum">',Lib.formatTime(up.cost.time),'</span></li>',
				].join('');


				panel.upgradeProdUl.innerHTML = ['<li><ul><li>Upgrade Production</li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span class="buildingDetailsNum">',up.production.food_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span class="buildingDetailsNum">',up.production.ore_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span class="buildingDetailsNum">',up.production.water_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span class="buildingDetailsNum">',up.production.energy_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span class="buildingDetailsNum">',up.production.waste_hour,'</span></li>',
					'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span><span class="buildingDetailsNum">',up.production.happiness_hour,'</span></li>',
					'	</ul></li>',
					up.can ? '<li><button type="button">Upgrade</button></li>' : '<li style="color:red;">Unable to Upgrade:</li><li style="color:red;">',up.reason[1],'</li>'
					].join('');
				
				if(up.can) {
					Event.on(Sel.query("button", panel.upgradeProdUl, true), "click", function(e){
						this.Upgrade();
					}, this, true);
				}
			}
			else {
				panel.upgradeUl.innerHTML = "";
			}
			
			panel.extraEl.innerHTML = "";
			
			if(oResults.planet || (oResults.build_queue && oResults.build_queue.length > 0) || oResults.food_stored || oResults.ore_stored) {
				if(panel.extraTab) {
					panel.tabView.addTab(panel.extraTab, 0);
					panel.extraTab = undefined;
				}

				if(oResults.planet) { //if it's the planetary command
					var planet = oResults.planet,
						output = [
							'<div class="yui-g">',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" /></span>',
							'				<span class="pcStored">',planet.food_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.food_capacity, '</span> @ <span class="pcPerHour">', planet.food_hour,'</span>/hr</li>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span>',
							'				<span class="pcStored">',planet.ore_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.ore_capacity, '</span> @ <span class="pcPerHour">', planet.ore_hour,'</span>/hr</li>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" /></span>',
							'				<span class="pcStored">',planet.water_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.water_capacity, '</span> @ <span class="pcPerHour">', planet.water_hour,'</span>/hr</li>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span>',
							'				<span class="pcStored">',planet.energy_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.energy_capacity, '</span> @ <span class="pcPerHour">', planet.energy_hour,'</span>/hr</li>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span>',
							'				<span class="pcStored">',planet.waste_stored, '</span><span class="pcSlash">/</span><span class="pcCapacity">', planet.waste_capacity, '</span> @ <span class="pcPerHour">', planet.waste_hour,'</span>/hr</li>',
							'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span>',
							'				<span class="pcStored">',planet.happiness, '</span><span class="pcSlash">&nbsp;</span><span class="pcCapacity">&nbsp;</span> @ <span class="pcPerHour">', planet.happiness_hour,'</span>/hr</li>',
							'		</ul>',
							'	</div>',
							'	<div class="yui-u first">',
							'		<ul class="buildingDetailsPC">',
							'			<li><label>Buildings:</label>',planet.building_count,'</li>',
							'			<li><label>Planet Size:</label>',planet.size,'</li>',
							'			<li><label>Plots Available:</label>',(planet.size*1) - (planet.building_count*1),'</li>',
							'			<li><label>Location in Universe:</label>',planet.x,'x : ',planet.y,'y : ',planet.z,'z</li>',
							'			<li><label>Star:</label>',planet.star_name,'</li>',
							'			<li><label>Orbit:</label>',planet.orbit,'</li>',
							'		</ul>',
							'	</div>',
							'</div>'
						];
					panel.extraEl.innerHTML = output.join('');
				}
				else if(oResults.build_queue && oResults.build_queue.length > 0) { //if it's the development ministry
					var bq = oResults.build_queue,
						ul = document.createElement("ul"),
						li = document.createElement("li");
						
					panel.extraEl.innerHTML = ['<div><ul class="buildQueue buildQueueHeader clearafter"><li class="buildQueueName">Building</li><li class="buildQueueLevel">Level</li><li class="buildQueueTime">Time</li></ul>'];
						
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
						nLi.innerHTML = Lib.formatTime(bqo.seconds_remaining);
						nUl.appendChild(nLi);

						panel.extraEl.appendChild(nUl);
						
						panel.addQueue(bqo.seconds_remaining, function(remaining, el){
							if(remaining <= 0) {
								var ul = el.parentNode,
									c = ul.parentNode;
								c.removeChild(ul);
							}
							else {
								el.innerHTML = Lib.formatTime(Math.round(remaining));
							}
						}, nLi);
					}
				}
				/*else if(oResults.docked_ships) { //if it's the space port
					colony_ship
					gas_giant_settlement_platform_ship
					mining_platform_ship
					probe
					smuggler_ship
					space_station
					spy_pod
					terraforming_platform_ship
				}
				else if(oResults.party && oResults.party.can_throw) {
					Dom.setStyle(panel.extraEl, "display", "none");
				}*/
				else if(oResults.food_stored) {
					var stored = oResults.food_stored,
						output = [
							'<div class="yui-g">',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><label>Algae</label><span class="buildingDetailsNum">',stored.algae,'</span></li>',
							'			<li><label>Apple</label><span class="buildingDetailsNum">',stored.apple,'</span></li>',
							'			<li><label>Beetle</label><span class="buildingDetailsNum">',stored.beetle,'</span></li>',
							'			<li><label>Bread</label><span class="buildingDetailsNum">',stored.bread,'</span></li>',
							'			<li><label>Burger</label><span class="buildingDetailsNum">',stored.burger,'</span></li>',
							'			<li><label>Chip</label><span class="buildingDetailsNum">',stored.chip,'</span></li>',
							'			<li><label>Cider</label><span class="buildingDetailsNum">',stored.cider,'</span></li>',
							'			<li><label>Corn</label><span class="buildingDetailsNum">',stored.corn,'</span></li>',
							'			<li><label>Fungus</label><span class="buildingDetailsNum">',stored.fungus,'</span></li>',
							'			<li><label>Lapis</label><span class="buildingDetailsNum">',stored.lapis,'</span></li>',
							'		</ul>',
							'	</div>',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><label>Meal</label><span class="buildingDetailsNum">',stored.meal,'</span></li>',
							'			<li><label>Milk</label><span class="buildingDetailsNum">',stored.milk,'</span></li>',
							'			<li><label>Pancake</label><span class="buildingDetailsNum">',stored.pancake,'</span></li>',
							'			<li><label>Pie</label><span class="buildingDetailsNum">',stored.pie,'</span></li>',
							'			<li><label>Potato</label><span class="buildingDetailsNum">',stored.potato,'</span></li>',
							'			<li><label>Root</label><span class="buildingDetailsNum">',stored.root,'</span></li>',
							'			<li><label>Shake</label><span class="buildingDetailsNum">',stored.shake,'</span></li>',
							'			<li><label>Soup</label><span class="buildingDetailsNum">',stored.soup,'</span></li>',
							'			<li><label>Syrup</label><span class="buildingDetailsNum">',stored.syrup,'</span></li>',
							'			<li><label>Wheat</label><span class="buildingDetailsNum">',stored.wheat,'</span></li>',
							'		</ul>',
							'	</div>',
							'</div>'
						];
					panel.extraEl.innerHTML = output.join('');
				}
				else if(oResults.ore_stored) {
					var stored = oResults.ore_stored,
						output = [
							'<div class="yui-g">',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><label>Anthracite</label><span class="buildingDetailsNum">',stored.anthracite,'</span></li>',
							'			<li><label>Bauxite</label><span class="buildingDetailsNum">',stored.bauxite,'</span></li>',
							'			<li><label>Beryl</label><span class="buildingDetailsNum">',stored.beryl,'</span></li>',
							'			<li><label>Chalcopyrite</label><span class="buildingDetailsNum">',stored.chalcopyrite,'</span></li>',
							'			<li><label>Chromite</label><span class="buildingDetailsNum">',stored.chromite,'</span></li>',
							'			<li><label>Fluorite</label><span class="buildingDetailsNum">',stored.fluorite,'</span></li>',
							'			<li><label>Galena</label><span class="buildingDetailsNum">',stored.galena,'</span></li>',
							'			<li><label>Goethite</label><span class="buildingDetailsNum">',stored.goethite,'</span></li>',
							'			<li><label>Gold</label><span class="buildingDetailsNum">',stored.gold,'</span></li>',
							'			<li><label>Gypsum</label><span class="buildingDetailsNum">',stored.gypsum,'</span></li>',
							'		</ul>',
							'	</div>',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><label>Halite</label><span class="buildingDetailsNum">',stored.halite,'</span></li>',
							'			<li><label>Kerogen</label><span class="buildingDetailsNum">',stored.kerogen,'</span></li>',
							'			<li><label>Magnetite</label><span class="buildingDetailsNum">',stored.magnetite,'</span></li>',
							'			<li><label>Methane</label><span class="buildingDetailsNum">',stored.methane,'</span></li>',
							'			<li><label>Monazite</label><span class="buildingDetailsNum">',stored.monazite,'</span></li>',
							'			<li><label>Rutile</label><span class="buildingDetailsNum">',stored.rutile,'</span></li>',
							'			<li><label>Sulfur</label><span class="buildingDetailsNum">',stored.sulfur,'</span></li>',
							'			<li><label>Trona</label><span class="buildingDetailsNum">',stored.trona,'</span></li>',
							'			<li><label>Uraninite</label><span class="buildingDetailsNum">',stored.uraninite,'</span></li>',
							'			<li><label>Zircon</label><span class="buildingDetailsNum">',stored.zircon,'</span></li>',
							'		</ul>',
							'	</div>',
							'</div>'
						];
					panel.extraEl.innerHTML = output.join('');
				}
			}	
			else if(panel.tabView.get("tabs").length == 3){
				panel.extraTab = panel.tabView.getTab(0);
				panel.tabView.removeTab(panel.extraTab);
			}
			panel.tabView.selectTab(0);

		},
		
		BuilderView : function(tile) {
			YAHOO.log(tile, "info", "BuilderView");
			var BodyServ = Game.Services.Body,
				data = {
					session_id: Game.GetSession(""),
					body_id: this.locationId,
					x:tile.x,
					y:tile.y
				};
			
			Event.purgeElement(this.buildingBuilder.list);
			this.buildingBuilder.list.innerHTML = "";
			Event.purgeElement(this.buildingBuilder.unavailable);
			this.buildingBuilder.unavailable.innerHTML = "";
			
			Game.OverlayManager.hideAll();
			this.buildingBuilder.show();
			
			BodyServ.get_buildable(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.BuilderView.success");
					this.fireEvent("onMapRpc", o.result);
					
					this.BuilderProcess(o.result, data);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.BuilderView.failure");
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
					li = document.createElement("li"),
					names = [],
					reason, br;
				
				for(var name in b) {
					if(b.hasOwnProperty(name)) {
						names.push(name);
					}
				}
				names.sort();
				
				for(var i=0; i<names.length; i++) {
					var bd = b[names[i]],
						nLi = li.cloneNode(false),
						costs = bd.build.cost,
						prod = bd.production;
						
					bd.name = names[i];
					
					if(bd.build.can) {
						nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
						'	<div class="yui-u first" style="width:20%">',
						'		<img src="',Lib.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;" />',
						'	</div>',
						'	<div class="yui-u" style="width:65%">',
						'		<span style="font-weight:bold;">',bd.name,'</span>: ',
						'		<div><label style="font-weight:bold;">Cost:</label>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span>',costs.food,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span>',costs.ore,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span>',costs.water,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span>',costs.energy,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span>',costs.waste,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/time.png" /></span>',Lib.formatTime(costs.time),'</span>',
						/*'			<span><label>Energy:</label>',costs.energy,'</span>, ',
						'			<span><label>Food:</label>',costs.food,'</span>, ',
						'			<span><label>Ore:</label>',costs.ore,'</span>, ',
						'			<span><label>Waste:</label>',costs.waste,'</span>, ',
						'			<span><label>Water:</label>',costs.water,'</span>',*/
						'		</div>',
						'		<div><label style="font-weight:bold;">Prod:</label>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span>',prod.food_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span>',prod.ore_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span>',prod.water_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span>',prod.energy_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span>',prod.waste_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span><span>',prod.happiness_hour,'</span></span>',
						/*'			<span><label>Happiness:</label>',prod.happiness_hour,'</span>, ',
						'			<span><label>Energy:</label>',prod.energy_hour,'</span>, ',
						'			<span><label>Food:</label>',prod.food_hour,'</span>, ',
						'			<span><label>Ore:</label>',prod.ore_hour,'</span>, ',
						'			<span><label>Waste:</label>',prod.waste_hour,'</span>, ',
						'			<span><label>Water:</label>',prod.water_hour,'</span>',*/
						'		</div>',
						'	</div>',
						'	<div class="yui-u" style="width:10%">',
						'		<button type="button">Build</button>',
						'	</div>',
						'</div>'].join('');
						Sel.query("button", nLi, true).building = bd;
						
						frag.appendChild(nLi);
					}
					else {
						br = bd.build.reason;
						switch(br[0]) {
							case 1011:
								reason = [br[1], ' Requires more ', (Lang.isArray(br[2]) ? br[2].join(', ') : br[2])].join('');
								break;
							case 1012:
								if(br[2]) {
									reason = [br[1], ' Requires higher production of ', (Lang.isArray(br[2]) ? br[2].join(', ') : br[2])].join('');
								}
								else {
									reason = br[1];
								}
								break;
							case 1013:
								if(br.length == 2) {
									reason = br[1];
								}
								else if(Lang.isArray(br[2])){
									reason = [br[1], ' Requires ', br[2].join(' level ')].join('');
								}
								else {
									reason = [br[1], ' Requires level ', br[2]].join('');
								}
								break;
							default:
								reason = "";
								break;
						}
						nLi.innerHTML = ['<div class="yui-gf" style="margin-bottom:2px;">',
						'	<div class="yui-u first" style="width:20%;">',
						'		<img src="',Lib.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;" />',
						'	</div>',
						'	<div class="yui-u" style="width:78%;">',
						'		<span style="font-weight:bold;">',bd.name,'</span>: ',
						'		<span>',reason,'</span>',
						'		<div><label style="font-weight:bold;">Cost:</label>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span>',costs.food,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span>',costs.ore,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span>',costs.water,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span>',costs.energy,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span>',costs.waste,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/time.png" /></span>',Lib.formatTime(costs.time),'</span>',
						'		</div>',
						'		<div><label style="font-weight:bold;">Prod:</label>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" /></span><span>',prod.food_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" /></span><span>',prod.ore_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" /></span><span>',prod.water_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" /></span><span>',prod.energy_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" /></span><span>',prod.waste_hour,'</span></span>',
						'			<span><span><img src="',Lib.AssetUrl,'ui/s/happiness.png" /></span><span>',prod.happiness_hour,'</span></span>',
						'		</div>',
						'	</div>',
						'</div>'].join('');
						
						unavailFrag.appendChild(nLi);
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
					session_id: Game.GetSession(""),
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
					YAHOO.log(b, "info", "MapPlanet.Build.success.building");
					this.UpdateCost(b.build.cost);
					
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
		Upgrade : function() {
			var building = this.currentBuilding.building,
				BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Game.GetSession(""),
					building_id: building.id
				};
			
			BuildingServ.upgrade(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.Upgrade.success");
					this.fireEvent("onMapRpc", o.result);
					this.buildingDetails.hide();
					
					var b = building; //originally passed in building data from currentBuilding
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					YAHOO.log(b, "info", "MapPlanet.Upgrade.success.building");
					this.UpdateCost(b.upgrade.cost);
					
					this.QueueReload(b);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.Upgrade.failure");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		UpdateCost : function(cost) {
			var planet = Game.EmpireData.planets[this.locationId];
			if(planet && cost) {
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
				planet.water_stored -= cost.water*1;
				if(planet.water_stored > planet.water_capacity) {
					planet.water_stored = planet.water_capacity;
				}
				
				/*planet.waste_stored += cost.waste*1;
				if(planet.waste_stored > planet.waste_capacity) {
					planet.waste_stored = planet.waste_capacity;
				}*/
				
				var wasteOverage = 0;
				if(planet.waste_stored < planet.waste_capacity){
					planet.waste_stored += cost.waste*1;
					if(planet.waste_stored > planet.waste_capacity) {
						wasteOverage = planet.waste_stored - planet.waste_capacity;
						planet.waste_stored = planet.waste_capacity;
					}
				}
				else {
					wasteOverage = cost.waste*1;
				}
				
				planet.happiness -= wasteOverage;
				if(planet.happiness < 0) {
					planet.happiness = 0;
				}
				Game.EmpireData.happiness -= wasteOverage;
				if(Game.EmpireData.happiness < 0) {
					Game.EmpireData.happiness = 0;
				}
			
				Lacuna.Menu.updateTick();
			}
		},
		QueueReload : function(building) {
			if(building.pending_build) {
				this.buildings[building.id] = building;
				this._map.addSingleTileData(building);
				this._map.refresh();
				
				var ms = (building.pending_build.seconds_remaining * 1000);
				Game.QueueAdd(building.id, Lib.QueueTypes.PLANET, ms);
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