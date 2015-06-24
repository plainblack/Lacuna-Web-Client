'use strict';

var _ = require('lodash');

var InviteActions = require('js/actions/window/invite');

if (typeof YAHOO.lacuna.Invite == "undefined" || !YAHOO.lacuna.Invite) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Invite = function() {};
    Invite.prototype = {
        build: _.once(function() {
            this.createEvent("onRpc");

            this.id = "invite";

            var container = document.createElement("div");
            container.id = this.id;
            Dom.addClass(container, Lib.Styles.HIDDEN);
            Dom.addClass(container, "nofooter");
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);

            this.Dialog = new YAHOO.widget.Panel(this.id, {
                constraintoviewport:true,
                fixedcenter:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                close:true,
                width:"450px",
                zIndex:9999
            });
            this.Dialog.renderEvent.subscribe(function(){
                this.elFriendEmail = Dom.get("inviteFriendEmail");
                this.elMessage = Dom.get("inviteMessage");
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
                Event.on("inviteButton", "click", this.handleInvite, this, true);
                this.inviteGenerate = Dom.get("inviteGenerate");
                Event.on(this.inviteGenerate, "click", this.handleGenerate, this, true);
                Event.on("inviteGenerateLink", "click", function(){ this.select(); });
            }, this, true);

            // Let the React component know that we're going away now.
            this.Dialog.hideEvent.subscribe(InviteActions.hide);

            this.Dialog.render();
            Game.OverlayManager.register(this.Dialog);
        }),
        _getHtml : function() {
            return [
            '    <div class="hd">Invite a Friend</div>',
            '    <div class="bd">',
            '        <form name="inviteForm">',
            '            <ul>',
            '                <li><label for="inviteFriendEmail">Email:</label><input type="text" id="inviteFriendEmail"></li>',
            '                <li><label for="inviteMessage">Message:</label></li>',
            '                <li><textarea id="inviteMessage"></textarea></li>',
            '                <li style="text-align:right;"><button id="inviteButton" type="button">Invite</button></li>',
            '            </ul>',
            '        </form>',
            '        <hr />',
            '        <p id="inviteGenerateDesc">You can also generate a URL you can post to your blog or email to your friends.</p>',
            '        <button id="inviteGenerate" type="button">Generate URL</button>',
            '        <input id="inviteGenerateLink" type="text" readonly="readonly" style="display: none" />',
            '    </div>'
            ].join('');
        },

        show : function() {
            Lacuna.Invite.build();
            //this is called out of scope so make sure to pass the correct scope in
            Lacuna.Invite.elFriendEmail.value = '';
            Lacuna.Invite.elMessage.value = "I'm having a great time with this new game called 'Lacuna Expanse'. Come play with me!";
            Lacuna.Invite.Dialog.show();
        },
        hide : function() {
            this.Dialog.hide();
        },
        handleInvite : function (e) {
            require('js/actions/menu/loader').show();
            var email = this.elFriendEmail.value;
            email = email.split(/\s*[,;]\s*/).join(',');
            Game.Services.Empire.invite_friend({
                session_id:Game.GetSession(""),
                email: email,
                message: this.elMessage.value
            },{
                success : function(o){
                    YAHOO.log(o, "info", "InviteFriend.success");
                    require('js/actions/menu/loader').hide();
                    var not_sent = o.result.not_sent;
                    if (not_sent && not_sent.length > 0) {
                        var errorMessage = [];
                        var errorEmails = [];
                        for (i = 0; i < not_sent.length; i++) {
                            errorMessage.push(not_sent[i].reason[1]);
                            errorEmails.push(not_sent[i].address);
                        }
                        this.elFriendEmail.value = errorEmails.join(', ');
                        alert(errorMessage.join("\n"));
                    }
                    else {
                        this.hide();
                    }
                    this.fireEvent('onRpc', o);
                },
                scope:this
            });
        },
        handleGenerate : function (e) {
            this.inviteGenerate.disabled = true;

            require('js/actions/menu/loader').show();
            Game.Services.Empire.get_invite_friend_url({
                session_id:Game.GetSession("")
            },{
                success : function(o){
                    YAHOO.log(o, "info", "handleGenerate.success");
                    require('js/actions/menu/loader').hide();
                    Dom.setStyle(this.inviteGenerate,"display","none");
                    Dom.get("inviteGenerateDesc").innerHTML = 'Pass this url around to invite your friends, readers, or strangers!';
                    Dom.setStyle("inviteGenerateLink", 'display', 'inline');
                    Dom.get("inviteGenerateLink").value = o.result.referral_url;
                    this.fireEvent('onRpc', o);
                },
                failure : function(o){
                    this.inviteGenerate.disabled = false;
                },
                scope:this
            });
        }
    };

    Lang.augmentProto(Invite, Util.EventProvider);

    Lacuna.Invite = new Invite();

})();
YAHOO.register("invite", YAHOO.lacuna.Invite, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
