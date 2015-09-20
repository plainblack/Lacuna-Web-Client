'use strict';

var StatsActions = require('js/actions/window/stats');

var _ = require('lodash');

YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Stats == "undefined" || !YAHOO.lacuna.Stats) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Stats = function() {};
    Stats.prototype = {
        build: _.once(function() {
            this.id = "stats";

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
                close:true,
                width:"800px",
                zIndex:9999
            });
            this.Panel.renderEvent.subscribe(function(){
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
                this.tabView = new YAHOO.widget.TabView("statsTabs");
                this.tabView.set('activeIndex',0);

                //subscribe after adding so active doesn't fire
                this.tabView.getTab(1).subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.AllianceStats();
                    }
                }, this, true);
                this.tabView.getTab(2).subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.ColonyStats();
                    }
                }, this, true);
                this.tabView.getTab(3).subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.SpyStats();
                    }
                }, this, true);
                this.tabView.getTab(4).subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.WeeklyMedalStats();
                    }
                }, this, true);
                this.tabView.getTab(5).subscribe("activeChange", function(e) {
                    if(e.newValue) {
                        this.getServerStats();
                    }
                }, this, true);

                this.generalTabView = new YAHOO.widget.TabView("statsGeneralTabs", {orientation:"left"});
                this.generalTabView.set('activeIndex',0);

                this.statsGeneralBodies = Dom.get("statsGeneralBodies");
                this.statsGeneralBuildings = Dom.get("statsGeneralBuildings");
                this.statsGeneralEmpires = Dom.get("statsGeneralEmpires");
                this.statsGeneralOrbits = Dom.get("statsGeneralOrbits");
                this.statsGeneralShips = Dom.get("statsGeneralShips");
                this.statsGeneralSpies = Dom.get("statsGeneralSpies");
                this.statsGeneralStars = Dom.get("statsGeneralStars");
                this.statsGeneralGlyphs = Dom.get("statsGeneralGlyphs");
            }, this, true);

            // Let the React component know that we're going away now.
            this.Panel.hideEvent.subscribe(StatsActions.hide);

            this.Panel.render();
            Game.OverlayManager.register(this.Panel);
        }),
        _getHtml : function() {
            return [
            '    <div class="hd">Universe Stats</div>',
            '    <div class="bd">',
            '        <div id="statsTabs" class="yui-navset">',
            '            <ul class="yui-nav">',
            '                <li><a href="#statsEmpire"><em>Empires</em></a></li>',
            '                <li><a href="#statsAlliance"><em>Alliances</em></a></li>',
            '                <li><a href="#statsColony"><em>Colonies</em></a></li>',
            '                <li><a href="#statsSpy"><em>Spies</em></a></li>',
            '                <li><a href="#statsWeeklyMedal"><em>Weekly Medals</em></a></li>',
            '                <li><a href="#statsGeneral"><em>General</em></a></li>',
            '            </ul>',
            '            <div id="oHt" class="yui-content">',
            '                <div id="statsEmpire"><div><label style="font-weight:bold;display:inline-block;width:50px;">Find:</label><span style="display:inline-block;width:300px;"><input type="text" id="statsEmpireFind" /></span></div><div id="statsEmpireTable"></div><div id="statsEmpirePaginator"></div></div>',
            '                <div id="statsAlliance"><div><label style="font-weight:bold;display:inline-block;width:50px;">Find:</label><span style="display:inline-block;width:300px;"><input type="text" id="statsAllianceFind" /></span></div><div id="statsAllianceTable"></div><div id="statsAlliancePaginator"></div></div>',
            '                <div id="statsColony"><div id="statsColonyTable"></div></div>',
            '                <div id="statsSpy"><div id="statsSpyTable"></div></div>',
            '                <div id="statsWeeklyMedal"><div id="statsWeeklyMedalTable"></div></div>',
            '                <div id="statsGeneral">',
            '                    <div id="statsGeneralTabs" class="yui-navset">',
            '                        <ul class="yui-nav">',
            '                            <li><a href="#statsGeneralBodies"><em>Bodies</em></a></li>',
            '                            <li><a href="#statsGeneralBuildings"><em>Buildings</em></a></li>',
            '                            <li><a href="#statsGeneralEmpires"><em>Empires</em></a></li>',
            '                            <li><a href="#statsGeneralOrbits"><em>Orbits</em></a></li>',
            '                            <li><a href="#statsGeneralShips"><em>Ships</em></a></li>',
            '                            <li><a href="#statsGeneralSpies"><em>Spies</em></a></li>',
            '                            <li><a href="#statsGeneralStars"><em>Stars</em></a></li>',
            '                            <li><a href="#statsGeneralGlyphs"><em>Glyphs</em></a></li>',
            '                        </ul>',
            '                        <div id="sHt" class="yui-content" style="overflow:auto;">',
            '                            <div id="statsGeneralBodies">',
            '                            </div>',
            '                            <div id="statsGeneralBuildings">',
            '                            </div>',
            '                            <div id="statsGeneralEmpires">',
            '                            </div>',
            '                            <div id="statsGeneralOrbits">',
            '                            </div>',
            '                            <div id="statsGeneralShips">',
            '                            </div>',
            '                            <div id="statsGeneralSpies">',
            '                            </div>',
            '                            <div id="statsGeneralStars">',
            '                            </div>',
            '                            <div id="statsGeneralGlyphs">',
            '                            </div>',
            '                        </div>',
            '                    </div>',
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="ft"></div>'
            ].join('');
        },

        getServerStats : function(){
            require('js/actions/menu/loader').show();
            Util.Connect.asyncRequest('GET', 'server_overview.json', {
                success: function(o) {
                    YAHOO.log(o, "info", "Stats.populateServerStats.success");
                    require('js/actions/menu/loader').hide();
                    try {
                        this._serverOverview = Lang.JSON.parse(o.responseText);
                        this.populateServerStats();
                    }
                    catch(ex) {
                        YAHOO.log(ex);
                    }
                },
                scope: this
            });
        },
        populateServerStats : function() {
            var data = this._serverOverview;

            Event.purgeElement(this.statsGeneralBodies);
            Event.purgeElement(this.statsGeneralBuildings);
            Event.purgeElement(this.statsGeneralOrbits);
            Event.purgeElement(this.statsGeneralShips);

            this.statsGeneralBodies.innerHTML = this._getBodiesHtml();
            this.statsGeneralBuildings.innerHTML = this._getBuildingsHtml();
            this.statsGeneralEmpires.innerHTML = this._getEmpiresHtml();
            this.statsGeneralOrbits.innerHTML = this._getOrbitsHtml();
            this.statsGeneralShips.innerHTML = this._getShipsHtml();
            this.statsGeneralSpies.innerHTML = this._getSpiesHtml();
            this.statsGeneralStars.innerHTML = this._getStarsHtml();
            this.statsGeneralGlyphs.innerHTML = this._getGlyphsHtml();

            Event.delegate(this.statsGeneralBodies, "click", this.expander, "label.statsSubHeader");
            Event.delegate(this.statsGeneralBuildings, "click", this.expander, "label.statsSubHeader");
            Event.delegate(this.statsGeneralOrbits, "click", this.expander, "label.statsSubHeader");
            Event.delegate(this.statsGeneralShips, "click", this.expander, "label.statsSubHeader");

            /*var r = Raphael("raphaelHolder"),
                fin = function () {
                    this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
                },
                fout = function () {
                    if(this.flag) {
                        this.flag.animate({opacity: 0}, 300, function () {this.remove();});
                    }
                },
                orbits = this._serverOverview.orbits;
            r.g.hbarchart(5, 10, 500, 400, [
                [orbits[1].bodies, orbits[2].bodies, orbits[3].bodies, orbits[4].bodies, orbits[5].bodies, orbits[6].bodies, orbits[7].bodies, orbits[8].bodies],
                [orbits[1].inhabited, orbits[2].inhabited, orbits[3].inhabited, orbits[4].inhabited, orbits[5].inhabited, orbits[6].inhabited, orbits[7].inhabited, orbits[8].inhabited]
            ], {
                type:"soft"
            }).hover(fin, fout).label([
                ["Orbit 1 Bodies", "Orbit 2 Bodies", "Orbit 3 Bodies", "Orbit 4 Bodies", "Orbit 5 Bodies", "Orbit 6 Bodies", "Orbit 7 Bodies", "Orbit 8 Bodies"],
                ["Orbit 1 Inhabited", "Orbit 2 Inhabited", "Orbit 3 Inhabited", "Orbit 4 Inhabited", "Orbit 5 Inhabited", "Orbit 6 Inhabited", "Orbit 7 Inhabited", "Orbit 8 Inhabited"]
            ],true);*/

        },
        expander : function(e, matchedEl, container){
            var ul = Sel.query("ul", matchedEl.parentNode, true);
            Dom.setStyle(ul, "display", (Dom.getStyle(ul, "display") == "none" ? "" : "none"));
        },
        _getBodiesHtml : function() {
            var data = this._serverOverview.bodies;
            return [
                '<ul class="statsList">',
                '<li><label>Total Bodies:</label>', Lib.formatNumber(data.count), '</li>',
                '<li><label>Colonies:</label>', Lib.formatNumber(data.colony_count), '</li>',
                '<li><label>Types</label>',
                '    <ul class="statsSubList">',
                '    <li><label class="statsSubHeader">Asteroids</label>',
                '        <ul style="display:none;">',
                '        <li><label>Total:</label>', Lib.formatNumber(data.types.asteroids.count), '</li>',
                '        <li><label>Average Orbit:</label>', data.types.asteroids.average_orbit, '</li>',
                '        <li><label>Average Size:</label>', data.types.asteroids.average_size, '</li>',
                '        <li><label>Largest Size:</label>', data.types.asteroids.largest_size, '</li>',
                '        <li><label>Smallest Size:</label>', data.types.asteroids.smallest_size, '</li>',
                '        </ul>',
                '    </li>',
                '    <li><label class="statsSubHeader">Gas Giants</label>',
                '        <ul style="display:none;">',
                '        <li><label>Total:</label>', Lib.formatNumber(data.types.gas_giants.count), '</li>',
                '        <li><label>Average Orbit:</label>', data.types.gas_giants.average_orbit, '</li>',
                '        <li><label>Average Size:</label>', data.types.gas_giants.average_size, '</li>',
                '        <li><label>Largest Size:</label>', data.types.gas_giants.largest_size, '</li>',
                '        <li><label>Smallest Size:</label>', data.types.gas_giants.smallest_size, '</li>',
                '        </ul>',
                '    </li>',
                '    <li><label class="statsSubHeader">Habitables</label>',
                '        <ul style="display:none;">',
                '        <li><label>Total:</label>', Lib.formatNumber(data.types.habitables.count), '</li>',
                '        <li><label>Average Orbit:</label>', data.types.habitables.average_orbit, '</li>',
                '        <li><label>Average Size:</label>', data.types.habitables.average_size, '</li>',
                '        <li><label>Largest Size:</label>', data.types.habitables.largest_size, '</li>',
                '        <li><label>Smallest Size:</label>', data.types.habitables.smallest_size, '</li>',
                '        </ul>',
                '    </li>',
                '    <li><label class="statsSubHeader">Stations</label>',
                '        <ul style="display:none;">',
                '        <li><label>Total:</label>', Lib.formatNumber(data.types.stations.count), '</li>',
                '        <li><label>Average Orbit:</label>', data.types.stations.average_orbit, '</li>',
                '        <li><label>Average Size:</label>', data.types.stations.average_size, '</li>',
                '        <li><label>Largest Size:</label>', data.types.stations.largest_size, '</li>',
                '        <li><label>Smallest Size:</label>', data.types.stations.smallest_size, '</li>',
                '        </ul>',
                '    </li>',
                '    </ul>',
                '</li>',
                '</ul>'
            ].join('');
        },
        _getBuildingsHtml : function() {
            var data = this._serverOverview.buildings,
                output = ['<ul class="statsList">',
                '<li><label>Total Buildings:</label>', Lib.formatNumber(data.count), '</li>',
                '<li><label>Types</label><ul class="statsSubList">'];

            var btArr = [];
            for(var bt in data.types) {
                if(data.types.hasOwnProperty(bt)) {
                    btArr[btArr.length] = bt;
                }
            }
            btArr.sort();

            for(var b=0, bLen = btArr.length; b<bLen; b++) {
                var key = btArr[b];
                output.push(['<li><label class="statsSubHeader">',key,'</label>',
                '    <ul style="display:none;">',
                '    <li><label>Total:</label>', Lib.formatNumber(data.types[key].count), '</li>',
                '    <li><label>Average Level:</label>', data.types[key].average_level, '</li>',
                '    <li><label>Highest Level:</label>', data.types[key].highest_level, '</li>',
                '    </ul>',
                '</li>'].join(''));
            }

            output.push('</ul></li></ul>');
            return output.join('');
        },
        _getEmpiresHtml : function() {
            var data = this._serverOverview.empires;
            return ['<ul class="statsList">',
                '<li><label>Total Empires:</label>', Lib.formatNumber(data.count), '</li>',
                '<li><label>Active This Week:</label>', Lib.formatNumber(data.active_this_week_count), '</li>',
                '<li><label>Active Today:</label>', Lib.formatNumber(data.active_today_count), '</li>',
                '<li><label>Currently Active:</label>', Lib.formatNumber(data.currently_active_count), '</li>',
                '<li><label>Average University Level:</label>', Lib.formatNumber(data.average_university_level), '</li>',
                '<li><label>Highest University Level:</label>', Lib.formatNumber(data.highest_university_level), '</li>',
                '<li><label>Empires Using Essentia:</label>', Lib.formatNumber(data.essentia_using_count), '</li>',
                '<li><label>Isolationist Empires:</label>', Lib.formatNumber(data.isolationist_count), '</li>',
                '</ul>'
                    ].join('');
                          },
