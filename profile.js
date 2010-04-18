YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Profile == "undefined" || !YAHOO.lacuna.Profile) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var Profile = function() {
		this.id = "profile";
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			postmethod:"none",
			buttons:[ { text:"Update", handler:{fn:this.handleUpdate, scope:this}, isDefault:true } ],
			visible:false,
			draggable:true,
			underlay:false,
			modal:true,
			close:true,
			width:"450px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			this.description = Dom.get("profileDescription");
			this.status = Dom.get("profileStatus");
			this.medals = Dom.get("profileMedalsList");
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Profile.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">Profile</div>',
			'	<div class="bd">',
			'		<form name="profileForm">',
			'			<ul id="profileDetails">',
			'				<li><label style="vertical-align:top;">Description:</label><textarea id="profileDescription" cols="47"></textarea></li>',
			'				<li><label>Status:</label><input id="profileStatus" maxlength="100" size="50" /></li>',
			'				<li><label>Medals:</label>',
			'					<ul id="profileMedalsList" style="height:300px;width:425px;overflow:auto;">',
			'					</ul>',
			'				</li>',
			'			</ul>',
			'		</form>',
			'	</div>',
			'	<div class="ft"></div>'
			].join('');
		},
		handleUpdate : function() {
			var pmc = Sel.query("li", "profileMedalsList"),
				publicMedals = [];
			for(var i=0; i<pmc.length; i++){
				if(Sel.query('input[type="checkbox"]', pmc[i], true).checked) {
					publicMedals.push(pmc[i].MedalId);
				}
			}
			
			Game.Services.Empire.edit_profile({
					session_id:Game.GetSession(""),
					profile:{
						description:this.description.value,
						status_message:this.status.value,
						public_medals:publicMedals
					}
				},{
				success : function(o){
					YAHOO.log(o, "info", "Profile.handleUpdate.success");
					this.hide();
				},
				failure : function(o){
					YAHOO.log(o, "error", "Profile.handleUpdate.failure");
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		
		show : function() {
			//this is called out of scope so make sure to pass the correct scope in
			Game.Services.Empire.view_profile({session_id:Game.GetSession("")},{
				success : function(o){
					YAHOO.log(o, "info", "Profile.show.success");
					this.populate(o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Profile.show.failure");
				},
				timeout:Game.Timeout,
				scope:Lacuna.Profile
			});
			Game.OverlayManager.hideAll();
			Lacuna.Profile.Dialog.center();
			Lacuna.Profile.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
		},
		
		populate : function(results) {
			var p = results.profile;
			this.description.value = p.description;
			this.status.value = p.status_message;
	
			var frag = document.createDocumentFragment(),
				li = document.createElement('li');
			for(var id in p.medals) {
				if(p.medals.hasOwnProperty(id)) {	
					var medal = p.medals[id],
						nLi = li.cloneNode(false);
					
					Dom.addClass(nLi, "medal");
					nLi.MedalId = id;
					nLi.innerHTML = [
					'	<div class="medalPublic"><input type="checkbox"', (medal["public"] ? ' checked' : ''), ' /></div>',
					'	<div class="medalContainer">',
					'		<img src="',Lib.AssetUrl,'medal/',medal.image,'.png" title="',medal.name,' on ',Lib.formatServerDate(medal.date),'" />',
					'	</div>'
					].join('');
						
					frag.appendChild(nLi);
				}
			}
			
			this.medals.innerHTML = "";
			this.medals.appendChild(frag);
			
			this.Dialog.center();
		}
		
	};
	Lang.augmentProto(Profile, Util.EventProvider);
			
	Lacuna.Profile = new Profile();
})();
YAHOO.register("profile", YAHOO.lacuna.Profile, {version: "1", build: "0"}); 

}