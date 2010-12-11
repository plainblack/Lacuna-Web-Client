YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.HallsOfVrbansk == "undefined" || !YAHOO.lacuna.buildings.HallsOfVrbansk) {
	
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

	var HallsOfVrbansk = function(result){
		HallsOfVrbansk.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.HallsOfVrbansk;
		this.maps = {};
	};
	
	Lang.extend(HallsOfVrbansk, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getTab()];
		},
		_getTab : function() {
			this.tab = new YAHOO.widget.Tab({ label: "Sacrifice", content: [
					'<div id="hovNoSacrifice" style="display:none;">There are currently no glyph buildings that you can upgrade with the number of Halls of Vrbansk you have.</div>',
					'<div id="hovCanSacrifice" style="display:none;">',
					'	<div>You may sacrifice the Halls of Vrbansk to upgrade another glyph building.</div>',
					'	<select id="hovAvailableBuildings"></select>',
					'	<button type="button" id="hovSacrifice">Sacrifice</button>',
					'</div>'
				].join('')});
				
			this.tab.subscribe("activeChange", this.getUpgradable, this, true);
			
			Event.on("hovSacrifice", "click", this.Sacrifice, this, true);
					
			return this.tab;
		},

		getUpgradable : function(e) {
			if(e.newValue) {
				Lacuna.Pulser.Show();
				this.service.get_upgradable_buildings({session_id:Game.GetSession(),building_id:this.building.id}, {
					success : function(o){
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						this.Display(o.result.buildings);
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
		Display : function(buildings) {
			if(buildings.length == 0) {
				Dom.setStyle("hovNoSacrifice", "display", "");
				Dom.setStyle("hovCanSacrifice", "display", "none");
			}
			else {
				Dom.setStyle("hovNoSacrifice", "display", "none");
				Dom.setStyle("hovCanSacrifice", "display", "");
				
				var sel = Dom.get("hovAvailableBuildings"),
					opt = document.createElement("option"),
					nOpt;
					
				if(sel) {
					for(var n=0; n < buildings.length; n++) {
						nOpt = opt.cloneNode(false);
						nOpt.Building = buildings[n];
						nOpt.value = nOpt.Building.id;
						nOpt.innerHTML = nOpt.Building.name + ' - Level ' + nOpt.Building.level;
						sel.appendChild(nOpt);
					}
				}
			}
		},
		Sacrifice : function() {			 
			var upgradeBuildingId = Lib.getSelectedOptionValue("hovAvailableBuildings");
			Lacuna.Pulser.Show();
			this.service.sacrifice_to_upgrade({session_id:Game.GetSession(),building_id:this.building.id,upgrade_building_id:upgradeBuildingId}, {
				success : function(o){
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.fireEvent("onHide");
				},
				failure : function(o){
					Lacuna.Pulser.Hide();
					this.rpcFailure(o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}
		
	});
	
	YAHOO.lacuna.buildings.HallsOfVrbansk = HallsOfVrbansk;

})();
YAHOO.register("HallsOfVrbansk", YAHOO.lacuna.buildings.HallsOfVrbansk, {version: "1", build: "0"}); 

}