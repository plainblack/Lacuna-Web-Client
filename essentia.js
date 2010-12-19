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
		Dom.addClass(container, "nofooter");
		
		this.Dialog = new YAHOO.widget.Panel(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			visible:false,
			draggable:true,
			effect:Game.GetContainerEffect(),
			underlay:false,
			modal:true,
			close:true,
			width:"500px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			try{
			this.timeFood = Dom.get("essentialDetailsTimeFood");
			this.timeOre = Dom.get("essentialDetailsTimeOre");
			this.timeWater = Dom.get("essentialDetailsTimeWater");
			this.timeEnergy = Dom.get("essentialDetailsTimeEnergy");
			this.timeHappiness = Dom.get("essentialDetailsTimeHappiness");
			this.timeStorage = Dom.get("essentialDetailsTimeStorage");
			this.elCode = Dom.get("essentiaRedeemCode");
			this.elEssentiaAmount = Dom.get("essentiaAmount");
			this.tabView = new YAHOO.widget.TabView('essentiaTabs');
			Event.on(["essentiaBoostFood","essentiaBoostOre","essentiaBoostWater","essentiaBoostEnergy","essentiaBoostHappiness","essentiaBoostStorage"], "click", this.boost, this, true);
			Event.on('essentiaRedeemButton', 'click', this.redeemClick, this, true);
			Event.on("essentiaPurchaseButton", "click", function(e){
				Event.stopEvent(e);
				window.open("/pay?session_id=" + Game.GetSession(), "essentiaPayment", "status=0,toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,height=550,width=600,directories=0");
			});
			Game.onTick.subscribe(function(){
				this.elEssentiaAmount.innerHTML = Game.EmpireData.essentia;
			}, this, true);
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
			}catch(e){alert(e);}
		}, this, true);

		this.Dialog.hideEvent.subscribe(function(){
			if (this._interval) {
				window.clearInterval(this._interval);
				delete this._interval;
				this.timers = {};
			}
		}, this, true);
		this.timers = {};

		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Essentia.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">Essentia</div>',
			'	<div class="bd">',
			'		<form name="essentiaForm">',
			'			<div class="essentiaAmount">Current Essentia: <span id="essentiaAmount"></span></div>',
			'			<div id="essentiaTabs" class="yui-navset">',
			'				<ul class="yui-nav">',
			'					<li><a href="#essentiaTabBoost"><em>Boosts</em></a></li>',
			'					<li><a href="#essentiaGetMore"><em>Get More Essentia</em></a></li>',
			'				</ul>',
			'				<div class="yui-content">',
			'					<div id="essentiaTabBoost">',
			'						<table>',
			'							<tr><td colspan="4">&nbsp;</td><th>Expires</th></tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallFood" title="Food" src="',Lib.AssetUrl,'ui/s/food.png" /></td>',
			'								<td class="essentiaDetailsText">+25% food per hour</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostFood" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeFood"></td>',
			'							</tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallOre" title="Ore" src="',Lib.AssetUrl,'ui/s/ore.png" /></td>',
			'								<td class="essentiaDetailsText">+25% ore per hour</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostOre" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeOre"></td>',
			'							</tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallWater" title="Water" src="',Lib.AssetUrl,'ui/s/water.png" /></td>',
			'								<td class="essentiaDetailsText">+25% water per hour</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostWater" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeWater"></td>',
			'							</tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallEnergy" title="Energy" src="',Lib.AssetUrl,'ui/s/energy.png" /></td>',
			'								<td class="essentiaDetailsText">+25% energy per hour</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostEnergy" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeEnergy"></td>',
			'							</tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallHappiness" title="Happiness" src="',Lib.AssetUrl,'ui/s/happiness.png" /></td>',
			'								<td class="essentiaDetailsText">+25% happiness per hour</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostHappiness" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeHappiness"></td>',
			'							</tr>',
			'							<tr>',
			'								<td class="essentiaDetailsImg"><img class="smallStorage" title="Storage" src="',Lib.AssetUrl,'ui/s/storage.png" /></td>',
			'								<td class="essentiaDetailsText">+25% storage capacity</td>',
			'								<td class="essentiaDetailsCost">5 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" /></td>',
			'								<td class="essentiaDetailsBoost"><button id="essentiaBoostStorage" type="button">Boost</button></td>',
			'								<td class="essentiaDetailsTime" id="essentialDetailsTimeStorage"></td>',
			'							</tr>',
			'						</table>',
			'					</div>',
			'					<div id="essentiaGetMore">',
			'						<button id="essentiaPurchaseButton">Purchase Essentia</button>',
			'						<hr />',
			'						<div>',
			'							<label>Redeem Essentia Code:<br /><input id="essentiaRedeemCode" /></label>',
			'							<button id="essentiaRedeemButton">Redeem</button>',
			'						</div>',
			/*'						<hr />',
			'						<p>Give the gift of Essentia. Simply choose the amount you want, and pay for at it at PayPal with a credit card, or with your PayPal account. You\'ll then receive an email with an essentia code that can be redeemed in the game.</p>',
			'						<form action="https://www.paypal.com/cgi-bin/webscr" method="post">',
			'						<input type="hidden" name="cmd" value="_s-xclick">',
			'						<input type="hidden" name="hosted_button_id" value="X66S44RDHKKS8">',
			'						<p style="margin: 10px 0;"><input type="hidden" name="on0" value="Buy an Essentia Code">Buy an Essentia Code: <select name="os0">',
			'						<option value="30 Essentia">30 Essentia $2.99</option>',
			'						<option value="100 Essentia">100 Essentia $5.99</option>',
			'						<option value="200 Essentia">200 Essentia $9.99</option>',
			'						<option value="600 Essentia">600 Essentia $24.99</option>',
			'						<option value="1300 Essentia">1300 Essentia $49.99</option>',
			'						</select></p>',
			'						<input type="hidden" name="currency_code" value="USD">',
			'						<input type="image" src="https://www.paypal.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">',
			'						<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">',
			'						</form>',*/
			'					</div>',
			'				</div>',
			'			</div>',
			'		</form>',
			'	</div>',
			].join('');
		},
		
		show : function() {
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
				failure : function(o){
					YAHOO.log(o, "error", "Essentia.show.failure");
				},
				timeout:Game.Timeout,
				scope:Lacuna.Essentia
			});
			Game.OverlayManager.hideAll();
			Lacuna.Essentia.elEssentiaAmount.innerHTML = Game.EmpireData.essentia;
			Lacuna.Essentia.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
		},
		paymentFinished : function(amount) {
		},
		redeemClick : function (e) {
			Event.stopEvent(e);
			var code = this.elCode.value;
			var currentEssentia = Game.EmpireData.essentia;
			Lacuna.Pulser.Show();
			Game.Services.Empire.redeem_essentia_code({
				session_id:Game.GetSession(""),
				essentia_code: code
			},{
				success : function(o){
					YAHOO.log(o, "info", "EssentiaRedeem.show.success");
					Lacuna.Pulser.Hide();
					var addedEssentia = o.result.status.empire.essentia - currentEssentia;
					alert('Redeemed code for '+addedEssentia+' essentia.');
					this.elCode.value = '';
					this.fireEvent('onRpc', o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "EssentiaRedeem.show.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent('onRpcFailed', o.result);
				},
				timeout:Game.Timeout,
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
			else if(results.storage_boost) {
				this.updateTime(this.timeStorage, results.storage_boost);
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
		},
		updateTime : function(el, sDate) {
			var timers = this.timers;
			timers[el.id] = function() {
				if(sDate) {
					var tDate = Lib.parseServerDate(sDate),
						cDate = new Date(),
						tTime = tDate.getTime(),
						cTime = cDate.getTime(),
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
