YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateSpecies == "undefined" || !YAHOO.lacuna.CreateSpecies) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Slider = YAHOO.widget.Slider,
		Lib = Lacuna.Library;

	var CreateSpecies = function(Empire) {
		this.id = "createSpecies";
		this._empire = Empire;
		this.oldSpecies = {};
		this.createEvent("onCreateSuccessful");
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:false,
			fixedcenter:false,
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
			this.elName = Dom.get("speciesName");
			this.elDesc = Dom.get("speciesDesc");
			this.elMessage = Dom.get("speciesMessage");
			this.elSelect = Dom.get("speciesSelect");
			this.elCreate = Dom.get("speciesCreate");
			
			Event.on(this.elSelect, "change", function(e, oSelf) {
				oSelf.setMessage("");
				if(this.selectedIndex == 1) {
					Dom.setStyle(oSelf.elCreate, "display", "block");
					oSelf.Dialog.center();
					if(!oSelf._slidersCreated) {
						oSelf._createSliders();
					}
				}
				else {
					Dom.setStyle(oSelf.elCreate, "display", "none");
					oSelf.Dialog.center();
				}
			}, this);
			
			Dom.setStyle(this.elCreate, "display", "none");
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Dialog.cfg.queueProperty("keylisteners", new YAHOO.util.KeyListener("speciesSelect", { keys:13 }, { fn:this.handleCreate, scope:this, correctScope:true } )); 
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	CreateSpecies.prototype = {
		_clearSliders : function() {
			if(this._slidersCreated) {
				this.speciesHO.setMinValue(0,true);
				this.speciesHO.setMaxValue(200,true);
				this.speciesConst.setValue(0,true);
				this.speciesDecep.setValue(0,true);
				this.speciesResearch.setValue(0,true);
				this.speciesManagement.setValue(0,true);
				this.speciesFarming.setValue(0,true);
				this.speciesMining.setValue(0,true);
				this.speciesScience.setValue(0,true);
				this.speciesEnviro.setValue(0,true);
				this.speciesPolitical.setValue(0,true);
				this.speciesTrade.setValue(0,true);
				this.speciesGrowth.setValue(0,true);
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
			
			this.elTotal = Dom.get("speciesPointTotal");
			this.elTotal.innerHTML = 45;
			this.totalValue = 45;
			this.values = {
				speciesHO: {min:4,max:4},
				speciesConst : 4,
				speciesDecep : 4,
				speciesResearch : 4,
				speciesManagement : 4,
				speciesFarming : 4,
				speciesMining : 4,
				speciesScience : 4,
				speciesEnviro : 4,
				speciesPolitical : 4,
				speciesTrade : 4,
				speciesGrowth : 4
			};
			
			var updateTotal = function(ignore, oSelf) {
				var val;
				if(this.minSlider) {
					var min = oSelf.convertValue(this.minVal),
						max = oSelf.convertValue(this.maxVal),
						curVals = oSelf.values.speciesHO,
						curVal = curVals.max - curVals.min + 1;
					
					val = max-min+1;
						
					oSelf.totalValue -= curVal;
					oSelf.totalValue += val;
					curVals.min = min;
					curVals.max = max;
				}
				else {
					val = oSelf.convertValue(this.getValue());
					oSelf.totalValue -= oSelf.values[this.key];
					oSelf.totalValue += val;
					oSelf.values[this.key] = val;
				}
				
				oSelf.elTotal.innerHTML = oSelf.totalValue;
				if(oSelf.totalValue > 45) {
					Dom.replaceClass("speciesPointTotalLine", "speciesPointsValid", "speciesPointsInvalid");
				}
				else {
					Dom.replaceClass("speciesPointTotalLine", "speciesPointsInvalid", "speciesPointsValid");
				}
			};
			
			this.speciesHO.subscribe('change', updateTotal, this);
			this.speciesConst.subscribe('change', updateTotal, this);
			this.speciesDecep.subscribe('change', updateTotal, this);
			this.speciesResearch.subscribe('change', updateTotal, this);
			this.speciesManagement.subscribe('change', updateTotal, this);
			this.speciesFarming.subscribe('change', updateTotal, this);
			this.speciesMining.subscribe('change', updateTotal, this);
			this.speciesScience.subscribe('change', updateTotal, this);
			this.speciesEnviro.subscribe('change', updateTotal, this);
			this.speciesPolitical.subscribe('change', updateTotal, this);
			this.speciesTrade.subscribe('change', updateTotal, this);
			this.speciesGrowth.subscribe('change', updateTotal, this);
			
			this._slidersCreated = true;
		},
		_createHabitableOrbits : function () {
			var range = 200,
				tickSize = 15,
				from = Dom.get("speciesHO_from"),
				to = Dom.get("speciesHO_to");

			// Create the DualSlider
			var slider = Slider.getHorizDualSlider("speciesHO",
				"speciesHO_min_thumb", "speciesHO_max_thumb",
				range, tickSize, [90,105]);
				
			// Decorate the DualSlider instance with some new properties and
			// methods to maintain the highlight element
			YAHOO.lang.augmentObject(slider, {
				// The highlight element
				_highlight : Dom.get("speciesHO_highlight"),
				// A method to update the status and update the highlight
				updateHighlight : function () {
					var delta = this.maxVal - this.minVal;
					if (this.activeSlider === this.minSlider) {
						// If the min thumb moved, move the highlight's left edge
						Dom.setStyle(this._highlight,'left', (this.minVal + 12) + 'px');
					}
					// Adjust the width of the highlight to match inner boundary
					Dom.setStyle(this._highlight,'width', Math.max(delta - 12,0) + 'px');
				}
			},true);
			// Attach the highlight method to the slider's change event
			slider.subscribe('change',slider.updateHighlight,slider,true);
			slider.updateHighlight();

			var updateUI = function () {
				from.innerHTML = this.convertValue(slider.minVal);
				to.innerHTML = this.convertValue(slider.maxVal);
			};
			slider.subscribe('ready', updateUI, this, true);
			slider.subscribe('change', updateUI, this, true);

			return slider;
		},
		_createHorizSingle : function (container, thumb, num) {
			var range = 200,
				tickSize = 30,
				elNum = Dom.get(num);

			// Create the Slider
			var slider = Slider.getHorizSlider(container,
				thumb, 0, range, tickSize);
			slider.setValue(100);
			slider.key = container;

			var updateUI = function () {
				elNum.innerHTML = this.convertValue(slider.getValue());
			};
			slider.subscribe('ready', updateUI, this, true);
			slider.subscribe('change', updateUI, this, true);

			return slider;
		},
		_found : function() {
			Lacuna.Pulser.Show();
			var EmpireServ = Game.Services.Empire;
			EmpireServ.found({empire_id: this.empireId, api_key:Lib.ApiKey}, {
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
			'			<div style="text-align:center;">',
			'				<label>Select your Species:</label>',
			'				<select id="speciesSelect">',
			'					<option value="human_species">Human</option>',
			'					<option value="create">Create your own</option>',
			'				</select>',
			'			</div>',
			'			<div id="speciesCreate">',
			'				<ul style="margin-top:5px; padding-top:5px; border-top:1px solid #52acff;">',
			'					<li style="margin-bottom:3px;"><label for="speciesName">Name</label><input type="text" id="speciesName" maxlength="30" size="30" /></li>',
			'					<li><label for="speciesDesc">Description</label><textarea id="speciesDesc" cols="40" rows="4"></textarea></li>',
			'					<li id="speciesPointTotalLine" class="speciesPointTotal speciesPointsValid"><label>Points</label><span id="speciesPointTotal">0</span>/45</li>',
			'				</ul>',
			'				<div class="yui-g">',
			'					<div class="yui-u first">',
			'						<ul>',
			'							<li><label>Habitable Orbits</label>',
			'								<div id="speciesHO" class="speciesSlider_bg" title="Habitable Orbits Selector">',
			'									<span id="speciesHO_highlight"></span>',
			'									<div id="speciesHO_min_thumb"><span id="speciesHO_from" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'									<div id="speciesHO_max_thumb"><span id="speciesHO_to" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Manufacturing</label>',
			'								<div id="speciesConst" class="speciesSlider_bg" title="Manufacturing Selector">',
			'									<div id="speciesConst_thumb"><span id="speciesConst_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Deception</label>',
			'								<div id="speciesDecep" class="speciesSlider_bg" title="Deception Selector">',
			'									<div id="speciesDecep_thumb"><span id="speciesDecep_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Research</label>',
			'								<div id="speciesResearch" class="speciesSlider_bg" title="Research Selector">',
			'									<div id="speciesResearch_thumb"><span id="speciesResearch_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Management</label>',
			'								<div id="speciesManagement" class="speciesSlider_bg" title="Management Selector">',
			'									<div id="speciesManagement_thumb"><span id="speciesManagement_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Farming</label>',
			'								<div id="speciesFarming" class="speciesSlider_bg" title="Farming Selector">',
			'									<div id="speciesFarming_thumb"><span id="speciesFarming_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'						</ul>',
			'					</div>',
			'					<div class="yui-u">',
			'						<ul>',
			'							<li><label>Mining</label>',
			'								<div id="speciesMining" class="speciesSlider_bg" title="Mining Selector">',
			'									<div id="speciesMining_thumb"><span id="speciesMining_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Science</label>',
			'								<div id="speciesScience" class="speciesSlider_bg" title="Science Selector">',
			'									<div id="speciesScience_thumb"><span id="speciesScience_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Environmental</label>',
			'								<div id="speciesEnviro" class="speciesSlider_bg" title="Environmental Selector">',
			'									<div id="speciesEnviro_thumb"><span id="speciesEnviro_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Political</label>',
			'								<div id="speciesPolitical" class="speciesSlider_bg" title="Political Selector">',
			'									<div id="speciesPolitical_thumb"><span id="speciesPolitical_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Trade</label>',
			'								<div id="speciesTrade" class="speciesSlider_bg" title="Trade Selector">',
			'									<div id="speciesTrade_thumb"><span id="speciesTrade_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
			'								</div>',
			'							</li>',
			'							<li><label>Growth</label>',
			'								<div id="speciesGrowth" class="speciesSlider_bg" title="Growth Selector">',
			'									<div id="speciesGrowth_thumb"><span id="speciesGrowth_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
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
		_diffSpecies : function(ns) {
			var os = this.oldSpecies;
			
			var hoDiff = !os.habitable_orbits ? true : os.habitable_orbits.length != ns.habitable_orbits.length;
			if(!hoDiff) {
				for(var h=0; h<os.habitable_orbits.length; h++) {
					if(os.habitable_orbits[h] != ns.habitable_orbits[h]) {
						hoDiff = true;
						break;
					}
				}
			}
			
			return hoDiff
				|| os.name != ns.name
				|| os.description != ns.description
				|| os.manufacturing_affinity != ns.manufacturing_affinity
				|| os.deception_affinity != ns.deception_affinity
				|| os.research_affinity != ns.research_affinity
				|| os.management_affinity != ns.management_affinity
				|| os.farming_affinity != ns.farming_affinity
				|| os.mining_affinity != ns.mining_affinity
				|| os.science_affinity != ns.science_affinity
				|| os.environmental_affinity != ns.environmental_affinity
				|| os.political_affinity != ns.political_affinity
				|| os.trade_affinity != ns.trade_affinity
				|| os.growth_affinity != ns.growth_affinity;
		},
	
		handleCreate : function() {
			this.setMessage("");
			var SpeciesServ = Game.Services.Species;
			//if the select human go directly to founding the empire
			if(this.elSelect.selectedIndex == 0) {
				if(this.createdSpeciesOnce) {
					Lacuna.Pulser.Show();
					SpeciesServ.set_human({empire_id: this.empireId}, {
						success : function(o) {
							YAHOO.log(o, "info", "SetHuman");
							//set back to false since we're human again
							this.createdSpeciesOnce = false;
							this._found();
						},
						failure : function(o) {
							YAHOO.log(o, "info", "SetHumanFailure");
							Lacuna.Pulser.Hide();
							this.setMessage(o.error.message);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this._found();
				}
			}
			else {
				if(this.totalValue > 45) {
					this.setMessage("You can only have a maximum of 45 points.");
				}
				else {
					var speciesHO = this.values.speciesHO,
						ho = [];
					if(speciesHO.max - speciesHO.min == 0) {
						ho.push(speciesHO.min);
					}
					else {
						for(var i=speciesHO.min; i<=speciesHO.max; i++) {
							ho.push(i);
						}
					}

					var data = {
							empire_id:this.empireId,
							params: {
								name: this.elName.value,
								description: this.elDesc.value.substr(0,1024),
								habitable_orbits: ho,
								manufacturing_affinity: this.values.speciesConst,
								deception_affinity: this.values.speciesDecep,
								research_affinity: this.values.speciesResearch,
								management_affinity: this.values.speciesManagement,
								farming_affinity: this.values.speciesFarming,
								mining_affinity: this.values.speciesMining,
								science_affinity: this.values.speciesScience,
								environmental_affinity: this.values.speciesEnviro,
								political_affinity: this.values.speciesPolitical,
								trade_affinity: this.values.speciesTrade,
								growth_affinity : this.values.speciesGrowth
							}
						},
						isDiff = this._diffSpecies(data.params);
					
					var go = true;
					if(isDiff && (data.params.manufacturing_affinity == 1
						|| data.params.deception_affinity == 1
						|| data.params.research_affinity == 1
						|| data.params.management_affinity == 1
						|| data.params.farming_affinity == 1
						|| data.params.mining_affinity == 1
						|| data.params.science_affinity == 1
						|| data.params.environmental_affinity == 1
						|| data.params.political_affinity == 1
						|| data.params.trade_affinity == 1
						|| data.params.growth_affinity == 1
					)) {
						go = confirm("Setting an affinity to 1 is an expert setting, and is not recommended unless you're absolutely sure you know what you're doing.  Are you sure you want to continue?");
					}
					
					if(go) {
						if(isDiff && this.oldSpecies.name != data.params.name) {
							Lacuna.Pulser.Show();
							//if there is a difference and the names aren't the same make sure the name is available then create
							SpeciesServ.is_name_available({name:data.params.name}, {
								success : function(o) {
									YAHOO.log(o);
									if(o.result == 1) {
										SpeciesServ.create(data,{
											success : function(o){
												YAHOO.log(o, "info", "SpeciesCreate");
												this.oldSpecies = data.params;
												//set true in case there are errors in creating empire so when they click save again we set species correctly
												this.createdSpeciesOnce = true;
												this._found();
											},
											failure : function(o){
												YAHOO.log(o, "info", "SpeciesCreateFailure");
												Lacuna.Pulser.Hide();
												if(o.error.code == 1007) {
													this.setMessage("You can only have a maximum of 45 points.");
												}
												else {
													this.setMessage(o.error.message);
												}
											},
											timeout:Game.Timeout,
											scope:this
										});
									}
									else {
										this.setMessage("Species name is unavailable.  Please choose another.");
									}
								},
								failure : function(o) {
									YAHOO.log(o);
									Lacuna.Pulser.Hide();
									this.setMessage(o.error.message);
								},
								timeout:Game.Timeout,
								scope:this
							});
						}
						else if(isDiff){
							Lacuna.Pulser.Show();
							//if there is a difference and the names are the same create
							SpeciesServ.create(data,{
								success : function(o){
									YAHOO.log(o, "info", "SpeciesCreate");
									//set true in case there are errors in creating empire so when they click save again we set species correctly
									this.createdSpeciesOnce = true;
									this._found();
								},
								failure : function(o){
									YAHOO.log(o, "info", "SpeciesCreateFailure");
									Lacuna.Pulser.Hide();
									if(o.error.code == 1007) {
										this.setMessage("You can only have a maximum of 45 points.");
									}
									else {
										this.setMessage(o.error.message);
									}
								},
								timeout:Game.Timeout,
								scope:this
							});
						}
						else {
							//otherwise everything is the same so just try to found it again
							this._found();
						}
					}
				}
			}
		},
		handleCancel : function() {
			if(this.elSelect.selectedIndex == 1) {
				//set it back ot human since they canceled
				this.elSelect.selectedIndex = 0;
				Dom.setStyle(this.elCreate, "display", "none");
				this.Dialog.center();
			}
			else {
				//if it's already human send them back to empire
				this.hide();
				this._empire.show(true);
			}
		},
		setMessage : function(str) {
			Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
			this.elMessage.innerHTML = str;
		},
		show : function(empire) {
			this.empireId = empire;
			Game.OverlayManager.hideAll();
			this.Dialog.show();
			this.Dialog.center();
			if(!this._slidersCreated && Dom.getStyle(this.elCreate, "display") != "none") {
				this._createSliders();
			}
		},
		hide : function() {
			this._clearSliders();
			this.createdSpeciesOnce = false; //set this back to nothing since if they cancel they have to create an empire again before we get back to this screen
			this.oldSpecies = {};
			this.elSelect.selectedIndex = 0;
			Dom.setStyle(this.elCreate, "display", "none");
			this.elName.value = "";
			this.elDesc.value = "";
			Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
			this.Dialog.hide();
		},
		convertValue : function(val) {
			return Math.floor(val * 0.035) + 1;
		}
	};
	YAHOO.lang.augmentProto(CreateSpecies, Util.EventProvider);

	Lacuna.CreateSpecies = CreateSpecies;
})();
YAHOO.register("createSpecies", YAHOO.lacuna.CreateSpecies, {version: "1", build: "0"}); 

}