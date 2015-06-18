'use strict';

YAHOO.namespace("lacuna");

var _ = require('lodash');

var OptionsActions = require('js/actions/window/options');

if (typeof YAHOO.lacuna.Profile == "undefined" || !YAHOO.lacuna.Profile) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Profile = function() {};
    Profile.prototype = {
        build: _.once(function() {
            this.createEvent("onRpc");
            this.id = "profile";

            var container = document.createElement("div");
            container.id = this.id;
            Dom.addClass(container, Lib.Styles.HIDDEN);
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);

            this.Dialog = new YAHOO.widget.Dialog(this.id, {
                constraintoviewport:true,
                postmethod:"none",
                buttons:[ { text:"Update", handler:{fn:this.handleUpdate, scope:this}, isDefault:true } ],
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                close:true,
                width:"500px",
                zIndex:9999
            });
            this.Dialog.renderEvent.subscribe(function(){
                this.description = Dom.get("profileDescription");
                this.status = Dom.get("profileStatus");
                this.email = Dom.get("profileEmail");
                this.city = Dom.get("profileCity");
                this.country = Dom.get("profileCountry");
                this.skype = Dom.get("profileSkype");
                this.player_name = Dom.get("profilePlayerName");
                this.skipFacebook = Dom.get("profileSkipFacebookWallPosts");
                this.skipMedal = Dom.get("profileSkipMedal");
                this.skipHappiness = Dom.get("profileSkipHappiness");
                this.skipResource = Dom.get("profileSkipResource");
                this.skipPollution = Dom.get("profileSkipPollution");
                this.skipFoundNothing = Dom.get("profileSkipFoundNothing");
                this.skipExcavatorResources = Dom.get("profileSkipExcavatorResources");
                this.skipExcavatorGlyph = Dom.get("profileSkipExcavatorGlyph");
                this.skipExcavatorPlan = Dom.get("profileSkipExcavatorPlan");
                this.skipExcavatorArtifact = Dom.get("profileSkipExcavatorArtifact");
                this.skipExcavatorDestroyed = Dom.get("profileSkipExcavatorDestroyed");
                this.skipAllExcavator = Dom.get("profileSkipAllExcavator");
                this.skipSpyRecovery = Dom.get("profileSkipSpyRecovery");
                this.skipProbeDetected = Dom.get("profileSkipProbeDetected");
                this.skipAttackMessages = Dom.get("profileSkipAttackMessages");
                this.skipIncomingShips = Dom.get("profileSkipIncomingShips");
                this.skipExcavatorReplaceMsg = Dom.get("profileSkipExcavatorReplaceMsg");
                this.dontReplaceExcavator = Dom.get("profileDontReplaceExcavator");
                Event.on(this.skipFoundNothing, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorResources, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorGlyph, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorPlan, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorArtifact, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorDestroyed, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipAllExcavator").checked = false;
                    }
                });
                Event.on(this.skipExcavatorReplaceMsg, 'change', function() {
                    if(!this.checked) {
                        Dom.get("profileSkipExcavatorReplaceMsg").checked = false;
                    }
                });
                Event.on(this.skipAllExcavator, 'change', function() {
                    if(this.checked) {
                        Dom.get("profileSkipFoundNothing").checked = true;
                        Dom.get("profileSkipExcavatorResources").checked = true;
                        Dom.get("profileSkipExcavatorGlyph").checked = true;
                        Dom.get("profileSkipExcavatorPlan").checked = true;
                    Dom.get("profileSkipExcavatorArtifact").checked = true;
                    Dom.get("profileSkipExcavatorDestroyed").checked = true;
              Dom.get("profileSkipExcavatorReplaceMsg").checked = true;
                    }
                });

                this.rpc = Dom.get("profileRpc");

                this.medals = Dom.get("profileMedalsList");
                this.species = Dom.get("profileSpecies");
                this.notes = Dom.get("profileNotes");
                this.sitter_password = Dom.get("profileSitterPassword");
                this.userID = Dom.get("profileUserID");
                this.allianceID = Dom.get("profileAllianceID");
                this.new_password = Dom.get("profileNewPassword");
                this.confirm_password = Dom.get("profileConfirmPassword");
                this.account_tab = Dom.get('detailsAccount');
                Event.on(this.sitter_password, 'focus', function() {
                    this.type = 'text';
                });
                Event.on(this.sitter_password, 'blur', function() {
                    this.type = 'password';
                });

                this.stopAnim = Dom.get("profileDisableDialogAnim");
                this.showLevels = Dom.get("profileShowBuildingLevels");
                this.hidePlanets = Dom.get("profileHidePlanets");

                this.tabView = new YAHOO.widget.TabView("profileTabs");
                //species tab
                this.hasSpecies = false;
                this.tabView.getTab(2).subscribe("activeChange", function(e) {
                    if(e.newValue && !this.hasSpecies) {
                        this.hasSpecies = true;
                        var requests = 0;
                        Game.Services.Empire.view_species_stats({session_id:Game.GetSession("")},{
                            success : function(o){
                                YAHOO.log(o, "info", "Profile.show.view_stats.success");
                                this.fireEvent('onRpc', o.result);
                                this.speciesStats = o.result.species;
                                requests++;
                                if (requests == 2) {
                                    this.populateSpecies();
                                }
                            },
                            scope:this
                        });
                        Game.Services.Empire.redefine_species_limits({session_id:Game.GetSession("")},{
                            success : function(o){
                                YAHOO.log(o, "info", "Profile.redefine_species_limits.success");
                                this.fireEvent('onRpc', o.result);
                                this.speciesRedefineLimits = o.result;
                                requests++;
                                if (requests == 2) {
                                    this.populateSpecies();
                                }
                            },
                            scope:this
                        });
                    }
                }, this, true);
                this.tabView.set('activeIndex',0);
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
            }, this, true);
            // Let the React component know that we're going away now.
            this.Dialog.hideEvent.subscribe(OptionsActions.hide);
            this.Dialog.render();
            Game.OverlayManager.register(this.Dialog);

            this.speciesId = 'profileSpeciesRedefine';
            var speciesContainer = document.createElement("div");
            speciesContainer.id = this.speciesId;
            Dom.addClass(speciesContainer, Lib.Styles.HIDDEN);
            speciesContainer.innerHTML = [
                '    <div class="hd">Redefine Species</div>',
                '    <div class="bd">',
                '        <div id="profileSpeciesRedefineWarning">',
                '            Changing your species affinities is risky business and will affect the game in many ways you cannot foresee. ',
                '            In addition, you can only change your affinities once per month. Use at your own risk!',
                '        </div>',
                '        <form name="profileSpeciesRedefineForm">',
                '            <div id="profileSpeciesDesigner"></div>',
                '            <div id="profileSpeciesMessage" class="hidden"></div>',
                '        </form>',
                '    </div>',
                '    <div class="ft"></div>'
            ].join('');
            document.getElementById('oldYUIPanelContainer').appendChild(speciesContainer);
            this.SpeciesDialog = new YAHOO.widget.Dialog(this.speciesId, {
                constraintoviewport:true,
                postmethod:"none",
                buttons:[
                    { text:' <img src="'+Lib.AssetUrl+'ui/s/essentia.png" class="smallEssentia" /> Update', handler: { fn: this.redefineSpecies, scope:this }, isDefault:true },
                    { text:"Cancel", handler: { fn: function() { this.hide(); } } }
                ],
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                close:true,
                width:"735px",
                zIndex:99999
            });
            this.SpeciesDialog.renderEvent.subscribe(function(){
                this.SpeciesDesigner = new Lacuna.SpeciesDesigner({ templates : false });
                this.SpeciesDesigner.render('profileSpeciesDesigner');
                Dom.removeClass(this.speciesId, Lib.Styles.HIDDEN);
            }, this, true);

            this.SpeciesDialog.render();
            Game.OverlayManager.register(this.SpeciesDialog);
        }),
        _getHtml : function() {
            return [
            '    <div class="hd">Options</div>',
            '    <div class="bd">',
            '        <form name="profileForm" autocomplete="off">',
            '            <ul id="profileDetails">',
            '                <li><label style="vertical-align:top;" title="The publicly displayed description for your empire.">Description:</label><textarea id="profileDescription" cols="47"></textarea></li>',
            '                <li><label title="What are you doing right now?">Status:</label><input id="profileStatus" maxlength="100" size="50" /></li>',
            '            </ul>',
            '            <div id="profileTabs" class="yui-navset">',
            '                <ul class="yui-nav">',
            '                    <li><a href="#detailsPlayer"><em>Player</em></a></li>',
            '                    <li><a href="#detailsMedals"><em>Medals</em></a></li>',
            '                    <li><a href="#detailsSpecies"><em>Species</em></a></li>',
            '                    <li><a href="#detailsNotes"><em>Notes</em></a></li>',
            '                    <li><a href="#detailsAccount"><em>Account</em></a></li>',
            '                    <li><a href="#detailsBrowser"><em>Browser</em></a></li>',
            '                </ul>',
            '                <div class="yui-content" style="padding:0;">',
            '                    <div id="detailsPlayer">',
            '                        <ul id="profilePlayer" style="overflow:auto">',
            '                            <li><label>Name:<input id="profilePlayerName" /></label></li>',
            '                            <li><label title="Your email is used to recover your password if it is lost, and to send you any unused essentia if you cancel your account.">Email:<input id="profileEmail" /></label></li>',
            '                            <li><label>City:<input id="profileCity" /></label></li>',
            '                            <li><label>Country:<input id="profileCountry" /></label></li>',
            '                            <li><label>Skype:<input id="profileSkype" /></label></li>',
            '                            <li><hr /><div class="yui-g">',
            '                                <div class="yui-u first">',
            '                                    <ul><li><input id="profileSkipFacebookWallPosts" type="checkbox" /> Stop Facebook Wall posts</li>',
            '                                    <li><input id="profileSkipMedal" type="checkbox" /> Stop Medal Messages</li>',
            '                                    <li><input id="profileSkipProbeDetected" type="checkbox" /> Stop Probe Detected</li>',
            '                                    <li><input id="profileSkipSpyRecovery" type="checkbox" /> Stop Spy Recovery Messages</li>',
            '                                    <li><input id="profileSkipResource" type="checkbox" /> Stop Resource Warnings</li>',
            '                                    <li><input id="profileSkipPollution" type="checkbox" /> Stop Pollution Warnings</li>',
            '                                    <li><input id="profileSkipHappiness" type="checkbox" /> Stop Happiness Warnings</li>',
            '                                    <li><input id="profileSkipAttackMessages" type="checkbox" /> Stop Attack Messages</li>',
      '                 <li><input id="profileSkipIncomingShips" type="checkbox" /> Stop Incoming Ships Notification</li>',
      '                 </ul></div>',
      '               <div class="yui-u">',
      '               <ul id="profileCheckboxes">',
            '                                    <li><input id="profileSkipAllExcavator" type="checkbox" /> Stop All Excavator Messages</li>',
            '                                    <li><input id="profileSkipFoundNothing" type="checkbox" /> Stop Excavator Found Nothing</li>',
            '                                    <li><input id="profileSkipExcavatorGlyph" type="checkbox" /> Stop Excavator Glyph</li>',
            '                                    <li><input id="profileSkipExcavatorResources" type="checkbox" /> Stop Excavator Resources</li>',
            '                                    <li><input id="profileSkipExcavatorPlan" type="checkbox" /> Stop Excavator Plan</li>',
            '                                    <li><input id="profileSkipExcavatorArtifact" type="checkbox" /> Stop Excavator Artifact</li>',
            '                                    <li><input id="profileSkipExcavatorDestroyed" type="checkbox" /> Stop Excavator Destroyed</li>',
            '                                    <li><input id="profileSkipExcavatorReplaceMsg" type="checkbox" /> Stop Excavator Replace Alert</li>',
            '                                    <li><input id="profileDontReplaceExcavator" type="checkbox" /> Do not replace Excavator automatically</li>',
      '               </ul></div>',
            '                            </div></li>',
            '                            <li><hr />Today\'s RPC Usage:<span id="profileRpc" style="margin-left:5px;"></span></li>',
            '                        </ul>',
            '                    </div>',
            '                    <div id="detailsMedals">',
            '                        <div>Select the medals to display on your profile :</div>',
            '                        <ul id="profileMedalsList" style="overflow:auto;">',
            '                        </ul>',
            '                    </div>',
            '                    <div id="detailsSpecies">',
            '                        <ul id="profileSpecies" style="overflow:auto;">',
            '                        </ul>',
            '                    </div>',
            '                    <div id="detailsNotes">',
            '                        <textarea id="profileNotes" title="Write down anything you would like to store with your account."></textarea>',
            '                    </div>',
            '                    <div id="detailsAccount">',
            '                        <ul>',
            '                            <li><label title="The sitter password can be used to allow others to log in to your account to help you manage it, but doesn\'t allow access edit your profile or delete the account.">Sitter Password:<input id="profileSitterPassword" type="password" /></label></li>',
            '                        </ul>',
            '                        <hr />',
            '                        <ul>',
            '                            <li style="text-align: center; margin-bottom: 2px;">Change Account Password:</li>',
            '                            <li><label>New Password:<input id="profileNewPassword" type="password" /></label></li>',
            '                            <li><label>Confirm:<input id="profileConfirmPassword" type="password" /></label></li>',
            '                        </ul>',
            '                        <hr />',
            '                        <ul id="profileAccountInfo">',
            '                            <li style="text-align: center; margin-bottom: 2px;">Account information:</li>',
                    '                            <li style="text-align: left"><label>User&nbsp;ID <span style="text-align: left" id="profileUserID"></span></label></li>',
            '                            <li style="text-align: left"><label>Alliance&nbsp;ID <span style="text-align: left" id="profileAllianceID"><i>none</i></span></li></label>',
            '                        </ul>',
            '                    </div>',
            '                    <div id="detailsBrowser">',
            '                        <ul>',
            '                            <li><input id="profileDisableDialogAnim" type="checkbox" /> Stop Dialog Animation</li>',
            '                            <li><input id="profileShowBuildingLevels" type="checkbox" /> Always Show Building Levels</li>',
            '                            <li><input id="profileHidePlanets" type="checkbox" /> Hide Planet Images in Star Map</li>',
            '                        </ul>',
            '                    </div>',
            '                </div>',
            '            </div>',
            '        </form>',
            '    </div>',
            '    <div class="ft"></div>'
            ].join('');
        },
        handleUpdate : function() {
            var updatesLeft = 1;
            if (this.new_password.value != "") {
                if (this.new_password.value != this.confirm_password.value) {
                    alert("Passwords don't match!");
                    this.tabView.set('activeIndex', 4);
                    this.confirm_password.focus();
                    return;
                }
                else {
                    updatesLeft++;
                    Game.Services.Empire.change_password({
                            session_id:Game.GetSession(""),
                            password1:this.new_password.value,
                            password2:this.confirm_password.value
                        },{
                        success : function(o){
                            YAHOO.log(o, "info", "Profile.handleUpdate.password.success");
                            Dom.removeClass(this.account_tab, 'password-changed');
                            if (--updatesLeft == 0) {
                                this.hide();
                            }
                        },
                        failure : function(o){
                            this.tabView.set('activeIndex', 4);
                            this.new_password.focus();
                            return true;
                        },
                        scope:this
                    });
                }
            }

            var pmc = Sel.query("li", "profileMedalsList"),
                publicMedals = [];
            for(var i=0; i<pmc.length; i++){
                if(Sel.query('input[type="checkbox"]', pmc[i], true).checked) {
                    publicMedals.push(pmc[i].MedalId);
                }
            }

            if(Game.GetCookieSettings("disableDialogAnim","0") != (this.stopAnim.checked ? "1" : "0")) {
                var newEffect;
                if(this.stopAnim.checked) {
                    Game.SetCookieSettings("disableDialogAnim","1");
                }
                else {
                    Game.RemoveCookieSettings("disableDialogAnim");
                    newEffect = Game.GetContainerEffect();
                }
                var cs = Game.OverlayManager.overlays;
                for(var m=0; m<cs.length; m++) {
                    cs[m].cfg.setProperty("effect",newEffect);
                }
            }
            if(Game.GetCookieSettings("showLevels","0") != (this.showLevels.checked ? "1" : "0")) {
                if(this.showLevels.checked) {
                    Game.SetCookieSettings("showLevels","1");
                }
                else {
                    Game.RemoveCookieSettings("showLevels");
                }
                var levels = Sel.query("#planetMap .tileContainer .planetMapTileActionLevel");
                for(var n=0; n<levels.length; n++) {
                    Dom.setStyle(levels[n].parentNode, "visibility", this.showLevels.checked ? "visible" : "");
                }
            }
            if(Game.GetCookieSettings("hidePlanets","0") != (this.hidePlanets.checked ? "1" : "0")) {
                if(this.hidePlanets.checked) {
                    Game.SetCookieSettings("hidePlanets","1");
                }
                else {
                    Game.RemoveCookieSettings("hidePlanets");
                }
                if(YAHOO.lacuna.MapStar.IsVisible()){
                    YAHOO.lacuna.MapStar._map.hidePlanets = Game.GetCookieSettings("hidePlanets", 0)*1;
                    YAHOO.lacuna.MapStar._map.redraw();
                }
            }

            Game.Services.Empire.edit_profile({
                    session_id:Game.GetSession(""),
                    profile:{
                        description:this.description.value,
                        status_message:this.status.value,
                        email:this.email.value,
                        city:this.city.value,
                        country:this.country.value,
                        skype:this.skype.value,
                        player_name:this.player_name.value,
                        notes:this.notes.value,
                        sitter_password:this.sitter_password.value,
                        public_medals:publicMedals,
                        skip_happiness_warnings:this.skipHappiness.checked ? 1 : 0,
                        skip_resource_warnings:this.skipResource.checked ? 1 : 0,
                        skip_pollution_warnings:this.skipPollution.checked ? 1 : 0,
                        skip_medal_messages:this.skipMedal.checked ? 1 : 0,
                        skip_facebook_wall_posts:this.skipFacebook.checked ? 1 : 0,
                        skip_found_nothing:this.skipFoundNothing.checked ? 1 : 0,
                        skip_excavator_resources:this.skipExcavatorResources.checked ? 1 : 0,
                        skip_excavator_glyph:this.skipExcavatorGlyph.checked ? 1 : 0,
                        skip_excavator_plan:this.skipExcavatorPlan.checked ? 1 : 0,
                        skip_excavator_artifact:this.skipExcavatorArtifact.checked ? 1 : 0,
                        skip_excavator_destroyed:this.skipExcavatorDestroyed.checked ? 1 : 0,
                        skip_excavator_replace_msg:this.skipExcavatorReplaceMsg.checked ? 1 : 0,
                        dont_replace_excavator:this.dontReplaceExcavator.checked ? 1 : 0,
                        skip_spy_recovery:this.skipSpyRecovery.checked ? 1 : 0,
                        skip_probe_detected:this.skipProbeDetected.checked ? 1 : 0,
                        skip_attack_messages:this.skipAttackMessages.checked ? 1 : 0,
                        skip_incoming_ships:this.skipIncomingShips.checked ? 1 : 0
                    }
                },{
                success : function(o){
                    YAHOO.log(o, "info", "Profile.handleUpdate.success");
                    if (--updatesLeft == 0) {
                        this.hide();
                    }
                },
                scope:this
            });
        },
        show : function() {
            Lacuna.Profile.build();

            //this is called out of scope so make sure to pass the correct scope in
            Game.Services.Empire.view_profile({session_id:Game.GetSession("")},{
                success : function(o){
                    YAHOO.log(o, "info", "Profile.show.view_profile.success");
                    this.fireEvent('onRpc', o.result);
                    this.populateProfile(o.result);
                },
                scope:Lacuna.Profile
            });
            Game.OverlayManager.hideAll();
            Lacuna.Profile.tabView.set('activeIndex',0);
            Lacuna.Profile.Dialog.center();
            Lacuna.Profile.Dialog.show();
        },
        hide : function() {
            this.Dialog.hide();
        },

        populateProfile : function(results) {
            var p = results.profile;
            this.description.value = p.description;
            this.status.value = p.status_message;
            this.email.value = p.email;
            this.city.value = p.city;
            this.country.value = p.country;
            this.skype.value = p.skype;
            this.player_name.value = p.player_name;
            this.userID.innerHTML = [ '#', results.status.empire.id ].join('');
            if (results.status.empire.alliance_id) {
                this.allianceID.innerHTML = results.status.empire.alliance_id;
            }

            this.skipFacebook.checked = p.skip_facebook_wall_posts == "1";
            this.skipMedal.checked = p.skip_medal_messages == "1";
            this.skipHappiness.checked = p.skip_happiness_warnings == "1";
            this.skipResource.checked = p.skip_resource_warnings == "1";
            this.skipPollution.checked = p.skip_pollution_warnings == "1";
            this.skipFoundNothing.checked = p.skip_found_nothing == "1";
            this.skipExcavatorResources.checked = p.skip_excavator_resources == "1";
            this.skipExcavatorGlyph.checked = p.skip_excavator_glyph == "1";
            this.skipExcavatorPlan.checked = p.skip_excavator_plan == "1";
            this.skipExcavatorArtifact.checked = p.skip_excavator_artifact == "1";
            this.skipExcavatorDestroyed.checked = p.skip_excavator_destroyed == "1";
            this.skipSpyRecovery.checked = p.skip_spy_recovery == "1";
            this.skipProbeDetected.checked = p.skip_probe_detected == "1";
            this.skipAttackMessages.checked = p.skip_attack_messages == "1";
            this.skipIncomingShips.checked = p.skip_incoming_ships == "1";
            this.skipExcavatorReplaceMsg.checked = p.skip_excavator_replace_msg == "1";
            this.dontReplaceExcavator.checked = p.dont_replace_excavator == "1";
            this.skipAllExcavator.checked = this.skipFoundNothing.checked &&
                                      this.skipExcavatorResources.checked &&
                                      this.skipExcavatorGlyph.checked &&
                                            this.skipExcavatorPlan.checked &&
                                            this.skipExcavatorArtifact.checked &&
                                            this.skipExcavatorDestroyed.checked &&
                                      this.skipExcavatorReplaceMsg.checked;

            this.stopAnim.checked = Game.GetCookieSettings("disableDialogAnim","0") == "1";
            this.showLevels.checked = Game.GetCookieSettings("showLevels","0") == "1";
            this.hidePlanets.checked = Game.GetCookieSettings("hidePlanets","0") == "1";

            this.rpc.innerHTML = [(Game.EmpireData.rpc_count || 0), ' / ', (Game.ServerData.rpc_limit || 0)].join('');

            this.notes.value = p.notes;
            this.sitter_password.value = p.sitter_password;
            this.sitter_password.type = "password";
            this.new_password.value =
                this.confirm_password.value = "";
            Dom.removeClass(this.account_tab, 'password-changed');

            var frag = document.createDocumentFragment(),
                li = document.createElement('li');
            for(var id in p.medals) {
                if(p.medals.hasOwnProperty(id)) {
                    var medal = p.medals[id],
                        nLi = li.cloneNode(false);

                    Dom.addClass(nLi, "medal");
                    nLi.MedalId = id;
                    nLi.innerHTML = [
                    '    <div class="medalPublic"><input type="checkbox"', (medal["public"] == "1" ? ' checked' : ''), ' /></div>',
                    '    <div class="medalContainer">',
                    '        <img src="',Lib.AssetUrl,'medal/',medal.image,'.png" alt="',medal.name,'" title="',medal.name,' on ',Lib.formatServerDate(medal.date),'" />',
                    '    </div>'
                    ].join('');

                    frag.appendChild(nLi);
                }
            }

            this.medals.innerHTML = "";
            this.medals.appendChild(frag);

            var Ht = Game.GetSize().h - 195;
            if(Ht > 270) { Ht = 270; }
            Dom.setStyle('profilePlayer', 'height', Ht + 'px');
            Dom.setStyle(this.notes, 'height', Ht + 'px');
            Dom.setStyle(this.medals, 'height', Ht + 'px');

            this.Dialog.center();
        },
        populateSpecies : function() {
            var frag = document.createDocumentFragment(),
                li = document.createElement('li');
            var stat = this.speciesStats;

            var nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Name</label>',
                '<span>', stat.name, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Description</label>',
                '<span>', stat.description, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Habitable Orbits</label>',
                '<span>', stat.min_orbit,
                stat.max_orbit > stat.min_orbit ? ' to '+ stat.max_orbit : '',
                '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Manufacturing</label>',
                '<span>', stat.manufacturing_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Deception</label>',
                '<span>', stat.deception_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Research</label>',
                '<span>', stat.research_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Management</label>',
                '<span>', stat.management_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Farming</label>',
                '<span>', stat.farming_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Mining</label>',
                '<span>', stat.mining_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Science</label>',
                '<span>', stat.science_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Environmental</label>',
                '<span>', stat.environmental_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Political</label>',
                '<span>', stat.political_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Trade</label>',
                '<span>', stat.trade_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            nLi.innerHTML = [
                '<label>Growth</label>',
                '<span>', stat.growth_affinity, '</span>'
            ].join('');
            frag.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi, 'profileSpeciesRedefineButton');
            var redefineButton = document.createElement('button');
            redefineButton.innerHTML = [
                this.speciesRedefineLimits.essentia_cost,
                ' <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia smallImg" /> Redefine Species'
            ].join('');
            nLi.appendChild(redefineButton);
            frag.appendChild(nLi);

            Event.on(redefineButton, 'click', this.showSpeciesRedefine, this, true);

            this.species.innerHTML = "";
            this.species.appendChild(frag);
            var Ht = Game.GetSize().h - 180;
            if(Ht > 290) { Ht = 290; }
            Dom.setStyle(this.species, 'height', Ht + 'px');
        },
        showSpeciesRedefine : function(e) {
            Event.stopEvent(e);
            if (this.speciesRedefineLimits.can) {
                this.Dialog.hide();
                this.SpeciesDesigner.setSpeciesData(this.speciesStats);
                if (this.SpeciesDesigner.needsExpert(this.speciesStats)) {
                    this.SpeciesDesigner.setExpert();
                }
                this.SpeciesDesigner.setSpeciesLocks(this.speciesRedefineLimits);
                this.SpeciesDialog.getButtons()[0].innerHTML = [this.speciesRedefineLimits.essentia_cost,' <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia smallImg" /> Update'].join('');
                this.SpeciesDialog.show();
            }
            else {
                alert("Can't redefine species: " + this.speciesRedefineLimits.reason);
            }
        },
        redefineSpecies : function() {
            var data = this.SpeciesDesigner.getSpeciesData();
            if (this.SpeciesDesigner.compareSpeciesData(data, this.speciesStats)) {
                this.SpeciesDialog.hide();
                return;
            }
            try {
                if ( ! this.SpeciesDesigner.validateSpecies(data) ) {
                    return;
                }
            }
            catch (e) {
                alert(e);
                return;
            }
            require('js/actions/menu/loader').show();
            Game.Services.Empire.redefine_species({session_id:Game.GetSession(""), params:data},{
                success : function(o){
                    YAHOO.log(o, "info", "Profile.redefine_species.success");
                    require('js/actions/menu/loader').hide();
                    this.hasSpecies = false;
                    this.SpeciesDialog.hide();
                    this.fireEvent('onRpc', o.result);
                },
                scope:this
            });
        }
    };
    Lang.augmentProto(Profile, Util.EventProvider);

    Lacuna.Profile = new Profile();
})();
YAHOO.register("profile", YAHOO.lacuna.Profile, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
