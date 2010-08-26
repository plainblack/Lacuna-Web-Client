YAHOO.namespace("lacuna");
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
		ServerData : {},
		Services : {},
		Timeout : 30000,
		HourMS : 3600000, //(60min * 60sec * 1000ms),
		onTick : new Util.CustomEvent("onTick"),
		OverlayManager : new YAHOO.widget.OverlayManager(),
		
		Start : function() {
			Game.domain = window.location.host || "lacunaexpanse.com";
			if(!Lacuna.Pulser) {
				Lacuna.Pulser = new Lacuna.Pulse();
			}
			Lacuna.Pulser.Show();
			
			Game.Services = Game.InitServices(YAHOO.lacuna.SMD.Services);
			
			var query = {};
			var vars = window.location.hash.substring(1).split('&');
			if (vars.length > 0) {
				for (var i=0; i<vars.length; i++) {
					var pair = vars[i].split("=");
					query[pair[0]] = pair[1];
				}
			}

			var session = Game.GetSession();
			if (query.facebook_uid) {
				// window.location.hash = '';
				Game.InitLogin();
				Game.LoginDialog.initEmpire();
				Game.EmpireCreator.createFacebook(query.facebook_uid, query.facebook_token, query.facebook_name);
				return;
			}
			else if (query.session_id) {
				window.location.hash = '';
				Game.SetCookie("session", query.session_id);
				Game.GetStatus({
					success:Lacuna.Game.Run,
					failure:Lacuna.Game.Failure
				});
			}
			else if (!session) {
				Game.DoLogin();
				return;
			}
			//Run rest of UI since we're logged in
			Game.GetStatus({
				success:Lacuna.Game.Run,
				failure:Lacuna.Game.Failure
			});
		},
		Failure : function(o){
			YAHOO.log(o, "debug", "Game.Failure");
			if(o.error.code == 1006) {
				Game.Reset();
				Game.DoLogin(o.error);
			}
			else if(o.error.message != "Internal error.") {
				alert(o.error.message);
			}
		},
		InitLogin : function(error) {
			if(!Lacuna.Game.LoginDialog) {
				Lacuna.Game.LoginDialog = new Lacuna.Login();
				Lacuna.Game.LoginDialog.subscribe("onLoginSuccessful",function(oArgs) {
					var result = oArgs.result;
					//remember session
					Game.SetCookie("session", result.session_id);

					Game.RemoveCookie("locationId");
					Game.RemoveCookie("locationView");
					//store empire data
					Lacuna.Game.ProcessStatus(result.status);
					//Run rest of UI now that we're logged in
					Lacuna.Game.Run();
				});
			}
		},
		DoLogin : function(error) {
			Dom.setStyle(document.body, 'background', 'url("'+Lib.AssetUrl+'star_system/field.png") repeat scroll 0 0 black');
			this.InitLogin();
			Game.OverlayManager.hideAll();
			Lacuna.Game.LoginDialog.show(error);
			Lacuna.Menu.hide();
			Lacuna.Pulser.Hide();
		},
		Run : function() {
			//create menus (or update if already created)
			Lacuna.Menu.create();
			//set our interval going for resource calcs since Logout clears it
			Game.recTime = (new Date()).getTime();
			Game.recInt = setInterval(Game.Tick, 1000);
			/* possible new pattern for game loop
			(function GameLoop(){
				Game.Tick()
				setTimeout(GameLoop, 1000);
			})();*/
			//init event subscribtions if we need to
			Game.InitEvents();
			//load the correct screen
			var locationId = Cookie.getSub("lacuna","locationId"),
				locationView = Cookie.getSub("lacuna","locationView");
			if(!locationId) {
				Lacuna.Menu.PlanetVisible();
				Lacuna.MapPlanet.Load(Game.EmpireData.current_planet_id || Game.EmpireData.home_planet_id);
			}
			else if(locationView == "planet") {
				Game.EmpireData.current_planet_id = locationId;
				Lacuna.MapStar.MapVisible(false);
				Lacuna.MapPlanet.MapVisible(true);
				Lacuna.Menu.PlanetVisible();
				Lacuna.MapPlanet.Load(locationId);
			}
			else {
				Lacuna.MapStar.MapVisible(true);
				Lacuna.MapPlanet.MapVisible(false);
				Lacuna.Menu.StarVisible();
				Lacuna.MapStar.Load();
			}
			Lacuna.Pulser.Hide();
		},
		InitEvents : function() {
			//make sure we only subscribe once
			if(!Lacuna.Game._hasRun) {
				//only subscribe once.
				Game.onTick.subscribe(Game.QueueProcess);
				//this will be called on the first load and create menu
				Lacuna.MapStar.subscribe("onMapLoaded", function(oResult){
					Lacuna.Game.ProcessStatus(oResult.status);
				});
				Lacuna.MapStar.subscribe("onMapLoadFailed", Lacuna.Game.Failure);
				Lacuna.MapStar.subscribe("onChangeToPlanetView", Game.onChangeToPlanetView);
								
				Lacuna.MapPlanet.subscribe("onMapRpc", Game.onRpc);
				Lacuna.MapPlanet.subscribe("onMapRpcFailed", Lacuna.Game.Failure);
				
				Lacuna.Menu.subscribe("onChangeClick", Game.onChangeClick);
				Lacuna.Menu.subscribe("onInboxClick", function() {
					Game.OverlayManager.hideAll();
					Lacuna.Messaging.show();
				});
				Lacuna.Menu.subscribe("onDestructClick", Game.onDestructClick);
				
				Lacuna.Messaging.subscribe("onRpc", Game.onRpc);
				Lacuna.Messaging.subscribe("onRpcFailed", Lacuna.Game.Failure);
				
				Lacuna.Essentia.subscribe("onRpc", Game.onRpc);
				Lacuna.Essentia.subscribe("onRpcFailed", Lacuna.Game.Failure);
				
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
		InitServices : function(smd) {
			var serviceOut = {};
			for(var sKey in smd) {
				if(smd.hasOwnProperty(sKey)) {
					var oSmd = smd[sKey];
					if(oSmd.services) {
						serviceOut[sKey] = new YAHOO.rpc.Service(oSmd);
					}
					else {
						serviceOut[sKey] = Game.InitServices(oSmd);
					}
				}
			}
			return serviceOut;
		},
		
		onChangeToPlanetView : function(planetId) {
			YAHOO.log(planetId, "info", "onChangeToPlanetView");
			Game.PlanetJump(Game.EmpireData.planets[planetId]);
			/*
			var cp = Game.EmpireData.planets[planetId];
			if(cp) {
				Game.EmpireData.current_planet_id = cp.id;
				Lacuna.Menu.PlanetMenu.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
				Game.SetLocation(planetId, Lib.View.PLANET);
			}
			
			Lacuna.MapStar.MapVisible(false);
			Lacuna.Menu.PlanetVisible();
			Lacuna.MapPlanet.Load(planetId);
			*/
		},
		onRpc : function(oResult){
			Lacuna.Game.ProcessStatus(oResult.status);
		},
		onChangeClick : function() {
			YAHOO.log("onChangeClick", "debug", "Game");
			Game.OverlayManager.hideAll();
			if(Lacuna.MapStar.IsVisible() || Lacuna.Menu.IsStarVisible()) {
				Lacuna.MapStar.MapVisible(false);
				Lacuna.MapPlanet.MapVisible(true);
				Lacuna.Menu.PlanetVisible();
				//load planet with currently selected or home
				var ED = Lacuna.Game.EmpireData,
					planetId = ED.current_planet_id || ED.home_planet_id;
				Game.SetLocation(planetId, Lib.View.PLANET);
				Lacuna.MapPlanet.Load(planetId);
			}
			else if(Lacuna.MapPlanet.IsVisible() || Lacuna.Menu.IsPlanetVisible()) {
				Lacuna.MapPlanet.MapVisible(false);
				Lacuna.MapStar.MapVisible(true);
				Lacuna.Menu.StarVisible();
				//if map was already loaded locationId should exist so don't call load again
				//Game.SetLocation("home", Lib.View.STAR);
				if(!Lacuna.MapStar.locationId) {
					Lacuna.MapStar.Load();
				}
			}
		},
		onDestructClick : function() {
			YAHOO.log("onDestructClick", "debug", "Game");

			Lacuna.Pulser.Show();	
			var ED = Game.EmpireData,
				EmpireServ = Game.Services.Empire,
				session = Game.GetSession(),
				func;
			if(ED.self_destruct_active*1 === 1) {
				func = EmpireServ.disable_self_destruct;
			}
			else {
				func = EmpireServ.enable_self_destruct;
			}
			
			func({session_id:session},{
				success : function(o){
					Game.ProcessStatus(o.result.status);
					Lacuna.Pulser.Hide();
				},
				failure : function(o){
					YAHOO.log(["DESTRUCT FAILED: ", o]);
					Lacuna.Pulser.Hide();
					Game.Failure.call(this, o);
				},
				timeout:Game.Timeout
			});
		},
		
		ProcessStatus : function(status) {
			if(status) {
				var doMenuUpdate;
				
				if(status.server) {
					//add everything from status empire to game empire
					Lang.augmentObject(Game.ServerData, status.server, true);
					//calc time offset
					//var sDt = Lib.
				}
				if(status.empire) {
					//convert to numbers
					status.empire.has_new_messages *= 1;
					
					if(status.empire.happiness) {
						status.empire.happiness *= 1;
						status.empire.happiness_hour *= 1;
					}
					
					if(!Lacuna.Game.EmpireData.planets){
						Lacuna.Game.EmpireData.planets = {};
					}
					for(var pKey in status.empire.planets) {
						if(status.empire.planets.hasOwnProperty(pKey)){
							var ePlanet = Lacuna.Game.EmpireData.planets[pKey];
							if(!ePlanet) {
								Lacuna.Game.EmpireData.planets[pKey] = {
									id: pKey,
									name: status.empire.planets[pKey],
									star_name: "",
									image:"a1"
								};
							}
							else {
								Lacuna.Game.EmpireData.planets[pKey].name = status.empire.planets[pKey];
							}
							doMenuUpdate = true;
						}
					}
					delete status.empire.planets; //delete this so it doesn't overwrite the desired structure
					
					//add everything from status empire to game empire
					Lang.augmentObject(Lacuna.Game.EmpireData, status.empire, true);

					if(!doMenuUpdate) {
						Lacuna.Menu.updateTick();
					}
					
					/*if(status.empire.full_status_update_required == 1) {
						Lacuna.Game.GetStatus();
					}*/
				}
				if(status.body) {
					var planet = status.body,
						p = Game.EmpireData.planets[planet.id];
					
					if(p) {
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
						
						Lang.augmentObject(p, planet, true);
						
						doMenuUpdate = true;
					}
				
					if(planet.needs_surface_refresh && planet.needs_surface_refresh*1 === 1) {
						Lacuna.MapPlanet.Refresh();
					}
				}
				if(doMenuUpdate) {
					Lacuna.Menu.update();
				}
			}
		},	
		GetStatus : function(callback) {
			var EmpireServ = Game.Services.Empire,
				session = Game.GetSession();
			EmpireServ.get_status({session_id:session}, {
				success : function(o) {
					YAHOO.log(o, "info", "Game.GetStatus.success");
					Lacuna.Game.ProcessStatus(o.result);
					if(callback && callback.success) {
						callback.success.call(this);
					}
				},
				failure : function(o) {
					YAHOO.log(o, "error", "Game.GetStatus.failure");
					if(callback && callback.failure) {
						callback.failure.call(this, o);
					}
				},
				timeout:Game.Timeout,
				scope:callback && callback.scope || this
			});
		},
		GetSession : function(replace) {
			return Cookie.getSub("lacuna","session") || replace;
		},
		GetCurrentPlanet : function() {
			var ED = Game.EmpireData,
				id = ED.current_planet_id || ED.home_planet_id;
			return ED.planets[id];
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
		StarJump : function(star) {
			YAHOO.log(star, "debug", "StarJump");
			Game.OverlayManager.hideAll();
			Lacuna.MapPlanet.MapVisible(false);
			Lacuna.MapStar.MapVisible(true);
			Lacuna.Menu.StarVisible(true);
			Lacuna.MapStar.Jump(star.x*1, star.y*1);
		},
		PlanetJump : function(planet) {
			if(!planet) {
				//try to find home planet
				planet = Game.EmpireData.planets[Game.EmpireData.home_planet_id];
			}
			//make sure we have found a planet to look at
			if(planet) {
				Game.EmpireData.current_planet_id = planet.id;
				Lacuna.Menu.PlanetMenu.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', planet.image, '.png" class="menuPlanetThumb" />', planet.name].join('');
				Game.SetLocation(planet.id, Lib.View.PLANET);
			
				Lacuna.MapStar.MapVisible(false);
				Lacuna.Menu.PlanetVisible();
				Lacuna.MapPlanet.Load(planet.id);
			}
		},
		
		Logout : function() {
			Lacuna.Pulser.Show();
			
			var EmpireServ = Game.Services.Empire,
				session = Game.GetSession();
			
			EmpireServ.logout({session_id:session},{
				success : function(o){
					YAHOO.log(o);
					Game.Reset();
					Game.DoLogin();
					Lacuna.Pulser.Hide();
				},
				failure : function(o){
					YAHOO.log(["LOGOUT FAILED: ", o]);
					Lacuna.Pulser.Hide();
					Game.Failure.call(this, o);
				},
				timeout:Game.Timeout
			});
		},
		Reset : function() {
			clearInterval(Game.recInt);
	
			Cookie.remove("lacuna",{
				domain: Game.domain
			});
			Game.EmpireData = {};
			Lacuna.MapStar.Reset();
			Lacuna.MapPlanet.Reset();
		},
		
		//Cookie helpers functions
		SetCookie : function(key, value, expiresDate) {
			var opts = { domain: Game.domain };
			if(expiresDate) {
				opts.expires = expiresDate;
			}
			Cookie.setSub("lacuna", key, value, opts);
		},
		RemoveCookie : function(key) {
			Cookie.removeSub("lacuna", key, { domain: Game.domain });
		},
		RemoveAllCookies : function() {
			Cookie.remove("lacuna", { domain: Game.domain });
		},
		SetLocation : function(id, view) {
			Game.SetCookie("locationId", id);
			Game.SetCookie("locationView", view);
		},
		
		//Tick related
		Tick : function() {
			var ED = Lacuna.Game.EmpireData,
				dt = (new Date()).getTime(),
				diff = dt - Lacuna.Game.recTime;
			Lacuna.Game.recTime = dt;
			var ratio = (diff / Lacuna.Game.HourMS),
				updateMenu = true,
				totalWasteOverage = 0;
		
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
							wasteOverage = planet.waste_stored - planet.waste_capacity;
							planet.waste_stored = planet.waste_capacity;
						}
					}
					else {
						wasteOverage = planet.waste_hour * ratio;
					}
					
					planet.happiness += (planet.happiness_hour * ratio) - wasteOverage;
					if(planet.happiness < 0 && ED.is_isolationist == "1") {
						planet.happiness = 0;
					}
					
					totalWasteOverage += wasteOverage;
				}
			}
			
			ED.happiness += (ED.happiness_hour * ratio) - totalWasteOverage;
			if(ED.happiness < 0 && ED.is_isolationist == "1") {
				ED.happiness = 0;
			}
			
			//YAHOO.log([diff, ratio]);
			if(updateMenu) {
				Lacuna.Menu.updateTick();
			}
			
			Game.onTick.fire(diff);
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
			YAHOO.log(arguments, "debug", "Game.QueueFire");
			switch(type) {
				case Lib.QueueTypes.PLANET:
					Lacuna.MapPlanet.ReLoadTile(id);
					break;
				case Lib.QueueTypes.STAR:
					break;
				case Lib.QueueTypes.SYSTEM:
					break;
				default:
					YAHOO.log("type unknown", "debug", "Game.QueueFire");
					break;
			}
		},
		QueueResetPlanet : function() {
			if(Game.queue && Game.queue[Lib.QueueTypes.PLANET]) {
				var queue = Game.queue[Lib.QueueTypes.PLANET];
				for(var id in queue) {
					if(queue.hasOwnProperty(id)) {
						queue[id] = 0;
					}
				}
			}
		}
	};
	
	YAHOO.lacuna.Game = Game;
})();
YAHOO.register("game", YAHOO.lacuna.Game, {version: "1", build: "0"}); 

}
