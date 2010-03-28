YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Menu == "undefined" || !YAHOO.lacuna.Menu) {
		
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
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
				//effect:{effect:YAHOO.widget.ContainerEffect.SLIDE,duration:0.5},
				context:[this.clickId, "tl", "bl",[9, -15]]
			});
			userMenu.addItem({ text: "About", id: "uc", onclick: { fn: Lacuna.Menu.UserMenu.showAbout } });
			userMenu.addItem({ text: "Logout", id: "ul", onclick: { fn: Game.Logout } });
			userMenu.subscribe("beforeShow", function() {
				if (this.getRoot() == this) {
					this.align("tl","bl",[9, -15]);
				}
			});
			userMenu.render();
			Dom.removeClass(this.container, Game.Styles.HIDDEN);

			Event.addListener(this.elClick, "click", function(ev){
				//this.align("tl","bl");
				this.show();
				Event.stopEvent(ev);
			}, userMenu, true);
			
			this.Menu = userMenu;
			this.createLeft();
			this.createRight();
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

			backImg.src = Game.AssetUrl + 'ui/l/star_system.png';
			backImg.alt = "Back";
			Event.on(backClick, "click", function() {
				this.fireEvent("onBackClick");
			}, this, true);
			Dom.addClass([back,backClick], "back");
			Dom.addClass([back,backClick], "menuItem");
			Dom.addClass(backClick, "click");
			
			inboxImg.src = Game.AssetUrl + (Game.EmpireData.has_new_messages == 1 ? 'ui/l/inbox_new.png' : 'ui/l/inbox.png');
			inboxImg.alt = "Inbox";
			Event.on(inboxClick, "click", function() {
				this.fireEvent("onInboxClick");
			}, this, true);
			Dom.addClass([inbox,inboxClick], "inbox");
			Dom.addClass([inbox,inboxClick], "menuItem");
			Dom.addClass(inboxClick, "click");
			
			/*bookmarkImg.src = Game.AssetUrl + 'ui/l/bookmarks.png';
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
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span")),
				forward = document.createElement("div"),
				forwardClick = forward.cloneNode(false),
				forwardImg = forward.appendChild(document.createElement("img")),
				forwardTxt = forward.appendChild(document.createElement("span"));
				
			essentiaImg.src = Game.AssetUrl + 'ui/l/essentia.png';
			essentiaImg.alt = essentiaImg.title = "Essentia";
			Dom.addClass(essentia, "essentia");
			Dom.addClass(essentia, "menuItem");
			
			happyImg.src = Game.AssetUrl + 'ui/l/happiness.png';
			happyImg.alt = happyImg.title = "Happiness";
			Dom.addClass(happy, "happiness");
			Dom.addClass(happy, "menuItem");

			forwardImg.src = Game.AssetUrl + 'ui/l/planet_side.png';
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
			this.elInboxImg.src = Game.AssetUrl + (Game.EmpireData.has_new_messages ? 'ui/l/inbox_new.png' : 'ui/l/inbox.png');
			this.elEssentiaText.innerHTML = Game.EmpireData.essentia || "-";
			this.elHappyText.innerHTML = Math.floor(Game.EmpireData.happiness) || "-";
		},
		show : function() {
			Dom.removeClass(this.container, Game.Styles.HIDDEN);
		},
		hide : function() {
			Dom.addClass(this.container, Game.Styles.HIDDEN);
		},
		starVisible : function(vis) {
			this.elBackImg.src = Game.AssetUrl + 'ui/l/planet_side.png';
			this.elForwardImg.src = Game.AssetUrl + 'ui/l/star_system.png';
		},
		systemVisible : function(vis) {
			this.elBackImg.src = Game.AssetUrl + 'ui/l/star_map.png';
			this.elForwardImg.src = Game.AssetUrl + 'ui/l/planet_side.png';
		},
		planetVisible : function(vis) {
			this.elBackImg.src = Game.AssetUrl + 'ui/l/star_system.png';
			this.elForwardImg.src = Game.AssetUrl + 'ui/l/star_map.png';
		},
		showAbout : function() {
			Lacuna.About.show();
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
				context:[this.clickId, "bl", "tl",[9, 15]]
			});
			planetMenu.subscribe("beforeShow", function() {
				if (this.getRoot() == this) {
					this.align("bl","tl",[9, 15]);
				}
			});
			planetMenu.render();
			Dom.removeClass(this.container, Game.Styles.HIDDEN);

			Event.addListener(this.elClick, "click", function(ev){
				//this.align("bl","tl");
				this.show();
				Event.stopEvent(ev);
			}, planetMenu, true);
			
			this.Menu = planetMenu;
			this.createLeft();
			this.createRight();
			this.update();
		},
		createLeft : function() {
			var food = document.createElement("div"),
				foodImg = food.appendChild(document.createElement("img")),
				foodTxt = food.appendChild(document.createElement("span")),
				ore = document.createElement("div"),
				oreImg = ore.appendChild(document.createElement("img")),
				oreTxt = ore.appendChild(document.createElement("span")),
				water = document.createElement("div"),
				waterImg = water.appendChild(document.createElement("img")),
				waterTxt = water.appendChild(document.createElement("span"));
			
			foodImg.src = Game.AssetUrl + 'ui/l/food.png';
			foodImg.alt = foodImg.title = "Food";
			Dom.addClass(food, "food");
			Dom.addClass(food, "menuItem");
			
			oreImg.src = Game.AssetUrl + 'ui/l/ore.png';
			oreImg.alt = oreImg.title = "Ore";
			Dom.addClass(ore, "ore");
			Dom.addClass(ore, "menuItem");
			
			waterImg.src = Game.AssetUrl + 'ui/l/water.png';
			waterImg.alt = waterImg.title = "Water";
			Dom.addClass(water, "water");
			Dom.addClass(water, "menuItem");
			
			this.elFood = this.container.appendChild(food);
			this.elFoodText = foodTxt;
			this.elOre = this.container.appendChild(ore);
			this.elOreText = oreTxt;
			this.elWater = this.container.appendChild(water);
			this.elWaterText = waterTxt;
		},
		createRight : function() {
			var energy = document.createElement("div"),
				energyImg = energy.appendChild(document.createElement("img")),
				energyTxt = energy.appendChild(document.createElement("span")),
				waste = document.createElement("div"),
				wasteImg = waste.appendChild(document.createElement("img")),
				wasteTxt = waste.appendChild(document.createElement("span")),
				happy = document.createElement("div"),
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span"));
				
			energyImg.src = Game.AssetUrl + 'ui/l/energy.png';
			energyImg.alt = energyImg.title = "Energy";
			Dom.addClass(energy, "energy");
			Dom.addClass(energy, "menuItem");
			
			wasteImg.src = Game.AssetUrl + 'ui/l/waste.png';
			wasteImg.alt = wasteImg.title = "Waste";
			Dom.addClass(waste, "waste");
			Dom.addClass(waste, "menuItem");
			
			happyImg.src = Game.AssetUrl + 'ui/l/happiness.png';
			happyImg.alt = happyImg.title = "Happiness";
			Dom.addClass(happy, "happiness");
			Dom.addClass(happy, "menuItem");
			
			this.elenergy = this.container.appendChild(energy);
			this.elEnergyText = energyTxt;
			this.elWaste = this.container.appendChild(waste);
			this.elWasteText = wasteTxt;
			this.elHappy = this.container.appendChild(happy);
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
				items.push({ text: p.name, id: "planetMenuItem"+(count++), onclick: { 
						fn: function(p_sType, p_aArgs, planet){
							YAHOO.log(planet, "info", "PlanetMenu.planetMenuItem.click");
							Game.EmpireData.current_planet_id = planet.id;
							Lacuna.Menu.PlanetMenu.elText.innerHTML = ['<img src="', Game.AssetUrl, 'star_system/', planet.image, '.png" class="menuPlanetThumb" />', planet.name].join('');
						},
						obj:p
					} 
				});
			}
			this.Menu.addItems(items);
			this.Menu.render();
			
			this.elText.innerHTML = ['<img src="', Game.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
			
			this.updateTick();
		},
		updateTick : function() {
			var ED = Game.EmpireData,
				planets = ED.planets || {},
				cpi = ED.current_planet_id || ED.home_planet_id,
				cp = planets[cpi],
				count = 0;
			
			if(cp) {
				//this.elText.innerHTML = ['<img src="', Game.AssetUrl, 'star_system/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
			
				this.elFoodText.innerHTML = Math.floor(cp.food_stored) || "-";
				this.elOreText.innerHTML = Math.floor(cp.ore_stored) || "-";
				this.elWaterText.innerHTML = Math.floor(cp.water_stored) || "-";
				
				this.elEnergyText.innerHTML = Math.floor(cp.energy_stored) || "-";
				this.elWasteText.innerHTML = Math.floor(cp.waste_stored) || "-";
				this.elHappyText.innerHTML = Math.floor(cp.happiness) || "-";
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
		show : function() {
			Dom.removeClass(this.container, Game.Styles.HIDDEN);
		},
		hide : function() {
			Dom.addClass(this.container, Game.Styles.HIDDEN);
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