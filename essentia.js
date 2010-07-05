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
		
	var Essentia = function() {
		this.createEvent("onRpc");
		this.createEvent("onRpcFailed");
		
		this.id = "essentia";
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Panel(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			visible:false,
			draggable:true,
			underlay:false,
			modal:true,
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
			Event.on(["essentiaBoostFood","essentiaBoostOre","essentiaBoostWater","essentiaBoostEnergy","essentiaBoostHappiness"], "click", this.boost, this, true);
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Essentia.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">Essentia</div>',
			'	<div class="bd">',
			'		<form name="essentiaForm">',
			'			<div class="essentiaHeader">Purchase 25% increase in production rates.</div>',
			'			<ul class="essentiaBoosts essentiaHeader clearafter">',
			'				<li class="essentiaDetailsImg">&nbsp;</li>',
			'				<li class="essentiaDetailsCost">Cost</li>',
			'				<li class="essentiaDetailsBoost">&nbsp;</li>',
			'				<li class="essentiaDetailsTime">Expires</li>',
			'			</ul>',
			'			<ul class="essentiaBoosts clearafter">',
			'				<li class="essentiaDetailsImg"><img src="',Lib.AssetUrl,'ui/s/food.png" class="smallFood" /></li>',
			'				<li class="essentiaDetailsCost">5<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></li>',
			'				<li class="essentiaDetailsBoost"><button id="essentiaBoostFood" type="button">Buy</button></li>',
			'				<li class="essentiaDetailsTime" id="essentialDetailsTimeFood"></li>',
			'			</ul>',
			'			<ul class="essentiaBoosts clearafter">',
			'				<li class="essentiaDetailsImg"><img src="',Lib.AssetUrl,'ui/s/ore.png" class="smallOre" /></li>',
			'				<li class="essentiaDetailsCost">5<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></li>',
			'				<li class="essentiaDetailsBoost"><button id="essentiaBoostOre" type="button">Buy</button></li>',
			'				<li class="essentiaDetailsTime" id="essentialDetailsTimeOre"></li>',
			'			</ul>',
			'			<ul class="essentiaBoosts clearafter">',
			'				<li class="essentiaDetailsImg"><img src="',Lib.AssetUrl,'ui/s/water.png" class="smallWater" /></li>',
			'				<li class="essentiaDetailsCost">5<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></li>',
			'				<li class="essentiaDetailsBoost"><button id="essentiaBoostWater" type="button">Buy</button></li>',
			'				<li class="essentiaDetailsTime" id="essentialDetailsTimeWater"></li>',
			'			</ul>',
			'			<ul class="essentiaBoosts clearafter">',
			'				<li class="essentiaDetailsImg"><img src="',Lib.AssetUrl,'ui/s/energy.png" class="smallEnergy" /></li>',
			'				<li class="essentiaDetailsCost">5<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></li>',
			'				<li class="essentiaDetailsBoost"><button id="essentiaBoostEnergy" type="button">Buy</button></li>',
			'				<li class="essentiaDetailsTime" id="essentialDetailsTimeEnergy"></li>',
			'			</ul>',
			'			<ul class="essentiaBoosts clearafter">',
			'				<li class="essentiaDetailsImg"><img src="',Lib.AssetUrl,'ui/s/happiness.png" class="smallHappy" /></li>',
			'				<li class="essentiaDetailsCost">5<img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></li>',
			'				<li class="essentiaDetailsBoost"><button id="essentiaBoostHappiness" type="button">Buy</button></li>',
			'				<li class="essentiaDetailsTime" id="essentialDetailsTimeHappiness"></li>',
			'			</ul>',
			'		</form>',
			'	</div>',
			'	<div class="ft"></div>'
			].join('');
		},
		
		show : function() {
			//this is called out of scope so make sure to pass the correct scope in
			Game.Services.Empire.view_boosts({session_id:Game.GetSession("")},{
				success : function(o){
					YAHOO.log(o, "info", "Essentia.show.success");
					this.populate(o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Essentia.show.failure");
				},
				timeout:Game.Timeout,
				scope:Lacuna.Essentia
			});
			Game.OverlayManager.hideAll();
			Lacuna.Essentia.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
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
			}
			if(func) {
				func({session_id:Game.GetSession("")},{
					success : function(o){
						YAHOO.log(o, "info", "Essentia.boost.success");
						this.update(o.result);
						this.fireEvent("onRpc", o.result);
					},
					failure : function(o){
						YAHOO.log(o, "error", "Essentia.boost.failure");
						this.fireEvent("onRpcFailed", o.result);
					},
					timeout:Game.Timeout,
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
		},
		populate : function(results) {
			var boosts = results.boosts;
			
			this.updateTime(this.timeFood, boosts.food);
			this.updateTime(this.timeOre, boosts.ore);
			this.updateTime(this.timeWater, boosts.water);
			this.updateTime(this.timeEnergy, boosts.energy);
			this.updateTime(this.timeHappiness, boosts.happiness);
		},
		updateTime : function(el, sDate) {
			if(sDate) {
				var tDate = Lib.parseServerDate(sDate),
					cDate = new Date(),
					tTime = tDate.getTime(),
					cTime = cDate.getTime(),
					diffTime = tTime - cTime;
				if(diffTime > 0) {
					el.innerHTML = Lib.formatMillisecondTime(diffTime);
				}
				else {
					el.innerHTML = "&nbsp;";
				}
			}
			else {
				el.innerHTML = "&nbsp;";
			}
		}
		
	};
	Lang.augmentProto(Essentia, Util.EventProvider);
			
	Lacuna.Essentia = new Essentia();
})();
YAHOO.register("essentia", YAHOO.lacuna.Essentia, {version: "1", build: "0"}); 

}