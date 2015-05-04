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
        Timeout : 60000,
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

            //get resources right away since they don't depend on anything.
            Game.Resources = require('js/resources');
            Game.PreloadUI();

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
            try {
            Game.chatRef = new Firebase('https://lacunapt.firebaseio.com');
            Game.chat = new ChiselchatUI(Game.chatRef, document.getElementById("chiselchat-wrapper"));
            Game.chat.addCommand({
                match : /^\/wiki/,
                func : function(e) {
                    var msg=e.content.replace(/^\/wiki/, "");
                    msg = msg.trim();
                    if (msg.length) {
                        e.content = "http://community.lacunaexpanse.com/wiki?func=search&query="+msg;
                    }
                    else {
                        e.content = "http://community.lacunaexpanse.com/wiki";
                    }
                },
                name : "/wiki",
                help : "Quick link to the Lacuna Expanse wiki.",
                moderatorOnly : false
            });
            Game.chat.addCommand({
                match : /^\/planet$/,
                func : function(message, chatui) {
                    var body = Game.GetCurrentPlanet();
                    message.content = "My current planet is '"+body.name+"' at '"+body.x+"|"+body.y+"' in zone '"+body.zone+"'";
                },
                name : "/planet",
                help : "Show everyone where your current planet is.",
                moderatorOnly : false
            });
            } catch(err){} // no chat (e.g., private server)
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
                    Game.Reset();
                    Game.DoLogin(o.error);
                    return true;
                }
            });
        },
        Failure : function(o, retry, fail) {
            // session expired
            if(o.error.code == 1006) {
                Game.Reset();
                Game.DoLogin(o.error);
            }
            // Game over.
            else if(o.error.code == 1200) {
                alert(o.error.message);
                Game.Reset();
                window.location = o.error.data;
            }
            else if(o.error.code == 1016) {
                Lacuna.Captcha.show(retry, function(){ fail(true); });
            }
            // Internal error
            else if(o.error.code == -32603) {
                Game.QuickDialog({
                    width: "500px",
                    text: ['<p>An internal error has occurred.  Please report this on <a target="_blank" href="http://community.lacunaexpanse.com/forums/support">the support forums</a>, and include the data below.</p>',
                        '<textarea style="width: 100%; height: 300px;" id="internalErrorMessageText" readonly="readonly" onclick="this.select()"></textarea>'
                        ].join(''),
                    buttons: [
                        { text:"Close", handler:function() { this.hide(); } }
                    ]
                }, function() {
                    Dom.get('internalErrorMessageText').value = o.error.data;
                });
            }
            else {
                fail();
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

                    Game.InitChat();
                    Lacuna.Game.Run();
                    if (result.welcome_message_id) {
                        Game.QuickDialog({
                            width: "400px",
                            text: ['Welcome to the Lacuna Expanse.  It is recommended that you play through the in game tutorial to familiarize yourself with the game, and to get some free resources to build up your empire.',
                                '<p>If you choose to skip the tutorial now you may find it by clicking <img src="',Lib.AssetUrl,'ui/s/inbox.png" title="Inbox" style="width:19px;height:22px;vertical-align:middle;margin:-5px 0 -4px -2px" /> in the upper left of the interface and find the message with the subject `Welcome`.</p>',
                                '<p>For some extra help, look to the upper right of the interface for the <img src="',Lib.AssetUrl,'ui/s/tutorial.png" title="Interface Tutorial" style="width:19px;height:22px;vertical-align:middle;margin-left:-3px" /> button.</p>',
                                '<p>Thanks for playing!</p>'].join(''),
                            buttons: [
                                { text:"View Tutorial", handler:function() {
                                    this.hide();
                                    Lacuna.Messaging.showMessage(result.welcome_message_id);
                                }, isDefault:true },
                                { text:"Skip Tutorial",  handler:function() {
                                    this.hide();
                                } } ]
                        });
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
            Game.planetRefreshInterval = setInterval(function(){
                var BodyServ = Game.Services.Body,
                    session = Game.GetSession(),
                    body = Game.GetCurrentPlanet();
                BodyServ.get_status({session_id: session, body_id: body.id},{
                    success:Game.onRpc,
                    failure:function(o){return true;}
                });
            }, 10 * 60 * 1000);

            //chat system
//            Game.InitChat();
            //init event subscribtions if we need to
            Game.InitEvents();
            //enable esc handler
            Game.escListener.enable();

            document.title = 'Lacuna Expanse - ' + Game.EmpireData.name;

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
            Game.Services.Chat.init_chat({session_id: Game.GetSession()},{
                success : function(o) {
                    if (!Game.chat) { return true; }
                    var result = o.result;
                    Game.chat_auth = result.chat_auth;
                    Game.gravatar_url = result.gravatar_url;
                    Game.private_room = result.private_room;


                    Game.chatRef.authWithCustomToken(result.chat_auth, function(error) {
                        if (error) {
                            console.log("Chisel Chat login failed!", error);
                        }
                        else {
                            console.log("Chisel Chat login successful!");

                            try {
                                Game.chat.setUser({
                                    userId  :     result.status.empire.id,
      				    userName :    result.chat_name,
      				    isGuest :     false, // for now
      				    isModerator : result.isModerator,
      				    isStaff :     result.isStaff,
      				    avatarUri :   Game.gravatar_url,
                                    profileUri :  Game.gravatar_url
                                });
                            }
                            catch(err) {
                                 console.log("cannot setUser "+err);
                            }
                            if (Game.private_room) {
                                Game.chat._chat.enterRoom(Game.private_room.id, Game.private_room.name);
                            }
                        }
                    });
                },
                failure : function(o) {
                    console.log("Chisel Chat init_chat failure.");
                    return true;
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
                Lacuna.MapStar.subscribe("onChangeToPlanetView", Game.onChangeToPlanetView);

                Lacuna.MapPlanet.subscribe("onMapRpc", Game.onRpc);

                Lacuna.Menu.subscribe("onChangeClick", Game.onChangeClick);
                Lacuna.Menu.subscribe("onInboxClick", function() {
                    Game.OverlayManager.hideAll();
                    Lacuna.Messaging.show();
                });
                Lacuna.Menu.subscribe("onDestructClick", Game.onDestructClick);

                Lacuna.Messaging.subscribe("onRpc", Game.onRpc);

                Lacuna.Essentia.subscribe("onRpc", Game.onRpc);

                Lacuna.Invite.subscribe("onRpc", Game.onRpc);

                Lacuna.Profile.subscribe("onRpc", Game.onRpc);

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
            var successFunc = function(){
                for (var methodName in this) {
                    if (this.hasOwnProperty(methodName) && Lang.isFunction(this[methodName])) {
                        var method = this[methodName];
                        this[methodName] = Game.WrappedService(method, sKey+'.'+methodName);
                    }
                }
            };
            for(var sKey in smd) {
                if(smd.hasOwnProperty(sKey)) {
                    var oSmd = smd[sKey];
                    if(oSmd.services) {
                        serviceOut[sKey] = new YAHOO.rpc.Service(oSmd, {success:successFunc }, Game.RPCBase);
                    }
                    else {
                        serviceOut[sKey] = Game.InitServices(oSmd);
                    }
                }
            }
            return serviceOut;
        },
        WrappedService : function(method, name) {
            var logNS = 'Game.RPC.'+name+'.failure';
            var func = function(params, origOpts) {
                var retry = function(){
                    var opts = { retry : 0 };
                    YAHOO.lang.augmentObject(opts, origOpts, true);
                    opts.retry++;
                    func(params, opts);
                };
                var opts = {
                    failure : function(o) {
                        var self = this;
                        var failure = function(silent){
                            if(Lang.isFunction(origOpts.failure)) {
                                if (origOpts.failure.call(self, o)) {
                                    return;
                                }
                            }
                            if (! silent) {
                                alert(o.error.message);
                            }
                        };
                        YAHOO.log(o, "error", logNS);
                        Lacuna.Pulser.Hide();
                        Game.Failure(o, retry, failure);
                    }
                };
                YAHOO.lang.augmentObject(opts, origOpts);
                if (!('timeout' in opts)) {
                    opts.timeout = Game.Timeout;
                }
                method(params, opts);
            };
            return func;
        },
        InitTips : function() {
            if(!Game.Resources.tips && !Game.Resources.complete) {
                setTimeout(Game.InitTips, 10);
                return;
            }

            var showTips = 1 - Game.GetCookieSettings("hideTips", "0") * 1;
            if(showTips == 1) {
                var tipCount = Game.Resources.tips.length,
                    tipNum = Game.GetCookieSettings("tipNum", -1),
                    showTip = function(dialog, change) {
                        tipNum = (tipNum + change + tipCount) % tipCount;
                        var tip = Game.Resources.tips[tipNum];
                        dialog.setBody(tip);
                        Game.SetCookieSettings("tipNum", tipNum);
                    };
                Game.QuickDialog({
                    width: "400px",
                    buttons: [
                        { text:"< Previous", handler:function() { showTip(dialog, -1); } },
                        { text:"Next >", handler:function() { showTip(dialog, 1); } },
                        { text:"Close", handler:function() { this.hide(); }, isDefault:true }
                    ]
                }, function() {
                    this.setHeader('Tips');
                    showTip(this, 1);
                    var label = document.createElement('label');
                    Dom.setStyle(label, 'float', 'left');
                    label.innerHTML = '<input id="showTips" type="checkbox" checked="checked" /> Show tips at login';
                    this.footer.insertBefore(label, this.footer.firstChild);
                }, function() {
                    if(Dom.get('showTips').checked) {
                        Game.RemoveCookieSettings("hideTips");
                    }
                    else {
                        Game.SetCookieSettings("hideTips", "1");
                    }
                });
            }
        },
        PreloadUI : function() {
            var images = Lib.UIImages;
            for (var i = 0; i < images.length; i++) {
                var url = Lib.AssetUrl + images[i];
                var img = new Image();
                img.src = url;
            }
        },
        QuickDialog : function (config, afterRender, afterHide) {
            var container = document.createElement('div');
            if (config.id) {
                container.id = config.id;
                delete config.id;
            }
            YAHOO.lang.augmentObject(config, {
                fixedcenter: true,
                visible: false,
                draggable: false,
                constraintoviewport: true,
                modal: true,
                close: false,
                zindex: 20000
            });
            Dom.addClass(container, 'quick-dialog');
            document.body.insertBefore(container, document.body.firstChild);
            var dialog = new YAHOO.widget.SimpleDialog(container, config);
            dialog.renderEvent.subscribe(function() {
                if (afterRender) { afterRender.call(this); }
                this.show();
            });
            dialog.hideEvent.subscribe(function() {
                if (afterHide) { afterHide.call(this); }
                // let the current process complete before destroying
                setTimeout(function(){
                    dialog.destroy();
                },1);
            });
            dialog.render();
            Game.OverlayManager.register(dialog);
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
                    YAHOO.log(o, 'info', 'Game.onDestructClick.success');
                    Game.ProcessStatus(o.result.status);
                    Lacuna.Pulser.Hide();
                }
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
                    if(!Lacuna.Game.EmpireData.coloniesByName){
                        Lacuna.Game.EmpireData.coloniesByName = {};
                    }
                    if(!Lacuna.Game.EmpireData.stationsByName){
                        Lacuna.Game.EmpireData.stationsByName = {};
                    }
                    for(var pKey in status.empire.colonies) {
                        Lacuna.Game.EmpireData.coloniesByName[status.empire.colonies[pKey]] = pKey;
                    }
                    for(var pKey in status.empire.stations) {
                        Lacuna.Game.EmpireData.stationsByName[status.empire.stations[pKey]] = pKey;
                    }
                    for(var pKey in status.empire.planets) {
                        if(status.empire.planets.hasOwnProperty(pKey)){
                            var ePlanet = Lacuna.Game.EmpireData.planets[pKey];
                            if(!ePlanet) {
                                Lacuna.Game.EmpireData.planets[pKey] = {
                                    id: pKey,
                                    name: status.empire.planets[pKey],
                                    star_name: "",
                                    image: undefined,
                                    energy_capacity: 0,
                                    energy_hour: 0,
                                    energy_stored: 0,
                                    food_capacity: 0,
                                    food_hour: 0,
                                    food_stored: 0,
                                    happiness: 0,
                                    happiness_hour: 0,
                                    ore_capacity: 0,
                                    ore_hour: 0,
                                    ore_stored: 0,
                                    waste_capacity: 0,
                                    waste_hour: 0,
                                    waste_stored: 0,
                                    water_capacity: 0,
                                    water_hour: 0,
                                    water_stored: 0
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
                        Lang.augmentObject(p, planet, true);

                        p.energy_capacity *= 1;
                        p.energy_hour *= 1;
                        p.energy_stored *= 1;
                        p.food_capacity *= 1;
                        p.food_hour *= 1;
                        p.food_stored *= 1;
                        p.happiness *= 1;
                        p.happiness_hour *= 1;
                        p.ore_capacity *= 1;
                        p.ore_hour *= 1;
                        p.ore_stored *= 1;
                        p.waste_capacity *= 1;
                        p.waste_hour *= 1;
                        p.waste_stored *= 1;
                        p.water_capacity *= 1;
                        p.water_hour *= 1;
                        p.water_stored *= 1;

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
                        return callback.success.call(this);
                    }
                },
                failure : function(o) {
                    if(callback && callback.failure) {
                        return callback.failure.call(this, o);
                    }
                },
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
                Game.InitTips();
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
        PlanetChange : function(planet) {
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

                Lacuna.MapPlanet.Load(planet.id, false, true);
            }
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
                    YAHOO.log(o, 'info', 'Game.Logout.success');
                    //Dom.setStyle(Game._envolveContainer, "display", "none");
                    Game.Reset();
                    Game.DoLogin();
                    Lacuna.Pulser.Hide();
                }
            });
        },
        Reset : function() {
            //clearInterval(Game.recInt);

            if (Game.chat) {
                try {
                    Game.chat.unsetUser();
                }
                catch(err) {
                    console.log("Cannot unsetuser "+err);
                }
            }
            delete Game.isRunning;
            clearInterval(Game.planetRefreshInterval);
            delete Game.planetRefreshInterval;
            //disable esc handler
            Game.escListener.disable();

            document.title = 'Lacuna Expanse';
            Game.RemoveCookie("locationId");
            Game.RemoveCookie("locationView");

            Game.SetSession();
            Game.EmpireData = {};
            Lacuna.Stats.Reset();
            Lacuna.MapStar.Reset();
            Lacuna.MapPlanet.Reset();
            Lacuna.Notify.Hide();
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
                    var planet = ED.planets[pKey],
                        isNotStation = planet.type != "space station";
                    if(planet.energy_stored < planet.energy_capacity){
                        planet.energy_stored += planet.energy_hour * ratio;
                        if(planet.energy_stored > planet.energy_capacity) {
                            planet.energy_stored = planet.energy_capacity;
                        }
                        else if(planet.energy_stored < 0) {
                            if(isNotStation) { planet.happiness += planet.energy_stored; }
                            planet.energy_stored = 0;
                        }
                    }
                    if(planet.food_stored < planet.food_capacity){
                        planet.food_stored += planet.food_hour * ratio;
                        if(planet.food_stored > planet.food_capacity) {
                            planet.food_stored = planet.food_capacity;
                        }
                        else if(planet.food_stored < 0) {
                            if(isNotStation) { planet.happiness += planet.food_stored; }
                            planet.food_stored = 0;
                        }
                    }
                    if(planet.ore_stored < planet.ore_capacity){
                        planet.ore_stored += planet.ore_hour * ratio;
                        if(planet.ore_stored > planet.ore_capacity) {
                            planet.ore_stored = planet.ore_capacity;
                        }
                        else if(planet.ore_stored < 0) {
                            if(isNotStation) { planet.happiness += planet.ore_stored; }
                            planet.ore_stored = 0;
                        }
                    }
                    if(planet.water_stored < planet.water_capacity){
                        planet.water_stored += planet.water_hour * ratio;
                        if(planet.water_stored > planet.water_capacity) {
                            planet.water_stored = planet.water_capacity;
                        }
                        else if(planet.water_stored < 0) {
                            if(isNotStation) { planet.happiness += planet.water_stored; }
                            planet.water_stored = 0;
                        }
                    }

                    var wasteOverage = 0;
                    if(planet.waste_stored < planet.waste_capacity){
                        planet.waste_stored += planet.waste_hour * ratio;
                        if(planet.waste_stored > planet.waste_capacity) {
                            wasteOverage = planet.waste_stored - planet.waste_capacity;
                            planet.waste_stored = planet.waste_capacity;
                        }
                        else if(planet.waste_stored < 0) {
                            if(isNotStation) { planet.happiness += planet.waste_stored; }
                            planet.waste_stored = 0;
                        }
                    }
                    else {
                        wasteOverage = planet.waste_hour * ratio;
                    }

                    if(isNotStation) {
                        planet.happiness += (planet.happiness_hour * ratio) - wasteOverage;
                        if(planet.happiness < 0 && ED.is_isolationist == "1") {
                            planet.happiness = 0;
                        }

                        //totalWasteOverage += wasteOverage;
                    }

                }
            }

            /*ED.happiness += (ED.happiness_hour * ratio) - totalWasteOverage;
            if(ED.happiness < 0 && ED.is_isolationist == "1") {
                ED.happiness = 0;
            }*/

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
        },
        onScroll : (function(){
            var evName;
            var func;
            var pixelsPerLine = 10;
            var ua = navigator.userAgent;
            var safari5 = ua.match(/\bSafari\//) && ua.match(/\bVersion\/5/);
            var isEventSupported = (function() {
                var TAGNAMES = {
                    'select':'input',
                    'change':'input',
                    'submit':'form',
                    'reset':'form',
                    'error':'img',
                    'load':'img',
                    'abort':'img'
                };
                var cache = {};
                function isEventSupported(eventName) {
                    var el = document.createElement(TAGNAMES[eventName] || 'div');
                    eventName = 'on' + eventName;
                    if (eventName in cache) {
                        return cache[eventName];
                    }
                    var isSupported = (eventName in el);
                    if (!isSupported) {
                        el.setAttribute(eventName, 'return;');
                        isSupported = typeof el[eventName] == 'function';
                    }
                    cache[eventName] = isSupported;
                    el = null;
                    return isSupported;
                }
                return isEventSupported;
            })();
            if (isEventSupported('mousewheel')) {
                return function(el, fn, obj, context) {
                    Event.on(el, 'mousewheel', function(e, o) {
                        var xDelta = 'wheelDeltaX' in e ? e.wheelDeltaX : 0;
                        var yDelta = 'wheelDeltaY' in e ? e.wheelDeltaY : e.wheelDelta;
                        // chrome/safari 4 give pixels
                        // safari 5 gives pixels * 120
                        if (safari5) {
                            xDelta /= 120;
                            yDelta /= 120;
                        }
                        fn.call(this, e, xDelta, yDelta, o);
                    }, obj, context);
                };
            }
            // not possible to feature detect this, have to just use the version number
            else if (YAHOO.env.ua.gecko >= 1.9 && ! ua.match(/\brv:1\.9\.0/)) {
                return function(el, fn, obj, context) {
                    Event.on(el, 'MozMousePixelScroll', function(e, o) {
                        var xAxis = e.axis == e.HORIZONTAL_AXIS;
                        var xDelta = xAxis ? -e.detail : 0;
                        var yDelta = xAxis ? 0 : -e.detail;
                        fn.call(this, e, xDelta, yDelta, o);
                    }, obj, context);
                };
            }
            else {
                return function(el, fn, obj, context) {
                    Event.on(el, 'DOMMouseScroll', function(e, o) {
                        var xAxis = 'axis' in e && e.axis == e.HORIZONTAL_AXIS;
                        // this event gets 'lines'
                        var xDelta = xAxis ? -e.detail * pixelsPerLine : 0;
                        var yDelta = xAxis ? 0 : -e.detail * pixelsPerLine;
                        fn.call(this, e, xDelta, yDelta, o);
                    }, obj, context);
                };
            }
        })()
    };

    YAHOO.lacuna.Game = Game;
})();
YAHOO.register("game", YAHOO.lacuna.Game, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
