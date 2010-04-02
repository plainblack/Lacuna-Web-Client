YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapSystem == "undefined" || !YAHOO.lacuna.MapSystem) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
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
				'<div class="bd" id="planetDetailsInfo">',
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
				this.info = Dom.get("planetDetailsInfo");
			});
			
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
				
				Event.delegate(this._el, "click", function(e, matchedEl, container) {
					var body = matchedEl.Body,
						output = [
							'<div class="yui-g">',
							'	<div class="yui-u first">',
							'		<img src="',Lib.AssetUrl,'star_system/',body.image,'.png" alt="',body.name,'" style="width:100px;height:100px;" />',
							'	</div>',
							'	<div class="yui-u">',
							'		<ul>',
							'			<li id="planetDetailsName">',body.name,'</li>',
							'			<li><label>Type: </label>',body.type,'</li>',
							'			<li><label>Empire: </label>',(body.empire && body.empire.name ? body.empire.name : "Unknown"),'</li>',
							'			<li><label>Water: </label>',body.water,'</li>',
							'			<li><label>Planet Size:</label>',body.size,'</li>',
							'			<li><label>Location in Universe:</label>',body.x,'x : ',body.y,'y : ',body.z,'z</li>',
							'			<li><label>Star:</label>',body.star_name,'</li>',
							'			<li><label>Orbit:</label>',body.orbit,'</li>',
							'		</ul>',
							'	</div>',
							'</div>',
							'<div class="yui-g" style="margin-top:5px;padding-top:5px;border-top:1px solid #52acff;">',
							'	<div class="yui-u first">',
							'		<ul>',
							'			<li><label>Anthracite</label><span class="buildingDetailsNum">',body.ore.anthracite,'</span></li>',
							'			<li><label>Bauxite</label><span class="buildingDetailsNum">',body.ore.bauxite,'</span></li>',
							'			<li><label>Beryl</label><span class="buildingDetailsNum">',body.ore.beryl,'</span></li>',
							'			<li><label>Chalcopyrite</label><span class="buildingDetailsNum">',body.ore.chalcopyrite,'</span></li>',
							'			<li><label>Chromite</label><span class="buildingDetailsNum">',body.ore.chromite,'</span></li>',
							'			<li><label>Fluorite</label><span class="buildingDetailsNum">',body.ore.fluorite,'</span></li>',
							'			<li><label>Galena</label><span class="buildingDetailsNum">',body.ore.galena,'</span></li>',
							'			<li><label>Goethite</label><span class="buildingDetailsNum">',body.ore.goethite,'</span></li>',
							'			<li><label>Gold</label><span class="buildingDetailsNum">',body.ore.gold,'</span></li>',
							'			<li><label>Gypsum</label><span class="buildingDetailsNum">',body.ore.gypsum,'</span></li>',
							'		</ul>',
							'	</div>',
							'	<div class="yui-u">',
							'		<ul>',
							'			<li><label>Halite</label><span class="buildingDetailsNum">',body.ore.halite,'</span></li>',
							'			<li><label>Kerogen</label><span class="buildingDetailsNum">',body.ore.kerogen,'</span></li>',
							'			<li><label>Magnetite</label><span class="buildingDetailsNum">',body.ore.magnetite,'</span></li>',
							'			<li><label>Methane</label><span class="buildingDetailsNum">',body.ore.methane,'</span></li>',
							'			<li><label>Monazite</label><span class="buildingDetailsNum">',body.ore.monazite,'</span></li>',
							'			<li><label>Rutile</label><span class="buildingDetailsNum">',body.ore.rutile,'</span></li>',
							'			<li><label>Sulfur</label><span class="buildingDetailsNum">',body.ore.sulfur,'</span></li>',
							'			<li><label>Trona</label><span class="buildingDetailsNum">',body.ore.trona,'</span></li>',
							'			<li><label>Uraninite</label><span class="buildingDetailsNum">',body.ore.uraninite,'</span></li>',
							'			<li><label>Zircon</label><span class="buildingDetailsNum">',body.ore.zircon,'</span></li>',
							'		</ul>',
							'	</div>',
							'</div>'
						];
						
					this.planetDetails.info.innerHTML = output.join('');
					
					Game.OverlayManager.hideAll();
					this.planetDetails.show();
				}, "img.planet", this, true);
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
						Dom.addClass(elOrbit, "orbit");
						
						elName.innerHTML = body.name;
						
						elImg.src = [Lib.AssetUrl, "star_system/", body.image, ".png"].join('');
						elImg.id = "planet" + body.orbit;
						elImg.alt = body.name;
						elImg.Body = body;
						
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
							Event.on(elImg, "dblclick", function(e) {
								var img = Event.getTarget(e);
								this.planetDetails.hide();
								this.fireEvent("onChangeToPlanetView", img.Body.id);
							}, this, true);
						}
						
						Dom.addClass(elImg, "planet");
							
						systemMap.appendChild(elOrbit);
					}
				}
			}

			this.MapVisible(true);

		},
		Load : function(starId, isBody) {
			if(starId) {
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
							Lacuna.MapStar.MapVisible(true);
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
		Reset : function() {
		}
	};
	Lang.augmentProto(MapSystem, Util.EventProvider);
	
	Lacuna.MapSystem = new MapSystem();
})();
YAHOO.register("mapSystem", YAHOO.lacuna.MapSystem, {version: "1", build: "0"}); 

}