'use strict';

(function(){

    // TODO this code can be improved.
    var l = window.location;
    var query = {};
    var vars = l.hash.substring(1).split('&');
    if (vars.length > 0) {
        for (var i=0; i<vars.length; i++) {
            var pair = vars[i].split('=');
            query[pair[0]] = decodeURIComponent(pair[1]);
        }
    }
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, l.protocol+'//'+l.host+l.pathname+l.search);
    }
    else if (l.hash != '') {
        l.hash = '';
    }

    var loader = new YAHOO.util.YUILoader({
        base: '//ajax.googleapis.com/ajax/libs/yui/2.8.2r1/build/',
        //filter: 'MIN',
        allowRollup: true,
        combine: false
    });

    // List of YUI2 components that need to be loaded.
    loader.require([
        'animation',
        'autocomplete',
        'connection',
        'container',
        'cookie',
        'datatable',
        'dom',
        'dragdrop',
        'event-delegate',
        'event-mouseenter',
        'event',
        'get',
        'json',
        'logger',
        'menu',
        'paginator',
        'selector',
        'slider',
        'tabview',
        'yahoo'
    ]);

    loader.onSuccess = function(o) {


        ///////////////////////////////////////////////////////////////////////////////
        // WARNING: IF YOU CHANGE THE ORDER OF THESE, THINGS WILL NOT LOAD PROPERLY! //
        ///////////////////////////////////////////////////////////////////////////////


        // RPC and core stuff
        require('js/library');
        require('js/textboxList');
        require('js/smd');
        require('js/rpc');
        require('js/game');

        // Empire management and star map
        require('js/announce');
        require('js/speciesDesigner');
        require('js/createSpecies');
        require('js/createEmpire');
        require('js/login');
        require('js/mapper');
        require('js/mapStar');

        // Buildings
        require('js/building');
        require('js/building/archaeology');
        require('js/building/blackHoleGenerator');
        require('js/building/capitol');
        require('js/building/development');
        require('js/building/distributionCenter');
        require('js/building/embassy');
        require('js/building/energyReserve');
        require('js/building/entertainment');
        require('js/building/essentiaVein');
        require('js/building/foodReserve');
        require('js/building/geneticsLab');
        require('js/building/intelligence');
        require('js/building/intelTraining');
        require('js/building/libraryOfJith');
        require('js/building/mayhemTraining');
        require('js/building/mercenariesGuild');
        require('js/building/miningMinistry');
        require('js/building/missionCommand');
        require('js/building/network19');
        require('js/building/observatory');
        require('js/building/oracleOfAnid');
        require('js/building/oreStorage');
        require('js/building/park');
        require('js/building/planetaryCommand');
        require('js/building/politicsTraining');
        require('js/building/security');
        require('js/building/shipyard');
        require('js/building/spacePort');
        require('js/building/spaceStationLab');
        require('js/building/subspaceSupplyDepot');
        require('js/building/templeOfTheDrajilites');
        require('js/building/theftTraining');
        require('js/building/themePark');
        require('js/building/theDillonForge');
        require('js/building/tradeMinistry');
        require('js/building/transporter');
        require('js/building/wasteExchanger');
        require('js/building/wasteRecycling');
        require('js/building/waterStorage');
        require('js/module/parliament');
        require('js/module/policeStation');
        require('js/module/stationCommand');


        // Menu stuff
        require('js/mapPlanet');
        require('js/messaging');

        // invite has to come before essentia for some reason.
        require('js/invite');
        require('js/essentia');
        require('js/profile');
        require('js/stats');
        require('js/info');
        require('js/notify');
        require('js/captcha');
        require('js/components/menu');

        // Start everything!
        YAHOO.widget.Logger.enableBrowserConsole();
        YAHOO.lacuna.Game.Start(query);
    };

    // Start the loading process.
    loader.insert();

})();
// vim: noet:ts=4:sw=4
