YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Mapper == "undefined" || !YAHOO.lacuna.Mapper) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
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
		
		this.reset();
		parentEl.appendChild( div );
	};
	Mapper.MovableContainer.prototype = {
		move : function( x,y ) {
			this.offsetX += x;
			this.offsetY += y;
			this._container.style.left = ''+ this.offsetX +'px';
			this._container.style.top  = ''+ this.offsetY +'px';
		},
		reset : function() {
			this.offsetX = 0;
			this.offsetY = 0;
			this.move(0,0);
		},
		appendChild : function( c ) {
			return this._container.appendChild( c );
		},
		removeChild : function( c ) {
			return this._container.removeChild( c );
		}
	};
	
	Mapper.VisibleArea = function(map) {
		this._map = map;
		this.reset();
	};
	Mapper.VisibleArea.prototype = {
		move : function(mx,my) {
			var mb = this._map.maxBounds; // = {x1Left:-15,x2Right:15,y1Top:15,y2Bottom:-15};
			if(mb) {
				var tileSize = this._map.tileSizeInPx,
					maxBoundsWidth = (mb.x2Right - mb.x1Left) * tileSize,
					maxWidth = this._map.width > maxBoundsWidth ? maxBoundsWidth : this._map.width,
					cb = this.calcCoordBounds(this.left + mx, this.top + my, this.left + mx + maxWidth, this.top + my + this._map.height),
					error = false, tx, ty;
				//if out of bounds, only move to max
				//x axis
				if(mx < 0 && cb.x1 < mb.x1Left) { //if moving left
					mx = ((mb.x1Left * tileSize) - 30) - this.left;
				}
				else if(mx > 0 && cb.x2 > (mb.x2Right+1)) { //if moving right
					mx = ((mb.x2Right+1) * tileSize) - (this.left + maxWidth);
				}
				//y axis
				if(my < 0 && cb.y1 > mb.y1Top){ //if moving up 
					my = (mb.y1Top * tileSize) + this.top;
				}
				else if(my > 0 && cb.y2 < (mb.y2Bottom-1)) { //if moving down
					my = ((mb.y2Bottom-1) * tileSize) + (this.top + this._map.height);
				}
			}
			//modify with new values now
			this.left += mx;
			this.top += my;
			this.right = this.left + maxWidth;
			this.bottom = this.top + this._map.height;
			
			return {x:mx,y:my};
		},
		coordBounds : function() {
			return this.calcCoordBounds(this.left, this.top, this.right, this.bottom);
		},
		calcCoordBounds : function(x1, y1, x2, y2) {
			var tileSize = this._map.tileSizeInPx;
			return {
				x1 : Math.floor(x1 / tileSize),
				y1 : Math.ceil((y1 * -1) / tileSize),
				x2 : Math.ceil(x2 / tileSize),
				y2 : Math.floor((y2 * -1) / tileSize)
			};
		},
		topLeftLoc : function() {
			var tileSize = this._map.tileSizeInPx;
			return [Math.floor(this.left / tileSize),
			Math.ceil(this.top / tileSize)];
		},
		bottomRightLoc : function() {
			var tileSize = this._map.tileSizeInPx;
			return [Math.ceil(this.right / tileSize),
			Math.floor(this.bottom / tileSize)];
		},
		reset : function() {
			this.left = 0;
			this.top = 0;
			this.move(0,0);
		},
		resize : function() {
			//left and top don't change
			this.right = this.left + this._map.width;
			this.bottom = this.top + this._map.height;
		}
	};

	
	var Tile = function(x, y, z, ox, oy, map) {
		this.z = z;
		this.x = x;
		this.y = y;
		this.offsetX = ox;
		this.offsetY = oy;
		this.map = map;
		
		this.id = Tile.idFor(this.x,this.y,this.z);
		this.domElement = document.createElement('div');
		this.domElement.id = this.id;
		
		this.refresh();
		
		var s = this.domElement.style;
		s.position = 'absolute';
		s.width = '' + this.map.tileSizeInPx + 'px';
		s.height = '' + this.map.tileSizeInPx + 'px';
		s.zIndex = '5';
		s.left = ''+ this.offsetX +'px';
		s.top = ''+ this.offsetY +'px';
		if(this.url) {
			s.background = 'transparent url('+ this.url +') no-repeat scroll center';
		}
		
		Dom.addClass(this.domElement, "tile");
		
		// for debuging:
		//this.domElement.appendChild(document.createTextNode(this.id));
			
		this.init();
	};
	Tile.prototype = {
		//blank init that will always get called.  override in sub classes to change defaults
		init : function() {
		},
		refresh : function() {
			var obj = this.map.getTile(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			this.data = obj.data;
			if(this.url) {
				Dom.setStyle(this.domElement, "background", 'transparent url('+ this.url +') no-repeat scroll center');
			}
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
	Tile.idFor = function(x,y,z){
		return 'tile_'+ x + '_' + y + '_' + z;
	};
	
	Mapper.StarTile = function(x, y, z, ox, oy, map) {
		Mapper.StarTile.superclass.constructor.call(this, x, y, z, ox, oy, map);
	};
	Lang.extend(Mapper.StarTile, Tile, {
		init : function() {
			this.domElement.title = this.data ? [this.data.name, " (", this.x, ",", this.y, ",", this.z, ")"].join('') : "Uncharted Space";
			
			if(this.data && this.data.alignments) {
				this.domElement.innerHTML = "";
				var alignment = this.domElement.appendChild(document.createElement('div'));
				Dom.setStyle(alignment, "width", this.map.tileSizeInPx + 'px');
				Dom.setStyle(alignment, "height", this.map.tileSizeInPx + 'px');
				Dom.setStyle(alignment, "z-index", '2');
				Dom.setStyle(alignment, "background", ['transparent url(',Lib.AssetUrl,'star_map/',this.data.alignments,'.png',') no-repeat scroll center'].join(''));
			}
		},
		refresh : function() {
			Mapper.StarTile.superclass.refresh.call(this);
			this.init();
		}
	});
	
	Mapper.PlanetTile = function(x, y, z, ox, oy, map) {
		Mapper.PlanetTile.superclass.constructor.call(this, x, y, z, ox, oy, map);
	};
	Lang.extend(Mapper.PlanetTile, Tile, {
		init : function() {
			this.domElement.title = this.data ? [this.data.name, " ", this.data.level, " (", this.x, ",", this.y, ")"].join('') : "Ground";
			this._createActionIcon();
			if(this.data && this.data.pending_build) {
				this._createCounter();
				this.counter.innerHTML = Lib.formatTime(Math.round(this.data.pending_build.seconds_remaining));
			}
			else if(this.counter) {
				this.counter.parentNode.removeChild(this.counter);
				delete this.counter;
			}
		},
		refresh : function() {
			Mapper.PlanetTile.superclass.refresh.call(this);
			this.init();
		},
		refreshCounter : function() {
			var obj = this.map.getTile(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			this.data = obj.data;
			if(this.data && this.data.pending_build) {
				this._createCounter();
				this.counter.innerHTML = Lib.formatTime(Math.round(this.data.pending_build.seconds_remaining));
			}
		},
		_createCounter : function() {
			if(!this.counter) {
				var counter = this.domElement.appendChild(document.createElement('div'));
				Dom.addClass(counter, "planetMapTileCounter");
				Dom.setStyle(counter, "width", this.map.tileSizeInPx + 'px');
				Dom.setStyle(counter, "height", this.map.tileSizeInPx + 'px');
				this.counter = counter;
			}
		},
		_createActionIcon : function() {
			if(!this.actionIcon) {
				var div = this.domElement.appendChild(document.createElement('div'));
				Dom.addClass(div, "planetMapTileActionContainer");
				Dom.setStyle(div, "width", this.map.tileSizeInPx + 'px');
				Dom.setStyle(div, "height", Math.round(this.map.tileSizeInPx/2) + 'px');
				if(this.data) {
					div.innerHTML = ['<div class="planetMapTileActionLevel">',this.data.level,'</div>'].join('');
				}
				else {
					div.innerHTML = '<div class="planetMapTileActionButton"></div>';
				}
				this.actionIcon = div;
			}
		}
	});
	
	
	Mapper.UnderLayer = function(map) {
		this.map = map;
		this.div = document.createElement('div'); //so we can clone it a lot
	};
	Mapper.UnderLayer.prototype = {
		redraw : function() {
			if( this.containerDiv ) {
				this.map.movableContainer.removeChild( this.containerDiv );
			}
			this.containerDiv = this.div.cloneNode(false);
			Dom.addClass(this.containerDiv, "underlayContainer");
			Dom.setStyle(this.containerDiv, "background", ['transparent url("',this.map._surfaceUrl,'") repeat scroll 0 0'].join(''));
			var s = this.containerDiv.style;
			s.position = 'absolute';
			var bounds = this.map.maxBounds,
				ts = this.map.tileSizeInPx;
			s.left = (bounds.x1Left * ts) + 'px';
			s.top = ((bounds.y1Top*-1) * ts) + 'px';
			s.width = ((bounds.x2Right - bounds.x1Left) * ts) + ts + 'px'; //have to add an extra tile to account for 0 coords
			s.height = ((bounds.y1Top - bounds.y2Bottom) * ts) + ts + 'px';
			s.zIndex = '0';
			
			this.map.movableContainer.appendChild( this.containerDiv );
		}
	};

	Mapper.CoordLayer = function(map) {
		this.map = map;
		this.offsetX = 0;
		this.offsetY = 0;
		this.div = document.createElement('div'); //so we can clone it a lot
	};
	Mapper.CoordLayer.prototype = {
		startDrag : function() {
			if(this.hasAnim) {
				this.xAnimOff.stop();
				this.xAnimOn.animate();
				this.yAnimOff.stop();
				this.yAnimOn.animate();
			}
		},
		endDrag : function() {
			if(this.hasAnim) {
				this.xAnimOff.animate();
				this.yAnimOff.animate();
			}
		},
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
				
			this.offsetX = 0;
			this.offsetY = 0;

			this.offsetCoordsX = Math.ceil( (this.map.visibleArea.left * this.map.tileSizeInPx) / 100 ) * 100; //Math.ceil( ((this.map.visibleArea.left * this.map.tileSizeInPx) + (0.5 * this.map.width)) / 100 ) * 100;
			this.offsetCoordsY = Math.ceil( (this.map.visibleArea.top * this.map.tileSizeInPx) / 100 ) * 100; //Math.ceil( ((this.map.visibleArea.top * this.map.tileSizeInPx) + (0.5 * this.map.height)) / 100 ) * 100;
		
			this.displayXCoords();
			this.displayYCoords();
			
			this.map.movableContainer.appendChild( this.containerDiv );
			
			this.move(0,0);
			this.endDrag();
		},
		resize : function() {
			var pxSize = this.map.tileSizeInPx,
				size = pxSize + "px",
				xEls = Sel.query("div.coordX", this.xCoords);
			Dom.batch(xEls, function(el){
				Dom.setStyle(el, "width", size);
				Dom.setStyle(el, "left", (el.xIndex * pxSize) + "px");
			}, this, true);
			
			var negPxSize = pxSize * -1,
				thrd = Math.ceil(pxSize / 3),
				sizeLeft = (pxSize - thrd) + "px",
				thrdTxt = thrd + "px",
				yEls = Sel.query("div.coordY", this.yCoords);
			Dom.batch(yEls, function(el){
				Dom.setStyle(el, "padding-top", thrdTxt);
				Dom.setStyle(el, "height", sizeLeft);
				Dom.setStyle(el, "top", (el.yIndex * negPxSize) + "px");
			}, this, true);
		},
		displayXCoords : function() {
			var anchor = this.div.cloneNode(false);
			Dom.addClass(anchor, "coordTop");

			var pxSize = this.map.tileSizeInPx,
				size = pxSize + "px",
				xMin = this.map.maxBounds.x1Left,
				xMax = this.map.maxBounds.x2Right;
			for(var x=xMin; x<=xMax; x++) {
				var num = this.div.cloneNode(false);
				num.innerHTML = x;
				num.xIndex = x;
				Dom.addClass(num, "coordX");
				Dom.setStyle(num, "width", size);
				Dom.setStyle(num, "left", (x * pxSize) + "px");
				anchor.appendChild(num);
			}
			this.xCoords = this.containerDiv.appendChild(anchor);
			if(!YAHOO.env.ua.ie) {
				this.xAnimOff = new Util.Anim(this.xCoords, {opacity:{to:0.3}}, 10); 
				this.xAnimOn = new Util.Anim(this.xCoords, {opacity:{to:1.0}}, 0.2);
				this.hasAnim = 1;
			}
		},
		displayYCoords : function() {
			var anchor = this.div.cloneNode(false);
			Dom.addClass(anchor, "coordLeft");

			var pxSize = this.map.tileSizeInPx,
				negPxSize = pxSize * -1,
				thrd = Math.ceil(pxSize / 3),
				sizeLeft = (pxSize - thrd) + "px",
				thrdTxt = thrd + "px",
				yMin = this.map.maxBounds.y2Bottom,
				yMax = this.map.maxBounds.y1Top;
			for(var y=yMax; y>=yMin; y--) {
				var num = this.div.cloneNode(false);
				num.innerHTML = y;
				num.yIndex = y;
				Dom.addClass(num, "coordY");
				Dom.setStyle(num, "padding-top", thrdTxt);
				Dom.setStyle(num, "height", sizeLeft);
				Dom.setStyle(num, "top", (y * negPxSize) + "px");
				anchor.appendChild(num);
			}
			this.yCoords = this.containerDiv.appendChild(anchor);
			if(!YAHOO.env.ua.ie) {
				this.yAnimOff = new Util.Anim(this.yCoords, {opacity:{to:0.3}}, 10); 
				this.yAnimOn = new Util.Anim(this.yCoords, {opacity:{to:1.0}}, 0.2); 
				this.hasAnim = 1;
			}
		}
	};

	Mapper.TileLayer = function(map, visibleArea, TileConstructor){
		this.tileCache = {};
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
		s.zIndex = '10';
		// for debuging:
		// s.width = ''+visibleArea.width+'px';
		// s.height = ''+visibleArea.height+'px';
		// s.backgroundColor = '#477';
		this.tileContainer = map.movableContainer.appendChild( tileContainer );
		
		this.render();
		
	};
	Mapper.TileLayer.prototype = {
		findTile : function(x,y,zoom){
			return this.tileCache[Tile.idFor(x,y,zoom)];
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
		showTiles : function(refresh) {
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
					else if(refresh) {
						tile.refresh();
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
			if(!this.map.keepTilesOutOfBounds) {
				this.removeAllTilesNotContainedIn( tiles );
			}
		},
		render : function() {
			var bounds = this.visibleArea.coordBounds(),
				eb = this.map.getBounds();

			/*YAHOO.log([
				"vis-x1[",bounds.x1,"] >= exi-x1[",eb.x1Left,"] && ",
				"vis-x2[",bounds.x2,"] <= exi-x2[",eb.x2Right,"] && ",
				"vis-y1[",bounds.y1,"] <= exi-y1[",eb.y1Top,"] && ",
				"vis-y2[",bounds.y2,"] >= exi-y2[",eb.y2Bottom,"] "
				].join('')
			);*/

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
		},
		clear : function() {
			this.removeAllTilesNotContainedIn({});
		},
		reset : function() {
			this.removeAllTilesNotContainedIn({});
			this.tileCache = {};
		}
	};

	
	
	var Map = function( divId ) {
		var IE='\v'=='v'; // detect IE
		this.IE = IE;
		
		//this.tileSizeInPx = undefined;
		this.maxZoom = 15;
		this.minZoom = -15;
		//this.visibleArea = undefined;
		this.centerX = 0;
		this.centerY = 0;
		this.diffX = 0;
		this.diffY = 0;
		this._pathsAndPolygons = {};
		this._projectedPoints = {};
		this.tileCache = {};
		this.bounds = {};
		this.maxBounds = {};
		
		this.mapDiv = document.getElementById( divId );
		this.mapDiv.style.overflow = "hidden";
		this.movableContainer = new Mapper.MovableContainer( this.mapDiv );
		
		this.init();

		this.coordLayer = new Mapper.CoordLayer(this);
		
		var ua = navigator.userAgent;
		if(ua.match(/iPhone/i) || ua.match(/iPod/i)) {
			this.controller = new Mapper.iPhoneController( this );
		}
		else {
			this.controller = new Mapper.TraditionalController( this );
		}
	};
	Map.prototype = {
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
			this.refresh();
		},
		zoomOut : function() {
			if( this.zoom <= this.minZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom - 1 );
			this.refresh();
		},
		setTileSizeInPx : function( size ) {
			this.tileSizeInPx = size;
			//this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
		},
		/*setCenter : function(x,y){
			this.centerX = x;
			this.centerY = y;
		},*/
		addElement : function( p ) {
			this._pathsAndPolygons[p.id] = p;
		},
		removeElement : function( p ) {
			delete this._pathsAndPolygons[p.id];
		},
		moveByPx : function( x,y ) {
			var n = this.visibleArea.move( x*-1,y*-1 );
			//move values back to positive for us to use
			x = n.x*-1;
			y = n.y*-1;

			this.movableContainer.move( x,y );
			this.coordLayer.move( x*-1,y*-1 );
			
			this.diffX += x;
			this.diffY += y;
			this.centerX -= x;
			this.centerY += y;
			var checkTileSize = this.tileSizeInPx; //Math.floor(this.tileSizeInPx * .75); //load the tiles a bit early
			if( Math.abs(this.diffX) > checkTileSize || Math.abs(this.diffY) > checkTileSize) {
				//YAHOO.log([checkTileSize, this.diffX, this.diffY], "info", "Map.moveByPx");
				//reset diff's
				this.diffX = this.diffY = 0;
				this.tileLayer.render();
				
				/*if(!this.IE) {
					this.canvasTileLayer.showTiles();
				}*/
			}
			return {"x":x,"y":y};
		},
		setZoomLevel : function( level ) {
			this.zoom = level*1;
			this.controller.setZoomDisplay(this.zoom);
			if(this.tileLayer) {
				this.tileLayer.clear();
			}
		},
		redraw : function() {
			this.width = this.mapDiv.offsetWidth;
			this.height = this.mapDiv.offsetHeight;
			this.centerX = Math.floor(0.5 * this.width);
			this.centerY = Math.floor(0.5 * this.height);	
			
			this.movableContainer.reset();
			this.visibleArea = new Mapper.VisibleArea(this);

			this.coordLayer.redraw();
			
			if( this.tileLayer ) {
				this.tileLayer.destroy();		
			}
			this.tileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), this.Tile);
		},
		refresh : function() {
			this.tileLayer.render();
		},
		resize : function() {
			this.width = this.mapDiv.offsetWidth;
			this.height = this.mapDiv.offsetHeight;
			
			this.visibleArea.resize();
			
			this.tileLayer.showTiles();
		},

		// override these for specific tile handling
		getTile  : function(x, y, z){
		},
		getBounds : function() {
		},
		updateBounds : function(oTile) {
		},
		addTileData : function(aTiles) {
		}
	};
	
	Mapper.StarMap = function( divId ) {
		Mapper.StarMap.superclass.constructor.call(this, divId);
	};
	Lang.extend(Mapper.StarMap, Map, {
		init : function() {
			this.maxZoom = 15;
			this.minZoom = -15;
			this.maxBounds = {x1Left:-15,x2Right:15,y1Top:15,y2Bottom:-15};
			this.requestQueue = [];
		
			this.Tile = Mapper.StarTile;

			this.setTileSizeInPx(100);
		},
		setCenterTo : function(locX, locY) {
			if(Lang.isNumber(locX) && Lang.isNumber(locY) && this.tileLayer) {
				//these are the offsets for the star
				var otherWidth = this.centerX,
					otherHeight = this.centerY,
					baseTile = this.tileLayer.baseTileLoc;
				var locXm = (locX - baseTile[0]),
					locYm = ((locY * -1) - baseTile[1]);
					
				var locXmPx = locXm * this.tileSizeInPx,
					locYmPx = locYm * this.tileSizeInPx;
					
				var ox = locXmPx - otherWidth,
					oy = locYmPx - otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);
			}
		},
		getTile : function(x, y, z){
			var zSet = this.tileCache[z],
				xSet = zSet ? zSet[x] : null,
				star = xSet ? xSet[y] : null;
			
			if(star) {
				return {data:star, url:[Lib.AssetUrl,'star_map/',star.color,'.png'].join('')};
			}
			else {
				return {blank:true, url:Lib.AssetUrl + 'ui/blankstar.png'};
			}
		},
		getTileData : function(callback, x1, x2, y1, y2) {
			var xDiff = Math.abs(x2-x1),
				yDiff = Math.abs(y2-y1);
				
			if((xDiff * yDiff) > 100) { //if out of bounds split and try again
				var half;
				if(xDiff > 0) { //make sure x diff isn't zero so we can split it in half, other wise use Y axis
					half = Math.floor(xDiff/2);
					this.getTileData(callback, x1, x1+half, y1, y2);
					this.getTileData(callback, x2-half, x2, y1, y2);
				}
				else {
					half = Math.floor(yDiff/2);
					this.getTileData(callback, x1, x2, y1, y1-half);
					this.getTileData(callback, x1, x2, y2+half, y2);
				}
			}
			/*else if(Util.Connect.isCallInProgress(this.currentRequest)) {
				this.requestQueue.push([callback, x1, x2, y1, y2]);
			}*/
			else {
				var data = {
					session_id : Game.GetSession(""),
					x1 : x1, 
					x2 : x2, 
					y1 : y1, 
					y2 : y2, 
					z : this.zoom
				};
				YAHOO.log(data);
				//now call back for data
				//this.currentRequest = 
				Game.Services.Maps.get_stars(data,{
					success : function(o){
						YAHOO.log(["GET_STARS ", o]);
						if(o && o.result) {
							Game.ProcessStatus(o.result.status);
							this.addTileData(o.result.stars);
							callback.success.call(callback.scope || this, callback.argument);
						}
						//this.currentRequest = undefined;
						/*var qi = this.requestQueue.pop();
						if(qi) {
							this.getTileData.apply(this, qi);
						}*/
					},
					failure : function(o){
						YAHOO.log(["GET_STARS FAILED ", o.error.message, o]);
						callback.success.call(callback.scope || this, callback.argument);
						//this.currentRequest = undefined;
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
			//force numbers
			oStar.z *= 1;
			oStar.x *= 1;
			oStar.y *= 1;
			
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
			//var startZoomLevel = 0;
			for(var i=0; i<aStars.length; i++) {
				var star = aStars[i];
				if(!this.tileCache[star.z]) {
					this.tileCache[star.z] = {};
				}
				if(!this.tileCache[star.z][star.x]) {
					this.tileCache[star.z][star.x] = {};
				}
				this.tileCache[star.z][star.x][star.y] = star;
				/*startZoomLevel = star.z;
				if(star.alignments == "self") {
					this.currentSystem = star;
					this.currentSystem.x *= 1;
					this.currentSystem.y *= 1;
				}*/
				this.updateBounds(star);
			}
			//return startZoomLevel;
		},
		reset : function() {
			this.tileCache = {};
			this.bounds = {};
			this.tileLayer.reset();
		}
	});
	
	Mapper.PlanetMap = function( divId, surfaceUrl ) {
		Mapper.PlanetMap.superclass.constructor.call(this, divId);
		this._surfaceUrl = surfaceUrl;
	};
	Lang.extend(Mapper.PlanetMap, Map, {
		_setTileSizeByZoom : function() {
			switch(this.zoom){
				case 2:
					this.setTileSizeInPx(430);
					break;
				case 1:
					this.setTileSizeInPx(320);
					break;
				case -1:
					this.setTileSizeInPx(110);
					break;
				default:
					this.setTileSizeInPx(220);
					break;
			}
		},
		init : function() {
			this.maxZoom = 2;
			this.minZoom = -1;
			
			this.bounds = {x1Left:-5,x2Right:5,y1Top:5,y2Bottom:-5};
			this.maxBounds = {x1Left:-5,x2Right:5,y1Top:5,y2Bottom:-5};
		
			this.Tile = Mapper.PlanetTile;
			this.keepTilesOutOfBounds = true;
			
			this.underLayer = new Mapper.UnderLayer(this);
			
			this.zoom = 0;
			this._setTileSizeByZoom();
		},
		redraw : function() {
			Mapper.PlanetMap.superclass.redraw.call(this);
			this.underLayer.redraw();
		},
		setCenterToCommand : function() {
			if(this.command && this.tileLayer) {
				var otherWidth = this.centerX,
					otherHeight = this.centerY;
				var ox = (this.command.x - this.tileLayer.baseTileLoc[0]) * this.tileSizeInPx - otherWidth,
					oy = ((this.command.y * -1) - this.tileLayer.baseTileLoc[1]) * this.tileSizeInPx - otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);
			}
		},
		getTile : function(x, y, z){
			var ySet = this.tileCache[x],
				building = ySet ? ySet[y] : null;
			
			if(building && building.image) {
				var imgSize = "";
				switch(this.zoom) {
					case 2:
						imgSize = "400/";
						break;
					case 1:
						imgSize = "300/";
						break;
					case -1:
						imgSize = "100/";
						break;
				}
				return {blank:building.level == 0, data:building, url:[Lib.AssetUrl,'planet_side/',imgSize,building.image,'.png'].join('')};
			}
			else {
				return {blank:true};
			}
		},
		getTileData : function(callback, x1, x2, y1, y2) {
			//since we should have all the data already, just call success
			callback.success.call(callback.scope || this, callback.argument);
		},
		getBounds : function() {
			return this.bounds;
		},
		setSurfaceUrl : function(surfaceUrl) {
			this._surfaceUrl = surfaceUrl;
			if(this.underLayer) {
				this.underLayer.redraw();
			}
		},
		//don't update bounds on plant.  We have all data at start
		/*updateBounds : function(oTile) {
		},*/
		addTileData : function(oTiles) {
			var startZoomLevel = 0;
			for(var tKey in oTiles) {
				if(oTiles.hasOwnProperty(tKey)){
					var tile = oTiles[tKey];
					tile.id = tKey;
					if(tile.url == "/planetarycommand") {
						this.command = tile;
						this.command.x *= 1;
						this.command.y *= 1;
					}
					if(!this.tileCache[tile.x]) {
						this.tileCache[tile.x] = {};
					}
					if(!this.tileCache[tile.x][tile.y]) {
						this.tileCache[tile.x][tile.y] = {};
					}
					this.tileCache[tile.x][tile.y] = tile;
				}
			}
			return startZoomLevel;
		},
		addSingleTileData : function(oBuilding) {
			if(oBuilding.url == "/planetarycommand") {
				this.command = oBuilding;
				this.command.x *= 1;
				this.command.y *= 1;
			}
			if(!this.tileCache[oBuilding.x]) {
				this.tileCache[oBuilding.x] = {};
			}
			if(!this.tileCache[oBuilding.x][oBuilding.y]) {
				this.tileCache[oBuilding.x][oBuilding.y] = {};
			}
			this.tileCache[oBuilding.x][oBuilding.y] = oBuilding;
		},
		refresh : function() {			
			this._setTileSizeByZoom();
			
			this.redraw();
			
			this.setCenterToCommand();
		},
		refreshTile : function(building) {
			if(this.tileLayer) {
				this.addSingleTileData(building);
				var tile = this.tileLayer.findTile(building.x,building.y,this.zoom);
				if(tile) {
					tile.refresh();
				}
			}
		},
		refreshTileCounter : function(building) {
			if(this.tileLayer) {
				this.addSingleTileData(building);
				var tile = this.tileLayer.findTile(building.x,building.y,this.zoom);
				if(tile) {
					tile.refreshCounter();
				}
			}
		},
		reset : function() {
			this.tileCache = {};
			this.tileLayer.reset();
		}
	});

	
	
	Mapper.TraditionalController = function( map ) {
		this.map = map;
		this.dd = new YAHOO.util.DragDrop(map.mapDiv);
		this.dd.subscribe("dragEvent", this.moveMap, this, true);
		this.dd.subscribe("startDragEvent", this.startDrag, this, true);
		this.dd.subscribe("endDragEvent", this.endDrag, this, true);
		
		if((map.maxZoom - map.minZoom) != 0) {
			// add zoom buttons
			var zoomInButton = document.createElement('div');
			zoomInButton.id = 'mapiator_zoom_in';
			zoomInButton = map.mapDiv.appendChild( zoomInButton );
			
			this.zoomDisplay = document.createElement('div');
			this.zoomDisplay.id = 'mapiator_zoom_display';
			map.mapDiv.appendChild( this.zoomDisplay );
			
			var zoomOutButton = document.createElement('div');
			zoomOutButton.id = 'mapiator_zoom_out';
			zoomOutButton = map.mapDiv.appendChild( zoomOutButton );
			
			zoomInButton.onmouseup = function(){
				map.zoomIn();
				if(map.zoom == map.maxZoom) {
					Dom.setStyle(zoomInButton,"visibility","hidden");
				}
				if(map.zoom > map.minZoom) {
					Dom.setStyle(zoomOutButton,"visibility","visible");
				}				
			};

			zoomOutButton.onmouseup = function(){
				map.zoomOut();
				if(map.zoom == map.minZoom) {
					Dom.setStyle(zoomOutButton,"visibility","hidden");
				}
				if(map.zoom < map.maxZoom) {
					Dom.setStyle(zoomInButton,"visibility","visible");
				}	
			};

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
		setZoomDisplay : function(zoom) {
			if(this.zoomDisplay) {
				this.zoomDisplay.innerHTML = zoom;
			}
		},
		startDrag : function(e){
			clearTimeout(this._timeout);
			this.xmove = this.ymove = undefined;
			this._dragging = true;
			this.map.coordLayer.startDrag();
		},
		moveMap : function (oArgs) {
			Event.preventDefault(oArgs.e);
			
			var x = Event.getPageX(oArgs.e),
				y = Event.getPageY(oArgs.e);
				
			if(this.xmove) {
				this.map.moveByPx( x - this.xmove, y - this.ymove );
			}
			this.xmove = x;
			this.ymove = y;
		},
		endDrag : function(e){
			var oSelf = this;
			this._timeout = setTimeout(function(){
				clearTimeout(oSelf._timeout);
				oSelf.xmove = oSelf.ymove = undefined;
				oSelf.map.coordLayer.endDrag();
				oSelf._dragging = false;
			}, 500);
		},
		isDragging : function() {
			return this._dragging; // Math.abs(this.xmove) > 5;
		}
	};

	Mapper.iPhoneController = function(map) {
		this.map = map;
		this.currentX = 0;
		this.currentY = 0;
		
		Event.on(map.mapDiv, 'touchstart', this.touchStart, this, true);
		Event.on(map.mapDiv, 'touchend', this.touchEnd, this, true);
		Event.on(map.mapDiv, 'touchmove', this.touchMove, this, true);
		
		if((map.maxZoom - map.minZoom) != 0) {
			Event.on(map.mapDiv, 'gestureend', this.gestureEnd, this, true);
		}
	};
	Mapper.iPhoneController.prototype = {
		touchStart : function(e){
			if(e.touches.length == 1){ // Only deal with one finger
				var touch = e.touches[0]; // Get the information for finger #1
				this.currentX = touch.pageX;
				this.currentY = touch.pageY;
			} 
		},
		touchEnd : function(e){
			if(e.touches.length == 1){ // Only deal with one finger
				this.currentX = 0;
				this.currentY = 0;
			} 
		},
		touchMove : function(e){
			if(e.touches.length == 1){
				e.preventDefault();
				var touch = e.touches[0];
				diffX = touch.pageX - this.currentX;
				diffY = touch.pageY - this.currentY;

				this.map.moveByPx(diffX,diffY);

				this.currentX = touch.pageX;
				this.currentY = touch.pageY;
			}
		},
		gestureEnd : function(e){
			// note: this does not work if the default is prevented!
			if( e.scale > 1) { this.map.zoomIn(); }
			if( e.scale < 1) { this.map.zoomOut(); }
		},
		isDragging : function() {
			return false;
		}
	};
	
	YAHOO.lacuna.Mapper = Mapper;
})();
YAHOO.register("mapper", YAHOO.lacuna.Mapper, {version: "1", build: "0"}); 

}