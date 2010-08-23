YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Transporter == "undefined" || !YAHOO.lacuna.buildings.Transporter) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Transporter = function(result){
		Transporter.superclass.constructor.call(this, result);
		
		this.transport = result.transport;
		
		this.service = Game.Services.Buildings.Transporter;
		
		this.subscribe("onShow", this.getStoredResources, this, true);
	};
	
	Lang.extend(Transporter, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getOneForOneTab()];
		},
		_getOneForOneTab : function() {
			this.oneForOne = new YAHOO.widget.Tab({ label: "One For One", content: ['<div>',
				'<div>You may trade one-for-one with Lacuna Corp for 3 essentia per transaction.</div>',
				'<ul>',
				'	<li><label>Want:</label><select id="transporterOneForOneWant"></select>',
				'	<li><label>Trading:</label><select id="transporterOneForOneHave"></select>',
				'	<li><button id="transporterOneForOneTrade">Trade</button>',
				'</ul>'
			'</div>'].join('')});
			
			Event.onAvailable("transporterOneForOneWant", function(e){
				var elm = Event.getTarget(e),
					opt = document.createElement("option"),
					nOpt, optGroup;
				for(var r in Lib.ResourceTypes) {
					if(Lib.ResourceTypes.hasOwnProperty(r)) {
						var resource = Lib.ResourceTypes[r];
						if(Lang.isArray(resource)) {
							optGroup = document.createElement("optgroup");
							optGroup.label = r.titleCaps();
							
							for(var x=0; x < resource.length; x++) {
								nOpt = opt.cloneNode(false);
								nOpt.value = resource[x];
								nOpt.innerHTML = resource[x].titleCaps();
								optGroup.appendChild(nOpt);
							}
							
							elm.appendChild(optGroup);
						}
						else {
							nOpt = opt.cloneNode(false);
							nOpt.value = r;
							nOpt.innerHTML = r.titleCaps();
							elm.appendChild(nOpt);
						}
					}
				}
			}, this, true);
			Event.on("transporterOneForOneTrade", "click", this.assembleGlyph, this, true);
			
			return this.oneForOne;
		},
		
		getStoredResources : function(force) {
			if(force || !this.resources) {
				this.service.get_stored_resources({
						session_id: Game.GetSession(""),
						building_id: this.building.id
					},{
					success : function(o){
						YAHOO.log(o, "info", "Transporter.getStoredResources.success");
						this.fireEvent("onMapRpc", o.result);
						this.resources = o.result.resources;
						this.populateOneForOneHave();
						Lacuna.Pulser.Hide();
					},
					failure : function(o){
						Lacuna.Pulser.Hide();
						YAHOO.log(o, "error", "Transporter.getStoredResources.failure");
						
						this.fireEvent("onMapRpcFailed", o);
					},
					timeout:Game.Timeout,
					scope:this
				}
			}
		},
		
		populateOneForOneHave : function() {
			var elm = Dom.get("transporterOneForOneHave"),
				opt = document.createElement("option"),
				nOpt, optGroup;
				
			if(elm) {
				for(var r in Lib.ResourceTypes) {
					if(Lib.ResourceTypes.hasOwnProperty(r)) {
						var resource = Lib.ResourceTypes[r];
						if(Lang.isArray(resource)) {
							optGroup = document.createElement("optgroup");
							optGroup.label = r.titleCaps();
							
							for(var x=0; x < resource.length; x++) {
								var name = resource[x];
								if(this.resources[name]) {
									nOpt = opt.cloneNode(false);
									nOpt.value = name;
									nOpt.innerHTML = name.titleCaps();
									optGroup.appendChild(nOpt);
								}
							}
							
							elm.appendChild(optGroup);
						}
						else if(this.resources[r]) {
							nOpt = opt.cloneNode(false);
							nOpt.value = r;
							nOpt.innerHTML = r.titleCaps();
							elm.appendChild(nOpt);
						}
					}
				}
			}
		}
	
	});
	
	YAHOO.lacuna.buildings.Transporter = Transporter;

})();
YAHOO.register("transporter", YAHOO.lacuna.buildings.Transporter, {version: "1", build: "0"}); 

}