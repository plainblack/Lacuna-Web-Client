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
		},
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
		MovableContainer: function( parentEl ) {
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
		},
		VisibleArea: function(map) {
			var lat = map.centerLat,
				lng = map.centerLng, 
				vpWidth = map.width, 
				vpHeight = map.height;
			
			//var util = Mapiator.util;
			var p = [lat * map.tileSizeInPx, lng * map.tileSizeInPx]; //util.project(lat, lng);
			
			//this.left = Math.round( p[0]*mapExtendInPx - 0.5*(mapExtendInPx + vpWidth) );
			//this.top = Math.round( p[1]*mapExtendInPx - 0.5*(mapExtendInPx + vpHeight) );
			this.left = Math.round( p[0] - 0.5*vpWidth );
			this.top = Math.round( p[1] - 0.5*vpHeight );
			this.width = vpWidth;
			this.height = vpHeight;
			this.move = function(mx,my) {
				this.left += mx;
				this.top += my;
				this.right = this.left + this.width;
				this.bottom = this.top + this.height;
			};
			this.centerX = function() {
				return this.left + 0.5*vpWidth;
			};
			this.centerY = function() {
				return this.top + 0.5*vpHeight;
			};
			this.centerLatLng = function() {
				return [Math.floor(this.centerX() / map.tileSizeInPx),
				Math.floor(this.centerY() / map.tileSizeInPx)];
				/*return util.inverseProject(
					(this.centerX()-0.5*mapExtendInPx)/mapExtendInPx,
					(this.centerY()-0.5*mapExtendInPx)/mapExtendInPx
				);*/
			};
			this.latLngAt = function(pX, pY) {
				return [Math.floor((this.left + pX) / map.tileSizeInPx),
				Math.floor((this.top + pY) / map.tileSizeInPx)];
				/*return util.inverseProject(
					(this.left + pX - 0.5*mapExtendInPx)/mapExtendInPx,
					(this.top + pY - 0.5*mapExtendInPx)/mapExtendInPx
				);*/
			};
			this.move(0,0);
		}
	};

	Mapiator.StdTile = function(x, y, z, ox, oy, map) {
		this.z = z;
		this.x = x;
		this.y = y;
		this.offsetX = ox;
		this.offsetY = oy;
		var obj = map.getTileUrl(x,y,z);
		this.blank = obj.blank;
		this.url = obj.url;
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
		
		// for debuging:
		// this.domElement.innerHTML = this['id'];
	};
	Mapiator.StdTile.prototype = {
		refresh : function(map) {
			var obj = map.getTileUrl(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			Dom.setStyle("background", 'transparent url('+ this.url +') no-repeat scroll center');
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

	Mapiator.TileLayer = function(map, visibleArea, TileConstructor){
		// tile layer expects map.movableContainer to be at the upper left corner of
		// the visibleArea on creation		
		this.map = map;
		this.visibleArea = visibleArea;
		this.TileConstructor = TileConstructor;
		
		var offsetX = visibleArea.left % map.tileSizeInPx;
		var offsetY = visibleArea.top % map.tileSizeInPx;
		
		this.baseTilePos = this.tileAtPosition(visibleArea.left, visibleArea.top);
		
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
			//var tileSizeInPx = this.map.tileSizeInPx;
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
					},
					timeout:5000,
					scope:this
				});
			}
		},
		showTiles : function() {
			// alert('TileLayer#showTiles');
			var topLeftTileNo = this.tileAtPosition(this.visibleArea.left, this.visibleArea.top);
			var bottomRightTileNo = this.tileAtPosition(this.visibleArea.right, this.visibleArea.bottom);
			
			var tiles = {};
			for(var x=topLeftTileNo[0]; x <= bottomRightTileNo[0]; ++x ){
				for(var y=topLeftTileNo[1]; y <= bottomRightTileNo[1]; ++y ){
					var tile = this.findTile(x,y,this.map.zoom);
					if( !tile) {
						var ox = (x - this.baseTilePos[0]) * this.map.tileSizeInPx;
						var oy = (y - this.baseTilePos[1]) * this.map.tileSizeInPx;
						tile = new this.TileConstructor(x, y, this.map.zoom, ox, oy, this.map);
						this.tileCache[tile.id] = tile;
						if( tile.domElement ) {
							this.tileContainer.appendChild( tile.domElement );
						}
					}
					else if(tile.blank) {
						tile.refresh(this.map);
					}
					tiles[tile.id] = tile;
				}
			}
			this.removeAllTilesNotContainedIn( tiles );
		},
		render : function() {
			// alert('TileLayer#showTiles');
			var topLeftTileNo = this.tileAtPosition(this.visibleArea.left, this.visibleArea.top),
				bottomRightTileNo = this.tileAtPosition(this.visibleArea.right, this.visibleArea.bottom),
				x1Left = topLeftTileNo[0],
				x2Right = bottomRightTileNo[0],
				y1Top = topLeftTileNo[1],
				y2Bottom = bottomRightTileNo[1];
				
			var newRegion = new Util.Region(y1Top, x2Right, y2Bottom, x1Left),
				b = this.map.bounds[this.map.zoom],
				existingRegion = b ? new Util.Region(b.y1Top, b.x2Right, b.y2Bottom, b.x1Left) : null;
				
			if(existingRegion && existingRegion.contains(newRegion)) {
				this.showTiles();
			}
			else {
				this._getStars(x1Left, x2Right, y1Top, y2Bottom, this.map.zoom);
			}
		},
		removeAllTilesNotContainedIn : function( hash ) {
			for( var key in this.tileCache ){
				if( !hash[key] ){
					var tile = this.tileCache[key];
					if( tile.domElement && tile.domElement.parentNode) {
						tile.domElement.parentNode.removeChild(tile.domElement);
						//this.tileContainer.removeChild( tile.domElement );
					}
					delete this.tileCache[key];
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
		this.movableContainer = new Mapiator.util.MovableContainer( this.mapDiv );

		this.setTileSizeInPx(256);
		
		this.overlayLayer = new Mapiator.OverlayLayer(this);
		if( this.iPhone ) {
			Mapiator.iPhoneController( this );
		}
		else {
			Mapiator.TraditionalController( this );
		}
	};
	Mapiator.Map.prototype = {
		tileSizeInPx : undefined,
		maxZoom : 10,
		minZoom : -10,
		visibleArea : undefined,
		centerLat : 0,
		centerLng : 0,
		diffX : 0,
		diffY : 0,
		_pathsAndPolygons : {},
		_projectedPoints : {},
		starCache : {},
		bounds : {},
		// pX and pY are optional pixel coordinates. If set they
		// define the center of the map after the zoom. Otherwise
		// the center will be the same as before the zoom
		zoomIn : function(pX, pY) {
			if( this.zoom >= this.maxZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom + 1, pX, pY);
			this.redraw();
		},
		zoomOut : function() {
			if( this.zoom <= this.minZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom - 1);
			this.redraw();
		},
		setTileSizeInPx : function( size ) {
			this.tileSizeInPx = size;
			this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
		},
		setCenter : function(lat,lng){
			this.centerLat = lat;
			this.centerLng = lng;
		},
		getTileUrl : function(x, y, z){
			var ySet = this.starCache[x],
				zSet = ySet ? ySet[y] : null;
			
			if(zSet) {
				var star = zSet[z];
				return {url:[Game.AssetUrl,'map/',star.color,'.png'].join('')};
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
			// the visible area is relative to the map
			this.visibleArea.move( -x,-y );
			
			this.diffX += x;
			this.diffY += y;
			var halfTileSize = this.tileSizeInPx / 2; //load the tiles a bit early
			if( Math.abs(this.diffX) > halfTileSize || Math.abs(this.diffY) > halfTileSize) {
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
		setZoomLevel : function( level, pX, pY ) {
			if( this.visibleArea ){
				// we are changing the zoom level but the map may have been panned around
				// but the current center is only stored in pixel coordinates which are different
				// for every zoom level. Therefor we recalculate the centerLat and centerLng:
				var ll = pX ? this.visibleArea.latLngAt( pX, pY ) : this.visibleArea.centerLatLng();
				this.centerLat = ll[0];
				this.centerLng = ll[1];
				this.visibleArea = null;
			}
			this.zoom = level;
			this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
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
			
			if(bnds.y1Top > oStar.y) {
				bnds.y1Top = oStar.y;
			}
			else if(bnds.y2Bottom < oStar.y) {
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
				this._updateBounds(star);
			}
			return startZoomLevel;
		},
		redraw : function() {			
			// deprecated:
			this.width = this.mapDiv.offsetWidth;
			this.height= this.mapDiv.offsetHeight;
			
			this.visibleArea = new Mapiator.util.VisibleArea(this);
			this.movableContainer.reposition( this.visibleArea.left, this.visibleArea.top );
			
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
		// panning:
		var xmove, ymove;
		function moveMap(e) {
			if( map.IE ) {
				e = window.event;
			}
			else {
				e.preventDefault();
			}
			if(xmove) {
				map.moveByPx( e.clientX - xmove, e.clientY - ymove );
			}
			xmove = e.clientX;
			ymove = e.clientY;
		}
		function disableDrag(e){
			if( map.IE ) {
				e = window.event;
			}
			else {
				e.preventDefault();
			}
			var undef;
			xmove = undef;
			document.onmousemove = null;
		}
		map.mapDiv.onmousedown = function(e){
			if( map.IE ) {
				e = window.event;
			}
			else {
				e.preventDefault();
			}
			document.onmouseup = disableDrag;
			document.onmousemove = moveMap;
		};
		
		// double click zoom:
		map.mapDiv.ondblclick = function(e){
			if( map.IE ) {
				e = window.event;
			}
			var el = map.mapDiv;
			var mapX = 0, mapY = 0;
			do {
				mapX += el.offsetLeft;
				mapY += el.offsetTop;
				el = el.offsetParent;
			} while( el );
			// alert( e.pageX );
			var x = (e.pageX||e.clientX)-mapX, y = (e.pageY||e.clientY)-mapY; // this will not work properly in IE if the page is scrolled!
			map.zoomIn( x, y );
		};

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