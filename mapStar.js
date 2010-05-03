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
		this.createEvent("onChangeToSystemView");
		
		this._buildDetailsPanel();
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
						if(matchedEl.innerHTML == "View") {
							this.starDetails.hide();
							this.fireEvent("onChangeToSystemView", data);
						}
						else if(matchedEl.innerHTML == "Send Probe") {
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
		_buildJumpPanel : function() {
			var panelId = "starJump";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd"></div>',
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
			
			this.starJump = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:false,
				close:false,
				underlay:false,
				width:"500px",
				zIndex:9990,
				context:["footer","br","tr", ["beforeShow", "windowResize"], [0,-40]]
			});
			
			this.starJump.renderEvent.subscribe(function(){
				this.starJump.tabView = new YAHOO.widget.TabView("starDetailTabs");
				Event.delegate("starDetailsInfo", "click", function(e, matchedEl, container){
					var data = this.selectedStar;
					if(data) {
						if(matchedEl.innerHTML == "View") {
							this.starJump.hide();
							this.fireEvent("onChangeToSystemView", data);
						}
						else if(matchedEl.innerHTML == "Send Probe") {
							this.SendProbe(data);
						}
					}
				}, "button", this, true);
			}, this, true);
			
			this.starJump.render();
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

		Jump : function(xC,yC,zC) {
			this.LoadGrid({
				x:xC,
				y:yC,
				z:zC
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
						loc.z *= 1;
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
				map.setZoomLevel(loc.z);
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
							this.ShowStar(tile);
						}
					}
				}, "div.tile", this, true);
				Event.delegate(this._map.mapDiv, "dblclick", function(e, matchedEl, container) {
					var tile = this._map.tileLayer.findTileById(matchedEl.id);
					if(tile && tile.data.alignments.indexOf("self") >= 0) {
						YAHOO.log([tile.id, tile.data]);
						Game.OverlayManager.hideAll();
						this.fireEvent("onChangeToSystemView", tile.data);
					}
				}, "div.tile", this, true);
			}
			else {
				this._map.setZoomLevel(loc.z);
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
				'	<li><label>Y: </label>',data.y,'</li>',
				'	<li><label>Z: </label>',data.z,'</li>'
			];
			
			if(data.alignments == "unprobed") {
				output.push('	<li><button id="sendProbe" type="button">Send Probe</button></li>');
			} 
			else {
				output.push('	<li><button id="viewSystem" type="button">View</button></li>');
			}
			
			output.push('</ul>');
			Dom.get("starDetailsInfo").innerHTML = output.join('');
			
			Game.OverlayManager.hideAll();
			this.selectedStar = data;
			panel.show();
		}
	};
	Lang.augmentProto(MapStar, Util.EventProvider);
	
	Lacuna.MapStar = new MapStar();
})();
YAHOO.register("mapStar", YAHOO.lacuna.MapStar, {version: "1", build: "0"}); 

}