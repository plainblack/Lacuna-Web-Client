YAHOO.namespace("lacuna");

var $ = require('js/hacks/jquery');

if (typeof YAHOO.lacuna.Mapper == "undefined" || !YAHOO.lacuna.Mapper) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        KL = Util.KeyListener,
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
                    extraSpaceTop = 60,
                    extraSpaceBottom = 140,
                    extraSpaceLeft = 150,
                    extraSpaceRight = 150;
                    maxBoundsWidth = (mb.x2Right - mb.x1Left) * tileSize,
                    maxBoundsHeight = (mb.y1Top - mb.y2Bottom) * tileSize;

                if(maxWidth > maxBoundsWidth) {
                    maxWidth = maxBoundsWidth;
                }
                if(maxHeight > maxBoundsHeight) {
                    maxHeight = maxBoundsHeight;
                }
                var    cb = this.calcCoordBounds(this.left + mx + extraSpaceLeft, this.top + my + extraSpaceTop, this.left + mx + maxWidth - extraSpaceRight, this.top + my + maxHeight - extraSpaceBottom);
                //if out of bounds, only move to max
                //x axis
                if(mx < 0 && cb.x1 < mb.x1Left) { //if moving left
                    mx = mb.x1Left * tileSize - extraSpaceLeft - this.left;
                }
                else if(mx > 0 && cb.x2 > (mb.x2Right+1)) { //if moving right
                    mx = ((mb.x2Right+1) * tileSize) - (this.left + maxWidth - extraSpaceRight);
                }
                //y axis
                if(my < 0 && cb.y1 > mb.y1Top){ //if moving up
                    my = 0 - mb.y1Top * tileSize - extraSpaceTop - this.top;
                }
                else if(my > 0 && cb.y2 < (mb.y2Bottom-1)) { //if moving down
                    my = - ((mb.y2Bottom-1) * tileSize) - (this.top + maxHeight - extraSpaceBottom);
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
        },
        centerLocPx : function() {
            return [this.centerX, this.centerY];
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



    var Tile = function(x, y, z, ox, oy, layer) {
        this.z = z;
        this.x = x;
        this.y = y;
        this.offsetX = ox;
        this.origOffsetX = ox;
        this.offsetY = oy;
        this.origOffsetY = oy;
        this.layer = layer;
        this.map = layer.map;
        this.tileSizeInPx = layer.map.tileSizeInPx;

        this.id = Tile.idFor(this.x,this.y,this.z);
        this.domElement = document.createElement('div');
        this.domElement.id = this.id;

        this.createEvent("onReload");

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
            this.data = obj.data;
            if(this.url != obj.url) {
                this.url = obj.url;
                if(this.url) {
                    Dom.setStyle(this.domElement, "background", 'transparent url('+ this.url +') no-repeat scroll center');
                }
                else {
                    Dom.setStyle(this.domElement, "background", 'transparent');
                }
            }
        },

        appendToDom : function() {
            if(this.domElement && !this.blank && !Dom.isAncestor(this.layer.tileContainer, this.domElement)) {
                this.layer.tileContainer.appendChild(this.domElement);
            }
        },
        destroy : function() {
            this.unsubscribeAll();
            this.remove();
            delete this.domElement;
        },
        remove : function() {
            if( this.domElement && this.domElement.parentNode) {
                this.domElement.parentNode.removeChild(this.domElement);
            }
        }
    };
    Lang.augmentProto(Tile, Util.EventProvider);
    Tile.idFor = function(x,y,z){
        return 'tile_'+ x + '_' + y + '_' + z;
    };

    Mapper.StarTile = function(x, y, z, ox, oy, layer) {
        Mapper.StarTile.superclass.constructor.call(this, x, y, z, ox, oy, layer);
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
            this._buildFissureHolder();
            this._buildLogoHolder();
            if(this.data.orbit) {
                if(this.map.hidePlanets) {
                    switch(this.data.type) {
                        case 'habitable planet':
                            this.imageHolder.innerHTML = "H";
                            break;
                        case 'gas giant':
                            this.imageHolder.innerHTML = "G";
                            break;
                        case 'asteroid':
                            this.imageHolder.innerHTML = "A";
                            break;
                        case 'space station':
                            this.imageHolder.innerHTML = "S";
                            break;
                        default:
                            this.imageHolder.innerHTML = "U";
                            break;
                    }
                }
                else {
                    var pSize = ((100 - Math.abs(this.data.size - 100)) / (100 / this.tileSizeInPx)) + 15;
                    this.imageHolder.innerHTML = ['<img src="',this.image,'" class="planet planet',this.data.orbit,'" style="width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((this.tileSizeInPx - pSize) / 2)),'px;" />'].join('');


                    if (this.data.body_has_fissure) {
                        this.fissureHolder.innerHTML = ['<img src="',Lib.AssetUrl,'star_map/fissure_icon.png" class="planet" style="width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((this.tileSizeInPx - pSize) / 2)),'px;" />'].join('');
                    }
                }

            }
            else {
                if (this.data.station) {

                    var station = this.data.station;
                    var pSize = this.tileSizeInPx;
                    var opacity = this.data.influence * 9 / 19000 + 0.1;
                    if (opacity > 1)
                    {
                        opacity = 1;
                    }
                    else if (opacity < 0.1)
                    {
                        opacity = 0.1;
                    }
                    this.logoHolder.innerHTML= ['<img src="',Lib.AssetUrl,'alliances/',station.alliance.image,'.png" class="star" style="width:',pSize,'px;height:',pSize,'px;opacity:', opacity, '" />'].join('');
                }
                this.imageHolder.innerHTML = ['<img src="',this.image,'" class="star" style="width:',this.tileSizeInPx,'px;height:',this.tileSizeInPx,'px;" />'].join('');
            }
        },
        _createAlignments : function() {
            if(this.data.empire && this.data.empire.alignment) {
                this._buildAlignmentHolder();
                if(this.data.orbit) {
                    if(this.map.hidePlanets) {
                        Dom.addClass(this.alignHolder, this.data.empire.alignment);
                    }
                    else {
                        var pSize = ((100 - Math.abs(this.data.size - 100)) / (100 / this.tileSizeInPx)) + 15;
                        this.alignHolder.innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',this.data.empire.alignment,'.png" class="planet" style="width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((this.tileSizeInPx - pSize) / 2)),'px;" />'].join('');
                    }

                }
                else {
                    this.alignHolder.innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',this.data.empire.alignment,'.png" class="star" style="width:',this.tileSizeInPx,'px;height:',this.tileSizeInPx,'px;" />'].join('');
                }
            }
            else if(this.map.hidePlanets && this.data.orbit){
                this._buildAlignmentHolder();
                Dom.addClass(this.alignHolder, 'probed');
            }
        },
        _buildLogoHolder : function() {
            if(!this.logoHolder) {
                var logo = this.domElement.appendChild(document.createElement('div'));
                Dom.setStyle(logo, "width", this.tileSizeInPx + 'px');
                Dom.setStyle(logo, "height", this.tileSizeInPx + 'px');
                Dom.setStyle(logo, "position", "absolute");
                Dom.setStyle(logo, "top", "0");
                Dom.setStyle(logo, "left", "0");
                Dom.setStyle(logo, "z-index", '3');
                this.logoHolder = logo;
            }
        },
        _buildFissureHolder : function() {
            if(!this.fissureHolder) {
                var fissure = this.domElement.appendChild(document.createElement('div'));
                Dom.setStyle(fissure, "width", this.tileSizeInPx + 'px');
                Dom.setStyle(fissure, "height", this.tileSizeInPx + 'px');
                Dom.setStyle(fissure, "position", "absolute");
                Dom.setStyle(fissure, "top", "0");
                Dom.setStyle(fissure, "left", "0");
                Dom.setStyle(fissure, "z-index", '3');
                this.fissureHolder = fissure;
            }
        },
        _buildAlignmentHolder : function() {
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
        }
    });

    Mapper.PlanetTile = function(x, y, z, ox, oy, layer) {
        Mapper.PlanetTile.superclass.constructor.call(this, x, y, z, ox, oy, layer);
        Dom.addClass(this.domElement, "tile"+ this.tileSizeInPx);
    };
    Lang.extend(Mapper.PlanetTile, Tile, {
        init : function() {
            this.domElement.title = this.data ? this.data.name : "Ground";
            this._createActionIcon();

            if(this.data && this.data.efficiency*1 < 100) {
                this._createEfficiencyBar(this.data.efficiency*1);
            }
            else if(this.cBar) {
                this.cBar.parentNode.removeChild(this.cBar);
                delete this.cBar;
                delete this.eBar;
            }

            this.startTick();
            /*if(this.data && this.data.pending_build) {
                this._createCounter();
                var remaining = Math.round(this.data.pending_build.seconds_remaining);
                if (remaining < 0) {
                    remaining = 0;
                }
                this.counterBuild.innerHTML = Lib.formatTime(remaining);
            }
            else if(this.counterBuild) {
                this.counterBuild.parentNode.removeChild(this.counterBuild);
                delete this.counterBuild;
            }*/
        },
        refresh : function() {
            Mapper.PlanetTile.superclass.refresh.call(this);
            this.init();
        },
        appendToDom : function() {
            if(this.domElement && !Dom.isAncestor(this.layer.tileContainer, this.domElement)) {
                this.layer.tileContainer.appendChild(this.domElement);
            }
        },
        remove : function() {
            this.stopTick();
            Mapper.PlanetTile.superclass.remove.call(this);
        },

        startTick : function() {
            if(this.data) {
                var subTick;

                if(this.data.pending_build && this.data.pending_build.seconds_remaining > 0) {
                    this._createBuildCounter();
                    subTick = true;
                }
                else if(this.counterBuild) {
                    this.counterBuild.parentNode.removeChild(this.counterBuild);
                    delete this.counterBuild;
                }

                if(this.data.work && this.data.work.seconds_remaining > 0) {
                    this._createWorkCounter();
                    subTick = true;
                }
                else if(this.counterWork){
                    this.counterWork.parentNode.removeChild(this.counterWork);
                    delete this.counterWork;
                }

                if(subTick && !this.isTicking) {
                    this.isTicking = true;
                    Game.onTick.subscribe(this.tick, this, true);
                }
            }
        },
        stopTick : function() {
            if(this.isTicking) {
                Game.onTick.unsubscribe(this.tick, this);
                delete this.isTicking;

                if(this.counterBuild) {
                    this.counterBuild.parentNode.removeChild(this.counterBuild);
                    delete this.counterBuild;
                }
                if(this.counterWork) {
                    this.counterWork.parentNode.removeChild(this.counterWork);
                    delete this.counterWork;
                }
            }
        },
        finishTick : function() {
            this.stopTick();
            if(this.data.pending_build && this.data.upgrade) {
                delete this.data.pending_build;
                this.data.level = (this.data.level*1) + 1;
                this.data.image = this.data.upgrade.image;
                this.map.addSingleTileData(this.data);
                this.refresh();
            }
            else {
                this.fireEvent("onReload", this);
            }
        },
        tick : function(e, oArgs) {
            var tickSec = oArgs[0]/1000, hasUpgrade, hasWork;
            if(this.data.pending_build) {
                this.data.pending_build.seconds_remaining -= tickSec;
                var remainingBuild = Math.round(this.data.pending_build.seconds_remaining);
                var upgrade = this.data.upgrade;
                if (remainingBuild > 0 && remainingBuild < 15 && upgrade && upgrade.image && !upgrade.preloaded) {
                    upgrade.preloaded = true;
                    var imgSize = this.map.getTileImageSize();
                    var img = new Image();
                    img.src = [Lib.AssetUrl,'planet_side/',imgSize,upgrade.image,'.png'].join('');
                }
                if (remainingBuild < 0) {
                    remainingBuild = 0;
                }
                hasUpgrade = remainingBuild > 0;
                this.counterBuild.innerHTML = Lib.formatTime(remainingBuild);
            }
            if(this.data.work) {
                this.data.work.seconds_remaining -= tickSec;
                var remainingWork = Math.round(this.data.work.seconds_remaining);
                if (remainingWork < 0) {
                    remainingWork = 0;
                }
                hasWork = remainingWork > 0;
                this.counterWork.innerHTML = Lib.formatTime(remainingWork);
            }
            if(!hasUpgrade && !hasWork) {
                this.finishTick();
            }
            else if(!hasUpgrade && this.data.pending_build && this.data.pending_build.seconds_remaining <= 0) {
                this.finishTick();
            }
            else if(!hasWork && this.data.work && this.data.work.seconds_remaining <= 0) {
                this.finishTick();
            }
        },

        refreshCounter : function() {
            var obj = this.map.getTile(this.x,this.y,this.z);
            this.blank = obj.blank;
            this.url = obj.url;
            this.data = obj.data;
            //make sure we're ticking if we need too
            this.startTick();
            /*
            if(!(this.data && this.data.pending_build && this.data.pending_build.seconds_remaining > 0.1)) {
                this.counterBuild.parentNode.removeChild(this.counterBuild);
                delete this.counterBuild;
            }
            if(this.data && this.data.pending_build && this.data.pending_build.seconds_remaining > 0.5) {
                this._createCounter();
                var remaining = Math.round(this.data.pending_build.seconds_remaining);
                if (remaining < 0) {
                    remaining = 0;
                }
                this.counterBuild.innerHTML = Lib.formatTime(remaining);
            }
            else {
                this.counterBuild.parentNode.removeChild(this.counterBuild);
                delete this.counterBuild;
            }
            */
        },
        _createBuildCounter : function() {
            if(!this.counterBuild) {
                var counterBuild = this.domElement.appendChild(document.createElement('div'));
                Dom.addClass(counterBuild, "planetMapTileCounter");
                Dom.setStyle(counterBuild, "width", this.tileSizeInPx + 'px');
                Dom.setStyle(counterBuild, "height", this.tileSizeInPx + 'px');
                this.counterBuild = counterBuild;
            }
        },
        _createWorkCounter : function() {
            if(!this.counterWork) {
                var counterWork = this.domElement.appendChild(document.createElement('div'));
                Dom.addClass(counterWork, "planetMapTileCounterWork");
                //Dom.setStyle(counterWork, "width", this.tileSizeInPx + 'px');
                //Dom.setStyle(counterWork, "height", this.tileSizeInPx + 'px');
                this.counterWork = counterWork;
            }
            if(this.cBar) {
                Dom.setStyle(this.counterWork, "bottom" ,"20px");
            }
            else {
                Dom.setStyle(this.counterWork, "bottom" ,"0");
            }
        },
        _createActionIcon : function() {
            if(this.actionIcon) {
                if(this.data) {
                    if (Game.GetCookieSettings("showLevels","0") == "1") {
                        Dom.setStyle(this.actionIcon, "visibility", "visible");
                    }
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
                    if(Game.GetCookieSettings("showLevels", "0") == "1") {
                        Dom.setStyle(div, "visibility", "visible");
                    }
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



    var TileLayer = function(map, visibleArea, TileConstructor){
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

        this.createEvent("onReloadTile");

        this.render();

    };
    TileLayer.prototype = {
        findTile : function(x,y,zoom){
            //if(this.tileCache) {}
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
                scope:this
            }, x1, x2, y1, y2);
        },

        onReloadTile : function(tile) {
            this.fireEvent("onReloadTile", tile);
        },
        render : function(getNew) {
            if(getNew) {
                var bounds = this.visibleArea.coordBounds();

                this._getTiles(bounds.x1, bounds.x2, bounds.y1, bounds.y2);
            }
            else {
                this.showTiles();
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
        deleteCache : function() {
            for( var key in this.tileCache ){
                if( this.tileCache.hasOwnProperty(key) ){
                    this.tileCache[key].destroy();
                }
            }
        },
        destroy : function() {
            this.unsubscribeAll();
            this.deleteCache();
            //this.map.movableContainer.removeChild( this.tileContainer );
            Event.purgeElement(this.tileContainer);
            this.tileContainer.parentNode.removeChild(this.tileContainer);
            delete this.tileContainer;
            delete this.tileCache;
        },
        clear : function() {
            this.removeAllTilesNotContainedIn({});
        },
        reset : function() {
            this.removeAllTilesNotContainedIn({});
            this.tileCache = {};
        }
    };
    Lang.augmentProto(TileLayer, Util.EventProvider);

    Mapper.StarTileLayer = function(map, visibleArea, TileConstructor) {
        Mapper.StarTileLayer.superclass.constructor.call(this, map, visibleArea, TileConstructor);
    };
    Lang.extend(Mapper.StarTileLayer, TileLayer, {
        _showCachedTiles : function() {
            if(this.tileCache) {
                var bounds = this.visibleArea.coordBounds();
                var planets = Game.EmpireData.planetsByName || {};

                //from left to right (smaller to bigger)
                for(var xc=bounds.x1; xc <= bounds.x2; xc++){
                    //from bottom to top (smaller to bigger)
                    for(var yc=bounds.y2; yc <= bounds.y1; yc++){
                        var tile = this.findTile(xc,yc,this.map.zoom);
                        if(tile) {
                            if(tile.data && tile.data.name) {
                                if(planets.hasOwnProperty(tile.data.name)) {
                                    if(Lacuna.MapStar._map.tileCache[tile.x] && Lacuna.MapStar._map.tileCache[tile.x][tile.y]) {
                                        delete Lacuna.MapStar._map.tileCache[tile.x][tile.y]; // Remove the planet from the cache
                                    }
                                    tile.blank = true;
                                }
                            }
                            if(tile.blank) {
                                tile.refresh();
                            }
                            tile.appendToDom();
                            tile.unsubscribeAll(); //so we don't get multiple subs on the same tile
                            tile.subscribe("onReload", this.onReloadTile, this, true);
                        }
                    }
                }
            }
        },
        showTiles : function(refresh) {
            if(this.tileCache) {
                var bounds = this.visibleArea.coordBounds();
                var tiles = {};
                //from left to right (smaller to bigger)
                for(var xc=bounds.x1; xc <= bounds.x2; xc++){
                    //from bottom to top (smaller to bigger)
                    for(var yc=bounds.y2; yc <= bounds.y1; yc++){
                        var tile = this.findTile(xc,yc,this.map.zoom), doSub;
                        if(!tile) {
                            var ox = (xc - this.baseTileLoc[0]) * this.map.tileSizeInPx;
                            var oy = ((yc * -1) - this.baseTileLoc[1]) * this.map.tileSizeInPx;
                            //var offsets = this.visibleArea.getOffsetFromCoords(xc, xy, this.baseTileCoords[0], this.baseTileCoords[1]);
                            tile = new this.TileConstructor(xc, yc, this.map.zoom, ox, oy, this);
                            this.tileCache[tile.id] = tile;
                            tile.appendToDom();
                            doSub = true;
                        }
                        else if(refresh) {
                            tile.refresh();
                            doSub = true;
                        }
                        else {
                            if(tile.blank) {
                                tile.refresh();
                            }
                            tile.appendToDom();
                            doSub = true;
                        }
                        if(doSub) {
                            tile.unsubscribeAll(); //so we don't get multiple subs on the same tile
                            tile.subscribe("onReload", this.onReloadTile, this, true);
                        }
                        tiles[tile.id] = tile;
                    }
                }
                this.removeAllTilesNotContainedIn( tiles );
            }
        }
    });

    Mapper.PlanetTileLayer = function(map, visibleArea, TileConstructor) {
        this.bounds = {x1:map.maxBounds.x1Left,x2:map.maxBounds.x2Right,y1:map.maxBounds.y1Top,y2:map.maxBounds.y2Bottom};

        Mapper.PlanetTileLayer.superclass.constructor.call(this, map, visibleArea, TileConstructor);
    };
    Lang.extend(Mapper.PlanetTileLayer, TileLayer, {
        _showCachedTiles : function() {
            if(this.tileCache) {
                var bounds = this.bounds;

                //from left to right (smaller to bigger)
                for(var xc=bounds.x1; xc <= bounds.x2; xc++){
                    //from bottom to top (smaller to bigger)
                    for(var yc=bounds.y2; yc <= bounds.y1; yc++){
                        var tile = this.findTile(xc,yc,this.map.zoom);
                        if(tile) {
                            if(tile.blank) {
                                tile.refresh();
                            }
                            tile.appendToDom();
                            tile.unsubscribeAll(); //so we don't get multiple subs on the same tile
                            tile.subscribe("onReload", this.onReloadTile, this, true);
                        }
                    }
                }
            }
        },
        showTiles : function(refresh) {
            if(this.tileCache) {
                var bounds = this.bounds;
                var tiles = {};
                //from left to right (smaller to bigger)
                for(var xc=bounds.x1; xc <= bounds.x2; xc++){
                    //from bottom to top (smaller to bigger)
                    for(var yc=bounds.y2; yc <= bounds.y1; yc++){
                        var tile = this.findTile(xc,yc,this.map.zoom), doSub;
                        if(!tile) {
                            var ox = (xc - this.baseTileLoc[0]) * this.map.tileSizeInPx;
                            var oy = ((yc * -1) - this.baseTileLoc[1]) * this.map.tileSizeInPx;
                            //var offsets = this.visibleArea.getOffsetFromCoords(xc, xy, this.baseTileCoords[0], this.baseTileCoords[1]);
                            tile = new this.TileConstructor(xc, yc, this.map.zoom, ox, oy, this);
                            this.tileCache[tile.id] = tile;
                            tile.appendToDom();
                            doSub = true;
                        }
                        else if(refresh) {
                            tile.refresh();
                            doSub = true;
                        }
                        else {
                            if(tile.blank) {
                                tile.refresh();
                            }
                            tile.appendToDom();
                            doSub = true;
                        }
                        if(doSub) {
                            tile.unsubscribeAll(); //so we don't get multiple subs on the same tile
                            tile.subscribe("onReload", this.onReloadTile, this, true);
                        }
                        tiles[tile.id] = tile;
                    }
                }
            }
        }
    });



    var Map = function( divId, options ) {
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

        this.createEvent("onReloadTile");

        this.mapDiv = document.getElementById( divId );
        this.mapDiv.style.overflow = "hidden";
        this.movableContainer = new Mapper.MovableContainer( this.mapDiv );

        this.init();

        var ua = navigator.userAgent;
        if(ua.match(/iPhone|iPod|iPad/i)) {
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
            //YAHOO.log("zooming in", "info", "Mapper.Map");
            if( this.zoom >= this.maxZoom ) {
                return;
            }
            this.setZoomLevel( this.zoom + 1 );
            //called by zoom display change //this.refresh();
        },
        zoomOut : function() {
            //YAHOO.log("zooming out", "info", "Mapper.Map");
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
            this.width = $(window.document.body).width();
            this.height = $(window.document.body).height();

            this.movableContainer.reset();
            this.visibleArea = new Mapper.VisibleArea(this);

            if( this.tileLayer ) {
                this.tileLayer.destroy();
            }
            this.tileLayer = new this.TileLayer(this, Mapper.util.clone(this.visibleArea), this.Tile);
            //pass through
            this.tileLayer.subscribe("onReloadTile", function(tile){
                this.fireEvent("onReloadTile",tile.data.id);
            }, this, true);
        },
        refresh : function(isZoom) {
            //store location before we redraw
            var vac = isZoom ? this.visibleArea.centerLoc() : this.visibleArea.centerLocPx();
            //set tile size
            this._setTileSizeByZoom();
            //draw
            this.redraw();
            //reset location after draw
            if(isZoom) {
                this.setCenterTo(vac[0],vac[1]);
            }
            else {
                this.setCenterToPx(vac[0],vac[1]);
            }
        },
        resize : function() {
            this.width = this.mapDiv.offsetWidth;
            this.height = this.mapDiv.offsetHeight;

            this.visibleArea.resize();

            this.tileLayer.showTiles();
        },
        setCenterTo : function(locX, locY) {
            if (Lang.isNumber(locX) && Lang.isNumber(locY) && this.tileLayer) {

                var otherWidth = this.visibleArea.centerX,
                    otherHeight = this.visibleArea.centerY,
                    ox = locX * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherWidth,
                    oy = (locY * -1) * this.tileSizeInPx + (this.tileSizeInPx / 2) - otherHeight;

                this.moveByPx(ox * -1, oy * -1);
                this.tileLayer.render(true);
            }
        },
        setCenterToPx : function(pX, pY) {
            if(Lang.isNumber(pX) && Lang.isNumber(pY) && this.tileLayer) {
                var otherWidth = this.visibleArea.centerX,
                    otherHeight = this.visibleArea.centerY,
                    ox = pX - otherWidth,
                    oy = pY - otherHeight;

                this.moveByPx(ox * -1, oy * -1);
                this.tileLayer.render(true);
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
    Lang.augmentProto(Map, Util.EventProvider);

    var MAX_STAR_AREA = 3001;
    Mapper.StarMap = function( divId, options ) {
        Mapper.StarMap.superclass.constructor.call(this, divId, options);
        Dom.setStyle(this.mapDiv, 'background-image', 'url("'+Lib.AssetUrl+'star_system/field.png")');
    };
    Lang.extend(Mapper.StarMap, Map, {
        _setTileSizeByZoom : function() {
            Game.SetCookieSettings("starZoom", this.zoom);
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
                case -2:
                    this.setTileSizeInPx(35);
                    break;
                case -3:
                    this.setTileSizeInPx(20);
                    break;
                default:
                    this.setTileSizeInPx(75);
                    break;
            }
        },
        init : function() {
            this.maxZoom = 2;
            this.minZoom = -3;

            var mapSize = Game.ServerData.star_map_size;
            this.maxBounds = {x1Left:mapSize.x[0],x2Right:mapSize.x[1],y1Top:mapSize.y[1],y2Bottom:mapSize.y[0]};
            this.requestQueue = [];

            this.Tile = Mapper.StarTile;
            this.TileLayer = Mapper.StarTileLayer;

            this.zoom = Game.GetCookieSettings("starZoom",0)*1;
            this.hidePlanets = Game.GetCookieSettings("hidePlanets", 0)*1;

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

            if((xDiff * yDiff) > MAX_STAR_AREA) { //if out of bounds split and try again
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
            else {
                //YAHOO.log(data, "debug", "StarMap.getTileData.requestData");
                require('js/actions/menu/loader').show();
                Game.Services.Map.get_star_map({ args: {
                    session_id : Game.GetSession(""),
                    left : x1,
                    right : x2,
                    top : y1,
                    bottom : y2
                }},{
                    success : function(o){
                        //YAHOO.log(o, "debug", "StarMap.getTileData.get_stars.success");
                        require('js/actions/menu/loader').hide();
                        if(o && o.result) {
                            Game.ProcessStatus(o.result.status);
                            this.addTileData(o.result.stars);
                            callback.success.call(callback.scope || this, callback.argument);
                        }
                    },
                    failure : function(o){
                        if(callback.failure) {
                            callback.failure.call(callback.scope || this, o);
                            return true;
                        }
                    },
                    scope:this
                });
            }
        },
        getBounds : function() {
            return this.bounds[this.zoom] || {x1Left:0,x2Right:0,y1Top:0,y2Bottom:0};
        },

        addTileData : function(aStars) {
            //var startZoomLevel = 0;
            var cp = Game.GetCurrentPlanet();

            for(var i=0; i<aStars.length; i++) {
                var star = aStars[i];
                star.isStar = true;
                if(!this.tileCache[star.x]) {
                    this.tileCache[star.x] = {};
                }
                this.tileCache[star.x][star.y] = star;

                if(star.bodies) { // && cp.star_id == star.id) {
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

                //this.updateBounds(star);
            }
            //return startZoomLevel;
        },
        reset : function() {
            this.tileCache = {};
            this.bounds = {};
            this.tileLayer.reset();
        }

    });

    Mapper.PlanetMap = function( divId, options ) {
        Mapper.PlanetMap.superclass.constructor.call(this, divId);
        this.setSurfaceUrl(options.surfaceUrl);
    };
    Lang.extend(Mapper.PlanetMap, Map, {
        _setTileSizeByZoom : function() {
            Game.SetCookieSettings("planetZoom", this.zoom);
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
                case -2:
                    this.setTileSizeInPx(50);
                    break;
                default:
                    this.setTileSizeInPx(200);
                    break;
            }
        },
        init : function() {
            this.maxZoom = 2;
            this.minZoom = -2;

            this.bounds = {x1Left:-5,x2Right:5,y1Top:5,y2Bottom:-5};
            this.maxBounds = {x1Left:-5,x2Right:5,y1Top:5,y2Bottom:-5};

            this.Tile = Mapper.PlanetTile;
            this.TileLayer = Mapper.PlanetTileLayer;

            this.zoom = Game.GetCookieSettings("planetZoom",0)*1;
            this._setTileSizeByZoom();
        },
        setCenterToCommand : function() {
            if(this.command) {
                this.setCenterTo(this.command.x, this.command.y);
            }
        },
        getTileImageSize : function() {
            switch(this.zoom) {
                case 2:
                    return "400/";
                case 1:
                    return "300/";
                case -1:
                    return "100/";
                case -2:
                    return "50/";
            }
        },
        getTile : function(x, y, z){
            var ySet = this.tileCache[x],
                building = ySet ? ySet[y] : null;

            if(building && building.image) {
                return {blank:building.level == 0, data:building, url:[Lib.AssetUrl,'planet_side/',this.getTileImageSize(),building.image,'.png'].join('')};
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
        addTileData : function(oTiles, filterOutDeleted) {
            var startZoomLevel = 0,
                newTileCache = {};
            for(var tKey in oTiles) {
                if(oTiles.hasOwnProperty(tKey)){
                    var tile = oTiles[tKey];
                    tile.id = tKey;
                    if(tile.url == "/planetarycommand" || tile.url == "/stationcommand") {
                        this.command = tile;
                        this.command.x *= 1;
                        this.command.y *= 1;
                    }
                    if(!newTileCache[tile.x]) {
                        newTileCache[tile.x] = {};
                    }
                    newTileCache[tile.x][tile.y] = tile;
                }
            }
            if(filterOutDeleted) {
                for(var x in this.tileCache) {
                    for(var y in this.tileCache[x]) {
                        if(!newTileCache[x] || !newTileCache[x][y]) {
                            this.removeTile(x,y);
                        }
                    }
                }
            }
            this.tileCache = newTileCache;

            return startZoomLevel;
        },
        addSingleTileData : function(oBuilding) {
            if(oBuilding.url == "/planetarycommand" || oBuilding.url == "/stationcommand") {
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
        this.dd = new YAHOO.util.DragDrop(map.mapDiv, 'mapper' );
        this.dd.subscribe("dragEvent", this.moveMap, this, true);
        this.dd.subscribe("startDragEvent", this.startDrag, this, true);
        this.dd.subscribe("endDragEvent", this.endDrag, this, true);

        var moveKeyListener = new KL(document, {
            keys : [ KL.KEY.UP, KL.KEY.DOWN, KL.KEY.LEFT, KL.KEY.RIGHT ]
        }, { fn: this.moveKey, scope:this, correctScope:true }, KL.KEYDOWN);
        var moveKeyUpListener = new KL(document, {
            keys : [ KL.KEY.UP, KL.KEY.DOWN, KL.KEY.LEFT, KL.KEY.RIGHT ]
        }, { fn: this.moveKeyUp, scope:this, correctScope:true }, KL.KEYUP);

        var xMove = 0;
        var yMove = 0;
        var lastMove = (new Date(0)).getTime();
        var timerActive = false;
        Game.onScroll(map.mapDiv, function(e, x, y) {
            xMove += x;
            yMove += y;

            // we get tons of events, so only move every 50 milliseconds
            var now = (new Date()).getTime();
            if ( now - lastMove > 50 ) {
                lastMove = now;
                map.moveByPx(xMove, yMove);
                xMove = 0;
                yMove = 0;
            }
            // refresh screen every second during scrolling, and once afterward
            if (!timerActive) {
                timerActive = true;
                setTimeout(function(){
                    map.tileLayer.render(true);
                    timerActive = false;
                }, 1000);
            }
        });

        // Move map with arrow keys.
        moveKeyListener.enable();
        moveKeyUpListener.enable();


        if((map.maxZoom - map.minZoom) != 0) {
            var zoomEl = document.createElement('div');
            zoomEl.className = 'mapiator_zoom';
            zoomEl.innerHTML = [
                '<div class="mapiator_zoom_slider">',
                '    <div class="mapiator_zoom_slider_thumb">',
                '        <img src="' + Lib.AssetUrl + 'ui/zoom_slider.png" />',
                '    </div>',
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
            zoomSlider.setZoom = function(zoom, skipAnim, force, silent) {
                this.setValue((map.maxZoom - zoom) * zoomScale, skipAnim, force, silent);
            };
            zoomSlider.getZoom = function() {
                return map.maxZoom - this.getValue() / zoomScale;
            };
            zoomSlider.setZoom(map.zoom, true, true, true);
            zoomSlider.subscribe("change", function () {
                map.setZoomLevel( this.getZoom() );
                map.refresh(true);
            });
            this.zoomSlider = zoomSlider;
        }

    };
    Mapper.TraditionalController.prototype = {
        setZoomDisplay : function(zoom) {
            if(this.zoomSlider && this.zoomSlider.getZoom() != zoom) {
                this.zoomSlider.setZoom(zoom);
            }
        },
        startDrag : function(e){
            clearTimeout(this._timeout);
            this.xmove = this.ymove = undefined;
            this._dragging = true;
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
                oSelf.map.tileLayer.render(true);
                oSelf._dragging = false;
            }, 500);
        },
        isDragging : function() {
            return this._dragging; // Math.abs(this.xmove) > 5;
        },
        moveKey : function(evName, evInfo) {
            var keyCode = evInfo[0],
                e = evInfo[1];
            if(!Dom.inDocument(this.map.mapDiv)) {
                return;
            }
            switch (e.target.tagName) {
                case "INPUT": case "SELECT": case "TEXTAREA": return;
            }

            if (keyCode == KL.KEY.UP) {
                this.map.moveByTiles(0,1);
            }
            else if (keyCode == KL.KEY.DOWN) {
                this.map.moveByTiles(0,-1);
            }
            else if (keyCode == KL.KEY.LEFT) {
                this.map.moveByTiles(1,0);
            }
            else if (keyCode == KL.KEY.RIGHT) {
                this.map.moveByTiles(-1,0);
            }
        },
        moveKeyUp : function(evName, evInfo) {
            var keyCode = evInfo[0];
            var e = evInfo[1];
            if(!Dom.inDocument(this.map.mapDiv)) {
                return;
            }
            switch (e.target.tagName) {
                case "INPUT": case "SELECT": case "TEXTAREA": return;
            }
            this.map.tileLayer.render(true);
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
// vim: noet:ts=4:sw=4
