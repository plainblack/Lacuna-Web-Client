YAHOO.namespace("lacuna");

var ServerClockActions = require('js/actions/window/serverClock');

var _ = require('lodash');


if (typeof YAHOO.lacuna.Info == "undefined" || !YAHOO.lacuna.Info) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Alliance = function(){
        this.id = "infoAlliance";
    };
    Alliance.prototype = {
        _createPanel : function() {
            if(!this.Panel) {
                var container = document.createElement("div");
                container.id = this.id;
                Dom.addClass(container, Lib.Styles.HIDDEN);
                container.innerHTML = this._getHtml();
                document.body.insertBefore(container, document.body.firstChild);

                this.Panel = new YAHOO.widget.Panel(this.id, {
                    constraintoviewport:true,
                    visible:false,
                    draggable:true,
                    effect:Game.GetContainerEffect(),
                    underlay:false,
                    modal:false,
                    fixedcenter:true,
                    close:true,
                    width:"450px",
                    zIndex:9999
                });
                this.Panel.renderEvent.subscribe(function(){
                    this.name = Dom.get(this.id+'Name');
                    this.desc = Dom.get(this.id+'Desc');
                    this.founded = Dom.get(this.id+'Founded');
                    this.leader = Dom.get(this.id+'Leader');
                    this.memberList = Dom.get(this.id+'Members');
                    this.memberCount = Dom.get(this.id+'MemberCount');

                    Event.delegate(this.memberList, "click", this.EmpireInfo, "a.profile_link", this, true);

                    Dom.removeClass(this.id, Lib.Styles.HIDDEN);
                }, this, true);
                this.Panel.render();
                Game.OverlayManager.register(this.Panel);
            }
        },
        _getHtml : function() {
            return [
            '    <div class="hd">Alliance</div>',
            '    <div class="bd">',
            '        <ul>',
            '            <li><label>Name:</label><span id="',this.id,'Name"></span></li>',
            '            <li><label>Description:</label><span id="',this.id,'Desc"></span></li>',
            '            <li><label>Founded:</label><span id="',this.id,'Founded"></span></li>',
            '            <li><label>Leader:</label><span id="',this.id,'Leader"></span></li>',
            '        </ul>',
            '        <div style="height:200px;overflow:auto;">',
            '            <p style="border-bottom:1px solid #52ACFF;"><label>Members:</label><span id="',this.id,'MemberCount"></span></p>',
            '            <ul id="',this.id,'Members">',
            '            </ul>',
            '        </div>',
            '    </div>',
            '    <div class="ft"></div>'
            ].join('');
        },
        Load : function(allianceId) {
            this._createPanel();

            require('js/actions/menu/loader').show();
            Game.Services.Alliance.view_profile({session_id:Game.GetSession(""),alliance_id:allianceId},{
                success:function(o){
                    require('js/actions/menu/loader').hide();
                    //show now so there is a bit quicker response
                    this.Panel.show();
                    this.Panel.bringToTop();

                    var profile = o.result.profile;
                    this.name.innerHTML = profile.name;
                    this.desc.innerHTML = profile.description;
                    this.founded.innerHTML = Lib.formatServerDate(profile.date_created);
                    this.memberCount.innerHTML = profile.members.length;

                    var memberArray = ['<li style="border-bottom:1px solid #52ACFF;"><label>Num</label><label>Name</label></li>'];
                    for(var m=0; m<profile.members.length; m++) {
                        var member = profile.members[m];
                        if(member.id == profile.leader_id) {
                            this.leader.innerHTML = member.name;
                        }
                        memberArray = memberArray.concat(['<li><label>',m+1,'</label><a class="profile_link" style="text-decoration:underline;cursor:pointer;" href="#',member.id,'">',member.name,'</a></li>']);
                    }

                    this.memberList.innerHTML = memberArray.join('');
                },
                scope:this
            });
        },
        EmpireInfo : function(e, el) {
            Event.stopEvent(e);
            var res = el.href.match(/\#(\d+)$/);
            Lacuna.Info.Empire.Load(res[1]);
        }
    };

    var Empire = function(){
        this.id = "infoEmpire";
    };
    Empire.prototype = {
        _createPanel : function() {
            if(!this.Panel) {
                var container = document.createElement("div");
                container.id = this.id;
                Dom.addClass(container, Lib.Styles.HIDDEN);
                container.innerHTML = this._getHtml();
                document.body.insertBefore(container, document.body.firstChild);

                this.Panel = new YAHOO.widget.Dialog(this.id, {
                    constraintoviewport:true,
                    visible:false,
                    draggable:true,
                    postmethod:"none",
                    buttons:[{ text:"Send Message", handler:{fn:this.sendMessage, scope:this}, isDefault:true }],
                    effect:Game.GetContainerEffect(),
                    underlay:false,
                    modal:false,
                    fixedcenter:true,
                    close:true,
                    width:"450px",
                    zIndex:9999
                });
                this.Panel.renderEvent.subscribe(function(){
                    this.empire = Dom.get(this.id+"Empire");
                    this.status = Dom.get(this.id+"Status");
                    this.desc = Dom.get(this.id+"Desc");
                    this.species = Dom.get(this.id+"Species");
                    this.alliance = Dom.get(this.id+"Alliance");
                    this.colonyCount = Dom.get(this.id+"ColonyCount");
                    this.founded = Dom.get(this.id+"Founded");
                    this.login = Dom.get(this.id+"Login");

                    this.coloniesList = Dom.get(this.id+"ColoniesList");

                    this.medalsList = Dom.get(this.id+"MedalsList");

                    this.playerName = Dom.get(this.id+"PlayerName");
                    this.city = Dom.get(this.id+"City");
                    this.country = Dom.get(this.id+"Country");
                    this.skype = Dom.get(this.id+"Skype");

                    this.tabView = new YAHOO.widget.TabView(this.id+"Tabs");
                    this.tabView.set('activeIndex',0);
                    Dom.removeClass(this.id, Lib.Styles.HIDDEN);
                }, this, true);
                this.Panel.hideEvent.subscribe(function(){
                    delete this.currentEmpire;
                }, this, true);
                this.Panel.render();
                Game.OverlayManager.register(this.Panel);
            }
        },
        _getHtml : function() {
            var Ht = Game.GetSize().h - 140;
            if(Ht > 300) { Ht = 300; }
            return [
            '    <div class="hd">Empire</div>',
            '    <div class="bd">',
            '        <div id="',this.id,'Tabs" class="yui-navset">',
            '            <ul class="yui-nav">',
            '                <li><a href="#"><em>Empire</em></a></li>',
            '                <li><a href="#"><em>Known Colonies</em></a></li>',
            '                <li><a href="#"><em>Medals</em></a></li>',
            '                <li><a href="#"><em>Player</em></a></li>',
            '            </ul>',
            '            <div class="yui-content" style="padding:0;">',
            '                <div>',
            '                    <ul>',
            '                        <li><label>Empire:</label><span id="',this.id,'Empire"></span></li>',
            '                        <li><label>Status:</label><span id="',this.id,'Status"></span></li>',
            '                        <li><label>Description:</label><span id="',this.id,'Desc"></span></li>',
            '                        <li><label>Species:</label><span id="',this.id,'Species"></span></li>',
            '                        <li><label>Alliance:</label><span id="',this.id,'Alliance" style="text-decoration:underline;cursor:pointer;"></span></li>',
            '                        <li><label>Colonies:</label><span id="',this.id,'ColonyCount"></span></li>',
            '                        <li><label>Founded:</label><span id="',this.id,'Founded"></span></li>',
            '                        <li><label>Last Login:</label><span id="',this.id,'Login"></span></li>',
            '                </div>',
            '                <div>',
            '                    <ul id="',this.id,'ColoniesList" style="height:',Ht,'px;width:425px;overflow:auto;">',
            '                    </ul>',
            '                </div>',
            '                <div>',
            '                    <ul id="',this.id,'MedalsList" style="height:',Ht,'px;width:425px;overflow:auto;">',
            '                    </ul>',
            '                </div>',
            '                <div>',
            '                    <ul>',
            '                        <li><label>Name:</label><span id="',this.id,'PlayerName"></span></li>',
            '                        <li><label>City:</label><span id="',this.id,'City"></span></li>',
            '                        <li><label>Country:</label><span id="',this.id,'Country"></span></li>',
            '                        <li><label>Skype:</label><span id="',this.id,'Skype"></span></li>',
            '                    </ul>',
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="ft"></div>'
            ].join('');
        },
        Load : function(empireId) {
            this._createPanel();

            require('js/actions/menu/loader').show();
            Game.Services.Empire.view_public_profile({session_id:Game.GetSession(""),empire_id:empireId},{
                success:function(o){
                    require('js/actions/menu/loader').hide();
                    var profile = o.result.profile;
                    this.currentEmpire = profile;
                    this.empire.innerHTML = profile.name;
                    this.status.innerHTML = profile.status_message;
                    this.desc.innerHTML = profile.description;
                    this.species.innerHTML = profile.species;
                    this.alliance.innerHTML = profile.alliance ? profile.alliance.name : '';
                    this.colonyCount.innerHTML = profile.colony_count;
                    this.founded.innerHTML = Lib.formatServerDate(profile.date_founded);
                    this.login.innerHTML = Lib.formatServerDate(profile.last_login);

                    //show now so there is a bit quicker response
                    this.Panel.show();
                    this.Panel.bringToTop();

                    this.playerName.innerHTML = profile.player_name;
                    this.city.innerHTML = profile.city;
                    this.country.innerHTML = profile.country;
                    this.skype.innerHTML = profile.skype ? ['<a href="callto:',profile.skype,'">',profile.skype,'</a>'].join('') : '';

                    var medalArray = [];
                    for(var medalId in profile.medals) {
                        var medal = profile.medals[medalId];
                        medalArray = medalArray.concat(['<li class="medal">',
                        '    <div class="medalContainer">',
                        '        <img src="',Lib.AssetUrl,'medal/',medal.image,'.png" alt="',medal.name,'" title="',medal.name,' on ',Lib.formatServerDate(medal.date),'" />',
                        '    </div>',
                        '</li>'
                        ]);
                    }
                    this.medalsList.innerHTML = medalArray.join('');

                    var colonyArray = [];
                    for(var colonyId in profile.known_colonies) {
                        var colony = profile.known_colonies[colonyId];
                        var homeworldclass = colony.homeworld ? " homeworld-highlight" : ""
                        colonyArray = colonyArray.concat(['<li>',
                        '    <div class="planetContainer yui-gf">',
                        '        <div class="yui-u first planetImage" style="background-color:black;">',
                        '            <img src="',Lib.AssetUrl,'star_system/',colony.image,'.png" alt="',colony.name,'" style="width:50px;height:50px;" />',
                        '        </div>',
                        '        <div class="yui-u', homeworldclass, '">',
                        '            <div>',colony.name,'</div>',
                        '            <div>',colony.x,' : ',colony.y,'</div>',
                        '        </div>',
                        '    </div>',
                        '</li>'
                        ]);
                    }
                    this.coloniesList.innerHTML = colonyArray.join('');

                    if(profile.alliance) {
                        Event.on(this.id+'Alliance', "click", function(e, id){
                            Lacuna.Info.Alliance.Load(id);
                        }, profile.alliance.id);
                    }
                    else {
                        Event.removeListener(this.id+'Alliance', "click");
                    }
                },
                scope:this
            });
        },
        sendMessage : function(e) {
            Event.stopEvent(e);
            if(this.currentEmpire) {
                Lacuna.Messaging.sendTo(this.currentEmpire.name);
            }
        }
    };

    var Clock = function(){
        this.id = "infoClock";
    };
    Clock.prototype = {
        build: _.once(function() {
            var container = document.createElement("div");
            container.id = "clock";
            Dom.addClass(container, Lib.Styles.HIDDEN);
            Dom.addClass(container, "nofooter");
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);

            this.Display = new YAHOO.widget.Panel("clock", {
                constraintoviewport:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                close:true,
                underlay:false,
                modal:false,
                width:"300px",
                context:["footer","bl","tl", ["beforeShow"], [0,-40]],
                zIndex: 10000
            });
            this.Display.renderEvent.subscribe(function(){
                Dom.removeClass("clock", Lib.Styles.HIDDEN);
                this.clock = Dom.get("clockDisplay");
            });
            this.Display.showEvent.subscribe(function(){
                this.Display.bringToTop();
                Game.onTick.subscribe(this._updating, this.Display, true);
            }, this, true);
            this.Display.hideEvent.subscribe(function(){
                Game.onTick.unsubscribe(this._updating);

                // Let the React stuff know that we're going away now. :D
                ServerClockActions.hide();
            }, this, true);
            this.Display.render();
        }),
        _getHtml : function() {
            return [
            '    <div class="hd">Server Clock</div>',
            '    <div class="bd">',
            '        <div id="clockDisplay"></div>',
            '    </div>'
            ].join('');
        },
        _updating : function() {
            this.clock.innerHTML = Lacuna.Game.ServerData.time.toUTCString(); //Lib.formatUTC(Lacuna.Game.ServerData.time);
        },
        Show : function() {
            this.build();
            this.Display.show();
        },
        Hide : function() {
            if(this.Display) {
                this.Display.hide();
            }
        }
    };


    YAHOO.lacuna.Info = {
        Alliance: new Alliance(),
        Empire: new Empire(),
        Clock: new Clock()
    };

})();
YAHOO.register("info", YAHOO.lacuna.Info, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
