YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Park == "undefined" || !YAHOO.lacuna.buildings.Park) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Park = function(result){
        Park.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Park;
    };
    
    Lang.extend(Park, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getPartyTab()];
        },
        _getPartyTab : function() {
            var div = document.createElement("div");
            if(this.result.party.can_throw) {
                div.appendChild(this.PartyGetDisplay());
            }
            else if(this.result.party.seconds_remaining*1 > 0) {
                div.innerHTML = [].join('');
                div.appendChild(this.PartyGetTimeDisplay(this.result.party));
                this.addQueue(this.result.party.seconds_remaining, this.PartyQueue, "partyTime");
            }
            else {
                div.innerHTML = '<p>You need at least 10,000 food to throw a party.</p>';
            }
            this.partyTab = new YAHOO.widget.Tab({ label: "Party", contentEl: div});
            return this.partyTab;
        },
        Party : function(e) {
            require('js/actions/menu/loader').show();
            
            this.service.throw_a_party({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Park.Party.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    //this.work = o.result.building.work;
                    //this.updateBuildingTile(o.result.building);
                    
                    this.UpdatePartyTab(o.result.party);
                },
                scope:this
            });    
        },
        UpdatePartyTab : function(party) {
            if(this.partyTab) {
                var ce = this.partyTab.get("contentEl");
                Event.purgeElement(ce);
                ce.innerHTML = "";
                if(this.work && this.work.seconds_remaining && this.work.seconds_remaining*1 > 0) {
                    ce.appendChild(this.PartyGetTimeDisplay(party));
                    this.addQueue(this.work.seconds_remaining, this.PartyQueue, "partyTime");
                }
                else if(party && party.can_throw) {
                    ce.appendChild(this.PartyGetDisplay());
                }
                else {
                    ce.innerHTML = "<p>You need at least 10,000 food to throw a party.</p>";
                }
            }
        },
        PartyGetDisplay : function() {
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "Throw Party!";
            Event.on(btn, "click", this.Party, this, true);
            return btn;
        },
        PartyGetTimeDisplay : function(party) {
            var ul = document.createElement("ul");
            ul.innerHTML = ['<li>You will get ',Lib.formatNumber(party.happiness),' happiness from your party!</li>',
                '<li>Party time remaining: <span id="partyTime">',Lib.formatTime(party.seconds_remaining),'</span></li>',
                '<li>You may subsidize the party for 2 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" />.</li>',
                '<li><button type="button" id="parkSubsidize">Subsidize</button></li>'].join('');
            Event.on("parkSubsidize", "click", this.Subsidize, this, true);
            return ul;
        },
        PartyQueue : function(remaining, el){
            if(remaining <= 0) {
                var span = Dom.get(el),
                    p = span.parentNode;
                p.removeChild(span);
                p.innerHTML = "No Parties being thrown.";
            }
            else {
                Dom.get(el).innerHTML = Lib.formatTime(Math.round(remaining));
            }
        },
        Subsidize : function(e) {
            require('js/actions/menu/loader').show();
            Dom.get("parkSubsidize").disabled = true;
            
            this.service.subsidize_party({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);

                    //delete this.work;
                    //this.updateBuildingTile(o.result.building);
                    this.resetQueue();
                    
                    this.UpdatePartyTab(o.result.party);
                },
                failure : function(o){
                    Dom.get("parkSubsidize").disabled = false;
                },
                scope:this
            });
        }
        
    });
    
    YAHOO.lacuna.buildings.Park = Park;

})();
YAHOO.register("park", YAHOO.lacuna.buildings.Park, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
