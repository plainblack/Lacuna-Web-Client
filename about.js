YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.About == "undefined" || !YAHOO.lacuna.About) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var About = function() {
		this.id = "about";
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Game.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			postmethod:"none",
			visible:false,
			draggable:true,
			close:true,
			width:"450px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			this.elCreditsList = Dom.get("aboutCredits");
			
			Dom.removeClass(this.id, Game.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
	};
	About.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">About</div>',
			'	<div class="bd">',
			'		<form name="aboutForm">',
			'			<label>Credits:</label>',
			'			<ul id="aboutCredits">',
			'			</ul>',
			'		</form>',
			'	</div>',
			'	<div class="ft"></div>'
			].join('');
		},
		show : function() {
			if(!this.hasCredits) {
				Game.Services.Stats.credits({},{
					success : function(o){
						YAHOO.log(o, "info", "Stats");
						this.hasCredits = true;
						this.populateCredits(o.result);
					},
					failure : function(o){
						YAHOO.log(o, "error", "StatsFailure");
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
			this.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
		},
		
		populateCredits : function(results) {
			if(!this.hasCredits) {
				var list = this.Dialog.elCreditsList,
					li = document.createElement("li");
				for(var i=0; i<results.length; i++) {
					var obj = results[i];
					for(var prop in obj) {
						if(obj.hasOwnProperty(prop)){
							var nLi = li.cloneNode(false),
								html = ["<label>",prop,"</label><ul>"];
							for(var x=0; x<obj[prop].length; x++) {
								html.push("<li>");
								html.push(obj[prop][x]);
								html.push("</li");
							}
							html.push("</ul>");
						}
						nLi.innerHTML = html.join('');
						list.appendChild(nLi);
					}
				}
			}
		}
		
	};
	Lang.augmentProto(About, Util.EventProvider);
			
	Lacuna.About = new About();
})();
YAHOO.register("about", YAHOO.lacuna.About, {version: "1", build: "0"}); 

}