YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateSpecies == "undefined" || !YAHOO.lacuna.CreateSpecies) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		Slider = YAHOO.widget.Slider;

	var CreateSpecies = function(Empire) {
		this.id = "createSpecies";
		this._empire = Empire;
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Game.Styles.HIDDEN);
		container.innerHTML = [
		'	<div class="hd">Create Species</div>',
		'	<div class="bd">',
		'		<form name="speciesForm">',
		'			<ul>',
		'				<li><label for="speciesName">Name</label><input type="text" id="speciesName" maxlength="30" /></li>',
		'				<li><label for="speciesDesc">Description</label><textarea id="speciesDesc" cols="40" rows="4"></textarea></li>',
		'				<li><label>Points</label><span id="speciesPointTotal">0</span>/45</li>',
		'				<li><label>Habitable Orbits</label>',
		'					<div id="speciesHO" class="speciesSlider_bg" title="Habitable Orbits Selector">',
		'						<div id="speciesHO_min_thumb"><span id="speciesHO_from" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'						<div id="speciesHO_max_thumb"><span id="speciesHO_to" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Construction</label>',
		'					<div id="speciesConst" class="speciesSlider_bg" title="Construction Selector">',
		'						<div id="speciesConst_thumb"><span id="speciesConst_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Deception</label>',
		'					<div id="speciesDecep" class="speciesSlider_bg" title="Deception Selector">',
		'						<div id="speciesDecep_thumb"><span id="speciesDecep_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Research</label>',
		'					<div id="speciesResearch" class="speciesSlider_bg" title="Research Selector">',
		'						<div id="speciesResearch_thumb"><span id="speciesResearch_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Management</label>',
		'					<div id="speciesManagement" class="speciesSlider_bg" title="Management Selector">',
		'						<div id="speciesManagement_thumb"><span id="speciesManagement_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Farming</label>',
		'					<div id="speciesFarming" class="speciesSlider_bg" title="Farming Selector">',
		'						<div id="speciesFarming_thumb"><span id="speciesFarming_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Mining</label>',
		'					<div id="speciesMining" class="speciesSlider_bg" title="Mining Selector">',
		'						<div id="speciesMining_thumb"><span id="speciesMining_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Science</label>',
		'					<div id="speciesScience" class="speciesSlider_bg" title="Science Selector">',
		'						<div id="speciesScience_thumb"><span id="speciesScience_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Environmental</label>',
		'					<div id="speciesEnviro" class="speciesSlider_bg" title="Environmental Selector">',
		'						<div id="speciesEnviro_thumb"><span id="speciesEnviro_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Political</label>',
		'					<div id="speciesPolitical" class="speciesSlider_bg" title="Political Selector">',
		'						<div id="speciesPolitical_thumb"><span id="speciesPolitical_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Trade</label>',
		'					<div id="speciesTrade" class="speciesSlider_bg" title="Trade Selector">',
		'						<div id="speciesTrade_thumb"><span id="speciesTrade_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Growth</label>',
		'					<div id="speciesGrowth" class="speciesSlider_bg" title="Growth Selector">',
		'						<div id="speciesGrowth_thumb"><span id="speciesGrowth_num" class="thumbDisplay">1</span><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'			</ul>',
		'			<div id="speciesMessage" class="hidden"></div>',
		'		</form>',
		'	</div>',
		'	<div class="ft"></div>'
		].join('');
		document.body.insertBefore(container, document.body.firstChild);
		
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			postmethod:"none",
			visible:false,
			buttons:[ { text:"Create", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
				{ text:"Cancel", handler:{fn:this.handleCancel, scope:this}}],
			draggable:false,
			close:false,
			width:"400px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("speciesName");
			this.elDesc = Dom.get("speciesDesc");
			this.elMessage = Dom.get("speciesMessage");
			
			Dom.removeClass(this.id, Game.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
		this.Dialog.center();
	};
	CreateSpecies.prototype = {
		handleCreate : function() {
			if(this.totalValue > 45) {
				this.setMessage("You can only have a maximum of 45 points.");
			}
			else {
				this.setMessage("");
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
				
				var SC = Game.SpeciesCreator,
					SpeciesServ = Game.Services.Species,
					data = {
						name: this.elName.value,
						description: this.elDesc.value.substr(0,1024),
						habitable_orbits: ho,
						construction_affinity: this.values.speciesConst,
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
					};
					
				SpeciesServ.is_name_available({name:data.name}, {
					success : function(o) {
						console.log(o);
						if(o.result == 1) {
							SpeciesServ.create(data,{
								success : function(o){
									console.log(o);
									o.result;
									SC.hide();
									Game.EmpireCreator.addSpecies(o.result, data.name);
									Game.EmpireCreator.show();
								},
								failure : function(o){
									console.log(o);
									if(o.error.code == 1007) {
										SC.setMessage("You can only have a maximum of 45 points.");
									}
									else {
										SC.setMessage(o.error.message);
									}
								},
								timeout:Game.Timeout
							});
						}
						else {
							SC.setMessage("Species name is unavailable.  Please choose another.");
						}
					},
					failure : function(o) {
						console.log(o);
						SC.setMessage(o.error.message);
					},
					timeout:Game.Timeout
				});
			}
		},
		handleCancel : function() {
			this.hide();
			this._empire.show();
		},
		setMessage : function(str) {
			Dom.replaceClass(this.elMessage, Game.Styles.HIDDEN, Game.Styles.ALERT);
			this.elMessage.innerHTML = str;
		},
		show : function() {
			this.Dialog.show();
			if(!this._slidersCreated) {
				this._createSliders();
				this._slidersCreated = true;
			}
		},
		hide : function() {
			this.elName.value = "";
			this.elDesc.value = "";
			Dom.replaceClass(this.elMessage, Game.Styles.ALERT, Game.Styles.HIDDEN);
			this.Dialog.hide();
		},
		convertValue : function(val) {
			return Math.floor(val * 0.035) + 1;
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
			this.elTotal.innerHTML = 12;
			this.totalValue = 12;
			this.values = {
				speciesHO: {min:1,max:1},
				speciesConst : 1,
				speciesDecep : 1,
				speciesResearch : 1,
				speciesManagement : 1,
				speciesFarming : 1,
				speciesMining : 1,
				speciesScience : 1,
				speciesEnviro : 1,
				speciesPolitical : 1,
				speciesTrade : 1,
				speciesGrowth : 1
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
		},
		_createHabitableOrbits : function () {
			var range = 200,
				tickSize = 15,
				from = Dom.get("speciesHO_from"),
				to = Dom.get("speciesHO_to");

			// Create the DualSlider
			var slider = Slider.getHorizDualSlider("speciesHO",
				"speciesHO_min_thumb", "speciesHO_max_thumb",
				range, tickSize, [0,195]);

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
			slider.setValue(0);
			slider.key = container;

			var updateUI = function () {
				elNum.innerHTML = this.convertValue(slider.getValue());
			};
			slider.subscribe('ready', updateUI, this, true);
			slider.subscribe('change', updateUI, this, true);

			return slider;
		}
	};

	Lacuna.CreateSpecies = CreateSpecies;
})();
YAHOO.register("createSpecies", YAHOO.lacuna.CreateSpecies, {version: "1", build: "0"}); 

}