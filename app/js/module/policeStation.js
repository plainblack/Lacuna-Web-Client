YAHOO.namespace("lacuna.modules");

if (typeof YAHOO.lacuna.modules.PoliceStation == "undefined" || !YAHOO.lacuna.modules.PoliceStation) {
    
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

    var PoliceStation = function(result){
        PoliceStation.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Modules.PoliceStation;
        
        this.foreignSpiesMessage = "There may be spies on your station that we don't know about.";
    };
    
    Lang.extend(PoliceStation, Lacuna.buildings.Security, {
        getChildTabs : function() {
            return [this._getForeignTab()];
        },
        _getForeignTab : function() {
            this.foreignShipsTab = new YAHOO.widget.Tab({ label: "Incoming", content: [
                '<div>',
                '    <ul class="shipHeader shipInfo clearafter">',
                '        <li class="shipTypeImage">&nbsp;</li>',
                '        <li class="shipName">Name</li>',
                '        <li class="shipArrives">Arrives</li>',
                '        <li class="shipFrom">From</li>',
                '    </ul>',
                '    <div><div id="shipsForeignDetails"></div></div>',
                '    <div id="shipsForeignPaginator"></div>',
                '</div>'
            ].join('')});
            //subscribe after adding so active doesn't fire
            this.foreignShipsTab.subscribe("activeChange", this.getForeign, this, true);

            return this.foreignShipsTab;
        },
        getForeign : function(e) {
            if(e.newValue) {
                if(!this.shipsForeign) {
                    require('js/actions/menu/loader').show();
                    this.service.view_foreign_ships({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
                        success : function(o){
                            YAHOO.log(o, "info", "SpacePort.view_foreign_ships.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.shipsForeign = {
                                number_of_ships: o.result.number_of_ships,
                                ships: o.result.ships
                            };
                            this.foreignPager = new Pager({
                                rowsPerPage : 25,
                                totalRecords: o.result.number_of_ships,
                                containers  : 'shipsForeignPaginator',
                                template : "{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink}",
                                alwaysVisible : false

                            });
                            this.foreignPager.subscribe('changeRequest',this.ForeignHandlePagination, this, true);
                            this.foreignPager.render();

                            this.ForeignPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.ForeignPopulate();
                }
            }
        },
        ForeignPopulate : function() {
            var details = Dom.get("shipsForeignDetails");

            if(details) {
                var ships = this.shipsForeign.ships,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");

                ships = ships.slice(0);
                ships.sort(function(a,b) {
                    if (a.date_arrives > b.date_arrives) {
                        return 1;
                    }
                    else if (a.date_arrives < b.date_arrives) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });

                Event.purgeElement(details, true);
                details.innerHTML = "";

                var serverTime = Lib.getTime(Game.ServerData.time);

                for(var i=0; i<ships.length; i++) {
                    var ship = ships[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false),
                        sec = (Lib.getTime(ship.date_arrives) - serverTime) / 1000;

                    nUl.Ship = ship;
                    Dom.addClass(nUl, "shipInfo");
                    Dom.addClass(nUl, "clearafter");

                    Dom.addClass(nLi,"shipTypeImage");
                    Dom.setStyle(nLi, "background", ['transparent url(',Lib.AssetUrl,'star_system/field.png) no-repeat center'].join(''));
                    Dom.setStyle(nLi, "text-align", "center");
                    nLi.innerHTML = ['<img src="',Lib.AssetUrl,'ships/',ship.image,'.png" title="',ship.type_human,'" style="width:50px;height:50px;" />'].join('');
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipName");
                    nLi.innerHTML = ship.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipArrives");
                    nLi.innerHTML = Lib.formatTime(sec);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"shipFrom");
                    if(ship.from && ship.from.name) {
                        if(ship.from.empire && ship.from.empire.name) {
                            nLi.innerHTML = ship.from.name + ' <span style="cursor:pointer;">[' + ship.from.empire.name + ']</span>';
                            Event.on(nLi, "click", this.EmpireProfile, ship.from.empire);
                        }
                        else {
                            nLi.innerHTML = ship.from.name;
                        }
                    }
                    else {
                        nLi.innerHTML = 'Unknown';
                    }
                    nUl.appendChild(nLi);

                    this.addQueue(sec, this.ForeignQueue, nUl);

                    details.appendChild(nUl);

                }

                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 220;
                    if(Ht > 300) { Ht = 300; }
                    var tC = details.parentNode;
                    Dom.setStyle(tC,"height",Ht + "px");
                    Dom.setStyle(tC,"overflow-y","auto");
                },10);
            }
        },
        ForeignHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.view_foreign_ships({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "SpacePort.view_foreign_ships.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.shipsForeign = {
                        number_of_ships: o.result.number_of_ships,
                        ships: o.result.ships
                    };
                    this.ForeignPopulate();
                },
                scope:this
            });

            // Update the Paginator's state
            this.foreignPager.setState(newState);
        },
        ForeignQueue : function(remaining, elLine){
            var arrTime;
            if(remaining <= 0) {
                arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                arrTime = Lib.formatTime(Math.round(remaining));
            }
            Sel.query("li.shipArrives",elLine,true).innerHTML = arrTime;
        },

    });
    
    YAHOO.lacuna.modules.PoliceStation = PoliceStation;

})();
YAHOO.register("policestation", YAHOO.lacuna.modules.PoliceStation, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
