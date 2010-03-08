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
		this.createEvent("onMapLoaded");
		this.createEvent("onMapLoadFailed");
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
				'			<img id="planetDetailImg" src="" alt="" />',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul>',
				'				<li id="buildingDetailsName"></li>',
				'				<li><label>Empire: </label><span id="buildingDetailsEmpire"></span></li>',
				'				<li><label>Minerals: </label><span id="buildingDetailsMinerals"></li>',
				'				<li><label>Water: </label><span id="buildingDetailsWater"></li>',
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
				this.buildingDetails.img = Dom.get("planetDetailImg");
				this.buildingDetails.name = Dom.get("buildingDetailsName");
				this.buildingDetails.empire = Dom.get("buildingDetailsEmpire");
				this.buildingDetails.minerals = Dom.get("buildingDetailsMinerals");
				this.buildingDetails.water = Dom.get("buildingDetailsWater");
			}, this, true);
			
			this.buildingDetails.render();
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
					if(tile) {
						YAHOO.log([tile.id, tile.data]);
					}
				}, "div.tile", this, true);
			}
			
			this.MapVisible(true);
		},
		Load : function(planetId) {
			this.locationId = planetId;
			if(planetId) {
				var BodyServ = Game.Services.Body,
					data = {
						session_id: Cookie.getSub("lacuna","session") || "",
						body_id: planetId
					};
				
				BodyServ.get_buildings(data,{
					success : function(o){
						this.fireEvent("onMapLoaded", o.result);
						this.Mapper.call(this, o.result);
					},
					failure : function(o){
						YAHOO.log(["planetMap FAILED: ", o]);
						this.fireEvent("onMapLoadFailed", o.error);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		Resize : function() {
			this._map.redraw();
		}
	};
	Lang.augmentProto(MapPlanet, Util.EventProvider);
	
	Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"}); 

}