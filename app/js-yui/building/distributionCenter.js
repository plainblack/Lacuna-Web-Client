YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.DistributionCenter == "undefined" || !YAHOO.lacuna.buildings.DistributionCenter) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var DistributionCenter = function(result){
        DistributionCenter.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.DistributionCenter;
    };
    
    Lang.extend(DistributionCenter, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getReserveTab()];
        },
        _getReserveTab : function() {
            this.tab = new YAHOO.widget.Tab({ label: "Reserve", content: [
            '<div id="distribReserveAnnounce"></div>',
            '<div id="distribReserveContainers" style="display:none;">',
            '    <div class="distribReserve yui-g">',
            '        <div class="yui-u first">',
            '            <legend>On Planet</legend>',
            '            <div class="distribContainers"><ul id="distribReserveOnPlanet"></ul></div>',
            '        </div>',
            '        <div class="yui-u">',
            '            <legend>Reserve</legend>',
            '            <div class="distribContainers"><ul id="distribReserveToStore"></ul></div>',
            '        </div>',
            '    </div>',
            '    <ul style="margin-top:5px;">',
            '        <li><label>Total:</label><span id="distribTotalSelected">0</span></li>',
            '        <li id="distribReserveMessage" class="alert"></li>',
            '    </ul><div>',
            '        <button type="button" id="distribReserveSubmit">Reserve</button>',
            '    </div>',
            '</div>',
            '<div id="distribStoredContainer" class="distribReserve yui-g" style="display:none;">',
            '    <div class="yui-u first">',
            '        <legend>In Reserve</legend>',
            '        <div class="distribContainers"><ul id="distribReserveInReserve"></ul></div>',
            '        <div>',
            '            <div id="distribReleaseMessage" class="alert"></div>',
            '            <button type="button" id="distribReleaseSubmit">Release</button>',
            '        </div>',
            '    </div>',
            '</div>'].join('')});
            
            this.tab.subscribe("activeChange", this.CheckReserve, this, true);
            
            Event.on("distribReserveSubmit", "click", this.ReserveSubmit, this, true);
            Event.on("distribReleaseSubmit", "click", this.StoreRelease, this, true);
            
            Event.delegate("distribReserveOnPlanet", "click", this.ReserveStoreAdd, "button", this, true);
            Event.delegate("distribReserveToStore", "click", this.ReserveStoreRemove, "button", this, true);
            
            return this.tab;
        },
        
        GetStoredResources : function() {
            if(!this.resources) {
                require('js/actions/menu/loader').show();
                this.service.get_stored_resources({
                        session_id: Game.GetSession(""),
                        building_id: this.building.id
                    },{
                    success : function(o){
                        this.rpcSuccess(o);
                        this.resources = o.result.resources;
                        this.ReservePopulate();
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
            else {
                this.ReservePopulate();
            }
        },
        
        CheckReserve : function(e) {
            if(e.newValue) {
                if(!this.result.reserve.can) {
                    Dom.setStyle("distribReserveContainers", "display", "none");
                    Dom.setStyle("distribStoredContainer", "display", "");
                    this.StorePopulate();
                }
                else {
                    Dom.setStyle("distribReserveContainers", "display", "");
                    Dom.setStyle("distribStoredContainer", "display", "none");
                    this.GetStoredResources();
                }
            }
        },
        
        ReservePopulate : function() {
            var reserve = this.result.reserve || {}, 
                onPlanet = Dom.get("distribReserveOnPlanet"),
                announce = Dom.get("distribReserveAnnounce"),
                li = document.createElement("li"), nLi, ul,
                r,x,resource,name;
                
            if(announce) {
                announce.innerHTML = ['You can reserve at most ', Lib.formatNumber(reserve.max_reserve_size), ' resources for ', Lib.formatTime(reserve.max_reserve_duration), '.'].join('');
            }
                
            if(onPlanet) {
                onPlanet.innerHTML = "";
                
                for(r in Lib.ResourceTypes) {
                    if(Lib.ResourceTypes.hasOwnProperty(r)) {
                        resource = Lib.ResourceTypes[r];
                        if(Lang.isArray(resource)) {
                            for(x=0; x < resource.length; x++) {
                                name = resource[x];
                                if(this.resources[name]) {
                                    nLi = li.cloneNode(false);
                                    nLi.Reserve = {type:name,quantity:this.resources[name]*1};
                                    nLi.innerHTML = ['<span class="reserveName">',name.titleCaps(), ' (<label class="quantity">', this.resources[name], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                                    onPlanet.appendChild(nLi);
                                }
                            }
                        }
                        else if(this.resources[r] && resource) {
                            nLi = li.cloneNode(false);
                            nLi.Reserve = {type:r,quantity:this.resources[r]*1};
                            nLi.innerHTML = ['<span class="reserveName">',r.titleCaps(), ' (<label class="quantity">', this.resources[r], '</label>)</span> <input type="text" style="width:75px;" /><button type="button">+</button>'].join('');
                            
                            onPlanet.appendChild(nLi);
                        }
                    }
                }
            }
            
            var Ht = Game.GetSize().h - 245;
            if(Ht > 200) { Ht = 200; }
            Dom.setStyle(Sel.query('.distribContainers','distribReserveContainers'), 'height', Ht + 'px');

        },
        ReserveStoreAdd : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode,
                c = Dom.get("distribReserveToStore");
            if(quantity && c) {
                var id = "reserveResource-" + li.Reserve.type,
                    exists = Sel.query("#"+id, c);
                if(exists.length === 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    if(quantity > li.Reserve.quantity) {
                        quantity = li.Reserve.quantity;
                    }
                    Dom.addClass(item, "reserveItem");
                    Dom.addClass(del, "reserveDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.UpdateReserveStore(ep.Object.quantity * -1);
                        Event.purgeElement(ep);
                        ep.parentNode.removeChild(ep);
                    }, this, true);
                    item.Object = {type:li.Reserve.type, quantity:quantity};
                    content.innerHTML = ['<span class="reserveName">',item.Object.type.titleCaps(), ' (<label class="quantity">', quantity, '</label>)</span> <input type="text" style="width:75px;" value="',quantity,'" /><button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.UpdateReserveStore(quantity);
                }
                else {
                    var found = exists[0],
                        newTotal = found.Object.quantity + quantity,
                        diff = quantity,
                        lq = Sel.query(".quantity", found, true),
                        inp = Sel.query("input", found, true);
                    if(newTotal > li.Reserve.quantity) {
                        newTotal = li.Reserve.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    if(inp) {
                        inp.value = diff;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.UpdateReserveStore(diff);
                    
                    var a = new Util.ColorAnim(lq, {color:{from:'#0f0',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        ReserveStoreRemove : function(e, matchedEl, container){
            var quantity = matchedEl.previousSibling.value*1,
                li = matchedEl.parentNode.parentNode;
            if(quantity) {
                var newTotal = li.Object.quantity - quantity,
                    diff = quantity*-1,
                    lq = Sel.query(".quantity", li, true);
                if(newTotal < 0) {
                    newTotal = 0;
                    diff = li.Object.quantity*-1;
                }
                
                if(newTotal == 0) {
                    this.UpdateReserveStore(li.Object.quantity * -1);
                    Event.purgeElement(li);
                    li.parentNode.removeChild(li);
                }
                else {
                    lq.innerHTML = newTotal;
                    li.Object.quantity = newTotal;
                    this.UpdateReserveStore(diff);
                    var a = new Util.ColorAnim(lq, {color:{from:'#f00',to:'#fff'}}, 1.5);
                    a.animate();
                }
            }
        },
        UpdateReserveStore : function(byVal) {
            var c = Dom.get("distribTotalSelected"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        ReserveSubmit : function() {
            var data = {
                    session_id: Game.GetSession(""),
                    building_id: this.building.id
                },
                toStoreLis = Sel.query("li","distribReserveToStore"),
                reserveItems = [], 
                reserveTotal = 0;
                
            for(var n=0; n<toStoreLis.length; n++) {
                var obj = toStoreLis[n].Object;
                if(obj) {
                    reserveItems[reserveItems.length] = obj;
                    reserveTotal += obj.quantity;
                }
            }

            if(reserveTotal == 0) {
                Dom.get("distribReserveMessage").innerHTML = "Must add items to Reserve.";
            }
            else {
                data.resources = reserveItems;
            
                Dom.get("distribReserveMessage").innerHTML = "";
                require('js/actions/menu/loader').show();
                this.service.reserve(data, {
                    success : function(o){
                        this.rpcSuccess(o);
                        
                        for(var n=0; n<toStoreLis.length; n++) {
                            if(toStoreLis[n].Object) {
                                Event.purgeElement(toStoreLis[n]);
                                toStoreLis[n].parentNode.removeChild(toStoreLis[n]);
                            }
                        }
                        Dom.get("distribTotalSelected").innerHTML = "0";
                        
                        delete o.result.status;
                        this.result = o.result;
                        
                        require('js/actions/menu/loader').hide();
                        this.CheckReserve({newValue:1});
                    },
                    scope:this
                });
            }
        },

        StorePopulate : function() {
            var reserve = this.result.reserve || {},
                inReserve = Dom.get("distribReserveInReserve"),
                announce = Dom.get("distribReserveAnnounce"),
                li = document.createElement("li"), nLi, ul,
                r,x,resource,name;
                
            if(announce) {
                announce.innerHTML = 'Time left on current reserve: <span id="distribReserveTime"></span>';
                this.addQueue(reserve.seconds_remaining, this.StoreTimer, "distribReserveTime");
            }
                
            if(inReserve && reserve.resources && reserve.resources.length > 0) {
                inReserve.innerHTML = "";
                for(x=0; x < reserve.resources.length; x++) {
                    var obj = reserve.resources[x];
                    nLi = li.cloneNode(false);
                    nLi.innerHTML = ['<span class="reserveName">',obj.type.titleCaps(), ' (<label class="quantity">', obj.quantity, '</label>)</span>'].join('');
                    inReserve.appendChild(nLi);
                }
            }
        },
        StoreTimer : function(remaining, el){
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
        StoreRelease : function() {
            Dom.get("distribReleaseMessage").innerHTML = "";
            require('js/actions/menu/loader').show();
            this.service.release_reserve({
                session_id: Game.GetSession(""),
                building_id: this.building.id
            }, {
                success : function(o){
                    this.rpcSuccess(o);
                    
                    Dom.get("distribReserveInReserve").innerHTML = "";
                    
                    delete o.result.status;
                    this.result = o.result;
                    
                    require('js/actions/menu/loader').hide();
                    this.CheckReserve({newValue:1});
                },
                scope:this
            });
        }
        
    });
    
    Lacuna.buildings.DistributionCenter = DistributionCenter;

})();
YAHOO.register("DistributionCenter", YAHOO.lacuna.buildings.DistributionCenter, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
