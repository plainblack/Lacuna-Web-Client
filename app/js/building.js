YAHOO.namespace("lacuna.buildings");

var BodyRPCStore = require('js/stores/rpc/body');

if (typeof YAHOO.lacuna.buildings.Building == "undefined" || !YAHOO.lacuna.buildings.Building) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Building = function(oResults){
        this.createEvent("onMapRpc");
        this.createEvent("onQueueAdd");
        this.createEvent("onQueueReset");
        this.createEvent("onAddTab");
        this.createEvent("onRemoveTab");
        this.createEvent("onSelectTab");
        this.createEvent("onReloadTabs");
        this.createEvent("onUpdateTile");
        this.createEvent("onUpdateMap");
        this.createEvent("onRemoveTile");
        this.createEvent("onHide");
        //for internal use
        this.createEvent("onLoad");
        this.createEvent("onRepair");
        //common elements
        this.building = oResults.building;
        this.work = oResults.building.work;
        //delete status since it's rather large
        delete oResults.status;
        //so we can store just in case anyway
        this.result = oResults;
    };

    Building.prototype = {
        destroy : function() {
            this.unsubscribeAll();
        },
        load : function() {
            this.fireEvent("onLoad");
        },
        getTabs : function() {
            if(this.building.efficiency*1 < 100 && this.building.repair_costs) {
                return [this._getProductionTab(), this._getRepairTab()];
            }
            else {
                var tabs = [this._getProductionTab()],
                    childTabs = this.building.level > 0 ? this.getChildTabs() : null;

                if(childTabs && Lang.isArray(childTabs)) {
                    tabs = tabs.concat(childTabs);
                }

                // incoming supply-chains tab
                if (this.building.url == "/planetarycommand" || this.building.url == "/stationcommand") {
                    tabs[tabs.length] = this._getIncomingSupplyChainsTab();
                }

                //create storage tab last
                if(this.building.upgrade.production && ((this.building.food_capacity*1 + this.building.ore_capacity*1 + this.building.water_capacity*1 + this.building.energy_capacity*1 + this.building.waste_capacity*1) > 0)) {
                    tabs[tabs.length] = this._getStorageTab();
                }

                return tabs;
            }
        },
        getChildTabs : function() {
            //overrideable function for child classes that have their own tabs
            //** Must return nothing or an array of tabs **
        },

        /*
        Event Helpers
        */
        rpcSuccess : function(o) {
            this.fireEvent("onMapRpc", o.result);
            if(o.result.building && this.building) {
                //if we suddenly have work update the tile to add the tile.  if we don't have work update the tile to remove the timer
                var workChanged = (
                    (this.building.work && !o.result.building.work) ||
                    (!this.building.work && o.result.building.work) ||
                    (this.building.work && o.result.building.work && this.building.work.end != o.result.building.work.end)
                );
                if(workChanged) {
                    this.building.work = o.result.building.work;
                    this.work = this.building.work;
                    this.updateBuildingTile(this.building);
                }
            }
        },
        addQueue : function(sec, func, elm, sc) {
            this.fireEvent("onQueueAdd", {seconds:sec, fn:func, el:elm, scope:sc});
        },
        resetQueue : function() {
            this.fireEvent("onQueueReset");
        },
        addTab : function(tab) {
            this.fireEvent("onAddTab", tab);
        },
        removeTab : function(tab) {
            this.fireEvent("onRemoveTab", tab);
        },
        updateBuildingTile : function(building) {
            //always updated url when doing this since some returns don't have the url
            building.url = this.building.url;
            this.building = building;
            this.fireEvent("onUpdateTile", this.building);
        },
        removeBuildingTile : function(building) {
            this.fireEvent("onRemoveTile", building);
        },

        _details : function(info) {
            var title = info.title ? info.title : Lib.capitalizeFirstLetter(info.type);
            var suffix = info.suffix ? info.suffix : '';
            var id = info.id ? [ 'id="', info.id, '" '].join('') : '';
            var numclass = ['buildingDetailsNum'];
            if (info.numclass) {
                numclass.push(info.numclass);
            }
            numclass = numclass.join(' '); // space joiner!

            return [
                    '<li><span class="smallImg"><img src ="',Lib.AssetUrl,'ui/s/',info.type,'.png" title="',title,'" class="small',title,'" /></span>',
                    '<span ', id, 'class="', numclass, '" title="', Lib.formatNumber(info.amount), '">',Lib.convertNumDisplay(info.amount),info.suffix,'</span></li>'
                ].join('');
        },

        _getRepairTab : function() {
            this.repairTab = new YAHOO.widget.Tab({ label: "Repair", content: [
                    '<div id="repairContainer">',
                    '    <span id="repairText">Building is currently running at ',this.building.efficiency,'% efficiency.  Costs to repair the building are:</span>',
                    '    <ul>',
                    this._details({type:'food',amount:this.building.repair_costs.food}),
                    this._details({type:'ore',amount:this.building.repair_costs.ore}),
                    this._details({type:'water',amount:this.building.repair_costs.water}),
                    this._details({type:'energy',amount:this.building.repair_costs.energy}),
                    '    </ul>',
                    '    <button id="repairBuilding" type="button">Repair</button>',
                    '</div>'
                ].join('')});

            Event.on("repairBuilding", "click", this.Repair, this, true);

            return this.repairTab;
        },
        Repair : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            Game.Services.Buildings.Generic.repair({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    YAHOO.log(o, "info", "Building.Repair.repair.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    if(this.repairTab) {
                        Event.removeListener("repair", "click");
                        this.removeTab(this.repairTab);
                        o.result.building.url = this.building.url;
                        this.building = o.result.building;
                        this.work = o.result.building.work;
                        this.result = o.result;
                        this.updateBuildingTile(o.result.building);
                        this.fireEvent("onReloadTabs");
                    }
                    if(!this.productionTab) {
                        this.addTab(this._getProductionTab());
                    }
                    this.fireEvent("onRepair");
                },
                failure : function(o){
                    btn.disabled = false;
                },
                target:this.building.url,
                scope:this
            });
        },

        _getProductionTab : function() {
            var up = this.building.upgrade,
                down = this.building.downgrade,
                currentLevel = this.building.level*1,
                planet = BodyRPCStore.getData();
            this.productionTab = new YAHOO.widget.Tab({ label: "Production", content: [
                '<div id="detailsProduction"><p id="extraBuildingDetails"></p>',
                '    <div id="buildingDetailsProduction" class="yui-gb">',
                '        <div class="yui-u first">',
                '            <ul>',
                '                <li>Current Production</li>',
                this._details({type:'food',amount:this.building.food_hour,suffix:'/hr'}),
                this._details({type:'ore',amount:this.building.ore_hour,suffix:'/hr'}),
                this._details({type:'water',amount:this.building.water_hour,suffix:'/hr'}),
                this._details({type:'energy',amount:this.building.energy_hour,suffix:'/hr'}),
                this._details({type:'waste',amount:this.building.waste_hour,suffix:'/hr'}),
                this._details({type:'happiness',amount:this.building.happiness_hour,suffix:'/hr'}),
                '                <li><button id="buildingDetailsDemolish" type="button">Demolish</button></li>',
                '            </ul>',
                '        </div>',
                '        <div class="yui-u">',
                '            <ul id="buildingDetailsUpgradeProduction">',
                up ? [
                    '<li>Upgrade Production</li>',
                    this._details({type:'food',amount:up.production.food_hour,suffix:'/hr',numclass:this.building.food_hour - up.production.food_hour > planet.food_hour ? 'low-resource' : null}),
                    this._details({type:'ore',amount:up.production.ore_hour,suffix:'/hr',numclass:this.building.ore_hour - up.production.ore_hour > planet.ore_hour ? 'low-resource' : null}),
                    this._details({type:'water',amount:up.production.water_hour,suffix:'/hr',numclass:this.building.water_hour - up.production.water_hour > planet.water_hour ? 'low-resource' : null}),
                    this._details({type:'energy',amount:up.production.energy_hour,suffix:'/hr',numclass:this.building.energy_hour - up.production.energy_hour > planet.energy_hour ? 'low-resource' : null}),
                    this._details({type:'waste',amount:up.production.waste_hour,suffix:'/hr'}),
                    this._details({type:'happiness',amount:up.production.happiness_hour,suffix:'/hr'}),
                    up.can ? '<li><button id="buildingDetailsUpgrade" type="button">Upgrade to Level ' + (1 + (this.building.level*1)) + '</button></li>' : '<li class="alert">Unable to Upgrade:</li><li class="alert">',up.reason[1],'</li>'
                    ].join('') : '',
                '            </ul>',
                '        </div>',
                '        <div class="yui-u">',
                '            <ul id="buildingDetailsUpgradeCost">',
                up ? [
                    '    <li>Upgrade Cost</li>',
                    this._details({type:'food',amount:up.cost.food||0,numclass:up.cost.food > planet.food_stored ? 'low-resource' : null}),
                    this._details({type:'ore',amount:up.cost.ore||0,numclass:up.cost.ore > planet.ore_stored ? 'low-resource' : null}),
                    this._details({type:'water',amount:up.cost.water||0,numclass:up.cost.water > planet.water_stored ? 'low-resource' : null}),
                    this._details({type:'energy',amount:up.cost.energy||0,numclass:up.cost.energy > planet.energy_stored ? 'low-resource' : null}),
                    this._details({type:'waste',amount:up.cost.waste||0}),
                    '    <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(up.cost.time),'</span></li>'
                    ].join('') : '',
                currentLevel <= 1 ? '' : down.can ? '<li><button id="buildingDetailsDowngrade" type="button">Downgrade to Level ' + (currentLevel - 1) + '</button></li>' : '<li class="alert">Unable to Downgrade:</li><li class="alert">' + String(down.reason).replace(/^\d+,\s*/, '') + '</li>',
                '            </ul>',
                '        </div>',
                '    </div>',
                '</div>'
                ].join('')});

            Event.onAvailable('extraBuildingDetails', function(o) {
                if (o.building.upgrade.cost.halls && (parseInt(o.building.level)) < 30) {
                    Dom.get('extraBuildingDetails').innerHTML = 'Upgrade to level ' + (parseInt(o.building.level) + 1) + ' by sacrificing ' + (parseInt(o.building.level) + 1) + ' Halls of Vrbansk.';
                }
            }, this);

            Event.on("buildingDetailsDemolish", "click", this.Demolish, this, true);
            if(up.can) {
                Event.on("buildingDetailsUpgrade", "click", this.Upgrade, this, true);
            }
            if(currentLevel > 1) {
                Event.on("buildingDetailsDowngrade", "click", this.Downgrade, this, true);
            }

            return this.productionTab;

        },
        Demolish : function() {
            var building = this.building;
            if(confirm(['Are you sure you want to Demolish the level ',building.level,' ',building.name,'?'].join(''))) {
                require('js/actions/menu/loader').show();
                Game.Services.Buildings.Generic.demolish({
                    session_id:Game.GetSession(),
                    building_id:building.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Building.Demolish.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.removeBuildingTile(building);
                        this.fireEvent("onHide");
                    },
                    scope:this,
                    target:building.url
                });
            }
        },
        Downgrade : function() {
            var building = this.building;
            if(confirm(['Are you sure you want to downgrade the level ',building.level,' ',building.name,'?'].join(''))) {
                require('js/actions/menu/loader').show();
                Game.Services.Buildings.Generic.downgrade({
                    session_id:Game.GetSession(),
                    building_id:building.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Building.Downgrade.success");
                        require('js/actions/menu/loader').hide();
                        this.fireEvent("onMapRpc", o.result);

                        var b = building; //originally passed in building data from currentBuilding
                        b.id = o.result.building.id;
                        b.level = o.result.building.level;
                        b.pending_build = o.result.building.pending_build;
                        YAHOO.log(b, "info", "Building.Upgrade.success.building");

                        this.updateBuildingTile(b);

                        this.fireEvent("onHide");
                    },
                    scope:this,
                    target:building.url
                });
            }
        },
        Upgrade : function() {
            var building = this.building;

            require('js/actions/menu/loader').show();
            var BuildingServ = Game.Services.Buildings.Generic,
                data = {
                    session_id: Game.GetSession(""),
                    building_id: building.id
                };

            BuildingServ.upgrade(data,{
                success : function(o){
                    YAHOO.log(o, "info", "Building.Upgrade.success");
                    require('js/actions/menu/loader').hide();
                    this.fireEvent("onMapRpc", o.result);

                    var b = building; //originally passed in building data from currentBuilding
                    b.id = o.result.building.id;
                    b.level = o.result.building.level;
                    b.pending_build = o.result.building.pending_build;
                    YAHOO.log(b, "info", "Building.Upgrade.success.building");
                    this.updateBuildingTile(b);
                    this.fireEvent("onHide");
                },
                scope:this,
                target:building.url
            });
        },

        _getIncomingSupplyChainsTab : function() {
            this.incomingSupplyChainTab = new YAHOO.widget.Tab({ label: "Supply Chains", content: [
                '<div id="incomingSupplyChainInfo" style="margin-bottom: 2px">',
                '   <div id="incomingSupplyChainList">',
                '      <b>Incoming Supply Chains</b><hr/>',
                '      <ul id="incomingSupplyChainListHeader" class="incomingSupplyChainHeader incomingSupplyChainInfo clearafter">',
                '        <li class="incomingSupplyChainBody">From Body</li>',
                '        <li class="incomingSupplyChainResource">Resource</li>',
                '        <li class="incomingSupplyChainHour">/hr</li>',
                '        <li class="incomingSupplyChainEfficiency">Efficiency</li>',
                '      </ul>',
                '      <div><div id="incomingSupplyChainListDetails"></div></div>',
                '   </div>',
                '   <div id="incomingSupplyChainListNone"><b>No Incoming Supply Chains</b></div>',
                '</div>',
            ].join('')});

            this.incomingSupplyChainTab.subscribe("activeChange", this.viewIncomingSupplyChainInfo, this, true);

            return this.incomingSupplyChainTab;
        },
        viewIncomingSupplyChainInfo : function(e) {
            Dom.setStyle("incomingSupplyChainList", "display", "none");
            Dom.setStyle("incomingSupplyChainListNone", "display", "none");

            if ( !this.incoming_supply_chains ) {
                require('js/actions/menu/loader').show();
                this.service.view_incoming_supply_chains({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "building.viewIncomingSupplyChainInfo.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.incoming_supply_chains = o.result.supply_chains;

                        this.incomingSupplyChainList();
                    },
                    scope:this
                });
            }
            else {
                this.incomingSupplyChainList();
            }
        },
        incomingSupplyChainList : function() {
          var supply_chains = this.incoming_supply_chains;

          if ( supply_chains.length == 0 ) {
            Dom.setStyle("incomingSupplyChainList", "display", "none");
            Dom.setStyle("incomingSupplyChainListNone", "display", "");
            return;
          }
          else {
            Dom.setStyle("incomingSupplyChainList", "display", "");
            Dom.setStyle("incomingSupplyChainListNone", "display", "none");
          }

          var details = Dom.get("incomingSupplyChainListDetails"),
              detailsParent = details.parentNode,
              ul = document.createElement("ul"),
              li = document.createElement("li");

          // chains list
          Event.purgeElement(details, true); //clear any events before we remove
          details = detailsParent.removeChild(details); //remove from DOM to make this faster
          details.innerHTML = "";

          //Dom.setStyle(detailsParent, "display", "");
          detailsParent.appendChild(details); //add back as child

          for (var i=0; i<supply_chains.length; i++) {
            var chain = supply_chains[i],
                nUl = ul.cloneNode(false);

            Dom.addClass(nUl, "incomingSupplyChainInfo");
            Dom.addClass(nUl, "clearafter");

            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "incomingSupplyChainBody");
            if (chain.stalled == 1) {
                Dom.addClass( nUl, "incomingSupplyChainStalled")
                nLi.innerHTML = chain.from_body.name + " (Stalled)";
            }
            else {
                nLi.innerHTML = chain.from_body.name;
            }
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "incomingSupplyChainResource");
            nLi.innerHTML = chain.resource_type.titleCaps();
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi, "incomingSupplyChainHour");
            nLi.innerHTML = Lib.convertNumDisplay(chain.resource_hour);
            nLi.title = Lib.formatNumber(chain.resource_hour);
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"incomingSupplyChainEfficiency");
            nLi.innerHTML = chain.percent_transferred;
            nUl.appendChild(nLi);

            details.appendChild(nUl);
          }

          //wait for tab to display first
          setTimeout(function() {
            var Ht = Game.GetSize().h - 250;
            if(Ht > 250) { Ht = 250; }
            Dom.setStyle(detailsParent,"height",Ht + "px");
            Dom.setStyle(detailsParent,"overflow-y","auto");
          },10);
        },
        _getStorageTab : function() {
            var p = this.building.upgrade.production,
                output = [
                '<div class="yui-g">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li>Current Building Storage</li>',
                this._details({type:'food',amount:this.building.food_capacity}),
                this._details({type:'ore',amount:this.building.ore_capacity}),
                this._details({type:'water',amount:this.building.water_capacity}),
                this._details({type:'energy',amount:this.building.energy_capacity}),
                this._details({type:'waste',amount:this.building.waste_capacity}),
                '        </ul>',
                '    </div>',
                '    <div class="yui-u">',
                '        <ul id="buildingDetailsUpgradeStorage">',
                '            <li>Upgrade to Building Storage</li>',
                this._details({type:'food',amount:p.food_capacity}),
                this._details({type:'ore',amount:p.ore_capacity}),
                this._details({type:'water',amount:p.water_capacity}),
                this._details({type:'energy',amount:p.energy_capacity}),
                this._details({type:'waste',amount:p.waste_capacity}),
                '        </ul>',
                '    </div>',
                '</div>'];
            return new YAHOO.widget.Tab({ label: "Storage", content: output.join('')});
        }
    };
    Lang.augmentProto(Building, Util.EventProvider);

    YAHOO.lacuna.buildings.Building = Building;

})();
YAHOO.register("building", YAHOO.lacuna.buildings.Building, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
