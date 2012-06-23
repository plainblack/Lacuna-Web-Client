YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.SpeciesDesigner == "undefined" || !YAHOO.lacuna.SpeciesDesigner) {

(function(){
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Slider = YAHOO.widget.Slider,
        Lib = Lacuna.Library;

    var SpeciesDesigner = function( config ) {
        if ( (typeof config !== 'undefined') && (typeof config.templates !== 'undefined') && ! config.templates ) {
            this.speciesTemplates = [];
        }
        else {
            this.speciesTemplates = [
                {
                    name : 'Average',
                    description : 'Not specializing in any area, but without any particular weaknesses.',
                    min_orbit: 3,
                    max_orbit: 3,
                    manufacturing_affinity: 4,
                    deception_affinity: 4,
                    research_affinity: 4,
                    management_affinity: 4,
                    farming_affinity: 4,
                    mining_affinity: 4,
                    science_affinity: 4,
                    environmental_affinity: 4,
                    political_affinity: 4,
                    trade_affinity: 4,
                    growth_affinity : 4
                },
                {
                    name : 'Resilient',
                    description : 'Resilient and able to colonize most any planet.  Somewhat docile, but very quick learners and above average at producing any resource.',
                    min_orbit: 2,
                    max_orbit: 7,
                    manufacturing_affinity: 3,
                    deception_affinity: 3,
                    research_affinity: 3,
                    management_affinity: 5,
                    farming_affinity: 5,
                    mining_affinity: 5,
                    science_affinity: 5,
                    environmental_affinity: 5,
                    political_affinity: 1,
                    trade_affinity: 1,
                    growth_affinity : 3
                },
                {
                    name : 'Warmonger',
                    description : 'Adept at ship building and espionage. They are bent on domination.',
                    min_orbit: 4,
                    max_orbit: 5,
                    manufacturing_affinity: 4,
                    deception_affinity: 7,
                    research_affinity: 2,
                    management_affinity: 4,
                    farming_affinity: 2,
                    mining_affinity: 2,
                    science_affinity: 7,
                    environmental_affinity: 2,
                    political_affinity: 7,
                    trade_affinity: 1,
                    growth_affinity : 5
                },
                {
                    name : 'Viral',
                    description : 'Proficient at growing at the most expedient pace like a virus in the Expanse.',
                    min_orbit: 1,
                    max_orbit: 7,
                    manufacturing_affinity: 1,
                    deception_affinity: 4,
                    research_affinity: 7,
                    management_affinity: 7,
                    farming_affinity: 1,
                    mining_affinity: 1,
                    science_affinity: 1,
                    environmental_affinity: 1,
                    political_affinity: 7,
                    trade_affinity: 1,
                    growth_affinity : 7
                },
                {
                    name : 'Trader',
                    description : 'Masters of commerce and ship building.',
                    min_orbit: 2,
                    max_orbit: 3,
                    manufacturing_affinity: 5,
                    deception_affinity: 4,
                    research_affinity: 7,
                    management_affinity: 7,
                    farming_affinity: 1,
                    mining_affinity: 1,
                    science_affinity: 7,
                    environmental_affinity: 1,
                    political_affinity: 1,
                    trade_affinity: 7,
                    growth_affinity : 2
                }
            ];
        }
    };
    SpeciesDesigner.prototype = {
        render : function(el) {
            el = Dom.get(el);
            var container = document.createElement('div');
            this.container = container;
            container.innerHTML = this._getHtml();
            
            this.elMessage = Sel.query(".speciesMessage", container, true);
            this.elName = Sel.query(".speciesName", container, true);
            this.elDesc = Sel.query(".speciesDesc", container, true);
            this.elTemplates = Sel.query(".speciesTemplates", container, true);
            if (this.speciesTemplates.length > 0) {
                Event.delegate(this.elTemplates, 'click', function(e, matchedEl) {
                    Event.stopEvent(e);
                    this.selectTemplate(matchedEl.TemplateIndex);
                }, '.speciesTemplate', this, true);
                
                for (var i = 0; i < this.speciesTemplates.length; i++) {
                    var template = this.speciesTemplates[i];
                    var tButton = document.createElement('button');
                    tButton.innerHTML = template.name;
                    tButton.title = template.description;
                    tButton.TemplateIndex = i;
                    Dom.addClass(tButton, 'speciesTemplate');
                    this.elTemplates.appendChild(tButton);
                }
            }
            else {
                Dom.setStyle(Sel.query(".speciesButtons", container, true), 'display', 'none');
            }
            el.appendChild(container);
            this._createSliders();
            this._createTooltips();
            if (this.speciesTemplates.length > 0) {
                this.selectTemplate(0);
            }
        },
        _createSliders : function() {
            this.speciesHO = this._createHabitableOrbits();
            this.speciesConst = this._createHorizSingle("speciesConst", "speciesConst_thumb", "speciesConst_num");
            this.speciesDecep = this._createHorizSingle("speciesDecep", "speciesDecep_thumb", "speciesDecep_num");
            this.speciesResearch = this._createHorizSingle("speciesResearch", "speciesResearch_thumb", "speciesResearch_num");
            this.speciesManagement = this._createHorizSingle("speciesManagement", "speciesManagement_thumb", "speciesManagement_num");
            this.speciesFarming = this._createHorizSingle("speciesFarming", "speciesFarming_thumb", "speciesFarming_num");
            this.speciesMining = this._createHorizSingle("speciesMining", "speciesMining_thumb", "speciesMining_num");
            this.speciesScience = this._createHorizSingle("speciesScience", "speciesScience_thumb", "speciesScience_num");
            this.speciesEnviro = this._createHorizSingle("speciesEnviro", "speciesEnviro_thumb", "speciesEnviro_num");
            this.speciesPolitical = this._createHorizSingle("speciesPolitical", "speciesPolitical_thumb", "speciesPolitical_num");
            this.speciesTrade = this._createHorizSingle("speciesTrade", "speciesTrade_thumb", "speciesTrade_num");
            this.speciesGrowth = this._createHorizSingle("speciesGrowth", "speciesGrowth_thumb", "speciesGrowth_num");
            
            this.elTotal = Sel.query(".speciesPointTotal", this.container, true);
            this.elTotal.innerHTML = 45;
            this.elTotalLine = Sel.query(".speciesPointLine", this.container, true);
            
            var updateTotal = function() {
                var total = this.getSpeciesData().affinity_total;
                this.elTotal.innerHTML = total;
                
                if(total > 45) {
                    Dom.removeClass(this.elTotalLine, "speciesPointsValid");
                    Dom.removeClass(this.elTotalLine, "speciesPointsLow");
                    Dom.addClass(this.elTotalLine, "speciesPointsInvalid");
                }
                else if(total == 45) {
                    Dom.addClass(this.elTotalLine, "speciesPointsValid");
                    Dom.removeClass(this.elTotalLine, "speciesPointsLow");
                    Dom.removeClass(this.elTotalLine, "speciesPointsInvalid");
                }
                else {
                    Dom.removeClass(this.elTotalLine, "speciesPointsValid");
                    Dom.addClass(this.elTotalLine, "speciesPointsLow");
                    Dom.removeClass(this.elTotalLine, "speciesPointsInvalid");
                }
            };
            
            this.speciesHO.subscribe('change', updateTotal, this, true);
            this.speciesConst.subscribe('change', updateTotal, this, true);
            this.speciesDecep.subscribe('change', updateTotal, this, true);
            this.speciesResearch.subscribe('change', updateTotal, this, true);
            this.speciesManagement.subscribe('change', updateTotal, this, true);
            this.speciesFarming.subscribe('change', updateTotal, this, true);
            this.speciesMining.subscribe('change', updateTotal, this, true);
            this.speciesScience.subscribe('change', updateTotal, this, true);
            this.speciesEnviro.subscribe('change', updateTotal, this, true);
            this.speciesPolitical.subscribe('change', updateTotal, this, true);
            this.speciesTrade.subscribe('change', updateTotal, this, true);
            this.speciesGrowth.subscribe('change', updateTotal, this, true);
        },
        _createTooltips : function() {
            this._affinityTooltip = new YAHOO.widget.Tooltip(Dom.generateId(), {
                //iframe:true,
                zIndex:1,
                container: this.container,
                xyoffset:[0,10],
                context: Sel.query('.speciesAffinities label', this.container)
            });
        },
        _createHabitableOrbits : function () {
            var range = 180,
                tickSize = 30,
                from = Sel.query(".speciesHO_from", this.container, true),
                to = Sel.query(".speciesHO_to", this.container, true);

            // Create the DualSlider
            var YW = YAHOO.widget;

            var elMinThumb = Sel.query('.speciesHO_min_thumb', this.container, true);
            elMinThumb.id = Dom.generateId();
            var elMin = Sel.query('.speciesHO_min', this.container, true);
            elMin.id = Dom.generateId();
            var elMaxThumb = Sel.query('.speciesHO_max_thumb', this.container, true);
            elMaxThumb.id = Dom.generateId();
            var elMax = Sel.query('.speciesHO_max', this.container, true);
            elMax.id = Dom.generateId();
            var elSlider = Sel.query(".speciesHO", this.container, true);
            elSlider.id = Dom.generateId();

            var mint = new YW.SliderThumb(elMinThumb.id, elMin.id, 0, range, 0, 0, tickSize);
            var maxt = new YW.SliderThumb(elMaxThumb.id, elMax.id, 0, range, 0, 0, tickSize);

            var mins = new YW.Slider(elSlider.id, elSlider.id, mint, "horiz");
            var maxs = new YW.Slider(elSlider.id, elSlider.id, maxt, "horiz");
            var slider = new YW.DualSlider(mins, maxs, range, [90,90]);
            var mintSetX = mint.setXConstraint;
            mint.setXConstraint = function (iLeft, iRight, iTickSize) {
                if (slider.minLock) {
                    iRight = ( slider.minLock - 1 ) * iTickSize;
                }
                else {
                    iRight += iTickSize * 1.5;
                }
                mintSetX.apply(mint, [iLeft, iRight, iTickSize]);
            };
            var maxtSetX = maxt.setXConstraint;
            maxt.setXConstraint = function (iLeft, iRight, iTickSize) {
                if (slider.maxLock) {
                    iLeft = ( 1 - slider.maxLock ) * iTickSize;
                }
                else {
                    iLeft += iTickSize;
                }
                maxtSetX.apply(maxt, [iLeft, iRight, iTickSize]);
            };
            
            // slider.minRange = -15;
            // Decorate the DualSlider instance with some new properties and
            // methods to maintain the highlight element
            YAHOO.lang.augmentObject(slider, {
                setLocks : function(min, max) {
                    this.minLock = min;
                    this.maxLock = max;
                    var delta = max - min;
                    Dom.setStyle(this._lock,'display', 'block');
                    Dom.setStyle(this._lock,'left', ( min * tickSize - 23 ) + 'px');
                    Dom.setStyle(this._lock,'width', Math.max(delta * tickSize,0) + 'px');
                },
                minLock : undefined,
                maxLock : undefined,
                _lock : Sel.query('.speciesSlider_lock', elSlider, true),
                // The highlight element
                _highlight : Sel.query('.speciesHO_highlight', this.container, true),
                // A method to update the status and update the highlight
                updateHighlight : function () {
                    var delta = this.maxVal - this.minVal;
                    Dom.setStyle(this._highlight,'left', (this.minVal - 5) + 'px');
                    Dom.setStyle(this._highlight,'width', Math.max(delta + 27,0) + 'px');
                },
                getMinOrbit : function() {
                    return Math.round((this.minVal - 14) / tickSize) + 1;
                },
                getMaxOrbit : function() {
                    return Math.round((this.maxVal + 14) / tickSize) + 1;
                },
                setMinOrbit : function(orbit, skipAnim, force, silent) {
                    var value = (orbit - 1) * tickSize + 14;
                    this.setMinValue(value, skipAnim, force, silent);
                    return orbit;
                },
                setMaxOrbit : function(orbit, skipAnim, force, silent) {
                    var value = (orbit - 1) * tickSize - 14;
                    this.setMaxValue(value, skipAnim, force, silent);
                    return orbit;
                },
                setOrbits : function(minOrbit, maxOrbit, skipAnim, force, silent) {
                    var min = (minOrbit - 1) * tickSize + 14;
                    var max = (maxOrbit - 1) * tickSize - 14;
                    this.setValues(min, max, skipAnim, force, silent);
                }
            },true);
            // Attach the highlight method to the slider's change event
            slider.subscribe('change',slider.updateHighlight,slider,true);
            //this.Dialog.showEvent.subscribe(slider.updateHighlight,slider,true);
            slider.updateHighlight();

            var updateUI = function () {
                from.innerHTML = this.getMinOrbit();
                to.innerHTML = this.getMaxOrbit();
            };
            slider.subscribe('ready', updateUI);
            slider.subscribe('change', updateUI);

            return slider;
        },
        _createHorizSingle : function (container, thumb, num) {
            var range = 180,
                tickSize = 30,
                elNum = Sel.query('.'+num, this.container, true);
            container = Sel.query('.'+container, this.container, true);
            container.id = Dom.generateId();
            thumb = Sel.query('.'+thumb, this.container, true);
            thumb.id = Dom.generateId();
            // Create the Slider
            var slider = Slider.getHorizSlider(container.id,
                thumb.id, 0, range, tickSize);
            slider.key = container.id;
            YAHOO.lang.augmentObject(slider, {
                setLock : function(min) {
                    Dom.setStyle(this._lock,'display', 'block');
                    Dom.setStyle(this._lock,'left', '0px');
                    Dom.setStyle(this._lock,'width', ((min - 1) * tickSize + 8) + 'px');
                    this.thumb.setXConstraint((1 - min) * tickSize, range, tickSize);
                },
                _lock : Sel.query('.speciesSlider_lock', container, true),
                getAffinity : function() {
                    return Math.round(this.getValue() / tickSize + 1);
                },
                setAffinity : function(affinity, skipAnim, force, silent) {
                    var value = (affinity - 1) * tickSize;
                    this.setValue(value, skipAnim, force, silent);
                    return affinity;
                }
            }, true);
            slider.setAffinity(4);
            var updateUI = function () {
                elNum.innerHTML = this.getAffinity();
            };
            slider.subscribe('ready', updateUI);
            slider.subscribe('change', updateUI);

            return slider;
        },
        getSpeciesData : function() {
            var data = {
                name: this.elName.value,
                description: this.elDesc.value.substr(0,1024),
                min_orbit: this.speciesHO.getMinOrbit(),
                max_orbit: this.speciesHO.getMaxOrbit(),
                manufacturing_affinity: this.speciesConst.getAffinity(),
                deception_affinity: this.speciesDecep.getAffinity(),
                research_affinity: this.speciesResearch.getAffinity(),
                management_affinity: this.speciesManagement.getAffinity(),
                farming_affinity: this.speciesFarming.getAffinity(),
                mining_affinity: this.speciesMining.getAffinity(),
                science_affinity: this.speciesScience.getAffinity(),
                environmental_affinity: this.speciesEnviro.getAffinity(),
                political_affinity: this.speciesPolitical.getAffinity(),
                trade_affinity: this.speciesTrade.getAffinity(),
                growth_affinity : this.speciesGrowth.getAffinity()
            };
            data.affinity_total =
                data.max_orbit - data.min_orbit + 1 +
                data.manufacturing_affinity +
                data.deception_affinity +
                data.research_affinity +
                data.management_affinity +
                data.farming_affinity +
                data.mining_affinity +
                data.science_affinity +
                data.environmental_affinity +
                data.political_affinity +
                data.trade_affinity +
                data.growth_affinity;
            return data;
        },
        setSpeciesData : function(data) {
            this.elName.value = data.name;
            this.elDesc.value = data.description;
            this.speciesHO.setOrbits(data.min_orbit, data.max_orbit, true, true);
            this.speciesConst.setAffinity(data.manufacturing_affinity,true,true);
            this.speciesDecep.setAffinity(data.deception_affinity,true,true);
            this.speciesResearch.setAffinity(data.research_affinity,true,true);
            this.speciesManagement.setAffinity(data.management_affinity,true,true);
            this.speciesFarming.setAffinity(data.farming_affinity,true,true);
            this.speciesMining.setAffinity(data.mining_affinity,true,true);
            this.speciesScience.setAffinity(data.science_affinity,true,true);
            this.speciesEnviro.setAffinity(data.environmental_affinity,true,true);
            this.speciesPolitical.setAffinity(data.political_affinity,true,true);
            this.speciesTrade.setAffinity(data.trade_affinity,true,true);
            this.speciesGrowth.setAffinity(data.growth_affinity,true,true);
        },
        setSpeciesLocks : function(data) {
            this.speciesHO.setLocks(data.min_orbit, data.max_orbit);
            this.speciesGrowth.setLock(data.min_growth);
        },
        compareSpeciesData : function (species1, species2) {
            return (
                species1.manufacturing_affinity == species2.manufacturing_affinity &&
                species1.deception_affinity     == species2.deception_affinity &&
                species1.research_affinity      == species2.research_affinity &&
                species1.management_affinity    == species2.management_affinity &&
                species1.farming_affinity       == species2.farming_affinity &&
                species1.mining_affinity        == species2.mining_affinity &&
                species1.science_affinity       == species2.science_affinity &&
                species1.environmental_affinity == species2.environmental_affinity &&
                species1.political_affinity     == species2.political_affinity &&
                species1.trade_affinity         == species2.trade_affinity &&
                species1.growth_affinity        == species2.growth_affinity
            );
        },
        setExpert : function() {
            this._expert = true;
        },
        clearExpert : function() {
            delete this._expert;
        },
        needsExpert : function (data) {
            return (
                data.manufacturing_affinity == 1 ||
                data.deception_affinity == 1 ||
                data.research_affinity == 1 ||
                data.management_affinity == 1 ||
                data.farming_affinity == 1 ||
                data.mining_affinity == 1 ||
                data.science_affinity == 1 ||
                data.environmental_affinity == 1 ||
                data.political_affinity == 1 ||
                data.trade_affinity == 1 ||
                data.growth_affinity == 1
            );
        },
        selectTemplate : function(index) {
            var data = this.speciesTemplates[index];
            this.setSpeciesData(data);
        },
        validateSpecies : function(data) {
            if (data.affinity_total > 45) {
                throw "You can only have a maximum of 45 points.";
            }
            else if (data.affinity_total < 45) {
                throw "You must use exactly 45 points.";
            }
            else if ( ! this._expert && this.needsExpert(data) ) {
                if (confirm("Setting an affinity to 1 is an expert setting, and is not recommended unless you're absolutely sure you know what you're doing.  Are you sure you want to continue?")) {
                    this._expert = true;
                }
                else {
                    return false;
                }
            }
            return true;
        },
        _getHtml : function() {
            var nameId = Dom.generateId();
            var descId = Dom.generateId();
            return [
                '<div class="speciesButtons">',
                '    Presets: ',
                '    <span class="speciesTemplates">',
                '    </span>',
                '</div>',
                '<div class="speciesCreate">',
                '    <ul>',
                '        <li style="margin-bottom:3px;"><label for="',nameId,'">Species Name</label><input id="',nameId,'" type="text" class="speciesName" maxlength="30" size="30" /></label></li>',
                '        <li><label for="',descId,'">Description</label><textarea id="',descId,'" class="speciesDesc" cols="40" rows="4"></textarea></li>',
                '        <li style="margin: 10px 0;"><span class="affinitiesLabel">Affinities:</span><span class="speciesPointLine speciesPointsValid"><label>Points</label><span class="speciesPointTotal">0</span>/45</span></li>',
                '    </ul>',
                '    <div class="yui-g speciesAffinities">',
                '        <div class="yui-u first">',
                '            <ul>',
                '                <li><label title="Determines the orbits your species can inhabit. Orbits 2-5 have the most abundant food. Orbits 1,6 and 7 have less competition from other players.">Habitable Orbits</label>',
                '                    <div class="speciesHO speciesSlider_bg" title="Habitable Orbits Selector">',
                '                        <span class="speciesHO_highlight"></span>',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesHO_min">',
            '                                 <div class="speciesHO_min_thumb speciesSliderThumb"><span class="speciesHO_from thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb-half-left.png" /></div>',
                '                        </div>',
                '                        <div class="speciesHO_max">',
                '                            <div class="speciesHO_max_thumb speciesSliderThumb"><span class="speciesHO_to thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb-half-right.png" /></div>',
                '                        </div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases the output of buildings that convert one resource into another.">Manufacturing</label>',
                '                    <div class="speciesConst speciesSlider_bg" title="Manufacturing Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesConst_thumb speciesSliderThumb"><span class="speciesConst_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Determines how skilled your spies are naturally.">Deception</label>',
                '                    <div class="speciesDecep speciesSlider_bg" title="Deception Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesDecep_thumb speciesSliderThumb"><span class="speciesDecep_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Decreases the amount of resources it takes to upgrade buildings.">Research</label>',
                '                    <div class="speciesResearch speciesSlider_bg" title="Research Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesResearch_thumb speciesSliderThumb"><span class="speciesResearch_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Decreases the amount of time it takes to build and process everything.">Management</label>',
                '                    <div class="speciesManagement speciesSlider_bg" title="Management Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesManagement_thumb speciesSliderThumb"><span class="speciesManagement_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases your production of food.">Farming</label>',
                '                    <div class="speciesFarming speciesSlider_bg" title="Farming Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesFarming_thumb speciesSliderThumb"><span class="speciesFarming_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '            </ul>',
                '        </div>',
                '        <div class="yui-u">',
                '            <ul>',
                '                <li><label title="Increases your production of ore.">Mining</label>',
                '                    <div class="speciesMining speciesSlider_bg" title="Mining Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesMining_thumb speciesSliderThumb"><span class="speciesMining_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases production from power plants, and technological upgrades such as the Propulsion Factory.">Science</label>',
                '                    <div class="speciesScience speciesSlider_bg" title="Science Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesScience_thumb speciesSliderThumb"><span class="speciesScience_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases your production of water, and decreases your production of waste.">Environmental</label>',
                '                    <div class="speciesEnviro speciesSlider_bg" title="Environmental Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesEnviro_thumb speciesSliderThumb"><span class="speciesEnviro_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases happiness production, and lowers the cost of settling new colonies.">Political</label>',
                '                    <div class="speciesPolitical speciesSlider_bg" title="Political Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesPolitical_thumb speciesSliderThumb"><span class="speciesPolitical_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Increases the amount of goods that can be hauled on cargo ships and transported through Subspace Transporters, and gives you some advantages trading with Lacuna Expanse Corp.">Trade</label>',
                '                    <div class="speciesTrade speciesSlider_bg" title="Trade Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesTrade_thumb speciesSliderThumb"><span class="speciesTrade_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '                <li><label title="Sets the starting size of your Planetary Command Center on each colony you create, which gives you more starting production and storage.">Growth</label>',
                '                    <div class="speciesGrowth speciesSlider_bg" title="Growth Selector">',
                '                        <span class="speciesSlider_lock"><span class="speciesSlider_lock_bg"></span></span>',
                '                        <div class="speciesGrowth_thumb speciesSliderThumb"><span class="speciesGrowth_num thumbDisplay">1</span><img src="',Lib.AssetUrl,'ui/web/slider-thumb.png" /></div>',
                '                    </div>',
                '                </li>',
                '            </ul>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('');
        }
    };
    //YAHOO.lang.augmentProto(SpeciesDesigner, Util.EventProvider);

    Lacuna.SpeciesDesigner = SpeciesDesigner;
})();
YAHOO.register("speciesDesigner", YAHOO.lacuna.SpeciesDesigner, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
