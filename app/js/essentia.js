'use strict';

var _ = require('lodash');

var EssentiaActions = require('js/actions/window/essentia');

YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Essentia == "undefined" || !YAHOO.lacuna.Essentia) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Essentia = function() {};
    Essentia.prototype = {
        build: _.once(function() {
            this.createEvent("onRpc");

            this.id = "essentia";

            var container = document.createElement("div");
            container.id = this.id;
            Dom.addClass(container, Lib.Styles.HIDDEN);
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);
            Dom.addClass(container, "nofooter");

            this.Dialog = new YAHOO.widget.Panel(this.id, {
                constraintoviewport:true,
                fixedcenter:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                close:true,
                width:"500px",
                zIndex:9999
            });
            this.Dialog.renderEvent.subscribe(function(){
                this.timeFood = Dom.get("essentialDetailsTimeFood");
                this.timeOre = Dom.get("essentialDetailsTimeOre");
                this.timeWater = Dom.get("essentialDetailsTimeWater");
                this.timeEnergy = Dom.get("essentialDetailsTimeEnergy");
                this.timeHappiness = Dom.get("essentialDetailsTimeHappiness");
                this.timeStorage = Dom.get("essentialDetailsTimeStorage");
                this.timeBuilding = Dom.get("essentialDetailsTimeBuilding");
                this.timeSpyTraining = Dom.get("essentialDetailsTimeSpyTraining");
                this.elCode = Dom.get("essentiaRedeemCode");
                this.elEssentiaAmount = Dom.get("essentiaAmount");
                this.tabView = new YAHOO.widget.TabView('essentiaTabs');
                Event.on(["essentiaBoostFood","essentiaBoostOre","essentiaBoostWater","essentiaBoostEnergy","essentiaBoostHappiness","essentiaBoostStorage","essentiaBoostBuilding","essentiaBoostSpyTraining"], "click", this.boost, this, true);
                Event.on('essentiaRedeemButton', 'click', this.redeemClick, this, true);
                Event.on('essentiaInvite', 'click', Lacuna.Invite.show, this, true);
                Event.on("essentiaPurchaseButton", "click", function(e){
                    Event.stopEvent(e);
                    window.open("/pay?session_id=" + Game.GetSession(), "essentiaPayment", "status=0,toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,height=550,width=600,directories=0");
                });
                Game.onTick.subscribe(function(){
                    this.elEssentiaAmount.innerHTML = Game.EmpireData.essentia;
                }, this, true);
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
            }, this, true);

            this.Dialog.hideEvent.subscribe(function(){
                if (this._interval) {
                    window.clearInterval(this._interval);
                    delete this._interval;
                    this.timers = {};
                }

                // Let the React component know that we're going now.
                EssentiaActions.hide();
            }, this, true);
            this.timers = {};

            this.Dialog.render();
            Game.OverlayManager.register(this.Dialog);
        }),
        _getHtml : function() {
            return [
            '    <div class="hd">Essentia</div>',
            '    <div class="bd">',
            '        <div class="essentiaAmount">Current Essentia: <span id="essentiaAmount"></span></div>',
            '        <div id="essentiaTabs" class="yui-navset">',
            '            <ul class="yui-nav">',
            '                <li><a href="#essentiaTabBoost"><em>Boosts</em></a></li>',
            '                <li><a href="#essentiaGetMore"><em>Get More Essentia</em></a></li>',
/*            '                <li><a href="#essentiaGiveEssentia"><em>Give Essentia</em></a></li>', */
            '            </ul>',
            '            <div class="yui-content">',
            '                <div id="essentiaTabBoost">',
            '                    <table>',
            '                        <tr><td colspan="4">&nbsp;</td><th>Expires</th></tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallFood" title="Food" src="',Lib.AssetUrl,'ui/s/food.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% food per hour</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostFood" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeFood"></td>',
            '                        </tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallOre" title="Ore" src="',Lib.AssetUrl,'ui/s/ore.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% ore per hour</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostOre" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeOre"></td>',
            '                        </tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallWater" title="Water" src="',Lib.AssetUrl,'ui/s/water.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% water per hour</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostWater" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeWater"></td>',
            '                        </tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallEnergy" title="Energy" src="',Lib.AssetUrl,'ui/s/energy.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% energy per hour</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostEnergy" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeEnergy"></td>',
            '                        </tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallHappiness" title="Happiness" src="',Lib.AssetUrl,'ui/s/happiness.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% happiness per hour</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostHappiness" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeHappiness"></td>',
            '                        </tr>',
            '                        <tr>',
            '                            <td class="essentiaDetailsImg"><img class="smallStorage" title="Storage" src="',Lib.AssetUrl,'ui/s/storage.png" /></td>',
            '                            <td class="essentiaDetailsText">+25% storage capacity</td>',
            '                            <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                            <td class="essentiaDetailsBoost"><button id="essentiaBoostStorage" type="button">Boost</button></td>',
            '                            <td class="essentiaDetailsTime" id="essentialDetailsTimeStorage"></td>',
            '                        </tr>',
            '                       <tr>',
            '                           <td class="essentiaDetailsImg"><img class="smallBuilding" title="Building" src="',Lib.AssetUrl,'ui/s/build.png" /></td>',
            '                           <td class="essentiaDetailsText">+25% build speed</td>',
            '                           <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                           <td class="essentiaDetailsBoost"><button id="essentiaBoostBuilding" type="button">Boost</button></td>',
            '                           <td class="essentiaDetailsTime" id="essentialDetailsTimeBuilding"></td>',
            '                       </tr>',
            '                       <tr>',
            '                           <td class="essentiaDetailsImg"><img class="smallSpy" title="Spy" src="',Lib.AssetUrl,'ui/s/spy.png" /></td>',
            '                           <td class="essentiaDetailsText">+50% spy training speed</td>',
            '                           <td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
            '                           <td class="essentiaDetailsBoost"><button id="essentiaBoostSpyTraining" type="button">Boost</button></td>',
            '                           <td class="essentiaDetailsTime" id="essentialDetailsTimeSpyTraining"></td>',
            '                       </tr>',
            '                    </table>',
            '                </div>',
            '                <div id="essentiaGetMore">',
            '                    <b>Purchase Essentia for yourself.</b><br />',
            '                    <button id="essentiaPurchaseButton" type="button">Purchase Essentia</button>',
            '                    <hr />',
            '                    <div>',
            '                        <label><b>Redeem Essentia Code:</b><br /><input id="essentiaRedeemCode" /></label>',
            '                        <button id="essentiaRedeemButton" type="button">Redeem</button>',
            '                    </div>',
            '                    <hr />',
            '                    <div>',
            '                        <table>',
            '                            <tr><td><b>Invite your friends.</b></td></tr>',
            '                            <tr><td>Invite your friends to the game and you get free essentia. For every university level past 4 that they achieve, you\'ll get 5 essentia.</td></tr>',
            '                            <tr><td>That\'s up to 130 essentia per friend!</td></tr>',
            '                            <tr><td><button id="essentiaInvite" type="button">Invite Friends</button></td></tr>',
            '                        </table>',
            '                    </div>',
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>'
            ].join('');
        },

        show : function() {
            this.build();

            //this is called out of scope so make sure to pass the correct scope in
            Lacuna.Essentia.tabView.selectTab(0);
            Lacuna.Essentia.elCode.value = '';
            Game.Services.Empire.view_boosts({session_id:Game.GetSession("")},{
                success : function(o){
                    YAHOO.log(o, "info", "Essentia.show.success");
                    var Self = this;
                    this._interval = window.setInterval(function(){
                        Self.tick();
                    }, 1000);
                    this.populate(o.result);
                },
                scope:Lacuna.Essentia
            });
            Game.OverlayManager.hideAll();
            Lacuna.Essentia.elEssentiaAmount.innerHTML = Game.EmpireData.essentia;
            Lacuna.Essentia.Dialog.show();
        },
        hide : function() {
            this.Dialog.hide();
        },
        redeemClick : function (e) {
            Event.stopEvent(e);
            var code = this.elCode.value;
            require('js/actions/menu/loader').show();
            Game.Services.Empire.redeem_essentia_code({
                session_id:Game.GetSession(""),
                essentia_code: code
            },{
                success : function(o){
                    YAHOO.log(o, "info", "EssentiaRedeem.show.success");
                    require('js/actions/menu/loader').hide();
                    var addedEssentia = o.result.amount;
                    alert('Redeemed code for '+addedEssentia+' essentia.');
                    this.elCode.value = '';
                    this.fireEvent('onRpc', o.result);
                },
                scope:this
            });
        },
        boost : function(e) {
            var target = Event.getTarget(e);
            var func;
            switch(target.id) {
                case "essentiaBoostFood":
                    func = Game.Services.Empire.boost_food;
                    break;
                case "essentiaBoostOre":
                    func = Game.Services.Empire.boost_ore;
                    break;
                case "essentiaBoostWater":
                    func = Game.Services.Empire.boost_water;
                    break;
                case "essentiaBoostEnergy":
                    func = Game.Services.Empire.boost_energy;
                    break;
                case "essentiaBoostHappiness":
                    func = Game.Services.Empire.boost_happiness;
                    break;
                case "essentiaBoostStorage":
                    func = Game.Services.Empire.boost_storage;
                    break;
                case "essentiaBoostBuilding":
                    func = Game.Services.Empire.boost_building;
                    break;
                case "essentiaBoostSpyTraining":
                    func = Game.Services.Empire.boost_spy_training;
                    break;
            }
            if(func) {
                func({session_id:Game.GetSession("")},{
                    success : function(o){
                        YAHOO.log(o, "info", "Essentia.boost.success");
                        this.update(o.result);
                        this.fireEvent("onRpc", o.result);
                    },
                    scope:this
                });
            }
        },
        update : function(results) {
            if(results.food_boost) {
                this.updateTime(this.timeFood, results.food_boost);
            }
            else if(results.ore_boost) {
                this.updateTime(this.timeOre, results.ore_boost);
            }
            else if(results.water_boost) {
                this.updateTime(this.timeWater, results.water_boost);
            }
            else if(results.energy_boost) {
                this.updateTime(this.timeEnergy, results.energy_boost);
            }
            else if(results.happiness_boost) {
                this.updateTime(this.timeHappiness, results.happiness_boost);
            }
            else if(results.storage_boost) {
                this.updateTime(this.timeStorage, results.storage_boost);
            }
            else if(results.building_boost) {
                this.updateTime(this.timeBuilding, results.building_boost);
            }
            else if(results.spy_training_boost) {
                this.updateTime(this.timeSpyTraining, results.spy_training_boost);
            }
        },
        populate : function(results) {
            var boosts = results.boosts;

            this.updateTime(this.timeFood, boosts.food);
            this.updateTime(this.timeOre, boosts.ore);
            this.updateTime(this.timeWater, boosts.water);
            this.updateTime(this.timeEnergy, boosts.energy);
            this.updateTime(this.timeHappiness, boosts.happiness);
            this.updateTime(this.timeStorage, boosts.storage);
            this.updateTime(this.timeBuilding, boosts.building);
            this.updateTime(this.timeSpyTraining, boosts.spy_training);
        },
        updateTime : function(el, sDate) {
            var timers = this.timers;
            timers[el.id] = function() {
                if(sDate) {
                    var tTime = Lib.getTime(Lib.parseServerDate(sDate)),
                        cTime = Lib.getTime(Game.ServerData.time),
                        diffTime = tTime - cTime;
                    if(diffTime > 0) {
                        el.innerHTML = Lib.formatMillisecondTime(diffTime);
                        return;
                    }
                }
                delete timers[el.id];
                el.innerHTML = "&nbsp;";
            };
            timers[el.id]();
        },
        tick : function() {
            for (var key in this.timers){
                if (this.timers.hasOwnProperty(key)) {
                    this.timers[key]();
                }
            }
        }
    };

    Lang.augmentProto(Essentia, Util.EventProvider);

    Lacuna.Essentia = new Essentia();

})();
YAHOO.register("essentia", YAHOO.lacuna.Essentia, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
