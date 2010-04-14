YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Pulse == "undefined" || !YAHOO.lacuna.Pulse) {

(function(){
	var Pulse = function() {		
		var panel = new YAHOO.widget.Panel("pulsing", {
			fixedcenter:true,
			close:false,
			underlay:"none",
			draggable:false, 
			modal:false,
			visible:false,
			width:"100px"
		});
		panel.render();
		this._panel = panel;
	};
	Pulse.prototype = {
		Show : function() {
			this._panel.bringToTop();
			this._panel.show();
		},
		
		Hide : function() {
			this._panel.hide();
		}
	};
	YAHOO.lacuna.Pulse = Pulse;
})();
YAHOO.register("pulse", YAHOO.lacuna.Pulse, {version: "1.0.1", build: "2"});


}