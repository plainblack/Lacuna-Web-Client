YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Development == "undefined" || !YAHOO.lacuna.buildings.Development) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Development = function(result){
        Development.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Development;
    };
    
    Lang.extend(Development, Lacuna.buildings.Building, {
        getChildTabs : function() {
            if(this.result.build_queue && this.result.build_queue.length > 0) {
                return [this._getQueueTab()];
            }
        },
        _getQueueTab : function() {
            var bq = this.result.build_queue,
                ul = document.createElement("ul"),
                li = document.createElement("li"),
                div = document.createElement("div"),
                subDiv = div.cloneNode(false),
                hUl = ul.cloneNode(false);
                
            Dom.addClass(div, "buildingDetailsExtra");
            
            subDiv.appendChild(document.createTextNode('You can subsidize the build queue for '+this.result.subsidy_cost+' Essentia to finish immediately.'));
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "Subsidize";
            btn = subDiv.appendChild(btn);
            Event.on(btn, "click", this.DevSubsidize, this, true);
            div.appendChild(subDiv);

            Dom.addClass(hUl, "buildQueue buildQueueHeader clearafter");
            hUl.innerHTML = '<li class="buildQueueRank"># </li><li class="buildQueueName">Building</li><li class="buildQueueLevel">Level</li><li class="buildQueueTime">Time</li><li class="buildQueueCoords">Coordinates</li><li class="buildQueueSubsidy">Subsidy</li><li class="buildQueueAction">Action</li>';
            div.appendChild(hUl);
            
            for(var i=0; i<bq.length; i++) {
                var bqo = bq[i],
                    nUl = ul.cloneNode(false),
                    nLi = li.cloneNode(false);
                Dom.addClass(nUl, "buildQueue");
                Dom.addClass(nUl, "clearafter");

                Dom.addClass(nLi,"buildQueueRank");
                nLi.innerHTML = i+1;
                nUl.appendChild(nLi);

                nLi = li.cloneNode(false);
                Dom.addClass(nLi,"buildQueueName");
                nLi.innerHTML = bqo.name;
                nUl.appendChild(nLi);
                
                nLi = li.cloneNode(false);
                Dom.addClass(nLi,"buildQueueLevel");
                nLi.innerHTML = bqo.to_level;
                nUl.appendChild(nLi);
                
                var tLi = li.cloneNode(false);
                Dom.addClass(tLi,"buildQueueTime");
                tLi.innerHTML = Lib.formatTime(bqo.seconds_remaining);
                nUl.appendChild(tLi);

                nLi = li.cloneNode(false);
                Dom.addClass(nLi,"buildQueueCoords");
                nLi.innerHTML = [bqo.x,',',bqo.y].join('');
                nUl.appendChild(nLi);

                nLi = li.cloneNode(false);
                Dom.addClass(nLi,"buildQueueSubsidy");
                nLi.innerHTML = bqo.subsidy_cost;
                nUl.appendChild(nLi);

                var btn_subsidy = document.createElement("button");
                btn_subsidy.setAttribute("type", "button");
                btn_subsidy.innerHTML = "Subsidize";
                btn_subsidy = subDiv.appendChild(btn_subsidy);
                Event.on(btn_subsidy, "click", this.DevSubsidizeOneBuild, {Self:this,ScheduledId:bqo.building_id}, true);
                nUl.appendChild(btn_subsidy);

                var btn_cancel = document.createElement("button");
                btn_cancel.setAttribute("type", "button");
                btn_cancel.innerHTML = "Cancel";
                btn_cancel = subDiv.appendChild(btn_cancel);
                Event.on(btn_cancel, "click", this.DevCancelOneBuild, {Self:this,ScheduledId:bqo.building_id}, true);
                nUl.appendChild(btn_cancel);


                div.appendChild(nUl);
                
                this.addQueue(bqo.seconds_remaining, this.DevMinistryQueue, tLi);
            }
                    
            var tab = new YAHOO.widget.Tab({ label: "Build Queue", contentEl: div});
                    
            this.queueTab = tab;
            
            return tab;
        },

        DevMinistryQueue : function(remaining, el){
            if(remaining <= 0) {
                var ul = el.parentNode,
                    c = ul.parentNode;
                c.removeChild(ul);
            }
            else {
                el.innerHTML = Lib.formatTime(Math.round(remaining));
            }
        },

        DevCancelOneBuild : function(e) {
            require('js/actions/menu/loader').show();

            this.Self.service.cancel_build({ args: {
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                scheduled_id:this.ScheduledId
            }}, {
                success : function(o) {
                    YAHOO.log(o, "info", "Development.DevCancelOneBuild.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    if(this.Self.queueTab) {
                        Event.purgeElement(this.Self.queueTab.get("contentEl"));
                        this.Self.removeTab(this.Self.queueTab);
                    }
                    this.Self.fireEvent("onHide");
                    this.Self.fireEvent("onUpdateMap");
                },
                scope:this
            });
        },

        DevSubsidizeOneBuild : function(e) {
            require('js/actions/menu/loader').show();

            this.Self.service.subsidize_one_build({ args: {
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                scheduled_id:this.ScheduledId
            }}, {
                success : function(o) {
                    YAHOO.log(o, "info", "Development.DevSubsidizeOneBuild.success");
                    require('js/actions/menu/loader').hide();
                    var e = Game.EmpireData.essentia*1;
                    Game.EmpireData.essentia = e - o.result.essentia_spent*1;
                    this.Self.rpcSuccess(o);
                    if(this.Self.queueTab) {
                        Event.purgeElement(this.Self.queueTab.get("contentEl"));
                        this.Self.removeTab(this.Self.queueTab);
                    }
                    this.Self.fireEvent("onHide");
                    this.Self.fireEvent("onUpdateMap");
                },
                scope:this
            });
        },



        DevSubsidize : function(e) {
            require('js/actions/menu/loader').show();
            
            this.service.subsidize_build_queue({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Development.DevSubsidize.success");
                    require('js/actions/menu/loader').hide();
                    var e = Game.EmpireData.essentia*1;
                    Game.EmpireData.essentia = e - o.result.essentia_spent*1;
                    this.rpcSuccess(o);
                    
                    if(this.queueTab) {
                        Event.purgeElement(this.queueTab.get("contentEl"));
                        this.removeTab(this.queueTab);
                    }
                    
                    //close buildingDetails
                    this.fireEvent("onHide");

                    //refresh map
                    this.fireEvent("onUpdateMap");
                },
                scope:this
            });        
        }
    });
    
    YAHOO.lacuna.buildings.Development = Development;

})();
YAHOO.register("development", YAHOO.lacuna.buildings.Development, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
