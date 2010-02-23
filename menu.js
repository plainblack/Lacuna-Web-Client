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
		this.container = "header";
		this.clickId = "users";
		this.elClick = Dom.get(this.clickId);
		this.elLeft = Dom.get("usersLeft");
		this.elRight = Dom.get("usersRight");
	};
	UserMenu.prototype = {
		create : function() {
			var userMenu = new YAHOO.widget.Menu(this.id, { zindex: 1001 });
			userMenu.cfg.setProperty("context", [this.clickId, "tl", "bl"]);
			//userMenu.addItem({ text: "Details", id: "ud", onclick: { fn: function(){alert("details");} } });
			userMenu.addItem({ text: "Logout", id: "ul", onclick: { fn: Game.Logout } });
			userMenu.subscribe("beforeShow", function() {
				if (this.getRoot() == this) {
					this.align("tl","bl");
				}
			});
			userMenu.render();
			Dom.removeClass(this.container, Game.Styles.HIDDEN);

			Event.addListener(this.elClick, "click", function(ev){
				this.align("tl","bl");
				this.show();
				Event.stopEvent(ev);
			}, userMenu, true);
			
			this.Menu = userMenu;
			this.createLeft();
			this.createRight();
			this.updateData();
		},
		createLeft : function() {
			var inbox = document.createElement("span"),
				inboxImg = inbox.appendChild(document.createElement("img")),
				bookmark = document.createElement("span"),
				bookmarkImg = bookmark.appendChild(document.createElement("img"));
				
			inboxImg.src = Game.AssetUrl + (Game.EmpireData.has_new_messages == 1 ? 'ui/inbox-alert.png' : 'ui/inbox.png');
			inboxImg.alt = "Inbox";
			Dom.addClass(inbox, "inbox");
			Dom.addClass(inbox, "menuItem");
			
			bookmarkImg.src = Game.AssetUrl + 'ui/bookmark.png';
			bookmarkImg.alt = "Bookmark";
			Dom.addClass(bookmark, "bookmark");
			Dom.addClass(bookmark, "menuItem");
			
			this.elInbox = this.elLeft.appendChild(inbox);
			this.elInboxImg = inboxImg;
			this.elBookmark = this.elLeft.appendChild(bookmark);
		},
		createRight : function() {
			var essentia = document.createElement("span"),
				essentiaImg = essentia.appendChild(document.createElement("img")),
				essentiaTxt = essentia.appendChild(document.createElement("span")),
				happy = document.createElement("span"),
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span"));
				
			essentiaImg.src = Game.AssetUrl + 'ui/essentia.png';
			essentiaImg.alt = "Essentia";
			Dom.addClass(essentia, "essentia");
			Dom.addClass(essentia, "menuItem");
			
			happyImg.src = Game.AssetUrl + 'ui/happiness.png';
			happyImg.alt = "Happiness";
			Dom.addClass(happy, "happiness");
			Dom.addClass(happy, "menuItem");
			
			this.elEssentia = this.elRight.appendChild(essentia);
			this.elEssentiaText = essentiaTxt;
			this.elHappy = this.elRight.appendChild(happy);
			this.elHappyText = happyTxt;
		},
		updateData : function() {
			this.elInboxImg.src = Game.AssetUrl + (Game.EmpireData.has_new_messages == 1 ? 'ui/inbox-alert.png' : 'ui/inbox.png');
			this.elClick.innerHTML = Game.EmpireData.name || "Empire";
			this.elEssentiaText = Game.EmpireData.essentia || "-";
			this.elHappyText = Game.EmpireData.happiness || "-";
		},
		show : function() {
			Dom.removeClass(this.container, Game.Styles.HIDDEN);
		},
		hide : function() {
			Dom.addClass(this.container, Game.Styles.HIDDEN);
		}
	};
	
	var PlanetMenu = function() {
		this.id = "planetMenu";
		this.container = "footer";
		this.clickId = "planets";
		this.elClick = Dom.get(this.clickId);
		this.elLeft = Dom.get("planetsLeft");
		this.elRight = Dom.get("planetsRight");
	};
	PlanetMenu.prototype = {
		create : function() {
			var planetMenu = new YAHOO.widget.Menu(this.id, { zindex: 1001 });
			planetMenu.cfg.setProperty("context", [this.clickId, "bl", "tl"]);
			planetMenu.subscribe("beforeShow", function() {
				if (this.getRoot() == this) {
					this.align("bl","tl");
				}
			});
			planetMenu.render();
			Dom.removeClass(this.container, Game.Styles.HIDDEN);

			Event.addListener(this.elClick, "click", function(ev){
				this.align("bl","tl");
				this.show();
				Event.stopEvent(ev);
			}, planetMenu, true);
			
			this.Menu = planetMenu;
			this.createLeft();
			this.createRight();
			this.updateData();
		},
		createLeft : function() {
			var food = document.createElement("span"),
				foodImg = food.appendChild(document.createElement("img")),
				foodTxt = food.appendChild(document.createElement("span")),
				mineral = document.createElement("span"),
				mineralImg = mineral.appendChild(document.createElement("img")),
				mineralTxt = mineral.appendChild(document.createElement("span")),
				water = document.createElement("span"),
				waterImg = water.appendChild(document.createElement("img")),
				waterTxt = water.appendChild(document.createElement("span"));
			
			foodImg.src = Game.AssetUrl + 'ui/food.png';
			foodImg.alt = "Food";
			Dom.addClass(food, "food");
			Dom.addClass(food, "menuItem");
			
			mineralImg.src = Game.AssetUrl + 'ui/mineral.png';
			mineralImg.alt = "Mineral";
			Dom.addClass(mineral, "mineral");
			Dom.addClass(mineral, "menuItem");
			
			waterImg.src = Game.AssetUrl + 'ui/water.png';
			waterImg.alt = "Water";
			Dom.addClass(water, "water");
			Dom.addClass(water, "menuItem");
			
			this.elFood = this.elLeft.appendChild(food);
			this.elFoodText = foodTxt;
			this.elMineral = this.elLeft.appendChild(mineral);
			this.elMineralText = mineralTxt;
			this.elWater = this.elLeft.appendChild(water);
			this.elWaterText = waterTxt;
		},
		createRight : function() {
			var energy = document.createElement("span"),
				energyImg = energy.appendChild(document.createElement("img")),
				energyTxt = energy.appendChild(document.createElement("span")),
				waste = document.createElement("span"),
				wasteImg = waste.appendChild(document.createElement("img")),
				wasteTxt = waste.appendChild(document.createElement("span")),
				happy = document.createElement("span"),
				happyImg = happy.appendChild(document.createElement("img")),
				happyTxt = happy.appendChild(document.createElement("span"));
				
			energyImg.src = Game.AssetUrl + 'ui/energy.png';
			energyImg.alt = "Energy";
			Dom.addClass(energy, "energy");
			Dom.addClass(energy, "menuItem");
			
			wasteImg.src = Game.AssetUrl + 'ui/waste.png';
			wasteImg.alt = "Waste";
			Dom.addClass(waste, "waste");
			Dom.addClass(waste, "menuItem");
			
			happyImg.src = Game.AssetUrl + 'ui/happiness.png';
			happyImg.alt = "Happiness";
			Dom.addClass(happy, "happiness");
			Dom.addClass(happy, "menuItem");
			
			this.elenergy = this.elRight.appendChild(energy);
			this.elEnergyText = energyTxt;
			this.elWaste= this.elRight.appendChild(happy);
			this.elWasteText = wasteTxt;
			this.elHappy = this.elRight.appendChild(happy);
			this.elHappyText = happyTxt;
		},
		updateData : function() {
			var ED = Game.EmpireData,
				planets = ED.planets || {},
				cpi = ED.home_planet_id,
				cp = planets[cpi],
				count = 0;
			
			this.Menu.clearContent();
			if(Lang.isObject(planets)) {
				var items = [];
				for(var pKey in planets) {
					var p = planets[pKey];
					items.push({ text: p.name, id: "planet"+(count++), onclick: { fn: function(){alert(p.name);} } });
				}
				this.Menu.addItems(items);
			}
			
			if(cp) {
				this.elClick.innerHTML = ['<img src="', Game.AssetUrl, 'body/', cp.image, '.png" class="menuPlanetThumb" />', cp.name].join('');
			
				this.elFoodText.innerHTML = cp.food || "-";
				this.elMineralText.innerHTML = cp.mineral || "-";
				this.elWaterText.innerHTML = cp.water || "-";
				
				this.elEnergyText.innerHTML = cp.energy || "-";
				this.elWasteText.innerHTML = cp.waste || "-";
				this.elHappyText.innerHTML = cp.happiness || "-";
			}
			else {
				this.elClick.innerHTML = "Planet";
			
				this.elFoodText.innerHTML = "-";
				this.elMineralText.innerHTML = "-";
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
	};
	Menu.prototype = {
		create : function() {
			if(!this.created) {
				this.created = true;
				this.UserMenu.create();
				this.PlanetMenu.create();
			}
			else {
				this.UserMenu.updateData();
				this.PlanetMenu.updateData();
				this.show();
			}
		},
		update : function() {
			if(this.created) {
				this.UserMenu.updateData();
				this.PlanetMenu.updateData();
			}
		},
		hide : function() {
			this.UserMenu.hide();
			this.PlanetMenu.hide();
		},
		show : function() {
			this.UserMenu.show();
			this.PlanetMenu.show();
		}
	};
	
	Lacuna.Menu = new Menu();
	
})();
YAHOO.register("menu", YAHOO.lacuna.Menu, {version: "1", build: "0"}); 

}