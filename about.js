YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.About == "undefined" || !YAHOO.lacuna.About) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var About = function() {
		this.id = "about";
		this.createEvent("onShow");
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, "nofooter");
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Panel = new YAHOO.widget.Panel(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			visible:false,
			draggable:true,
			effect:Game.GetContainerEffect(),
			underlay:false,
			modal:true,
			close:true,
			width:"450px",
			zIndex:9999
		});
		this.Panel.renderEvent.subscribe(function(){
			this.elCreditsList = Dom.get("aboutCredits");
			this.elVersion = Dom.get("aboutVersion");
			
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Panel.render();
		Game.OverlayManager.register(this.Panel);
	};
	About.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">About</div>',
			'	<div class="bd">',
			'		<div style="overflow:auto;height:400px">',
			'			The Lacuna Expanse',
			'			<ul>',
			'				<li>&copy; 2010 by Lacuna Expanse Corp</li>',
			'				<li>Server Version: <span id="aboutVersion"></span></li>',
			'			</ul><br/>',
			'			Credits',
			'			<ul id="aboutCredits">',
			'			</ul>',
			'		</div>',
			'	</div>'
			].join('');
		},
		show : function() {
			if(!this.hasCredits) {
				Game.Services.Stats.credits({},{
					success : function(o){
						YAHOO.log(o, "info", "Stats");
						this.populateCredits(o.result);
					},
					failure : function(o){
						YAHOO.log(o, "error", "StatsFailure");
					},
					timeout:Game.Timeout,
					scope:this
				});
			}
			this.elVersion.innerHTML = Game.ServerData.version;
			Game.OverlayManager.hideAll();
			this.Panel.show();
		},
		hide : function() {
			this.Panel.hide();
		},
		
		populateCredits : function(results) {
			if(!this.hasCredits) {
				var list = this.elCreditsList,
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
								html.push("</li>");
							}
							html.push("</ul>");
							nLi.innerHTML = html.join('');
							list.appendChild(nLi);
						}
					}
				}
				this.hasCredits = true;
				this.Panel.center();
			}
		}
		
	};
	Lang.augmentProto(About, Util.EventProvider);
			
	Lacuna.About = new About();
})();
YAHOO.register("about", YAHOO.lacuna.About, {version: "1", build: "0"}); 

}
