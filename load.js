(function(){
	var t = "1",
		host = "http://localhost/lacuna/";
	var loader = new YAHOO.util.YUILoader({
		allowRollup: false,
		combine: false,
		filter: "RAW"			
	});
	loader.addModule({
		name: "smd",
		type: "js",
		fullpath: host + "smd.js?" + t,
		requires : ["yahoo"]
	});
	loader.addModule({
		name: "rpc",
		type: "js",
		fullpath: host + "rpc.js?" + t,
		requires : ["yahoo","dom","connection","get","json"]
	});
	loader.addModule({
		name: "library",
		type: "js",
		fullpath: host + "library.js?" + t,
		requires : ["yahoo","dom"]
	});
	loader.addModule({
		name: "game",
		type: "js",
		fullpath: host + "game.js?" + t,
		requires : ["event","cookie","library","rpc","smd"]
	});
	loader.addModule({
		name: "about",
		type: "js",
		fullpath: host + "about.js?" + t,
		requires : ["container","event","game"]
	});
	loader.addModule({
		name: "createSpecies",
		type: "js",
		fullpath: host + "createSpecies.js?" + t,
		requires : ["dragdrop","game","slider"]
	});
	loader.addModule({
		name: "createEmpire",
		type: "js",
		fullpath: host + "createEmpire.js?" + t,
		requires : ["createSpecies"]
	});
	loader.addModule({
		name: "login",
		type: "js",
		fullpath: host + "login.js?" + t,
		requires : ["container","createEmpire","game"]
	});
	loader.addModule({
		name: "mapper",
		type: "js",
		fullpath: host + "mapper.js?" + t
	});
	loader.addModule({
		name: "mapStar",
		type: "js",
		fullpath: host + "mapStar.js?" + t,
		requires : ["event-delegate","game","mapper","selector"]
	});
	loader.addModule({
		name: "mapSystem",
		type: "js",
		fullpath: host + "mapSystem.js?" + t,
		requires : ["game","selector","tabview"]
	});
	loader.addModule({
		name: "mapPlanet",
		type: "js",
		fullpath: host + "mapPlanet.js?" + t,
		requires : ["event-delegate","event-mouseenter","game","mapper","selector","tabview"]
	});
	loader.addModule({
		name: "textboxList",
		type: "js",
		fullpath: host + "textboxList.js?" + t,
		requires : ["autocomplete","library"]
	});
	loader.addModule({
		name: "messaging",
		type: "js",
		fullpath: host + "messaging.js?" + t,
		requires : ["datasource","event-delegate","game","textboxList"]
	});
	loader.addModule({
		name: "profile",
		type: "js",
		fullpath: host + "profile.js?" + t,
		requires : ["container","game"]
	});
	/*add after requirements*/
	loader.addModule({
		name: "gameMenu",
		type: "js",
		fullpath: host + "menu.js?" + t,
		requires : ["about","messaging","menu"]
	});
	loader.require("gameMenu","logger","login","mapPlanet","mapStar","mapSystem","profile");
	loader.onSuccess = function(o) {
		YAHOO.widget.Logger.enableBrowserConsole();
		YAHOO.lacuna.Game.Start();
		//YAHOO.util.Event.throwErrors = true;
	};
	loader.onFailure = function(o) {
		YAHOO.log(o);
	};

	loader.insert();
})();