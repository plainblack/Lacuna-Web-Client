YAHOO.namespace("lacuna.modules");

if (typeof YAHOO.lacuna.modules.Parliament == "undefined" || !YAHOO.lacuna.modules.Parliament) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Parliament = function(result, locationId){
        Parliament.superclass.constructor.call(this, result);
        
        this.locationId = locationId;
        this.service = Game.Services.Modules.Parliament;
        
        this.canRepealLaw = this.building.level >= 5;
    };
    
    Lang.extend(Parliament, Lacuna.buildings.Building, {
        getChildTabs : function() {
            if(this.building.level >= 4) {
                return [this._getCreateTab(), this._getLawsTab(), this._getPropsTab()];
            }
            else {
                return [this._getLawsTab(), this._getPropsTab()];
            }
        },
        _getLawsTab : function() {
            var tab = new YAHOO.widget.Tab({ label: "Laws", content: [
                '<div>',
                '    <div style="overflow:auto;"><ul id="lawsDetails"></ul></div>',
                '</div>'
            ].join('')});
            tab.subscribe("activeChange", function(e) {
                if(e.newValue) {
                    if(!this.laws) {
                        require('js/actions/menu/loader').show();
                        this.service.view_laws({session_id:Game.GetSession(),body_id:this.locationId}, {
                            success : function(o){
                                require('js/actions/menu/loader').hide();
                                this.rpcSuccess(o);
                                this.laws = o.result.laws;
                                
                                this.LawsPopulate();
                            },
                            scope:this
                        });
                    }
                }
            }, this, true);
            
            Event.delegate("lawsDetails", "click", this.LawClick, "button", this, true);
            Event.delegate("lawsDetails", "click", this.handleProfileLink, "a.profile_link", this, true);
            Event.delegate("lawsDetails", "click", this.handleStarmapLink, "a.starmap_link", this, true);
            Event.delegate("lawsDetails", "click", this.handlePlanetLink, "a.planet_link", this, true);
            Event.delegate("lawsDetails", "click", this.handleAllianceLink, "a.alliance_link", this, true);
            
            return tab;
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
        _getCreateTab : function() {
            this.createEvent("onAllianceMembers");

            var opts = ['<option value="proposeWrit" selected>Writ</option>'],
                dis = [], getAllianceMembers;
            if(this.building.level >= 6) {
                opts[opts.length] = '<option value="proposeTransfer">Transfer Station Ownership</option>';
                dis[dis.length] = [
                '    <div id="proposeTransfer" class="proposeOption" style="display:none;">',
                '        <label>Empire:</label><select id="proposeTransferTo"></select><br />',
                '        <button type="button" id="proposeTransferSubmit">Propose Transfer</button>',
                '    </div>'
                ].join('');
                getAllianceMembers = true;
                this.subscribe("onLoad", function() {
                    this.subscribe("onAllianceMembers", function() {
                        var sel = Dom.get("proposeTransferTo"),
                            opts = [];
                        for(var n=0; n<this.allianceMembers.length; n++) {
                            var member = this.allianceMembers[n];
                            opts[opts.length] = '<option value="'+member.id+'">'+member.name+'</option>';
                        }
                        sel.innerHTML = opts.join('');
                        sel.selectedIndex = -1;
                    }, this, true);
                    Event.on("proposeTransferSubmit", "click", this.TransferOwner, this, true);
                }, this, true);
            }
            if(this.building.level >= 8) {
                opts[opts.length] = '<option value="proposeRenameStar">Rename Star</option>';
                dis[dis.length] = [
                '    <div id="proposeRenameStar" class="proposeOption" style="display:none;">',
                '        <ul><li><label>Star:</label><select id="proposeRenameStarSelect"></select></li>',
                '        <li><label>New Name:</label><input type="text" id="proposeRenameStarName" /></li></ul><br />',
                '        <button type="button" id="proposeRenameStarSubmit">Propose Rename Star</button>',
                '    </div>'
                ].join('');
                this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({session_id:Game.GetSession(""),building_id:this.building.id},{
                        success:function(o){
                            var el = Dom.get('proposeRenameStarSelect');
                            if(el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m=0; m<stars.length; m++) {
                                    var obj = stars[m];
                                    opts[opts.length] = '<option value="'+obj.id+'">'+obj.name+'</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope:this
                    });
                    Event.on("proposeRenameStarSubmit", "click", this.RenameStar, this, true);
                }, this, true);
            }
            if(this.building.level >= 9) {
                opts[opts.length] = '<option value="proposeBroadcast">Broadcast on Net19</option>';
                dis[dis.length] = [
                '    <div id="proposeBroadcast" class="proposeOption" style="display:none;">',
                '        <label>Message:</label><input type="text" id="proposeBroadcastMessage" maxlength="100" size="50" /><br />',
                '        <button type="button" id="proposeBroadcastSubmit">Propose Broadcast</button>',
                '    </div>'
                ].join('');
                this.subscribe("onLoad", function() {
                    Event.on("proposeBroadcastSubmit", "click", this.Broadcast, this, true);
                }, this, true);
            }
            if(this.building.level >= 10) {
                opts[opts.length] = '<option value="proposeInduct">Induct Member</option>';
                opts[opts.length] = '<option value="proposeExpel">Expel Member</option>';
                dis[dis.length] = [
                '    <div id="proposeInduct" class="proposeOption" style="display:none;">',
                '        <ul><li><label>Empire:</label><input type="text" id="proposeInductMember" /></li>',
                '        <li><label>Message:</label><textarea id="proposeInductMessage" rows="4" cols="80"></textarea></li></ul><br />',
                '        <button type="button" id="proposeInductSubmit">Propose Induct Member</button>',
                '    </div>',
                '    <div id="proposeExpel" class="proposeOption" style="display:none;">',
                '        <ul><li><label>Empire:</label><select id="proposeExpelMember"></select></li>',
                '        <li><label>Reason:</label><textarea id="proposeExpelReason" rows="4" cols="80"></textarea></li></ul><br />',
                '        <button type="button" id="proposeExpelSubmit">Propose Expel Member</button>',
                '    </div>'
                ].join('');
                getAllianceMembers = true;
                this.subscribe("onLoad", function() {
                    this.inductMemberTextboxList = this.CreateEmpireSearch("proposeInductMember");
                    Event.on("proposeInductSubmit", "click", this.MemberInduct, this, true);

                    this.subscribe("onAllianceMembers", function() {
                        var sel = Dom.get("proposeExpelMember"),
                            opts = [];
                        for(var n=0; n<this.allianceMembers.length; n++) {
                            var member = this.allianceMembers[n];
                            if(!member.isLeader && member.id != Game.EmpireData.id) {
                                opts[opts.length] = '<option value="'+member.id+'">'+member.name+'</option>';
                            }
                        }
                        sel.innerHTML = opts.join('');
                        sel.selectedIndex = -1;
                    }, this, true);
                    Event.on("proposeExpelSubmit", "click", this.MemberExpel, this, true);
                }, this, true);
            }
            if(this.building.level >= 11) {
                opts[opts.length] = '<option value="proposeElectLeader">Elect New Leader</option>';
                dis[dis.length] = [
                '    <div id="proposeElectLeader" class="proposeOption" style="display:none;">',
                '        <label>Empire:</label><select id="proposeElectLeaderMember"></select><br />',
                '        <button type="button" id="proposeElectLeaderSubmit">Propose as New Leader</button>',
                '    </div>'
                ].join('');
                getAllianceMembers = true;
                this.subscribe("onLoad", function() {
                    this.subscribe("onAllianceMembers", function() {
                        var sel = Dom.get("proposeElectLeaderMember"),
                            opts = [];
                        for(var n=0; n<this.allianceMembers.length; n++) {
                            var member = this.allianceMembers[n];
                            if(!member.isLeader && member.id != Game.EmpireData.id) {
                                opts[opts.length] = '<option value="'+member.id+'">'+member.name+'</option>';
                            }
                        }
                        sel.innerHTML = opts.join('');
                        sel.selectedIndex = -1;
                    }, this, true);
                    Event.on("proposeElectLeaderSubmit", "click", this.MemberNewLeader, this, true);
                }, this, true);
            }
            if(this.building.level >= 12) {
                opts[opts.length] = '<option value="proposeRenameAsteroid">Rename Asteroid</option>';
                dis[dis.length] = [
                '    <div id="proposeRenameAsteroid" class="proposeOption" style="display:none;">',
				'		<ul><li><label>Star:</label><select id="proposeRenameAsteroidStar"></select></li>',
                '        <li><label>Asteroid:</label><select id="proposeRenameAsteroidName"></select></li>',
                '        <li><label>Name:</label><input type="text" id="proposeRenameAsteroidNewName" /></li></ul><br />',
                '        <button type="button" id="proposeRenameAsteroidSubmit">Propose Rename Asteroid</button>',
                '    </div>'
                ].join('');

				this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({
						session_id: Game.GetSession(),
						building_id: this.building.id,
					}, {
                        success: function(o){
                            var el = Dom.get('proposeRenameAsteroidStar');
                            if (el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m = 0; m < stars.length; m++) {
                                    var obj = stars[m];
                                   	opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope: this
                    });
                }, this, true);

				Event.on('proposeRenameAsteroidStar', 'change', this.PopulateBodiesForStar, {
					starElement: 'proposeRenameAsteroidStar',
					bodyElement: 'proposeRenameAsteroidName',
					type: 'asteroid',
					Self: this}, true);

				Event.on('proposeRenameAsteroidSubmit', 'click', this.RenameAsteroid, this, true);
            }
            if(this.building.level >= 13) {
                opts[opts.length] = '<option value="proposeMembersMining">Members Only Mining Rights</option>';
                dis[dis.length] = [
                '    <div id="proposeMembersMining" class="proposeOption" style="display:none;">',
                '        Allow only members to mine on asteroids under this stations jurisdiction.<br />',
                '        <button type="button" id="proposeMembersMiningSubmit">Propose</button>',
                '    </div>'
                ].join('');
                Event.on("proposeMembersMiningSubmit", "click", this.MiningOnly, this, true);
            }
            if(this.building.level >= 14) {
				opts[opts.length] = '<option value="proposeEvictMining">Evict Mining Platform</option>';
                dis[dis.length] = [
                '    <div id="proposeEvictMining" class="proposeOption" style="display:none;">',
				'		<ul><li><label>Star:</label><select id="proposeEvictMiningStar"></select></li>',
				'		 <li><label>Body:</label><select id="proposeEvictMiningBody"></select></li>',
                '        <li><label>Empire Mining:</label><select id="proposeEvictMiningId"></select></li><br />',
                '        <button type="button" id="proposeEvictMiningSubmit">Propose Eviction</button></ul>',
                '    </div>'
                ].join('');

				this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({
						session_id: Game.GetSession(),
						building_id: this.building.id,
					},{
                        success: function(o){
                            var el = Dom.get('proposeEvictMiningStar');
                            if (el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m = 0; m < stars.length; m++) {
                                    var obj = stars[m];
                                    opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope: this
                    });
                }, this, true);

				Event.on("proposeEvictMiningStar", "change", this.PopulateBodiesForStar, {
					starElement: 'proposeEvictMiningStar',
					bodyElement: 'proposeEvictMiningBody',
					type: 'asteroid',
					Self: this}, true);
				Event.on('proposeEvictMiningBody', 'change', this.LoadMining, this, true);
				Event.on('proposeEvictMiningSubmit', 'click', this.EvictMining, this, true);

            }
            if(this.building.level >= 17) {
                opts[opts.length] = '<option value="proposeRenameUninhabited">Rename Uninhabited</option>';
                dis[dis.length] = [
                '    <div id="proposeRenameUninhabited" class="proposeOption" style="display:none;">',
				'		<ul><li><label>Star:</label><select id="proposeRenameUninhabitedStar"></select></li>',
                '        <li><label>Planet:</label><select id="proposeRenameUninhabitedName"></select></li>',
                '        <li><label>Name:</label><input type="text" id="proposeRenameUninhabitedNewName" /></li></ul><br />',
                '        <button type="button" id="proposeRenameUninhabitedSubmit">Propose Rename Uninhabited</button>',
                '    </div>'
                ].join('');

				this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({
						session_id: Game.GetSession(),
						building_id: this.building.id,
					},{
                        success: function(o){
                            var el = Dom.get('proposeRenameUninhabitedStar');
                            if (el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m = 0; m < stars.length; m++) {
                                    var obj = stars[m];
									opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope: this
                    });
                }, this, true);

				Event.on('proposeRenameUninhabitedStar', 'change', this.PopulateBodiesForStar, {
					starElement: 'proposeRenameUninhabitedStar',
					bodyElement: 'proposeRenameUninhabitedName',
					type: 'habitable planet',
					Self: this}, true);

				Event.on('proposeRenameUninhabitedSubmit', 'click', this.RenameUninhabited, this, true);
            }
            if(this.building.level >= 18) {
                opts[opts.length] = '<option value="proposeMembersColonize">Members Only Colonization</option>';
                dis[dis.length] = [
                '    <div id="proposeMembersColonize" class="proposeOption" style="display:none;">',
                '        Allow only members to colonize planets under this stations jurisdiction.<br />',
                '        <button type="button" id="proposeMembersColonizeSubmit">Propose</button>',
                '    </div>'
                ].join('');
                Event.on("proposeMembersColonizeSubmit", "click", this.ColonizeOnly, this, true);
            }
            if(this.building.level >= 18) {
                opts[opts.length] = '<option value="proposeMembersStations">Members Only Stations</option>';
                dis[dis.length] = [
                '    <div id="proposeMembersStations" class="proposeOption" style="display:none;">',
                '        Allow only members to setup stations under this stations jurisdiction.<br />',
                '        <button type="button" id="proposeMembersStationsSubmit">Propose</button>',
                '    </div>'
                ].join('');
                Event.on("proposeMembersStationsSubmit", "click", this.StationsOnly, this, true);
            }
            if(this.building.level >= 20) {
                opts[opts.length] = '<option value="proposeMembersExcavation">Members Only Excavation</option>';
                dis[dis.length] = [
                '    <div id="proposeMembersExcavation" class="proposeOption" style="display:none;">',
                '        Allow only members to excavate on bodies under this stations jurisdiction.<br />',
                '        <button type="button" id="proposeMembersExcavationSubmit">Propose</button>',
                '    </div>'
                ].join('');
                Event.on("proposeMembersExcavationSubmit", "click", this.ExcavationOnly, this, true);
            }
            if(this.building.level >= 21) {
                opts[opts.length] = '<option value="proposeEvictExcav">Evict Excavator</option>';
                dis[dis.length] = [
                '    <div id="proposeEvictExcav" class="proposeOption" style="display:none;">',
				'		<ul><li><label>Star:</label><select id="proposeEvictExcavStar"></select></li>',
				'		 <li><label>Body:</label><select id="proposeEvictExcavBody"></select></li>',
                '        <li><label>Excavator:</label><select id="proposeEvictExcavId"></select></li><br />',
                '        <button type="button" id="proposeEvictExcavSubmit">Propose Eviction</button></ul>',
                '    </div>'
                ].join('');

				/* Server doesn't return Excavator Id Anywhere.
				this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({
						session_id: Game.GetSession(),
						building_id: this.building.id,
					},{
                        success: function(o){
                            var el = Dom.get('proposeEvictExcavStar');
                            if (el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m = 0; m < stars.length; m++) {
                                    var obj = stars[m];
                                    opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope: this
                    });
                }, this, true);

				Event.on("proposeEvictExcavStar", "change", this.PopulateBodiesForStar, {
					starElement: 'proposeEvictExcavStar',
					bodyElement: 'proposeEvictExcavBody',
					Self: this}, true);
				Event.on('proposeEvictExcavBody', 'change', this.LoadExcavs, this, true);
				*/

            }
            if(this.building.level >= 23) {
                opts[opts.length] = '<option value="proposeNeutralizeBHG">Neutralize BHG</option>';
                dis[dis.length] = [
                '    <div id="proposeNeutralizeBHG" class="proposeOption" style="display:none;">',
                '        Neutralizes all Black Hole Generators under this stations jurisdiction.<br />',
                '        <button type="button" id="proposeNeutralizeBHGSubmit">Propose</button>',
                '    </div>'
                ].join('');
                Event.on("proposeNeutralizeBHGSubmit", "click", this.NeutralizeBHG, this, true);
            }
            if(this.building.level >= 25) {
                opts[opts.length] = '<option value="proposeFireBfg">Fire BFG</option>';
                dis[dis.length] = [
                '    <div id="proposeFireBfg" class="proposeOption" style="display:none;">',
				'		<ul><li><label>Star:</label><select id="proposeFireBfgStars"></select></li>',
                '        <li><label>Body:</label><select id="proposeFireBfgBody"></select></li>',
                '        <li><label>Reason:</label><textarea id="proposeFireBfgReason" rows="4" cols="80"></textarea></li></ul><br />',
                '        <button type="button" id="proposeFireBfgSubmit">Propose to Fire BFG!</button>',
                '    </div>'
                ].join('');
				
				this.subscribe("onLoad", function() {
                    this.service.get_stars_in_jurisdiction({
						session_id: Game.GetSession(),
						building_id: this.building.id,
					},{
                        success: function(o){
                            var el = Dom.get('proposeFireBfgStars');
                            if (el) {
                                var stars = o.result.stars;
                                var opts = [];
                                for(var m = 0; m < stars.length; m++) {
                                    var obj = stars[m];
                                    opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
                                }
                                
                                el.innerHTML = opts.join('');
                                el.selectedIndex = -1;
                            }
                        },
                        scope: this
                    });
                }, this, true);
				
				Event.on("proposeFireBfgStars", "change", this.PopulateBodiesForStar, {
					starElement: 'proposeFireBfgStars',
					bodyElement: 'proposeFireBfgBody',
					Self: this}, true);
				Event.on("proposeFireBfgSubmit", "click", this.FireBFG, this, true);
            }
            
            if (getAllianceMembers) {
                Game.Services.Alliance.view_profile({
					session_id: Game.GetSession(),
					alliance_id: Game.GetCurrentPlanet().alliance.id
				}, {
                    success: function(o) {
                        var el = Dom.get('proposeTransferTo');
                        if (el) {
                            var profile = o.result.profile;
                            var memberArray = [];
                            for (var m = 0; m < profile.members.length; m++) {
                                var member = profile.members[m];
                                member.isLeader = member.id == profile.leader_id
                                memberArray[memberArray.length] = member;
                            }
                            this.allianceMembers = memberArray;
                            this.fireEvent("onAllianceMembers");
                        }
                    },
                    scope: this
                });
            }
            
            var tab = new YAHOO.widget.Tab({ label: "Propose", content: [
                '<div id="proposeContainer">',
                '    <div style="border-bottom:1px solid #52acff;padding-bottom:5px; margin-bottom:5px;">',
                '        Propose: <select id="proposeSelect">',
                opts.join(''),
                '    </select></div>',
                '    <div id="proposeMessage"></div>',
                '    <div id="proposeWrit" class="proposeOption">',
                '        <ul><li><label>Template:</label><select id="proposeWritTemplates"></select></li>',
                '        <li><label>Title:</label><input type="text" id="proposeTitle" size="50" maxlength="30" /></li>',
                '        <li><label>Description:</label><textarea id="proposeDesc" rows="4" cols="80"></textarea></li></ul><br />',
                '        <button type="button" id="proposeWritSubmit">Propose Writ</button>',
                '    </div>',
                dis.join(''),
                '</div>'
            ].join('')});

            this.subscribe("onLoad", function() {
                this.proposeOptions = Sel.query("div.proposeOption", "proposeContainer");
                this.proposeMessage = Dom.get("proposeMessage");
                
                Event.on("proposeSelect", "change", function(e) {
                    Dom.setStyle(this.proposeOptions, "display", "none");
                    Dom.setStyle(Lib.getSelectedOptionValue("proposeSelect"), "display", "");
                }, this, true);

                //Propose Writ
                var t = Dom.get("proposeWritTemplates"),
                    templates = Game.Resources.writ_templates,
                    opts = [];
                for(var n=0; n<templates.length; n++) {
                    var tmp = templates[n];
                    opts.push('<option value="');
                    opts.push(n);
                    opts.push('">');
                    opts.push(tmp.title);
                    opts.push('</option>');
                }
                t.innerHTML = opts.join('');
                Dom.get("proposeTitle").value = templates[0].title;
                Dom.get("proposeDesc").value = templates[0].description;
                
                Event.on(t, "change", this.ProposeWritTemplateChange, this, true);
                
                Event.on("proposeWritSubmit", "click", this.ProposeWrit, this, true);
            }, this, true);

            return tab;
        },
        
        ProposeWritTemplateChange : function() {
            var opt = Game.Resources.writ_templates[Lib.getSelectedOption("proposeWritTemplates").value];
            Dom.get("proposeTitle").value = opt.title;
            Dom.get("proposeDesc").value = opt.description;
        },
        CreateStarSearch : function(id) {
            var dataSource = new Util.XHRDataSource("/map");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.stars",
                fields : ["name","id","zone","color","x","y"]
            };
            
            var oTextboxList = new YAHOO.lacuna.TextboxList(id, dataSource, { //config options
                maxResultsDisplayed: 25,
                minQueryLength:3,
                multiSelect:false,
                forceSelection:false,
                useIndicator:true
            });
            oTextboxList.formatResult = function(oResultData, sQuery, sResultMatch) {
                return [
                    '<div class="yui-gf">',
                    '    <div class="yui-u first" style="background-color:black;">',
                    '        <img src="',Lib.AssetUrl,'star_map/',oResultData.color,'.png" alt="',oResultData,name,'" style="width:50px;height:50px;" />',
                    '    </div>',
                    '    <div class="yui-u">',
                    '        <div>',oResultData.name,'</div>',
                    '        <div>',oResultData.x,' : ',oResultData.y,'</div>',
                    '    </div>',
                    '</div>'].join("");
            };
            oTextboxList.generateRequest = function(sQuery){                
                var s = Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": "search_stars",
                        "jsonrpc": "2.0",
                        "params": [
                            Game.GetSession(""),
                            decodeURIComponent(sQuery)
                        ]
                    });
                return s;
            };

            return oTextboxList;
        },
        CreateEmpireSearch : function(id) {
            var dataSource = new Util.XHRDataSource("/empire");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.empires",
                fields : ["name","id"]
            };
            
            var oTextboxList = new YAHOO.lacuna.TextboxList(id, dataSource, { //config options
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
            
            return oTextboxList;
        },
        
        Broadcast : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_broadcast_on_network19({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                message : Dom.get("proposeBroadcastMessage").value
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed broadcast.";
                    Lib.fadeOutElm(this.proposeMessage);
                    Dom.get("proposeBroadcastMessage").value = "";
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        StationsOnly : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_members_only_stations({
                session_id : Game.GetSession(''),
                building_id : this.building.id
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to limit stations to members only.";
                    Lib.fadeOutElm(this.proposeMessage);
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        ColonizeOnly : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_members_only_colonization({
                session_id : Game.GetSession(''),
                building_id : this.building.id
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to limit colonization to members only.";
                    Lib.fadeOutElm(this.proposeMessage);
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
		EvictMining: function(e) {
			var button   = Event.getTarget(e),
				platform = Lib.getSelectedOptionValue('proposeEvictMiningId');

			button.disabled = true;
			if (platform) {
				require('js/actions/menu/loader').show();
				this.service.propose_evict_mining_platform({
					session_id: Game.GetSession(''),
					building_id: this.building.id,
					platform_id: platform
				}, {
					success: function(o) {
						Lacuna.Pulsar.Hide();
						this.rpcSuccess(o);
						this.proposeMessage.innerHTML = "Successfully proposed to evict mining platforms.";
						Lib.fadeOutElm(this.proposeMessage);
            			button.disabled = false;
					},
					failure: function(o) {
						button.disabled = false;
					},
					scope: this
				});
			}
			else {
				alert('Must selected a Mining Platform to Evict.');
				button.disabled = false;
			}
		},
		FireBFG : function(e) {
			var button = Event.getTarget(e),
				body   = Lib.getSelectedOptionValue('proposeFireBfgBody'),
				reason = Dom.get('proposeFireBfgReason').value;
			
			if (body && reason) {
				if (confirm('WARNING: The BFG is an extremly powerful weapon - do not point at face!!\n Are you sure you want to fire it?')) {
					button.disabled = true;
				
					require('js/actions/menu/loader').show();
					this.service.propose_fire_bfg({
						session_id: Game.GetSession(),
						building_id: this.building.id,
						body_id: body,
						reason: reason
					}, {
						success : function(o) {
							require('js/actions/menu/loader').hide();
							this.rpcSuccess(o);
							this.proposeMessage.innerHTML = "Successfully proposed to fire BFG.";
							Lib.fadeOutElm(this.proposeMessage);
							button.disabled = false;
						},
						failure : function(o) {
							button.disabled = false;
						},
						scope: this
					});
				}
			}
			else {
				alert('Must provide a body and a reason!');
			}
		},
		LoadMining: function(e) {
			var bodyId       = Lib.getSelectedOptionValue('proposeEvictMiningBody'),
				miningIdElem = Dom.get('proposeEvictMiningId');

			if (bodyId) {
				require('js/actions/menu/loader').show();
				this.service.get_mining_platforms_for_asteroid_in_jurisdiction({
					session_id: Game.GetSession(''),
					building_id: this.building.id,
					asteroid_id: bodyId
				}, {
					success: function(o) {
						require('js/actions/menu/loader').hide();
						var optionValues = [];
						var platforms = o.result.platforms;

						for (var i = 0; i < platforms.length; i++) {
							var platform = platforms[i];
							optionValues[optionValues.length] = '<option value="' + platform.id + '">' + platform.empire.name + '</option>';
						}

						miningIdElem.innerHTML = optionValues.join('');
					},
					scope: this
				});
			}
		},
		/* There currently isn't a way to get the Excavator Id.
		LoadExcavs: function(e) {
			var bodyId = Lib.getSelectedOptionValue('proposeEvictExcavBody'),
				excavElem = Dom.get('proposeEvictExcavId');

			if (bodyId) {
				Game.Services.Buildings.SpacePort.get_ships_for({
					session_id: Game.GetSession(''),
					from_body_id: Game.GetCurrentPlanet().id,
					target: {body_id: bodyId}
				}, {
					success: function(o) {
						this.rpcSuccess(o);

						var el = Dom.get('proposeEvictExcavId');
						if (el) {
							var excavs = o.result.excavators;
							console.log(excavs);
							var optionValues = [];

							for (var i = 0; i < excavs.length; i++) {
								var excav = excavs[i];
								
								//optionValues[optionvalues.length] = opts[opts.length] = '<option value="' + excav.id + '">' + excav.name + '</option>';
							}

							el.innerHTML = optionValues.join('');
						}
					},
					scope: this
				});
			}
		},*/
        NeutralizeBHG : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_neutralize_bhg({
                session_id : Game.GetSession(''),
                building_id : this.building.id
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to neutralize Black Hole Generators.";
                    Lib.fadeOutElm(this.proposeMessage);
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        MemberExpel : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_expel_member({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                empire_id : Lib.getSelectedOptionValue("proposeExpelMember"),
                message : Dom.get('proposeExpelReason').value
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to expel member.";
                    Lib.fadeOutElm(this.proposeMessage);
                    Dom.get("proposeExpelMember").selectedIndex = -1;
                    Dom.get('proposeExpelReason').value = "";
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        MemberInduct : function(e) {
            if(this.inductMemberTextboxList._oTblSingleSelection) {
                var btn = Event.getTarget(e);
                btn.disabled = true;
                var selObj = this.inductMemberTextboxList._oTblSingleSelection.Object;
                
                this.service.propose_induct_member({
                    session_id : Game.GetSession(''),
                    building_id : this.building.id,
                    empire_id : selObj.id,
                    message : Dom.get('proposeInductMessage').value
                },
                {
                    success : function(o) {
                        this.rpcSuccess(o);
                        this.proposeMessage.innerHTML = "Successfully proposed to induct member.";
                        Lib.fadeOutElm(this.proposeMessage);
                        this.inductMemberTextboxList.ResetSelections();
                        Dom.get('proposeInductMessage').value = "";
                        btn.disabled = false;
                    },
                    failure : function(o) {
                        btn.disabled = false;
                    },
                    scope:this
                });
            }
        },
        MemberNewLeader : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_elect_new_leader({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                to_empire_id : Lib.getSelectedOptionValue("proposeElectLeaderMember")
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to elect new leader.";
                    Lib.fadeOutElm(this.proposeMessage);
                    Dom.get("proposeElectLeaderMember").selectedIndex = -1;
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        MiningOnly : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_members_only_mining_rights({
                session_id : Game.GetSession(''),
                building_id : this.building.id
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to limit mining rights to members only.";
                    Lib.fadeOutElm(this.proposeMessage);
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        ExcavationOnly : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_members_only_excavation({
                session_id : Game.GetSession(''),
                building_id : this.building.id
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to limit excavation to members only.";
                    Lib.fadeOutElm(this.proposeMessage);
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
		PopulateBodiesForStar : function(e) {
			var starId   = Lib.getSelectedOptionValue(this.starElement),
				bodyList = Dom.get(this.bodyElement);
			
			require('js/actions/menu/loader').show()
			this.Self.service.get_bodies_for_star_in_jurisdiction({
				session_id: Game.GetSession(''),
				building_id: this.Self.building.id,
				star_id: starId
			}, {
				success: function(o) {
					require('js/actions/menu/loader').hide();
					this.Self.rpcSuccess(o);
					
					if (bodyList) {
						var bodies = o.result.bodies;
					
						var opts = [];
						for (var i = 0; i < bodies.length; i++) {
							var obj = bodies[i];
							
							if (this.type) {
								if (obj.type == this.type) {
									opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
								}
							}
							else {
								opts[opts.length] = '<option value="' + obj.id + '">' + obj.name + '</option>';
							}
						}
					
						bodyList.innerHTML = opts.join('');
						bodyList.selectedIndex = -1;
					}
				},
				scope: this
			});
		},
        ProposeWrit : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_writ({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                title : Dom.get("proposeTitle").value,
                description : Dom.get("proposeDesc").value
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed writ.";
                    Lib.fadeOutElm(this.proposeMessage);
                    this.ProposeWritTemplateChange();
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
		RenameAsteroid: function(e) {
			var button = Event.getTarget(e),
				body = Lib.getSelectedOptionValue('proposeRenameAsteroidName'),
				newName = Dom.get('proposeRenameAsteroidNewName').value;

			button.disabled = true;

			if (body && newName) {
				require('js/actions/menu/loader').show();
				this.service.propose_rename_uninhabited({
					session_id: Game.GetSession(''),
					building_id: this.building.id,
					planet_id: body,
					name: newName
				}, {
					success: function(o) {
						require('js/actions/menu/loader').hide();
						this.rpcSuccess(o);

						this.proposeMessage.innerHTML = "Successfully proposed to rename asteroid.";
                    	Lib.fadeOutElm(this.proposeMessage);

						button.disabled = false;
						Dom.get('proposeRenameAsteroidNewName').value = '';
						Dom.get('proposeRenameAsteroidName').selectedIndex = -1;
					},
					failure: function(o) {
						button.disabled = false;
					},
					scope: this
				});
			}
			else {
				alert('Must select a body and chose a new name!');
				button.disabled = false;
			}
		},		
        RenameStar : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
            
            this.service.propose_rename_star({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                star_id : Lib.getSelectedOptionValue("proposeRenameStarSelect"),
                name : Dom.get("proposeRenameStarName").value
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to rename star.";
                    Lib.fadeOutElm(this.proposeMessage);
                    Dom.get("proposeRenameStarSelect").selectedIndex = -1;
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
		RenameUninhabited: function(e) {
			var button = Event.getTarget(e),
				body = Lib.getSelectedOptionValue('proposeRenameUninhabitedName'),
				newName = Dom.get('proposeRenameUninhabitedNewName').value;

			
			button.disabled = true;

			if (body && newName) {
				require('js/actions/menu/loader').show();
				this.service.propose_rename_uninhabited({
					session_id: Game.GetSession(''),
					building_id: this.building.id,
					planet_id: body,
					name: newName
				}, {
					success: function(o) {
						require('js/actions/menu/loader').hide();
						this.rpcSuccess(o);

						this.proposeMessage.innerHTML = "Successfully proposed to rename uninhabited.";
                    	Lib.fadeOutElm(this.proposeMessage);

						button.disabled = false;
						Dom.get('proposeRenameUninhabitedNewName').value = '';
						Dom.get('proposeRenameUninhabitedName').selectedIndex = -1;
					},
					failure: function(o) {
						button.disabled = false;
					},
					scope: this
				});
			}
			else {
				alert('Must select a body and chose a new name!');
				button.disabled = false;
			}
		},
        TransferOwner : function(e) {
            var btn = Event.getTarget(e);
            btn.disabled = true;
        
            this.service.propose_transfer_station_ownership({
                session_id : Game.GetSession(''),
                building_id : this.building.id,
                to_empire_id : Lib.getSelectedOptionValue("proposeTransferTo")
            },
            {
                success : function(o) {
                    this.rpcSuccess(o);
                    this.proposeMessage.innerHTML = "Successfully proposed to transfer ownership of station.";
                    Lib.fadeOutElm(this.proposeMessage);
                    Dom.get("proposeTransferTo").selectedIndex = -1;
                    btn.disabled = false;
                },
                failure : function(o) {
                    btn.disabled = false;
                },
                scope:this
            });
        },
        
        
        LawsPopulate : function(){
            var details = Dom.get("lawsDetails");
            
            if(details) {
                var laws = this.laws,
                    parentEl = details.parentNode,
                    li = document.createElement("li");
                    
                //Event.purgeElement(details, true);
                details = parentEl.removeChild(details);
                details.innerHTML = "";

                for(var i=0; i<laws.length; i++) {
                    var law = laws[i],
                        nLi = li.cloneNode(false);
                    
                    nLi.Law = law;
                    nLi.innerHTML = ['<div style="margin-bottom:2px;">',
                        '<div class="yui-gb" style="border-bottom:1px solid #52acff;">',
                        '    <div class="yui-u first"><label>',law.name,'</label></div>',
                        '    <div class="yui-u" >',(this.canRepealLaw ? '<button type="button">Repeal</button>' : '&nbsp;'),'</span></div>',
                        '    <div class="yui-u" style="text-align:right;">Enacted ',Lib.formatServerDate(law.date_enacted),'</span></div>',
                        '</div>',
                        '<div class="lawDesc">',this.formatBody(law.description),'</div>',
                        '</div>'].join('');
                                
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
        LawClick : function(e, matchedEl, container){
            if(matchedEl.innerHTML == "Repeal") {
                matchedEl.disabled = true;
                var el = Dom.getAncestorByTagName(matchedEl, "li");
                if(el) {
                    this.service.propose_repeal_law({
                        session_id:Game.GetSession(""),
                        building_id:this.building.id,
                        law_id:el.Law.id
                    },{
                        success : function(o) {
                            delete this.props;
                            matchedEl.parentNode.removeChild(matchedEl);
                        },
                        failure : function() {
                            matchedEl.disabled = false;
                        },
                        scope:this
                    });
                }
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
            //Game.PlanetJump(planet);
            require('js/actions/menu/map').changePlanet(res[1]);
        },
        handleAllianceLink : function(e, el) {
            Event.stopEvent(e);
            var res = el.href.match(/\#(-?\d+)$/);
            Lacuna.Info.Alliance.Load(res[1]);
        }

    });
    
    Lacuna.modules.Parliament = Parliament;

})();
YAHOO.register("Parliament", YAHOO.lacuna.modules.Parliament, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
