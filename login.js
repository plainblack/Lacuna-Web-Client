YAHOO.namespace("lacuna");	

if (typeof YAHOO.lacuna.Login == "undefined" || !YAHOO.lacuna.Login) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Login = function() {
		this.id = "login";
		this.createEvent("onLoginSuccessful");
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, "hidden");
		container.innerHTML = [
		'	<div class="hd">Login</div>',
		'	<div class="bd">',
		'		<form name="loginForm">',
		'			<ul>',
		'				<li><label for="loginName">Empire Name</label><input type="text" id="loginName" /></li>',
		'				<li><label for="loginPass">Password</label><input type="password" id="loginPass" /></li>',
		'			</ul>',
		'			<a id="loginCreate" href="#">Create an Empire</a>',
		'		</form>',
		'	</div>',
		'	<div class="ft"></div>'
		].join('');
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			postmethod:"none",
			visible:false,
			buttons:[ { text:"Login", handler:{fn:this.handleLogin, scope:this}, isDefault:true } ],
			draggable:false,
			modal:true,
			close:false,
			width:"300px",
			underlay:false,
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("loginName");
			this.elPass = Dom.get("loginPass");
			this.elCreate = Dom.get("loginCreate");
		
			Event.addListener(this.elCreate, "click", this.createEmpireClick, this, true);
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		
		this.Dialog.cfg.queueProperty("keylisteners", new YAHOO.util.KeyListener("loginPass", { keys:13 }, { fn:this.handleLogin, scope:this, correctScope:true } )); 
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Login.prototype = {
		handleLogin : function() {
			this.setMessage("");
			YAHOO.log(["name: ", this.elName.value, " - pass: ", this.elPass.value].join(''));			
			var EmpireServ = Game.Services.Empire;
			EmpireServ.login({name:this.elName.value, password:this.elPass.value},{
				success : function(o){
					YAHOO.log(o);
					this.fireEvent("onLoginSuccessful",o);
					this.hide();
				},
				failure : function(o){
					YAHOO.log(o, "error", "LoginFailed");
					if(o.error.code == 1010) {
						//haven't founded empire yet so take them to species
						this.hide();
						this.initEmpire();
						Game.EmpireCreator.initSpecies();
						Game.OverlayManager.hideAll();
						Game.SpeciesCreator.show();
					}
					else {
						this.setMessage(o.error.message);
					}
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		show : function() {
			Game.OverlayManager.hideAll();
			this.Dialog.show();
		},
		hide : function() {
			if(this.elMessage) {
				Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
			}
			this.Dialog.hide();
		},
		setMessage : function(str) {
			if(!this.elMessage) {
				var d = document.createElement("div");
				d.id = "loginMessage";
				this.elCreate.parentNode.insertBefore(d, this.elCreate);
				this.elMessage = d;
			}
			Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
			this.elMessage.innerHTML = str;
		},
		initEmpire : function() {
			if(!Game.EmpireCreator) {
				Game.EmpireCreator = new Lacuna.CreateEmpire(this);
				Game.EmpireCreator.subscribe("onCreateSuccessful",function(oArgs) {
					this.fireEvent("onLoginSuccessful",oArgs);
				}, this, true);
			}
		},
		createEmpireClick : function(e) {
			Event.stopEvent(e); //stop href click
			this.hide(); //hide login
			this.initEmpire();
			Game.OverlayManager.hideAll();
			Game.EmpireCreator.show();
		}
	};
	Lang.augmentProto(Login, Util.EventProvider);

	Lacuna.Login = Login;
})();
YAHOO.register("login", YAHOO.lacuna.Login, {version: "1", build: "0"}); 

}