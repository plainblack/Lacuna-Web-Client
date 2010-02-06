(function(){
	var t = "112",
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
		name: "game",
		type: "js",
		fullpath: host + "game.js?" + t,
		requires : ["event","cookie","rpc","smd"]
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
		name: "gameMenu",
		type: "js",
		fullpath: host + "menu.js?" + t,
		requires : ["container","game","menu"]
	});
	loader.addModule({
		name: "mapiator",
		type: "js",
		fullpath: host + "Mapiator.js?" + t
	});
	loader.addModule({
		name: "mapStar",
		type: "js",
		fullpath: host + "mapStar.js?" + t,
		requires : ["event-delegate","game","mapiator","selector"]
	});
	loader.addModule({
		name: "mapSystem",
		type: "js",
		fullpath: host + "mapSystem.js?" + t,
		requires : ["game"]
	});
	loader.require("gameMenu","login","mapStar","mapSystem");
	loader.onSuccess = function(o) {
		console.log("version " + t);
		YAHOO.lacuna.Game.Start();
	};
	loader.onFailure = function(o) {
		console.log(o);
	};

	loader.insert();
})();