_getOrbitsHtml : function() {
                     var data = this._serverOverview.orbits;

                     return  ['<ul class="statsList">',
                             '<li><label>Orbits</label><ul class="statsSubList">',
                             '<li><label class="statsSubHeader">One</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["1"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["1"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Two</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["2"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["2"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Three</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["3"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["3"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Four</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["4"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["4"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Five</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["5"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["5"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Six</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["6"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["6"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Seven</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["7"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["7"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '<li><label class="statsSubHeader">Eight</label>',
                             '    <ul style="display:none;">',
                             '    <li><label>Total Bodies:</label>', Lib.formatNumber(data["8"].bodies), '</li>',
                             '    <li><label>Inhabited:</label>', Lib.formatNumber(data["8"].inhabited), '</li>',
                             '    </ul>',
                             '</li>',
                             '</ul></li></ul>'].join('');
                 },
_getShipsHtml : function() {
                    var data = this._serverOverview.ships,
                    output = ['<ul class="statsList">',
                    '<li><label>Total Ships:</label>', Lib.formatNumber(data.count), '</li>',
                    '<li><label>Types</label><ul class="statsSubList">'];

                    for(var bt in data.types) {
                        if(data.types.hasOwnProperty(bt)) {
                            output.push(['<li><label class="statsSubHeader">',bt.titleCaps("_"," "),'</label>',
                                    '    <ul style="display:none;">',
                                    '    <li><label>Total:</label>', Lib.formatNumber(data.types[bt].count), '</li>',
                                    '    <li><label>Smallest Hold Size:</label>', Lib.formatNumber(data.types[bt].smallest_hold_size), '</li>',
                                    '    <li><label>Average Hold Size:</label>', Lib.formatNumber(data.types[bt].average_hold_size), '</li>',
                                    '    <li><label>Largest Hold Size:</label>', Lib.formatNumber(data.types[bt].largest_hold_size), '</li>',
                                    '    <li><label>Slowest Speed:</label>', Lib.formatNumber(data.types[bt].slowest_speed), '</li>',
                                    '    <li><label>Average Speed:</label>', Lib.formatNumber(data.types[bt].average_speed), '</li>',
                                    '    <li><label>Fastest Speed:</label>', Lib.formatNumber(data.types[bt].fastest_speed), '</li>',
                                    '    </ul>',
                                    '</li>'].join(''));
                        }
                    }

                    output.push('</ul></li></ul>');
                    return output.join('');
                },
