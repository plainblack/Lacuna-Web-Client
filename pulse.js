YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Pulse == "undefined" || !YAHOO.lacuna.Pulse) {

(function(){
	var Pulse = function() {
		var pulse = document.createElement("div");
		pulse.id = "pulsing";
		pulse.innerHTML = ['<div class="bd" style="background-color:black;"><img src="',YAHOO.lacuna.Library.AssetUrl,'ui/pulse-indicator.gif" alt="Pulse Indicator" /></div>'].join('');
		document.body.insertBefore(pulse, document.body.firstChild);
		YAHOO.util.Dom.addClass(pulse, "nofooter");
		
		var panel = new YAHOO.widget.Panel(pulse, {
			//constraintoviewport: true,
			fixedcenter:true,
			close:false,
			underlay:"none",
			draggable:false, 
			modal:true,
			visible:false,
			width:"100%"
		});
		panel.render();
		this._bar = panel;
	};
	Pulse.prototype = {
		Show : function() {
			this._bar.show();
		},
		
		Hide : function() {
			this._bar.hide();
		}
	};
	YAHOO.lacuna.Pulse = Pulse;
})();
YAHOO.register("pulse", YAHOO.lacuna.Pulse, {version: "1.0.1", build: "2"});


}