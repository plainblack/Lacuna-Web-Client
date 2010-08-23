(function(){
	
	var p = document.getElementById("pulsing");
	if(p.className.indexOf('hidden') < 0) {
		p.className += ' hidden';
	}
	
	
	var t = "1", host;
	/** local */
	host = "http://localhost/lacuna/";
	var loader = new YAHOO.util.YUILoader({
		base: "https://ajax.googleapis.com/ajax/libs/yui/2.8.1/build/",
		filter: "RAW",
		allowRollup: false,
		combine: false
	});
	/** end */
	/** s3
	host = "//s3.amazonaws.com/alpha.lacunaexpanse.com/";
	var loader = new YAHOO.util.YUILoader({
		base: "https://ajax.googleapis.com/ajax/libs/yui/2.8.1/build/",
		filter: "MIN",
		allowRollup: true,
		combine: false
	});
	/** end */

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
		if(firstFile) {
			if(this._combining) {
				progressLoader.total = this.sorted.length - this._combining.length + 1; //remove the count of the files that are getting combined but still record it as 1 file
			}
			else {
				progressLoader.total = this.sorted.length;
			}
			firstFile = undefined;
		}
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
			'other witty comments',
			'reticulating splines',
			'compacting nebulas',
			'colliding asteroids',
			'corroding spreadsheets',
			'irradiating pneumatic systems',
			'constructing universe',
			'detonating luggage',
			'harvesting politicians',
			'inflating government structure',
			'discrediting liquids',
			'camoflaging nerds',
			'villifying heroes',
			'flooding prairies',
			'nebulizing nebulas',
			'spinning plates',
			'fortifying bread',
			'lambasting vampires',
			'elevating vectors',
			'caching favors',
			'predicting history',
			'looking suave',
			'babelizing translations',
			'necrotizing decimals',
			'capitalizing numerals',
			'compressing water',
			'reliving the past',
			'delivering ingots',
			'bottling particles',
			'refactoring physics',
			'cavitating airflow',
			'corrupting time stream',
			'unbalancing gyroscopes',
			'fishing for compliments',
			'refuting evidence',
			'rotating pinions',
			'engaging clutch',
			'ejecting pilot',
			'reciting poetry',
			'investigating rumors',
			'deconstructing philosophies',
			'monetizing colors',
			'digitizing electrolytes',
			'motivating livestock',
			'assuming the worst',
			'ignoring mummies',
			'disconnecting engineers',
			'remembering the future',
			'broadcasting the truth',
			'entertaining the possibility',
			'developing a theory',
			'making friends',
			'oxidizing lizards',
			'<span style="background-color: #000000; color: #ffffff;">&nbsp;&nbsp;&nbsp;&nbsp;[ REDACTED ]&nbsp;&nbsp;&nbsp;</span>',
			'coercing automatons',
			'dissociating ions',
			'taking a break',
			'watching paint dry',
			'decanting the clones',
			'motoring movers',
			'scaping goats',
			'assembling deployments',
			'deploying assemblages'
		],
		firstFile = true,
		progressLoaderC = document.createElement("div"),
		progressLoader = progressLoaderC.appendChild(progressLoaderC.cloneNode(false));
	var i = status.length;
	while ( --i ) {
		var j = Math.floor( Math.random() * ( i + 1 ) );
		var tempi = status[i];
		var tempj = status[j];
		status[i] = tempj;
		status[j] = tempi;
	}
	
	//container
	progressLoaderC.id = "loadingProgress";
	progressLoaderC.style.backgroundColor = '#FFD800';
	progressLoaderC.style.position = 'absolute';
	progressLoaderC.style.top = '30px';
	progressLoaderC.style.left = '30px';
	progressLoaderC.style.right = '30px';
	//progress bar
	progressLoader.counter = 0;
	progressLoader.style.backgroundColor = "#fff";
	progressLoader.style.textAlign = "left"; 
	progressLoader.style.paddingLeft = "10px"; 
	progressLoader.style.color = "black"; 
	progressLoader.style.height = "30px"; 
	progressLoader.style.lineHeight = "30px"; 
	progressLoader.style.width = "1px";
	progressLoader.style.overflow = "visible";
	progressLoader.style.whiteSpace = "nowrap";
	progressLoader.innerHTML = status[progressLoader.counter];
	
	document.body.insertBefore(progressLoaderC, document.body.firstChild);

	loader.insert();
})();
