YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapSystem == "undefined" || !YAHOO.lacuna.MapSystem) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var MapSystem = function() {
		this.createEvent("onStatusUpdate");
		this.createEvent("onChangeToPlanetView");
		this._buildDetailsPanel();
	};
	MapSystem.prototype = {
		_buildDetailsPanel : function() {
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
				Event.delegate("planetDetailsInfo", "click", function(e, matchedEl, container){
					if(this.selectedBody) {
						var id = this.selectedBody.id;
						this.planetDetails.hide();
						this.fireEvent("onChangeToPlanetView", id);
					}
				}, "button", this, true);
			}, this, true);
			this.planetDetails.hideEvent.subscribe(function(){
				this.selectedBody = undefined;
			}, this, true);
			
			this.planetDetails.render();
			Game.OverlayManager.register(this.planetDetails);
		},
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			if(this._el) {
				this._isVisible = visible; 
				Dom.setStyle(this._el, "display", visible ? "" : "none");
			}
			if(visible) {
				Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+Lib.AssetUrl+'star_system/field.png") repeat scroll 0 0 black');
			}
			else {
				this.planetDetails.hide();
			}
		},
		Display : function(oResult) {
			if(!this._gridCreated) {
				var systemMap = document.createElement("div");
				systemMap.id = "systemMap";
				this._el = document.getElementById("content").appendChild(systemMap);
				
				Event.delegate(this._el, "click", this.ShowPlanet, "img.planet", this, true);
				Event.delegate(this._el, "click", this.ShowPlanet, "span.planetName", this, true);
			}
			else {
				//if it exists clear it and refill
				this._el.innerHTML = "";
			}
			
			var star = oResult.star,
				bodies = oResult.bodies,
				div = document.createElement("div"),
				span = document.createElement("span"),
				img = document.createElement("img");
				
			this.locationId = star.id;
			Game.SetLocation(Lacuna.MapSystem.locationId, Lib.View.SYSTEM);
				
			var starImg = systemMap.appendChild(img.cloneNode(false));
			starImg.src = [Lib.AssetUrl, "star_system/", star.color, ".png"].join('');
				
			for(var bKey in bodies) {
				if(bodies.hasOwnProperty(bKey)) {
					var body = bodies[bKey];
						
					if(body.name && body.image) {
						var elOrbit = div.cloneNode(false),
							elName = elOrbit.appendChild(span.cloneNode(false)),
							elImg = img.cloneNode(false);
							
						body.id = bKey;
							
						elOrbit.id = "orbit" + body.orbit;
						elOrbit.Body = body;
						Dom.addClass(elOrbit, "orbit");
						
						elName.innerHTML = body.name;
						Dom.addClass(elName, "planetName");
						
						elImg.src = [Lib.AssetUrl, "star_system/", body.image, ".png"].join('');
						elImg.id = "planet" + body.orbit;
						elImg.alt = body.name;
						
						if(body.alignment != "none") {
							var elAlign = elOrbit.appendChild(img.cloneNode(false));
							elAlign.src = [Lib.AssetUrl, "star_system/", body.alignment, ".png"].join('');
							elAlign.id = "planetAlignment" + body.orbit;
							elAlign = elOrbit.appendChild(elAlign);
							elImg = elOrbit.appendChild(elImg);
						}
						else {
							elImg = elOrbit.appendChild(elImg);
						}
						
						if(Game.EmpireData.planets && Game.EmpireData.planets[bKey]){
							Event.on([elImg,elName], "dblclick", function(e) {
								var t = Event.getTarget(e);
								this.planetDetails.hide();
								this.fireEvent("onChangeToPlanetView", t.parentNode.Body.id);
							}, this, true);
						}
						
						Dom.addClass(elImg, "planet");
							
						systemMap.appendChild(elOrbit);
					}
				}
			}

			this.MapVisible(true);

			Lacuna.Pulser.Hide();
		},
		Load : function(starId, isBody) {
			if(starId) {
				Lacuna.Pulser.Show();
				var MapServ = Game.Services.Maps,
					data = {
						session_id: Game.GetSession("")
					},
					callback = {
						success : function(o){
							this.fireEvent("onStatusUpdate", o.result.status);
							YAHOO.log(o, "info", "MapSystem.Load.success");
							this.Display(o.result);
						},
						failure : function(o){
							YAHOO.log(o, "info", "MapSystem.Load.failure");
							Lacuna.Pulser.Hide();
						},
						timeout:Game.Timeout,
						scope:this
					};
				
				if(isBody) {
					data.body_id = starId;
					MapServ.get_star_system_by_body(data,callback);
				}
				else {
					data.star_id = starId;
					MapServ.get_star_system(data,callback);
				}
			}
		},
		Rename : function() {
			var newName = Dom.get("planetDetailNewName").value;
			Game.Services.Body.rename({
					session_id: Game.GetSession(""),
					body_id:this.selectedBody.id,
					name:newName
				},{
					success : function(o){
						YAHOO.log(o, "info", "MapSystem.Rename.success");
						if(o.result) {
							Dom.get("planetDetailsName").innerHTML = newName;
							Game.EmpireData.planets[this.selectedBody.id].name = newName;
							Lacuna.Menu.update();
							var span = Sel.query("span", "orbit"+this.selectedBody.orbit, true);
							if(span) { span.innerHTML = newName; }
							
							this.selectedBody.name = newName;
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "MapSystem.Rename.failure");
					},
					timeout:Game.Timeout,
					scope:this
				}
			);
		},
		Reset : function() {
		},
		ShowPlanet : function(e, matchedEl, container) {
			var body = matchedEl.parentNode.Body,
				panel = this.planetDetails;
			Dom.get("planetDetailsImg").innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',body.image,'.png" alt="',body.name,'" style="width:100px;height:100px;" />'].join('');
			Dom.get("planetDetailsInfo").innerHTML = [
				'<ul>',
				'	<li id="planetDetailsName">',body.name,'</li>',
				'	<li><label>Type: </label>',body.type,'</li>',
				'	<li><label>Empire: </label>',(body.empire && body.empire.name ? body.empire.name : "None"),'</li>',
				'	<li><label>Water: </label>',body.water,'</li>',
				'	<li><label>Planet Size:</label>',body.size,'</li>',
				'	<li><label>Location in Universe:</label>',body.x,'x : ',body.y,'y : ',body.z,'z</li>',
				'	<li><label>Star:</label>',body.star_name,'</li>',
				'	<li><label>Orbit:</label>',body.orbit,'</li>',
				body.alignment == "self" ? '	<li><button type="button">View</button></li>' : '',
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
			panel.tabView.selectTab(0);
			panel.show();
		}
	};
	Lang.augmentProto(MapSystem, Util.EventProvider);
	
	Lacuna.MapSystem = new MapSystem();
})();
YAHOO.register("mapSystem", YAHOO.lacuna.MapSystem, {version: "1", build: "0"}); 

}