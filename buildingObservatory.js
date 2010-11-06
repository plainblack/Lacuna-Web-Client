YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Observatory == "undefined" || !YAHOO.lacuna.buildings.Observatory) {
	
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

	var Observatory = function(result){
		Observatory.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Observatory;
	};
	
	Lang.extend(Observatory, Lacuna.buildings.Building, {
		destroy : function() {
			if(this.pager) {
				this.pager.destroy();
			}
			Observatory.superclass.destroy.call(this);
		},
		getChildTabs : function() {
			return [this._getProbesTab()];
		},
		_getProbesTab : function() {
			this.probesTab = new YAHOO.widget.Tab({ label: "Probes", content: [
					'<div>',
					'	<div id="observatoryInfo"></div>',
					'	<div class="probeContainer clearafter">',
					'		<ul id="probeDetails" class="probeInfo">',
					'		</ul>',
					'	</div>',
					'	<div id="probePaginator"></div>',
					'</div>'
				].join('')});
			this.probesTab.subscribe("activeChange", this.GetProbes, this, true);
					
			return this.probesTab;
		},
		
		GetProbes : function(e) {
			if(e.newValue) {
				if(!this.probes) {
					Lacuna.Pulser.Show();
					this.service.get_probed_stars({session_id:Game.GetSession(),building_id:this.building.id,page_number:1}, {
						success : function(o){
							YAHOO.log(o, "info", "Observatory.get_probed_stars.success");
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
							this.ProbeInfoDisplay(o.result);
							this.probes = o.result.stars;
							this.pager = new Pager({
								rowsPerPage : 25,
								totalRecords: o.result.star_count*1,
								containers  : 'probePaginator',
								template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
								alwaysVisible : false

							});
							this.pager.subscribe('changeRequest',this.ProbesHandlePagination, this, true);
							this.pager.render();
							
							this.ProbesDisplay();
						},
						failure : function(o){
							YAHOO.log(o, "error", "Observatory.get_probed_stars.failure");
							Lacuna.Pulser.Hide();
							this.rpcFailure(o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.ProbesDisplay();
				}
			}
		},
		ProbeInfoDisplay : function(data) {
			var info = Dom.get("observatoryInfo");
			if(info) {
				info.innerHTML = ['Total of ', data.star_count, ' probes in use.  This observatory can control a maximum of ', data.max_probes, ' probes.'].join('');
			}
		},
		ProbesDisplay : function() {
			var stars = this.probes,
				probeDetails = Dom.get("probeDetails");
				
			if(probeDetails) {
				Event.purgeElement(probeDetails);
				probeDetails.innerHTML = "";
				
				var li = document.createElement("li");
				
				for(var i=0; i<stars.length; i++) {
					var st = stars[i],
						nLi = li.cloneNode(false);
						
					nLi.Star = st;
					Dom.addClass(nLi,"probeStar");
					
					nLi.innerHTML = [
						'<div class="probeStarContainer yui-gf">',
						'	<div class="yui-u first probeAction" style="background-color:black;">',
						'		<img src="',Lib.AssetUrl,'star_map/',st.color,'.png" alt="',st.name,'" style="width:50px;height:50px;" />',
						'	</div>',
						'	<div class="yui-u">',
						'		<div class="probeDelete"></div>',
						'		<div>',st.name,'</div>',
						'		<div>',st.x,' : ',st.y,'</div>',
						'	</div>',
						'</div>'
					].join('');
					
					nLi = probeDetails.appendChild(nLi);
					Event.delegate(nLi, "click", this.ProbeJump, "div.probeAction", this, true);
					Event.delegate(nLi, "click", this.ProbeAbandon, "div.probeDelete", this, true);
				}
				
				//wait for tab to display first
				setTimeout(function() {
					if(probeDetails.parentNode.clientHeight > 290) {
						Dom.setStyle(probeDetails.parentNode,"height","290px");
						Dom.setStyle(probeDetails.parentNode,"overflow-y","auto");
					}
				},10);
			}
		},
		ProbesHandlePagination : function(newState) {
			Lacuna.Pulser.Show();
			this.service.get_probed_stars({
				session_id:Game.GetSession(),
				building_id:this.building.id,
				page_number:newState.page
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Observatory.ProbesHandlePagination.get_probed_stars.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.probes = o.result.stars;
					// Update the Paginator's state
					this.pager.setState(newState);
					this.ProbesDisplay();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Observatory.ProbesHandlePagination.get_probed_stars.failure");
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		ProbeAbandon : function(e, matchedEl, container) {
			if(container.Star) {
				if(confirm(["Are you sure you want to abandon the probe at ",container.Star.name,"?"].join(''))) {
					Lacuna.Pulser.Show();
					this.service.abandon_probe({
							session_id:Game.GetSession(),
							building_id:this.building.id,
							star_id:container.Star.id
						}, {
						success : function(o){
							YAHOO.log(o, "info", "Observatory.ProbeAction.abandon_probe.success");
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
							Event.purgeElement(container);
							container.parentNode.removeChild(container);
							this.probes = null;
						},
						failure : function(o){
							YAHOO.log(o, "error", "Observatory.ProbeAction.abandon_probe.failure");
							Lacuna.Pulser.Hide();
							this.rpcFailure(o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
			}
		},
		ProbeJump : function(e, matchedEl, container) {
			if(container.Star) {
				Game.StarJump(container.Star);
			}
		}

	});
	
	YAHOO.lacuna.buildings.Observatory = Observatory;

})();
YAHOO.register("Observatory", YAHOO.lacuna.buildings.Observatory, {version: "1", build: "0"}); 

}