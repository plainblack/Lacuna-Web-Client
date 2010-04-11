YAHOO.namespace("lacuna");

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
		
		this.createEvent("onBackClick");
		this.createEvent("onForwardClick");
		this.createEvent("onInboxClick");
	};
	UserMenu.prototype = {
		create : function() {
			var userMenu = new YAHOO.widget.Menu(this.id, { 
				zindex: 1006, 
				shadow:false, 
				context:[this.clickId, "tl", "bl",[9, -10]]
			});
			//userMenu.addItems([{ text: "Essentia", id: "ess", onclick: { fn: Lacuna.Essentia.show } }
			//]);
			userMenu.addItems([{ text: "Profile", id: "up", onclick: { fn: Lacuna.Profile.show } },
				{ text: "About", id: "ua", onclick: { fn: Lacuna.Menu.UserMenu.showAbout } },
				{ text: "Logout", id: "ul", onclick: { fn: Game.Logout } }
			]);
			userMenu.subscribe("beforeShow", function() {
				if (this.getRoot() == this) {
					this.align("tl","bl",[9, -10]);
				}
			});
			userMenu.render();
			Dom.removeClass(this.container, Lib.Styles.HIDDEN);

			Event.addListener(this.elClick, "click", function(ev){
				//this.align("tl","bl");
				this.show();
				Event.stopEvent(ev);
			}, userMenu, true);
			
			this.Menu = userMenu;
			
			/*var arrow = document.createElement("div");
			arrow.id = "usersArrow";
			var uc = Dom.get("usersCenter");
			uc.insertBefore(arrow, uc.firstChild);*/
			
			this.createLeft();
			this.createRight();

			var userMenuTT = new YAHOO.widget.Tooltip("userMenuTT", {
				zIndex:1010,
				xyoffset:[0,10],
				context:[this.elHappyOver]
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
			var back = document.createElement("div"),
				backClick = back.cloneNode(false),
				backImg = back.appendChild(document.createElement("img")),
				inbox = document.createElement("div"),
				inboxClick = inbox.cloneNode(false),
				inboxImg = inbox.appendChild(document.createElement("img"));//,
				//bookmark = document.createElement("div"),
				//bookmarkClick = bookmark.cloneNode(false),
				//bookmarkImg = bookmark.appendChild(document.createElement("img"));

			backImg.src = Lib.AssetUrl + 'ui/l/star_system.png';
			backImg.alt = "Back";
			Event.on(backClick, "click", function() {
				this.fireEvent("onBackClick");
			}, this, true);
			Dom.addClass([back,backClick], "back");
			Dom.addClass([back,backClick], "menuItem");
			Dom.addClass(backClick, "click");
			
			inboxImg.src = Lib.AssetUrl + (Game.EmpireData.has_new_messages == 1 ? 'ui/l/inbox_new.png' : 'ui/l/inbox.png');
			inboxImg.alt = "Inbox";
			Event.on(inboxClick, "click", function() {
				this.fireEvent("onInboxClick");
			}, this, true);
			Dom.addClass([inbox,inboxClick], "inbox");
			Dom.addClass([inbox,inboxClick], "menuItem");
			Dom.addClass(inboxClick, "click");
			
			/*bookmarkImg.src = Lib.AssetUrl + 'ui/l/bookmarks.png';
			bookmarkImg.alt = "Bookmark";
			Event.on(bookmarkClick, "click", function() {
				this.fireEvent("onBookmarkClick");
			}, this, true);
			Dom.addClass([bookmark,bookmarkClick], "bookmark");
			Dom.addClass([bookmark,bookmarkClick], "menuItem");
			Dom.addClass(bookmarkClick, "click");*/
			
			this.elBack = this.container.appendChild(back);
			this.elBackClick = this.container.appendChild(backClick);
			this.elBackImg = backImg;
			this.elInbox = this.container.appendChild(inbox);
			this.elInboxClick = this.container.appendChild(inboxClick);
			this.elInboxImg = inboxImg;
			//this.elBookmark = this.container.appendChild(bookmark);
			//this.elBookmarkClick = this.container.appendChild(bookmarkClick);
		},
		createRight : function() {
			var essentia = document.createElement("div"),
				essentiaImg = essentia.appendChild(document.createElement("img")),
				essentiaTxt = essentia.appendChild(document.createElement("span")),
				happy = document.createElement("div"),
				happyOver = happy.cloneNode(false),
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span")),
				forward = document.createElement("div"),
				forwardClick = forward.cloneNode(false),
				forwardImg = forward.appendChild(document.createElement("img")),
				forwardTxt = forward.appendChild(document.createElement("span"));
				
			essentiaImg.src = Lib.AssetUrl + 'ui/l/essentia.png';
			essentiaImg.alt = essentiaImg.title = "Essentia";
			Dom.addClass(essentia, "essentia");
			Dom.addClass(essentia, "menuItem");
			
			happyImg.src = Lib.AssetUrl + 'ui/l/happiness.png';
			happyImg.alt = happyImg.title = "Happiness";
			happyOver.id = "userMenuHappiness";
			Dom.addClass([happy,happyOver], "happiness");
			Dom.addClass([happy,happyOver], "menuItem");
			Dom.addClass(happyOver, "click");

			forwardImg.src = Lib.AssetUrl + 'ui/l/planet_side.png';
			forwardImg.alt = "Forward";
			Event.on(forwardClick, "click", function() {
				this.fireEvent("onForwardClick");
			}, this, true);
			Dom.addClass([forward,forwardClick], "forward");
			Dom.addClass([forward,forwardClick], "menuItem");
			Dom.addClass(forwardClick, "click");
			
			this.elEssentia = this.container.appendChild(essentia);
			this.elEssentiaText = essentiaTxt;
			this.elHappy = this.container.appendChild(happy);
			this.elHappyOver = this.container.appendChild(happyOver);
			this.elHappyText = happyTxt;
			this.elForward = this.container.appendChild(forward);
			this.elForwardClick = this.container.appendChild(forwardClick);
			this.elForwardImg = forwardImg;
		},
		update : function() {
			this.elText.innerHTML = Game.EmpireData.name || "Empire";
			this.updateTick();
		},
		updateTick : function() {
			this.elInboxImg.src = Lib.AssetUrl + (Game.EmpireData.has_new_messages ? 'ui/l/inbox_new.png' : 'ui/l/inbox.png');
			this.elEssentiaText.innerHTML = Game.EmpireData.essentia || "-";
			this.elHappyText.innerHTML = Math.round(Game.EmpireData.happiness) || "-";
		},
		show : function() {
			Dom.removeClass(this.container, Lib.Styles.HIDDEN);
		},
		hide : function() {
			Dom.addClass(this.container, Lib.Styles.HIDDEN);
		},
		starVisible : function(vis) {
			this.elBackClick.title = "To your Planet";
			this.elBackImg.src = Lib.AssetUrl + 'ui/l/planet_side.png';
			this.elForwardClick.title = "To your planet's Star System";
			this.elForwardImg.src = Lib.AssetUrl + 'ui/l/star_system.png';
		},
		systemVisible : function(vis) {
			this.elBackClick.title = "To the Universe";
			this.elBackImg.src = Lib.AssetUrl + 'ui/l/star_map.png';
			this.elForwardClick.title = "To your Planet";
			this.elForwardImg.src = Lib.AssetUrl + 'ui/l/planet_side.png';
		},
		planetVisible : function(vis) {
			this.elBackClick.title = "To your planet's Star System";
			this.elBackImg.src = Lib.AssetUrl + 'ui/l/star_system.png';
			this.elForwardClick.title = "To the Universe";
			this.elForwardImg.src = Lib.AssetUrl + 'ui/l/star_map.png';
		},
		showAbout : function() {
			Game.OverlayManager.hideAll();
			Lacuna.About.show();
		},
		
		getTextFor : function(id) {
			var ED = Game.EmpireData,
				output;
			switch(id){
				case "userMenuHappiness":
					output = [Math.round(ED.happiness), ' : ', ED.happiness_hour, '/hr'];
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
				zIndex:1010,
				xyoffset:[0,-10],
				context:[this.elFoodOver,this.elOreOver,this.elWaterOver,this.elEnergyOver,this.elWasteOver,this.elHappyOver]
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
				ore = document.createElement("div"),
				oreOver = ore.cloneNode(false),
				oreImg = ore.appendChild(document.createElement("img")),
				oreTxt = ore.appendChild(document.createElement("span")),
				water = document.createElement("div"),
				waterOver = water.cloneNode(false),
				waterImg = water.appendChild(document.createElement("img")),
				waterTxt = water.appendChild(document.createElement("span"));
			
			foodImg.src = Lib.AssetUrl + 'ui/l/food.png';
			foodImg.alt = foodImg.title = "Food";
			foodOver.id = "planetMenuFood";
			Dom.addClass([food,foodOver], "food");
			Dom.addClass([food,foodOver], "menuItem");
			Dom.addClass(foodOver, "click");
			
			oreImg.src = Lib.AssetUrl + 'ui/l/ore.png';
			oreImg.alt = oreImg.title = "Ore";
			oreOver.id = "planetMenuOre";
			Dom.addClass([ore,oreOver], "ore");
			Dom.addClass([ore,oreOver], "menuItem");
			Dom.addClass(oreOver, "click");
			
			waterImg.src = Lib.AssetUrl + 'ui/l/water.png';
			waterImg.alt = waterImg.title = "Water";
			waterOver.id = "planetMenuWater";
			Dom.addClass([water,waterOver], "water");
			Dom.addClass([water,waterOver], "menuItem");
			Dom.addClass(waterOver, "click");
			
			this.elFood = this.container.appendChild(food);
			this.elFoodOver = this.container.appendChild(foodOver);
			this.elFoodText = foodTxt;
			this.elOre = this.container.appendChild(ore);
			this.elOreOver = this.container.appendChild(oreOver);
			this.elOreText = oreTxt;
			this.elWater = this.container.appendChild(water);
			this.elWaterOver = this.container.appendChild(waterOver);
			this.elWaterText = waterTxt;
		},
		createRight : function() {
			var energy = document.createElement("div"),
				energyOver = energy.cloneNode(false),
				energyImg = energy.appendChild(document.createElement("img")),
				energyTxt = energy.appendChild(document.createElement("span")),
				waste = document.createElement("div"),
				wasteOver = waste.cloneNode(false),
				wasteImg = waste.appendChild(document.createElement("img")),
				wasteTxt = waste.appendChild(document.createElement("span")),
				happy = document.createElement("div"),
				happyOver = happy.cloneNode(false),
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span"));
				
			energyImg.src = Lib.AssetUrl + 'ui/l/energy.png';
			energyImg.alt = energyImg.title = "Energy";
			energyOver.id = "planetMenuEnergy";
			Dom.addClass([energy,energyOver], "energy");
			Dom.addClass([energy,energyOver], "menuItem");
			Dom.addClass(energyOver, "click");
			
			wasteImg.src = Lib.AssetUrl + 'ui/l/waste.png';
			wasteImg.alt = wasteImg.title = "Waste";
			wasteOver.id = "planetMenuWaste";
			Dom.addClass([waste,wasteOver], "waste");
			Dom.addClass([waste,wasteOver], "menuItem");
			Dom.addClass(wasteOver, "click");
			
			happyImg.src = Lib.AssetUrl + 'ui/l/happiness.png';
			happyImg.alt = happyImg.title = "Happiness";
			happyOver.id = "planetMenuHappiness";
			Dom.addClass([happy,happyOver], "happiness");
			Dom.addClass([happy,happyOver], "menuItem");
			Dom.addClass(happyOver, "click");
			
			this.elEnergy = this.container.appendChild(energy);
			this.elEnergyOver = this.container.appendChild(energyOver);
			this.elEnergyText = energyTxt;
			this.elWaste = this.container.appendChild(waste);
			this.elWasteOver = this.container.appendChild(wasteOver);
			this.elWasteText = wasteTxt;
			this.elHappy = this.container.appendChild(happy);
			this.elHappyOver = this.container.appendChild(happyOver);
			this.elHappyText = happyTxt;
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
				var p = planets[pKey];
				items.push({ text: p.name, id: "planetMenuItem"+(count++), onclick: { fn: this.menuClick, obj:p } });
			}
			this.Menu.addItems(items);
			this.Menu.render();
			
			this.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
			
			this.updateTick();
		},
		updateTick : function() {
			var ED = Game.EmpireData,
				planets = ED.planets || {},
				cpi = ED.current_planet_id || ED.home_planet_id,
				cp = planets[cpi],
				count = 0;
			
			if(cp) {
				//this.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
			
				if(cp.food_stored > 100000) {
					this.elFoodText.innerHTML = Math.floor(cp.food_stored/1000) + 'k';
				}
				else {
					this.elFoodText.innerHTML = Math.round(cp.food_stored) || "-";
				}
				if(cp.ore_stored > 100000) {
					this.elOreText.innerHTML = Math.floor(cp.ore_stored/1000) + 'k';
				}
				else {
					this.elOreText.innerHTML = Math.round(cp.ore_stored) || "-";
				}
				if(cp.water_stored > 100000) {
					this.elWaterText.innerHTML = Math.floor(cp.water_stored/1000) + 'k';
				}
				else {
					this.elWaterText.innerHTML = Math.round(cp.water_stored) || "-";
				}
				
				if(cp.energy_stored > 100000) {
					this.elEnergyText.innerHTML = Math.floor(cp.energy_stored/1000) + 'k';
				}
				else {
					this.elEnergyText.innerHTML = Math.round(cp.energy_stored) || "-";
				}
				if(cp.waste_stored > 100000) {
					this.elWasteText.innerHTML = Math.floor(cp.waste_stored/1000) + 'k';
				}
				else {
					this.elWasteText.innerHTML = Math.round(cp.waste_stored) || "-";
				}
				if(cp.happiness > 100000) {
					this.elHappyText.innerHTML = Math.floor(cp.happiness/1000) + 'k';
				}
				else {
					this.elHappyText.innerHTML = Math.round(cp.happiness) || "-";
				}
			}
			else {
				this.elText.innerHTML = "Planet";
			
				this.elFoodText.innerHTML = "-";
				this.elOreText.innerHTML = "-";
				this.elWaterText.innerHTML = "-";
				
				this.elEnergyText.innerHTML = "-";
				this.elWasteText.innerHTML = "-";
				this.elHappyText.innerHTML = "-";
			}
		},
		menuClick : function(p_sType, p_aArgs, planet){
			YAHOO.log(planet, "info", "PlanetMenu.planetMenuItem.click");
			Game.EmpireData.current_planet_id = planet.id;
			Lacuna.Menu.PlanetMenu.elText.innerHTML = ['<img src="', Lib.AssetUrl, 'star_system/', planet.image, '.png" class="menuPlanetThumb" />', planet.name].join('');
			
			Lacuna.MapStar.MapVisible(false);
			Lacuna.MapSystem.MapVisible(false);
			Lacuna.MapPlanet.MapVisible(true);
			Lacuna.Menu.PlanetVisible();
			Lacuna.MapPlanet.Load(planet.id);
		},
		
		show : function() {
			Dom.removeClass(this.container, Lib.Styles.HIDDEN);
		},
		hide : function() {
			Dom.addClass(this.container, Lib.Styles.HIDDEN);
		},
		
		getTextFor : function(id) {
			var ED = Game.EmpireData,
				planet = ED.planets[ED.current_planet_id || ED.home_planet_id],
				output;
			switch(id){
				case "planetMenuFood":
					output = [Math.round(planet.food_stored), '/', planet.food_capacity, ' : ', planet.food_hour,'/hr'];
					break;
				case "planetMenuOre":
					output = [Math.round(planet.ore_stored), '/', planet.ore_capacity, ' : ', planet.ore_hour,'/hr'];
					break;
				case "planetMenuWater":
					output = [Math.round(planet.water_stored), '/', planet.water_capacity, ' : ', planet.water_hour,'/hr'];
					break;
				case "planetMenuEnergy":
					output = [Math.round(planet.energy_stored), '/', planet.energy_capacity, ' : ', planet.energy_hour,'/hr'];
					break;
				case "planetMenuWaste":
					output = [Math.round(planet.waste_stored), '/', planet.waste_capacity, ' : ', planet.waste_hour,'/hr'];
					break;
				case "planetMenuHappiness":
					output = [Math.round(planet.happiness), ' : ', planet.happiness_hour,'/hr'];
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
		
		this.createEvent("onBackClick");
		this.createEvent("onForwardClick");
		this.createEvent("onInboxClick");
		
		this.UserMenu.subscribe("onBackClick", function() {
			this.fireEvent("onBackClick");
		}, this, true);
		this.UserMenu.subscribe("onForwardClick", function() {
			this.fireEvent("onForwardClick");
		}, this, true);
		this.UserMenu.subscribe("onInboxClick", function() {
			this.fireEvent("onInboxClick");
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
		},
		show : function() {
			this.UserMenu.show();
			this.PlanetMenu.show();
		},
		StarVisible : function() {
			this.UserMenu.starVisible();
		},
		SystemVisible : function() {
			this.UserMenu.systemVisible();
		},
		PlanetVisible : function() {
			this.UserMenu.planetVisible();
		}
	};
	Lang.augmentProto(Menu, Util.EventProvider);
	
	Lacuna.Menu = new Menu();
	
})();
YAHOO.register("menu", YAHOO.lacuna.Menu, {version: "1", build: "0"}); 

}