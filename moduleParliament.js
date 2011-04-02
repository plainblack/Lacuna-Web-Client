YAHOO.namespace("lacuna.modules");

if (typeof YAHOO.lacuna.modules.Parliament == "undefined" || !YAHOO.lacuna.modules.Parliament) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Parliament = function(result, locationId){
		Parliament.superclass.constructor.call(this, result);
		
		this.locationId = locationId;
		this.service = Game.Services.Modules.Parliament;
		
		this.canRepealLaw = this.building.level >= 5;
		
		var actionsByLevel = [];
		actionsByLevel[4] = ['propose_writ'];
		actionsByLevel[5] = ['propose_repeal_law'];
		actionsByLevel[6] = ['propose_transfer_station_ownership'];
		actionsByLevel[7] = ['propose_seize_star'];
		actionsByLevel[8] = ['propose_rename_star'];
		actionsByLevel[9] = ['propose_broadcast_on_network19'];
		actionsByLevel[12] = ['propose_rename_asteroid'];
		actionsByLevel[13] = ['propose_members_only_mining_rights'];
		actionsByLevel[14] = ['propose_evict_mining_platform'];
		actionsByLevel[25] = ['propose_fire_bfg'];
	};
	
	Lang.extend(Parliament, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getLawsTab(), this._getPropsTab()];
		},
		_getLawsTab : function() {
			var tab = new YAHOO.widget.Tab({ label: "Laws", content: [
				'<div>',
				'	<div style="overflow:auto;"><ul id="lawsDetails"></ul></div>',
				'</div>'
			].join('')});
			tab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					if(!this.laws) {
						Lacuna.Pulser.Show();
						this.service.view_laws({session_id:Game.GetSession(),body_id:this.locationId}, {
							success : function(o){
								Lacuna.Pulser.Hide();
								this.rpcSuccess(o);
								this.laws = o.result.laws;
								
								this.LawsPopulate();
							},
							scope:this
						});
					}
				}
			}, this, true);
			
			Event.delegate("lawsDetails", "click", this.LawClick, "button", this, true);
			Event.delegate("lawsDetails", "click", this.handleProfileLink, "a.profile_link", this, true);
			Event.delegate("lawsDetails", "click", this.handleStarmapLink, "a.starmap_link", this, true);
			Event.delegate("lawsDetails", "click", this.handlePlanetLink, "a.planet_link", this, true);
			Event.delegate("lawsDetails", "click", this.handleAllianceLink, "a.alliance_link", this, true);
			
			return tab;
		},
		_getPropsTab : function() {
			var tab = new YAHOO.widget.Tab({ label: "Propositions", content: [
				'<div>',
				'	<div style="overflow:auto;"><ul id="propsDetails"></ul></div>',
				'</div>'
			].join('')});
			tab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					if(!this.props) {
						Lacuna.Pulser.Show();
						this.service.view_propositions({session_id:Game.GetSession(),building_id:this.building.id}, {
							success : function(o){
								Lacuna.Pulser.Hide();
								this.rpcSuccess(o);
								this.props = o.result.propositions;
								
								this.PropsPopulate();
							},
							scope:this
						});
					}
				}
			}, this, true);
			
			Event.delegate("propsDetails", "click", this.PropClick, "button", this, true);
			Event.delegate("propsDetails", "click", this.handleProfileLink, "a.profile_link", this, true);
			Event.delegate("propsDetails", "click", this.handleStarmapLink, "a.starmap_link", this, true);
			Event.delegate("propsDetails", "click", this.handlePlanetLink, "a.planet_link", this, true);
			Event.delegate("propsDetails", "click", this.handleAllianceLink, "a.alliance_link", this, true);
			
			return tab;
		},
		_getCreateTab : function() {
				
			var tab = new YAHOO.widget.Tab({ label: "Propose", content: [
				'<div>',
				'	<select id="propose"></select>',
				'	<div id="proposeWrit" style="display:none;">',
				'		<select id="proposeWritTemplates"></select>',
				'		<input type="text" id="proposeTitle" />',
				'		<textarea id="proposeDesc"></textarea>',
				'	</div>',
				'</div>'
			].join('')});

			return tab;
		},
		
		LawsPopulate : function(){
			var details = Dom.get("lawsDetails");
			
			if(details) {
				var laws = this.laws,
					parentEl = details.parentNode,
					li = document.createElement("li");
					
				//Event.purgeElement(details, true);
				details = parentEl.removeChild(details);
				details.innerHTML = "";

				for(var i=0; i<laws.length; i++) {
					var law = laws[i],
						nLi = li.cloneNode(false);
					
					nLi.Law = law;
					nLi.innerHTML = ['<div style="margin-bottom:2px;">',
						'<div class="yui-gb" style="border-bottom:1px solid #52acff;">',
						'	<div class="yui-u first"><label>',law.name,'</label></div>',
						'	<div class="yui-u" >',(this.canRepealLaw ? '<button type="button">Repeal</button>' : '&nbsp;'),'</span></div>',
						'	<div class="yui-u" style="text-align:right;">Enacted ',Lib.formatServerDate(law.date_enacted),'</span></div>',
						'</div>',
						'<div class="lawDesc">',this.formatBody(law.description),'</div>',
						'</div>'].join('');
								
					details.appendChild(nLi);
					
				}
				
				//add child back in
				parentEl.appendChild(details);
				
				//wait for tab to display first
				setTimeout(function() {
					var Ht = Game.GetSize().h - 230;
					if(Ht > 300) { Ht = 300; }
					var tC = details.parentNode;
					Dom.setStyle(tC,"height",Ht + "px");
					Dom.setStyle(tC,"overflow-y","auto");
				},10);
			}
		},
		LawClick : function(e, matchedEl, container){
			if(matchedEl.innerHTML == "Repeal") {
				matchedEl.disabled = true;
				var el = Dom.getAncestorByTagName(matchedEl, "li");
				if(el) {
					this.service.propose_repeal_law({
						session_id:Game.GetSession(""),
						building_id:this.building.id,
						law_id:el.Law.id
					},{
						success : function(o) {
							delete this.props;
							matchedEl.parentNode.removeChild(matchedEl);
						},
						failure : function() {
							matchedEl.disabled = false;
						},
						scope:this
					});
				}
			}
			
		},
		
		PropsPopulate : function() {
			var details = Dom.get("propsDetails");
			
			if(details) {
				var props = this.props,
					parentEl = details.parentNode,
					li = document.createElement("li");
					
				//Event.purgeElement(details, true);
				details = parentEl.removeChild(details);
				details.innerHTML = "";
				
				var serverTime = Lib.getTime(Game.ServerData.time);

				for(var i=0; i<props.length; i++) {
					var prop = props[i],
						nLi = li.cloneNode(false),
						sec = (Lib.getTime(prop.date_ends) - serverTime) / 1000;
				
					nLi.Prop = prop;
					nLi.innerHTML = this.PropLineDetails(prop, sec);
					
					this.addQueue(sec, this.PropQueue, nLi);
								
					details.appendChild(nLi);
					
				}
				
				//add child back in
				parentEl.appendChild(details);
				
				//wait for tab to display first
				setTimeout(function() {
					var Ht = Game.GetSize().h - 230;
					if(Ht > 300) { Ht = 300; }
					var tC = details.parentNode;
					Dom.setStyle(tC,"height",Ht + "px");
					Dom.setStyle(tC,"overflow-y","auto");
				},10);
			}
		},
		PropLineDetails : function(prop, sec) {
			return ['<div style="margin-bottom:2px;">',
				'<div class="yui-gb">',
				'	<div class="yui-u first"><label>',prop.name,':</label>',prop.status,'</div>',
				'	<div class="yui-u">Proposed by <a class="profile_link" href="#',prop.proposed_by.id,'">',prop.proposed_by.name,'</a></div>',
				'	<div class="yui-u">Ends in <span class="propTime">',Lib.formatTime(sec),'</span></div>',
				'</div>',
				'<div class="yui-gc">',
				'	<div class="yui-u first"><div class="propDesc">',this.formatBody(prop.description),'</div></div>',
				'	<div class="yui-u"><div class="propMyVote">',this.PropVoteDetails(prop),'</div></div>',
				'</div>',
				'<table style="width:100%"><col width="25%"><col width="25%"><col width="25%"><col width="25%">',
				'<tr><th>Needed</th><th>Have</th><th>Yes</th><th>No</th></tr>',
				'<tr><td>',prop.votes_needed,'</td><td>',prop.votes_yes*1 + prop.votes_no*1,'</td><td>',prop.votes_yes,'</td><td>',prop.votes_no,'</td></tr>',
				'</table>',
				'</div>'].join('');
		},
		PropVoteDetails : function(prop) {
			if(prop.my_vote !== undefined) {
				return '<label>Voted ' + (prop.my_vote*1 === 1 ? 'Yes' : 'No') + '</label>';
			}
			else {
				return '<button type="button">Yes</button><button type="button">No</button>';
			}
		},
		PropQueue : function(remaining, elLine){
			var arrTime;
			if(remaining <= 0) {
				arrTime = 'Overdue ' + Lib.formatTime(Math.round(-remaining));
			}
			else {
				arrTime = Lib.formatTime(Math.round(remaining));
			}
			Sel.query("span.propTime",elLine,true).innerHTML = arrTime;
		},
		PropClick : function(e, matchedEl, container){
			var type = matchedEl.innerHTML;
			if(type == "Yes" || type == "No") {
				var el = Dom.getAncestorByTagName(matchedEl, "li"),
					func = this["PropVote"+type];
				if(el && func) {
					func.call(this, el.Prop, el);
				}
			}
			
		},
		PropVoteYes : function(prop, line) {
			this.service.cast_vote({
				session_id:Game.GetSession(""),
				building_id:this.building.id,
				proposition_id:prop.id,
				vote:1
			},{
				success : this.PropVoteSuccess,
				scope:{Self:this,Line:line}
			});
		},
		PropVoteNo : function(prop, line) {
			this.service.cast_vote({
				session_id:Game.GetSession(""),
				building_id:this.building.id,
				proposition_id:prop.id,
				vote:0
			},{
				success : this.PropVoteSuccess,
				scope:{Self:this,Line:line}
			});
		},
		PropVoteSuccess  : function(o){
			this.Self.rpcSuccess(o);
			var newProp = o.result.proposition;
			for(var i=0; i<this.Self.props.length; i++) {
				if(this.Self.props[i].id == newProp.id) {
					this.Self.props[i] = newProp;
					break;
				}
			}
			this.Line.Prop = newProp;
			this.Line.innerHTML = this.Self.PropLineDetails(newProp, 0);
		},
		
		formatBody : function(body) {
			body = body.replace(/&/g,'&amp;');
			body = body.replace(/</g,'&lt;');
			body = body.replace(/>/g,'&gt;');
			body = body.replace(/\n/g,'<br />');
			body = body.replace(/\*([^*]+)\*/gi,'<b>$1</b>');
			body = body.replace(/\{(food|water|ore|energy|waste|happiness|time|essentia|plots|build)\}/gi, function(str,icon){
				var cl = 'small' + icon.substr(0,1).toUpperCase() + icon.substr(1);
				return '<img src="' + Lib.AssetUrl + 'ui/s/' + icon + '.png" class="' + cl + '" />';
			});
			body = body.replace(/\[(https?:\/\/[a-z0-9_.\/\-]+)\]/gi,'<a href="$1">$1</a>');
			body = body.replace(/\{Empire\s+(-?\d+)\s+([^\}]+)\}/gi,'<a class="profile_link" href="#$1">$2</a>');
			//body = body.replace(/\{Empire\s+(\d+)\s+([^\}]+)}/gi,'$2');
			body = body.replace(/\{Starmap\s+(-?\d+)\s+(-?\d+)\s+([^\}]+)\}/gi,'<a class="starmap_link" href="#$1x$2">$3</a>');
			body = body.replace(/\{Planet\s+(-?\d+)\s+([^\}]+)\}/gi,'<a class="planet_link" href="#$1">$2</a>');
			body = body.replace(/\{Alliance\s+(-?\d+)\s+([^\}]+)\}/gi,'<a class="alliance_link" href="#$1">$2</a>');
			body = body.replace(/\{VoteYes\s(-*\d+)\s(-*\d+)\s(-*\d+)\}/gi,'<a class="voteyes_link" href="#$1&$2&$3">Yes!</a>');
			body = body.replace(/\{VoteNo\s(-*\d+)\s(-*\d+)\s(-*\d+)\}/gi,'<a class="voteno_link" href="#$1&$2&$3">No!</a>');
			//body = body.replace(/\{Alliance\s+(\d+)\s+([^\}]+)}/gi,'$2');
			return body;
		},
		handleProfileLink : function(e, el) {
			Event.stopEvent(e);
			var res = el.href.match(/\#(-?\d+)$/);
			if(res) {
				Lacuna.Info.Empire.Load(res[1]);
			}
		},
		handleStarmapLink : function(e, el) {
			Event.stopEvent(e);
			var res = el.href.match(/\#(-?\d+)x(-?\d+)$/);
			Game.StarJump({x:res[1],y:res[2]});
		},
		handlePlanetLink : function(e, el) {
			Event.stopEvent(e);
			var res = el.href.match(/\#(-?\d+)$/);
			this.hide();
			var planet = Game.EmpireData.planets[res[1]];
			Game.PlanetJump(planet);
		},
		handleAllianceLink : function(e, el) {
			Event.stopEvent(e);
			var res = el.href.match(/\#(-?\d+)$/);
			Lacuna.Info.Alliance.Load(res[1]);
		}

	});
	
	Lacuna.modules.Parliament = Parliament;

})();
YAHOO.register("Parliament", YAHOO.lacuna.modules.Parliament, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
