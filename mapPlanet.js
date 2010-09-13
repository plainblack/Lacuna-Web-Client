YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapPlanet == "undefined" || !YAHOO.lacuna.MapPlanet) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Pager = YAHOO.widget.Paginator,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
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
				'	<div class="yui-gf" style="padding-bottom:5px;">',
				'		<div class="yui-u first" id="buildingDetailsImgBkgd" style="text-align:center;">',
				'			<img id="buildingDetailsImg" src="" alt="" style="width:100px;height:100px;" />',
				'		</div>',
				'		<div class="yui-u">',
				'			<ul>',
				'				<li id="buildingDetailsName"></li>',
				'				<li id="buildingDetailsTimeLeft"></li>',
				'				<li id="buildingDetailsDesc"></li>',
				'			</ul>',
				'		</div>',
				'	</div>',
				'	<div id="buildingDetailTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'		</ul>',
				'		<div class="yui-content">',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				width:"700px",
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
						if(callback.secondsRemaining > 0) {
							newq.push(callback);
						}
						callback.fn.call(callback.scope || this, callback.secondsRemaining, callback.el);
					}
					this.queue = newq;
				}
				else {
					Game.onTick.unsubscribe(this.processQueue);
				}
			};
			this.buildingDetails.resetQueue = function() {
				Game.onTick.unsubscribe(this.processQueue);
				this.interval = undefined;
				this.queue = [];
			};
			this.buildingDetails.isVisible = function() {
				return this.cfg.getProperty("visible");
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
				this.buildingDetails.resetQueue();
				this.buildingDetails.dataStore = {};
				this.currentBuilding = undefined;
				if(this.currentBuildingObj) {
					this.currentBuildingObj.destroy();
					this.currentBuildingObj = undefined;
				}
				if(this.currentViewConnection) {
					Lacuna.Pulser.Hide();
					Util.Connect.abort(this.currentViewConnection);
				}
			}, this, true);
			
			this.buildingDetails.render();
			Game.OverlayManager.register(this.buildingDetails);
		},
		_buildBuilderPanel : function() {
			var panelId = "buildingBuilder";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = [
				'<div class="hd">Builder</div>',
				'	<div class="bd">',
				'		<div id="builderMenu" class="yui-content" style="overflow:auto;height:420px;">',
				'			<ul>',
				'				<li class="builderMenuGroup">',
				'					<em>Resources</em>',
				'					<ul>',
				'						<li><a href="#Resources/Food">Food</a></li>',
				'						<li><a href="#Resources/Ore">Ore</a></li>',
				'						<li><a href="#Resources/Water">Water</a></li>',
				'						<li><a href="#Resources/Energy">Energy</a></li>',
				'						<li><a href="#Resources/Waste">Waste</a></li>',
				'						<li><a href="#Resources/Storage">Storage</a></li>',
				'						<li><a href="#Resources" class="buildMenuAll">All Resources</a></li>',
				'					</ul>',
				'				</li>',
				'				<li class="builderMenuGroup">',
				'					<em>Infrastructure</em>',
				'					<ul>',
				'						<li><a href="#Infrastructure/Construction">Construction</a></li>',
				'						<li><a href="#Infrastructure/Intelligence">Intelligence</a></li>',
				'						<li><a href="#Infrastructure/Happiness">Happiness</a></li>',
				'						<li><a href="#Infrastructure/Ships">Ships</a></li>',
				'						<li><a href="#Infrastructure/Colonization">Colonization</a></li>',
				'						<li><a href="#Infrastructure/Trade">Trade</a></li>',
				'						<li><a href="#Infrastructure" class="buildMenuAll">All Infrastructure</a></li>',
				'					</ul>',
				'				</li>',
				'				<li class="builderMenuGroup"><a href="#Plan"><em>Plans</em></a></li>',
				'				<li class="builderMenuGroup"><a href="#"><em>All Buildings</em></a></li>',
				'			</ul>',
				'		</div>',
				'		<div id="builderListContainer">',
				'			<div id="builderFilter" style="overflow:auto">',
				'				<div style="float: right">',
				'					Available: ',
				'					<select id="builderTimeFilter">',
				'						<option value="">All</option>',
				'						<option value="Now" selected="selected">Now</option>',
				'						<option value="Soon">Soon</option>',
				'						<option value="Later">Later</option>',
				'					</select>',
				'				</div>',
				'				<a href="#" id="builderBuildLink">Build</a><span id="builderFilterTrail"> &gt; <a href="#Resources" class="buildMenuLink">Resources</a> &gt; <span class="buildMenuLink">Ore</span></span>',
				'			</div>',
				'			<div class="yui-content" style="overflow:auto;height:420px;"><ul id="builderList"></ul></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.buildingBuilder = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"600px",
				zIndex:9996,
				context:["header","tr","br"]
			});
			this.buildingBuilder.renderEvent.subscribe(function(){
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
				Event.delegate(this.buildingList, "click", this.expandDesc, "span.buildingName");
			});
			this.buildingBuilder.hideEvent.subscribe(function(){
				if(this.currentBuildConnection) {
					Lacuna.Pulser.Hide();
					Util.Connect.abort(this.currentBuildConnection);
				}
				delete this.buildingBuilder.currentTile;
				delete this.buildingBuilder.buildable;
			}, this, true);
			this.buildingBuilder.showEvent.subscribe(function() {
				this.buildable = {};
				Dom.setStyle(this.menuView, 'display', 'block');
				Dom.setStyle(this.listView, 'display', 'none');
			});
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
			};
			this.buildingBuilder.load = function(b, q, request) {
				this.buildable[request.tag] = b; //store
				this.queue_status = q;
				
				this.updateDisplay();
			};
			this.buildingBuilder.build = function(e, matchedEl, container) {
				Lacuna.MapPlanet.Build(matchedEl.building, this.currentTile.x, this.currentTile.y);
			};
			this.buildingBuilder.expandDesc = function(e, matchedEl, container) {
				var desc = Sel.query('div.buildingDesc', matchedEl.parentNode, true);
				if(desc) {
					var dis = Dom.getStyle(desc, "display");
					Dom.setStyle(desc, "display", dis == "none" ? "" : "none");
				}
			};
			this.buildingBuilder.resetDisplay = function(conn) {
				if(conn) {
					Lacuna.Pulser.Hide();
					Util.Connect.abort(conn);
				}
				delete this.buildable;
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
				
				list.innerHTML = "";
				
				var frag = document.createDocumentFragment(),
					li = document.createElement("li"),
					filterCount = 0,
					names = [],
					reason, br;
				
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
					var nLi = li.cloneNode(false);
					nLi.innerHTML = "No available buildings.";
					list.appendChild(nLi);
				}
				
				for(var i=0; i<names.length; i++) {
					var bd = b[names[i]],
						nLi = li.cloneNode(false),
						costs = bd.build.cost,
						prod = bd.production,
						isLater = bd.build.tags.indexOf('Later') > -1;
						isPlan = bd.build.tags.indexOf('Plan') > -1;
						
					bd.name = names[i];
					
					if(bd.build.reason) {
						br = bd.build.reason;
						switch(br[0]) {
							case 1011:
								reason = [br[1], ' Requires more ', (Lang.isArray(br[2]) ? br[2].join(', ') : br[2])].join('');
								break;
							case 1012:
								if(br[2]) {
									reason = [br[1], ' Requires higher production of ', (Lang.isArray(br[2]) ? br[2].join(', ') : br[2])].join('');
								}
								else {
									reason = br[1];
								}
								break;
							case 1013:
								if(br.length == 2) {
									reason = br[1];
								}
								else if(Lang.isArray(br[2])){
									if(br[1].indexOf("Goldilox") < 0) {
										reason = [br[1], ' Requires ', br[2].join(' level ')].join('');
									}
									else {
										reason = [br[1], ' Orbits Allowed: ', br[2].join(', ')].join('');
									}
								}
								else {
									reason = [br[1], ' Requires level ', br[2]].join('');
								}
								break;
							default:
								reason = "";
								break;
						}
					}
					else {
						reason = undefined;
						if (isQueueFull) {
							reason = "Build queue is full.";
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
					'<div class="yui-gb" style="margin-bottom:2px;">',
					'	<div class="yui-u first" style="width:20%;background:transparent url(',Lacuna.MapPlanet.surfaceUrl,') no-repeat center;text-align:center;">',
					'		<img src="',Lib.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;cursor:pointer" class="buildingImage" />',
					'	</div>',
					'	<div class="yui-u" style="width:65%">',
					'		<span class="buildingName">',bd.name,'</span>: ',
					reason ? '		<span class="buildingReason">'+reason+'</span>' : '',
					'		<div class="buildingDesc" style="display:none;', (reason ? 'border-top:1px solid #52acff;' : ''), '">',Lib.Descriptions[bd.url],'</div>',
					'		<div><label style="font-weight:bold;">Cost:</label>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span>',costs.food,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre"  /></span><span>',costs.ore,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span>',costs.water,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span>',costs.energy,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span>',costs.waste,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span>',Lib.formatTime(costs.time),'</span>',
					'		</div>',
					'		<div><label style="font-weight:bold;">Prod:</label>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span>',prod.food_hour,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre"  /></span><span>',prod.ore_hour,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span>',prod.water_hour,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span>',prod.energy_hour,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span>',prod.waste_hour,'</span></span>',
					'			<span><span><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span><span>',prod.happiness_hour,'</span></span>',
					'		</div>',
					'	</div>',
					'	<div class="yui-u" style="width:10%;margin-top:20px">',
					(isLater || isQueueFull) ? '' : '		<button type="button">Build</button>',
					'	</div>',
					'</div>'].join('');
					
					if(!isLater && !isQueueFull) {
						Sel.query("button", nLi, true).building = bd;
						Sel.query("img.buildingImage", nLi, true).building = bd;
					}
					
					frag.appendChild(nLi);
				}

				list.appendChild(frag);
			};
			
			this.buildingBuilder.render();
			Game.OverlayManager.register(this.buildingBuilder);
		},
		
		_fireRpcSuccess : function(result){
			this.fireEvent("onMapRpc", result);
		},
		_fireRpcFailed : function(o){
			this.fireEvent("onMapRpcFailed", o);
		},
		_fireQueueAdd : function(obj) {
			if(this.buildingDetails.isVisible()) {
				this.buildingDetails.addQueue(obj.seconds, obj.fn, obj.el, obj.scope);
			}
		},
		_fireQueueReload : function(building) {
			this.QueueReload(building);
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
			//var building = this.currentBuilding.building;
			if(building && building.id && building.name) {
				building.efficiency = building.efficiency || "100";
				if(build.efficiency == "100") {
					delete building.repair_costs;
				}
				this.buildable[building.id] = building;
				this._map.refreshTile(building);
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
					YAHOO.log(visible, "info", "MapPlanet.MapVisible");
					Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
				}
				if(! visible) {
					this.buildingDetails.hide();
					this.buildingBuilder.hide();
				}
			}
		},
		Mapper : function(oArgs) {
			YAHOO.log(oArgs.buildings, "debug", "Mapper");
			this.buildings = oArgs.buildings;
			this.surfaceUrl = [Lib.AssetUrl,'planet_side/',oArgs.body.surface_image,'.jpg'].join('');
			Dom.setStyle("buildingDetailsImgBkgd","background",['transparent url(',this.surfaceUrl,') no-repeat left top'].join(''));
			if(!this._gridCreated) {
				var planetMap = document.createElement("div");
				planetMap.id = "planetMap";
				this._elGrid = document.getElementById("content").appendChild(planetMap);
				this.MapVisible(true); //needs to be visible before we set sizing and  map
				this.SetSize();
				
				var map = new Lacuna.Mapper.PlanetMap("planetMap", this.surfaceUrl);
				map.addTileData(oArgs.buildings);
				map.setPlotsAvailable(oArgs.status.body.size*1 - oArgs.status.body.building_count*1);
				map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
				
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
						else if (planet.size*1 > planet.building_count*1) {
							this.BuilderView(tile);
						}
						else {
							alert("You've already reached the maximum number of buildings for this planet");
						}
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
				this._map.setPlotsAvailable(oArgs.status.body.size*1 - oArgs.status.body.building_count*1);
				this._map.addTileData(oArgs.buildings);
				this._map.refresh();
			}
			this.QueueBuidings(oArgs.buildings);
			
			Lacuna.Pulser.Hide();
		},
		Load : function(planetId) {
			Lacuna.Pulser.Show();
			this.locationId = planetId;
			this.ReLoad();
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
						YAHOO.log(o, "info", "MapPlanet.Refresh");
						this.fireEvent("onMapRpc", o.result);
						var planet = Game.EmpireData.planets[Game.EmpireData.current_planet_id];
						this._map.setPlotsAvailable(planet.size*1 - planet.building_count*1);
						this._map.addTileData(o.result.buildings);
						this._map.refresh();
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapPlanet.Refresh.FAILED");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		ReLoad : function() {
			if(this.locationId) {
				var BodyServ = Game.Services.Body,
					data = {
						session_id: Game.GetSession(""),
						body_id: this.locationId
					};
				
				BodyServ.get_buildings(data,{
					success : function(o){
						YAHOO.log(o, "info", "MapPlanet.ReLoad");
						this.fireEvent("onMapRpc", o.result);
						this.Mapper(o.result);
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapPlanet.ReLoad.FAILED");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		ReLoadTile : function(id) {
			YAHOO.log(this._isVisible, "info", "MapPlanet.ReLoadTile._isVisible");
			if(this._isVisible && id) {
				YAHOO.log(id, "info", "MapPlanet.ReLoadTile.id");
				var building = this.buildings[id];
				if(building) {
					YAHOO.log(building, "info", "MapPlanet.ReLoadTile.building");
					
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
			this.buildingDetails.resetQueue();
			this.buildingBuilder.resetFilter();
			this.MapVisible(false);
		},

		BuilderView : function(tile) {
			YAHOO.log(tile, "info", "BuilderView");

			this.buildingBuilder.resetDisplay(this.currentBuildConnection);
			
			//Event.purgeElement(this.buildingBuilder.list);
			//this.buildingBuilder.list.innerHTML = "";
			//Event.purgeElement(this.buildingBuilder.unavailable);
			//this.buildingBuilder.unavailable.innerHTML = "";
			
			Game.OverlayManager.hideAll();
			this.buildingBuilder.setTile(tile);
			this.buildingBuilder.show();
		},
		BuilderGet : function(data) {
			Lacuna.Pulser.Show();
			this.currentBuildConnection = Game.Services.Body.get_buildable(data,{
				success : function(o){
					delete this.currentBuildConnection;
					YAHOO.log(o, "info", "MapPlanet.BuilderGet.success");
					this.fireEvent("onMapRpc", o.result);
					
					this.BuilderProcess(o.result, data);
				},
				failure : function(o){
					delete this.currentBuildConnection;
					YAHOO.log(o, "error", "MapPlanet.BuilderGet.failure");
					this.fireEvent("onMapRpcFailed", o);
					Lacuna.Pulser.Hide();
				},
				timeout:Game.Timeout,
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
			Lacuna.Pulser.Hide();
		},
		Build : function(building, x, y) {
			if(Game.EmpireData.is_isolationist == "1" && building.url == "/espionage" && !confirm("If you build an Espionage Ministry you will no longer be considered an Isolationist and you will be open to attack.  Are you sure you want to do this?")) {
				return;
			}
		
			Lacuna.Pulser.Show();
			var BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Game.GetSession(""),
					planet_id: this.locationId,
					x:x,
					y:y
				};
			
			BuildingServ.build(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.Build.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					this.buildingBuilder.hide();

					var b = building; //originally passed in building data from BuildProcess
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					b.x = x;
					b.y = y;
					YAHOO.log(b, "info", "MapPlanet.Build.success.building");
					//this.UpdateCost(b.build.cost);
					
					this.QueueReload(b);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.Build.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					this.buildingBuilder.hide();
				},
				timeout:Game.Timeout,
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
					YAHOO.log(o, "info", "MapPlanet.ViewData.success");
					this.fireEvent("onMapRpc", o.result);
					var newB = o.result.building;
					newB.url = callback.url;
					newB.x = x;
					newB.y = y;
					newB.updated = (newB.level != this.buildings[newB.id].level);
					var remaining = 0;
					if(newB.pending_build) {
						remaining = newB.pending_build.seconds_remaining*1;
					}
					if(remaining != 0) {
						this.QueueReload(newB);
					}
					else {
						this.buildings[newB.id] = newB;
						this._map.refreshTile(newB);
					}

					if(callback && callback.success) {
						callback.success.call(this, o.result, callback.url, x, y);
					}
					Lacuna.Pulser.Hide();
				},
				failure : function(o){
					Lacuna.Pulser.Hide();
					YAHOO.log(o, "error", "MapPlanet.ViewData.failure");
					
					if(callback && callback.failure) {
						callback.failure.call(this, o, callback.url, x, y);
					}
					else {
						this.fireEvent("onMapRpcFailed", o);
					}
				},
				timeout:Game.Timeout,
				scope:this,
				target:url
			});
		},
		DetailsView : function(tile) {
			YAHOO.log(tile, "info", "DetailsView");

			Lacuna.Pulser.Show();
			var panel = this.buildingDetails;
			Game.OverlayManager.hideAll();
			panel.hide(); //hide panel which removes existing info	
			//clear values
			panel.name.innerHTML = "Loading";
			panel.img.src = this.surfaceUrl;
			panel.desc.innerHTML = "";
			panel.timeLeftLi.innerHTML = "";
			/*panel.curEnergy.innerHTML = "";
			panel.curFood.innerHTML = "";
			panel.curHappiness.innerHTML = "";
			panel.curOre.innerHTML = "";
			panel.curWaste.innerHTML = "";
			panel.curWater.innerHTML = "";
			Event.purgeElement(panel.upgradeUl);
			panel.upgradeUl.innerHTML = "";
			Event.purgeElement(panel.upgradeProdUl);
			panel.upgradeProdUl.innerHTML = "";*/
			
			while(panel.tabView.get("tabs").length > 0){
				var tab = panel.tabView.getTab(0);
				Event.purgeElement(tab.get("contentEl"));
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
					this.fireEvent("onMapRpcFailed", o);
				},
				url:tile.data.url
			}, tile.x, tile.y);
		},
		BuildingFactory : function(result) {
			var classObj;
			switch(result.building.url){
				case "/archaeology":
					classObj = new Lacuna.buildings.Archaeology(result);
					break;
				case "/development":
					classObj = new Lacuna.buildings.Development(result);
					break;
				case "/embassy":
					classObj = new Lacuna.buildings.Embassy(result);
					break;
				case "/foodreserve":
					classObj = new Lacuna.buildings.FoodReserve(result);
					break;
				case "/intelligence":
					classObj = new Lacuna.buildings.Intelligence(result);
					break;
				case "/miningministry":
					classObj = new Lacuna.buildings.MiningMinistry(result);
					break;
				case "/network19":
					classObj = new Lacuna.buildings.Network19(result);
					break;
				case "/observatory":
					classObj = new Lacuna.buildings.Observatory(result);
					break;
				case "/orestorage":
					classObj = new Lacuna.buildings.OreStorage(result);
					break;
				case "/park":
					classObj = new Lacuna.buildings.Park(result);
					break;
				case "/planetarycommand":
					classObj = new Lacuna.buildings.PlanetaryCommand(result);
					break;
				case "/security":
					classObj = new Lacuna.buildings.Security(result);
					break;
				case "/shipyard":
					classObj = new Lacuna.buildings.Shipyard(result);
					break;
				case "/spaceport":
					classObj = new Lacuna.buildings.SpacePort(result);
					break;
				case "/trade":
					classObj = new Lacuna.buildings.Trade(result);
					break;
				case "/transporter":
					classObj = new Lacuna.buildings.Transporter(result);
					break;
				case "/wasterecycling":
					classObj = new Lacuna.buildings.WasteRecycling(result);
					break;
				default:
					classObj = new Lacuna.buildings.Building(result);
					break;
			}
			
			if(classObj) {
				classObj.subscribe("onMapRpc", this._fireRpcSuccess, this, true);
				classObj.subscribe("onMapRpcFailed", this._fireRpcFailed, this, true);
				classObj.subscribe("onQueueAdd", this._fireQueueAdd, this, true);
				classObj.subscribe("onQueueReload", this._fireQueueReload, this, true);
				classObj.subscribe("onQueueReset", this._fireQueueReset, this, true);
				classObj.subscribe("onAddTab", this._fireAddTab, this, true);
				classObj.subscribe("onRemoveTab", this._fireRemoveTab, this, true);
				classObj.subscribe("onSelectTab", this._fireSelectTab, this, true);
				classObj.subscribe("onReloadTabs", this._fireReloadTabs, this, true);
				classObj.subscribe("onUpdateTile", this._fireUpdateTile, this, true);
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
				panel.name.innerHTML = [building.name, ' ', building.level].join('');
				panel.img.src = [Lib.AssetUrl, "planet_side/", building.image, ".png"].join('');
				panel.desc.innerHTML = Lib.Descriptions[building.url];
				if(building.pending_build) {
					panel.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(building.pending_build.seconds_remaining);
					if(building.pending_build.seconds_remaining > 0) {
						panel.addQueue(building.pending_build.seconds_remaining,
							function(remaining){
								var rf = Math.round(remaining);
								if(rf <= 0) {
									this.buildingDetails.timeLeftLi.innerHTML = "";
									YAHOO.log("Complete","info","buildingDetails.showEvent.BuildTimeRemaining");
									this.DetailsView({data:{id:building.id,url:building.url},x:building.x,y:building.y});
								}
								else {
									this.buildingDetails.timeLeftLi.innerHTML = "<label>Build Time Remaining:</label>" + Lib.formatTime(rf);
								}
							},
							null,
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
					var tabs = this.currentBuildingObj.getTabs();
					for(var at=0; at<tabs.length; at++) {
						panel.tabView.addTab(tabs[at]);
					}
					this.currentBuildingObj.load();
				}
				
				Dom.setStyle("buildingDetailTabs", "display", "");
				panel.tabView.selectTab(0);
			}
		},

		QueueBuidings : function(buildings) {
			for(var key in buildings) {
				if(buildings.hasOwnProperty(key)){
					var building = buildings[key];
					if(building.pending_build) {
						building.pending_build.seconds_remaining *= 1;
						building.pending_build.seconds_remaining += 2; //I seem to be a head normally now
						this.buildings[building.id] = building;
						var ms = (building.pending_build.seconds_remaining * 1000);
						YAHOO.log({b:building, time:ms}, "debug", "MapPlanet.QueueBuidings");
						Game.QueueAdd(building.id, Lib.QueueTypes.PLANET, ms);
					}
				}
			}
		},
		QueueReload : function(building) {
			if(building.pending_build) {
				building.pending_build.seconds_remaining *= 1;
				building.pending_build.seconds_remaining += 2; //I seem to be a head normally now
				this.buildings[building.id] = building;
				this._map.refreshTile(building);
				
				var ms = (building.pending_build.seconds_remaining * 1000);
				YAHOO.log({b:building, time:ms}, "debug", "MapPlanet.QueueReload");
				Game.QueueAdd(building.id, Lib.QueueTypes.PLANET, ms);
			}
		},
		QueueTick : function(id, ms) {
			if(this.buildings) {
				var building = this.buildings[id];
				if(building) {
					if(building.pending_build) {
						building.pending_build.seconds_remaining = (ms / 1000);
					}
					else {
						building.pending_build = {seconds_remaining : (ms / 1000)};
					}
					this._map.refreshTileCounter(building);
				}
			}
		}
	};
	Lang.augmentProto(MapPlanet, Util.EventProvider);
	
	Lacuna.MapPlanet = new MapPlanet();
})();
YAHOO.register("mapPlanet", YAHOO.lacuna.MapPlanet, {version: "1", build: "0"}); 

}
