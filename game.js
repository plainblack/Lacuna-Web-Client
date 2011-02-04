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
		Resources : {},
		ServerData : {},
		Services : {},
		Timeout : 30000,
		HourMS : 3600000, //(60min * 60sec * 1000ms),
		onTick : new Util.CustomEvent("onTick"),
		OverlayManager : new YAHOO.widget.OverlayManager(),

		Start : function(query) {
			var l = window.location;
			Game.RPCBase = window.lacuna_rpc_base_url || l.protocol + '//' + l.host + '/';
			Game.domain = l.hostname || "lacunaexpanse.com";

			var ie = YAHOO.env.ua.ie, // 7 or later
				opera = YAHOO.env.ua.opera, // 9.65 or later
				firefox = YAHOO.env.ua.gecko, // 1.9 = 3.0
				webkit = YAHOO.env.ua.webkit, // 523 = Safari 3
				oldBrowserOkay = Game.GetCookieSettings("oldBrowserOkay","0");
			if(oldBrowserOkay == 0 && (
					(ie > 0 && ie < 7) ||
					(opera > 0 && opera < 9.65) ||
					(firefox > 0 && firefox < 1.9) ||
					(webkit > 0 && webkit < 523)
				)) {
				if (confirm("Your browser is quite old and some game functions may not work properly. Are you certain you want to continue?")) {
					Game.SetCookieSettings("oldBrowserOkay", "1");
				}
				else {
					window.location = 'http://www.lacunaexpanse.com';
				}
			}
 
			if(!Lacuna.Pulser) {
				Lacuna.Pulser = new Lacuna.Pulse();
			}
			Lacuna.Pulser.Show();
			if (!query) {
				query = {};
			}
			
			//add overlay manager functionality
			Game.OverlayManager.hideAllBut = function(id) {
				var overlays = this.overlays,
					n = overlays.length,
					i;

				for (i = n - 1; i >= 0; i--) {
					if(overlays[i].id != id) {
						overlays[i].hide();
					}
				}
			};
			Game.escListener = new Util.KeyListener(document, { keys:27 }, { fn:Game.OverlayManager.hideAll, scope:Game.OverlayManager, correctScope:true } );
			
			//get resources right away since they don't depend on anything
			Game.GetResources();
			
			Game.Services = Game.InitServices(YAHOO.lacuna.SMD.Services);
			
			var session = Game.GetSession();
			if (query.referral) {
				//if they came from someelse
				var now = new Date();
				Cookie.set("lacunaReferral", query.referral, {
					domain: Game.domain,
					expires: new Date(now.setFullYear(now.getFullYear() + 1))
				});
			}
			
			if (query.reset_password) {
				Game.InitLogin();
				Game.LoginDialog.resetPassword(query.reset_password);
				return;
			}
			if (query.facebook_uid) {
				Game.InitLogin();
				Game.LoginDialog.initEmpireCreator();
				Game.EmpireCreator.facebookReturn(query.facebook_uid, query.facebook_token, query.facebook_name);
				return;
			}
			else if (query.session_id) {
				Game.SetSession(query.session_id);
			}
			else if (query.empire_id) {
				Game.InitLogin();
				Game.LoginDialog.initEmpireCreator();
				Game.SpeciesCreator.show(query.empire_id);
				return;
			}
			else if (!session) {
				Game.DoLogin();
				return;
			}
			//Run rest of UI since we're logged in
			Game.GetStatus({
				success:Game.Run,
				failure:function(o){
					if (o.error.code == 1002) {
						Game.Reset();
						Game.DoLogin(o.error);
					}
					else {
						Game.Failure(o);
					}
				}
			});
		},
		Failure : function(o){
			YAHOO.log(o, "debug", "Game.Failure");
			if(o.error.code == 1006) {
				Game.Reset();
				Game.DoLogin(o.error);
			}
			else if(o.error.code == 1200) {
				alert(o.error.message);
				Game.Reset();
				window.location = o.error.data;
			}
			else if(o.error.message != "Internal error.") {
				alert(o.error.message);
			}
			else {
				var container = document.createElement('div');
				container.id = 'internalErrorMessage';
				document.body.insertBefore(container, document.body.firstChild);
				var internalError = new YAHOO.widget.SimpleDialog(container, {
					width: "500px",
					fixedcenter: true,
					visible: false,
					draggable: false,
					text: ['An internal error has occurred.  Please report this on <a target="_blank" href="http://community.lacunaexpanse.com/forums/support">the support forums</a>, and include the data below.',
						'<textarea style="width: 100%; height: 300px;" id="internalErrorMessageText" readonly="readonly" onclick="this.select()"></textarea>'
						].join(''),
					constraintoviewport: true,
					modal: true,
					close: false,
					zindex: 20000,
					buttons: [
						{ text:"Close", handler:function() { this.hide(); } }
					]
				});
				internalError.renderEvent.subscribe(function() {
					Dom.get('internalErrorMessageText').value = o.error.data;
					this.show();
				});
				internalError.hideEvent.subscribe(function() {
					setTimeout(function(){
						internalError.destroy();
					},1);
				});
				internalError.render();
			}
		},
		InitLogin : function(error) {
			if(!Lacuna.Game.LoginDialog) {
				Lacuna.Game.LoginDialog = new Lacuna.Login();
				Lacuna.Game.LoginDialog.subscribe("onLoginSuccessful",function(oArgs) {
					var result = oArgs.result;
					//remember session
					Game.SetSession(result.session_id);

					Game.RemoveCookie("locationId");
					Game.RemoveCookie("locationView");
					
					//store empire data
					Lacuna.Game.ProcessStatus(result.status);
					//Run rest of UI now that we're logged in
					Lacuna.Game.Run();
					if (result.welcome_message_id) {
						var container = document.createElement('div');
						container.id = 'welcomeMessage';
						Dom.setStyle(container, "text-align", "justify");
						document.body.insertBefore(container, document.body.firstChild);
						var welcome = new YAHOO.widget.SimpleDialog(container, {
							width: "400px",
							fixedcenter: true,
							visible: false,
							draggable: false,
							text: ['Welcome to the Lacuna Expanse.  It is recommended that you play through the in game tutorial to familiarize yourself with the game, and to get some free resources to build up your empire.',
								'<p style="margin:10px 0;">If you choose to skip the tutorial now you may find it by clicking <img src="',Lib.AssetUrl,'ui/s/inbox.png" title="Inbox" style="width:19px;height:22px;vertical-align:middle;margin:-5px 0 -4px -2px" /> in the upper left of the interface and find the message with the subject `Welcome`.</p>',
								'<p style="margin:10px 0;">For some extra help, look to the upper right of the interface for the <img src="',Lib.AssetUrl,'ui/s/tutorial.png" title="Interface Tutorial" style="width:19px;height:22px;vertical-align:middle;margin-left:-3px" /> button.</p>',
								'<p style="margin:10px 0;">Thanks for playing!</p>'].join(''),
							constraintoviewport: true,
							modal: true,
							close: false,
							zindex: 20000,
							buttons: [
								{ text:"View Tutorial", handler:function() {
									this.hide();
									Lacuna.Messaging.showMessage(result.welcome_message_id);
								}, isDefault:true },
								{ text:"Skip Tutorial",  handler:function() {
									this.hide();
								} } ]
						});
						welcome.renderEvent.subscribe(function() {
							this.show();
						});
						welcome.hideEvent.subscribe(function() {
							//let the current process complete before destroying
							setTimeout(function(){
								welcome.destroy();
							},1);
						});

						//don't register because showing the inbox will hide this //Game.OverlayManager.register(welcome);
						welcome.render();
					}
					else {
						Game.RemoveCookieSettings("showTips");
						var showTips = 1 - Game.GetCookieSettings("hideTips", "0");
						if(showTips == "1") {
							var maxTips = Game.Resources.tips.length - 1;
							var tipNum = Game.GetCookieSettings("tipNum", -1);
							var container = document.createElement('div');
							container.id = 'tipsMessage';
							Dom.setStyle(container, "text-align", "justify");
							document.body.insertBefore(container, document.body.firstChild);
							var nextTipNum = function(tipNum) {
									tipNum++;
									if(tipNum > maxTips) { tipNum = 0; }
									return tipNum;
								},
								showTip = function(tipNum) {
									var tip = Game.Resources.tips[tipNum];
									Dom.get('tipsTip').innerHTML = tip;
									Game.SetCookieSettings("tipNum", nextTipNum(tipNum));
								},
								nextTip = function(tipNum) {
									tipNum = nextTipNum(tipNum);
									showTip(tipNum);
									return tipNum;
								},
								prevTip = function(tipNum) {
									tipNum--
									if(tipNum < 0) { tipNum = maxTips; }
									showTip(tipNum);
									return tipNum;
								}
								tips = new YAHOO.widget.SimpleDialog(container, {
									width: "400px",
									fixedcenter: true,
									visible: false,
									draggable: false,
									text: [
										'<p style="font-weight:bold;">Tips</p>',
										'<p id="tipsTip" style="margin:10px 0;"></p>',
										'<p><input id="showTips" type="checkbox" checked />Show tips at login</p>'
									].join(''),
									constraintoviewport: true,
									modal: true,
									close: false,
									zindex: 20000,
									buttons: [
										{ text:"< Previous", handler:function() {
											tipNum = prevTip(tipNum);
										} },
										{ text:"Next >", handler:function() {
											tipNum = nextTip(tipNum);
										} },
										{ text:"Close", handler:function() {
											this.hide();
										}, isDefault:true }
									]
								});
							tips.renderEvent.subscribe(function() {
								showTip(tipNum);
								this.show();
								Event.on(Dom.get('showTips'),"change",function() {
									// set hide to the reverse of show
									if(Dom.get("showTips").checked) {
										Game.RemoveCookieSettings("hideTips");
									}
									else {
										Game.SetCookieSettings("hideTips", "1");
									}
								});
							});
							tips.hideEvent.subscribe(function() {
								//let the current process complete before destroying
								setTimeout(function(){
									tips.destroy();
								},1);
							});

							//don't register because showing the inbox will hide this //Game.OverlayManager.register(welcome);
							tips.render();
						}
					}
				});
			}
		},
		DoLogin : function(error) {
			Dom.setStyle(document.body, 'background', 'url("'+Lib.AssetUrl+'star_system/field.png") repeat scroll 0 0 black');
			this.InitLogin();
			//Game.OverlayManager.hideAll(); //don't need this.  the show already hides everything if it needs to
			Lacuna.Game.LoginDialog.show(error);
			Lacuna.Menu.hide();
			Lacuna.Pulser.Hide();
		},
		Run : function() {
			//create menus (or update if already created)
			Lacuna.Menu.create();
			//set our interval going for resource calcs since Logout clears it
			Game.recTime = (new Date()).getTime();
			Game.isRunning = 1;
			//Game.recInt = setInterval(Game.Tick, 1000);
			/* possible new pattern for game loop*/
			(function GameLoop(){
				if(Game.isRunning) {
					Game.Tick();
					setTimeout(GameLoop, 1000);
				}
			})();
			//chat system
			Game.InitChat();
			//init event subscribtions if we need to
			Game.InitEvents();
			//enable esc handler
			Game.escListener.enable();
			//load the correct screen
			var locationId = Game.GetCookie("locationId"),
				locationView = Game.GetCookie("locationView");
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
		InitChat : function() {
			Game.Services.Chat.get_commands({session_id:Game.GetSession()},{
				success : function(o){
					Game.chatLogout = o.result.logout_command;
					if(window.env_executeCommand) {
						YAHOO.log(o, "debug", "Chat.get_commands.success");
						window.env_executeCommand(o.result.login_command);
					}
				},
				failure : function(o){
					YAHOO.log(o, "debug", "Chat.get_commands.failure");
				}
			});
		},
		InitEvents : function() {
			//make sure we only subscribe once
			if(!Lacuna.Game._hasRun) {
				//only subscribe once.
				//Game.onTick.subscribe(Game.QueueProcess);
				//this will be called on the first load and create menu
				Lacuna.MapStar.subscribe("onMapRpc", Game.onRpc);
				Lacuna.MapStar.subscribe("onMapRpcFailed", Game.Failure);
				Lacuna.MapStar.subscribe("onChangeToPlanetView", Game.onChangeToPlanetView);
								
				Lacuna.MapPlanet.subscribe("onMapRpc", Game.onRpc);
				Lacuna.MapPlanet.subscribe("onMapRpcFailed", Game.Failure);
				
				Lacuna.Menu.subscribe("onChangeClick", Game.onChangeClick);
				Lacuna.Menu.subscribe("onInboxClick", function() {
					Game.OverlayManager.hideAll();
					Lacuna.Messaging.show();
				});
				Lacuna.Menu.subscribe("onDestructClick", Game.onDestructClick);
				
				Lacuna.Messaging.subscribe("onRpc", Game.onRpc);
				Lacuna.Messaging.subscribe("onRpcFailed", Game.Failure);
				
				Lacuna.Essentia.subscribe("onRpc", Game.onRpc);
				Lacuna.Essentia.subscribe("onRpcFailed", Game.Failure);
				
				Lacuna.Invite.subscribe("onRpc", Game.onRpc);
				Lacuna.Invite.subscribe("onRpcFailed", Game.Failure);
				
				Lacuna.Profile.subscribe("onRpc", Game.onRpc);
				Lacuna.Profile.subscribe("onRpcFailed", Game.Failure);
				
				Game._hasRun = true;
				
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
						serviceOut[sKey] = new YAHOO.rpc.Service(oSmd, undefined, Game.RPCBase);
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
				Game.PlanetJump(Game.GetCurrentPlanet());
				/*
				Lacuna.MapStar.MapVisible(false);
				Lacuna.MapPlanet.MapVisible(true);
				Lacuna.Menu.PlanetVisible();
				//load planet with currently selected or home
				var ED = Lacuna.Game.EmpireData,
					planetId = ED.current_planet_id || ED.home_planet_id;
				Game.SetLocation(planetId, Lib.View.PLANET);
				Lacuna.MapPlanet.Load(planetId);
				*/
			}
			else if(Lacuna.MapPlanet.IsVisible() || Lacuna.Menu.IsPlanetVisible()) {
				Lacuna.MapPlanet.MapVisible(false);
				Lacuna.MapStar.MapVisible(true);
				Lacuna.Menu.StarVisible();
				Lacuna.MapStar.Load();
			}
		},
		onDestructClick : function() {
			YAHOO.log("onDestructClick", "debug", "Game");

			var ED = Game.EmpireData,
				EmpireServ = Game.Services.Empire,
				session = Game.GetSession(),
				func;
			if(ED.self_destruct_active*1 === 1) {
				func = EmpireServ.disable_self_destruct;
			}
			else if (confirm("Are you certain you want to enable self destuct?  If enabled, your empire will be deleted after 24 hours.")) {
				func = EmpireServ.enable_self_destruct;
			}
			else {
				return;
			}
			
			Lacuna.Pulser.Show();
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
					Game.ServerData.time = Lib.parseServerDate(Game.ServerData.time);
					
					if(status.server.announcement) {
						Lacuna.Announce.show();
					}
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
					if(!Lacuna.Game.EmpireData.planetsByName){
						Lacuna.Game.EmpireData.planetsByName = {};
					}
					for(var pKey in status.empire.planets) {
						if(status.empire.planets.hasOwnProperty(pKey)){
							var ePlanet = Lacuna.Game.EmpireData.planets[pKey];
							if(!ePlanet) {
								Lacuna.Game.EmpireData.planets[pKey] = {
									id: pKey,
									name: status.empire.planets[pKey],
									star_name: "",
									image: undefined
								};
							}
							else {
								Lacuna.Game.EmpireData.planets[pKey].name = status.empire.planets[pKey];
							}
							Lacuna.Game.EmpireData.planetsByName[status.empire.planets[pKey]] = Lacuna.Game.EmpireData.planets[pKey];
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
					
					Lacuna.Notify.Load(planet);
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
			if (!this._session) {
				this._session = Game.GetCookie('session');
			}
			return this._session || replace;
		},
		SetSession : function(session) {
			if (session) {
				Game.SetCookie('session', session);
				Game._session = session;
			}
			else {
				Game.RemoveCookie('session');
				delete Game._session;
			}
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
			Lacuna.Menu.StarVisible();
			Lacuna.MapStar.Jump(star.x*1, star.y*1);
		},
		PlanetJump : function(planet) {
			if(!planet) {
				//try to find home planet
				planet = Game.EmpireData.planets[Game.EmpireData.home_planet_id];
			}
			//make sure we have found a planet to look at
			if(planet) {
				Game.OverlayManager.hideAll();
				Game.EmpireData.current_planet_id = planet.id;
				Lacuna.Menu.PlanetMenu.update();
				Game.SetLocation(planet.id, Lib.View.PLANET);
			
				Lacuna.MapStar.MapVisible(false);
				Lacuna.Menu.PlanetVisible();
				Lacuna.MapPlanet.Load(planet.id, true);
			}
		},

		GetResources : function() {
			Util.Connect.asyncRequest('GET', 'resources.json', {
				success: function(o) {
					YAHOO.log(o, "info", "GetResources.success");
					Lacuna.Pulser.Hide();
					try {
						Game.Resources = Lang.JSON.parse(o.responseText);
					}
					catch(ex) {
						YAHOO.log(ex);
					}
				}, 
				failure: function(o) {
					YAHOO.log(o, "error", "GetResources.failure");
				},
				scope: this
			});
		},
		GetBuildingDesc : function(url) {
			if(Game.Resources && Game.Resources.buildings) {
				var desc = Game.Resources.buildings[url];
				if(desc) {
					return [desc.description,' <a href="',desc.wiki,'" target="_blank">More Information on Wiki</a>'].join('');
				}
				else {
					return '';
				}
			}
		},
		GetShipDesc : function(type) {
			if(Game.Resources && Game.Resources.ships) {
				var desc = Game.Resources.ships[type];
				if(desc) {
					return [desc.description,' <a href="',desc.wiki,'" target="_blank">More Information on Wiki</a>'].join('');
				}
			}
		},
		GetContainerEffect : function(effect) {
			if(Game.GetCookieSettings("disableDialogAnim","0") == "1") {
				return;
			}
			else {
				return effect || {effect:YAHOO.widget.ContainerEffect.FADE,duration:0.5};
			}
		},
		
		Logout : function() {
			Lacuna.Pulser.Show();
			
			var EmpireServ = Game.Services.Empire,
				session = Game.GetSession();
			
			EmpireServ.logout({session_id:session},{
				success : function(o){
					YAHOO.log(o);
					//Dom.setStyle(Game._envolveContainer, "display", "none");
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
			//clearInterval(Game.recInt);
			delete Game.isRunning;
			//disable esc handler
			Game.escListener.disable();
			
			var logoutCommand = Game.chatLogout;
	
			Game.RemoveCookie("locationId");
			Game.RemoveCookie("locationView");
			
			Game.SetSession();
			Game.EmpireData = {};
			Lacuna.Stats.Reset();
			Lacuna.MapStar.Reset();
			Lacuna.MapPlanet.Reset();
			Lacuna.Notify.Hide();
			
			//do this last since we don't control the code
			if(logoutCommand && window.env_executeCommand) {
				YAHOO.log("Chat logout of session", "debug", "Reset");
				window.env_executeCommand(logoutCommand);
			}
		},

		//Cookie helpers functions
		GetCookie : function(key, defaultValue) {
			var chip = Cookie.getSub("lacuna",key);
			return chip || defaultValue;
		},
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

		//using a more permanent cookie
		GetCookieSettings : function(key, defaultValue) {
			var chip = Cookie.getSub("lacunaSettings",key);
			return chip || defaultValue;
		},
		SetCookieSettings : function(key, value) {
			var now = new Date(), 
				opts = { 
					domain: Game.domain,
					expires: new Date(now.setFullYear(now.getFullYear() + 1)) 
				};
			Cookie.setSub("lacunaSettings", key, value, opts);
		},
		RemoveCookieSettings : function(key) {
			Cookie.removeSub("lacunaSettings", key, { domain: Game.domain });
		},
		
		//Tick related
		Tick : function() {
			var ED = Lacuna.Game.EmpireData,
				SD = Lacuna.Game.ServerData,
				dt = (new Date()).getTime(),
				diff = dt - Lacuna.Game.recTime;
			Lacuna.Game.recTime = dt;
			SD.time = new Date(Lib.getTime(SD.time) + diff);

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
