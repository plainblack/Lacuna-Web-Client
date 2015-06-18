YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Network19 == "undefined" || !YAHOO.lacuna.buildings.Network19) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Network19 = function(result){
        Network19.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Network19;
    };
    
    Lang.extend(Network19, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getCoverageTab()];
        },
        _getCoverageTab : function() {
            this.coverageTab = new YAHOO.widget.Tab({ label: "Coverage", content: [
                    '<div id="newsCoverageContainer">',
                    '    <span id="newsCoverageText">',this.result.restrict_coverage == "1" ? 'Coverage is current restricted' : 'News is flowing freely', '</span>',
                    '    : <button id="newsCoverage" type="button">',(this.result.restrict_coverage == "1" ? 'Open Coverage' : 'Restrict Coverage'),'</button>',
                    '</div>',
                    '<div class="newsFeedContainer">',
                    '    <ul id="newsFeed">',
                    '    </ul>',
                    '</div>',
                    '<div class="newsRssLinksContainer">',
                    '    <ul id="newsRssLinks" class="clearafter">',
                    '    </ul>',
                    '</div>'
                ].join('')});
            this.coverageTab.subscribe("activeChange", this.NewsGet, this, true);

            Event.on("newsCoverage", "click", this.NewsCoverage, this, true);
                    
            return this.coverageTab;
        },

        NewsCoverage : function(e) {
            var target = Event.getTarget(e),
                isRestrict = 1;
            target.disabled = true;
            if(target.innerHTML == "Open Coverage") {
                isRestrict = 0;
            }

            require('js/actions/menu/loader').show();
            this.service.restrict_coverage({session_id:Game.GetSession(),building_id:this.result.building.id,onoff:isRestrict}, {
                success : function(o){
                    YAHOO.log(o, "info", "Network19.NewsCoverage.restrict_coverage.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    Dom.get("newsCoverageText").innerHTML = isRestrict ? 'Coverage is currently restricted' : 'News is flowing freely';
                    target.innerHTML = isRestrict ? 'Open Coverage' : 'Restrict Coverage';
                    target.disabled = false;
                },
                failure : function(o){
                    target.disabled = false;
                },
                scope:this
            });
        },
        NewsGet : function() {
            require('js/actions/menu/loader').show();
            this.service.view_news({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    YAHOO.log(o, "info", "Network19.NewsGet.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    var news = o.result.news,
                        newsFeed = Dom.get("newsFeed");
                        
                    if(newsFeed) {
                        var feedFrag = document.createDocumentFragment(),
                            rss = o.result.feeds,
                            newsRssLinks = Dom.get("newsRssLinks"),
                            rssFrag = document.createDocumentFragment(),
                            li = document.createElement("li");
                        
                        
                        newsFeed.innerHTML = "";
                        newsRssLinks.innerHTML = "";
                            
                        for(var i=0; i<news.length; i++) {
                            var ni = news[i],
                                nLi = li.cloneNode(false);
                            Dom.addClass(nLi, "newsHeadline");
                            nLi.innerHTML = [Lib.formatServerDateShort(ni.date), ": ", ni.headline].join('');
                            feedFrag.appendChild(nLi);
                        }
                        newsFeed.appendChild(feedFrag);
                        
                        for(var key in rss) {
                            if(rss.hasOwnProperty(key)){
                                var link = rss[key],
                                    rssLi = li.cloneNode(false);
                                Dom.addClass(rssLi, "newsRssLink");
                                rssLi.innerHTML = [key, '<a href="', link, '" target="_blank"><img src="', Lib.AssetUrl, 'ui/rss.png" alt="rss" style="margin-left:1px" /></a>'].join('');
                                rssFrag.appendChild(rssLi);
                            }
                        }
                        newsRssLinks.appendChild(rssFrag);
                    }
                },
                scope:this
            });
        }
        
    });
    
    YAHOO.lacuna.buildings.Network19 = Network19;

})();
YAHOO.register("network19", YAHOO.lacuna.buildings.Network19, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
