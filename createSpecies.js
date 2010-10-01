YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateSpecies == "undefined" || !YAHOO.lacuna.CreateSpecies) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Slider = YAHOO.widget.Slider,
		Lib = Lacuna.Library;

	var CreateSpecies = function(Empire) {
		this.id = "createSpecies";
		this._empire = Empire;
		this.createEvent("onCreateSuccessful");
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:false,
			fixedcenter:true,
			postmethod:"none",
			visible:false,
			buttons:[ { text:"Found Empire", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
				{ text:"Cancel", handler:{fn:this.handleCancel, scope:this} } ],
			draggable:true,
			modal:true,
			close:false,
			width:"735px",
			underlay:false,
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elMessage = Dom.get("speciesMessage");
			this.elName = Dom.get("speciesName");
			this.elDesc = Dom.get("speciesDesc");
			this.elTemplates = Dom.get("speciesTemplates");
			this._createSliders();
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
			this.selectTemplate(0);
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
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
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	CreateSpecies.prototype = {
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
			
			this.elTotal = Dom.get("speciesPointTotal");
			this.elTotal.innerHTML = 45;
			
			var updateTotal = function() {
				var total = this.getSpeciesData().affinity_total;
				this.elTotal.innerHTML = total;
				
				if(total > 45) {
					Dom.removeClass("speciesPointTotalLine", "speciesPointsValid");
					Dom.removeClass("speciesPointTotalLine", "speciesPointsLow");
					Dom.addClass("speciesPointTotalLine", "speciesPointsInvalid");
				}
				else if(total == 45) {
					Dom.addClass("speciesPointTotalLine", "speciesPointsValid");
					Dom.removeClass("speciesPointTotalLine", "speciesPointsLow");
					Dom.removeClass("speciesPointTotalLine", "speciesPointsInvalid");
				}
				else {
					Dom.removeClass("speciesPointTotalLine", "speciesPointsValid");
					Dom.addClass("speciesPointTotalLine", "speciesPointsLow");
					Dom.removeClass("speciesPointTotalLine", "speciesPointsInvalid");
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

			this._affinityTooltip = new YAHOO.widget.Tooltip('speciesAffinityTooltip', {
				zIndex:10200,
				xyoffset:[0,10],
				context: Sel.query('.speciesAffinities label', 'speciesCreate')
			});
		},
		_createHabitableOrbits : function () {
			var range = 180,
				tickSize = 30,
				from = Dom.get("speciesHO_from"),
				to = Dom.get("speciesHO_to");

			// Create the DualSlider
			var YW = YAHOO.widget;
			var mint = new YW.SliderThumb("speciesHO_min_thumb", "speciesHO_min", 0, range, 0, 0, tickSize);
			var maxt = new YW.SliderThumb("speciesHO_max_thumb", "speciesHO_max", 0, range, 0, 0, tickSize);

			var mins = new YW.Slider("speciesHO", "speciesHO", mint, "horiz");
			var maxs = new YW.Slider("speciesHO", "speciesHO", maxt, "horiz");
			var slider = new YW.DualSlider(mins, maxs, range, [90,90]);
			var mintSetX = mint.setXConstraint;
			mint.setXConstraint = function (iLeft, iRight, iTickSize) {
				iRight += iTickSize * 1.5;
				mintSetX.apply(mint, [iLeft, iRight, iTickSize]);
			};
			var maxtSetX = maxt.setXConstraint;
			maxt.setXConstraint = function (iLeft, iRight, iTickSize) {
				iLeft += iTickSize;
				maxtSetX.apply(maxt, [iLeft, iRight, iTickSize]);
			};

			// slider.minRange = -15;
			// Decorate the DualSlider instance with some new properties and
			// methods to maintain the highlight element
			YAHOO.lang.augmentObject(slider, {
				// The highlight element
				_highlight : Dom.get("speciesHO_highlight"),
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
			this.Dialog.showEvent.subscribe(slider.updateHighlight,slider,true);
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
				elNum = Dom.get(num);

			// Create the Slider
			var slider = Slider.getHorizSlider(container,
				thumb, 0, range, tickSize);
			slider.key = container;
			YAHOO.lang.augmentObject(slider, {
				getAffinity : function() {
					return this.getValue() / tickSize + 1;
				},
				setAffinity : function(affinity, skipAnim, force, silent) {
					var value = (affinity - 1) * tickSize;
					this.setValue(value, skipAnim, force, silent);
					return affinity;
				}
			});
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
			else if ( ! this._expert && (
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
			)) {
				if (confirm("Setting an affinity to 1 is an expert setting, and is not recommended unless you're absolutely sure you know what you're doing.  Are you sure you want to continue?")) {
					this._expert = true;
				}
				else {
					return false;
				}
			}
			return true;
		},
		handleCreate : function() {
			this.setMessage("");
			var EmpireServ = Game.Services.Empire,
				data = this.getSpeciesData();
			try {
				if ( ! this.validateSpecies(data) ) {
					return;
				}
			}
			catch (e) {
				this.setMessage(e);
				return;
			}
			delete data.affinity_total;
			EmpireServ.update_species({empire_id: this.empireId, params: data}, {
				success : function(o) {
					YAHOO.log(o, "info", "CreateSpecies");
					this._found();
				},
				failure : function(o){
					Lacuna.Pulser.Hide();
					YAHOO.log(o, "error", "CreateSpeciesFailure");
					this.setMessage(o.error.message);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		handleCancel : function() {
			this.hide();
			this._empire.handleCancel();
		},

		_found : function() {
			Lacuna.Pulser.Show();
			var EmpireServ = Game.Services.Empire;
			EmpireServ.found({empire_id: this.empireId, api_key:Lib.ApiKey, invite_code:this.inviteCode}, {
				success : function(o) {
					YAHOO.log(o, "info", "CreateSpecies._found.success");
					Lacuna.Pulser.Hide();
					this.hide(); //hide species
					this.fireEvent("onCreateSuccessful", o);
				},
				failure : function(o) {
					YAHOO.log(o, "info", "CreateSpecies._found.failure");
					Lacuna.Pulser.Hide();
					this.setMessage(o.error.message);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		_getHtml : function() {
			return [
				'	<div class="hd">Create Species</div>',
				'	<div class="bd">',
				'		<form name="speciesForm">',
				'			<div id="speciesButtons">',
				'				Presets: ',
				'				<span id="speciesTemplates">',
				'				</span>',
				'			</div>',
				'			<div id="speciesCreate">',
				'				<ul style="margin-top:5px; padding-top:5px; border-top:1px solid #52acff;">',
				'					<li style="margin-bottom:3px;"><label for="speciesName">Species Name</label><input type="text" id="speciesName" maxlength="30" size="30" /></li>',
				'					<li><label for="speciesDesc">Description</label><textarea id="speciesDesc" cols="40" rows="4"></textarea></li>',
				'					<li><span class="affinitiesLabel">Affinities:</span><span id="speciesPointTotalLine" class="speciesPointTotal speciesPointsValid"><label>Points</label><span id="speciesPointTotal">0</span>/45</span></li>',
				'				</ul>',
				'				<div class="yui-g speciesAffinities">',
				'					<div class="yui-u first">',
				'						<ul>',
				'							<li><label title="Determines the orbits your species can inhabit. Orbits 2-5 have the most abundant food. Orbits 1,6 and 7 have less competition from other players.">Habitable Orbits</label>',
				'								<div id="speciesHO" class="speciesSlider_bg" title="Habitable Orbits Selector">',
				'									<span id="speciesHO_highlight"></span>',
				'									<div id="speciesHO_min">',
			'											<div id="speciesHO_min_thumb"><span id="speciesHO_from" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb-half-left.png" /></div>',
				'									</div>',
				'									<div id="speciesHO_max">',
				'										<div id="speciesHO_max_thumb"><span id="speciesHO_to" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb-half-right.png" /></div>',
				'									</div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases the output of buildings that convert one resource into another.">Manufacturing</label>',
				'								<div id="speciesConst" class="speciesSlider_bg" title="Manufacturing Selector">',
				'									<div id="speciesConst_thumb"><span id="speciesConst_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Determines how skilled your spies are naturally.">Deception</label>',
				'								<div id="speciesDecep" class="speciesSlider_bg" title="Deception Selector">',
				'									<div id="speciesDecep_thumb"><span id="speciesDecep_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Decreases the amount of resources it takes to upgrade buildings.">Research</label>',
				'								<div id="speciesResearch" class="speciesSlider_bg" title="Research Selector">',
				'									<div id="speciesResearch_thumb"><span id="speciesResearch_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Decreases the amount of time it takes to build and process everything.">Management</label>',
				'								<div id="speciesManagement" class="speciesSlider_bg" title="Management Selector">',
				'									<div id="speciesManagement_thumb"><span id="speciesManagement_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases your production of food.">Farming</label>',
				'								<div id="speciesFarming" class="speciesSlider_bg" title="Farming Selector">',
				'									<div id="speciesFarming_thumb"><span id="speciesFarming_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'						</ul>',
				'					</div>',
				'					<div class="yui-u">',
				'						<ul>',
				'							<li><label title="Increases your production of ore.">Mining</label>',
				'								<div id="speciesMining" class="speciesSlider_bg" title="Mining Selector">',
				'									<div id="speciesMining_thumb"><span id="speciesMining_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases production from power plants, and technological upgrades such as the Propulsion Factory.">Science</label>',
				'								<div id="speciesScience" class="speciesSlider_bg" title="Science Selector">',
				'									<div id="speciesScience_thumb"><span id="speciesScience_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases your production of water, and decreases your production of waste.">Environmental</label>',
				'								<div id="speciesEnviro" class="speciesSlider_bg" title="Environmental Selector">',
				'									<div id="speciesEnviro_thumb"><span id="speciesEnviro_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases happiness production, and lowers the cost of settling new colonies.">Political</label>',
				'								<div id="speciesPolitical" class="speciesSlider_bg" title="Political Selector">',
				'									<div id="speciesPolitical_thumb"><span id="speciesPolitical_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Increases the amount of goods that can be hauled on cargo ships and transported through Subspace Transporters, and gives you some advantages trading with Lacuna Expanse Corp.">Trade</label>',
				'								<div id="speciesTrade" class="speciesSlider_bg" title="Trade Selector">',
				'									<div id="speciesTrade_thumb"><span id="speciesTrade_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'							<li><label title="Sets the starting size of your Planetary Command Center on each colony you create, which gives you more starting production and storage.">Growth</label>',
				'								<div id="speciesGrowth" class="speciesSlider_bg" title="Growth Selector">',
				'									<div id="speciesGrowth_thumb"><span id="speciesGrowth_num" class="thumbDisplay">1</span><img src="'+Lib.AssetUrl+'ui/web/slider-thumb.png" /></div>',
				'								</div>',
				'							</li>',
				'						</ul>',
				'					</div>',
				'				</div>',
				'			</div>',
				'			<div id="speciesMessage" class="hidden"></div>',
				'		</form>',
				'	</div>',
				'	<div class="ft"></div>'
			].join('');
		},
		setMessage : function(str) {
			Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
			this.elMessage.innerHTML = str;
		},
		show : function(empire, inviteCode) {
			this.empireId = empire;
			this.inviteCode = inviteCode;
			Game.OverlayManager.hideAll();
			this.Dialog.show();
			this.Dialog.center();
		},
		hide : function() {
			Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
			this.Dialog.hide();
		}
	};
	YAHOO.lang.augmentProto(CreateSpecies, Util.EventProvider);

	Lacuna.CreateSpecies = CreateSpecies;
})();
YAHOO.register("createSpecies", YAHOO.lacuna.CreateSpecies, {version: "1", build: "0"}); 

}
