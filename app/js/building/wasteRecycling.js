YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.WasteRecycling == "undefined" || !YAHOO.lacuna.buildings.WasteRecycling) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var WasteRecycling = function(result){
        WasteRecycling.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Recycler;
    };
    
    Lang.extend(WasteRecycling, Lacuna.buildings.Building, {
        getChildTabs : function() {
            if(this.building.level > 0) {
                var t = this._getRecycleTab();
                if(t) {
                    return [t];
                }
            }
        },
        _getRecycleTab : function() {
            if(this.result.recycle.can) {
                this.recycleTab = new YAHOO.widget.Tab({ label: "Recycle", contentEl: this.RecycleGetDisplay(this.result.recycle)});
            }
            else if(this.result.recycle.seconds_remaining) {
                this.recycleTab = new YAHOO.widget.Tab({label: "Recycle", contentEl: this.RecycleGetTimeDisplay(this.result.recycle)});
                this.addQueue(this.result.recycle.seconds_remaining, this.RecycleQueue, "recycleTime", this);
            }
                    
            return this.recycleTab;
        },
        
        Recycle : function(e, options) {
            var planet = Game.GetCurrentPlanet();
            if(planet) {
                var ore = this.recycleOreEl.value*1,
                    water = this.recycleWaterEl.value*1,
                    energy = this.recycleEnergyEl.value*1,
                    total = ore + water + energy,
                    useE = options ? options.instant : 0;
                if(total > planet.waste_stored) {
                    this.recycleMessageEl.innerHTML = "Can only recycle waste you have stored.";
                }
                else {
                    require('js/actions/menu/loader').show();
                    
                    this.service.recycle({
                        session_id:Game.GetSession(),
                        building_id:this.building.id,
                        water:water,
                        ore:ore,
                        energy:energy,
                        use_essentia:useE
                    }, {
                        success : function(o){
                            YAHOO.log(o, "info", "WasteRecycling.Recycle.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.work = o.result.building.work;
                            //this.updateBuildingTile(o.result.building);
                            if(this.recycleTab){
                                var ce = this.recycleTab.get("contentEl");
                                Event.purgeElement(ce);
                                ce.innerHTML = "";
                                if(this.work && this.work.seconds_remaining && this.work.seconds_remaining*1 > 0) {
                                    ce.appendChild(this.RecycleGetTimeDisplay(o.result.recycle, water, ore, energy));
                                    this.addQueue(this.work.seconds_remaining, this.RecycleQueue, "recycleTime", this);
                                }
                                else {
                                    ce.appendChild(this.RecycleGetDisplay(o.result.recycle));
                                    this.recycleMessageEl.innerHTML = "Successfully recycled " + Lib.formatNumber(total) + " waste.";
                                }
                            }
                        },
                        scope:this
                    });
                }
            }
        },
        RecycleGetDisplay : function(recycle) {
            var planet = Game.GetCurrentPlanet(),
                ul = document.createElement("ul"),
                li = document.createElement("li"),
                nLi = li.cloneNode(false),
                input,
                btn;
                
            if(recycle) {
                this.recycle = recycle;
            }
            
            if(this.recycle) {
                nLi.innerHTML = ['Can recycle a maximum of ',Lib.formatNumber(this.recycle.max_recycle),' waste at ', Lib.formatNumber(Math.floor(3600 / this.recycle.seconds_per_resource)),'/hour.'].join(''); 
                ul.appendChild(nLi);
                
                nLi = li.cloneNode(false);
            }
            
            nLi.innerHTML = '<label>Recycle into:</label>';
            ul.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/ore.png" class="smallOre" /></span>';
            input = document.createElement("input");
            input.id = "recycleOreAmount";
            input.type = "text";
            input.value = 0;
            input = nLi.appendChild(input);
            Event.on(input, "change", this.RecycleValueChange, this, true);
            this.recycleOreEl = input;
            btn = document.createElement("button");
            btn.setAttribute("type","button");
            btn.innerHTML = "Max";
            btn.resourceType = "ore";
            btn = nLi.appendChild(btn);
            Event.on(btn, "click", this.MaxValue, this, true);
            ul.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/water.png" class="smallWater" /></span>';
            input = document.createElement("input");
            input.id = "recycleWaterAmount";
            input.type = "text";
            input.value = 0;
            input = nLi.appendChild(input);
            Event.on(input, "change", this.RecycleValueChange, this, true);
            this.recycleWaterEl = input;
            btn = document.createElement("button");
            btn.setAttribute("type","button");
            btn.innerHTML = "Max";
            btn.resourceType = "water";
            btn = nLi.appendChild(btn);
            Event.on(btn, "click", this.MaxValue, this, true);
            
            btn = document.createElement("button");
            btn.setAttribute("type","button");
            btn.innerHTML = "Distribute Evenly";
            btn = nLi.appendChild(btn);
            Event.on(btn, "click", this.Distribute, this, true);
            ul.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            nLi.innerHTML = '<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/energy.png" class="smallEnergy" /></span>';
            input = document.createElement("input");
            input.id = "recycleEnergyAmount";
            input.type = "text";
            input.value = 0;
            input = nLi.appendChild(input);
            Event.on(input, "change", this.RecycleValueChange, this, true);
            this.recycleEnergyEl = input;
            btn = document.createElement("button");
            btn.setAttribute("type","button");
            btn.innerHTML = "Max";
            btn.resourceType = "energy";
            btn = nLi.appendChild(btn);
            Event.on(btn, "click", this.MaxValue, this, true);
            ul.appendChild(nLi);
            
            nLi = li.cloneNode(false);
            nLi.innerHTML = '<label>Total:</label>';
            var span = nLi.appendChild(document.createElement("span"));
            span.innerHTML = 0;
            ul.appendChild(nLi);
            this.totalWasteToRecycle = 0;
            this.totalWasteToRecycleEl = span;
            
            var div = document.createElement("div");
            Dom.addClass(div, 'recycleTab');
            div.appendChild(ul);
            
            var fieldset;
            var form = document.createElement('form');
            fieldset = document.createElement('fieldset');
            fieldset.innerHTML = '<legend>Recycle</legend>';
            var label = fieldset.appendChild(document.createElement('label'));
            label.innerHTML = 'Time to Recycle:<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/time.png" class="smallTime" title="Time" /></span>';
            span = label.appendChild(document.createElement("span"));
            span.innerHTML = 0;
            this.totalTimeToRecycle = span;
            btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "Recycle";
            btn = fieldset.appendChild(btn);
            Event.on(btn, "click", this.Recycle, undefined, this, true);
            form.appendChild(fieldset);

            if(Game.EmpireData.essentia*1 >= 2) {
                fieldset = document.createElement('fieldset');
                fieldset.innerHTML = '<legend>Instant Recycle</legend><label>Cost to recycle:<span class="smallImg"><img src="'+Lib.AssetUrl+'ui/s/essentia.png" class="smallEssentia" title="Essentia" /></span>2</label>';
                btn = document.createElement("button");
                btn.setAttribute("type", "button");
                btn.innerHTML = "Recycle Instantly";
                btn = fieldset.appendChild(btn);
                Event.on(btn, "click", this.Recycle, {instant : true}, this, true);
                form.appendChild(fieldset);
            }
            
            div.appendChild(form);
            
            this.recycleMessageEl = div.appendChild(document.createElement('div'));
            
            return div;
        },
        Distribute : function(e) {
            var btn = Event.getTarget(e),
                cp = Game.GetCurrentPlanet(),
                maxVal = cp.waste_stored <= this.recycle.max_recycle ? cp.waste_stored : this.recycle.max_recycle;
                third = Math.round(maxVal / 3);
                
            this.recycleOreEl.value = third;
            
            third = Math.round( (maxVal - third) / 2 );
            this.recycleWaterEl.value = third;
            
            third = Math.floor(maxVal - third - this.recycleOreEl.value);
            this.recycleEnergyEl.value = third;
            
            this.totalWasteToRecycle = maxVal;
            this.totalWasteToRecycleEl.innerHTML = Lib.formatNumber(this.totalWasteToRecycle);
            this.SetTime();
        },
        MaxValue : function(e) {
            var btn = Event.getTarget(e),
                input = btn.input,
                cp = Game.GetCurrentPlanet(),
                origVal, newVal;
                
            switch(btn.resourceType) {
                case "ore":
                    origVal = this.recycleOreEl.value*1;
                    newVal = Math.round(cp.waste_stored > this.recycle.max_recycle ? this.recycle.max_recycle : cp.waste_stored); 
                    this.recycleOreEl.value = newVal;
                    this.recycleWaterEl.value = 0;
                    this.recycleEnergyEl.value = 0;
                    break;
                case "water":
                    origVal = this.recycleWaterEl.value*1;
                    newVal = Math.round(cp.waste_stored > this.recycle.max_recycle ? this.recycle.max_recycle : cp.waste_stored);  
                    this.recycleWaterEl.value = newVal;
                    this.recycleOreEl.value = 0;
                    this.recycleEnergyEl.value = 0;
                    break;
                case "energy":
                    origVal = this.recycleEnergyEl.value*1;
                    newVal = Math.round(cp.waste_stored > this.recycle.max_recycle ? this.recycle.max_recycle : cp.waste_stored); 
                    this.recycleEnergyEl.value = newVal;
                    this.recycleOreEl.value = 0;
                    this.recycleWaterEl.value = 0;
                    break;
            }
            
            this.totalWasteToRecycle = newVal;
            this.totalWasteToRecycleEl.innerHTML = Lib.formatNumber(this.totalWasteToRecycle);
            this.SetTime();
        },
        SetTime : function() {
            var seconds = this.totalWasteToRecycle * this.recycle.seconds_per_resource;
            
            this.totalTimeToRecycle.innerHTML = Lib.formatTime(seconds);
        },
        RecycleGetTimeDisplay : function(recycle, water, ore, energy) {
            var div = document.createElement("div"),
                btnDiv = div.cloneNode(false);
            div.innerHTML = ['<p>Current recycling job:</p>',
                '<ul><li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span>',recycle.ore || ore || '','</li>',
                '<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span>',recycle.water || water || '','</li>',
                '<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span>',recycle.energy || energy || '','</li>',
                '<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span id="recycleTime">',Lib.formatTime(recycle.seconds_remaining),'</span></li></ul>'
            ].join('');
            
            btnDiv.appendChild(document.createTextNode("You may subsidize the recycle job for 2 essentia and finish it immediately. "));
            
            var bbtn = document.createElement("button");
            bbtn.setAttribute("type", "button");
            bbtn.innerHTML = "Subsidize";
            bbtn = btnDiv.appendChild(bbtn);
            Event.on(bbtn, "click", this.RecycleSubsidize, this, true);
            
            div.appendChild(btnDiv);
            return div;
        },
        RecycleQueue : function(remaining, el){
            el = Dom.get(el);
            if (! el) {
                return;
            }
            if (remaining < 0 ) {
                remaining = 0;
            }
            el.innerHTML = Lib.formatTime(Math.round(remaining));
            if(Math.round(remaining) == 0) {
                if(this.recycleTab){
                    var ce = this.recycleTab.get("contentEl");
                    Event.purgeElement(ce);
                    ce.innerHTML = "";
                    ce.appendChild(this.RecycleGetDisplay(this.result.recycle));
                }
            }
        },
        RecycleValueChange : function(e){
            this.totalWasteToRecycle = this.recycleOreEl.value * 1 + this.recycleWaterEl.value*1 + this.recycleEnergyEl.value*1;
            this.totalWasteToRecycleEl.innerHTML = Lib.formatNumber(this.totalWasteToRecycle);
            this.SetTime();
        },
        RecycleSubsidize : function() {
            require('js/actions/menu/loader').show();
            this.service.subsidize_recycling({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "WasteRecycling.RecycleSubsidize.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    
                    this.resetQueue();

                    if(this.recycleTab){
                        var ce = this.recycleTab.get("contentEl");
                        Event.purgeElement(ce);
                        ce.innerHTML = "";
                        ce.appendChild(this.RecycleGetDisplay(o.result.recycle));
                    }
                },
                scope:this
            });
        }

    });
    
    YAHOO.lacuna.buildings.WasteRecycling = WasteRecycling;

})();
YAHOO.register("wasterecycling", YAHOO.lacuna.buildings.WasteRecycling, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