_getSpiesHtml : function() {
                    var data = this._serverOverview.spies;
                    return ['<ul class="statsList">',
                           '<li><label>Total Spies:</label>', Lib.formatNumber(data.count), '</li>',
                           '<li><label>Average Defense:</label>', Lib.formatNumber(data.average_defense), '</li>',
                           '<li><label>Highest Defense:</label>', Lib.formatNumber(data.highest_defense), '</li>',
                           '<li><label>Average Offense:</label>', Lib.formatNumber(data.average_offense), '</li>',
                           '<li><label>Highest Offense:</label>', Lib.formatNumber(data.highest_offense), '</li>',
                           '<li><label>Average Intel XP:</label>', Lib.formatNumber(data.average_intel), '</li>',
                           '<li><label>Highest Intel XP:</label>', Lib.formatNumber(data.highest_intel), '</li>',
                           '<li><label>Average Mayhem XP:</label>', Lib.formatNumber(data.average_mayhem), '</li>',
                           '<li><label>Highest Mayhem XP:</label>', Lib.formatNumber(data.highest_mayhem), '</li>',
                           '<li><label>Average Politics XP:</label>', Lib.formatNumber(data.average_politics), '</li>',
                           '<li><label>Highest Politics XP:</label>', Lib.formatNumber(data.highest_politics), '</li>',
                           '<li><label>Average Theft XP:</label>', Lib.formatNumber(data.average_theft), '</li>',
                           '<li><label>Highest Theft XP:</label>', Lib.formatNumber(data.highest_theft), '</li>',
                           '<li><label>Idle:</label>', Lib.formatNumber(data.idle_count), '</li>',
                           '<li><label>Travelling:</label>', Lib.formatNumber(data.travelling_count), '</li>',
                           '<li><label>Countering Espionage:</label>', Lib.formatNumber(data.countering_espionage_count), '</li>',
                           '<li><label>Doing Sweeps:</label>', Lib.formatNumber(data.security_count), '</li>',
                           '<li><label>At the Ministry of Truth:</label>', Lib.formatNumber(data.propaganda_count), '</li>',
                           '<li><label>Training:</label>', Lib.formatNumber(data.training_count), '</li>',
                           '<li><label>Extra Training:</label>', Lib.formatNumber(data.extra_training_count), '</li>',
                           '<li><label>Gathering Intelligence:</label>', Lib.formatNumber(data.gathering_intelligence_count), '</li>',
                           '<li><label>Hacking Networks:</label>', Lib.formatNumber(data.hacking_networks_count), '</li>',
                           '<li><label>Inciting:</label>', Lib.formatNumber(data.inciting_count), '</li>',
                           '<li><label>Sabotaging:</label>', Lib.formatNumber(data.sabotaging_count), '</li>',
                           '<li><label>Appropriating:</label>', Lib.formatNumber(data.stealing_count), '</li>',
                           '<li><label>Extraction:</label>', Lib.formatNumber(data.extraction_count), '</li>',
                           '<li><label>Antipersonal:</label>', Lib.formatNumber(data.antipersonal_count), '</li>',
                           '<li><label>Infiltrating:</label>', Lib.formatNumber(data.infiltrating_count), '</li>',
                           '<li><label>In Prison:</label>', Lib.formatNumber(data.in_prison_count), '</li>',
                           '<li><label>For Sale:</label>', Lib.formatNumber(data.for_sale_count), '</li>',
                           '<li><label>Unconscious:</label>', Lib.formatNumber(data.unconscious_count), '</li>',
                           '</ul>'
                               ].join('');
                },
