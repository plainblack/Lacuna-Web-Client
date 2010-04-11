YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.MapStar == "undefined" || !YAHOO.lacuna.MapStar) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
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
				context:["header","tr","br", ["beforeShow", "windowResize"], [0,20]]
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
		
		IsVisible : function() {
			return this._isVisible;
		},
		MapVisible : function(visible) {
			if(this._elGrid) {
				this._isVisible = visible;
				Dom.setStyle(this._elGrid, "display", visible ? "" : "none");
			}
			if(visible) {
				Dom.setStyle(document.getElementsByTagName("html"), 'background', 'url("'+Lib.AssetUrl+'star_system/field.png") repeat scroll 0 0 black');
			}
		},
		Mapper : function() {
		},
		Load : function() {
			/*
			var o = Lang.JSON.parse('{"jsonrpc":"2.0","id":1,"result":{"stars":[{"y":-5,"can_rename":0,"color":"magenta","name":"Aestr Shiaph","alignments":"unprobed","id":"ffd77046-345e-45f2-a031-7b13fb0b5e35","x":-5,"z":3},{"y":-3,"can_rename":0,"color":"white","name":"Undo","alignments":"unprobed","id":"7a3ebd4f-ec2f-44ce-90ef-dfc6d3d83d24","x":-5,"z":3},{"y":-2,"can_rename":0,"color":"red","name":"Liak","alignments":"unprobed","id":"95597b2c-d9a8-44a6-8d25-8af26697dd34","x":-5,"z":3},{"y":-1,"can_rename":0,"color":"green","name":"Eppoa","alignments":"unprobed","id":"0c6567e4-8d64-4bbd-926f-1ce4ec048cba","x":-5,"z":3},{"y":0,"can_rename":0,"color":"white","name":"Knaest","alignments":"unprobed","id":"4f5aeb1f-e1aa-4472-848a-25b79c0c7896","x":-5,"z":3},{"y":1,"can_rename":0,"color":"red","name":"Seginus","alignments":"unprobed","id":"4012275b-0f0c-48e7-af36-ea6508b3d8f8","x":-5,"z":3},{"y":2,"can_rename":0,"color":"yellow","name":"Vloe Oathoopl","alignments":"unprobed","id":"e6aa2990-7fd1-4569-b6db-f3bde11add2c","x":-5,"z":3},{"y":-3,"can_rename":0,"color":"blue","name":"Iorvoudo","alignments":"unprobed","id":"38787707-d81a-4a48-8758-ed0b398a06b0","x":-4,"z":3},{"y":-2,"can_rename":0,"color":"red","name":"Prae Osphi","alignments":"unprobed","id":"9f9da430-1e34-452b-9869-1e84437c7cb2","x":-4,"z":3},{"y":0,"can_rename":0,"color":"green","name":"Eeccie","alignments":"unprobed","id":"169de679-9cdb-40e7-9529-b9392ddf1c2e","x":-4,"z":3},{"y":1,"can_rename":0,"color":"green","name":"Acklealo","alignments":"unprobed","id":"84a99f2c-70a4-426c-8ac0-305bd34bc15f","x":-4,"z":3},{"y":3,"can_rename":0,"color":"blue","name":"Oyequoa","alignments":"unprobed","id":"0759cbde-1de6-408a-a0ce-b05d185e05ba","x":-4,"z":3},{"y":-5,"can_rename":0,"color":"magenta","name":"Ujoosphaeg","alignments":"unprobed","id":"894ebf10-21df-4d5f-88ce-810ffc06d62c","x":-3,"z":3},{"y":-4,"can_rename":0,"color":"magenta","name":"Alkalurops","alignments":"unprobed","id":"febcd2fe-a75f-409e-882f-eab1a7f29841","x":-3,"z":3},{"y":-3,"can_rename":0,"color":"red","name":"Ukoeggie","alignments":"unprobed","id":"c3884c32-71ff-4817-8ab7-31cd1688c279","x":-3,"z":3},{"y":0,"can_rename":0,"color":"blue","name":"Cui Ofloe","alignments":"unprobed","id":"c40f009c-bb53-4247-8251-8d35bd00cc51","x":-3,"z":3},{"y":2,"can_rename":0,"color":"white","name":"Kaffaljidhma","alignments":"unprobed","id":"e5f7f6b6-b7cb-4dbe-b0b3-7b96a16929b1","x":-3,"z":3},{"y":3,"can_rename":0,"color":"blue","name":"Ughie","alignments":"unprobed","id":"f52e071d-457d-4395-a541-1cb5a78496b3","x":-3,"z":3},{"y":-5,"can_rename":0,"color":"magenta","name":"Thiegl","alignments":"unprobed","id":"f0d7fbc3-4356-49a7-93f9-f63f8811a97f","x":-2,"z":3},{"y":-4,"can_rename":0,"color":"blue","name":"Oos Gearv","alignments":"unprobed","id":"aa0c5154-ed72-4556-8c61-d5d8ef5716e7","x":-2,"z":3},{"y":-3,"can_rename":0,"color":"magenta","name":"Yui Eegee","alignments":"unprobed","id":"d0237ad0-7a9e-4ae6-bf2f-92974ec44488","x":-2,"z":3},{"y":-2,"can_rename":1,"color":"red","name":"Oosn Lyirv","alignments":"self","id":"66d7e0bc-4196-4130-ab23-14e1bfcf4c83","x":-2,"z":3},{"y":-1,"can_rename":0,"color":"magenta","name":"Epsilon Leonis","alignments":"unprobed","id":"e466f2b0-7867-48e4-b6a3-3a41ca3e61a6","x":-2,"z":3},{"y":0,"can_rename":0,"color":"white","name":"Quie Oaxyoaw","alignments":"unprobed","id":"a7000bde-a077-4152-9e56-f38eb76661cf","x":-2,"z":3},{"y":1,"can_rename":0,"color":"magenta","name":"Enif","alignments":"unprobed","id":"e220d35b-b0b9-47a3-b5da-17a1b90ef459","x":-2,"z":3},{"y":2,"can_rename":0,"color":"yellow","name":"Aflucui","alignments":"unprobed","id":"94dd6e46-72ce-4403-8235-fc5ac43f744a","x":-2,"z":3},{"y":3,"can_rename":0,"color":"white","name":"Eetheaglow","alignments":"unprobed","id":"3a75fd51-a84e-4299-a945-910d45a69b3d","x":-2,"z":3},{"y":-5,"can_rename":0,"color":"white","name":"Oan Pleuckl","alignments":"unprobed","id":"02c6a61a-7aa1-4862-b74b-f6652bb916f8","x":-1,"z":3},{"y":-4,"can_rename":0,"color":"yellow","name":"Fum Al Samakah","alignments":"unprobed","id":"a73e5375-3300-4291-87a8-7f04091beccb","x":-1,"z":3},{"y":-3,"can_rename":0,"color":"red","name":"Ootta","alignments":"unprobed","id":"1f9c9df6-d61e-4a9f-9d9b-87b4989cf559","x":-1,"z":3},{"y":-2,"can_rename":0,"color":"blue","name":"Tejat Posterior","alignments":"unprobed","id":"4f32dbad-318f-4d8a-b859-801c3f50ad29","x":-1,"z":3},{"y":-1,"can_rename":0,"color":"blue","name":"Owowaeb","alignments":"unprobed","id":"9c54fb1b-846a-47b9-b517-248b22e3c43f","x":-1,"z":3},{"y":0,"can_rename":0,"color":"blue","name":"Lliabli","alignments":"unprobed","id":"43a84c90-ecfe-4859-a0f6-47723b7566c3","x":-1,"z":3},{"y":1,"can_rename":0,"color":"white","name":"Zo Ecklem","alignments":"unprobed","id":"cda57515-d83d-4ada-9088-d5cc42a3ad58","x":-1,"z":3},{"y":3,"can_rename":0,"color":"red","name":"Reticulum","alignments":"unprobed","id":"b2d8b7fc-5e05-4e9c-91b6-e89cb156cb03","x":-1,"z":3},{"y":-5,"can_rename":0,"color":"green","name":"Delta Geminorum","alignments":"unprobed","id":"a49acc35-0ca5-4071-93bf-c1be086e9ab9","x":0,"z":3},{"y":-4,"can_rename":0,"color":"blue","name":"Sloesch","alignments":"unprobed","id":"f530f836-3517-45c8-9c81-6ba195df942b","x":0,"z":3},{"y":-3,"can_rename":0,"color":"yellow","name":"Zae Agie","alignments":"unprobed","id":"20845d42-1aee-4f06-be13-c83d546c5118","x":0,"z":3},{"y":-2,"can_rename":0,"color":"red","name":"Cheu Uggu","alignments":"unprobed","id":"31509ee1-08f3-441e-9cb1-79242aa2388b","x":0,"z":3},{"y":-1,"can_rename":0,"color":"green","name":"Schee Iosneen","alignments":"unprobed","id":"7a59f2e6-e41d-4287-ba8d-3709252e6b5e","x":0,"z":3},{"y":1,"can_rename":0,"color":"white","name":"Giausar","alignments":"unprobed","id":"ad483864-c3e9-4954-9176-be2f5a031010","x":0,"z":3},{"y":2,"can_rename":0,"color":"red","name":"Menkib","alignments":"unprobed","id":"adffd5c9-b723-4772-b784-3c24ab94feff","x":0,"z":3},{"y":3,"can_rename":0,"color":"green","name":"Kloav","alignments":"unprobed","id":"a4761e5e-6e71-4280-8fd3-3fec823557d1","x":0,"z":3},{"y":-5,"can_rename":0,"color":"red","name":"Eta Eridani","alignments":"unprobed","id":"d8e76481-53c3-4864-aa10-00ef92499af1","x":1,"z":3},{"y":-4,"can_rename":0,"color":"blue","name":"Yeuv","alignments":"unprobed","id":"4014f587-a1ce-43d3-bf5d-9708da1ff775","x":1,"z":3},{"y":-3,"can_rename":0,"color":"yellow","name":"Eend Phesh","alignments":"unprobed","id":"ac2c2e75-1a78-4c76-b65e-e4cfae638617","x":1,"z":3},{"y":-2,"can_rename":0,"color":"yellow","name":"Avior","alignments":"unprobed","id":"e5812471-0510-4cd1-a847-e39259affea0","x":1,"z":3},{"y":-1,"can_rename":0,"color":"blue","name":"Eta Pegasi","alignments":"unprobed","id":"41006891-432b-413d-b85c-10256069dee9","x":1,"z":3},{"y":2,"can_rename":0,"color":"magenta","name":"Secunda Giedi","alignments":"unprobed","id":"80c2a0dd-fbb5-4db8-a6cc-b572aad65cb2","x":1,"z":3},{"y":3,"can_rename":0,"color":"yellow","name":"Angiantow","alignments":"unprobed","id":"1bed2ff9-1402-4407-b6c6-8b637ed353c8","x":1,"z":3},{"y":-5,"can_rename":0,"color":"green","name":"Fie Ouzoorn","alignments":"unprobed","id":"3c51ae8d-dd8a-439a-9c12-72d987e94c2d","x":2,"z":3},{"y":-4,"can_rename":0,"color":"blue","name":"Veuscha","alignments":"unprobed","id":"cf8890ca-0099-48a5-9e16-60513a4408bb","x":2,"z":3},{"y":-3,"can_rename":0,"color":"blue","name":"Mufrid","alignments":"unprobed","id":"da48dcc2-f16d-404c-ba30-cd88ca8643b0","x":2,"z":3},{"y":-2,"can_rename":0,"color":"green","name":"Grafias","alignments":"unprobed","id":"3c16953c-507f-4be6-bdf7-3df8d1c831fb","x":2,"z":3},{"y":-1,"can_rename":0,"color":"green","name":"Baten Kaitos","alignments":"unprobed","id":"8f77af2d-3a4b-426b-95c4-3cec30ef9ed4","x":2,"z":3},{"y":0,"can_rename":0,"color":"white","name":"Osniaphugg","alignments":"unprobed","id":"b2142d80-619d-4861-a555-ad948dbb9eb9","x":2,"z":3},{"y":1,"can_rename":0,"color":"white","name":"Eetr Lyoeje","alignments":"unprobed","id":"3ef02581-dd65-416e-a9d6-eadaddbf2f4a","x":2,"z":3},{"y":3,"can_rename":0,"color":"magenta","name":"Andlow","alignments":"unprobed","id":"fdd39e55-6d66-4d62-ab38-901cb8319adc","x":2,"z":3},{"y":-5,"can_rename":0,"color":"blue","name":"Ioss Sigio","alignments":"unprobed","id":"cf1aa2c7-5b46-4f47-b7cb-3c70cd0d3d1c","x":3,"z":3},{"y":-3,"can_rename":0,"color":"red","name":"Nunki","alignments":"unprobed","id":"a30df64e-edeb-4f1e-8a65-9abfa84799c2","x":3,"z":3},{"y":-1,"can_rename":0,"color":"blue","name":"Ouw Knoowee","alignments":"unprobed","id":"50bcfa8c-176f-4d5f-88e5-e1051eaa456e","x":3,"z":3},{"y":0,"can_rename":0,"color":"magenta","name":"Vee Oatatr","alignments":"unprobed","id":"fdd2e6da-7891-49a5-b6f3-4e8a0b0bac3c","x":3,"z":3},{"y":1,"can_rename":0,"color":"white","name":"Blio Egea","alignments":"unprobed","id":"60d3e059-dbda-4f8b-8f26-c9760e46a86a","x":3,"z":3},{"y":2,"can_rename":0,"color":"yellow","name":"Atcheusph","alignments":"unprobed","id":"d017ce23-baa1-4146-b8f5-7d12018c40e9","x":3,"z":3},{"y":3,"can_rename":0,"color":"white","name":"Rigil Kentaurus","alignments":"unprobed","id":"6fd5edcc-e02a-429c-a750-c5c4d74689b5","x":3,"z":3}],"status":{"empire":{"has_new_messages":0,"current_planet_id":"cdf0cadb-02b2-40ce-ad18-dd745ad2f991","planets":{"cdf0cadb-02b2-40ce-ad18-dd745ad2f991":{"waste":null,"name":"Oosn Lyirv-3","water":null,"image":"p6","happiness":null}},"name":"john","id":"0d5e0860-1415-4881-8dd5-d99d81578c6e","essentia":null,"happiness":null},"server":{"time":"12 01 2010 03:42:31 +0000"}}}}');
			this.fireEvent("onMapLoaded", o.result);
			*/
			this.locationId = Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id;
			if(this.locationId) {
				Lacuna.Pulser.Show();
				var loc = Game.EmpireData.planets[this.locationId];
				if(loc) {
					loc.x *= 1;
					loc.y *= 1;
					loc.z *= 1;
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
								this.fireEvent("onChangeToSystemView", tile.data);
							}
						}, "div.tile", this, true);
					}
					else {
						this._map.setZoomLevel(planet.z);
						//move to current planet
						map.setCenterTo(loc.x,loc.y);
					}
					
					this.MapVisible(true);
					Lacuna.Pulser.Hide();
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
			if(this._map) {
				this._map.reset();
			}
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
			
			if(data.alignments == "self" || data.alignments == "probed") {
				output.push('<button type="button">View</button>');
			}
			/*else if(data.alignments == "unprobed") {
				output.push('<button type="button">Send Probe</button>');
			}*/
			
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