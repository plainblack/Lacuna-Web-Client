YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.OracleOfAnid == "undefined" || !YAHOO.lacuna.buildings.OracleOfAnid) {
    
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

    var OracleOfAnid = function(result){
        OracleOfAnid.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.OracleOfAnid;
        this.maps = {};
        
        
        this.subscribe("onLoad", function(){
            this.CreateFind();
            Event.on("oracleCurrentStar", "click", this.GoToCurrentStar, this, true);
            
            this.oracleStar = Dom.get("oracleStar");
            this.oraclePlanets = {
                1:Dom.get("oraclePlanetOne"),
                2:Dom.get("oraclePlanetTwo"),
                3:Dom.get("oraclePlanetThree"),
                4:Dom.get("oraclePlanetFour"),
                5:Dom.get("oraclePlanetFive"),
                6:Dom.get("oraclePlanetSix"),
                7:Dom.get("oraclePlanetSeven"),
                8:Dom.get("oraclePlanetEight")
            };
            
            Event.delegate("oracleDisplay", "click", this.DisplayClick, "div.tile", this, true);
            
        }, this, true);
    };
    
    Lang.extend(OracleOfAnid, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getTab()];
        },
        _getTab : function() {
            this.tab = new YAHOO.widget.Tab({ label: "Oracle", content: [
                    '<div>',
                    '    <div><label for="oracleStarFind">Lookup Star Name:</label><div style="display:inline-block;width:300px;"><input type="text" id="oracleStarFind" /></div> or <button type="button" id="oracleCurrentStar">Go To Current Star</button></div>',
                    '    <div id="oracleMessage" style="font-weight: bold; margin: 5px;"></div>',
                    '    <div id="oracleDisplay" style="position:relative;height:150px;width:700px;background:black url(',Lib.AssetUrl,'star_system/field.png);">',
                    '        <div id="oracleStar" class="tile" style="position:absolute;height:150px;width:150px;left:0px;top:0px;"></div>',
                    '        <div id="oraclePlanetOne" class="tile" style="position:absolute;height:50px;width:50px;left:150px;top:50px;"></div>',
                    '        <div id="oraclePlanetTwo" class="tile" style="position:absolute;height:50px;width:50px;left:210px;top:50px;"></div>',
                    '        <div id="oraclePlanetThree" class="tile" style="position:absolute;height:50px;width:50px;left:270px;top:50px;"></div>',
                    '        <div id="oraclePlanetFour" class="tile" style="position:absolute;height:50px;width:50px;left:330px;top:50px;"></div>',
                    '        <div id="oraclePlanetFive" class="tile" style="position:absolute;height:50px;width:50px;left:390px;top:50px;"></div>',
                    '        <div id="oraclePlanetSix" class="tile" style="position:absolute;height:50px;width:50px;left:450px;top:50px;"></div>',
                    '        <div id="oraclePlanetSeven" class="tile" style="position:absolute;height:50px;width:50px;left:510px;top:50px;"></div>',
                    '        <div id="oraclePlanetEight" class="tile" style="position:absolute;height:50px;width:50px;left:570px;top:50px;"></div>',
                    '    </div>',
                    '</div>'
                ].join('')});
                    
            return this.tab;
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
                
                var oTextboxList = new YAHOO.lacuna.TextboxList("oracleStarFind", dataSource, { //config options
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

                    oSelf.GetStar(star.id);
                },this);
                this.findStar = oTextboxList;
            }
        },
        GoToCurrentStar : function() {
            this.GetStar(Game.GetCurrentPlanet().star_id);
        },
        
        GetStar : function(starId) {
            require('js/actions/menu/loader').show();
            this.service.get_star({session_id:Game.GetSession(),building_id:this.building.id, star_id:starId}, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.star = o.result.star;
                    Dom.get("oracleMessage").innerHTML = this.star.name;
                    this.Display();
                },
                failure : function(o){
                    Dom.get("oracleMessage").innerHTML = o.error.message;
                    return true;
                },
                scope:this
            });
        },
        Display : function() {
            this.oraclePlanetsData = {};
            if(this.oracleStar) {
                var planets = this.star.bodies,
                    tileSize = 50;
                    
                this.oracleStar.innerHTML = ['<img title="',this.star.name,'" src="',Lib.AssetUrl,'star_map/',this.star.color,'.png','" class="star" style="width:',(tileSize*3),'px;height:',(tileSize*3),'px;" />'].join('');
                this.oraclePlanets[1].innerHTML = "";
                this.oraclePlanets[2].innerHTML = "";
                this.oraclePlanets[3].innerHTML = "";
                this.oraclePlanets[4].innerHTML = "";
                this.oraclePlanets[5].innerHTML = "";
                this.oraclePlanets[6].innerHTML = "";
                this.oraclePlanets[7].innerHTML = "";
                this.oraclePlanets[8].innerHTML = "";
                
                for(var n=0; n<planets.length; n++) {
                    var data = planets[n],
                        div = this.oraclePlanets[data.orbit],
                        pSize = ((100 - Math.abs(data.size - 100)) / (100 / tileSize)) + 15,
                        style = ['width:',pSize,'px;height:',pSize,'px;margin-top:',Math.floor(((tileSize - pSize) / 2)),'px;position:absolute;top:0;left:0;'].join(''),
                        pImg = data.image.substr(0,data.image.length-1) + '2';
                        
                    this.oraclePlanetsData[data.orbit] = data;
                        
                    var html = ['<img title="',data.name,' (',data.x,',',data.y,')" src="',Lib.AssetUrl,'star_system/',pImg,'.png','" class="planet planet',data.orbit,'" style="',style,'" />'];
                    if(data.empire) {
                        html = html.concat(['<img title="',data.name,' (',data.x,',',data.y,')" src="',Lib.AssetUrl,'star_map/',data.empire.alignment,'.png" class="planet" style="',style,'z-index:2;" />']);
                    }
                    div.innerHTML = html.join('');
                }
            }
        },
        DisplayClick : function(e, matchedEl, container) {
            if(matchedEl.id == "oracleStar") {
                YAHOO.lacuna.MapStar.ShowStar({data:this.star}, true);
            }
            else {
                var planet;
                switch(matchedEl.id) {
                    case "oraclePlanetOne":
                        planet = this.oraclePlanetsData[1];
                        break;
                    case "oraclePlanetTwo":
                        planet = this.oraclePlanetsData[2];
                        break;
                    case "oraclePlanetThree":
                        planet = this.oraclePlanetsData[3];
                        break;
                    case "oraclePlanetFour":
                        planet = this.oraclePlanetsData[4];
                        break;
                    case "oraclePlanetFive":
                        planet = this.oraclePlanetsData[5];
                        break;
                    case "oraclePlanetSix":
                        planet = this.oraclePlanetsData[6];
                        break;
                    case "oraclePlanetSeven":
                        planet = this.oraclePlanetsData[7];
                        break;
                    case "oraclePlanetEight":
                        planet = this.oraclePlanetsData[8];
                        break;
                }
                YAHOO.lacuna.MapStar.ShowPlanet({data:planet}, true);
            }
        }

    });
    
    YAHOO.lacuna.buildings.OracleOfAnid = OracleOfAnid;

})();
YAHOO.register("OracleOfAnid", YAHOO.lacuna.buildings.OracleOfAnid, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
