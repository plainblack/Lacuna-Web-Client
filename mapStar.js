YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapStar == "undefined" || !YAHOO.lacuna.MapStar) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var MapStar = function() {
		this.createEvent("onMapLoaded");
		this.createEvent("onMapLoadFailed");
		//this.createEvent("onChangeToSystemView");
		this.createEvent("onChangeToPlanetView");
		
		this._buildDetailsPanel();
		this._buildPlanetDetailsPanel();
	};
	MapStar.prototype = {
		_buildDetailsPanel : function() {
			var panelId = "starDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g">',
				'		<div class="yui-u first" id="starDetailsImg" class="background:black:width:100px;">',
				'		</div>',
				'		<div class="yui-u" id="starDetailsInfo">',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.starDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"500px",
				zIndex:9995,
				context:["header","tr","br", ["beforeShow", "windowResize"], [0,40]]
			});
			
			this.starDetails.renderEvent.subscribe(function(){
				this.starDetails.tabView = new YAHOO.widget.TabView("starDetailTabs");
				Event.delegate("starDetailsInfo", "click", function(e, matchedEl, container){
					var data = this.selectedStar;
					if(data) {
						if(matchedEl.innerHTML == "Send Probe") {
							this.SendProbe(data);
						}
					}
				}, "button", this, true);
			}, this, true);
			this.starDetails.hideEvent.subscribe(function(){
				this.selectedStar = undefined;
			}, this, true);
			
			this.starDetails.render();
			Game.OverlayManager.register(this.starDetails);
		},
		_buildPlanetDetailsPanel : function() {
			var panelId = "planetDetails";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Details</div>',
				'<div class="bd">',
				'	<div class="yui-g">',
				'		<div class="yui-u first" id="planetDetailsImg">',
				'		</div>',
				'		<div class="yui-u" id="planetDetailsInfo">',
				'		</div>',
				'	</div>',
				'	<div id="planetDetailTabs" class="yui-navset">',
				'		<ul class="yui-nav">',
				'			<li><a href="#planetDetailOre"><em>Ore</em></a></li>',
				'			<li><a href="#planetDetailRename"><em>Rename</em></a></li>',
				'		</ul>',
				'		<div class="yui-content">',
				'			<div id="planetDetailOre">',
				'				<div class="yui-g">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li><label>Anthracite</label><span class="buildingDetailsNum" id="planetDetailsAnthracite"></span></li>',
				'							<li><label>Bauxite</label><span class="buildingDetailsNum" id="planetDetailsBauxite"></span></li>',
				'							<li><label>Beryl</label><span class="buildingDetailsNum" id="planetDetailsBeryl"></span></li>',
				'							<li><label>Chalcopyrite</label><span class="buildingDetailsNum" id="planetDetailsChalcopyrite"></span></li>',
				'							<li><label>Chromite</label><span class="buildingDetailsNum" id="planetDetailsChromite"></span></li>',
				'							<li><label>Fluorite</label><span class="buildingDetailsNum" id="planetDetailsFluorite"></span></li>',
				'							<li><label>Galena</label><span class="buildingDetailsNum" id="planetDetailsGalena"></span></li>',
				'							<li><label>Goethite</label><span class="buildingDetailsNum" id="planetDetailsGoethite"></span></li>',
				'							<li><label>Gold</label><span class="buildingDetailsNum" id="planetDetailsGold"></span></li>',
				'							<li><label>Gypsum</label><span class="buildingDetailsNum" id="planetDetailsGypsum"></span></li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul>',
				'							<li><label>Halite</label><span class="buildingDetailsNum" id="planetDetailsHalite"></span></li>',
				'							<li><label>Kerogen</label><span class="buildingDetailsNum" id="planetDetailsKerogen"></span></li>',
				'							<li><label>Magnetite</label><span class="buildingDetailsNum" id="planetDetailsMagnetite"></span></li>',
				'							<li><label>Methane</label><span class="buildingDetailsNum" id="planetDetailsMethane"></span></li>',
				'							<li><label>Monazite</label><span class="buildingDetailsNum" id="planetDetailsMonazite"></span></li>',
				'							<li><label>Rutile</label><span class="buildingDetailsNum" id="planetDetailsRutile"></span></li>',
				'							<li><label>Sulfur</label><span class="buildingDetailsNum" id="planetDetailsSulfur"></span></li>',
				'							<li><label>Trona</label><span class="buildingDetailsNum" id="planetDetailsTrona"></span></li>',
				'							<li><label>Uraninite</label><span class="buildingDetailsNum" id="planetDetailsUraninite"></span></li>',
				'							<li><label>Zircon</label><span class="buildingDetailsNum" id="planetDetailsZircon"></span></li>',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
				'			<div id="planetDetailRename"><ul>',
				'				<li><label>New Planet Name: </label><input type="text" id="planetDetailNewName" maxlength="100" /></li>',
				'				<li><button type="button" id="planetDetailRenameSubmit">Rename</button></li>',
				'			</ul></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			Dom.addClass(panel, "nofooter");
			
			this.planetDetails = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:true,
				underlay:false,
				width:"500px",
				zIndex:9995,
				context:["header","tr","br", ["beforeShow", "windowResize"], [0,20]]
			});
			
			this.planetDetails.renderEvent.subscribe(function(){
				this.planetDetails.tabView = new YAHOO.widget.TabView("planetDetailTabs");
				Event.on("planetDetailRenameSubmit", "click", this.Rename, this, true);
				Event.delegate("planetDetailsInfo", "click", this.DetailsClick, "button", this, true);
			}, this, true);
			this.planetDetails.hideEvent.subscribe(function(){
				this.selectedBody = undefined;
				this.selectedTile = undefined;
			}, this, true);
			
			this.planetDetails.render();
			Game.OverlayManager.register(this.planetDetails);
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			/*if(visible) {
				this.starJump.show();
			}
			else {
				this.starJump.hide();
			}*/
			if(this._isVisible != visible) {
				if(this._elGrid) {
					this._isVisible = visible;
					YAHOO.log(visible, "info", "MapStar.MapVisible");
					Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
				}
				if(visible) {
					Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+Lib.AssetUrl+'star_system/field.png") repeat scroll 0 0 black');
				}
			}
		},

		Jump : function(xC,yC) {
			this.LoadGrid({
				x:xC,
				y:yC
			});
		},
		Load : function() {
			var cId = Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id;
			if(!this.locationId) {
				if(cId) {
					Lacuna.Pulser.Show();
					var loc = Game.EmpireData.planets[cId];
					if(loc) {
						this.locationId = cId;
						loc.x *= 1;
						loc.y *= 1;
						this.LoadGrid(loc);
					}
				}
			}
		},
		LoadGrid : function(loc) {
			Lacuna.Pulser.Show();
			if(!this._gridCreated) {
				var starMap = document.createElement("div");
				starMap.id = "starMap";
				this._elGrid = document.getElementById("content").appendChild(starMap);
				this.SetSize();
								
				var map = new Lacuna.Mapper.StarMap("starMap");
				map.imgUrlLoc = Lib.AssetUrl + 'ui/mapiator/';
				
				//draw what we got
				map.redraw();
				//move to current planet
				map.setCenterTo(loc.x,loc.y);
				
				this._map = map;
				this._gridCreated = true;
				
				Event.delegate(this._map.mapDiv, "click", function(e, matchedEl, container) {
					if(!this._map.controller.isDragging()) {
						var tile = this._map.tileLayer.findTileById(matchedEl.id);
						if(tile && tile.data) {
							if(tile.data.isStar) {
								this.ShowStar(tile);
							}
							else if(tile.data.isPlanet) {
								this.ShowPlanet(tile);
							}
						}
					}
				}, "div.tile", this, true);
				/*Event.delegate(this._map.mapDiv, "dblclick", function(e, matchedEl, container) {
					var tile = this._map.tileLayer.findTileById(matchedEl.id);
					if(tile && tile.data.alignments.indexOf("self") >= 0) {
						YAHOO.log([tile.id, tile.data]);
						Game.OverlayManager.hideAll();
						this.fireEvent("onChangeToSystemView", tile.data);
					}
				}, "div.tile", this, true);*/
			}
			else {
				//move to current planet
				this._map.setCenterTo(loc.x,loc.y);
			}
			
			this.MapVisible(true);
			Lacuna.Pulser.Hide();
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
			this.MapVisible(false);
		},
	
		SendProbe : function(data) {
			Lacuna.Pulser.Show();
			var send = Dom.get("sendProbe");
			send.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_probe({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_star:{star_id:data.id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapStar.SendProbe.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = send.parentNode;
					par.removeChild(send);
					par.innerHTML = "Arrives: " + Lib.formatServerDate(o.result.probe.date_arrives);
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapStar.SendProbe.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = send.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(send);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		ShowStar : function(tile) {
			var data = tile.data,
				panel = this.starDetails;
			Dom.get("starDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_map/',data.color,'.png" alt="',data.name,'" style="width:100px;height:100px;" />'].join('');
			var output = [
				'<ul>',
				'	<li id="starDetailsName">',data.name,'</li>',
				'	<li><label>X: </label>',data.x,'</li>',
				'	<li><label>Y: </label>',data.y,'</li>'
			];
			
			if(!data.bodies) {
				output.push('	<li id="starDetailsIncomingProbe">Loading...</li>');
				Game.Services.Maps.check_star_for_incoming_probe({
					session_id:Game.GetSession(),
					star_id:data.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "MapStar.ShowStar.check_star_for_incoming_probe.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						if(o.result.incoming_probe) {
							Dom.get("starDetailsIncomingProbe").innerHTML = 'Probe will arrive at: ' + Lib.formatServerDate(o.result.incoming_probe);
						}
						else {
							Dom.get("starDetailsIncomingProbe").innerHTML = '<button id="sendProbe" type="button">Send Probe</button>';
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapStar.ShowStar.check_star_for_incoming_probe.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
						Dom.get("starDetailsIncomingProbe").innerHTML = "Probe status unknown.";
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
			
			output.push('</ul>');
			Dom.get("starDetailsInfo").innerHTML = output.join('');
			
			Game.OverlayManager.hideAll();
			this.selectedStar = data;
			panel.show();
		},
	
		Rename : function() {
			var newName = Dom.get("planetDetailNewName").value;
			Game.Services.Body.rename({
					session_id: Game.GetSession(""),
					body_id:this.selectedBody.id,
					name:newName
				},{
					success : function(o){
						YAHOO.log(o, "info", "MapStar.Rename.success");
						if(o.result && this.selectedBody) {
							Dom.get("planetDetailsName").innerHTML = newName;
							Game.EmpireData.planets[this.selectedBody.id].name = newName;
							Lacuna.Menu.update();
							this._map.tileCache[this.selectedTile.x][this.selectedTile.y].name = newName;
							this.selectedTile.refresh();
							
							this.selectedBody.name = newName;
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapStar.Rename.failure");
					},
					timeout:Game.Timeout,
					scope:this
				}
			);
		},
		DetailsClick : function(e, matchedEl, container){
			if(this.selectedBody) {
				if(matchedEl.innerHTML == "View") {
					var id = this.selectedBody.id;
					this.planetDetails.hide();
					this.fireEvent("onChangeToPlanetView", id);
				}
				else if(matchedEl.id == "sendSpy") {
					this.SendSpy(matchedEl, this.selectedBody.id);
				}
				else if(matchedEl.id == "sendColony") {
					this.SendColonyShip(matchedEl, this.selectedBody.id);
				}
				else if(matchedEl.id == "sendMining") {
					this.SendMiningShip(matchedEl, this.selectedBody.id);
				}
			}
		},
		SendSpy : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_spy_pod({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendSpy.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.spy_pod.date_arrives),"</div>",
						"<div>Carrying: ", o.result.spy_pod.carrying_spy.name, "</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendSpy.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SendColonyShip : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_colony_ship({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendColonyShip.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.colony_ship.date_arrives),"</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendColonyShip.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SendMiningShip : function(el, id) {
			Lacuna.Pulser.Show();
			el.disabled = true;
			
			Game.Services.Buildings.SpacePort.send_mining_platform_ship({
				session_id:Game.GetSession(),
				from_body_id:Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id,
				to_body:{body_id:id}
			}, {
				success : function(o){
					YAHOO.log(o, "info", "MapSystem.SendMiningShip.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					var par = el.parentNode;
					par.removeChild(el);
					par.innerHTML = ["<div>Arrives: ",Lib.formatServerDate(o.result.mining_platform_ship.date_arrives),"</div>"].join('');
				},
				failure : function(o){
					YAHOO.log(o, "error", "MapSystem.SendMiningShip.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
					var par = el.parentNode;
					par.appendChild(document.createTextNode(o.error.message));
					par.removeChild(el);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		ShowPlanet : function(tile) {
			var body = tile.data,
				panel = this.planetDetails;
			Dom.get("planetDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',body.image,'.png" alt="',body.name,'" style="width:100px;height:100px;" />'].join('');
			Dom.get("planetDetailsInfo").innerHTML = [
				'<ul>',
				'	<li id="planetDetailsName">',body.name,'</li>',
				'	<li><label>Type: </label>',body.type,'</li>',
				'	<li><label>Empire: </label>',(body.empire && body.empire.name ? body.empire.name : "None"),'</li>',
				'	<li><label>Water: </label>',body.water,'</li>',
				'	<li><label>Planet Size:</label>',body.size,'</li>',
				'	<li><label>Location in Universe:</label>',body.x,'x : ',body.y,'y</li>',
				'	<li><label>Star:</label>',body.star_name,'</li>',
				'	<li><label>Orbit:</label>',body.orbit,'</li>',
				body.alignment == "self" ? '	<li><button type="button">View</button></li>' : '',
				body.alignment != "none" && body.empire && body.empire.name ? '	<li><button id="sendSpy" type="button">Send Spy</button></li>' : '',
				body.alignment == "none" && body.type == "habitable planet" ? '	<li><button id="sendColony" type="button">Send Colony Ship</button></li>' : '',
				body.alignment == "none" && body.type == "asteroid" ? '	<li><button id="sendMining" type="button">Send Mining Ship</button></li>' : '',
				'</ul>'
			].join('');
			
			Dom.get("planetDetailsAnthracite").innerHTML = body.ore.anthracite;
			Dom.get("planetDetailsBauxite").innerHTML = body.ore.bauxite;
			Dom.get("planetDetailsBeryl").innerHTML = body.ore.beryl;
			Dom.get("planetDetailsChalcopyrite").innerHTML = body.ore.chalcopyrite;
			Dom.get("planetDetailsChromite").innerHTML = body.ore.chromite;
			Dom.get("planetDetailsFluorite").innerHTML = body.ore.fluorite;
			Dom.get("planetDetailsGalena").innerHTML = body.ore.galena;
			Dom.get("planetDetailsGoethite").innerHTML = body.ore.goethite;
			Dom.get("planetDetailsGold").innerHTML = body.ore.gold;
			Dom.get("planetDetailsGypsum").innerHTML = body.ore.gypsum;
			Dom.get("planetDetailsHalite").innerHTML = body.ore.halite;
			Dom.get("planetDetailsKerogen").innerHTML = body.ore.kerogen;
			Dom.get("planetDetailsMagnetite").innerHTML = body.ore.magnetite;
			Dom.get("planetDetailsMethane").innerHTML = body.ore.methane;
			Dom.get("planetDetailsMonazite").innerHTML = body.ore.monazite;
			Dom.get("planetDetailsRutile").innerHTML = body.ore.rutile;
			Dom.get("planetDetailsSulfur").innerHTML = body.ore.sulfur;
			Dom.get("planetDetailsTrona").innerHTML = body.ore.trona;
			Dom.get("planetDetailsUraninite").innerHTML = body.ore.uraninite;
			Dom.get("planetDetailsZircon").innerHTML = body.ore.zircon;
			
			if(body.alignment == "self"){
				if(panel.renameTab) {
					panel.tabView.addTab(panel.renameTab, 1);
					panel.renameTab = undefined;
				}
				Dom.get("planetDetailNewName").value = "";
			}
			else if(panel.tabView.get("tabs").length == 2){
				panel.renameTab = panel.tabView.getTab(1);
				panel.tabView.removeTab(panel.renameTab);
			}
			
			Game.OverlayManager.hideAll();
			this.selectedBody = body;
			this.selectedTile = tile;
			panel.tabView.selectTab(0);
			panel.show();
		}
	
	};
	Lang.augmentProto(MapStar, Util.EventProvider);
	
	Lacuna.MapStar = new MapStar();
})();
YAHOO.register("mapStar", YAHOO.lacuna.MapStar, {version: "1", build: "0"}); 

}