YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Invite == "undefined" || !YAHOO.lacuna.Invite) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var Invite = function() {
		this.createEvent("onRpc");
		this.createEvent("onRpcFailed");
		
		this.id = "invite";
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			postmethod:"none",
			buttons:[ { text:"Invite", handler:{fn:this.handleInvite, scope:this}, isDefault:true } ],
			visible:false,
			draggable:true,
			effect:Game.GetContainerEffect(),
			underlay:false,
			modal:true,
			close:true,
			width:"425px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			this.elFriendEmail = Dom.get("inviteFriendEmail");
			this.elMessage = Dom.get("inviteMessage");
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);

		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Invite.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">Invite a Friend</div>',
			'	<div class="bd">',
			'		<form name="inviteForm">',
			'			<ul>',
			'				<li><label for="inviteFriendEmail">EMail:</label><input type="text" id="inviteFriendEmail"></li>',
			'				<li><label for="inviteMessage">Message:</label></li>',
			'				<li><textarea id="inviteMessage"></textarea></li>',
			'			</ul>',
			'		</form>',
			'	</div>',
			'	<div class="ft"></div>'
			].join('');
		},
		
		show : function() {
			//this is called out of scope so make sure to pass the correct scope in
			Lacuna.Invite.elFriendEmail.value = '';
			Lacuna.Invite.elMessage.value = "I'm having a great time with this new game called Lacuna Expanse. Come play with me.";
			Lacuna.Invite.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
		},
		handleInvite : function (e) {
			Lacuna.Pulser.Show();
			Game.Services.Empire.invite_friend({
				session_id:Game.GetSession(""),
				email: this.elFriendEmail.value,
				message: this.elMessage.value
			},{
				success : function(o){
					YAHOO.log(o, "info", "InviteFriend.success");
					Lacuna.Pulser.Hide();
					this.hide();
					this.fireEvent('onRpc', o);
				},
				failure : function(o){
					YAHOO.log(o, "error", "InviteFriend.failure");
					Lacuna.Pulser.Hide();
					this.fireEvent('onRpcFailed', o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		}
	};

	Lang.augmentProto(Invite, Util.EventProvider);
	
	Lacuna.Invite = new Invite();

})();
YAHOO.register("invite", YAHOO.lacuna.Invite, {version: "1", build: "0"}); 

}
