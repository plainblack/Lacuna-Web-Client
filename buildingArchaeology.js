YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Archaeology == "undefined" || !YAHOO.lacuna.buildings.Archaeology) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Archaeology = function(building, work){
		this.createEvent("onMapRpc");
		this.createEvent("onMapRpcFailed");
		this.createEvent("onQueueAdd");
		this.building = building;
		this.work = work;
		this.service = Game.Services.Buildings.Archaeology;
	};
	
	Archaeology.prototype = {
		destroy : function() {
			this.unsubscribeAll();
		},
		getTabs : function() {
			return [this._getSearchTab(), this._getViewTab()];
		},
		_getSearchTab : function() {
			var tab = new YAHOO.widget.Tab({ label: "Search", content: [
				'<div class="archaeologySearchContainer">',
				'	<ul>',
				'		<li>Search Ore:<select id="archaeologyOre"></select></li>',
				'		<li><button type="button" id="archaeologySearch">Search</button></li>',
				'	</ul>',
				'</div>'
			].join('')});
			tab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					this.checkIfWorking();
				}
			}, this, true);
			
			this.searchTab = tab;
			Event.on("archaeologySearch", "click", this.searchForGlyph, this, true);
			
			return tab;
		},
		_getViewTab : function() {
			var tab = new YAHOO.widget.Tab({ label: "View Glyphs", content: [
				'<div>',
				'	<ul id="archaeologyGlyphDetails" class="archaeologyGlyphInfo">',
				'	</ul>',
				'</div>'
			].join('')});
			tab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					this.getGlyphs();
				}
			}, this, true);
			
			this.viewTab = tab;
			return tab;
		},
		
		populateSearch : function() {
			var sel = Dom.get("archaeologyOre");
			if(sel && this.ore){
				var opt = document.createElement("option");
				for(var oKey in this.ore) {
					if(this.ore.hasOwnProperty(oKey)) {
						var nOpt = opt.cloneNode(false);
						nOpt.value = oKey;
						nOpt.innerHTML = [oKey, ' (', this.ore[oKey], ')'].join('');
						sel.appendChild(nOpt);
					}
				}
			}
		},
		populateActiveSearch : function(seconds_remaining) {
			var ce = this.searchTab.get("contentEl");
			Event.purgeElement(ce);
			ce.innerHTML = 'Time left on current search: <span id="archaeologySearchTime"></span>';
			this.fireEvent("onQueueAdd", {seconds:seconds_remaining, fn:this.searchQueue, el:"archaeologySearchTime"});
		},
		searchQueue : function(remaining, el){
			if(remaining <= 0) {
				var span = Dom.get(el),
					p = span.parentNode;
				p.removeChild(span);
				p.innerHTML = "Search Complete";
			}
			else {
				Dom.get(el).innerHTML = Lib.formatTime(Math.round(remaining));
			}
		},
		
		populateView : function() {
			var glyphs = this.glyphs,
				details = Dom.get("archaeologyGlyphDetails");
				
			if(details) {
				Event.purgeElement(details);
				details.innerHTML = "";
				
				var li = document.createElement("li");
				
				for(var i=0; i<glyphs.length; i++) {
					var obj = glyphs[i],
						nLi = li.cloneNode(false);
						
					nLi.Glyph = obj;
					Dom.addClass(nLi,"archaeologyGlyph");
					
					nLi.innerHTML = [
						'<div class="archaeologyGlyphContainer">',
						'	<img src="',Lib.AssetUrl,'glyphs/',obj.type,'.png" alt="',obj.type,'" style="width:158px;height:200px;" />',
						'</div>'
					].join('');
					
					nLi = details.appendChild(nLi);
				}
			}
		},
		
		checkIfWorking : function() {
			if(this.work && this.work.seconds_remaining) {
				this.populateActiveSearch(this.work.seconds_remaining);
			}
			else {
				this.getOres();
			}
		},
		
		getOres : function() {
			if(!this.ore) {
				Lacuna.Pulser.Show();
				this.service.get_ores_available_for_processing({session_id:Game.GetSession(),building_id:this.building.id}, {
					success : function(o){
						YAHOO.log(o, "info", "Archaeology.getOres.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						this.ore = o.result.ore;
						
						this.populateSearch();
					},
					failure : function(o){
						YAHOO.log(o, "error", "Archaeology.getOres.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		getGlyphs : function() {
			if(!this.glyphs) {
				Lacuna.Pulser.Show();
				this.service.get_glyphs({session_id:Game.GetSession(),building_id:this.building.id}, {
					success : function(o){
						YAHOO.log(o, "info", "Archaeology.getGlyphs.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						this.glyphs = o.result.glyphs;
						
						this.populateView();
					},
					failure : function(o){
						YAHOO.log(o, "error", "Archaeology.getGlyphs.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		},
		assembleGlyph : function() {
			Lacuna.Pulser.Show();
			this.service.assemble_glyphs({session_id:Game.GetSession(),building_id:this.building.id, ids:[]}, {
				success : function(o){
					YAHOO.log(o, "info", "Archaeology.assembleGlyph.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					
					this.MiningMinistryShipsPopulate();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Archaeology.assembleGlyph.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		searchForGlyph : function() {
			Lacuna.Pulser.Show();
			var sel = Dom.get("archaeologyOre"),
				opts = sel.options,
				selInd = sel.selectedIndex,
				type = opts.length > 0 && selInd >= 0 && opts[selInd].value;
				
			if(type) {
				this.service.search_for_glyph({session_id:Game.GetSession(),building_id:this.building.id,ore_type:type}, {
					success : function(o){
						YAHOO.log(o, "info", "Archaeology.searchForGlyph.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						
						this.populateActiveSearch(o.result.seconds_remaining);
					},
					failure : function(o){
						YAHOO.log(o, "error", "Archaeology.searchForGlyph.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		}
	};
	Lang.augmentProto(Archaeology, Util.EventProvider);
	
	YAHOO.lacuna.buildings.Archaeology = Archaeology;

})();
YAHOO.register("archaeology", YAHOO.lacuna.buildings.Archaeology, {version: "1", build: "0"}); 

}