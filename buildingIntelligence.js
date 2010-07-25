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
				this.pager.destroy()
			}
			Intelligence.superclass.destroy.call(this);
		},
		getTabs : function() {
			return [this._getTrainTab(), this._getSpiesTab()];
		},
		_getTrainTab : function() {
			var spies = this.result.spies;
			this.trainTab = new YAHOO.widget.Tab({ label: "Train Spies", content: [
				'<div class="yui-g">',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li><span style="font-weight:bold;">Spies:</span> <span id="spiesCurrent">',spies.current,'</span> of ',spies.maximum,'</li>',
				spies.current < spies.maximum ? '<li><span style="font-weight:bold;">Train:</span> <select id="spiesTrainNumber"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select> new spies. <button type="button" id="spiesTrain">Train</button></li>' : '',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u">',
				'		<ul>',
				'			<li>Training Costs</li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></span><span class="buildingDetailsNum">',spies.training_costs.food,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></span><span class="buildingDetailsNum">',spies.training_costs.ore,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></span><span class="buildingDetailsNum">',spies.training_costs.water,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></span><span class="buildingDetailsNum">',spies.training_costs.energy,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" class="smallWaste" /></span><span class="buildingDetailsNum">',spies.training_costs.waste,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(spies.training_costs.time),'</span></li>',
				'		</ul>',
				'	</div>',
				'</div>'
			].join('')});
			if(spies.current < spies.maximum) {
				var btn = Sel.query("button", this.trainTab.get("contentEl"), true);
				if(btn) {
					Event.on(btn, "click", this.SpyTrain, this, true);
				}
			}
			
			return this.trainTab;
		},
		_getSpiesTab : function() {
			this.spiesTab = new YAHOO.widget.Tab({ label: "Spies", content: [
				'<div>',
				/*'	<ul class="spiesHeader spyInfo clearafter">',
				'		<li class="spyName">Name</li>',
				'		<li class="spyAssignedTo">Assigned To</li>',
				'		<li class="spyAvailableWhen">Available When</li>',
				'		<li class="spyAssignment">Assignment</li>',
				'		<li class="spyOffense">Offense</li>',
				'		<li class="spyDefense">Defense</li>',
				'		<li class="spyLevel">Level</li>',
				'		<li class="spyIntel">Intel</li>',
				'		<li class="spyMayhem">Mayhem</li>',
				'		<li class="spyPolitics">Politics</li>',
				'		<li class="spyTheft">Theft</li>',
				'		<li class="spyBurn">Burn</li>',
				'	</ul>',*/
				'	<div>', // style="height:300px;overflow-y:auto;"
				'		<div id="spiesDetails">',
				'		</div>',
				'	</div>',
				'	<div id="spyPaginator"></div>',
				'</div>'
			].join('')});
			this.spiesTab.subscribe("activeChange", this.spiesView, this, true);
					
			return this.spiesTab;
		},
		
		spiesView : function(e) {
			if(e.newValue) {
				if(!this.spies) {
					Lacuna.Pulser.Show();
					this.service.view_spies({session_id:Game.GetSession(),building_id:this.building.id}, {
						success : function(o){
							YAHOO.log(o, "info", "Intelligence.Intelligence.view_spies.success");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpc", o.result);
							this.spies = o.result;
							this.pager = new Pager({
								rowsPerPage : 25,
								totalRecords: o.result.spy_count,
								containers  : 'spyPaginator',
								template : "{PreviousPageLink} {PageLinks} {NextPageLink}",
								alwaysVisible : false

							});
							this.pager.subscribe('changeRequest',this.SpyHandlePagination, this, true);
							this.pager.render();
							
							this.SpyPopulate();
						},
						failure : function(o){
							YAHOO.log(o, "error", "Intelligence.Intelligence.view_spies.failure");
							Lacuna.Pulser.Hide();
							this.fireEvent("onMapRpcFailed", o);
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
				else {
					this.SpyPopulate();
				}
			}
		},
		
		SpyPopulate : function() {
			var details = Dom.get("spiesDetails");
			if(details) {
				var spies = this.spies.spies,
					assign = this.spies.possible_assignments,
					div = document.createElement("div"),
					ul = document.createElement("ul"),
					li = document.createElement("li");
					
				Event.purgeElement(details);
				details.innerHTML = "";
				Dom.setStyle(details.parentNode,"height","");
				Dom.setStyle(details.parentNode,"overflow-y","");
						
				for(var i=0; i<spies.length; i++) {
					var spy = spies[i],
						nDiv = div.cloneNode(false),
						nUl = ul.cloneNode(false),
						nLi = li.cloneNode(false);
						
					Dom.addClass(nDiv, "spyInfo");
					Dom.addClass(nUl, "clearafter");

					Dom.addClass(nLi,"spyName");
					nLi.innerHTML = spy.name;
					nUl.appendChild(nLi);
					Event.on(nLi, "click", this.SpyName, {Self:this,Spy:spy,el:nLi}, true);

					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"spyAssignedTo");
					nLi.innerHTML = "<label>Assigned To:</label>"+spy.assigned_to.name;
					nUl.appendChild(nLi);
					
					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"spyAssignment");
					if(spy.is_available) {
						var sel = document.createElement("select"),
							opt = document.createElement("option"),
							btn = document.createElement("button");
						for(var a=0; a<assign.length; a++) {
							nOpt = opt.cloneNode(false);
							nOpt.value = nOpt.innerHTML = assign[a];
							if(spy.assignment == nOpt.value) { nOpt.selected = true; sel.currentAssign = nOpt.value; }
							sel.appendChild(nOpt);
						}
						Event.on(sel, "change", this.SpyAssignChange);
						
						nLi.appendChild(sel);
						
						btn.setAttribute("type", "button");
						btn.innerHTML = "Assign";
						Dom.setStyle(btn,"display","none");
						Event.on(btn, "click", this.SpyAssign, {Self:this,Assign:sel,Id:spy.id}, true);
						sel.Button = nLi.appendChild(btn);
					}
					else {
						nLi.innerHTML = spy.assignment;
					}
					nUl.appendChild(nLi);
					//***
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
					//***
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

					nLi = li.cloneNode(false);
					Dom.addClass(nLi,"spyBurn");
					var bbtn = document.createElement("button");
					bbtn.setAttribute("type", "button");
					bbtn.innerHTML = "Burn";
					bbtn = nLi.appendChild(bbtn);
					nUl.appendChild(nLi);
					//***
					nDiv.appendChild(nUl);

					details.appendChild(nDiv);
					
					Event.on(bbtn, "click", this.SpyBurn, {Self:this,Spy:spy,Line:nDiv}, true);
				}
				//wait for tab to display first
				setTimeout(function() {
					if(details.parentNode.clientHeight > 300) {
						Dom.setStyle(details.parentNode,"height","300px");
						Dom.setStyle(details.parentNode,"overflow-y","auto");
					}
				},10);
			}
		},
		SpyHandlePagination : function(newState) {
			Lacuna.Pulser.Show();
			this.service.view_spies({
				session_id:Game.GetSession(),
				building_id:this.building.id,
				page_number:newState.page
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Intelligence.SpyHandlePagination.view_spies.success");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpc", o.result);
					this.spies = o.result;
					this.SpyPopulate();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Intelligence.SpyHandlePagination.view_spies.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent("onMapRpcFailed", o);
				},
				timeout:Game.Timeout,
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
			Lacuna.Pulser.Show();
			var assign = this.Assign[this.Assign.selectedIndex].value;
			
			this.Self.service.assign_spy({
				session_id:Game.GetSession(),
				building_id:this.Self.building.id,
				spy_id:this.Id,
				assignment:assign
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Intelligence.SpyAssign.success");
					Lacuna.Pulser.Hide();
					this.Self.fireEvent("onMapRpc", o.result);
					delete this.Self.spies;
					this.Assign.currentAssign = assign;
					this.Self.SpyAssignChange.call(this.Assign);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Intelligence.SpyAssign.failure");
					Lacuna.Pulser.Hide();
					this.Self.fireEvent("onMapRpcFailed", o);
					this.Assign.selectedIndex = this.Assign.defaultIndex;
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		SpyBurn : function() {
			if(confirm(["Are you sure you want to Burn ",this.Spy.name,"?"].join(''))) {
				Lacuna.Pulser.Show();
				
				this.Self.service.burn_spy({
					session_id:Game.GetSession(),
					building_id:this.Self.building.id,
					spy_id:this.Spy.id
				}, {
					success : function(o){
						YAHOO.log(o, "info", "Intelligence.SpyBurn.success");
						Lacuna.Pulser.Hide();
						this.Self.fireEvent("onMapRpc", o.result);
						var spies = this.Self.spies.spies;
						for(var i=0; i<spies.length; i++) {
							if(spies[i].id == this.Spy.id) {
								spies.splice(i,1);
								break;
							}
						}
						this.Line.parentNode.removeChild(this.Line);
						this.Self.result.spies.current = (this.Self.result.spies.current*1) - 1;
						Dom.get("spiesCurrent").innerHTML = this.Self.result.spies.current;
					},
					failure : function(o){
						YAHOO.log(o, "error", "Intelligence.SpyBurn.failure");
						Lacuna.Pulser.Hide();
						this.Self.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
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
			Lacuna.Pulser.Show();
			var newName = this.Input.value;
			
			this.Self.service.name_spy({
				session_id:Game.GetSession(),
				building_id:this.Self.building.id,
				spy_id:this.Spy.id,
				name:newName
			}, {
				success : function(o){
					YAHOO.log(o, "info", "Intelligence.SpyNameSave.success");
					Lacuna.Pulser.Hide();
					this.Self.fireEvent("onMapRpc", o.result);
					this.Self.spies = undefined;
					this.Spy.name = newName;
					if(this.Input) {
						this.Input.value = newName;
					}
					this.Self.SpyNameClear.call(this);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Intelligence.SpyNameSave.failure");
					Lacuna.Pulser.Hide();
					this.Self.fireEvent("onMapRpcFailed", o);
					if(this.Input) {
						this.Input.value = this.Spy.name;
					}
				},
				timeout:Game.Timeout,
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
				
			if(Lang.isNumber(num) && num < this.result.spies.maximum) {
				Lacuna.Pulser.Show();
				this.service.train_spy({session_id:Game.GetSession(),building_id:this.building.id,quantity:num}, {
					success : function(o){
						YAHOO.log(o, "info", "Intelligence.SpyTrain.success");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpc", o.result);
						var trained = o.result.trained*1;
						if(trained > 0) {
							this.spies = undefined;
							this.result.spies.current = (this.result.spies.current*1) + (o.result.trained*1);
							Dom.get("spiesCurrent").innerHTML = this.result.spies.current;
							//this.UpdateCost(this.spies.training_costs, trained);
						}
					},
					failure : function(o){
						YAHOO.log(o, "error", "Intelligence.SpyTrain.failure");
						Lacuna.Pulser.Hide();
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
		}
		
	});
	
	YAHOO.lacuna.buildings.Intelligence = Intelligence;

})();
YAHOO.register("Intelligence", YAHOO.lacuna.buildings.Intelligence, {version: "1", build: "0"}); 

}