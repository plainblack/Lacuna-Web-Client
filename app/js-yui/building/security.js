YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Security == "undefined" || !YAHOO.lacuna.buildings.Security) {
    
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

    var Security = function(result){
        Security.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Security;
        
        this.foreignSpiesMessage = "There may be spies on your planet that we don't know about.";
    };
    
    Lang.extend(Security, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.pagerPrisoners) {
                this.pagerPrisoners.destroy();
            }
            if(this.pagerSpies) {
                this.pagerSpies.destroy();
            }
            Security.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getPrisonersTab(), this._getSpiesTab()];
        },
        _getPrisonersTab : function() {
            var spies = this.result.spies;
            this.prisonersTab = new YAHOO.widget.Tab({ label: "Prisoners", content: [
                '<div>',
                '    <ul class="spiesHeader securityInfo clearafter">',
                '        <li class="securityName">Name</li>',
                '        <li class="securityLevel">Level</li>',
                '        <li class="securitySentence">Sentence Expires</li>',
                '        <li class="securityStatus">Status</li>',
                '        <li class="securityExecute">Execute</li>',
                '        <li class="securityRelease">Release</li>',
                '    </ul>',
                '    <div><div id="prisonersDetails"></div></div>',
                '    <div id="prisonersPaginator"></div>',
                '</div>'
            ].join('')});
            this.prisonersTab.subscribe("activeChange", this.prisonersView, this, true);
            
            return this.prisonersTab;
        },
        _getSpiesTab : function() {
            this.spiesTab = new YAHOO.widget.Tab({ label: "Foreign Spies", content: [
                '<div>',
                '    <p>',this.foreignSpiesMessage,'</p>',
                '    <ul class="spiesHeader securityInfo clearafter">',
                '        <li class="securityName">Name</li>',
                '        <li class="securityLevel">Level</li>',
                '        <li class="securityNextMisson">Next Misson</li>',
                '        <li class="securityNextMisson">Current Misson</li>',
                '    </ul>',
                '    <div><div id="securityDetails"></div></div>',
                '    <div id="securityPaginator"></div>',
                '</div>'
            ].join('')});
            this.spiesTab.subscribe("activeChange", this.spiesView, this, true);
                    
            return this.spiesTab;
        },
        
        prisonersView : function(e) {
            if(e.newValue) {
                if(!this.prisoners) {
                    require('js/actions/menu/loader').show();
                    this.service.view_prisoners({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            YAHOO.log(o, "info", "Security.Security.view_prisoners.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.prisoners = o.result.prisoners;
                            this.pagerPrisoners = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.captured_count,
                                containers  : 'prisonersPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.pagerPrisoners.subscribe('changeRequest',this.PrisonersHandlePagination, this, true);
                            this.pagerPrisoners.render();
                            
                            this.PrisonersPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.SpyPopulate();
                }
            }
        },
        PrisonersPopulate : function() {
            var details = Dom.get("prisonersDetails");
            if(details) {
                var prisoners = this.prisoners,
                    div = document.createElement("div"),
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                Dom.setStyle(details.parentNode,"height","");
                Dom.setStyle(details.parentNode,"overflow-y","");
                for(var i=0; i<prisoners.length; i++) {
                    var prisoner = prisoners[i],
                        nDiv = div.cloneNode(false),
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    Dom.addClass(nDiv, "securityInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"securityName");
                    nLi.innerHTML = prisoner.name;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityLevel");
                    nLi.innerHTML = prisoner.level;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securitySentence");
                    nLi.innerHTML = Lib.formatServerDate(prisoner.sentence_expires);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityStatus");
                    nLi.innerHTML = prisoner.task;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityExecute");
                    var Ebtn = document.createElement("button");
                    Ebtn.setAttribute("type", "button");
                    Ebtn.innerHTML = "Execute";
                    Ebtn = nLi.appendChild(Ebtn);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityRelease");
                    var Rbtn = document.createElement("button");
                    Rbtn.setAttribute("type", "button");
                    Rbtn.innerHTML = "Release";
                    Rbtn = nLi.appendChild(Rbtn);
                    nUl.appendChild(nLi);

                    nDiv.appendChild(nUl);

                    details.appendChild(nDiv);
                    
                    Event.on(Ebtn, "click", this.PrisonersExecute, {Self:this,Prisoner:prisoner,Line:nDiv}, true);
                    Event.on(Rbtn, "click", this.PrisonersRelease, {Self:this,Prisoner:prisoner,Line:nDiv}, true);
                }
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 200;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        PrisonersHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.view_prisoners({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Security.PrisonersHandlePagination.view_prisoners.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.prisoners = o.result.prisoners;
                    this.PrisonersPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.pagerPrisoners.setState(newState);
        },
        PrisonersExecute : function() {
            if(confirm(["Are you sure you want to execute ",this.Prisoner.name,"?"].join(''))) {
                require('js/actions/menu/loader').show();
                
                this.Self.service.execute_prisoner({
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    prisoner_id:this.Prisoner.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Security.PrisonersExecute.success");
                        require('js/actions/menu/loader').hide();
                        this.Self.rpcSuccess(o);
                        var prisoners = this.Self.prisoners;
                        for(var i=0; i<prisoners.length; i++) {
                            if(prisoners[i].id == this.Prisoner.id) {
                                prisoners.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                    },
                    scope:this
                });
            }
        },
        PrisonersRelease : function() {
            if(confirm(["Are you sure you want to release ",this.Prisoner.name,"?"].join(''))) {
                require('js/actions/menu/loader').show();
                
                this.Self.service.release_prisoner({
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    prisoner_id:this.Prisoner.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Security.PrisonersRelease.success");
                        require('js/actions/menu/loader').hide();
                        this.Self.rpcSuccess(o);
                        var prisoners = this.Self.prisoners;
                        for(var i=0; i<prisoners.length; i++) {
                            if(prisoners[i].id == this.Prisoner.id) {
                                prisoners.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                    },
                    scope:this
                });
            }
        },

        spiesView : function(e) {
            if(e.newValue) {
                if(!this.spies) {
                    require('js/actions/menu/loader').show();
                    this.service.view_foreign_spies({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            YAHOO.log(o, "info", "Security.Security.view_foreign_spies.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.spies = o.result.spies;
                            this.pagerSpies = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.spy_count,
                                containers  : 'securityPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.pagerSpies.subscribe('changeRequest',this.SpyHandlePagination, this, true);
                            this.pagerSpies.render();
                            
                            this.SpyPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.SpyPopulate();
                }
            }
        },
        SpyPopulate : function() {
            var details = Dom.get("securityDetails");
            if(details) {
                var spies = this.spies,
                    div = document.createElement("div"),
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                Dom.setStyle(details.parentNode,"height","");
                Dom.setStyle(details.parentNode,"overflow-y","");
                
                for(var i=0; i<spies.length; i++) {
                    var spy = spies[i],
                        nDiv = div.cloneNode(false),
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    Dom.addClass(nDiv, "securityInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"securityName");
                    nLi.innerHTML = spy.name;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityLevel");
                    nLi.innerHTML = spy.level;
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityNextMisson");
                    nLi.innerHTML = Lib.formatServerDate(spy.next_mission);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"securityTask");
                    nLi.innerHTML = spy.task;
                    nUl.appendChild(nLi);
                    nDiv.appendChild(nUl);

                    details.appendChild(nDiv);
                }
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 200;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        SpyHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.view_foreign_spies({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Security.SpyHandlePagination.view_foreign_spies.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.spies = o.result.spies;
                    this.SpyPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.pagerSpies.setState(newState);
        }

    });
    
    YAHOO.lacuna.buildings.Security = Security;

})();
YAHOO.register("Security", YAHOO.lacuna.buildings.Security, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
