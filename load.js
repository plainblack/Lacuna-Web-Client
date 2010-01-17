(function(){
	var t = "50";
	var loader = new YAHOO.util.YUILoader({
		allowRollup: false,
		combine: false,
		filter: "RAW"			
	});
	loader.addModule({
		name: "smd",
		type: "js",
		fullpath: "http://localhost/lacuna/smd.js?" + t,
		requires : ["yahoo"]
	});
	loader.addModule({
		name: "rpc",
		type: "js",
		fullpath: "http://localhost/lacuna/rpc.js?" + t,
		requires : ["yahoo","dom","connection","get","json"]
	});
	loader.addModule({
		name: "game",
		type: "js",
		fullpath: "http://localhost/lacuna/game.js?" + t,
		requires : ["event","cookie","rpc","smd"]
	});
	loader.addModule({
		name: "createEmpire",
		type: "js",
		fullpath: "http://localhost/lacuna/createEmpire.js?" + t,
		requires : ["game"]
	});
	loader.addModule({
		name: "login",
		type: "js",
		fullpath: "http://localhost/lacuna/login.js?" + t,
		requires : ["container","createEmpire","game"]
	});
	loader.addModule({
		name: "gameMenu",
		type: "js",
		fullpath: "http://localhost/lacuna/menu.js?" + t,
		requires : ["container","game","menu"]
	});
	loader.addModule({
		name: "mapiator",
		type: "js",
		fullpath: "http://localhost/lacuna/Mapiator.js?" + t
	});
	loader.addModule({
		name: "starMap",
		type: "js",
		fullpath: "http://localhost/lacuna/starMap.js?" + t,
		requires : ["game","mapiator"]
	});
	loader.require("gameMenu","login","starMap");
	loader.onSuccess = function(o) {
		YAHOO.lacuna.Game.Start();
	};
	loader.onFailure = function(o) {
		console.log(o);
	};

	loader.insert();
})();