YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Embassy == "undefined" || !YAHOO.lacuna.buildings.Embassy) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library,
        stashSel = '<select><option value="1">1</option><option value="10">10</option><option value="100">100</option><option value="1000" selected="selected">1000</option><option value="10000">10000</option></select>';

    var Embassy = function(result){
        Embassy.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Embassy;
        this.alliance = result.alliance_status;
        this.isLeader = this.alliance && this.alliance.leader_id == Game.EmpireData.id;
        
        if(this.building.level > 0) {
            this.subscribe("onLoad", this.MembersPopulate, this, true);
        }
    };
    
    Lang.extend(Embassy, Lacuna.buildings.Building, {
        /*destroy : function() {
            Event.removeListener(document, "mouseup", this.StashMouseUp);
            
            Embassy.superclass.destroy.call(this);
        },*/
        getChildTabs : function() {
            if(this.alliance) {
                var tabs =  [this._getStashTab(),this._getAllianceTab(),this._getMemberTab(),this._getInvitesTab(),this._getPropsTab()];
                if(this.isLeader) {
                    tabs.push(this._getSendTab());
                }
                return tabs;
            }
            else {
                return [this._getCreateTab(),this._getInvitesTab()];
            }
        },
        _getAllianceTab : function() {
            var div = document.createElement("div");
            if(this.isLeader) {
                div.innerHTML = ['<div>',
                '    <ul>',
                '        <li><label>Founded: </label>', Lib.formatServerDate(this.alliance.date_created),'</li>',
                '        <li><label>Alliance ID: </label>', this.alliance.id,'</li>',
                '        <li><label>Description: </label><input type="text" id="embassyAllianceDesc" value="', this.alliance.description,'" size="50" /></li>',
                '        <li><label>Forums: </label><input type="text" id="embassyAllianceForums" value="', this.alliance.forum_uri,'" size="50" /></li>',
                '        <li><label>Announcements: </label><textarea id="embassyAllianceAnnoucements" rows="2" cols="80">', this.alliance.announcements,'</textarea></li>',
                '        <li id="embassyAllianceMessage"></li>',
                '        <li><button type="button" id="embassyAllianceUpdate">Save</button></li>',
                '    </ul>',
                '    <hr /><div><button type="button" id="embassyAllianceDissolve">Dissolve Alliance</button>',
                '</div>'].join('');
                
                Event.on("embassyAllianceUpdate","click", this.UpdateAlliance, this, true);
                Event.on("embassyAllianceDissolve","click", this.DissolveAlliance, this, true);
            }
            else {
                div.innerHTML = ['<div>',
                '    <ul>',
                '        <li><label>Founded: </label>', Lib.formatServerDate(this.alliance.date_created),'</li>',
                '        <li><label>Description: </label>', this.alliance.description,'</li>',
                '        <li><label>Forums: </label>', this.alliance.forum_uri ? ['<a href="',this.alliance.forum_uri,'" target="_blank">View</a>'].join('') : '','</li>',
                '        <li><label>Announcements: </label>', this.alliance.announcements ? this.alliance.announcements.replace('\n','<br />') : "",'</li>',
                '    </ul>',
                '    <hr /><div>',
                '        <textarea id="embassyAllianceLeaveReason" rows="3" cols="80"></textarea>',
                '        <button type="button" id="embassyAllianceLeave">Leave Alliance</button>',
                '    </div>',
                '</div>'].join('');
                
                Event.on("embassyAllianceLeave","click", this.LeaveAlliance, this, true);
            }
        
            this.allianceTab = new YAHOO.widget.Tab({ label: this.alliance.name, contentEl:div });
            
            return this.allianceTab;
        },
        _getMemberTab : function() {
            this.memberTab = new YAHOO.widget.Tab({ label: "Members", content: ['<div>',
            '    <ul class="embassyHeader embassyInfo clearafter">',
            '        <li class="embassyEmpire">Empire</li>',
            '        <li class="embassyAction"></li>',
            '        <li class="embassyMessage"></li>',
            '    </ul>',
            '    <div><div id="embassyMemberDetails"></div></div>',
            '</div>'].join('')});
            
            return this.memberTab;
        },
        _getCreateTab : function() {
            this.createTab = new YAHOO.widget.Tab({ label: "Create Alliance", content: ['<div>',
            '    <label>Alliance Name</label><input type="text" id="embassyCreateName" />',
            '    <div id="embassyCreateMessage" class="alert"></div>',
            '    <button type="button" id="embassyCreateSubmit">Create</button>',
            '</div>'].join('')});
            
            Event.on("embassyCreateSubmit", "click", this.CreateAlliance, this, true);
            
            return this.createTab;
        },
        _getInvitesTab : function() {
            this.invitesTab = new YAHOO.widget.Tab({ label: "View Invites", content: ['<div>',
            '    <ul class="embassyHeader embassyInfo clearafter">',
            '        <li class="embassyAlliance">Alliance</li>',
            '        <li class="embassyAction"></li>',
            '        <li class="embassyAction"></li>',
            '        <li class="embassyMessage"></li>',
            '    </ul>',
            '    <div><div id="embassyInvitesDetails"></div></div>',
            '</div>'].join('')});
            
            this.invitesTab.subscribe("activeChange", this.getInvites, this, true);
            
            return this.invitesTab;
        },
        _getPropsTab : function() {
            var tab = new YAHOO.widget.Tab({ label: "Propositions", content: [
                '<div>',
                '    <div style="overflow:auto;"><ul id="propsDetails"></ul></div>',
                '</div>'
            ].join('')});
            tab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    if(!this.props) {
                        require('js/actions/menu/loader').show();
                        this.service.view_propositions({session_id:Game.GetSession(),building_id:this.building.id}, {
                            success : function(o){
                                require('js/actions/menu/loader').hide();
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
        _getSendTab : function() {
            this.sendTab = new YAHOO.widget.Tab({ label: "Send Invites", content: ['<div>',
            '    <ul>',
            '        <li>Invite: <span style="width:200px;display:inline-block;"><input id="embassySendTo" type="text" /></span></li>',
            '        <li>Message: <textarea id="embassySendMessage" rows="1" cols="80"></textarea></li>',
            '        <li><button type="button" id="embassySendInvite">Send Invite</button></li>',
            '    </ul>',
            '    <hr />',
            '    <h3>Pending Invites</h3>',
            '    <ul class="embassyHeader embassyInfo clearafter">',
            '        <li class="embassyEmpire">Empire</li>',
            '        <li class="embassyAction"></li>',
            '        <li class="embassyMessage"></li>',
            '    </ul>',
            '    <div><div id="embassySendDetails"></div></div>',
            '</div>'].join('')});
            
            this.sendTab.subscribe("activeChange", this.getPendingInvites, this,true);
            
            Event.on("embassySendInvite","click",this.SendInvite,this,true);
            
            return this.sendTab;
        },
        _getStashTab : function() {
            this.stashTab = new YAHOO.widget.Tab({ label: "Stash", content: [
            '<div id="embassyStashAnnounce"></div>',
            '<div class="embassyStash yui-g">',
            '    <div class="yui-g first">',
            '        <div class="yui-u first">',
            '            <legend>On Planet</legend>',
            '            <div class="embassyContainers" id="sopHt"><ul id="embassyStashOnPlanet"></ul></div>',
            '        </div>',
            '        <div class="yui-u">',
            '            <legend>Donate</legend>',
            '            <div class="embassyContainers" id="stdHt"><ul id="embassyStashToDonate"></ul></div>',
            '            <div>Total:<span id="embassyTotalDonate">0</span></div>',
            '        </div>',
            '    </div>',
            '    <div class="yui-g">',
            '        <div class="yui-u first">',
            '            <legend>Exchange</legend>',
            '            <div class="embassyContainers" id="steHt"><ul id="embassyStashToExchange"></ul></div>',
            '            <div>Total:<span id="embassyTotalExchange">0</span></div>',
            '        </div>',
            '        <div class="yui-u">',
            '            <legend>In Stash</legend>',
            '            <div class="embassyContainers" id="sisHt"><ul id="embassyStashInStash"></ul></div>',
            '        </div>',
            '    </div>',
            '</div>',
            '<div style="text-align: center;">',
            '    <div id="embassyStashMessage" class="alert"></div>',
            '    <button type="button" id="embassyStashSubmit">Transfer</button>',
            '</div>'].join('')});
            
            this.stashTab.subscribe("activeChange", this.getStash, this, true);
            
            Event.on("embassyStashSubmit", "click", this.StashSubmit, this, true);
            
            Event.delegate("embassyStashOnPlanet", "click", this.StashDonateAdd, "button", this, true);
            Event.delegate("embassyStashToDonate", "click", this.StashDonateRemove, "button", this, true);

            Event.delegate("embassyStashInStash", "click", this.StashExchangeAdd, "button", this, true);
            Event.delegate("embassyStashToExchange", "click", this.StashExchangeRemove, "button", this, true);
            
            return this.stashTab;
        },
        
        _createSendToSelect : function() {
            var dataSource = new Util.XHRDataSource("/empire");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.empires",
                fields : ["name","id"]
            };
            
            var oTextboxList = new YAHOO.lacuna.TextboxList("embassySendTo", dataSource, { //config options
                maxResultsDisplayed: 10,
                minQueryLength:3,
                multiSelect:false,
                forceSelection:true,
                formatResultLabelKey:"name",
                formatResultColumnKeys:["name"],
                useIndicator:true
            });
            oTextboxList.generateRequest = function(sQuery){                
                var s = Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": "find",
                        "jsonrpc": "2.0",
                        "params": [
                            Game.GetSession(""),
                            decodeURIComponent(sQuery)
                        ]
                    });
                return s;
            };
            
            this.embassySendTo = oTextboxList;
        },
        
        //Stash 
        getStash : function(e) {
            if(e.newValue) {
                require('js/actions/menu/loader').show();
                this.service.view_stash({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        delete o.result.status;
                        this.stash = o.result;
                        
                        this.StashPopulate();
                    },
                    scope:this
                });
            }
        },
        StashPopulate : function() {
            /*        
            "stash" : {"gold" : 4500},
            "stored" : {"energy" : 40000},
            "max_exchange_size" : 30000,
            "exchanges_remaining_today" : 1
            */
            var stash = this.stash || {}, 
                onPlanet = Dom.get("embassyStashOnPlanet"),
                inStash = Dom.get("embassyStashInStash"),
                announce = Dom.get("embassyStashAnnounce"),
                li = document.createElement("li"), nLi, ul,
                r,x,resource,name;
                
            if(announce) {
                announce.innerHTML = ['Donations are unlimited. You can exchange at most ', Lib.formatNumber(stash.max_exchange_size), ' resources and you have ', stash.exchanges_remaining_today, ' exchange(s) remaining today.'].join('');
            }
                
            if(onPlanet) {
                onPlanet.innerHTML = "";
                
                for(r in Lib.ResourceTypes) {
                    if(Lib.ResourceTypes.hasOwnProperty(r)) {
                        resource = Lib.ResourceTypes[r];
                        if(Lang.isArray(resource)) {
                            for(x=0; x < resource.length; x++) {
                                name = resource[x];
                                if(stash.stored[name]) {
                                    nLi = li.cloneNode(false);
                                    nLi.Stash = {type:name,quantity:stash.stored[name]*1};
                                    nLi.innerHTML = ['<span class="stashName">',name.titleCaps(), ' (<label class="quantity">', stash.stored[name], '</label>)</span> ', stashSel, '<button type="button">+</button>'].join('');
                                    onPlanet.appendChild(nLi);
                                }
                            }
                        }
                        else if(stash.stored[r] && resource) {
                            nLi = li.cloneNode(false);
                            nLi.Stash = {type:r,quantity:stash.stored[r]*1};
                            nLi.innerHTML = ['<span class="stashName">',r.titleCaps(), ' (<label class="quantity">', stash.stored[r], '</label>)</span> ', stashSel, '<button type="button">+</button>'].join('');
                            
                            onPlanet.appendChild(nLi);
                        }
                    }
                }
            }
            if(inStash && stash.stash) {
                inStash.innerHTML = "";                
                for(r in Lib.ResourceTypes) {
                    if(Lib.ResourceTypes.hasOwnProperty(r)) {
                        resource = Lib.ResourceTypes[r];
                        if(Lang.isArray(resource)) {
                            for(x=0; x < resource.length; x++) {
                                name = resource[x];
                                if(stash.stash[name]) {
                                    nLi = li.cloneNode(false);
                                    nLi.Stash = {type:name,quantity:stash.stash[name]*1};
                                    nLi.innerHTML = ['<span class="stashName">',name.titleCaps(), ' (<label class="quantity">', stash.stash[name], '</label>)</span> ', stashSel, '<button type="button">+</button>'].join('');
                                    inStash.appendChild(nLi);
                                }
                            }
                        }
                        else if(stash.stash[r] && resource) {
                            nLi = li.cloneNode(false);
                            nLi.Stash = {type:r,quantity:stash.stash[r]*1};
                            nLi.innerHTML = ['<span class="stashName">',r.titleCaps(), ' (<label class="quantity">', stash.stash[r], '</label>)</span> ', stashSel, '<button type="button">+</button>'].join('');
                            
                            inStash.appendChild(nLi);
                        }
                    }
                }
            }
            var Ht = Game.GetSize().h - 245;
            if(Ht > 200) { Ht = 200; }
            Dom.setStyle(Dom.get('sopHt'), 'height', Ht + 'px');
            Dom.setStyle(Dom.get('stdHt'), 'height', Ht + 'px');
            Dom.setStyle(Dom.get('steHt'), 'height', Ht + 'px');
            Dom.setStyle(Dom.get('sisHt'), 'height', Ht + 'px');

        },
        StashDonateAdd : function(e, matchedEl, container){
            var quantity = Lib.getSelectedOptionValue(matchedEl.previousSibling)*1,
                li = matchedEl.parentNode,
                c = Dom.get("embassyStashToDonate");
            if(quantity && c) {
                var id = "stashResource-" + li.Stash.type,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    if(quantity > li.Stash.quantity) {
                        quantity = li.Stash.quantity;
                    }
                    Dom.addClass(item, "stashItem");
                    Dom.addClass(del, "stashDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateStashDonate(ep.Object.quantity * -1);
                        Event.purgeElement(ep);
                        ep.parentNode.removeChild(ep);
                    }, this, true);
                    item.Object = {type:li.Stash.type, quantity:quantity};
                    content.innerHTML = ['<span class="stashName">',item.Object.type.titleCaps(), ' (<label class="quantity">', quantity, '</label>)</span> ', stashSel, '<button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updateStashDonate(quantity);
                }
                else {
                    var found = exists[0],
                        newTotal = found.Object.quantity + quantity,
                        diff = quantity,
                        lq = Sel.query(".quantity", found, true);
                    if(newTotal > li.Stash.quantity) {
                        newTotal = li.Stash.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateStashDonate(diff);
                }
            }
        },
        StashDonateRemove : function(e, matchedEl, container){
            var quantity = Lib.getSelectedOptionValue(matchedEl.previousSibling)*1,
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
                    this.updateStashDonate(li.Object.quantity * -1);
                    Event.purgeElement(li);
                    li.parentNode.removeChild(li);
                }
                else {
                    lq.innerHTML = newTotal;
                    li.Object.quantity = newTotal;
                    this.updateStashDonate(diff);
                }
            }
        },
        StashExchangeAdd : function(e, matchedEl, container){
            var quantity = Lib.getSelectedOptionValue(matchedEl.previousSibling)*1,
                li = matchedEl.parentNode,
                c = Dom.get("embassyStashToExchange");
            if(quantity && c) {
                var id = "stashResource-" + li.Stash.type,
                    exists = Sel.query("#"+id, c);
                if(exists.length == 0) {
                    var item = document.createElement("li"),
                        del = item.appendChild(document.createElement("div")),
                        content = item.appendChild(document.createElement("div"));
                    item.id = id;
                    if(quantity > li.Stash.quantity) {
                        quantity = li.Stash.quantity;
                    }
                    Dom.addClass(item, "stashItem");
                    Dom.addClass(del, "stashDelete");
                    Event.on(del, "click", function(e){
                        var ed = Event.getTarget(e),
                            ep = ed.parentNode;
                        this.updateStashExchange(ep.Object.quantity * -1);
                        Event.purgeElement(ep);
                        ep.parentNode.removeChild(ep);
                    }, this, true);
                    item.Object = {type:li.Stash.type, quantity:quantity};
                    content.innerHTML = ['<span class="stashName">',item.Object.type.titleCaps(), ' (<label class="quantity">', quantity, '</label>)</span> ', stashSel, '<button type="button">-</button>'].join('');
                    c.appendChild(item);
                    this.updateStashExchange(quantity);
                }
                else {
                    var found = exists[0],
                        newTotal = found.Object.quantity + quantity,
                        diff = quantity,
                        lq = Sel.query(".quantity", found, true);
                    if(newTotal > li.Stash.quantity) {
                        newTotal = li.Stash.quantity;
                        diff = newTotal - found.Object.quantity;
                    }
                    lq.innerHTML = newTotal;
                    found.Object.quantity = newTotal;
                    this.updateStashExchange(diff);
                }
            }
        },
        StashExchangeRemove : function(e, matchedEl, container){
            var quantity = Lib.getSelectedOptionValue(matchedEl.previousSibling)*1,
                li = matchedEl.parentNode.parentNode;
            if(quantity) {
                var newTotal = li.Object.quantity - quantity,
                    diff = quantity*-1,
                    lq = Sel.query(".quantity", li, true);
                if(newTotal < 0) {
                    newTotal = 0;
                    diff = li.Object.quantity;
                }
                
                if(newTotal == 0) {
                    this.updateStashExchange(li.Object.quantity * -1);
                    Event.purgeElement(li);
                    li.parentNode.removeChild(li);
                }
                else {
                    lq.innerHTML = newTotal;
                    li.Object.quantity = newTotal;
                    this.updateStashExchange(diff);
                }
            }
        },
        updateStashDonate : function(byVal) {
            var c = Dom.get("embassyTotalDonate"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        updateStashExchange : function(byVal) {
            var c = Dom.get("embassyTotalExchange"),
                cv = c.innerHTML*1;
            c.innerHTML = cv + byVal;
        },
        StashSubmit : function() {
            var data = {
                    session_id: Game.GetSession(""),
                    building_id: this.building.id
                },
                toDonateLis = Sel.query("li","embassyStashToDonate"),
                toExchangeLis = Sel.query("li","embassyStashToExchange"),
                donateItems = {}, donateTotal = 0,
                exchangeItems = {}, exchangeTotal = 0,
                n, obj, 
                serviceFunc;
                
            for(n=0; n<toDonateLis.length; n++) {
                obj = toDonateLis[n].Object;
                if(obj) {
                    donateItems[obj.type] = obj.quantity;
                    donateTotal += obj.quantity;
                }
            }
            for(n=0; n<toExchangeLis.length; n++) {
                obj = toExchangeLis[n].Object;
                if(obj) {
                    exchangeItems[obj.type] = obj.quantity;
                    exchangeTotal += obj.quantity;
                }
            }
            
            data.donation = donateItems;

            if(donateTotal == 0) {
                Dom.get("embassyStashMessage").innerHTML = "Must add items to donate to Stash.";
            }
            else if(exchangeTotal > 0 && this.stash.exchanges_remaining_today <= 0) {
                Dom.get("embassyStashMessage").innerHTML = 'You have already used up the amount of stash exchanges you can perform in a single day.';
            }
            else if(exchangeTotal > 0 && donateTotal > this.stash.max_exchange_size) {
                Dom.get("embassyStashMessage").innerHTML = ['You are only able to transfer ', this.stash.max_exchange_size, ' resources from the stash.'].join('');
            }
            else if(exchangeTotal > 0 && donateTotal != exchangeTotal) {
                Dom.get("embassyStashMessage").innerHTML = 'Total amount of resources transfered from stash must be equal to the amount donating.';
            }
            else {
            
                if(exchangeTotal > 0) {
                    data.request = exchangeItems;
                    serviceFunc = this.service.exchange_with_stash;
                }
                else {
                    serviceFunc = this.service.donate_to_stash;
                }
            
                Dom.get("embassyStashMessage").innerHTML = "";
                require('js/actions/menu/loader').show();
                serviceFunc(data, {
                    success : function(o){
                        this.rpcSuccess(o);
                        var n;
                        
                        for(n=0; n<toDonateLis.length; n++) {
                            if(toDonateLis[n].Object) {
                                Event.purgeElement(toDonateLis[n]);
                                toDonateLis[n].parentNode.removeChild(toDonateLis[n]);
                            }
                        }
                        for(n=0; n<toExchangeLis.length; n++) {
                            if(toExchangeLis[n].Object) {
                                Event.purgeElement(toExchangeLis[n]);
                                toExchangeLis[n].parentNode.removeChild(toExchangeLis[n]);
                            }
                        }
                        Dom.get("embassyTotalDonate").innerHTML = "0";
                        Dom.get("embassyTotalExchange").innerHTML = "0";
                        
                        Dom.get("embassyStashMessage").innerHTML = "Successfully donated. ";
                        Lib.fadeOutElm("embassyStashMessage");
                        
                        delete o.result.status;
                        this.stash = o.result;
                        this.StashPopulate();
                        
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        
        //Create
        CreateAlliance : function() {
            var data = {
                session_id: Game.GetSession(""),
                building_id: this.building.id,
                name: Dom.get("embassyCreateName").value
            };
            
            if(!data.name || data.name.length == 0) {
                Dom.get("embassyCreateMessage").innerHTML = "Must enter a name.";
            }
            else {
                this.service.create_alliance(data, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.CreateAlliance.success");
                        this.rpcSuccess(o);
                        this.alliance = o.result.alliance;
                        this.isLeader = this.alliance && this.alliance.leader_id == Game.EmpireData.id;
                        Dom.get("embassyCreateMessage").innerHTML = "";
                        Dom.get("embassyCreateName").value = "";
                        this.addTab(this._getAllianceTab());
                        this.addTab(this._getMemberTab());
                        this.addTab(this._getSendTab());
                        this.removeTab(this.createTab);
                        this.MembersPopulate();
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        
        //View Invites
        getInvites : function(e) {
            if(e.newValue) {
                require('js/actions/menu/loader').show();
                this.service.get_my_invites({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.get_my_invites.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        this.invites = o.result.invites;
                        
                        this.InvitesPopulate();
                    },
                    scope:this
                });
            }
        },
        InvitesPopulate : function() {
            var details = Dom.get("embassyInvitesDetails");
            if(details) {
                var invites = this.invites,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                                
                for(var i=0; i<invites.length; i++) {
                    var obj = invites[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.Invite = obj;
                    Dom.addClass(nUl, "embassyInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyAlliance");
                    nLi.innerHTML = obj.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = "Accept";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.InvitesAccept, {Self:this,Invite:obj,Line:nUl}, true);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyAction");
                    bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = "Reject";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.InvitesReject, {Self:this,Invite:obj,Line:nUl}, true);
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyMessage");
                    nLi.innerHTML = 'Reason:<input type="text" class="embassyActionMessage" />';
                    nUl.appendChild(nLi);
                                
                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 170;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        InvitesAccept : function() {
            if(confirm(['Are you sure you want to accept the alliance invite from ', this.Invite.name,'?'].join(''))) {
                this.Self.service.accept_invite({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    invite_id:this.Invite.id,
                    message:(Sel.query('.embassyActionMessage', this.Line, true).value || "")
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.accept_invite.success");
                        this.Self.rpcSuccess(o);
                        var arr = this.Self.invites;
                        for(var i=0; i<arr.length; i++) {
                            if(arr[i].id == this.Invite.id) {
                                arr.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        
                        this.Self.alliance = o.result.alliance;
                        this.Self.isLeader = this.Self.alliance && this.Self.alliance.leader_id == Game.EmpireData.id;
                        this.Self.addTab(this.Self._getAllianceTab());
                        this.Self.addTab(this.Self._getMemberTab());
                        this.Self.removeTab(this.Self.createTab);
                        this.Self.MembersPopulate();
                        
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        InvitesReject : function() {
            if(confirm(['Are you sure you want to reject the alliance invite from ', this.Invite.name,'?'].join(''))) {                
                this.Self.service.reject_invite({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    invite_id:this.Invite.id,
                    message:(Sel.query('.embassyActionMessage', this.Line, true).value || "")
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.reject_invite.success");
                        this.Self.rpcSuccess(o);
                        var arr = this.Self.invites;
                        for(var i=0; i<arr.length; i++) {
                            if(arr[i].id == this.Invite.id) {
                                arr.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },

        //Alliance Admin
        UpdateAlliance : function() {
            this.service.update_alliance({
                session_id:Game.GetSession(""),
                building_id:this.building.id,
                params: {
                    description:Dom.get("embassyAllianceDesc").value,
                    forum_uri:Dom.get("embassyAllianceForums").value,
                    announcements:Dom.get("embassyAllianceAnnoucements").value
                }
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Embassy.update_alliance.success");
                    this.rpcSuccess(o);
                    Dom.get("embassyAllianceMessage").innerHTML = "Updated alliance info.";
                    var a = new Util.Anim(Dom.get("embassyAllianceMessage"), {opacity:{from:1,to:0}}, 3);
                    a.onComplete.subscribe(function(){
                        Dom.get("embassyAllianceMessage").innerHTML = "";
                        Dom.setStyle("embassyAllianceMessage", "opacity", 1);
                    });
                    a.animate();
                    require('js/actions/menu/loader').hide();
                },
                scope:this
            });
        },
        LeaveAlliance : function() {
            if(confirm(['Are you sure you want to leave ', this.alliance.name,'?'].join(''))) {
                this.service.leave_alliance({
                    session_id:Game.GetSession(""),
                    building_id:this.building.id,
                    message:Dom.get("embassyAllianceLeaveReason").value
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.leave_alliance.success");
                        this.rpcSuccess(o);
                        delete this.alliance;
                        this.removeTab(this.allianceTab);
                        this.removeTab(this.memberTab);
                        if(this.sendTab) {
                            this.removeTab(this.sendTab);
                        }
                        this.addTab(this._getCreateTab());
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        DissolveAlliance : function() {
            if(confirm(['All Space Stations will be abandoned. Are you sure you want to dissolve ', this.alliance.name,'?'].join(''))) {
                this.service.dissolve_alliance({
                    session_id:Game.GetSession(""),
                    building_id:this.building.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.dissolve_alliance.success");
                        this.rpcSuccess(o);
                        delete this.alliance;
                        this.removeTab(this.allianceTab);
                        this.removeTab(this.memberTab);
                        if(this.sendTab) {
                            this.removeTab(this.sendTab);
                        }
                        this.addTab(this._getCreateTab());
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        
        //Alliance Inviting
        getPendingInvites : function(e) {
            if(e.newValue) {
                if(!this.embassySendTo){
                    this._createSendToSelect();
                }
                    
                require('js/actions/menu/loader').show();
                this.service.get_pending_invites({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.get_pending_invites.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        
                        this.pendingInvites = o.result.invites;
                        
                        this.PendingPopulate();
                    },
                    scope:this
                });
            }
        },
        PendingPopulate : function() {
            var details = Dom.get("embassySendDetails");
            if(details) {
                var pendingInvites = this.pendingInvites,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                                
                for(var i=0; i<pendingInvites.length; i++) {
                    var obj = pendingInvites[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.Invite = obj;
                    Dom.addClass(nUl, "embassyInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyEmpire");
                    nLi.innerHTML = obj.name;
                    nUl.appendChild(nLi);

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyAction");
                    var bbtn = document.createElement("button");
                    bbtn.setAttribute("type", "button");
                    bbtn.innerHTML = "Withdraw";
                    bbtn = nLi.appendChild(bbtn);
                    Event.on(bbtn, "click", this.PendingWithdraw, {Self:this,Invite:obj,Line:nUl}, true);
                    nUl.appendChild(nLi);
                    
                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyMessage");
                    nLi.innerHTML = '<label>Reason:</label><input type="text" class="embassyPendingActionMessage" />';
                    nUl.appendChild(nLi);
                                
                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 290;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        PendingWithdraw : function() {
            if(confirm(['Are you sure you want to withdraw the invite from ', this.Invite.name].join(''))) {
                this.Self.service.withdraw_invite({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    invite_id:this.Invite.id,
                    message:(Sel.query('.embassyPendingActionMessage', this.Line, true).value || "")
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.withdraw_invite.success");
                        this.Self.rpcSuccess(o);
                        var arr = this.Self.pendingInvites;
                        for(var i=0; i<arr.length; i++) {
                            if(arr[i].id == this.Invite.id) {
                                arr.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        SendInvite : function(){
            var inviteeId = this.embassySendTo._oTblSingleSelection && this.embassySendTo._oTblSingleSelection.Object.id || null;
            
            if(inviteeId) {
                this.service.send_invite({
                    session_id:Game.GetSession(""),
                    building_id:this.building.id,
                    invitee_id:inviteeId,
                    message:Dom.get("embassySendMessage").value
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.send_invite.success");
                        this.rpcSuccess(o);
                        
                        this.embassySendTo.ResetSelections();
                        Dom.get("embassySendMessage").value = "";
                        this.getPendingInvites({newValue:1});
                        
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        
        //Members 
        MembersPopulate : function() {
            var details = Dom.get("embassyMemberDetails");
            if(details && this.alliance) {
                var members = this.alliance.members,
                    ul = document.createElement("ul"),
                    li = document.createElement("li");
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                                
                for(var i=0; i<members.length; i++) {
                    var obj = members[i],
                        nUl = ul.cloneNode(false),
                        nLi = li.cloneNode(false);
                        
                    nUl.Member = obj;
                    Dom.addClass(nUl, "embassyInfo");
                    Dom.addClass(nUl, "clearafter");

                    nLi = li.cloneNode(false);
                    Dom.addClass(nLi,"embassyEmpire");
                    nLi.innerHTML = obj.name;
                    Event.on(nLi, "click", this.EmpireInfo, obj.empire_id);
                    nUl.appendChild(nLi);

                    if(this.isLeader && this.alliance.leader_id != obj.empire_id) {
                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"embassyAction");
                        var lbtn = document.createElement("button");
                        lbtn.setAttribute("type", "button");
                        lbtn.innerHTML = "Make Leader";
                        lbtn = nLi.appendChild(lbtn);
                        Event.on(lbtn, "click", this.MembersPromote, {Self:this,Member:obj,Line:nUl}, true);
                        var bbtn = document.createElement("button");
                        bbtn.setAttribute("type", "button");
                        bbtn.innerHTML = "Expel";
                        bbtn = nLi.appendChild(bbtn);
                        Event.on(bbtn, "click", this.MembersExpel, {Self:this,Member:obj,Line:nUl}, true);
                        nUl.appendChild(nLi);

                        nLi = li.cloneNode(false);
                        Dom.addClass(nLi,"embassyMessage");
                        nLi.innerHTML = '<label>Reason:</label><input type="text" class="embassyMembersMessage" />';
                        nUl.appendChild(nLi);
                    }
                                
                    details.appendChild(nUl);
                    
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 170;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        EmpireInfo : function(e, id) {
            Lacuna.Info.Empire.Load(id);
        },
        MembersExpel : function() {
            if(confirm(['Are you sure you want to expel ', this.Member.name,' from the alliance?'].join(''))) {
                this.Self.service.expel_member({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    empire_id:this.Member.empire_id,
                    message:(Sel.query('.embassyMembersMessage', this.Line, true).value || "")
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.expel_member.success");
                        this.Self.rpcSuccess(o);
                        this.Self.alliance = o.result.alliance;
                        this.Self.MembersPopulate();
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
            }
        },
        MembersPromote: function() {
            if(confirm(['Are you sure you want to transfer alliance control to ', this.Member.name,'?'].join(''))) {
                this.Self.service.assign_alliance_leader({
                    session_id:Game.GetSession(""),
                    building_id:this.Self.building.id,
                    new_leader_id:this.Member.empire_id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Embassy.assign_alliance_leader.success");
                        this.Self.rpcSuccess(o);
                        this.Self.alliance = o.result.alliance;
                        this.Self.isLeader = this.Self.alliance && this.Self.alliance.leader_id == Game.EmpireData.id;
                        this.Self.removeTab(this.Self.allianceTab);
                        this.Self.addTab(this.Self._getAllianceTab());
                        this.Self.removeTab(this.Self.memberTab);
                        this.Self.addTab(this.Self._getMemberTab());
                        this.Self.MembersPopulate();
                        this.Self.removeTab(this.Self.invitesTab);
                        this.Self.addTab(this.Self._getInvitesTab());
                        this.Self.removeTab(this.Self.sendTab);
                        require('js/actions/menu/loader').hide();
                    },
                    scope:this
                });
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
            if(prop.status == "Passed" || prop.status == "Failed") {
                return ['<div style="margin-bottom:2px;">',
                    '<div class="yui-gb">',
                    '    <div class="yui-u first"><label>',prop.name,'</label></div>',
                    '    <div class="yui-u">Proposed by <a class="profile_link" href="#',prop.proposed_by.id,'">',prop.proposed_by.name,'</a></div>',
                    '    <div class="yui-u"><label>',prop.status,'</label></div>',
                    '</div>',
                    '<div class="yui-gc">',
                    '    <div class="yui-u first"><div class="propDesc">',this.formatBody(prop.description),'</div></div>',
                    '    <div class="yui-u"><div class="propMyVote">',this.PropVoteDetails(prop),'</div></div>',
                    '</div>',
                    '<table style="width:100%"><col style="width:25%;text-align:center;"><col style="width:25%;text-align:center;"><col style="width:25%;text-align:center;">',
                    '<tr><th>Needed</th><th>Yes</th><th>No</th></tr>',
                    '<tr><td>',prop.votes_needed,'</td><td>',prop.votes_yes,'</td><td>',prop.votes_no,'</td></tr>',
                    '</table>',
                    '</div>'].join('');

            }
            else {
                return ['<div style="margin-bottom:2px;">',
                    '<div class="yui-gb">',
                    '    <div class="yui-u first"><label>',prop.name,'</label></div>',
                    '    <div class="yui-u">Proposed by <a class="profile_link" href="#',prop.proposed_by.id,'">',prop.proposed_by.name,'</a></div>',
                    '    <div class="yui-u">',prop.status,': <span class="propTime">',Lib.formatTime(sec),'</span></div>',
                    '</div>',
                    '<div class="yui-gc">',
                    '    <div class="yui-u first"><div class="propDesc">',this.formatBody(prop.description),'</div></div>',
                    '    <div class="yui-u"><div class="propMyVote">',this.PropVoteDetails(prop),'</div></div>',
                    '</div>',
                    '<table style="width:100%"><col style="width:25%;text-align:center;"><col style="width:25%;text-align:center;"><col style="width:25%;text-align:center;">',
                    '<tr><th>Needed</th><th>Yes</th><th>No</th></tr>',
                    '<tr><td>',prop.votes_needed,'</td><td>',prop.votes_yes,'</td><td>',prop.votes_no,'</td></tr>',
                    '</table>',
                    '</div>'].join('');
            }
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
            var el = Sel.query("span.propTime",elLine,true);
            if(el) {
                el.innerHTML = arrTime;
            }
            else {
                return true;
            }
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
    
    Lacuna.buildings.Embassy = Embassy;

})();
YAHOO.register("embassy", YAHOO.lacuna.buildings.Embassy, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