_getStarsHtml : function() {
                    var data = this._serverOverview.stars;
                    return ['<ul class="statsList">',
                           '<li><label>Total Stars:</label>', Lib.formatNumber(data.count), '</li>',
                           '<li><label>Seized Stars:</label>', Lib.formatNumber(data.seized_count), '</li>',
                           '<li><label>Probed Stars:</label>', Lib.formatNumber(data.probed_count), '</li>',
                           '<li><label>Total Probes:</label>', Lib.formatNumber(data.probes_count), '</li>',
                           '</ul>'
                               ].join('');
                },
_getGlyphsHtml : function() {
                    var data = this._serverOverview.glyphs,
                        output = ['<ul class="statsList">'];
                    var glyphs = new Array;
                    var i = 0;
                    for (var bt in data.types) {
                        glyphs[i]= {type: bt, count: data.types[bt]};
                        i++;
                    }
                    glyphs.sort(function(a,b){return a.count - b.count});
                    for (var i = 0; i < glyphs.length; i++) {
                        output.push(['<li><label>',glyphs[i].type,':</label>',Lib.formatNumber(glyphs[i].count),'</li>'].join(''));
                    }
                    return output.join('');
                },

formatPercent : function(el, oRecord, oColumn, oData) {
                    el.innerHTML = Util.Number.format(Math.round(oData*100),{thousandsSeparator:",",suffix:"%"});
                },
