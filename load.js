(function(){
    var l = window.location;
    var query = {};
    var vars = l.hash.substring(1).split('&');
    if (vars.length > 0) {
        for (var i=0; i<vars.length; i++) {
            var pair = vars[i].split("=");
            query[pair[0]] = decodeURIComponent(pair[1]);
        }
    }
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, l.protocol+'//'+l.host+l.pathname+l.search);
    }
    else if (l.hash != '') {
        l.hash = '';
    }

    var p = document.getElementById("pulsing");
    if(p.className.indexOf('hidden') < 0) {
        p.className += ' hidden';
    }

/** BUILD
    var host = '**CODEROOT';
    var loader = new YAHOO.util.YUILoader({
        base: "//ajax.googleapis.com/ajax/libs/yui/2.8.2r1/build/",
        filter: "MIN",
        allowRollup: true,
        combine: false
    });
    var urlBuilder = function(file) {
        return host + file;
    };
/** END */
/** DEBUG */
    var host = window.lacuna_code_base_url || window.lacuna_s3_base_url;
    var loader = new YAHOO.util.YUILoader({
        base: "//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/",
        filter: "RAW",
        allowRollup: false,
        combine: false
    });
    var urlBuilder = function(file) {
        return host + file + '?5';
    };
/** END */

    loader.addModule({
        name: "smd",
        type: "js",
        fullpath: urlBuilder("smd.js"),
        requires : ["yahoo"]
    });
    loader.addModule({
        name: "rpc",
        type: "js",
        fullpath: urlBuilder("rpc.js"),
        requires : ["yahoo","dom","connection","get","json"]
    });
    loader.addModule({
        name: "library",
        type: "js",
        fullpath: urlBuilder("library.js"),
        requires : ["yahoo","dom"]
    });
    loader.addModule({
        name: "game",
        type: "js",
        fullpath: urlBuilder("game.js"),
        requires : ["event","cookie","library","pulse","rpc","smd"]
    });
    loader.addModule({
        name: "about",
        type: "js",
        fullpath: urlBuilder("about.js"),
        requires : ["container","event","game"]
    });
    loader.addModule({
        name: "announce",
        type: "js",
        fullpath: urlBuilder("announce.js"),
        requires : ["container","game"]
    });
    loader.addModule({
        name: "speciesDesigner",
        type: "js",
        fullpath: urlBuilder("speciesDesigner.js"),
        requires : ["dragdrop","game","slider"]
    });
    loader.addModule({
        name: "createSpecies",
        type: "js",
        fullpath: urlBuilder("createSpecies.js"),
        requires : ["game","speciesDesigner"]
    });
    loader.addModule({
        name: "createEmpire",
        type: "js",
        fullpath: urlBuilder("createEmpire.js"),
        requires : ["createSpecies"]
    });
    loader.addModule({
        name: "login",
        type: "js",
        fullpath: urlBuilder("login.js"),
        requires : ["container","createEmpire","game"]
    });
    loader.addModule({
        name: "mapper",
        type: "js",
        fullpath: urlBuilder("mapper.js"),
        requires : ["animation","dom","dragdrop","game","selector"]
    });
    loader.addModule({
        name: "mapStar",
        type: "js",
        fullpath: urlBuilder("mapStar.js"),
        requires : ["event-delegate","game","mapper","selector"]
    });
    //buildings
    loader.addModule({
        name: "building",
        type: "js",
        fullpath: urlBuilder("building.js"),
        requires : ["game","paginator","selector","tabview"]
    });
    loader.addModule({
        name: "archaeology",
        type: "js",
        fullpath: urlBuilder("buildingArchaeology.js"),
        requires : ["animation","building","dragdrop"]
    });
    loader.addModule({
        name: "blackholegenerator",
        type: "js",
        fullpath: urlBuilder("buildingBlackHoleGenerator.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "capitol",
        type: "js",
        fullpath: urlBuilder("buildingCapitol.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "development",
        type: "js",
        fullpath: urlBuilder("buildingDevelopment.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "distributioncenter",
        type: "js",
        fullpath: urlBuilder("buildingDistributionCenter.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "embassy",
        type: "js",
        fullpath: urlBuilder("buildingEmbassy.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "energyreserve",
        type: "js",
        fullpath: urlBuilder("buildingEnergyReserve.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "entertainment",
        type: "js",
        fullpath: urlBuilder("buildingEntertainment.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "essentiavein",
        type: "js",
        fullpath: urlBuilder("buildingEssentiaVein.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "foodreserve",
        type: "js",
        fullpath: urlBuilder("buildingFoodReserve.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "geneticslab",
        type: "js",
        fullpath: urlBuilder("buildingGeneticsLab.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "intelligence",
        type: "js",
        fullpath: urlBuilder("buildingIntelligence.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "inteltraining",
        type: "js",
        fullpath: urlBuilder("buildingIntelTraining.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "libraryofjith",
        type: "js",
        fullpath: urlBuilder("buildingLibraryOfJith.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "mayhemtraining",
        type: "js",
        fullpath: urlBuilder("buildingMayhemTraining.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "mercenariesguild",
        type: "js",
        fullpath: urlBuilder("buildingMercenariesGuild.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "miningministry",
        type: "js",
        fullpath: urlBuilder("buildingMiningMinistry.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "missioncommand",
        type: "js",
        fullpath: urlBuilder("buildingMissionCommand.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "network19",
        type: "js",
        fullpath: urlBuilder("buildingNetwork19.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "observatory",
        type: "js",
        fullpath: urlBuilder("buildingObservatory.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "oracleofanid",
        type: "js",
        fullpath: urlBuilder("buildingOracleOfAnid.js"),
        requires : ["building","mapStar"]
    });
    loader.addModule({
        name: "orestorage",
        type: "js",
        fullpath: urlBuilder("buildingOreStorage.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "park",
        type: "js",
        fullpath: urlBuilder("buildingPark.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "planetarycommand",
        type: "js",
        fullpath: urlBuilder("buildingPlanetaryCommand.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "politicstraining",
        type: "js",
        fullpath: urlBuilder("buildingPoliticsTraining.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "security",
        type: "js",
        fullpath: urlBuilder("buildingSecurity.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "shipyard",
        type: "js",
        fullpath: urlBuilder("buildingShipyard.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "spaceport",
        type: "js",
        fullpath: urlBuilder("buildingSpacePort.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "spacestationlab",
        type: "js",
        fullpath: urlBuilder("buildingSpaceStationLab.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "subspacesupplydepot",
        type: "js",
        fullpath: urlBuilder("buildingSubspaceSupplyDepot.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "templeofthedrajilites",
        type: "js",
        fullpath: urlBuilder("buildingTempleOfTheDrajilites.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "thefttraining",
        type: "js",
        fullpath: urlBuilder("buildingTheftTraining.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "themepark",
        type: "js",
        fullpath: urlBuilder("buildingThemePark.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "thedillonforge",
        type: "js",
        fullpath: urlBuilder("buildingTheDillonForge.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "trade",
        type: "js",
        fullpath: urlBuilder("buildingTradeMinistry.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "transporter",
        type: "js",
        fullpath: urlBuilder("buildingTransporter.js"),
        requires : ["building","trade"]
    });
    loader.addModule({
        name: "wasteexchanger",
        type: "js",
        fullpath: urlBuilder("buildingWasteExchanger.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "wasterecycling",
        type: "js",
        fullpath: urlBuilder("buildingWasteRecycling.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "waterstorage",
        type: "js",
        fullpath: urlBuilder("buildingWaterStorage.js"),
        requires : ["building"]
    });
    //modules
    loader.addModule({
        name: "parliament",
        type: "js",
        fullpath: urlBuilder("moduleParliament.js"),
        requires : ["building"]
    });
    loader.addModule({
        name: "policestation",
        type: "js",
        fullpath: urlBuilder("modulePoliceStation.js"),
        requires : ["security"]
    });
    loader.addModule({
        name: "stationcommand",
        type: "js",
        fullpath: urlBuilder("moduleStationCommand.js"),
        requires : ["planetarycommand"]
    });
    //
    loader.addModule({
        name: "mapPlanet",
        type: "js",
        fullpath: urlBuilder("mapPlanet.js"),
        requires : [
            //buildings
            "archaeology",
            "blackholegenerator",
            "capitol",
            "development",
            "distributioncenter",
            "embassy",
            "energyreserve",
            "entertainment",
            "essentiavein",
            "foodreserve",
            "geneticslab",
            "intelligence",
            "inteltraining",
            "libraryofjith",
            "mayhemtraining",
            "mercenariesguild",
            "miningministry",
            "missioncommand",
            "network19",
            "observatory",
            "oracleofanid",
            "orestorage",
            "park",
            "planetarycommand",
            "politicstraining",
            "security",
            "shipyard",
            "spaceport",
            "spacestationlab",
            "subspacesupplydepot",
            "templeofthedrajilites",
            "thefttraining",
            "themepark",
            "thedillonforge",
            "trade",
            "transporter",
            "waterstorage",
            "wasteexchanger",
            "wasterecycling",
            //modules
            "parliament",
            "policestation",
            "stationcommand",
            //helpers
            "event-delegate",
            "event-mouseenter",
            "mapper",
            "selector"
        ]
    });
    loader.addModule({
        name: "textboxList",
        type: "js",
        fullpath: urlBuilder("textboxList.js"),
        requires : ["autocomplete","library"]
    });
    loader.addModule({
        name: "messaging",
        type: "js",
        fullpath: urlBuilder("messaging.js"),
        requires : ["datasource","event-delegate","game","paginator","textboxList"]
    });
    loader.addModule({
        name: "essentia",
        type: "js",
        fullpath: urlBuilder("essentia.js"),
        requires : ["container","game","tabview"]
    });
    loader.addModule({
        name: "invite",
        type: "js",
        fullpath: urlBuilder("invite.js"),
        requires : ["container","game"]
    });
    loader.addModule({
        name: "profile",
        type: "js",
        fullpath: urlBuilder("profile.js"),
        requires : ["container","game","tabview","speciesDesigner"]
    });
    loader.addModule({
        name: "stats",
        type: "js",
        fullpath: urlBuilder("stats.js"),
        requires : ["container","datasource","datatable","game","selector","tabview"]
    });
    loader.addModule({
        name: "pulse",
        type: "js",
        fullpath: urlBuilder("pulse.js"),
        requires : ["container","dom","event"]
    });
    loader.addModule({
        name: "info",
        type: "js",
        fullpath: urlBuilder("info.js"),
        requires : ["container","dom","game"]
    });
    loader.addModule({
        name: "notify",
        type: "js",
        fullpath: urlBuilder("notify.js"),
        requires : ["container","dom","game"]
    });
    loader.addModule({
        name: "captcha",
        type: "js",
        fullpath: urlBuilder("captcha.js"),
        requires : ["container","dom","game"]
    });
    /*add after requirements*/
    loader.addModule({
        name: "gameMenu",
        type: "js",
        fullpath: urlBuilder("menu.js"),
        // invite has to come before essentia in order for the friend invite button to work
        requires : ["about","info","invite","essentia","messaging","menu","profile","stats"]
    });
    loader.require("gameMenu","announce","info","logger","login","mapPlanet","mapStar","notify","captcha");
    loader.onSuccess = function(o) {
        YAHOO.widget.Logger.enableBrowserConsole();
        YAHOO.lacuna.Game.Start(query);
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
            'travelling the verse',
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
            'vilifying heroes',
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
            'deploying assemblages',
            'taking candy from a baby',
            'turning water into wine',
            'making it go',
            'spelunking for camels',
            'perambulating procedures',
            'kicking the tires',
            'setting launch codes',
            'defining reality',
            'making a list',
            'checking it twice',
            'delving into the unthinkable',
            'doing the impossible',
            'pushing the button'
        ],
        firstFile = true,
        progressLoaderC = document.createElement("div"),
        progressLoader = progressLoaderC.appendChild(progressLoaderC.cloneNode(false));
    var s = status.length;
    while ( --s ) {
        var j = Math.floor( Math.random() * ( s + 1 ) );
        var tempi = status[s];
        var tempj = status[j];
        status[s] = tempj;
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


    var appendScripts = function(sources, callback) {
      if (source = sources.shift()) {
          var scriptTag = document.createElement('script');
          scriptTag.src = source;
          scriptTag.onload = function() {
            appendScripts(sources, callback);
          };
          document.body.appendChild(scriptTag);
      } else {
        callback();
      }
    }

    appendScripts([
      // Insert js libraries to load here.
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'

  ], function() {
    // This kicks off the load process for all the YUI stuff.
    loader.insert();
  });

})();
// vim: noet:ts=4:sw=4
