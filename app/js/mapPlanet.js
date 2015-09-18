YAHOO.namespace("lacuna");

var _ = require('lodash');

if (typeof YAHOO.lacuna.MapPlanet == "undefined" || !YAHOO.lacuna.MapPlanet) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var FactoryMap = {
        //buildings
        "/archaeology": Lacuna.buildings.Archaeology,
        "/blackholegenerator": Lacuna.buildings.BlackHoleGenerator,
        "/capitol": Lacuna.buildings.Capitol,
        "/development": Lacuna.buildings.Development,
        "/distributioncenter": Lacuna.buildings.DistributionCenter,
        "/embassy": Lacuna.buildings.Embassy,
        "/energyreserve": Lacuna.buildings.EnergyReserve,
        "/entertainment": Lacuna.buildings.Entertainment,
        "/essentiavein": Lacuna.buildings.EssentiaVein,
        "/foodreserve": Lacuna.buildings.FoodReserve,
        "/geneticslab": Lacuna.buildings.GeneticsLab,
        "/intelligence": Lacuna.buildings.Intelligence,
        "/inteltraining": Lacuna.buildings.IntelTraining,
        "/libraryofjith": Lacuna.buildings.LibraryOfJith,
        "/mayhemtraining": Lacuna.buildings.MayhemTraining,
        "/mercenariesguild": Lacuna.buildings.MercenariesGuild,
        "/miningministry": Lacuna.buildings.MiningMinistry,
        "/missioncommand": Lacuna.buildings.MissionCommand,
        "/network19": Lacuna.buildings.Network19,
        "/observatory": Lacuna.buildings.Observatory,
        "/oracleofanid": Lacuna.buildings.OracleOfAnid,
        "/orestorage": Lacuna.buildings.OreStorage,
        "/park": Lacuna.buildings.Park,
        "/planetarycommand": Lacuna.buildings.PlanetaryCommand,
        "/politicstraining": Lacuna.buildings.PoliticsTraining,
        "/security": Lacuna.buildings.Security,
        "/shipyard": Lacuna.buildings.Shipyard,
        "/spaceport": Lacuna.buildings.SpacePort,
        "/ssla": Lacuna.buildings.SpaceStationLab,
        "/subspacesupplydepot": Lacuna.buildings.SubspaceSupplyDepot,
        "/thefttraining": Lacuna.buildings.TheftTraining,
        "/themepark": Lacuna.buildings.ThemePark,
        "/thedillonforge": Lacuna.buildings.TheDillonForge,
        "/templeofthedrajilites": Lacuna.buildings.TempleOfTheDrajilites,
        "/trade": Lacuna.buildings.Trade,
        "/transporter": Lacuna.buildings.Transporter,
        "/waterstorage": Lacuna.buildings.WaterStorage,
        "/wasteexchanger": Lacuna.buildings.WasteExchanger,
        "/wasterecycling": Lacuna.buildings.WasteRecycling,
        //modules
        "/parliament": Lacuna.modules.Parliament,
        "/policestation": Lacuna.modules.PoliceStation,
        "/stationcommand": Lacuna.modules.StationCommand
    };

    var MapPlanet = function() {
        this.createEvent("onMapRpc");
    };
    MapPlanet.prototype = {
        _buildDetailsPanel : _.once(function() {
            var panelId = "buildingDetails";
            var panel = document.createElement("div");
            panel.id = panelId;
            panel.innerHTML = ['<div class="hd">Details</div>',
                '<div class="bd">',
                '    <div class="yui-gf" style="padding-bottom:5px;">',
                '        <div class="yui-u first" id="buildingDetailsImgBkgd" style="text-align:center;">',
                '            <img id="buildingDetailsImg" src="" alt="" style="width:100px;height:100px;" />',
                '        </div>',
                '        <div class="yui-u">',
                '            <ul>',
                '                <li id="buildingDetailsName"></li>',
                '                <li id="buildingDetailsTimeLeft"></li>',
                '                <li id="buildingDetailsDesc"></li>',
                '            </ul>',
                '        </div>',
                '    </div>',
                '    <div id="buildingDetailTabs" class="yui-navset">',
                '        <ul class="yui-nav">',
                '        </ul>',
                '        <div class="yui-content">',
                '        </div>',
                '    </div>',
                '</div>'].join('');
            document.getElementById('oldYUIPanelContainer').appendChild(panel);
            Dom.addClass(panel, "nofooter");

            this.buildingDetails = new YAHOO.widget.Panel(panelId, {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                fixedcenter:false,
                close:true,
                width:"800px",
                underlay:false,
                zIndex:9995,
                context:["header","tl","bl"]
            });
            this.buildingDetails.addQueue = function(seconds, queueFn, elm, sc) {
                this.queue = this.queue || [];
                //check if the queue is empty and store
                var notStarted = this.queue.length == 0;
                //push new queue item so it's immediately available for the tick
                this.queue.push({secondsRemaining:seconds*1, el:elm, fn:queueFn, scope:sc});
                //make sure we subscribe to the tick
                if(notStarted) {
                    Game.onTick.subscribe(this.processQueue, this, true);
                }
            };
            this.buildingDetails.processQueue = function(e, oArgs) {
                if(this.queue.length > 0) {
                    var queue = this.queue,
                        diff = oArgs[0]/1000,
                        newq = [];

                    while(queue.length > 0) {
                        var callback = queue.pop();
                        callback.secondsRemaining -= diff;
                        if(!callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el) && callback.secondsRemaining > 0) {
                            newq.push(callback);
                        }
                    }
                    this.queue = newq;
                }
                else {
                    Game.onTick.unsubscribe(this.processQueue);
                }
            };
            this.buildingDetails.resetQueue = function() {
                Game.onTick.unsubscribe(this.processQueue);
                this.queue = [];
            };
            this.buildingDetails.isVisible = function() {
                return this.cfg.getProperty("visible");
            };
            this.buildingDetails.resetDisplay = function(oSelf) {
                this.resetQueue();
                this.dataStore = {};
                oSelf.currentBuilding = undefined;
                if(oSelf.currentBuildingObj) {
                    oSelf.currentBuildingObj.destroy();
                    oSelf.currentBuildingObj = undefined;
                }
                if(oSelf.currentViewConnection) {
                    require('js/actions/menu/loader').hide();
                    Util.Connect.abort(oSelf.currentViewConnection);
                }
            };

            this.buildingDetails.renderEvent.subscribe(function(){
                this.img = Dom.get("buildingDetailsImg");
                this.name = Dom.get("buildingDetailsName");
                this.desc = Dom.get("buildingDetailsDesc");
                this.timeLeftLi = Dom.get("buildingDetailsTimeLeft");

                this.tabView = new YAHOO.widget.TabView("buildingDetailTabs");
                this.tabView.getTabByLabel = function(label) {
                    var tabs = this.get("tabs");
                    for(var t=0; t<tabs.length; t++) {
                        var tab = tabs[t];
                        if(tab.get("label") == label) {
                            return this.getTab(t);
                        }
                    }
                };
                this.tabView.set('activeIndex',0);

                this.queue = [];
                this.dataStore = {};
            });
            this.buildingDetails.hideEvent.subscribe(function(){
                this.buildingDetails.resetDisplay(this);
            }, this, true);

            this.buildingDetails.render();
            Game.OverlayManager.register(this.buildingDetails);
        }),
        _buildBuilderPanel : _.once(function() {
            var panelId = "buildingBuilder";

            var panel = document.createElement("div");
            panel.id = panelId;
            panel.innerHTML = [
                '<div class="hd">Builder</div>',
                '    <div class="bd">',
                '        <div>Building on X<span id="builderX"></span>:Y<span id="builderY"></span></div>',
                '        <div id="builderMenu" class="yui-content" style="overflow:auto;">',
                '            <ul>',
                '                <li class="builderMenuGroup">',
                '                    <em>Resources</em>',
                '                    <ul>',
                '                        <li><a class="button" href="#Resources/Food">Food</a></li>',
                '                        <li><a class="button" href="#Resources/Ore">Ore</a></li>',
                '                        <li><a class="button" href="#Resources/Water">Water</a></li>',
                '                        <li><a class="button" href="#Resources/Energy">Energy</a></li>',
                '                        <li><a class="button" href="#Resources/Waste">Waste</a></li>',
                '                        <li><a class="button" href="#Resources/Storage">Storage</a></li>',
                '                        <li><a class="button" href="#Resources">All Resources</a></li>',
                '                    </ul>',
                '                </li>',
                '                <li class="builderMenuGroup">',
                '                    <em>Infrastructure</em>',
                '                    <ul>',
                '                        <li><a class="button" href="#Infrastructure/Construction">Construction</a></li>',
                '                        <li><a class="button" href="#Infrastructure/Intelligence">Intelligence</a></li>',
                '                        <li><a class="button" href="#Infrastructure/Happiness">Happiness</a></li>',
                '                        <li><a class="button" href="#Infrastructure/Ships">Ships</a></li>',
                '                        <li><a class="button" href="#Infrastructure/Colonization">Colonization</a></li>',
                '                        <li><a class="button" href="#Infrastructure/Trade">Trade</a></li>',
                '                        <li><a class="button" href="#Infrastructure">All Infrastructure</a></li>',
                '                    </ul>',
                '                </li>',
                '                <li class="builderMenuGroup"><a class="button" href="#Plan"><em>Plans</em></a></li>',
                '                <li class="builderMenuGroup"><a class="button" href="#"><em>All Buildings</em></a></li>',
                '            </ul>',
                '        </div>',
                '        <div id="builderListContainer">',
                '            <div id="builderFilter" style="overflow:hidden">',
                '                <div style="float: right">',
                '                    Available: ',
                '                    <select id="builderTimeFilter">',
                '                        <option value="">All</option>',
                '                        <option value="Now" selected="selected">Now</option>',
                '                        <option value="Soon">Soon</option>',
                '                        <option value="Later">Later</option>',
                '                    </select>',
                '                </div>',
                '                <a href="#" id="builderBuildLink">Build</a><span id="builderFilterTrail"> &gt; <a href="#Resources" class="buildMenuLink">Resources</a> &gt; <span class="buildMenuLink">Ore</span></span>',
                '            </div>',
                '            <div class="yui-content" style="overflow:auto;"><ul id="builderList"></ul></div>',
                '        </div>',
                '    </div>',
                '</div>'].join('');
            document.getElementById('oldYUIPanelContainer').appendChild(panel);
            Dom.addClass(panel, "nofooter");

            this.buildingBuilder = new YAHOO.widget.Panel(panelId, {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                fixedcenter:false,
                close:true,
                underlay:false,
                width:"600px",
                zIndex:9996,
                context:["header","tr","br"]
            });
            this.buildingBuilder.renderEvent.subscribe(function(){
                this.X = Dom.get("builderX");
                this.Y = Dom.get("builderY");
                this.menuView = Dom.get("builderMenu");
                this.listView = Dom.get("builderListContainer");
                this.buildingList = Dom.get("builderList");
                this.timeFilter = Dom.get("builderTimeFilter");
                this.filterTrail = Dom.get("builderFilterTrail");

                Event.on("builderTimeFilter", "change", this.updateDisplay, this, true);
                Event.on("builderBuildLink", "click", function(e) {
                    Event.preventDefault(e);
                    this.buildingList.innerHTML = "";
                    Dom.setStyle(this.listView, 'display', 'none');
                    Dom.setStyle(this.menuView, 'display', 'block');
                }, this, true);
                Event.delegate(this.menuView, "click", this.clickBuildMenu, 'a', this, true);
                Event.delegate("builderFilter", "click", this.clickBuildMenu, 'a.buildMenuLink', this, true);
                Event.delegate(this.buildingList, "click", this.build, "button", this, true);
                Event.delegate(this.buildingList, "click", this.build, "img.buildingImage", this, true);
            });
            this.buildingBuilder.hideEvent.subscribe(function(){
                this.buildingBuilder.resetDisplay(this);
            }, this, true);
            this.buildingBuilder.clickBuildMenu = function (e, matchedEl, container) {
                Event.preventDefault(e);
                var frag = matchedEl.href.split("#")[1];
                var tags = frag.split("/");
                var mainTag = tags[0];
                var subTag = tags[1];
                this.viewBuildings(mainTag, subTag);
            };
            this.buildingBuilder.viewBuildings = function(mainTag, subTag) {
                this.mainTag = mainTag;
                this.subTag = subTag;
                Dom.setStyle(this.listView, 'display', 'block');
                Dom.setStyle(this.menuView, 'display', 'none');
                this.buildingList.innerHTML = "";
                var displayTag = mainTag ? mainTag : "All";
                if (subTag) {
                    this.filterTrail.innerHTML = ' &gt; <a class="buildMenuLink" href="#' + mainTag + '">' + displayTag + '</a> &gt; <span class="buildMenuLink">' + subTag + '</span>';
                }
                else {
                    this.filterTrail.innerHTML = ' &gt; <span class="buildMenuLink">' + displayTag + '</span>';
                }
                var filterTag = subTag ? subTag : mainTag;
                if(!this.buildable[mainTag] && !this.buildable[filterTag]) {
                    Lacuna.MapPlanet.BuilderGet({
                        session_id: Game.GetSession(""),
                        body_id: Lacuna.MapPlanet.locationId,
                        x:this.currentTile.x,
                        y:this.currentTile.y,
                        tag:filterTag
                    });
                }
                else {
                    this.updateDisplay();
                }
            };
            this.buildingBuilder.isVisible = function() {
                return this.cfg.getProperty("visible");
            };
            this.buildingBuilder.setTile = function(tile) {
                this.currentTile = tile;
                this.X.innerHTML = tile.x;
                this.Y.innerHTML = tile.y;
            };
            this.buildingBuilder.load = function(b, q, request) {
                this.buildable[request.tag] = b; //store
                this.queue_status = q;

                this.updateDisplay();
            };
            this.buildingBuilder.build = function(e, matchedEl, container) {
                Lacuna.MapPlanet.Build(matchedEl.building, this.currentTile.x, this.currentTile.y);
            };
            this.buildingBuilder.resetDisplay = function(oSelf) {
                if(oSelf.currentBuildConnection) {
                    require('js/actions/menu/loader').hide();
                    Util.Connect.abort(oSelf.currentBuildConnection);
                }
                delete this.currentTile;
                this.buildable = {};
                Dom.setStyle(this.menuView, 'display', 'block');
                Dom.setStyle(this.listView, 'display', 'none');
            };
            this.buildingBuilder.resetFilter = function() {
                this.timeFilter.options[1].selected = 1;
            };
            this.buildingBuilder.updateDisplay = function() {
                var mainTag = this.mainTag;
                var subTag = this.subTag;
                var b = this.buildable[mainTag] || this.buildable[subTag];
                var list = this.buildingList;
                var filters = {};
                if (subTag) {
                    filters[subTag] = 1;
                }
                if (this.timeFilter.value.length) {
                    filters[this.timeFilter.value] = 1;
                }
                var isQueueFull = this.queue_status.max == this.queue_status.current;

                list.parentNode.scrollTop = 0;
                list.innerHTML = "";

                var frag = document.createDocumentFragment(),
                    li = document.createElement("li"),
                    filterCount = 0,
                    names = [],
                    reason, br,
                    planet = Game.GetCurrentPlanet(),
                    isMaxPlots = planet.plots_available*1 === 0;

                for(var key in filters) {
                    if(filters.hasOwnProperty(key)){
                        filterCount++;
                    }
                }

                for(var name in b) {
                    if(b.hasOwnProperty(name)) {
                        var tags = b[name].build.tags,
                            filterMatch = 0;
                        for(var t=0; t<tags.length; t++) {
                            if(filters[tags[t]]){
                                filterMatch++;
                            }
                        }
                        if(filterMatch == filterCount) {
                            names.push(name);
                        }
                    }
                }
                names.sort();

                if ( names.length == 0 ) {
                    var mLi = li.cloneNode(false);
                    mLi.innerHTML = "No available buildings.";
                    list.appendChild(mLi);
                }

                for(var i=0; i<names.length; i++) {
                    var bd = b[names[i]],
                        nLi = li.cloneNode(false),
                        costs = bd.build.cost,
                        prod = bd.production,
                        noPlots = (isMaxPlots && ! bd.build.no_plot_use),
                        isLater = bd.build.tags.indexOf('Later') > -1,
                        isPlan = bd.build.tags.indexOf('Plan') > -1,
                        isNotBuildable = (isLater || isQueueFull || noPlots );

                    bd.name = names[i];

                    if(bd.build.reason) {
                        reason = bd.build.reason[1];
                    }
                    else {
                        reason = undefined;
                        if (isQueueFull) {
                            reason = "Build queue is full.";
                        }
                        else if (noPlots) {
                            reason = "No plots available.";
                        }
                        else if (isPlan) {
                            var extra_level = bd.build.extra_level*1;
                            if (extra_level) {
                                reason = "Will build to level " + (extra_level + 1) + " for free with plan.";
                            }
                            else {
                                reason = "Will build for free with plan.";
                            }
                        }
                    }

                    nLi.innerHTML = [
                    '<div class="yui-gb" style="padding-bottom: 2px; margin-bottom:2px; border-bottom: 1px solid #52acff;">',
                    '    <div class="yui-u first" style="width:200px;background:transparent url(',Lacuna.MapPlanet.surfaceUrl,') no-repeat center;text-align:center">',
                    '        <img src="',Lib.AssetUrl,'planet_side/',bd.image,'.png" style="width:200px;height:200px;cursor:pointer" class="buildingImage" />',
                    '    </div>',
                    '    <div class="yui-u" style="margin-left: 10px; width:349px">',
                    '        <div class="buildingName">',bd.name,':</div>',
                    reason ? '        <div class="buildingReason">'+reason+'</div>' : '',
                    '        <div class="buildingDesc">',Game.GetBuildingDesc(bd.url),'</div>',
                    '        <table class="buildingStats" cellpadding="0" cellspacing="0">',
                    '            <tr><td></td>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></th>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre"  /></th>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></th>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></th>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></th>',
                    '                <th><img src="',Lib.AssetUrl,'ui/s/happiness.png" title="Happiness" class="smallHappy" /></th>',
                    '            </tr>',
                    '            <tr><th>Cost:</th>',
                    '                <td class=',costs.food > planet.food_stored ? 'low-resource' : '','>',costs.food,'</td>',
                    '                <td class=',costs.ore > planet.ore_stored ? 'low-resource' : '','>',costs.ore,'</td>',
                    '                <td class=',costs.water > planet.water_stored ? 'low-resource' : '','>',costs.water,'</td>',
                    '                <td class=',costs.energy > planet.energy_stored ? 'low-resource' : '','>',costs.energy,'</td>',
                    '                <td>',costs.waste,'</td>',
                    '                <td></td>',
                    '            </tr>',
                    '            <tr><th>Prod:</th>',
                    '                <td class=',-1*prod.food_hour > planet.food_hour ? 'low-resource' : '','>',prod.food_hour,'/hr</td>',
                    '                <td class=',-1*prod.ore_hour > planet.ore_hour ? 'low-resource' : '','>',prod.ore_hour,'/hr</td>',
                    '                <td class=',-1*prod.water_hour > planet.water_hour ? 'low-resource' : '','>',prod.water_hour,'/hr</td>',
                    '                <td class=',-1*prod.energy_hour > planet.energy_hour ? 'low-resource' : '','>',prod.energy_hour,'/hr</td>',
                    '                <td>',prod.waste_hour,'/hr</td>',
                    '                <td>',prod.happiness_hour,'/hr</td>',
                    '            </tr>',
                    '        </table>',
                    '        <div style="margin-top: 5px; text-align: center; padding-left: 20px; height: 30px">',
                    isNotBuildable ? '' : '            <button style="width: 100px; height: 30px; font-size: 12pt">Build</button>',
                    '            <img class="smallTime" style="margin-left: ',
                    isNotBuildable ? '120px' : '20px',
                    '; vertical-align: middle" src="',Lib.AssetUrl,'ui/s/time.png" />',Lib.formatTime(costs.time),' sec',
                    '        </div>',
                    '    </div>',
                    '</div>'].join('');

                    if(!isNotBuildable) {
                        Sel.query("button", nLi, true).building = bd;
                        Sel.query("img.buildingImage", nLi, true).building = bd;
                    }

                    frag.appendChild(nLi);
                }

                list.appendChild(frag);
                list.parentNode.scrollTop = 0;
            };

            this.buildingBuilder.render();
            Game.OverlayManager.register(this.buildingBuilder);
        }),

        _fireRpcSuccess : function(result){
            this.fireEvent("onMapRpc", result);
        },
        _fireQueueAdd : function(obj) {
            if(this.buildingDetails.isVisible()) {
                this.buildingDetails.addQueue(obj.seconds, obj.fn, obj.el, obj.scope);
            }
        },
        _fireBuildingReload : function(building) {
            this.ReloadBuilding(building);
        },
        _fireQueueReset : function() {
            this.buildingDetails.resetQueue();
        },
        _fireAddTab : function(tab) {
            if(this.buildingDetails.isVisible()) {
                this.buildingDetails.tabView.addTab(tab);
            }
        },
        _fireRemoveTab : function(tab) {
            if(this.buildingDetails.isVisible()) {
                this.buildingDetails.tabView.selectTab(0);
                this.buildingDetails.tabView.removeTab(tab);
            }
        },
        _fireSelectTab : function(tabIndex) {
            if(this.buildingDetails.isVisible()) {
                this.buildingDetails.tabView.selectTab(tabIndex);
            }
        },
        _fireReloadTabs : function() {
            if(this.currentBuildingObj) {
                var panel = this.buildingDetails;
                //remove any tabs
                while(panel.tabView.get("tabs").length > 0){
                    var tab = panel.tabView.getTab(0);
                    Event.purgeElement(tab.get("contentEl"));
                    panel.tabView.removeTab(tab);
                }
                //add again
                var tabs = this.currentBuildingObj.getTabs();
                for(var at=0; at<tabs.length; at++) {
                    panel.tabView.addTab(tabs[at]);
                }
                //select first tab
                panel.tabView.selectTab(0);
            }
        },
        _fireUpdateTile : function(building) {
            if(building && building.id && building.name) {
                this.ReloadBuilding(building);
            }
        },
        _fireUpdateMap : function() {
            // this.Refresh();
        },
        _fireRemoveTile : function(building) {
            if(building && building.id) {
                delete this.buildings[building.id];
                this._map.removeTile(building.x, building.y);
            }
        },
        _fireHide : function() {
            this.buildingDetails.hide();
        },

        IsVisible : function() {
            return this._isVisible;
        },
        MapVisible : function(visible) {
            if(this._isVisible != visible) {
                if(this._elGrid) {
                    this._isVisible = visible;
                    //YAHOO.log(visible, "info", "MapPlanet.MapVisible");
                    if(visible) {
                        if(!Dom.inDocument(this._elGrid)) {
                            document.getElementById("content").appendChild(this._elGrid);
                        }
                        //Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
                    }
                    else {
                        this._elGrid = this._elGrid.parentNode.removeChild(this._elGrid);
                    }
                    if (visible && this._map) {
                        this.Resize();
                    }
                }
                if(!visible) {
                    // These can sometimes get called before they exist, so watch out for that. :/
                    this.buildingDetails && this.buildingDetails.hide();
                    this.buildingBuilder && this.buildingBuilder.hide();
                }
            }
        },
        Mapper : function(oArgs) {
            //YAHOO.log(oArgs.buildings, "debug", "Mapper");
            this.buildings = oArgs.buildings;
            this.surfaceUrl = [Lib.AssetUrl,'planet_side/',oArgs.body.surface_image,'.jpg'].join('');
            Dom.setStyle("buildingDetailsImgBkgd","background",['transparent url(',this.surfaceUrl,') no-repeat left top'].join(''));
            //clean up numbers in buidlings
            for(var key in this.buildings) {
                if(this.buildings.hasOwnProperty(key)){
                    this.buildings[key] = this.CleanBuilding(this.buildings[key]);
                }
            }
            //create/update map
            if(!this._gridCreated) {
                var planetMap = document.createElement("div");
                planetMap.id = "planetMap";
                this._elGrid = document.getElementById("content").appendChild(planetMap);
                this.MapVisible(true); //needs to be visible before we set sizing and  map
                this.SetSize();

                var map = new Lacuna.Mapper.PlanetMap("planetMap", {surfaceUrl:this.surfaceUrl});
                map.addTileData(this.buildings);
                map.setPlotsAvailable(oArgs.status.body.plots_available*1);
                //map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
                map.subscribe("onReloadTile", this.ReLoadTile, this, true);
                //draw what we got
                map.redraw();
                //move to command
                map.setCenterToCommand();

                this._map = map;
                this._gridCreated = true;

                Event.delegate(this._map.mapDiv, "click", function(e, matchedEl, container) {
                    var planet = Game.GetCurrentPlanet();
                    if(!this._map.controller.isDragging()) {
                        var tile = this._map.tileLayer.findTileById(matchedEl.parentNode.id);
                        if(tile && tile.data) {
                            this.DetailsView(tile);
                        }
                        else { //if(planet.size*1 > planet.building_count*1) {
                            this.BuilderView(tile);
                        }
                        /*else {
                            alert("You've already reached the maximum number of buildings for this planet");
                        }*/
                    }
                }, "div.planetMapTileActionContainer", this, true); //"button.planetMapTileActionButton"
            }
            else {
                this.MapVisible(true); //needs to be visible before we set sizing and  map
                if(!this._elGrid.parentNode) {
                    document.getElementById("content").appendChild(this._elGrid);
                }
                this._map.reset();
                this._map.setSurfaceUrl(this.surfaceUrl);
                this._map.setPlotsAvailable(oArgs.status.body.plots_available*1);
                this._map.addTileData(this.buildings);
                this._map.refresh();
            }

            require('js/actions/menu/loader').hide();
        },
        Load : function(planetId, showNotify, silent) {
            require('js/actions/menu/loader').show();
            if(showNotify) {
                Lacuna.Notify.Show(planetId);
            }
            else {
                Lacuna.Notify.Hide();
            }
            this.locationId = planetId;
            this.ReLoad(silent);
        },
        RefreshWithData : function(o) {
            this.fireEvent("onMapRpc", o.result);
            var planet = Game.GetCurrentPlanet();
            this._map.setPlotsAvailable(planet.plots_available*1);
            this._map.addTileData(o.result.buildings, true);
            this._map.refresh();
        },
        Refresh : function() {
            if(this.locationId) {
                var BodyServ = Game.Services.Body,
                    data = {
                        session_id: Game.GetSession(""),
                        body_id: this.locationId
                    };

                BodyServ.get_buildings(data,{
                    success : function(o){
                        //YAHOO.log(o, "info", "MapPlanet.Refresh");
                        this.RefreshWithData(o);
                    },
                    scope:this
                });
            }
        },
        ReLoad : function(silent) {
            if(this.locationId) {
                var BodyServ = Game.Services.Body,
                    data = {
                        session_id: Game.GetSession(""),
                        body_id: this.locationId
                    };

                BodyServ.get_buildings(data,{
                    success : function(o){
                        //YAHOO.log(o, "info", "MapPlanet.ReLoad");
                        this.fireEvent("onMapRpc", o.result);
                        if(silent) {
                            require('js/actions/menu/loader').hide();
                        }
                        else {
                            this.Mapper(o.result);
                        }
                    },
                    scope:this
                });
            }
        },
        ReLoadTile : function(id) {
            //YAHOO.log(this._isVisible, "info", "MapPlanet.ReLoadTile._isVisible");
            if(this._isVisible && id) {
                //YAHOO.log(id, "info", "MapPlanet.ReLoadTile.id");
                var building = this.buildings[id];
                if(building) {
                    //YAHOO.log(building, "info", "MapPlanet.ReLoadTile.building");

                    this.ViewData(id, building.url, {
                        url:building.url
                    }, building.x, building.y);
                }
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
            delete this.locationId;
            if(this._map) {
                this._map.reset();
            }
            this.buildingDetails && this.buildingDetails.resetQueue();
            this.buildingBuilder && this.buildingBuilder.resetFilter();
            this.MapVisible(false);
        },

        BuilderView : function(tile) {
            //YAHOO.log(tile, "info", "BuilderView");

            this._buildBuilderPanel();

            Game.OverlayManager.hideAllBut(this.buildingBuilder.id);
            this.buildingBuilder.resetDisplay(this);
            this.buildingBuilder.setTile(tile);
            this.buildingBuilder.show();

            var Ht = Game.GetSize().h - 75;
            if(Ht > 420) { Ht = 420; }
            Dom.setStyle(Dom.get('builderMenu'),'height',Ht + 'px');
            Dom.setStyle(Dom.get('builderList').parentNode,'height',Ht + 'px');
        },
        BuilderGet : function(data) {
            require('js/actions/menu/loader').show();
            this.currentBuildConnection = Game.Services.Body.get_buildable(data,{
                success : function(o){
                    delete this.currentBuildConnection;
                    //YAHOO.log(o, "info", "MapPlanet.BuilderGet.success");
                    this.fireEvent("onMapRpc", o.result);

                    this.BuilderProcess(o.result, data);
                },
                failure : function(o){
                    delete this.currentBuildConnection;
                },
                scope:this
            });
        },
        BuilderProcess : function(oResults, request) {
            if(this.buildingBuilder.isVisible() && oResults) {
                var b = oResults.buildable;
                var q = oResults.build_queue;
                if(b) {
                    this.buildingBuilder.load(b, q, request);
                }
            }
            require('js/actions/menu/loader').hide();
        },
        NotIsolationist : function(building) {
            if(Game.EmpireData.is_isolationist == "1") {
                if(building.url == "/espionage" && !confirm("If you build an Espionage Ministry you will no longer be considered an Isolationist and you will be open to attack.  Are you sure you want to do this?")) {
                    return true;
                }
                else if(building.url == "/munitionslab" && !confirm("If you build a Munitions Lab you will no longer be considered an Isolationist and you will be open to attack.  Are you sure you want to do this?")) {
                    return true;
                }
            }
        },
        Build : function(building, x, y) {
            if(this.NotIsolationist(building)) {
                return;
            }

            require('js/actions/menu/loader').show();
            var BuildingServ = Game.Services.Buildings.Generic,
                data = {
                    session_id: Game.GetSession(""),
                    planet_id: this.locationId,
                    x:x,
                    y:y
                };

            BuildingServ.build(data,{
                success : function(o){
                    //YAHOO.log(o, "info", "MapPlanet.Build.success");
                    require('js/actions/menu/loader').hide();
                    this.fireEvent("onMapRpc", o.result);
                    this.buildingBuilder.hide();

                    var b = building; //originally passed in building data from BuildProcess
                    b.id = o.result.building.id;
                    b.level = o.result.building.level;
                    b.pending_build = o.result.building.pending_build;
                    b.x = x;
                    b.y = y;
                    //YAHOO.log(b, "info", "MapPlanet.Build.success.building");
                    //this.UpdateCost(b.build.cost);

                    this.ReloadBuilding(b);
                },
                failure : function(o){
                    this.buildingBuilder.hide();
                },
                scope:this,
                target:building.url
            });
        },

        ViewData : function(id, url, callback, x, y) {
            var BuildingServ = Game.Services.Buildings.Generic,
                data = {
                    session_id: Game.GetSession(""),
                    building_id: id
                };

            return BuildingServ.view(data,{
                success : function(o){
                    //YAHOO.log(o, "info", "MapPlanet.ViewData.success");
                    this.fireEvent("onMapRpc", o.result);
                    var newB = o.result.building;
                    newB.url = callback.url;
                    newB.x = x;
                    newB.y = y;
                    newB.updated = !this.buildings[newB.id] || (newB.level != this.buildings[newB.id].level);
                    this.ReloadBuilding(newB);
                    /*newB = this.CleanBuilding(newB);
                    this.buildings[newB.id] = newB;
                    this._map.refreshTile(newB);
                    */

                    if(callback && callback.success) {
                        callback.success.call(this, o.result, callback.url, x, y);
                    }
                    require('js/actions/menu/loader').hide();
                },
                failure : function(o){
                    if(callback && callback.failure) {
                        callback.failure.call(this, o, callback.url, x, y);
                        return true;
                    }
                },
                scope:this,
                target:url
            });
        },
        DetailsView : function(tile) {
            //YAHOO.log(tile, "info", "DetailsView");

            require('js/actions/menu/loader').show();

            this._buildDetailsPanel();

            var panel = this.buildingDetails;
            Game.OverlayManager.hideAllBut(panel.id);
            panel.resetDisplay(this);
            //clear values
            panel.name.innerHTML = "Loading";
            panel.img.src = this.surfaceUrl;
            panel.desc.innerHTML = "";
            panel.timeLeftLi.innerHTML = "";

            panel.tabView.set('activeTab',null);
            while(panel.tabView.get("tabs").length > 0){
                var tab = panel.tabView.getTab(0);
                Event.purgeElement(tab.get("contentEl"), true);
                panel.tabView.removeTab(tab);
            }

            this.buildingDetails.show(); //show before we get data so it looks like we're doing something

            this.currentViewConnection = this.ViewData(tile.data.id, tile.data.url, {
                success:function(oResults, url, x, y){
                    delete this.currentViewConnection;
                    this.DetailsProcess(oResults, url, x, y);
                },
                failure:function(o){
                    delete this.currentViewConnection;
                },
                url:tile.data.url
            }, tile.x, tile.y);
        },
        BuildingFactory : function(result) {
            var classConstructor = FactoryMap[result.building.url] || Lacuna.buildings.Building,
                classObj = new classConstructor(result, this.locationId);
            if(classObj) {
                classObj.subscribe("onMapRpc", this._fireRpcSuccess, this, true);
                classObj.subscribe("onQueueAdd", this._fireQueueAdd, this, true);
                classObj.subscribe("onQueueReset", this._fireQueueReset, this, true);
                classObj.subscribe("onAddTab", this._fireAddTab, this, true);
                classObj.subscribe("onRemoveTab", this._fireRemoveTab, this, true);
                classObj.subscribe("onSelectTab", this._fireSelectTab, this, true);
                classObj.subscribe("onReloadTabs", this._fireReloadTabs, this, true);
                classObj.subscribe("onUpdateTile", this._fireUpdateTile, this, true);
                classObj.subscribe("onUpdateMap", this._fireUpdateMap, this, true);
                classObj.subscribe("onRemoveTile", this._fireRemoveTile, this, true);
                classObj.subscribe("onHide", this._fireHide, this, true);
            }

            return classObj;
        },
        DetailsProcess : function(oResults, url, x, y) {
            var building = oResults.building,
                panel = this.buildingDetails,
                currBuildingId = this.currentBuilding ? this.currentBuilding.building.id : undefined;
            if(panel.isVisible() && (currBuildingId != oResults.building.id)) {
                building.url = url;
                building.x = x;
                building.y = y;
                oResults.building = building;

                if(panel.pager) {panel.pager.destroy();}

                this.currentBuilding = oResults; //assign new building
                //fill production tab
                panel.name.innerHTML = [building.name, ' ', building.level, ' (ID: ', building.id, ')'].join('');
                panel.img.src = [Lib.AssetUrl, "planet_side/100/", building.image, ".png"].join('');
                panel.desc.innerHTML = Game.GetBuildingDesc(building.url);
                if(building.pending_build) {
                    panel.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(building.pending_build.seconds_remaining);
                    if(building.pending_build.seconds_remaining > 0) {
                        panel.addQueue(building.pending_build.seconds_remaining,
                            function(remaining, elm){
                                var rf = Math.round(remaining);
                                if(rf <= 0) {
                                    elm.innerHTML = "";
                                    YAHOO.log("Complete","info","buildingDetails.showEvent.BuildTimeRemaining");
                                    this.DetailsView({data:{id:building.id,url:building.url},x:building.x,y:building.y});
                                }
                                else {
                                    elm.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(rf);
                                }
                            },
                            panel.timeLeftLi,
                            this
                        );
                    }
                }
                else {
                    panel.timeLeftLi.innerHTML = "";
                }

                var output, stored,
                    bq, ul, li, div;

                //create building specific tabs and functionality
                this.currentBuildingObj = this.BuildingFactory(oResults);
                if(this.currentBuildingObj) {
                    //remove any tabs
                    while(panel.tabView.get("tabs").length > 0){
                        var tab = panel.tabView.getTab(0);
                        Event.purgeElement(tab.get("contentEl"));
                        panel.tabView.removeTab(tab);
                    }
                    var tabs = this.currentBuildingObj.getTabs();
                    for(var at=0; at<tabs.length; at++) {
                        panel.tabView.addTab(tabs[at]);
                    }
                    this.currentBuildingObj.load();
                }

                Dom.setStyle("buildingDetailTabs", "display", "");
                panel.tabView.selectTab(0);
                panel.setFirstLastFocusable();
                panel.focusFirst();
            }
        },

        CleanBuilding : function(building) {
            building.efficiency = (building.efficiency || 100)*1;
            if(building.repair_costs && building.efficiency == 100) {
                delete building.repair_costs;
            }
            if(building.pending_build) {
                building.pending_build.seconds_remaining *= 1;
            }
            if(building.work) {
                building.work.seconds_remaining *= 1;
            }
            return building;
        },
        ReloadBuilding : function(building) {
            //YAHOO.log(building, "debug", "ReloadBuilding");

            building = this.CleanBuilding(building);
            this.buildings[building.id] = building;
            this._map.refreshTile(building);
            /*
            var ms = (building.pending_build.seconds_remaining * 1000);
            YAHOO.log({b:building, time:ms}, "debug", "MapPlanet.ReloadBuilding");
            Game.QueueAdd(building.id, Lib.QueueTypes.PLANET, ms);
            */
        }
    };
    Lang.augmentProto(MapPlanet, Util.EventProvider);

    Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
