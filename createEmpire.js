YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateEmpire == "undefined" || !YAHOO.lacuna.CreateEmpire) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;

	var CreateEmpire = function(Login) {
		this.id = "createEmpire";
		this._login = Login;
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, "hidden");
		container.innerHTML = [
		'	<div class="hd">Create Empire</div>',
		'	<div class="bd">',
		'		<form name="empireForm">',
		'			<ul>',
		'				<li><label for="empireName">User</label><input type="text" id="empireName" /></li>',
		'				<li><label for="empirePass">Password</label><input type="password" id="empirePass" /></li>',
		'				<li><label for="empirePassConfirm">Password Confirm</label><input type="password" id="empirePassConfirm" /></li>',
		'				<li>',
		'					<label for="empireSpecies">Species</label>',
		'					<select id="empireSpecies">',
		'						<option value="human_species">Human</option>',
		'					</select>',
		'				</li>',
		'			</ul>',
		'			<div id="empireMessage" class="hidden"></div>',
		'			<a id="speciesCreate" href="#">Create a Species</a>',
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
			close:false,
			width:"300px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("empireName");
			this.elPass = Dom.get("empirePass");
			this.elPassConfirm = Dom.get("empirePassConfirm");
			this.elSpecies = Dom.get("empireSpecies");
			this.elMessage = Dom.get("empireMessage");
			this.elSpeciesCreate = Dom.get("speciesCreate");
			
			Event.addListener(this.elSpeciesCreate, "click", this.createSpeciesClick, this, true);
			Dom.removeClass(this.id, Game.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
	};
	CreateEmpire.prototype = {
		handleCreate : function() {
			console.log("name: ", this.elName.value, " - pass: ", this.elPass.value);
			var EC = Game.EmpireCreator,
				EmpireServ = Game.Services.Empire,
				data = {
					name: this.elName.value,
					password: this.elPass.value,
					password1: this.elPassConfirm.value,
					species_id: this.elSpecies.value
				};
				
			EmpireServ.is_name_available({name:data.name}, {
				success : function(o) {
					console.log(o);
					if(o.result == 1) {
						EmpireServ.create(data,{
							success : function(o){
								console.log(o);
								Game.Setup(o.result);
								EC.hide();
							},
							failure : function(o){
								console.log(o);
								EC.setMessage(o.error.message);
							},
							timeout:5000
						});
					}
					else {
						EC.setMessage("Empire name is unavailable.  Please choose another.");
					}
				},
				failure : function(o) {
					console.log(o);
					EC.setMessage(o.error.message);
				},
				timeout:5000
			});
			
		},
		handleCancel : function() {
			this.hide();
			this._login.show();
		},
		setMessage : function(str) {
			Dom.removeClass(this.elMessage, "hidden");
			this.elMessage.innerHTML = str;
		},
		show : function() {
			this.Dialog.show();
		},
		hide : function() {
			this.elName.value = "";
			this.elPass.value = "";
			this.elPassConfirm.value = "";
			this.elSpecies.selectedIndex = 0; //select human
			Dom.addClass(this.elMessage, "hidden");
			this.Dialog.hide();
		},
		createSpeciesClick : function(e) {
			Event.stopEvent(e); //stop href click
			this.hide(); //hide empire
			if(!Game.SpeciesCreator) {
				Game.SpeciesCreator = new Lacuna.CreateSpecies(this);
			}
			Game.SpeciesCreator.show();
		}
	};

	Lacuna.CreateEmpire = CreateEmpire;
})();
YAHOO.register("createEmpire", YAHOO.lacuna.CreateEmpire, {version: "1", build: "0"}); 

}