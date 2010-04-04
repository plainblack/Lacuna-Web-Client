// first, declare your own namespace.
YAHOO.namespace("lacuna");

//only load this once
if (typeof YAHOO.lacuna.Progress == "undefined" || !YAHOO.lacuna.Progress) {


YAHOO.lacuna.Progress = {

	//holds our dialog
	_bar : undefined,
	_hidden : false,
	//creates dialog and reassigns window.alert
	Create : function() {
		var progress =  new YAHOO.widget.Panel("wait", { 
			width:"240px", 
			fixedcenter:true,
			close:false, 
			zIndex: 10000,
			draggable:false, 
			modal:true,
			visible:false
		});
		//assign to global
		YAHOO.lacuna.Progress._bar = progress;
		//set default header and body
		progress.setHeader('Please wait while loading...');
		progress.setBody('<img src="./images/rel_interstitial_loading.gif" />');
		//render to doc
		progress.render(document.body);
		//if it's not hidden show
		if(!YAHOO.lacuna.Progress._hidden) {
			progress.show();
		}
		//subscribe to show and hide events to toggle the _hidden var
		progress.showEvent.subscribe(function(){
			var args = arguments;
			YAHOO.lacuna.Progress._hidden = false;
		});
		progress.hideEvent.subscribe(function(){
			var args = arguments;
			YAHOO.lacuna.Progress._hidden = true;
		});
		
	},
	
	Show : function(header, body) {
		var bar = YAHOO.lacuna.Progress._bar;
		if(YAHOO.lacuna.Progress._hidden) {
			if(header) {
				bar.setHeader(header);
			}
			if(body) {
				bar.setBody(body);
			}
			bar.show();
		}
	},
	
	Hide : function() {
		var bar = YAHOO.lacuna.Progress._bar;
		if(bar) {
			YAHOO.lacuna.Progress._bar.hide();
		}
		else {
			YAHOO.lacuna.Progress._hidden = true;
		}
	}
};

YAHOO.register("lacuna.Progress", YAHOO.lacuna.Progress, {version: "1.0.1", build: "2"});


}