/*
Public Key:
53137d8f-3544-4118-9001-b0acbec70b3d
Private Key:
d07c9bd4-fcb7-427f-9064-218064677fef 
*/
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
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {  
			if (from in this && this[from] === elt) { 
				return from;
			}
		}  
		return -1;  
	};  
} 
	
if (typeof YAHOO.lacuna.Library == "undefined" || !YAHOO.lacuna.Library) {
	
(function(){
	var Util = YAHOO.util,
		Lang = YAHOO.lang,
		Dom = Util.Dom;

	var xPad=function (x, pad, r) {
		if(typeof r === 'undefined') {
			r=10;
		}
		for( ; parseInt(x, 10)<r && r>1; r/=10) {
			x = pad.toString() + x;
		}
		return x.toString();
	};
		
	var Library = {
		ApiKey : "53137d8f-3544-4118-9001-b0acbec70b3d",
		AssetUrl : "https://s3.amazonaws.com/alpha.lacunaexpanse.com/assets/",
		Styles : {
			HIDDEN : "hidden",
			ALERT : "alert"
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
			1009 : "Invalid range",
			1010 : "Insufficient privileges",
			1011 : "Not enough resources in storage",
			1012 : "Not enough resources in production",
			1013 : "Missing prerequisites" 
		},
		View : {
			STAR : "star",
			SYSTEM : "system",
			PLANET : "planet"
		},
		QueueTypes : {
			PLANET : "1",
			STAR : "2",
			SYSTEM : "3"
		},
		
		formatMillisecondTime : function(totalMs) {
			return Library.formatTime(totalMs / 1000);
		},
		formatTime : function(totalSeconds) {
			var secondsInDay = 60 * 60 * 24,
				secondsInHour = 60 * 60,
				day = Math.floor(totalSeconds / secondsInDay),
				hleft = totalSeconds % secondsInDay,
				hour = Math.floor(hleft / secondsInHour),
				sleft = hleft % secondsInHour,
				min = Math.floor(sleft / 60),
				seconds = Math.floor(sleft % 60);
			
			if(day > 0) {
				return [day,xPad(hour,'0'),xPad(min,'0'),xPad(seconds,'0')].join(':');
			}
			else if(hour > 0) {
				return [hour,xPad(min,'0'),xPad(seconds,'0')].join(':');
			}
			else if(min > 0) {
				return [min,xPad(seconds,'0')].join(':');
			}
			else {
				return seconds;
			}
		},
		formatNumber : function(num) {
			return Util.Number.format(num,{thousandsSeparator:","});
		},
		parseServerDate : function(strDate) {
			var pieces = strDate.split(' '), //[day, month, year, hr:min:sec, timez]
				time = pieces[3].split(':');
			//year, month, day, hours, minutes, seconds
			var dt = new Date(pieces[2]*1,(pieces[1]*1)-1,pieces[0]*1,time[0]*1,time[1]*1,time[2]*1,0), //construct date
				msTime = dt.getTime(), //get dt in milliseconds
				offset = dt.getTimezoneOffset() * 60000, //get locale offset in milliseconds
				correctTime = msTime - offset, //subtract from UTC server time
				cd = new Date(correctTime);
			return cd;
			//"23 03 2010 01:20:11 +0000"
		},
		formatServerDate : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d/%Y %r"}, "en");
		},
		formatServerDateShort : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d %r"}, "en");
		},
		convertNumDisplay : function(number) {
			if(number >= 1000000 || number <= -1000000) {
				return (Math.floor(number/100000) / 10) + 'm';
			}
			else if(number >= 10000 || number <= -10000) {
				return Math.floor(number/1000) + 'k';
			}
			else {
				return Math.floor(number) || "-";
			}
		},
		
		Descriptions : {
			"/algae" : "The Algae Cropper produces algae to be used as food by your empire.  It also produces a small amount of energy and can be built in any orbit.  The higher the level of the cropper the more food and energy it produces.",
			"/apple" : "Allows you to grow apples to feed your empire.  You can only grow apples in orbit 3 (its goldilox zone).  Food production increases for every level of the orchard.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.",
			"/archaeology" : "Allows you to search through specific types of ore to find Glyphs.",
			"/bean" : "The Amalgus Bean Plantation allows you to grow beans to be used as food by your empire.  You can only grow beans in orbit 4 (its goldilox zone).  The higher the level of the plantation the more food it produces.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.", //"Amalgus Bean Plantation"
			"/beeldeban" : "The Beeldeban Herder allows the raising of beeldeban to be used as food for your empire.  It can only be built in orbits 2, 3, and 4 (its goldilox zone).  The higher the building level the more food is produced.",
			"/bread" : "The Bakery converts wheat from the Wheat Farm at a minimal loss into bread to be used as food by your empire.  The conversion rate increases with every level of the Bakery.",
			"/burger" : "The Burger Packer converts fungus from the Malcud Fungus Farm and produces burgers, at a small loss, to food.  The higher the building level the more  food is converted.", //"Malcud Burger Packer"
			"/cheese" : "The Cheese Maker converts milk from the Dairy Farm into cheese at a small loss to be used as food.  The higher the building level the more  food is converted.",
			"/chip" : "The Denton Root Chip Frier converts roots from the Denton Root Farm and turns it into root chips as food for your empire at a minimal loss.  The higher the level of the Chip Frier the more food it converts." ,//"Denton Root Chip Frier"
			"/cider" : "The Apple Cider Bottler allows you to convert apples from the Apple Orchard  into cider with a small amount of loss.  The amount of apples converted into cider increases with the level of the building.",
			"/corn" : "The Corn Plantation produces corn to be used as food by your empire.  The corn plantation can only be used in orbits 2 and 3.  The higher the level of the plantation the more food is produced.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.",
			"/cornmeal" : "The Corn Meal Grinder converts corn from the Corn Plantation  into corn meal at a small loss to be used as food.  The higher the building level the more  food is converted.",
			"/dairy" : "The Dairy Farm allows you to produce food via dairy cattle.  It can only be used in orbit 3 (its goldilox zone).  The higher the level of farm the more food it produces. Cows require certain minerals in their diet in order to produce lots of high quality milk. Therefore in order to have a dairy farm you're going to need a good supply of trona.",
			"/denton" : "The Denton Root Patch produces roots to be used as food by your empire.  The roots only grow in orbit 5 (its goldilox zone).  The higher the level of the patch the more food it produces.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.", //"Denton Root Patch"
			"/development" : "The Development Ministry oversees the construction of buildings on your planet.  This is where you can monitor your build queue and subsidize the construction of buildings through the use of Essentia  to build them faster.  The higher the level of the building the more buildings you can have in your queue.  The number of projects that can be placed in the queue is the level of the ministry plus 1. ",
			"/embassy" : "The Embassy allows the formation of alliances.  It is also a prerequisite to building the Space Station.  Each level of the Embassy allows 2 more members to join the alliance. ",
			"/energyreserve" : "The Energy Reserve stores your energy with a minimal amount of loss.  Increasing the level of the building raises the amount of energy  stored.",
			"/entertainment" : "The Entertainment District increases your empire's happiness by providing a place for your citizens to unwind through activities such as casinos, restaurants, clubs and other amusements.  The higher the building level the more  happiness is produced.  ",
			"/espionage" : "The Espionage Ministry allows the construction of smuggler ships and spy probes at the shipyard.  It also allows better training of your spies.  The higher the building level, the more effective your spies will be applying their trade. ",
			"/foodreserve" : "The Food Reserve stores your food with a minimal amount of spoilage.  It also gives you a report of the types of food you have stored.  Increasing the level of this building increases the amount of food that can be stored.",
			"/fission" : "The Fission Energy Plant produces energy by splitting atoms.  This way of producing energy is very efficient on an waste per energy produced ratio.  The higher the building level the more energy is produced. Splitting the atoms non-energenic particles doesn't produce much power, so you'll need radioactive ore to power your fission plant, such as uraninite or monazite.",
			"/fusion" : "The Fusion Energy Plant produces energy by fusing atoms together.  This type of energy is even more efficient than the Fission Energy Plant on a waste per energy produced ratio.  Requires a high level University to construct.  The higher the building level the more energy is produced. Unfortunately the fusion plant produces enormous amounts of heat as well which requires coolants such as molten lead or salt. Therefore you'll need a good supply of galena or halite to build one.",
			"/gasgiantlab" : "The Gas Giant Lab does research on the gas giant ship which deploys into a gas giant platform.  The gas giant platform allows settlement of a gas giant.  The higher the building level the higher the level of the platform deployed from the gas giant ship.",
			"/geo" : "The Geo Energy Plant produces energy  with a minimal amount of waste by using the planets own processes such as wind, waves, solar and geo thermal.  The higher the level of the building the more energy is produced.",
			"/hydrocarbon" : "The Hydrocarbon Energy Plant produces large amounts of energy at the cost of producing large amounts of waste by burning hydrocarbons.  It also uses significant amounts of ore in the production of this energy.  The higher the building level the more energy is produced.  Hydrocarbon energy is derived from burning hydrocarbons, so you'll need a good supply of kerogen, methane, or anthracite in order to power it.",
			"/intelligence" : "The Intelligence Ministry is where you train your spies and counter-spies.  You may train 2 spies per level of this building.  You may only construct 1 Intelligence Ministry on a planet.",
			"/lapis" : "The Lapis Orchard produces lapis to be used as food by your empire.  Lapis can only be grown in orbit 2 (its goldilox zone).  The higher the level of the orchard the more food it produces.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.",
			"/malcud" : "The Malcud Fungus Farm produces fungus to be used as food by your empire.  The Farm also consumes a small amount of waste and can be built in any orbit.  The higher the level of the farm the more food is produced and waste consumed.",
			"/mine" : "The Mine extracts mineral from your planet in the form of ore.  The amounts of each mineral extracted depends on the concentration and composition of the planet. The higher the level of the mine the more ore is extracted.",
			"/miningministry" : "The Mining Ministry allows production of mining platform  ships at the shipyard.  The mining platform ship is deployed to asteroids where you can mine their ore.  The ministry also allows management of previously deployed mining platform  ships and controls the flow of cargo ships to and from the platform.  The level of the building controls how many platforms can be deployed as well as how many cargo ships can be used between an asteroid and your planet.",
			"/network19" : "The Network 19 Affiliate is your empire's source for up to the minute news in your region of the Expanse.  Get updates on what other empire's are doing and what you'd prefer they weren't doing.  The Network 19 feed can be manipulated through the use of of espionage and political policy.  Well informed people are happy people so the network also produces happiness.  The higher the building level the more of the expanse you can get news from and the more happiness is produced. ",
			"/observatory" : "The Observatory allows the construction of probes and colony ships at the shipyard.  It also provides a list of all your active probes and the stars they are observing.  A higher building level allows more probes to be constructed.",
			"/orerefinery" : "The Ore Refinery increases the amount of ore extracted from each mine by purifying the ore and producing less waste.  The higher the refinery level the higher the purification process and even greater amounts of ore are extracted from the mine.  The ore refinery requires sufficient amounts of either sulfur or fluorite being produced in order to process ore.",
			"/orestorage" : "Ore Storage Tanks  store the ore that is pulled from the Mine.  The higher the level of the building the more ore can be stored.",
			"/pancake" : "The Pancake Factory converts potatoes from the Potato Plantation into pancakes at a minimal loss to be used as food by your empire.  The higher the level of the factory, the more food is converted.",
			"/park" : "The Park is a place for your people to gather and enjoy nature or hold large scale public events.  The Park allows you to throw parties for your citizens to increase their happiness.  The more varieties of foods you bring to the party the more happiness is produced.",
			"/pie" : "The Pie Bakery converts lapis from the Lapis Orchard  into pies at minimal loss to be used as food by your empire.  The higher the level of the bakery, the more food is converted.",
			"/planetarycommand" : "The planetary command houses the central government for your empire.  This is your \"flag in the ground\" that lets everyone know you've staked your claim to a planet, asteroid, etc.  It provides some basic resources and and storage for those resources both of which increase with the level of this building.  The planetary command also provides some critical reports on your planetary activities such as total resource production and total resource storage for the planet it's constructed on.",
			"/potato" : "The Potato Patch allows you to grow potatoes to be used as food for you empire.  The patch can only be used in orbits 3 and 4 (its goldilox zone).  The higher the level of the patch the more food it produces.  All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive.",
			"/propulsion" : "Work done in the Propulsion System Factory allows your ships to move faster through space by way of upgraded engines.  The higher the building level the faster your ships move.  All ships originating from this planet are affected.  In order to produce high performance engines you'll need a good supply of structural minerals such as rutile, chromite, bauxite, magnetite, beryl, or goethite.",
			"/oversight" : "The Oversight Ministry reduces the amount of time buildings take to upgrade through better project management. All buildings will be produced 1% faster per level of the Oversight Ministry.",
			"/security" : "The Security Ministry increases the effectiveness of your counter-spies.  The higher the building level the more training your counter-spies receive.",
			"/shake" : "The Beeldeban Protein Shake Factory converts the beeldeban that are harvested in the Beeldeban Herder into protein shakes, at a small loss, to be used as food.  The higher the level of the factory the more food is converted.",
			"/shipyard" : "The Shipyard is where the construction of your empire's ships takes place.  The types of ships that can be built in the Shipyard are dependent on some of the other buildings on your planet.  The higher the building level the faster ships are produced.  ",
			"/singularity" : "The Singularity Energy  Plant produces energy  by pulling it from subspace.  This is the cleanest and most powerful form of energy in the universe. This is extremely expensive to build and requires a very high level University  to construct.  The higher the building level the more energy is produced.",
			"/soup" : "The Soup Cannery converts beans from the Amalgus Bean Plantation at a minimal loss into soup to be used as food for your empire. The higher the level of the cannery the more soup is produced.",
			"/spaceport" : "The Space Port is the hangar and control tower for your ships.  Here is where you can monitor your ships that are in transit.  Be careful as the Space Port can only hold a limited number of ships, if there is no more room in the Space Port when a ship arrives or is built, it will be destroyed.  The Space Port can hold double its level in ships. ",
			"/syrup" : "The Syrup Bottler takes algae from the Algae Cropper  and converts it in to Syrup with a small loss to be used as food.  The higher the level of the bottler the more food is produced.",
			"/terraforminglab" : "The Terraforming Lab is where research is done on the production of terraforming ships.  Terraforming ships deploy into terraforming platforms which allow food growth outside of a food type's normal goldilox zone.  The level of the building determines the level of the platform that is deployed from the ship.",
			"/trade" : "The Trade Ministry allows access to the interstellar market.  Through it you can set up trades for resources with other empires.  This building is a prerequisite to building cargo ships, which carry your trade goods, in the shipyard.  The higher the building level the more resources your cargo ships can carry.",
			"/transporter" : "Through the use of Essentia, the Subspace Transporter allows the instant transport of resources to a destination.  The transporter also allows conversion of resources through trading with the Lacunans.  The higher the building level the more goods can be transported.",
			"/university" : "The University is a place of higher learning and knowledge for your people and is the key to growth for your empire.  Other buildings can not be upgraded higher than the university building level plus 1.  Your university's level is empire wide where construction level of buildings on other planets is concerned.  Many of the more powerful buildings that can be constructed require a very high level University.  The University is also a source of happiness for empire. ",
			"/wasteenergy" : "The Waste Energy Plant produces energy by burning your empire's waste.  Producing energy this way is far less efficient than other types of energy production, but the benefit is that waste is reduced.  The higher the building level the more energy is produced and waste consumed. In order to build and maintain the blast furnace you need a good supply of insulating ores such as zircon, beryl, and gypsum.",
			"/wasterecycling" : "The Waste Recycling Center allows you to manually convert large batches of waste into energy, ore and water.  The more waste you convert, the longer it will take to make the resources you want.  The higher the level of the building the faster the conversion will take place.  You can also spend a small amount of Essentia to convert the waste instantly.",
			"/wastesequestration" : "The Waste Sequestration Well is a place for your empire to store its waste.  Waste that is not stored turns into pollution and lowers your empire's happiness.  The higher the building level the more waste can be stored.",
			"/wastetreatment" : "The Waste Treatment Center allows you to convert batches of waste in to ore.  The higher the building level the large the batch can be converted.  Waste treatment requires special chemical compounds derived from halite, sulfur, and trona.",
			"/waterproduction" : "The Water Production Plant converts energy and ore into water.  This is especially useful on planets with low concentrations of water.  A higher building level means more  resources are converted.",
			"/waterpurification" : "The Water Purification Plant takes water from the planet and purifies it for drinking.  The higher the building level the more water it can purify.",
			"/waterreclamation" : "The Water Reclamation Plant converts waste into water.  A higher building level means more resources are converted.  If you don't have a good supply of halite or sulfur you cannot treat waste water.",
			"/waterstorage" : "The Water Storage Tank stores the water you've collected.  A higher building level allows more water to be stored.",
			"/wheat" : "The Wheat Farm allows you to grow wheat on your planet.  You can only grow wheat on planets that are in orbits 2, 3 or 4 (the goldilox zone).  The Farm will produce more wheat for each level it is increased. All plants need a source of phosphorus to photosynthesize their food. Therefore you need a good source of gypsum, sulfur, or monazite for plants to thrive."
		},
		Ships :  {
			gas_giant_settlement_platform_ship:"Gas Giant Platform",
			terraforming_platform_ship:"Terraforming Platform",
			cargo_ship:"Cargo Ship",
			probe:"Probe",
			space_station:"Space Station",
			mining_platform_ship:"Mining Platform",
			spy_pod:"Spy Pod",
			smuggler_ship:"Smuggler Ship",
			colony_ship:"Colony Ship"
		}
	};
	
	YAHOO.lacuna.Library = Library;
})();
YAHOO.register("library", YAHOO.lacuna.Library, {version: "1", build: "0"}); 

}