EmpireStats : function(){
                  if(this.EmpireTable) {
                      this.EmpireTable.requery();
                  }
                  else {
                      this.EmpireFindCreate();

                      this.EmpireColumns = [
                      {key:"rank", label:"Rank",formatter:function(el, oRecord, oColumn, oData) {
                                                                                                    var oState = this.getState();
                                                                                                    el.innerHTML = Math.floor(oState.pagination.recordOffset + this.rankCounter++);
                                                                                                }},
                      {key:"empire_name", label:"Empire"},
                      {key:"alliance_name", label:"Alliance"},
                      {key:"colony_count", label:"Colonies", formatter:"number"},
                      {key:"population", label:"Pop", formatter:"number"},
                      {key:"empire_size", label:"Empire Size", formatter:"number", sortable:true},
                      {key:"building_count", label:"Buildings", formatter:"number"},
                      {key:"average_building_level", label:"Avg Bld", formatter:"number"},
                      {key:"offense_success_rate", label:"Offense", formatter:this.formatPercent, sortable:true},
                      {key:"defense_success_rate", label:"Defense", formatter:this.formatPercent, sortable:true},
                      {key:"dirtiest", label:"Dirtiest", formatter:"number", sortable:true}
                      ];

                      this.EmpireData = new Util.XHRDataSource("/stats");
                      this.EmpireData.connMethodPost = "POST";
                      this.EmpireData.maxCacheEntries = 2;
                      this.EmpireData.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                      this.EmpireData.responseSchema = {
resultsList : "result.empires",
              fields : [    "empire_id","empire_name",
              "alliance_id","alliance_name",
              {key:"colony_count",parser:"number"},
              {key:"population",parser:"number"},
              {key:"empire_size",parser:"number"},
              {key:"building_count",parser:"number"},
              {key:"average_building_level",parser:"number"},
              {key:"offense_success_rate",parser:"number"},
              {key:"defense_success_rate",parser:"number"},
              {key:"dirtiest",parser:"number"}
              ],
                  metaFields: {
totalRecords: "result.total_empires", // Access to value in the server response
              pageNumber: "result.page_number"
                  }
                      };

                      var eHt = Game.GetSize().h - 115;
                      if(eHt > 375) { eHt = 375; }
                      this.EmpireTable = new YAHOO.widget.ScrollingDataTable("statsEmpireTable", this.EmpireColumns, this.EmpireData, {
width:"100%",
height:eHt + "px",
initialRequest: Lang.JSON.stringify({
    "id": YAHOO.rpc.Service._requestId++,
    "method": "empire_rank",
    "jsonrpc": "2.0",
    "params": [
                                Game.GetSession(""),
                                "empire_size_rank"
                            ]
                        }),
                    dynamicData: true,
                    sortedBy : {key:"empire_size", dir:YAHOO.widget.DataTable.CLASS_DSC},
                    paginator: new YAHOO.widget.Paginator({ rowsPerPage:25, containers:'statsEmpirePaginator' }),
                    selectionMode:"single"
                } );
                this.EmpireTable.rankCounter = 1;
                // Subscribe to events for row selection
                this.EmpireTable.subscribe("rowMouseoverEvent", this.EmpireTable.onEventHighlightRow);
                this.EmpireTable.subscribe("rowMouseoutEvent", this.EmpireTable.onEventUnhighlightRow);
                this.EmpireTable.subscribe("rowClickEvent", this.EmpireTable.onEventSelectRow);
                this.EmpireTable.subscribe("cellMouseoverEvent", this.EmpireTable.onEventHighlightCell);
                this.EmpireTable.subscribe("cellHighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name" || oArgs.key == "alliance_name") {
                        Dom.setStyle(oArgs.el, "cursor", "help");
                    }
                });
                this.EmpireTable.subscribe("cellMouseoutEvent", this.EmpireTable.onEventUnhighlightCell);
                this.EmpireTable.subscribe("cellUnhighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name" || oArgs.key == "alliance_name") {
                        Dom.setStyle(oArgs.el, "cursor", "auto");
                    }
                });
                this.EmpireTable.subscribe("cellClickEvent", function(ev) {
                    var target = Event.getTarget(ev),
                        column = this.getColumn(target),
                        record;
                    if (column.key == "empire_name") {
                        record = this.getRecord(target);
                        Lacuna.Info.Empire.Load(record.getData("empire_id"));
                    }
                    else if (column.key == "alliance_name") {
                        record = this.getRecord(target);
                        Lacuna.Info.Alliance.Load(record.getData("alliance_id"));
                    }
                });
                this.EmpireTable.subscribe("postRenderEvent", function(){
                    var els = this.getSelectedTrEls();
                    if(els && els.length > 0) {
                        this._elBdContainer.scrollTop = els[els.length-1].offsetTop;
                    }
                });

                this.EmpireTable.handleDataReturnPayload = function(oRequest, oResponse, oPayload) {
                    oPayload.totalRecords = oResponse.meta.totalRecords;
                    var pn = oResponse.meta.pageNumber-1;
                    oPayload.pagination = {
                        rowsPerPage:25,
                        recordOffset:(pn*25)
                    };
                    return oPayload;
                };
                this.EmpireTable.requery = function(page) {
                    // Get the current state
                    var oState = this.getState();

                    if(Lang.isNumber(page)) {
                        oState.pagination.recordOffset = (page-1)*25;
                        oState.pagination.page = page;
                    }

                    // Get the request for the new state
                    var request = this.get("generateRequest")(oState, this);

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                this.EmpireTable.find = function(id, page) {
                    // Get the current state
                    var oState = this.getState(),
                        sort = (oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey();

                    oState.pagination.recordOffset = (page-1)*25;
                    oState.pagination.page = page;

                    this.rankCounter = 1;
                    this.selectedEmpireId = id;

                    var request = Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "empire_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank',
                                page
                            ]
                        });

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                //overriding generateRequest to send the correct column name back
                this.EmpireTable.set("generateRequest", function(oState, oSelf) {
                    // Set defaults
                    oState = oState || {pagination:null, sortedBy:null};
                    var sort = encodeURIComponent((oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey()),
                        dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "desc" : "asc",
                        page = (oState.pagination) ? oState.pagination.page : 1;

                    oSelf.rankCounter = 1;
                    delete oSelf.selectedEmpireId;

                    return Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "empire_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank',
                                page
                            ]
                        });
                });
                this.EmpireTable.set("formatRow", function(elTr, oRecord) {
                    if(this.selectedEmpireId && oRecord.getData("empire_id") == this.selectedEmpireId) {
                        this.selectRow(oRecord);
                    }
                    return true;
                });
            }
        },
        EmpireFindCreate : function() {
            var dataSource = new Util.XHRDataSource("/stats");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.empires",
                fields : ["empire_name","empire_id","page_number"]
            };

            var oTextboxList = new YAHOO.lacuna.TextboxList("statsEmpireFind", dataSource, { //config options
                maxResultsDisplayed: 10,
                minQueryLength:3,
                multiSelect:false,
                forceSelection:true,
                formatResultLabelKey:"empire_name",
                formatResultColumnKeys:["empire_name"],
                useIndicator:true
            });
            oTextboxList.generateRequest = function(sQuery){
                var state = Lacuna.Stats.EmpireTable.getState(),
                    s = Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": "find_empire_rank",
                        "jsonrpc": "2.0",
                        "params": [
                            Game.GetSession(""),
                            state.sortedBy+"_rank",
                            decodeURIComponent(sQuery)
                        ]
                    });
                return s;
            };
            oTextboxList.itemSelectEvent.subscribe(function(e, oArgs) {
                oArgs[0]._elTextbox.value = "";
                var data = oArgs[2];
                Lacuna.Stats.EmpireTable.find(data.empire_id, data.page_number);
            });

            this.empireFind = oTextboxList;
        },
        AllianceStats : function(){
            if(this.AllianceTable) {
                this.AllianceTable.requery();
            }
            else {
                this.AllianceFindCreate();

                this.AllianceColumns = [
                    {key:"rank", label:"Rank",formatter:function(el, oRecord, oColumn, oData) {
                        var oState = this.getState();
                        el.innerHTML = Math.floor(oState.pagination.recordOffset + this.rankCounter++);
                    }},
                    {key:"alliance_name", label:"Alliance"},
                    {key:"member_count", label:"Members", formatter:"number"},
                    {key:"colony_count", label:"Colonies", formatter:"number"},
                    {key:"population", label:"Pop", formatter:"number", sortable:true},
                    {key:"influence", label:"Influence", formatter:"number", sortable:true},
                    {key:"space_station_count", label:"Stations", formatter:"number", sortable:true},
                    {key:"average_empire_size", label:"Avg Emp", formatter:"number", sortable:true},
                    {key:"building_count", label:"Buildings", formatter:"number"},
                    {key:"average_building_level", label:"Avg Bld", formatter:"number"},
                    {key:"offense_success_rate", label:"Offense", formatter:this.formatPercent, sortable:true},
                    {key:"defense_success_rate", label:"Defense", formatter:this.formatPercent, sortable:true},
                    {key:"dirtiest", label:"Dirtiest", formatter:"number", sortable:true}
                ];

                this.AllianceData = new Util.XHRDataSource("/stats");
                this.AllianceData.connMethodPost = "POST";
                this.AllianceData.maxCacheEntries = 2;
                this.AllianceData.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                this.AllianceData.responseSchema = {
                    resultsList : "result.alliances",
                    fields : [    "alliance_id","alliance_name",
                                {key:"member_count",parser:"number"},
                                {key:"space_station_count",parser:"number"},
                                {key:"influence",parser:"number"},
                                {key:"colony_count",parser:"number"},
                                {key:"population",parser:"number"},
                                {key:"average_empire_size",parser:"number"},
                                {key:"building_count",parser:"number"},
                                {key:"average_building_level",parser:"number"},
                                {key:"offense_success_rate",parser:"number"},
                                {key:"defense_success_rate",parser:"number"},
                                {key:"dirtiest",parser:"number"}
                            ],
                    metaFields: {
                        totalRecords: "result.total_alliances", // Access to value in the server response
                        pageNumber: "result.page_number"
                    }
                };

                var aHt = Game.GetSize().h - 115;
                if (aHt > 375 ) { aHt = 375; }
                this.AllianceTable = new YAHOO.widget.ScrollingDataTable("statsAllianceTable", this.AllianceColumns, this.AllianceData, {
                    width:"100%",
                    height:aHt + "px",
                    initialRequest: Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "alliance_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession("")
                            ]
                        }),
                    dynamicData: true,
                    sortedBy : {key:"influence", dir:YAHOO.widget.DataTable.CLASS_DSC},
                    paginator: new YAHOO.widget.Paginator({ rowsPerPage:25, containers:'statsAlliancePaginator' }),
                    selectionMode:"single"
                } );
                this.AllianceTable.rankCounter = 1;
                // Subscribe to events for row selection
                this.AllianceTable.subscribe("rowMouseoverEvent", this.AllianceTable.onEventHighlightRow);
                this.AllianceTable.subscribe("rowMouseoutEvent", this.AllianceTable.onEventUnhighlightRow);
                this.AllianceTable.subscribe("rowClickEvent", this.AllianceTable.onEventSelectRow);
                this.AllianceTable.subscribe("cellMouseoverEvent", this.AllianceTable.onEventHighlightCell);
                this.AllianceTable.subscribe("cellHighlightEvent", function(oArgs) {
                    if (oArgs.key == "alliance_name") {
                        Dom.setStyle(oArgs.el, "cursor", "help");
                    }
                });
                this.AllianceTable.subscribe("cellMouseoutEvent", this.AllianceTable.onEventUnhighlightCell);
                this.AllianceTable.subscribe("cellUnhighlightEvent", function(oArgs) {
                    if (oArgs.key == "alliance_name") {
                        Dom.setStyle(oArgs.el, "cursor", "auto");
                    }
                });
                this.AllianceTable.subscribe("cellClickEvent", function(ev) {
                    var target = Event.getTarget(ev),
                        column = this.getColumn(target);
                    if (column.key == "alliance_name") {
                        var record = this.getRecord(target);
                        Lacuna.Info.Alliance.Load(record.getData("alliance_id"));
                    }
                });
                this.AllianceTable.subscribe("postRenderEvent", function(){
                    var els = this.getSelectedTrEls();
                    if(els && els.length > 0) {
                        this._elBdContainer.scrollTop = els[els.length-1].offsetTop;
                    }
                });

                this.AllianceTable.handleDataReturnPayload = function(oRequest, oResponse, oPayload) {
                    oPayload.totalRecords = oResponse.meta.totalRecords;
                    var pn = oResponse.meta.pageNumber-1;
                    oPayload.pagination = {
                        rowsPerPage:25,
                        recordOffset:(pn*25)
                    };
                    return oPayload;
                };
                this.AllianceTable.requery = function(page) {
                    // Get the current state
                    var oState = this.getState();

                    if(Lang.isNumber(page)) {
                        oState.pagination.recordOffset = (page-1)*25;
                        oState.pagination.page = page;
                    }

                    // Get the request for the new state
                    var request = this.get("generateRequest")(oState, this);

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                this.AllianceTable.find = function(id, page) {
                    // Get the current state
                    var oState = this.getState(),
                        sort = (oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey();

                    oState.pagination.recordOffset = (page-1)*25;
                    oState.pagination.page = page;

                    this.rankCounter = 1;
                    this.selectedAllianceId = id;

                    var request = Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "alliance_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank',
                                page
                            ]
                        });

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                //overriding generateRequest to send the correct column name back
                this.AllianceTable.set("generateRequest", function(oState, oSelf) {
                    // Set defaults
                    oState = oState || {pagination:null, sortedBy:null};
                    var sort = encodeURIComponent((oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey()),
                        dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "desc" : "asc",
                        page = (oState.pagination) ? oState.pagination.page : 1;

                    oSelf.rankCounter = 1;
                    delete oSelf.selectedAllianceId;

                    return Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "alliance_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank',
                                page
                            ]
                        });
                });
                this.AllianceTable.set("formatRow", function(elTr, oRecord) {
                    if(this.selectedAllianceId && oRecord.getData("alliance_id") == this.selectedAllianceId) {
                        this.selectRow(oRecord);
                    }
                    return true;
                });
            }
        },
        AllianceFindCreate : function() {
            var dataSource = new Util.XHRDataSource("/stats");
            dataSource.connMethodPost = "POST";
            dataSource.maxCacheEntries = 2;
            dataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
            dataSource.responseSchema = {
                resultsList : "result.alliances",
                fields : ["alliance_name","alliance_id","page_number"]
            };

            var oTextboxList = new YAHOO.lacuna.TextboxList("statsAllianceFind", dataSource, { //config options
                maxResultsDisplayed: 10,
                minQueryLength:3,
                multiSelect:false,
                forceSelection:true,
                formatResultLabelKey:"alliance_name",
                formatResultColumnKeys:["alliance_name"],
                useIndicator:true
            });
            oTextboxList.generateRequest = function(sQuery){
                var state = Lacuna.Stats.AllianceTable.getState(),
                    s = Lang.JSON.stringify({
                        "id": YAHOO.rpc.Service._requestId++,
                        "method": "find_alliance_rank",
                        "jsonrpc": "2.0",
                        "params": [
                            Game.GetSession(""),
                            state.sortedBy+"_rank",
                            sQuery
                        ]
                    });
                return s.replace(/%20/g, ' ');
            };
            oTextboxList.itemSelectEvent.subscribe(function(e, oArgs) {
                oArgs[0]._elTextbox.value = "";
                var data = oArgs[2];
                Lacuna.Stats.AllianceTable.find(data.alliance_id, data.page_number);
            });

            this.allianceFind = oTextboxList;
        },
        ColonyStats : function(){
            if(this.ColonyTable) {
                this.ColonyTable.requery();
            }
            else {

                this.ColonyColumns = [
                    {key:"rank", label:"Rank",formatter:function(el, oRecord, oColumn, oData) {
                        el.innerHTML = this.rankCounter++;
                    }},
                    {key:"empire_name", label:"Empire"},
                    {key:"planet_name", label:"Colony"},
                    {key:"population", label:"Pop", sortable:true},
                    {key:"building_count", label:"Buildings"},
                    {key:"average_building_level", label:"Avg Bld Lvl"},
                    {key:"highest_building_level", label:"High Bld Lvl"}
                ];

                this.ColonyData = new Util.XHRDataSource("/stats");
                this.ColonyData.connMethodPost = "POST";
                this.ColonyData.maxCacheEntries = 2;
                this.ColonyData.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                this.ColonyData.responseSchema = {
                    resultsList : "result.colonies",
                    fields : [    "empire_id","empire_name",
                                {key:"planet_id",parser:"number"},
                                {key:"planet_name"},
                                {key:"population",parser:"number"},
                                {key:"building_count",parser:"number"},
                                {key:"average_building_level",parser:"number"},
                                {key:"highest_building_level",parser:"number"}
                            ]
                };

                var cHt = Game.GetSize().h - 115;
                if(cHt > 410) { cHt = 410; }
                this.ColonyTable = new YAHOO.widget.ScrollingDataTable("statsColonyTable", this.ColonyColumns, this.ColonyData, {
                    width:"100%",
                    height:cHt + "px",
                    initialRequest: Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "colony_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                "population"
                            ]
                        }),
                    dynamicData: true,
                    sortedBy : {key:"population", dir:YAHOO.widget.DataTable.CLASS_DSC},
                    selectionMode:"single"
                } );
                this.ColonyTable.rankCounter = 1;
                // Subscribe to events for row selection
                this.ColonyTable.subscribe("rowMouseoverEvent", this.ColonyTable.onEventHighlightRow);
                this.ColonyTable.subscribe("rowMouseoutEvent", this.ColonyTable.onEventUnhighlightRow);
                this.ColonyTable.subscribe("rowClickEvent", this.ColonyTable.onEventSelectRow);
                this.ColonyTable.subscribe("cellMouseoverEvent", this.ColonyTable.onEventHighlightCell);
                this.ColonyTable.subscribe("cellHighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "help");
                    }
                });
                this.ColonyTable.subscribe("cellMouseoutEvent", this.ColonyTable.onEventUnhighlightCell);
                this.ColonyTable.subscribe("cellUnhighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "auto");
                    }
                });
                this.ColonyTable.subscribe("cellClickEvent", function(ev) {
                    var target = Event.getTarget(ev),
                        column = this.getColumn(target);
                    if (column.key == "empire_name") {
                        var record = this.getRecord(target);
                        Lacuna.Info.Empire.Load(record.getData("empire_id"));
                    }
                });

                this.ColonyTable.requery = function() {
                    // Get the current state
                    var oState = this.getState();

                    // Reset record offset, if paginated
                    if(oState.pagination) {
                        oState.pagination.recordOffset = 0;
                    }

                    // Get the request for the new state
                    var request = this.get("generateRequest")(oState, this);

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                //overriding generateRequest to send the correct column name back
                this.ColonyTable.set("generateRequest", function(oState, oSelf) {
                    // Set defaults
                    oState = oState || {pagination:null, sortedBy:null};
                    var sort = encodeURIComponent((oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey()),
                        dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "desc" : "asc",
                        page = (oState.pagination) ? oState.pagination.page : 1;

                    oSelf.rankCounter = 1;

                    return Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "colony_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank'
                            ]
                        });
                });
            }
        },
        SpyStats : function(){
            if(this.SpyTable) {
                this.SpyTable.requery();
            }
            else {

                this.SpyColumns = [
                    {key:"rank", label:"Rank",formatter:function(el, oRecord, oColumn, oData) {
                        el.innerHTML = this.rankCounter++;
                    }},
                    {key:"empire_name", label:"Empire"},
                    {key:"spy_name", label:"Spy"},
                    {key:"age", label:"Age",formatter:function(el, oRecord, oColumn, oData) {
                        el.innerHTML = Lib.formatTime(oData);
                    }},
                    {key:"level", label:"Level", sortable:true},
                    {key:"success_rate", label:"Success Rate", formatter:this.formatPercent, sortable:true},
                    {key:"dirtiest", label:"Dirtiest", sortable:true}
                ];

                this.SpyData = new Util.XHRDataSource("/stats");
                this.SpyData.connMethodPost = "POST";
                this.SpyData.maxCacheEntries = 2;
                this.SpyData.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                this.SpyData.responseSchema = {
                    resultsList : "result.spies",
                    fields : [    "empire_id","empire_name",
                                {key:"spy_id",parser:"number"},
                                "spy_name",
                                {key:"age",parser:"number"},
                                {key:"level",parser:"number"},
                                {key:"success_rate",parser:"number"},
                                {key:"dirtiest",parser:"number"}
                            ]
                };

                var sHt = Game.GetSize().h - 115;
                if(sHt > 410) { sHt = 410; }
                this.SpyTable = new YAHOO.widget.ScrollingDataTable("statsSpyTable", this.SpyColumns, this.SpyData, {
                    width:"100%",
                    height:sHt + "px",
                    initialRequest: Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "spy_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                "level"
                            ]
                        }),
                    dynamicData: true,
                    sortedBy : {key:"level", dir:YAHOO.widget.DataTable.CLASS_DSC},
                    selectionMode:"single"
                } );
                this.SpyTable.rankCounter = 1;
                // Subscribe to events for row selection
                this.SpyTable.subscribe("rowMouseoverEvent", this.SpyTable.onEventHighlightRow);
                this.SpyTable.subscribe("rowMouseoutEvent", this.SpyTable.onEventUnhighlightRow);
                this.SpyTable.subscribe("rowClickEvent", this.SpyTable.onEventSelectRow);
                this.SpyTable.subscribe("cellMouseoverEvent", this.SpyTable.onEventHighlightCell);
                this.SpyTable.subscribe("cellHighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "help");
                    }
                });
                this.SpyTable.subscribe("cellMouseoutEvent", this.SpyTable.onEventUnhighlightCell);
                this.SpyTable.subscribe("cellUnhighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "auto");
                    }
                });
                this.SpyTable.subscribe("cellClickEvent", function(ev) {
                    var target = Event.getTarget(ev),
                        column = this.getColumn(target);
                    if (column.key == "empire_name") {
                        var record = this.getRecord(target);
                        Lacuna.Info.Empire.Load(record.getData("empire_id"));
                    }
                });

                this.SpyTable.requery = function() {
                    // Get the current state
                    var oState = this.getState();

                    // Reset record offset, if paginated
                    if(oState.pagination) {
                        oState.pagination.recordOffset = 0;
                    }

                    // Get the request for the new state
                    var request = this.get("generateRequest")(oState, this);

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                //overriding generateRequest to send the correct column name back
                this.SpyTable.set("generateRequest", function(oState, oSelf) {
                    // Set defaults
                    oState = oState || {pagination:null, sortedBy:null};
                    var sort = encodeURIComponent((oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey()),
                        dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "desc" : "asc",
                        page = (oState.pagination) ? oState.pagination.page : 1;

                    oSelf.rankCounter = 1;

                    return Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "spy_rank",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession(""),
                                sort+'_rank'
                            ]
                        });
                });
            }
        },
        WeeklyMedalStats : function(){
            if(this.WeeklyMedalTable) {
                this.WeeklyMedalTable.requery();
            }
            else {

                this.WeeklyMedalColumns = [
                    {key:"empire_name", label:"Empire"},
                    {key:"medal_name", label:"Medal Name"},
                    {key:"times_earned", label:"Times Earned"},
                    {key:"medal_image", label:"Medal", formatter:function(elLiner, oRecord, oColumn, oData) {
                        var name = oRecord.getData("medal_name");
                        elLiner.innerHTML = ['<img src="',Lib.AssetUrl,'medal/',oData,'.png" alt="',name,'" title="',name,'" />'].join('');
                    }}
                ];

                this.WeeklyMedalData = new Util.XHRDataSource("/stats");
                this.WeeklyMedalData.connMethodPost = "POST";
                this.WeeklyMedalData.maxCacheEntries = 2;
                this.WeeklyMedalData.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
                this.WeeklyMedalData.responseSchema = {
                    resultsList : "result.winners",
                    fields : [    "empire_id",
                                "empire_name",
                                "medal_name",
                                "medal_image",
                                {key:"times_earned",parser:"number"}
                            ],
                    metaFields: {
                        totalRecords: "result.total_spies" // Access to value in the server response
                    }
                };

                var wHt = Game.GetSize().h - 115;
                if(wHt > 410) { wHt = 410; }
                this.WeeklyMedalTable = new YAHOO.widget.ScrollingDataTable("statsWeeklyMedalTable", this.WeeklyMedalColumns, this.WeeklyMedalData, {
                    width:"100%",
                    height:wHt + "px",
                    initialRequest: Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "weekly_medal_winners",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession("")
                            ]
                        }),
                    dynamicData: true,
                    selectionMode:"single"
                } );
                // Subscribe to events for row selection
                this.WeeklyMedalTable.subscribe("rowMouseoverEvent", this.WeeklyMedalTable.onEventHighlightRow);
                this.WeeklyMedalTable.subscribe("rowMouseoutEvent", this.WeeklyMedalTable.onEventUnhighlightRow);
                this.WeeklyMedalTable.subscribe("rowClickEvent", this.WeeklyMedalTable.onEventSelectRow);
                this.WeeklyMedalTable.subscribe("cellMouseoverEvent", this.WeeklyMedalTable.onEventHighlightCell);
                this.WeeklyMedalTable.subscribe("cellHighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "help");
                    }
                });
                this.WeeklyMedalTable.subscribe("cellMouseoutEvent", this.WeeklyMedalTable.onEventUnhighlightCell);
                this.WeeklyMedalTable.subscribe("cellUnhighlightEvent", function(oArgs) {
                    if (oArgs.key == "empire_name") {
                        Dom.setStyle(oArgs.el, "cursor", "auto");
                    }
                });
                this.WeeklyMedalTable.subscribe("cellClickEvent", function(ev) {
                    var target = Event.getTarget(ev),
                        column = this.getColumn(target);
                    if (column.key == "empire_name") {
                        var record = this.getRecord(target);
                        Lacuna.Info.Empire.Load(record.getData("empire_id"));
                    }
                });

                this.WeeklyMedalTable.requery = function() {
                    // Get the current state
                    var oState = this.getState();

                    // Reset record offset, if paginated
                    if(oState.pagination) {
                        oState.pagination.recordOffset = 0;
                    }

                    // Get the request for the new state
                    var request = this.get("generateRequest")(oState, this);

                    // Purge selections
                    this.unselectAllRows();
                    this.unselectAllCells();

                    // Get the new data from the server
                    var callback = {
                        success : this.onDataReturnSetRows,
                        failure : this.onDataReturnSetRows,
                        argument : oState, // Pass along the new state to the callback
                        scope : this
                    };
                    this._oDataSource.sendRequest(request, callback);
                };
                //overriding generateRequest to send the correct column name back
                this.WeeklyMedalTable.set("generateRequest", function(oState, oSelf) {
                    // Set defaults
                    oState = oState || {pagination:null, sortedBy:null};
                    var sort = encodeURIComponent((oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey()),
                        dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "desc" : "asc",
                        page = (oState.pagination) ? oState.pagination.page : 1;

                    return Lang.JSON.stringify({
                            "id": YAHOO.rpc.Service._requestId++,
                            "method": "weekly_medal_winners",
                            "jsonrpc": "2.0",
                            "params": [
                                Game.GetSession("")
                            ]
                        });
                });
            }
        },

        show : function() {
            Lacuna.Stats.build();
            //this is called out of scope so make sure to pass the correct scope in
            Lacuna.Stats.EmpireStats();
            Game.OverlayManager.hideAll();

            var oHt = Game.GetSize().h - 40;
            if(oHt > 450) { oHt = 450; }
            var sHt = oHt - 10;
            Dom.setStyle(Dom.get('oHt'),'height',oHt + 'px');
            Dom.setStyle(Dom.get('sHt'),'height',sHt + 'px');

            Lacuna.Stats.Panel.show();
            Lacuna.Stats.Panel.center();
        },
        hide : function() {
            this.Panel.hide();
        },
        Reset : function() {
            if(this.AllianceTable) {
                this.AllianceTable.requery(1);
            }
            if(this.EmpireTable) {
                this.EmpireTable.requery(1);
            }
        }
    };

    Lacuna.Stats = new Stats();
})();
YAHOO.register("stats", YAHOO.lacuna.Stats, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
