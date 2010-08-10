(function(){
	
	var p = document.getElementById("pulsing");
	if(p.className.indexOf('hidden') < 0) {
		p.className += ' hidden';
	}
	
	
	var t = "1",
		host = "http://localhost/lacuna/"; //https://s3.amazonaws.com/webclient.lacunaexpanse.com/
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
		requires : ["event","cookie","library","pulse","rpc","smd"]
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
		fullpath: host + "mapper.js?" + t,
		requires : ["animation","dom","dragdrop","event","selector"]
	});
	loader.addModule({
		name: "mapStar",
		type: "js",
		fullpath: host + "mapStar.js?" + t,
		requires : ["event-delegate","game","mapper","selector"]
	});
	loader.addModule({
		name: "building",
		type: "js",
		fullpath: host + "building.js?" + t,
		requires : ["game","paginator","selector","tabview"]
	});
	loader.addModule({
		name: "archaeology",
		type: "js",
		fullpath: host + "buildingArchaeology.js?" + t,
		requires : ["animation","building","dragdrop"]
	});
	loader.addModule({
		name: "development",
		type: "js",
		fullpath: host + "buildingDevelopment.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "foodreserve",
		type: "js",
		fullpath: host + "buildingFoodReserve.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "intelligence",
		type: "js",
		fullpath: host + "buildingIntelligence.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "miningministry",
		type: "js",
		fullpath: host + "buildingMiningMinistry.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "network19",
		type: "js",
		fullpath: host + "buildingNetwork19.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "observatory",
		type: "js",
		fullpath: host + "buildingObservatory.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "orestorage",
		type: "js",
		fullpath: host + "buildingOreStorage.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "park",
		type: "js",
		fullpath: host + "buildingPark.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "planetarycommand",
		type: "js",
		fullpath: host + "buildingPlanetaryCommand.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "security",
		type: "js",
		fullpath: host + "buildingSecurity.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "shipyard",
		type: "js",
		fullpath: host + "buildingShipyard.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "spaceport",
		type: "js",
		fullpath: host + "buildingSpacePort.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "wasterecycling",
		type: "js",
		fullpath: host + "buildingWasteRecycling.js?" + t,
		requires : ["building"]
	});
	loader.addModule({
		name: "mapPlanet",
		type: "js",
		fullpath: host + "mapPlanet.js?" + t,
		requires : ["archaeology","development","foodreserve","intelligence","miningministry","network19","observatory","orestorage","park","planetarycommand","security","shipyard","spaceport","wasterecycling","event-delegate","event-mouseenter","mapper","selector"]
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
		requires : ["datasource","event-delegate","game","paginator","textboxList"]
	});
	loader.addModule({
		name: "essentia",
		type: "js",
		fullpath: host + "essentia.js?" + t,
		requires : ["container","game"]
	});
	loader.addModule({
		name: "profile",
		type: "js",
		fullpath: host + "profile.js?" + t,
		requires : ["container","game","tabview"]
	});
	loader.addModule({
		name: "stats",
		type: "js",
		fullpath: host + "stats.js?" + t,
		requires : ["container","datasource","datatable","game","selector","tabview"]
	});
	loader.addModule({
		name: "pulse",
		type: "js",
		fullpath: host + "pulse.js?" + t,
		requires : ["container","dom","event"]
	});
	/*add after requirements*/
	loader.addModule({
		name: "gameMenu",
		type: "js",
		fullpath: host + "menu.js?" + t,
		requires : ["about","essentia","messaging","menu","profile","stats"]
	});
	loader.require("gameMenu","logger","login","mapPlanet","mapStar");
	loader.onSuccess = function(o) {
		YAHOO.widget.Logger.enableBrowserConsole();		
		YAHOO.lacuna.Game.Start();
		progressLoaderC.parentNode.removeChild(progressLoaderC);
	};
	loader.onProgress = function(o) {
		progressLoader.counter++;
		var perc = progressLoader.counter / progressLoader.total;
		progressLoader.style.width = Math.ceil(perc * progressLoaderC.offsetWidth) + "px";
		progressLoader.innerHTML = [Math.round(perc*1000)/10, '% - ', progressLoader.counter < status.length ? status[progressLoader.counter] : o.name].join('');
	};
	loader.onFailure = function(o) {
		YAHOO.log(o);
	};

	//pre calc so we can discover how many files are getting loaded for the progress bar
	loader.calculate();
	
	var status = [
		'loading ships',
		'starting engines',
		'breaking atmo',
		'calculating trajectory',
		'engaging hyper drive',
		'traveling the verse',
		'other witty comments'
	];
	
	var progressLoaderC = document.createElement("div"),
		progressLoader = progressLoaderC.appendChild(progressLoaderC.cloneNode(false));
	//container
	progressLoaderC.id = "loadingProgress";
	progressLoaderC.style.backgroundColor = '#FFD800';
	//progress bar
	progressLoader.counter = 0;
	progressLoader.total = loader.sorted.length;
	progressLoader.style.backgroundColor = "#fff";
	progressLoader.style.textAlign = "left"; 
	progressLoader.style.paddingLeft = "10px"; 
	progressLoader.style.color = "black"; 
	progressLoader.style.height = "30px"; 
	progressLoader.style.lineHeight = "30px"; 
	progressLoader.style.width = "1px";
	progressLoader.innerHTML = status[progressLoader.counter];
	
	document.body.insertBefore(progressLoaderC, document.body.firstChild);

	loader.insert();
})();