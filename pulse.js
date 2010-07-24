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
		this.counter = 0;
	};
	Pulse.prototype = {
		Show : function() {
			YAHOO.log("SHOW PULSER!");
			this._panel.bringToTop();
			this._panel.show();
			this.counter++;
		},
		
		Hide : function() {
			YAHOO.log("HIDE PULSER!");
			this.counter--;
			if(this.counter <= 0) {
				this.counter = 0;
				this._panel.hide();
			}
		}
	};
	YAHOO.lacuna.Pulse = Pulse;
})();
YAHOO.register("pulse", YAHOO.lacuna.Pulse, {version: "1.0.1", build: "2"});


}