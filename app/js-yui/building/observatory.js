YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Observatory == "undefined" || !YAHOO.lacuna.buildings.Observatory) {
    
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

    var Observatory = function(result){
        Observatory.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Observatory;
    };
    
    Lang.extend(Observatory, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.pager) {
                this.pager.destroy();
            }
            Observatory.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getProbesTab(), this._getAbandonAllProbesTab()];
        },
        _getProbesTab : function() {
            this.probesTab = new YAHOO.widget.Tab({ label: "Probes", content: [
                    '<div>',
                    '    <div id="observatoryInfo"></div>',
                    '    <div class="probeContainer clearafter">',
                    '        <ul id="probeDetails" class="probeInfo">',
                    '        </ul>',
                    '    </div>',
                    '    <div id="probePaginator"></div>',
                    '</div>'
                ].join('')});
            this.probesTab.subscribe("activeChange", this.GetProbes, this, true);
                    
            return this.probesTab;
        },
        _getAbandonAllProbesTab : function() {
            this.probesTab = new YAHOO.widget.Tab({ label: "Abandon All Probes", content: [
                    '<div>',
                    '    <button type="button" id="observatoryBigRedButton">Abandon All Probes!</button>',
                    '</div>'
                ].join('')});
            
            Event.on("observatoryBigRedButton", "click", this.AbandonAllProbes, this, true);
            
            return this.probesTab;
        },
        
        GetProbes : function(e) {
            if(e.newValue) {
                if(!this.probes) {
                    require('js/actions/menu/loader').show();
                    this.service.get_probed_stars({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                        success : function(o){
                            YAHOO.log(o, "info", "Observatory.get_probed_stars.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.ProbeInfoDisplay(o.result);
                            this.probes = o.result.stars;
                            this.pager = new Pager({
                                rowsPerPage : 30,
                                totalRecords: o.result.star_count*1,
                                containers  : 'probePaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.pager.subscribe('changeRequest',this.ProbesHandlePagination, this, true);
                            this.pager.render();
                            
                            this.ProbesDisplay();
                        },
                        scope:this
                    });
                }
                else {
                    this.ProbesDisplay();
                }
            }
        },
        ProbeInfoDisplay : function(data) {
            var info = Dom.get("observatoryInfo");
            if(info) {
                info.innerHTML = ['Total of ', data.star_count, ' probes in use.  ', ( "travelling" in data ? data.travelling + ' en route.  ' : '' ), 'This observatory can control a maximum of ', data.max_probes, ' probes.'].join('');
            }
        },
        ProbesDisplay : function() {
            var stars = this.probes,
                probeDetails = Dom.get("probeDetails");
                
            if(probeDetails) {
                Event.purgeElement(probeDetails);
                probeDetails.innerHTML = "";
                
                var li = document.createElement("li");
                
                for(var i=0; i<stars.length; i++) {
                    var st = stars[i],
                        nLi = li.cloneNode(false);
                        
                    nLi.Star = st;
                    Dom.addClass(nLi,"probeStar");
                    
                    nLi.innerHTML = [
                        '<div class="probeStarContainer yui-gf">',
                        '    <div class="yui-u first probeAction" style="background-color:black;">',
                        '        <img src="',Lib.AssetUrl,'star_map/',st.color,'.png" alt="',st.name,'" style="width:50px;height:50px;" />',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <div class="probeDelete"></div>',
                        '        <div>',st.name,'</div>',
                        '        <div>',st.x,' : ',st.y,'</div>',
                        '    </div>',
                        '</div>'
                    ].join('');
                    
                    nLi = probeDetails.appendChild(nLi);
                    Event.delegate(nLi, "click", this.ProbeJump, "div.probeAction", this, true);
                    Event.delegate(nLi, "click", this.ProbeAbandon, "div.probeDelete", this, true);
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 175;
                    if(Ht > 290) { Ht = 290; }
                    Dom.setStyle(probeDetails.parentNode,"height",Ht + "px");
                    Dom.setStyle(probeDetails.parentNode,"overflow-y","auto");
                },10);
            }
        },
        ProbesHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.get_probed_stars({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Observatory.ProbesHandlePagination.get_probed_stars.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.probes = o.result.stars;
                    // Update the Paginator's state
                    this.pager.setState(newState);
                    this.ProbesDisplay();
                },
                scope:this
            });
        },
        ProbeAbandon : function(e, matchedEl, container) {
            if(container.Star) {
                if(confirm(["Are you sure you want to abandon the probe at ",container.Star.name,"?"].join(''))) {
                    require('js/actions/menu/loader').show();
                    this.service.abandon_probe({
                            session_id:Game.GetSession(),
                            building_id:this.building.id,
                            star_id:container.Star.id
                        }, {
                        success : function(o){
                            YAHOO.log(o, "info", "Observatory.ProbeAction.abandon_probe.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            Event.purgeElement(container);
                            container.parentNode.removeChild(container);
                            this.probes = null;
                        },
                        scope:this
                    });
                }
            }
        },
        ProbeJump : function(e, matchedEl, container) {
            if(container.Star) {
                Game.StarJump(container.Star);
            }
        },
        AbandonAllProbes : function(e) {
            if(confirm("Are you sure you want to abandon all probes controlled by this Observatory?")) {
                require('js/actions/menu/loader').show();
                this.service.abandon_all_probes({
                        session_id:Game.GetSession(),
                        building_id:this.building.id
                    }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Observatory.AbandonAllProbes.abandon_all_probes.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.probes = null;
                        
                        //close buildingDetails
                        this.fireEvent("onHide");
                    },
                    scope:this
                });
            }
        }

    });
    
    YAHOO.lacuna.buildings.Observatory = Observatory;

})();
YAHOO.register("Observatory", YAHOO.lacuna.buildings.Observatory, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
