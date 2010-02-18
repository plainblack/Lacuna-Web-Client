YAHOO.namespace("lacuna");	

if (typeof YAHOO.lacuna.Login == "undefined" || !YAHOO.lacuna.Login) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;

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
		'				<li><label for="loginName">Name</label><input type="text" id="loginName" /></li>',
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
			close:false,
			width:"300px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("loginName");
			this.elPass = Dom.get("loginPass");
			this.elCreate = Dom.get("loginCreate");
		
			Event.addListener(this.elCreate, "click", this.createEmpireClick, this, true);
			Dom.removeClass(this.id, Game.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
		
	};
	Login.prototype = {
		handleLogin : function() {
			this.setMessage("");
			console.log("name: ", this.elName.value, " - pass: ", this.elPass.value);			
			var EmpireServ = Game.Services.Empire;
			EmpireServ.login({name:this.elName.value, password:this.elPass.value},{
				success : function(o){
					console.log(o);
					Game.ProcessStatus(o.result.status);
					this.fireEvent("onLoginSuccessful",o);
					this.hide();
				},
				failure : function(o){
					console.log("LOGIN FAILED: ", o);
					this.setMessage(o.error.message);
				},
				timeout:5000,
				scope:this
			});
		},
		show : function() {
			this.Dialog.show();
		},
		hide : function() {
			if(this.elMessage) {
				Dom.addClass(this.elMessage, "hidden");
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
			Dom.removeClass(this.elMessage, "hidden");
			this.elMessage.innerHTML = str;
		},
		createEmpireClick : function(e) {
			Event.stopEvent(e); //stop href click
			this.hide(); //hide login
			if(!Game.EmpireCreator) {
				Game.EmpireCreator = new Lacuna.CreateEmpire(this);
			}
			Game.EmpireCreator.show();
		}
	};
	Lang.augmentProto(Login, Util.EventProvider);

	Lacuna.Login = Login;
})();
YAHOO.register("login", YAHOO.lacuna.Login, {version: "1", build: "0"}); 

}