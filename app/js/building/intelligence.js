YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Intelligence == "undefined" || !YAHOO.lacuna.buildings.Intelligence) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Pager = YAHOO.widget.Paginator,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Intelligence = function(result){
        Intelligence.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Intelligence;
    };
    
    Lang.extend(Intelligence, Lacuna.buildings.Building, {
        destroy : function() {
            if(this.pager) {
                this.pager.destroy();
            }
            Intelligence.superclass.destroy.call(this);
        },
        getChildTabs : function() {
            return [this._getTrainTab(), this._getSpiesTab()];
        },
        _getTrainTab : function() {
            var spies = this.result.spies;
            this.trainTab = new YAHOO.widget.Tab({ label: "Train Spies", content: [
                '<div class="yui-g">',
                '    <div class="yui-u first">',
                '        <ul>',
                '            <li><span style="font-weight:bold;">Spies:</span> <span id="spiesCurrent">',spies.current,'</span> of ',spies.maximum,'</li>',
                '            <li id="spiesTrainOptions"><span style="font-weight:bold;">Train:</span> <select id="spiesTrainNumber"></select> new spies. <button type="button" id="spiesTrain">Train</button></li>',
                '        </ul>',
                '    </div>',
                '    <div class="yui-u">',
                '        <ul>',
                '            <li>Training Costs</li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',spies.training_costs.food,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',spies.training_costs.ore,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',spies.training_costs.water,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',spies.training_costs.energy,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',spies.training_costs.waste,'</span></li>',
                '            <li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(spies.training_costs.time),'</span></li>',
                '        </ul>',
                '    </div>',
                '</div>'
            ].join('')});
            this.trainTab.subscribe("activeChange", this.trainView, this, true);
            var btn = Sel.query("button", this.trainTab.get("contentEl"), true);
            if(btn) {
                Event.on(btn, "click", this.SpyTrain, this, true);
            }
            
            return this.trainTab;
        },
        _getSpiesTab : function() {
            this.spiesTab = new YAHOO.widget.Tab({ label: "Spies", content: [
                '<div>',
                '    <p id="spiesSubsidizeOffer" style="display:none;">You may subsidize training for 1 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per spy. <button type="button" id="spiesSubsidize">Subsidize</button></p>',
                '    <div>',
                '        <div id="spiesDetails">',
                '        </div>',
                '    </div>',
                '    <div id="spyPaginator"></div>',
                '</div>'
            ].join('')});
            this.spiesTab.subscribe("activeChange", this.spiesView, this, true);

            Event.on("spiesSubsidize", "click", this.Subsidize, this, true);
                    
            return this.spiesTab;
        },
        
        trainView : function(e) {
            var spies = this.result.spies;
            var canTrain = spies.maximum - spies.current;
            Dom.get("spiesCurrent").innerHTML = spies.current;
            if (canTrain > 0) {
                Dom.setStyle('spiesTrainOptions', 'display', '');
                var elNumSelect = Dom.get('spiesTrainNumber');
                if (canTrain > 5) {
                    canTrain = 5;
                }
                var currentNum = elNumSelect.children.length;
                for (var i = canTrain; i < currentNum; i++) {
                    elNumSelect.removeChild(elNumSelect.lastChild);
                }
                for (var n = currentNum + 1; n <= canTrain; n++) {
                    var elOption = document.createElement('option');
                    elOption.value = n;
                    elOption.innerHTML = n;
                    elNumSelect.appendChild(elOption);
                }
            }
            else {
                Dom.setStyle('spiesTrainOptions', 'display', 'none');
            }

        },
        spiesView : function(e) {
            if(e.newValue) {
                if(!this.spies) {
                    require('js/actions/menu/loader').show();
                    this.service.view_spies({session_id:Game.GetSession(),building_id:this.building.id}, {
                        success : function(o){
                            YAHOO.log(o, "info", "Intelligence.Intelligence.view_spies.success");
                            require('js/actions/menu/loader').hide();
                            this.rpcSuccess(o);
                            this.spies = o.result;
                            this.pager = new Pager({
                                rowsPerPage : 30,
                                totalRecords: o.result.spy_count,
                                containers  : 'spyPaginator',
                                template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
                                alwaysVisible : false

                            });
                            this.pager.subscribe('changeRequest',this.SpyHandlePagination, this, true);
                            this.pager.render();
                            
                            this.SpyPopulate();
                        },
                        scope:this
                    });
                }
                else {
                    this.SpyPopulate();
                }
            }
        },

        SpyInfo : function(spy) {
            var assign = spy.possible_assignments,
                div = document.createElement("div"),
                ul = document.createElement("ul"),
                li = document.createElement("li"),
                isTraining;
            var nDiv = div.cloneNode(false),
                nUl = ul.cloneNode(false),
                nLi = li.cloneNode(false);

            Dom.addClass(nDiv, "spyInfo");
            nDiv.id = 'spy' + spy.id;
            Dom.addClass(nUl, "clearafter");

            Dom.addClass(nLi,"spyName");
            nLi.innerHTML = spy.name;
            nUl.appendChild(nLi);
            Event.on(nLi, "click", this.SpyName, {Self:this,Spy:spy,el:nLi}, true);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyAssignedTo");
            nLi.innerHTML = '<label>Assigned To:</label> <a class="starmap_link" href="#' + spy.assigned_to.x + 'x' + spy.assigned_to.y + '">' + spy.assigned_to.name + '</a>';
            Event.delegate(nLi, "click", this.handleStarmapLink, "a.starmap_link", this, true);
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyAssignment");

            var sel;
            if(spy.is_available && spy.assignment != 'Mercenary Transport' ) {
                sel = document.createElement("select");
                var opt = document.createElement("option"),
                    btn = document.createElement("button");
                for(var a=0; a<assign.length; a++) {
                    var job = assign[a];
                    nOpt = opt.cloneNode(false);
                    nOpt.value = job.task;
                    nOpt.innerHTML = [job.task, ' - Skill: ', job.skill.titleCaps('_',''), ' - Recovery: ', Lib.formatTime(job.recovery)].join('');
                    if(spy.assignment == job.task) { nOpt.selected = true; sel.currentAssign = job.task; }
                    sel.appendChild(nOpt);
                }
                Event.on(sel, "change", this.SpyAssignChange);

                nLi.appendChild(sel);

                btn.setAttribute("type", "button");
                btn.innerHTML = "Assign";
                Dom.setStyle(btn,"display","none");
                Event.on(btn, "click", this.SpyAssign, {Self:this,Assign:sel,Id:spy.id,Line:nDiv}, true);
                sel.Button = nLi.appendChild(btn);
            }
            else {
                nLi.innerHTML = spy.assignment;
                if(!isTraining) {
                    isTraining = spy.assignment == "Training";
                }
            }

            // Add mission results if they exist
            if(spy.mission) {
                var elem = sel ? sel : nLi;
                var result = document.createElement("div");
                Dom.setStyle(result, "display", "none");
                Dom.addClass(result, 'spyAssignResult');
                var result_text = document.createElement("span");
                var result_link = document.createElement("a");
                result_link.href = "#";
                result_link.innerHTML = "View Report";
                Event.on(result_link, "click", this.SpyShowMessage, {Self:this,ResultLink:result_link,Id:spy.id,Line:nDiv}, true);
                Dom.setStyle(result_link, "display", "none");

                elem.ResultText = result.appendChild(result_text);
                elem.ResultLink = result.appendChild(result_link);
                elem.Results = nLi.appendChild(result);

                var mission = spy.mission;
                elem.ResultText.innerHTML = "Mission " + mission.result + (
                    mission.reason ? ": " + mission.reason
                        : ".");
                Dom.setStyle(elem.Results, "display", "block");
                if (mission.message_id) {
                    elem.ResultLink.MessageId = mission.message_id;
                    Dom.setStyle(elem.ResultLink, "display", "inline");
                }
                else {
                    Dom.setStyle(elem.ResultLink, "display", "none");
                }
            }

            nUl.appendChild(nLi);

            nDiv.appendChild(nUl);
            nUl = ul.cloneNode(false);
            Dom.addClass(nUl, "clearafter");

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyLevel");
            nLi.innerHTML = "<label>Level:</label>"+spy.level;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyOffense");
            nLi.innerHTML = "<label>Offense:</label>"+spy.offense_rating;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyDefense");
            nLi.innerHTML = "<label>Defense:</label>"+spy.defense_rating;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyAvailableWhen");
            nLi.innerHTML = "<label>Available:</label>"+(spy.is_available ? 'Now' : Lib.formatServerDate(spy.available_on));
            nUl.appendChild(nLi);

            nDiv.appendChild(nUl);
            nUl = ul.cloneNode(false);
            Dom.addClass(nUl, "clearafter");

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyIntel");
            nLi.innerHTML = "<label>Intel:</label>"+spy.intel;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyMayhem");
            nLi.innerHTML = "<label>Mayhem:</label>"+spy.mayhem;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyPolitics");
            nLi.innerHTML = "<label>Politics:</label>"+spy.politics;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyTheft");
            nLi.innerHTML = "<label>Theft:</label>"+spy.theft;
            nUl.appendChild(nLi);

            var mission_count = spy.mission_count;
            nDiv.appendChild(nUl);
            nUl = ul.cloneNode(false);
            Dom.addClass(nUl, "clearafter");

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyMissionCounts");
            nLi.innerHTML = "<label>Mission Count</label>";
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyOffensiveMissions");
            nLi.innerHTML = "<label>Offensive:</label>"+mission_count.offensive;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyDefensiveMissions");
            nLi.innerHTML = "<label>Defensive:</label>"+mission_count.defensive;
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyTotalMissions");
            nLi.innerHTML = "<label>Total:</label>"+(parseInt(mission_count.defensive,10)+parseInt(mission_count.offensive,10));
            nUl.appendChild(nLi);

            nLi = li.cloneNode(false);
            Dom.addClass(nLi,"spyBurn");
            var bbtn = document.createElement("button");
            bbtn.setAttribute("type", "button");
            bbtn.innerHTML = "Burn";
            bbtn = nLi.appendChild(bbtn);
            nUl.appendChild(nLi);

            nDiv.appendChild(nUl);

            Event.on(bbtn, "click", this.SpyBurn, {Self:this,Spy:spy,Line:nDiv}, true);

            return [nDiv, isTraining];
        },
        SpyPopulate : function() {
            var details = Dom.get("spiesDetails");
            if(details) {
                var spies = this.spies.spies,
                    nDiv,
                    isTraining;
                    
                Event.purgeElement(details);
                details.innerHTML = "";
                Dom.setStyle(details.parentNode,"height","");
                Dom.setStyle(details.parentNode,"overflow-y","");
                        
                for(var i=0; i<spies.length; i++) {
                    var ret = this.SpyInfo( spies[i] );
                    nDiv = ret[0];
                    if (ret[1]) {
                        isTraining = true;
                    }
                    details.appendChild(nDiv);
                }
                
                if(isTraining) {
                    Dom.get("spiesSubsidize").disabled = false;
                    Dom.setStyle("spiesSubsidizeOffer", "display", "");
                }
                else {
                    Dom.get("spiesSubsidize").disabled = true;
                    Dom.setStyle("spiesSubsidizeOffer", "display", "none");
                }
                
                //wait for tab to display first
                setTimeout(function() {
                    var Ht = Game.GetSize().h - 150;
                    if(Ht > 300) { Ht = 300; }
                    Dom.setStyle(details.parentNode,"height",Ht + "px");
                    Dom.setStyle(details.parentNode,"overflow-y","auto");
                },10);
            }
        },
        handleStarmapLink : function(e, el) {
            Event.stopEvent(e);
            var res = el.href.match(/\#(-?\d+)x(-?\d+)$/);
            Game.StarJump({x:res[1],y:res[2]});
        },
        SpyShowMessage : function () {
            var message_id = this.ResultLink.MessageId;
            if (message_id) {
                Lacuna.Messaging.showMessage(message_id);
            }
        },
        SpyHandlePagination : function(newState) {
            require('js/actions/menu/loader').show();
            this.service.view_spies({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                page_number:newState.page
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Intelligence.SpyHandlePagination.view_spies.success");
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    this.spies = o.result;
                    this.SpyPopulate();
                },
                scope:this
            });
     
            // Update the Paginator's state
            this.pager.setState(newState);
        },
        SpyAssignChange : function() {
            var btn = this.Button,
                defVal = this.currentAssign,
                selVal = this[this.selectedIndex].value;
            if(btn) {
                Dom.setStyle(btn, "display", defVal != selVal ? "" : "none");
            }
        },
        SpyAssign : function() {
            require('js/actions/menu/loader').show();
            var assign = this.Assign[this.Assign.selectedIndex].value;
            
            this.Self.service.assign_spy({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                spy_id:this.Id,
                assignment:assign
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Intelligence.SpyAssign.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    //delete this.Self.spies; /* Can't delete it, we need it later */
                    var spy = o.result.spy;
                    spy.assignment = assign;
                    spy.mission = o.result.mission;
                    var spies = this.Self.spies.spies;
                    for(var i=0; i<spies.length; i++) {
                        if(spy.id == spies[i].id) {
                            spies[i] = spy;
                            break;
                        }
                    }
                    this.Self.spies.spies = spies;
                    var ret = this.Self.SpyInfo(spy);
                    //Dom.get('spiesDetails').replaceChild(ret[0], Dom.get('spy' + spy.id));
                    this.Line.parentNode.insertBefore(ret[0], this.Line);
                    var ol = this.Line.parentNode.removeChild(this.Line);
                    Event.purgeElement(ol);
                },
                failure : function(o){
                    this.Assign.selectedIndex = this.Assign.defaultIndex;
                },
                scope:this
            });
        },
        SpyBurn : function() {
            if(confirm(["Are you sure you want to Burn ",this.Spy.name,"?"].join(''))) {
                require('js/actions/menu/loader').show();
                
                this.Self.service.burn_spy({
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    spy_id:this.Spy.id
                }, {
                    success : function(o){
                        YAHOO.log(o, "info", "Intelligence.SpyBurn.success");
                        require('js/actions/menu/loader').hide();
                        this.Self.rpcSuccess(o);
                        var spies = this.Self.spies.spies;
                        for(var i=0; i<spies.length; i++) {
                            if(spies[i].id == this.Spy.id) {
                                spies.splice(i,1);
                                break;
                            }
                        }
                        this.Line.parentNode.removeChild(this.Line);
                        this.Self.result.spies.current = (this.Self.result.spies.current*1) - 1;
                    },
                    scope:this
                });
            }
        },
        SpyName : function() {
            this.el.innerHTML = "";
            
            var inp = document.createElement("input"),
                bSave = document.createElement("button"),
                bCancel = bSave.cloneNode(false);
            inp.type = "text";
            inp.value = this.Spy.name;
            this.Input = inp;
            bSave.setAttribute("type", "button");
            bSave.innerHTML = "Save";
            Event.on(bSave,"click",this.Self.SpyNameSave,this,true);
            bCancel.setAttribute("type", "button");
            bCancel.innerHTML = "Cancel";
            Event.on(bCancel,"click",this.Self.SpyNameClear,this,true);
                        
            Event.removeListener(this.el, "click");        
                
            this.el.appendChild(inp);
            this.el.appendChild(document.createElement("br"));
            this.el.appendChild(bSave);
            this.el.appendChild(bCancel);
        },
        SpyNameSave : function(e) {
            Event.stopEvent(e);
            require('js/actions/menu/loader').show();
            var newName = this.Input.value;
            
            this.Self.service.name_spy({
                session_id:Game.GetSession(),
                building_id:this.Self.building.id,
                spy_id:this.Spy.id,
                name:newName
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Intelligence.SpyNameSave.success");
                    require('js/actions/menu/loader').hide();
                    this.Self.rpcSuccess(o);
                    //this.Self.spies = undefined; /* Can't delete it, we need it later */
                    this.Spy.name = newName;
                    if(this.Input) {
                        this.Input.value = newName;
                    }
                    this.Self.SpyNameClear.call(this);
                },
                failure : function(o){
                    if(this.Input) {
                        this.Input.value = this.Spy.name;
                    }
                },
                scope:this
            });
        },
        SpyNameClear : function(e) {
            if(e) { Event.stopEvent(e); }
            if(this.Input) {
                delete this.Input;
            }
            if(this.el) {
                Event.purgeElement(this.el);
                this.el.innerHTML = this.Spy.name;
                Event.on(this.el, "click", this.Self.SpyName, this, true);
            }
        },
        SpyTrain : function() {
            var select = Dom.get("spiesTrainNumber"),
                num = select[select.selectedIndex].value*1;
                
            if(Lang.isNumber(num) && num <= this.result.spies.maximum - this.result.spies.current) {
                require('js/actions/menu/loader').show();
                this.service.train_spy({session_id:Game.GetSession(),building_id:this.building.id,quantity:num}, {
                    success : function(o){
                        YAHOO.log(o, "info", "Intelligence.SpyTrain.success");
                        require('js/actions/menu/loader').hide();
                        this.rpcSuccess(o);
                        var trained = o.result.trained*1;
                        if(trained > 0) {
                            this.spies = undefined;
                            this.result.spies.current = (this.result.spies.current*1) + (o.result.trained*1);
                            this.trainView();
                            // Dom.get("spiesCurrent").innerHTML = this.result.spies.current;
                            //this.UpdateCost(this.spies.training_costs, trained);
                        }
                        var not_trained = o.result.not_trained*1;
                        if(not_trained > 0 && o.result.reason_not_trained && o.result.reason_not_trained.message) {
                            alert(o.result.reason_not_trained.message);
                        }
                    },
                    scope:this
                });
            }
        },
        Subsidize : function(e) {
            require('js/actions/menu/loader').show();
            Dom.get("spiesSubsidize").disabled = true;
            
            this.service.subsidize_training({
                session_id:Game.GetSession(),
                building_id:this.building.id
            }, {
                success : function(o){
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);

                    delete this.spies;
                    this.spiesView({newValue:1});
                },
                failure : function(o){
                    Dom.get("spiesSubsidize").disabled = false;
                },
                scope:this
            });
        }
        
    });
    
    YAHOO.lacuna.buildings.Intelligence = Intelligence;

})();
YAHOO.register("Intelligence", YAHOO.lacuna.buildings.Intelligence, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
