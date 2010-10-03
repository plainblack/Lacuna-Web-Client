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
		this._parentEl = parentEl;
		
		this.reset();
		parentEl.appendChild( div );
	};
	Mapper.MovableContainer.prototype = {
		move : function( x,y ) {
			this.offsetX += x;
			this.offsetY += y;
			this._container.style.left = ''+ this.offsetX +'px';
			this._container.style.top  = ''+ this.offsetY +'px';
			Dom.setStyle(this._parentEl, 'background-position', this.offsetX + 'px ' + this.offsetY + 'px');
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
			var maxWidth = this._map.width;
			var maxHeight = this._map.height;
			if(mb) {
				var tileSize = this._map.tileSizeInPx,
					maxBoundsWidth = (mb.x2Right - mb.x1Left) * tileSize,
					maxBoundsHeight = (mb.y2Bottom - mb.y1Top) * tileSize,
					extraSpace = 30 + Math.ceil(tileSize / 2);
					
				if(maxWidth > maxBoundsWidth) {
					maxWidth = maxBoundsWidth;
				}
				var	cb = this.calcCoordBounds(this.left + mx + extraSpace, this.top + my + extraSpace, this.left + mx + maxWidth, this.top + my + maxHeight);
				//if out of bounds, only move to max
				//x axis
				if(mx < 0 && cb.x1 < mb.x1Left) { //if moving left
					mx = mb.x1Left * tileSize - extraSpace - this.left;
				}
				else if(mx > 0 && cb.x2 > (mb.x2Right+1)) { //if moving right
					mx = ((mb.x2Right+1) * tileSize) - (this.left + maxWidth);
				}
				//y axis
				if(my < 0 && cb.y1 > mb.y1Top){ //if moving up 
					my = 0 - mb.y1Top * tileSize - extraSpace - this.top;
				}
				else if(my > 0 && cb.y2 < (mb.y2Bottom-1)) { //if moving down
					my = - ((mb.y2Bottom-1) * tileSize) - (this.top + maxHeight);
				}
			}
			//modify with new values now
			this.left += mx;
			this.top += my;
			this.right = this.left + maxWidth;
			this.bottom = this.top + maxHeight;
			this.centerX = this.left + (maxWidth/2);
			this.centerY = this.top + (maxHeight/2);
			
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
		centerLoc : function(){
			var tileSize = this._map.tileSizeInPx;
			return [Math.floor(this.centerX / tileSize),
				Math.ceil((this.centerY*-1) / tileSize)];
			/*	xO = this.centerX / tileSize,
				x = Math.floor(xO),
				yO = (this.centerY*-1) / tileSize,
				y = Math.ceil(yO);/
			YAHOO.log({xO:xO, x:x, yO:yO, y:y}, "info", "VisibleArea.centerLoc");
			return [x,y];*/
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
		this.origOffsetX = ox;
		this.offsetY = oy;
		this.origOffsetY = oy;
		this.map = map;
		this.tileSizeInPx = map.tileSizeInPx;
		
		this.id = Tile.idFor(this.x,this.y,this.z);
		this.domElement = document.createElement('div');
		this.domElement.id = this.id;
		
		this.refresh();
		
		var s = this.domElement.style;
		s.position = 'absolute';
		s.width = '' + this.tileSizeInPx + 'px';
		s.height = '' + this.tileSizeInPx + 'px';
		s.zIndex = '5';
		s.left = ''+ this.offsetX +'px';
		s.top = ''+ this.offsetY +'px';
		if(this.url) {
			s.background = 'transparent url('+ this.url +') no-repeat scroll center';
		}
		
		Dom.addClass(this.domElement, "tile");
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
			else {
				Dom.setStyle(this.domElement, "background", 'transparent');
			}
		},
		
		appendToDom : function() {
			return this.domElement && !this.blank && !Dom.inDocument(this.domElement);
		},
		remove : function() {
			if( this.domElement && this.domElement.parentNode) {
				this.domElement.parentNode.removeChild(this.domElement);
			}
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
			this.domElement.title = this.data ? [this.data.name, " (", this.x, ",", this.y, ")"].join('') : "Uncharted Space";
			
			if(this.data) {
				this._createImage();
				this._createAlignments();
			}
		},
		refresh : function() {
			var obj = this.map.getTile(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.image = obj.image;
			this.url = obj.url;
			this.data = obj.data;
			if(this.url) {
				Dom.setStyle(this.domElement, "background", 'transparent url('+ this.url +') no-repeat scroll center');
			}
			
			if(this.data) {
				if(this.data.isStar) {
					this.tileSizeInPx = this.map.tileSizeInPx*3;
					var q = this.map.tileSizeInPx;
					this.offsetX = this.origOffsetX - q;
					this.offsetY = this.origOffsetY - q;
				}
				else {
					this.tileSizeInPx = this.map.tileSizeInPx;
					this.offsetX = this.origOffsetX;
					this.offsetY = this.origOffsetY;
				}
				Dom.setStyle(this.domElement, "width", ''+this.tileSizeInPx+'px');
				Dom.setStyle(this.domElement, "height", ''+this.tileSizeInPx+'px');
				Dom.setStyle(this.domElement, "left", ''+this.offsetX+'px');
				Dom.setStyle(this.domElement, "top", ''+this.offsetY+'px');
			}
			
			this.init();
		},
		
		_createImage : function() {
			if(!this.imageHolder) {
				var image = this.domElement.appendChild(document.createElement('div'));
				Dom.setStyle(image, "width", this.tileSizeInPx + 'px');
				Dom.setStyle(image, "height", this.tileSizeInPx + 'px');
				Dom.setStyle(image, "position", "absolute");
				Dom.setStyle(image, "top", "0");
				Dom.setStyle(image, "left", "0");
				this.imageHolder = image;
			}
			if(this.data.orbit) {
				var pSize = ((100 - Math.abs(this.data.size - 100)) / (100 / this.tileSizeInPx)) + 15;
				this.imageHolder.innerHTML = ['<img src="',this.image,'" class="planet planet',this.data.orbit,'" style="width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((this.tileSizeInPx - pSize) / 2)),'px;" />'].join('');
			}
			else {
				this.imageHolder.innerHTML = ['<img src="',this.image,'" class="star" style="width:',this.tileSizeInPx,'px;height:',this.tileSizeInPx,'px;" />'].join('');
			}
		},
		_createAlignments : function() {
			if(this.data.empire && this.data.empire.alignment) {
				if(!this.alignHolder) {
					var align = this.domElement.appendChild(document.createElement('div'));
					Dom.setStyle(align, "width", this.tileSizeInPx + 'px');
					Dom.setStyle(align, "height", this.tileSizeInPx + 'px');
					Dom.setStyle(align, "position", "absolute");
					Dom.setStyle(align, "top", "0");
					Dom.setStyle(align, "left", "0");
					Dom.setStyle(align, "z-index", '2');
					this.alignHolder = align;
				}
				if(this.data.orbit) {
					var pSize = ((100 - Math.abs(this.data.size - 100)) / (100 / this.tileSizeInPx)) + 15;
					this.alignHolder.innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',this.data.empire.alignment,'.png" class="planet" style="width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((this.tileSizeInPx - pSize) / 2)),'px;" />'].join('');
				}
				else {
					this.alignHolder.innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',this.data.empire.alignment,'.png" class="star" style="width:',this.tileSizeInPx,'px;height:',this.tileSizeInPx,'px;" />'].join('');
				}
			}
		}
	});
	
	Mapper.PlanetTile = function(x, y, z, ox, oy, map) {
		Mapper.PlanetTile.superclass.constructor.call(this, x, y, z, ox, oy, map);
	};
	Lang.extend(Mapper.PlanetTile, Tile, {
		init : function() {
			this.domElement.title = this.data ? this.data.name : "Ground";
			this._createActionIcon();
			
			if(this.data && this.data.pending_build) {
				this._createCounter();
				var remaining = Math.round(this.data.pending_build.seconds_remaining);
				if (remaining < 0) {
					remaining = 0;
				}
				this.counter.innerHTML = Lib.formatTime(remaining);
			}
			else if(this.counter) {
				this.counter.parentNode.removeChild(this.counter);
				delete this.counter;
			}
			
			if(this.data && this.data.efficiency*1 < 100) {
				this._createEfficiencyBar(this.data.efficiency*1);
			}
			else if(this.cBar) {
				this.cBar.parentNode.removeChild(this.cBar);
				delete this.cBar;
				delete this.eBar;
			}
		},
		refresh : function() {
			Mapper.PlanetTile.superclass.refresh.call(this);
			this.init();
		},
		appendToDom : function() {
			return this.domElement;
		},
		
		refreshCounter : function() {
			var obj = this.map.getTile(this.x,this.y,this.z);
			this.blank = obj.blank;
			this.url = obj.url;
			this.data = obj.data;
			if(this.data && this.data.pending_build && this.data.pending_build.seconds_remaining > 0.5) {
				this._createCounter();
				var remaining = Math.round(this.data.pending_build.seconds_remaining);
				if (remaining < 0) {
					remaining = 0;
				}
				this.counter.innerHTML = Lib.formatTime(remaining);
			}
			else {
				this.counter.parentNode.removeChild(this.counter);
				delete this.counter;
			}
		},
		_createCounter : function() {
			if(!this.counter) {
				var counter = this.domElement.appendChild(document.createElement('div'));
				Dom.addClass(counter, "planetMapTileCounter");
				Dom.setStyle(counter, "width", this.tileSizeInPx + 'px');
				Dom.setStyle(counter, "height", this.tileSizeInPx + 'px');
				this.counter = counter;
			}
		},
		_createActionIcon : function() {
			if(this.actionIcon) {
				if(this.data) {
					this.actionIcon.innerHTML = ['<div class="planetMapTileActionLevel">',this.data.level,'</div>'].join('');
				}
				else {
					this.actionIcon.innerHTML = '<div class="planetMapTileActionButton"></div>';
				}
			}
			else {
				var div = this.domElement.appendChild(document.createElement('div'));
				Dom.addClass(div, "planetMapTileActionContainer");
				Dom.setStyle(div, "width", this.tileSizeInPx + 'px');
				Dom.setStyle(div, "height", Math.round(this.tileSizeInPx/2) + 'px');
				if(this.data) {
					div.innerHTML = ['<div class="planetMapTileActionLevel">',this.data.level,'</div>'].join('');
				}
				else {
					div.innerHTML = '<div class="planetMapTileActionButton"></div>';
				}
				this.actionIcon = div;
			}
		},
		_createEfficiencyBar : function(efficiency) {
			if(!this.cBar) {
				var bar = this.domElement.appendChild(document.createElement('div'));
				Dom.addClass(bar, "planetMapEfficiencyBarContainer");
				Dom.setStyle(bar, "width", this.tileSizeInPx + 'px');
				this.eBar = bar.appendChild(document.createElement('div'));
				Dom.addClass(this.eBar, "planetMapEfficiencyBar");
				this.cBar = bar;
			}
			Dom.setStyle(this.eBar, "width", Math.floor(this.tileSizeInPx*(efficiency/100)) + 'px');
			this.eBar.innerHTML = efficiency + "%";
			if(efficiency > 60) {
				Dom.setStyle(this.cBar, "border-color", 'yellow');
				Dom.setStyle(this.eBar, "background-color", 'yellow');
				Dom.setStyle(this.eBar, "color", 'black');
			}
			else if(efficiency > 30) {
				Dom.setStyle(this.cBar, "border-color", 'orange');
				Dom.setStyle(this.eBar, "background-color", 'orange');
				Dom.setStyle(this.eBar, "color", 'white');
			}
			else {
				Dom.setStyle(this.cBar, "border-color", 'red');
				Dom.setStyle(this.eBar, "background-color", 'red');
				Dom.setStyle(this.eBar, "color", 'white');
			}
		}
	});
	
	
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
				xMin = this.map.maxBounds.x1Left,
				xMax = this.map.maxBounds.x2Right,
				xEls = Sel.query("div.coordX", this.xCoords);
			Dom.batch(xEls, function(el){
				if (el.xIndex >= xMin && el.xIndex <= xMax) {
					Dom.setStyle(num, "width", size);
				}
				else {
					Dom.setStyle(num, "width", (pxSize * 3) + "px");
				}
				Dom.setStyle(el, "left", (el.xIndex * pxSize) + "px");
			}, this, true);
			
			var negPxSize = pxSize * -1,
				thrd = Math.ceil(pxSize / 3),
				sizeLeft = (pxSize - thrd) + "px",
				thrdTxt = thrd + "px",
				yMin = this.map.maxBounds.y1Top,
				yMax = this.map.maxBounds.y2Bottom,
				yEls = Sel.query("div.coordY", this.yCoords);
			Dom.batch(yEls, function(el){
				Dom.setStyle(el, "top", (el.yIndex * negPxSize) + "px");
				if (el.yIndex >= yMin && el.yIndex <= yMax) {
					Dom.setStyle(num, "height", sizeLeft);
					Dom.setStyle(el, "padding-top", thrdTxt);
				}
				else {
					Dom.setStyle(num, "height", (pxSize * 3) + "px");
				}
			}, this, true);
		},
		displayXCoords : function() {
			var anchor = this.div.cloneNode(false);
			Dom.addClass(anchor, "coordTop");

			var pxSize = this.map.tileSizeInPx,
				size = pxSize + "px",
				xMin = this.map.maxBounds.x1Left,
				xMax = this.map.maxBounds.x2Right;
			for(var x=xMin - 1; x<=xMax + 1; x++) {
				var num = this.div.cloneNode(false);
				num.xIndex = x;
				if (x >= xMin && x <= xMax) {
					num.innerHTML = x;
					Dom.setStyle(num, "width", size);
				}
				else {
					Dom.setStyle(num, "width", (pxSize * 3) + "px");
				}
				Dom.addClass(num, "coordX");
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
			for(var y=yMax + 1; y>=yMin - 1; y--) {
				var num = this.div.cloneNode(false);
				num.innerHTML = y;
				num.yIndex = y;
				if (y >= yMin && y <= yMax) {
					num.innerHTML = y;
					Dom.setStyle(num, "height", sizeLeft);
					Dom.setStyle(num, "padding-top", thrdTxt);
				}
				else {
					Dom.setStyle(num, "height", ( pxSize * 3 ) + "px");
				}
				Dom.addClass(num, "coordY");
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
			if(this.tileCache) {
				return this.tileCache[Tile.idFor(x,y,zoom)];
			}
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
				failure:function(o) {
					if(o.error.code == 1006) {
						Game.Failure(o);
					}
					else {
						this.showTiles();
					}
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
						if(tile.appendToDom()) {
							this.tileContainer.appendChild( tile.domElement );	
						}
					}
				}
			}
		},
		showTiles : function(refresh) {
			if(this.tileCache) {
				var bounds = this.map instanceof Mapper.PlanetMap ? {x1:this.map.maxBounds.x1Left,x2:this.map.maxBounds.x2Right,y1:this.map.maxBounds.y1Top,y2:this.map.maxBounds.y2Bottom} : this.visibleArea.coordBounds();
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
							if(tile.appendToDom()) {
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
							if(tile.appendToDom()) {
								this.tileContainer.appendChild( tile.domElement );	
							}
						}
						tiles[tile.id] = tile;
					}
				}
				if(!this.map.keepTilesOutOfBounds) {
					this.removeAllTilesNotContainedIn( tiles );
				}
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
		//this.centerX = 0;
		//this.centerY = 0;
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
			YAHOO.log("zooming in", "info", "Mapper.Map");
			if( this.zoom >= this.maxZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom + 1 );
			//called by zoom display change //this.refresh();
		},
		zoomOut : function() {
			YAHOO.log("zooming out", "info", "Mapper.Map");
			if( this.zoom <= this.minZoom ) {
				return;
			}
			this.setZoomLevel( this.zoom - 1 );
			//called by zoom display change //this.refresh();
		},
		setTileSizeInPx : function( size ) {
			this.tileSizeInPx = size;
			//this.mapExtendInPx = this.tileSizeInPx * (1<<this.zoom);
		},
		addElement : function( p ) {
			this._pathsAndPolygons[p.id] = p;
		},
		removeElement : function( p ) {
			delete this._pathsAndPolygons[p.id];
		},
		moveByTiles : function( x, y ) {
			var absX = Math.abs(x),
				absY = Math.abs(y),
				durMS = absX > absY ? this.tileSizeInPx * absX : this.tileSizeInPx * absY, //get the longest duration if we're moving both x and y
				totalX = x * this.tileSizeInPx,
				totalY = y * this.tileSizeInPx,
				stepX = Math.round(totalX / durMS) || (x<0 ? -1 : 1), //put this in to cover the possibility of total/dur rounding to 0. 0 will 
				stepY = Math.round(totalY / durMS) || (y<0 ? -1 : 1),
				progX = 0, 
				progY = 0, 
				lastDuration = 0,
				anim = new Util.Anim(undefined,undefined,durMS);
				
			anim.useSeconds = false; //keep everything in ms
			anim.onTween.subscribe(function(type,data){
				var completed = data[0].duration,
					factor = completed - lastDuration,
					moveX, moveY;
				lastDuration = completed;
				
				if(Math.abs(progX) >= Math.abs(totalX)) {
					moveX = 0;
				}
				else {
					moveX = stepX*factor;
					progX += moveX;
				}
				if(Math.abs(progY) >= Math.abs(totalY)) {
					moveY = 0;
				}
				else {
					moveY = stepY*factor;
					progY += moveY;
				}
				
				this.moveByPx(moveX, moveY);
			}, this, true);
			
			anim.animate();
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
			//this.centerX -= x;
			//this.centerY += y;
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
			//this.centerX = Math.floor(0.5 * this.width);
			//this.centerY = Math.floor(0.5 * this.height);	
			
			this.movableContainer.reset();
			this.visibleArea = new Mapper.VisibleArea(this);

			this.coordLayer.redraw();
			
			if( this.tileLayer ) {
				this.tileLayer.destroy();		
			}
			this.tileLayer = new Mapper.TileLayer(this, Mapper.util.clone(this.visibleArea), this.Tile);
		},
		refresh : function() {
			var vac = this.visibleArea.centerLoc();
			
			this._setTileSizeByZoom();
			
			this.redraw();
			
			this.setCenterTo(vac[0],vac[1]);
		},
		resize : function() {
			this.width = this.mapDiv.offsetWidth;
			this.height = this.mapDiv.offsetHeight;
			
			this.visibleArea.resize();
			
			this.tileLayer.showTiles();
		},
		setCenterTo : function(locX, locY) {
			if(Lang.isNumber(locX) && Lang.isNumber(locY) && this.tileLayer) {
				var otherWidth = this.visibleArea.centerX,
					otherHeight = this.visibleArea.centerY,
					ox = locX * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherWidth,
					oy = (locY * -1) * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);

				/*var otherWidth = this.visibleArea.centerX,
					otherHeight = this.visibleArea.centerY;
				var locXm = locX,
					locYm = locY * -1;
					
				var locXmPx = (locXm * this.tileSizeInPx) + (this.tileSizeInPx / 2),
					locYmPx = (locYm * this.tileSizeInPx) + (this.tileSizeInPx / 2);
					
				var ox = locXmPx - otherWidth,
					oy = locYmPx - otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);*/
			}
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
		Dom.setStyle(this.mapDiv, 'background-image', 'url("'+Lib.AssetUrl+'star_system/field.png")');
	};
	Lang.extend(Mapper.StarMap, Map, {
		_setTileSizeByZoom : function() {
			Game.SetCookie("starZoom", this.zoom);
			switch(this.zoom){
				case 2:
					this.setTileSizeInPx(150);
					break;
				case 1:
					this.setTileSizeInPx(100);
					break;
				case -1:
					this.setTileSizeInPx(50);
					break;
				default:
					this.setTileSizeInPx(75);
					break;
			}
		},
		init : function() {
			this.maxZoom = 2;
			this.minZoom = -1;
			
			var mapSize = Game.ServerData.star_map_size;
			this.maxBounds = {x1Left:mapSize.x[0],x2Right:mapSize.x[1],y1Top:mapSize.y[1],y2Bottom:mapSize.y[0]};
			this.requestQueue = [];
		
			this.Tile = Mapper.StarTile;
			
			this.zoom = Game.GetCookie("starZoom",0);
			this._setTileSizeByZoom();
		},
		getTile : function(x, y){
			var xSet = this.tileCache[x],
				body = xSet ? xSet[y] : null;
			
			if(body) {
				if(body.isStar) {
					return {data:body, image:[Lib.AssetUrl,'star_map/',body.color,'.png'].join('')};
				}
				else if(body.isPlanet) {
					return {data:body, image:[Lib.AssetUrl,'star_system/',body.image,'.png'].join('')};
				}
			}
			else {
				return {blank:true};
			}
		},
		getTileData : function(callback, x1, x2, y1, y2) {
			var xDiff = Math.abs(x2-x1),
				yDiff = Math.abs(y2-y1);
				
			if((xDiff * yDiff) > 400) { //if out of bounds split and try again
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
					y2 : y2
				};
				YAHOO.log(data, "debug", "StarMap.getTileData.requestData");
				//now call back for data
				//this.currentRequest = 
				Game.Services.Map.get_stars(data,{
					success : function(o){
						YAHOO.log(o, "debug", "StarMap.getTileData.get_stars.success");
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
						YAHOO.log(o, "debug", "StarMap.getTileData.get_stars.failure");
						if(callback.failure) {
							callback.failure.call(callback.scope || this, o);
						}
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
			oStar.x *= 1;
			oStar.y *= 1;
			var bnds = this.bounds;
			
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
				star.isStar = true;
				if(!this.tileCache[star.x]) {
					this.tileCache[star.x] = {};
				}
				this.tileCache[star.x][star.y] = star;

				if(star.bodies) {
					for(var bKey in star.bodies){
						if(star.bodies.hasOwnProperty(bKey)){
							var body = star.bodies[bKey];
							body.isPlanet = true;
							if(!this.tileCache[body.x]) {
								this.tileCache[body.x] = {};
							}
							this.tileCache[body.x][body.y] = body;
						}
					}
				}

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
		this.setSurfaceUrl(surfaceUrl);
	};
	Lang.extend(Mapper.PlanetMap, Map, {
		_setTileSizeByZoom : function() {
			Game.SetCookie("planetZoom", this.zoom);
			switch(this.zoom){
				case 2:
					this.setTileSizeInPx(400);
					break;
				case 1:
					this.setTileSizeInPx(300);
					break;
				case -1:
					this.setTileSizeInPx(100);
					break;
				default:
					this.setTileSizeInPx(200);
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
			
			this.zoom = Game.GetCookie("planetZoom",0);
			this._setTileSizeByZoom();
		},
		setCenterToCommand : function() {
			if(this.command) { // && this.tileLayer) {
				this.setCenterTo(this.command.x, this.command.y);
				/*
				var otherWidth = this.visibleArea.centerX,
					otherHeight = this.visibleArea.centerY;
					
				var ox = this.command.x * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherWidth,
					oy = (this.command.y * -1) * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherHeight;
				
				this.moveByPx(ox * -1, oy * -1);*/
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
			Dom.setStyle(this.mapDiv, 'background-image', 'url("' + surfaceUrl + '")');
		},
		setPlotsAvailable : function(plots) {
			if (plots > 0) {
				Dom.removeClass(this.mapDiv, 'plots-full');
			}
			else {
				Dom.addClass(this.mapDiv, 'plots-full');
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
		removeTile : function(x,y) {
			if(this.tileCache && this.tileCache[x] && this.tileCache[x][y]) {
				delete this.tileCache[x][y];
			}
			var tile = this.tileLayer.findTile(x,y,this.zoom);
			if(tile) {
				tile.refresh();
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
		
		var navEl = document.createElement('div');
		navEl.className = 'mapiator_nav';
		navEl.innerHTML = [
			'<div class="mapiator_nav_up" title="Move Up"></div>',
			'<div class="mapiator_nav_right" title="Move Right"></div>',
			'<div class="mapiator_nav_down" title="Move Down"></div>',
			'<div class="mapiator_nav_left" title="Move Left"></div>'
		].join('');
		map.mapDiv.appendChild(navEl);
		var clickMoveMap = function(e, o) {
			map.moveByTiles(o[0], o[1]);
		};
		Event.on(Sel.query(".mapiator_nav_up", navEl, true), "click", clickMoveMap, [ 0, 1 ]);
		Event.on(Sel.query(".mapiator_nav_down", navEl, true), "click", clickMoveMap, [ 0, -1 ]);
		Event.on(Sel.query(".mapiator_nav_left", navEl, true), "click", clickMoveMap, [ 1, 0 ]);
		Event.on(Sel.query(".mapiator_nav_right", navEl, true), "click", clickMoveMap, [ -1, 0 ]);



		if((map.maxZoom - map.minZoom) != 0) {
			var zoomEl = document.createElement('div');
			zoomEl.className = 'mapiator_zoom';
			zoomEl.innerHTML = [
				'<div class="mapiator_zoom_slider">',
				'	<div class="mapiator_zoom_slider_thumb">',
				'		<img src="' + Lib.AssetUrl + 'ui/zoom_slider.png" />',
				'	</div>',
				'</div>',
				'<div class="mapiator_zoom_in" title="Zoom In"></div>',
				'<div class="mapiator_zoom_out" title="Zoom Out"></div>'
			].join('');
			map.mapDiv.appendChild(zoomEl);
			Event.on(Sel.query(".mapiator_zoom_in", zoomEl, true), "click", map.zoomIn, map, true);
			Event.on(Sel.query(".mapiator_zoom_out", zoomEl, true), "click", map.zoomOut, map, true);
			var sliderId = Dom.generateId(Sel.query(".mapiator_zoom_slider", zoomEl, true), "mapiator_zoom_slider");
			var thumbId = Dom.generateId(Sel.query(".mapiator_zoom_slider_thumb", zoomEl, true), "mapiator_zoom_slider_thumb");

			var zoomSize = 140;
			var zoomScale = Math.floor(zoomSize / (map.maxZoom - map.minZoom));
			var zoomSlider = YAHOO.widget.Slider.getVertSlider(
				sliderId,
				thumbId,
				0,
				zoomSize,
				zoomScale
			);
			zoomSlider.setZoom = function(zoom) {
				this.setValue((map.maxZoom - zoom) * zoomScale);
			};
			zoomSlider.getZoom = function() {
				return map.maxZoom - this.getValue() / zoomScale;
			};
			zoomSlider.setZoom(map.zoom);
			zoomSlider.subscribe("change", function () {
				map.setZoomLevel( this.getZoom() );
				map.refresh();
			});
			this.zoomSlider = zoomSlider;
		}
	};
	Mapper.TraditionalController.prototype = {
		setZoomDisplay : function(zoom) {
			if(this.zoomSlider) {
				this.zoomSlider.setZoom(zoom);
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
