YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.TempleOfTheDrajilites == "undefined" || !YAHOO.lacuna.buildings.TempleOfTheDrajilites) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Pager = YAHOO.widget.Paginator,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var TempleOfTheDrajilites = function(result){
        TempleOfTheDrajilites.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.TempleOfTheDrajilites;
        this.maps = {};
        
        
        this.subscribe("onLoad", function(){
            this.CreateFind();
            Event.on("planetsDetailsCurrentStar", "click", this.GoToCurrentStar, this, true);
        }, this, true);
    };
    
    Lang.extend(TempleOfTheDrajilites, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getPlanetsTab()];
        },
        _getPlanetsTab : function() {
            this.planetsTab = new YAHOO.widget.Tab({ label: "Planets", content: [
                    '<div>',
                    '    <div><label for="planetsDetailsStarFind">Lookup Star Name:</label><div style="display:inline-block;width:300px;"><input type="text" id="planetsDetailsStarFind" /></div> or <button type="button" id="planetsDetailsCurrentStar">Go To Current Star</button></div>',
                    '    <div id="planetsDetailsMessage"></div>',
                    '    <div class="clearafter">',
                    '        <ul id="planetsDetails" class="planetsInfo">',
                    '        </ul>',
                    '    </div>',
                    '</div>'
                ].join('')});
            //this.planetsTab.subscribe("activeChange", this.GetPlanets, this, true);
                    
            return this.planetsTab;
        },
        
        CreateFind : function() {
            if(!this.findStar) {
                var dataSource = new Util.XHRDataSource("/map");
                dataSource.connMethodPost = "POST";
                dataSource.maxCacheEntries = 2;
                dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                dataSource.responseSchema = {
                    resultsList : "result.stars",
                    fields : ["name","color","x","y","id"]
                };
                
                var oTextboxList = new YAHOO.lacuna.TextboxList("planetsDetailsStarFind", dataSource, { //config options
                    maxResultsDisplayed: 25,
                    minQueryLength:3,
                    multiSelect:false,
                    forceSelection:false,
                    useIndicator:true
                });
                oTextboxList.formatResult = function(oResultData, sQuery, sResultMatch) {
                    return [
                        '<div class="yui-gf">',
                        '    <div class="yui-u first" style="background-color:black;">',
                        '        <img src="',Lib.AssetUrl,'star_map/',oResultData.color,'.png" alt="',oResultData,name,'" style="width:50px;height:50px;" />',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <div>',oResultData.name,'</div>',
                        '        <div>',oResultData.x,' : ',oResultData.y,'</div>',
                        '    </div>',
                        '</div>'].join("");
                };
                oTextboxList.generateRequest = function(sQuery){                
                    var s = Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "search_stars",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                decodeURIComponent(sQuery)
                            ]
                        });
                    return s;
                };
                oTextboxList.dirtyEvent.subscribe(function(event, isDirty, oSelf){
                    var star = this._oTblSingleSelection.Object;

                    oSelf.GetPlanets(star.id);
                },this);
                this.findStar = oTextboxList;
            }
        },
        GoToCurrentStar : function() {
            this.GetPlanets(Game.GetCurrentPlanet().star_id);
        },
        
        GetPlanets : function(starId) {
            require('js/actions/menu/loader').show();
            this.service.list_planets({session_id:Game.GetSession(),building_id:this.building.id, star_id:starId}, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.planets = o.result.planets;
                    this.PlanetsDisplay();
                },
                failure : function(o){
                    var msg = Dom.get("planetsDetailsMessage"),
                        planetsDetails = Dom.get("planetsDetails");
                    
                    msg.innerHTML = o.error.message;
                    Event.purgeElement(planetsDetails);
                    planetsDetails.innerHTML = "";
                    return true;
                },
                scope:this
            });
        },
        PlanetsDisplay : function() {
            var planets = this.planets,
                planetsDetails = Dom.get("planetsDetails");
                
            if(planetsDetails) {
                Event.purgeElement(planetsDetails);
                planetsDetails.innerHTML = "";
                
                var li = document.createElement("li");
                
                for(var i=0; i<planets.length; i++) {
                    var pt = planets[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.Planet = pt;
                    Dom.addClass(nLi,"planetDisplay");
                    
                    nLi.innerHTML = pt.name;
                    
                    nLi = planetsDetails.appendChild(nLi);
                    Event.on(nLi, "click", this.PlanetView, this, true);
                }
            }
        },
        PlanetView : function(e) {
            var nLi = Event.getTarget(e);
            if(nLi.Planet) {
                if(!this.maps[nLi.Planet.id]) {
                    require('js/actions/menu/loader').show();
                    this.service.view_planet({session_id:Game.GetSession(),building_id:this.building.id,planet_id:nLi.Planet.id}, {
                        success : function(o){
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.maps[nLi.Planet.id] = o.result.map;
                            Lacuna.Messaging._load();
                            Lacuna.Messaging.attachmentPanel.load(o.result.map);
                        },
                        scope:this
                    });
                }
                else {
                    Lacuna.Messaging.attachmentPanel.load(this.maps[nLi.Planet.id]);
                }
            }
        }

    });
    
    YAHOO.lacuna.buildings.TempleOfTheDrajilites = TempleOfTheDrajilites;

})();
YAHOO.register("templeofthedrajilites", YAHOO.lacuna.buildings.TempleOfTheDrajilites, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
