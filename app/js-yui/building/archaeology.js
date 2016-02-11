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

      // only hide original when moving with the 'combine' list
      var fromCombineList = Dom.getAncestorBy(clickEl, function(el){return el.id=="archaeologyGlyphCombine"});
      if (fromCombineList) {
        Dom.setStyle(clickEl, "visibility", "hidden");
      }

      dragEl.innerHTML = clickEl.innerHTML;

      Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
      Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
      Dom.setStyle(dragEl, "border", "2px solid gray");
      Dom.setStyle(dragEl, "zIndex", Dom.getStyle("buildingDetails_c", "zIndex")*1+1);

      if (!fromCombineList) {
        this._removeGlyphCount(dragEl);
      }
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
      );
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
      if (id == "archaeologyGlyphDetails") {

        // The position of the cursor at the time of the drop (YAHOO.util.Point)
        var pt = DDM.interactionInfo.point; 

        // The region occupied by the source element at the time of the drop
        var region = DDM.interactionInfo.sourceRegion; 

        // Check to see if we are over the source element's location.  We will
        // append to the bottom of the list once we are sure it was a drop in
        // the negative space (the area of the list without any list items)
        if (!region.intersect(pt)) {
          var El = this.getEl();

          var fromCombineList = Dom.getAncestorBy(El, function(el){return el.id=="archaeologyGlyphCombine"});
          if (fromCombineList) {
            // moving from 'combine' list to 'details' list
            // just remove it from the 'combine' list - don't copy it over
            El.parentNode.removeChild(El);
            DDM.refreshCache();
          }
        }

      }
      else if (id == "archaeologyGlyphCombine") {

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
          var El = this.getEl();
          
          var fromAvailableList = Dom.getAncestorBy(El, function(el){return el.id=="archaeologyGlyphDetails"});
          if (fromAvailableList) {
            // moving from 'details' list to 'combine' list
            // clone it - don't just move it
            var clone = El.cloneNode(true);
            this._removeGlyphCount(clone);
            clone.id = Dom.generateId();
            clone.Glyph = El.Glyph;
            destEl.appendChild(clone);
            clone.DD = new DDList(clone);

            destDD.isEmpty = false;
            DDM.refreshCache();
          }
        }

      }
    },
    onDrag: function(e) {
      // Keep track of the direction of the drag for use during onDragOver
      var y = Event.getPageY(e),
        el = this.getEl(),
        container = el.parentNode;

      if (y < this.lastY) {
        this.goingUp = true;
        if(container.scrollTop > el.offsetTop) {
          container.scrollTop -= el.clientHeight;
        }
      } else if (y > this.lastY) {
        this.goingUp = false;
        if((el.offsetTop - container.scrollTop) > el.clientHeight) {
          container.scrollTop = el.offsetTop;
        }
      }
      

      this.lastY = y;
    },
    onDragOver: function(e, id) {
      var srcEl = this.getEl();
      var destEl = Dom.get(id);

      // only allow reordering when rearranging the 'combine' list
      // moves from 'details' to 'combine' always just get added to the end of the 'combine' list
      var fromDetailsList = Dom.getAncestorBy(srcEl, function(el){return el.id=="archaeologyGlyphDetails"});
      var toCombineList = Dom.getAncestorBy(destEl, function(el){return el.id=="archaeologyGlyphCombine"});
      if (fromDetailsList || !toCombineList) {
        return;
      }

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
    },
    _removeGlyphCount: function(element) {
      // remove glyph count from header text
      var container = Dom.getFirstChildBy(element, function(el){return Dom.hasClass(el,"archaeologyGlyphContainer")});
      var header = Dom.getFirstChildBy(container, function(el){return Dom.hasClass(el,"archaeologyGlyphHeader")});
      var text = header.innerHTML;
      header.innerHTML = text.replace(/ \([0-9]+\)/, "");
    }
  });

  var Archaeology = function(result){
    Archaeology.superclass.constructor.call(this, result);
    
    this.service = Game.Services.Buildings.Archaeology;
  };
  
  Lang.extend(Archaeology, Lacuna.buildings.Building, {
    getChildTabs : function() {
      return [this._getSearchTab(), this._getViewTab(), this._getExcavatorTab(), this._getAbandonExcavatorTab() ];
    },
    _getSearchTab : function() {
      var tab = new YAHOO.widget.Tab({ label: "Search", content: [
        '<div id="archaeologySearchContainer">',
        '  <ul id="archaeologySearchForm">',
        '    <li>Search Ore:<select id="archaeologyOre"></select></li>',
        '    <li><button type="button" id="archaeologySearch">Search</button></li>',
        '  </ul>',
        '  <ul id="archaeologySearchNone" style="display: none">',
        '    <li>Not enough ore available to search.</li>',
        '  </ul>',
        '</div>',
        '<div id="archaeologyWorkingContainer">',
        '  <ul>',
        '    <li>Searching: <span id="archaeologySearchOre"></span></li>',
        '    <li>Time left on current search: <span id="archaeologySearchTime"></span></li>',
        '    <li>You may subsidize the search for 2 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" />.</li>',
        '    <li><button type="button" id="archaeologySearchSubsidize">Subsidize</button></li>',
        '  </ul>',
        '</div>'
      ].join('')});
      tab.subscribe("activeChange", function(e) {
        if(e.newValue) {
          this.checkIfWorking();
        }
      }, this, true);
      
      this.searchTab = tab;
      Event.on("archaeologySearch", "click", this.searchForGlyph, this, true);
      Event.on("archaeologySearchSubsidize", "click", this.Subsidize, this, true);
      
      return tab;
    },
    _getViewTab : function() {
      var tab = new YAHOO.widget.Tab({ label: "View Glyphs", content: [
        '<div class="clearafter">',
        '  <div class="archaeologySlots">',
        '    <label>Available Glyphs</label>',
        '    <ul id="archaeologyGlyphDetails" class="archaeologyGlyphInfo">',
        '    </ul>',
        '  </div>',
        '  <div class="archaeologySlots">',
        '    <label>Combine Glyphs</label>',
        '    <ul id="archaeologyGlyphCombine" class="archaeologyGlyphInfo">',
        '    </ul>',
        '  </div>',
        '</div><span title="How many times should the specified glyphs be combined (max 50)"> Quantity: <input type="text" id="combineQuantity" value="1" size="2"></span> <button type="button" id="archaeologyCombine">Combine</button>'
      ].join('')});
      tab.subscribe("activeChange", function(e) {
        if(e.newValue) {
          this.getGlyphs();
        }
        var Ht = Game.GetSize().h - 180;
        if(Ht > 442) { Ht = 442; }
        var tC = Dom.get('archaeologyGlyphDetails').parentNode.parentNode;
        Dom.setStyle(tC, 'height', Ht + 'px');
        Dom.setStyle(tC, 'overflow-y', 'auto');
      }, this, true);
      
      Event.onAvailable("archaeologyCombine", function(e){
        Event.on("archaeologyCombine", "click", this.assembleGlyph, this, true);
      }, this, true);
      
      Event.delegate("archaeologyGlyphDetails", "dblclick", this.viewAdd, "li");
      Event.delegate("archaeologyGlyphCombine", "dblclick", this.viewRemove, "li");
      
      this.viewTab = tab;
      return tab;
    },
    _getExcavatorTab : function() {
      this.excavatorTab = new YAHOO.widget.Tab({ label: "Excavators", content: [
        '<div id="excavatorInfo"></div>',
        '<div class="excavatorContainer">',
        '  <div id="excavatorDetails">',
        '  </div>',
        '</div>'
      ].join('')});
      this.excavatorTab.subscribe("activeChange", this.viewExcavators, this, true);
          
      return this.excavatorTab;
    },
    _getAbandonExcavatorTab : function() {
      this.excavatorTab = new YAHOO.widget.Tab({ label: "Abandon All Excavators", content: [
    	'<div>',
        '    <button type="button" id="archaeologyMinistryBigRedButton">Abandon All Excavators!</button>',
        '</div>'
      ].join('')});
      var btn = Sel.query("button", this.excavatorTab.get("contentEl"), true);
      if (btn) {
          Event.on(btn, "click", this.AbandonAllExcavators, this, true);
      }

      return this.excavatorTab;
    },
    viewExcavators : function(e) {
      if(e.newValue) {
        if(!this.excavators) {
          require('js/actions/menu/loader').show();
          this.service.view_excavators({session_id:Game.GetSession(),building_id:this.building.id}, {
            success : function(o){
              YAHOO.log(o, "info", "Archaeology.view_excavators.success");
              require('js/actions/menu/loader').hide();
              this.rpcSuccess(o);
              this.excavators = { 
                max_excavators:o.result.max_excavators,
                travel_e:o.result.travelling,
                excavators:o.result.excavators
              };
              
              this.ArchaeologyExcavators();
            },
            scope:this
          });
        }
        else {
          this.ArchaeologyExcavators();
        }
      }
    },
    ArchaeologyExcavators : function() {
      var excavators = this.excavators.excavators,
                       details = Dom.get("excavatorDetails");
        
      if(details) {
        var ul = document.createElement("ul"),
          li = document.createElement("li"),
          info = Dom.get("excavatorInfo");
          
        if(excavators.length > 0) {
          info.innerHTML = ['Total of ', excavators.length - 1,
                            ' excavators deployed. ',
                            this.excavators.travel_e, ' en route. This ministry can control a maximum of ',
                            this.excavators.max_excavators, 
                            ' excavators.'
          ].join('');
        }
          
        Event.purgeElement(details);
        details.innerHTML = "";
        
        if (excavators.length > 0) {
          for(var i=0; i<excavators.length; i++) {
            var obj = excavators[i],
                nUl = ul.cloneNode(false),
                nLi = li.cloneNode(false);
              
            nUl.Excavator = obj;
            Dom.addClass(nUl, "excavatorInfo");
            Dom.addClass(nUl, "clearafter");

            Dom.addClass(nLi,"excavatorLocation");
            nLi.innerHTML = ['<img src="',Lib.AssetUrl,'star_system/',obj.body.image,'.png" />', obj.body.name].join('');
            Event.on(nLi, "click", function () { Game.StarJump({x:obj.body.x,y:obj.body.y}) }, obj, true);
                     //this.excavatorClick, obj, true);
            nUl.appendChild(nLi);
            
            if (obj.id > 0) {
              nLi = li.cloneNode(false);
              Dom.addClass(nLi,"excavatorAbandon");
              var bbtn = document.createElement("button");
              bbtn.setAttribute("type", "button");
              bbtn.innerHTML = "Abandon";
              bbtn = nLi.appendChild(bbtn);
              nUl.appendChild(nLi);
            }
            
            nLi = li.cloneNode(false);
            var ptype = obj.body.image.slice(0,obj.body.image.indexOf('-'));
            Dom.addClass(nLi,"excavatorChances");
            var outChance = ['<ul><li><label>Body Type: </label>',ptype,' <label>Distance:</label>',obj.distance,' <label>Chances:</label></li>'];
            var total = 0;
            var ctypes = ["artifact", "glyph", "plan", "resource" ];
            for (var chance_i in ctypes) {
              var chance = ctypes[chance_i];
              if(obj[chance] > 0) {
                outChance.push('<li><label>' + chance.replace(/^\w/,
                               function(c){ return c.toUpperCase() }) +
                               ':</label> ');
                outChance.push(obj[chance]);
                outChance.push('</li>');
                total += parseInt(obj[chance]);
              }
            }
            if(total > 0) {
              outChance.splice(5, 0, '<li><label>Total:</label> ');
              outChance.splice(6, 0, parseInt(total));
              outChance.splice(7, 0, '</li>');
            }
            outChance.push('</ul>');
            nLi.innerHTML = outChance.join('');
            nUl.appendChild(nLi);

            details.appendChild(nUl);
            
            Event.on(bbtn, "click", this.ExcavatorAbandon, {Self:this,Excavator:obj,Line:nUl}, true);
          }
        }
        
        //wait for tab to display first
        setTimeout(function() {
          var Ht = Game.GetSize().h - 210;
          if(Ht > 280) { Ht = 280; }
          Dom.setStyle(details.parentNode,"height",Ht + "px");
          Dom.setStyle(details.parentNode,"overflow-y","auto");
        },10);
      }
    },
    ExcavatorAbandon : function() {
      if(confirm(["Are you sure you want to Abandon the excavator ",this.Excavator.id," at  ",this.Excavator.body.name,"?"].join(''))) {
        require('js/actions/menu/loader').show();
        
        this.Self.service.abandon_excavator({
          session_id:Game.GetSession(),
          building_id:this.Self.building.id,
          excavator_id:this.Excavator.id
        }, {
          success : function(o){
            YAHOO.log(o, "info", "Archaeology.ExcavatorAbandon.success");
            require('js/actions/menu/loader').hide();
            this.Self.rpcSuccess(o);
            var excavators = this.Self.excavators.excavators;
            for(var i=0; i<excavators.length; i++) {
              if(excavators[i].id == this.Excavator.id) {
                excavators.splice(i,1);
                break;
              }
            }
            this.Line.parentNode.removeChild(this.Line);
          },
          scope:this
        });
      }
    },
//wee
    populateSearch : function() {
      var sel = Dom.get("archaeologyOre");
      if(sel && this.ore){
        sel.options.length = 0;
        var opt = document.createElement("option"),
          ore = [], oKey;
        for(oKey in this.ore) {
          ore.push(oKey);
        }
        ore.sort();
        for(var i=0; i<ore.length; i++) {
          oKey = ore[i];
          if(this.ore.hasOwnProperty(oKey)) {
            var nOpt = opt.cloneNode(false);
            nOpt.value = oKey;
            nOpt.innerHTML = [oKey, ' (', Lib.formatNumber(this.ore[oKey]), ')'].join('');
            sel.appendChild(nOpt);
          }
        }
        if (sel.options.length > 0) {
          Dom.setStyle("archaeologySearchForm", "display", "");
          Dom.setStyle("archaeologySearchNone", "display", "none");
        }
        else {
          Dom.setStyle("archaeologySearchForm", "display", "none");
          Dom.setStyle("archaeologySearchNone", "display", "");
        }
      }
    },
    populateActiveSearch : function(seconds_remaining) {
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
    
        //glyphs.slice(0);
        glyphs.sort(function(a,b) {
          if(a.type > b.type) {
            return 1;
          }
          else if(a.type < b.type) {
            return -1;
          }
          else {
            return 0;
          }
        });

        for(var i=0; i<glyphs.length; i++) {
          var obj = glyphs[i],
            nLi = li.cloneNode(false);
            
          nLi.Glyph = obj;
          Dom.addClass(nLi,"archaeologyGlyph");
          
          nLi.innerHTML = [
            '<div class="archaeologyGlyphContainer">',
            '  <div class="archaeologyGlyphHeader">',obj.type,' (',obj.quantity,')</div>',
            '  <img src="',Lib.AssetUrl,'glyphs/',obj.type,'.png" alt="',obj.type,'" title="',obj.type,'" style="width:79px;height:100px;" />', //"width:119px;height:150px;"
            '</div>'
          ].join('');
          
          nLi = details.appendChild(nLi);
          nLi.DD = new DDList(nLi);
        }
      }
    },
    viewAdd : function(e, matchedEl, container) { 
      matchedEl.parentNode.removeChild(matchedEl);
      Dom.get("archaeologyGlyphCombine").appendChild(matchedEl);
    },
    viewRemove : function(e, matchedEl, container) { 
      matchedEl.parentNode.removeChild(matchedEl);
      Dom.get("archaeologyGlyphDetails").appendChild(matchedEl);
    },
    
    checkIfWorking : function() {
      if(this.work && this.work.seconds_remaining) {
        Dom.setStyle("archaeologySearchContainer", "display", "none");
        Dom.setStyle("archaeologyWorkingContainer", "display", "");
        Dom.get("archaeologySearchOre").innerHTML = this.work.searching;
        this.populateActiveSearch(this.work.seconds_remaining);
      }
      else {
        Dom.setStyle("archaeologySearchContainer", "display", "");
        Dom.setStyle("archaeologyWorkingContainer", "display", "none");
        this.getOres();
      }
    },
    
    getOres : function() {
      if(!this.ore) {
        require('js/actions/menu/loader').show();
        this.service.get_ores_available_for_processing({session_id:Game.GetSession(),building_id:this.building.id}, {
          success : function(o){
            YAHOO.log(o, "info", "Archaeology.getOres.success");
            require('js/actions/menu/loader').hide();
            this.rpcSuccess(o);
            this.ore = o.result.ore;
            
            this.populateSearch();
          },
          scope:this
        });
      }
    },
    getGlyphs : function() {
      if(!this.glyphs) {
        require('js/actions/menu/loader').show();
        this.service.get_glyphs({session_id:Game.GetSession(),building_id:this.building.id}, {
          success : function(o){
            YAHOO.log(o, "info", "Archaeology.getGlyphs.success");
            require('js/actions/menu/loader').hide();
            this.rpcSuccess(o);
            this.glyphs = o.result.glyphs;
            
            this.populateView();
          },
          scope:this
        });
      }
    },
    assembleGlyph : function() {
      require('js/actions/menu/loader').show();
      var glyphs = Sel.query("li", "archaeologyGlyphCombine"),
        glyphTypes = [],
        quantity = parseInt(Dom.get("combineQuantity").value,10);
      for(var g=0, len=glyphs.length; g<len; g++) {
        glyphTypes.push(glyphs[g].Glyph.type);
      }
      
      this.service.assemble_glyphs({session_id:Game.GetSession(),building_id:this.building.id, glyphs:glyphTypes, quantity:quantity}, {
        success : function(o){
          YAHOO.log(o, "info", "Archaeology.assembleGlyph.success");
          var article = (quantity==1) ? "a" : quantity;
          var suffix = (quantity==1) ? "plan" : "plans";
          alert("You have found " + article + " " + o.result.item_name + " " + suffix + "!");
          require('js/actions/menu/loader').hide();
          this.rpcSuccess(o);
          delete this.glyphs;
          this.getGlyphs();
        },
        scope:this
      });
    },
    searchForGlyph : function() {
      require('js/actions/menu/loader').show();
      var sel = Dom.get("archaeologyOre"),
        opts = sel.options,
        selInd = sel.selectedIndex,
        type = opts.length > 0 && selInd >= 0 && opts[selInd].value;
        
      if(type) {
        this.service.search_for_glyph({session_id:Game.GetSession(),building_id:this.building.id,ore_type:type}, {
          success : function(o){
            YAHOO.log(o, "info", "Archaeology.searchForGlyph.success");
            require('js/actions/menu/loader').hide();
            this.rpcSuccess(o);
            //this.work = o.result.building.work;
            //this.updateBuildingTile(o.result.building);
            this.checkIfWorking();
          },
          scope:this
        });
      }
    },
    Subsidize : function() {
      require('js/actions/menu/loader').show();
      
      this.service.subsidize_search({
        session_id:Game.GetSession(),
        building_id:this.building.id
      }, {
        success : function(o){
          require('js/actions/menu/loader').hide();
          this.rpcSuccess(o);

          delete this.work;
          delete this.ore;
          this.updateBuildingTile(o.result.building);
          this.resetQueue();
          Dom.get("archaeologySearchTime").innerHTML = "";
          this.checkIfWorking();
        },
        scope:this
      });
    },
    AbandonAllExcavators : function(e) {
        if(confirm("Are you sure you want to abandon all excavators controlled by this Archaeology Ministry?")) {
            require('js/actions/menu/loader').show();
            this.service.mass_abandon_excavator({
                    session_id:Game.GetSession(),
                    building_id:this.building.id
                 }, {
                success : function(o){
                     YAHOO.log(o, "info", "Archaeology.AbandonAllExcavators.mass_abandon_excavator.success");
                     require('js/actions/menu/loader').hide();
                     this.rpcSuccess(o);
                     this.probes = null;
                        
        	          //close buildingDetails
                     this.fireEvent("onHide");
                 },
                 scope:this
               });
            }
        }
  });
  
  Lacuna.buildings.Archaeology = Archaeology;

})();
YAHOO.register("archaeology", YAHOO.lacuna.buildings.Archaeology, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
