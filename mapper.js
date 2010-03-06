YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Mapper == "undefined" || !YAHOO.lacuna.Mapper) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var Mapper = {};
	Mapper.util = {
		modulo: function(val, mod){
			var res = val%mod;
			if(res < 0) {
				res += mod;
			}
			return res;
		},
		copy: function(obj, c) {
			if(!c) {
				c = {};
			}
			for( var k in obj ) {
				c[k] = obj[k];
			}
			return c;
		},
		clone: function(obj) {
			function Constructor(){}
			Constructor.prototype = obj;
			return new Constructor();
		},
		forEach: function(array, fun) {
			for(var i=0; i<array.length; i++) {
				fun(array[i], i);
			}
		}
	};
	
	Mapper.MovableContainer = function( parentEl ) {
		var div = document.createElement('div');
		Dom.addClass(div,"movableContainer");
		div.style.position = 'absolute';
		
		this._container = div;
		
		this.offsetX = 0;
		this.offsetY = 0;
		
		this.reposition(0,0);
		parentEl.appendChild( div );
	};
	Mapper.MovableContainer.prototype = {
		move : function( x,y ) {
			this.offsetX += x;
			this.offsetY += y;
			this._container.style.left = ''+ this.offsetX +'px';
			this._container.style.top  = ''+ this.offsetY +'px';
		},
		reposition : function( mox, moy ) {
			this.move(0,0);
			
			this.offsetToLeftMapBorder = mox;
			this.offsetToTopMapBorder = moy;
		},
		appendChild : function( c ) {
			return this._container.appendChild( c );
		},
		removeChild : function( c ) {
			return this._container.removeChild( c );
		}
	};
	
	Mapper.VisibleArea = function(map) {
		this.left = 0; //Math.round( (map.centerX * map.tileSizeInPx) - (0.5 * map.width) );
		this.top = 0; //Math.round( (map.centerY * map.tileSizeInPx) - (0.5 * map.height) );
		this.width = map.width;
		this.height = map.height;
		this._map = map;
		this.move(0,0);
	};
	Mapper.VisibleArea.prototype = {
		move : function(mx,my) {
			this.left += mx;
			this.top += my;
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
		},
		centerCoords : function() {
			var hw = 0.5 * this._map.width;
			var tileSize = this._map.tileSizeInPx;
			return [Math.floor((this.left + hw) / tileSize),
			Math.floor(((this.top * -1) - hw) / tileSize)];
		},
		coordBounds : function() {
			var tileSize = this._map.tileSizeInPx;
			return {
				x1 : Math.floor(this.left / tileSize),
				y1 : Math.ceil((this.top * -1) / tileSize),
				x2 : Math.ceil(this.right / tileSize),
				y2 : Math.floor((this.bottom * -1) / tileSize)
			};
		},
		topLeftLoc : function() {
			var tileSize = this._map.tileSizeInPx;
			return [Math.floor(this.left / tileSize),
			Math.floor(this.top / tileSize)];
		}
	};

	
	var Tiler = function(x, y, z, ox, oy, map) {
		this.z = z;
		this.x = x;
		this.y = y;
		this.offsetX = ox;
		this.offsetY = oy;
		this.map = map;
		
		this.refresh();
		
		this.id = Tiler.idFor(this.x,this.y,this.z);
		this.domElement = document.createElement('div');
		this.domElement.id = this.id;
		
		var s = this.domElement.style;
		s.position = 'absolute';
		s.width = '' + this.map.tileSizeInPx + 'px';
		s.height = '' + this.map.tileSizeInPx + 'px';
		s.zIndex = '1';
		s.left = ''+ this.offsetX +'px';
		s.top = ''+ this.offsetY +'px';
		s.background = 'transparent url('+ this.url +') no-repeat scroll center';
		
		Dom.addClass(this.domElement, "tile");
		
		// for debuging:
		//this.domElement.appendChild(document.createTextNode(this.id));
			
		this.init();
	};
	Tiler.prototype = {
		//blank init that will always get called.  override in sub classes to change defaults
		init : function() {
		},
		refresh : function() {
			var obj = this.map.getTile(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			this.data = obj.data;
			Dom.setStyle("background", 'transparent url('+ this.url +') no-repeat scroll center');
		},
		
		
		notInDom : function() {
			return this._notInDom;
		},
		remove : function() {
			if( this.domElement && this.domElement.parentNode) {
				this.domElement.parentNode.removeChild(this.domElement);
			}
			this._notInDom = true;
		}
	};
	Tiler.idFor = function(x,y,z){
		return 'tile_'+ x + '_' + y + '_' + z;
	};
	
	Mapper.StarTile = function(x, y, z, ox, oy, map) {
		Mapper.StarTile.superclass.constructor.call(this, x, y, z, ox, oy, map);
	};
	Lang.extend(Mapper.StarTile, Tiler, {
		init : function() {
			this.domElement.title = this.data ? [this.data.name, " (", this.x, ",", this.y, ",", this.z, ")"].join('') : "Uncharted Space";
			
			if(this.data && this.data.alignments) {
				var alignment = this.domElement.appendChild(document.createElement('div'));
				Dom.setStyle(alignment, "width", this.map.tileSizeInPx + 'px');
				Dom.setStyle(alignment, "height", this.map.tileSizeInPx + 'px');
				Dom.setStyle(alignment, "z-index", '2');
				Dom.setStyle(alignment, "background", ['transparent url(',Game.AssetUrl,'map/',this.data.alignments,'.png',') no-repeat scroll center'].join(''));
			}
		}
	});
	
	Mapper.PlanetTile = function(x, y, z, ox, oy, map) {
		Mapper.StarTile.superclass.constructor.call(this, x, y, z, ox, oy, map);
	};
	Lang.extend(Mapper.PlanetTile, Tiler, {
		init : function() {
			this.domElement.title = this.data ? [this.data.name, " (", this.x, ",", this.y, ")"].join('') : "Ground";
		}
	});
	
	

	Mapper.OverlayLayer = function( map ){
		var containerDiv;
		var overlays = [];
		
		function displayOverlay( o ) {
			//var p = Mapper.util.pixelCoordinates(o.lat,o.lng, map.mapExtendInPx);
			//var x = p[0] - map.movableContainer.offsetToLeftMapBorder;
			//var y = p[1] - map.movableContainer.offsetToTopMapBorder;
			var x = (o.lat * map.tileSizeInPx) - map.movableContainer.offsetToLeftMapBorder;
			var y = (o.lng * map.tileSizeInPx) - map.movableContainer.offsetToTopMapBorder;
			
			var s = o.element.style;
			s.position = 'absolute';
			s.left = ''+ x +'px';
			s.top = ''+ y +'px';
			containerDiv.appendChild(o.element);
		}
		
		this.addElement = function(el, lat, lng) {
			var o = {element:el, lat:lat, lng:lng};
			overlays[overlays.length] = o;
			
			if(map.movableContainer.offsetToMapLeftBorder) {
				displayOverlay( o );
			}
		};
		
		this.redraw = function() {
			if( containerDiv ) {
				map.movableContainer.removeChild( containerDiv );
			}
			containerDiv = document.createElement('div');
			Dom.addClass(containerDiv, "overlayContainer");
			var s = containerDiv.style;
			s.position = 'absolute';
			s.left = '0';
			s.top = '0';
			s.zIndex = '20';
			map.movableContainer.appendChild( containerDiv );

			Mapper.util.forEach(overlays, displayOverlay);
		};
	};
	
	Mapper.CoordLayer = function(map) {
		this.map = map;
		this.offsetX = 0;
		this.offsetY = 0;
		this.div = document.createElement('div'); //so we can clone it a lot
	};
	Mapper.CoordLayer.prototype = {
		move : function(x,y) {
			this.offsetX += x;
			this.offsetY += y;
			this.containerDiv.style.left = ''+ this.offsetX +'px';
			this.containerDiv.style.top  = ''+ this.offsetY +'px';
			this.offsetCoordsX -= x;
			this.offsetCoordsY -= y;
			this.xCoords.style.left = ''+ this.offsetCoordsX +'px';
			this.yCoords.style.top  = ''+ this.offsetCoordsY +'px';
		},
		redraw : function() {
			if( this.containerDiv ) {
				this.map.movableContainer.removeChild( this.containerDiv );
			}
			this.containerDiv = this.div.cloneNode(false);
			Dom.addClass(this.containerDiv, "coordContainer");
			var s = this.containerDiv.style;
			s.position = 'absolute';
			s.left = '0';
			s.top = '0';
			s.zIndex = '30';

			this.offsetCoordsX = Math.ceil( (this.map.visibleArea.left * this.map.tileSizeInPx) / 100 ) * 100; //Math.ceil( ((this.map.visibleArea.left * this.map.tileSizeInPx) + (0.5 * this.map.width)) / 100 ) * 100;
			this.offsetCoordsY = Math.ceil( (this.map.visibleArea.top * this.map.tileSizeInPx) / 100 ) * 100; //Math.ceil( ((this.map.visibleArea.top * this.map.tileSizeInPx) + (0.5 * this.map.height)) / 100 ) * 100;
		
			this.displayXCoords();
			this.displayYCoords();
			
			this.map.movableContainer.appendChild( this.containerDiv );
			
			this.move(0,0);
		},
		displayXCoords : function() {
			var anchor = this.div.cloneNode(false);
			Dom.addClass(anchor, "coordTop");
			var s = anchor.style;
			s.position = 'absolute';
			s.top = '0';
			s.width = '5px';
			s.height = '30px';
			s.background = 'red';
			var pxSize = this.map.tileSizeInPx,
				size = pxSize + "px";
			for(var x=-15; x<=15; x++) {
				var num = this.div.cloneNode(false);
				num.innerHTML = x;
				Dom.addClass(num, "coordX");
				Dom.setStyle(num, "width", size);
				Dom.setStyle(num, "left", (x * pxSize) + "px");
				anchor.appendChild(num);
			}
			this.xCoords = this.containerDiv.appendChild(anchor);
		},
		displayYCoords : function() {
			var anchor = this.div.cloneNode(false);
			Dom.addClass(anchor, "coordLeft");
			var s = anchor.style;
			s.position = 'absolute';
			s.left = '0';
			s.width = '30px';
			s.height = '5px';
			s.background = 'red';
			var pxSize = this.map.tileSizeInPx,
				negPxSize = pxSize * -1,
				thrd = Math.ceil(pxSize / 3),
				sizeLeft = (pxSize - thrd) + "px",
				thrdTxt = thrd + "px";
			for(var y=15; y>=-15; y--) {
				var num = this.div.cloneNode(false);
				num.innerHTML = y;
				Dom.addClass(num, "coordY");
				Dom.setStyle(num, "padding-top", thrdTxt);
				Dom.setStyle(num, "height", sizeLeft);
				Dom.setStyle(num, "top", (y * negPxSize) + "px");
				anchor.appendChild(num);
			}
			this.yCoords = this.containerDiv.appendChild(anchor);
		}
	};

	Mapper.TileLayer = function(map, visibleArea, TileConstructor){
		// tile layer expects map.movableContainer to be at the upper left corner of
		// the visibleArea on creation		
		this.map = map;
		this.visibleArea = visibleArea;
		this.TileConstructor = TileConstructor;
		
		var offsetX = visibleArea.left % map.tileSizeInPx;
		var offsetY = visibleArea.top % map.tileSizeInPx;
		
		this.baseTileLoc = visibleArea.topLeftLoc();
		
		var tileContainer = document.createElement('div');
		Dom.addClass(tileContainer, "tileContainer");
		var s = tileContainer.style;
		s.position = 'absolute';
		s.left = offsetX + 'px';
		s.top = offsetY + 'px';
		s.zIndex = '0';
		// for debuging:
		// s.width = ''+visibleArea.width+'px';
		// s.height = ''+visibleArea.height+'px';
		// s.backgroundColor = '#477';
		this.tileContainer = map.movableContainer.appendChild( tileContainer );
		
		this.render();
		
	};
	Mapper.TileLayer.prototype = {
		tileCache : {},
		findTile : function(x,y,zoom){
			return this.tileCache[Tiler.idFor(x,y,zoom)];
		},
		findTileById : function(id) {
			return this.tileCache[id];
		},
		tileAtPosition : function(x,y){
			var tileSizeInPx = this.map.tileSizeInPx;
			return [Math.floor(x/tileSizeInPx), Math.floor(y/tileSizeInPx)];
		},
		_getTiles : function(x1, x2, y1, y2) {
			//show anything we already have
			this._showCachedTiles();
			//get any new tiles we need
			this.map.getTileData({
				success:function() {
					this.showTiles();
				},
				failure:function() {
					this.showTiles();
				},
				scope:this
			}, x1, x2, y1, y2);
		},
		_showCachedTiles : function() {
			var bounds = this.visibleArea.coordBounds();
			
			//from left to right (smaller to bigger)
			for(var xc=bounds.x1; xc <= bounds.x2; xc++){
				//from bottom to top (smaller to bigger)
				for(var yc=bounds.y2; yc <= bounds.y1; yc++){
					var tile = this.findTile(xc,yc,this.map.zoom);
					if(tile) {
						if(tile.blank) {
							tile.refresh();
						}
						if(tile.notInDom() && tile.domElement) {
							this.tileContainer.appendChild( tile.domElement );	
						}
					}
				}
			}
		},
		showTiles : function() {
			var bounds = this.visibleArea.coordBounds();
			
			var tiles = {};
			//from left to right (smaller to bigger)
			for(var xc=bounds.x1; xc <= bounds.x2; xc++){
				//from bottom to top (smaller to bigger)
				for(var yc=bounds.y2; yc <= bounds.y1; yc++){
					var tile = this.findTile(xc,yc,this.map.zoom);
					if(!tile) {
						var ox = (xc - this.baseTileLoc[0]) * this.map.tileSizeInPx;
						var oy = ((yc * -1) - this.baseTileLoc[1]) * this.map.tileSizeInPx;
						//var offsets = this.visibleArea.getOffsetFromCoords(xc, xy, this.baseTileCoords[0], this.baseTileCoords[1]);
						tile = new this.TileConstructor(xc, yc, this.map.zoom, ox, oy, this.map);
						this.tileCache[tile.id] = tile;
						if( tile.domElement ) {
							this.tileContainer.appendChild( tile.domElement );
						}
					}
					else {
						if(tile.blank) {
							tile.refresh();
						}
						if(tile.notInDom() && tile.domElement) {
							this.tileContainer.appendChild( tile.domElement );	
						}
					}
					tiles[tile.id] = tile;
				}
			}
			this.removeAllTilesNotContainedIn( tiles );
		},
		render : function() {
			var bounds = this.visibleArea.coordBounds(),
				eb = this.map.getBounds();
				
			console.log([
				"vis-x1[",bounds.x1,"] >= exi-x1[",eb.x1Left,"] && ",
				"vis-x2[",bounds.x2,"] <= exi-x2[",eb.x2Right,"] && ",
				"vis-y1[",bounds.y1,"] <= exi-y1[",eb.y1Top,"] && ",
				"vis-y2[",bounds.y2,"] >= exi-y2[",eb.y2Bottom,"] "
				].join('')
			);
				
			if(eb && (	bounds.x1 >= eb.x1Left   && 
						bounds.x2 <= eb.x2Right  && 
						bounds.y1 <= eb.y1Top    && 
						bounds.y2 >= eb.y2Bottom)
			) {
				this.showTiles();
			}
			else {
				this._getTiles(bounds.x1, bounds.x2, bounds.y1, bounds.y2);
			}
		},
		removeAllTilesNotContainedIn : function( hash ) {
			for( var key in this.tileCache ){
				if( this.tileCache.hasOwnProperty(key) && !hash[key] ){
					var tile = this.tileCache[key];
					tile.remove();
				}
			}
		},
		destroy : function() {
			this.removeAllTilesNotContainedIn({});
			//this.map.movableContainer.removeChild( this.tileContainer );
			Event.purgeElement(this.tileContainer);
			this.tileContainer.parentNode.removeChild(this.tileContainer);
			delete this["tileCache"];
		}
	};

	
	
	var Map = function( divId ) {
		var IE='\v'=='v'; // detect IE
		this.IE = IE;
		
		this.mapDiv = document.getElementById( divId );
		this.mapDiv.style.overflow = "hidden";
		this.movableContainer = new Mapper.MovableContainer( this.mapDiv );
		
		this.init();
	};
	Map.prototype = {
		tileSizeInPx : undefined,
		maxZoom : 15,
		minZoom : -15,
		visibleArea : undefined,
		centerX : 0,
		centerY : 0,
		diffX : 0,
		diffY : 0,
		_pathsAndPolygons : {},
		_projectedPoints : {},
		tileCache : {},
		bounds : {},
		//blank init that will always get called.  override in sub classes to change defaults
		init : function() {
		},
		// pX and pY are optional pixel coordinates. If set they
		// define the center of the map after the zoom. Otherwise
		// the center will be the same as before the zoom
		zoomIn : function() {
			if( this.zoom >= this.maxZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom + 1 );
			this.redraw();
		},
		zoomOut : function() {
			if( this.zoom <= this.minZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom - 1 );
			this.redraw();
		},
		setTileSizeInPx : function( size ) {
			this.tileSizeInPx = size;
			//this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
		},
		setCenter : function(x,y){
			this.centerX = x;
			this.centerY = y;
		},
		addElement : function( p ) {
			this._pathsAndPolygons[p.id] = p;
		},
		removeElement : function( p ) {
			delete this._pathsAndPolygons[p.id];
		},
		moveByPx : function( x,y ) {
			this.movableContainer.move( x,y );
			this.visibleArea.move( -x,-y );
			this.coordLayer.move( -x,-y );
			
			this.diffX += x;
			this.diffY += y;
			var checkTileSize = Math.floor(this.tileSizeInPx * .75); //load the tiles a bit early
			if( Math.abs(this.diffX) > checkTileSize || Math.abs(this.diffY) > checkTileSize) {
				console.log(checkTileSize, this.diffX, this.diffY);
				//reset diff's
				this.diffX = 0;
				this.diffY = 0;
				this.tileLayer.render();
				
				/*if(!this.IE) {
					this.canvasTileLayer.showTiles();
				}*/
			}
		},
		setZoomLevel : function( level ) {
			if( this.visibleArea ){
				// we are changing the zoom level but the map may have been panned around
				// but the current center is only stored in pixel coordinates which are different
				// for every zoom level. Therefor we recalculate the centerLat and centerLng:
				var ll = this.visibleArea.centerCoords();
				this.centerX = ll[0];
				this.centerY = ll[1];
				this.visibleArea = null;
			}
			this.zoom = level;
			//this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
		},
		
		// override these for specific tile handling
		getTile  : function(x, y, z){
		},
		getBounds : function() {
		},
		updateBounds : function(oTile) {
		},
		addTileData : function(aTiles) {
		},
		redraw : function() {	
		}
	};
	
	Mapper.StarMap = function( divId ) {
		Mapper.StarMap.superclass.constructor.call(this, divId);
	};
	Lang.extend(Mapper.StarMap, Map, {
		init : function() {
			this.maxZoom = 15;
			this.minZoom = -15;

			this.setTileSizeInPx(100);
			//all of these depend on tile size
			this.overlayLayer = new Mapper.OverlayLayer(this);
			this.coordLayer = new Mapper.CoordLayer(this);
			this.controller = new Mapper.TraditionalController( this );
		},
		setCenterToCurrentPlanet : function() {
			if(this.currentSystem && this.tileLayer) {
				//this.setCenter(this.currentSystem.x,this.currentSystem.y);
				//these are the offsets for the star
				var otherWidth = this.centerX * this.tileSizeInPx,
					otherHeight = this.centerY * this.tileSizeInPx + this.tileSizeInPx;
				var ox = (this.currentSystem.x - this.tileLayer.baseTileLoc[0]) * this.tileSizeInPx - otherWidth,
					oy = ((this.currentSystem.y * -1) - this.tileLayer.baseTileLoc[1]) * this.tileSizeInPx + otherHeight;
				//now we change them slightly to get where we're going
				/*ox = Math.floor(ox*-1);
				oy = Math.floor(oy/2) * -1;
				oy += oy/2;
				
				this.moveByPx(ox, oy);*/
				
				//this.moveByPx(Math.floor(ox/2), Math.floor(oy/2) * -1);
				
				this.moveByPx(ox * -1, oy * -1);
			}
		},
		getTile : function(x, y, z){
			var ySet = this.tileCache[x],
				zSet = ySet ? ySet[y] : null,
				star = zSet ? zSet[z] : null;
			
			if(star) {
				return {data:star, url:[Game.AssetUrl,'map/',star.color,'.png'].join('')};
			}
			else {
				return {blank:true, url:Game.AssetUrl + 'ui/blankstar.png'};
			}
		},
		getTileData : function(callback, x1, x2, y1, y2) {
			if(!Util.Connect.isCallInProgress(this.currentRequest)) {
				var data = {
					session_id : Cookie.getSub("lacuna","session") || "",
					x1 : x1, 
					x2 : x2, 
					y1 : y1, 
					y2 : y2, 
					z : this.zoom
				};
				console.log(data);
				//now call back for data
				this.currentRequest = Game.Services.Maps.get_stars(data,{
					success : function(o){
						console.log("GET_STARS ", o);
						this.currentRequest = undefined;
						Game.ProcessStatus(o.result.status);
						this.addTileData(o.result.stars);
						callback.success.call(callback.scope || this, callback.argument);
					},
					failure : function(o){
						console.log("GET_STARS FAILED ", o.error.message, o);
						callback.success.call(callback.scope || this, callback.argument);
						this.currentRequest = undefined;
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getBounds : function() {
			return this.bounds[this.zoom] || {x1Left:0,x2Right:0,y1Top:0,y2Bottom:0};
		},
		
		updateBounds : function(oStar) {
			if(!this.bounds[oStar.z]) {
				//set z levels to 0 by default
				this.bounds[oStar.z] = {x1Left:0,x2Right:0,y1Top:0,y2Bottom:0};
			}
			//do this no matter what
			var bnds = this.bounds[oStar.z];
			
			if(bnds.x1Left > oStar.x) {
				bnds.x1Left = oStar.x;
			}
			else if(bnds.x2Right < oStar.x) {
				bnds.x2Right = oStar.x;
			}
			
			if(bnds.y1Top < oStar.y) {
				bnds.y1Top = oStar.y;
			}
			else if(bnds.y2Bottom > oStar.y) {
				bnds.y2Bottom = oStar.y;
			}
		},
		addTileData : function(aStars) {
			var startZoomLevel = 0;
			for(var i=0; i<aStars.length; i++) {
				var star = aStars[i];
				if(!this.tileCache[star.x]) {
					this.tileCache[star.x] = {};
				}
				if(!this.tileCache[star.x][star.y]) {
					this.tileCache[star.x][star.y] = {};
				}
				this.tileCache[star.x][star.y][star.z] = star;
				startZoomLevel = star.z;
				if(star.alignments == "self") {
					this.currentSystem = star;
				}
				this.updateBounds(star);
			}
			return startZoomLevel;
		},
		redraw : function() {			
			this.width = this.mapDiv.offsetWidth;
			this.height= this.mapDiv.offsetHeight;
			
			this.visibleArea = new Mapper.VisibleArea(this);
			this.movableContainer.reposition( this.visibleArea.left, this.visibleArea.top );
			
			var center = this.visibleArea.centerCoords();
			this.setCenter(center[0],center[1]);
			//redraw after setting center since it uses map's center location
			this.coordLayer.redraw();
			
			if( this.tileLayer ) {
				this.tileLayer.destroy();		
			}
			this.tileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), Mapper.StarTile);
			
			/*if(!window.debugPD) {
				if( this.canvasTileLayer ) {
					this.canvasTileLayer.destroy();
				}
				this.canvasTileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), Mapper.CanvasTile);
			}*/
				
			this.overlayLayer.redraw();
		}
	});
	
	Mapper.PlanetMap = function( divId ) {
		Mapper.PlanetMap.superclass.constructor.call(this, divId);
	};
	Lang.extend(Mapper.PlanetMap, Map, {
		init : function() {
			this.maxZoom = 0;
			this.minZoom = 0;
			
			this.bounds = {x1Left:-5,x2Right:5,y1Top:5,y2Bottom:-5};

			this.setTileSizeInPx(200);
			//all of these depend on tile size
			this.overlayLayer = new Mapper.OverlayLayer(this);
			this.coordLayer = new Mapper.CoordLayer(this);
			this.controller = new Mapper.TraditionalController( this );
		},
		setCenterToCommand : function() {
			if(this.command && this.tileLayer) {
				var otherWidth = this.centerX * this.tileSizeInPx,
					otherHeight = this.centerY * this.tileSizeInPx + this.tileSizeInPx;
				var ox = (this.command.x - this.tileLayer.baseTileLoc[0]) * this.tileSizeInPx - otherWidth,
					oy = ((this.command.y * -1) - this.tileLayer.baseTileLoc[1]) * this.tileSizeInPx + otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);
			}
		},
		getTile : function(x, y, z){
			var ySet = this.tileCache[x],
				building = ySet ? ySet[y] : null;
			
			if(building) {
				return {data:building, url:[Game.AssetUrl,'tile/',building.image,building.level,'.png'].join('')};
			}
			else {
				return {blank:true, url:Game.AssetUrl + 'tile/ground.png'};
			}
		},
		getTileData : function(callback, x1, x2, y1, y2) {
			//since we should have all the data already, just call success
			callback.success.call(callback.scope || this, callback.argument);
		},
		getBounds : function() {
			return this.bounds;
		},
		updateBounds : function(oTile) {
			var bnds = this.bounds;
			
			if(bnds.x1Left > oTile.x) {
				bnds.x1Left = oTile.x;
			}
			else if(bnds.x2Right < oTile.x) {
				bnds.x2Right = oTile.x;
			}
			
			if(bnds.y1Top < oTile.y) {
				bnds.y1Top = oTile.y;
			}
			else if(bnds.y2Bottom > oTile.y) {
				bnds.y2Bottom = oTile.y;
			}
		},
		addTileData : function(oTiles) {
			var startZoomLevel = 0;
			for(var tKey in oTiles) {
				if(oTiles.hasOwnProperty(tKey)){
					var tile = oTiles[tKey];
					if(tile.url == "/planetarycommand") {
						this.command = tile;
					}
					if(!this.tileCache[tile.x]) {
						this.tileCache[tile.x] = {};
					}
					if(!this.tileCache[tile.x][tile.y]) {
						this.tileCache[tile.x][tile.y] = {};
					}
					this.tileCache[tile.x][tile.y] = tile;

					this.updateBounds(tile);
				}
			}
			return startZoomLevel;
		},
		redraw : function() {			
			this.width = this.mapDiv.offsetWidth;
			this.height= this.mapDiv.offsetHeight;
			
			this.visibleArea = new Mapper.VisibleArea(this);
			this.movableContainer.reposition( this.visibleArea.left, this.visibleArea.top );
			
			var center = this.visibleArea.centerCoords();
			this.setCenter(center[0],center[1]);
			//redraw after setting center since it uses map's center location
			this.coordLayer.redraw();
			
			if( this.tileLayer ) {
				this.tileLayer.destroy();		
			}
			this.tileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), Mapper.PlanetTile);
			
			/*if(!window.debugPD) {
				if( this.canvasTileLayer ) {
					this.canvasTileLayer.destroy();
				}
				this.canvasTileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), Mapper.CanvasTile);
			}*/
				
			this.overlayLayer.redraw();
		}
	});

	
	
	Mapper.TraditionalController = function( map ) {
		this.map = map;
		
		Event.on(map.mapDiv, "mousedown", function(e){
			Event.preventDefault(e);
			
			Event.on(document, "mouseup", this.disableDrag, this, true);
			Event.on(document, "mousemove", this.moveMap, this, true);
		}, this, true);
		
		if((map.maxZoom - map.minZoom) != 0) {
			// add zoom buttons
			var zoomInButton = document.createElement('div');
			// zoomInButton.setAttribute('class', 'mapiator_zoom_in');
			zoomInButton.id = 'mapiator_zoom_in';

			map.mapDiv.appendChild( zoomInButton );
			zoomInButton.onmouseup = function(){map.zoomIn();};

			var zoomOutButton = document.createElement('div');
			zoomOutButton.id = 'mapiator_zoom_out';

			map.mapDiv.appendChild( zoomOutButton );
			zoomOutButton.onmouseup = function(){map.zoomOut();};

			var preventDblClick = function(e){
				if( map.IE ) {
					window.event.cancelBubble=true;
				}
				else {
					e.stopPropagation();
				}
			};
			zoomInButton.ondblclick = preventDblClick;
			zoomOutButton.ondblclick = preventDblClick;
		}
	};
	Mapper.TraditionalController.prototype = {
		moveMap : function (e) {
			Event.preventDefault(e);
			
			if(this.xmove) {
				this.map.moveByPx( e.clientX - this.xmove, e.clientY - this.ymove );
			}
			this.xmove = e.clientX;
			this.ymove = e.clientY;
		},
		disableDrag : function (e){
			Event.preventDefault(e);
			Event.removeListener(document, "mousemove", this.moveMap);
			Event.removeListener(document, "mouseup", this.disableDrag);
			this.xmove = undefined;
		},
		isDragging : function() {
			return this.xmove;
		}
	};

	YAHOO.lacuna.Mapper = Mapper;
})();
YAHOO.register("mapper", YAHOO.lacuna.Mapper, {version: "1", build: "0"}); 

}