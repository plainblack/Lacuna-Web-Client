YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateEmpire == "undefined" || !YAHOO.lacuna.CreateEmpire) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var CreateEmpire = function(Login) {
		this.id = "createEmpire";
		this._login = Login;
		this.createEvent("onCreateSuccessful");
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, "hidden");
		container.innerHTML = [
		'	<div class="hd">Create Empire</div>',
		'	<div class="bd">',
		'		<form name="empireForm">',
		'			<ul>',
		'				<li><label for="empireName">Empire Name</label><input type="text" id="empireName" /></li>',
		'				<li><label for="empirePass">Password</label><input type="password" id="empirePass" /></li>',
		'				<li><label for="empirePassConfirm">Password Confirm</label><input type="password" id="empirePassConfirm" /></li>',
		'			</ul>',
		'			<div id="empireMessage" class="hidden"></div>',
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
			buttons:[ { text:"Create", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
				{ text:"Cancel", handler:{fn:this.handleCancel, scope:this}}],
			draggable:false,
			modal:true,
			close:false,
			width:"300px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("empireName");
			this.elPass = Dom.get("empirePass");
			this.elPassConfirm = Dom.get("empirePassConfirm");
			this.elMessage = Dom.get("empireMessage");
			
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Dialog.cfg.queueProperty("keylisteners", new YAHOO.util.KeyListener("empirePassConfirm", { keys:13 }, { fn:this.handleCreate, scope:this, correctScope:true } )); 
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
		
		this.initSpecies();
	};
	CreateEmpire.prototype = {
		handleCreate : function() {
			this.setMessage("");
			YAHOO.log(["name: ", this.elName.value, " - pass: ", this.elPass.value].join(''));
			var EmpireServ = Game.Services.Empire,
				data = {
					name: this.elName.value,
					password: this.elPass.value,
					password1: this.elPassConfirm.value
				};
				
			EmpireServ.is_name_available({name:data.name}, {
				success : function(o) {
					YAHOO.log(o);
					if(o.result == 1) {
						EmpireServ.create(data,{
							success : function(o){
								YAHOO.log(o, "info", "CreateEmpire");
								Game.SpeciesCreator.show(o.result);
								this.hide(); //hide empire
							},
							failure : function(o){
								YAHOO.log(o, "error", "CreateEmpireFailure");
								this.setMessage(o.error.message);
							},
							timeout:Game.Timeout,
							scope:this
						});
					}
					else {
						this.setMessage("Empire name is unavailable.  Please choose another.");
					}
				},
				failure : function(o) {
					YAHOO.log(o);
					this.setMessage(o.error.message);
				},
				timeout:Game.Timeout,
				scope:this
			});
			
		},
		handleCancel : function() {
			this.hide();
			this._login.show();
		},
		setMessage : function(str) {
			Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
			this.elMessage.innerHTML = str;
		},
		show : function() {
			Game.OverlayManager.hideAll();
			this.Dialog.show();
		},
		hide : function() {
			this.elName.value = "";
			this.elPass.value = "";
			this.elPassConfirm.value = "";
			Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
			this.Dialog.hide();
		},
		initSpecies : function() {
			if(!Game.SpeciesCreator) {
				Game.SpeciesCreator = new Lacuna.CreateSpecies(this);
				Game.SpeciesCreator.subscribe("onCreateSuccessful",function(oArgs) {
					this.fireEvent("onCreateSuccessful",oArgs);
				}, this, true);
			}
		}
		/*addSpecies : function(id, name) {
			var opt = document.createElement("option");
			opt.value = id;
			opt.innerHTML = name;
			opt = this.elSpecies.appendChild(opt);
			opt.selected = true;
		},
		createSpeciesClick : function(e) {
			Event.stopEvent(e); //stop href click
		}*/
	};
	YAHOO.lang.augmentProto(CreateEmpire, Util.EventProvider);

	Lacuna.CreateEmpire = CreateEmpire;
})();
YAHOO.register("createEmpire", YAHOO.lacuna.CreateEmpire, {version: "1", build: "0"}); 

}