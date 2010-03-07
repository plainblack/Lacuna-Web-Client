YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Game == "undefined" || !YAHOO.lacuna.Game) {
	
(function(){
	var Util = YAHOO.util,
		Lang = YAHOO.lang,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna;
		
	var Game = {
		AssetUrl : "http://localhost/lacuna/assets/",
		EmpireData : {},
		Styles : {
			HIDDEN : "hidden",
			ALERT : "alert"
		},
		Services : {
			Body : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Body),
			Empire : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Empire),
			Maps : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Map),
			Species : new YAHOO.rpc.Service(YAHOO.lacuna.SMD.Species)
		},
		ErrorCodes : {
			1000 : "Name not available",
			1001 : "Invalid password",
			1002 : "Object does not exist",
			1003 : "Too much information",
			1004 : "Password incorrect",
			1005 : "Contains invalid characters",
			1006 : "Authorization denied",
			1007 : "Overspend",
			1008 : "Underspend",
			1009 : "Invalid range"
		},
		View : {
			STAR : "star",
			SYSTEM : "system",
			PLANET : "planet"
		},
		Timeout : 10000,
		
		Start : function() {	
			var session = Cookie.getSub("lacuna","session");
			if(!session) {
				Lacuna.Game.DoLogin();
			}
			else {
				//Run rest of UI since we're logged in
				Lacuna.Game.GetFullStatus({
					success:Lacuna.Game.Run,
					scope:this
				});
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
			Lacuna.Game.LoginDialog.show();
			Lacuna.Menu.hide();
		},
		Run : function() {
			//create menus (or update if already created)
			Lacuna.Menu.create();			
			//make sure we only subscribe once
			if(!Lacuna.Game._hasRun) {
				//this will be called on the first load and create menu
				Lacuna.MapStar.subscribe("onMapLoaded", function(oResult){
					Lacuna.Game.ProcessStatus(oResult.status);
				});
				Lacuna.MapStar.subscribe("onMapLoadFailed", function(oError){
					alert(oError.message);
					if(oError.code == 1006) {
						Lacuna.Game.DoLogin();
					}
				});
				Lacuna.MapStar.subscribe("onChangeToSystemView", function(starData) {
					Lacuna.MapStar.MapVisible(false);
					Lacuna.Menu.SystemVisible();
					Lacuna.MapSystem.Load(starData.id);
					Cookie.setSub("lacuna","locationId", starData.id,{
						domain: "lacunaexpanse.com"
					});
					Cookie.setSub("lacuna","locationView", Game.View.SYSTEM,{
						domain: "lacunaexpanse.com"
					});
				});
				
				Lacuna.MapSystem.subscribe("onStatusUpdate", function(oStatus){
					Lacuna.Game.ProcessStatus(oStatus);
					Lacuna.Menu.update();
				});
				Lacuna.MapSystem.subscribe("onChangeToPlanetView", function(planetId) {
					Lacuna.MapSystem.MapVisible(false);
					Lacuna.Menu.PlanetVisible();
					Lacuna.MapPlanet.Load(planetId);
					Cookie.setSub("lacuna","locationId", planetId,{
						domain: "lacunaexpanse.com"
					});
					Cookie.setSub("lacuna","locationView", Game.View.PLANET,{
						domain: "lacunaexpanse.com"
					});
				});
				
				Lacuna.Menu.subscribe("onBackClick", function() {
					if(Lacuna.MapSystem.IsVisible()) {
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapStar.MapVisible(true);
						Lacuna.Menu.StarVisible(true);
						Cookie.setSub("lacuna","locationId", "home",{
							domain: "lacunaexpanse.com"
						});
						Cookie.setSub("lacuna","locationView", Game.View.STAR,{
							domain: "lacunaexpanse.com"
						});
					}
					else if(Lacuna.MapPlanet.IsVisible()) {
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.MapSystem.MapVisible(true);
						Lacuna.Menu.SystemVisible(true);
						Cookie.setSub("lacuna","locationId", Lacuna.MapSystem.locationId,{
							domain: "lacunaexpanse.com"
						});
						Cookie.setSub("lacuna","locationView", Game.View.SYSTEM,{
							domain: "lacunaexpanse.com"
						});
					}
				});
				
				Lacuna.Game._hasRun = true;
			}
			//load the correct screen
			var locationId = Cookie.getSub("lacuna","locationId"),
				locationView = Cookie.getSub("lacuna","locationView");
			if(!locationId) {
				Lacuna.MapStar.Load();
			}
			else {
				switch(locationView) {
					case "system":
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.Menu.SystemVisible();
						Lacuna.MapSystem.Load(locationId);
						break;
					case "planet":
						Lacuna.MapStar.MapVisible(false);
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.Menu.PlanetVisible();
						Lacuna.MapPlanet.Load(locationId);
						break;
					default:
						Lacuna.MapPlanet.MapVisible(false);
						Lacuna.MapSystem.MapVisible(false);
						Lacuna.MapStar.MapVisible(true);
						Lacuna.Menu.StarVisible(true);
						Lacuna.MapStar.Load();
						break;
				}
			}
		},
		ProcessStatus : function(status) {
			if(status && status.empire) {
				var now = new Date();
				//full status
				if(status.empire.home_planet_id) {
					//remember home planet
					Cookie.setSub("lacuna", "homePlanetId", status.empire.home_planet_id, {
						domain: "lacunaexpanse.com",
						expires: now.setHours(now.getHours() + 1)
					});
				}
				//add everything from status empire to game empire
				Lang.augmentObject(Lacuna.Game.EmpireData, status.empire, true);

				Lacuna.Menu.update();
				
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
					alert("failure");
					if(callback && callback.failure) {
						callback.failure.call(this);
					}
					else {
						YAHOO.log(o);
					}
				},
				timeout:Game.Timeout,
				scope:(callback.scope || this)
			});
		},
		
		Logout : function() {
			var EmpireServ = Lacuna.Game.Services.Empire,
				session = Cookie.getSub("lacuna","session");
				
			EmpireServ.logout({session_id:session},{
				success : function(o){
					YAHOO.log(o);
			
					Cookie.remove("lacuna",{
						domain: "lacunaexpanse.com"
					});
					
					document.getElementById("content").innerHTML = "";
					Lacuna.Game.DoLogin();
				},
				failure : function(o){
					YAHOO.log(["LOGOUT FAILED: ", o]);
				},
				timeout:Game.Timeout
			});
		}
	};
	
	YAHOO.lacuna.Game = Game;
})();
YAHOO.register("game", YAHOO.lacuna.Game, {version: "1", build: "0"}); 

}