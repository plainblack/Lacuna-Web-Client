YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.StarMap == "undefined" || !YAHOO.lacuna.StarMap) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var StarMap = function() {
		
		this.createEvent("onMapLoaded");
		this.createEvent("onMapLoadFailed");
		
		this.subscribe("onMapLoaded", this.Display, this, true);
	};
	StarMap.prototype = {
		_createGrid : function() {
			if(!this._gridCreated) {
				var div = document.createElement("div"),
					starmap = div.cloneNode(false),
					grid = {};
					
				starmap.id = "starmap";
				Dom.setStyle(starmap, "display", "none");
				
				for(var x=-5; x<=5; x++) {
					var row = div.cloneNode(false);
					Dom.addClass(row, "gridRow");
					for(var y=-5; y<=5; y++) {
						var tile = div.cloneNode(false);
						Dom.addClass(tile, "gridStar");
						Dom.addClass(tile, "x"+x);
						Dom.addClass(tile, "y"+y);
						if(!grid[x]) {
							grid[x] = {};
						}
						grid[x][y] = row.appendChild(tile);
					}
					starmap.appendChild(row);
				}
				
				this._elGrid = document.getElementById("content").appendChild(starmap);
				this._grid = grid;
				this._gridCreated = true;
			}
			else {
				//clear nodes
				for(var x=-5; x<=5; x++) {
					for(var y=-5; y<=5; y++) {
						grid[x][y].innerHTML = "&nbsp";
					}
				}
			}
		},
		_fillNode : function(oStar /* {alignments, can_rename, color,  id, name, x, y, z }*/) {
			this._grid[oStar.x][oStar.y].innerHTML = ['<img src="',Game.AssetUrl,'map/',oStar.color,'.png" class="main" alt="',oStar.name,'" title="',oStar.name,'" />'].join('');
		},
		
		
		Display : function(oArgs) {
			this._createGrid();
			
			Dom.setStyle(this._elGrid, "display", "none");
			
			var stars = oArgs.stars;
				
			for(var i=0; i<stars.length; i++) {
				var star = stars[i];
				this._fillNode(star);
			}
			
			Dom.setStyle(this._elGrid, "display", "");
		},
		Load : function() {
			var currentPlanetId = Cookie.getSub("lacuna", "currentPlanetId");
			if(currentPlanetId) {
				var MapServ = Game.Services.Maps,
					data = {
						session_id: Cookie.getSub("lacuna","session") || "",
						body_id: currentPlanetId
					};
				
				MapServ.get_stars_near_body(data,{
					success : function(o){
						this.fireEvent("onMapLoaded", o.result);
					},
					failure : function(o){
						console.log("STARMAP FAILED: ", o);
						this.fireEvent("onMapLoadFailed", o.error);
					},
					timeout:5000,
					scope:this
				});
			}
		}
	};
	Lang.augmentProto(StarMap, Util.EventProvider);
	
	Lacuna.StarMap = new StarMap();
})();
YAHOO.register("starMap", YAHOO.lacuna.StarMap, {version: "1", build: "0"}); 

}