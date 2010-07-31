YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Archaeology == "undefined" || !YAHOO.lacuna.buildings.Archaeology) {

(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		DDM = Util.DragDropMgr,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var DDList = function(id, sGroup, config) {
		DDList.superclass.constructor.call(this, id, sGroup, config);

		var el = this.getDragEl();
		Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent

		this.goingUp = false;
		this.lastY = 0;
	};
	YAHOO.extend(DDList, YAHOO.util.DDProxy, {
		startDrag: function(x, y) {
			// make the proxy look like the source element
			var dragEl = this.getDragEl();
			var clickEl = this.getEl();
			Dom.setStyle(clickEl, "visibility", "hidden");

			dragEl.innerHTML = clickEl.innerHTML;

			Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
			Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
			Dom.setStyle(dragEl, "border", "2px solid gray");
			Dom.setStyle(dragEl, "zIndex", Dom.getStyle("buildingDetails_c", "zIndex")*1+1);
		},
		endDrag: function(e) {
			var srcEl = this.getEl();
			var proxy = this.getDragEl();

			// Show the proxy element and animate it to the src element's location
			Dom.setStyle(proxy, "visibility", "");
			var a = new YAHOO.util.Motion( 
				proxy, { 
					points: { 
						to: Dom.getXY(srcEl)
					}
				}, 
				0.2, 
				YAHOO.util.Easing.easeOut 
			)
			var proxyid = proxy.id;
			var thisid = this.id;

			// Hide the proxy and show the source element when finished with the animation
			a.onComplete.subscribe(function() {
					Dom.setStyle(proxyid, "visibility", "hidden");
					Dom.setStyle(thisid, "visibility", "");
				});
			a.animate();
		},
		onDragDrop: function(e, id) {
			if (id == "archaeologyGlyphDetails" || id == "archaeologyGlyphCombine") {

				// The position of the cursor at the time of the drop (YAHOO.util.Point)
				var pt = DDM.interactionInfo.point; 

				// The region occupied by the source element at the time of the drop
				var region = DDM.interactionInfo.sourceRegion; 

				// Check to see if we are over the source element's location.  We will
				// append to the bottom of the list once we are sure it was a drop in
				// the negative space (the area of the list without any list items)
				if (!region.intersect(pt)) {
					var destEl = Dom.get(id);
					var destDD = DDM.getDDById(id);
					destEl.appendChild(this.getEl());
					destDD.isEmpty = false;
					DDM.refreshCache();
				}

			}
		},
		onDrag: function(e) {
			// Keep track of the direction of the drag for use during onDragOver
			var y = Event.getPageY(e);

			if (y < this.lastY) {
				this.goingUp = true;
			} else if (y > this.lastY) {
				this.goingUp = false;
			}

			this.lastY = y;
		},
		onDragOver: function(e, id) {
			var srcEl = this.getEl();
			var destEl = Dom.get(id);

			// We are only concerned with list items, we ignore the dragover
			// notifications for the list.
			if (destEl.nodeName.toLowerCase() == "li") {
				var orig_p = srcEl.parentNode;
				var p = destEl.parentNode;

				if (this.goingUp) {
					p.insertBefore(srcEl, destEl); // insert above
				} else {
					p.insertBefore(srcEl, destEl.nextSibling); // insert below
				}

				DDM.refreshCache();
			}
		}
	});

	var Archaeology = function(result){
		Archaeology.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.Archaeology;
	};
	
	Lang.extend(Archaeology, Lacuna.buildings.Building, {
		getTabs : function() {
			return Archaeology.superclass.getTabs.call(this).concat([this._getSearchTab(), this._getViewTab()]);
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
				'<div class="clearafter">',
				'	<div class="archaeologySlots">',
				'		<label>Available Glyphs</label>',
				'		<ul id="archaeologyGlyphDetails" class="archaeologyGlyphInfo">',
				'		</ul>',
				'	</div>',
				'	<div class="archaeologySlots">',
				'		<label>Combine Glyphs</label>',
				'		<ul id="archaeologyGlyphCombine" class="archaeologyGlyphInfo">',
				'		</ul>',
				'		<div><button type="button" id="archaeologyCombine">Combine</button></div>',
				'	</div>',
				'</div>'
			].join('')});
			tab.subscribe("activeChange", function(e) {
				if(e.newValue) {
					this.getGlyphs();
				}
			}, this, true);
			
			Event.onAvailable("archaeologyCombine", function(e){
				Event.on("archaeologyCombine", "click", this.assembleGlyph, this, true);
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
			this.addQueue(seconds_remaining, this.searchQueue, "archaeologySearchTime");
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
				if(!this.glyphList) {
					this.glyphList = new Util.DDTarget("archaeologyGlyphDetails");
					this.glyphList.isGlyphContainer = true;
				}
				else {
					var gl = Sel.query("li", "archaeologyGlyphDetails");
					for(var gli=0, glLen=gl.length; gli<glLen; gli++) {
						var glio = gl[gli];
						glio.DD.unreg();
						glio.parentNode.removeChild(glio);
						glio = null;
					}
				}
				if(!this.glyphCombine) {
					this.glyphCombine = new Util.DDTarget("archaeologyGlyphCombine");
					this.glyphCombine.isGlyphContainer = true;
				}
				else {
					var gc = Sel.query("li", "archaeologyGlyphCombine");
					for(var gci=0, gcLen=gc.length; gci<gcLen; gci++) {
						var gcio = gc[gci];
						gcio.DD.unreg();
						gcio.parentNode.removeChild(gcio);
						gcio = null;
					}
				}
				
				var li = document.createElement("li");
				
				for(var i=0; i<glyphs.length; i++) {
					var obj = glyphs[i],
						nLi = li.cloneNode(false);
						
					nLi.Glyph = obj;
					Dom.addClass(nLi,"archaeologyGlyph");
					
					nLi.innerHTML = [
						'<div class="archaeologyGlyphContainer">',
						'	<img src="',Lib.AssetUrl,'glyphs/',obj.type,'.png" alt="',obj.type,'" title="',obj.type,'" style="width:119px;height:150px;" />', //"width:158px;height:200px;"
						'</div>'
					].join('');
					
					nLi = details.appendChild(nLi);
					nLi.DD = new DDList(nLi);
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
			var glyphs = Sel.query("li", "archaeologyGlyphCombine"),
				glyphIds = [];
			for(var g=0, len=glyphs.length; g<len; g++) {
				glyphIds.push(glyphs[g].Glyph.id);
			}
			
			this.service.assemble_glyphs({session_id:Game.GetSession(),building_id:this.building.id, ids:glyphIds}, {
				success : function(o){
					YAHOO.log(o, "info", "Archaeology.assembleGlyph.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					delete this.glyphs;
					this.getGlyphs();
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
	});
	
	Lacuna.buildings.Archaeology = Archaeology;

})();
YAHOO.register("archaeology", YAHOO.lacuna.buildings.Archaeology, {version: "1", build: "0"}); 

}