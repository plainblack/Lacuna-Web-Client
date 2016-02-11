YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.LibraryOfJith == "undefined" || !YAHOO.lacuna.buildings.LibraryOfJith) {
    
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

    var LibraryOfJith = function(result){
        LibraryOfJith.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.LibraryOfJith;
        this.maps = {};
        
        this.subscribe("onLoad", this.createFind, this, true);
    };
    
    Lang.extend(LibraryOfJith, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getTab()];
        },
        _getTab : function() {
            this.libraryTab = new YAHOO.widget.Tab({ label: "Species Library", content: [
                    '<div>',
                    '    <div><label for="lojFindEmpire">Lookup by Empire Name:</label><div style="display:inline-block;width:300px;"><input type="text" id="lojFindEmpire" /></div></div>',
                    '    <ul id="lojDetails" style="margin-top:5px;overflow-y:auto;">',
                    '    </ul>',
                    '</div>'
                ].join('')});
                    
            return this.libraryTab;
        },
        
        createFind : function() {
            this.species = Dom.get("lojDetails");

            var dataSource = new Util.XHRDataSource("/empire");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.empires",
                fields : ["name","id"]
            };
            
            var oTextboxList = new YAHOO.lacuna.TextboxList("lojFindEmpire", dataSource, { //config options
                maxResultsDisplayed: 25,
                minQueryLength:3,
                multiSelect:false,
                forceSelection:false,
                useIndicator:true
            });
            oTextboxList.generateRequest = function(sQuery){                
                var s = Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": "find",
                        "jsonrpc": "2.0",
                        "params": [
                            Game.GetSession(""),
                            decodeURIComponent(sQuery)
                        ]
                    });
                return s;
            };
            oTextboxList.dirtyEvent.subscribe(function(event, isDirty, oSelf){
                var empire = this._oTblSingleSelection.Object;

                oSelf.getSpecies(empire.id);
            },this);
            this.find = oTextboxList;
        },
        
        getSpecies : function(id) {
            require('js/actions/menu/loader').show();
            this.service.research_species({session_id:Game.GetSession(),building_id:this.building.id, empire_id:id}, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.speciesDisplay(o.result.species);
                },
                scope:this
            });
        },
        speciesDisplay : function(stat) {
            this.species.innerHTML = [
                '<li style="border-bottom:1px solid #52ACFF;font-size:120%;"><label>',stat.name,'</label></li>',
                '<li style="padding-bottom:5px;">', stat.description, '</li>',
                '<li>',
                '    <label>Habitable Orbits:</label><span>', stat.min_orbit, stat.max_orbit > stat.min_orbit ? ' to '+ stat.max_orbit : '','</span>',
                '</li>',
                '<li>',
                '    <label>Manufacturing:</label><span>', stat.manufacturing_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Deception:</label><span>', stat.deception_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Research:</label><span>', stat.research_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Management:</label><span>', stat.management_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Farming:</label><span>', stat.farming_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Mining:</label><span>', stat.mining_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Science:</label><span>', stat.science_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Environmental:</label><span>', stat.environmental_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Political:</label><span>', stat.political_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Trade:</label><span>', stat.trade_affinity, '</span>',
                '</li>',
                '<li>',
                '    <label>Growth:</label><span>', stat.growth_affinity, '</span>',
                '</li>'
            ].join('');

            //wait for tab to display first
            setTimeout(function() {
                var Ht = Game.GetSize().h - 180;
                if(Ht > 300) { Ht = 300; }
                var tC = Dom.get('lojDetails');    
                Dom.setStyle(tC,"height",Ht + "px");
                Dom.setStyle(tC,"overflow-y","auto");
            },10);
        }
        
    });
    
    YAHOO.lacuna.buildings.LibraryOfJith = LibraryOfJith;

})();
YAHOO.register("libraryofjith", YAHOO.lacuna.buildings.LibraryOfJith, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
