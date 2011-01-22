YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.GeneticsLab == "undefined" || !YAHOO.lacuna.buildings.GeneticsLab) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var GeneticsLab = function(result){
		GeneticsLab.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.GeneticsLab;
	};
	
	Lang.extend(GeneticsLab, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getTab()];
		},
		_getTab : function() {
			this.tab = new YAHOO.widget.Tab({ label: "Lab", content: [
				'<table class="tleTable">',
				'	<tr>',
				'		<th>Survival Chance</th><th>Graft Success</th><th>Essentia Cost</th>',
				'	</tr>',
				'	<tr>',
				'		<td><span id="geneticsLabSurvival"></span>%</td><td><span id="geneticsLabGraft"></span>%</td><td id="geneticsLabCost"></td>',
				'	</tr>',
				'</table>',
				'<div id="geneticsLabMessage" style="border-top:1px solid #52acff;margin-top:5px;"></div>',
				'<div id="geneticsLabDisplay" class="yui-g" style="display:none;margin:5px 0;">',
				'	<div class="yui-u first" style="width:39.1%">',
				'		<div style="border-bottom:1px solid #52acff;margin-bottom:5px;font-weight:bold;"><label>Available Spies</label></div>',
				'		<div style="overflow:auto;height:150px;">',
				'			<ul id="geneticsLabSpies">',
				'			</ul>',
				'		</div>',
				'	</div>',
				'	<div class="yui-u" style="width:59.1%;">',
				'		<div id="geneticsLabExperimentMessage" style="display:none;"></div>',
				'		<div id="geneticsLabDetailsContainer" style="display:none;">',
				'			<div style="border-bottom:1px solid #52acff;margin-bottom:5px;font-weight:bold;"><label><span id="geneticsLabSpyName"></span> Details</label></div>',
				'			<label for="geneticsLabAffinities" style="font-weight:bold;">Graft:</label><select id="geneticsLabAffinities"></select>',
				'			<button type="button" id="geneticsLabRunExperiement">Run Experiment</button>',
				'			<div style="overflow:auto;height:120px;border:1px solid #52acff;">',
				'				<ul id="geneticsLabDetails">',
				'				</ul>',
				'			</div>',
				'		</div>',
				'	</div>',
				'</div>'
			].join('')});
			this.tab.subscribe("activeChange", this.prepareExperiment, this, true);
			
			Event.delegate("geneticsLabSpies", "click", this.selectSpyForExperiment, "li", this, true);
			Event.on("geneticsLabRunExperiement", "click", this.runExperiment, this, true);
			
			return this.tab;
		},
		
		getSpeciesStatList : function(stat) {
			var frag = document.createDocumentFragment(),
				li = document.createElement('li');
			
			var nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Name</label>',
				'<span>', stat.name, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Description</label>',
				'<span>', stat.description, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Habitable Orbits</label>',
				'<span>', stat.min_orbit,
				stat.max_orbit > stat.min_orbit ? ' to '+ stat.max_orbit : '',
				'</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Manufacturing</label>',
				'<span>', stat.manufacturing_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Deception</label>',
				'<span>', stat.deception_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Research</label>',
				'<span>', stat.research_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Management</label>',
				'<span>', stat.management_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Farming</label>',
				'<span>', stat.farming_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Mining</label>',
				'<span>', stat.mining_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Science</label>',
				'<span>', stat.science_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Environmental</label>',
				'<span>', stat.environmental_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Political</label>',
				'<span>', stat.political_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Trade</label>',
				'<span>', stat.trade_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Growth</label>',
				'<span>', stat.growth_affinity, '</span>'
			].join('');
			frag.appendChild(nLi);
			
			return frag;
		},
		prepareExperiment : function(e) {
			if(e.newValue) {
				Lacuna.Pulser.Show();
				delete this.currentSpy;
				
				this.service.prepare_experiment({
					session_id:Game.GetSession(),
					building_id:this.building.id
				}, {
					success : function(o){
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						
						if(o.result.can_experiment == 1) {
							if(o.result.grafts.length > 0) {
								Dom.get("geneticsLabMessage").innerHTML = "";
								Dom.setStyle("geneticsLabDisplay","display","");
							}
							
							this.updateDisplay(o.result);
						}
						else {
							Dom.get("geneticsLabMessage").innerHTML = "Unable to currently run experiments.  You can only have 1 graft per level of the Genetics Lab.";
						}
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this
				});	
			}
		},
		runExperiment : function() {
			if(this.currentSpy) {
				Lacuna.Pulser.Show();
				
				this.service.run_experiment({
					session_id:Game.GetSession(),
					building_id:this.building.id,
					spy_id:this.currentSpy,
					affinity:Lib.getSelectedOptionValue("geneticsLabAffinities")
				}, {
					success : function(o){
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						
						Dom.get("geneticsLabExperimentMessage").innerHTML = o.result.experiment.message;
						Dom.setStyle("geneticsLabExperimentMessage","display","");

						Dom.setStyle("geneticsLabDetailsContainer", "display", "none");
						this.updateDisplay(o.result);
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						this.rpcFailure(o);
					},
					timeout:Game.Timeout,
					scope:this
			});
			}
		},
		selectSpyForExperiment : function(e, matchedEl, container) {
			var obj = matchedEl.Object,
				sel = Dom.get("geneticsLabAffinities"),
				details = Dom.get("geneticsLabDetails"),
				option = document.createElement("option");
			
			Dom.removeClass(Sel.query("li.selected", "geneticsLabSpies"),"selected");
			Dom.addClass(matchedEl,"selected");
			Dom.get("geneticsLabSpyName").innerHTML = ['[',obj.species.name,'] ',obj.spy.name].join('');
			Dom.setStyle("geneticsLabExperimentMessage","display","none");
			Dom.setStyle("geneticsLabDetailsContainer","display","");
			this.currentSpy = obj.spy.id;
			sel.options.length = 0;
			for(var a=0; a<obj.graftable_affinities.length; a++) {
				var nOpt = option.cloneNode(false);
				nOpt.value = obj.graftable_affinities[a];
				nOpt.innerHTML = obj.graftable_affinities[a].titleCaps("_"," ");
				sel.appendChild(nOpt);
			}
			details.innerHTML = "";
			details.appendChild(this.getSpeciesStatList(obj.species));
		},
		updateDisplay : function(exp) {
			Dom.get("geneticsLabSurvival").innerHTML = exp.survival_odds;
			Dom.get("geneticsLabGraft").innerHTML = exp.graft_odds;
			Dom.get("geneticsLabCost").innerHTML = exp.essentia_cost;
			Dom.removeClass(Sel.query("li.selected", "geneticsLabSpies"),"selected");
			if(exp.grafts.length) {
				var grafts = exp.grafts;
				//sort by species name then spy name
				grafts.sort(function(a,b) {
					if(a.species.name > b.species.name) {
						return 1;
					}
					else if(a.species.name < b.species.name) {
						return -1;
					}
					else if(a.spy.name > b.spy.name) {
						return 1;
					}
					else if(a.spy.name < b.spy.name) {
						return -1;
					}
					else {
						return 0;
					}
				});
				
				var li = document.createElement("li"),
					ul = Dom.get("geneticsLabSpies");
				ul.innerHTML = "";
				for(var s=0; s<grafts.length; s++) {
					var obj = grafts[s],
						nLi = li.cloneNode(false);
					nLi.Object = obj;
					Dom.setStyle(nLi, "prisoner");
					nLi.innerHTML = ['[',obj.species.name,'] ',obj.spy.name].join('');
					ul.appendChild(nLi);
				}
			}
			else {
				var expMsg = Dom.get("geneticsLabExperimentMessage").innerHTML;
				if(expMsg) {
					Dom.get("geneticsLabMessage").innerHTML = expMsg + "  No spies available to run experiments on.";
				}
				else {
					Dom.get("geneticsLabMessage").innerHTML = "No spies available to run experiments on.";
				}
				Dom.setStyle("geneticsLabDisplay","display","none");
			}
		}
		
	});
	
	YAHOO.lacuna.buildings.GeneticsLab = GeneticsLab;

})();
YAHOO.register("geneticslab", YAHOO.lacuna.buildings.GeneticsLab, {version: "1", build: "0"}); 

}