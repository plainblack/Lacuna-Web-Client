YAHOO.namespace("lacuna");

var React = require('react');

var RPCCount = require('js/components/menu/rpcCount');

if (typeof YAHOO.lacuna.Menu == "undefined" || !YAHOO.lacuna.Menu) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var UserMenu = function() {
        this.id = "userMenu";
        this.container = Dom.get("header");
        this.clickId = "userClick";
        this.elClick = Dom.get(this.clickId);
        this.elText = Dom.get("users");

        this.createEvent("onChangeClick");
        this.createEvent("onInboxClick");
        this.createEvent("onDestructClick");
    };
    UserMenu.prototype = {
        create : function() {

            // Create a div for all the React-based windows and stuff to hide in.
            // TODO: one day this should have a reasonable location and name.
            $(document.body).append('<div id="reactWindowContainer"></div>');

            // More hacky glue code so that we can get the React-based RPC counter into the DOM.
            $(document.body).append('<div id="rpcCounter"></div>');
            React.render(
                <RPCCount />,
                document.getElementById('rpcCounter')
            );

            var userMenu = new YAHOO.widget.Menu(this.id, {
                zindex: 1006,
                shadow:false,
                context:[this.clickId, "tl", "bl",[11, -14]]
            });
            userMenu.addItems([
                { text: "Alliance Map", url: "/starmap/",                                 target: "_blank" },
				{ text: "Changes Log",  url: "/changes.txt",                              target: "_blank" },
				{ text: "Forums",       url: "http://community.lacunaexpanse.com/forums", target: "_blank" },
				{ text: "Help",         url: "http://www.lacunaexpanse.com/help/",        target: "_blank" },
                { text: "Ideas",  url: "http://community.lacunaexpanse.com/forums/general",           target: "_blank" },
                { text: "Server Clock", onclick: { fn: Lacuna.Info.Clock.Show, scope:Lacuna.Info.Clock } },
                { text: "Terms of Service",   url: "http://www.lacunaexpanse.com/terms/", target: "_blank" },
                { text: "Wiki",         url: "http://community.lacunaexpanse.com/wiki/",  target: "_blank" }
            ]);
            userMenu.subscribe("beforeShow", function() {
                if (this.getRoot() == this) {
                    this.align("tl","bl",[11, -14]);
                    //this.bringToTop();
                }
            });
            userMenu.render();
            Dom.removeClass(this.container, Lib.Styles.HIDDEN);

            Event.addListener(this.elClick, "click", function(ev){
                //this.align("tl","bl");
                if(!this.cfg.getProperty("visible")){
                    this.show();
                }
                Event.stopEvent(ev);
            }, userMenu, true);

            this.Menu = userMenu;
            Dom.removeClass(this.container, Lib.Styles.HIDDEN);

            this.createLeft();
            this.createRight();

            var userMenuTT = new YAHOO.widget.Tooltip("userMenuTT", {
                zIndex:41010,
                xyoffset:[0,10],
                context:[this.elChangeClick,"userMenuProfile",this.elInboxClick,this.elEssentiaClick,this.elDestructClick,"userMenuInvite", "userMenuTutorial","userMenuSupport","userMenuStats","userMenuAbout","userMenuLogout"]
            });
            // Set the text for the tooltip just before we display it.
            userMenuTT.contextTriggerEvent.subscribe(function(type, args) {
                var context = args[0];
                this.cfg.setProperty("text", Lacuna.Menu.UserMenu.getTextFor(context.id));
            });

            this.userMenuTT = userMenuTT;

            this.update();
        },
        createLeft : function() {
            var change = document.createElement("div"),
                changeClick = change.cloneNode(false),
                changeImg = change.appendChild(document.createElement("img")),
                inbox = document.createElement("div"),
                inboxClick = inbox.cloneNode(false),
                inboxImg = inbox.appendChild(document.createElement("img")),
                inboxTxt = inbox.appendChild(document.createElement("span")),
                profile = this.container.appendChild(document.createElement("div")),
                profileClick = this.container.appendChild(profile.cloneNode(false)),
                profileImg = profile.appendChild(document.createElement("img")),
                essentia = document.createElement("div"),
                essentiaClick = essentia.cloneNode(false),
                essentiaImg = essentia.appendChild(document.createElement("img")),
                essentiaTxt = essentia.appendChild(document.createElement("span")),
                destruct = document.createElement("div"),
                destructClick = destruct.cloneNode(false),
                destructImg = destruct.appendChild(document.createElement("img"));

                //bookmark = document.createElement("div"),
                //bookmarkClick = bookmark.cloneNode(false),
                //bookmarkImg = bookmark.appendChild(document.createElement("img"));

            changeImg.src = Lib.AssetUrl + 'ui/l/star_map.png';
            changeImg.alt = "Change";
            changeClick.id = "userMenuChange";
            Event.on(changeClick, "click", function() {
                this.fireEvent("onChangeClick");
            }, this, true);
            Dom.addClass([change,changeClick], "change");
            Dom.addClass([change,changeClick], "menuItem");
            Dom.addClass(changeClick, "click");

            inboxImg.src = Lib.AssetUrl + (Game.EmpireData.has_new_messages ? 'ui/l/inbox_new.png' : 'ui/l/inbox.png');
            inboxImg.alt = inboxImg.title = "Inbox";
            inboxClick.id = "userMenuInbox";
            if (Game.EmpireData.has_new_messages) {
                inboxImg.title += " (" + Game.EmpireData.has_new_messages + " new)";
                inboxTxt.innerHTML = Game.EmpireData.has_new_messages;
            }
            Event.on(inboxClick, "click", function() {
                this.fireEvent("onInboxClick");
            }, this, true);
            Dom.addClass([inbox,inboxClick], "inbox");
            Dom.addClass([inbox,inboxClick], "menuItem");
            Dom.addClass(inboxClick, "click");

            profileImg.src = Lib.AssetUrl + 'ui/l/profile.png';
            profileImg.alt = "profile";
            profileClick.id = "userMenuProfile";
            Event.on(profileClick, "click", Lacuna.Profile.show, this, true);
            Dom.addClass([profile,profileClick], "profile");
            Dom.addClass([profile,profileClick], "menuItem");
            Dom.addClass(profileClick, "click");

            essentiaImg.src = Lib.AssetUrl + 'ui/l/essentia.png';
            essentiaImg.alt = essentiaImg.title = "Essentia";
            essentiaClick.id = "userMenuEssentia";
            Event.on(essentiaClick, "click", Lacuna.Essentia.show);
            Dom.addClass([essentia,essentiaClick], "essentia");
            Dom.addClass([essentia,essentiaClick], "menuItem");
            Dom.addClass(essentiaClick, "click");

            /*bookmarkImg.src = Lib.AssetUrl + 'ui/l/bookmarks.png';
            bookmarkImg.alt = "Bookmark";
            Event.on(bookmarkClick, "click", function() {
                this.fireEvent("onBookmarkClick");
            }, this, true);
            Dom.addClass([bookmark,bookmarkClick], "bookmark");
            Dom.addClass([bookmark,bookmarkClick], "menuItem");
            Dom.addClass(bookmarkClick, "click");*/

            destructImg.src = Lib.AssetUrl + (Game.EmpireData.self_destruct_active*1 === 1 ? 'ui/l/disable_self_destruct.png' : 'ui/l/enable_self_destruct.png');
            destructImg.alt = destructImg.title = "Destruct";
            destructClick.id = "userMenuDestruct";
            Event.on(destructClick, "click", function() {
                this.fireEvent("onDestructClick");
            }, this, true);
            Dom.addClass([destruct,destructClick], "destruct menuItem");
            Dom.addClass(destructClick, "click");

            this.elChange = this.container.appendChild(change);
            this.elChangeClick = this.container.appendChild(changeClick);
            this.elChangeImg = changeImg;
            this.elInbox = this.container.appendChild(inbox);
            this.elInboxClick = this.container.appendChild(inboxClick);
            this.elInboxImg = inboxImg;
            this.elInboxText = inboxTxt;
            //profile appended at the top since we don't have to change it ever
            this.elEssentia = this.container.appendChild(essentia);
            this.elEssentiaClick = this.container.appendChild(essentiaClick);
            this.elEssentiaText = essentiaTxt;
            //this.elBookmark = this.container.appendChild(bookmark);
            //this.elBookmarkClick = this.container.appendChild(bookmarkClick);

            this.elDestruct = this.container.appendChild(destruct);
            this.elDestructClick = this.container.appendChild(destructClick);
            this.elDestructImg = destructImg;
        },
        createRight : function() {
            var invite = this.container.appendChild(document.createElement("div")),
                inviteClick = this.container.appendChild(document.createElement("a")),
                inviteImg = invite.appendChild(document.createElement("img")),
                tutorial = this.container.appendChild(document.createElement("div")),
                tutorialClick = this.container.appendChild(document.createElement("a")),
                tutorialImg = tutorial.appendChild(document.createElement("img")),
                support = this.container.appendChild(document.createElement("div")),
                supportClick = this.container.appendChild(document.createElement("a")),
                supportImg = support.appendChild(document.createElement("img")),
                stats = this.container.appendChild(document.createElement("div")),
                statsClick = this.container.appendChild(stats.cloneNode(false)),
                statsImg = stats.appendChild(document.createElement("img")),
                about = this.container.appendChild(document.createElement("div")),
                aboutClick = this.container.appendChild(about.cloneNode(false)),
                aboutImg = about.appendChild(document.createElement("img")),
                logout = this.container.appendChild(document.createElement("div")),
                logoutClick = this.container.appendChild(logout.cloneNode(false)),
                logoutImg = logout.appendChild(document.createElement("img"));

            inviteImg.src = Lib.AssetUrl + 'ui/l/invite_friend.png';
            inviteImg.alt = inviteImg.title = "Invite Friend";
            inviteClick.id = "userMenuInvite";
            Event.on(inviteClick, "click", Lacuna.Invite.show, this, true);
            Dom.addClass([invite,inviteClick], "invite menuItem");
            Dom.addClass(inviteClick, "click");

            tutorialImg.src = Lib.AssetUrl + 'ui/l/tutorial.png';
            tutorialImg.alt = tutorialImg.title = "Tutorial";
            tutorialClick.id = "userMenuTutorial";
            tutorialClick.href = "http://www.lacunaexpanse.com/tutorial";
            tutorialClick.target = "_blank";
            Dom.addClass([tutorial,tutorialClick], "tutorial menuItem");
            Dom.addClass(tutorialClick, "click");

            supportImg.src = Lib.AssetUrl + 'ui/l/support.png';
            supportImg.alt = supportImg.title = "Support";
            supportClick.id = "userMenuSupport";
            supportClick.href = "http://community.lacunaexpanse.com/forums";
            supportClick.target = "_blank";
            Dom.addClass([support,supportClick], "support menuItem");
            Dom.addClass(supportClick, "click");

            statsImg.src = Lib.AssetUrl + 'ui/l/stats.png';
            statsImg.alt = statsImg.title = "Stats";
            statsClick.id = "userMenuStats";
            Event.on(statsClick, "click", Lacuna.Stats.show, this, true);
            Dom.addClass([stats,statsClick], "stats menuItem");
            Dom.addClass(statsClick, "click");

            aboutImg.src = Lib.AssetUrl + 'ui/l/about.png';
            aboutImg.alt = aboutImg.title = "About";
            aboutClick.id = "userMenuAbout";
            Event.on(aboutClick, "click", function() {
                var About = require('js/components/menu/about');
                var AboutActions = require('js/actions/menu/about');

                // TODO: this render shouldn't be here! The goal is to only call AboutActions.open()
                React.render(
                    <About date={new Date()}/>,
                    document.getElementById('reactWindowContainer')
                );

                AboutActions.open();
                AboutActions.load();
            }, this, true);
            Dom.addClass([about,aboutClick], "about menuItem");
            Dom.addClass(aboutClick, "click");

            logoutImg.src = Lib.AssetUrl + 'ui/l/logout.png';
            logoutImg.alt = logoutImg.title = "Logout";
            logoutClick.id = "userMenuLogout";
            Event.on(logoutClick, "click", Game.Logout, this, true);
            Dom.addClass([logout,logoutClick], "logout menuItem");
            Dom.addClass(logoutClick, "click");
        },
        update : function() {
            this.elText.innerHTML = Game.EmpireData.name || "Empire";
            this.updateTick();
        },
        updateTick : function() {
            var new_inbox_image;
            if (Game.EmpireData.has_new_messages) {
                new_inbox_image = Lib.AssetUrl + 'ui/l/inbox_new.png';
                this.elInboxImg.title = "Inbox (" + Game.EmpireData.has_new_messages + " new)";
                this.elInboxText.innerHTML = Game.EmpireData.has_new_messages;
            }
            else {
                new_inbox_image = Lib.AssetUrl + 'ui/l/inbox.png';
                this.elInboxImg.title = "Inbox";
                this.elInboxText.innerHTML = "";
            }
            if (this.elInboxImg.src != new_inbox_image) {
                this.elInboxImg.src = new_inbox_image;
            }
            var new_destruct_image = Lib.AssetUrl + (Game.EmpireData.self_destruct_active*1 === 1 ? 'ui/l/disable_self_destruct.png' : 'ui/l/enable_self_destruct.png');
            if (this.elDestructImg.src != new_destruct_image) {
                this.elDestructImg.src = new_destruct_image;
            }

            this.elEssentiaText.innerHTML = Lib.convertNumDisplay(Game.EmpireData.essentia, true);
        },
        show : function() {
            Dom.removeClass(this.container, Lib.Styles.HIDDEN);
        },
        hide : function() {
            Dom.addClass(this.container, Lib.Styles.HIDDEN);
        },
        starVisible : function(vis) {
            this.elChangeClick.title = "To your Planet";
            this.elChangeImg.src = Lib.AssetUrl + 'ui/l/planet_side.png';
            this._planetVisible = false;
            this._starVisible = true;
        },
        planetVisible : function(vis) {
            this.elChangeClick.title = "To the Starmap";
            this.elChangeImg.src = Lib.AssetUrl + 'ui/l/star_map.png';
            this._planetVisible = true;
            this._starVisible = false;
        },

        getTextFor : function(id) {
            var ED = Game.EmpireData,
                output;
            switch(id){
                case "userMenuChange":
                    output = [this._planetVisible ? "To the Starmap" : "To your Planet"];
                    break;
                case "userMenuProfile":
                    output = ['Profile'];
                    break;
                case "userMenuInbox":
                    if (Game.EmpireData.has_new_messages) {
                        output = ["Inbox (" + Game.EmpireData.has_new_messages + " new)"];
                    }
                    else {
                        output = ["Inbox"];
                    }
                    break;
                case "userMenuEssentia":
                    output = ['Essentia'];
                    break;
                case "userMenuInvite":
                    output = ['Invite a Friend'];
                    break;
                case "userMenuTutorial":
                    output = ['Tutorial'];
                    break;
                case "userMenuSupport":
                    output = ['Support'];
                    break;
                case "userMenuDestruct":
                    if(ED.self_destruct_active*1 === 1) {
                        output = ['Disable Destruction Date of : ', Lib.formatServerDate(ED.self_destruct_date)];
                    }
                    else {
                        output = ['Enable Self Destruct'];
                    }
                    break;
                case "userMenuStats":
                    output = ['Stats'];
                    break;
                case "userMenuAbout":
                    output = ['About'];
                    break;
                case "userMenuLogout":
                    output = ['Logout'];
                    break;
                default:
                    output = [];
                    break;
            }
            return output.join('');
        }
    };
    Lang.augmentProto(UserMenu, Util.EventProvider);

    var PlanetMenu = function() {
        this.id = "planetMenu";
        this.container = Dom.get("footer");
        this.clickId = "planetsClick";
        this.elClick = Dom.get(this.clickId);
        this.elText = Dom.get("planets");
    };
    PlanetMenu.prototype = {
        create : function() {
            var planetMenu = new YAHOO.widget.Menu(this.id, {
                zindex: 1006,
                shadow:false,
                //effect:{effect:YAHOO.widget.ContainerEffect.SLIDE,duration:0.5},
                context:[this.clickId, "bl", "tl",[9, 10]]
            });
            planetMenu.subscribe("beforeShow", function() {
                if (this.getRoot() == this) {
                    this.align("bl","tl",[9, 10]);
                    //this.bringToTop();
                }
            });
            planetMenu.render();
            Dom.removeClass(this.container, Lib.Styles.HIDDEN);

            Event.addListener(this.elClick, "click", function(ev){
                //this.align("bl","tl");
                this.show();
                Event.stopEvent(ev);
            }, planetMenu, true);

            this.Menu = planetMenu;

            /*var arrow = document.createElement("div");
            arrow.id = "planetsArrow";
            var pc = Dom.get("planetsCenter");
            pc.insertBefore(arrow, pc.firstChild);*/

            this.createLeft();
            this.createRight();

            var planetMenuTT = new YAHOO.widget.Tooltip("planetMenuTT", {
                zIndex:41011,
                xyoffset:[0,-10],
                context:[this.elFoodOver,this.elOreOver,this.elWaterOver,this.elEnergyOver,this.elWasteOver,this.elHappyOver,this.elPlotsOver]
            });
            // Set the text for the tooltip just before we display it.
            planetMenuTT.contextTriggerEvent.subscribe(function(type, args) {
                var context = args[0];
                this.cfg.setProperty("text", Lacuna.Menu.PlanetMenu.getTextFor(context.id));
            });

            this.planetMenuTT = planetMenuTT;


            this.update();
        },
        createLeft : function() {
            var food = document.createElement("div"),
                foodOver = food.cloneNode(false),
                foodImg = food.appendChild(document.createElement("img")),
                foodTxt = food.appendChild(document.createElement("span")),
                foodPercent = food.appendChild(document.createElement("div")),
                foodHr = food.appendChild(document.createElement("span")),
                ore = document.createElement("div"),
                oreOver = ore.cloneNode(false),
                oreImg = ore.appendChild(document.createElement("img")),
                oreTxt = ore.appendChild(document.createElement("span")),
                orePercent = ore.appendChild(document.createElement("div")),
                oreHr = ore.appendChild(document.createElement("span")),
                water = document.createElement("div"),
                waterOver = water.cloneNode(false),
                waterImg = water.appendChild(document.createElement("img")),
                waterTxt = water.appendChild(document.createElement("span")),
                waterPercent = water.appendChild(document.createElement("div")),
                waterHr = water.appendChild(document.createElement("span")),
                energy = document.createElement("div"),
                energyOver = energy.cloneNode(false),
                energyImg = energy.appendChild(document.createElement("img")),
                energyTxt = energy.appendChild(document.createElement("span")),
                energyPercent = energy.appendChild(document.createElement("div")),
                energyHr = energy.appendChild(document.createElement("span"));

            foodImg.src = Lib.AssetUrl + 'ui/l/food.png';
            foodImg.alt = foodImg.title = "Food";
            foodOver.id = "planetMenuFood";
            Dom.addClass([food,foodOver], "food");
            Dom.addClass([food,foodOver], "menuItem");
            Dom.addClass(foodOver, "click");
            Dom.addClass(foodTxt, "stored");
            Dom.addClass(foodHr, "perHr");

            oreImg.src = Lib.AssetUrl + 'ui/l/ore.png';
            oreImg.alt = oreImg.title = "Ore";
            oreOver.id = "planetMenuOre";
            Dom.addClass([ore,oreOver], "ore");
            Dom.addClass([ore,oreOver], "menuItem");
            Dom.addClass(oreOver, "click");
            Dom.addClass(oreTxt, "stored");
            Dom.addClass(oreHr, "perHr");

            waterImg.src = Lib.AssetUrl + 'ui/l/water.png';
            waterImg.alt = waterImg.title = "Water";
            waterOver.id = "planetMenuWater";
            Dom.addClass([water,waterOver], "water");
            Dom.addClass([water,waterOver], "menuItem");
            Dom.addClass(waterOver, "click");
            Dom.addClass(waterTxt, "stored");
            Dom.addClass(waterHr, "perHr");

            energyImg.src = Lib.AssetUrl + 'ui/l/energy.png';
            energyImg.alt = energyImg.title = "Energy";
            energyOver.id = "planetMenuEnergy";
            Dom.addClass([energy,energyOver], "energy");
            Dom.addClass([energy,energyOver], "menuItem");
            Dom.addClass(energyOver, "click");
            Dom.addClass(energyTxt, "stored");
            Dom.addClass(energyHr, "perHr");

            Dom.addClass([foodPercent,orePercent,waterPercent,energyPercent], 'menuPercent');
            foodPercent = foodPercent.appendChild(document.createElement('div'));
            orePercent = orePercent.appendChild(document.createElement('div'));
            waterPercent = waterPercent.appendChild(document.createElement('div'));
            energyPercent = energyPercent.appendChild(document.createElement('div'));
            Dom.addClass([foodPercent,orePercent,waterPercent,energyPercent], 'menuPercentInner');
            foodPercent.innerHTML = '&nbsp;';
            orePercent.innerHTML = '&nbsp;';
            waterPercent.innerHTML = '&nbsp;';
            energyPercent.innerHTML = '&nbsp;';

            this.elFood = this.container.appendChild(food);
            this.elFoodOver = this.container.appendChild(foodOver);
            this.elFoodText = foodTxt;
            this.elFoodPercent = foodPercent;
            this.elFoodHour = foodHr;
            this.elOre = this.container.appendChild(ore);
            this.elOreOver = this.container.appendChild(oreOver);
            this.elOreText = oreTxt;
            this.elOrePercent = orePercent;
            this.elOreHour = oreHr;
            this.elWater = this.container.appendChild(water);
            this.elWaterOver = this.container.appendChild(waterOver);
            this.elWaterText = waterTxt;
            this.elWaterPercent = waterPercent;
            this.elWaterHour = waterHr;
            this.elEnergy = this.container.appendChild(energy);
            this.elEnergyOver = this.container.appendChild(energyOver);
            this.elEnergyText = energyTxt;
            this.elEnergyPercent = energyPercent;
            this.elEnergyHour = energyHr;
        },
        createRight : function() {
            var waste = document.createElement("div"),
                wasteOver = waste.cloneNode(false),
                wasteImg = waste.appendChild(document.createElement("img")),
                wasteTxt = waste.appendChild(document.createElement("span")),
                wastePercent = waste.appendChild(document.createElement("div")),
                wasteHr = waste.appendChild(document.createElement("span")),
                happy = document.createElement("div"),
                happyOver = happy.cloneNode(false),
                happyImg = happy.appendChild(document.createElement("img")),
                happyTxt = happy.appendChild(document.createElement("span")),
                happyHr = happy.appendChild(document.createElement("span")),
                plots = document.createElement("div"),
                plotsOver = plots.cloneNode(false),
                plotsImg = plots.appendChild(document.createElement("img")),
                plotsTxt = plots.appendChild(document.createElement("span"));

            wasteImg.src = Lib.AssetUrl + 'ui/l/waste.png';
            wasteImg.alt = wasteImg.title = "Waste";
            wasteOver.id = "planetMenuWaste";
            Dom.addClass([waste,wasteOver], "waste");
            Dom.addClass([waste,wasteOver], "menuItem");
            Dom.addClass(wasteOver, "click");
            Dom.addClass(wasteTxt, "stored");
            Dom.addClass(wasteHr, "perHr");
            Dom.addClass(wastePercent, 'menuPercent');
            wastePercent = wastePercent.appendChild(document.createElement('div'));
            Dom.addClass(wastePercent, 'menuPercentInner');
            wastePercent.innerHTML = '&nbsp;';

            happyImg.src = Lib.AssetUrl + 'ui/l/happiness.png';
            happyImg.alt = happyImg.title = "Happiness";
            happyOver.id = "planetMenuHappiness";
            Dom.addClass([happy,happyOver], "happiness");
            Dom.addClass([happy,happyOver], "menuItem");
            Dom.addClass(happyOver, "click");
            Dom.addClass(happyTxt, "stored");
            Dom.addClass(happyHr, "perHr");

            plotsImg.src = Lib.AssetUrl + 'ui/l/plots.png';
            plotsImg.alt = plotsImg.title = "plots";
            plotsOver.id = "planetMenuPlots";
            Dom.addClass([plots,plotsOver], "plots");
            Dom.addClass([plots,plotsOver], "menuItem");
            Dom.addClass(plotsOver, "click");
            Dom.addClass(plotsTxt, "stored");

            this.elWaste = this.container.appendChild(waste);
            this.elWasteOver = this.container.appendChild(wasteOver);
            this.elWasteText = wasteTxt;
            this.elWastePercent = wastePercent;
            this.elWasteHour = wasteHr;
            this.elHappy = this.container.appendChild(happy);
            this.elHappyOver = this.container.appendChild(happyOver);
            this.elHappyText = happyTxt;
            this.elHappyHour = happyHr;
            this.elPlots = this.container.appendChild(plots);
            this.elPlotsOver = this.container.appendChild(plotsOver);
            this.elPlotsText = plotsTxt;
        },
        update : function() {
            var ED = Game.EmpireData,
                planets = ED.planets || {},
                cpi = ED.current_planet_id || ED.home_planet_id,
                cp = planets[cpi],
                count = 0;

            this.Menu.clearContent();

            var items = [];
            for(var pKey in planets) {
                if(planets.hasOwnProperty(pKey)) {
                    var p = planets[pKey],
                        pObj = {
                            text: p.name,
                            id: "planetMenuItem"+(count++),
                            onclick: { fn: this.menuClick, obj:p }
                        },
                        submenuItems = [{ text: "Go To Surface", onclick: { fn: this.menuPlanetClick, obj:p } }];
                    if(p.star_name) {
                        submenuItems.push({ text: "Go To Star ("+p.star_name+")", onclick: { fn: this.menuStarClick, obj:p } });
                    }
                    pObj.submenu = {
                        id : "planetMenuItem"+count+"-Sub",
                        itemData : submenuItems
                    };
                    items.push(pObj);
                }
            }

            items.sort(function(a,b){
                var nameA = a.text;
                var nameB = b.text;
                if (ED.coloniesByName[nameA] && ED.stationsByName[nameB]) { return -1 }
                if (ED.stationsByName[nameA] && ED.coloniesByName[nameB]) { return 1 }
                nameA = nameA.toLowerCase( );
                nameB = nameB.toLowerCase( );
                if (nameA < nameB) {return -1;}
                if (nameA > nameB) {return 1;}
                return 0;
            });

            this.Menu.addItems(items);
            this.Menu.render();

            this.elText.innerHTML = [cp.image ? '<img src="'+Lib.AssetUrl+'star_system/'+cp.image+'.png" class="menuPlanetThumb" />' : '', cp.name].join('');

            this.updateTick();
        },
        updateElm : function(el, newVal, extra) {
            var formatedVal = Lib.convertNumDisplay(newVal) + (extra || '');
            if(el.innerHTML != formatedVal) {
                var fromColor = el.currentValue && el.currentValue > newVal ? '#f00' : '#0f0';
                el.currentValue = newVal;
                el.innerHTML = formatedVal;
                var a = new Util.ColorAnim(el, {color:{from:fromColor,to:'#fff'}}, 1.5);
                a.animate();
            }
        },
        updateTick : function() {
            var ED = Game.EmpireData,
                planets = ED.planets || {},
                cpi = ED.current_planet_id || ED.home_planet_id,
                cp = planets[cpi],
                count = 0;

            if(cp) {
                //this.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
                this.updateElm(this.elFoodText, cp.food_stored);
                this.updateElm(this.elFoodHour, cp.food_hour, '/hr');
                this.updatePercent(this.elFoodPercent, cp.food_stored/cp.food_capacity||0);
                this.updateElm(this.elOreText, cp.ore_stored);
                this.updateElm(this.elOreHour, cp.ore_hour, '/hr');
                this.updatePercent(this.elOrePercent, cp.ore_stored/cp.ore_capacity||0);
                this.updateElm(this.elWaterText, cp.water_stored);
                this.updateElm(this.elWaterHour, cp.water_hour, '/hr');
                this.updatePercent(this.elWaterPercent, cp.water_stored/cp.water_capacity||0);
                this.updateElm(this.elEnergyText, cp.energy_stored);
                this.updateElm(this.elEnergyHour, cp.energy_hour, '/hr');
                this.updatePercent(this.elEnergyPercent, cp.energy_stored/cp.energy_capacity||0);

                this.updateElm(this.elWasteText, cp.waste_stored);
                this.updateElm(this.elWasteHour, cp.waste_hour, '/hr');
                this.updatePercent(this.elWastePercent, cp.waste_stored/cp.waste_capacity||0);
                this.updateElm(this.elHappyText, cp.happiness);
                this.updateElm(this.elHappyHour, cp.happiness_hour, '/hr');
                this.updateElm(this.elPlotsText, cp.plots_available*1);
            }
            else {
                this.elText.innerHTML = "Planet";

                this.elFoodText.innerHTML = "0";
                this.elFoodHour.innerHTML = "0";
                Dom.setStyle(this.elFoodPercent, 'width', 0);
                this.elOreText.innerHTML = "0";
                this.elOreHour.innerHTML = "0";
                Dom.setStyle(this.elOrePercent, 'width', 0);
                this.elWaterText.innerHTML = "0";
                this.elWaterHour.innerHTML = "0";
                Dom.setStyle(this.elWaterPercent, 'width', 0);
                this.elEnergyText.innerHTML = "0";
                this.elEnergyHour.innerHTML = "0";
                Dom.setStyle(this.elEnergyPercent, 'width', 0);

                this.elWasteText.innerHTML = "0";
                this.elWasteHour.innerHTML = "0";
                Dom.setStyle(this.elWastePercent, 'width', 0);
                this.elHappyText.innerHTML = "0";
                this.elHappyHour.innerHTML = "0";
                this.elPlotsText.innerHTML = "0";
            }
        },
        updatePercent : function(el, perc) {
            if (perc > 1) {
                perc = 1;
            }
            Dom.setStyle(el, 'width', (Math.round(perc*10000)/100) + '%');

            var colorPercent;
            if (perc < 0.8) {
                colorPercent = 0;
            }
            else {
                colorPercent = 5 * perc - 4;
            }

            var color = 'rgb(255,'+Math.round(255 - 127 * colorPercent)+','+Math.round(255 - 255 * colorPercent) + ')';
            Dom.setStyle(el, 'background-color', color);
            Dom.setStyle(el.parentNode, 'border-color', color);
        },
        menuClick : function(p_sType, p_aArgs, planet){
            Lacuna.Menu.PlanetMenu.Menu.hide();
            YAHOO.log(planet, "info", "PlanetMenu.menuClick.click");
            if(Lacuna.MapStar.IsVisible()) {
                Game.PlanetChange(planet);
            }
            else {
                Game.PlanetJump(planet);
            }
        },
        menuStarClick : function(p_sType, p_aArgs, planet){
            Lacuna.Menu.PlanetMenu.Menu.hide();
            YAHOO.log(planet, "info", "PlanetMenu.menuStarClick.click");
            Game.StarJump({id:planet.star_id, name:planet.star_name, x:planet.x, y:planet.y});
        },
        menuPlanetClick : function(p_sType, p_aArgs, planet){
            Lacuna.Menu.PlanetMenu.Menu.hide();
            Game.PlanetJump(planet);
        },

        show : function() {
            Dom.removeClass(this.container, Lib.Styles.HIDDEN);
        },
        hide : function() {
            Dom.addClass(this.container, Lib.Styles.HIDDEN);
        },

        resourceTTText : function(name, icon, iconClass, hour, store, cap) {
            var wantCap = typeof cap !== 'undefined';
            return [
                '<div><strong>',name,'</strong></div>',
                '<div><img alt="" class="',iconClass,'" src="',Lib.AssetUrl,'ui/s/',icon,'.png" /> ',Lib.formatNumber(hour),'/hr</div>',
                '<div><img alt="" class="smallStorage" src="',Lib.AssetUrl,'ui/s/storage.png" />',Lib.formatNumber(Math.round(store)), (wantCap ? '/'+Lib.formatNumber(cap) : ''),'</div>',
                (wantCap ? '<div><img alt="" class="smallTime" src="'+Lib.AssetUrl+'ui/s/time.png" />' + (
                    hour < 0 && store > 0 ?
                        'Empty In '+Lib.formatTime(-3600 * store / hour) :
                    hour >= 0 && cap == store ?
                        'Full' :
                    hour > 0 ?
                        'Full In '+Lib.formatTime(3600 * (cap - store) / hour) :
                    'Will Never Fill'
                ) + '</div>' : '')
            ];
        },
        getTextFor : function(id) {
            var ED = Game.EmpireData,
                planet = ED.planets[ED.current_planet_id || ED.home_planet_id],
                output;
            switch(id){
                case "planetMenuFood":
                    output = this.resourceTTText('Food', 'food', 'smallFood', planet.food_hour, planet.food_stored, planet.food_capacity);
                    break;
                case "planetMenuOre":
                    output = this.resourceTTText('Ore', 'ore', 'smallOre', planet.ore_hour, planet.ore_stored, planet.ore_capacity);
                    break;
                case "planetMenuWater":
                    output = this.resourceTTText('Water', 'water', 'smallWater', planet.water_hour, planet.water_stored, planet.water_capacity);
                    break;
                case "planetMenuEnergy":
                    output = this.resourceTTText('Energy', 'energy', 'smallEnergy', planet.energy_hour, planet.energy_stored, planet.energy_capacity);
                    break;
                case "planetMenuWaste":
                    output = this.resourceTTText('Waste', 'waste', 'smallWaste', planet.waste_hour, planet.waste_stored, planet.waste_capacity);
                    break;
                case "planetMenuHappiness":
                    output = this.resourceTTText('Happiness', 'happiness', 'smallHappy', planet.happiness_hour, planet.happiness);
                    break;
                case "planetMenuPlots":
                    output = [planet.plots_available*1, ' Plots Available'];
                    break;
                default:
                    output = [];
                    break;
            }
            return output.join('');
        }
    };

    var Menu = function() {
        this.UserMenu = new UserMenu();
        this.PlanetMenu = new PlanetMenu();

        this.createEvent("onChangeClick");
        this.createEvent("onInboxClick");
        this.createEvent("onDestructClick");

        this.UserMenu.subscribe("onChangeClick", function() {
            this.fireEvent("onChangeClick");
        }, this, true);
        this.UserMenu.subscribe("onInboxClick", function() {
            this.fireEvent("onInboxClick");
        }, this, true);
        this.UserMenu.subscribe("onDestructClick", function() {
            this.fireEvent("onDestructClick");
        }, this, true);
    };
    Menu.prototype = {
        create : function() {
            if(!this.created) {
                this.created = true;
                this.UserMenu.create();
                this.PlanetMenu.create();
            }
            else {
                this.UserMenu.update();
                this.PlanetMenu.update();
                this.show();
            }
        },
        update : function() {
            if(this.created) {
                this.UserMenu.update();
                this.PlanetMenu.update();
            }
        },
        updateTick : function() {
            if(this.created) {
                this.UserMenu.updateTick();
                this.PlanetMenu.updateTick();
            }
        },
        hide : function() {
            this.UserMenu.hide();
            this.PlanetMenu.hide();
            this._starVisible = false;
            this._planetVisible = false;
        },
        show : function() {
            this.UserMenu.show();
            this.PlanetMenu.show();
        },
        StarVisible : function() {
            this._starVisible = true;
            this._planetVisible = false;
            this.UserMenu.starVisible();
        },
        PlanetVisible : function() {
            this._starVisible = false;
            this._planetVisible = true;
            this.UserMenu.planetVisible();
        },
        IsStarVisible : function() {
            return this._starVisible;
        },
        IsPlanetVisible : function() {
            return this._planetVisible;
        }
    };
    Lang.augmentProto(Menu, Util.EventProvider);

    Lacuna.Menu = new Menu();

})();
YAHOO.register("menu", YAHOO.lacuna.Menu, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
