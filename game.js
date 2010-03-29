YAHOO.namespace("lacuna");
/*
indexOf is a recent addition to the ECMA-262 standard; as such it may not be present in all browsers. You can work around this by inserting the 
following code at the beginning of your scripts, allowing use of indexOf in implementations which do not natively support it. This algorithm is 
exactly the one used in Firefox and SpiderMonkey.
*/
if (!Array.prototype.indexOf) {  
	Array.prototype.indexOf = function(elt /*, from*/) {  
		var len = this.length >>> 0;  

		var from = Number(arguments[1]) || 0;  
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);  
		if (from < 0)  
			from += len;  

		for (; from < len; from++) {  
			if (from in this && this[from] === elt)  
				return from;  
		}  
		return -1;  
	};  
} 

if (typeof YAHOO.lacuna.Game == "undefined" || !YAHOO.lacuna.Game) {
	
(function(){
	var Util = YAHOO.util,
		Lang = YAHOO.lang,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Lib = Lacuna.Library;
		
	var Game = {
		EmpireData : {},
		Services : {
			Body : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Body),
			Empire : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Empire),
			Inbox : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Inbox),
			Maps : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Map),
			Species : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Species),
			Stats : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Stats),
			Buildings : {
				Generic : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Buildings.Generic)
			}
		},
		Timeout : 20000,
		HourMS : 3600000, //(60min * 60sec * 1000ms),
		onTick : new Util.CustomEvent("onTick"),
		OverlayManager : new YAHOO.widget.OverlayManager(),
		
		Start : function() {
			var session = Cookie.getSub("lacuna","session");
			if(!session) {
				Lacuna.Game.DoLogin();
			}
			else {
				//Run rest of UI since we're logged in
				Lacuna.Game.GetFullStatus({
					success:Lacuna.Game.Run,
					failure:Lacuna.Game.Failure,
					scope:this
				});
			}
		},
		Failure : function(o){
			alert(o.error.message);
			if(o.error.code == 1006) {
				Lacuna.Game.DoLogin();
			}
		},
		DoLogin : function() {
			document.getElementById("content").innerHTML = "";
			if(!Lacuna.Game.LoginDialog) {
				Lacuna.Game.LoginDialog = new Lacuna.Login();
				Lacuna.Game.LoginDialog.subscribe("onLoginSuccessful",function(oArgs) {
					var now = new Date(),
						result = oArgs.result;
					//remember session
					Cookie.setSub("lacuna", "session", result.session_id, {
						domain: "lacunaexpanse.com",
						expires: now.setHours(now.getHours() + 1)
					});

					//store empire data
					Lacuna.Game.ProcessStatus(result.status);
					//Run rest of UI now that we're logged in
					Lacuna.Game.Run();
				});
			}
			Game.OverlayManager.hideAll();
			Lacuna.Game.LoginDialog.show();
			Lacuna.Menu.hide();
		},
		Run : function() {
			//create menus (or update if already created)
			Lacuna.Menu.create();
			//set our interval going for resource calcs
			Game.recTime = new Date();
			Game.recInt = setInterval(Game.Tick, 1000);
			//init event subscribtions if we need to
			Game.InitEvents();
			//init queue for refreshing data
			Game.InitQueue();
			Game.onTick.subscribe(Game.QueueProcess);
			//load the correct screen
			var locationId = Cookie.getSub("lacuna","locationId"),
				locationView = Cookie.getSub("lacuna","locationView");
			if(!locationId) {
				Lacuna.Menu.PlanetVisible();
				Lacuna.MapPlanet.Load(Game.EmpireData.home_planet_id);
			}
			else {
				switch(locationView) {
					case "system":
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapSystem.MapVisible(true);
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.Menu.SystemVisible();
						Lacuna.MapSystem.Load(locationId);
						break;
					case "planet":
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapPlanet.MapVisible(true);
						Lacuna.Menu.PlanetVisible();
						Lacuna.MapPlanet.Load(locationId);
						break;
					default:
						Lacuna.MapStar.MapVisible(true);
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.Menu.StarVisible();
						Lacuna.MapStar.Load();
						break;
				}
			}
		},
		InitEvents : function() {
			//make sure we only subscribe once
			if(!Lacuna.Game._hasRun) {
				//this will be called on the first load and create menu
				Lacuna.MapStar.subscribe("onMapLoaded", function(oResult){
					Lacuna.Game.ProcessStatus(oResult.status);
				});
				Lacuna.MapStar.subscribe("onMapLoadFailed", Lacuna.Game.Failure);
				Lacuna.MapStar.subscribe("onChangeToSystemView", function(starData) {
					Lacuna.MapStar.MapVisible(false);
					Lacuna.Menu.SystemVisible();
					Lacuna.MapSystem.Load(starData.id);
					YAHOO.log(starData, "info", "onChangeToSystemView");
					Game.SetLocation(starData.id, Lib.View.SYSTEM);
				});
				
				Lacuna.MapSystem.subscribe("onStatusUpdate", function(oStatus){
					Lacuna.Game.ProcessStatus(oStatus);
					Lacuna.Menu.updateTick();
				});
				Lacuna.MapSystem.subscribe("onChangeToPlanetView", function(planetId) {
					Lacuna.MapSystem.MapVisible(false);
					Lacuna.Menu.PlanetVisible();
					Lacuna.MapPlanet.Load(planetId);
					YAHOO.log(planetId, "info", "onChangeToPlanetView");
					Game.SetLocation(planetId, Lib.View.PLANET);
				});
				
				
				Lacuna.MapPlanet.subscribe("onMapRpc", function(oResult){
					Lacuna.Game.ProcessStatus(oResult.status);
				});
				Lacuna.MapPlanet.subscribe("onMapRpcFailed", Lacuna.Game.Failure);
				
				Lacuna.Menu.subscribe("onBackClick", function() {
					if(Lacuna.MapStar.IsVisible()) {
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapPlanet.MapVisible(true);
						Lacuna.Menu.PlanetVisible(true);
						//load planet with currently selected or home
						var ED = Lacuna.Game.EmpireData,
							planetId = ED.current_planet_id || ED.home_planet_id;
						Game.SetLocation(planetId, Lib.View.PLANET);
						Lacuna.MapPlanet.Load(planetId);
					}
					else if(Lacuna.MapSystem.IsVisible()) {
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapStar.MapVisible(true);
						Lacuna.Menu.StarVisible(true);
						//if map was already loaded locationId should exist so don't call load again
						Game.SetLocation("home", Lib.View.STAR);
						if(!Lacuna.MapStar.locationId) {
							Lacuna.MapStar.Load();
						}
					}
					else if(Lacuna.MapPlanet.IsVisible()) {
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.MapSystem.MapVisible(true);
						Lacuna.Menu.SystemVisible(true);
						//if map was already loaded locationId should exist so don't call load again
						if(Lacuna.MapSystem.locationId) {
							Game.SetLocation(Lacuna.MapSystem.locationId, Lib.View.SYSTEM);
						}
						else {
							//load system with planet body id if system hasn't been init'd yet
							Lacuna.MapSystem.Load(Lacuna.MapPlanet.locationId, true);
						}
					}
				});
				Lacuna.Menu.subscribe("onForwardClick", function() {
					if(Lacuna.MapStar.IsVisible()) {
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapSystem.MapVisible(true);
						Lacuna.Menu.SystemVisible(true);
						//if map was already loaded locationId should exist so don't call load again
						if(Lacuna.MapSystem.locationId) {
							Game.SetLocation(Lacuna.MapSystem.locationId, Lib.View.SYSTEM);
						}
						else {
							//load system with planet body id if system hasn't been init'd yet
							Lacuna.MapSystem.Load(Lacuna.MapStar.locationId, true);
						}
					}
					else if(Lacuna.MapSystem.IsVisible()) {
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapPlanet.MapVisible(true);
						Lacuna.Menu.PlanetVisible(true);
						//load planet with currently selected or home
						var ED = Lacuna.Game.EmpireData,
							planetId = ED.current_planet_id || ED.home_planet_id;
						Game.SetLocation(planetId, Lib.View.PLANET);
						Lacuna.MapPlanet.Load(planetId);
					}
					else if(Lacuna.MapPlanet.IsVisible()) {
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.MapStar.MapVisible(true);
						Lacuna.Menu.StarVisible(true);
						//if map was already loaded locationId should exist so don't call load again
						Game.SetLocation("home", Lib.View.STAR);
						if(!Lacuna.MapStar.locationId) {
							Lacuna.MapStar.Load();
						}
					}
				});
				Lacuna.Menu.subscribe("onInboxClick", function() {
					Game.OverlayManager.hideAll();
					Lacuna.Messaging.show();
				});
				
				Lacuna.Messaging.subscribe("onRpc", function(oResult){
					Lacuna.Game.ProcessStatus(oResult.status);
				});
				Lacuna.Messaging.subscribe("onRpcFailed", Lacuna.Game.Failure);
				
				Lacuna.Game._hasRun = true;
				
				Event.on(window, "resize", function (e) {
					//taken from YUI Overlay
					if (YAHOO.env.ua.ie) {
						if (!window.resizeEnd) {
							window.resizeEnd = -1;
						}

						clearTimeout(window.resizeEnd);

						window.resizeEnd = setTimeout(function () {
							Lacuna.Game.Resize(); 
						}, 100);
					} else {
						Lacuna.Game.Resize(); 
					}
				});
			}
		},
		InitQueue : function() {
			var BodyServ = Game.Services.Body,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					body_id: Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id
				};
			
			BodyServ.get_build_queue(data,{
				success : function(o){
					YAHOO.log(o, "info", "Game.InitQueue.success");
					Game.ProcessStatus(o.result);
					var q = o.result.build_queue;
					for(var bId in q) {
						if(q.hasOwnProperty(bId)) {
							Game.QueueAdd(bId, Lib.QueueTypes.PLANET, (q[bId].seconds_remaining * 1000));
						}
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "Game.InitQueue.failure");
					Game.Failure(o);
				},
				timeout:Game.Timeout
			});
		},
		
		ProcessStatus : function(status) {
			if(status && status.empire) {
				var now = new Date();
				//convert to numbers
				status.empire.has_new_messages *= 1;
				
				if(status.empire.happiness) {
					status.empire.happiness *= 1;
					status.empire.happiness_hour *= 1;
				}
				
				for(var pKey in status.empire.planets) {
					if(status.empire.planets.hasOwnProperty(pKey)){
						var planet = status.empire.planets[pKey];
						planet.energy_capacity *= 1;
						planet.energy_hour *= 1;
						planet.energy_stored *= 1;
						planet.food_capacity *= 1;
						planet.food_hour *= 1;
						planet.food_stored *= 1;
						planet.happiness *= 1;
						planet.happiness_hour *= 1;
						planet.ore_capacity *= 1;
						planet.ore_hour *= 1;
						planet.ore_stored *= 1;
						planet.waste_capacity *= 1;
						planet.waste_hour *= 1;
						planet.waste_stored *= 1;
						planet.water_capacity *= 1;
						planet.water_hour *= 1;
						planet.water_stored *= 1;
					}
				}
				
				//add everything from status empire to game empire
				Lang.augmentObject(Lacuna.Game.EmpireData, status.empire, true);

				if(status.empire.planets) {
					Lacuna.Menu.update();
				}
				else {
					Lacuna.Menu.updateTick();
				}
				
				if(status.empire.full_status_update_required == 1) {
					Lacuna.Game.GetFullStatus();
				}
			}
		},	
		GetFullStatus : function(callback) {
			var EmpireServ = Game.Services.Empire,
				session = Cookie.getSub("lacuna","session");
			EmpireServ.get_full_status({session_id:session}, {
				success : function(o) {
					Lacuna.Game.ProcessStatus(o.result);
					if(callback && callback.success) {
						callback.success.call(this);
					}
				},
				failure : function(o) {
					if(callback && callback.failure) {
						callback.failure.call(this, o);
					}
					else {
						YAHOO.log(o, "error", "Game.GetFullStatus.failure");
					}
				},
				timeout:Game.Timeout,
				scope:callback && callback.scope || this
			});
		},
		GetSize : function() {
			var content = document.getElementById("content"),
				width = content.offsetWidth,
				height = document.documentElement.clientHeight - document.getElementById("header").offsetHeight - document.getElementById("footer").offsetHeight;
			return {w:width,h:height};
		},
		Resize : function() {
			if(Lacuna.MapStar.IsVisible()) {
				Lacuna.MapStar.Resize();
			}
			else if(Lacuna.MapPlanet.IsVisible()) {
				Lacuna.MapPlanet.Resize();
			}
		},
		
		Logout : function() {
			var EmpireServ = Lacuna.Game.Services.Empire,
				session = Cookie.getSub("lacuna","session");
				
			clearTimeout(Lacuna.Game.recInt);
			
			EmpireServ.logout({session_id:session},{
				success : function(o){
					YAHOO.log(o);
			
					Cookie.remove("lacuna",{
						domain: "lacunaexpanse.com"
					});
					
					Lacuna.MapStar.Reset();
					Lacuna.MapSystem.Reset();
					Lacuna.MapPlanet.Reset();
					//document.getElementById("content").innerHTML = "";
					Lacuna.Game.DoLogin();
				},
				failure : function(o){
					YAHOO.log(["LOGOUT FAILED: ", o]);
				},
				timeout:Game.Timeout
			});
		},
		
		//Cookie helpers functions
		SetLocation : function(id, view) {
			Cookie.setSub("lacuna","locationId", id,{
				domain: "lacunaexpanse.com"
			});
			Cookie.setSub("lacuna","locationView", view,{
				domain: "lacunaexpanse.com"
			});
		},
		
		//Tick related
		Tick : function() {
			var ED = Lacuna.Game.EmpireData,
				dt = new Date(),
				diff = dt - Lacuna.Game.recTime,
				ratio = (diff / Lacuna.Game.HourMS),
				updateMenu = true,
				totalWasteOverage = 0;
				
			Lacuna.Game.recTime = dt;
			
		
			for(var pKey in ED.planets) {
				if(ED.planets.hasOwnProperty(pKey)){
					var planet = ED.planets[pKey];
					if(planet.energy_stored < planet.energy_capacity){
						planet.energy_stored += planet.energy_hour * ratio;
						if(planet.energy_stored > planet.energy_capacity) {
							planet.energy_stored = planet.energy_capacity;
						}
					}
					if(planet.food_stored < planet.food_capacity){
						planet.food_stored += planet.food_hour * ratio;
						if(planet.food_stored > planet.food_capacity) {
							planet.food_stored = planet.food_capacity;
						}
					}
					if(planet.ore_stored < planet.ore_capacity){
						planet.ore_stored += planet.ore_hour * ratio;
						if(planet.ore_stored > planet.ore_capacity) {
							planet.ore_stored = planet.ore_capacity;
						}
					}
					if(planet.water_stored < planet.water_capacity){
						planet.water_stored += planet.water_hour * ratio;
						if(planet.water_stored > planet.water_capacity) {
							planet.water_stored = planet.water_capacity;
						}
					}
					
					var wasteOverage = 0;
					if(planet.waste_stored < planet.waste_capacity){
						planet.waste_stored += planet.waste_hour * ratio;
						if(planet.waste_stored > planet.waste_capacity) {
							planet.waste_stored = planet.waste_capacity;
							wasteOverage = (planet.waste_stored - planet.waste_capacity) * ratio;
						}
					}
					else {
						wasteOverage = planet.waste_hour * ratio;
					}
					
					planet.happiness += (planet.happiness_hour * ratio) - wasteOverage;
					if(planet.happiness < 0) {
						planet.happiness = 0;
					}
					
					totalWasteOverage += wasteOverage;
				}
			}
			
			ED.happiness += (ED.happiness_hour * ratio) - totalWasteOverage;
			if(ED.happiness < 0) {
				ED.happiness = 0;
			}
			
			//YAHOO.log([diff, ratio]);
			if(updateMenu) {
				Lacuna.Menu.updateTick();
			}
			
			Game.onTick.fire(diff);
			//Lacuna.Game.QueueProcess(diff);
		},
		QueueAdd : function(id, type, ms) {
			if(!id || !type || !ms) {
				return;
			}
			
			if(!Game.queue) {
				Game.queue = {};
			}
			if(!Game.queue[type]) {
				Game.queue[type] = {};
			}
			Game.queue[type][id] = ms;
		},
		QueueProcess : function(e, oArgs) {
			//only do anything if the queue actually has data
			if(Game.queue) {
				var toFire = {},
					tickMS = oArgs[0];
				for(var type in Game.queue) {
					if(Game.queue.hasOwnProperty(type)) {
						var qt = Game.queue[type];
						for(var id in qt) {
							if(qt.hasOwnProperty(id)) {
								var ms = qt[id] - tickMS;
								if(ms <= 0) {
									toFire[id] = type;
								}
								else {
									qt[id] = ms;
									Game.QueueTick(type, id, ms);
								}
							}
						}
					}
				}
				
				var fId;
				for(fId in toFire) {
					if(toFire.hasOwnProperty(fId)) {
						delete Game.queue[toFire[fId]][fId];
						Game.QueueFire(toFire[fId], fId);
					}
				}
			
			}
		},
		QueueTick : function(type, id, ms) {
			switch(type) {
				case Lib.QueueTypes.PLANET:
					Lacuna.MapPlanet.QueueTick(id, ms);
					break;
				case Lib.QueueTypes.STAR:
					break;
				case Lib.QueueTypes.SYSTEM:
					break;
				default:
					break;
			}
		},
		QueueFire : function(type, id) {
			switch(type) {
				case Lib.QueueTypes.PLANET:
					Lacuna.MapPlanet.ReLoadTile(id);
					break;
				case Lib.QueueTypes.STAR:
					break;
				case Lib.QueueTypes.SYSTEM:
					break;
				default:
					break;
			}
		}
	};
	
	YAHOO.lacuna.Game = Game;
})();
YAHOO.register("game", YAHOO.lacuna.Game, {version: "1", build: "0"}); 

}