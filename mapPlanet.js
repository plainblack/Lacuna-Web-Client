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
				'			<li><a href="#detailsProduction"><em>Production</em></a></li>',
				'		</ul>',
				'		<div class="yui-content">',
				'			<div id="detailsProduction">',
				'				<div id="buildingDetailsProduction" class="yui-gb">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li>Current Production</li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span id="buildingDetailsFood" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span id="buildingDetailsOre" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span id="buildingDetailsWater" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span id="buildingDetailsEnergy" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span id="buildingDetailsWaste" class="buildingDetailsNum"></span></li>',
				'							<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span><span id="buildingDetailsHappiness" class="buildingDetailsNum"></span></li>',
				'							<li id="buildingDetailsDemolish"></li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul id="buildingDetailsUpgradeProduction">',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul id="buildingDetailsUpgradeCost">',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
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
				
				this.upgradeUl = Dom.get("buildingDetailsUpgradeCost");
				this.upgradeProdUl = Dom.get("buildingDetailsUpgradeProduction");
				this.curEnergy = Dom.get("buildingDetailsEnergy");
				this.curFood = Dom.get("buildingDetailsFood");
				this.curHappiness = Dom.get("buildingDetailsHappiness");
				this.curOre = Dom.get("buildingDetailsOre");
				this.curWaste = Dom.get("buildingDetailsWaste");
				this.curWater = Dom.get("buildingDetailsWater");
				this.demolishLi = Dom.get("buildingDetailsDemolish");
			
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
			panel.innerHTML = ['<div class="hd">Builder</div>',
				'<div class="bd">',
				'	<div>',
				'		<div id="builderFilterContainer" style="border-bottom: 2px solid #52ACFF; padding-bottom: 2px;"><label class="ib" style="vertical-align: top;">Tags</label><input id="builderFilter" type="text" /></div>',
				'		<div id="builderBuildingContainer" style="overflow:auto;height:450px;"><ul id="builderList"></ul></div>',
				'	</div>',
				'</div>'].join('');
				/*'	<div id="builderTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'			<li><a href="#builderBuildable"><em>Buildable</em></a></li>',
				'			<li><a href="#builderUnavailable"><em>Unavailable</em></a></li>',
				'		</ul>',
				'		<div class="yui-content" style="padding:0 0 0 0.5em;">',
				'			<div id="builderBuildable" style="overflow:auto;height:450px;"><ul id="buildingBuilderList"></ul></div>',
				'			<div id="builderUnavailable" style="overflow:auto;height:450px;"><ul id="buildingBuilderUnavailable"></ul></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');*/
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
				//this.tabView = new YAHOO.widget.TabView('builderTabs');
				//this.list = Dom.get("buildingBuilderList");
				//this.unavailable = Dom.get("buildingBuilderUnavailable");
				this.list = Dom.get("builderList");
				
				var dataSource = new Util.LocalDataSource([{name:"Now"},{name:"Soon"},{name:"Later"},{name:"Infrastructure"},{name:"Intelligence"},{name:"Happiness"},
					{name:"Ships"},{name:"Colonization"},{name:"Resources"},{name:"Food"},{name:"Ore"},{name:"Water"},{name:"Energy"},{name:"Waste"}]);
					
				var oTextboxList = new YAHOO.lacuna.TextboxList("builderFilter", dataSource, { //config options
					maxResultsDisplayed: 14,
					minQueryLength:0,
					multiSelect:true,
					forceSelection:false,
					formatResultLabelKey:"name",
					formatResultColumnKeys:["name"],
					useIndicator:true
				});
				oTextboxList.dirtyEvent.subscribe(this.filterChange, this, true);
				oTextboxList.SelectItems([{name:"Now"}]);
				
				this.tagFilter = oTextboxList;
			});
			this.buildingBuilder.hideEvent.subscribe(function(){
				if(this.currentBuildConnection) {
					Lacuna.Pulser.Hide();
					Util.Connect.abort(this.currentBuildConnection);
				}
			}, this, true);
			/*this.buildingBuilder.showEvent.subscribe(function() {
				this.tabView.set('activeIndex', 0);
			});*/
			this.buildingBuilder.isVisible = function() {
				return this.cfg.getProperty("visible");
			};
			
			this.buildingBuilder.filterChange = function() {
				this.updateDisplay();
			};
			this.buildingBuilder.load = function(b, request) {
				this.buildable = b; //store

				Event.delegate(this.list, "click", function(e, matchedEl, container) {
					Lacuna.MapPlanet.Build(matchedEl.building, request.x, request.y);
				}, "button");
				Event.delegate(this.list, "click", function(e, matchedEl, container) {
					var desc = Sel.query('div.buildingDesc', matchedEl.parentNode, true);
					if(desc) {
						var dis = Dom.getStyle(desc, "display");
						Dom.setStyle(desc, "display", dis == "none" ? "" : "none");
					}
				}, "span.buildingName");
				
				this.updateDisplay();
			};
			this.buildingBuilder.resetDisplay = function(conn) {
				if(conn) {
					Lacuna.Pulser.Hide();
					Util.Connect.abort(conn);
				}
				delete this.buildable;
				Event.purgeElement(this.list);
				this.list.innerHTML = "";
			};
			this.buildingBuilder.updateDisplay = function() {
				this.list.innerHTML = "";

				var b = this.buildable,
					frag = document.createDocumentFragment(),
					li = document.createElement("li"),
					filters = this.tagFilter._oTblSelections,
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
				
				for(var i=0; i<names.length; i++) {
					var bd = b[names[i]],
						nLi = li.cloneNode(false),
						costs = bd.build.cost,
						prod = bd.production;
						
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
					}
					
					nLi.innerHTML = ['<div class="yui-gb" style="margin-bottom:2px;">',
					'	<div class="yui-u first" style="width:20%;background:transparent url(',Lacuna.MapPlanet.surfaceUrl,') no-repeat center;text-align:center;">',
					'		<img src="',Lib.AssetUrl,'planet_side/',bd.image,'.png" style="width:100px;height:100px;" />',
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
					'	<div class="yui-u" style="width:10%">',
					'		<button type="button">Build</button>',
					'	</div>',
					'</div>'].join('');
					Sel.query("button", nLi, true).building = bd;
						
					frag.appendChild(nLi);
				}

				this.list.appendChild(frag);
			};
			this.buildingBuilder.resetFilter = function() {
				this.tagFilter.ResetSelections();
				this.tagFilter.SelectItems([{name:"Now"}]);				
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
		_fireRemoveTab : function(tab) {
			if(this.buildingDetails.isVisible()) {
				this.buildingDetails.tabView.removeTab(tab);
				this.buildingDetails.tabView.selectTab(0);
			}
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
				if(visible) {
					Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+Lib.AssetUrl+'planet_side/surface-a.jpg") repeat scroll 0 0 black');
				}
				else {
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
				map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
				
				//draw what we got
				map.redraw();
				//move to command
				map.setCenterToCommand();
				
				this._map = map;
				this._gridCreated = true;
				
				Event.delegate(this._map.mapDiv, "click", function(e, matchedEl, container) {
					if(!this._map.controller.isDragging()) {
						var tile = this._map.tileLayer.findTileById(matchedEl.parentNode.id);
						if(tile && tile.data) {
							this.DetailsView(tile);
						}
						else {
							this.BuilderView(tile);
						}
					}
				}, "div.planetMapTileActionContainer", this, true); //"button.planetMapTileActionButton"
				Event.delegate(this._map.mapDiv, "mouseenter", function(e, matchedEl, container) {
					var c = Sel.query("div.planetMapTileActionContainer", matchedEl, true);
					Dom.setStyle(c, "visibility", "visible");
				}, "div.tile", this, true); 
				Event.delegate(this._map.mapDiv, "mouseleave", function(e, matchedEl, container) {
					var c = Sel.query("div.planetMapTileActionContainer", matchedEl, true);
					Dom.setStyle(c, "visibility", "hidden");
				}, "div.tile", this, true); 
			}
			else {
				this.MapVisible(true); //needs to be visible before we set sizing and  map
				if(!this._elGrid.parentNode) {
					document.getElementById("content").appendChild(this._elGrid);
				}
				this._map.reset();
				this._map.setSurfaceUrl(this.surfaceUrl);
				this._map.addTileData(oArgs.buildings);
				this._map.refresh();
			}
			this.QueueBuidings(oArgs.buildings);
			
			Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+this.surfaceUrl+'") repeat scroll 0 0 black');
			Lacuna.Pulser.Hide();
		},
		Load : function(planetId) {
			Lacuna.Pulser.Show();
			this.locationId = planetId;
			this.ReLoad();
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
			var BodyServ = Game.Services.Body,
				data = {
					session_id: Game.GetSession(""),
					body_id: this.locationId,
					x:tile.x,
					y:tile.y
				};
			
			this.buildingBuilder.resetDisplay(this.currentBuildConnection);
			
			//Event.purgeElement(this.buildingBuilder.list);
			//this.buildingBuilder.list.innerHTML = "";
			//Event.purgeElement(this.buildingBuilder.unavailable);
			//this.buildingBuilder.unavailable.innerHTML = "";
			
			Game.OverlayManager.hideAll();
			Lacuna.Pulser.Show();
			this.buildingBuilder.show();
			
			this.currentBuildConnection = BodyServ.get_buildable(data,{
				success : function(o){
					delete this.currentBuildConnection;
					YAHOO.log(o, "info", "MapPlanet.BuilderView.success");
					this.fireEvent("onMapRpc", o.result);
					
					this.BuilderProcess(o.result, data);
				},
				failure : function(o){
					delete this.currentBuildConnection;
					YAHOO.log(o, "error", "MapPlanet.BuilderView.failure");
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		BuilderProcess : function(oResults, request) {
			if(this.buildingBuilder.isVisible() && oResults) {
				var b = oResults.buildable;
				if(b) {
					this.buildingBuilder.load(b, request);
				}
			}
			Lacuna.Pulser.Hide();
		},
		Build : function(building, x, y) {
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
						callback.failure.call(this, o.result, callback.url, x, y);
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
			panel.curEnergy.innerHTML = "";
			panel.curFood.innerHTML = "";
			panel.curHappiness.innerHTML = "";
			panel.curOre.innerHTML = "";
			panel.curWaste.innerHTML = "";
			panel.curWater.innerHTML = "";
			panel.timeLeftLi.innerHTML = "";
			Event.purgeElement(panel.upgradeUl);
			panel.upgradeUl.innerHTML = "";
			Event.purgeElement(panel.upgradeProdUl);
			panel.upgradeProdUl.innerHTML = "";
			
			while(panel.tabView.get("tabs").length > 1){
				var tab = panel.tabView.getTab(1);
				Event.purgeElement(tab.get("contentEl"));
				panel.tabView.removeTab(tab);
			}
			
			this.buildingDetails.show(); //show before we get data so it looks like we're doing something
			
			this.currentViewConnection = this.ViewData(tile.data.id, tile.data.url, {
				success:function(oResults, url, x, y){
					delete this.currentViewConnection;
					this.DetailsProcess(oResults, url, x, y);
				},
				failure:function(){
					delete this.currentViewConnection;
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
				case "/shipyard":
					classObj = new Lacuna.buildings.Shipyard(result);
					break;
				case "/spaceport":
					classObj = new Lacuna.buildings.SpacePort(result);
					break;
				case "/wasterecycling":
					classObj = new Lacuna.buildings.WasteRecycling(result);
					break;
			}
			
			if(classObj) {
				classObj.subscribe("onMapRpc", this._fireRpcSuccess, this, true);
				classObj.subscribe("onMapRpcFailed", this._fireRpcFailed, this, true);
				classObj.subscribe("onQueueAdd", this._fireQueueAdd, this, true);
				classObj.subscribe("onRemoveTab", this._fireRemoveTab, this, true);
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
				panel.curEnergy.innerHTML = building.energy_hour;
				panel.curFood.innerHTML = building.food_hour;
				panel.curHappiness.innerHTML = building.happiness_hour;
				panel.curOre.innerHTML = building.ore_hour;
				panel.curWaste.innerHTML = building.waste_hour;
				panel.curWater.innerHTML = building.water_hour;
				Event.purgeElement(panel.demolishLi);
				
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
					panel.demolishLi.innerHTML = '<span class="alert">Unable to Demolish</span>';
				}
				else {
					panel.timeLeftLi.innerHTML = "";
					panel.demolishLi.innerHTML = '<button type="button">Demolish</button>';
					Event.on(Sel.query("button", panel.demolishLi, true), "click", this.Demolish, this, true);
				}
				
				Event.purgeElement(panel.upgradeUl);
				Event.purgeElement(panel.upgradeProdUl);
				if(building.upgrade) {
					var up = building.upgrade;
					
					panel.upgradeUl.innerHTML = [
						'	<li>Upgrade Cost</li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',up.cost.food,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',up.cost.ore,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',up.cost.water,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.cost.energy,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',up.cost.waste,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(up.cost.time),'</span></li>'
					].join('');

					panel.upgradeProdUl.innerHTML = ['<li><ul><li>Upgrade Production</li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',up.production.food_hour,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',up.production.ore_hour,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',up.production.water_hour,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',up.production.energy_hour,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',up.production.waste_hour,'</span></li>',
						'	<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></span><span class="buildingDetailsNum">',up.production.happiness_hour,'</span></li>',
						'	</ul></li>',
						up.can ? '<li><button type="button">Upgrade</button></li>' : '<li class="alert">Unable to Upgrade:</li><li class="alert">',up.reason[1],'</li>'
						].join('');
					
					if(up.can) {
						Event.on(Sel.query("button", panel.upgradeProdUl, true), "click", this.Upgrade, this, true);
					}
				}
				else {
					panel.upgradeUl.innerHTML = "";
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
				}
				
				//create storage tab last
				if(building.upgrade.production && ((building.food_capacity*1 + building.ore_capacity*1 + building.water_capacity*1 + building.energy_capacity*1 + building.waste_capacity*1) > 0)) {
					var p = building.upgrade.production;
					output = [
						'<div class="yui-g">',
						'	<div class="yui-u first">',
						'		<ul>',
						'			<li>Current Storage</li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',building.food_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',building.ore_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',building.water_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',building.energy_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',building.waste_capacity,'</span></li>',
						'		</ul>',
						'	</div>',
						'	<div class="yui-u">',
						'		<ul id="buildingDetailsUpgradeStorage">',
						'			<li>Upgrade Storage</li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',p.food_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',p.ore_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',p.water_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',p.energy_capacity,'</span></li>',
						'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',p.waste_capacity,'</span></li>',
						'		</ul>',
						'	</div>',
						'</div>'];
					panel.tabView.addTab(new YAHOO.widget.Tab({ label: "Storage", content: output.join('')}));
				}
				
				Dom.setStyle("buildingDetailTabs", "display", "");
				panel.tabView.selectTab(0);
			}
		},
		
		Demolish : function() {
			if(confirm(['Are you sure you want to Demolish the level ',this.currentBuilding.building.level,' ',this.currentBuilding.building.name,'?'].join(''))) {
				Lacuna.Pulser.Show();
				Game.Services.Buildings.Generic.demolish({
					session_id:Game.GetSession(),
					building_id:this.currentBuilding.building.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "MapPlanet.Demolish.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						this._map.removeTile(this.currentBuilding.building.x, this.currentBuilding.building.y);
						this.buildingDetails.hide();						
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapPlanet.Demolish.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this,
					target:this.currentBuilding.building.url
				});
			}
		},
		Upgrade : function() {
			Lacuna.Pulser.Show();
			var building = this.currentBuilding.building,
				BuildingServ = Game.Services.Buildings.Generic,
				data = {
					session_id: Game.GetSession(""),
					building_id: building.id
				};
			
			BuildingServ.upgrade(data,{
				success : function(o){
					YAHOO.log(o, "info", "MapPlanet.Upgrade.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					this.buildingDetails.hide();
					
					var b = building; //originally passed in building data from currentBuilding
					b.id = o.result.building.id;
					b.level = o.result.building.level;
					b.pending_build = o.result.building.pending_build;
					YAHOO.log(b, "info", "MapPlanet.Upgrade.success.building");
					//this.UpdateCost(b.upgrade.cost);
					
					this.QueueReload(b);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapPlanet.Upgrade.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this,
				target:building.url
			});
		},
		/*UpdateCost : function(cost, multiplier) {
			var planet = Game.EmpireData.planets[this.locationId];
			if(planet && cost) {
				multiplier = multiplier || 1;
				planet.energy_stored -= cost.energy*1*multiplier;
				if(planet.energy_stored > planet.energy_capacity) {
					planet.energy_stored = planet.energy_capacity;
				}
				planet.food_stored -= cost.food*1*multiplier;
				if(planet.food_stored > planet.food_capacity) {
					planet.food_stored = planet.food_capacity;
				}
				planet.ore_stored -= cost.ore*1*multiplier;
				if(planet.ore_stored > planet.ore_capacity) {
					planet.ore_stored = planet.ore_capacity;
				}
				planet.water_stored -= cost.water*1*multiplier;
				if(planet.water_stored > planet.water_capacity) {
					planet.water_stored = planet.water_capacity;
				}
				
				//planet.waste_stored += cost.waste*1;
				//if(planet.waste_stored > planet.waste_capacity) {
				//	planet.waste_stored = planet.waste_capacity;
				//}
				
				var wasteOverage = 0;
				if(planet.waste_stored < planet.waste_capacity){
					planet.waste_stored += cost.waste*1*multiplier;
					if(planet.waste_stored > planet.waste_capacity) {
						wasteOverage = planet.waste_stored - planet.waste_capacity;
						planet.waste_stored = planet.waste_capacity;
					}
				}
				else {
					wasteOverage = cost.waste*1*multiplier;
				}
				
				planet.happiness -= wasteOverage;
				if(planet.happiness < 0 && Game.EmpireData.is_isolationist == "1") {
					planet.happiness = 0;
				}
				Game.EmpireData.happiness -= wasteOverage;
				if(Game.EmpireData.happiness < 0 && Game.EmpireData.is_isolationist == "1") {
					Game.EmpireData.happiness = 0;
				}
			
				Lacuna.Menu.updateTick();
			}
		},*/
		
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