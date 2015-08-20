YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.SpaceStationLab == "undefined" || !YAHOO.lacuna.buildings.SpaceStationLab) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var SpaceStationLab = function(result){
        SpaceStationLab.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.SpaceStationLab;
    };
    
    Lang.extend(SpaceStationLab, Lacuna.buildings.Building, {
        getChildTabs : function() {
            if(this.result.make_plan && this.result.make_plan.level_costs.length > 0) {
                return [this._getPlanTab()];
            }
            else {
                return;
            }
        },
        _getPlanTab : function() {
            
            Event.onContentReady("stationLabLevelsContainer", this.PlanPopulate, this, true);
            
            Event.on("stationLabGoToPlan", "click", function(){
                delete this.selectedType;
                Dom.get("stationLabPlanSelected").innerHTML = "";
                Dom.setStyle("stationLabPlansContainer", "display", "");
                Dom.setStyle("stationLabLevelsContainer", "display", "none");
            }, this, true);
            
            Event.on("stationLabMakingSubsidize", "click", this.PlanSubsidize, this, true);
            
            Event.delegate("stationLabPlans", 'click', function(e, matchedEl, container){
                this.selectedType = matchedEl.value;
                Dom.get("stationLabPlanSelected").innerHTML = Sel.query('div.buildingName',matchedEl.parentNode.parentNode,true).innerHTML;
                Dom.setStyle("stationLabPlansContainer", "display", "none");
                Dom.setStyle("stationLabLevelsContainer", "display", "");
            }, 'button', this, true); 
            
            Event.delegate("stationLabLevels", 'click', this.PlanMake, 'button', this, true); 
            
            return new YAHOO.widget.Tab({ label: "Make Plan", content: [
                '<div id="stationLabPlansContainer" style="display:none;"><div style="overflow-y:auto;"><ul id="stationLabPlans"></ul></div></div>',
                '<div id="stationLabLevelsContainer" style="display:none;">',
                '    <div class="yui-g" style="padding-bottom:3px;margin-bottom:3px;border-bottom: 1px solid #52acff;">',
                '        <div class="yui-u first" style="font-weight:bold;">Building a <span id="stationLabPlanSelected"></span></div>',
                '        <div class="yui-u" style="text-align:right;"><button type="button" id="stationLabGoToPlan">Go Back</button></div>',
                '    </div>',
                '    <div>',
                '        <table class="buildingStats" cellpadding="0" cellspacing="0">',
                '            <col width="53" /><colgroup span="6" width="110" />',
                '            <tr><td>Level</td>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></th>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre"  /></th>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></th>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></th>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></th>',
                '                <th><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" /></th>',
                '                <th></th>',
                '            </tr>',
                '        </table>',
                '        <div id="stationLabLevelsList" style="overflow-y:auto;"></div>',
                '    </div>',
                '</div>',
                '<div id="stationLabMakingContainer" style="display:none;">',
                '    <div style="margin-bottom:10px;"><span id="stationLabMakingName"></span> will complete in <span id="stationLabMakingTime"></span>.</div>',
                '    <button type="button" id="stationLabMakingSubsidize">Subsidize for ',this.result.make_plan.subsidy_cost,' <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" style="vertical-align: middle;" /></button>',
                '</div>'
            ].join('')});
        },
        buildPlans : function(types) {
            var frag = [];
            for(var n=0; n<types.length; n++) {
                var plan = types[n];
                frag[frag.length] = [
                    '<li style="padding-bottom: 2px; margin-bottom:2px; border-bottom: 1px solid #52acff;">',
                    '    <div class="yui-gb">',
                    '        <div class="yui-u first" style="width:200px;background:transparent url(',Lib.AssetUrl,'planet_side/surface-station.jpg) no-repeat center;text-align:center">',
                    '            <img src="',Lib.AssetUrl,'planet_side/',plan.image,'.png" style="width:200px;height:200px;cursor:pointer;" class="buildingImage" />',
                    '        </div>',
                    '        <div class="yui-u">',
                    '            <div class="buildingName">', plan.name, '</div>',
                    '            <div class="buildingDesc">',Game.GetBuildingDesc(plan.url),'</div>',
                    '        </div>',
                    '        <div class="yui-u">',
                    //'            <input type="radio" name="stationLabSelectType" value="',plan.type,'" style="margin-top:30px;margin-left:30px;" />',
                    '            <button type="button" value="',plan.type,'">Select</button>',
                    '        </div>',
                    '    </div>',
                    '</li>'
                ].join('');
            }
            return frag.join('');
        },
        buildLevels : function(levelCosts) {
            var frag = ['<table id="stationLabLevels" class="buildingStats" cellpadding="0" cellspacing="0"><col width="53" /><colgroup span="6" width="110" />'],
                planet = Game.GetCurrentPlanet();
            var buildfield = function(costs,type) {
                return [
                        '<td class="',
                        costs[type] > planet[type+"_stored"] ? 'low-resource' : '',
                        '" title="', Lib.formatNumber(costs[type]),'">',
                        Lib.convertNumDisplay(costs[type]),
                        '</td>'
                       ].join('');
            };
            for(var n=0; n<levelCosts.length; n++) {
                var costs = levelCosts[n];
                frag[frag.length] = [
                    '<tr><th>', costs.level, ':</th>',
                    buildfield(costs,'food'),
                    buildfield(costs,'ore'),
                    buildfield(costs,'water'),
                    buildfield(costs,'energy'),
                    buildfield(costs,'waste'),
                    '    <td>',Lib.formatTime(costs.time),'</td>',
                    '    <td><button type="button" value="',costs.level,'">Make</button></td>',
                    '</tr>'
                ].join('');
            }
            frag[frag.length] = '</table>';
            return frag.join('');
        },
        makingQueue : function(remaining, span){
            var time;
            if(remaining <= 0) {
                time = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
            }
            else {
                time = Lib.formatTime(Math.round(remaining));
            }
            span.innerHTML = time;
        },
        PlanPopulate : function() {
            var makePlan = this.result.make_plan;
            
            if(makePlan.making) {
                Dom.setStyle("stationLabPlansContainer","display","none");
                Dom.setStyle("stationLabLevelsContainer","display","none");
                Dom.setStyle("stationLabMakingContainer","display","");
                
                Dom.get("stationLabMakingName").innerHTML = makePlan.making;
                this.addQueue(this.result.building.work.seconds_remaining, this.makingQueue, Dom.get("stationLabMakingTime"));
            }
            else {
                Dom.setStyle("stationLabPlansContainer","display","");
                Dom.setStyle("stationLabLevelsContainer","display","none");
                Dom.setStyle("stationLabMakingContainer","display","none");
                
                Dom.get("stationLabPlans").innerHTML = this.buildPlans(makePlan.types);
                Dom.get("stationLabLevelsList").innerHTML = this.buildLevels(makePlan.level_costs);
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 200;
                    if(Ht > 250) { Ht = 250; }

                    Dom.setStyle(Dom.get("stationLabPlans").parentNode,"height",Ht + "px");
                    
                    Dom.setStyle(Dom.get("stationLabLevels").parentNode,"height",(Ht-50) + "px");
                },10);
            }
        },
        PlanMake : function(e, matchedEl, container) {
            var type = this.selectedType,
                level = matchedEl.value;
                
            if(type && level) {
                matchedEl.disabled = true;
                
                require('js/actions/menu/loader').show();
                this.service.make_plan({session_id:Game.GetSession(),building_id:this.building.id, type:type, level:level}, {
                    success : function(o){
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.result = o.result;
                        matchedEl.disabled = false;
                        this.PlanPopulate();
                    },
                    failure : function(o) {
                        matchedEl.disabled = false;
                    },
                    scope:this
                });
            }
        },
        PlanSubsidize : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            require('js/actions/menu/loader').show();
            this.service.subsidize_plan({session_id:Game.GetSession(),building_id:this.building.id}, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.result = o.result;
                    btn.disabled = false;
                    this.PlanPopulate();
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        }
    });
    
    Lacuna.buildings.SpaceStationLab = SpaceStationLab;

})();
YAHOO.register("spacestationlab", YAHOO.lacuna.buildings.SpaceStationLab, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
