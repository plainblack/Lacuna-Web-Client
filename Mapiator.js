YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Mapiator == "undefined" || !YAHOO.lacuna.Mapiator) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var Mapiator = {};
	Mapiator.util = {
		modulo: function(val, mod){
			var res = val%mod;
			if(res < 0) {
				res += mod;
			}
			return res;
		},
		byId: function(str) {
			return document.getElementById(str);
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
		},
		mapArray: function(array, fun) {
			var res = [];
			for(var i=0; i<array.length; i++) {
				res[i] = fun(array[i]);
			}
			return res;
		},
		addCssRule: function(name, css, callback) {
			var ss = document.styleSheets[0];
			if (ss.addRule) { // Browser is IE?
				var selectors = name.split(',');
				for( var i in selectors ) {
					ss.addRule(selectors[i], css, 0);
				}
			} 
			else {
				ss.insertRule(name+'{'+css+'}', 0);
			}
		}
		/*gudermann: function(y) {
			return 2*Math.atan(Math.exp(y)) - 0.5*Math.PI;
		},
		inverseGudermann: function(rho) { // inverse of the Gudermannian function
			return Math.log(Math.tan(Math.PI*0.25 + rho*0.5));
		},
		project: function(lat, lng){
			var rho = (lat*Math.PI/180.0);
			return [lng/360.0, -0.5*Mapiator.util.inverseGudermann(rho)/Math.PI];
		},
		inverseProject: function(x, y) {
			var yScaled = -2*Math.PI*y;
			return [180*Mapiator.util.gudermann(yScaled)/Math.PI, x*360];
		},
		pixelCoordinates: function( lat, lng, mapExtendInPx ) {
			var p = Mapiator.util.project(lat, lng);
			return [
					Math.floor( (p[0]+0.5)*mapExtendInPx ),
					Math.floor( (p[1]+0.5)*mapExtendInPx )
			];
		},*/
	};
	
	Mapiator.MovableContainer = function( parentEl ) {
		var div = document.createElement('div');
		Dom.addClass(div,"movableContainer");
		div.style.position = 'absolute';
		
		this.move = function( x,y ) {
			this.offsetX += x;
			this.offsetY += y;
			div.style.left = ''+ this.offsetX +'px';
			div.style.top  = ''+ this.offsetY +'px';
		};
		
		this.reposition = function( mox, moy ) {
			this.offsetX = 0;
			this.offsetY = 0;
			this.move(0,0);
			
			this.offsetToLeftMapBorder = mox;
			this.offsetToTopMapBorder = moy;
		};
		
		this.appendChild = function( c ) {
			return div.appendChild( c );
		};
		
		this.removeChild = function( c ) {
			return div.removeChild( c );
		};
		
		this.reposition();
		parentEl.appendChild( div );
	};
	
	Mapiator.VisibleArea = function(map) {
		this.left = Math.round( (map.centerX * map.tileSizeInPx) - (0.5 * map.width) );
		this.top = Math.round( (map.centerY * map.tileSizeInPx) - (0.5 * map.height) );
		this.width = map.width;
		this.height = map.height;
		this.move = function(mx,my) {
			this.left += mx;
			this.top += my;
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
		};
		this.centerCoords = function() {
			var hw = 0.5*map.width;
			return [Math.floor((this.left + hw) / map.tileSizeInPx),
			Math.floor(((this.top * -1) - hw) / map.tileSizeInPx)];
			
			/*return util.inverseProject(
				(this.centerX()-0.5*mapExtendInPx)/mapExtendInPx,
				(this.centerY()-0.5*mapExtendInPx)/mapExtendInPx
			);*/
		};
		this.coordBounds = function() {
			return {
				x1 : Math.floor(this.left / map.tileSizeInPx),
				y1 : Math.floor((this.top * -1) / map.tileSizeInPx),
				x2 : Math.floor(this.right / map.tileSizeInPx),
				y2 : Math.floor((this.bottom * -1) / map.tileSizeInPx)
			};
		};
		this.topLeftLoc = function() {
			return [Math.floor(this.left / map.tileSizeInPx),
			Math.floor(this.top / map.tileSizeInPx)];
		};
		this.move(0,0);
	};

	Mapiator.StdTile = function(x, y, z, ox, oy, map) {
		this.z = z;
		this.x = x;
		this.y = y;
		this.offsetX = ox;
		this.offsetY = oy;
		var obj = map.getStar(x,y,z);
		this.blank = obj.blank;
		this.url = obj.url;
		this.starData = obj.star;
		this.id = Mapiator.StdTile.idFor(x,y,z);
		this.domElement = document.createElement('div');
		this.domElement.id = this.id;
		var s = this.domElement.style;
		s.position = 'absolute';
		s.width = '' + map.tileSizeInPx + 'px';
		s.height = '' + map.tileSizeInPx + 'px';
		s.zIndex = '1';
		s.left = ''+ this.offsetX +'px';
		s.top = ''+ this.offsetY +'px';
		s.background = 'transparent url('+ this.url +') no-repeat scroll center';
		
		if(this.starData && this.starData.alignments) {
			var alignment = this.domElement.appendChild(document.createElement('div'));
			Dom.setStyle(alignment, "width", map.tileSizeInPx + 'px');
			Dom.setStyle(alignment, "height", map.tileSizeInPx + 'px');
			Dom.setStyle(alignment, "z-index", '2');
			Dom.setStyle(alignment, "background", ['transparent url(',Game.AssetUrl,'map/',this.starData.alignments,'.png',') no-repeat scroll center'].join(''));
		}
		
		// for debuging:
		//this.domElement.appendChild(document.createTextNode(this.id));
	};
	Mapiator.StdTile.prototype = {
		refresh : function(map) {
			var obj = map.getStar(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			this.starData = obj.star;
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
	Mapiator.StdTile.idFor = function(x,y,z){
		return 'std_tile_'+ x + '_' + y + '_' + z;
	};

	Mapiator.OverlayLayer = function( map ){
		var containerDiv;
		var overlays = [];
		
		function displayOverlay( o ) {
			//var p = Mapiator.util.pixelCoordinates(o.lat,o.lng, map.mapExtendInPx);
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

			Mapiator.util.forEach(overlays, displayOverlay);
		};
	};
	
	Mapiator.CoordLayer = function(map) {
		this.map = map;
		this.offsetX = 0;
		this.offsetY = 0;
		this.div = document.createElement('div'); //so we can clone it a lot
	};
	Mapiator.CoordLayer.prototype = {
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

			this.offsetCoordsX = Math.ceil( ((this.map.centerX * this.map.tileSizeInPx) + (0.5 * this.map.width)) / 100 ) * 100;
			this.offsetCoordsY = Math.ceil( ((this.map.centerY * this.map.tileSizeInPx) + (0.5 * this.map.height)) / 100 ) * 100;
		
			this.displayXCoords();
			this.displayYCoords();
			
			this.map.movableContainer.appendChild( this.containerDiv );
			
			this.move(0,0);
		},
		displayXCoords : function() {
			var container = this.div.cloneNode(false);
			Dom.addClass(container, "coordTop");
			var s = container.style;
			s.position = 'absolute';
			s.top = '0';
			s.width = this.map.width + 'px';
			s.height = '30px';
			s.background = 'red';
			for(var x=-10; x<=10; x++) {
				var num = this.div.cloneNode(false);
				num.innerHTML = x;
				Dom.setStyle(num, "text-align", "center");
				Dom.setStyle(num, "vertical-align", "middle");
				Dom.setStyle(num, "background", "blue");
				Dom.setStyle(num, "color", "white");
				Dom.setStyle(num, "border", "1px solid white");
				Dom.setStyle(num, "width", this.map.tileSizeInPx + "px");
				Dom.setStyle(num, "height", "30px");
				Dom.setStyle(num, "position", "absolute");
				Dom.setStyle(num, "top", "0");
				Dom.setStyle(num, "left", (x * 100) + "px");
				container.appendChild(num);
			}
			this.xCoords = this.containerDiv.appendChild(container);
		},
		displayYCoords : function() {
			var container = this.div.cloneNode(false);
			Dom.addClass(container, "coordLeft");
			var s = container.style;
			s.position = 'absolute';
			s.left = '0';
			s.width = '30px';
			s.height = this.map.height + 'px';
			s.background = 'red';
			for(var y=10; y>=-10; y--) {
				var num = this.div.cloneNode(false);
				num.innerHTML = y;
				Dom.setStyle(num, "text-align", "center");
				Dom.setStyle(num, "vertical-align", "middle");
				Dom.setStyle(num, "background", "green");
				Dom.setStyle(num, "color", "white");
				Dom.setStyle(num, "border", "1px solid white");
				Dom.setStyle(num, "width", "30px");
				Dom.setStyle(num, "height", this.map.tileSizeInPx + "px");
				Dom.setStyle(num, "position", "absolute");
				Dom.setStyle(num, "top", (y * -100) + "px");
				Dom.setStyle(num, "left", "0");
				container.appendChild(num);
			}
			this.yCoords = this.containerDiv.appendChild(container);
		}
	};

	Mapiator.TileLayer = function(map, visibleArea, TileConstructor){
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
		s.left = '-'+ offsetX + 'px';
		s.top = '-'+ offsetY + 'px';
		s.zIndex = '0';
		// for debuging:
		// s.width = ''+visibleArea.width+'px';
		// s.height = ''+visibleArea.height+'px';
		// s.backgroundColor = '#477';
		this.tileContainer = map.movableContainer.appendChild( tileContainer );
		
		this.render();
		
	};
	Mapiator.TileLayer.prototype = {
		tileCache : {},
		findTile : function(x,y,zoom){
			return this.tileCache[this.TileConstructor.idFor(x,y,zoom)];
		},
		tileAtPosition : function(x,y){
			var tileSizeInPx = this.map.tileSizeInPx;
			return [Math.floor(x/tileSizeInPx), Math.floor(y/tileSizeInPx)];
		},
		_getStars : function(x1, x2, y1, y2, z) {
			if(!Util.Connect.isCallInProgress(this.currentRequest)) {
				var data = {
					session_id : Cookie.getSub("lacuna","session") || "",
					x1 : x1, 
					x2 : x2, 
					y1 : y1, 
					y2 : y2, 
					z : z
				};
				console.log(data);
				//show anything we already have
				this._showCachedTiles();
				//now call back for data
				this.currentRequest = Game.Services.Maps.get_stars(data,{
					success : function(o){
						console.log("GET_STARS ", o);
						this.currentRequest = undefined;
						this.map.addStarData(o.result.stars);
						this.showTiles();
					},
					failure : function(o){
						console.log("GET_STARS FAILED ", o.error.message, o);
						this.currentRequest = undefined;
						this.showTiles(); //show any tiles we do have
					},
					timeout:5000,
					scope:this
				});
			}
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
							tile.refresh(this.map);
						}
						else if(tile.notInDom() && tile.domElement) {
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
					else if(tile.blank) {
						tile.refresh(this.map);
					}
					else if(!tile.inDom && tile.domElement) {
						this.tileContainer.appendChild( tile.domElement );	
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
				this._getStars(bounds.x1, bounds.x2, bounds.y1, bounds.y2, this.map.zoom);
			}
		},
		removeAllTilesNotContainedIn : function( hash ) {
			for( var key in this.tileCache ){
				if( !hash[key] ){
					var tile = this.tileCache[key];
					tile.remove();
				}
			}
		},
		destroy : function() {
			this.removeAllTilesNotContainedIn({});
			//this.map.movableContainer.removeChild( this.tileContainer );
			this.tileContainer.parentNode.removeChild(this.tileContainer);
			delete this["tileCache"];
		}
	};

	Mapiator.Map = function( divId ) {
		var IE='\v'=='v'; // detect IE
		this.IE = IE;
		var ua = navigator.userAgent;
		this.iPhone = ua.match(/iPhone/i) || ua.match(/iPod/i);
		
		this.mapDiv = Mapiator.util.byId( divId );
		this.mapDiv.style.overflow = "hidden";
		this.movableContainer = new Mapiator.MovableContainer( this.mapDiv );

		this.setTileSizeInPx(256);
		
		this.overlayLayer = new Mapiator.OverlayLayer(this);
		this.coordLayer = new Mapiator.CoordLayer(this);
		this.controller = this.iPhone ? new Mapiator.iPhoneController( this ) : new Mapiator.TraditionalController( this );
	};
	/*
		YAHOO.lacuna.StarMap._map.redraw();
	*/
	Mapiator.Map.prototype = {
		tileSizeInPx : undefined,
		maxZoom : 10,
		minZoom : -10,
		visibleArea : undefined,
		centerX : 0,
		centerY : 0,
		diffX : 0,
		diffY : 0,
		_pathsAndPolygons : {},
		_projectedPoints : {},
		starCache : {},
		bounds : {},
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
		setCenterToCurrentPlanet : function() {
			if(this.currentSystem) {
				//these are the offsets for the star
				var ox = (this.currentSystem.x - this.tileLayer.baseTileLoc[0]) * this.tileSizeInPx,
					oy = ((this.currentSystem.y * -1) - this.tileLayer.baseTileLoc[1]) * this.tileSizeInPx;
				//now we change them slightly to get where we're going
				this.moveByPx(Math.floor(ox/2), Math.floor(oy/2) * -1);
			}
		},
		getStar : function(x, y, z){
			var ySet = this.starCache[x],
				zSet = ySet ? ySet[y] : null,
				star = zSet ? zSet[z] : null;
			
			if(star) {
				return {star:star, url:[Game.AssetUrl,'map/',star.color,'.png'].join('')};
			}
			else {
				return {blank:true, url:Game.AssetUrl + 'ui/blankstar.png'};
			}
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
			//var halfTileSize = this.tileSizeInPx / 2; //load the tiles a bit early
			if( Math.abs(this.diffX) > this.tileSizeInPx || Math.abs(this.diffY) > this.tileSizeInPx) {
				console.log(this.diffX, this.diffY);
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
		getBounds : function() {
			return this.bounds[this.zoom] || {x1Left:0,x2Right:0,y1Top:0,y2Bottom:0};
		},
		
		_updateBounds : function(oStar) {
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
		addStarData : function(aStars) {
			var startZoomLevel = 0;
			for(var i=0; i<aStars.length; i++) {
				var star = aStars[i];
				if(!this.starCache[star.x]) {
					this.starCache[star.x] = {};
				}
				if(!this.starCache[star.x][star.y]) {
					this.starCache[star.x][star.y] = {};
				}
				this.starCache[star.x][star.y][star.z] = star;
				startZoomLevel = star.z;
				if(star.alignments == "self") {
					this.currentSystem = star;
				}
				this._updateBounds(star);
			}
			return startZoomLevel;
		},
		redraw : function() {			
			// deprecated:
			this.width = this.mapDiv.offsetWidth;
			this.height= this.mapDiv.offsetHeight;
			
			this.visibleArea = new Mapiator.VisibleArea(this);
			this.movableContainer.reposition( this.visibleArea.left, this.visibleArea.top );
			this.coordLayer.redraw(this.visibleArea.left, this.visibleArea.top);
			
			if( this.tileLayer ) {
				this.tileLayer.destroy();		
			}
			this.tileLayer = new Mapiator.TileLayer(this, Mapiator.util.clone(this.visibleArea), Mapiator.StdTile);
			
			/*if(!window.debugPD) {
				if( this.canvasTileLayer ) {
					this.canvasTileLayer.destroy();
				}
				this.canvasTileLayer = new Mapiator.TileLayer(this, Mapiator.util.clone(this.visibleArea), Mapiator.CanvasTile);
			}*/
				
			this.overlayLayer.redraw();
		}
	};

	Mapiator.TraditionalController = function( map ) {
		this.map = map;
		
		Event.on(map.mapDiv, "mousedown", function(e){
			Event.preventDefault(e);
			
			Event.on(document, "mouseup", this.disableDrag, this, true);
			//document.onmouseup = disableDrag;
			Event.on(document, "mousemove", this.moveMap, this, true);
			//document.onmousemove = moveMap;
		}, this, true);
		
		// double click :
		Event.on(map.mapDiv, "dblclick", function(e){
			console.log(e);
		}, this, true);

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
	};
	Mapiator.TraditionalController.prototype = {
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
	}

	Mapiator.iPhoneController = function(map) {
		var currentX, currentY;
		var mapDiv = map.mapDiv;
		mapDiv.addEventListener( 'touchstart', function(e){
			if(e.touches.length == 1){ // Only deal with one finger
				var touch = e.touches[0]; // Get the information for finger #1
				currentX = touch.pageX;
				currentY = touch.pageY;
			} 
		});

		mapDiv.addEventListener( 'touchmove', function(e){
			e.preventDefault();
			if(e.touches.length == 1){
				var touch = e.touches[0];
				diffX = touch.pageX - currentX;
				diffY = touch.pageY - currentY;

				map.moveByPx(diffX,diffY);

				currentX = touch.pageX;
				currentY = touch.pageY;
			}
		});

		// zoom:
		mapDiv.addEventListener( 'gestureend', function(e){
			// note: this does not work if the default is prevented!
			if( e.scale > 1) {
				map.zoomIn();
			}
			if( e.scale < 1) {
				map.zoomOut();
			}
		});
		
	};

	YAHOO.lacuna.Mapiator = Mapiator;
})();
YAHOO.register("lacuna", YAHOO.lacuna.Mapiator, {version: "1", build: "0"}); 

}