YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.IntelTraining == "undefined" || !YAHOO.lacuna.buildings.IntelTraining) {
	
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

	var IntelTraining = function(result){
		IntelTraining.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.IntelTraining;
	};
	
	Lang.extend(IntelTraining, Lacuna.buildings.Building, {
		destroy : function() {
			if(this.pager) {
				this.pager.destroy();
			}
			IntelTraining.superclass.destroy.call(this);
		},
		getChildTabs : function() {
			return [this._getTrainTab(), this._getSpiesTab()];
		},
		_getTrainTab : function() {
			var spies = this.result.spies;
			this.trainTab = new YAHOO.widget.Tab({ label: "Train Spies", content: [
				'<div class="yui-g">',
				'	<div class="yui-u first">',
				'		<ul>',
				'			<li id="spiesTrainOptions"><span style="font-weight:bold;">Train:</span> <select id="spiesTrainNumber"></select> new spies. <button type="button" id="spiesTrain">Train</button></li>',
				'		</ul>',
				'	</div>',
				'	<div class="yui-u">',
				'		<ul>',
				'			<li>Training Costs</li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/food.png" title="Food" class="smallFood" /></span><span class="buildingDetailsNum">',spies.training_costs.food,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" title="Ore" class="smallOre" /></span><span class="buildingDetailsNum">',spies.training_costs.ore,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/water.png" title="Water" class="smallWater" /></span><span class="buildingDetailsNum">',spies.training_costs.water,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" title="Energy" class="smallEnergy" /></span><span class="buildingDetailsNum">',spies.training_costs.energy,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/waste.png" title="Waste" class="smallWaste" /></span><span class="buildingDetailsNum">',spies.training_costs.waste,'</span></li>',
				'			<li><span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/time.png" title="Time" class="smallTime" /></span><span class="buildingDetailsNum">',Lib.formatTime(spies.training_costs.time),'</span></li>',
				'		</ul>',
				'	</div>',
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
				'	<p id="spiesSubsidizeOffer" style="display:none;">You may subsidize training for 1 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /> per spy. <button type="button" id="spiesSubsidize">Subsidize</button></p>',
				'	<div>',
				'		<div id="spiesDetails">',
				'		</div>',
				'	</div>',
				'	<div id="spyPaginator"></div>',
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
					Lacuna.Pulser.Show();
					this.service.view_spies({session_id:Game.GetSession(),building_id:this.building.id}, {
						success : function(o){
							YAHOO.log(o, "info", "IntelTraining.IntelTraining.view_spies.success");
							Lacuna.Pulser.Hide();
							this.rpcSuccess(o);
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
						scope:this
					});
				}
				else {
					this.SpyPopulate();
				}
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
			Lacuna.Pulser.Show();
			this.service.view_spies({
				session_id:Game.GetSession(),
				building_id:this.building.id,
				page_number:newState.page
			}, {
				success : function(o){
					YAHOO.log(o, "info", "IntelTraining.SpyHandlePagination.view_spies.success");
					Lacuna.Pulser.Hide();
					this.rpcSuccess(o);
					this.spies = o.result;
					this.SpyPopulate();
				},
				scope:this
			});
	 
			// Update the Paginator's state
			this.pager.setState(newState);
		},
		SpyTrain : function() {
			var select = Dom.get("spiesTrainNumber"),
				num = select[select.selectedIndex].value*1;
				
			if(Lang.isNumber(num) && num <= this.result.spies.maximum - this.result.spies.current) {
				Lacuna.Pulser.Show();
				this.service.train_spy({session_id:Game.GetSession(),building_id:this.building.id,quantity:num}, {
					success : function(o){
						YAHOO.log(o, "info", "IntelTraining.SpyTrain.success");
						Lacuna.Pulser.Hide();
						this.rpcSuccess(o);
						var trained = o.result.trained*1;
						if(trained > 0) {
							this.spies = undefined;
							this.result.spies.current = (this.result.spies.current*1) + (o.result.trained*1);
							this.trainView();
							// Dom.get("spiesCurrent").innerHTML = this.result.spies.current;
							//this.UpdateCost(this.spies.training_costs, trained);
						}
					},
					scope:this
				});
			}
		},
		Subsidize : function(e) {
			Lacuna.Pulser.Show();
			Dom.get("spiesSubsidize").disabled = true;
			
			this.service.subsidize_training({
				session_id:Game.GetSession(),
				building_id:this.building.id
			}, {
				success : function(o){
					Lacuna.Pulser.Hide();
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
	
	YAHOO.lacuna.buildings.IntelTraining = IntelTraining;

})();
YAHOO.register("IntelTraining", YAHOO.lacuna.buildings.IntelTraining, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
