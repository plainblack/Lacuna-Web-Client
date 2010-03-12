YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapPlanet == "undefined" || !YAHOO.lacuna.MapPlanet) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
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
				'				<li><label>Level: </label><span id="buildingDetailsLevel"></li>',
				'			</ul>',
				'		</div>',
				'	</div>',
				'	<div class="yui-g">',
				'		<div class="yui-u first">',
				'			<ul>',
				'				<li>Current Production</li>',
				'				<li><label>Energy: </label><span id="buildingDetailsEnergy"></li>',
				'				<li><label>Food: </label><span id="buildingDetailsFood"></li>',
				'				<li><label>Happiness: </label><span id="buildingDetailsHappiness"></li>',
				'				<li><label>Ore: </label><span id="buildingDetailsOre"></li>',
				'				<li><label>Waste: </label><span id="buildingDetailsWaste"></li>',
				'				<li><label>Water: </label><span id="buildingDetailsWater"></li>',
				'			</ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul>',
				'				<li>Upgrade</li>',
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
				this.name = Dom.get("buildingDetailsName");
				this.level = Dom.get("buildingDetailsLevel");
				this.curEnergy = Dom.get("buildingDetailsEnergy");
				this.curFood = Dom.get("buildingDetailsFood");
				this.curHappiness = Dom.get("buildingDetailsHappiness");
				this.curOre = Dom.get("buildingDetailsOre");
				this.curWaste = Dom.get("buildingDetailsWaste");
				this.curWater = Dom.get("buildingDetailsWater");
			});
			
			this.buildingDetails.process = function(oResults) {
				var building = oResults.building;
				this.name.innerHTML = building.name;
				this.img.src = [Game.AssetUrl, "tile/", building.image, building.level, ".png"].join('');
				this.level.innerHTML = building.level;
				this.curEnergy.innerHTML = building.energy_hour;
				this.curFood.innerHTML = building.food_hour;
				this.curHappiness.innerHTML = building.happiness_hour;
				this.curOre.innerHTML = building.ore_hour;
				this.curWaste.innerHTML = building.waste_hour;
				this.curWater.innerHTML = building.water_hour;
				
				this.show();
			};
			
			this.buildingDetails.render();
		},
		_buildBuilderPanel : function() {
			var panelId = "buildingBuilder";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Builder</div>',
				'<div class="bd" style="overflow:scroll;">',
				'	<ul id="buildingBuilderList">',
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
						YAHOO.log(tile.data, "info", "MapPlanet.Mapper");
						this.DetailsView(tile.data);
					}
					else {
						YAHOO.log(tile, "info", "MapPlanet.Mapper");
						this.BuilderView(tile);
					}
				}, "div.tile", this, true);
			}
			else {
				this._map.addTileData(oArgs.buildings)
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
						this.fireEvent("onMapRpc", o.result);
						this.Mapper.call(this, o.result);
					},
					failure : function(o){
						YAHOO.log(["planetMap FAILED: ", o]);
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
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
		
		DetailsView : function(tileData) {
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					building_id: tileData.id
				};
			
			BuildingServ.view(data,{
				success : function(o){
					YAHOO.log(o, "info", "BuildingDetailsSuccess");
					this.fireEvent("onMapRpc", o.result);
					
					this.buildingDetails.process(o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "BuildingDetailsFailed");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:tileData.url
			});
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
					this.buildingDetails.process(o.result);
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
		BuilderView : function(tile) {
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
				
				var frag = document.createDocumentFragment(),
					li = document.createElement("li");
				
				for(var name in b) {
					if(b.hasOwnProperty(name)) {
						var bd = b[name];
						if(bd.build.can) {
							var nLi = li.cloneNode(false),
								costs = bd.build.cost,
								prod = bd.production;
							nLi.innerHTML = ['<span style="font-weight:bold;">',name,'</span>: ',
								'<span><label>Build Time:</label>',costs.time,'</span>',
								'<div><label style="font-weight:bold;">Cost:</label>',
								'<span><label>Energy:</label>',costs.energy,'</span>, ',
								'<span><label>Food:</label>',costs.food,'</span>, ',
								'<span><label>Ore:</label>',costs.ore,'</span>, ',
								'<span><label>Waste:</label>',costs.waste,'</span>, ',
								'<span><label>Water:</label>',costs.water,'</span></div>',
								'<div><label style="font-weight:bold;">Production:</label>',
								'<span><label>Happiness:</label>',prod.happiness_hour,'</span>, ',
								'<span><label>Energy:</label>',prod.energy_hour,'</span>, ',
								'<span><label>Food:</label>',prod.food_hour,'</span>, ',
								'<span><label>Ore:</label>',prod.ore_hour,'</span>, ',
								'<span><label>Waste:</label>',prod.waste_hour,'</span>, ',
								'<span><label>Water:</label>',prod.water_hour,'</span></div>',
								].join('');
							nLi.building = bd
							
							nLi = frag.appendChild(nLi);
						}
					}
				}
							
				Event.delegate(this.buildingBuilder.list, "click", function(e, matchedEl, container) {
					this.Build(matchedEl.building, request.x, request.y);
				}, "li", this, true);
				
				this.buildingBuilder.list.appendChild(frag);
			}
			
			this.buildingBuilder.show();
		}
	};
	Lang.augmentProto(MapPlanet, Util.EventProvider);
	
	Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"}); 

}