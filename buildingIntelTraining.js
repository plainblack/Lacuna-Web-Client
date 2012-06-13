YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.IntelTraining == "undefined" || !YAHOO.lacuna.buildings.IntelTraining) {
    
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

    var IntelTraining = function(result){
        IntelTraining.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.IntelTraining;
    };
    
    Lang.extend(IntelTraining, Lacuna.buildings.Building, {
        destroy : function() {
            IntelTraining.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getTrainTab()];
        },
        _getTrainTab : function() {
            var spies = this.result.spies;
            this.trainTab = new YAHOO.widget.Tab({ label: "Train Spies", content: [
                '<div class="yui-g">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><span style="font-weight:bold;">Spies Training:</span> <span id="spiesCurrent">',spies.in_training,'</span></li>',
                '            <li id="spiesTrainOptions"><span style="font-weight:bold;">Train Spy:</span><br><select id="spiesTrainId"></select> <button type="button" id="spiesTrain">Train</button></li>',
                '        </ul>',
                '    </div>',
                '    <div class="yui-u">',
                '        <ul>',
                '            <li>Training Costs</li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',spies.training_costs.food,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',spies.training_costs.ore,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',spies.training_costs.water,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',spies.training_costs.energy,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',spies.training_costs.waste,'</span></li>',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
            this.trainTab.subscribe("activeChange", this.trainView, this, true);
            var btn = Sel.query("button", this.trainTab.get("contentEl"), true);
            if(btn) {
                Event.on(btn, "click", this.SpyTrain, this, true);
            }
            
            return this.trainTab;
        },
        
        trainView : function(e) {
            var spies = this.result.spies;
            var canTrain = spies.training_costs.time;
            Dom.get("spiesCurrent").innerHTML = spies.in_training;
            if (canTrain.length > 0) {
                Dom.setStyle('spiesTrainOptions', 'display', '');
                var elNumSelect = Dom.get('spiesTrainId');
                var currentNum = elNumSelect.children.length;
                for (var i = 0; i < currentNum; i++) {
                    elNumSelect.removeChild(elNumSelect.lastChild);
                }
                for (var n = 0; n < canTrain.length; n++) {
                    var elOption = document.createElement('option');
                    elOption.value = canTrain[n].spy_id;
                    elOption.innerHTML = canTrain[n].name + ' - Recovery: ' + Lib.formatTime(canTrain[n].time);
                    elNumSelect.appendChild(elOption);
                }
            }
            else {
                Dom.setStyle('spiesTrainOptions', 'display', 'none');
            }

        },
        
        SpyTrain : function() {
            var select = Dom.get("spiesTrainId");
            var selected = select.selectedIndex;
            var option = select[selected];
            var id = option.value;
            
            if(id.length > 0) {
                Lacuna.Pulser.Show();
                this.service.train_spy({session_id:Game.GetSession(),building_id:this.building.id,spy_id:id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "IntelTraining.SpyTrain.success");
                        Lacuna.Pulser.Hide();
                        this.rpcSuccess(o);
                        var trained = o.result.trained*1;
                        if(trained > 0) {
                            this.result.spies.training_costs.time.splice(selected, 1);
                            this.result.spies.in_training = this.result.spies.in_training*1 + trained;
                            this.trainView();
                        }
                        var not_trained = o.result.not_trained*1;
                        if(not_trained > 0) {
                            alert('You do not have enough resources.');
                        }
                    },
                    scope:this
                });
            }
        }
    });
    
    YAHOO.lacuna.buildings.IntelTraining = IntelTraining;

})();
YAHOO.register("IntelTraining", YAHOO.lacuna.buildings.IntelTraining, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
