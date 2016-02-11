YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.MissionCommand == "undefined" || !YAHOO.lacuna.buildings.MissionCommand) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var MissionCommand = function(result){
        MissionCommand.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.MissionCommand;
    };
    
    Lang.extend(MissionCommand, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getMissionTab()];
        },
        _getMissionTab : function() {
            this.missionTab = new YAHOO.widget.Tab({ label: "Missions", content: [
                '<div>',
                '    <div class="missionsHeader"></div>',
                '    <div id="missionsHt" style="overflow:auto;">',
                '        <ul id="missionsAvailable">',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
            this.missionTab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    this.getMissions();
                    var mHt = Game.GetSize().h - 150;
                    if(mHt > 300) { mHt = 300; }
                    Dom.setStyle(Dom.get('missionsHt'), 'height', mHt + 'px');
                }
            }, this, true);
            return this.missionTab;
        },
        getMissions : function() {
            if(!this.missions) {
                require('js/actions/menu/loader').show();
                this.service.get_missions({session_id:Game.GetSession(),building_id:this.building.id}, {
                    success : function(o){
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        this.missions = o.result.missions;
                        this.displayMissions();
                    },
                    scope:this
                });
            }
            else {
                this.displayMissions();
            }
        },
        displayMissions : function() {
            var missions = this.missions,
                ul = Dom.get("missionsAvailable");

            if(ul) {
                var ulParent = ul.parentNode,
                    li = document.createElement("li");
                    
                ul = ulParent.removeChild(ul);
                ul.innerHTML = "";
                /*
                {
                    "id" : "id-goes-here",
                    "max_university_level" : 12,
                    "date_posted" : "01 31 2010 13:09:05 +0600",
                    "name" : "The Big Mission",
                    "description" : "Do the big thing and make it go.",
                    "objectives" : [
                      "1500 apple",
                      "Kill a spy",
                      "Destroy a ship"
                    ],
                    "rewards" : [
                        "1 essentia"
                    ]
                }
                */
                if(missions && missions.length > 0) {
                    for(var i=0; i<missions.length; i++) {
                        var ms = missions[i],
                            nLi = li.cloneNode(false);
                        Dom.addClass(nLi, "mission");
                        nLi.innerHTML = ['<div class="yui-ge">',
                        '    <div class="yui-u first">',
                        '        <div class="missionName">',ms.name,'</div>',
                        '        <span style="float:right">Mission ID: ',ms.id,'</span>',
                        '        <div class="missionPosted">Posted: ',Lib.formatServerDate(ms.date_posted),'</div>',
                        '        <div class="missionUniversity">Max University: ',ms.max_university_level,'</div>',
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <button type="button" id="complete',ms.id,'" class="missionComplete">Complete</button>',
                        '        <button type="button" id="skip',ms.id,'" class="missionSkip">Skip</button>',
                        '    </div>',
                        '</div>',
                        '<div class="missionDesc">',ms.description,'</div>',
                        '<div class="yui-g">',
                        '    <div class="yui-u first">',
                        '        <div><label style="font-weight:bold;">Objectives:</label></div>',
                        this.parseObjectives(ms.objectives),
                        '    </div>',
                        '    <div class="yui-u">',
                        '        <div><label style="font-weight:bold;">Rewards:</label></div>',
                        this.parseRewards(ms.rewards),
                        '    </div>',
                        '</div>'].join('');
                        Event.on(Sel.query("button.missionComplete", nLi, true), "click", this.completeMission, {Self:this,Mission:ms,Line:nLi}, true);
                        Event.on(Sel.query("button.missionSkip", nLi, true), "click", this.skipMission, {Self:this,Mission:ms,Line:nLi}, true);

                        ul.appendChild(nLi);
                    }
                }
                //add child back in
                ulParent.appendChild(ul);
            }
        },
        parseObjectives : function(arr) {
            var lst = ['<ol class="missionList">'];
            for(var n=0; n<arr.length; n++) {
                lst[lst.length] = '<li>';
                lst[lst.length] = arr[n];
                lst[lst.length] = '</li>';
            }
            lst[lst.length] = '</ol>';
            return lst.join('');
        },
        parseRewards : function(arr) {
            var lst = ['<ol class="missionList">'];
            for(var n=0; n<arr.length; n++) {
                lst[lst.length] = '<li>';
                lst[lst.length] = arr[n];
                lst[lst.length] = '</li>';
            }
            lst[lst.length] = '</ol>';
            return lst.join('');
        },
        completeMission : function() {
            var btn = Dom.get('complete'+this.Mission.id);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            this.Self.service.complete_mission({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                mission_id:this.Mission.id
            }, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);

                    this.Self.missions = undefined;
                    this.Self.getMissions();
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        skipMission : function() {
            var btn = Dom.get('skip'+this.Mission.id);
            btn.disabled = true;
            require('js/actions/menu/loader').show();
            this.Self.service.skip_mission({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                mission_id:this.Mission.id
            }, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);

                    this.Self.missions = undefined;
                    this.Self.getMissions();
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        }
    });
    
    YAHOO.lacuna.buildings.MissionCommand = MissionCommand;

})();
YAHOO.register("MissionCommand", YAHOO.lacuna.buildings.MissionCommand, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
