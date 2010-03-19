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
				'	<div class="yui-g">',
				'		<div class="yui-u first">',
				'			<ul>',
				'				<li>Current Production</li>',
				'				<li><label>Energy: </label><span id="buildingDetailsEnergy"></span></li>',
				'				<li><label>Food: </label><span id="buildingDetailsFood"></span></li>',
				'				<li><label>Happiness: </label><span id="buildingDetailsHappiness"></span></li>',
				'				<li><label>Ore: </label><span id="buildingDetailsOre"></span></li>',
				'				<li><label>Waste: </label><span id="buildingDetailsWaste"></span></li>',
				'				<li><label>Water: </label><span id="buildingDetailsWater"></span></li>',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul id="buildingDetailsUpgrade">',
				'			</ul>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			
			this.buildingDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:true,
				close:true,
				width:"500px",
				zIndex:9995
			});
			
			this.buildingDetails.renderEvent.subscribe(function(){
				this.img = Dom.get("buildingDetailsImg");
				this.upgradeUl = Dom.get("buildingDetailsUpgrade");
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
				this.currentBuilding = undefined;
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
				'	<label>Unavailable</label>',
				'	<ul id="buildingBuilderUnavailable">',
				'	</ul>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			
			this.buildingBuilder = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:true,
				close:true,
				width:"600px",
				height:"500px",
				zIndex:9995
			});
			
			this.buildingBuilder.renderEvent.subscribe(function(){
				this.list = Dom.get("buildingBuilderList");
				this.unavailable = Dom.get("buildingBuilderUnavailable");
			});
			
			this.buildingBuilder.render();
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			if(this._elGrid) {
				this._isVisible = visible;
				Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
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
						this.DetailsView(tile.data);
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
			var building = this.buildings[id];
			if(building) {
				YAHOO.log(building, "info", "MapPlanet.ReLoadTile");
				this.ViewData(building.id, building.url, {
					success:function(oResult) {
						YAHOO.log(oResult, "info", "MapPlanet.ReLoadTile.ViewData.success");
						this.buildings[oResult.building.id] = oResult.building;
						this._map.addSingleTileData(oResult.building);
						this._map.refresh();
					}
				});
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
		
		ViewData : function(id, url, callback) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					building_id: id
				};
			
			BuildingServ.view(data,{
				success : function(o){
					YAHOO.log(o, "info", "BuildingDetailsSuccess");
					this.fireEvent("onMapRpc", o.result);
					
					if(callback && callback.success) {
						callback.success.call(this, o.result);
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "BuildingDetailsFailed");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:url
			});
		},
		DetailsView : function(tileData) {
			YAHOO.log(tileData, "info", "DetailsView");
			this.ViewData(tileData.id, tileData.url, {
				success:this.DetailsProcess
			});
		},
		DetailsProcess : function(oResults) {
			var building = oResults.building,
				panel = this.buildingDetails;
				
			this.currentBuilding = building;
			
			panel.name.innerHTML = building.name;
			panel.img.src = [Game.AssetUrl, "tile/", building.image, ".png"].join('');
			panel.level.innerHTML = building.level;
			panel.curEnergy.innerHTML = building.energy_hour;
			panel.curFood.innerHTML = building.food_hour;
			panel.curHappiness.innerHTML = building.happiness_hour;
			panel.curOre.innerHTML = building.ore_hour;
			panel.curWaste.innerHTML = building.waste_hour;
			panel.curWater.innerHTML = building.water_hour;
			
			if(building.pending_build) {
				panel.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + building.pending_build.seconds_remaining;
				this.QueueReload(building);
			}
			else {
				panel.timeLeftLi.innerHTML = "";
			}
			
			Event.purgeElement(panel.upgradeUl);
			if(building.upgrade.can) {
				var up = building.upgrade;
				panel.upgradeUl.innerHTML = [
					'<li>Upgrade Available</li>',
					'<li><ul>',
					'	<li>Cost</li>',
					'	<li><label>Energy: </label>',up.cost.energy,'</li>',
					'	<li><label>Food: </label>',up.cost.food,'</li>',
					'	<li><label>Ore: </label>',up.cost.ore,'</li>',
					'	<li><label>Time: </label>',up.cost.time,'</li>',
					'	<li><label>Waste: </label>',up.cost.waste,'</li>',
					'	<li><label>Water: </label>',up.cost.water,'</li>',
					'</ul></li>',
					'<li><ul>',
					'	<li>New Production</li>',
					'	<li><label>Energy: </label>',up.production.energy_hour,'</li>',
					'	<li><label>Food: </label>',up.production.food_hour,'</li>',
					'	<li><label>Happiness: </label>',up.production.happiness_hour,'</li>',
					'	<li><label>Ore: </label>',up.production.ore_hour,'</li>',
					'	<li><label>Waste: </label>',up.production.waste_hour,'</li>',
					'	<li><label>Water: </label>',up.production.water_hour,'</li>',
					'</ul></li>',
					'<li><button type="button">Upgrade</button></li>'].join('');
				Event.on(Sel.query("button", panel.upgradeUl, true), "click", function(e){
					this.Upgrade(this.currentBuilding);
				}, this, true)
			}
			else {
				panel.upgradeUl.innerHTML = "";
			}				
			
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
				Event.purgeElement(this.buildingBuilder.list);
				this.buildingBuilder.list.innerHTML = "";
				Event.purgeElement(this.buildingBuilder.unavailable);
				this.buildingBuilder.unavailable.innerHTML = "";
				
				this.buildingBuilder.show();
			
				var frag = document.createDocumentFragment(),
					unavailFrag = document.createDocumentFragment(),
					li = document.createElement("li");
				
				for(var name in b) {
					if(b.hasOwnProperty(name)) {
						var bd = b[name],
							nLi = li.cloneNode(false),
							costs = bd.build.cost,
							prod = bd.production;
							
						if(bd.build.can) {
							nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
							'	<div class="yui-u first" style="width:20%">',
							'		<img src="',Game.AssetUrl,'tile/',bd.image,'.png" style="width:100px;height:100px;" />',
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
							'		<img src="',Game.AssetUrl,'tile/',bd.image,'.png" style="width:100px;height:100px;" />',
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
							nLi.building = bd
							
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
					YAHOO.log(o, "info", "BuildSuccess");
					this.fireEvent("onMapRpc", o.result);
					this.buildingBuilder.hide();
					this.QueueReload(o.result.building);
					this.DetailsProcess(o.result);
					this.ReLoad();
				},
				failure : function(o){
					YAHOO.log(o, "error", "BuildFailed");
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
					this.buildingBuilder.hide();
					this.QueueReload(o.result.building);
					this.DetailsProcess(o.result);
					this.ReLoad();
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
		QueueReload : function(building) {
			if(building.pending_build) {
				//this.queue[building.id] = building.pending_build.seconds_remaining;
				var ms = (building.pending_build.seconds_remaining * 1000) + 5000;
				Game.QueueAdd(building.id, Game.QueueTypes.PLANET, ms);
				/*YAHOO.log("Reloading in " + ms, "info", "CheckCompleteReload");
				setTimeout(function() {
					if(YAHOO.lacuna.MapPlanet.IsVisible()) {
						delete YAHOO.lacuna.MapPlanet.queue[building.id];
						YAHOO.lacuna.MapPlanet.ReLoad();
					}
				}, ms);*/
			}
		}
	};
	Lang.augmentProto(MapPlanet, Util.EventProvider);
	
	Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"}); 

}